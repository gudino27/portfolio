import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { battle } from '../battleState'

const F3 = [
  { node: 0xf59e0b, ring: 0xff8800, beam: 0xffd040, nuc: 0xffeebb, glow: 0xff9900, label: 'GOLD',    hex: '#f59e0b' },
  { node: 0xdc1230, ring: 0xcc0820, beam: 0xff4060, nuc: 0xffb0c0, glow: 0xff2040, label: 'CRIMSON', hex: '#dc1230' },
]

const RING_DEFS = [
  { rx: 0,           rz: 0,           speed:  0.006 },
  { rx: Math.PI/3.5, rz: 0,           speed: -0.005 },
  { rx: Math.PI/2.2, rz: Math.PI/4,   speed:  0.004 },
  { rx: Math.PI/2,   rz: Math.PI/6,   speed: -0.0035 },
  { rx: Math.PI/5,   rz: -Math.PI/3,  speed:  0.005 },
  { rx: Math.PI*0.7, rz: Math.PI*0.3, speed: -0.003 },
]
const SHELL_SPEEDS = [
  {y:0.006,x:0.001},{y:-0.005,x:0.003},{y:0.008,x:-0.004},
  {y:-0.010,x:0.006},{y:0.013,x:-0.009},{y:-0.016,x:0.013},
]

const NODE_N      = 70
const X_OFF       = 2.0
const MAX_PTS     = 80
const HIT_MIN     = 70
const HIT_MAX     = 130
const TAKEOVER_DUR = 100  // frames: corruption/assimilation before explosion
const DEATH_DUR    = 180  // frames: destruction after takeover
const RESET_DUR    = 320  // frames before rematch

// Pre-computed Three.js colors for lerping (avoid per-frame allocation)
const F3C = F3.map(fc => ({
  node: new THREE.Color(fc.node),
  ring: new THREE.Color(fc.ring),
  nuc:  new THREE.Color(fc.nuc),
  beam: new THREE.Color(fc.beam),
}))

// ── Build one brain group ─────────────────────────────────────────
function buildBrain(fc) {
  const group = new THREE.Group()
  const R = 1.0
  const nodePos = []
  for (let n = 0; n < NODE_N; n++) {
    const left = n < 40, ox = left ? -R*0.50 : R*0.50, ry = left ? R : R*0.84
    let x, y, z
    do { x=(Math.random()-0.5)*ry*2.1; y=(Math.random()-0.5)*ry*2.1; z=(Math.random()-0.5)*ry*1.6 }
    while ((x-ox)**2/ry**2 + y**2/ry**2 + z**2/(ry*0.7)**2 > 1.0)
    nodePos.push(x, y, z)
  }
  const nodeGeo = new THREE.BufferGeometry()
  nodeGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(nodePos), 3))
  const nodeMat = new THREE.PointsMaterial({ color: fc.node, size: 0.055, sizeAttenuation: true, transparent: true, opacity: 0.88 })
  group.add(new THREE.Points(nodeGeo, nodeMat))

  const ep = []
  for (let i = 0; i < NODE_N; i++) for (let j = i+1; j < NODE_N; j++) {
    const dx=nodePos[i*3]-nodePos[j*3], dy=nodePos[i*3+1]-nodePos[j*3+1], dz=nodePos[i*3+2]-nodePos[j*3+2]
    if (dx*dx+dy*dy+dz*dz<0.38) ep.push(nodePos[i*3],nodePos[i*3+1],nodePos[i*3+2],nodePos[j*3],nodePos[j*3+1],nodePos[j*3+2])
  }
  const edgeGeo = new THREE.BufferGeometry()
  edgeGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(ep), 3))
  const edgeMat = new THREE.LineBasicMaterial({ color: fc.node, transparent: true, opacity: 0.22 })
  group.add(new THREE.LineSegments(edgeGeo, edgeMat))

  const ringGroups = RING_DEFS.map((def, ri) => {
    const torus = new THREE.Mesh(
      new THREE.TorusGeometry(R*(1.42+ri*0.027), 0.006, 4, 80),
      new THREE.MeshBasicMaterial({ color: fc.ring, transparent: true, opacity: 0.58 }),
    )
    const rg = new THREE.Group()
    rg.rotation.x = def.rx; rg.rotation.z = def.rz
    rg.add(torus); group.add(rg)
    return { rg, speed: def.speed, torus }
  })

  const shellGroups = [0.50,0.40,0.30,0.22,0.15,0.09].map((r, i) => {
    const sg = new THREE.Group()
    sg.add(new THREE.Mesh(
      new THREE.IcosahedronGeometry(r, 1),
      new THREE.MeshBasicMaterial({ color: fc.glow, wireframe: true, transparent: true, opacity: [0.04,0.06,0.09,0.14,0.22,0.40][i] }),
    ))
    group.add(sg); return sg
  })

  const nucMat = new THREE.MeshStandardMaterial({ color: fc.nuc, emissive: fc.nuc, emissiveIntensity: 1.2, roughness: 0.3, metalness: 0.2 })
  group.add(new THREE.Mesh(new THREE.SphereGeometry(0.075, 20, 20), nucMat))
  ;[1.6, 2.0].forEach((r, i) => {
    group.add(new THREE.Mesh(new THREE.SphereGeometry(r, 12, 12),
      new THREE.MeshBasicMaterial({ color: fc.ring, side: THREE.BackSide, transparent: true, opacity: [0.06,0.025][i] })))
  })

  return { group, ringGroups, shellGroups, nodeMat, edgeMat, nucMat, nodeGeo, nodePos: new Float32Array(nodePos) }
}

// ── 3D lightning ──────────────────────────────────────────────────
function genLightning3D(a, b, depth, roughness) {
  if (depth === 0) return [a.clone(), b.clone()]
  const len = a.distanceTo(b)
  const mid = a.clone().lerp(b, 0.5)
  mid.x += (Math.random()-0.5)*len*roughness
  mid.y += (Math.random()-0.5)*len*roughness
  mid.z += (Math.random()-0.5)*len*roughness
  return [...genLightning3D(a, mid, depth-1, roughness*0.65), ...genLightning3D(mid, b, depth-1, roughness*0.65).slice(1)]
}

// ── Outward arc debris (lines shooting away from explosion center) ─
const DEBRIS_LINES = 18
const DEBRIS_PTS   = 12
function buildDebris(scene) {
  return Array.from({ length: DEBRIS_LINES }, (_, i) => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(DEBRIS_PTS*3), 3))
    geo.setDrawRange(0, 0)
    const mat = new THREE.LineBasicMaterial({ color: i%2===0 ? F3[0].beam : F3[1].beam, transparent: true, opacity: 0 })
    const line = new THREE.Line(geo, mat)
    scene.add(line)
    return { geo, mat, vel: new THREE.Vector3(), origin: new THREE.Vector3() }
  })
}

// ── Explosion particle burst ──────────────────────────────────────
const EXP_SPARKS = 300
function buildExplosion(scene) {
  const pos = new Float32Array(EXP_SPARKS*3)
  const geo  = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  const mat  = new THREE.PointsMaterial({ color: 0xffffff, size: 0.04, sizeAttenuation: true, transparent: true, opacity: 0 })
  scene.add(new THREE.Points(geo, mat))
  const vels = Array.from({length: EXP_SPARKS}, () => new THREE.Vector3((Math.random()-0.5)*0.18, (Math.random()-0.5)*0.18 + 0.03, (Math.random()-0.5)*0.18))
  return { geo, mat, vels, pos }
}

export default function BattleScene({ alwaysOn = false }) {
  const mountRef = useRef(null)
  const [health,  setHealth]  = useState([6, 6])
  const [winner,  setWinner]  = useState(-1)
  const [hitting, setHitting] = useState(-1)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)

    const scene  = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 100)
    camera.position.set(0, 0, 5.5)

    // Pin canvas inside mount, don't let it overflow
    const cvs = renderer.domElement
    cvs.style.position = 'absolute'
    cvs.style.inset    = '0'
    mount.appendChild(cvs)

    const setSize = () => {
      const W = mount.clientWidth
      const H = mount.clientHeight
      if (!W || !H) return
      renderer.setSize(W, H)
      camera.aspect = W / H
      camera.updateProjectionMatrix()
    }

    // Layout may not be settled on first frame: retry until we get real dimensions
    const trySize = () => { setSize(); if (!mount.clientWidth) requestAnimationFrame(trySize) }
    requestAnimationFrame(trySize)

    const ro = new ResizeObserver(setSize)
    ro.observe(mount)

    scene.add(new THREE.AmbientLight(0x0a0a12, 8))
    const ptLights = F3.map((fc, i) => {
      const l = new THREE.PointLight(fc.glow, 5, 14)
      l.position.set(i===0 ? -4 : 4, 1.5, 2)
      scene.add(l); return l
    })

    const pivot  = new THREE.Group(); scene.add(pivot)
    const brains = F3.map((fc, i) => {
      const b = buildBrain(fc)
      b.group.position.x = i===0 ? -X_OFF : X_OFF
      pivot.add(b.group); return b
    })

    // Combat lightning between the two brains
    const bolts = Array.from({length:5}, (_, i) => {
      const geo = new THREE.BufferGeometry()
      geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(MAX_PTS*3), 3))
      geo.setDrawRange(0, 0)
      const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: F3[i%2].beam, transparent: true, opacity: 0.85 }))
      scene.add(line); return { geo, line }
    })
    const rebuildBolts = () => {
      const p1 = new THREE.Vector3(-X_OFF,0,0).applyEuler(pivot.rotation)
      const p2 = new THREE.Vector3( X_OFF,0,0).applyEuler(pivot.rotation)
      bolts.forEach(({geo,line}, i) => {
        const [from,to] = i%2===0 ? [p1,p2] : [p2,p1]
        const pts = genLightning3D(from, to, 4, 0.32+Math.random()*0.22)
        const arr = geo.attributes.position.array
        const count = Math.min(pts.length, MAX_PTS)
        for (let j=0; j<count; j++) { arr[j*3]=pts[j].x; arr[j*3+1]=pts[j].y; arr[j*3+2]=pts[j].z }
        geo.setDrawRange(0, count); geo.attributes.position.needsUpdate = true
        line.material.opacity = 0.5+Math.random()*0.5
      })
    }

    // Ambient drifting sparks
    const SPARKS = 200
    const sparkArr = new Float32Array(SPARKS*3)
    const sparkVel = Array.from({length:SPARKS}, () => ({x:(Math.random()-0.5)*0.05,y:(Math.random()-0.5)*0.05,z:(Math.random()-0.5)*0.05}))
    for (let i=0; i<SPARKS; i++) { sparkArr[i*3]=(Math.random()-0.5)*4; sparkArr[i*3+1]=(Math.random()-0.5)*3; sparkArr[i*3+2]=(Math.random()-0.5)*3 }
    const sparkGeo = new THREE.BufferGeometry()
    sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkArr, 3))
    scene.add(new THREE.Points(sparkGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.028, transparent: true, opacity: 0.75, sizeAttenuation: true })))

    // Shockwave ring (expands from explosion point)
    const shockGeo = new THREE.TorusGeometry(0.1, 0.015, 4, 64)
    const shockMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, side: THREE.DoubleSide })
    const shockwave = new THREE.Mesh(shockGeo, shockMat)
    scene.add(shockwave)

    // Explosion particle burst
    const explosion = buildExplosion(scene)

    // Arc debris lines shooting outward
    const debris = buildDebris(scene)

    // ── Mutable battle state ─────────────────────────────────────
    const hp          = [6, 6]
    const shellAngles = brains.map(() => RING_DEFS.map(() => ({y:Math.random()*Math.PI*2, x:Math.random()*Math.PI*2})))
    const explodeVels = [null, null]   // per-brain node velocity arrays
    let frameN        = 0
    let hitCooldown   = HIT_MIN
    let winnerIdx     = -1
    let deathFrame    = 0
    let deathLoser    = -1
    let raf

    const initExplosion = (loser) => {
      // Node scatter velocities
      const pos = brains[loser].nodeGeo.attributes.position.array
      explodeVels[loser] = Array.from({length: NODE_N}, (_, i) => {
        const x=pos[i*3], y=pos[i*3+1], z=pos[i*3+2]
        const len = Math.sqrt(x*x+y*y+z*z) || 0.1
        const spd = 0.025 + Math.random()*0.06
        return new THREE.Vector3(
          (x/len + (Math.random()-0.5)*1.2) * spd,
          (y/len + (Math.random()-0.5)*1.2) * spd + 0.012,
          (z/len + (Math.random()-0.5)*1.2) * spd,
        )
      })

      // Explosion burst particles at loser world position
      const ox = brains[loser].group.position.x
      const ep = explosion.pos
      for (let i=0; i<EXP_SPARKS; i++) {
        ep[i*3]   = ox + (Math.random()-0.5)*0.4
        ep[i*3+1] = (Math.random()-0.5)*0.4
        ep[i*3+2] = (Math.random()-0.5)*0.4
      }
      explosion.geo.attributes.position.needsUpdate = true
      explosion.mat.opacity = 1.0
      explosion.mat.color.set(F3[loser].beam)

      // Shockwave at loser position
      shockwave.position.x = ox
      shockwave.scale.setScalar(0.1)
      shockMat.opacity = 0.9
      shockMat.color.set(F3[loser].glow)

      // Arc debris outward from loser
      debris.forEach(d => {
        const angle1 = Math.random()*Math.PI*2
        const angle2 = (Math.random()-0.5)*Math.PI
        const spd    = 0.06 + Math.random()*0.12
        d.vel.set(Math.cos(angle1)*Math.cos(angle2)*spd, Math.sin(angle2)*spd, Math.sin(angle1)*Math.cos(angle2)*spd)
        d.origin.set(ox + (Math.random()-0.5)*0.5, (Math.random()-0.5)*0.5, (Math.random()-0.5)*0.5)
        const arr = d.geo.attributes.position.array
        for (let k=0; k<DEBRIS_PTS; k++) { arr[k*3]=d.origin.x; arr[k*3+1]=d.origin.y; arr[k*3+2]=d.origin.z }
        d.geo.setDrawRange(0, 1)
        d.mat.opacity = 0.9
        d.mat.color.set(Math.random()>0.5 ? F3[loser].beam : 0xffffff)
      })

      // Hide combat bolts
      bolts.forEach(({geo}) => geo.setDrawRange(0, 0))
    }

    const resetAll = () => {
      hp[0]=6; hp[1]=6; winnerIdx=-1; deathFrame=0; deathLoser=-1
      hitCooldown = HIT_MIN; battle.bias = 0
      explodeVels[0] = null; explodeVels[1] = null
      brains.forEach((b, bi) => {
        const arr = b.nodeGeo.attributes.position.array
        b.nodePos.forEach((v, i) => { arr[i] = v })
        b.nodeGeo.attributes.position.needsUpdate = true
        b.nodeMat.color.set(F3[bi].node); b.nodeMat.opacity = 0.88
        b.edgeMat.color.set(F3[bi].node); b.edgeMat.opacity = 0.22
        b.nucMat.color.set(F3[bi].nuc); b.nucMat.emissive.set(F3[bi].nuc); b.nucMat.emissiveIntensity = 1.2
        b.group.scale.setScalar(1); b.group.position.set(bi===0 ? -X_OFF : X_OFF, 0, 0)
        b.group.visible = true
        b.ringGroups.forEach(({rg, torus}) => {
          rg.visible=true; rg.scale.setScalar(1)
          torus.material.color.set(F3[bi].ring); torus.material.opacity=0.58
        })
        b.shellGroups.forEach((sg, si) => { sg.scale.setScalar(1); sg.children[0].material.opacity=[0.04,0.06,0.09,0.14,0.22,0.40][si] })
      })
      explosion.mat.opacity = 0
      shockMat.opacity = 0
      debris.forEach(d => { d.mat.opacity=0; d.geo.setDrawRange(0,0) })
      setHealth([6,6]); setWinner(-1)
    }

    let frameN2 = 0  // cleanup scoped name collision
    const tick = () => {
      raf = requestAnimationFrame(tick)
      if (!alwaysOn && !battle.active && !battle.simulate) { renderer.clear(); return }

      frameN++
      const t = frameN * 0.01

      // ── Combat ────────────────────────────────────────────────
      if (winnerIdx === -1) {
        hitCooldown--
        if (hitCooldown <= 0) {
          const hBias  = (hp[0]-hp[1]) * 0.04
          const cBias  = (battle.bias||0) * 0.45
          const target = Math.random() + hBias + cBias > 0.5 ? 0 : 1
          hp[target] = Math.max(0, hp[target]-1)
          setHealth([hp[0], hp[1]])
          setHitting(target); setTimeout(()=>setHitting(-1), 350)
          const spread = Math.abs(hp[0]-hp[1])
          hitCooldown = Math.max(HIT_MIN, HIT_MAX - spread*8 - Math.floor(Math.random()*40))
          if (hp[target] === 0) {
            winnerIdx = 1-target; deathLoser = target; deathFrame = 0
            setWinner(winnerIdx)
            // explosion fires after takeover phase completes
          }
        }
      }

      // ── Ring visibility by health ─────────────────────────────
      brains.forEach((b, bi) => {
        b.ringGroups.forEach(({rg}, ri) => { rg.visible = ri < hp[bi] })
      })

      // ── Death phases: takeover → destruction ──────────────────
      if (winnerIdx !== -1) {
        deathFrame++
        const loser = deathLoser
        const lb    = brains[loser]
        const wb    = brains[winnerIdx]

        // ── PHASE 1: TAKEOVER (frames 0..TAKEOVER_DUR) ───────────
        if (deathFrame <= TAKEOVER_DUR) {
          const tt = deathFrame / TAKEOVER_DUR   // 0→1

          // Nodes + edges bleed to winner's faction color
          lb.nodeMat.color.lerpColors(F3C[loser].node, F3C[winnerIdx].node, tt)
          lb.edgeMat.color.lerpColors(F3C[loser].node, F3C[winnerIdx].node, tt)

          // Nucleus hue shifts to winner
          lb.nucMat.color.lerpColors(F3C[loser].nuc,  F3C[winnerIdx].nuc,  tt)
          lb.nucMat.emissive.lerpColors(F3C[loser].nuc, F3C[winnerIdx].nuc, tt)
          lb.nucMat.emissiveIntensity = 1.2 + tt * 3.0   // glows brighter as taken over

          // Brain trembles: increases with corruption
          const shake = tt * 0.18
          lb.group.position.x = (loser===0 ? -X_OFF : X_OFF) + (Math.random()-0.5)*shake*2
          lb.group.position.y = (Math.random()-0.5)*shake
          lb.group.position.z = (Math.random()-0.5)*shake*0.5

          // Slight pull toward winner (brains converge)
          const pullSign = winnerIdx===0 ? 1 : -1
          lb.group.position.x += pullSign * tt * 0.25

          // Ring flicker: random on/off with increasing chaos
          lb.ringGroups.forEach(({rg, torus}, ri) => {
            if (ri < hp[loser]) {
              const flicker = Math.random() > (0.85 - tt * 0.55)
              torus.material.opacity = flicker ? 0.0 : 0.58
              torus.material.color.lerpColors(F3C[loser].ring, F3C[winnerIdx].ring, tt)
            }
          })

          // Winner swells: dominance
          wb.group.scale.setScalar(1 + tt * 0.18)
          wb.nucMat.emissiveIntensity = 1.5 + tt * 2.5

          // Corruption bolts: all bolts fire from winner toward loser
          if (frameN % 5 === 0) {
            const wPos = new THREE.Vector3(winnerIdx===0 ? -X_OFF : X_OFF, 0, 0).applyEuler(pivot.rotation)
            const lPos = new THREE.Vector3(loser===0 ? -X_OFF : X_OFF, 0, 0).applyEuler(pivot.rotation)
            bolts.forEach(({geo, line}) => {
              const pts = genLightning3D(wPos, lPos, 4, 0.25 + Math.random()*0.3)
              const arr = geo.attributes.position.array
              const count = Math.min(pts.length, MAX_PTS)
              for (let j=0; j<count; j++) { arr[j*3]=pts[j].x; arr[j*3+1]=pts[j].y; arr[j*3+2]=pts[j].z }
              geo.setDrawRange(0, count); geo.attributes.position.needsUpdate = true
              line.material.color.set(F3[winnerIdx].beam)
              line.material.opacity = 0.5 + tt * 0.5
            })
          }
        }

        // ── Trigger explosion at takeover→destroy boundary ───────
        if (deathFrame === TAKEOVER_DUR) {
          initExplosion(loser)
          // Reset loser position before explosion scatters nodes
          lb.group.position.set(loser===0 ? -X_OFF : X_OFF, 0, 0)
          // Restore winner scale (explosion will dominate visually)
          wb.group.scale.setScalar(1)
        }

        // ── PHASE 2: DESTRUCTION (frames TAKEOVER_DUR...) ────────
        if (deathFrame > TAKEOVER_DUR) {
          const df  = deathFrame - TAKEOVER_DUR
          const td  = Math.min(df / DEATH_DUR, 1)

          // Shockwave: expand ring outward
          const sw_t = Math.min(df / 60, 1)
          shockwave.scale.setScalar(0.1 + sw_t * 5.0)
          shockMat.opacity = Math.max(0, 0.85 * (1 - sw_t))

          // Node positions fly outward
          if (explodeVels[loser]) {
            const arr = lb.nodeGeo.attributes.position.array
            const vels = explodeVels[loser]
            for (let i=0; i<NODE_N; i++) {
              arr[i*3]   += vels[i].x; arr[i*3+1] += vels[i].y - 0.0006*df; arr[i*3+2] += vels[i].z
              vels[i].x += (Math.random()-0.5)*0.001; vels[i].z += (Math.random()-0.5)*0.001
            }
            lb.nodeGeo.attributes.position.needsUpdate = true
          }
          lb.nodeMat.opacity = Math.max(0, 0.88 * (1 - td*1.8))
          lb.edgeMat.opacity = Math.max(0, 0.22 * (1 - td*3))

          // Rings: spin fast, scale outward, fade
          lb.ringGroups.forEach(({rg, speed, torus}, ri) => {
            rg.rotation.y += speed * (1 + td * 20) * 60 * 0.016
            if (ri < hp[loser]) {
              const ringT = Math.max(0, td*2 - ri*0.08)
              rg.scale.setScalar(1 + ringT * 2.5)
              torus.material.opacity = Math.max(0, 0.58*(1 - ringT*1.5))
            }
          })

          // Shells: expand radially outward
          lb.shellGroups.forEach((sg, si) => {
            const shellT = Math.min(td*2.5, 1)
            sg.scale.setScalar(1 + shellT * 4)
            sg.children[0].material.opacity = Math.max(0, [0.04,0.06,0.09,0.14,0.22,0.40][si]*(1 - shellT*1.5))
          })

          // Nucleus flares then dies
          lb.nucMat.emissiveIntensity = td < 0.15 ? 8*(1-td/0.15) : 0

          // Explosion particles drift outward
          const ep = explosion.pos, ev = explosion.vels
          for (let i=0; i<EXP_SPARKS; i++) {
            ep[i*3]+=ev[i].x; ep[i*3+1]+=ev[i].y-0.003; ep[i*3+2]+=ev[i].z
            ev[i].x*=0.99; ev[i].z*=0.99
          }
          explosion.geo.attributes.position.needsUpdate = true
          explosion.mat.opacity = Math.max(0, 1.0*(1 - td*1.4))

          // Arc debris lines grow then fade
          debris.forEach(d => {
            const arr = d.geo.attributes.position.array
            const count = Math.min(d.geo.drawRange.count+1, DEBRIS_PTS)
            d.geo.setDrawRange(0, count)
            if (count > 1) {
              const last = count-1
              arr[last*3]   = arr[(last-1)*3] + d.vel.x
              arr[last*3+1] = arr[(last-1)*3+1] + d.vel.y - 0.002*df
              arr[last*3+2] = arr[(last-1)*3+2] + d.vel.z
              d.vel.multiplyScalar(0.96)
            }
            d.geo.attributes.position.needsUpdate = true
            d.mat.opacity = Math.max(0, 0.9*(1 - td*1.3))
          })

          // Winner: subtle scale pulse during destruction
          wb.nucMat.emissiveIntensity = 1.2 + 1.5*Math.abs(Math.sin(t*4))
        } // end destruction phase

        // Reset for rematch
        if (deathFrame >= RESET_DUR) resetAll()
      }

      // ── Normal rotation (both brains while alive) ─────────────
      pivot.rotation.y += 0.006
      pivot.rotation.x  = Math.sin(t*0.22)*0.18

      brains.forEach((b, bi) => {
        if (bi === deathLoser && winnerIdx !== -1) return  // loser handled above
        b.group.rotation.y += 0.007*(bi===0 ? 1 : -1)
        b.group.rotation.z += 0.004*(bi===0 ? -1 : 1)
        b.ringGroups.forEach(({rg, speed}) => { rg.rotation.y += speed*60*0.016 })
        b.shellGroups.forEach((sg, si) => {
          shellAngles[bi][si].y += SHELL_SPEEDS[si].y; shellAngles[bi][si].x += SHELL_SPEEDS[si].x
          sg.rotation.y = shellAngles[bi][si].y; sg.rotation.x = shellAngles[bi][si].x
        })
        if (winnerIdx === -1) {
          b.nucMat.emissiveIntensity = 0.7+0.8*Math.pow(Math.max(0, Math.sin(t*Math.PI*1.4)), 2.5)
          b.nodeMat.opacity = 0.70+0.20*Math.sin(t*1.1+bi*Math.PI)
        }
      })

      ptLights.forEach((l, i) => { l.intensity = 4+3*Math.abs(Math.sin(t*1.6+i*Math.PI*0.6)) })

      camera.position.x = Math.sin(t*0.12)*0.8; camera.position.y = Math.sin(t*0.08)*0.4
      camera.position.z = 5.2+Math.sin(t*0.17)*0.5; camera.lookAt(0,0,0)

      if (frameN%7===0 && winnerIdx===-1) rebuildBolts()

      // Ambient sparks
      const sa = sparkGeo.attributes.position.array
      for (let i=0; i<SPARKS; i++) {
        sa[i*3]+=sparkVel[i].x; sa[i*3+1]+=sparkVel[i].y; sa[i*3+2]+=sparkVel[i].z
        if (sa[i*3]**2+sa[i*3+1]**2+sa[i*3+2]**2>10) {
          sa[i*3]=(Math.random()-0.5)*0.6; sa[i*3+1]=(Math.random()-0.5)*0.6; sa[i*3+2]=(Math.random()-0.5)*0.6
          sparkVel[i].x=(Math.random()-0.5)*0.06; sparkVel[i].y=(Math.random()-0.5)*0.06; sparkVel[i].z=(Math.random()-0.5)*0.06
        }
      }
      sparkGeo.attributes.position.needsUpdate = true

      renderer.render(scene, camera)
    }
    tick()

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      renderer.dispose()
      if (mount.contains(cvs)) mount.removeChild(cvs)
    }
  }, [alwaysOn])

  return (
    <div ref={mountRef} className="w-full h-full relative overflow-hidden">
      {/* Health HUD */}
      <div className="absolute top-3 left-0 right-0 flex items-center justify-center gap-6 pointer-events-none z-10">
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[10px] tracking-widest" style={{color:F3[0].hex}}>F[GOLD]</span>
          <div className="flex gap-1 ml-1">
            {[...Array(6)].map((_,i)=>(
              <div key={i} className="w-2 h-2 rounded-full transition-all duration-500"
                style={{background: i<health[0] ? F3[0].hex : '#27272a', boxShadow: i<health[0] ? `0 0 6px ${F3[0].hex}80` : 'none'}} />
            ))}
          </div>
        </div>
        <span className="font-mono text-[10px] text-zinc-600">
          {winner===-1 ? 'vs' : `★ ${F3[winner].label} WINS`}
        </span>
        <div className="flex items-center gap-1.5">
          <div className="flex gap-1 mr-1">
            {[...Array(6)].map((_,i)=>(
              <div key={i} className="w-2 h-2 rounded-full transition-all duration-500"
                style={{background: i<health[1] ? F3[1].hex : '#27272a', boxShadow: i<health[1] ? `0 0 6px ${F3[1].hex}80` : 'none'}} />
            ))}
          </div>
          <span className="font-mono text-[10px] tracking-widest" style={{color:F3[1].hex}}>F[CRIMSON]</span>
        </div>
      </div>

      {/* Hit flash */}
      {hitting !== -1 && (
        <div className="absolute inset-0 pointer-events-none z-10 opacity-[0.08]"
          style={{background:`radial-gradient(ellipse at ${hitting===0?'30%':'70%'} 50%, ${F3[1-hitting].hex} 0%, transparent 55%)`}} />
      )}

      {/* Winner banner */}
      {winner !== -1 && (
        <div className="absolute bottom-10 left-0 right-0 text-center pointer-events-none z-10">
          <span className="font-mono text-sm tracking-widest"
            style={{color: F3[winner].hex, textShadow:`0 0 24px ${F3[winner].hex}, 0 0 48px ${F3[winner].hex}80`}}>
            FACTION {F3[winner].label} VICTORIOUS
          </span>
        </div>
      )}

      <div className="absolute bottom-3 left-0 right-0 text-center pointer-events-none z-10">
        <span className="font-mono text-[10px] text-zinc-700">type  battle  to disengage</span>
      </div>
    </div>
  )
}

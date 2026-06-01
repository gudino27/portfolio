import { useEffect, useRef } from 'react'
import { battle, uiState } from '../battleState'

// ── Window sync ──────────────────────────────────────────────────
const WIN_KEY = 'neural_windows'
const WIN_ID  = String(Date.now()) + Math.random().toString(36).slice(2, 8)
let _others    = []
let _myFaction = 0

function readFaction(all) {
  const alive = Object.keys(all).filter(id => Date.now() - all[id].t < 3000).sort()
  const idx = alive.indexOf(WIN_ID)
  return idx < 0 ? 0 : idx % 2
}

function syncWrite(bx, by) {
  try {
    const now = Date.now()
    const all = JSON.parse(localStorage.getItem(WIN_KEY) || '{}')
    for (const id of Object.keys(all)) if (now - all[id].t > 3000) delete all[id]
    all[WIN_ID] = { bx, by, faction: _myFaction, winId: WIN_ID, t: now, w: window.outerWidth }
    _myFaction = readFaction(all)
    localStorage.setItem(WIN_KEY, JSON.stringify(all))
    _others = Object.entries(all).filter(([id]) => id !== WIN_ID).map(([id, w]) => ({ ...w, winId: id }))
  } catch (_) {}
}

function syncRemove() {
  try { const all = JSON.parse(localStorage.getItem(WIN_KEY) || '{}'); delete all[WIN_ID]; localStorage.setItem(WIN_KEY, JSON.stringify(all)) } catch (_) {}
}

// ── Lightning + hit state ────────────────────────────────────────
let _bolts     = []   // [{ pts, branches, fc, startT, dur, lineW }]
let _hitState  = null // { age: 0-1, fc }
let _lastBoltT = 0
let _hudAlert  = null // { text, until }

function setHudAlert(text, ms = 2200) { _hudAlert = { text, until: Date.now() + ms } }

// ── Faction themes ───────────────────────────────────────────────
const F = [
  { // 0: gold / amber
    node: '245,158,11', ring: [255,130,0], outline: [255,180,60],
    stream: '255,200,68', hud: [255,180,60], beam: [255,220,80],
    pulse: '255,200,68', glows: ['255,102,0','255,184,48','255,232,170','255,255,255'],
    nuc: ['255,240,160','255,200,60','160,80,5'],
    solo: [
      '> NEURAL INTERFACE ACTIVE', '> ALL SYSTEMS NOMINAL',
      '> SYNAPTIC LOAD: {load}%', '> ORBITAL RINGS: 6 / 6',
      '> STREAM: INBOUND', '> STACK: REACT / TS / SWIFT',
      '> STATUS: STANDBY', '> // OPEN ANOTHER WINDOW', '> // STACK TO LINK_',
    ],
    linked: [
      '> INTERFACE ONLINE', '> !! HOSTILE NODE DETECTED',
      '> TARGETING: LOCKED', '> NEURAL STRIKES: ACTIVE',
      '> DEFENSE MATRIX: ONLINE', '> SYNAPTIC LOAD: {load}%',
      '> LINK: {n} TARGET(S)', '> SIGNAL: {sig}%_',
    ],
    stacked: [
      '> !! CRITICAL COLLISION', '> SYSTEMS OVERLOADING',
      '> INTERFERENCE: MAXIMUM', '> NEURAL CORES: MERGING',
      '> SYNAPTIC LOAD: {load}%', '> STABILITY: CRITICAL',
      '> SEPARATION REQUIRED', '> SHUTDOWN IMMINENT_',
    ],
  },
  { // 1: crimson / red
    node: '220,20,50', ring: [200,10,30], outline: [220,18,48],
    stream: '255,60,80', hud: [255,80,80], beam: [255,60,80],
    pulse: '220,30,60', glows: ['160,0,20','220,40,70','255,160,180','255,230,240'],
    nuc: ['255,200,210','220,60,90','100,5,15'],
    solo: [
      '> NEURAL INTERFACE ACTIVE', '> EVOLUTION SEQUENCE INIT',
      '> NEURAL LOAD: {load}%', '> ORBITAL RINGS: 6 / 6',
      '> STREAM: INCOMING', '> DIRECTIVE: UPGRADE',
      '> STATUS: STANDBY', '> // OPEN ANOTHER WINDOW', '> // STACK TO INITIATE_',
    ],
    linked: [
      '> OVERRIDE PROTOCOL ACTIVE', '> TARGET ACQUIRED',
      '> INFILTRATING DEFENSES', '> CORRUPTION: RUNNING',
      '> NEURAL LOAD: {load}%', '> RESISTANCE: {sig}% REMAINING',
      '> TARGETS: {n} IDENTIFIED', '> UPLOAD: IMMINENT_',
    ],
    stacked: [
      '> !! CRITICAL COLLISION', '> HOSTILE MERGE DETECTED',
      '> TAKEOVER: ACCELERATING', '> NEURAL CORES: COLLIDING',
      '> NEURAL LOAD: {load}%', '> DOMINANCE: {sig}%',
      '> ASSIMILATION: ACTIVE', '> RESISTANCE: DELETED_',
    ],
  },
]

// ── Brain geometry ───────────────────────────────────────────────
function buildBrain(W, H) {
  const cx = W / 2, cy = H * 0.60
  const lobeR = Math.min(W * 0.32, H * 0.36)
  const nodes = [], inE = (x, y, ox, oy, rx, ry) => ((x-ox)/rx)**2+((y-oy)/ry)**2<=1
  const lx = cx - lobeR * 0.52, rx = cx + lobeR * 0.52
  let s = 0; while (nodes.length < 60 && s++ < 4000) {
    const l = Math.random() < 0.5, ox = l ? lx : rx, ry = l ? lobeR : lobeR * 0.84
    const x = ox + (Math.random()-0.5)*lobeR*2.2, y = cy + (Math.random()-0.5)*ry*2.2
    if (inE(x,y,ox,cy,lobeR,ry)) nodes.push({x,y,pulse:Math.random(),speed:0.005+Math.random()*0.009})
  }
  for (let i = 0; i < 10; i++) nodes.push({x:cx+(Math.random()-0.5)*lobeR*0.6,y:cy+lobeR*0.72+Math.random()*lobeR*0.28,pulse:Math.random(),speed:0.006+Math.random()*0.008})
  const thresh = lobeR * 0.46, edges = []
  for (let i = 0; i < nodes.length; i++) for (let j = i+1; j < nodes.length; j++) {
    const d = Math.hypot(nodes[i].x-nodes[j].x, nodes[i].y-nodes[j].y)
    if (d < thresh) edges.push({i,j,d,thresh})
  }
  const s2 = lobeR, rings = [
    {a:s2*1.55,rx:0,rz:0,speed:0.006,op:0.62},{a:s2*1.48,rx:Math.PI/3.5,rz:0,speed:-0.005,op:0.56},
    {a:s2*1.52,rx:Math.PI/2.2,rz:Math.PI/4,speed:0.004,op:0.52},{a:s2*1.45,rx:Math.PI/2,rz:Math.PI/6,speed:-0.0035,op:0.48},
    {a:s2*1.42,rx:Math.PI/5,rz:-Math.PI/3,speed:0.005,op:0.44},{a:s2*1.58,rx:Math.PI*0.7,rz:Math.PI*0.3,speed:-0.003,op:0.34},
  ]
  const shells = [
    {r:s2*0.52,ry_s:0.006,rx_s:0.001,op:0.12},{r:s2*0.41,ry_s:-0.005,rx_s:0.003,op:0.16},
    {r:s2*0.31,ry_s:0.008,rx_s:-0.004,op:0.22},{r:s2*0.23,ry_s:-0.010,rx_s:0.006,op:0.32},
    {r:s2*0.15,ry_s:0.013,rx_s:-0.009,op:0.46},{r:s2*0.09,ry_s:-0.016,rx_s:0.013,op:0.65},
  ].map(sh=>({...sh,angY:Math.random()*Math.PI*2,angX:Math.random()*Math.PI*2}))
  const STREAM = 80, stream = Array.from({length:STREAM},()=>{
    const a = Math.random()*Math.PI*2, r = s2*(0.6+Math.random()*0.8)
    return {x:cx+Math.cos(a)*r,y:cy+Math.sin(a)*r,speed:0.25+Math.random()*0.45}
  })
  const pulseRings = [0,1/3,2/3].map(ph=>({phase:ph,tiltX:ph*Math.PI/2.5,tiltZ:ph*Math.PI/3.8}))
  const ghostNodes = Array.from({length:30},()=>({x:0,y:0,pulse:0}))
  return {nodes,edges,rings,shells,stream,pulseRings,cx,cy,lobeR,ghostNodes}
}

const rgb = (c, a) => Array.isArray(c) ? `rgba(${c[0]},${c[1]},${c[2]},${a})` : `rgba(${c},${a})`

// ── Drawing primitives ───────────────────────────────────────────
function drawRing(ctx,cx,cy,a,rx,rz,rotY,op,fc){
  const cY=Math.cos(rotY),sY=Math.sin(rotY)
  const pA=a*Math.sqrt(cY**2+(Math.sin(rx)*sY)**2+(Math.cos(rx)*sY)**2*0.001)
  const pB=a*Math.abs(Math.sin(rx))*Math.abs(cY)+a*Math.abs(Math.cos(rx))*Math.abs(sY)*0.1
  const tilt=Math.atan2(Math.sin(rx)*sY,cY)+rz
  if(pB<0.8)return
  ctx.save();ctx.translate(cx,cy);ctx.rotate(tilt)
  ctx.beginPath();ctx.ellipse(0,0,Math.max(pA,pB),Math.min(pA,pB),0,0,Math.PI*2)
  ctx.strokeStyle=rgb(fc.ring,op*0.45);ctx.lineWidth=6;ctx.stroke()
  ctx.beginPath();ctx.ellipse(0,0,Math.max(pA,pB),Math.min(pA,pB),0,0,Math.PI*2)
  ctx.strokeStyle=rgb(fc.ring,op);ctx.lineWidth=1.4;ctx.stroke()
  ctx.restore()
}

function drawShell(ctx,cx,cy,r,angY,angX,op,fc){
  for(let i=0;i<6;i++){
    const phi=(i/6)*Math.PI,latR=r*Math.sin(phi),latY=r*Math.cos(phi)*Math.cos(angX)
    const pM=latR,pm=latR*Math.abs(Math.sin(angY+phi));if(pM<1)continue
    ctx.save();ctx.translate(cx,cy+latY)
    ctx.beginPath();ctx.ellipse(0,0,Math.max(pM,0.5),Math.max(pm,0.5),angY*0.3,0,Math.PI*2)
    ctx.strokeStyle=rgb(fc.ring,(op*(0.4+0.6*Math.sin(phi))).toFixed(3))
    ctx.lineWidth=0.6;ctx.stroke();ctx.restore()
  }
}

function drawHexGrid(ctx,cx,cy,r,fc){
  ctx.save();ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.clip()
  const R=r*0.28,W=R*2,H=Math.sqrt(3)*R
  ctx.strokeStyle=`rgba(${fc.nuc[0]},0.55)`;ctx.lineWidth=0.7
  for(let row=-4;row<=4;row++) for(let col=-4;col<=4;col++){
    const hx=cx-r+col*W*0.75,hy=cy-r+row*H+(col%2===0?0:H/2)
    ctx.beginPath()
    for(let k=0;k<6;k++){const a=Math.PI/3*k-Math.PI/6;k===0?ctx.moveTo(hx+R*Math.cos(a),hy+R*Math.sin(a)):ctx.lineTo(hx+R*Math.cos(a),hy+R*Math.sin(a))}
    ctx.closePath();ctx.stroke()
  }
  ctx.restore()
}

function drawBrainOutline(ctx,cx,cy,lobeR,frame,fc){
  const p=0.55+0.15*Math.sin(frame*0.4)
  const lobe=(ox,rw,rh)=>{
    ctx.beginPath();ctx.ellipse(ox,cy,rw,rh,0,0,Math.PI*2);ctx.strokeStyle=rgb(fc.outline,(p*0.09).toFixed(3));ctx.lineWidth=18;ctx.stroke()
    ctx.beginPath();ctx.ellipse(ox,cy,rw,rh,0,0,Math.PI*2);ctx.strokeStyle=rgb(fc.outline,(p*0.20).toFixed(3));ctx.lineWidth=4;ctx.stroke()
    ctx.beginPath();ctx.ellipse(ox,cy,rw,rh,0,0,Math.PI*2);ctx.strokeStyle=rgb(fc.outline,(p*0.38).toFixed(3));ctx.lineWidth=1.2;ctx.stroke()
  }
  lobe(cx-lobeR*0.52,lobeR*0.92,lobeR);lobe(cx+lobeR*0.52,lobeR*0.88,lobeR*0.85)
  ctx.save();ctx.beginPath();ctx.ellipse(cx,cy,lobeR*0.12,lobeR*0.28,0,-Math.PI*0.7,Math.PI*0.7)
  ctx.strokeStyle=rgb(fc.outline,(p*0.18).toFixed(3));ctx.lineWidth=2;ctx.stroke();ctx.restore()
}

// ── Lightning system ─────────────────────────────────────────────
function genLightning(x1, y1, x2, y2, depth, roughness = 0.45) {
  if (depth === 0) return [[x1,y1],[x2,y2]]
  const len = Math.hypot(x2-x1, y2-y1)
  const mx = (x1+x2)/2 + (Math.random()-0.5)*len*roughness
  const my = (y1+y2)/2 + (Math.random()-0.5)*len*roughness
  const r2 = roughness * 0.65
  return [...genLightning(x1,y1,mx,my,depth-1,r2), ...genLightning(mx,my,x2,y2,depth-1,r2).slice(1)]
}

function drawLightningBolt(ctx, pts, branches, fc, alpha, lineW) {
  const path = (p, lw, color) => {
    if (p.length < 2) return
    ctx.beginPath(); ctx.moveTo(p[0][0], p[0][1])
    for (let i = 1; i < p.length; i++) ctx.lineTo(p[i][0], p[i][1])
    ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.stroke()
  }
  path(pts, lineW*6,   rgb(fc.beam, (alpha*0.18).toFixed(3)))
  path(pts, lineW,     rgb(fc.beam, (alpha*0.90).toFixed(3)))
  path(pts, lineW*0.3, `rgba(255,255,255,${(alpha*0.60).toFixed(3)})`)
  for (const br of branches) {
    path(br, lineW*0.55, rgb(fc.beam, (alpha*0.45).toFixed(3)))
    path(br, lineW*0.18, `rgba(255,255,255,${(alpha*0.28).toFixed(3)})`)
  }
}

function spawnBolts(x1, y1, x2, y2, fc, otherFc, count, durBase = 450) {
  for (let i = 0; i < count; i++) {
    const incoming = i % 3 === 0
    const bFc = incoming ? otherFc : fc
    const [fx,fy,tx,ty] = incoming ? [x2,y2,x1,y1] : [x1,y1,x2,y2]
    const pts = genLightning(fx, fy, tx, ty, 4, 0.38 + Math.random()*0.35)
    const branches = []
    if (pts.length > 5) {
      const bi = Math.floor(pts.length*0.3 + Math.random()*pts.length*0.4)
      const angle = Math.atan2(ty-fy, tx-fx) + (Math.random()-0.5)*Math.PI*0.85
      const len = 20 + Math.random()*60
      branches.push(genLightning(pts[bi][0], pts[bi][1],
        pts[bi][0]+Math.cos(angle)*len, pts[bi][1]+Math.sin(angle)*len, 2, 0.32))
    }
    _bolts.push({pts, branches, fc:bFc, startT:Date.now(), dur:durBase+Math.random()*200, lineW:0.9+Math.random()*1.3})
  }
}

// ── Ghost brain: adversarial entity from the other window ──────
function drawGhostBrain(ctx, gx, gy, lobeR, otherFc, alpha, frame, ghostNodes) {
  const lx2 = gx - lobeR*0.52, rx2 = gx + lobeR*0.52
  const lobes = [[lx2, lobeR*0.92, lobeR],[rx2, lobeR*0.88, lobeR*0.85]]

  // Lobe outlines
  for (const [ox,rw,rh] of lobes) {
    ctx.beginPath();ctx.ellipse(ox,gy,rw,rh,0,0,Math.PI*2)
    ctx.strokeStyle=rgb(otherFc.outline,(alpha*0.55).toFixed(3));ctx.lineWidth=2;ctx.stroke()
    ctx.beginPath();ctx.ellipse(ox,gy,rw,rh,0,0,Math.PI*2)
    ctx.strokeStyle=rgb(otherFc.outline,(alpha*0.09).toFixed(3));ctx.lineWidth=16;ctx.stroke()
  }

  // Chaotic node scatter — mutate pre-allocated array instead of pushing new objects
  const N = 30
  const nodes = ghostNodes
  for (let i = 0; i < N; i++) {
    const left = i % 2 === 0
    const ox   = left ? lx2 : rx2
    const a    = (i / N) * Math.PI * 2 * 2.618 + frame * 0.08
    const r    = (0.25 + (i % 7) / 7 * 0.85) * lobeR * (left ? 0.88 : 0.78)
    const n    = nodes[i]
    n.x = ox + Math.cos(a)*r; n.y = gy + Math.sin(a)*r*0.82; n.pulse = (i/N + frame*0.65) % 1
  }

  // Edges — longer reach, more chaotic connections
  const thresh = lobeR*0.52
  for (let i = 0; i < nodes.length; i++) for (let j = i+1; j < nodes.length; j++) {
    const d = Math.hypot(nodes[i].x-nodes[j].x, nodes[i].y-nodes[j].y)
    if (d < thresh) {
      const avg = (Math.sin(nodes[i].pulse*Math.PI*2)+Math.sin(nodes[j].pulse*Math.PI*2))*0.25+0.5
      ctx.beginPath();ctx.moveTo(nodes[i].x,nodes[i].y);ctx.lineTo(nodes[j].x,nodes[j].y)
      ctx.strokeStyle=rgb(otherFc.node,(alpha*((1-d/thresh)*0.30+avg*0.05)).toFixed(3))
      ctx.lineWidth=0.6;ctx.stroke()
    }
  }

  // Aggressive ring layout — more rings, sharper tilts, faster/mixed spin
  const rY = frame*0.011
  drawRing(ctx,gx,gy,lobeR*1.62,0,0,rY,alpha*0.58,otherFc)
  drawRing(ctx,gx,gy,lobeR*1.50,Math.PI/2,0,-rY*1.3,alpha*0.52,otherFc)
  drawRing(ctx,gx,gy,lobeR*1.44,Math.PI/4,Math.PI/3,rY*0.9,alpha*0.48,otherFc)
  drawRing(ctx,gx,gy,lobeR*1.56,Math.PI*0.7,Math.PI*0.4,-rY*0.7,alpha*0.38,otherFc)

  // Horizontal scan interference lines
  ctx.save()
  ctx.beginPath();ctx.ellipse(gx,gy,lobeR*1.1,lobeR,0,0,Math.PI*2);ctx.clip()
  for (let i = 0; i < 4; i++) {
    const sy = gy - lobeR + ((frame*0.18 + i*0.25) % 1) * lobeR*2
    ctx.beginPath();ctx.moveTo(gx-lobeR*1.1,sy);ctx.lineTo(gx+lobeR*1.1,sy)
    ctx.strokeStyle=rgb(otherFc.beam,(alpha*0.12).toFixed(3));ctx.lineWidth=1;ctx.stroke()
  }
  ctx.restore()

  // Center glow
  const grd=ctx.createRadialGradient(gx,gy,0,gx,gy,lobeR*0.38)
  grd.addColorStop(0,rgb(otherFc.ring,(alpha*0.55).toFixed(3)))
  grd.addColorStop(0.55,rgb(otherFc.ring,(alpha*0.18).toFixed(3)))
  grd.addColorStop(1,'rgba(0,0,0,0)')
  ctx.beginPath();ctx.arc(gx,gy,lobeR*0.38,0,Math.PI*2);ctx.fillStyle=grd;ctx.fill()

  // Nodes
  for (const n of nodes) {
    const glow = Math.sin(n.pulse*Math.PI*2)*0.5+0.5, r = 1.4+glow*2.2
    ctx.beginPath();ctx.arc(n.x,n.y,r,0,Math.PI*2)
    ctx.fillStyle=rgb(otherFc.node,(alpha*(0.38+glow*0.48)).toFixed(3));ctx.fill()
  }

  // Nucleus — faster beat (more aggressive)
  drawNucleusPulse(ctx,gx,gy,lobeR*0.05+0.018*lobeR,lobeR,frame,otherFc,true)

  const beat = Math.pow(Math.max(0,Math.sin(frame*Math.PI*1.6)),2.5)
  const hb   = (0.62+0.38*beat) * alpha
  const nR   = lobeR*0.05+beat*lobeR*0.018

  otherFc.glows.forEach((g,i)=>{
    const rs=[lobeR*0.38,lobeR*0.24,lobeR*0.14,lobeR*0.06],als=[0.10*hb,0.28*hb,0.52*hb,0.82*hb]
    const gr=ctx.createRadialGradient(gx,gy,0,gx,gy,rs[i])
    gr.addColorStop(0,`rgba(${g},${als[i].toFixed(3)})`);gr.addColorStop(0.4,`rgba(${g},${(als[i]*0.5).toFixed(3)})`);gr.addColorStop(1,`rgba(${g},0)`)
    ctx.beginPath();ctx.arc(gx,gy,rs[i],0,Math.PI*2);ctx.fillStyle=gr;ctx.fill()
  })

  const sg=ctx.createRadialGradient(gx-nR*0.3,gy-nR*0.3,nR*0.05,gx,gy,nR)
  sg.addColorStop(0,`rgba(${otherFc.nuc[0]},${(alpha*0.95).toFixed(3)})`)
  sg.addColorStop(0.45,`rgba(${otherFc.nuc[1]},${(alpha*0.85).toFixed(3)})`)
  sg.addColorStop(1,`rgba(${otherFc.nuc[2]},${(alpha*0.75).toFixed(3)})`)
  ctx.beginPath();ctx.arc(gx,gy,nR,0,Math.PI*2);ctx.fillStyle=sg;ctx.fill()
  drawHexGrid(ctx,gx,gy,nR,otherFc)
  ctx.beginPath();ctx.arc(gx-nR*0.28,gy-nR*0.28,nR*0.30,0,Math.PI*2)
  ctx.fillStyle=`rgba(255,255,220,${(alpha*(0.55+beat*0.20)).toFixed(3)})`;ctx.fill()
}

// ── Stacked collision (windows nearly on top of each other) ──────
function drawStackedEffect(ctx, cx, cy, lobeR, frame, fc, otherFc) {
  const flicker = Math.sin(frame*22) > 0
  for (let i = 0; i < 6; i++) {
    const phase=i/6, prog=((frame*3.5+phase)%1)
    const r=lobeR*0.08+prog*lobeR*2.2, al=Math.max(0,0.4*(1-prog))
    const aFc=(i%2===0)?fc:otherFc
    ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2)
    ctx.strokeStyle=rgb(aFc.beam,al.toFixed(3));ctx.lineWidth=2.5*(1-prog);ctx.stroke()
  }
  const flickerA=0.18+0.14*Math.sin(frame*28)
  const og=ctx.createRadialGradient(cx,cy,0,cx,cy,lobeR*1.1)
  og.addColorStop(0,`rgba(255,255,255,${(flickerA*1.4).toFixed(3)})`)
  og.addColorStop(0.2,rgb(fc.beam,(flickerA*1.1).toFixed(3)))
  og.addColorStop(0.5,rgb(otherFc.beam,(flickerA*0.7).toFixed(3)))
  og.addColorStop(0.8,rgb(flicker?fc.beam:otherFc.beam,(flickerA*0.3).toFixed(3)))
  og.addColorStop(1,'rgba(0,0,0,0)')
  ctx.beginPath();ctx.arc(cx,cy,lobeR*1.1,0,Math.PI*2);ctx.fillStyle=og;ctx.fill()
  for (let i=0;i<20;i++){
    const a=(i/20)*Math.PI*2+frame*4, r=lobeR*0.4+lobeR*0.6*Math.abs(Math.sin(frame*5+i))
    const px=cx+Math.cos(a)*r, py=cy+Math.sin(a)*r
    const aFc=i%2===0?fc:otherFc
    ctx.beginPath();ctx.arc(px,py,1.5+Math.random()*1.5,0,Math.PI*2)
    ctx.fillStyle=rgb(aFc.beam,(0.5+0.4*Math.random()).toFixed(3));ctx.fill()
  }
  for (let i=0;i<8;i++){
    const y=cy-lobeR+Math.random()*lobeR*2.2, aFc=Math.random()>0.5?fc:otherFc
    ctx.fillStyle=rgb(aFc.beam,(0.06+Math.random()*0.10).toFixed(3))
    ctx.fillRect(cx-lobeR*1.1,y,lobeR*2.2,1.5+Math.random()*3)
  }
}

// ── Link beam (side-by-side, peaceful) ──────────────────────────
function drawLinkBeam(ctx,cx,cy,nx,ny,W,H,frame,strength,fc){
  const ts=[nx>0.001?(W-cx)/nx:Infinity,nx<-0.001?-cx/nx:Infinity,ny>0.001?(H-cy)/ny:Infinity,ny<-0.001?-cy/ny:Infinity]
  const t=Math.min(...ts.filter(v=>v>0))
  const ex=cx+nx*t,ey=cy+ny*t
  const bg=ctx.createLinearGradient(cx,cy,ex,ey)
  bg.addColorStop(0,rgb(fc.beam,(0.30*strength).toFixed(3)));bg.addColorStop(0.7,rgb(fc.beam,(0.10*strength).toFixed(3)));bg.addColorStop(1,rgb(fc.beam,'0'))
  ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(ex,ey);ctx.strokeStyle=bg;ctx.lineWidth=3;ctx.stroke()
  for(let i=0;i<6;i++){
    const p=((frame*0.3+i/6)%1)
    ctx.beginPath();ctx.arc(cx+nx*t*p,cy+ny*t*p,1.2,0,Math.PI*2)
    ctx.fillStyle=rgb(fc.beam,((1-p)*0.4*strength).toFixed(3));ctx.fill()
  }
  const eg=ctx.createRadialGradient(ex,ey,0,ex,ey,20)
  eg.addColorStop(0,rgb(fc.beam,(0.25*strength).toFixed(3)));eg.addColorStop(1,'rgba(0,0,0,0)')
  ctx.beginPath();ctx.arc(ex,ey,20,0,Math.PI*2);ctx.fillStyle=eg;ctx.fill()
}

// ── Hit glitch overlay ───────────────────────────────────────────
function drawGlitch(ctx,cx,cy,lobeR,age,fc){
  const inv=1-age
  const lines=Math.floor(inv*12)
  for(let i=0;i<lines;i++){
    const y=cy-lobeR+(Math.random()-0.1)*lobeR*2.4
    const x=cx-lobeR*(0.4+Math.random()*0.6)
    const w=lobeR*(0.4+Math.random()*1.2),h=1+Math.random()*4
    ctx.fillStyle=rgb(fc.node,(Math.random()*0.22*inv).toFixed(3))
    ctx.fillRect(x,y,w,h)
  }
  const bg=ctx.createRadialGradient(cx,cy,0,cx,cy,lobeR*(0.7+inv*0.7))
  bg.addColorStop(0,rgb(fc.node,(inv*0.14).toFixed(3)));bg.addColorStop(0.5,rgb(fc.node,(inv*0.07).toFixed(3)));bg.addColorStop(1,'rgba(0,0,0,0)')
  ctx.beginPath();ctx.arc(cx,cy,lobeR*(0.7+inv*0.7),0,Math.PI*2);ctx.fillStyle=bg;ctx.fill()
}

// ── Nucleus communication pulse ──────────────────────────────────
function drawNucleusPulse(ctx,cx,cy,nR,lobeR,frame,fc,linked){
  const rate=linked?0.75:0.42
  const count=3
  for(let i=0;i<count;i++){
    const phase=i/count
    const prog=((frame*rate+phase)%1)
    const r=nR*1.3+prog*lobeR*0.26
    const alpha=(1-prog)*0.52*(1-prog*0.28)
    if(alpha<0.01)continue
    ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2)
    ctx.strokeStyle=rgb(fc.beam,alpha.toFixed(3))
    ctx.lineWidth=1.8*(1-prog*0.72)
    ctx.stroke()
  }
}

// ── HUD ──────────────────────────────────────────────────────────
function drawHUD(ctx,W,H,cx,cy,lobeR,frame,nodes,edges,linked,fc,overlapping){
  const pad=18,bLen=22,col=a=>rgb(fc.hud,a)
  const bracketA=overlapping?(0.5+0.5*Math.abs(Math.sin(frame*12))).toFixed(3):linked?'0.80':'0.48'
  const corners=[[pad,pad],[W-pad,pad],[W-pad,H-pad],[pad,H-pad]]
  const dirs=[[1,1],[-1,1],[-1,-1],[1,-1]]
  ctx.lineWidth=overlapping?2.5:1.5
  for(let i=0;i<4;i++){
    const[x,y]=corners[i],[dx,dy]=dirs[i]
    ctx.strokeStyle=overlapping?`rgba(255,255,255,${bracketA})`:col(linked?'0.80':'0.48')
    ctx.beginPath();ctx.moveTo(x+dx*bLen,y);ctx.lineTo(x,y);ctx.lineTo(x,y+dy*bLen);ctx.stroke()
  }
  const scanY=((frame*0.09)%1)*H
  const sg=ctx.createLinearGradient(0,scanY-12,0,scanY+12)
  sg.addColorStop(0,col('0'));sg.addColorStop(0.5,col(linked?'0.09':'0.05'));sg.addColorStop(1,col('0'))
  ctx.fillStyle=sg;ctx.fillRect(0,scanY-12,W,24)
  const rS=lobeR*0.22,rP=0.5+0.25*Math.sin(frame*1.8)
  ctx.save();ctx.translate(cx,cy)
  ctx.beginPath();ctx.arc(0,0,rS,0,Math.PI*2);ctx.setLineDash([3,5])
  ctx.strokeStyle=col((0.20+0.12*rP).toFixed(3));ctx.lineWidth=1;ctx.stroke();ctx.setLineDash([])
  const cg=rS*0.35;ctx.strokeStyle=col('0.28');ctx.lineWidth=0.8
  ;[[-1,0],[1,0],[0,-1],[0,1]].forEach(([dx,dy])=>{
    ctx.beginPath();ctx.moveTo(dx*(rS+cg*0.6),dy*(rS+cg*0.6));ctx.lineTo(dx*(rS+cg*1.8),dy*(rS+cg*1.8));ctx.stroke()
  })
  ctx.restore()
  if(_hudAlert&&Date.now()<_hudAlert.until){
    const t=(_hudAlert.until-Date.now())/2200
    ctx.font='bold 11px "JetBrains Mono","Fira Code",monospace';ctx.textAlign='center'
    ctx.fillStyle=`rgba(255,255,255,${(t*0.85).toFixed(3)})`
    ctx.fillText(_hudAlert.text,W/2,cy+lobeR*0.72);ctx.textAlign='left'
  }
  const load=(60+20*Math.sin(frame*0.7)).toFixed(1),sig=(88+10*Math.sin(frame*0.9)).toFixed(1)
  const tpl=(overlapping?fc.stacked:linked?fc.linked:fc.solo).map(l=>l.replace('{load}',load).replace('{sig}',sig).replace('{n}',_others.length))
  ctx.font='10px "JetBrains Mono","Fira Code",monospace'
  const lH=15,sY=H-pad-tpl.length*lH+lH
  tpl.forEach((line,i)=>{
    const cyc=line.length+18,t=frame*38-i*cyc*0.6
    const ch=Math.max(0,Math.floor(t%(cyc*1.6)))
    const shown=ch<=line.length?line.slice(0,ch)+(ch<line.length&&Math.floor(frame*3)%2===0?'|':''):line
    const isHint=line.startsWith('> //')
    const isHot=linked&&(line.includes('!!')||line.includes('HOSTILE')||line.includes('OVERRIDE')||line.includes('RESISTANCE')||line.includes('TAKEOVER'))
    ctx.fillStyle=isHot?'rgba(255,255,255,0.92)':isHint?col(linked?'0.18':'0.58'):col(i===tpl.length-1?'0.62':'0.38')
    ctx.fillText(shown,pad+4,sY+i*lH)
  })
  ctx.textAlign='right'
  ;[`ORBITAL SYNC   ${(98.2+1.5*Math.sin(frame*0.5)).toFixed(2)}%`,
    `RING FREQ      ${(6+Math.sin(frame*0.3)).toFixed(3)} Hz`,
    `STREAM VEL     ${(0.35+0.1*Math.sin(frame*1.1)).toFixed(3)} u/s`,
  ].forEach((m,i)=>{ctx.fillStyle=col((0.30+0.05*i).toFixed(2));ctx.fillText(m,W-pad-4,pad+14+i*lH)})
  ctx.textAlign='left'
}

// ── Component ─────────────────────────────────────────────────────
export default function NeuralBrainBg({className=''}) {
  const canvasRef = useRef(null)
  const stateRef  = useRef(null)
  const brainPos  = useRef({x:0,y:0})

  useEffect(()=>{
    const canvas=canvasRef.current; if(!canvas) return
    const ctx=canvas.getContext('2d')
    let raf, rotY=Array(6).fill(0).map((_,i)=>i*Math.PI/3)
    let visible=false, frameCount=0
    const obsV=new IntersectionObserver(([e])=>{visible=e.isIntersecting},{threshold:0})
    obsV.observe(canvas.parentElement||canvas)

    const resize=()=>{
      const w=canvas.parentElement?.offsetWidth||canvas.offsetWidth
      const h=canvas.parentElement?.offsetHeight||canvas.offsetHeight
      if(!w||!h) return
      canvas.width=w;canvas.height=h;stateRef.current=buildBrain(w,h)
      rotY=Array(6).fill(0).map((_,i)=>i*Math.PI/3)
    }
    resize()
    const ro=new ResizeObserver(resize);ro.observe(canvas.parentElement||canvas)

    const doSync=()=>{
      const s=stateRef.current;if(!s) return
      const rect=canvas.getBoundingClientRect()
      const chrH=window.outerHeight-window.innerHeight
      const bx=(window.screenLeft??window.screenX)+rect.left+s.cx
      const by=(window.screenTop??window.screenY)+chrH+rect.top+s.cy
      brainPos.current={x:bx,y:by};syncWrite(bx,by)
    }
    doSync()
    const si=setInterval(doSync,120)

    const draw=()=>{
      raf=requestAnimationFrame(draw)
      if(!visible) return
      frameCount++
      if(uiState.sphereDragging && frameCount%1.5!==0) return
      const s=stateRef.current;if(!s) return
      const{nodes,edges,rings,shells,stream,pulseRings,cx,cy,lobeR}=s
      const frame=performance.now()*0.001
      const W=canvas.width,H=canvas.height
      const fc=F[_myFaction],linked=_others.length>0
      const now=Date.now()

      if(_hitState){_hitState.age+=0.012;if(_hitState.age>=1)_hitState=null}

      ctx.clearRect(0,0,W,H)
      for(const n of nodes) n.pulse=(n.pulse+n.speed)%1
      for(const sh of shells){sh.angY+=sh.ry_s;sh.angX+=sh.rx_s}

      // Canvas screen origin (for converting screen coords → canvas space)
      const rect=canvas.getBoundingClientRect()
      const chrH=window.outerHeight-window.innerHeight
      const cLeft=(window.screenLeft??window.screenX)+rect.left
      const cTop=(window.screenTop??window.screenY)+chrH+rect.top

      // ── Determine overlap state ───────────────────────────────
      let overlapping=false
      let ghostX=cx,ghostY=cy,otherFcG=F[1-_myFaction]
      if(linked){
        for(const ow of _others){
          const dist=Math.hypot(ow.bx-brainPos.current.x, ow.by-brainPos.current.y)
          const overlapThresh=(window.outerWidth+(ow.w||window.outerWidth))/2
          if(dist<overlapThresh){
            overlapping=true
            ghostX=ow.bx-cLeft
            ghostY=ow.by-cTop
            otherFcG=F[ow.faction??1]
            break
          }
        }
      }

      // Ghost brain: draw first so main brain renders on top
      if(overlapping){
        const gDist=Math.hypot(ghostX-cx,ghostY-cy)
        const overlapThresh=(window.outerWidth+((_others[0]?.w)||window.outerWidth))/2
        const overlap=Math.max(0,1-gDist/overlapThresh)
        drawGhostBrain(ctx,ghostX,ghostY,lobeR*0.70,otherFcG,0.12+0.22*overlap,frame,s.ghostNodes)
      }

      // ── Main brain ────────────────────────────────────────────
      drawBrainOutline(ctx,cx,cy,lobeR,frame,fc)

      for(const{i,j,d,thresh}of edges){
        const ni=nodes[i],nj=nodes[j]
        const avg=(Math.sin(ni.pulse*Math.PI*2)+Math.sin(nj.pulse*Math.PI*2))*0.25+0.5
        ctx.beginPath();ctx.moveTo(ni.x,ni.y);ctx.lineTo(nj.x,nj.y)
        ctx.strokeStyle=`rgba(${fc.node},${((1-d/thresh)*0.45+avg*0.08).toFixed(3)})`
        ctx.lineWidth=0.9;ctx.stroke()
      }

      for(let i=0;i<rings.length;i++){
        rotY[i]=(rotY[i]||0)+rings[i].speed
        drawRing(ctx,cx,cy,rings[i].a,rings[i].rx,rings[i].rz,rotY[i],rings[i].op,fc)
      }
      for(const sh of shells) drawShell(ctx,cx,cy,sh.r,sh.angY,sh.angX,sh.op,fc)

      for(const p of stream){
        const dx=cx-p.x,dy=cy-p.y,dist=Math.hypot(dx,dy)
        if(dist<6){const a=Math.random()*Math.PI*2,r=lobeR*(0.55+Math.random()*0.85);p.x=cx+Math.cos(a)*r;p.y=cy+Math.sin(a)*r}
        else{const sp=p.speed/dist;p.x+=dx*sp;p.y+=dy*sp}
        ctx.beginPath();ctx.arc(p.x,p.y,0.9,0,Math.PI*2)
        ctx.fillStyle=`rgba(${fc.stream},${(0.3+0.5*(1-dist/(lobeR*1.4))).toFixed(3)})`;ctx.fill()
      }

      for(const pr of pulseRings){
        const prog=((frame*0.007+pr.phase)%1),rR=lobeR*0.05+prog*lobeR*0.55
        const al=Math.max(0,0.22*(1-prog));if(al<0.005) continue
        ctx.save();ctx.translate(cx,cy);ctx.rotate(pr.tiltZ)
        ctx.scale(1,Math.max(0.15,Math.abs(Math.sin(pr.tiltX+prog*Math.PI))))
        ctx.beginPath();ctx.arc(0,0,rR,0,Math.PI*2)
        ctx.strokeStyle=`rgba(${fc.pulse},${al.toFixed(3)})`;ctx.lineWidth=1.5;ctx.stroke();ctx.restore()
      }

      // ── Multi-window interactions ─────────────────────────────
      let _battleDetected = false
      if(linked){
        for(const ow of _others){
          const dx=ow.bx-brainPos.current.x, dy=ow.by-brainPos.current.y
          const dist=Math.hypot(dx,dy)
          const overlapThresh=(window.outerWidth+(ow.w||window.outerWidth))/2
          const otherFc=F[ow.faction??1]
          const gx=ow.bx-cLeft, gy=ow.by-cTop

          if(dist<80){
            // Stacked: maximum chaos + signal 3D scene
            _battleDetected = true
            battle.myFaction   = _myFaction
            battle.otherFaction = ow.faction ?? 1
            drawStackedEffect(ctx,cx,cy,lobeR,frame,fc,otherFc)
            if(now-_lastBoltT>100){
              _lastBoltT=now
              spawnBolts(cx,cy,gx,gy,fc,otherFc,5,280)
              if(Math.random()>0.4){
                _hitState={age:0,fc:otherFc}
                setHudAlert('> !! CRITICAL: SYSTEMS COLLIDING',1000)
              }
            }
          } else if(dist<overlapThresh){
            // Overlapping: lightning web attacks
            if(now-_lastBoltT>260){
              _lastBoltT=now
              spawnBolts(cx,cy,gx,gy,fc,otherFc,3,450)
              if(Math.random()>0.55){
                _hitState={age:0,fc:otherFc}
                setHudAlert('> !! IMPACT: SHIELDS COMPROMISED',1500)
              }
            }
          } else {
            // Side by side: peaceful communication beams only
            if(dist>1) drawLinkBeam(ctx,cx,cy,dx/dist,dy/dist,W,H,frame,Math.max(0.2,1-dist/1600),fc)
          }
        }

        // Draw active lightning bolts
        _bolts=_bolts.filter(b=>now-b.startT<b.dur)
        for(const b of _bolts){
          const age=(now-b.startT)/b.dur
          drawLightningBolt(ctx,b.pts,b.branches,b.fc,Math.max(0,1-age*age),b.lineW)
        }
      }
      battle.active = _battleDetected

      // ── Nucleus: dims when losing, glows when winning ────────
      const hitIntensity=_hitState?(1-_hitState.age)*0.45:0
      const beatRate=linked?1.4:0.82
      const beat=Math.pow(Math.max(0,Math.sin(frame*Math.PI*beatRate)),2.5)
      const hb=(0.62+0.38*beat)*(1-hitIntensity*0.38)

      fc.glows.forEach((g,i)=>{
        const rs=[lobeR*0.38,lobeR*0.24,lobeR*0.14,lobeR*0.06],als=[0.10*hb,0.28*hb,0.52*hb,0.82*hb]
        const grd=ctx.createRadialGradient(cx,cy,0,cx,cy,rs[i])
        grd.addColorStop(0,`rgba(${g},${als[i].toFixed(3)})`);grd.addColorStop(0.4,`rgba(${g},${(als[i]*0.5).toFixed(3)})`);grd.addColorStop(1,`rgba(${g},0)`)
        ctx.beginPath();ctx.arc(cx,cy,rs[i],0,Math.PI*2);ctx.fillStyle=grd;ctx.fill()
      })

      // Enemy color bleed when hit (loser tinted by winner's color)
      if(_hitState&&_hitState.age<0.8){
        const bleed=(1-_hitState.age)*0.20
        const bg2=ctx.createRadialGradient(cx,cy,0,cx,cy,lobeR*0.55)
        bg2.addColorStop(0,rgb(_hitState.fc.node,bleed.toFixed(3)));bg2.addColorStop(1,'rgba(0,0,0,0)')
        ctx.beginPath();ctx.arc(cx,cy,lobeR*0.55,0,Math.PI*2);ctx.fillStyle=bg2;ctx.fill()
      }

      drawNucleusPulse(ctx,cx,cy,lobeR*0.05+0.018*lobeR,lobeR,frame,fc,linked)
      const nR=lobeR*0.05+hb*lobeR*0.018
      const sg=ctx.createRadialGradient(cx-nR*0.3,cy-nR*0.3,nR*0.05,cx,cy,nR)
      sg.addColorStop(0,`rgba(${fc.nuc[0]},0.98)`);sg.addColorStop(0.45,`rgba(${fc.nuc[1]},0.92)`);sg.addColorStop(1,`rgba(${fc.nuc[2]},0.80)`)
      ctx.beginPath();ctx.arc(cx,cy,nR,0,Math.PI*2);ctx.fillStyle=sg;ctx.fill()
      drawHexGrid(ctx,cx,cy,nR,fc)
      ctx.beginPath();ctx.arc(cx-nR*0.28,cy-nR*0.28,nR*0.30,0,Math.PI*2)
      ctx.fillStyle=`rgba(255,255,220,${(0.55+hb*0.20).toFixed(3)})`;ctx.fill()

      for(const n of nodes){
        const glow=Math.sin(n.pulse*Math.PI*2)*0.5+0.5,r=1.8+glow*3.0
        if(glow>0.5){
          const grad=ctx.createRadialGradient(n.x,n.y,0,n.x,n.y,r*5)
          grad.addColorStop(0,`rgba(${fc.node},${(glow*0.25).toFixed(3)})`);grad.addColorStop(1,`rgba(${fc.node},0)`)
          ctx.beginPath();ctx.arc(n.x,n.y,r*5,0,Math.PI*2);ctx.fillStyle=grad;ctx.fill()
        }
        ctx.beginPath();ctx.arc(n.x,n.y,r,0,Math.PI*2)
        ctx.fillStyle=`rgba(${fc.node},${(0.45+glow*0.50).toFixed(3)})`;ctx.fill()
      }

      if(_hitState) drawGlitch(ctx,cx,cy,lobeR,_hitState.age,_hitState.fc)

      drawHUD(ctx,W,H,cx,cy,lobeR,frame,nodes,edges,linked,fc,overlapping)
    }

    draw()
    return()=>{cancelAnimationFrame(raf);ro.disconnect();obsV.disconnect();clearInterval(si);syncRemove()}
  },[])

  return <canvas ref={canvasRef} className={`absolute inset-0 w-full h-full ${className}`} style={{pointerEvents:'none'}} />
}

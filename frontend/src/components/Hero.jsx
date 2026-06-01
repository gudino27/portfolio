import { useEffect, useRef, useState } from 'react'
import { Github, Mail, ArrowUpRight } from 'lucide-react'
import useCountUp from '../hooks/useCountUp'

const CIPHER_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
const rnd = () => CIPHER_CHARS[Math.floor(Math.random() * CIPHER_CHARS.length)]

function useQuantumLetters(target, { startDelay = 0, charInterval = 210 } = {}) {
  const [letters, setLetters] = useState(() =>
    target.split('').map(c => ({
      char: c === ' ' ? ' ' : rnd(),
      locked: c === ' ',
      cracking: false,
    }))
  )
  const [lockedCount, setLockedCount] = useState(0)

  useEffect(() => {
    let currentLocked = 0
    let scrambleTimer
    let lockTimer
    let done = false

    const t = setTimeout(() => {
      scrambleTimer = setInterval(() => {
        if (done) return
        setLetters(prev => prev.map(l => l.locked ? l : { ...l, char: rnd() }))
      }, 110)

      lockTimer = setInterval(() => {
        const idx = currentLocked
        if (idx >= target.length) {
          clearInterval(lockTimer)
          clearInterval(scrambleTimer)
          done = true
          return
        }
        currentLocked++

        if (target[idx] === ' ') {
          setLockedCount(currentLocked)
          return
        }

        setLetters(prev => {
          const next = [...prev]
          next[idx] = { char: target[idx], locked: true, cracking: true }
          return next
        })
        setLockedCount(currentLocked)

        setTimeout(() => {
          setLetters(prev => {
            const next = [...prev]
            if (next[idx]) next[idx] = { ...next[idx], cracking: false }
            return next
          })
        }, 500)

        if (currentLocked >= target.length) {
          clearInterval(lockTimer)
          clearInterval(scrambleTimer)
          done = true
        }
      }, charInterval)
    }, startDelay)

    return () => {
      done = true
      clearTimeout(t)
      clearInterval(scrambleTimer)
      clearInterval(lockTimer)
    }
  }, [target, startDelay, charInterval])

  return { letters, lockedCount }
}

function MatrixCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let raf
    let visible = false

    const resize = () => {
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()

    const COL_W = 16
    let cols = Math.ceil(canvas.width / COL_W)
    let drops = Array.from({ length: cols }, () => (Math.random() * -canvas.height) / 18)

    const draw = () => {
      raf = requestAnimationFrame(draw)
      if (!visible) return
      ctx.fillStyle = 'rgba(9,9,11,0.14)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.font = '13px monospace'

      for (let i = 0; i < cols; i++) {
        const char = CIPHER_CHARS[Math.floor(Math.random() * CIPHER_CHARS.length)]
        ctx.fillStyle = 'rgba(220,18,48,0.85)'
        ctx.fillText(char, i * COL_W, drops[i] * 18)
        if (drops[i] * 18 > canvas.height && Math.random() > 0.97) drops[i] = 0
        drops[i] += 0.45
      }
    }
    draw()

    const ro = new ResizeObserver(() => {
      resize()
      cols  = Math.ceil(canvas.width / COL_W)
      drops = Array.from({ length: cols }, () => (Math.random() * -canvas.height) / 18)
    })
    ro.observe(canvas)

    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !visible) {
        drops = Array.from({ length: cols }, () => (Math.random() * -canvas.height) / 18)
      }
      visible = e.isIntersecting
    }, { threshold: 0 })
    obs.observe(canvas)
    return () => { cancelAnimationFrame(raf); ro.disconnect(); obs.disconnect() }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.06 }}
    />
  )
}

function QuantumSphere() {
  const canvasRef = useRef(null)
  const mouseRef  = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let raf
    let disposed = false
    let disposeThree = null

    import('three').then(THREE => {
      if (disposed) return

      const W = canvas.offsetWidth
      const H = canvas.offsetHeight

      const isMobile = window.innerWidth < 768
      const scene  = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(isMobile ? 45 : 55, W / H, 0.1, 100)
      camera.position.z = isMobile ? 6.5 : 3.8
      camera.position.y = 0.3

      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
      renderer.setSize(W, H)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

      const N   = 3200
      const pos = new Float32Array(N * 3)
      const col = new Float32Array(N * 3)

      const goldenAngle = Math.PI * (1 + Math.sqrt(5))
      const R = 1.25

      for (let i = 0; i < N; i++) {
        const theta = Math.acos(1 - 2 * (i + 0.5) / N)
        const angle = goldenAngle * i
        const r     = R + (Math.random() - 0.5) * 0.2

        pos[i * 3]     = r * Math.sin(theta) * Math.cos(angle)
        pos[i * 3 + 1] = r * Math.sin(theta) * Math.sin(angle)
        pos[i * 3 + 2] = r * Math.cos(theta)
      }

      const base = pos.slice()

      const geo = new THREE.BufferGeometry()
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
      geo.setAttribute('color',    new THREE.BufferAttribute(col, 3))

      const mat = new THREE.PointsMaterial({
        size:            0.020,
        vertexColors:    true,
        transparent:     true,
        opacity:         0.70,
        blending:        THREE.AdditiveBlending,
        depthWrite:      false,
        sizeAttenuation: true,
      })

      const pts = new THREE.Points(geo, mat)
      scene.add(pts)

      const LAMBDA = 0.88
      const K      = (2 * Math.PI) / LAMBDA
      const OMEGA  = 0.85
      const src = [
        [ 0,              R,       0 ],
        [ R * 0.866, -R * 0.5,    0 ],
        [-R * 0.866, -R * 0.5,    0 ],
      ]
      const srcV = src.map(() => [
        (Math.random() - 0.5) * 0.005,
        (Math.random() - 0.5) * 0.005,
        (Math.random() - 0.5) * 0.005,
      ])

      const tunnelProg = new Float32Array(N)
      const tunnelDest = new Float32Array(N * 3)
      const TUNNEL_RATE = 0.000010

      let t   = 0
      const rot = { x: 0, y: 0 }

      let visibleSphere = false
      const obsS = new IntersectionObserver(([e]) => {
        if (e.isIntersecting && !visibleSphere) {
          t += 3 + Math.random() * 10
        }
        visibleSphere = e.isIntersecting
      }, { threshold: 0 })
      obsS.observe(canvas)

      const animate = () => {
        raf = requestAnimationFrame(animate)
        if (!visibleSphere) return

        t += 0.007

        rot.x += (-mouseRef.current.y * 0.22 - rot.x) * 0.04
        rot.y += ( mouseRef.current.x * 0.40 - rot.y) * 0.04

        for (let j = 0; j < 3; j++) {
          srcV[j][0] += (Math.random() - 0.5) * 0.0012
          srcV[j][1] += (Math.random() - 0.5) * 0.0012
          srcV[j][2] += (Math.random() - 0.5) * 0.0012
          for (let k = 0; k < 3; k++) srcV[j][k] = Math.max(-0.014, Math.min(0.014, srcV[j][k]))
          src[j][0] += srcV[j][0]
          src[j][1] += srcV[j][1]
          src[j][2] += srcV[j][2]
          const len = Math.sqrt(src[j][0]**2 + src[j][1]**2 + src[j][2]**2)
          src[j][0] = src[j][0] / len * R
          src[j][1] = src[j][1] / len * R
          src[j][2] = src[j][2] / len * R
        }

        const p = geo.attributes.position.array
        const c = geo.attributes.color.array

        for (let i = 0; i < N; i++) {
          const bx = base[i * 3], by = base[i * 3 + 1], bz = base[i * 3 + 2]

          if (tunnelProg[i] === 0 && Math.random() < TUNNEL_RATE) {
            tunnelProg[i] = 0.001
            const spread         = 0.7 + Math.random() * 0.6
            tunnelDest[i * 3]     = -bx * spread
            tunnelDest[i * 3 + 1] = -by * spread
            tunnelDest[i * 3 + 2] = -bz * spread
          }

          let psi = 0
          for (const s of src) {
            const dx = bx - s[0], dy = by - s[1], dz = bz - s[2]
            psi += Math.sin(Math.sqrt(dx*dx + dy*dy + dz*dz) * K - OMEGA * t)
          }
          psi /= 3

          const amp = (psi + 1) * 0.5
          let cr = 0.15 + amp * 0.85
          let cg = amp * 0.10
          let cb = (1 - amp) * 0.07

          const jitter = amp * 0.055
          let px = bx + jitter * Math.sin(t * 1.4 + i * 0.019)
          let py = by + jitter * Math.cos(t * 1.1 + i * 0.027)
          let pz = bz + jitter * Math.sin(t * 0.9 + i * 0.033)

          if (tunnelProg[i] > 0) {
            tunnelProg[i] += 0.016

            if (tunnelProg[i] < 1.0) {
              const fade = 1 - tunnelProg[i]
              cr *= fade * fade; cg *= fade * fade; cb *= fade * fade
              const shrink = 1 - tunnelProg[i] * 0.6
              px = bx * shrink; py = by * shrink; pz = bz * shrink

            } else if (tunnelProg[i] < 1.04) {
              base[i * 3]     = tunnelDest[i * 3]
              base[i * 3 + 1] = tunnelDest[i * 3 + 1]
              base[i * 3 + 2] = tunnelDest[i * 3 + 2]
              px = base[i * 3]; py = base[i * 3 + 1]; pz = base[i * 3 + 2]
              cr = cg = cb = 0

            } else if (tunnelProg[i] < 2.0) {
              const flash = Math.sin((tunnelProg[i] - 1.04) / 0.96 * Math.PI)
              cr = Math.min(1, cr + flash * 0.9)
              cg = Math.min(0.5, cg + flash * 0.4)
              cb = Math.min(0.2, cb + flash * 0.15)
              px = base[i * 3]; py = base[i * 3 + 1]; pz = base[i * 3 + 2]

            } else {
              tunnelProg[i] = 0
            }
          }

          p[i * 3] = px; p[i * 3 + 1] = py; p[i * 3 + 2] = pz
          c[i * 3] = cr; c[i * 3 + 1] = cg; c[i * 3 + 2] = cb
        }

        geo.attributes.position.needsUpdate = true
        geo.attributes.color.needsUpdate    = true

        pts.rotation.y = t * 0.10 + rot.y
        pts.rotation.x = Math.sin(t * 0.07) * 0.12 + rot.x

        renderer.render(scene, camera)
      }
      animate()

      const ro = new ResizeObserver(() => {
        const W = canvas.offsetWidth, H = canvas.offsetHeight
        camera.aspect = W / H
        camera.updateProjectionMatrix()
        renderer.setSize(W, H)
      })
      ro.observe(canvas)

      const onMove = e => {
        const r = canvas.getBoundingClientRect()
        mouseRef.current.x = ((e.clientX - r.left) / r.width)  * 2 - 1
        mouseRef.current.y = ((e.clientY - r.top)  / r.height) * 2 - 1
      }
      window.addEventListener('mousemove', onMove)

      disposeThree = () => {
        cancelAnimationFrame(raf)
        obsS.disconnect()
        ro.disconnect()
        window.removeEventListener('mousemove', onMove)
        renderer.dispose()
        geo.dispose()
        mat.dispose()
      }
    })

    return () => {
      disposed = true
      disposeThree?.()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  )
}

// Quantum cursor: Bohr-orbit particles + expanding probability rings
function QuantumCursor() {
  const canvasRef = useRef(null)
  const mouseRef  = useRef({ x: -9999, y: -9999 })
  const ringsRef  = useRef([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let raf
    let visibleCursor = false

    const resize = () => {
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()

    // 6 orbital particles — speeds and radii randomly walk each frame (quantum fluctuation)
    const orbitals = [
      { a: 0,    rX: 22, rY: 14, sA: 0.048, size: 1.6, jumpTimer: 0 },
      { a: 1.05, rX: 18, rY: 22, sA: 0.038, size: 1.3, jumpTimer: 0 },
      { a: 2.09, rX: 26, rY: 16, sA: 0.055, size: 1.0, jumpTimer: 0 },
      { a: 3.14, rX: 14, rY: 24, sA: 0.042, size: 1.5, jumpTimer: 0 },
      { a: 4.19, rX: 28, rY: 12, sA: 0.035, size: 1.2, jumpTimer: 0 },
      { a: 5.24, rX: 16, rY: 20, sA: 0.062, size: 0.9, jumpTimer: 0 },
    ]

    let t = 0
    let lastRing = 0

    const draw = () => {
      raf = requestAnimationFrame(draw)
      if (!visibleCursor) return
      t += 0.016
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const cx = mouseRef.current.x
      const cy = mouseRef.current.y
      if (cx < 0) return

      // Ring timing: random interval between 250–600ms
      if (t - lastRing > 0.25 + Math.random() * 0.35) {
        lastRing = t
        ringsRef.current.push({ r: 3 + Math.random() * 4, op: 0.40 + Math.random() * 0.20 })
      }

      // Draw rings
      ringsRef.current = ringsRef.current.filter(r => r.op > 0.01)
      for (const ring of ringsRef.current) {
        ring.r  += 1.6 + Math.random() * 0.8
        ring.op -= 0.012
        ctx.beginPath()
        ctx.arc(cx, cy, ring.r, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(220,18,48,${ring.op.toFixed(3)})`
        ctx.lineWidth   = 0.8 + Math.random() * 0.5
        ctx.stroke()
      }

      // Draw orbital particles with random-walking speeds + quantum leap jumps
      for (const orb of orbitals) {
        // Speed random walk each frame
        orb.sA += (Math.random() - 0.5) * 0.004
        orb.sA  = Math.max(0.018, Math.min(0.09, orb.sA))

        // Quantum leap: randomly jump to a new orbit radius
        orb.jumpTimer += 1
        if (orb.jumpTimer > 60 + Math.random() * 120 && Math.random() < 0.04) {
          orb.rX = 10 + Math.random() * 22
          orb.rY = 10 + Math.random() * 22
          orb.jumpTimer = 0
        }

        orb.a += orb.sA
        const ratio = 0.4 + Math.random() * 0.3  // Lissajous ratio drifts
        const ox = cx + Math.cos(orb.a) * orb.rX
        const oy = cy + Math.sin(orb.a * ratio) * orb.rY

        // Soft glow halo
        const grd = ctx.createRadialGradient(ox, oy, 0, ox, oy, orb.size * 4)
        grd.addColorStop(0, 'rgba(220,18,48,0.75)')
        grd.addColorStop(1, 'rgba(220,18,48,0)')
        ctx.beginPath()
        ctx.arc(ox, oy, orb.size * 4, 0, Math.PI * 2)
        ctx.fillStyle = grd
        ctx.fill()

        // Hard core
        ctx.beginPath()
        ctx.arc(ox, oy, orb.size, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(255,110,110,0.95)'
        ctx.fill()
      }

    }
    draw()

    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const obsC = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !visibleCursor) {
        ringsRef.current = []
        for (const orb of orbitals) orb.a += Math.random() * Math.PI * 2
      }
      visibleCursor = e.isIntersecting
    }, { threshold: 0 })
    obsC.observe(canvas)

    const section = canvas.parentElement
    const onMove  = e => {
      const r = canvas.getBoundingClientRect()
      mouseRef.current.x = e.clientX - r.left
      mouseRef.current.y = e.clientY - r.top
    }
    const onLeave = () => { mouseRef.current.x = -9999 }
    section?.addEventListener('mousemove', onMove)
    section?.addEventListener('mouseleave', onLeave)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      obsC.disconnect()
      section?.removeEventListener('mousemove', onMove)
      section?.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-20"
    />
  )
}

function QuantumWord({ letters, lockedCount, target, isGradient = false }) {
  const total   = target.length
  const allDone = lockedCount >= total
  const scanPct = total > 0 ? (lockedCount / total) * 100 : 0

  return (
    <span className="relative inline-block">
      {letters.map((l, i) => {
        const finalChar = target[i]

        let overlayCls = 'absolute inset-0 flex items-center justify-center '
        let overlayStyle = {}

        if (l.cracking) {
          overlayCls += isGradient ? 'gradient-text animate-quantum-crack' : 'animate-quantum-crack'
          if (!isGradient) overlayStyle = { color: '#ffffff' }
        } else if (!l.locked) {
          overlayCls += 'animate-quantum-flicker'
          overlayStyle = { color: 'rgba(220,18,48,0.7)', fontFamily: 'monospace', fontSize: '0.82em' }
        } else {
          overlayCls += isGradient ? 'gradient-text' : ''
          if (!isGradient) overlayStyle = { color: '#f4f4f5' }
        }

        return (
          <span key={i} className="inline-block relative">
            {/* Invisible anchor — always the real char, keeps width stable */}
            <span className="invisible select-none" aria-hidden>{finalChar}</span>
            {/* Visible: cipher char scrambling, or final char on lock */}
            <span className={overlayCls} style={overlayStyle} aria-hidden={!l.locked}>
              {l.locked ? finalChar : l.char}
            </span>
          </span>
        )
      })}

      {scanPct > 0 && !allDone && (
        <span
          aria-hidden
          className="absolute top-0 bottom-0 pointer-events-none"
          style={{
            left: `${scanPct}%`,
            width: '2px',
            background: 'linear-gradient(to bottom, transparent 5%, rgba(220,18,48,0.95) 50%, transparent 95%)',
            boxShadow: '0 0 6px rgba(220,18,48,0.9), 0 0 18px rgba(220,18,48,0.5)',
          }}
        />
      )}
    </span>
  )
}

const stats = [
  { end: 3,      suffix: '',    label: 'live deployments',  sub: 'Production web systems',       color: 'cyan'    },
  { end: 360,    suffix: '°',   label: '3D showroom',        sub: 'Three.js + React Three Fiber', color: 'violet'  },
  { end: 0,      suffix: ' dt', label: 'downtime deploys',   sub: 'Blue-green pipeline',           color: 'emerald' },
  { end: 81.67,  suffix: '%',   label: 'RAG accuracy',       sub: 'AI advising research',          color: 'fuchsia' },
]

const colorGlass = {
  cyan:    'border-wsu-500/20    hover:border-wsu-500/40    shadow-[0_0_20px_-5px_rgba(220,18,48,0.12)]',
  violet:  'border-violet-500/20  hover:border-violet-500/40  shadow-[0_0_20px_-5px_rgba(139,92,246,0.1)]',
  emerald: 'border-emerald-500/20 hover:border-emerald-500/40 shadow-[0_0_20px_-5px_rgba(16,185,129,0.1)]',
  fuchsia: 'border-amber-500/20   hover:border-amber-500/40   shadow-[0_0_20px_-5px_rgba(245,158,11,0.1)]',
}
const colorText = {
  cyan: 'text-wsu-400', violet: 'text-violet-400', emerald: 'text-emerald-400', fuchsia: 'text-amber-400',
}

function StatCard({ end, suffix, label, sub, color, inView, i }) {
  const val     = useCountUp(end, 1300, inView)
  const display = suffix === ' dt' ? `${val}` : `${val}${suffix}`
  return (
    <div
      className={`animate-fade-up glass rounded-xl px-4 sm:px-5 py-4 sm:py-5 text-center transition-all duration-300 ${colorGlass[color]}`}
      style={{ '--fu-delay': `${0.85 + i * 0.08}s`, '--fu-dur': '0.4s', '--fu-y': '20px' }}
    >
      <div className={`font-mono font-bold text-2xl sm:text-3xl leading-none tabular-nums ${colorText[color]}`}>
        {display}
      </div>
      <div className="text-zinc-300 text-xs sm:text-sm mt-2 font-medium leading-snug">{label}</div>
      <div className="text-zinc-600 text-[10px] sm:text-xs mt-0.5 font-mono">{sub}</div>
    </div>
  )
}

const isMobileViewport = () =>
  window.matchMedia('(pointer: coarse)').matches && window.innerWidth < 768

export default function Hero() {
  const [ready, setReady]               = useState(false)
  const [sphereMounted, setSphereMounted] = useState(false)
  const [hasHover, setHasHover]          = useState(false)
  const first = useQuantumLetters('Jaime',  { startDelay: 300,  charInterval: 210 })
  const last  = useQuantumLetters('Gudino', { startDelay: 1500, charInterval: 210 })

  useEffect(() => {
    setHasHover(!isMobileViewport())
    const readyId = setTimeout(() => setReady(true), 1300)
    if (typeof requestIdleCallback !== 'undefined') {
      const id = requestIdleCallback(() => setSphereMounted(true), { timeout: 2500 })
      return () => { cancelIdleCallback(id); clearTimeout(readyId) }
    }
    const id = setTimeout(() => setSphereMounted(true), 1200)
    return () => { clearTimeout(id); clearTimeout(readyId) }
  }, [])

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-zinc-950" />
      <div className="absolute inset-0 dot-grid opacity-20" />

      <div className="absolute top-0 -left-1/4 w-[700px] h-[700px] bg-wsu-600/[0.18] rounded-full blur-[130px] animate-blob pointer-events-none" />
      <div className="absolute bottom-0 -right-1/4 w-[600px] h-[600px] bg-violet-500/[0.10] rounded-full blur-[120px] animate-blob2 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-amber-500/[0.05] rounded-full blur-[80px] animate-blob pointer-events-none" style={{ animationDelay: '5s' }} />

      {hasHover && <MatrixCanvas />}
      {sphereMounted && <QuantumSphere />}
      {hasHover && <QuantumCursor />}

      <div className="relative z-10 w-full max-w-5xl mx-auto px-5 sm:px-6 text-center">
        <div
          className="animate-fade-up mb-5 sm:mb-6"
          style={{ '--fu-delay': '0.05s', '--fu-dur': '0.4s' }}
        >
          <span className="inline-flex items-center gap-2 font-mono text-wsu-400 text-xs sm:text-sm tracking-widest uppercase border border-wsu-500/20 bg-wsu-500/5 px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-wsu-400 animate-pulse shrink-0" />
            Washington State University · CS 2026
          </span>
        </div>

        <h1
          className="animate-fade-up text-6xl xs:text-7xl sm:text-9xl font-black tracking-tight mb-5 sm:mb-6 leading-none"
          style={{ '--fu-delay': '0.15s', '--fu-dur': '0.6s', '--fu-y': '24px' }}
        >
          <QuantumWord
            letters={first.letters}
            lockedCount={first.lockedCount}
            target="Jaime"
          />
          {' '}
          <QuantumWord
            letters={last.letters}
            lockedCount={last.lockedCount}
            target="Gudino"
            isGradient
          />
        </h1>

        <div
          className="animate-fade-up mb-8 sm:mb-10"
          style={{ '--fu-delay': '0.3s', '--fu-dur': '0.45s', '--fu-y': '12px' }}
        >
          <p className="text-lg sm:text-2xl text-zinc-300 font-medium max-w-2xl mx-auto leading-snug">
            Full-stack web developer and native iOS developer.
          </p>
          <p className="text-sm sm:text-base text-zinc-500 max-w-xl mx-auto mt-2 leading-relaxed">
            I run the full digital operation for a family cabinet business: 3D showroom, iOS admin app, zero-downtime deploys. Also doing applied ML research at WSU. Bilingual in English and Spanish.
          </p>
        </div>

        <div
          className="animate-fade-up flex flex-wrap items-center justify-center gap-3 mb-14 sm:mb-16"
          style={{ '--fu-delay': '0.42s', '--fu-dur': '0.4s' }}
        >
          <a href="https://github.com/gudino27" target="_blank" rel="noopener noreferrer" className="btn-primary">
            <Github size={15} /> github.com/gudino27
          </a>
          <a href="mailto:jaime.gudino@wsu.edu" className="btn-secondary">
            <Mail size={15} /> jaime.gudino@wsu.edu
          </a>
          <a href="#projects" className="inline-flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 text-sm transition-colors">
            My Work <ArrowUpRight size={13} />
          </a>
        </div>

        <div
          className="animate-fade-up grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto"
          style={{ '--fu-delay': '0.7s', '--fu-dur': '0.5s' }}
        >
          {stats.map((s, i) => <StatCard key={s.label} {...s} i={i} inView={ready} />)}
        </div>
      </div>
    </section>
  )
}

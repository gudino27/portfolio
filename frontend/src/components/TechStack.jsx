import { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import NeuralBrainBg from './NeuralBrainBg'
import { uiState } from '../battleState'

const CDN = 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons'

const TECHS = [
  { name: 'React',        img: 'react/react-original.svg',                                    projects: ['Virtual Counselor', 'CougarPark', 'Gudino Woodworking', 'Portfolio'] },
  { name: 'TypeScript',   img: 'typescript/typescript-original.svg',                           projects: ['Brain MCP'] },
  { name: 'JavaScript',   img: 'javascript/javascript-original.svg',                           projects: ['Portfolio', 'Gudino Woodworking'] },
  { name: 'Python',       img: 'python/python-original.svg',                                   projects: ['CougarPark', 'Virtual Counselor'] },
  { name: 'Swift',        img: 'swift/swift-original.svg',                                     projects: ['Gudino Woodworking'] },
  { name: 'Docker',       img: 'docker/docker-original.svg',                                   projects: ['Virtual Counselor', 'Gudino Woodworking'] },
  { name: 'Node.js',      img: 'nodejs/nodejs-original.svg',                                   projects: ['Brain MCP', 'Gudino Woodworking'] },
  { name: 'Go',           img: 'go/go-original-wordmark.svg',                                  projects: [],                                                              note: 'Coursework' },
  { name: 'Java',         img: 'java/java-original.svg',                                       projects: [],                                                              note: 'Coursework' },
  { name: 'Three.js',     img: 'threejs/threejs-original.svg',        invert: true,            projects: ['Gudino Woodworking', 'Brain MCP', 'Portfolio'] },
  { name: 'Vite',         img: 'vitejs/vitejs-original.svg',                                   projects: ['Portfolio'] },
  { name: 'Express',      img: 'express/express-original.svg',        invert: true,            projects: ['Brain MCP', 'Gudino Woodworking', 'Virtual Counselor'] },
  { name: 'FastAPI',      img: 'fastapi/fastapi-original.svg',                                 projects: ['CougarPark'] },
  { name: 'Tailwind',     img: 'tailwindcss/tailwindcss-original.svg',                        projects: ['Portfolio', 'Virtual Counselor', 'CougarPark', 'Gudino Woodworking', 'Brain MCP'] },
  { name: 'Git',          img: 'git/git-original.svg',                                         projects: ['Virtual Counselor', 'CougarPark', 'Brain MCP', 'Gudino Woodworking', 'Portfolio'] },
  { name: 'Linux',        img: 'linux/linux-original.svg',                                     projects: [],                                                              note: 'Self-hosted infrastructure' },
  { name: 'pandas',       img: 'pandas/pandas-original.svg',                                   projects: ['CougarPark', 'Virtual Counselor'] },
  { name: 'SQLite',       img: 'sqlite/sqlite-original.svg',                                   projects: ['Virtual Counselor', 'Gudino Woodworking'] },
  { name: 'Jupyter',      img: 'jupyter/jupyter-original.svg',                                 projects: ['CougarPark'] },
  { name: 'scikit-learn', img: 'scikitlearn/scikitlearn-original.svg',                        projects: ['CougarPark'] },
  { name: 'Nginx',        img: 'nginx/nginx-original.svg',                                     projects: ['Virtual Counselor', 'Gudino Woodworking'] },
  { name: 'AWS',          img: 'amazonwebservices/amazonwebservices-plain-wordmark.svg',       projects: [],                                                              note: 'Self-study' },
  { name: 'Cloudflare',   img: 'cloudflare/cloudflare-original.svg',                          projects: ['Virtual Counselor', 'Gudino Woodworking'] },
  { name: 'Haskell',      img: 'haskell/haskell-original.svg',                                projects: [],                                                              note: 'Coursework' },
  { name: 'N8N',          img: null,                                                           projects: ['Virtual Counselor'] },
  { name: 'Twilio',       img: 'twilio/twilio-original.svg',                                   projects: ['Gudino Woodworking'] },
  { name: 'ZeptoMail',    img: null,                                                           projects: ['Gudino Woodworking'] },
  { name: 'Web3Forms',    img: null,                                                           projects: ['Portfolio'] },
]

const RADIUS = 168
const FOV    = 560

function fibonacciSphere(n) {
  const pts    = []
  const golden = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2
    const r = Math.sqrt(Math.max(0, 1 - y * y))
    const t = golden * i
    pts.push([Math.cos(t) * r, y, Math.sin(t) * r])
  }
  return pts
}

export default function TechStack() {
  const itemRefs   = useRef([])
  const outerRef   = useRef(null)
  const rotRef     = useRef({ x: 0.3, y: 0 })
  const velRef     = useRef({ x: 0, y: 0 })
  const dragRef    = useRef(null)
  const selRef     = useRef(null)
  const rafRef      = useRef(null)
  const visibleRef  = useRef(false)

  const [selected, setSelected]   = useState(null)
  const [hintVisible, setHintVisible] = useState(true)

  const bases = useMemo(() => fibonacciSphere(TECHS.length), [])

  useEffect(() => { selRef.current = selected }, [selected])

  useEffect(() => {
    if (!outerRef.current) return
    const obs = new IntersectionObserver(
      ([entry]) => { visibleRef.current = entry.isIntersecting },
      { threshold: 0 }
    )
    obs.observe(outerRef.current)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    let last = 0

    const frame = (ts) => {
      rafRef.current = requestAnimationFrame(frame)
      if (!visibleRef.current) return

      const dt = Math.min((ts - last) / 16.67, 3)
      last = ts

      if (!dragRef.current) {
        velRef.current.x *= 0.93
        velRef.current.y *= 0.93
        rotRef.current.x += velRef.current.x
        rotRef.current.y += velRef.current.y
        rotRef.current.y += 0.0025 * dt
      }

      const size   = outerRef.current?.offsetWidth ?? 380
      const dynR   = size * 0.442
      const dynFOV = size * 1.47

      const rx   = rotRef.current.x
      const ry   = rotRef.current.y
      const cosX = Math.cos(rx), sinX = Math.sin(rx)
      const cosY = Math.cos(ry), sinY = Math.sin(ry)
      const sel  = selRef.current

      for (let i = 0; i < TECHS.length; i++) {
        const el = itemRefs.current[i]
        if (!el) continue

        const [bx, by, bz] = bases[i]
        const x1 =  bx * cosY + bz * sinY
        const z1 = -bx * sinY + bz * cosY
        const y2 =  by * cosX - z1 * sinX
        const z2 =  by * sinX + z1 * cosX

        const proj  = dynFOV / (dynFOV + z2 * dynR)
        const px    = x1 * dynR * proj
        const py    = y2 * dynR * proj
        const depth = (z2 + 1) / 2

        const isSel = sel === TECHS[i].name
        let opacity, sc

        if (!sel) {
          opacity = 0.28 + depth * 0.72
          sc      = (0.62 + depth * 0.38) * proj
        } else if (isSel) {
          opacity = 1
          sc      = (0.62 + depth * 0.38) * proj * 1.18
        } else {
          opacity = 0.06 + depth * 0.14
          sc      = (0.62 + depth * 0.38) * proj * 0.88
        }

        el.style.transform = `translate(calc(-50% + ${px}px), calc(-50% + ${py}px)) scale(${sc})`
        el.style.opacity   = opacity.toFixed(3)
        el.style.zIndex    = Math.round(depth * 100) + (isSel ? 200 : 0)
      }

    }

    rafRef.current = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(rafRef.current)
  }, [bases])

  useEffect(() => {
    const onMove = (e) => {
      if (!dragRef.current) return
      const dx = e.clientX - dragRef.current.x
      const dy = e.clientY - dragRef.current.y
      dragRef.current = { x: e.clientX, y: e.clientY }
      rotRef.current.y += dx * 0.005
      rotRef.current.x += dy * 0.005
      velRef.current.y  = dx * 0.005
      velRef.current.x  = dy * 0.005
    }
    const onUp = () => { dragRef.current = null; uiState.sphereDragging = false }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup',   onUp)
    window.addEventListener('pointercancel', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup',   onUp)
      window.removeEventListener('pointercancel', onUp)
      uiState.sphereDragging = false
    }
  }, [])

  const selTech = TECHS.find(t => t.name === selected)

  return (
    <section id="techstack" className="relative py-20 sm:py-28 px-5 sm:px-6 overflow-hidden">
      <div className="absolute inset-0 bg-zinc-950" />
      <NeuralBrainBg />
      <div className="absolute inset-0 bg-radial-fade pointer-events-none" />

      <div className="relative max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <p className="section-label justify-center flex">// tech stack</p>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-zinc-100">
            TECH <span className="gradient-text">STACK</span>
          </h2>
          <p className="text-zinc-500 text-sm mt-3">
            <span className="hidden sm:inline">Drag</span>
            <span className="sm:hidden">Swipe</span>
            {' '}to rotate &middot;{' '}
            <span className="hidden sm:inline">click</span>
            <span className="sm:hidden">tap</span>
            {' '}a tech to see where it&apos;s used
          </p>
        </div>

        <div
          ref={outerRef}
          role="region"
          aria-label="Interactive 3D tech stack sphere. Drag to rotate, click a technology to see which projects use it."
          className="relative mx-auto w-full max-w-[380px] select-none cursor-grab active:cursor-grabbing"
          style={{ aspectRatio: '1 / 1' }}
          onPointerDown={(e) => {
            dragRef.current = { x: e.clientX, y: e.clientY }
            velRef.current  = { x: 0, y: 0 }
            uiState.sphereDragging = true
            setHintVisible(false)
          }}
        >
          <div
            className="absolute inset-0"
            onClick={() => setSelected(null)}
          />

          {/* Mobile swipe hint — fades out after first touch */}
          {hintVisible && (
            <div className="absolute inset-0 flex items-end justify-center pb-4 pointer-events-none sm:hidden z-20">
              <div className="flex flex-col items-center gap-1.5 animate-pulse">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-zinc-500">
                  <path d="M9 3h6M12 3v4M8 7c-2 1-3 3-3 5v4a4 4 0 008 0v-3M16 9v7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 13h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <span className="font-mono text-[10px] text-zinc-400">swipe to rotate</span>
              </div>
            </div>
          )}
          {TECHS.map((tech, i) => (
            <div
              key={tech.name}
              ref={el => { itemRefs.current[i] = el }}
              className="absolute"
              style={{ top: '50%', left: '50%', willChange: 'transform, opacity' }}
              onClick={(e) => {
                e.stopPropagation()
                setSelected(prev => prev === tech.name ? null : tech.name)
              }}
            >
              <div
                role="button"
                aria-pressed={selected === tech.name}
                aria-label={tech.name}
                title={tech.projects?.length ? `${tech.name}: used in ${tech.projects.join(', ')}` : tech.note ? `${tech.name}: ${tech.note}` : tech.name}
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelected(prev => prev === tech.name ? null : tech.name) } }}
                className={`
                flex flex-col items-center gap-1 px-2.5 py-2 rounded-xl border cursor-pointer
                transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-wsu-400
                ${selected === tech.name
                  ? 'border-wsu-500/70 bg-wsu-500/10 shadow-[0_0_18px_rgba(220,18,48,0.45)]'
                  : 'border-zinc-800 bg-zinc-900/90 hover:border-zinc-600'
                }
              `}>
                <div className="w-9 h-9 flex items-center justify-center">
                  {tech.img ? (
                    <img
                      src={`${CDN}/${tech.img}`}
                      alt={tech.name}
                      className={`w-8 h-8 object-contain ${tech.invert ? 'invert opacity-80' : ''}`}
                      loading="lazy"
                      draggable={false}
                    />
                  ) : (
                    <span className="text-[10px] font-mono font-bold text-zinc-400 text-center leading-tight">{tech.name}</span>
                  )}
                </div>
                <span className={`text-[10px] font-mono text-center leading-tight whitespace-nowrap
                  ${selected === tech.name ? 'text-wsu-400' : 'text-zinc-400'}`}>
                  {tech.name}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="min-h-[56px] flex flex-col items-center justify-center mt-1">
          {selTech ? (
            <div className="text-center">
              <p className="font-mono text-xs text-zinc-500 mb-2.5">
                <span className="text-wsu-400">{selTech.name}</span> used in
              </p>
              {selTech.projects.length > 0 ? (
                <div className="flex flex-wrap justify-center gap-2">
                  {selTech.projects.map(p => (
                    <span
                      key={p}
                      className="px-3 py-1 rounded-lg border border-wsu-500/35 bg-wsu-500/8 text-xs font-mono text-zinc-300"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="px-3 py-1 rounded-lg border border-zinc-700 bg-zinc-800/60 text-xs font-mono text-zinc-400">
                  {selTech.note ?? 'Personal use'}
                </span>
              )}
            </div>
          ) : (
            <p className="text-xs font-mono text-zinc-500">click any tech to explore</p>
          )}
        </div>
      </div>
    </section>
  )
}

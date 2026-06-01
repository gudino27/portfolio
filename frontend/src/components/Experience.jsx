import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import useInView from '../hooks/useInView'

const entries = [
  {
    role: 'IT Infrastructure Manager',
    org: 'Master Build Cabinets LLC',
    year: '2019',
    yearSub: '2019 – 2025',
    category: 'Part-time · IT',
    desc: 'Maintained internal IT systems, networking, and workstations. Built foundational DevOps practices that informed later infrastructure work at Gudino Custom Woodworking.',
  },
  {
    role: 'Student Event Supervisor',
    org: 'WSU Catering',
    year: '2022',
    yearSub: '2022 – Present',
    category: 'Part-time · Leadership',
    desc: 'Supervises catering operations for WSU events. Develops leadership, logistics coordination, and operational communication skills alongside the CS program.',
  },
  {
    role: 'Applied ML Researcher',
    org: 'WSU CPT S 440: AI Research',
    year: '2025',
    yearSub: 'Spring 2025',
    category: 'Academic · Research',
    desc: 'Built a RAG pipeline for WSU academic advising using FAISS + sentence-transformers + Nvidia Reranker. Achieved 81.67% accuracy across 120 domain test cases vs 30.83% without retrieval.current work being done on publishing a paper on the results, with continued growth on the project.',
  },
  {
    role: 'IT Supervisor & Full-Stack Developer',
    org: 'Gudino Custom Woodworking LLC',
    year: 'NOW',
    yearSub: '2025 – Present',
    category: 'Part-time · Software',
    desc: 'Architected the full gudinocustom.com platform: Three.js virtual showroom, 3D kitchen/bathroom designer with AR export, native Swift iOS admin app with Face ID + APNs, and a zero-downtime blue-green deployment pipeline on self-hosted Linux with Cloudflare Tunnels.',
  },
]

const n = entries.length

export default function Experience() {
  const [ref, inView] = useInView()
  const inViewRef = useRef(false)
  const timelineRef = useRef(null)
  const lineRef = useRef(null)
  const rowRefs = useRef([])
  const [activeIdx, setActiveIdx] = useState(0)

  useEffect(() => { inViewRef.current = inView }, [inView])

  useEffect(() => {
    const update = () => {
      if (!timelineRef.current || !lineRef.current) return
      const { top, height } = timelineRef.current.getBoundingClientRect()
      const focus = window.innerHeight * 0.55

      // Continuous 0-1 progress: 0 = section top at focus, 1 = section bottom at focus
      const progress = Math.max(0, Math.min(1, (focus - top) / height))

      // Line height as % of container: set directly, no CSS transition
      lineRef.current.style.height = `${progress * 100}%`

      // Each entry opacity driven directly by distance below the line tip
      rowRefs.current.forEach((el, i) => {
        if (!el) return
        const entryPos = (i + 0.5) / n
        const distBelow = Math.max(0, entryPos - progress)
        const opacity = inViewRef.current ? Math.max(0.08, 1 - distBelow * 2.4) : 0
        el.style.opacity = opacity
      })

      // Discrete active index for text/card color transitions
      const next = Math.min(n - 1, Math.max(0, Math.floor(progress * n)))
      setActiveIdx(next)
    }

    window.addEventListener('scroll', update, { passive: true })
    update()
    return () => window.removeEventListener('scroll', update)
  }, [])

  // Re-run update when inView flips on so initial opacities apply
  useEffect(() => {
    if (!inView) return
    window.dispatchEvent(new Event('scroll'))
  }, [inView])

  return (
    <section id="experience" className="relative py-20 sm:py-28 px-5 sm:px-6 overflow-hidden">
      <div className="absolute inset-0 bg-zinc-950" />
      <div className="absolute top-0 left-1/4 w-[600px] h-[400px] bg-wsu-600/[0.07] rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[300px] bg-violet-700/[0.06] rounded-full blur-[90px] pointer-events-none" />

      <div className="relative max-w-5xl mx-auto" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16 sm:mb-20"
        >
          <p className="section-label">// career</p>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            My career &amp;{' '}
            <span className="gradient-text">experience</span>
          </h2>
        </motion.div>

        <div className="relative" ref={timelineRef}>
          {/* Timeline: track + growing line + dot at tip */}
          <div
            className="absolute left-1/2 -translate-x-1/2 top-0 hidden md:block"
            style={{ width: 1, height: '100%' }}
          >
            {/* Background track */}
            <div className="absolute inset-0 bg-zinc-800/40" />
            {/* Growing crimson fill: height set directly from scroll, no CSS transition */}
            <div
              ref={lineRef}
              className="absolute top-0 left-0 w-full"
              style={{
                height: '0%',
                background: 'linear-gradient(to bottom, rgba(220,18,48,0.9), rgba(220,18,48,0.6))',
                boxShadow: '0 0 6px rgba(220,18,48,0.35)',
              }}
            >
              {/* Dot lives at bottom of the line: moves with it for free */}
              <div
                className="absolute left-1/2"
                style={{
                  bottom: -7,
                  transform: 'translateX(-50%)',
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle at 40% 35%, #ff3358, #DC1230)',
                  boxShadow: '0 0 14px rgba(220,18,48,0.95), 0 0 30px rgba(220,18,48,0.5)',
                  zIndex: 10,
                }}
              />
            </div>
          </div>

          <div className="space-y-14 sm:space-y-20">
            {entries.map(({ role, org, year, yearSub, category, desc }, i) => {
              const isActive = i === activeIdx
              const isPast = i < activeIdx

              return (
                <div
                  key={role}
                  ref={el => rowRefs.current[i] = el}
                  style={{ opacity: 0 }}
                >
                  <motion.div
                    initial={{ y: 20 }}
                    animate={inView ? { y: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.1 + i * 0.1 }}
                    className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 md:gap-8 items-start"
                  >
                    {/* Left */}
                    <div className="md:text-right">
                      <h3 className={`font-bold text-base sm:text-lg leading-snug transition-colors duration-700 ${isActive ? 'text-zinc-100' : 'text-zinc-300'}`}>
                        {role}
                      </h3>
                      <p className={`text-sm mt-0.5 transition-colors duration-700 ${isActive ? 'text-zinc-400' : 'text-zinc-500'}`}>{org}</p>
                      <p className="text-zinc-600 text-xs mt-1 font-mono">{category}</p>
                    </div>

                    {/* Center year */}
                    <div className="flex flex-col items-center gap-1 min-w-[80px]">
                      <span
                        className={`font-mono font-black text-xl sm:text-2xl tracking-tight transition-all duration-700 ${
                          isActive ? 'text-wsu-400' : isPast ? 'text-zinc-400' : 'text-zinc-600'
                        }`}
                        style={isActive ? { textShadow: '0 0 20px rgba(220,18,48,0.55)' } : {}}
                      >
                        {year}
                      </span>
                      <span className="text-zinc-600 text-[10px] font-mono whitespace-nowrap">{yearSub}</span>
                      {/* Small static marker dot so the center col has consistent height */}
                      <div className="w-2 h-2 rounded-full mt-1 hidden md:block bg-zinc-800 border border-zinc-700" />
                    </div>

                    {/* Right */}
                    <div
                      className={`rounded-xl transition-all duration-700 ${
                        isActive
                          ? 'bg-wsu-500/[0.05] border border-wsu-500/20 p-4 shadow-[0_0_30px_-10px_rgba(220,18,48,0.22)]'
                          : 'p-0'
                      }`}
                    >
                      <p className={`text-sm leading-relaxed transition-colors duration-700 ${isActive ? 'text-zinc-300' : 'text-zinc-500'}`}>
                        {desc}
                      </p>
                    </div>
                  </motion.div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

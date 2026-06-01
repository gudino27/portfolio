import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import useInView from '../hooks/useInView'
import {
  ExternalLink, Github, Box, Brain, Cpu, Code2, Network, Zap,
  Briefcase, GraduationCap, Award,
} from 'lucide-react'

const accentLine = {
  cyan:    'from-wsu-500 to-wsu-400',
  violet:  'from-violet-500 via-fuchsia-500 to-violet-400',
  emerald: 'from-emerald-500 to-emerald-400',
  amber:   'from-amber-500 to-amber-400',
}
const accentGlow = {
  cyan:    'hover:shadow-[0_0_50px_-10px_rgba(220,18,48,0.30)] hover:border-wsu-500/40',
  violet:  'hover:shadow-[0_0_50px_-10px_rgba(139,92,246,0.30)] hover:border-violet-500/40',
  emerald: 'hover:shadow-[0_0_50px_-10px_rgba(16,185,129,0.30)] hover:border-emerald-500/40',
  amber:   'hover:shadow-[0_0_50px_-10px_rgba(245,158,11,0.30)] hover:border-amber-500/40',
}
const accentIcon = {
  cyan:    'bg-wsu-500/10 border-wsu-500/20 text-wsu-400',
  violet:  'bg-violet-500/10 border-violet-500/20 text-violet-400',
  emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  amber:   'bg-amber-500/10 border-amber-500/20 text-amber-400',
}
const accentStudy = {
  cyan:    'text-wsu-400 border-wsu-500/20 hover:border-wsu-500/50 hover:bg-wsu-500/5',
  violet:  'text-violet-400 border-violet-500/20 hover:border-violet-500/50 hover:bg-violet-500/5',
  emerald: 'text-emerald-400 border-emerald-500/20 hover:border-emerald-500/50 hover:bg-emerald-500/5',
  amber:   'text-amber-400 border-amber-500/20 hover:border-amber-500/50 hover:bg-amber-500/5',
}
const accentText = {
  cyan:    'text-wsu-400',
  violet:  'text-violet-400',
  emerald: 'text-emerald-400',
  amber:   'text-amber-400',
}
const accentDot = {
  cyan:    'bg-wsu-400 border-wsu-600 shadow-[0_0_10px_rgba(220,18,48,0.6)]',
  violet:  'bg-violet-400 border-violet-600 shadow-[0_0_10px_rgba(139,92,246,0.6)]',
  emerald: 'bg-emerald-400 border-emerald-600 shadow-[0_0_10px_rgba(16,185,129,0.6)]',
  amber:   'bg-amber-400 border-amber-600 shadow-[0_0_10px_rgba(245,158,11,0.6)]',
}

const timeline = [
 
  {
    type: 'education',
    year: '2022',
    span: 'Aug 2022',
    title: 'B.S. Computer Science',
    org: 'Washington State University',
    tag: 'Expected Dec 2026',
    icon: GraduationCap,
  },
  
  
  {
    type: 'project',
    year: '2024-2026',
    span: 'Spring 2024',
    title: 'Virtual Counselor',
    desc: 'AI academic planning for WSU students. RAG over WSU course catalogs with structured BFS prerequisite traversal. 81.67% accuracy across 120 domain test cases vs 30.83% without retrieval.',
    stack: ['React', 'Express', 'N8N', 'SQLite', 'Docker', 'FAISS', 'Claude API', 'Cloudflare'],
    live: 'https://virtual-counselor.org',
    github: 'https://github.com/gudino27/virtual-counselor_2.0',
    icon: Brain,
    accent: 'cyan',
    badge: '81.67% RAG',
    badgeColor: 'text-wsu-400 bg-wsu-400/10 border-wsu-400/20',
    metrics: [
      { label: 'RAG Accuracy', value: '81.67%' },
      { label: 'Baseline', value: '30.83%' },
      { label: 'Test Cases', value: '120' },
    ],
    caseStudyKey: 'counselor',
  },
  {
    type: 'project',
    year: '2024-present',
    span: '2024 - Now',
    title: 'Gudino Custom Woodworking',
    desc: 'Full business operations platform for a family cabinet company. Three.js virtual showroom, interactive 3D kitchen and bathroom designer with AR export, native Swift iOS admin app (Face ID, APNs), and a zero-downtime blue-green deployment pipeline.',
    stack: ['React', 'Three.js', 'React Three Fiber', 'Swift', 'UIKit', 'APNs', 'Express', 'SQLite', 'Twilio', 'ZeptoMail', 'Docker Buildx Bake', 'Cloudflare'],
    live: 'https://gudinocustom.com',
    github: 'https://github.com/gudino27/GudinoCustom',
    icon: Box,
    accent: 'violet',
    badge: 'Live',
    badgeColor: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    featured: true,
    caseStudyKey: 'showroom',
  },
  {
    type: 'project',
    year: '2025',
    span: '2025',
    title: 'CougarPark',
    desc: 'ML parking prediction for WSU campus. LightGBM occupancy (MAE 0.18, R² 0.99) and XGBoost enforcement risk (ROC-AUC 0.92) trained on a 12GB dataset from WSU Transportation.',
    stack: ['Python', 'LightGBM', 'XGBoost', 'Flask', 'React', 'Leaflet', 'pandas', 'scikit-learn'],
    live: 'https://gudino27.github.io/CougarPark/',
    github: 'https://github.com/gudino27/CougarPark',
    icon: Cpu,
    accent: 'emerald',
    badge: 'ML',
    badgeColor: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    metrics: [
      { label: 'R²', value: '0.99' },
      { label: 'MAE', value: '0.18' },
      { label: 'ROC-AUC', value: '0.92' },
    ],
    caseStudyKey: 'cougarpark',
  },
  
  {
    type: 'coursework',
    year: '2025',
    span: 'Fall 2025',
    title: 'PostScript Interpreter',
    org: 'CPT S 355',
    icon: Code2,
    stack: ['Go', 'Lexer', 'Evaluator', 'Lexical Scoping', 'Fuzz Testing'],
    desc: 'Full PostScript interpreter in Go with dual stack runtime and lexical/dynamic scoping toggle. Written in Go for +5 extra credit.',
    privateRepo: true,
  },
  {
    type: 'education',
    year: '2025',
    span: 'Dec 2025',
    title: 'AWS Cloud Practitioner',
    desc:'Earners of this certification have a fundamental understanding of IT services and their uses in the AWS Cloud. They demonstrated cloud fluency and foundational AWS knowledge. Badge owners are able to identify essential AWS services necessary to set up AWS-focused projects.',
    org: 'Amazon Web Services',
    icon: Award,
    accent: 'amber',
    badge: 'AWS Certified',
    badgeColor: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    tag: 'Certified',
    link: 'https://cp.certmetrics.com/amazon/en/public/verify/credential/e1e429c95b7542fda23e01c4ecee6303',
  },
  {
    type: 'coursework',
    year: '2025',
    span: 'Fall 2025',
    title: 'Socket P2P Network',
    org: 'CPT S 455',
    icon: Network,
    stack: ['Java', 'UDP Sockets', 'P2P', 'UPnP', 'NAT Traversal', 'JUnit'],
    github: 'https://github.com/gudino27/455_Project',
    desc: 'Dual-mode Java networking with LAN broadcast discovery and NAT traversal with UPnP port mapping.',
  },
  {
    type: 'project',
    year: '2026',
    span: '2026',
    title: 'Brain MCP',
    desc: "JARVIS-style 3D neural network visualizer for Claude's live thought process. MCP server with 6 tools feeds a real-time 3D force-graph rendered in Three.js: golden sphere, amber glow, 18 node types.",
    stack: ['Node.js', 'TypeScript', 'Three.js', 'WebSocket', 'Express', 'MCP', 'Claude Code Hooks'],
    live: null,
    github: 'https://github.com/gudino27/brain-mcp',
    icon: Zap,
    accent: 'amber',
    badge: 'AI Tooling',
    badgeColor: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    caseStudyKey: 'brainmcp',
  },  
  {
    type: 'project',
    year: '2026',
    span: '2026 - Now',
    title: 'Portfolio Website',
    desc: 'This site. Quantum cipher hero animation, interactive 3D tech sphere, live GitHub commit feed, multi-window neural brain battle, and a Web3Forms contact pipeline, all self-hosted on Linux via Docker and Cloudflare.',
    stack: ['React', 'Vite', 'Three.js', 'Tailwind', 'Web3Forms', 'Cloudflare', 'Docker'],
    live: '/',
    github: 'https://github.com/gudino27/portfoliowebsite',
    icon: Code2,
    accent: 'cyan',
    badge: 'This Site',
    badgeColor: 'text-wsu-400 bg-wsu-400/10 border-wsu-400/20',
    caseStudyKey: null,
  },
]

function ProjectNode({ node, onCaseStudy }) {
  const { title, desc, stack, github, live, icon: Icon, accent, badge, badgeColor, featured, caseStudyKey, metrics } = node
  return (
    <div className={`group relative flex flex-col bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden transition-all duration-300 ${accentGlow[accent]}`}>
      <div className={`h-[2px] w-full bg-gradient-to-r ${accentLine[accent]} opacity-50 group-hover:opacity-100 transition-opacity duration-300`} />
      {featured && (
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/[0.04] to-transparent pointer-events-none" />
      )}
      <div className="relative flex flex-col flex-1 p-5">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${accentIcon[accent]}`}>
            <Icon size={16} />
          </div>
          <div className="flex flex-col items-end gap-1">
            {featured && (
              <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">Featured</span>
            )}
            <span className={`text-xs font-mono font-semibold px-2 py-0.5 rounded-md border ${badgeColor}`}>
              {badge}
            </span>
          </div>
        </div>
        <h3 className="font-bold text-zinc-100 text-base mb-2 leading-snug">{title}</h3>
        {metrics && (
          <div className="flex gap-4 mb-3 pb-3 border-b border-zinc-800/60">
            {metrics.map(m => (
              <div key={m.label}>
                <div className={`font-mono text-sm font-bold ${accentText[accent]}`}>{m.value}</div>
                <div className="font-mono text-[9px] text-zinc-600 uppercase tracking-wider">{m.label}</div>
              </div>
            ))}
          </div>
        )}
        <p className="text-zinc-400 text-sm leading-relaxed flex-1 mb-4">{desc}</p>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {stack.map((t) => <span key={t} className="tag text-[11px]">{t}</span>)}
        </div>
        <div className="flex items-center gap-4 pt-3 border-t border-zinc-800/70">
          {github && (
            <a href={github} target="_blank" rel="noopener noreferrer"
               className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-200 text-sm transition-colors">
              <Github size={14} /> GitHub
            </a>
          )}
          {live && (
            <a href={live} target="_blank" rel="noopener noreferrer"
               className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-200 text-sm transition-colors">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <ExternalLink size={13} /> Live
            </a>
          )}
          {caseStudyKey && (
            <button
              onClick={() => onCaseStudy(caseStudyKey)}
              className={`ml-auto font-mono text-[11px] px-2.5 py-1 rounded-lg border transition-all duration-200 ${accentStudy[accent]}`}
            >
              case study →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function ContextNode({ node }) {
  const { type, title, org, tag, desc, icon: Icon, stack, github, privateRepo , link} = node
  const isEdu = type === 'education'
  return (
    <div className={`group bg-zinc-900/60 border rounded-xl p-4 hover:bg-zinc-900 transition-all duration-200 ${
      isEdu ? 'border-amber-500/20 hover:border-amber-500/30' : 'border-zinc-800 hover:border-zinc-700'
    }`}>
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${
          isEdu
            ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
            : 'bg-zinc-800 border-zinc-700 text-zinc-500'
        }`}>
          <Icon size={14} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-zinc-200 text-sm leading-snug">{title}</h3>
          {org && <p className="text-zinc-500 text-xs mt-0.5">{org}</p>}
          {tag && <p className="font-mono text-[10px] text-zinc-600 mt-1">{tag}</p>}
        </div>
        {github && (
          <a href={github} target="_blank" rel="noopener noreferrer"
             aria-label={`View ${title} on GitHub`}
             className="text-zinc-700 hover:text-zinc-400 transition-colors shrink-0">
            <Github size={13} />
          </a>
        )}
        {!github && privateRepo && (
          <span className="font-mono text-[10px] text-zinc-700 border border-zinc-800 px-1.5 py-0.5 rounded shrink-0">
            private
          </span>
        )}
      </div>
      {desc && <p className="text-zinc-500 text-xs leading-relaxed mt-3">{desc}</p>}
      {stack && (
        <div className="flex flex-wrap gap-1 mt-3">
          {stack.map((t) => <span key={t} className="tag text-[10px]">{t}</span>)}
        </div>
      )}
      {link && (
        <a href={link} target="_blank" rel="noopener noreferrer"
           className="inline-flex items-center gap-1 font-mono text-[11px] text-amber-400 hover:text-amber-300 mt-3 transition-colors">
          <ExternalLink size={11} /> View Credential
        </a>
      )}
    </div>
  )
}

export default function Projects({ onCaseStudy }) {
  const [ref, inView] = useInView()
  const inViewRef   = useRef(false)
  const timelineRef = useRef(null)
  const lineRef     = useRef(null)
  const mobileLineRef = useRef(null)

  useEffect(() => { inViewRef.current = inView }, [inView])

  useEffect(() => {
    const update = () => {
      if (!timelineRef.current) return
      const { top, height } = timelineRef.current.getBoundingClientRect()
      const focus    = window.innerHeight * 0.55
      const progress = Math.max(0, Math.min(1, (focus - top) / height))
      if (lineRef.current)       lineRef.current.style.height       = `${progress * 100}%`
      if (mobileLineRef.current) mobileLineRef.current.style.height = `${progress * 100}%`
    }
    window.addEventListener('scroll', update, { passive: true })
    update()
    return () => window.removeEventListener('scroll', update)
  }, [])

  useEffect(() => {
    if (!inView) return
    window.dispatchEvent(new Event('scroll'))
  }, [inView])

  return (
    <section id="projects" className="py-20 sm:py-24 px-5 sm:px-6">
      <div className="max-w-6xl mx-auto" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-12 sm:mb-16"
        >
          <p className="section-label">// projects</p>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-3">
            My <span className="gradient-text">Work</span>
          </h2>
          <p className="text-zinc-500 text-sm">
            Production systems, AI research, ML tooling, and developer tools. All self-hosted and shipped.
          </p>
        </motion.div>

        <div className="relative" ref={timelineRef}>
          {/* Desktop center spine */}
          <div
            className="absolute left-1/2 top-0 bottom-0 hidden md:block pointer-events-none"
            style={{ width: 1, transform: 'translateX(-50%)' }}
          >
            <div className="absolute inset-0 bg-zinc-800/40" />
            <div
              ref={lineRef}
              className="absolute top-0 left-0 w-full"
              style={{
                height: '0%',
                background: 'linear-gradient(to bottom, rgba(220,18,48,0.9), rgba(220,18,48,0.6))',
                boxShadow: '0 0 6px rgba(220,18,48,0.35)',
              }}
            >
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

          {/* Mobile left spine */}
          <div
            className="absolute left-3 top-0 bottom-0 md:hidden pointer-events-none"
            style={{ width: 1, transform: 'translateX(-50%)' }}
          >
            <div className="absolute inset-0 bg-zinc-800/40" />
            <div
              ref={mobileLineRef}
              className="absolute top-0 left-0 w-full"
              style={{
                height: '0%',
                background: 'linear-gradient(to bottom, rgba(220,18,48,0.9), rgba(220,18,48,0.6))',
                boxShadow: '0 0 6px rgba(220,18,48,0.35)',
              }}
            >
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

          <div className="space-y-8 sm:space-y-10">
            {timeline.map((node, i) => {
              const isLeft = i % 2 === 0
              const dotCls = node.type === 'project'
                ? accentDot[node.accent]
                : node.type === 'education'
                ? 'bg-amber-400/80 border-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.45)]'
                : 'bg-zinc-700 border-zinc-600'

              const NodeContent = node.type === 'project'
                ? <ProjectNode node={node} onCaseStudy={onCaseStudy} />
                : <ContextNode node={node} />

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 18 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.45, delay: 0.04 + i * 0.05 }}
                  className="relative"
                >
                  {/* Mobile */}
                  <div className="md:hidden pl-9">
                    <div className={`absolute left-3 top-5 -translate-x-1/2 w-3 h-3 rounded-full border-2 z-10 ${dotCls}`} />
                    <p className="font-mono text-[10px] text-zinc-600 mb-1.5">{node.span}</p>
                    {NodeContent}
                  </div>

                  {/* Desktop */}
                  <div className="hidden md:grid md:grid-cols-2">
                    <div className="pr-10">
                      {isLeft && NodeContent}
                    </div>
                    <div className="pl-10">
                      {!isLeft && NodeContent}
                    </div>
                  </div>

                  {/* Desktop center dot + year */}
                  <div className="absolute left-1/2 top-5 hidden md:flex flex-col items-center z-10 pointer-events-none"
                       style={{ transform: 'translateX(-50%)' }}>
                    <div className={`w-3 h-3 rounded-full border-2 ${dotCls}`} />
                    <span className="font-mono text-[9px] text-zinc-600 mt-1.5 whitespace-nowrap">{node.year}</span>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

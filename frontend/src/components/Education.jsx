import { motion } from 'framer-motion'
import useInView from '../hooks/useInView'
import { GraduationCap, Award } from 'lucide-react'

const completed = [
  'CPT S 260: Computer Architecture',
  'CPT S 315: Data Mining',
  'CPT S 317: Automata & Formal Languages',
  'CPT S 322: Software Engineering I',
  'CPT S 327: Cybersecurity & Cryptography',
  'CPT S 350: Design & Analysis of Algorithms',
  'CPT S 355: Programming Language Design',
  'CPT S 360: Systems Programming',
  'CPT S 411: Parallel Computing',
  'CPT S 421: Software Design Project I',
  'CPT S 437: Intro to Machine Learning',
  'CPT S 440: Artificial Intelligence',
  'CPT S 455: Computer Networks & Security',
  'CPT S 489: Web Development',
]

const inProgress = [
  'CPT S 302: Pro Skills for Computing Engineers',
  'CPT S 415: Big Data',
  'CPT S 423: Software Design Project II',
  'CPT S 451: Database Systems',
  'CPT S 453: Graph Theory',
]

export default function Education() {
  const [ref, inView] = useInView()

  return (
    <section id="education" className="py-20 sm:py-24 px-5 sm:px-6 bg-zinc-900/30">
      <div className="max-w-6xl mx-auto" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <p className="section-label">// education</p>
          <h2 className="section-heading mb-8 sm:mb-12">Academic background</h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Left: degree + coursework */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="card"
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="w-10 h-10 rounded-lg bg-wsu-500/10 border border-wsu-500/20 flex items-center justify-center shrink-0">
                <GraduationCap size={20} className="text-wsu-400" />
              </div>
              <div>
                <h3 className="font-semibold text-zinc-100">B.S. Computer Science</h3>
                <div className="text-zinc-400 text-sm mt-0.5">Washington State University</div>
                <div className="text-zinc-500 text-xs font-mono mt-1">Aug 2022 · Dec 2026</div>
              </div>
            </div>

            <div className="mb-5">
              <p className="text-xs font-mono text-zinc-600 uppercase tracking-widest mb-3">Completed</p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
                {completed.map((c) => (
                  <li key={c} className="flex gap-2 text-zinc-400 text-xs">
                    <span className="text-zinc-700 mt-0.5 shrink-0">›</span>
                    {c}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-xs font-mono text-zinc-600 uppercase tracking-widest mb-3">In Progress · Fall 2026</p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
                {inProgress.map((c) => (
                  <li key={c} className="flex gap-2 text-zinc-500 text-xs">
                    <span className="text-zinc-800 mt-0.5 shrink-0">›</span>
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Right: cert + highlights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-5"
          >
            <div className="card">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                  <Award size={20} className="text-amber-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-100">AWS Certified Cloud Practitioner</h3>
                  <div className="text-zinc-400 text-sm mt-0.5">Amazon Web Services</div>
                  <div className="text-zinc-500 text-xs font-mono mt-1">Certified December 2025</div>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="font-semibold text-zinc-200 mb-4">Systems Highlights</h3>
              <ul className="space-y-3">
                {[
                  {
                    title: 'MPI Parallel Algorithms',
                    body: 'CPT S 411: MPI ping-pong benchmarking, parallel PageRank, parallel sorting, and matrix operations across distributed processes.',
                  },
                  {
                    title: 'PostScript Interpreter in Go',
                    body: 'CPT S 355: Built a full PostScript interpreter in Go with dual operand/dictionary stack and dynamic/lexical scoping toggle. Chosen for +5 extra credit.',
                  },
                  {
                    title: 'Socket-based P2P Networking',
                    body: 'CPT S 455: LAN broadcast discovery and P2P mode with NAT detection, UPnP port mapping, and relay fallback. Full JUnit test pyramid.',
                  },
                  {
                    title: 'web development',
                    body:'CPTS 489: learned basics of HTML, CSS,JS. used foundations for class project to extend into a react website which has now become gudinocustom.com, my personal portfolio and playground for web experiments.',

                  },
                  {
                    title: 'Self-hosted Production Infrastructure',
                    body: 'Three live systems on self-hosted Linux via Docker Buildx Bake, Cloudflare Tunnels, and systemd for zero-downtime container startup.',
                  },
                ].map((h) => (
                  <li key={h.title} className="pl-3 border-l-2 border-zinc-800">
                    <div className="text-zinc-300 text-sm font-medium">{h.title}</div>
                    <div className="text-zinc-500 text-xs mt-0.5 leading-relaxed">{h.body}</div>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

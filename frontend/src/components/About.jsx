import { motion } from 'framer-motion'
import useInView from '../hooks/useInView'
import { MapPin, GraduationCap, Smartphone, Globe } from 'lucide-react'

const highlights = [
  { icon: GraduationCap, label: 'B.S. Computer Science', sub: 'WSU · Graduating Dec 2026' },
  { icon: MapPin,        label: 'Pullman, WA',           sub: 'Self-hosted infrastructure of projects' },
  { icon: Smartphone,   label: 'Web + iOS',              sub: 'React, Three.js, Swift, UIKit' },
  { icon: Globe,        label: 'Bilingual',              sub: 'English and Spanish' },
]

export default function About() {
  const [ref, inView] = useInView()

  return (
    <section id="about" className="py-20 sm:py-24 px-5 sm:px-6">
      <div className="max-w-6xl mx-auto" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <p className="section-label">// about</p>
          <h2 className="section-heading mb-8 sm:mb-12">Who I am</h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-10 sm:gap-12 items-start">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="space-y-5 text-zinc-400 leading-relaxed"
          >
            <p>
              I am a first generation computer science student at Washington State University, graduating December 2026.
              I have built real deployed systems, that have evolved beyond just class projects to real-world applications. My work ranges from 3D web
              experiences with Three.js and full stack applications to native iOS apps with Face ID and push notifications.
            </p>
            <p>
              On the web side I have focused on full-stack React applications, interactive 3D interfaces,
              and the DevOps scaffolding that keeps them running: Docker, Cloudflare Tunnels,
              blue-green deployments, and zero-downtime pipelines. On the mobile side I build
              native Swift apps with UIKit, APNs, and biometric authentication.
            </p>
            <p>
              I have also done applied ML research through CPT S 440, studying
              retrieval-augmented generation for academic advising. Outside of code, my family
              runs a carpentry business where I serve as their IT and software lead.
            </p>

            <div className="flex flex-wrap gap-2 pt-2">
              {['React', 'Three.js', 'Swift', 'Docker', 'N8N', 'Python', 'SQLite', 'Cloudflare'].map((t) => (
                <span key={t} className="tag">{t}</span>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="grid grid-cols-2 gap-4"
          >
            {highlights.map(({ icon: Icon, label, sub }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.08 }}
                className="card-hover group"
              >
                <div className="w-9 h-9 rounded-lg bg-wsu-500/10 border border-wsu-500/20 flex items-center justify-center mb-3 group-hover:bg-wsu-500/15 transition-colors">
                  <Icon size={17} className="text-wsu-400" />
                </div>
                <div className="font-medium text-zinc-200 text-sm leading-snug">{label}</div>
                <div className="text-zinc-500 text-xs mt-1">{sub}</div>
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.6 }}
              className="col-span-2 card border-zinc-700 bg-zinc-900/50 flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                <span className="text-amber-400 font-bold text-xs font-mono">AWS</span>
              </div>
              <div>
                <div className="font-medium text-zinc-200 text-sm">AWS Certified Cloud Practitioner</div>
                <div className="text-zinc-500 text-xs">Certified December 2025</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

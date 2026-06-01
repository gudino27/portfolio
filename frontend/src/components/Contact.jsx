import { useState } from 'react'
import { motion } from 'framer-motion'
import useInView from '../hooks/useInView'
import { Mail, Github, FileText, ExternalLink, Send, CheckCircle, AlertCircle, Loader } from 'lucide-react'

const links = [
  {
    icon: Mail,
    label: 'Email',
    value: 'jaime.gudino@wsu.edu',
    href: 'mailto:jaime.gudino@wsu.edu',
    desc: 'Best for research & collaboration',
  },
  {
    icon: Github,
    label: 'GitHub',
    value: 'github.com/gudino27',
    href: 'https://github.com/gudino27',
    desc: 'Source code & projects',
  },
  {
    icon: FileText,
    label: 'Resume',
    value: 'View PDF',
    href: '/resume.pdf',
    desc: 'Full work history & credentials',
    external: true,
  },
]

const inputCls = `
  w-full bg-zinc-800/60 border border-zinc-700 rounded-lg px-3.5 py-2.5
  text-sm text-zinc-200 placeholder-zinc-600 outline-none
  focus:border-wsu-500/60 focus:bg-zinc-800 transition-colors
`.trim()

export default function Contact() {
  const [ref, inView] = useInView()
  const [status, setStatus] = useState('idle')

  const onSubmit = async (e) => {
    e.preventDefault()
    setStatus('submitting')
    const fd = new FormData(e.target)
    fd.append('access_key', import.meta.env.VITE_WEB3FORMS)

    try {
      const res  = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.success) {
        setStatus('success')
        e.target.reset()
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <section id="contact" className="py-24 px-6">
      <div className="max-w-5xl mx-auto" ref={ref}>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <p className="section-label justify-center flex">// contact</p>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-zinc-100">
            LET&apos;S <span className="gradient-text">CONNECT</span>
          </h2>
          <p className="text-zinc-400 mt-4 max-w-xl mx-auto leading-relaxed text-sm">
            Open to research collaborations, internship opportunities, and conversations about
            production systems, ML, or interesting engineering problems.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="flex flex-col gap-3"
          >
            {links.map(({ icon: Icon, label, value, href, desc, external }, i) => (
              <motion.a
                key={label}
                href={href}
                target={external ? '_blank' : undefined}
                rel={external ? 'noopener noreferrer' : undefined}
                initial={{ opacity: 0, x: -15 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.2 + i * 0.08 }}
                className="card-hover group flex items-center gap-4 p-5 no-underline"
              >
                <div className="w-11 h-11 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0 group-hover:bg-wsu-500/10 group-hover:border-wsu-500/30 transition-all duration-200">
                  <Icon size={18} className="text-zinc-400 group-hover:text-wsu-400 transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-zinc-200 text-sm flex items-center gap-1.5 mb-0.5">
                    {label}
                    {external && <ExternalLink size={11} className="text-zinc-600" />}
                  </div>
                  <div className="text-sm font-mono truncate" style={{ color: 'var(--wsu-400, #ff3358)' }}>{value}</div>
                  <div className="text-zinc-600 text-xs mt-0.5">{desc}</div>
                </div>
              </motion.a>
            ))}

            <p className="text-zinc-600 text-sm mt-2 pl-1">
              Based in Pullman, WA &middot; Open to remote &amp; hybrid
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="card"
          >
            {status === 'success' ? (
              <div className="flex flex-col items-center justify-center py-12 text-center gap-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                  <CheckCircle size={26} className="text-emerald-400" />
                </div>
                <div>
                  <p className="font-semibold text-zinc-100 mb-1">Message sent!</p>
                  <p className="text-zinc-500 text-sm">I&apos;ll get back to you as soon as possible.</p>
                </div>
                <button
                  onClick={() => setStatus('idle')}
                  className="font-mono text-xs text-zinc-500 hover:text-zinc-300 transition-colors mt-2"
                >
                  Send another
                </button>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="flex flex-col gap-5">
                <input type="hidden" name="botcheck" value="" />
                <input type="hidden" name="subject" value="Portfolio Contact — Hiring Inquiry" />

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-[11px] text-zinc-500 uppercase tracking-wider">Name</label>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="Your name"
                      className={inputCls}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-[11px] text-zinc-500 uppercase tracking-wider">Email</label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="your@email.com"
                      className={inputCls}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[11px] text-zinc-500 uppercase tracking-wider">Message</label>
                  <textarea
                    name="message"
                    required
                    rows={5}
                    placeholder="Tell me about the role, team, or opportunity you have in mind..."
                    className={`${inputCls} resize-none`}
                  />
                </div>

                {status === 'error' && (
                  <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                    <AlertCircle size={13} className="shrink-0" />
                    Something went wrong. Try emailing directly at jaime.gudino@wsu.edu
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="btn-primary justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === 'submitting' ? (
                    <>
                      <Loader size={15} className="animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={15} />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            )}
          </motion.div>

        </div>
      </div>
    </section>
  )
}

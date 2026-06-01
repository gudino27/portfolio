import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, ArrowUpRight } from 'lucide-react'

export default function FloatingResume() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handler = () => setVisible(window.scrollY > 120)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.a
          href="/resume.pdf"
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5
                     bg-zinc-900 border border-zinc-700/70 rounded-xl
                     px-4 py-3 no-underline group shadow-lg
                     hover:border-wsu-500/50 hover:bg-zinc-800 transition-all duration-200"
        >
          <FileText size={15} className="text-zinc-500 group-hover:text-wsu-400 transition-colors shrink-0" />
          <span className="font-mono text-sm text-zinc-400 group-hover:text-zinc-200 transition-colors">
            Resume
          </span>
          <ArrowUpRight size={13} className="text-zinc-600 group-hover:text-wsu-400 transition-colors" />
        </motion.a>
      )}
    </AnimatePresence>
  )
}

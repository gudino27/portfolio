import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ArrowRight, BookOpen, Terminal, FileText, Github, Mail } from 'lucide-react'

const NAV_ITEMS = [
  { id: 'about',      label: 'About' },
  { id: 'research',   label: 'Research' },
  { id: 'projects',   label: 'Projects' },
  { id: 'techstack',  label: 'Tech Stack' },
  { id: 'experience', label: 'Experience' },
  { id: 'education',  label: 'Education' },
  { id: 'contact',    label: 'Contact' },
]

const STUDY_ITEMS = [
  { key: 'showroom',   label: 'Gudino Custom Woodworking' },
  { key: 'counselor',  label: 'Virtual Counselor' },
  { key: 'cougarpark', label: 'CougarPark' },
  { key: 'brainmcp',  label: 'Brain MCP' },
]

export default function CommandPalette({ open, onClose, onTerminal, onCaseStudy }) {
  const [query, setQuery]       = useState('')
  const [activeIdx, setActiveIdx] = useState(0)
  const inputRef = useRef(null)
  const listRef  = useRef(null)

  const allItems = [
    ...NAV_ITEMS.map(s => ({
      group: 'Navigate',
      label: s.label,
      icon:  ArrowRight,
      action() {
        document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth' })
        onClose()
      },
    })),
    ...STUDY_ITEMS.map(s => ({
      group: 'Case Study',
      label: s.label,
      icon:  BookOpen,
      action() { onCaseStudy(s.key); onClose() },
    })),
    {
      group: 'Actions', label: 'Open Terminal', icon: Terminal,
      action() { onTerminal(); onClose() },
    },
    {
      group: 'Actions', label: 'View Resume', icon: FileText,
      action() { window.open('/resume.pdf', '_blank'); onClose() },
    },
    {
      group: 'Actions', label: 'GitHub', icon: Github,
      action() { window.open('https://github.com/gudino27', '_blank'); onClose() },
    },
    {
      group: 'Actions', label: 'Send Email', icon: Mail,
      action() { window.location.href = 'mailto:jaime.gudino@wsu.edu'; onClose() },
    },
  ]

  const q = query.trim().toLowerCase()
  const filtered = q
    ? allItems.filter(i => i.label.toLowerCase().includes(q) || i.group.toLowerCase().includes(q))
    : allItems

  useEffect(() => {
    if (open) { setQuery(''); setActiveIdx(0); setTimeout(() => inputRef.current?.focus(), 50) }
  }, [open])

  useEffect(() => { setActiveIdx(0) }, [query])

  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${activeIdx}"]`)
    el?.scrollIntoView({ block: 'nearest' })
  }, [activeIdx])

  const onKeyDown = useCallback((e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, filtered.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)) }
    else if (e.key === 'Enter') { filtered[activeIdx]?.action() }
    else if (e.key === 'Escape') { onClose() }
  }, [filtered, activeIdx, onClose])

  const grouped = filtered.reduce((acc, item, i) => {
    ;(acc[item.group] = acc[item.group] ?? []).push({ ...item, flatIdx: i })
    return acc
  }, {})

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[99995] flex items-start justify-center pt-[15vh] px-4"
          style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
        >
          <motion.div
            initial={{ y: -10, opacity: 0, scale: 0.97 }}
            animate={{ y: 0,  opacity: 1, scale: 1 }}
            exit={{ y: -10,   opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.32, 0.72, 0, 1] }}
            className="w-full max-w-xl bg-zinc-950 border border-zinc-700/60 rounded-2xl overflow-hidden shadow-2xl"
          >
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-zinc-800">
              <Search size={14} className="text-zinc-500 shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Search sections, case studies, actions..."
                className="flex-1 bg-transparent font-mono text-sm text-zinc-100 placeholder-zinc-600 outline-none"
                spellCheck={false}
                autoComplete="off"
              />
              <kbd className="font-mono text-[10px] text-zinc-600 border border-zinc-800 rounded px-1.5 py-0.5">ESC</kbd>
            </div>

            <div ref={listRef} className="max-h-80 overflow-y-auto py-2" style={{ scrollbarWidth: 'thin' }}>
              {filtered.length === 0 ? (
                <p className="px-4 py-8 text-center font-mono text-xs text-zinc-600">no results for "{query}"</p>
              ) : (
                Object.entries(grouped).map(([group, items]) => (
                  <div key={group}>
                    <p className="px-4 pt-3 pb-1 font-mono text-[10px] text-zinc-600 uppercase tracking-widest">{group}</p>
                    {items.map(item => {
                      const Icon = item.icon
                      const active = item.flatIdx === activeIdx
                      return (
                        <button
                          key={item.label}
                          data-idx={item.flatIdx}
                          onClick={item.action}
                          onMouseEnter={() => setActiveIdx(item.flatIdx)}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                            active ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:bg-zinc-800/50'
                          }`}
                        >
                          <Icon size={14} className={active ? 'text-wsu-400' : 'text-zinc-600'} />
                          <span className="text-sm">{item.label}</span>
                          {active && <ArrowRight size={12} className="ml-auto text-zinc-600" />}
                        </button>
                      )
                    })}
                  </div>
                ))
              )}
            </div>

            <div className="flex items-center gap-3 px-4 py-2.5 border-t border-zinc-800">
              <span className="font-mono text-[10px] text-zinc-700">
                <kbd className="border border-zinc-800 rounded px-1 mr-0.5">↑↓</kbd> navigate
              </span>
              <span className="font-mono text-[10px] text-zinc-700">
                <kbd className="border border-zinc-800 rounded px-1 mr-0.5">↵</kbd> select
              </span>
              <span className="font-mono text-[10px] text-zinc-700 ml-auto">⌘K to open</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

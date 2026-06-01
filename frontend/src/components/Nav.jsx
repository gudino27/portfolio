import { useState, useEffect } from 'react'
import { Menu, X, Search } from 'lucide-react'

const links = [
  { label: 'About',      href: '#about' },
  { label: 'My Work',    href: '#projects' },
  { label: 'Tech Stack', href: '#techstack' },
  { label: 'My Career',  href: '#experience' },
  { label: 'Contact',    href: '#contact' },
]

export default function Nav({ onTerminal, onPalette }) {
  const [scrolled, setScrolled]     = useState(false)
  const [open, setOpen]             = useState(false)
  const [activeHref, setActiveHref] = useState('')

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    const observers = links.map(({ href }) => {
      const el = document.querySelector(href)
      if (!el) return null
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveHref(href) },
        { rootMargin: '-35% 0px -60% 0px' }
      )
      obs.observe(el)
      return obs
    })
    return () => observers.forEach(obs => obs?.disconnect())
  }, [])

  return (
    <>
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-wsu-500 focus:text-white focus:text-sm focus:font-medium"
    >
      Skip to content
    </a>
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/60' : ''
      }`}
    >
      <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="#" className="font-mono text-wsu-400 font-medium tracking-tight text-sm">
          Jaime<span className="text-zinc-500">@WSU</span>
        </a>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-8">
          {links.map((l) => {
            const isActive = activeHref === l.href
            return (
              <li key={l.href}>
                <a
                  href={l.href}
                  className={`relative text-sm transition-colors duration-200 ${
                    isActive ? 'text-zinc-100' : 'text-zinc-400 hover:text-zinc-100'
                  }`}
                >
                  {l.label}
                  {isActive && (
                    <span
                      key={l.href}
                      className="nav-underline absolute -bottom-1 left-0 right-0 h-px"
                      style={{ background: 'linear-gradient(90deg, rgba(220,18,48,0.9), rgba(255,51,88,0.6))' }}
                    />
                  )}
                </a>
              </li>
            )
          })}
        </ul>

        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={onTerminal}
            title="Open terminal  (`)"
            aria-label="Open terminal"
            className="px-2.5 py-1.5 rounded-md border border-zinc-800 text-zinc-600 font-mono text-xs hover:border-zinc-600 hover:text-zinc-300 transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-wsu-400"
          >
            &gt;_
          </button>
          <button
            onClick={onPalette}
            title="Command palette  (⌘K)"
            aria-label="Open command palette"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-zinc-800 text-zinc-500 font-mono text-xs hover:border-zinc-600 hover:text-zinc-300 transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-wsu-400"
          >
            <Search size={12} />
            <span>⌘K</span>
          </button>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden text-zinc-400 hover:text-zinc-100"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="animate-mobile-menu md:hidden bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800 px-6 pb-6">
          <ul className="flex flex-col gap-4 pt-2">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="text-zinc-400 hover:text-zinc-100 transition-colors"
                  onClick={() => setOpen(false)}
                >
                  {l.label}
                </a>
              </li>
            ))}
            <li>
              <a
                href="/resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="text-wsu-400 font-medium"
              >
                Resume →
              </a>
            </li>
            <li>
              <button
                onClick={() => { setOpen(false); onPalette() }}
                className="flex items-center gap-2 text-zinc-400 hover:text-zinc-100 transition-colors"
              >
                <Search size={14} /> Command palette
              </button>
            </li>
          </ul>
        </div>
      )}
    </header>
    </>
  )
}

import { useEffect, useState, lazy, Suspense } from 'react'
import Nav            from './components/Nav'
import InvertedCursor from './components/InvertedCursor'
import Hero           from './components/Hero'

const Marquee        = lazy(() => import('./components/Marquee'))
const About          = lazy(() => import('./components/About'))
const Research       = lazy(() => import('./components/Research'))
const Projects       = lazy(() => import('./components/Projects'))
const TechStack      = lazy(() => import('./components/TechStack'))
const Experience     = lazy(() => import('./components/Experience'))
const Education      = lazy(() => import('./components/Education'))
const Contact        = lazy(() => import('./components/Contact'))
const Terminal       = lazy(() => import('./components/Terminal'))
const StatusStrip    = lazy(() => import('./components/StatusStrip'))
const GitActivity    = lazy(() => import('./components/GitActivity'))
const CommandPalette = lazy(() => import('./components/CommandPalette'))
const CaseStudyModal = lazy(() => import('./components/CaseStudyModal'))
const FloatingResume = lazy(() => import('./components/FloatingResume'))

export default function App() {
  const [termOpen, setTermOpen]           = useState(false)
  const [palOpen, setPalOpen]             = useState(false)
  const [selectedStudy, setSelectedStudy] = useState(null)

  useEffect(() => {
    const handler = (e) => {
      if (e.key === '`') { e.preventDefault(); setTermOpen(o => !o) }
      if (e.key === 'Escape') { setTermOpen(false); setPalOpen(false) }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setPalOpen(o => !o)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    document.body.classList.toggle('terminal-open', termOpen)
  }, [termOpen])

  return (
    <div className="min-h-screen bg-zinc-950">
      <InvertedCursor />
      <Suspense fallback={null}>
        <Terminal open={termOpen} onClose={() => setTermOpen(false)} />
      </Suspense>
      <Suspense fallback={null}>
        <CommandPalette
          open={palOpen}
          onClose={() => setPalOpen(false)}
          onTerminal={() => { setPalOpen(false); setTermOpen(true) }}
          onCaseStudy={(key) => { setPalOpen(false); setSelectedStudy(key) }}
        />
      </Suspense>
      {selectedStudy && (
        <Suspense fallback={null}>
          <CaseStudyModal studyKey={selectedStudy} onClose={() => setSelectedStudy(null)} />
        </Suspense>
      )}
      <Suspense fallback={null}>
        <FloatingResume />
      </Suspense>
      <Nav onTerminal={() => setTermOpen(o => !o)} onPalette={() => setPalOpen(o => !o)} />
      <main id="main">
        <Hero />
        <Suspense fallback={null}><Marquee /></Suspense>
        <Suspense fallback={null}><About /></Suspense>
        <Suspense fallback={null}><Research /></Suspense>
        <Suspense fallback={null}><Projects onCaseStudy={setSelectedStudy} /></Suspense>
        <Suspense fallback={null}><TechStack /></Suspense>
        <Suspense fallback={null}><Experience /></Suspense>
        <Suspense fallback={null}><Education /></Suspense>
        <Suspense fallback={null}><Contact /></Suspense>
      </main>
      <Suspense fallback={null}><StatusStrip /></Suspense>
      <Suspense fallback={null}><GitActivity /></Suspense>
      <footer className="border-t border-zinc-800 py-8 text-center text-zinc-600 text-xs font-mono">
        <span>jaime.gudino@wsu.edu</span>
        <span className="mx-3 text-zinc-800">·</span>
        <span>React + Vite + Tailwind</span>
        <span className="mx-3 text-zinc-800">·</span>
        <span>Self-hosted via Docker + Cloudflare</span>
        <span className="mx-3 text-zinc-800">·</span>
        <span className="text-zinc-700">⌘K for command palette</span>
      </footer>
    </div>
  )
}

import { lazy, Suspense, useEffect, useRef, useState, useCallback } from 'react'
import { battle } from '../battleState'

const BattleScene = lazy(() => import('./BattleScene'))

const WIN_KEY = 'neural_windows'

function getBrainStatus() {
  try {
    const all = JSON.parse(localStorage.getItem(WIN_KEY) || '{}')
    const now = Date.now()
    const alive = Object.entries(all).filter(([, w]) => now - w.t < 3000)
    if (alive.length === 0) return [
      '  STATUS  : STANDBY',
      '  WINDOWS : 0 detected',
      '  TIP     : open a second tab to initiate link',
    ]
    const lines = alive.map(([id, w]) => {
      const fc = w.faction === 0 ? 'GOLD' : 'CRIMSON'
      return `  [WIN ${id.slice(-4)}] faction=${fc}  width=${w.w}px`
    })
    const linked = alive.length > 1
    return [
      `  STATUS  : ${linked ? 'LINKED: battle in progress' : 'STANDBY: awaiting link'}`,
      `  WINDOWS : ${alive.length} active`,
      ...lines,
    ]
  } catch {
    return ['  STATUS  : read error']
  }
}

function getFaction() {
  try {
    const all = JSON.parse(localStorage.getItem(WIN_KEY) || '{}')
    const now = Date.now()
    const alive = Object.keys(all).filter(id => now - all[id].t < 3000).sort()
    if (alive.length === 0) return 0
    return all[alive[0]].faction ?? 0
  } catch {
    return 0
  }
}

const COMMANDS = {
  help: () => [
    '  whoami        : who built this',
    '  projects      : live deployments',
    '  stack         : full tech stack',
    '  contact       : reach out',
    '  brain         : neural interface status',
    '  battle        : launch 3D neural battle inside terminal',
    '  side <faction>: pick a winner: gold | crimson | even',
    '  ls            : site sections',
    '  sudo          : ...',
    '  clear         : clear terminal',
    '  exit          : close terminal',
  ],
  whoami: () => [
    '  Jaime Gudino',
    '  WSU Computer Science class of 2026',
    '  Full-stack web + native iOS developer',
    '  First-gen student. Bilingual EN/ES.',
    '  Runs the full digital operation for  family carpentary',
    '  business: 3D showroom, iOS admin app, zero-downtime',
    '  deploys, applied ML research at WSU.',
    '  Self-hosts everything.',
  ],
  projects: () => [
    '  [LIVE]  gudinocustom.com       : Three.js showroom, iOS admin, blue-green CI',
    '  [LIVE]  virtual-counselor.org  : RAG advising pipeline, 81.67% accuracy',
    '  [LIVE]  CougarPark             : ML parking prediction, XGBoost + LightGBM',
    '  [LOCAL] brain-mcp              : JARVIS-style 3D neural visualizer for Claude',
  ],
  stack: () => [
    '  Languages  TypeScript · Swift · Python · Go · Java',
    '  Frontend   React · Three.js · React Three Fiber · Tailwind',
    '  Backend    Node.js · Express · FastAPI · SQLite',
    '  Mobile     Swift · UIKit · APNs · Face ID · Core Data',
    '  Infra      Docker · Cloudflare · Nginx · systemd · Linux',
    '  AI / ML    Claude API · FAISS · XGBoost · LightGBM · N8N',
  ],
  contact: () => [
    '  Email   jaime.gudino@wsu.edu',
    '  GitHub  github.com/gudino27',
    '  Resume  /resume.pdf',
  ],
  brain: () => [
    '  ┌─ NEURAL INTERFACE ─────────────────────────────┐',
    ...getBrainStatus().map(l => `  │${l.padEnd(50)}│`),
    '  └────────────────────────────────────────────────┘',
    '  TIP: open multiple tabs and watch them battle.',
  ],
  ls: () => [
    '  about/  projects/  techstack/  experience/  education/  contact/',
  ],
  sudo: () => ['  sudo: Permission denied. Nice try.'],
  pwd:  () => ['  /jaime/portfolio'],
  date: () => [
    `  ${new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles', weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })} PST`,
  ],
  uname: () => ['  JaimeOS 1.0.0: Powered by React + Vite + Cloudflare'],
}

const WELCOME = [
  '  ┌─ NEURAL TERMINAL ──────────────────────────────────────────────────┐',
  '  │  Jaime@WSU: portfolio interface                                   │',
  '  │  type  help  to see available commands                             │',
  '  │  press  `  or  ESC  to close                                       │',
  '  └────────────────────────────────────────────────────────────────────┘',
]

export default function Terminal({ open, onClose }) {
  const [history, setHistory]       = useState([{ type: 'system', lines: WELCOME }])
  const [input, setInput]           = useState('')
  const [cmdHistory, setCmdHistory] = useState([])
  const [cmdIdx, setCmdIdx]         = useState(-1)
  const [battleMode, setBattleMode] = useState(false)
  const inputRef  = useRef(null)
  const bottomRef = useRef(null)
  const faction      = getFaction()
  const promptColor  = faction === 0 ? '#f59e0b' : '#DC1230'
  const promptColor2 = faction === 0 ? '#DC1230' : '#f59e0b'

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 80)
      setHistory([{ type: 'system', lines: WELCOME }])
      setBattleMode(false)
      battle.simulate = false
    }
  }, [open])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history])

  const run = useCallback((raw) => {
    const trimmed = raw.trim().toLowerCase()
    const [cmd, arg] = trimmed.split(/\s+/)
    const inputLine = { type: 'input', text: raw.trim() }

    if (!trimmed) { setHistory(h => [...h, inputLine]); return }

    if (cmd === 'clear') {
      setBattleMode(false)
      battle.simulate = false
      setHistory([{ type: 'system', lines: WELCOME }])
      return
    }

    if (cmd === 'exit' || cmd === 'q') {
      setBattleMode(false)
      battle.simulate = false
      setHistory(h => [...h, inputLine])
      setTimeout(onClose, 120)
      return
    }

    // Battle: toggle 3D scene inside the terminal
    if (cmd === 'battle') {
      if (battleMode) {
        setBattleMode(false)
        battle.simulate = false
        setHistory(h => [...h, inputLine, {
          type: 'output',
          lines: ['  BATTLE SIMULATION: DEACTIVATED', '  Neural cores disengaged.'],
        }])
      } else {
        battle.simulate   = true
        battle.myFaction  = getFaction()
        battle.otherFaction = 1 - battle.myFaction
        setBattleMode(true)
        setHistory(h => [...h, inputLine])
      }
      setCmdHistory(h => [raw.trim(), ...h].slice(0, 50))
      setCmdIdx(-1)
      return
    }

    // Side: pick a winner in the battle
    if (cmd === 'side') {
      const fac = arg || ''
      if (fac === 'gold') {
        battle.bias = -1
        setHistory(h => [...h, inputLine, { type: 'output', lines: ['  BIAS SET: GOLD faction favored  (run  battle  to activate)'] }])
      } else if (fac === 'crimson') {
        battle.bias = 1
        setHistory(h => [...h, inputLine, { type: 'output', lines: ['  BIAS SET: CRIMSON faction favored  (run  battle  to activate)'] }])
      } else if (fac === 'even' || fac === 'reset' || fac === '') {
        battle.bias = 0
        setHistory(h => [...h, inputLine, { type: 'output', lines: ['  BIAS RESET: even match'] }])
      } else {
        setHistory(h => [...h, inputLine, { type: 'error', lines: [`  usage: side gold | crimson | even`] }])
      }
      setCmdHistory(h => [raw.trim(), ...h].slice(0, 50)); setCmdIdx(-1)
      return
    }

    const handler = COMMANDS[cmd]
    if (handler) {
      setHistory(h => [...h, inputLine, { type: 'output', lines: handler() }])
    } else {
      setHistory(h => [...h, inputLine, {
        type: 'error',
        lines: [`  command not found: ${cmd}  (try 'help')`],
      }])
    }
    setCmdHistory(h => [raw.trim(), ...h].slice(0, 50))
    setCmdIdx(-1)
  }, [onClose, battleMode])

  const onKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      run(input); setInput('')
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const next = Math.min(cmdIdx + 1, cmdHistory.length - 1)
      setCmdIdx(next); setInput(cmdHistory[next] ?? '')
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      const next = Math.max(cmdIdx - 1, -1)
      setCmdIdx(next); setInput(next === -1 ? '' : cmdHistory[next])
    }
  }, [input, run, cmdIdx, cmdHistory])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[99990] flex items-center justify-center p-4 sm:p-8"
      style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-3xl rounded-2xl overflow-hidden border border-zinc-700/60 shadow-2xl"
        style={{ background: '#0a0a0b', height: '78vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Title bar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800 shrink-0"
             style={{ background: '#111113' }}>
          <button onClick={onClose}
            className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-400 transition-colors" />
          <div className="w-3 h-3 rounded-full bg-zinc-600/60" />
          <div className="w-3 h-3 rounded-full bg-zinc-600/60" />
          <span className="ml-3 font-mono text-xs text-zinc-500 select-none">
            {battleMode ? 'neural-battle: 3D combat mode' : 'neural-terminal: Jaime@WSU'}
          </span>
          {battleMode ? (
            <span className="ml-auto font-mono text-[10px] px-2 py-0.5 rounded border animate-pulse"
              style={{ color: promptColor, borderColor: promptColor+'50', background: promptColor+'16' }}>
              <span style={{ color: promptColor }}>F[0]</span>
              <span className="text-zinc-600 mx-1">vs</span>
              <span style={{ color: promptColor2 }}>F[1]</span>
            </span>
          ) : (
            <span className="ml-auto font-mono text-[10px] px-2 py-0.5 rounded border"
              style={{ color: promptColor, borderColor: promptColor+'40', background: promptColor+'12' }}>
              {faction === 0 ? 'FACTION: GOLD' : 'FACTION: CRIMSON'}
            </span>
          )}
        </div>

        {/* History or battle scene */}
        {battleMode ? (
          <div className="relative overflow-hidden" style={{ flex: '1 1 0', minHeight: 0 }}>
            <Suspense fallback={
              <div className="absolute inset-0 flex items-center justify-center font-mono text-xs text-zinc-600">
                loading three.js...
              </div>
            }>
              <BattleScene alwaysOn />
            </Suspense>
            <div className="absolute bottom-3 left-0 right-0 text-center pointer-events-none">
              <span className="font-mono text-[10px] text-zinc-600">type  battle  to disengage</span>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-4 py-4 font-mono text-sm leading-relaxed"
               style={{ scrollbarWidth: 'thin' }}>
            {history.map((entry, i) => {
              if (entry.type === 'input') return (
                <div key={i} className="flex gap-2 mb-1">
                  <span style={{ color: promptColor }}>Jaime@WSU</span>
                  <span className="text-zinc-600">~$</span>
                  <span className="text-zinc-100">{entry.text}</span>
                </div>
              )
              if (entry.type === 'error') return (
                <div key={i} className="mb-2">
                  {entry.lines.map((l, j) => <div key={j} className="text-red-400/80">{l}</div>)}
                </div>
              )
              return (
                <div key={i} className="mb-3">
                  {(entry.lines ?? []).map((l, j) => (
                    <div key={j} className="text-zinc-400 whitespace-pre">{l}</div>
                  ))}
                </div>
              )
            })}
            <div ref={bottomRef} />
          </div>
        )}

        {/* Input */}
        <div className="flex items-center gap-2 px-4 py-3 border-t border-zinc-800 shrink-0"
             style={{ background: '#0d0d0f' }}>
          <span style={{ color: promptColor }} className="font-mono text-sm shrink-0">Jaime@WSU</span>
          <span className="text-zinc-600 font-mono text-sm shrink-0">~$</span>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            className="flex-1 bg-transparent font-mono text-sm text-zinc-100 outline-none caret-current"
            style={{ caretColor: promptColor }}
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="off"
          />
        </div>
      </div>
    </div>
  )
}

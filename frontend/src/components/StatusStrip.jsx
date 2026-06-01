import { useEffect, useState } from 'react'

const SITES = [
  {
    key:     'showroom',
    label:   'gudinocustom.com',
    desc:    'Three.js showroom · iOS admin · blue-green CI',
    url:     'https://gudinocustom.com',
  },
  {
    key:     'counselor',
    label:   'virtual-counselor.org',
    desc:    'RAG advising pipeline · 81.67% accuracy',
    url:     'https://virtual-counselor.org',
  },
  {
    key:     'cougarpark',
    label:   'cougarpark',
    desc:    'ML parking prediction · XGBoost + LightGBM',
    url:     'https://gudino27.github.io/CougarPark/',
  },
]

async function ping(url) {
  const t = Date.now()
  try {
    await fetch(url, { mode: 'no-cors', cache: 'no-store', signal: AbortSignal.timeout(7000) })
    return { up: true, ms: Date.now() - t }
  } catch {
    return { up: false, ms: null }
  }
}

export default function StatusStrip() {
  const [statuses, setStatuses]     = useState({})
  const [lastChecked, setLastChecked] = useState(null)

  const check = async () => {
    setStatuses(prev =>
      Object.fromEntries(SITES.map(s => [s.key, { ...prev[s.key], checking: true }]))
    )
    const results = await Promise.all(SITES.map(s => ping(s.url)))
    setStatuses(Object.fromEntries(
      SITES.map((s, i) => [s.key, { up: results[i].up, ms: results[i].ms, checking: false }])
    ))
    setLastChecked(new Date())
  }

  useEffect(() => { check(); const id = setInterval(check, 60_000); return () => clearInterval(id) }, [])

  return (
    <section className="border-t border-zinc-800 py-12 sm:py-16 px-5 sm:px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="section-label">// live deployments</p>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-100">
              SYSTEM <span className="gradient-text">STATUS</span>
            </h2>
          </div>
          {lastChecked && (
            <span className="font-mono text-[10px] text-zinc-700 pb-1">
              checked {lastChecked.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {SITES.map(site => {
            const s        = statuses[site.key]
            const checking = !s || s.checking
            const up       = s?.up

            return (
              <a
                key={site.key}
                href={site.url}
                target="_blank"
                rel="noopener noreferrer"
                className="card-hover group flex flex-col gap-4 no-underline"
              >
                {/* Top row: dot + status badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                        checking ? 'bg-zinc-600 animate-pulse'
                        : up      ? 'bg-emerald-500'
                                  : 'bg-red-500'
                      }`}
                      style={up ? { boxShadow: '0 0 8px rgba(16,185,129,0.8)' } : {}}
                    />
                    <span className={`font-mono text-[10px] tracking-widest ${
                      checking ? 'text-zinc-600' : up ? 'text-emerald-500' : 'text-red-500'
                    }`}>
                      {checking ? 'CHECKING' : up ? 'OPERATIONAL' : 'DOWN'}
                    </span>
                  </div>
                  {s?.ms != null && (
                    <span className="font-mono text-[10px] text-zinc-500">{s.ms}ms</span>
                  )}
                </div>

                {/* URL */}
                <p className="font-mono text-sm text-zinc-200 group-hover:text-white transition-colors">
                  {site.label}
                </p>

                {/* Description */}
                <p className="text-xs text-zinc-400 leading-relaxed">{site.desc}</p>

                {/* Arrow */}
                <span className="mt-auto font-mono text-[10px] text-zinc-500 group-hover:text-zinc-300 transition-colors">
                  visit →
                </span>
              </a>
            )
          })}
        </div>
      </div>
    </section>
  )
}

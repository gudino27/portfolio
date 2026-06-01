import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { GitCommit, GitBranch, ExternalLink } from 'lucide-react'

function timeAgo(dateStr) {
  const diff  = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins  < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

function parseBranch(ref) {
  return ref?.replace('refs/heads/', '') ?? 'main'
}

export default function GitActivity() {
  const [items, setItems]     = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('https://api.github.com/users/gudino27/events/public')
      .then(r => r.json())
      .then(data => {
        if (!Array.isArray(data)) return

        const flat = []
        for (const ev of data) {
          if (flat.length >= 8) break

          if (ev.type === 'PushEvent') {
            const commits = ev.payload.commits ?? []
            const branch  = parseBranch(ev.payload.ref)
            const repo    = ev.repo.name.split('/')[1]

            if (commits.length > 0) {
              for (const c of commits.slice(0, 2)) {
                flat.push({
                  id:      c.sha,
                  icon:    GitCommit,
                  repo,
                  message: c.message.split('\n')[0].slice(0, 72),
                  time:    ev.created_at,
                  url:     `https://github.com/${ev.repo.name}/commit/${c.sha}`,
                })
                if (flat.length >= 8) break
              }
            } else {
              flat.push({
                id:      ev.id,
                icon:    GitCommit,
                repo,
                message: `pushed to ${branch}`,
                time:    ev.created_at,
                url:     `https://github.com/${ev.repo.name}/tree/${branch}`,
              })
            }
          } else if (ev.type === 'CreateEvent') {
            const repo = ev.repo.name.split('/')[1]
            flat.push({
              id:      ev.id,
              icon:    GitBranch,
              repo,
              message: `created ${ev.payload.ref_type}${ev.payload.ref ? ` "${ev.payload.ref}"` : ''}`,
              time:    ev.created_at,
              url:     `https://github.com/${ev.repo.name}`,
            })
          }
        }
        setItems(flat.slice(0, 8))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="border-t border-zinc-800 py-12 sm:py-16 px-5 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="section-label">// github</p>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-100">
              LIVE <span className="gradient-text">COMMITS</span>
            </h2>
          </div>
          <a
            href="https://github.com/gudino27"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 font-mono text-[11px] text-zinc-600 hover:text-zinc-400 transition-colors pb-1"
          >
            github.com/gudino27 <ExternalLink size={10} />
          </a>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-zinc-900 border border-zinc-800 animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="font-mono text-sm text-zinc-600">no recent public activity</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {items.map((item, i) => {
              const Icon = item.icon
              return (
                <motion.a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.04 }}
                  className="group flex items-start gap-3 p-4 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/80 transition-all no-underline"
                >
                  <Icon size={13} className="text-wsu-400 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-mono text-[11px] text-zinc-400 group-hover:text-zinc-300 transition-colors">
                        {item.repo}
                      </span>
                      <span className="font-mono text-[10px] text-zinc-700 ml-auto shrink-0">{timeAgo(item.time)}</span>
                    </div>
                    <p className="text-xs text-zinc-500 truncate leading-relaxed">{item.message}</p>
                  </div>
                </motion.a>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}

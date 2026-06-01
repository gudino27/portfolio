const items = [
  'React', 'Three.js', 'React Three Fiber', 'Swift', 'UIKit', 'APNs',
  'Docker', 'Node.js', 'TypeScript', 'Cloudflare', 'SQLite', 'FastAPI',
  'FAISS', 'XGBoost', 'N8N', 'Vite', 'Tailwind', 'WebSocket',
  'Face ID', 'Blue-green Deploy', 'Nginx', 'Python', 'Express', 'systemd',
]

export default function Marquee() {
  const doubled = [...items, ...items]

  return (
    <div className="relative py-5 border-y border-zinc-800/60 overflow-hidden bg-zinc-950/50">
      {/* Edge fades */}
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-zinc-950 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-zinc-950 to-transparent z-10 pointer-events-none" />

      <div className="flex whitespace-nowrap will-change-transform">
        <div className="marquee-track flex gap-0 shrink-0">
          {doubled.map((item, i) => (
            <span key={i} className="inline-flex items-center gap-4 px-4">
              <span className="font-mono text-xs sm:text-sm text-zinc-400 tracking-wide hover:text-zinc-200 transition-colors cursor-default">
                {item}
              </span>
              <span className="text-zinc-700 text-xs">◆</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ExternalLink, Github } from 'lucide-react'

// ── Case study content ────────────────────────────────────────────
const STUDIES = {
  showroom: {
    accent:   'violet',
    title:    'Gudino Custom Woodworking',
    subtitle: 'Website and back office for a family cabinet shop',
    live:     'https://gudinocustom.com',
    github:   'https://github.com/gudino27/GudinoCustom',
    overview: `Gudino Custom Woodworking is my family's cabinet shop. I built the website and the back office it runs on, in English and Spanish. Customers browse the photo and video portfolio, lay out a kitchen or bathroom in a 2D/3D designer with a running price, send it in for a quote, and book a consultation. The owner and staff run the business from a 16-tab admin panel and a native SwiftUI iOS app: invoices, a time clock, appointments, project timelines, testimonials, users and analytics. One Express + SQLite API sits behind both and sends the email, SMS and push notifications. It began as a web development course project and I kept working on it; the site has brought the shop about 10 customer leads. All self-hosted.`,
    metrics: [
      { value: '290',    label: 'API route handlers', desc: 'one Express + SQLite API' },
      { value: '16',     label: 'Admin panel tabs',   desc: 'plus a native SwiftUI iOS app' },
      { value: '~5 min', label: 'Image builds',       desc: 'from over an hour · varies with server load' },
      { value: '~10',    label: 'Customer leads',     desc: 'brought in by the site' },
    ],
    architecture: [
      {
        label: 'Customer Site',
        color: 'violet',
        items: [
          'Photo and video portfolio, FAQ, cabinet-care and hardware pages; every public page in English and Spanish',
          '2D/3D kitchen and bathroom designer: drag, rotate and snap on a floor plan, a live price from admin-set price tables, PDF and AR export (.glb)',
          'Quote requests with photos; book or cancel a consultation',
          'Private links from the shop, no login needed: an invoice and its receipts, a project timeline, a 3D view of the customer\'s own design',
        ],
      },
      {
        label: 'Admin Panel + iOS App',
        color: 'fuchsia',
        items: [
          'The same back office twice: a 16-tab web admin panel and a native SwiftUI iOS app (Face ID, token in Keychain, APNs push)',
          'Invoicing: clients, tax rates, payments, PDF invoices and receipts, sent by email or SMS',
          'Time clock: clock in/out and breaks, manual entries that wait for manager approval, weekly overtime',
          'Appointments and availability, project timelines, testimonials, prices, portfolio media, and the inbox of submitted designs and quote requests',
          'In progress: an in-house Mac/Windows carpentry design app (TypeScript/JavaScript on Electron, which I am still learning)',
        ],
      },
      {
        label: 'API + Access Control',
        color: 'violet',
        items: [
          'One Express + SQLite API: 290 route handlers across 20 route modules, about 60 tables, older databases migrated forward at server start',
          'Three roles (employee, admin, super_admin); super admins also get users and invitations, analytics, SMS routing and a security monitor',
          'Email through nodemailer, SMS through Twilio, push through APNs; invoice and receipt PDFs rendered with Puppeteer',
          'bcrypt passwords, lockout after 5 failed logins, rate limiters on login, password reset and the public API',
          'Instagram feed is read from Instagram and shown on the site; nothing is posted to it',
        ],
      },
      {
        label: 'Infrastructure + Tests',
        color: 'fuchsia',
        items: [
          'Self-hosted in Docker (backend, frontend, nginx proxy, certbot) behind nginx and a Cloudflare Tunnel',
          'Zero-downtime deploys: new containers start beside the running pair and are health-checked before nginx switches over; a failure restores the old config',
          'Parallel image builds with Docker Buildx Bake took builds from over an hour to about 5 minutes, depending on server load',
          'Tests cover the cabinet engine, designer geometry and pricing; they live on the server, not in the public GitHub repo',
        ],
      },
    ],
    stack: ['React', 'Three.js', 'React Three Fiber', 'Swift', 'SwiftUI', 'APNs', 'Express', 'SQLite', 'Twilio', 'Puppeteer', 'Docker Buildx Bake', 'Nginx', 'Cloudflare Tunnel', 'JWT'],
  },

  counselor: {
    accent:   'cyan',
    title:    'Virtual Counselor',
    subtitle: 'AI-powered academic planning assistant for WSU students',
    live:     'https://virtual-counselor.org',
    github:   'https://github.com/gudino27/virtual-counselor_2.0',
    overview: `WSU's advising system is overloaded: students wait weeks for appointments to figure out which courses satisfy requirements. I built Virtual Counselor as a full academic planning platform: a degree planner, a course search tool with Rate My Professor data, a prerequisite checker using BFS graph traversal, and an LLM chatbot backed by a 6-stage RAG pipeline. The system achieves 81.67% accuracy on 120 domain test cases versus 30.83% for a raw LLM with no retrieval.`,
    metrics: [
      { value: '81.67%', label: 'RAG accuracy',        desc: '120 domain test cases' },
      { value: '6',      label: 'RAG pipeline stages', desc: 'classify → retrieve → rerank → generate' },
      { value: 'BFS',    label: 'Prereq traversal',    desc: 'structured graph search' },
      { value: '2.65×',  label: 'Accuracy vs baseline',desc: '30.83% raw LLM → 81.67% with RAG' },
    ],
    architecture: [
      {
        label: 'Planning Tools',
        color: 'cyan',
        items: [
          'Degree planner: map completed and in-progress courses against graduation requirements',
          'Course search: pull WSU catalog data alongside Rate My Professor ratings and reviews',
          'Prerequisite checker: BFS traversal of the course dependency graph to flag missing prereqs',
          'Prompt template system: structured prompts for common advising scenarios',
        ],
      },
      {
        label: '6-Stage RAG Pipeline',
        color: 'sky',
        items: [
          'Stage 1: Query classification: route academic vs. off-topic queries',
          'Stage 2: Hybrid retrieval: FAISS dense vector search + BM25 keyword search over WSU catalog',
          'Stage 3: BFS prereq expansion: augment retrieved chunks with prerequisite chain context',
          'Stage 4: NVIDIA reranker: cross-encoder reranking to filter irrelevant chunks',
          'Stage 5: Prompt assembly: inject ranked context into structured system prompt',
          'Stage 6: Claude Haiku generation: final answer with cited courses and confidence signal',
        ],
      },
      {
        label: 'Frontend + Chat Widget',
        color: 'cyan',
        items: [
          'React SPA with degree planner, course search, and prerequisite visualization',
          'Floating chat widget accessible on every page: streams responses via SSE',
          'N8N workflow engine orchestrates the full RAG pipeline as a visual graph',
          'Webhook trigger from the React frontend: stateless per-request, no session state',
        ],
      },
      {
        label: 'Infrastructure',
        color: 'sky',
        items: [
          'Express.js gateway: auth, rate limiting, webhook proxy to N8N',
          'SQLite stores conversation history and anonymized query logs for evaluation',
          'Docker Compose: frontend + backend + N8N in one stack',
          'Cloudflare proxied with WAF rules; FAISS index rebuilt nightly from catalog updates',
        ],
      },
    ],
    stack: ['React', 'Express', 'N8N', 'FAISS', 'BM25', 'NVIDIA Reranker', 'Claude API', 'SQLite', 'Docker', 'Cloudflare', 'Python', 'SSE', 'Rate My Professor API'],
  },

  cougarpark: {
    accent:   'emerald',
    title:    'CougarPark',
    subtitle: 'ML parking prediction for WSU campus: occupancy and enforcement',
    live:     'https://gudino27.github.io/CougarPark/',
    github:   'https://github.com/gudino27/CougarPark',
    overview: `Finding parking at WSU is a daily frustration for 20,000+ students. I partnered with WSU's Transportation Department to obtain a 12GB dataset of historical occupancy and enforcement records, then trained separate gradient boosting models for two tasks: predicting lot occupancy (LightGBM, MAE 0.18, R² 0.99) and predicting parking enforcement pass risk windows (XGBoost, ROC-AUC 0.92). The result is a React frontend with a Leaflet map showing real-time predictions across all campus lots.`,
    metrics: [
      { value: '12GB',  label: 'Training dataset',     desc: 'WSU Transportation records' },
      { value: '0.18',  label: 'MAE: occupancy',      desc: 'LightGBM, R² = 0.99' },
      { value: '0.92',  label: 'ROC-AUC enforcement',  desc: 'XGBoost enforcement risk' },
      { value: '27',    label: 'Jupyter notebooks',     desc: 'EDA, training, evaluation' },
    ],
    architecture: [
      {
        label: 'Data Pipeline',
        color: 'emerald',
        items: [
          '12GB raw dataset from WSU Transportation: multi-year occupancy counts and enforcement logs',
          'pandas pipeline: null handling, outlier removal, temporal feature extraction',
          'Feature engineering: hour-of-day, day-of-week, academic calendar flags, lot-specific baselines',
          'Train/val/test split with temporal ordering to prevent data leakage',
          '27 Jupyter notebooks covering EDA, feature importance, SHAP analysis, and ablations',
        ],
      },
      {
        label: 'Model Training',
        color: 'teal',
        items: [
          'LightGBM for occupancy regression: MAE 0.18, R² 0.99 on held-out test set',
          'XGBoost for enforcement risk classification: ROC-AUC 0.92',
          'Optuna Bayesian hyperparameter search (200 trials per model)',
          'Time-series aware cross-validation folds; scikit-learn preprocessing pipeline serialized alongside weights',
        ],
      },
      {
        label: 'API + Frontend',
        color: 'emerald',
        items: [
          '13 Flask API endpoints: lot prediction, enforcement risk, bulk forecasts, lot metadata',
          'Leaflet map with Google Maps satellite tiles: color-coded lot markers by predicted occupancy',
          'Time scrubber to query predictions for any future time window',
          'Docker + Cloudflare Tunnel for self-hosted API serving; GitHub Pages for the static React build',
        ],
      },
    ],
    stack: ['Python', 'LightGBM', 'XGBoost', 'scikit-learn', 'pandas', 'Optuna', 'SHAP', 'Flask', 'React', 'Leaflet', 'Jupyter', 'Docker', 'Cloudflare Tunnel', 'GitHub Pages'],
  },

  brainmcp: {
    accent:   'amber',
    title:    'Brain MCP',
    subtitle: 'JARVIS-style 3D neural visualizer for Claude\'s live thought process',
    live:     null,
    github:   'https://github.com/gudino27/brain-mcp',
    overview: `When working with Claude Code, every tool call and response is invisible: you see text, not thought. I built Brain MCP to change that: an MCP server that hooks into Claude Code's event stream and visualizes every action as a glowing 3D node in real-time. Tool calls, file reads, bash commands, responses: each becomes a force-graph node with edges showing causal relationships.`,
    metrics: [
      { value: '6',       label: 'MCP tools',       desc: 'exposed to Claude Code' },
      { value: '18',      label: 'Node types',       desc: 'tool call, file, bash, etc.' },
      { value: '<16ms',   label: 'Render latency',   desc: 'Three.js 60fps target' },
      { value: 'auto',    label: 'Hook wiring',      desc: 'zero config via settings.json' },
    ],
    architecture: [
      {
        label: 'MCP Server',
        color: 'amber',
        items: [
          'Node.js MCP server exposing 6 tools: add_node, add_edge, highlight, clear, status, pulse',
          'Claude Code calls these tools directly during its reasoning loop',
          'Tools map to visual actions: add_node creates a sphere, add_edge draws a connection',
          'Server maintains a live graph state pushed to the renderer via WebSocket',
        ],
      },
      {
        label: 'Claude Code Hooks',
        color: 'yellow',
        items: [
          'Hooks in ~/.claude/settings.json fire on: PreToolUse, PostToolUse, Notification',
          'Shell scripts emit structured JSON events to the MCP server on each hook',
          'Zero configuration after initial setup: hooks auto-wire to any Claude Code session',
          'Event payload includes: tool name, file path, command, response summary',
        ],
      },
      {
        label: '3D Renderer',
        color: 'amber',
        items: [
          'Three.js force-directed graph: nodes repel, edges attract (physics simulation)',
          'Golden sphere nucleus, 18 node type shapes/colors (file=cube, bash=cylinder, etc.)',
          'Amber glow shader on active nodes, fade-out on idle',
          'WebSocket client receives graph diffs and applies them incrementally',
          'Orbit controls, zoom, node click for detail panel',
        ],
      },
    ],
    stack: ['Node.js', 'TypeScript', 'Three.js', 'WebSocket', 'Express', 'MCP Protocol', 'Claude Code Hooks', 'Force-Graph'],
  },
}

// ── Accent color maps ─────────────────────────────────────────────
const accentColors = {
  violet:  { bar: 'from-violet-500 to-fuchsia-500',  text: 'text-violet-400',  border: 'border-violet-500/30', bg: 'bg-violet-500/8'  },
  cyan:    { bar: 'from-wsu-500 to-cyan-400',         text: 'text-cyan-400',    border: 'border-cyan-500/30',   bg: 'bg-cyan-500/8'    },
  emerald: { bar: 'from-emerald-500 to-teal-400',     text: 'text-emerald-400', border: 'border-emerald-500/30',bg: 'bg-emerald-500/8' },
  amber:   { bar: 'from-amber-500 to-yellow-400',     text: 'text-amber-400',   border: 'border-amber-500/30',  bg: 'bg-amber-500/8'   },
}

const archColors = {
  violet:  'border-violet-500/20  bg-violet-500/5  text-violet-400',
  fuchsia: 'border-fuchsia-500/20 bg-fuchsia-500/5 text-fuchsia-400',
  cyan:    'border-cyan-500/20    bg-cyan-500/5    text-cyan-400',
  sky:     'border-sky-500/20     bg-sky-500/5     text-sky-400',
  emerald: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400',
  teal:    'border-teal-500/20    bg-teal-500/5    text-teal-400',
  amber:   'border-amber-500/20   bg-amber-500/5   text-amber-400',
  yellow:  'border-yellow-500/20  bg-yellow-500/5  text-yellow-400',
}

export default function CaseStudyModal({ studyKey, onClose }) {
  const study = STUDIES[studyKey]
  const ac    = accentColors[study?.accent] ?? accentColors.violet

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  if (!study) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[99980] flex items-end sm:items-center justify-center p-0 sm:p-6"
        style={{ background: 'rgba(0,0,0,0.80)', backdropFilter: 'blur(6px)' }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      >
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 60, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
          className="w-full sm:max-w-4xl bg-zinc-950 border border-zinc-800 rounded-t-2xl sm:rounded-2xl overflow-hidden flex flex-col"
          style={{ maxHeight: '90vh' }}
        >
          {/* Accent bar */}
          <div className={`h-[2px] w-full bg-gradient-to-r ${ac.bar} shrink-0`} />

          {/* Header */}
          <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-zinc-800/60 shrink-0">
            <div className="flex-1 min-w-0 pr-4">
              <p className={`font-mono text-[10px] tracking-widest mb-1 ${ac.text}`}>// case study</p>
              <h2 className="text-xl sm:text-2xl font-black text-zinc-100 leading-tight">{study.title}</h2>
              <p className="text-zinc-500 text-sm mt-1">{study.subtitle}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {study.live && (
                <a href={study.live} target="_blank" rel="noopener noreferrer"
                   className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-400 hover:text-zinc-100 hover:border-zinc-500 text-xs font-mono transition-all">
                  <ExternalLink size={12} /> live
                </a>
              )}
              {study.github && (
                <a href={study.github} target="_blank" rel="noopener noreferrer"
                   className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-400 hover:text-zinc-100 hover:border-zinc-500 text-xs font-mono transition-all">
                  <Github size={12} /> repo
                </a>
              )}
              <button onClick={onClose}
                className="w-8 h-8 rounded-lg border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-zinc-200 hover:border-zinc-600 transition-all">
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8" style={{ scrollbarWidth: 'thin' }}>

            {/* Overview */}
            <section>
              <p className={`font-mono text-[10px] tracking-widest mb-2 ${ac.text}`}>// overview</p>
              <p className="text-zinc-300 text-sm leading-relaxed">{study.overview}</p>
            </section>

            {/* Metrics */}
            <section>
              <p className={`font-mono text-[10px] tracking-widest mb-3 ${ac.text}`}>// by the numbers</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {study.metrics.map(m => (
                  <div key={m.label} className={`rounded-xl border p-4 ${ac.border} ${ac.bg}`}>
                    <div className={`text-2xl sm:text-3xl font-black mb-1 ${ac.text}`}>{m.value}</div>
                    <div className="text-zinc-200 text-xs font-medium leading-snug">{m.label}</div>
                    <div className="text-zinc-600 text-[10px] font-mono mt-0.5">{m.desc}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* Architecture */}
            <section>
              <p className={`font-mono text-[10px] tracking-widest mb-3 ${ac.text}`}>// architecture</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {study.architecture.map(layer => {
                  const layerAc = archColors[layer.color] ?? archColors.violet
                  return (
                    <div key={layer.label} className={`rounded-xl border p-4 ${layerAc}`}>
                      <p className={`font-mono text-[10px] font-bold tracking-widest mb-3 ${layerAc.split(' ')[2]}`}>
                        {layer.label.toUpperCase()}
                      </p>
                      <ul className="space-y-2">
                        {layer.items.map((item, i) => (
                          <li key={i} className="flex gap-2 text-xs text-zinc-400 leading-relaxed">
                            <span className={`mt-1.5 w-1 h-1 rounded-full shrink-0 ${layerAc.split(' ')[2].replace('text-', 'bg-')}`} />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                })}
              </div>
            </section>

            {/* Stack */}
            <section className="pb-2">
              <p className={`font-mono text-[10px] tracking-widest mb-3 ${ac.text}`}>// full stack</p>
              <div className="flex flex-wrap gap-2">
                {study.stack.map(t => <span key={t} className="tag">{t}</span>)}
              </div>
            </section>
          </div>

          {/* Mobile links footer */}
          <div className="sm:hidden flex gap-3 px-6 py-4 border-t border-zinc-800 shrink-0">
            {study.live && (
              <a href={study.live} target="_blank" rel="noopener noreferrer"
                 className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-zinc-700 text-zinc-300 text-sm font-mono transition-colors hover:border-zinc-500">
                <ExternalLink size={14} /> Live site
              </a>
            )}
            {study.github && (
              <a href={study.github} target="_blank" rel="noopener noreferrer"
                 className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-zinc-700 text-zinc-300 text-sm font-mono transition-colors hover:border-zinc-500">
                <Github size={14} /> GitHub
              </a>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

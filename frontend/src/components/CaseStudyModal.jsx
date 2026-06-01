import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ExternalLink, Github } from 'lucide-react'

// ── Case study content ────────────────────────────────────────────
const STUDIES = {
  showroom: {
    accent:   'violet',
    title:    'Gudino Custom Woodworking',
    subtitle: 'Full business operations platform for a family cabinet company',
    live:     'https://gudinocustom.com',
    github:   'https://github.com/gudino27/GudinoCustom',
    overview: `My family runs a cabinet and woodworking business with zero digital presence: quotes on paper, no way for customers to visualize products, no admin tooling. I rebuilt the entire operation from scratch: a role-based admin system, a native iOS app with biometric auth, an interactive 3D cabinet designer with AR export, a 360° virtual showroom, appointment scheduling, an analytics dashboard, and a zero-downtime infrastructure pipeline. All self-hosted.`,
    metrics: [
      { value: '0s',    label: 'Downtime on deploy',  desc: 'blue-green Docker pipeline' },
      { value: '3',     label: 'RBAC roles',           desc: 'super_admin · admin · employee' },
      { value: 'Face ID', label: 'iOS auth',           desc: 'native biometrics via LocalAuthentication' },
      { value: '3D+AR', label: 'Cabinet export',       desc: 'Three.js designer + AR Quick Look' },
    ],
    architecture: [
      {
        label: 'Customer Web App',
        color: 'violet',
        items: [
          '360° virtual showroom built in Three.js: panoramic room views, real-time material and finish swapping',
          'Interactive 3D cabinet designer: set room dimensions, drag-drop cabinets, configure finishes, export as USDZ for AR Quick Look on iOS',
          'Appointment scheduling with live calendar integration',
          'Testimonials page and project timeline tracker for active customer jobs',
        ],
      },
      {
        label: 'iOS Admin App',
        color: 'fuchsia',
        items: [
          'Native Swift + UIKit app: Face ID / Touch ID auth via LocalAuthentication',
          'APNs push notifications for new quote requests and appointment changes',
          'Employee timeclock: clock in/out, view hours, submit timesheets',
          'Invoice maker: generate, send, and track client invoices',
          'Core Data local persistence with iCloud sync; REST client against the Express API',
        ],
      },
      {
        label: 'Backend + RBAC',
        color: 'violet',
        items: [
          'Express.js REST API with three access tiers: super_admin, admin, employee',
          'super_admin: full access including user management and analytics dashboard',
          'admin: quotes, inventory, customer records, appointment management',
          'employee: timeclock, assigned jobs, and limited customer view',
          'SQLite with WAL mode; JWT auth + rate limiting on all protected routes',
        ],
      },
      {
        label: 'Infrastructure',
        color: 'fuchsia',
        items: [
          'Docker Buildx Bake: multi-arch images (amd64 + arm64) built in CI',
          'Blue-green deployment: two containers behind Nginx, health-check swap with zero downtime',
          'Cloudflare proxy: DDoS protection, edge caching, SSL termination',
          'systemd service for auto-restart; self-hosted on Linux VPS (no cloud vendor lock-in)',
        ],
      },
    ],
    stack: ['React', 'Three.js', 'React Three Fiber', 'Swift', 'UIKit', 'APNs', 'Core Data', 'Express', 'SQLite', 'Docker Buildx', 'Nginx', 'Cloudflare', 'systemd', 'JWT'],
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

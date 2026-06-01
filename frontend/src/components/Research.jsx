import { motion } from 'framer-motion'
import useInView from '../hooks/useInView'
import { ExternalLink, TrendingUp, ArrowRight } from 'lucide-react'

const results = [
  { category: 'Prerequisite Validation', rag: 93.33, noRag: 16.67 },
  { category: 'Chain Discovery',         rag: 88.00, noRag: 28.00 },
  { category: 'Schedule Feasibility',    rag: 86.67, noRag: 26.67 },
  { category: 'UCORE Planning',          rag: 80.00, noRag: 50.00 },
  { category: 'Credit Calculations',     rag: 80.00, noRag: 55.00 },
  { category: 'Degree Progress',         rag: 55.00, noRag: 25.00 },
]

const overall = { rag: 81.67, noRag: 30.83 }

function ResultBar({ category, rag, noRag, delay, inView }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.35, delay }}
    >
      {/* Label row, stacks on mobile */}
      <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-0.5 xs:gap-2 mb-1.5">
        <span className="text-xs text-zinc-400 font-medium truncate">{category}</span>
        <div className="flex items-center gap-3 shrink-0 font-mono text-xs">
          <span className="text-wsu-400 font-semibold">{rag.toFixed(2)}%</span>
          <ArrowRight size={10} className="text-zinc-700" />
          <span className="text-zinc-600">{noRag.toFixed(2)}%</span>
        </div>
      </div>
      <div className="relative h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <motion.div
          className="absolute left-0 top-0 h-full bg-zinc-700 rounded-full"
          initial={{ width: 0 }}
          animate={inView ? { width: `${noRag}%` } : {}}
          transition={{ duration: 0.6, delay: delay + 0.05 }}
        />
        <motion.div
          className="absolute left-0 top-0 h-full rounded-full"
          style={{ background: 'linear-gradient(90deg, #DC1230, #ff3358)' }}
          initial={{ width: 0 }}
          animate={inView ? { width: `${rag}%` } : {}}
          transition={{ duration: 0.75, delay: delay + 0.15 }}
        />
      </div>
    </motion.div>
  )
}

export default function Research() {
  const [ref, inView] = useInView()

  return (
    <section id="research" className="py-20 sm:py-24 px-5 sm:px-6 bg-zinc-900/30">
      <div className="max-w-6xl mx-auto" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-10 sm:mb-12"
        >
          <p className="section-label">// research</p>
          <h2 className="section-heading mb-2">CPT S 440: AI Academic Advising</h2>
          <p className="text-zinc-500 text-sm max-w-2xl">
            Empirical study of retrieval-augmented generation for WSU course planning.
            120 domain-specific test cases across six query categories.
          </p>
        </motion.div>

        {/* Hero comparison widget */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-3 mb-8 sm:mb-10 border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-900"
        >
          <div className="p-5 sm:p-7 text-center border-r border-zinc-800">
            <div className="text-2xl sm:text-4xl font-bold font-mono text-zinc-600 mb-1">{overall.noRag}%</div>
            <div className="text-zinc-500 text-xs sm:text-sm font-mono">without RAG</div>
          </div>
          <div className="p-5 sm:p-7 text-center flex flex-col items-center justify-center bg-wsu-500/5 border-r border-zinc-800">
            <div className="font-mono text-xs text-zinc-500 mb-1 uppercase tracking-widest">delta</div>
            <div className="text-xl sm:text-3xl font-bold font-mono text-wsu-400">
              +{(overall.rag - overall.noRag).toFixed(2)}pp
            </div>
            <div className="text-zinc-500 text-xs mt-1">accuracy gain</div>
          </div>
          <div className="p-5 sm:p-7 text-center">
            <div className="text-2xl sm:text-4xl font-bold font-mono text-wsu-400 mb-1 drop-shadow-[0_0_12px_rgba(220,18,48,0.5)]">
              {overall.rag}%
            </div>
            <div className="text-zinc-400 text-xs sm:text-sm font-mono">with RAG</div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 sm:gap-10">
          {/* Left: bar chart */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="card"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-wsu-500/10 border border-wsu-500/20 flex items-center justify-center">
                  <TrendingUp size={14} className="text-wsu-400" />
                </div>
                <h3 className="font-semibold text-zinc-200 text-sm sm:text-base">Accuracy by Category</h3>
              </div>
              <div className="flex items-center gap-3 text-[10px] font-mono text-zinc-600">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-wsu-500 inline-block"/>RAG</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-zinc-700 inline-block"/>Base</span>
              </div>
            </div>

            <div className="space-y-4">
              {results.map((r, i) => (
                <ResultBar key={r.category} {...r} delay={0.2 + i * 0.07} inView={inView} />
              ))}
            </div>

            <div className="mt-5 pt-4 border-t border-zinc-800 flex flex-wrap justify-between items-center gap-2">
              <span className="font-mono text-xs text-zinc-500">120 test cases across 6 categories</span>
              <a
                href="https://github.com/gudino27/virtual-counselor_2.0"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-wsu-400 text-xs hover:text-wsu-300 transition-colors font-mono"
              >
                View repo <ExternalLink size={11} />
              </a>
            </div>
          </motion.div>

          {/* Right: findings */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-4 sm:space-y-5"
          >
            <div className="card">
              <h3 className="font-semibold text-zinc-200 mb-1">Virtual Counselor</h3>
              <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                AI-powered academic planning for WSU students. Built on React + Express + N8N
                with SQLite, containerized via Docker and served behind a Cloudflare Tunnel.
                Ingests WSU course catalogs, prerequisite chains, and degree requirements to
                answer natural-language planning queries. Evaluation uses cosine similarity
                against MiniLM embeddings with a 0.60 threshold.
              </p>
              <a
                href="https://github.com/gudino27/virtual-counselor_2.0"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-wsu-400 text-sm hover:text-wsu-300 transition-colors"
              >
                github.com/gudino27/virtual-counselor_2.0 <ExternalLink size={12} />
              </a>
            </div>

            <div className="card">
              <h3 className="font-semibold text-zinc-200 mb-3">Key Findings</h3>
              <div className="space-y-3">
                {[
                  {
                    tag: 'BFS > semantic',
                    body: 'Structured graph traversal of the prerequisite chain outperformed vector similarity search for factual lookups. Semantic search retrieves related content, not the exact node.',
                  },
                  {
                    tag: 'NvidiaReranker',
                    body: 'Cross-encoder reranking re-scored top-30 retrieved chunks to top-3 before injection, cutting hallucination on crowded retrieval sets.',
                  },
                  {
                    tag: '17% → 93%',
                    body: 'The single largest gain. Without retrieval the model conflated similar course names. The structured index anchored lookups to exact course IDs.',
                  },
                  {
                    tag: 'Beam + MCTS',
                    body: 'Both implemented and benchmarked against a mock LLM; positioned for live API evaluation.',
                  },
                ].map((f) => (
                  <div key={f.tag} className="flex gap-3">
                    <span className="shrink-0 font-mono text-[10px] font-semibold text-wsu-400 bg-wsu-500/10 border border-wsu-500/20 px-1.5 py-0.5 rounded h-fit mt-0.5">
                      {f.tag}
                    </span>
                    <p className="text-zinc-500 text-xs leading-relaxed">{f.body}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h3 className="font-semibold text-zinc-200 text-sm mb-3">Stack</h3>
              <div className="flex flex-wrap gap-1.5">
                {['React', 'Express', 'N8N', 'SQLite', 'Docker', 'FAISS', 'sentence-transformers', 'NvidiaReranker', 'Claude API', 'Cloudflare'].map((t) => (
                  <span key={t} className="tag">{t}</span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

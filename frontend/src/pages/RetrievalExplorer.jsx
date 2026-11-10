import React, { useState } from 'react';
import {
  Layers,
  Database,
  Binary,
  GitMerge,
  Sparkles,
  Info,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { useChat } from '../context/ChatContext';
import Badge from '../components/common/Badge';

export default function RetrievalExplorer() {
  const { activeTrace } = useChat();
  const [activeTab, setActiveTab] = useState('semantic');

  const sources = activeTrace?.stages?.find(s => s.id === 'hybrid_retrieval')?.data?.verified_sources || [];
  const route = activeTrace?.route || 'knowledge_base';

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-dark-800">
        <div>
          <h2 className="text-base font-semibold font-mono text-dark-100 flex items-center gap-2">
            <Layers className="w-5 h-5 text-brand-purple" />
            <span>Retrieval & Ranking Pipeline Explorer</span>
          </h2>
          <p className="text-xs text-dark-400 font-mono mt-0.5">
            Technical inspection of the hybrid retrieval stack: Dense Vector (Pinecone), Sparse Keyword (BM25), RRF Fusion, and Cross-Encoder Reranking.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <Badge variant="purple">Pinecone (Dense)</Badge>
          <Badge variant="blue">BM25Okapi (Sparse)</Badge>
          <Badge variant="emerald">RRF k=60</Badge>
        </div>
      </div>

      {/* Query Banner */}
      <div className="p-3.5 rounded-xl border border-dark-750 bg-dark-900/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
        <div className="min-w-0">
          <div className="text-[10px] text-dark-500 uppercase">Current Evaluated Query</div>
          <div className="text-dark-100 font-medium truncate mt-0.5">
            "{activeTrace?.query || 'Submit a query in AI Assistant to inspect live retrieval results.'}"
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-dark-400">Route:</span>
          <Badge variant={route === 'web_search' ? 'blue' : 'purple'}>
            {route}
          </Badge>
        </div>
      </div>

      {/* Tabbed Explorer */}
      <div className="rounded-xl border border-dark-700 bg-dark-900/90 shadow-xl overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-dark-750 bg-dark-950/60 overflow-x-auto">
          <button
            onClick={() => setActiveTab('semantic')}
            className={`px-5 py-3 text-xs font-mono font-medium flex items-center gap-2 border-b-2 transition-all shrink-0 ${
              activeTab === 'semantic'
                ? 'border-brand-purple text-dark-100 bg-dark-900'
                : 'border-transparent text-dark-400 hover:text-dark-200 hover:bg-dark-900/40'
            }`}
          >
            <Database className="w-4 h-4 text-brand-purple" />
            <span>1. Semantic Search (Pinecone)</span>
          </button>

          <button
            onClick={() => setActiveTab('bm25')}
            className={`px-5 py-3 text-xs font-mono font-medium flex items-center gap-2 border-b-2 transition-all shrink-0 ${
              activeTab === 'bm25'
                ? 'border-brand-blue text-dark-100 bg-dark-900'
                : 'border-transparent text-dark-400 hover:text-dark-200 hover:bg-dark-900/40'
            }`}
          >
            <Binary className="w-4 h-4 text-brand-blue" />
            <span>2. BM25 Search (Sparse)</span>
          </button>

          <button
            onClick={() => setActiveTab('rrf')}
            className={`px-5 py-3 text-xs font-mono font-medium flex items-center gap-2 border-b-2 transition-all shrink-0 ${
              activeTab === 'rrf'
                ? 'border-emerald-400 text-dark-100 bg-dark-900'
                : 'border-transparent text-dark-400 hover:text-dark-200 hover:bg-dark-900/40'
            }`}
          >
            <GitMerge className="w-4 h-4 text-emerald-400" />
            <span>3. Reciprocal Rank Fusion (k=60)</span>
          </button>

          <button
            onClick={() => setActiveTab('rerank')}
            className={`px-5 py-3 text-xs font-mono font-medium flex items-center gap-2 border-b-2 transition-all shrink-0 ${
              activeTab === 'rerank'
                ? 'border-brand-purple text-dark-100 bg-dark-900'
                : 'border-transparent text-dark-400 hover:text-dark-200 hover:bg-dark-900/40'
            }`}
          >
            <Sparkles className="w-4 h-4 text-brand-purple" />
            <span>4. Cross-Encoder Reranking</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 space-y-4">
          {/* Section 1: Semantic Search */}
          {activeTab === 'semantic' && (
            <div className="space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-dark-800">
                <span className="text-dark-300 font-semibold flex items-center gap-2">
                  <Database className="w-4 h-4 text-brand-purple" />
                  <span>Pinecone Dense Vector Retrieval Layer</span>
                </span>
                <Badge variant="purple">text-embedding-3 / all-MiniLM-L6-v2</Badge>
              </div>

              <div className="p-3.5 rounded-lg bg-dark-950 border border-dark-800 space-y-2">
                <div className="text-[11px] text-dark-400 uppercase">Retrieved Document Citations from Backend:</div>
                {sources.length === 0 ? (
                  <p className="text-dark-500 font-sans text-xs">
                    {route === 'web_search'
                      ? 'Semantic retrieval bypassed for web research route.'
                      : 'No retrieved document citations available. Run a Knowledge Base query in AI Assistant.'}
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {sources.map((s, idx) => (
                      <div key={idx} className="p-2.5 rounded bg-dark-900 border border-dark-800 flex items-center justify-between">
                        <span className="text-dark-200 flex items-center gap-2">
                          <FileText className="w-3.5 h-3.5 text-brand-purple" />
                          <span>Document #{s.document_id}</span>
                        </span>
                        <span className="text-dark-400">Page {s.page_number}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-3 rounded bg-dark-900/60 border border-dark-800 text-[11px] text-dark-400 flex items-start gap-2">
                <Info className="w-4 h-4 text-dark-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  The backend executes semantic similarity query via <code className="text-dark-200">core/vector_utils.py:semantic_search(query, department_id, top_k=10)</code> against Pinecone index <code className="text-dark-200">novaretail-index</code>. Isolated per user department partition.
                </p>
              </div>
            </div>
          )}

          {/* Section 2: BM25 Search */}
          {activeTab === 'bm25' && (
            <div className="space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-dark-800">
                <span className="text-dark-300 font-semibold flex items-center gap-2">
                  <Binary className="w-4 h-4 text-brand-blue" />
                  <span>Sparse Keyword Retrieval Layer (Rank-BM25)</span>
                </span>
                <Badge variant="blue">BM25Okapi</Badge>
              </div>

              <div className="p-3.5 rounded-lg bg-dark-950 border border-dark-800 space-y-2">
                <div className="text-[11px] text-dark-400 uppercase">BM25 Token Matching Engine:</div>
                <p className="text-dark-300 font-sans text-xs leading-relaxed">
                  Implemented via <code className="text-dark-100 font-mono">core/vector_utils.py:bm25_search(query, department_id, top_k=10)</code>. Tokenizes query terms and evaluates exact term frequencies over chunk documents belonging to the user's assigned department.
                </p>
              </div>

              <div className="p-3 rounded bg-dark-900/60 border border-dark-800 text-[11px] text-dark-400 flex items-start gap-2">
                <Info className="w-4 h-4 text-dark-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  BM25 scores and tokenized corpus terms are computed in-memory during request processing and fused into RRF candidates.
                </p>
              </div>
            </div>
          )}

          {/* Section 3: RRF Fusion */}
          {activeTab === 'rrf' && (
            <div className="space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-dark-800">
                <span className="text-dark-300 font-semibold flex items-center gap-2">
                  <GitMerge className="w-4 h-4 text-emerald-400" />
                  <span>Reciprocal Rank Fusion Implementation</span>
                </span>
                <Badge variant="emerald">Constant k = 60</Badge>
              </div>

              <div className="p-4 rounded-lg bg-dark-950 border border-dark-800 space-y-2">
                <div className="text-dark-400 text-[11px]">Fusion Mathematical Formula:</div>
                <div className="text-sm font-semibold text-brand-purple">
                  RRF(d) = Σ [ 1 / (60 + rank_i(d)) ]
                </div>
                <p className="text-dark-400 font-sans text-xs leading-relaxed mt-2">
                  Implemented in <code className="text-dark-200">core/vector_utils.py:reciprocal_rank_fusion(semantic_results, bm25_results, k=60, top_k=20)</code>. Normalizes disparity between cosine floats ($0.0 - 1.0$) and unbounded BM25 scores ($0.0 - 25.0+$).
                </p>
              </div>
            </div>
          )}

          {/* Section 4: Cross-Encoder Reranking */}
          {activeTab === 'rerank' && (
            <div className="space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-dark-800">
                <span className="text-dark-300 font-semibold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-purple" />
                  <span>Neural Cross-Encoder Reranking Layer</span>
                </span>
                <Badge variant="purple">ms-marco-MiniLM-L-6-v2</Badge>
              </div>

              <div className="p-4 rounded-lg bg-dark-950 border border-dark-800 space-y-2">
                <div className="text-dark-400 text-[11px]">Reranker Model Specifications:</div>
                <div className="text-sm font-semibold text-dark-100">
                  cross-encoder/ms-marco-MiniLM-L-6-v2
                </div>
                <p className="text-dark-400 font-sans text-xs leading-relaxed mt-2">
                  Implemented in <code className="text-dark-200">core/vector_utils.py:rerank_results(query, search_results, top_k=5)</code>. Concatenates query and candidate chunk into a single sequence for full bidirectional transformer attention, returning the top 5 most relevant passages for LLM answer generation.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

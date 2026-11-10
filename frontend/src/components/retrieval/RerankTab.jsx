import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus, Sparkles } from 'lucide-react';
import Badge from '../common/Badge';

export default function RerankTab({ results = [], model = 'cross-encoder/ms-marco-MiniLM-L-6-v2' }) {
  if (!results || results.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-dark-400 font-mono">
        No Cross-Encoder reranking results available for this trace.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Banner */}
      <div className="p-3.5 rounded-lg border border-dark-700 bg-dark-900/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand-purple" />
          <span>
            Neural Reranker: <strong className="text-dark-100">{model}</strong>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-dark-400">Total Evaluated:</span>
          <Badge variant="purple">{results.length} Candidates</Badge>
        </div>
      </div>

      {/* Visual Rank Shift Cards */}
      <div className="grid grid-cols-1 gap-3">
        {results.map((res, idx) => {
          const initial = res.initial_rank || idx + 1;
          const final = res.final_rank || idx + 1;
          const delta = initial - final;

          return (
            <div
              key={res.chunk_id || idx}
              className="p-4 rounded-lg bg-dark-950 border border-dark-800 hover:border-dark-700 transition-all font-mono"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-dark-800/80 mb-3">
                {/* Before -> After Visual Shift */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-dark-900 px-3 py-1.5 rounded border border-dark-800">
                    <span className="text-[11px] text-dark-400">RRF Rank:</span>
                    <span className="text-dark-300 font-bold">#{initial}</span>
                    <span className="text-dark-600">→</span>
                    <span className="text-[11px] text-dark-400">Reranked:</span>
                    <span className="text-emerald-400 font-bold">#{final}</span>
                  </div>

                  {delta > 0 ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <ArrowUpRight className="w-3.5 h-3.5" /> +{delta} Promoted
                    </span>
                  ) : delta < 0 ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                      <ArrowDownRight className="w-3.5 h-3.5" /> {delta} Demoted
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-dark-400 px-2 py-0.5 rounded bg-dark-850 border border-dark-800">
                      <Minus className="w-3.5 h-3.5" /> Unchanged
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className="text-dark-400">Cross-Encoder Logit:</span>
                  <span className="text-emerald-400 font-bold text-sm">
                    {(res.rerank_score || 0).toFixed(4)}
                  </span>
                </div>
              </div>

              {/* Chunk metadata and text */}
              <div className="flex items-center gap-2 mb-2 text-xs">
                <span className="text-dark-200 font-semibold">Chunk #{res.chunk_id}</span>
                <span className="text-dark-500">•</span>
                <span className="text-dark-400">Doc #{res.document_id}</span>
                <span className="text-dark-500">•</span>
                <span className="text-dark-400">Page {res.page_number}</span>
              </div>

              <p className="text-xs text-dark-300 font-sans leading-relaxed bg-dark-900/60 p-3 rounded border border-dark-850">
                {res.content}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}


import React from 'react';
import Badge from '../common/Badge';

export default function RRFTab({ candidates = [], kConstant = 60 }) {
  if (!candidates || candidates.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-dark-400 font-mono">
        No RRF fusion data available for this trace.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Banner */}
      <div className="p-3.5 rounded-lg border border-dark-700 bg-dark-900/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
        <div>
          <span className="text-dark-400">Reciprocal Rank Fusion Formulation:</span>
          <div className="text-brand-purple font-semibold text-sm mt-0.5">
            RRF_score(d) = Σ [ 1 / ({kConstant} + rank_i(d)) ]
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="purple">k = {kConstant}</Badge>
          <Badge variant="dark">{candidates.length} Fused Candidates</Badge>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto rounded-lg border border-dark-800 bg-dark-950">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-dark-900 text-dark-400 border-b border-dark-800">
            <tr>
              <th className="py-2.5 px-3 font-semibold text-center w-16">Final Rank</th>
              <th className="py-2.5 px-3 font-semibold">Chunk & Document</th>
              <th className="py-2.5 px-3 font-semibold text-center">Semantic Rank (Dense)</th>
              <th className="py-2.5 px-3 font-semibold text-center">BM25 Rank (Sparse)</th>
              <th className="py-2.5 px-3 font-semibold text-right">RRF Score</th>
              <th className="py-2.5 px-3 font-semibold">Content Preview</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-800/80">
            {candidates.map((item, idx) => (
              <tr key={item.chunk_id || idx} className="hover:bg-dark-900/60 transition-colors">
                <td className="py-3 px-3 text-center">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded bg-brand-purple/20 text-brand-purple border border-brand-purple/30 font-bold text-xs">
                    #{item.final_rank || idx + 1}
                  </span>
                </td>
                <td className="py-3 px-3 whitespace-nowrap">
                  <div className="text-dark-100 font-semibold">Chunk #{item.chunk_id}</div>
                  <div className="text-[11px] text-dark-500">
                    Doc #{item.document_id} • Page {item.page_number}
                  </div>
                </td>
                <td className="py-3 px-3 text-center">
                  {item.semantic_rank ? (
                    <div>
                      <span className="text-emerald-400 font-semibold">#{item.semantic_rank}</span>
                      {item.semantic_score && (
                        <div className="text-[10px] text-dark-500">{(item.semantic_score).toFixed(3)}</div>
                      )}
                    </div>
                  ) : (
                    <span className="text-dark-600">—</span>
                  )}
                </td>
                <td className="py-3 px-3 text-center">
                  {item.bm25_rank ? (
                    <div>
                      <span className="text-cyan-400 font-semibold">#{item.bm25_rank}</span>
                      {item.bm25_score && (
                        <div className="text-[10px] text-dark-500">{(item.bm25_score).toFixed(2)}</div>
                      )}
                    </div>
                  ) : (
                    <span className="text-dark-600">—</span>
                  )}
                </td>
                <td className="py-3 px-3 text-right">
                  <div className="text-dark-100 font-bold font-mono">
                    {typeof item.rrf_score === 'number' ? item.rrf_score.toFixed(5) : item.rrf_score}
                  </div>
                </td>
                <td className="py-3 px-3 text-xs text-dark-400 font-sans max-w-sm truncate">
                  {item.content_preview || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


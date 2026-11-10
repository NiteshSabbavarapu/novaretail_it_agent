import React from 'react';
import { Binary } from 'lucide-react';
import Badge from '../common/Badge';

export default function BM25Tab({ matches = [] }) {
  if (!matches || matches.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-dark-400 font-mono">
        No BM25 keyword matches found for this trace.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs font-mono text-dark-400 pb-2 border-b border-dark-800">
        <span>Sparse BM25 Keyword Frequency (Rank-BM25)</span>
        <Badge variant="blue">BM25Okapi</Badge>
      </div>

      <div className="space-y-3">
        {matches.map((item, idx) => (
          <div
            key={item.chunk_id || idx}
            className="p-4 rounded-lg bg-dark-900 border border-dark-800 hover:border-brand-blue/40 transition-all font-mono"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 pb-2 border-b border-dark-800/80">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-brand-blue/20 text-brand-blue border border-brand-blue/30 flex items-center justify-center font-bold text-xs">
                  #{item.rank || idx + 1}
                </span>
                <span className="text-dark-100 font-semibold text-xs">Chunk #{item.chunk_id}</span>
                <span className="text-dark-400 text-xs">
                  {item.document_title || `Doc #${item.document_id}`}
                </span>
                <Badge variant="dark" size="xs">Page {item.page_number}</Badge>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-dark-400">BM25 Score:</span>
                <span className="text-cyan-400 font-bold text-sm">
                  {(item.score || 0).toFixed(2)}
                </span>
              </div>
            </div>

            {item.matched_terms && (
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-[10px] text-dark-500 uppercase">Matched Terms:</span>
                <div className="flex flex-wrap gap-1">
                  {item.matched_terms.map((t, tid) => (
                    <span key={tid} className="px-1.5 py-0.5 rounded bg-dark-800 text-cyan-300 text-[10px]">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <p className="text-xs text-dark-300 font-sans leading-relaxed">
              {item.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}


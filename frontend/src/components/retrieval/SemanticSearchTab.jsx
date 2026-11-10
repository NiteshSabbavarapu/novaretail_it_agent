import React from 'react';
import { Database, Search } from 'lucide-react';
import Badge from '../common/Badge';

export default function SemanticSearchTab({ matches = [] }) {
  if (!matches || matches.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-dark-400 font-mono">
        No semantic search vector matches found for this trace.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs font-mono text-dark-400 pb-2 border-b border-dark-800">
        <span>Pinecone Dense Vector Results (Top {matches.length})</span>
        <Badge variant="purple">Cosine Similarity</Badge>
      </div>

      <div className="space-y-3">
        {matches.map((item, idx) => (
          <div
            key={item.chunk_id || idx}
            className="p-4 rounded-lg bg-dark-900 border border-dark-800 hover:border-brand-purple/40 transition-all font-mono"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 pb-2 border-b border-dark-800/80">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-brand-purple/20 text-brand-purple border border-brand-purple/30 flex items-center justify-center font-bold text-xs">
                  #{item.rank || idx + 1}
                </span>
                <span className="text-dark-100 font-semibold text-xs">Chunk #{item.chunk_id}</span>
                <span className="text-dark-400 text-xs">
                  {item.document_title || `Doc #${item.document_id}`}
                </span>
                <Badge variant="dark" size="xs">Page {item.page_number}</Badge>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-dark-400">Score:</span>
                <span className="text-emerald-400 font-bold text-sm">
                  {(item.score || 0).toFixed(4)}
                </span>
              </div>
            </div>

            <p className="text-xs text-dark-300 font-sans leading-relaxed">
              {item.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}


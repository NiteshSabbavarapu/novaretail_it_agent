import React from 'react';
import { Database, Binary, Info, CheckCircle2 } from 'lucide-react';
import Badge from '../../common/Badge';

export default function HybridRetrievalStage({ data }) {
  if (!data) return <p className="text-xs text-dark-400">No retrieval telemetry available.</p>;

  if (data.reason) {
    return (
      <div className="p-3 rounded bg-dark-900 border border-dark-750 text-xs text-dark-400 font-mono">
        {data.reason}
      </div>
    );
  }

  const verifiedSources = data.verified_sources || [];

  return (
    <div className="space-y-3 font-mono text-xs">
      {/* Architecture Overview */}
      <div className="p-3 rounded bg-dark-950 border border-dark-750 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="text-dark-200">
          Architecture: <span className="text-dark-100 font-semibold">{data.architecture}</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="purple">Pinecone (Dense)</Badge>
          <Badge variant="blue">BM25Okapi (Sparse)</Badge>
        </div>
      </div>

      {/* Verified Sources Retrieved from Backend */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px] text-dark-400">
          <span className="uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Verified Retrieved Sources from Backend ({verifiedSources.length})</span>
          </span>
          <Badge variant="emerald" size="xs">Live DRF Contract</Badge>
        </div>

        {verifiedSources.length === 0 ? (
          <div className="p-3 rounded bg-dark-950 border border-dark-800 text-dark-500">
            No source documents cited for this query.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {verifiedSources.map((src, i) => (
              <div
                key={i}
                className="p-2.5 rounded bg-dark-950 border border-dark-800 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-brand-purple/20 text-brand-purple flex items-center justify-center font-bold text-[10px]">
                    #{src.rank || i + 1}
                  </span>
                  <span className="text-dark-200 font-medium">Document #{src.document_id}</span>
                </div>
                <span className="text-dark-400 text-[11px]">Page {src.page_number}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notice on unexposed intermediate floats */}
      <div className="p-3 rounded bg-dark-900 border border-dark-800 text-dark-400 flex items-start gap-2 text-[11px]">
        <Info className="w-4 h-4 text-dark-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="text-dark-300 font-semibold">Backend Implementation Note:</div>
          <p className="leading-relaxed">
            The backend executes parallel Pinecone cosine search (<code className="text-dark-200">vector_utils.py:semantic_search</code>) and Rank-BM25 term matching (<code className="text-dark-200">vector_utils.py:bm25_search</code>). Individual intermediate vector floats and sparse matrix tokens are internal to the retrieval service and not exposed in the <code className="text-dark-200">/api/search/</code> response payload.
          </p>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { Info, GitMerge, CheckCircle2 } from 'lucide-react';
import Badge from '../../common/Badge';

export default function RRFStage({ data }) {
  if (!data) return <p className="text-xs text-dark-400">No RRF telemetry available.</p>;

  if (data.reason) {
    return (
      <div className="p-3 rounded bg-dark-900 border border-dark-750 text-xs text-dark-400 font-mono">
        {data.reason}
      </div>
    );
  }

  return (
    <div className="space-y-3 font-mono text-xs">
      {/* Formulation */}
      <div className="p-3.5 rounded-lg bg-dark-950 border border-dark-750 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <span className="text-dark-400">Fusion Formulation: </span>
          <span className="text-brand-purple font-semibold">
            {data.formula || 'RRF(d) = Σ [ 1 / (60 + rank_i(d)) ]'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="purple">Constant k = {data.constant_k || 60}</Badge>
          <Badge variant="emerald">Executed on Backend</Badge>
        </div>
      </div>

      {data.rationale && (
        <p className="text-[11px] text-dark-400 leading-relaxed font-sans">
          {data.rationale}
        </p>
      )}

      {/* Notice on internal float values */}
      <div className="p-3 rounded bg-dark-900 border border-dark-800 text-dark-400 flex items-start gap-2 text-[11px]">
        <Info className="w-4 h-4 text-dark-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="text-dark-300 font-semibold">Intermediate Scores:</div>
          <p className="leading-relaxed">
            Reciprocal Rank Fusion is executed in <code className="text-dark-200">core/vector_utils.py:reciprocal_rank_fusion(..., k=60, top_k=20)</code>. Intermediate fused candidate weights are utilized internally for candidate pooling prior to reranking and are not exposed in the client response.
          </p>
        </div>
      </div>
    </div>
  );
}

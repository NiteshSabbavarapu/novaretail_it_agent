import React from 'react';
import { Sparkles, Info, CheckCircle2 } from 'lucide-react';
import Badge from '../../common/Badge';

export default function RerankingStage({ data }) {
  if (!data) return <p className="text-xs text-dark-400">No reranking telemetry available.</p>;

  if (data.reason) {
    return (
      <div className="p-3 rounded bg-dark-900 border border-dark-750 text-xs text-dark-400 font-mono">
        {data.reason}
      </div>
    );
  }

  return (
    <div className="space-y-3 font-mono text-xs">
      <div className="p-3.5 rounded bg-dark-950 border border-dark-750 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand-purple" />
          <span className="text-dark-200">
            Model: <strong className="text-dark-100">{data.model || 'cross-encoder/ms-marco-MiniLM-L-6-v2'}</strong>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="emerald">Executed on Backend</Badge>
          <Badge variant="dark">Top 5 Pool</Badge>
        </div>
      </div>

      <div className="p-3 rounded bg-dark-900 border border-dark-800 text-dark-400 flex items-start gap-2 text-[11px]">
        <Info className="w-4 h-4 text-dark-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="text-dark-300 font-semibold">Cross-Encoder Pipeline Details:</div>
          <p className="leading-relaxed">
            The cross-encoder evaluates joint query-passage pairs via full self-attention in <code className="text-dark-200">core/vector_utils.py:rerank_results()</code> to reorder top candidates. Raw prediction logits are used internally to select the top 5 chunks for LLM synthesis and are not exposed in the DRF response.
          </p>
        </div>
      </div>
    </div>
  );
}

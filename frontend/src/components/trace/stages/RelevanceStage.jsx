import React from 'react';
import { CheckCircle2, XCircle, ShieldAlert } from 'lucide-react';
import Badge from '../../common/Badge';
import JsonViewer from '../../common/JsonViewer';

export default function RelevanceStage({ data }) {
  if (!data) return <p className="text-xs text-dark-400">No relevance evaluation data.</p>;

  const isRelevant = data.evaluation_status === 'RELEVANT';

  return (
    <div className="space-y-3">
      {/* Verdict Card */}
      <div className={`p-3.5 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        isRelevant 
          ? 'bg-emerald-500/10 border-emerald-500/30' 
          : 'bg-rose-500/10 border-rose-500/30'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            isRelevant ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
          }`}>
            {isRelevant ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-dark-400">Relevance Gate Verdict</div>
            <div className={`text-sm font-semibold font-mono ${isRelevant ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isRelevant ? 'PASS — Passages Validated as Relevant' : 'FAIL — Passages Irrelevant / Insufficient'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          {data.confidence_threshold !== undefined && (
            <Badge variant="dark">Min Threshold: {data.confidence_threshold}</Badge>
          )}
          {data.max_rerank_score !== undefined && (
            <Badge variant={isRelevant ? 'emerald' : 'rose'}>
              Max Score: {data.max_rerank_score}
            </Badge>
          )}
        </div>
      </div>

      {/* Evidence & Result Description */}
      {(data.evaluation_evidence || data.evidence) && (
        <div className="p-3 rounded bg-dark-950 border border-dark-800 text-xs">
          <div className="font-mono text-[11px] text-dark-400 uppercase mb-1">Grounding Evidence</div>
          <p className="text-dark-200 leading-relaxed font-sans">
            {data.evaluation_evidence || data.evidence}
          </p>
        </div>
      )}

      {(data.result_verdict || data.evaluation_result) && (
        <div className="p-3 rounded bg-dark-900 border border-dark-800 text-xs">
          <div className="font-mono text-[11px] text-dark-400 uppercase mb-1">State Machine Action</div>
          <p className="text-dark-300 font-mono text-xs">
            {data.result_verdict || data.evaluation_result}
          </p>
        </div>
      )}

      <JsonViewer data={data} title="STAGE 06 RELEVANCE PAYLOAD" />
    </div>
  );
}


import React from 'react';
import { Compass, Sparkles, CheckCircle2 } from 'lucide-react';
import Badge from '../../common/Badge';
import JsonViewer from '../../common/JsonViewer';

export default function RouterStage({ data }) {
  if (!data) return <p className="text-xs text-dark-400">No router data available.</p>;

  const isKB = data.selected_route === 'knowledge_base';

  return (
    <div className="space-y-3">
      {/* Route Decision Card */}
      <div className="p-3.5 rounded-lg border border-dark-700 bg-dark-950/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
            isKB ? 'bg-brand-purple/20 text-brand-purple border border-brand-purple/40 shadow-glow-purple' : 'bg-brand-blue/20 text-brand-blue border border-brand-blue/40 shadow-glow-blue'
          }`}>
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-mono text-dark-400 uppercase tracking-wider">Router Decision</div>
            <div className="text-sm font-semibold font-mono text-dark-100 flex items-center gap-2">
              <span>{isKB ? 'Internal Knowledge Base' : 'External Web Search'}</span>
              <Badge variant={isKB ? 'purple' : 'blue'}>
                {data.selected_route}
              </Badge>
            </div>
          </div>
        </div>

        {data.classification_confidence && (
          <div className="flex items-center gap-2 text-right">
            <div className="text-right">
              <div className="text-[10px] font-mono text-dark-400">Router Confidence</div>
              <div className="text-xs font-mono font-semibold text-emerald-400">
                {(data.classification_confidence * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Decision Explanation */}
      {data.decision_rationale && (
        <div className="p-3 rounded bg-dark-900/90 border border-dark-700">
          <div className="text-[11px] font-mono text-dark-400 uppercase mb-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-brand-purple" />
            <span>Classification Rationale</span>
          </div>
          <p className="text-xs text-dark-200 leading-relaxed">
            {data.decision_rationale}
          </p>
        </div>
      )}

      {/* Model & Metadata Details */}
      <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
        <Badge variant="dark">Model: {data.model || 'openai/gpt-oss-120b'}</Badge>
        {data.temperature !== undefined && <Badge variant="dark">Temp: {data.temperature}</Badge>}
        {data.tokens_evaluated && <Badge variant="dark">Prompt: {data.tokens_evaluated} tokens</Badge>}
        {data.verified_by_backend && <Badge variant="emerald">Live DRF Response</Badge>}
      </div>

      <JsonViewer data={data} title="STAGE 02 PAYLOAD" />
    </div>
  );
}


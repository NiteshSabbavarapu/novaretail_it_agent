import React, { useState } from 'react';
import {
  Activity,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import StageItem from './StageItem';
import Badge from '../common/Badge';

export default function ExecutionTimeline({ trace }) {
  const [copied, setCopied] = useState(false);
  const [expandAllKey, setExpandAllKey] = useState(0);
  const [allExpanded, setAllExpanded] = useState(false);

  if (!trace) {
    return (
      <div className="h-64 rounded-xl border border-dark-800 bg-dark-900/40 flex flex-col items-center justify-center p-6 text-center">
        <Activity className="w-8 h-8 text-dark-600 mb-2" />
        <p className="text-xs text-dark-300 font-mono">No execution trace captured.</p>
        <p className="text-[11px] text-dark-500 font-mono mt-1 max-w-sm">
          Submit a query in the AI Assistant to observe live LangGraph routing, hybrid retrieval, and answer synthesis.
        </p>
      </div>
    );
  }

  const handleCopyTrace = () => {
    navigator.clipboard.writeText(JSON.stringify(trace, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleExpandAll = () => {
    setAllExpanded(!allExpanded);
    setExpandAllKey(prev => prev + 1);
  };

  return (
    <div className="space-y-4">
      {/* Real Verification Banner */}
      <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span className="font-semibold tracking-wide">
            VERIFIED BACKEND PIPELINE EXECUTION (POST /api/search/)
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          <span>Trace ID: <strong className="underline">{trace.trace_id}</strong></span>
          <span className="text-dark-500">•</span>
          <span>{trace.total_latency_ms} ms</span>
        </div>
      </div>

      {/* Query Bar */}
      <div className="p-3.5 rounded-lg border border-dark-750 bg-dark-900/90 flex items-center justify-between gap-4">
        <div className="min-w-0 font-mono">
          <div className="text-[10px] text-dark-500 uppercase tracking-wider mb-0.5">Evaluated Query</div>
          <div className="text-xs font-medium text-dark-100 truncate">
            "{trace.query}"
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={toggleExpandAll}
            className="px-2.5 py-1 rounded bg-dark-800 hover:bg-dark-750 border border-dark-700 text-dark-300 hover:text-white text-xs font-mono flex items-center gap-1.5 transition-all"
            title={allExpanded ? 'Collapse All' : 'Expand All'}
          >
            {allExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{allExpanded ? 'Collapse' : 'Expand All'}</span>
          </button>

          <button
            onClick={handleCopyTrace}
            className="px-2.5 py-1 rounded bg-dark-800 hover:bg-dark-750 border border-dark-700 text-dark-300 hover:text-white text-xs font-mono flex items-center gap-1.5 transition-all"
            title="Copy Full Trace JSON"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'JSON'}</span>
          </button>
        </div>
      </div>

      {/* Sequential Timeline */}
      <div key={expandAllKey} className="space-y-2.5">
        {(trace.stages || []).map((stage, idx) => (
          <StageItem
            key={stage.id || idx}
            stage={stage}
            defaultExpanded={allExpanded || idx === 0 || idx === 1 || idx === 2 || idx === 6}
          />
        ))}
      </div>
    </div>
  );
}

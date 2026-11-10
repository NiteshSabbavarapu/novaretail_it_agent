import React from 'react';
import { AlertTriangle, Globe, ArrowRight, ExternalLink } from 'lucide-react';
import Badge from '../../common/Badge';
import JsonViewer from '../../common/JsonViewer';

export default function FallbackStage({ data }) {
  if (!data) return <p className="text-xs text-dark-400">No fallback telemetry available.</p>;

  const fallbackOccurred = data.fallback_occurred;
  const webResults = data.web_results || [];

  return (
    <div className="space-y-3">
      {/* Fallback Banner */}
      <div className={`p-3.5 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        fallbackOccurred 
          ? 'bg-amber-500/10 border-amber-500/30' 
          : 'bg-dark-950 border-dark-700'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            fallbackOccurred ? 'bg-amber-500/20 text-amber-400 shadow-glow-amber' : 'bg-dark-800 text-dark-400'
          }`}>
            {fallbackOccurred ? <AlertTriangle className="w-5 h-5" /> : <Globe className="w-5 h-5" />}
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-dark-400">Agent Handoff Status</div>
            <div className={`text-sm font-semibold font-mono ${fallbackOccurred ? 'text-amber-400' : 'text-dark-300'}`}>
              {fallbackOccurred ? 'FALLBACK TRIGGERED — External Search Agent Handoff' : 'No Fallback Required (Primary Agent Fulfilled)'}
            </div>
          </div>
        </div>

        {data.destination_agent && (
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <span className="text-dark-400">Handoff:</span>
            <Badge variant="blue">{data.destination_agent}</Badge>
          </div>
        )}
      </div>

      {data.reason && (
        <div className="p-3 rounded bg-dark-900 border border-dark-800 text-xs text-dark-300">
          <span className="font-mono text-dark-400 uppercase text-[11px] block mb-1">Trigger Condition:</span>
          {data.reason}
        </div>
      )}

      {/* Web Search Results Preview */}
      {webResults.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-dark-400">
            <span>Tavily External Research Results ({webResults.length})</span>
            <Badge variant="blue">Web Grounding</Badge>
          </div>

          <div className="space-y-2">
            {webResults.map((item, idx) => (
              <div key={idx} className="p-2.5 rounded bg-dark-950 border border-dark-800 hover:border-dark-700 text-xs">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-brand-blue hover:underline font-medium flex items-center gap-1 truncate"
                  >
                    <span>{item.title || item.url}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                  {item.score && (
                    <span className="text-emerald-400 font-mono text-[11px] shrink-0">
                      {(item.score * 100).toFixed(0)}% match
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-dark-400 line-clamp-2 font-sans">
                  {item.snippet || item.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <JsonViewer data={data} title="STAGE 07 FALLBACK PAYLOAD" />
    </div>
  );
}


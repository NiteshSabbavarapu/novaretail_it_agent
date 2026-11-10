import React from 'react';
import { Globe, ExternalLink, CheckCircle2 } from 'lucide-react';
import Badge from '../../common/Badge';

export default function WebSearchStage({ data }) {
  if (!data) return <p className="text-xs text-dark-400">No web search telemetry available.</p>;

  if (data.reason) {
    return (
      <div className="p-3 rounded bg-dark-900 border border-dark-750 text-xs text-dark-400 font-mono">
        {data.reason}
      </div>
    );
  }

  const results = data.verified_web_results || [];

  return (
    <div className="space-y-3 font-mono text-xs">
      <div className="p-3.5 rounded-lg bg-dark-950 border border-dark-750 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-brand-blue" />
          <span className="text-dark-200">
            Engine: <strong className="text-dark-100">{data.engine}</strong>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="blue">Advanced Depth</Badge>
          <Badge variant="emerald">{results.length} Verified Citations</Badge>
        </div>
      </div>

      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((item, idx) => (
            <div key={idx} className="p-3 rounded bg-dark-950 border border-dark-800 text-xs">
              <div className="flex items-start justify-between gap-2 mb-1">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-brand-blue hover:underline font-medium flex items-center gap-1 truncate"
                >
                  <span className="truncate">{item.title || item.url}</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
                {item.score !== undefined && (
                  <span className="text-emerald-400 text-[11px] shrink-0">
                    {(item.score * 100).toFixed(0)}% score
                  </span>
                )}
              </div>
              {item.content_preview && (
                <p className="text-[11px] text-dark-400 font-sans line-clamp-2">
                  {item.content_preview}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


import React from 'react';
import Badge from '../../common/Badge';
import JsonViewer from '../../common/JsonViewer';

export default function QueryReceivedStage({ data }) {
  if (!data) return <p className="text-xs text-dark-400">No data available.</p>;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="p-3 rounded bg-dark-950/80 border border-dark-700">
          <div className="text-[11px] font-mono text-dark-400 uppercase tracking-wide mb-1">Original User Input</div>
          <p className="text-xs font-mono text-dark-100 bg-dark-900 p-2 rounded border border-dark-800 break-words">
            "{data.original_query}"
          </p>
        </div>

        {data.normalized_query && (
          <div className="p-3 rounded bg-dark-950/80 border border-dark-700">
            <div className="text-[11px] font-mono text-dark-400 uppercase tracking-wide mb-1">Preprocessed / Normalized Query</div>
            <p className="text-xs font-mono text-cyan-300 bg-dark-900 p-2 rounded border border-dark-800 break-words">
              {data.normalized_query}
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-mono">
        {data.char_length && <Badge variant="dark">Length: {data.char_length} chars</Badge>}
        {data.word_count && <Badge variant="dark">Tokens: ~{data.word_count} words</Badge>}
        {data.detected_language && <Badge variant="cyan">Lang: {data.detected_language}</Badge>}
        {data.department_name && <Badge variant="purple">Dept: {data.department_name}</Badge>}
        {data.source && <Badge variant="emerald">{data.source}</Badge>}
      </div>

      <JsonViewer data={data} title="STAGE 01 PAYLOAD" />
    </div>
  );
}


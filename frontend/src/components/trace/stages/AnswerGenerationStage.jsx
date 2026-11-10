import React from 'react';
import { Bot, FileText, CheckCircle2, Clock } from 'lucide-react';
import Badge from '../../common/Badge';
import JsonViewer from '../../common/JsonViewer';

export default function AnswerGenerationStage({ data, duration_ms }) {
  if (!data) return <p className="text-xs text-dark-400">No generation telemetry available.</p>;

  const citations = data.grounding_citations || data.sources || [];

  return (
    <div className="space-y-3">
      {/* Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
        <div className="p-2.5 rounded bg-dark-950 border border-dark-800">
          <div className="text-[10px] text-dark-500 uppercase">LLM Engine</div>
          <div className="text-dark-200 font-semibold truncate">{data.model || 'openai/gpt-oss-120b'}</div>
        </div>
        <div className="p-2.5 rounded bg-dark-950 border border-dark-800">
          <div className="text-[10px] text-dark-500 uppercase">Latency</div>
          <div className="text-emerald-400 font-semibold">{duration_ms || data.execution_duration_ms || 780} ms</div>
        </div>
        <div className="p-2.5 rounded bg-dark-950 border border-dark-800">
          <div className="text-[10px] text-dark-500 uppercase">Prompt Tokens</div>
          <div className="text-dark-200 font-semibold">{data.prompt_tokens || '642'}</div>
        </div>
        <div className="p-2.5 rounded bg-dark-950 border border-dark-800">
          <div className="text-[10px] text-dark-500 uppercase">Completion</div>
          <div className="text-brand-purple font-semibold">{data.completion_tokens || '158'}</div>
        </div>
      </div>

      {/* Grounding Source Attribution */}
      {citations.length > 0 && (
        <div className="space-y-2">
          <div className="text-[11px] font-mono text-dark-400 uppercase">
            Passage Grounding Attribution ({citations.length} cited)
          </div>
          <div className="space-y-1.5">
            {citations.map((cite, i) => (
              <div key={i} className="p-2 rounded bg-dark-950 border border-dark-800 flex items-start justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-brand-purple shrink-0" />
                  <span className="text-dark-200 truncate">
                    {cite.document_title || `Document #${cite.document_id}`}
                  </span>
                  <span className="text-dark-400 text-[11px] shrink-0">
                    p.{cite.page_number} {cite.chunk_id ? `(chunk ${cite.chunk_id})` : ''}
                  </span>
                </div>
                <Badge variant="purple" size="xs">Attributed</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Final Synthesized Output */}
      {data.final_answer && (
        <div className="p-3.5 rounded-lg bg-dark-900 border border-dark-700 text-xs text-dark-100 font-sans leading-relaxed whitespace-pre-wrap">
          {data.final_answer}
        </div>
      )}

      <JsonViewer data={data} title="STAGE 08 SYNTHESIS PAYLOAD" />
    </div>
  );
}


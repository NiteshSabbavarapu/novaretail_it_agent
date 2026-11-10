import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Clock, CheckCircle2 } from 'lucide-react';
import StatusPill from '../common/StatusPill';

import QueryReceivedStage from './stages/QueryReceivedStage';
import RouterStage from './stages/RouterStage';
import HybridRetrievalStage from './stages/HybridRetrievalStage';
import RRFStage from './stages/RRFStage';
import RerankingStage from './stages/RerankingStage';
import WebSearchStage from './stages/WebSearchStage';
import AnswerGenerationStage from './stages/AnswerGenerationStage';

export default function StageItem({ stage, defaultExpanded = false }) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const stageNumberFormatted = String(stage.stage_number || 1).padStart(2, '0');

  const renderStageContent = () => {
    switch (stage.id) {
      case 'query_received':
        return <QueryReceivedStage data={stage.data} />;
      case 'router_agent':
        return <RouterStage data={stage.data} />;
      case 'hybrid_retrieval':
        return <HybridRetrievalStage data={stage.data} />;
      case 'rrf':
        return <RRFStage data={stage.data} />;
      case 'reranking':
        return <RerankingStage data={stage.data} />;
      case 'web_search':
        return <WebSearchStage data={stage.data} />;
      case 'answer_generation':
        return <AnswerGenerationStage data={stage.data} duration_ms={stage.duration_ms} />;
      default:
        return (
          <pre className="text-xs font-mono text-dark-300 overflow-x-auto p-2 bg-dark-950 rounded">
            {JSON.stringify(stage.data, null, 2)}
          </pre>
        );
    }
  };

  const isSkipped = stage.status === 'skipped';

  return (
    <div
      className={`rounded-lg border transition-all ${
        isExpanded
          ? 'border-dark-600 bg-dark-900 shadow-lg'
          : 'border-dark-750 bg-dark-900/60 hover:border-dark-650'
      } ${isSkipped ? 'opacity-60' : ''}`}
    >
      {/* Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-4 py-3 flex items-center justify-between cursor-pointer select-none"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className={`w-7 h-7 rounded font-mono text-xs font-semibold flex items-center justify-center shrink-0 border ${
            stage.status === 'completed'
              ? 'bg-dark-800 text-dark-200 border-dark-700'
              : 'bg-dark-900 text-dark-500 border-dark-800'
          }`}>
            {stageNumberFormatted}
          </span>

          <div className="truncate">
            <h4 className="text-xs font-semibold font-mono text-dark-100 flex items-center gap-2 truncate">
              <span>{stage.name}</span>
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {stage.duration_ms !== undefined && stage.duration_ms > 0 && (
            <span className="text-[11px] font-mono text-dark-400 flex items-center gap-1">
              <Clock className="w-3 h-3 text-dark-500" />
              {stage.duration_ms}ms
            </span>
          )}

          <StatusPill status={stage.status} />

          <span className="text-dark-500 hover:text-dark-300 transition-colors">
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </span>
        </div>
      </div>

      {/* Body */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-1 border-t border-dark-800/80">
          {renderStageContent()}
        </div>
      )}
    </div>
  );
}

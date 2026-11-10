import React from 'react';
import { Activity, Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useChat } from '../context/ChatContext';
import ExecutionTimeline from '../components/trace/ExecutionTimeline';

export default function ExecutionTraces() {
  const { activeTrace, sendMessage } = useChat();
  const navigate = useNavigate();

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-dark-800">
        <div>
          <h2 className="text-base font-semibold font-mono text-dark-100 flex items-center gap-2">
            <Activity className="w-5 h-5 text-brand-purple" />
            <span>Agentic RAG Execution Traces</span>
          </h2>
          <p className="text-xs text-dark-400 font-mono mt-0.5">
            Observability timeline of the live LangGraph agent execution stages for the current query.
          </p>
        </div>

        <button
          onClick={() => navigate('/')}
          className="px-3.5 py-1.5 rounded-lg bg-dark-800 hover:bg-dark-750 border border-dark-700 text-xs font-mono text-dark-200 flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <span>Open AI Assistant</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Timeline Content */}
      <div className="p-5 rounded-xl border border-dark-700 bg-dark-900/90 shadow-xl">
        <ExecutionTimeline trace={activeTrace} />
      </div>
    </div>
  );
}

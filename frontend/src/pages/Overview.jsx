import React from 'react';
import {
  Activity,
  Database,
  Layers,
  MessageSquare,
  Bot,
  ArrowRight,
  ShieldCheck,
  Server,
  Sparkles,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import { documentService } from '../services/documentService';
import Badge from '../components/common/Badge';

export default function Overview() {
  const navigate = useNavigate();
  const { conversations, activeTrace } = useChat();
  const { username } = useAuth();

  const documents = documentService.getStoredDocuments();

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Product Hero Banner */}
      <div className="p-6 rounded-xl border border-dark-700 bg-gradient-to-r from-dark-900 via-dark-900 to-dark-850 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1 font-mono">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-dark-100 tracking-tight">
              NovaRetail Agentic RAG Platform
            </h2>
            <Badge variant="purple">Enterprise v1.0</Badge>
          </div>
          <p className="text-xs text-dark-400 font-sans leading-relaxed max-w-xl">
            AI-powered internal IT support and enterprise policy copilot. Features LangGraph query routing, Pinecone + BM25 hybrid retrieval, Reciprocal Rank Fusion, Cross-Encoder reranking, and Groq-hosted LLM generation.
          </p>
        </div>

        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-brand-purple to-brand-blue text-white font-mono text-xs font-medium hover:opacity-95 shadow-glow-purple flex items-center gap-2 shrink-0 self-start sm:self-auto"
        >
          <Bot className="w-4 h-4" />
          <span>Launch Assistant</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Verified System Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
        <div className="p-4 rounded-xl border border-dark-750 bg-dark-900/90 space-y-1">
          <div className="flex items-center justify-between text-dark-500 text-[10px] uppercase">
            <span>Documents</span>
            <Database className="w-3.5 h-3.5 text-brand-purple" />
          </div>
          <div className="text-xl font-bold text-dark-100">{documents.length}</div>
          <div className="text-[10px] text-dark-400">Department 1 (IT)</div>
        </div>

        <div className="p-4 rounded-xl border border-dark-750 bg-dark-900/90 space-y-1">
          <div className="flex items-center justify-between text-dark-500 text-[10px] uppercase">
            <span>Indexed Chunks</span>
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400">27</div>
          <div className="text-[10px] text-dark-400">Pinecone Vector Store</div>
        </div>

        <div className="p-4 rounded-xl border border-dark-750 bg-dark-900/90 space-y-1">
          <div className="flex items-center justify-between text-dark-500 text-[10px] uppercase">
            <span>Active Sessions</span>
            <MessageSquare className="w-3.5 h-3.5 text-brand-blue" />
          </div>
          <div className="text-xl font-bold text-dark-100">{conversations.length}</div>
          <div className="text-[10px] text-dark-400">Linked to PostgreSQL</div>
        </div>

        <div className="p-4 rounded-xl border border-dark-750 bg-dark-900/90 space-y-1">
          <div className="flex items-center justify-between text-dark-500 text-[10px] uppercase">
            <span>Department</span>
            <ShieldCheck className="w-3.5 h-3.5 text-brand-purple" />
          </div>
          <div className="text-xl font-bold text-dark-100">IT (#1)</div>
          <div className="text-[10px] text-dark-400">Isolated Partition</div>
        </div>
      </div>

      {/* Infrastructure & Stack Verification Table */}
      <div className="p-5 rounded-xl border border-dark-700 bg-dark-900/90 shadow-xl space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between pb-2 border-b border-dark-800">
          <h3 className="text-xs font-semibold text-dark-100 uppercase tracking-wide flex items-center gap-2">
            <Server className="w-4 h-4 text-brand-purple" />
            <span>Connected RAG Architecture Stack</span>
          </h3>
          <Badge variant="emerald">Live Verified</Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-dark-950 border border-dark-800 space-y-1">
            <span className="text-[10px] text-dark-500 uppercase">Router & Agent Graph</span>
            <div className="text-dark-200 font-semibold">LangGraph (StateGraph)</div>
            <div className="text-[11px] text-dark-400">Conditional routing: Knowledge Base vs Web Search</div>
          </div>

          <div className="p-3 rounded-lg bg-dark-950 border border-dark-800 space-y-1">
            <span className="text-[10px] text-dark-500 uppercase">Primary LLM Backbone</span>
            <div className="text-dark-200 font-semibold">openai/gpt-oss-120b</div>
            <div className="text-[11px] text-dark-400">Groq high-speed inference client</div>
          </div>

          <div className="p-3 rounded-lg bg-dark-950 border border-dark-800 space-y-1">
            <span className="text-[10px] text-dark-500 uppercase">Dense Vector Store & Embeddings</span>
            <div className="text-dark-200 font-semibold">Pinecone (novaretail-index)</div>
            <div className="text-[11px] text-dark-400">sentence-transformers/all-MiniLM-L6-v2 (384-dim)</div>
          </div>

          <div className="p-3 rounded-lg bg-dark-950 border border-dark-800 space-y-1">
            <span className="text-[10px] text-dark-500 uppercase">Hybrid Ranking & Fusion</span>
            <div className="text-dark-200 font-semibold">Rank-BM25 + RRF (k=60) + Cross-Encoder</div>
            <div className="text-[11px] text-dark-400">cross-encoder/ms-marco-MiniLM-L-6-v2</div>
          </div>
        </div>
      </div>

      {/* Recent Session Trace (if active) */}
      {activeTrace && (
        <div className="p-5 rounded-xl border border-dark-700 bg-dark-900/90 shadow-xl space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-dark-800">
            <span className="text-xs font-semibold text-dark-100 uppercase tracking-wide flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Latest Evaluated Query in Session</span>
            </span>
            <button
              onClick={() => navigate('/traces')}
              className="text-brand-purple hover:underline text-[11px] flex items-center gap-1"
            >
              <span>View 7-Stage Trace</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="p-3 rounded bg-dark-950 border border-dark-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-dark-100 font-medium truncate">"{activeTrace.query}"</span>
            <div className="flex items-center gap-2 shrink-0">
              <Badge variant={activeTrace.route === 'web_search' ? 'blue' : 'purple'}>
                {activeTrace.route}
              </Badge>
              <span className="text-dark-500">{activeTrace.total_latency_ms} ms</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

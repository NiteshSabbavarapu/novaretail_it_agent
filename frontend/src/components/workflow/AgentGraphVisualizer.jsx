import React, { useState } from 'react';
import {
  Compass,
  Database,
  Globe,
  Bot,
  Layers,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import Badge from '../common/Badge';
import StatusPill from '../common/StatusPill';

export default function AgentGraphVisualizer({ trace }) {
  const [selectedNodeId, setSelectedNodeId] = useState('router');

  const route = trace?.route || 'knowledge_base';

  const nodes = [
    {
      id: 'router',
      label: 'Router Agent Node',
      icon: Compass,
      status: 'completed',
      type: 'decision',
      description: 'Zero-shot classification prompt directing query to either internal knowledge base or external research.',
      implementation: 'core/agents.py:router_node',
      model: 'openai/gpt-oss-120b (ChatGroq)',
      input: trace?.query || 'User Query String',
      output: `route: "${route}"`,
      prompt: 'Classify whether query asks about internal company information/documents/policies (knowledge_base) or public external facts (web_search).',
    },
    {
      id: 'knowledge_base',
      label: 'Knowledge Base Node',
      icon: Database,
      status: route === 'knowledge_base' ? 'completed' : 'skipped',
      type: 'retriever',
      description: 'Executes hybrid Pinecone vector search + BM25Okapi, merges candidates with RRF (k=60), reranks top passages with Cross-Encoder, and synthesizes answer.',
      implementation: 'core/agents.py:knowledge_base_node',
      model: 'openai/gpt-oss-120b & Cross-Encoder MiniLM-L6',
      input: `query: "${trace?.query || ''}", department_id: 1, top_k: 5`,
      output: trace?.stages?.find(s => s.id === 'answer_generation')?.data?.final_response || 'Synthesized answer using retrieved chunks',
      prompt: 'Answer using only the provided context from retrieved chunks. Return plain text only.',
    },
    {
      id: 'web_search',
      label: 'Web Search Node',
      icon: Globe,
      status: route === 'web_search' ? 'completed' : 'skipped',
      type: 'researcher',
      description: 'Queries Tavily Search API with advanced search depth and synthesizes answer using cited internet sources.',
      implementation: 'core/agents.py:web_search_node',
      model: 'openai/gpt-oss-120b (ChatGroq) + Tavily',
      input: `query: "${trace?.query || ''}", search_depth: "advanced"`,
      output: trace?.stages?.find(s => s.id === 'answer_generation')?.data?.final_response || 'Synthesized answer with web citations',
      prompt: 'Answer using provided web search results. Include relevant source URLs.',
    }
  ];

  const selectedNode = nodes.find(n => n.id === selectedNodeId) || nodes[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Visual Workflow Diagram */}
      <div className="lg:col-span-8 space-y-4">
        <div className="p-6 rounded-xl border border-dark-700 bg-dark-900/90 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-dark-800">
            <div>
              <h3 className="text-sm font-semibold font-mono text-dark-100 flex items-center gap-2">
                <Layers className="w-4 h-4 text-brand-purple" />
                <span>LangGraph State Graph Architecture</span>
              </h3>
              <p className="text-[11px] text-dark-400 font-mono mt-0.5">
                Exact compiled graph defined in <code className="text-dark-200">core/agents.py:agent_graph</code>
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                Active Path
              </span>
              <span className="flex items-center gap-1.5 text-dark-500">
                <span className="w-2 h-2 rounded-full bg-dark-700"></span>
                Skipped Branch
              </span>
            </div>
          </div>

          {/* Graph Visualizer */}
          <div className="max-w-md mx-auto py-4 space-y-4 font-mono">
            {/* START */}
            <div className="flex flex-col items-center">
              <div className="px-3.5 py-1 rounded-full bg-dark-800 border border-dark-700 text-xs text-dark-300 font-semibold">
                START
              </div>
              <div className="w-[1.5px] h-6 bg-brand-purple" />
            </div>

            {/* Router Node */}
            <div className="flex justify-center">
              <div
                onClick={() => setSelectedNodeId('router')}
                className={`w-56 p-3.5 rounded-lg border cursor-pointer transition-all ${
                  selectedNodeId === 'router'
                    ? 'border-brand-purple shadow-glow-purple bg-dark-850'
                    : 'border-dark-600 bg-dark-900 hover:border-dark-500'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="w-6 h-6 rounded bg-brand-purple/20 text-brand-purple flex items-center justify-center">
                    <Compass className="w-3.5 h-3.5" />
                  </div>
                  <Badge variant="purple" size="xs">router_node</Badge>
                </div>
                <div className="text-xs font-semibold text-dark-100">Router Agent</div>
                <div className="text-[10px] text-dark-400 mt-0.5">Intent classification</div>
              </div>
            </div>

            {/* Conditional Branching Fork */}
            <div className="relative py-2">
              <div className="flex items-center justify-center">
                <div className="w-full max-w-sm h-[1.5px] bg-dark-700 relative">
                  <div
                    className={`absolute top-0 bottom-0 h-full ${
                      route === 'knowledge_base' ? 'left-0 w-1/2 bg-emerald-400' : 'right-0 w-1/2 bg-emerald-400'
                    }`}
                  />
                </div>
              </div>
              <div className="flex justify-between max-w-sm mx-auto text-[10px] text-dark-400 pt-1 px-4">
                <span className={route === 'knowledge_base' ? 'text-emerald-400 font-semibold' : 'text-dark-500'}>
                  [if knowledge_base]
                </span>
                <span className={route === 'web_search' ? 'text-emerald-400 font-semibold' : 'text-dark-500'}>
                  [if web_search]
                </span>
              </div>
            </div>

            {/* Parallel Node Columns */}
            <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
              {/* Left Column: Knowledge Base */}
              <div className="space-y-4 flex flex-col items-center">
                <div
                  onClick={() => setSelectedNodeId('knowledge_base')}
                  className={`w-full p-3.5 rounded-lg border cursor-pointer transition-all ${
                    selectedNodeId === 'knowledge_base'
                      ? 'border-brand-purple shadow-glow-purple bg-dark-850'
                      : route === 'knowledge_base'
                      ? 'border-emerald-500/40 bg-dark-900 hover:border-emerald-500/60'
                      : 'border-dark-800 bg-dark-950/60 opacity-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="w-6 h-6 rounded bg-brand-purple/20 text-brand-purple flex items-center justify-center">
                      <Database className="w-3.5 h-3.5" />
                    </div>
                    <StatusPill status={route === 'knowledge_base' ? 'completed' : 'skipped'} />
                  </div>
                  <div className="text-xs font-semibold text-dark-100">Knowledge Base</div>
                  <div className="text-[10px] text-dark-400 mt-0.5">Hybrid + RRF + Cross-Encoder</div>
                </div>

                <div className={`w-[1.5px] h-6 ${route === 'knowledge_base' ? 'bg-emerald-400' : 'bg-dark-800'}`} />
              </div>

              {/* Right Column: Web Search */}
              <div className="space-y-4 flex flex-col items-center">
                <div
                  onClick={() => setSelectedNodeId('web_search')}
                  className={`w-full p-3.5 rounded-lg border cursor-pointer transition-all ${
                    selectedNodeId === 'web_search'
                      ? 'border-brand-blue shadow-glow-blue bg-dark-850'
                      : route === 'web_search'
                      ? 'border-emerald-500/40 bg-dark-900 hover:border-emerald-500/60'
                      : 'border-dark-800 bg-dark-950/60 opacity-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="w-6 h-6 rounded bg-brand-blue/20 text-brand-blue flex items-center justify-center">
                      <Globe className="w-3.5 h-3.5" />
                    </div>
                    <StatusPill status={route === 'web_search' ? 'completed' : 'skipped'} />
                  </div>
                  <div className="text-xs font-semibold text-dark-100">Web Search</div>
                  <div className="text-[10px] text-dark-400 mt-0.5">Tavily client + Groq</div>
                </div>

                <div className={`w-[1.5px] h-6 ${route === 'web_search' ? 'bg-emerald-400' : 'bg-dark-800'}`} />
              </div>
            </div>

            {/* Convergence to END */}
            <div className="flex flex-col items-center">
              <div className="w-full max-w-sm h-[1.5px] bg-dark-700 relative">
                <div className="absolute inset-0 bg-emerald-400" />
              </div>
              <div className="w-[1.5px] h-6 bg-emerald-400" />
              <div className="px-3.5 py-1 rounded-full bg-dark-800 border border-dark-700 text-xs text-dark-300 font-semibold">
                END
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Node Inspector Drawer */}
      <div className="lg:col-span-4 space-y-4">
        <div className="p-5 rounded-xl border border-dark-700 bg-dark-900/90 shadow-xl space-y-4 sticky top-20 font-mono text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-dark-800">
            <div className="flex items-center gap-2">
              <selectedNode.icon className="w-4 h-4 text-brand-purple" />
              <h4 className="text-sm font-semibold text-dark-100">
                {selectedNode.label}
              </h4>
            </div>
            <StatusPill status={selectedNode.status} />
          </div>

          <p className="text-dark-300 font-sans leading-relaxed text-xs">
            {selectedNode.description}
          </p>

          <div className="space-y-3">
            <div className="p-3 rounded bg-dark-950 border border-dark-800">
              <div className="text-[10px] text-dark-500 uppercase mb-1">Code Implementation</div>
              <div className="text-dark-200 text-[11px] font-semibold">{selectedNode.implementation}</div>
            </div>

            <div className="p-3 rounded bg-dark-950 border border-dark-800">
              <div className="text-[10px] text-dark-500 uppercase mb-1">Model / Service</div>
              <div className="text-dark-200 text-[11px]">{selectedNode.model}</div>
            </div>

            <div className="p-3 rounded bg-dark-950 border border-dark-800">
              <div className="text-[10px] text-dark-500 uppercase mb-1">Current State Input</div>
              <div className="text-dark-300 text-[11px] break-words">{selectedNode.input}</div>
            </div>

            <div className="p-3 rounded bg-dark-950 border border-dark-800">
              <div className="text-[10px] text-dark-500 uppercase mb-1">Current State Output</div>
              <div className="text-emerald-400 text-[11px] break-words">{selectedNode.output}</div>
            </div>

            <div className="p-3 rounded bg-dark-950 border border-dark-800">
              <div className="text-[10px] text-dark-500 uppercase mb-1">Node Prompt Rules</div>
              <p className="text-dark-400 font-sans text-[11px] leading-relaxed">
                {selectedNode.prompt}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

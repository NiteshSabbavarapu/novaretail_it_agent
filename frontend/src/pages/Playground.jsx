import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Clock,
  Compass,
  FileText,
  Globe,
  Plus,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  MessageSquare,
  AlertCircle,
  ExternalLink,
  Wrench,
} from 'lucide-react';
import { useChat } from '../context/ChatContext';
import Badge from '../components/common/Badge';
import MarkdownMessage from '../components/common/MarkdownMessage';

export default function Assistant() {
  const {
    conversations,
    currentConversationId,
    currentMessages,
    selectConversation,
    createNewConversation,
    sendMessage,
    setActiveTrace,
    isLoading,
    error,
  } = useChat();

  const navigate = useNavigate();
  const [inputText, setInputText] = useState('');
  const [expandedDetails, setExpandedDetails] = useState({});
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages, isLoading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    sendMessage(inputText);
    setInputText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const toggleExecutionDetails = (msgId) => {
    setExpandedDetails(prev => ({
      ...prev,
      [msgId]: !prev[msgId]
    }));
  };

  const handleViewFullTrace = (trace) => {
    if (trace) {
      setActiveTrace(trace);
      navigate('/traces');
    }
  };

  return (
    <div className="h-[calc(100vh-3.5rem)] flex overflow-hidden bg-dark-950">
      {/* Conversation Thread Sidebar */}
      <div className="w-64 border-r border-dark-750 bg-dark-950 flex flex-col shrink-0 hidden md:flex">
        <div className="p-3 border-b border-dark-750 flex items-center justify-between">
          <span className="text-xs font-mono text-dark-400 uppercase tracking-wider">
            Conversations
          </span>
          <button
            onClick={createNewConversation}
            className="p-1.5 rounded-md bg-dark-850 hover:bg-dark-800 text-dark-200 hover:text-white border border-dark-700 transition-colors flex items-center gap-1 text-xs font-mono"
            title="New Conversation"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-xs font-mono text-dark-500">
              No previous threads.
            </div>
          ) : (
            conversations.map((c) => {
              const isSelected = c.id === currentConversationId;
              return (
                <div
                  key={c.id}
                  onClick={() => selectConversation(c.id)}
                  className={`p-2.5 rounded-lg text-xs font-mono cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-dark-800 text-dark-100 border border-dark-600 shadow-inner-dark'
                      : 'text-dark-400 hover:text-dark-200 hover:bg-dark-900/60'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <MessageSquare className="w-3.5 h-3.5 shrink-0 text-dark-500" />
                    <span className="truncate">{c.title || `Conversation #${c.id}`}</span>
                  </div>
                  {c.route && (
                    <span className="text-[9px] px-1 py-0.2 rounded bg-dark-850 text-dark-400 border border-dark-700 shrink-0">
                      {c.route === 'web_search' ? 'Web' : 'KB'}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Column */}
      <div className="flex-1 flex flex-col min-w-0 bg-dark-950">
        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {currentMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-purple to-brand-blue flex items-center justify-center shadow-glow-purple">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div className="space-y-1 max-w-md">
                <h3 className="text-sm font-semibold font-mono text-dark-100">
                  NovaRetail Enterprise IT Support
                </h3>
                <p className="text-xs text-dark-400 font-mono">
                  Interactive AI IT Support Engineer. Troubleshoot access, VPN, service availability, and enterprise technical issues step-by-step.
                </p>
              </div>

              {/* Sample Prompts */}
              <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg w-full text-left">
                <button
                  onClick={() => sendMessage('I cannot access NovaRetail.')}
                  className="p-3 rounded-lg border border-dark-750 bg-dark-900/80 hover:border-brand-purple/40 hover:bg-dark-900 text-xs font-mono text-dark-300 hover:text-dark-100 transition-all"
                >
                  <div className="text-[10px] text-brand-purple uppercase font-semibold mb-1 flex items-center gap-1">
                    <Wrench className="w-3 h-3" />
                    <span>Troubleshooting Diagnostic</span>
                  </div>
                  "I cannot access NovaRetail."
                </button>

                <button
                  onClick={() => sendMessage('Check if NovaRetail service is currently running.')}
                  className="p-3 rounded-lg border border-dark-750 bg-dark-900/80 hover:border-emerald-500/40 hover:bg-dark-900 text-xs font-mono text-dark-300 hover:text-dark-100 transition-all"
                >
                  <div className="text-[10px] text-emerald-400 uppercase font-semibold mb-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Service Health Check</span>
                  </div>
                  "Check if NovaRetail service is currently running."
                </button>
              </div>
            </div>
          ) : (
            currentMessages.map((msg) => {
              const isDetailsOpen = expandedDetails[msg.id];
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 max-w-3xl ${
                    msg.role === 'user' ? 'ml-auto justify-end' : 'mr-auto justify-start'
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-lg bg-brand-purple/20 border border-brand-purple/30 text-brand-purple flex items-center justify-center shrink-0 mt-1 shadow-glow-purple">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div className={`space-y-2 ${msg.role === 'user' ? 'max-w-xl' : 'flex-1'}`}>
                    {/* Header Route Indicator */}
                    {msg.role === 'assistant' && !msg.is_error && (
                      <div className="flex items-center gap-2 text-xs font-mono">
                        {msg.route === 'it_support' ? (
                          <Badge variant="green">
                            <Wrench className="w-3 h-3" />
                            <span>IT Support Engineer</span>
                          </Badge>
                        ) : msg.route === 'knowledge_base' ? (
                          <Badge variant="purple">
                            <Compass className="w-3 h-3" />
                            <span>Knowledge Base</span>
                          </Badge>
                        ) : msg.route === 'web_search' ? (
                          <Badge variant="blue">
                            <Globe className="w-3 h-3" />
                            <span>Web Search</span>
                          </Badge>
                        ) : (
                          <Badge variant="gray">
                            <Bot className="w-3 h-3" />
                            <span>Assistant</span>
                          </Badge>
                        )}

                        {msg.duration_ms && (
                          <span className="text-[11px] text-dark-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {(msg.duration_ms / 1000).toFixed(2)}s
                          </span>
                        )}
                      </div>
                    )}

                    {/* Message Bubble */}
                    <div
                      className={`p-4 rounded-xl text-xs leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-dark-800 text-dark-100 border border-dark-700 font-mono shadow-sm'
                          : msg.is_error
                          ? 'bg-rose-500/10 text-rose-300 border border-rose-500/30 font-mono'
                          : 'bg-dark-900/90 text-dark-200 border border-dark-750 font-sans shadow-lg'
                      }`}
                    >
                      {msg.role === 'assistant' && !msg.is_error ? (
                        <MarkdownMessage content={msg.content} />
                      ) : (
                        <div className="whitespace-pre-wrap">{msg.content}</div>
                      )}
                    </div>

                    {/* Source Citations */}
                    {msg.role === 'assistant' && msg.sources && msg.sources.length > 0 && (
                      <div className="pt-1 flex flex-wrap items-center gap-2 text-xs font-mono">
                        <span className="text-[10px] text-dark-500 uppercase tracking-wider">Sources:</span>
                        {msg.sources.map((src, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded bg-dark-900 border border-dark-750 text-dark-300 text-[11px] flex items-center gap-1"
                          >
                            <FileText className="w-3 h-3 text-brand-purple" />
                            <span>Document #{src.document_id}</span>
                            <span className="text-dark-500">• Page {src.page_number}</span>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Web Results Citations */}
                    {msg.role === 'assistant' && msg.web_results && msg.web_results.length > 0 && (
                      <div className="pt-1 flex flex-wrap items-center gap-2 text-xs font-mono">
                        <span className="text-[10px] text-dark-500 uppercase tracking-wider">Web Sources:</span>
                        {msg.web_results.slice(0, 3).map((w, idx) => (
                          <a
                            key={idx}
                            href={w.url}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2 py-0.5 rounded bg-dark-900 border border-dark-750 text-brand-blue hover:underline text-[11px] flex items-center gap-1 truncate max-w-xs"
                          >
                            <Globe className="w-3 h-3" />
                            <span className="truncate">{w.title || w.url}</span>
                            <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                          </a>
                        ))}
                      </div>
                    )}

                    {/* Expandable Execution Details */}
                    {msg.role === 'assistant' && msg.trace && (
                      <div className="pt-1">
                        <button
                          onClick={() => toggleExecutionDetails(msg.id)}
                          className="text-[11px] font-mono text-dark-400 hover:text-dark-200 transition-colors flex items-center gap-1.5"
                        >
                          {isDetailsOpen ? (
                            <ChevronDown className="w-3.5 h-3.5 text-brand-purple" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5 text-dark-500" />
                          )}
                          <span>Execution Details</span>
                        </button>

                        {isDetailsOpen && (
                          <div className="mt-2 p-3.5 rounded-lg border border-dark-800 bg-dark-950/90 space-y-2 font-mono text-xs">
                            <div className="text-[10px] font-semibold text-dark-400 uppercase tracking-wide">
                              Verified Backend Pipeline Execution:
                            </div>

                            <ul className="space-y-1.5 text-dark-300 text-[11px]">
                              <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-brand-purple" />
                                <span>Router selected: <strong>{msg.route}</strong></span>
                              </li>
                              {msg.route === 'knowledge_base' && (
                                <>
                                  <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                    <span>Hybrid retrieval executed (Pinecone semantic search + Rank-BM25).</span>
                                  </li>
                                  <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                    <span>Reciprocal Rank Fusion applied (k=60).</span>
                                  </li>
                                  <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                    <span>Cross-Encoder reranking executed (ms-marco-MiniLM-L-6-v2).</span>
                                  </li>
                                </>
                              )}
                              {msg.route === 'web_search' && (
                                <li className="flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-brand-blue" />
                                  <span>Tavily web search executed with external grounding.</span>
                                </li>
                              )}
                              <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-dark-400" />
                                <span>Final answer synthesized via Groq openai/gpt-oss-120b.</span>
                              </li>
                            </ul>

                            <div className="pt-2 border-t border-dark-800/80 flex items-center justify-between text-[11px]">
                              <span className="text-dark-500">Trace ID: {msg.trace.trace_id}</span>
                              <button
                                onClick={() => handleViewFullTrace(msg.trace)}
                                className="text-brand-purple hover:underline flex items-center gap-1 font-semibold"
                              >
                                <span>View full trace</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-lg bg-dark-800 border border-dark-700 text-dark-300 flex items-center justify-center shrink-0 mt-1 font-mono text-xs font-semibold">
                      ME
                    </div>
                  )}
                </div>
              );
            })
          )}

          {isLoading && (
            <div className="flex gap-3 max-w-xl mr-auto">
              <div className="w-8 h-8 rounded-lg bg-brand-purple/20 border border-brand-purple/30 text-brand-purple flex items-center justify-center shrink-0 animate-pulse shadow-glow-purple">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 rounded-xl bg-dark-900 border border-dark-750 flex items-center gap-2.5 text-xs font-mono text-dark-300">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-purple animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-purple animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-purple animate-bounce" />
                </div>
                <span>IT Support Engineer is diagnosing...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <div className="p-4 border-t border-dark-750 bg-dark-900/80">
          {error && (
            <div className="mb-2 p-2 rounded bg-rose-500/10 border border-rose-500/20 text-xs font-mono text-rose-400 flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="relative">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask an IT support or company question..."
              rows={2}
              className="w-full bg-dark-950 border border-dark-700 rounded-xl px-4 py-3 pr-14 text-xs font-mono text-dark-100 placeholder-dark-500 focus:outline-none focus:border-brand-purple transition-all resize-none"
            />
            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="absolute right-3 bottom-3 p-2 rounded-lg bg-gradient-to-r from-brand-purple to-brand-blue text-white hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-glow-purple"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          <div className="flex items-center justify-between mt-1.5 text-[10px] font-mono text-dark-500">
            <span>Press Enter to submit, Shift + Enter for newline</span>
            <span>Real-time Django Agentic RAG</span>
          </div>
        </div>
      </div>
    </div>
  );
}

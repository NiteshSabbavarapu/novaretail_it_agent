import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Clock,
  Compass,
  Globe,
  FileText,
  ArrowRight,
  Bot,
  User,
  Plus,
  Info,
  Wrench,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useChat } from '../context/ChatContext';
import { conversationService } from '../services/conversationService';
import Badge from '../components/common/Badge';
import MarkdownMessage from '../components/common/MarkdownMessage';

export default function Conversations() {
  const {
    conversations,
    currentConversationId,
    selectConversation,
    createNewConversation,
  } = useChat();

  const navigate = useNavigate();
  const [selectedConvId, setSelectedConvId] = useState(() => currentConversationId || (conversations[0]?.id ?? null));
  const [convMessages, setConvMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  useEffect(() => {
    if (!selectedConvId && conversations.length > 0) {
      setSelectedConvId(conversations[0].id);
    }
  }, [conversations, selectedConvId]);

  useEffect(() => {
    let isMounted = true;
    if (selectedConvId) {
      setLoadingMessages(true);
      conversationService.getConversationMessages(selectedConvId)
        .then(data => {
          if (isMounted && data?.messages) {
            setConvMessages(data.messages);
          }
        })
        .finally(() => {
          if (isMounted) setLoadingMessages(false);
        });
    } else {
      setConvMessages([]);
    }
    return () => { isMounted = false; };
  }, [selectedConvId]);

  const activeConv = conversations.find(c => c.id === selectedConvId) || conversations[0];

  const handleOpenInAssistant = (convId) => {
    selectConversation(convId);
    navigate('/');
  };

  const handleNewConversation = () => {
    createNewConversation();
    navigate('/');
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-dark-800">
        <div>
          <h2 className="text-base font-semibold font-mono text-dark-100 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-brand-purple" />
            <span>Enterprise Conversation Logs</span>
          </h2>
          <p className="text-xs text-dark-400 font-mono mt-0.5">
            Audit history of user inquiries, LangGraph route selections, and grounded assistant responses.
          </p>
        </div>

        <button
          onClick={handleNewConversation}
          className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-brand-purple to-brand-blue text-white font-mono text-xs font-medium hover:opacity-95 shadow-glow-purple flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Query Session</span>
        </button>
      </div>

      {/* Backend API Notice */}
      <div className="p-3.5 rounded-lg bg-dark-900 border border-dark-750 text-xs text-dark-400 flex items-start gap-2.5 font-mono">
        <Info className="w-4 h-4 text-brand-purple shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="text-dark-200 font-semibold">Backend Persistence Notice:</div>
          <p className="leading-relaxed">
            Every query submitted to <code className="text-dark-100">POST /api/search/</code> creates or appends to a PostgreSQL <code className="text-dark-100">core.models.Conversation</code> and <code className="text-dark-100">ChatMessage</code> record. A dedicated <code className="text-dark-100">GET /api/conversations/</code> endpoint is pending in <code className="text-dark-100">core/urls.py</code>; threads shown below represent sessions tracked via live <code className="text-dark-100">conversation_id</code> returns.
          </p>
        </div>
      </div>

      {/* Main Grid: Thread List & Detail View */}
      {conversations.length === 0 ? (
        <div className="p-12 rounded-xl border border-dark-800 bg-dark-900/60 text-center space-y-3 font-mono">
          <MessageSquare className="w-8 h-8 text-dark-600 mx-auto" />
          <h3 className="text-sm font-semibold text-dark-200">No Session Conversations</h3>
          <p className="text-xs text-dark-400 max-w-sm mx-auto">
            Submit an enterprise inquiry in the AI Assistant to generate and log an agent conversation.
          </p>
          <button
            onClick={handleNewConversation}
            className="px-4 py-2 rounded-lg bg-dark-800 hover:bg-dark-750 border border-dark-700 text-xs text-dark-200 inline-flex items-center gap-1.5"
          >
            <span>Start First Query</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Thread List */}
          <div className="lg:col-span-5 space-y-2">
            <div className="text-[11px] font-mono text-dark-400 uppercase tracking-wide px-1">
              Active Sessions ({conversations.length})
            </div>

            <div className="space-y-2 font-mono">
              {conversations.map((conv) => {
                const isSelected = conv.id === selectedConvId;
                return (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedConvId(conv.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-brand-purple bg-dark-900 shadow-glow-purple'
                        : 'border-dark-750 bg-dark-900/60 hover:border-dark-600 hover:bg-dark-900'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-dark-100 truncate pr-2">
                        {conv.title || `Conversation #${conv.id}`}
                      </span>
                      {conv.route && (
                        <Badge variant={conv.route === 'web_search' ? 'blue' : 'purple'} size="xs">
                          {conv.route === 'web_search' ? 'Web' : 'KB'}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-dark-500">
                      <span>ID #{conv.id}</span>
                      <span>{conv.messageCount || 2} turns</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Thread Detail View */}
          <div className="lg:col-span-7">
            <div className="p-5 rounded-xl border border-dark-700 bg-dark-900/90 shadow-xl space-y-5 font-mono text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-dark-800">
                <div>
                  <h3 className="text-sm font-semibold text-dark-100">
                    {activeConv?.title || `Conversation #${activeConv?.id}`}
                  </h3>
                  <div className="text-[10px] text-dark-400 mt-0.5">
                    Backend Conversation ID: <strong className="text-dark-200">#{activeConv?.id}</strong>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenInAssistant(activeConv?.id)}
                  className="px-3 py-1.5 rounded bg-dark-800 hover:bg-dark-750 border border-dark-700 text-xs text-dark-200 flex items-center gap-1.5 transition-all"
                >
                  <span>Open in Assistant</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-dark-950 border border-dark-800 space-y-1">
                  <div className="text-[10px] text-dark-500 uppercase">Selected Routing Branch</div>
                  <div className="text-dark-200 font-semibold flex items-center gap-2">
                    {activeConv?.route === 'web_search' ? (
                      <>
                        <Globe className="w-3.5 h-3.5 text-brand-blue" />
                        <span>External Web Search (Tavily)</span>
                      </>
                    ) : (
                      <>
                        <Compass className="w-3.5 h-3.5 text-brand-purple" />
                        <span>Internal Knowledge Base (Hybrid Pinecone + BM25)</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-dark-950 border border-dark-800 space-y-2">
                  <div className="text-[10px] text-dark-500 uppercase flex items-center justify-between">
                    <span>Message Exchange History</span>
                    <span>{convMessages.length} messages</span>
                  </div>

                  {loadingMessages ? (
                    <div className="py-4 text-center text-dark-500 font-mono text-xs">
                      Loading messages...
                    </div>
                  ) : convMessages.length === 0 ? (
                    <p className="text-dark-400 font-sans text-xs">No recorded messages in this session.</p>
                  ) : (
                    <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                      {convMessages.map((m) => (
                        <div
                          key={m.id}
                          className={`p-2.5 rounded-lg border text-xs leading-relaxed ${
                            m.role === 'user'
                              ? 'bg-dark-850/90 border-dark-700 text-dark-100 font-mono'
                              : 'bg-dark-900 border-dark-800 text-dark-200'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 mb-1 text-[10px] font-mono font-semibold uppercase text-dark-400">
                            {m.role === 'user' ? (
                              <>
                                <User className="w-3 h-3 text-dark-300" />
                                <span>Employee</span>
                              </>
                            ) : (
                              <>
                                <Bot className="w-3 h-3 text-brand-purple" />
                                <span>IT Support Engineer</span>
                              </>
                            )}
                          </div>
                          {m.role === 'user' ? (
                            <div className="whitespace-pre-wrap">{m.content}</div>
                          ) : (
                            <MarkdownMessage content={m.content} />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

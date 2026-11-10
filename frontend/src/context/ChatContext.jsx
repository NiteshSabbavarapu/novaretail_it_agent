import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { searchService } from '../services/searchService';
import { conversationService } from '../services/conversationService';
import { useAuth } from './AuthContext';

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const { isAuthenticated } = useAuth();

  // Active conversations tracked from live backend sessions
  const [conversations, setConversations] = useState(() => {
    const saved = localStorage.getItem('novaretail_live_conversations');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return [];
  });

  const [currentConversationId, setCurrentConversationId] = useState(() => {
    const saved = localStorage.getItem('novaretail_current_conv_id');
    return saved ? Number(saved) || saved : null;
  });

  // Messages dictionary mapped by conversation ID
  const [messagesByConv, setMessagesByConv] = useState(() => {
    const saved = localStorage.getItem('novaretail_live_messages');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return {};
  });

  const [activeTrace, setActiveTrace] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sync with backend conversations on mount/login
  const refreshConversations = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const serverConvs = await conversationService.getConversations();
      if (serverConvs && serverConvs.length > 0) {
        setConversations(prev => {
          // Merge server conversations with local cache
          const merged = [...serverConvs];
          prev.forEach(local => {
            if (!merged.some(m => m.id === local.id)) {
              merged.push(local);
            }
          });
          return merged;
        });
      }
    } catch (e) {
      console.warn('Could not refresh conversations:', e);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshConversations();
  }, [refreshConversations]);

  // Sync to local storage for session continuity
  useEffect(() => {
    localStorage.setItem('novaretail_live_conversations', JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem('novaretail_live_messages', JSON.stringify(messagesByConv));
  }, [messagesByConv]);

  useEffect(() => {
    if (currentConversationId) {
      localStorage.setItem('novaretail_current_conv_id', String(currentConversationId));
    } else {
      localStorage.removeItem('novaretail_current_conv_id');
    }
  }, [currentConversationId]);

  const currentMessages = currentConversationId ? (messagesByConv[currentConversationId] || []) : [];

  const createNewConversation = () => {
    setCurrentConversationId(null);
    setError(null);
    setActiveTrace(null);
  };

  const selectConversation = async (id) => {
    setCurrentConversationId(id);
    setError(null);

    // If local messages don't exist or are empty, fetch from backend
    if (!messagesByConv[id] || messagesByConv[id].length === 0) {
      try {
        const data = await conversationService.getConversationMessages(id);
        if (data && data.messages) {
          const formatted = data.messages.map(m => ({
            id: `msg_${m.id}`,
            role: m.role,
            content: m.content,
            timestamp: m.created_at,
          }));
          setMessagesByConv(prev => ({
            ...prev,
            [id]: formatted,
          }));
        }
      } catch (e) {
        console.warn('Failed to load thread messages:', e);
      }
    }

    const msgs = messagesByConv[id] || [];
    const lastAssistant = [...msgs].reverse().find(m => m.role === 'assistant');
    if (lastAssistant?.trace) {
      setActiveTrace(lastAssistant.trace);
    }
  };

  const sendMessage = async (userText) => {
    if (!userText.trim() || isLoading) return;

    setError(null);
    setIsLoading(true);

    const tempUserMsg = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: userText,
      timestamp: new Date().toISOString(),
    };

    // If no active conversation, prepare a placeholder container
    const activeId = currentConversationId;
    if (activeId) {
      setMessagesByConv(prev => ({
        ...prev,
        [activeId]: [...(prev[activeId] || []), tempUserMsg],
      }));
    }

    try {
      // Execute live search against POST /api/search/
      const result = await searchService.executeSearch(userText, activeId);
      const { raw, trace } = result;
      const backendConvId = raw.conversation_id;

      const assistantMsg = {
        id: `asst_${Date.now()}`,
        role: 'assistant',
        content: raw.answer,
        route: raw.route,
        sources: raw.sources || [],
        web_results: raw.web_results || [],
        trace: trace,
        duration_ms: trace.total_latency_ms,
        timestamp: new Date().toISOString(),
      };

      // Set or update conversation ID
      setCurrentConversationId(backendConvId);

      setMessagesByConv(prev => {
        const existing = prev[backendConvId] || (activeId ? (prev[activeId] || []) : []);
        const withoutTemp = existing.filter(m => m.id !== tempUserMsg.id);
        return {
          ...prev,
          [backendConvId]: [...withoutTemp, tempUserMsg, assistantMsg],
        };
      });

      // Update conversations list
      setConversations(prev => {
        const titleSnippet = userText.length > 40 ? userText.slice(0, 40) + '...' : userText;
        const existingIdx = prev.findIndex(c => c.id === backendConvId);
        if (existingIdx >= 0) {
          const updated = [...prev];
          updated[existingIdx] = {
            ...updated[existingIdx],
            route: raw.route,
            updated_at: new Date().toISOString(),
            messageCount: (updated[existingIdx].messageCount || 0) + 2,
          };
          return updated;
        } else {
          const newConv = {
            id: backendConvId,
            title: titleSnippet,
            route: raw.route,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            messageCount: 2,
          };
          return [newConv, ...prev];
        }
      });

      setActiveTrace(trace);
    } catch (err) {
      console.error('Hybrid search error:', err);
      const errDetail =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        err.message ||
        'Error communicating with backend search endpoint.';
      setError(errDetail);

      const errorMsg = {
        id: `err_${Date.now()}`,
        role: 'assistant',
        is_error: true,
        content: `Backend Error: ${errDetail}`,
        timestamp: new Date().toISOString(),
      };

      if (activeId) {
        setMessagesByConv(prev => ({
          ...prev,
          [activeId]: [...(prev[activeId] || []), errorMsg],
        }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        conversations,
        currentConversationId,
        currentMessages,
        activeTrace,
        setActiveTrace,
        isLoading,
        error,
        createNewConversation,
        selectConversation,
        sendMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within a ChatProvider');
  return context;
}

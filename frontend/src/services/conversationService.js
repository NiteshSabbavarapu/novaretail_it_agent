import { apiClient } from './api';

export const conversationService = {
  /**
   * Fetch all conversations for the authenticated user from PostgreSQL
   */
  async getConversations() {
    try {
      const response = await apiClient.get('/conversations/');
      return response.data || [];
    } catch (err) {
      console.warn('Failed to load conversations from backend:', err);
      return [];
    }
  },

  /**
   * Fetch messages for a specific conversation from PostgreSQL
   */
  async getConversationMessages(conversationId) {
    if (!conversationId) return null;
    try {
      const response = await apiClient.get(`/conversations/${conversationId}/`);
      return response.data;
    } catch (err) {
      console.warn(`Failed to load conversation #${conversationId} from backend:`, err);
      return null;
    }
  },
};


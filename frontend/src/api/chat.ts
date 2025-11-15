import { apiClient } from './client';

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string;
  messageCount: number;
  hasWebsite: boolean;
  isPublic: boolean;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  messageType?: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

export const chatApi = {
  sendMessage: async (data: { message: string; sessionId?: string }) => {
    const response = await apiClient.post('/api/v1/chat/message', data);
    return response.data;
  },

  getUserSessions: async (): Promise<{ sessions: ChatSession[] }> => {
    const response = await apiClient.get('/api/v1/chat/sessions');
    return response.data;
  },

  getSession: async (id: string) => {
    const response = await apiClient.get(`/api/v1/chat/sessions/${id}`);
    return response.data;
  },

  deleteSession: async (id: string) => {
    const response = await apiClient.delete(`/api/v1/chat/sessions/${id}`);
    return response.data;
  },

  archiveSession: async (id: string) => {
    const response = await apiClient.patch(`/api/v1/chat/sessions/${id}/archive`);
    return response.data;
  },

  generateWebsite: async (data: {
    conversationState: unknown;
    sessionId: string;
  }) => {
    const response = await apiClient.post('/api/v1/websites/generate', data);
    return response.data;
  }
};

import { create } from 'zustand';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  messageType?: 'text' | 'theme-selection' | 'generating' | 'system';
  metadata?: any;
}

interface ChatState {
  messages: Message[];
  isTyping: boolean;
  sessionId: string | null;

  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  setTyping: (isTyping: boolean) => void;
  setSessionId: (sessionId: string) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isTyping: false,
  sessionId: null,

  addMessage: (message) => set((state) => ({
    messages: [...state.messages, {
      ...message,
      id: `msg-${Date.now()}-${Math.random()}`,
      timestamp: new Date()
    }]
  })),

  setTyping: (isTyping) => set({ isTyping }),

  setSessionId: (sessionId) => set({ sessionId }),

  clearMessages: () => set({ messages: [], sessionId: null })
}));

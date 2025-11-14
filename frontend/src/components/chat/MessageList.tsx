import { useEffect, useRef } from 'react';
import { ChatMessage } from './ChatMessage';
import { TypingIndicator } from './TypingIndicator';
import { useChatStore } from '@/store/chatStore';
import { useChat } from '@/hooks/useChat';
import { Sparkles } from 'lucide-react';

export function MessageList() {
  const messages = useChatStore((state) => state.messages);
  const isTyping = useChatStore((state) => state.isTyping);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { sendMessage } = useChat();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleThemeSelect = (themeId: string) => {
    // Send theme selection as a message
    sendMessage(themeId);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6">
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-accent" />
          </div>
          <h3 className="text-lg font-semibold text-text mb-2">
            Start Building Your Website
          </h3>
          <p className="text-text-muted text-sm max-w-sm">
            Tell me about your project and I'll help you create a stunning website in minutes
          </p>
        </div>
      )}

      {messages.map((message) => (
        <ChatMessage
          key={message.id}
          role={message.role}
          content={message.content}
          timestamp={message.timestamp}
          messageType={message.messageType}
          metadata={message.metadata}
          onThemeSelect={handleThemeSelect}
        />
      ))}

      {isTyping && <TypingIndicator />}

      <div ref={messagesEndRef} />
    </div>
  );
}

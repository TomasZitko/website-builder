import { useState } from 'react';
import { useChatStore } from '@/store/chatStore';
import { useWebsiteStore } from '@/store/websiteStore';
import { chatApi } from '@/api/chat';
import { useToast } from '@/contexts/ToastContext';

export function useChat() {
  const [isLoading, setIsLoading] = useState(false);
  const addMessage = useChatStore((state) => state.addMessage);
  const setTyping = useChatStore((state) => state.setTyping);
  const sessionId = useChatStore((state) => state.sessionId);
  const setSessionId = useChatStore((state) => state.setSessionId);
  const setCode = useWebsiteStore((state) => state.setCode);
  const setGenerating = useWebsiteStore((state) => state.setGenerating);
  const { error: showError } = useToast();

  const sendMessage = async (content: string) => {
    // Add user message immediately
    addMessage({ role: 'user', content });

    setIsLoading(true);
    setTyping(true);

    try {
      console.log('📤 Sending message:', content);

      const response = await chatApi.sendMessage({
        message: content,
        sessionId: sessionId || undefined
      });

      console.log('📥 Received response:', response);

      // Add AI response
      addMessage({
        role: 'assistant',
        content: response.response.content,
        messageType: response.response.messageType,
        metadata: response.response.metadata
      });

      // Save session ID
      if (response.sessionId && !sessionId) {
        setSessionId(response.sessionId);
      }

      // Check if should generate website
      if (response.codeGenerated) {
        console.log('🎨 Triggering website generation...');
        await generateWebsite(response.conversationState, response.sessionId);
      }
    } catch (error: any) {
      console.error('❌ Chat error:', error);
      showError(error.response?.data?.message || 'Failed to send message');
      addMessage({
        role: 'assistant',
        content: 'Sorry, something went wrong. Please try again.'
      });
    } finally {
      setIsLoading(false);
      setTyping(false);
    }
  };

  const generateWebsite = async (conversationState: any, sessionId: string) => {
    setGenerating(true);

    addMessage({
      role: 'assistant',
      content: '🎨 Generating your website... This takes about 15 seconds.'
    });

    try {
      console.log('🚀 Generating with state:', conversationState);

      const response = await chatApi.generateWebsite({
        conversationState,
        sessionId
      });

      console.log('✅ Generated website:', response.website.id);

      // Update preview with generated code
      setCode(
        response.website.htmlCode,
        response.website.cssCode,
        response.website.jsCode
      );

      addMessage({
        role: 'assistant',
        content: '✅ Your website is ready! Check the preview on the right. You can now edit it or download it.'
      });
    } catch (error: any) {
      console.error('❌ Generation error:', error);
      showError(error.response?.data?.message || 'Failed to generate website');
      addMessage({
        role: 'assistant',
        content: '❌ Failed to generate website. Please try describing your requirements again.'
      });
    } finally {
      setGenerating(false);
    }
  };

  return {
    sendMessage,
    isLoading
  };
}

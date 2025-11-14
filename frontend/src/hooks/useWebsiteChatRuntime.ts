import { useLocalRuntime } from "@assistant-ui/react";
import type { ChatModelAdapter } from "@assistant-ui/react";
import { useRef } from "react";
import { useWebsiteStore } from "@/store/websiteStore";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const SESSION_STORAGE_KEY = "chat_session_id";

export function useWebsiteChatRuntime() {
  // Store sessionId in a ref so it persists across renders but doesn't cause re-renders
  const sessionIdRef = useRef<string | null>(
    localStorage.getItem(SESSION_STORAGE_KEY)
  );

  // Get website store functions
  const { setCode, setWebsiteInfo, setGenerating } = useWebsiteStore();

  const adapter: ChatModelAdapter = {
    async run({ messages, abortSignal }) {
      // Get the last user message
      const lastMessage = messages[messages.length - 1];

      // Extract text content from the message
      let messageText = '';
      if (Array.isArray(lastMessage.content)) {
        messageText = lastMessage.content
          .filter((c: any) => c.type === 'text')
          .map((c: any) => c.text || '')
          .join('')
          .trim();
      } else if (typeof lastMessage.content === 'string') {
        messageText = lastMessage.content.trim();
      }

      console.log('🚀 Sending message:', messageText);
      console.log('📝 Session ID:', sessionIdRef.current);

      // Validate message is not empty
      if (!messageText) {
        console.warn('⚠️ Empty message detected, skipping API call');
        return {
          content: [
            {
              type: 'text' as const,
              text: 'Please enter a message.',
            },
          ],
        };
      }

      try {
        const response = await fetch(`${API_URL}/api/v1/chat/message`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            message: messageText,
            sessionId: sessionIdRef.current, // ✅ Send sessionId to maintain context
          }),
          signal: abortSignal,
        });

        if (!response.ok) {
          const error = await response.text();
          console.error('❌ API Error:', error);
          throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ Got response:', data);

        // ✅ Store sessionId if returned (first message creates session)
        if (data.sessionId && !sessionIdRef.current) {
          sessionIdRef.current = data.sessionId;
          localStorage.setItem(SESSION_STORAGE_KEY, data.sessionId);
          console.log('💾 Saved session ID:', data.sessionId);
        }

        // 🔥 CHECK IF WEBSITE WAS GENERATED
        if (data.generatedWebsite && !data.generatedWebsite.error) {
          console.log('🎨 Website generated! Updating store...');

          // Update website store with generated code
          setCode(
            data.generatedWebsite.htmlCode,
            data.generatedWebsite.cssCode,
            data.generatedWebsite.jsCode || ''
          );

          // Update website info
          setWebsiteInfo(
            data.generatedWebsite.id,
            data.generatedWebsite.name,
            false // Not paid by default
          );

          // Stop generating state
          setGenerating(false);

          console.log('✅ Website code loaded into store!');
        } else if (data.codeGenerated) {
          // If generation started, set generating flag
          console.log('⏳ Generation in progress...');
          setGenerating(true);
        }

        return {
          content: [
            {
              type: 'text' as const,
              text: data.response.content,
            },
          ],
        };
      } catch (error: any) {
        // Don't log abort errors (they're expected when cancelling)
        if (error.name === 'AbortError') {
          console.log('⏹️ Request aborted');
          throw error; // Re-throw to let the library handle it
        }

        console.error('❌ Chat error:', error);
        return {
          content: [
            {
              type: 'text' as const,
              text: 'Sorry, there was an error processing your message. Please try again.',
            },
          ],
        };
      }
    },
  };

  return useLocalRuntime(adapter);
}

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { Thread } from "@/components/assistant-ui/thread";
import { useWebsiteChatRuntime } from "@/hooks/useWebsiteChatRuntime";
import { BuilderSidebar } from "@/components/builder/BuilderSidebar";
import { PreviewPanel } from "@/components/builder/PreviewPanel";
import { ChatHistorySidebar } from "@/components/chat/ChatHistorySidebar";
import { useWebsiteStore } from "@/store/websiteStore";
import { chatApi } from "@/api/chat";
import { Button } from "@/components/ui/Button";
import { Eye, Loader } from "lucide-react";

export function BuilderNew() {
  const { id: sessionId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const runtime = useWebsiteChatRuntime();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const { htmlCode, cssCode, jsCode, setCode, setWebsiteInfo } = useWebsiteStore();
  const hasCodeRef = useRef(false);
  const sessionLoadedRef = useRef(false);

  const hasCode = htmlCode || cssCode || jsCode;

  const loadSession = useCallback(async (id: string) => {
    try {
      setIsLoadingSession(true);

      const { session } = await chatApi.getSession(id);

      // Store session ID in localStorage
      localStorage.setItem('chat_session_id', id);

      // If session has a website, load it into store
      if (session.website) {
        setCode(
          session.website.html_code || '',
          session.website.css_code || '',
          session.website.js_code || ''
        );
        setWebsiteInfo(
          session.website.id,
          session.website.name,
          session.website.is_paid || false
        );
        setIsPreviewOpen(true); // Auto-open preview for existing websites
      }
    } catch (error: unknown) {
      console.error('❌ Failed to load session:', error);

      // If session not found (404) or unauthorized (403), redirect to new chat
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 404 || status === 403) {
        navigate('/builder', { replace: true });
        localStorage.removeItem('chat_session_id');
      }
    } finally {
      setIsLoadingSession(false);
    }
  }, [navigate, setCode, setWebsiteInfo]);

  // 🔥 LOAD SESSION ON MOUNT IF ID EXISTS
  useEffect(() => {
    if (sessionId && !sessionLoadedRef.current) {
      loadSession(sessionId);
      sessionLoadedRef.current = true;
    } else if (!sessionId) {
      // Clear session from localStorage when on /builder (no ID)
      localStorage.removeItem('chat_session_id');
      sessionLoadedRef.current = false;
    }
  }, [sessionId, loadSession]);

  // 🔥 AUTO-REDIRECT TO /builder/:id AFTER SESSION CREATION
  useEffect(() => {
    const storedSessionId = localStorage.getItem('chat_session_id');

    // If we have a session ID in localStorage but not in URL, redirect
    if (storedSessionId && !sessionId) {
      navigate(`/builder/${storedSessionId}`, { replace: true });
    }
  }, [navigate, sessionId]);

  // 🔥 AUTO-OPEN PREVIEW WHEN WEBSITE IS GENERATED
  useEffect(() => {
    if (hasCode && !hasCodeRef.current) {
      // Code just appeared for the first time
      setIsPreviewOpen(true);
      hasCodeRef.current = true;
    } else if (!hasCode) {
      // Reset ref when code is cleared
      hasCodeRef.current = false;
    }
  }, [hasCode]);

  const handleNewChat = () => {
    setIsPreviewOpen(false);
    // Clear session to start fresh conversation
    localStorage.removeItem('chat_session_id');
    sessionLoadedRef.current = false;
    // Navigate to /builder (no ID)
    navigate('/builder');
    // Refresh the page to reset the runtime
    window.location.reload();
  };

  // Show loading state while loading session
  if (isLoadingSession) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading chat session...</p>
        </div>
      </div>
    );
  }

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <div className="flex h-screen w-full overflow-hidden bg-background">
          {/* Chat History Sidebar - Fixed 256px */}
          <ChatHistorySidebar />

          {/* Main Builder Sidebar - Fixed 280px */}
          <BuilderSidebar onNewChat={handleNewChat} />

          {/* Chat Area - FULL SCREEN when closed, 35% when preview open */}
          <div
            className={`flex flex-col bg-background transition-all duration-500 ease-in-out overflow-hidden relative ${
              isPreviewOpen ? 'border-r border-border' : ''
            }`}
            style={{
              flex: isPreviewOpen ? '0 0 35%' : '1',
              width: isPreviewOpen ? '35%' : undefined,
              minWidth: isPreviewOpen ? '380px' : undefined,
            }}
          >
            {/* Chat Thread */}
            <div className="flex-1 overflow-hidden">
              <Thread />
            </div>

            {/* View Website Button (shows when code exists but preview closed) */}
            {hasCode && !isPreviewOpen && (
              <div className="absolute bottom-8 right-8 z-10">
                <Button
                  onClick={() => setIsPreviewOpen(true)}
                  variant="default"
                  size="lg"
                  className="gap-2 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <Eye className="w-5 h-5" />
                  View Website
                </Button>
              </div>
            )}
          </div>

          {/* Right Preview Panel - ONLY renders when open */}
          {isPreviewOpen && (
            <div className="flex-1 overflow-hidden bg-background">
              <PreviewPanel
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
              />
            </div>
          )}
      </div>
    </AssistantRuntimeProvider>
  );
}

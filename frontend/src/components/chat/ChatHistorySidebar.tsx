import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { chatApi, ChatSession } from '../../api/chat';
import {
  Plus,
  MessageSquare,
  Trash2,
  Globe,
  ChevronRight,
  Loader
} from 'lucide-react';

export function ChatHistorySidebar() {
  const navigate = useNavigate();
  const { id: currentSessionId } = useParams();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setIsLoading(true);
      const { sessions: loadedSessions } = await chatApi.getUserSessions();
      setSessions(loadedSessions);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectChat = (sessionId: string) => {
    navigate(`/builder/${sessionId}`);
  };

  const handleDeleteChat = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation when clicking delete

    if (deletingId === sessionId) {
      // Confirm delete
      try {
        await chatApi.deleteSession(sessionId);

        // If we're currently viewing this session, redirect to new chat
        if (currentSessionId === sessionId) {
          navigate('/builder', { replace: true });
          // Clear localStorage session
          localStorage.removeItem('chat_session_id');
        }

        // Reload sessions
        await loadSessions();
      } catch (error) {
        console.error('Failed to delete session:', error);
      } finally {
        setDeletingId(null);
      }
    } else {
      // First click - show confirm state
      setDeletingId(sessionId);
      // Reset after 3 seconds
      setTimeout(() => setDeletingId(null), 3000);
    }
  };

  const handleNewChat = () => {
    // Clear any existing session
    localStorage.removeItem('chat_session_id');
    navigate('/builder');
    // Force page reload to reset chat runtime
    window.location.reload();
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 24) {
      return 'Today';
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
      {/* New Chat Button */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={handleNewChat}
          className="w-full flex items-center justify-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium shadow-sm"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Chat
        </button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
            No chats yet.
            <br />
            Start a conversation!
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {sessions.map((session) => {
              const isActive = session.id === currentSessionId;
              const isDeleting = deletingId === session.id;

              return (
                <div
                  key={session.id}
                  onClick={() => handleSelectChat(session.id)}
                  className={`
                    group relative flex items-start p-3 rounded-lg cursor-pointer transition-all
                    ${
                      isActive
                        ? 'bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }
                  `}
                >
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-0.5">
                    {session.hasWebsite ? (
                      <Globe className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    ) : (
                      <MessageSquare className="w-4 h-4 text-gray-400" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 ml-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {session.title}
                      </h3>
                      {isActive && (
                        <ChevronRight className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0 ml-1" />
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {session.messageCount} {session.messageCount === 1 ? 'message' : 'messages'}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {formatDate(session.lastMessageAt)}
                      </p>
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={(e) => handleDeleteChat(session.id, e)}
                    className={`
                      absolute right-2 top-2 p-1.5 rounded-md transition-all
                      ${
                        isDeleting
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                          : 'opacity-0 group-hover:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-400 hover:text-red-600'
                      }
                    `}
                    title={isDeleting ? 'Click again to confirm' : 'Delete chat'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
        {sessions.length} {sessions.length === 1 ? 'conversation' : 'conversations'}
      </div>
    </div>
  );
}

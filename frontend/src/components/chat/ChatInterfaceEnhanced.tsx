/**
 * Enhanced Chat Interface with Image Upload Support
 *
 * This component demonstrates how to integrate the new ChatBubble and
 * MessageInputWithImages components into a complete chat interface.
 *
 * Features:
 * - Image upload support (up to 4 images per message)
 * - Beautiful gradient styling
 * - Auto-scroll to latest message
 * - Error handling
 * - Message persistence via Supabase
 */

import { useEffect, useRef, useState } from 'react'
import { ChatBubble, ChatBubbleMessage } from '@/components/ui/ChatBubble'
import { MessageInputWithImages } from './MessageInputWithImages'
import { motion } from 'framer-motion'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

interface ChatInterfaceEnhancedProps {
  sessionId?: string
  onSessionCreated?: (sessionId: string) => void
}

export function ChatInterfaceEnhanced({
  sessionId,
  onSessionCreated
}: ChatInterfaceEnhancedProps) {
  const [messages, setMessages] = useState<ChatBubbleMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentSessionId, setCurrentSessionId] = useState<string | undefined>(sessionId)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Load session if sessionId provided
  useEffect(() => {
    if (sessionId) {
      loadSession(sessionId)
    }
  }, [sessionId])

  const loadSession = async (id: string) => {
    try {
      setIsLoading(true)
      const response = await axios.get(`${API_URL}/api/v1/chat/sessions/${id}`, {
        withCredentials: true,
      })

      const session = response.data.session

      // Convert messages from database format to component format
      const formattedMessages: ChatBubbleMessage[] = session.messages.map((msg: any) => ({
        id: `msg-${Date.now()}-${Math.random()}`,
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
        metadata: msg.metadata,
      }))

      setMessages(formattedMessages)
    } catch (err: any) {
      console.error('Failed to load session:', err)
      setError('Failed to load chat history')
    } finally {
      setIsLoading(false)
    }
  }

  const uploadImages = async (images: File[]): Promise<string[]> => {
    const formData = new FormData()
    images.forEach(image => {
      formData.append('images', image)
    })

    const response = await axios.post(
      `${API_URL}/api/v1/chat/images/upload`,
      formData,
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )

    return response.data.urls
  }

  const handleSendMessage = async (content: string, images?: File[]) => {
    try {
      setIsLoading(true)
      setError(null)

      // Upload images first if any
      let imageUrls: string[] = []
      if (images && images.length > 0) {
        imageUrls = await uploadImages(images)
      }

      // Add user message to UI immediately
      const userMessage: ChatBubbleMessage = {
        id: `msg-${Date.now()}-user`,
        role: 'user',
        content,
        timestamp: new Date(),
        metadata: imageUrls.length > 0 ? { images: imageUrls } : undefined,
      }

      setMessages(prev => [...prev, userMessage])

      // Send message to backend
      const response = await axios.post(
        `${API_URL}/api/v1/chat/message`,
        {
          message: content,
          sessionId: currentSessionId,
          imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
        },
        { withCredentials: true }
      )

      // If new session was created, update sessionId
      if (response.data.isNewSession && response.data.sessionId) {
        setCurrentSessionId(response.data.sessionId)
        if (onSessionCreated) {
          onSessionCreated(response.data.sessionId)
        }
      }

      // Add AI response to UI
      const aiMessage: ChatBubbleMessage = {
        id: `msg-${Date.now()}-assistant`,
        role: 'assistant',
        content: response.data.response.content,
        timestamp: response.data.response.timestamp,
        metadata: response.data.response.metadata,
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (err: any) {
      console.error('Failed to send message:', err)
      setError('Failed to send message. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="border-b border-white/10 bg-white/5 backdrop-blur-xl p-6">
        <h2 className="text-2xl font-bold text-white">
          DesignMaster AI
        </h2>
        <p className="text-white/70 text-sm mt-1">
          Let's create something stunning together
        </p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message, idx) => (
          <ChatBubble
            key={message.id}
            message={message}
            isLatest={idx === messages.length - 1}
          />
        ))}

        {isLoading && (
          <div className="flex justify-center">
            <div className="flex gap-1">
              <motion.div
                className="w-2 h-2 bg-blue-400 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <motion.div
                className="w-2 h-2 bg-blue-400 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
              />
              <motion.div
                className="w-2 h-2 bg-blue-400 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
              />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/20 border border-red-500/50 rounded-xl p-4"
          >
            <p className="text-red-300 text-sm">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-red-300 text-xs underline mt-2"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </div>

      {/* Input Area */}
      <MessageInputWithImages
        onSend={handleSendMessage}
        disabled={isLoading}
        placeholder={
          isLoading
            ? 'Thinking...'
            : 'Type your answer or upload images...'
        }
      />
    </div>
  )
}

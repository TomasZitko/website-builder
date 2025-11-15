import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Bot, User } from 'lucide-react'

export interface ChatBubbleMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp?: Date | string
  metadata?: {
    images?: string[]
    isStreaming?: boolean
    messageType?: 'text' | 'theme-selection' | 'generating' | 'system'
  }
}

interface ChatBubbleProps {
  message: ChatBubbleMessage
  isLatest?: boolean
}

export const ChatBubble = ({ message, isLatest }: ChatBubbleProps) => {
  const isUser = message.role === 'user'
  const timestamp = message.timestamp ? new Date(message.timestamp) : new Date()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'flex gap-3 mb-6',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
      <div className={cn(
        'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
        isUser
          ? 'bg-gradient-to-br from-purple-500 to-pink-500'
          : 'bg-gradient-to-br from-blue-500 to-cyan-500'
      )}>
        {isUser ? (
          <User className="w-5 h-5 text-white" />
        ) : (
          <Bot className="w-5 h-5 text-white" />
        )}
      </div>

      {/* Message Bubble */}
      <div className={cn(
        'max-w-[70%] rounded-2xl px-6 py-4',
        isUser
          ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30'
          : 'bg-white/10 backdrop-blur-xl border border-white/20'
      )}>
        <p className="text-white leading-relaxed whitespace-pre-wrap">
          {message.content}
        </p>

        {/* Images */}
        {message.metadata?.images && message.metadata.images.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-2">
            {message.metadata.images.map((url, idx) => (
              <img
                key={idx}
                src={url}
                alt={`Upload ${idx + 1}`}
                className="rounded-lg w-full h-32 object-cover border border-white/20"
              />
            ))}
          </div>
        )}

        {/* Timestamp */}
        <p className="text-xs text-white/50 mt-2">
          {timestamp.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>

      {/* Typing Indicator */}
      {isLatest && message.metadata?.isStreaming && (
        <div className="flex gap-1 items-center ml-4">
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
      )}
    </motion.div>
  )
}

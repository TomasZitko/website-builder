import { motion } from 'framer-motion';
import { Bot, User, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { ThemeCard } from './ThemeCard';
import { themes, Theme } from '@/data/themes';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
  messageType?: 'text' | 'theme-selection' | 'generating' | 'system';
  metadata?: any;
  onThemeSelect?: (themeId: string) => void;
}

export function ChatMessage({
  role,
  content,
  timestamp,
  messageType = 'text',
  metadata,
  onThemeSelect
}: ChatMessageProps) {
  const isAssistant = role === 'assistant';
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);

  const handleThemeSelect = (themeId: string) => {
    setSelectedTheme(themeId);
    if (onThemeSelect) {
      onThemeSelect(themeId);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 ${isAssistant ? 'justify-start' : 'justify-end'} mb-4`}
    >
      {isAssistant && (
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
          <Bot className="w-5 h-5 text-white" />
        </div>
      )}

      <div
        className={`${
          messageType === 'theme-selection' || messageType === 'generating'
            ? 'max-w-[90%]'
            : 'max-w-[70%]'
        } rounded-2xl px-4 py-3 ${
          isAssistant
            ? 'bg-panel border border-border text-text'
            : 'bg-accent text-white'
        }`}
      >
        {/* Text Content */}
        {messageType === 'text' && (
          <div className="text-sm leading-relaxed whitespace-pre-wrap">{content}</div>
        )}

        {/* Theme Selection */}
        {messageType === 'theme-selection' && (
          <div className="space-y-4">
            <div className="text-sm leading-relaxed whitespace-pre-wrap">{content}</div>
            <div className="grid grid-cols-3 gap-4 mt-4">
              {themes.map((theme) => (
                <ThemeCard
                  key={theme.id}
                  theme={theme}
                  isSelected={selectedTheme === theme.id}
                  onSelect={handleThemeSelect}
                />
              ))}
            </div>
          </div>
        )}

        {/* Generating Progress */}
        {messageType === 'generating' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-violet-500 animate-pulse" />
              <div className="text-sm font-medium">{content}</div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-violet-500 via-blue-500 to-violet-500"
                initial={{ width: '0%' }}
                animate={{
                  width: '100%',
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                }}
                transition={{
                  width: { duration: 30, ease: 'linear' },
                  backgroundPosition: { duration: 2, repeat: Infinity, ease: 'linear' }
                }}
                style={{
                  backgroundSize: '200% 100%'
                }}
              />
            </div>

            {/* Status Messages */}
            {metadata?.statusMessages && (
              <div className="space-y-2 mt-3">
                {metadata.statusMessages.map((msg: string, idx: number) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.5 }}
                    className="text-xs text-gray-600 flex items-center gap-2"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                    {msg}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* System Message */}
        {messageType === 'system' && (
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-500" />
            <div className="text-sm leading-relaxed">{content}</div>
          </div>
        )}

        {timestamp && (
          <div
            className={`text-xs mt-2 ${
              isAssistant ? 'text-text-muted' : 'text-white/70'
            }`}
          >
            {new Date(timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        )}
      </div>

      {!isAssistant && (
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
          <User className="w-5 h-5 text-white" />
        </div>
      )}
    </motion.div>
  );
}

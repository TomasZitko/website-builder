import { cn } from '@/utils/cn';

interface MessageProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function Message({ role, content, timestamp }: MessageProps) {
  return (
    <div className={cn(
      'flex gap-3 p-4 animate-slide-in',
      role === 'user' && 'flex-row-reverse'
    )}>
      <div className={cn(
        'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold',
        role === 'user' ? 'bg-accent text-white' : 'bg-panel border border-border text-text'
      )}>
        {role === 'user' ? 'U' : 'AI'}
      </div>

      <div className={cn(
        'rounded-xl p-3 max-w-[80%] break-words',
        role === 'user'
          ? 'bg-accent text-white'
          : 'bg-panel border border-border text-text'
      )}>
        {content}
        <span className={cn(
          'text-xs mt-1 block',
          role === 'user' ? 'text-white/70' : 'text-text-muted'
        )}>
          {timestamp.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </span>
      </div>
    </div>
  );
}

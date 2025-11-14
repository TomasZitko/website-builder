import { Eye, Code } from 'lucide-react';
import { useWebsiteStore } from '@/store/websiteStore';
import { cn } from '@/utils/cn';

export function ViewToggle() {
  const { viewMode, setViewMode } = useWebsiteStore();

  return (
    <div className="flex gap-2">
      <button
        onClick={() => setViewMode('preview')}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-md transition-all',
          viewMode === 'preview'
            ? 'bg-accent text-white'
            : 'text-text-muted hover:text-text hover:bg-border'
        )}
      >
        <Eye className="w-4 h-4" />
        Preview
      </button>
      <button
        onClick={() => setViewMode('code')}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-md transition-all',
          viewMode === 'code'
            ? 'bg-accent text-white'
            : 'text-text-muted hover:text-text hover:bg-border'
        )}
      >
        <Code className="w-4 h-4" />
        Code
      </button>
    </div>
  );
}

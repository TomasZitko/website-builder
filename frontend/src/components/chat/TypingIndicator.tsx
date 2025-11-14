export function TypingIndicator() {
  return (
    <div className="flex gap-3 p-4 animate-slide-in">
      <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold bg-panel border border-border text-text">
        AI
      </div>
      <div className="bg-panel border border-border rounded-xl p-3">
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}

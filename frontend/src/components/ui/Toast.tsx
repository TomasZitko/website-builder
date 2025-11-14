import { useEffect } from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import { cn } from '@/utils/cn';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
}

const icons = {
  success: CheckCircle2,
  error: XCircle,
  info: Info
};

const styles = {
  success: 'bg-success/10 border-success text-success',
  error: 'bg-error/10 border-error text-error',
  info: 'bg-accent/10 border-accent text-accent'
};

export function Toast({ message, type = 'info', duration = 5000, onClose }: ToastProps) {
  const Icon = icons[type];

  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      className={cn(
        'fixed bottom-4 right-4 flex items-center gap-3 px-4 py-3',
        'bg-panel border rounded-lg shadow-xl',
        'animate-slide-in min-w-[300px] max-w-md',
        styles[type]
      )}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button
        onClick={onClose}
        className="p-1 hover:bg-black/20 rounded transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

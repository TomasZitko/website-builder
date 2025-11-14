import { cn } from '@/utils/cn';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info';
  className?: string;
}

const variants = {
  default: 'bg-panel text-text border-border',
  success: 'bg-success/10 text-success border-success',
  error: 'bg-error/10 text-error border-error',
  warning: 'bg-warning/10 text-warning border-warning',
  info: 'bg-accent/10 text-accent border-accent'
};

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

import { ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className, hover = false }: CardProps) {
  return (
    <div
      className={cn(
        'bg-panel border border-border rounded-xl p-6',
        hover && 'hover:border-accent/50 transition-all duration-200',
        className
      )}
    >
      {children}
    </div>
  );
}

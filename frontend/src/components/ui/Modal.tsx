import { ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  className
}: ModalProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" />
        <Dialog.Content
          className={cn(
            'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
            'w-full max-w-md p-6 bg-panel border border-border rounded-xl',
            'shadow-2xl animate-slide-in',
            className
          )}
        >
          {title && (
            <Dialog.Title className="text-xl font-semibold text-text mb-2">
              {title}
            </Dialog.Title>
          )}
          {description && (
            <Dialog.Description className="text-sm text-text-muted mb-4">
              {description}
            </Dialog.Description>
          )}

          {children}

          <Dialog.Close asChild>
            <button
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-border transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-text-muted" />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

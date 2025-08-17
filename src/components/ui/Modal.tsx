import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

const overlayBase = 'fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60]';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

export function Modal({ open, onClose, children, className }: ModalProps) {
  if (!open) return null;
  return (
    <div className={overlayBase} role="dialog" aria-modal="true" onClick={onClose}>
      <div
        className={cn('bg-white rounded-xl p-8 max-w-lg w-full shadow-xl relative', className)}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export default Modal;

'use client';

import React, { useEffect } from 'react';
import { cn } from './utils';
import { Button } from './Button';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function Modal({ open, onClose, title, description, children, footer, className = '' }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" role="presentation">
      <button className="absolute inset-0 bg-black/70 backdrop-blur-sm" aria-label="Cerrar modal" onClick={onClose} />
      <div className={cn('relative z-10 w-full max-w-lg rounded-2xl border border-surface-border bg-background shadow-2xl', className)} role="dialog" aria-modal="true" aria-labelledby={title ? 'atlas-modal-title' : undefined} aria-describedby={description ? 'atlas-modal-description' : undefined}>
        {(title || description) && (
          <header className="border-b border-surface-border p-5 pr-14">
            {title && <h2 id="atlas-modal-title" className="text-lg font-semibold text-foreground">{title}</h2>}
            {description && <p id="atlas-modal-description" className="mt-1 text-sm text-muted-foreground">{description}</p>}
          </header>
        )}
        <Button aria-label="Cerrar modal" className="absolute right-3 top-3" size="icon" variant="ghost" onClick={onClose}>×</Button>
        <div className="p-5">{children}</div>
        {footer && <footer className="border-t border-surface-border p-5">{footer}</footer>}
      </div>
    </div>
  );
}

'use client';

import React, { useEffect } from 'react';
import { cn } from './utils';
import { Button } from './Button';

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  side?: 'left' | 'right' | 'bottom';
  className?: string;
}

const sideClasses = {
  left: 'left-0 top-0 h-full w-full max-w-md',
  right: 'right-0 top-0 h-full w-full max-w-md',
  bottom: 'bottom-0 left-0 right-0 max-h-[85vh] rounded-t-3xl',
};

export function Drawer({ open, onClose, title, description, children, side = 'right', className = '' }: DrawerProps) {
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
    <div className="fixed inset-0 z-[190]" role="presentation">
      <button className="absolute inset-0 bg-black/70 backdrop-blur-sm" aria-label="Cerrar panel" onClick={onClose} />
      <aside className={cn('absolute overflow-y-auto border-surface-border bg-background shadow-2xl', side === 'bottom' ? 'border-t' : 'border-x', sideClasses[side], className)} role="dialog" aria-modal="true" aria-labelledby={title ? 'atlas-drawer-title' : undefined} aria-describedby={description ? 'atlas-drawer-description' : undefined}>
        {(title || description) && (
          <header className="border-b border-surface-border p-5 pr-14">
            {title && <h2 id="atlas-drawer-title" className="text-lg font-semibold text-foreground">{title}</h2>}
            {description && <p id="atlas-drawer-description" className="mt-1 text-sm text-muted-foreground">{description}</p>}
          </header>
        )}
        <Button aria-label="Cerrar panel" className="absolute right-3 top-3" size="icon" variant="ghost" onClick={onClose}>×</Button>
        <div className="p-5">{children}</div>
      </aside>
    </div>
  );
}

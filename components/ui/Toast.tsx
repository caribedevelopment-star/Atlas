'use client';

import React from 'react';
import { cn } from './utils';
import { Button } from './Button';

export type ToastVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  variant?: ToastVariant;
  onClose?: () => void;
}

const variants: Record<ToastVariant, string> = {
  default: 'border-surface-border bg-surface text-foreground',
  success: 'border-emerald-500/30 bg-emerald-950/80 text-emerald-50',
  warning: 'border-amber-500/30 bg-amber-950/80 text-amber-50',
  danger: 'border-red-500/30 bg-red-950/80 text-red-50',
  info: 'border-sky-500/30 bg-sky-950/80 text-sky-50',
};

export function Toast({ title, description, variant = 'default', onClose, className = '', children, ...props }: ToastProps) {
  return (
    <div className={cn('pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border p-4 shadow-lg', variants[variant], className)} role="status" aria-live="polite" {...props}>
      <div className="min-w-0 flex-1">
        {title && <p className="text-sm font-semibold">{title}</p>}
        {description && <p className="mt-1 text-xs opacity-80">{description}</p>}
        {children}
      </div>
      {onClose && <Button aria-label="Cerrar notificación" size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={onClose}>×</Button>}
    </div>
  );
}

export function ToastViewport({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('fixed right-4 top-4 z-[220] flex flex-col gap-3', className)} {...props} />;
}

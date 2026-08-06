import React from 'react';
import { cn } from './utils';

export interface LoadingStateProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
}

export function LoadingState({ label = 'Cargando...', className = '', ...props }: LoadingStateProps) {
  return (
    <div className={cn('flex min-h-[160px] items-center justify-center gap-3 text-sm text-muted-foreground', className)} role="status" aria-live="polite" {...props}>
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

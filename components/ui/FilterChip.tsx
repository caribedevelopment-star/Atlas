import React from 'react';
import { cn } from './utils';

export interface FilterChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
}

export function FilterChip({ selected = false, className = '', children, ...props }: FilterChipProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400/30 disabled:pointer-events-none disabled:opacity-50',
        selected ? 'border-accent bg-accent text-accent-foreground' : 'border-surface-border bg-surface text-muted-foreground hover:bg-surface-hover hover:text-foreground',
        className
      )}
      aria-pressed={selected}
      {...props}
    >
      {children}
    </button>
  );
}

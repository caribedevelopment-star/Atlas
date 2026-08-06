import type React from 'react';
import { cx } from './utils';

export interface WineFilterChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
}

export function WineFilterChip({ selected = false, className, children, ...props }: WineFilterChipProps) {
  return (
    <button
      className={cx(
        'inline-flex h-9 items-center justify-center rounded-full border px-3 text-xs font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200/20 disabled:pointer-events-none disabled:opacity-50',
        selected
          ? 'border-amber-200/30 bg-amber-200 text-zinc-950 shadow-[0_8px_30px_rgba(251,191,36,0.22)]'
          : 'border-white/10 bg-white/[0.05] text-zinc-300 hover:border-white/20 hover:bg-white/[0.08] hover:text-white',
        className
      )}
      aria-pressed={selected}
      {...props}
    >
      {children}
    </button>
  );
}

import type React from 'react';
import { Search } from 'lucide-react';
import { cx } from './utils';

export interface WineSearchFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  containerClassName?: string;
}

export function WineSearchField({ className, containerClassName, ...props }: WineSearchFieldProps) {
  return (
    <div className={cx('relative', containerClassName)}>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" aria-hidden="true" />
      <input
        className={cx(
          'h-11 w-full rounded-2xl border border-white/10 bg-white/[0.06] pl-10 pr-4 text-sm text-white placeholder:text-zinc-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] outline-none transition focus:border-amber-200/30 focus:bg-white/[0.08] focus:ring-2 focus:ring-amber-200/10',
          className
        )}
        {...props}
      />
    </div>
  );
}

import type React from 'react';
import { cx } from './utils';

export interface WineMetaPillProps {
  children: React.ReactNode;
  tone?: 'default' | 'red' | 'amber' | 'emerald' | 'sky';
  className?: string;
}

const tones = {
  default: 'border-white/10 bg-white/[0.06] text-zinc-300',
  red: 'border-red-400/20 bg-red-500/10 text-red-100',
  amber: 'border-amber-300/20 bg-amber-300/10 text-amber-100',
  emerald: 'border-emerald-300/20 bg-emerald-400/10 text-emerald-100',
  sky: 'border-sky-300/20 bg-sky-400/10 text-sky-100',
};

export function WineMetaPill({ children, tone = 'default', className }: WineMetaPillProps) {
  return (
    <span className={cx('inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium', tones[tone], className)}>
      {children}
    </span>
  );
}

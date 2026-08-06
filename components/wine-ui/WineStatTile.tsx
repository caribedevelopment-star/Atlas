import type React from 'react';
import { cx } from './utils';

export interface WineStatTileProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  hint?: string;
}

export function WineStatTile({ label, value, icon, hint, className, ...props }: WineStatTileProps) {
  return (
    <div className={cx('rounded-[1.5rem] border border-white/10 bg-white/[0.05] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]', className)} {...props}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">{label}</p>
          <div className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">{value}</div>
          {hint && <p className="mt-1 text-xs text-zinc-500">{hint}</p>}
        </div>
        {icon && <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-2.5 text-amber-100">{icon}</div>}
      </div>
    </div>
  );
}

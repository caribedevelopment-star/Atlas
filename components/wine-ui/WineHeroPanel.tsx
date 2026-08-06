import type React from 'react';
import { cx } from './utils';

export interface WineHeroPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function WineHeroPanel({ eyebrow, title, description, action, className, children, ...props }: WineHeroPanelProps) {
  return (
    <section
      className={cx(
        'relative overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(127,29,29,0.36),transparent_34%),linear-gradient(135deg,rgba(24,24,27,0.95),rgba(9,9,11,0.96))] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.34)] sm:p-6',
        className
      )}
      {...props}
    >
      <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-amber-300/10 blur-3xl" aria-hidden="true" />
      <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl space-y-2">
          {eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-200/80">{eyebrow}</p>}
          <h2 className="text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl">{title}</h2>
          {description && <p className="text-sm leading-relaxed text-zinc-300">{description}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      {children && <div className="relative z-10 mt-6">{children}</div>}
    </section>
  );
}

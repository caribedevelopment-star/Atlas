import type React from 'react';
import { cx } from './utils';

export interface WineToolbarProps extends React.HTMLAttributes<HTMLDivElement> {
  search?: React.ReactNode;
  filters?: React.ReactNode;
  action?: React.ReactNode;
}

export function WineToolbar({ search, filters, action, className, children, ...props }: WineToolbarProps) {
  return (
    <div className={cx('rounded-[1.5rem] border border-white/10 bg-zinc-950/70 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl', className)} {...props}>
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        {search && <div className="min-w-0 flex-1">{search}</div>}
        {action && <div className="shrink-0">{action}</div>}
      </div>
      {filters && <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">{filters}</div>}
      {children}
    </div>
  );
}

import type React from 'react';
import { cx } from './utils';

export interface WineFieldListItem {
  label: string;
  value?: React.ReactNode;
}

export interface WineFieldListProps extends React.HTMLAttributes<HTMLDListElement> {
  items: WineFieldListItem[];
  columns?: 1 | 2;
}

export function WineFieldList({ items, columns = 2, className, ...props }: WineFieldListProps) {
  const visibleItems = items.filter((item) => item.value !== null && item.value !== undefined && item.value !== '');

  if (visibleItems.length === 0) return null;

  return (
    <dl className={cx('grid gap-2', columns === 2 ? 'grid-cols-2' : 'grid-cols-1', className)} {...props}>
      {visibleItems.map((item) => (
        <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
          <dt className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">{item.label}</dt>
          <dd className="mt-1 truncate text-sm font-medium text-zinc-100">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

import { Tag } from 'lucide-react';
import { cx } from './utils';

export interface WinePriceTagProps {
  price?: number | string | null;
  currency?: string;
  className?: string;
}

export function WinePriceTag({ price, currency = '€', className }: WinePriceTagProps) {
  if (price === null || price === undefined || price === '') return null;

  const value = typeof price === 'number' ? price.toFixed(2) : price;

  return (
    <span className={cx('inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-xs font-medium text-zinc-200', className)}>
      <Tag className="h-3.5 w-3.5 text-zinc-400" aria-hidden="true" />
      {value}{currency}
    </span>
  );
}

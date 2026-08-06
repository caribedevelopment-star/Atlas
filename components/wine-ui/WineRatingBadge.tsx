import { Star } from 'lucide-react';
import { cx } from './utils';

export interface WineRatingBadgeProps {
  rating?: number | null;
  label?: string;
  className?: string;
}

export function WineRatingBadge({ rating, label, className }: WineRatingBadgeProps) {
  const display = typeof rating === 'number' ? rating.toFixed(1) : label || 'N/A';

  return (
    <span
      className={cx(
        'inline-flex items-center gap-1 rounded-full border border-amber-300/20 bg-amber-300/10 px-2.5 py-1 text-xs font-semibold text-amber-200 shadow-[0_0_18px_rgba(251,191,36,0.08)]',
        className
      )}
      aria-label={typeof rating === 'number' ? `Valoración ${display} de 10` : undefined}
    >
      <Star className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
      {display}
    </span>
  );
}

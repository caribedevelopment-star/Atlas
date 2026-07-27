import { StarIcon } from './icons';

export function Rating({
  value,
  size = 16,
  className = '',
}: {
  value: number;
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center gap-0.5 ${className}`}
      aria-label={`Rated ${value} out of 5`}
    >
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = i <= Math.round(value);
        return (
          <StarIcon
            key={i}
            width={size}
            height={size}
            className={filled ? 'text-burgundy' : 'text-border'}
            style={filled ? { fill: 'hsl(var(--burgundy))' } : undefined}
          />
        );
      })}
    </div>
  );
}

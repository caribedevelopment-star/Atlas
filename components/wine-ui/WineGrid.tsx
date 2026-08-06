import type React from 'react';
import { cx } from './utils';

export interface WineGridProps extends React.HTMLAttributes<HTMLDivElement> {
  compact?: boolean;
}

export function WineGrid({ compact = false, className, ...props }: WineGridProps) {
  return (
    <div
      className={cx(
        'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3',
        compact && 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
        className
      )}
      {...props}
    />
  );
}

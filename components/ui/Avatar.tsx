import React from 'react';
import { cn } from './utils';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizes = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-14 w-14 text-base', xl: 'h-20 w-20 text-xl' };

export function Avatar({ src, alt = '', fallback = 'A', size = 'md', className = '', ...props }: AvatarProps) {
  return (
    <div className={cn('inline-flex shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-surface-border bg-surface-hover font-semibold text-foreground', sizes[size], className)} {...props}>
      {src ? (
        <span
          role={alt ? 'img' : undefined}
          aria-label={alt || undefined}
          className="h-full w-full bg-cover bg-center"
          style={{ backgroundImage: `url(${src})` }}
        />
      ) : (
        <span aria-hidden={!alt}>{fallback.slice(0, 2).toUpperCase()}</span>
      )}
    </div>
  );
}

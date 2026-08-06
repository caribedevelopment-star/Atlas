import Image from 'next/image';
import { cx } from './utils';

export interface WineBottleImageProps {
  src?: string | null;
  alt: string;
  priority?: boolean;
  className?: string;
  imageClassName?: string;
  variant?: 'contain' | 'cover';
}

export function WineBottleImage({
  src,
  alt,
  priority = false,
  className,
  imageClassName,
  variant = 'contain',
}: WineBottleImageProps) {
  return (
    <div
      className={cx(
        'relative isolate overflow-hidden rounded-[1.75rem] border border-white/10 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.14),rgba(255,255,255,0.04)_42%,rgba(0,0,0,0.18))] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]',
        className
      )}
    >
      <div className="absolute inset-x-6 top-4 h-16 rounded-full bg-amber-300/10 blur-2xl" aria-hidden="true" />
      <Image
        src={src || '/images/wine-rioja.png'}
        alt={alt}
        fill
        unoptimized={Boolean(src?.startsWith('http'))}
        priority={priority}
        sizes="(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 220px"
        className={cx(variant === 'cover' ? 'object-cover' : 'object-contain p-5', imageClassName)}
      />
    </div>
  );
}

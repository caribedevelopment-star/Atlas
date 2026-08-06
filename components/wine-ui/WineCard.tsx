import type React from 'react';
import { Wine, MapPin } from 'lucide-react';
import { WineBottleImage } from './WineBottleImage';
import { WineMetaPill } from './WineMetaPill';
import { WinePriceTag } from './WinePriceTag';
import { WineRatingBadge } from './WineRatingBadge';
import { cx } from './utils';

export interface WineCardProps {
  name: string;
  winery?: string | null;
  imageUrl?: string | null;
  vintage?: number | string | null;
  region?: string | null;
  supermarket?: string | null;
  rating?: number | null;
  price?: number | string | null;
  notes?: string | null;
  action?: React.ReactNode;
  className?: string;
}

export function WineCard({
  name,
  winery,
  imageUrl,
  vintage,
  region,
  supermarket,
  rating,
  price,
  notes,
  action,
  className,
}: WineCardProps) {
  return (
    <article
      className={cx(
        'group overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-950/80 shadow-[0_18px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:bg-zinc-900/90',
        className
      )}
    >
      <div className="grid grid-cols-[42%_1fr] gap-4 p-3 sm:grid-cols-1 sm:gap-0 sm:p-4">
        <WineBottleImage src={imageUrl} alt={name} className="min-h-[190px] sm:h-64" />

        <div className="flex min-w-0 flex-col justify-between gap-4 py-1 sm:pt-4">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              {rating !== undefined && <WineRatingBadge rating={rating} />}
              <WinePriceTag price={price} />
            </div>

            <div className="min-w-0 space-y-1">
              <h3 className="line-clamp-2 text-base font-semibold tracking-[-0.01em] text-white sm:text-lg">{name}</h3>
              {winery && <p className="truncate text-sm text-zinc-400">{winery}</p>}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {vintage && <WineMetaPill tone="amber">{vintage}</WineMetaPill>}
              {supermarket && <WineMetaPill tone="red">{supermarket}</WineMetaPill>}
              {region && (
                <WineMetaPill>
                  <MapPin className="mr-1 h-3 w-3" aria-hidden="true" />
                  {region}
                </WineMetaPill>
              )}
              {!vintage && !supermarket && !region && (
                <WineMetaPill>
                  <Wine className="mr-1 h-3 w-3" aria-hidden="true" />
                  Vino
                </WineMetaPill>
              )}
            </div>

            {notes && <p className="line-clamp-2 text-xs leading-relaxed text-zinc-500">{notes}</p>}
          </div>

          {action && <div className="pt-1">{action}</div>}
        </div>
      </div>
    </article>
  );
}

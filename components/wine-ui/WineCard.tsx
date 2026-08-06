import type React from 'react';
import { CalendarDays, Eye, Heart, MapPin, ShoppingBag, User, Wine } from 'lucide-react';
import { WineBottleImage } from './WineBottleImage';
import { WineFieldList } from './WineFieldList';
import { WineMetaPill } from './WineMetaPill';
import { WineParticipantStack } from './WineParticipantStack';
import { WinePhotoStrip } from './WinePhotoStrip';
import { WinePriceTag } from './WinePriceTag';
import { WineRatingBadge } from './WineRatingBadge';
import type { WineLinkedMemory, WineOwner, WineParticipant, WineVisibility } from './types';
import { cx } from './utils';

export interface WineCardProps {
  name: string;
  winery?: string | null;
  imageUrl?: string | null;
  photos?: string[];
  user?: WineOwner | string | null;
  vintage?: number | string | null;
  country?: string | null;
  region?: string | null;
  grapes?: string[];
  supermarket?: string | null;
  shop?: string | null;
  rating?: number | null;
  price?: number | string | null;
  notes?: string | null;
  favorite?: boolean;
  visibility?: WineVisibility;
  participants?: WineParticipant[];
  linkedMemories?: WineLinkedMemory[];
  createdAt?: string | null;
  action?: React.ReactNode;
  className?: string;
}

function getOwnerName(user?: WineOwner | string | null) {
  if (!user) return null;
  return typeof user === 'string' ? user : user.name;
}

const visibilityLabels: Record<WineVisibility, string> = {
  private: 'Privado',
  friends: 'Amigos',
  public: 'Público',
};

export function WineCard({
  name,
  winery,
  imageUrl,
  photos = [],
  user,
  vintage,
  country,
  region,
  grapes = [],
  supermarket,
  shop,
  rating,
  price,
  notes,
  favorite = false,
  visibility,
  participants = [],
  linkedMemories = [],
  createdAt,
  action,
  className,
}: WineCardProps) {
  const ownerName = getOwnerName(user);
  const coverImage = imageUrl || photos[0];

  return (
    <article
      className={cx(
        'group overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-950/80 shadow-[0_18px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:bg-zinc-900/90',
        className
      )}
    >
      <div className="grid grid-cols-[42%_1fr] gap-4 p-3 sm:grid-cols-1 sm:gap-0 sm:p-4">
        <WineBottleImage src={coverImage} alt={name} className="min-h-[190px] sm:h-64" />

        <div className="flex min-w-0 flex-col justify-between gap-4 py-1 sm:pt-4">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              {rating !== undefined && <WineRatingBadge rating={rating} />}
              <WinePriceTag price={price} />
              {favorite && (
                <WineMetaPill tone="red">
                  <Heart className="mr-1 h-3 w-3 fill-current" aria-hidden="true" />
                  Favorito
                </WineMetaPill>
              )}
            </div>

            <div className="min-w-0 space-y-1">
              <h3 className="line-clamp-2 text-base font-semibold tracking-[-0.01em] text-white sm:text-lg">{name}</h3>
              {winery && <p className="truncate text-sm text-zinc-400">{winery}</p>}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {vintage && <WineMetaPill tone="amber">{vintage}</WineMetaPill>}
              {supermarket && <WineMetaPill tone="red">{supermarket}</WineMetaPill>}
              {shop && (
                <WineMetaPill>
                  <ShoppingBag className="mr-1 h-3 w-3" aria-hidden="true" />
                  {shop}
                </WineMetaPill>
              )}
              {(country || region) && (
                <WineMetaPill>
                  <MapPin className="mr-1 h-3 w-3" aria-hidden="true" />
                  {[region, country].filter(Boolean).join(', ')}
                </WineMetaPill>
              )}
              {visibility && (
                <WineMetaPill tone={visibility === 'public' ? 'emerald' : 'sky'}>
                  <Eye className="mr-1 h-3 w-3" aria-hidden="true" />
                  {visibilityLabels[visibility]}
                </WineMetaPill>
              )}
              {!vintage && !supermarket && !shop && !country && !region && !visibility && (
                <WineMetaPill>
                  <Wine className="mr-1 h-3 w-3" aria-hidden="true" />
                  Vino
                </WineMetaPill>
              )}
            </div>

            <WineFieldList
              items={[
                { label: 'Uvas', value: grapes.length > 0 ? grapes.join(', ') : undefined },
                { label: 'Memorias', value: linkedMemories.length > 0 ? linkedMemories.length : undefined },
              ]}
            />

            {photos.length > 1 && <WinePhotoStrip photos={photos.slice(1)} name={name} />}

            {(ownerName || createdAt || participants.length > 0) && (
              <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500">
                {ownerName && (
                  <span className="inline-flex items-center gap-1">
                    <User className="h-3.5 w-3.5" aria-hidden="true" />
                    {ownerName}
                  </span>
                )}
                {createdAt && (
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                    {createdAt}
                  </span>
                )}
                <WineParticipantStack participants={participants} />
              </div>
            )}

            {notes && <p className="line-clamp-2 text-xs leading-relaxed text-zinc-500">{notes}</p>}
          </div>

          {action && <div className="pt-1">{action}</div>}
        </div>
      </div>
    </article>
  );
}

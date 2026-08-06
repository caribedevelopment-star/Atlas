import { Eye, Heart, MapPin, Star } from 'lucide-react';
import type { WineItem } from '@/types/wine';
import { WineBottleImage } from './WineBottleImage';

interface WineListItemProps {
  wine: WineItem;
  onOpen: () => void;
  onFavorite: () => void;
}

export function WineListItem({ wine, onOpen, onFavorite }: WineListItemProps) {
  return (
    <article className="flex items-center gap-3 rounded-3xl border border-white/10 bg-zinc-900/70 p-3 shadow-xl shadow-black/10 transition hover:border-white/20 sm:gap-5 sm:p-4">
      <button onClick={onOpen} className="shrink-0 rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400" aria-label={`Abrir ${wine.name}`}>
        <WineBottleImage src={wine.image_url || wine.photos[0]} alt="" className="h-24 w-20 rounded-2xl sm:h-28 sm:w-24" />
      </button>
      <button onClick={onOpen} className="min-w-0 flex-1 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400" aria-label={`Ver detalles de ${wine.name}`}>
        <p className="truncate font-semibold text-white">{wine.name}</p>
        <p className="truncate text-sm text-zinc-400">{wine.winery || 'Bodega sin especificar'} {wine.vintage ? `· ${wine.vintage}` : ''}</p>
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-zinc-500">
          {wine.rating !== undefined && <span className="inline-flex items-center gap-1"><Star className="h-3 w-3 fill-amber-400 text-amber-400" aria-hidden="true" />{wine.rating}</span>}
          {(wine.region || wine.country) && <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" aria-hidden="true" />{[wine.region, wine.country].filter(Boolean).join(', ')}</span>}
          <span className="inline-flex items-center gap-1"><Eye className="h-3 w-3" aria-hidden="true" />{wine.visibility}</span>
        </div>
      </button>
      <div className="text-right">
        {wine.price !== undefined && <p className="mb-2 text-sm font-semibold text-white">{wine.price.toFixed(2)} €</p>}
        <button onClick={onFavorite} className="rounded-full p-2 text-zinc-400 transition hover:bg-white/10 hover:text-rose-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400" aria-label={`${wine.favorite ? 'Quitar' : 'Añadir'} ${wine.name} ${wine.favorite ? 'de' : 'a'} favoritos`} aria-pressed={wine.favorite}>
          <Heart className={`h-5 w-5 ${wine.favorite ? 'fill-rose-500 text-rose-500' : ''}`} aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}

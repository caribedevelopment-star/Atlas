'use client';

import { useEffect, useRef } from 'react';
import { Calendar, Eye, Heart, MapPin, ShoppingBag, Star, X } from 'lucide-react';
import type { WineItem } from '@/types/wine';
import { WineBottleImage } from './WineBottleImage';

export function WineDetailDialog({ wine, onClose, onFavorite }: { wine: WineItem | null; onClose: () => void; onFavorite: (wine: WineItem) => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!wine) return;
    closeRef.current?.focus();
    const escape = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    document.addEventListener('keydown', escape);
    return () => document.removeEventListener('keydown', escape);
  }, [onClose, wine]);
  if (!wine) return null;
  const notes = wine.notes || wine.tasting_notes;
  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 p-0 backdrop-blur-sm sm:items-center sm:p-6" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <section role="dialog" aria-modal="true" aria-labelledby="wine-detail-title" className="max-h-[94dvh] w-full max-w-4xl overflow-y-auto rounded-t-[2rem] border border-white/10 bg-zinc-950 shadow-2xl sm:rounded-[2rem]">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-zinc-950/90 px-5 py-4 backdrop-blur-xl"><p className="text-sm text-zinc-400">Ficha de la botella</p><button ref={closeRef} onClick={onClose} className="rounded-full p-2 text-zinc-400 hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400" aria-label="Cerrar detalle"><X className="h-5 w-5" aria-hidden="true" /></button></div>
      <div className="grid gap-7 p-5 sm:grid-cols-[minmax(240px,0.8fr)_1.2fr] sm:p-7">
        <WineBottleImage src={wine.image_url || wine.photos[0]} alt={wine.name} className="h-[340px] sm:h-[520px]" />
        <div><div className="flex items-start justify-between gap-3"><div><p className="text-sm text-rose-300">{wine.winery || 'Bodega sin especificar'}</p><h2 id="wine-detail-title" className="mt-1 text-3xl font-semibold tracking-tight text-white">{wine.name}</h2></div><button onClick={() => onFavorite(wine)} aria-pressed={wine.favorite} aria-label={wine.favorite ? 'Quitar de favoritos' : 'Añadir a favoritos'} className="rounded-full border border-white/10 p-3 text-zinc-400 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"><Heart className={`h-5 w-5 ${wine.favorite ? 'fill-rose-500 text-rose-500' : ''}`} aria-hidden="true" /></button></div>
          <div className="mt-5 flex flex-wrap gap-2">{wine.rating !== undefined && <Pill><Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />{wine.rating}/5</Pill>}{wine.price !== undefined && <Pill>{wine.price.toFixed(2)} €</Pill>}{wine.vintage && <Pill><Calendar className="h-3.5 w-3.5" />{wine.vintage}</Pill>}<Pill><Eye className="h-3.5 w-3.5" />{wine.visibility}</Pill></div>
          <dl className="mt-7 grid grid-cols-2 gap-x-5 gap-y-5 border-y border-white/10 py-6"><Field label="País" value={wine.country} /><Field label="Región" value={wine.region} /><Field label="Denominación" value={wine.denomination} /><Field label="Uvas" value={wine.grapes.join(', ')} /><Field label="Tienda" value={wine.shop || wine.supermarket} /><Field label="Añadido" value={formatDate(wine.created_at)} /></dl>
          {notes && <div className="mt-6"><h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Notas</h3><p className="mt-2 whitespace-pre-wrap leading-7 text-zinc-300">{notes}</p></div>}
          {(wine.region || wine.country) && <p className="mt-6 flex items-center gap-2 text-sm text-zinc-400"><MapPin className="h-4 w-4" />{[wine.region, wine.country].filter(Boolean).join(', ')}</p>}
          {(wine.shop || wine.supermarket) && <p className="mt-3 flex items-center gap-2 text-sm text-zinc-400"><ShoppingBag className="h-4 w-4" />{wine.shop || wine.supermarket}</p>}
        </div>
      </div>
    </section>
  </div>;
}

function Pill({ children }: { children: React.ReactNode }) { return <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-300">{children}</span>; }
function Field({ label, value }: { label: string; value?: string }) { return <div><dt className="text-xs text-zinc-500">{label}</dt><dd className="mt-1 text-sm text-zinc-200">{value || '—'}</dd></div>; }
function formatDate(value?: string) { if (!value) return undefined; const date = new Date(value); return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('es', { dateStyle: 'medium' }).format(date); }

'use client';

import { useState } from 'react';
import { Grid2X2, Heart, List, Plus, Search, SlidersHorizontal, Wine } from 'lucide-react';
import CaniaAssistant from '@/components/CaniaAssistant';
import { initialWineFilters, useWineLibrary } from '@/hooks/use-wine-library';
import type { WineItem, WineSort } from '@/types/wine';
import { WineCard, WineCreateDialog, WineDetailDialog, WineErrorState, WineFilters, WineGrid, WineListItem, WineLoadingState, WineNoResults } from '@/components/wine-ui';

export function WineLibrary() {
  const library = useWineLibrary();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const activeFilters = Object.entries(library.filters).filter(([key, value]) => key === 'source' ? value !== 'all' : value !== '' && value !== false && value !== null).length;
  const isFiltered = Boolean(library.search || activeFilters);
  const reset = () => { library.setSearch(''); library.setFilters(initialWineFilters); };

  return <main className="min-h-screen bg-zinc-950 pb-28 text-zinc-100 selection:bg-rose-500/30">
    <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
      <header className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_85%_10%,rgba(244,63,94,0.18),transparent_35%),linear-gradient(135deg,rgba(39,39,42,0.9),rgba(9,9,11,0.95))] p-6 shadow-2xl shadow-black/20 sm:p-9">
        <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between"><div><p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-rose-300"><Wine className="h-4 w-4" aria-hidden="true" />Bodega personal</p><h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">Tu colección, botella a botella.</h1><p className="mt-3 max-w-xl text-sm leading-6 text-zinc-400 sm:text-base">Descubre, organiza y vuelve a cada vino que forma parte de tu historia.</p></div><button onClick={() => setCreateOpen(true)} className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-zinc-950 shadow-lg transition hover:bg-rose-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"><Plus className="h-4 w-4" aria-hidden="true" />Añadir vino</button></div>
      </header>

      <section aria-label="Controles de la bodega" className="sticky top-0 z-20 -mx-4 mt-5 border-y border-white/10 bg-zinc-950/90 px-4 py-3 backdrop-blur-xl sm:static sm:mx-0 sm:mt-7 sm:rounded-2xl sm:border sm:bg-zinc-900/60">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <label className="relative flex-1"><span className="sr-only">Buscar vinos</span><Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" aria-hidden="true" /><input type="search" value={library.search} onChange={(event) => library.setSearch(event.target.value)} placeholder="Nombre, bodega, uva, región o país" className="h-12 w-full rounded-xl border border-white/10 bg-zinc-950 pl-11 pr-4 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-rose-400 focus:ring-2 focus:ring-rose-400/20" /></label>
          <div className="flex gap-2 overflow-x-auto"><button onClick={() => setFiltersOpen(true)} className="relative inline-flex h-11 shrink-0 items-center gap-2 rounded-xl border border-white/10 px-4 text-sm text-zinc-300 hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"><SlidersHorizontal className="h-4 w-4" />Filtros{activeFilters > 0 && <span className="rounded-full bg-rose-500 px-1.5 text-[11px] text-white">{activeFilters}</span>}</button><label className="sr-only" htmlFor="wine-sort">Ordenar vinos</label><select id="wine-sort" value={library.sort} onChange={(event) => library.setSort(event.target.value as WineSort)} className="h-11 shrink-0 rounded-xl border border-white/10 bg-zinc-950 px-3 text-sm text-zinc-300 outline-none focus:border-rose-400"><option value="recent">Más recientes</option><option value="rating">Mejor valorados</option><option value="price-asc">Menor precio</option><option value="price-desc">Mayor precio</option><option value="vintage">Añada</option><option value="alphabetical">Orden alfabético</option></select><div className="flex rounded-xl border border-white/10 p-1" aria-label="Tipo de vista"><ViewButton active={library.view === 'grid'} onClick={() => library.setView('grid')} label="Vista de cuadrícula"><Grid2X2 className="h-4 w-4" /></ViewButton><ViewButton active={library.view === 'list'} onClick={() => library.setView('list')} label="Vista de lista"><List className="h-4 w-4" /></ViewButton></div></div>
        </div>
      </section>

      <div className="mt-6 flex items-center justify-between"><p className="text-sm text-zinc-400" role="status" aria-live="polite">{library.loading ? 'Cargando…' : `${library.filteredWines.length} ${library.filteredWines.length === 1 ? 'vino' : 'vinos'}`}</p>{isFiltered && <button onClick={reset} className="text-xs text-rose-300 hover:text-rose-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400">Limpiar búsqueda y filtros</button>}</div>
      {library.error && library.wines.length > 0 && <div role="alert" className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-200"><span>{library.error}</span><button onClick={library.clearError} className="shrink-0 rounded-lg px-2 py-1 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300">Cerrar</button></div>}
      <div className="mt-4"><WineResults library={library} isFiltered={isFiltered} reset={reset} /></div>
    </div>

    {filtersOpen && <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setFiltersOpen(false)}><aside role="dialog" aria-modal="true" aria-label="Filtros de vinos" className="absolute inset-y-0 right-0 w-[min(92vw,390px)] overflow-y-auto border-l border-white/10 bg-zinc-950 p-6 shadow-2xl"><WineFilters filters={library.filters} options={library.options} onChange={library.setFilters} onClose={() => setFiltersOpen(false)} /></aside></div>}
    <WineDetailDialog wine={library.selectedWine} onClose={() => library.setSelectedWine(null)} onFavorite={(wine) => void library.toggleFavorite(wine)} />
    <WineCreateDialog open={createOpen} onClose={() => setCreateOpen(false)} onCreated={library.addWine} />
    <CaniaAssistant userWines={library.wines.map((wine) => ({ ...wine, winery: wine.winery || '', vintage: wine.vintage || 0, rating: wine.rating || 0, supermarket: wine.supermarket || '', price: wine.price || 0, tasting_notes: wine.tasting_notes || '', image_url: wine.image_url || '' }))} />
  </main>;
}

function WineResults({ library, isFiltered, reset }: { library: ReturnType<typeof useWineLibrary>; isFiltered: boolean; reset: () => void }) {
  if (library.loading) return <WineLoadingState />;
  if (library.error && library.wines.length === 0) return <WineErrorState message={library.error} onRetry={() => void library.refresh()} />;
  if (library.filteredWines.length === 0) return <WineNoResults filtered={isFiltered} onReset={reset} />;
  if (library.view === 'list') return <div className="space-y-3">{library.filteredWines.map((wine) => <WineListItem key={wine.id} wine={wine} onOpen={() => library.setSelectedWine(wine)} onFavorite={() => void library.toggleFavorite(wine)} />)}</div>;
  return <WineGrid>{library.filteredWines.map((wine) => <WineCard key={wine.id} {...cardProps(wine)} className="h-full" action={<div className="flex gap-2"><button onClick={() => void library.toggleFavorite(wine)} aria-pressed={wine.favorite} aria-label={`${wine.favorite ? 'Quitar' : 'Añadir'} ${wine.name} ${wine.favorite ? 'de' : 'a'} favoritos`} className="rounded-full border border-white/10 p-2.5 text-zinc-400 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"><Heart className={`h-4 w-4 ${wine.favorite ? 'fill-rose-500 text-rose-500' : ''}`} /></button><button onClick={() => library.setSelectedWine(wine)} className="flex-1 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-rose-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400">Ver detalle</button></div>} />)}</WineGrid>;
}

function ViewButton({ active, onClick, label, children }: { active: boolean; onClick: () => void; label: string; children: React.ReactNode }) { return <button onClick={onClick} aria-label={label} aria-pressed={active} className={`rounded-lg p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 ${active ? 'bg-white text-zinc-950' : 'text-zinc-500 hover:text-white'}`}>{children}</button>; }
function cardProps(wine: WineItem) { return { name: wine.name, winery: wine.winery, imageUrl: wine.image_url, photos: wine.photos, user: wine.owner_name, vintage: wine.vintage, country: wine.country, region: wine.region, grapes: wine.grapes, supermarket: wine.supermarket, shop: wine.shop, rating: wine.rating, price: wine.price, notes: wine.notes || wine.tasting_notes, favorite: wine.favorite, visibility: wine.visibility, participants: wine.participants, linkedMemories: wine.linked_memories, createdAt: formatDate(wine.created_at) }; }
function formatDate(value?: string) { if (!value) return undefined; const date = new Date(value); return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('es', { dateStyle: 'medium' }).format(date); }

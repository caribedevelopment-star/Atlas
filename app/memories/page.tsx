'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowUpRight, Bookmark, CalendarDays, CarFront, Edit3, Loader2, Map, MapPin, Plane, Plus, RefreshCw, Route, Search, Ship, Star, Store, TrainFront, Users } from 'lucide-react';
import { useMemoryArchive } from '@/hooks/use-memory-archive';
import { transportMeta } from '@/lib/trips/transport';
import type { TransportMode } from '@/types/trip';

type ArchiveTab = 'all' | 'memories' | 'restaurants' | 'trips';
const transportIcons = { car: CarFront, train: TrainFront, boat: Ship, plane: Plane } satisfies Record<TransportMode, typeof CarFront>;

export default function MemoriesPage() {
  const archive = useMemoryArchive();
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<ArchiveTab>('all');
  const normalizedQuery = query.trim().toLocaleLowerCase('es');
  const memories = useMemo(() => archive.memories.filter((item) => `${item.title} ${item.description ?? ''} ${item.place ?? ''} ${item.participantNames.join(' ')}`.toLocaleLowerCase('es').includes(normalizedQuery)), [archive.memories, normalizedQuery]);
  const regularMemories = memories.filter((item) => !item.isRestaurant);
  const restaurants = memories.filter((item) => item.isRestaurant);
  const trips = useMemo(() => archive.trips.filter((item) => `${item.title} ${item.description ?? ''} ${item.cities.join(' ')} ${item.participants.map((person) => person.name).join(' ')}`.toLocaleLowerCase('es').includes(normalizedQuery)), [archive.trips, normalizedQuery]);
  const located = archive.memories.filter((memory) => memory.latitude !== undefined && memory.longitude !== undefined).length;
  const shared = archive.memories.filter((memory) => memory.participantIds.length > 0).length;
  const visibleCount = (tab === 'all' || tab === 'memories' ? regularMemories.length : 0) + (tab === 'all' || tab === 'restaurants' ? restaurants.length : 0) + (tab === 'all' || tab === 'trips' ? trips.length : 0);

  return <main className="min-h-screen bg-zinc-950 px-4 py-6 text-zinc-100 sm:px-6 sm:py-8"><div className="mx-auto max-w-7xl">
    <header className="overflow-hidden rounded-[2rem] border border-white/[.09] bg-[radial-gradient(circle_at_85%_0%,rgba(244,63,94,.14),transparent_36%),radial-gradient(circle_at_10%_100%,rgba(56,189,248,.08),transparent_34%),linear-gradient(145deg,#27272a,#09090b)] p-6 shadow-[0_28px_90px_rgba(0,0,0,.28)] sm:p-8"><div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[.2em] text-rose-300">Archivo conectado</p><h1 className="mt-2 text-4xl font-semibold tracking-[-.045em]">Memorias que construyen tu mapa.</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">Momentos, restaurantes y viajes conservan su lugar y sus personas. Todo aparece en el mapa solo cuando tú eliges mostrarlo.</p></div><div className="flex flex-wrap gap-2"><Link href="/home?source=mine" className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[.06] px-4 text-sm font-medium text-white transition hover:bg-white/[.1]"><Map className="h-4 w-4" />Ver mi mapa</Link><Link href="/memories/new" className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200"><Plus className="h-4 w-4" />Añadir</Link></div></div><div className="mt-7 grid grid-cols-4 gap-2 border-t border-white/[.07] pt-5 sm:max-w-2xl"><HeaderMetric value={regularMemories.length} label="memorias" /><HeaderMetric value={restaurants.length} label="restaurantes" /><HeaderMetric value={located} label="en mapa" /><HeaderMetric value={shared} label="compartidas" /></div></header>

    <div className="mt-6 flex flex-col gap-3 rounded-[1.4rem] border border-white/[.08] bg-zinc-900/45 p-3 sm:flex-row"><label className="relative min-w-0 flex-1"><span className="sr-only">Buscar en tu archivo</span><Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Busca una memoria, restaurante, viaje o persona" className="h-11 w-full rounded-xl border border-white/10 bg-zinc-950 pl-11 pr-4 text-sm outline-none transition placeholder:text-zinc-700 focus:border-rose-400/50 focus:ring-4 focus:ring-rose-400/5" /></label><div className="grid grid-cols-4 gap-1 rounded-xl bg-zinc-950 p-1" role="tablist" aria-label="Tipo de archivo">{([['all', 'Todo'], ['memories', 'Memorias'], ['restaurants', 'Mesas'], ['trips', 'Viajes']] as const).map(([key, label]) => <button key={key} type="button" role="tab" aria-selected={tab === key} onClick={() => setTab(key)} className={`rounded-lg px-2 py-2 text-[11px] font-medium transition sm:px-3 sm:text-xs ${tab === key ? 'bg-white text-zinc-950' : 'text-zinc-500 hover:text-white'}`}>{label}</button>)}</div></div>

    {archive.loading ? <div className="flex min-h-64 items-center justify-center gap-2 text-sm text-zinc-500"><Loader2 className="h-4 w-4 animate-spin" />Cargando archivo…</div> : archive.error ? <div role="alert" className="mt-8 rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center"><p className="text-sm text-red-200">{archive.error}</p><button onClick={() => void archive.refresh()} className="mt-4 inline-flex items-center gap-2 text-xs text-white"><RefreshCw className="h-3.5 w-3.5" />Reintentar</button></div> : <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {(tab === 'all' || tab === 'memories') && regularMemories.map((memory) => <MemoryCard key={memory.id} memory={memory} />)}
      {(tab === 'all' || tab === 'restaurants') && restaurants.map((memory) => <MemoryCard key={memory.id} memory={memory} />)}
      {(tab === 'all' || tab === 'trips') && trips.map((trip) => <TripCard key={trip.id} trip={trip} />)}
      {visibleCount === 0 && <div className="col-span-full rounded-[1.6rem] border border-dashed border-white/10 p-12 text-center"><Search className="mx-auto h-6 w-6 text-zinc-700" /><p className="mt-3 text-sm text-zinc-500">No hay historias que coincidan con esta vista.</p><button type="button" onClick={() => { setQuery(''); setTab('all'); }} className="mt-4 text-xs font-medium text-rose-300">Restablecer archivo</button></div>}
    </div>}
  </div></main>;
}

function MemoryCard({ memory }: { memory: ReturnType<typeof useMemoryArchive>['memories'][number] }) {
  const hasMap = memory.latitude !== undefined && memory.longitude !== undefined;
  const Icon = memory.isRestaurant ? Store : MapPin;
  const tone = memory.isRestaurant ? 'text-emerald-300' : 'text-rose-300';
  const restaurantDetails = [memory.restaurantCuisine, memory.restaurantVibe, memory.restaurantPriceLevel ? '€'.repeat(memory.restaurantPriceLevel) : undefined].filter(Boolean);
  return <article className={`group flex min-h-[250px] flex-col rounded-[1.55rem] border bg-zinc-900/45 p-5 transition hover:-translate-y-0.5 hover:bg-zinc-900/65 ${memory.isRestaurant?'border-emerald-300/[.12] hover:border-emerald-300/25':'border-white/[.08] hover:border-rose-300/15'}`}>
    <div className="flex items-center justify-between gap-3"><span className={`flex items-center gap-1.5 text-xs font-medium ${tone}`}><Icon className="h-3.5 w-3.5" />{memory.isRestaurant ? memory.restaurantStatus === 'wishlist' ? 'Quiero ir' : 'Visitado' : 'Memoria'}</span>{memory.date && <time className="text-[11px] text-zinc-600">{format(memory.date)}</time>}</div>
    <Link href={`/memories/${memory.id}`} className="mt-4"><h2 className="text-xl font-semibold tracking-[-.025em] text-white transition group-hover:text-rose-100">{memory.title}</h2>{memory.place && <p className="mt-1.5 text-xs text-zinc-500">{memory.place}</p>}</Link>
    {memory.isRestaurant && <div className="mt-3 flex flex-wrap gap-1.5">{restaurantDetails.map((detail)=><span key={detail} className="rounded-full border border-emerald-200/[.09] bg-emerald-300/[.045] px-2.5 py-1 text-[9px] text-emerald-100/65">{detail}</span>)}{memory.restaurantRating!==undefined&&<span className="inline-flex items-center gap-1 rounded-full border border-amber-200/[.1] bg-amber-300/[.05] px-2.5 py-1 text-[9px] text-amber-100/75"><Star className="h-2.5 w-2.5 fill-current" />{memory.restaurantRating}</span>}</div>}
    {memory.restaurantMustOrder&&<p className="mt-3 flex items-start gap-2 rounded-xl border border-white/[.06] bg-black/10 px-3 py-2 text-[11px] leading-5 text-zinc-400"><Bookmark className="mt-0.5 h-3 w-3 shrink-0 text-emerald-300" /><span><strong className="font-medium text-zinc-300">Pedir:</strong> {memory.restaurantMustOrder}</span></p>}
    {memory.description && <p className="mt-3 line-clamp-3 text-sm leading-6 text-zinc-400">{memory.description}</p>}
    <div className="mt-auto pt-5"><div className="flex items-center justify-between gap-3 border-t border-white/[.07] pt-4"><span className="flex min-w-0 items-center gap-1.5 text-[11px] text-zinc-600">{memory.participantIds.length ? <><Users className="h-3.5 w-3.5" /><span className="truncate">Con {memory.participantNames.join(', ')}</span></> : 'Solo tú'}</span><span className="flex items-center gap-1">{memory.isOwner&&<Link href={`/memories/${memory.id}/edit`} aria-label={`Editar ${memory.title}`} className="rounded-full border border-white/[.08] p-2 text-zinc-400 transition hover:bg-white/[.07] hover:text-white"><Edit3 className="h-3.5 w-3.5" /></Link>}{hasMap && <Link href={`/home?memory=${memory.id}`} aria-label={`Ver ${memory.title} en el mapa`} className="rounded-full border border-white/[.08] p-2 text-sky-300 transition hover:bg-white/[.07]"><Map className="h-3.5 w-3.5" /></Link>}<Link href={`/memories/${memory.id}`} aria-label={`Abrir ${memory.title}`} className="rounded-full border border-white/[.08] p-2 text-zinc-500 transition hover:bg-white hover:text-zinc-950"><ArrowUpRight className="h-3.5 w-3.5" /></Link></span></div></div>
  </article>;
}

function TripCard({ trip }: { trip: ReturnType<typeof useMemoryArchive>['trips'][number] }) {
  const Icon = transportIcons[trip.transportMode];
  return <article className="group flex min-h-[250px] flex-col rounded-[1.55rem] border bg-zinc-900/45 p-5 transition hover:-translate-y-0.5 hover:bg-zinc-900/65" style={{ borderColor: `${transportMeta[trip.transportMode].color}28` }}><div className="flex items-center justify-between gap-3"><span className="flex items-center gap-1.5 text-xs font-medium" style={{ color: transportMeta[trip.transportMode].color }}><Icon className="h-3.5 w-3.5" />{transportMeta[trip.transportMode].label}</span><span className="text-[11px] text-zinc-600">{trip.stops.length} paradas</span></div><h2 className="mt-4 text-xl font-semibold tracking-[-.025em] text-white">{trip.title}</h2><p className="mt-2 flex items-center gap-1.5 text-xs text-zinc-500"><CalendarDays className="h-3.5 w-3.5" />{format(trip.startDate)} — {format(trip.endDate)}</p>{trip.cities.length > 0 && <p className="mt-3 line-clamp-2 text-sm leading-6 text-zinc-400">{trip.cities.join(' · ')}</p>}<div className="mt-auto flex items-center justify-between gap-3 border-t border-white/[.07] pt-4"><span className="flex min-w-0 items-center gap-1.5 text-[11px] text-zinc-600">{trip.participants.length ? <><Users className="h-3.5 w-3.5" /><span className="truncate">Con {trip.participants.map((person) => person.name).join(', ')}</span></> : <><Route className="h-3.5 w-3.5" />Viaje personal</>}</span><Link href={`/home?trip=${trip.id}`} className="inline-flex items-center gap-1.5 rounded-full border border-white/[.08] px-3 py-2 text-[11px] font-medium text-white transition hover:bg-white hover:text-zinc-950"><Map className="h-3.5 w-3.5" />Mapa</Link></div></article>;
}

function HeaderMetric({ value, label }: { value: number; label: string }) { return <div><strong className="block text-2xl text-white">{value}</strong><span className="text-[10px] uppercase tracking-[.14em] text-zinc-600">{label}</span></div>; }
function format(value: string) { const date = new Date(value); return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('es', { dateStyle: 'medium' }).format(date); }

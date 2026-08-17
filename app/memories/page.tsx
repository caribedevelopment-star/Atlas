'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { CalendarDays, Loader2, MapPin, Plane, Plus, RefreshCw, Route, Store } from 'lucide-react';
import { useMemoryArchive } from '@/hooks/use-memory-archive';
import type { ProfileMemory } from '@/types/profile';

type Tab = 'all' | 'memories' | 'restaurants' | 'trips';

export default function MemoriesPage() {
  const archive = useMemoryArchive();
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<Tab>('all');
  const normalizedQuery = query.trim().toLocaleLowerCase('es');

  const filteredMemories = useMemo(() => archive.memories.filter((item) => `${item.title} ${item.description ?? ''} ${item.place ?? ''} ${item.city ?? ''} ${item.country ?? ''}`.toLocaleLowerCase('es').includes(normalizedQuery)), [archive.memories, normalizedQuery]);
  const memories = useMemo(() => filteredMemories.filter((item) => !item.isRestaurant), [filteredMemories]);
  const restaurants = useMemo(() => filteredMemories.filter((item) => item.isRestaurant), [filteredMemories]);
  const trips = useMemo(() => archive.trips.filter((item) => `${item.title} ${item.description ?? ''} ${item.cities.join(' ')} ${item.countries.join(' ')}`.toLocaleLowerCase('es').includes(normalizedQuery)), [archive.trips, normalizedQuery]);
  const restaurantsByCountry = useMemo(() => groupRestaurants(restaurants), [restaurants]);

  const showMemories = tab === 'all' || tab === 'memories';
  const showRestaurants = tab === 'all' || tab === 'restaurants';
  const showTrips = tab === 'all' || tab === 'trips';
  const visibleCount = (showMemories ? memories.length : 0) + (showRestaurants ? restaurants.length : 0) + (showTrips ? trips.length : 0);

  return <main className="min-h-screen bg-zinc-950 px-4 py-6 text-zinc-100 sm:px-6 sm:py-8">
    <div className="mx-auto max-w-7xl">
      <header className="flex flex-col gap-6 rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_85%_0%,rgba(244,63,94,.16),transparent_36%),radial-gradient(circle_at_10%_100%,rgba(16,185,129,.08),transparent_32%),linear-gradient(145deg,#27272a,#09090b)] p-6 sm:flex-row sm:items-end sm:justify-between sm:p-8">
        <div><p className="text-xs font-semibold uppercase tracking-[.2em] text-rose-300">Archivo personal</p><h1 className="mt-2 text-4xl font-semibold tracking-[-.045em]">Memorias, restaurantes y viajes</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">Tus momentos viven aquí. Los restaurantes se ordenan por país y los viajes solo despiertan sus rutas cuando tienen contexto.</p></div>
        <Link href="/memories/new" className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-zinc-950"><Plus className="h-4 w-4"/>Añadir</Link>
      </header>

      <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-white/10 bg-zinc-900/50 p-3 sm:flex-row">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar memoria, restaurante, país o viaje" className="h-11 min-w-0 flex-1 rounded-xl border border-white/10 bg-zinc-950 px-4 text-sm outline-none focus:border-rose-400"/>
        <div className="grid grid-cols-4 gap-1 rounded-xl bg-zinc-950 p-1">
          {([['all','Todo'],['memories','Memorias'],['restaurants','Restaurantes'],['trips','Viajes']] as const).map(([key,label]) => <button key={key} onClick={() => setTab(key)} className={`rounded-lg px-2 py-2 text-[10px] transition sm:px-3 sm:text-xs ${tab===key?'bg-white text-zinc-950':'text-zinc-500 hover:text-zinc-300'}`}>{label}</button>)}
        </div>
      </div>

      {archive.loading ? <div className="flex min-h-64 items-center justify-center gap-2 text-sm text-zinc-500"><Loader2 className="h-4 w-4 animate-spin"/>Cargando archivo…</div> : archive.error ? <div role="alert" className="mt-8 rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center"><p className="text-sm text-red-200">{archive.error}</p><button onClick={() => void archive.refresh()} className="mt-4 inline-flex items-center gap-2 text-xs text-white"><RefreshCw className="h-3.5 w-3.5"/>Reintentar</button></div> : <>
        {showRestaurants && restaurants.length > 0 && <section className="mt-7">
          <div className="flex items-end justify-between gap-4"><div><div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.18em] text-emerald-300"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400"/>Mapa gastronómico</div><h2 className="mt-2 text-2xl font-semibold tracking-[-.035em]">Restaurantes por país</h2><p className="mt-1 text-xs text-zinc-500">Un archivo simple para recordar dónde comiste y volver a encontrarlo en el mapa.</p></div><span className="rounded-full border border-emerald-300/10 bg-emerald-300/[.05] px-3 py-1.5 text-xs text-emerald-200/70">{restaurants.length} guardados</span></div>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">{restaurantsByCountry.map(([country, items]) => <section key={country} className="overflow-hidden rounded-[1.6rem] border border-emerald-300/10 bg-[linear-gradient(145deg,rgba(6,78,59,.18),rgba(24,24,27,.7))]">
            <div className="flex items-center justify-between border-b border-white/[.06] px-5 py-4"><div><div className="text-[10px] font-semibold uppercase tracking-[.18em] text-emerald-300/60">País</div><h3 className="mt-1 text-lg font-semibold">{country}</h3></div><span className="flex h-9 min-w-9 items-center justify-center rounded-full bg-emerald-300/[.08] px-2 text-xs text-emerald-200">{items.length}</span></div>
            <div className="grid gap-1 p-2">{items.map((restaurant) => <RestaurantRow key={restaurant.id} memory={restaurant} />)}</div>
          </section>)}</div>
        </section>}

        {showMemories && memories.length > 0 && <section className="mt-8"><SectionHeader eyebrow="Tu archivo" title="Memorias" count={memories.length}/><div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{memories.map((memory) => <MemoryCard key={memory.id} memory={memory}/>)}</div></section>}

        {showTrips && trips.length > 0 && <section className="mt-8"><SectionHeader eyebrow="Rutas" title="Viajes" count={trips.length}/><div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{trips.map((trip) => <article key={trip.id} className="rounded-2xl border border-sky-500/15 bg-sky-500/[.04] p-5"><div className="flex items-center justify-between"><span className="flex items-center gap-1.5 text-xs text-sky-300">{trip.transportMode === 'flight' ? <Plane className="h-3.5 w-3.5"/> : <Route className="h-3.5 w-3.5"/>}{trip.transportMode === 'flight' ? 'Vuelo' : 'Roadtrip'}</span><span className="text-xs text-zinc-600">{trip.stops.length} paradas</span></div><h3 className="mt-4 text-lg font-semibold">{trip.title}</h3><p className="mt-2 flex items-center gap-1.5 text-xs text-zinc-500"><CalendarDays className="h-3.5 w-3.5"/>{format(trip.startDate)} — {format(trip.endDate)}</p>{trip.cities.length>0&&<p className="mt-3 text-sm text-zinc-400">{trip.cities.join(' · ')}</p>}<p className="mt-4 text-[10px] leading-4 text-sky-200/45">Ábrelo desde la vista Viajes del mapa para despertar la ruta.</p></article>)}</div></section>}

        {visibleCount === 0 && <div className="mt-8 rounded-2xl border border-dashed border-white/10 p-12 text-center"><p className="text-sm text-zinc-500">No hay resultados en esta parte de tu Atlas.</p><Link href="/memories/new" className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-white"><Plus className="h-3.5 w-3.5"/>Añadir algo nuevo</Link></div>}
      </>}
    </div>
  </main>;
}

function RestaurantRow({ memory }: { memory: ProfileMemory }) { return <Link href={`/memories/${memory.id}`} className="group flex items-center gap-3 rounded-[1.15rem] p-3 transition hover:bg-white/[.055]"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-300/[.09] text-emerald-300"><Store className="h-4 w-4"/></span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium text-white">{memory.title}</span><span className="mt-0.5 block truncate text-[11px] text-zinc-500">{[memory.city, memory.place].filter(Boolean).join(' · ') || 'Lugar guardado'}</span></span>{memory.date && <time className="shrink-0 text-[10px] text-zinc-700">{format(memory.date)}</time>}</Link>; }
function MemoryCard({ memory }: { memory: ProfileMemory }) { return <Link href={`/memories/${memory.id}`} className="group rounded-2xl border border-white/10 bg-zinc-900/50 p-5 transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-zinc-900/70"><div className="flex items-center justify-between"><span className="flex items-center gap-1.5 text-xs text-rose-300"><MapPin className="h-3.5 w-3.5"/>Memoria</span>{memory.date&&<time className="text-xs text-zinc-600">{format(memory.date)}</time>}</div><h3 className="mt-4 text-lg font-semibold">{memory.title}</h3>{memory.place&&<p className="mt-1 text-xs text-zinc-500">{memory.place}</p>}{memory.description&&<p className="mt-3 line-clamp-3 text-sm leading-6 text-zinc-400">{memory.description}</p>}</Link>; }
function SectionHeader({ eyebrow, title, count }: { eyebrow: string; title: string; count: number }) { return <div className="flex items-end justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[.18em] text-zinc-600">{eyebrow}</p><h2 className="mt-1 text-2xl font-semibold tracking-[-.035em]">{title}</h2></div><span className="text-xs text-zinc-600">{count}</span></div>; }
function groupRestaurants(items: ProfileMemory[]) { const groups = new Map<string, ProfileMemory[]>(); items.forEach((item) => { const country = item.country?.trim() || 'Sin país'; groups.set(country, [...(groups.get(country) ?? []), item]); }); return [...groups.entries()].sort(([a],[b]) => a.localeCompare(b, 'es')).map(([country, values]) => [country, values.sort((a,b) => (b.date ?? b.createdAt ?? '').localeCompare(a.date ?? a.createdAt ?? ''))] as const); }
function format(value:string){const date=new Date(value);return Number.isNaN(date.getTime())?value:new Intl.DateTimeFormat('es',{dateStyle:'medium'}).format(date)}

'use client';

import Image from 'next/image';
import { CarFront, Check, Compass, Heart, Layers3, Map, MapPinned, Plane, Route, Search, Ship, Sparkles, Store, TrainFront, Users, Wine, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { AtlasMapFilters, AtlasMapSnapshot, MapLayer, MapSource } from '@/types/map';
import type { TransportMode } from '@/types/trip';
import type { AtlasExplorePreset } from '@/hooks/use-atlas-map';
import { transportMeta } from '@/lib/trips/transport';

const layerMeta: Array<{ id: MapLayer; label: string; hint: string; icon: typeof MapPinned; color: string }> = [
  { id: 'memories', label: 'Memorias', hint: 'Momentos ubicados', icon: MapPinned, color: '#fb7185' },
  { id: 'restaurants', label: 'Restaurantes', hint: 'Mesas para recordar', icon: Store, color: '#34d399' },
  { id: 'trips', label: 'Rutas de viaje', hint: 'Carro, tren, barco o avión', icon: Route, color: '#60a5fa' },
  { id: 'wines', label: 'Vinos & DO', hint: 'España, Italia y Francia', icon: Wine, color: '#c084fc' },
  { id: 'favorites', label: 'Favoritos', hint: 'Lugares importantes', icon: Heart, color: '#fbbf24' },
];

const sourceMeta: Array<{ id: MapSource; label: string }> = [
  { id: 'mine', label: 'Mío' }, { id: 'shared', label: 'Amigos' }, { id: 'public', label: 'Catálogo' },
];

const presetMeta: Array<{ id: AtlasExplorePreset; label: string; icon: typeof Sparkles }> = [
  { id: 'all', label: 'Todo', icon: Sparkles }, { id: 'mine', label: 'Mi Atlas', icon: Map }, { id: 'shared', label: 'Amigos', icon: Users }, { id: 'wine', label: 'Vinos', icon: Wine },
];

const transportIcons = { car: CarFront, train: TrainFront, boat: Ship, plane: Plane } satisfies Record<TransportMode, typeof CarFront>;

export function MapToolbar({ filters, snapshot, count, setQuery, setYear, setParticipant, toggleLayer, toggleSource, toggleTransport, applyPreset, reset }: { filters: AtlasMapFilters; snapshot: AtlasMapSnapshot; count: number; setQuery: (value: string) => void; setYear: (value: string) => void; setParticipant: (value: string) => void; toggleLayer: (value: MapLayer) => void; toggleSource: (value: MapSource) => void; toggleTransport: (value: TransportMode) => void; applyPreset: (preset: AtlasExplorePreset) => void; reset: () => void }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  useEffect(() => {
    if (!mobileOpen) return;
    const previous = document.body.style.overflow;
    const close = (event: KeyboardEvent) => event.key === 'Escape' && setMobileOpen(false);
    document.body.style.overflow = 'hidden'; document.addEventListener('keydown', close);
    return () => { document.body.style.overflow = previous; document.removeEventListener('keydown', close); };
  }, [mobileOpen]);

  const suggestions = useMemo(() => {
    const query = filters.query.trim().toLocaleLowerCase('es');
    if (query.length < 2) return [];
    const regions = snapshot.wineRegions.filter((region) => `${region.name} ${region.country}`.toLocaleLowerCase('es').includes(query)).slice(0, 4).map((region) => ({ id: region.id, title: region.name, subtitle: `${region.classification || 'DO'} · ${region.country}` }));
    const points = snapshot.points.filter((point) => [point.title, point.subtitle, point.ownerName, point.memory?.city, point.memory?.country].filter(Boolean).join(' ').toLocaleLowerCase('es').includes(query)).slice(0, 4).map((point) => ({ id: point.id, title: point.title, subtitle: point.subtitle || point.layer }));
    return [...regions, ...points].slice(0, 6);
  }, [filters.query, snapshot.points, snapshot.wineRegions]);

  const panelProps = { filters, snapshot, count, setQuery, setYear, setParticipant, toggleLayer, toggleSource, toggleTransport, applyPreset, reset };
  return <>
    <div className="absolute left-3 right-3 top-3 z-[900] lg:right-[372px] lg:left-5 lg:top-5">
      <div className="max-w-xl">
        <div className="flex gap-2">
          <div className="relative min-w-0 flex-1"><label className="relative block"><span className="sr-only">Buscar en Atlas</span><Search className="absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-zinc-500"/><input type="search" value={filters.query} onFocus={()=>setFocused(true)} onBlur={()=>setTimeout(()=>setFocused(false),140)} onChange={(event)=>setQuery(event.target.value)} placeholder="Lugar, persona, vino o denominación" className="atlas-map-glass h-12 w-full rounded-[1.2rem] border border-white/65 bg-white/[.94] pl-11 pr-11 text-sm font-medium text-zinc-950 shadow-[0_16px_48px_rgba(0,0,0,.26)] backdrop-blur-2xl outline-none placeholder:font-normal placeholder:text-zinc-500 focus:bg-white focus:ring-4 focus:ring-white/30"/>{filters.query&&<button type="button" onClick={()=>setQuery('')} aria-label="Limpiar búsqueda" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-zinc-200 p-1.5 text-zinc-600"><X className="h-3 w-3"/></button>}</label>{focused&&suggestions.length>0&&<div className="absolute inset-x-0 top-14 overflow-hidden rounded-[1.3rem] border border-black/5 bg-white/[.98] p-1.5 text-zinc-950 shadow-[0_24px_60px_rgba(0,0,0,.3)] backdrop-blur-3xl">{suggestions.map((item)=><button key={item.id} type="button" onMouseDown={()=>setQuery(item.title)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-zinc-100"><span className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-100 text-zinc-500"><Compass className="h-3.5 w-3.5"/></span><span className="min-w-0"><strong className="block truncate text-sm">{item.title}</strong><span className="block truncate text-[11px] text-zinc-500">{item.subtitle}</span></span></button>)}</div>}</div>
          <button type="button" onClick={()=>setMobileOpen(true)} aria-label="Abrir panel del mapa" className="atlas-map-glass flex h-12 items-center gap-2 rounded-[1.2rem] border border-white/65 bg-white/[.94] px-3.5 text-sm font-semibold text-zinc-950 shadow-[0_16px_48px_rgba(0,0,0,.26)] backdrop-blur-2xl lg:hidden"><Layers3 className="h-4 w-4"/><span className="hidden sm:inline">Capas</span><span className="rounded-full bg-zinc-950 px-1.5 py-0.5 text-[10px] text-white">{count}</span></button>
        </div>
      </div>
    </div>

    <aside aria-label="Panel de exploración" className="absolute bottom-4 right-4 top-4 z-[920] hidden w-[344px] overflow-y-auto rounded-[2rem] border border-white/15 bg-zinc-950/[.91] p-4 text-white shadow-[0_30px_90px_rgba(0,0,0,.48),inset_0_1px_0_rgba(255,255,255,.08)] backdrop-blur-3xl lg:block"><PanelContent {...panelProps}/></aside>

    {mobileOpen&&<div className="fixed inset-0 z-[1200] bg-black/45 backdrop-blur-[6px]" onMouseDown={(event)=>event.target===event.currentTarget&&setMobileOpen(false)}><aside role="dialog" aria-modal="true" aria-label="Panel de exploración" className="absolute inset-x-2 bottom-2 max-h-[88dvh] overflow-y-auto rounded-[2rem] border border-white/10 bg-zinc-950/[.98] p-5 text-white shadow-[0_30px_90px_rgba(0,0,0,.65)] sm:inset-y-3 sm:left-auto sm:right-3 sm:w-[390px]"><div className="mb-4 flex items-center justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[.2em] text-cyan-300">Atlas en vivo</p><h2 className="mt-1 text-2xl font-semibold">Qué quieres ver</h2></div><button type="button" onClick={()=>setMobileOpen(false)} aria-label="Cerrar panel" className="rounded-full bg-white/[.06] p-2.5 text-zinc-400"><X className="h-5 w-5"/></button></div><PanelContent {...panelProps}/></aside></div>}
  </>;
}

function PanelContent({ filters, snapshot, count, setQuery, setYear, setParticipant, toggleLayer, toggleSource, toggleTransport, applyPreset, reset }: { filters: AtlasMapFilters; snapshot: AtlasMapSnapshot; count: number; setQuery: (value: string) => void; setYear: (value: string) => void; setParticipant: (value: string) => void; toggleLayer: (value: MapLayer) => void; toggleSource: (value: MapSource) => void; toggleTransport: (value: TransportMode) => void; applyPreset: (preset: AtlasExplorePreset) => void; reset: () => void }) {
  const regions = [...snapshot.wineRegions].sort((a,b)=>b.wineCount-a.wineCount).slice(0,8);
  return <div>
    <div className="hidden lg:flex lg:items-start lg:justify-between"><div><p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.2em] text-cyan-300"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-300"/>Atlas en vivo</p><h2 className="mt-1.5 text-2xl font-semibold tracking-[-.04em]">Explorar</h2><p className="mt-1 text-[11px] text-zinc-500">{count} elementos visibles</p></div><span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[.05] text-zinc-300"><Layers3 className="h-4 w-4"/></span></div>
    <div className="mt-4 grid grid-cols-4 gap-1 rounded-2xl border border-white/[.08] bg-white/[.03] p-1">{presetMeta.map(({id,label,icon:Icon})=><button key={id} type="button" onClick={()=>applyPreset(id)} className="flex flex-col items-center gap-1 rounded-xl px-1 py-2 text-[10px] text-zinc-500 transition hover:bg-white/[.07] hover:text-white"><Icon className="h-3.5 w-3.5"/>{label}</button>)}</div>

    <fieldset className="mt-5"><legend className="text-[10px] font-semibold uppercase tracking-[.18em] text-zinc-500">Capas</legend><div className="mt-2 space-y-1.5">{layerMeta.map(({id,label,hint,icon:Icon,color})=>{const active=filters.layers.has(id);const total=snapshot.points.filter((point)=>point.layer===id).length;return <button key={id} type="button" onClick={()=>toggleLayer(id)} aria-pressed={active} className={`flex w-full items-center gap-3 rounded-[1.1rem] border px-3 py-2.5 text-left transition ${active?'border-white/[.13] bg-white/[.075]':'border-white/[.05] bg-white/[.015] opacity-55 hover:opacity-85'}`}><span className="flex h-9 w-9 items-center justify-center rounded-xl" style={{color,backgroundColor:`${color}16`}}><Icon className="h-4 w-4"/></span><span className="min-w-0 flex-1"><strong className="block text-xs font-medium text-white">{label}</strong><span className="mt-0.5 block truncate text-[10px] text-zinc-600">{hint}</span></span><span className="text-[10px] tabular-nums text-zinc-600">{total}</span><span className={`flex h-5 w-5 items-center justify-center rounded-full ${active?'bg-white text-zinc-950':'border border-white/10'}`}>{active&&<Check className="h-3 w-3"/>}</span></button>})}</div></fieldset>

    <fieldset className="mt-5"><legend className="text-[10px] font-semibold uppercase tracking-[.18em] text-zinc-500">Rutas por transporte</legend><div className="mt-2 grid grid-cols-4 gap-1.5">{(['car','train','boat','plane'] as TransportMode[]).map((mode)=>{const Icon=transportIcons[mode];const active=filters.transports.has(mode);const total=snapshot.points.filter((point)=>point.trip?.transportMode===mode).length;return <button key={mode} type="button" onClick={()=>toggleTransport(mode)} disabled={!total} aria-pressed={active} title={transportMeta[mode].description} className={`rounded-xl border px-1 py-2 text-center transition disabled:opacity-25 ${active?'border-white/[.13] bg-white/[.07]':'border-white/[.05] opacity-45'}`}><Icon className="mx-auto h-4 w-4" style={{color:transportMeta[mode].color}}/><span className="mt-1 block text-[9px] font-medium text-zinc-300">{transportMeta[mode].shortLabel}</span><span className="block text-[8px] text-zinc-700">{total}</span></button>})}</div></fieldset>

    <fieldset className="mt-5"><legend className="text-[10px] font-semibold uppercase tracking-[.18em] text-zinc-500">Origen</legend><div className="mt-2 grid grid-cols-3 gap-1 rounded-xl border border-white/[.07] bg-black/20 p-1">{sourceMeta.map(({id,label})=>{const active=filters.sources.has(id);return <button key={id} type="button" onClick={()=>toggleSource(id)} aria-pressed={active} className={`rounded-lg py-2 text-[10px] font-medium transition ${active?'bg-white text-zinc-950':'text-zinc-600'}`}>{label}</button>})}</div></fieldset>

    {regions.length>0&&<section className="mt-5"><div className="flex items-center justify-between"><div><h3 className="text-[10px] font-semibold uppercase tracking-[.18em] text-zinc-500">Denominaciones</h3><p className="mt-1 text-[9px] text-zinc-700">Acércate en el mapa para desplegar el catálogo completo.</p></div><span className="rounded-full border border-white/[.07] px-2 py-1 text-[9px] text-zinc-600">{snapshot.wineRegions.length}</span></div><div className="mt-2 grid grid-cols-2 gap-1.5">{regions.map((region)=>{const color=regionColor(region.country);return <button key={region.id} type="button" onClick={()=>{applyPreset('wine');setQuery(region.name)}} className="group rounded-xl border border-white/[.06] bg-white/[.025] p-2.5 text-left transition hover:-translate-y-0.5 hover:bg-white/[.055]" style={{boxShadow:`inset 0 1px 0 rgba(255,255,255,.025)`}}><span className="mb-2 flex items-center justify-between"><span className="h-2 w-2 rounded-full" style={{backgroundColor:color,boxShadow:`0 0 12px ${color}77`}}/><span className="text-[7px] font-semibold uppercase tracking-[.13em]" style={{color}}>{region.classification||'GI'}</span></span><span className="block truncate text-[10px] font-medium text-white">{region.name}</span><span className="mt-1 block truncate text-[8px] uppercase tracking-wider text-zinc-600">{region.country} · {region.wineCount ? `${region.wineCount} vinos` : 'catálogo'}</span></button>})}</div></section>}

    {snapshot.years.length>0&&<section className="mt-5"><h3 className="text-[10px] font-semibold uppercase tracking-[.18em] text-zinc-500">Año</h3><div className="mt-2 flex gap-1.5 overflow-x-auto pb-1"><Chip active={!filters.year} onClick={()=>setYear('')}>Todos</Chip>{snapshot.years.slice(0,6).map((year)=><Chip key={year} active={filters.year===year} onClick={()=>setYear(year)}>{year}</Chip>)}</div></section>}

    {snapshot.participants.length>0&&<section className="mt-5"><h3 className="text-[10px] font-semibold uppercase tracking-[.18em] text-zinc-500">Personas</h3><div className="mt-2 flex gap-2 overflow-x-auto pb-1"><button type="button" onClick={()=>setParticipant('')} className={`flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3 text-[10px] ${!filters.participant?'border-white bg-white text-zinc-950':'border-white/10 text-zinc-500'}`}><Users className="h-3 w-3"/>Todas</button>{snapshot.participants.slice(0,8).map((person)=><button key={person.id} type="button" onClick={()=>setParticipant(filters.participant===person.id?'':person.id)} className={`flex h-9 shrink-0 items-center gap-2 rounded-full border py-1 pl-1 pr-3 text-[10px] ${filters.participant===person.id?'border-cyan-200/30 bg-cyan-200 text-cyan-950':'border-white/10 text-zinc-400'}`}><span className="relative flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-zinc-800 text-[8px] text-white">{person.avatarUrl?<Image src={person.avatarUrl} alt="" fill unoptimized={person.avatarUrl.startsWith('http')} className="object-cover"/>:person.name.slice(0,2).toUpperCase()}</span>{person.name}</button>)}</div></section>}
    <button type="button" onClick={reset} className="mt-5 flex h-10 w-full items-center justify-center rounded-xl border border-white/[.07] bg-white/[.025] text-xs text-zinc-500 transition hover:bg-white/[.06] hover:text-zinc-300">Restablecer mapa</button>
  </div>;
}

function Chip({active,onClick,children}:{active:boolean;onClick:()=>void;children:React.ReactNode}){return <button type="button" onClick={onClick} className={`shrink-0 rounded-full px-3 py-1.5 text-[10px] font-medium ${active?'bg-white text-zinc-950':'border border-white/10 text-zinc-600'}`}>{children}</button>}
function regionColor(country:string){return country==='España'?'#fb7185':country==='Italia'?'#6ee7b7':'#a78bfa'}

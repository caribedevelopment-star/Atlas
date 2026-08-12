'use client';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useState } from 'react';
import { Orbit, Plus } from 'lucide-react';
import { MapEmptyState, MapErrorState, MapLoadingState, MapToolbar } from '@/components/map';
import { AtlasUniverse } from '@/components/map/AtlasUniverse';
import { useAtlasMap } from '@/hooks/use-atlas-map';

const AtlasLeafletMap = dynamic(() => import('@/components/map/AtlasLeafletMap').then((module) => module.AtlasLeafletMap), { ssr: false, loading: () => <MapLoadingState /> });

export default function MapComponent() {
  const map = useAtlasMap();
  const [universeOpen, setUniverseOpen] = useState(false);
  if (map.loading) return <div className="h-full"><MapLoadingState /></div>;
  if (map.error || !map.snapshot) return <div className="h-full"><MapErrorState message={map.error || 'No hay datos disponibles.'} retry={() => void map.refresh()} /></div>;

  return <section aria-label="Mapa del archivo Atlas" className="relative h-full min-h-[450px] overflow-hidden bg-zinc-950">
    <AtlasLeafletMap points={map.points} wineRegions={map.wineRegions} />
    <MapToolbar filters={map.filters} snapshot={map.snapshot} count={map.points.length} setQuery={map.setQuery} setYear={map.setYear} setParticipant={map.setParticipant} toggleLayer={map.toggleLayer} toggleSource={map.toggleSource} applyPreset={map.applyPreset} reset={map.reset} />

    {map.points.length === 0 && <MapEmptyState reset={map.reset} />}

    <div className="pointer-events-none absolute bottom-[5.6rem] left-3 z-[690] sm:bottom-5 sm:left-5">
      <div className="flex items-center gap-2 rounded-full border border-white/15 bg-zinc-950/72 px-3 py-2 text-[10px] font-semibold uppercase tracking-[.14em] text-zinc-400 shadow-[0_14px_42px_rgba(0,0,0,.24)] backdrop-blur-2xl">
        <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-45"/><span className="relative inline-flex h-2 w-2 rounded-full bg-rose-400"/></span>
        Atlas vivo <span className="text-white/75">· {map.points.length}</span>
      </div>
    </div>

    <div className="absolute bottom-24 right-4 z-[800] flex items-center gap-2 sm:bottom-5 sm:right-20">
      <button type="button" onClick={() => setUniverseOpen(true)} aria-label="Salir al universo Atlas" className="atlas-space-button group flex h-14 items-center gap-2 rounded-full border border-white/15 bg-zinc-950/82 px-4 text-sm font-semibold text-white shadow-[0_18px_45px_rgba(0,0,0,.32)] backdrop-blur-2xl transition hover:-translate-y-0.5 hover:bg-zinc-900/90 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"><span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-white/[.07]"><span className="absolute inset-0 animate-ping rounded-full border border-cyan-200/20 opacity-30"/><Orbit className="relative h-4 w-4 text-cyan-100 transition duration-500 group-hover:rotate-180"/></span><span className="hidden sm:inline">Universo</span></button>
      <Link href="/memories/new" aria-label="Añadir una memoria o viaje" className="inline-flex h-14 items-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-zinc-950 shadow-[0_18px_45px_rgba(0,0,0,.28)] transition hover:-translate-y-0.5 hover:bg-zinc-100 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"><Plus className="h-5 w-5" aria-hidden="true"/><span>Añadir</span></Link>
    </div>

    {universeOpen && <AtlasUniverse snapshot={map.snapshot} onClose={() => setUniverseOpen(false)} />}
  </section>;
}

'use client';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useState } from 'react';
import { Orbit, Plus, Sparkles } from 'lucide-react';
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

    <div className="pointer-events-none absolute bottom-[5.75rem] left-3 z-[690] sm:bottom-5 sm:left-5">
      <div className="flex items-center gap-2 rounded-full border border-white/15 bg-zinc-950/72 px-3 py-2 text-[10px] font-semibold uppercase tracking-[.14em] text-zinc-400 shadow-[0_14px_42px_rgba(0,0,0,.24)] backdrop-blur-2xl">
        <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-45"/><span className="relative inline-flex h-2 w-2 rounded-full bg-rose-400"/></span>
        Atlas vivo <span className="text-white/75">· {map.points.length}</span>
      </div>
    </div>

    <div className="absolute bottom-[5.35rem] right-3 z-[800] sm:bottom-5 sm:right-20">
      <div className="atlas-map-action-dock flex items-center gap-1 rounded-[1.45rem] border border-white/15 bg-zinc-950/78 p-1.5 shadow-[0_20px_60px_rgba(0,0,0,.34),inset_0_1px_0_rgba(255,255,255,.05)] backdrop-blur-2xl">
        <button type="button" onClick={() => setUniverseOpen(true)} aria-label="Abrir universo Atlas" className="group relative flex h-12 items-center gap-2 overflow-hidden rounded-[1.05rem] px-3.5 text-sm font-semibold text-white transition hover:bg-white/[.07] active:scale-[.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300">
          <span className="atlas-space-button-glow absolute inset-0 opacity-0 transition group-hover:opacity-100" />
          <span className="relative flex h-8 w-8 items-center justify-center rounded-full border border-cyan-200/10 bg-cyan-200/[.06]"><span className="absolute inset-0 animate-ping rounded-full border border-cyan-200/20 opacity-20"/><Orbit className="relative h-4 w-4 text-cyan-100 transition duration-500 group-hover:rotate-180"/></span>
          <span className="relative hidden sm:block">Universo</span>
        </button>
        <div className="h-7 w-px bg-white/[.08]" aria-hidden="true" />
        <Link href="/memories/new" aria-label="Añadir una memoria o viaje" className="group flex h-12 items-center gap-2 rounded-[1.05rem] bg-white px-3.5 text-sm font-semibold text-zinc-950 shadow-[0_8px_24px_rgba(255,255,255,.08)] transition hover:-translate-y-0.5 hover:bg-sky-50 active:translate-y-0 active:scale-[.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-950 text-white"><Plus className="h-4 w-4 transition group-hover:rotate-90" aria-hidden="true" /></span>
          <span className="hidden sm:block">Añadir</span>
        </Link>
      </div>
      <div className="mt-1.5 hidden items-center justify-center gap-1 text-[9px] uppercase tracking-[.15em] text-zinc-700 sm:flex"><Sparkles className="h-2.5 w-2.5" />Explora o crea</div>
    </div>

    {universeOpen && <AtlasUniverse snapshot={map.snapshot} onClose={() => setUniverseOpen(false)} />}
  </section>;
}

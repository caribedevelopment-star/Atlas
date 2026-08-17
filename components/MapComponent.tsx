'use client';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Orbit, Plus, Sparkles } from 'lucide-react';
import { MapEmptyState, MapErrorState, MapLoadingState, MapToolbar } from '@/components/map';
import { AtlasUniverse } from '@/components/map/AtlasUniverse';
import { useAtlasMap } from '@/hooks/use-atlas-map';

const AtlasLeafletMap = dynamic(() => import('@/components/map/AtlasLeafletMap').then((module) => module.AtlasLeafletMap), { ssr: false, loading: () => <MapLoadingState /> });

export default function MapComponent() {
  const map = useAtlasMap();
  const [universeOpen, setUniverseOpen] = useState(false);
  const tripPoints = useMemo(() => map.snapshot?.points.filter((point) => Boolean(point.trip)) ?? [], [map.snapshot]);
  if (map.loading) return <div className="h-full"><MapLoadingState /></div>;
  if (map.error || !map.snapshot) return <div className="h-full"><MapErrorState message={map.error || 'No hay datos disponibles.'} retry={() => void map.refresh()} /></div>;

  return <section aria-label="Mapa del archivo Atlas" className="relative h-full min-h-[450px] overflow-hidden bg-zinc-950">
    <AtlasLeafletMap points={map.points} tripPoints={tripPoints} wineRegions={map.wineRegions} />
    <MapToolbar filters={map.filters} snapshot={map.snapshot} count={map.points.length} setQuery={map.setQuery} setYear={map.setYear} setParticipant={map.setParticipant} toggleLayer={map.toggleLayer} toggleSource={map.toggleSource} applyPreset={map.applyPreset} reset={map.reset} />
    {map.points.length === 0 && <MapEmptyState reset={map.reset} />}

    <div className="absolute bottom-[5.2rem] left-1/2 z-[800] -translate-x-1/2 sm:bottom-6 sm:left-auto sm:right-20 sm:translate-x-0">
      <div className="atlas-map-action-dock flex items-center gap-1.5 rounded-[1.65rem] border border-white/20 bg-zinc-950/90 p-1.5 shadow-[0_24px_70px_rgba(0,0,0,.42),inset_0_1px_0_rgba(255,255,255,.08)] backdrop-blur-3xl">
        <button type="button" onClick={() => setUniverseOpen(true)} aria-label="Abrir universo Atlas" className="atlas-universe-launch atlas-organic-gateway group relative flex items-center gap-2 overflow-hidden rounded-[1.2rem] px-3.5 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 active:scale-[.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 sm:px-4">
          <span className="atlas-universe-launch-glow absolute inset-0" aria-hidden="true" />
          <span className="atlas-organic-membrane atlas-organic-membrane-a absolute" aria-hidden="true" />
          <span className="atlas-organic-membrane atlas-organic-membrane-b absolute" aria-hidden="true" />
          <span className="relative flex h-9 w-9 items-center justify-center rounded-full border border-cyan-100/20 bg-cyan-200/[.09]">
            <span className="atlas-organic-ring absolute inset-[-6px] rounded-full border border-cyan-100/15" />
            <span className="atlas-organic-core absolute h-2.5 w-2.5 rounded-full bg-cyan-100/70 blur-[1px]" />
            <Orbit className="relative h-4 w-4 text-cyan-50 transition duration-700 group-hover:rotate-[225deg]" />
          </span>
          <span className="relative flex flex-col items-start leading-none"><span>Universo</span><span className="mt-1 text-[8px] font-medium uppercase tracking-[.2em] text-cyan-100/45">organismo Atlas</span></span>
        </button>
        <div className="h-8 w-px bg-white/[.1]" aria-hidden="true" />
        <Link href="/memories/new" aria-label="Añadir una memoria o viaje" className="atlas-add-launch group flex items-center gap-2 rounded-[1.2rem] bg-white px-3.5 py-2 text-sm font-semibold text-zinc-950 shadow-[0_10px_30px_rgba(255,255,255,.12)] transition hover:-translate-y-0.5 hover:bg-sky-50 active:scale-[.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 sm:px-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-950 text-white shadow-lg"><Plus className="h-4 w-4 transition duration-500 group-hover:rotate-90" aria-hidden="true" /></span>
          <span>Añadir</span>
        </Link>
      </div>
      <div className="mt-2 flex items-center justify-center gap-1.5 text-[9px] font-semibold uppercase tracking-[.16em] text-zinc-700"><Sparkles className="h-2.5 w-2.5" />Tu Atlas está vivo</div>
    </div>

    {universeOpen && <AtlasUniverse snapshot={map.snapshot} onClose={() => setUniverseOpen(false)} />}
  </section>;
}

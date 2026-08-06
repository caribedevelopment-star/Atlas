'use client';
import dynamic from 'next/dynamic';
import { MapEmptyState, MapErrorState, MapLoadingState, MapToolbar } from '@/components/map';
import { useAtlasMap } from '@/hooks/use-atlas-map';

const AtlasLeafletMap = dynamic(() => import('@/components/map/AtlasLeafletMap').then((module) => module.AtlasLeafletMap), { ssr: false, loading: () => <MapLoadingState /> });

export default function MapComponent() {
  const map = useAtlasMap();
  if (map.loading) return <div className="h-full"><MapLoadingState /></div>;
  if (map.error || !map.snapshot) return <div className="h-full"><MapErrorState message={map.error || 'No hay datos disponibles.'} retry={() => void map.refresh()} /></div>;
  return <section aria-label="Mapa del archivo Atlas" className="relative h-full min-h-[450px] overflow-hidden bg-zinc-950"><AtlasLeafletMap points={map.points} /><MapToolbar filters={map.filters} snapshot={map.snapshot} count={map.points.length} setQuery={map.setQuery} setYear={map.setYear} setParticipant={map.setParticipant} toggleLayer={map.toggleLayer} toggleSource={map.toggleSource} />{map.points.length === 0 ? <MapEmptyState reset={map.reset} /> : <div className="pointer-events-none absolute bottom-24 left-4 z-[700] rounded-full border border-white/10 bg-zinc-950/85 px-3 py-1.5 text-[11px] text-zinc-400 shadow-xl backdrop-blur sm:bottom-4" aria-live="polite">{map.points.length} ubicaciones visibles</div>}</section>;
}

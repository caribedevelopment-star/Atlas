'use client';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { MapPinned, Plus, Route, Sparkles, Users, Wine } from 'lucide-react';
import { MapEmptyState, MapErrorState, MapLoadingState, MapToolbar } from '@/components/map';
import { useAtlasMap } from '@/hooks/use-atlas-map';

const AtlasLeafletMap = dynamic(() => import('@/components/map/AtlasLeafletMap').then((module) => module.AtlasLeafletMap), { ssr: false, loading: () => <MapLoadingState /> });

export default function MapComponent() {
  const map = useAtlasMap();
  if (map.loading) return <div className="h-full"><MapLoadingState /></div>;
  if (map.error || !map.snapshot) return <div className="h-full"><MapErrorState message={map.error || 'No hay datos disponibles.'} retry={() => void map.refresh()} /></div>;

  const memories = map.snapshot.points.filter((point) => point.layer === 'memories').length;
  const shared = map.snapshot.points.filter((point) => point.source === 'shared' && (point.layer === 'memories' || point.layer === 'trips')).length;
  const wines = map.snapshot.points.filter((point) => point.layer === 'wines').length;
  const trips = map.snapshot.points.filter((point) => point.layer === 'trips').length;

  return <section aria-label="Mapa del archivo Atlas" className="relative h-full min-h-[450px] overflow-hidden bg-zinc-950">
    <AtlasLeafletMap points={map.points} wineRegions={map.wineRegions} />
    <MapToolbar filters={map.filters} snapshot={map.snapshot} count={map.points.length} setQuery={map.setQuery} setYear={map.setYear} setParticipant={map.setParticipant} toggleLayer={map.toggleLayer} toggleSource={map.toggleSource} applyPreset={map.applyPreset} reset={map.reset} />

    {map.points.length === 0 ? <MapEmptyState reset={map.reset} /> : <div className="absolute bottom-[5.4rem] left-3 z-[690] max-w-[calc(100%-5.5rem)] sm:bottom-4 sm:left-5 sm:max-w-none"><div className="flex max-w-full items-center gap-1.5 overflow-x-auto rounded-[1.35rem] border border-white/12 bg-zinc-950/78 p-1.5 shadow-[0_18px_50px_rgba(0,0,0,.28)] backdrop-blur-2xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"><div className="flex shrink-0 items-center gap-2 rounded-2xl px-2.5 py-2 text-[10px] font-semibold uppercase tracking-[.14em] text-zinc-400"><span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-45" /><span className="relative inline-flex h-2 w-2 rounded-full bg-rose-400" /></span>Atlas vivo</div><LivePill icon={<MapPinned className="h-3.5 w-3.5" />} label="Memorias" value={memories} onClick={() => map.applyPreset('mine')} />{shared > 0 && <LivePill icon={<Users className="h-3.5 w-3.5" />} label="Compartidos" value={shared} onClick={() => map.applyPreset('shared')} accent />}<LivePill icon={<Wine className="h-3.5 w-3.5" />} label="Vinos" value={wines} onClick={() => map.applyPreset('wine')} /><LivePill icon={<Route className="h-3.5 w-3.5" />} label="Rutas" value={trips} onClick={() => map.applyPreset('trips')} />{map.snapshot.wineRegions.length > 0 && <LivePill icon={<Sparkles className="h-3.5 w-3.5" />} label="DO" value={map.snapshot.wineRegions.length} onClick={() => map.applyPreset('wine')} accent />}</div></div>}

    <Link href="/memories/new" aria-label="Añadir una memoria o viaje" className="absolute bottom-24 right-4 z-[800] inline-flex h-14 items-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-zinc-950 shadow-[0_18px_45px_rgba(0,0,0,.28)] transition hover:bg-zinc-200 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 sm:bottom-5 sm:right-20"><Plus className="h-5 w-5" aria-hidden="true" /><span>Añadir</span></Link>
  </section>;
}

function LivePill({ icon, label, value, onClick, accent = false }: { icon: React.ReactNode; label: string; value: number; onClick: () => void; accent?: boolean }) {
  return <button type="button" onClick={onClick} className={`flex shrink-0 items-center gap-2 rounded-2xl px-2.5 py-2 text-xs transition active:scale-95 ${accent ? 'bg-rose-400/12 text-rose-200' : 'bg-white/[.045] text-zinc-300 hover:bg-white/[.075]'}`}><span className={accent ? 'text-rose-300' : 'text-zinc-500'}>{icon}</span><span>{label}</span><span className={`font-semibold tabular-nums ${accent ? 'text-rose-200' : 'text-white'}`}>{value}</span></button>;
}

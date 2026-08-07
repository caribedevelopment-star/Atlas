import { Check, Heart, MapPinned, Route, Store, Wine } from 'lucide-react';
import type { AtlasMapFilters, AtlasMapSnapshot, MapLayer, MapSource } from '@/types/map';

const layers: Array<[MapLayer, string, string, typeof Wine]> = [
  ['memories', 'Memorias', 'Momentos y lugares guardados', MapPinned],
  ['wines', 'Vinos', 'Botellas y regiones DO', Wine],
  ['trips', 'Viajes', 'Rutas y paradas', Route],
  ['favorites', 'Favoritos', 'Tus sitios importantes', Heart],
  ['restaurants', 'Restaurantes', 'Lugares para volver', Store],
];
const sources: Array<[MapSource, string]> = [['mine', 'Yo'], ['friends', 'Amigos'], ['public', 'Público']];

export function MapLayerSelector({ filters, snapshot, toggleLayer, toggleSource }: { filters: AtlasMapFilters; snapshot?: AtlasMapSnapshot; toggleLayer: (layer: MapLayer) => void; toggleSource: (source: MapSource) => void }) {
  const layerCount = (layer: MapLayer) => snapshot?.points.filter((point) => point.layer === layer).length ?? 0;
  const sourceCount = (source: MapSource) => snapshot?.points.filter((point) => point.source === source).length ?? 0;
  return <div className="space-y-6">
    <fieldset>
      <legend className="mb-2.5 text-[11px] font-semibold uppercase tracking-[.18em] text-zinc-500">Quién aparece</legend>
      <div className="grid grid-cols-3 rounded-[1.2rem] border border-white/10 bg-white/[.04] p-1">
        {sources.map(([value, label]) => {
          const active = filters.sources.has(value);
          return <button key={value} type="button" onClick={() => toggleSource(value)} aria-pressed={active} className={`rounded-[.95rem] px-2 py-2.5 text-xs font-medium transition-all ${active ? 'bg-white text-zinc-950 shadow-[0_5px_18px_rgba(0,0,0,.25)]' : 'text-zinc-500 hover:text-zinc-200'}`}>
            <span className="block">{label}</span><span className={`mt-0.5 block text-[10px] ${active ? 'text-zinc-500' : 'text-zinc-700'}`}>{sourceCount(value)}</span>
          </button>;
        })}
      </div>
    </fieldset>

    <fieldset>
      <legend className="mb-2.5 text-[11px] font-semibold uppercase tracking-[.18em] text-zinc-500">Qué quieres ver</legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {layers.map(([value, label, description, Icon]) => {
          const active = filters.layers.has(value);
          return <button key={value} type="button" onClick={() => toggleLayer(value)} aria-pressed={active} className={`group flex min-h-[76px] items-center gap-3 rounded-[1.25rem] border p-3 text-left transition-all ${active ? 'border-white/20 bg-white/[.09] shadow-[inset_0_1px_0_rgba(255,255,255,.07)]' : 'border-white/[.07] bg-white/[.025] hover:bg-white/[.05]'}`}>
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl transition ${active ? 'bg-white text-zinc-950' : 'bg-white/[.05] text-zinc-500 group-hover:text-zinc-300'}`}><Icon className="h-4 w-4" /></span>
            <span className="min-w-0 flex-1"><span className={`block text-sm font-medium ${active ? 'text-white' : 'text-zinc-400'}`}>{label}</span><span className="mt-0.5 block truncate text-[11px] text-zinc-600">{description}</span></span>
            <span className="flex flex-col items-end gap-1"><span className="text-[11px] tabular-nums text-zinc-600">{layerCount(value)}</span>{active && <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-400 text-zinc-950"><Check className="h-3 w-3" /></span>}</span>
          </button>;
        })}
      </div>
    </fieldset>
  </div>;
}

'use client';

import { useEffect, useRef } from 'react';
import type { WineFilters as Filters } from '@/types/wine';

interface Options { countries: string[]; regions: string[]; denominations: string[]; grapes: string[]; vintages: string[]; retailers: string[] }
interface Props { filters: Filters; options: Options; onChange: (filters: Filters) => void; onClose?: () => void }

const inputClass = 'h-11 w-full rounded-xl border border-white/10 bg-zinc-950 px-3 text-sm text-white outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-400/20';

export function WineFilters({ filters, options, onChange, onClose }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    closeRef.current?.focus();
    if (!onClose) return;
    const escape = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    document.addEventListener('keydown', escape);
    return () => document.removeEventListener('keydown', escape);
  }, [onClose]);
  const set = <K extends keyof Filters>(key: K, value: Filters[K]) => onChange({ ...filters, [key]: value });
  return <div className="space-y-5">
    <div className="flex items-center justify-between"><h2 className="font-semibold text-white">Filtros</h2>{onClose && <button ref={closeRef} onClick={onClose} className="rounded-lg px-3 py-1.5 text-sm text-zinc-400 hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400">Cerrar</button>}</div>
    <fieldset><legend className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-500">Origen</legend><div className="grid grid-cols-2 gap-2">{[['all','Todos'],['mine','Míos'],['friends','Amigos'],['public','Públicos']].map(([value,label]) => <button key={value} onClick={() => set('source', value as Filters['source'])} aria-pressed={filters.source === value} className={`rounded-xl border px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 ${filters.source === value ? 'border-rose-400/50 bg-rose-500/15 text-rose-200' : 'border-white/10 text-zinc-400 hover:bg-white/5'}`}>{label}</button>)}</div></fieldset>
    <label className="flex items-center gap-3 rounded-xl border border-white/10 p-3 text-sm text-zinc-300"><input type="checkbox" checked={filters.favorite} onChange={(event) => set('favorite', event.target.checked)} className="h-4 w-4 accent-rose-500" />Solo favoritos</label>
    <div className="grid grid-cols-2 gap-3"><NumberField label="Rating mínimo" value={filters.minimumRating} onChange={(value) => set('minimumRating', value)} min={0} max={5} step={0.5} /><NumberField label="Precio mínimo" value={filters.minimumPrice} onChange={(value) => set('minimumPrice', value)} min={0} /><NumberField label="Precio máximo" value={filters.maximumPrice} onChange={(value) => set('maximumPrice', value)} min={0} /></div>
    <Select label="País" value={filters.country} values={options.countries} onChange={(value) => set('country', value)} /><Select label="Región" value={filters.region} values={options.regions} onChange={(value) => set('region', value)} /><Select label="Denominación de origen" value={filters.denomination} values={options.denominations} onChange={(value) => set('denomination', value)} /><Select label="Uva" value={filters.grape} values={options.grapes} onChange={(value) => set('grape', value)} /><Select label="Añada" value={filters.vintage} values={options.vintages} onChange={(value) => set('vintage', value)} /><Select label="Supermercado o tienda" value={filters.retailer} values={options.retailers} onChange={(value) => set('retailer', value)} />
    <button onClick={() => onChange({ source: 'all', favorite: false, minimumRating: null, minimumPrice: null, maximumPrice: null, country: '', region: '', denomination: '', grape: '', vintage: '', retailer: '' })} className="w-full rounded-xl border border-white/10 py-2.5 text-sm text-zinc-300 hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400">Limpiar filtros</button>
  </div>;
}

function NumberField({ label, value, onChange, ...props }: { label: string; value: number | null; onChange: (value: number | null) => void; min: number; max?: number; step?: number }) { return <label className="text-xs text-zinc-400">{label}<input {...props} type="number" value={value ?? ''} onChange={(event) => onChange(event.target.value ? Number(event.target.value) : null)} className={`${inputClass} mt-1`} /></label>; }
function Select({ label, value, values, onChange }: { label: string; value: string; values: string[]; onChange: (value: string) => void }) { return <label className="block text-xs text-zinc-400">{label}<select value={value} onChange={(event) => onChange(event.target.value)} className={`${inputClass} mt-1`}><option value="">Todos</option>{values.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>; }

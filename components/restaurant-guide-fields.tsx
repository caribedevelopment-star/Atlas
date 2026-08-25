'use client';

import { Bookmark, CheckCircle2, ChefHat, Clock3, Globe2, Loader2, Phone, Sparkles, Star } from 'lucide-react';
import type { ProfileMemory } from '@/types/profile';
import type { AtlasPlace } from '@/lib/places/repository';
import { useState } from 'react';

const field = 'mt-2 h-12 w-full rounded-2xl border border-white/10 bg-white/[.045] px-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-emerald-200/35 focus:bg-white/[.07] focus:ring-4 focus:ring-emerald-300/5';

export function RestaurantGuideFields({ status, onStatusChange, defaults, place, onSuggestedDescription }: { status: 'visited' | 'wishlist'; onStatusChange: (value: 'visited' | 'wishlist') => void; defaults?: ProfileMemory; place?: AtlasPlace | null; onSuggestedDescription?: (value: string) => void }) {
  const [suggesting, setSuggesting] = useState(false);
  const [suggestionError, setSuggestionError] = useState<string | null>(null);
  const website = defaults?.restaurantWebsite ?? place?.website;
  const phone = defaults?.restaurantPhone ?? place?.phone;
  const openingHours = defaults?.restaurantOpeningHours ?? place?.openingHours;
  const source = defaults?.restaurantSource ?? place?.source;
  const sourceId = defaults?.restaurantSourceId ?? place?.sourceId;

  async function suggestDescription() {
    if (!place || !onSuggestedDescription) return;
    setSuggesting(true); setSuggestionError(null);
    try {
      const response = await fetch('/api/restaurants/describe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ restaurant: place, status }) });
      const body = await response.json();
      if (!response.ok || !body.description) throw new Error(body.error || 'No se pudo crear la nota.');
      onSuggestedDescription(body.description);
    } catch (cause) { setSuggestionError(cause instanceof Error ? cause.message : 'No se pudo crear la nota.'); }
    finally { setSuggesting(false); }
  }

  return <section className="rounded-[1.55rem] border border-emerald-300/[.1] bg-emerald-300/[.035] p-4 sm:p-5">
    <div className="flex items-start gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-300/10 text-emerald-200"><ChefHat className="h-4 w-4" /></span><div className="min-w-0 flex-1"><h2 className="text-sm font-semibold text-white">Ficha de tu guía privada</h2><p className="mt-1 text-[11px] leading-5 text-zinc-500">Lo esencial para decidir si volver, reservar o recomendarlo a tu círculo.</p></div>{place&&onSuggestedDescription&&<button type="button" onClick={()=>void suggestDescription()} disabled={suggesting} className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-200/15 bg-emerald-200/[.08] px-3 py-2 text-[10px] font-medium text-emerald-100 transition hover:bg-emerald-200/[.14] disabled:opacity-50">{suggesting?<Loader2 className="h-3 w-3 animate-spin"/>:<Sparkles className="h-3 w-3"/>}Sugerir nota</button>}</div>
    {(place||defaults)&&<div className="mt-4 rounded-2xl border border-white/[.07] bg-black/15 p-3"><p className="text-[9px] font-semibold uppercase tracking-[.14em] text-emerald-200/70">Datos autocompletados</p><p className="mt-1.5 text-xs font-medium text-white">{place?.name??defaults?.title}</p><p className="mt-1 text-[10px] leading-4 text-zinc-500">{[place?.city??defaults?.city,place?.country??defaults?.country,place?.cuisine??defaults?.restaurantCuisine].filter(Boolean).join(' · ')}</p><div className="mt-3 flex flex-wrap gap-1.5">{openingHours&&<DataChip icon={<Clock3/>}>{openingHours}</DataChip>}{phone&&<DataChip icon={<Phone/>}>{phone}</DataChip>}{website&&<a href={website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-full border border-white/[.07] px-2 py-1 text-[9px] text-zinc-400 hover:text-white"><Globe2 className="h-2.5 w-2.5"/>Web</a>}</div><p className="mt-3 text-[8px] text-zinc-700">{source==='nominatim'?'Datos © OpenStreetMap contributors · Nominatim':'Completa lo que falte; Atlas nunca inventa datos del local.'}</p></div>}
    <input type="hidden" name="restaurantWebsite" value={website??''} readOnly/><input type="hidden" name="restaurantPhone" value={phone??''} readOnly/><input type="hidden" name="restaurantOpeningHours" value={openingHours??''} readOnly/><input type="hidden" name="restaurantSource" value={source??''} readOnly/><input type="hidden" name="restaurantSourceId" value={sourceId??''} readOnly/>
    <div className="mt-4 grid grid-cols-2 gap-2" role="group" aria-label="Estado del restaurante">
      <StatusButton active={status === 'visited'} onClick={() => onStatusChange('visited')} icon={<CheckCircle2 />} label="Visitado" hint="Ya forma parte de tu Atlas" />
      <StatusButton active={status === 'wishlist'} onClick={() => onStatusChange('wishlist')} icon={<Bookmark />} label="Quiero ir" hint="Guardado para más tarde" />
    </div>
    <div className="mt-4 grid gap-4 sm:grid-cols-2">
      <label className="block text-sm font-medium text-zinc-300">Cocina<input name="restaurantCuisine" defaultValue={defaults?.restaurantCuisine??place?.cuisine} maxLength={80} placeholder="Italiana contemporánea" className={field} /></label>
      <label className="block text-sm font-medium text-zinc-300">Ambiente<input name="restaurantVibe" defaultValue={defaults?.restaurantVibe} maxLength={100} placeholder="Íntimo, barra, terraza…" className={field} /></label>
      <label className="block text-sm font-medium text-zinc-300">Nivel de precio<select name="restaurantPriceLevel" defaultValue={defaults?.restaurantPriceLevel ?? ''} className={field}><option value="">Sin indicar</option><option value="1">€ · informal</option><option value="2">€€ · especial sin exceso</option><option value="3">€€€ · ocasión</option><option value="4">€€€€ · experiencia</option></select></label>
      <label className="block text-sm font-medium text-zinc-300">Tu valoración<select name="restaurantRating" defaultValue={defaults?.restaurantRating ?? ''} className={field}><option value="">Pendiente</option>{[5,4.5,4,3.5,3,2.5,2,1.5,1].map((value)=><option key={value} value={value}>{value.toFixed(1)} / 5</option>)}</select></label>
    </div>
    <label className="mt-4 block text-sm font-medium text-zinc-300"><span className="inline-flex items-center gap-1.5"><Star className="h-3.5 w-3.5 text-amber-300" />Qué pedir</span><input name="restaurantMustOrder" defaultValue={defaults?.restaurantMustOrder} maxLength={160} placeholder="El plato que no se puede perdonar" className={field} /></label>
    {suggestionError&&<p role="alert" className="mt-3 text-[10px] text-red-300">{suggestionError}</p>}
  </section>;
}

function DataChip({ icon, children }: { icon: React.ReactElement; children: React.ReactNode }) { return <span className="inline-flex max-w-full items-center gap-1 rounded-full border border-white/[.07] px-2 py-1 text-[9px] text-zinc-500 [&>svg]:h-2.5 [&>svg]:w-2.5">{icon}<span className="truncate">{children}</span></span>; }

function StatusButton({ active, onClick, icon, label, hint }: { active: boolean; onClick: () => void; icon: React.ReactElement; label: string; hint: string }) {
  return <button type="button" onClick={onClick} aria-pressed={active} className={`rounded-2xl border p-3 text-left transition ${active ? 'border-emerald-200/35 bg-emerald-200/[.11] text-white shadow-[0_12px_30px_rgba(16,185,129,.08)]' : 'border-white/[.07] bg-black/10 text-zinc-500 hover:bg-white/[.04]'}`}><span className="flex items-center gap-2 text-xs font-semibold [&>svg]:h-3.5 [&>svg]:w-3.5">{icon}{label}{active&&<Sparkles className="ml-auto text-emerald-200" />}</span><span className="mt-1.5 block text-[9px] leading-4 text-zinc-600">{hint}</span></button>;
}

'use client';

import { Bookmark, CheckCircle2, ChefHat, Sparkles, Star } from 'lucide-react';
import type { ProfileMemory } from '@/types/profile';

const field = 'mt-2 h-12 w-full rounded-2xl border border-white/10 bg-white/[.045] px-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-emerald-200/35 focus:bg-white/[.07] focus:ring-4 focus:ring-emerald-300/5';

export function RestaurantGuideFields({ status, onStatusChange, defaults }: { status: 'visited' | 'wishlist'; onStatusChange: (value: 'visited' | 'wishlist') => void; defaults?: ProfileMemory }) {
  return <section className="rounded-[1.55rem] border border-emerald-300/[.1] bg-emerald-300/[.035] p-4 sm:p-5">
    <div className="flex items-start gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-300/10 text-emerald-200"><ChefHat className="h-4 w-4" /></span><div><h2 className="text-sm font-semibold text-white">Ficha de tu guía privada</h2><p className="mt-1 text-[11px] leading-5 text-zinc-500">Lo esencial para decidir si volver, reservar o recomendarlo a tu círculo.</p></div></div>
    <div className="mt-4 grid grid-cols-2 gap-2" role="group" aria-label="Estado del restaurante">
      <StatusButton active={status === 'visited'} onClick={() => onStatusChange('visited')} icon={<CheckCircle2 />} label="Visitado" hint="Ya forma parte de tu Atlas" />
      <StatusButton active={status === 'wishlist'} onClick={() => onStatusChange('wishlist')} icon={<Bookmark />} label="Quiero ir" hint="Guardado para más tarde" />
    </div>
    <div className="mt-4 grid gap-4 sm:grid-cols-2">
      <label className="block text-sm font-medium text-zinc-300">Cocina<input name="restaurantCuisine" defaultValue={defaults?.restaurantCuisine} maxLength={80} placeholder="Italiana contemporánea" className={field} /></label>
      <label className="block text-sm font-medium text-zinc-300">Ambiente<input name="restaurantVibe" defaultValue={defaults?.restaurantVibe} maxLength={100} placeholder="Íntimo, barra, terraza…" className={field} /></label>
      <label className="block text-sm font-medium text-zinc-300">Nivel de precio<select name="restaurantPriceLevel" defaultValue={defaults?.restaurantPriceLevel ?? ''} className={field}><option value="">Sin indicar</option><option value="1">€ · informal</option><option value="2">€€ · especial sin exceso</option><option value="3">€€€ · ocasión</option><option value="4">€€€€ · experiencia</option></select></label>
      <label className="block text-sm font-medium text-zinc-300">Tu valoración<select name="restaurantRating" defaultValue={defaults?.restaurantRating ?? ''} className={field}><option value="">Pendiente</option>{[5,4.5,4,3.5,3,2.5,2,1.5,1].map((value)=><option key={value} value={value}>{value.toFixed(1)} / 5</option>)}</select></label>
    </div>
    <label className="mt-4 block text-sm font-medium text-zinc-300"><span className="inline-flex items-center gap-1.5"><Star className="h-3.5 w-3.5 text-amber-300" />Qué pedir</span><input name="restaurantMustOrder" defaultValue={defaults?.restaurantMustOrder} maxLength={160} placeholder="El plato que no se puede perdonar" className={field} /></label>
  </section>;
}

function StatusButton({ active, onClick, icon, label, hint }: { active: boolean; onClick: () => void; icon: React.ReactElement; label: string; hint: string }) {
  return <button type="button" onClick={onClick} aria-pressed={active} className={`rounded-2xl border p-3 text-left transition ${active ? 'border-emerald-200/35 bg-emerald-200/[.11] text-white shadow-[0_12px_30px_rgba(16,185,129,.08)]' : 'border-white/[.07] bg-black/10 text-zinc-500 hover:bg-white/[.04]'}`}><span className="flex items-center gap-2 text-xs font-semibold [&>svg]:h-3.5 [&>svg]:w-3.5">{icon}{label}{active&&<Sparkles className="ml-auto text-emerald-200" />}</span><span className="mt-1.5 block text-[9px] leading-4 text-zinc-600">{hint}</span></button>;
}

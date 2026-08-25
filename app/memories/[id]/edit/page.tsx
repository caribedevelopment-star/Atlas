'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Check, Loader2, Lock, Users, UtensilsCrossed } from 'lucide-react';
import { PlaceAutocomplete } from '@/components/place-autocomplete';
import { ParticipantPicker } from '@/components/participant-picker';
import { RestaurantGuideFields } from '@/components/restaurant-guide-fields';
import { getMemory, updateMemory } from '@/lib/memories/repository';
import type { AtlasPlace } from '@/lib/places/repository';
import type { ProfileMemory } from '@/types/profile';
import { useShareableUsers } from '@/hooks/use-shareable-users';

const field = 'mt-2 h-12 w-full rounded-2xl border border-white/10 bg-white/[.045] px-4 text-sm text-white outline-none focus:border-white/30 focus:ring-4 focus:ring-white/5';

export default function EditMemoryPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params?.id ?? '');
  const [memory, setMemory] = useState<ProfileMemory | null>(null);
  const [place, setPlace] = useState<AtlasPlace | null>(null);
  const [location, setLocation] = useState('');
  const [participantIds, setParticipantIds] = useState<string[]>([]);
  const [restaurantStatus, setRestaurantStatus] = useState<'visited' | 'wishlist'>('visited');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const shareable = useShareableUsers();

  useEffect(() => {
    getMemory(id).then((value) => {
      setMemory(value); setLocation(value.place ?? ''); setParticipantIds(value.participantIds); setRestaurantStatus(value.restaurantStatus ?? 'visited');
      if (value.latitude !== undefined && value.longitude !== undefined) setPlace({ id: `memory-${value.id}`, label: value.place ?? value.title, latitude: value.latitude, longitude: value.longitude, city: value.city, country: value.country });
    }).catch((cause) => setError(cause instanceof Error ? cause.message : 'No se pudo cargar.'));
  }, [id]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!memory || !place) return setError('Selecciona una ubicación válida.');
    setSaving(true); setError(null);
    const data = new FormData(event.currentTarget);
    try {
      await updateMemory(id, {
        title: String(data.get('title')), location, date: String(data.get('date')), description: String(data.get('description')), participantIds,
        latitude: place.latitude, longitude: place.longitude, city: place.city, country: place.country,
        isRestaurant: memory.isRestaurant, category: memory.isRestaurant ? 'Restaurante' : memory.category,
        restaurantCuisine: String(data.get('restaurantCuisine') ?? ''), restaurantVibe: String(data.get('restaurantVibe') ?? ''),
        restaurantPriceLevel: optionalNumber(data.get('restaurantPriceLevel')), restaurantRating: optionalNumber(data.get('restaurantRating')),
        restaurantMustOrder: String(data.get('restaurantMustOrder') ?? ''), restaurantStatus,
      });
      router.push(`/memories/${id}`); router.refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'No se pudo guardar.'); }
    finally { setSaving(false); }
  }

  if (!memory) return <main className="min-h-screen bg-zinc-950 p-8 text-zinc-400">{error ?? 'Cargando…'}</main>;
  return <main className="min-h-screen bg-zinc-950 px-4 py-6 text-white"><form onSubmit={submit} className="mx-auto max-w-2xl">
    <Link href={`/memories/${id}`} className="inline-flex items-center gap-2 text-sm text-zinc-400"><ArrowLeft className="h-4 w-4" />Cancelar</Link>
    <div className="mt-8 flex items-center gap-3">{memory.isRestaurant&&<span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300"><UtensilsCrossed className="h-5 w-5"/></span>}<div><h1 className="text-4xl font-semibold tracking-tight">Editar {memory.isRestaurant?'restaurante':'memoria'}</h1><p className="mt-2 text-sm text-zinc-500">Sigue siendo privado salvo para los amigos que elijas aquí.</p></div></div>
    <div className="mt-8 space-y-5 rounded-[2rem] border border-white/10 bg-white/[.03] p-6">
      <label className="block text-sm text-zinc-300">Título<input name="title" required defaultValue={memory.title} className={field} /></label>
      <PlaceAutocomplete label={memory.isRestaurant?'Dirección del restaurante':'Lugar'} required value={location} onChange={(value) => { setLocation(value); setPlace(null); }} onSelect={setPlace} />
      <label className="block text-sm text-zinc-300">Fecha<input name="date" type="date" defaultValue={memory.date?.slice(0, 10)} className={field} /></label>
      {memory.isRestaurant&&<RestaurantGuideFields status={restaurantStatus} onStatusChange={setRestaurantStatus} defaults={memory}/>}
      <label className="block text-sm text-zinc-300">Notas<textarea name="description" defaultValue={memory.description} rows={6} className={`${field} h-auto py-3`} /></label>
      <ParticipantPicker users={shareable.users} selected={participantIds} onChange={setParticipantIds} loading={shareable.loading} error={shareable.error} />
      <PrivacySummary count={participantIds.length} />
      {error && <p className="text-sm text-red-300">{error}</p>}
      <button disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-4 font-semibold text-zinc-950 disabled:opacity-60">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}{saving ? 'Guardando…' : 'Guardar cambios'}</button>
    </div>
  </form></main>;
}

function PrivacySummary({ count }: { count: number }) { return <div className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${count ? 'border-rose-300/15 bg-rose-500/[.055]' : 'border-white/[.07] bg-white/[.025]'}`}><span className={`flex h-9 w-9 items-center justify-center rounded-xl ${count ? 'bg-rose-400/10 text-rose-300' : 'bg-white/5 text-zinc-500'}`}>{count ? <Users className="h-4 w-4" /> : <Lock className="h-4 w-4" />}</span><div><p className="text-xs font-medium text-white">{count ? `Compartido con ${count} ${count === 1 ? 'amigo' : 'amigos'}` : 'Solo tú'}</p><p className="mt-0.5 text-[11px] text-zinc-600">No existe una opción pública para recuerdos.</p></div></div>; }
function optionalNumber(value: FormDataEntryValue | null) { const parsed = Number(value); return value === null || value === '' || !Number.isFinite(parsed) ? undefined : parsed; }

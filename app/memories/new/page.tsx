'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CalendarDays, CarFront, Check, Loader2, Lock, MapPin, Plane, Plus, Route, Ship, Sparkles, TrainFront, Trash2, Users, UtensilsCrossed } from 'lucide-react';
import { createMemory } from '@/lib/memories/repository';
import { saveTrip } from '@/lib/trips/repository';
import { PlaceAutocomplete } from '@/components/place-autocomplete';
import type { AtlasPlace } from '@/lib/places/repository';
import { ParticipantPicker } from '@/components/participant-picker';
import { RestaurantGuideFields } from '@/components/restaurant-guide-fields';
import { useShareableUsers } from '@/hooks/use-shareable-users';
import { transportMeta } from '@/lib/trips/transport';
import type { TransportMode } from '@/types/trip';

type Mode = 'memory' | 'restaurant' | 'trip';
type Stop = { key: string; title: string; city: string; country: string; latitude: string; longitude: string };
const today = new Date().toISOString().slice(0, 10);
const field = 'mt-2 h-12 w-full rounded-2xl border border-white/10 bg-white/[.045] px-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-white/30 focus:bg-white/[.07] focus:ring-4 focus:ring-white/5';

export default function NewMemoryPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('memory');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stops, setStops] = useState<Stop[]>([blankStop('stop-1'), blankStop('stop-2')]);
  const [memoryLocation, setMemoryLocation] = useState('');
  const [memoryPlace, setMemoryPlace] = useState<AtlasPlace | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [participantIds, setParticipantIds] = useState<string[]>([]);
  const [transportMode, setTransportMode] = useState<TransportMode>('car');
  const [restaurantStatus, setRestaurantStatus] = useState<'visited' | 'wishlist'>('visited');
  const [restaurantSeed, setRestaurantSeed] = useState<{ chef?: string; cuisine?: string; website?: string }>({});
  const shareable = useShareableUsers();
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const type = params.get('type');
    if (type === 'restaurant' || type === 'trip') setMode(type);
    if (type !== 'restaurant' || !params.get('name')) return;
    const latitude = Number(params.get('lat')); const longitude = Number(params.get('lng'));
    const name = params.get('name') ?? ''; const location = params.get('location') ?? name;
    setTitle(name); setMemoryLocation(location); setDescription(params.get('description') ?? ''); setRestaurantStatus('wishlist');
    setRestaurantSeed({ chef: params.get('chef') ?? undefined, cuisine: params.get('cuisine') ?? undefined, website: params.get('website') ?? undefined });
    if (Number.isFinite(latitude) && Number.isFinite(longitude)) setMemoryPlace({ id: `editorial-${name}`, name, label: location, latitude, longitude, city: params.get('city') ?? undefined, country: params.get('country') ?? undefined, cuisine: params.get('cuisine') ?? undefined, website: params.get('website') ?? undefined });
  }, []);
  const validStops = useMemo(() => stops.filter((stop) => stop.title.trim() && validCoordinate(stop.latitude, stop.longitude)), [stops]);
  const visibility = participantIds.length ? 'friends' as const : 'private' as const;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setError(null); const data = new FormData(event.currentTarget);
    try {
      if (mode !== 'trip') {
        if (!memoryPlace) throw new Error('Selecciona una ubicación de la lista para mostrar la memoria en el mapa.');
        await createMemory({ title, location: memoryLocation, date: String(data.get('date')), description, participantIds, latitude: memoryPlace.latitude, longitude: memoryPlace.longitude, city: memoryPlace.city, country: memoryPlace.country, isRestaurant: mode === 'restaurant', category: mode === 'restaurant' ? 'Restaurante' : 'Memoria', restaurantCuisine: String(data.get('restaurantCuisine') ?? ''), restaurantChef: String(data.get('restaurantChef') ?? ''), restaurantVibe: String(data.get('restaurantVibe') ?? ''), restaurantPriceLevel: optionalNumber(data.get('restaurantPriceLevel')), restaurantRating: optionalNumber(data.get('restaurantRating')), restaurantMustOrder: String(data.get('restaurantMustOrder') ?? ''), restaurantStatus, restaurantWebsite: String(data.get('restaurantWebsite') ?? ''), restaurantPhone: String(data.get('restaurantPhone') ?? ''), restaurantOpeningHours: String(data.get('restaurantOpeningHours') ?? ''), restaurantSource: String(data.get('restaurantSource') ?? ''), restaurantSourceId: String(data.get('restaurantSourceId') ?? '') });
      } else {
        if (validStops.length < 2) throw new Error('Añade al menos dos paradas con coordenadas válidas.');
        if (new Set(validStops.map((stop) => `${stop.latitude},${stop.longitude}`)).size !== validStops.length) throw new Error('Hay paradas duplicadas. Revisa sus coordenadas.');
        const startDate = String(data.get('startDate')); const endDate = String(data.get('endDate'));
        if (endDate < startDate) throw new Error('La fecha final no puede ser anterior al inicio.');
        await saveTrip({ title: String(data.get('title')), description: String(data.get('description')), coverImageUrl: '', galleryUrl: normalizeGalleryUrl(String(data.get('galleryUrl'))), startDate, endDate, transportMode, visibility, stops: validStops.map((stop) => ({ title: stop.title.trim(), city: stop.city.trim() || undefined, country: stop.country.trim() || undefined, latitude: Number(stop.latitude), longitude: Number(stop.longitude) })), participantIds, wineIds: [], photos: [] });
      }
      router.push(mode === 'restaurant' ? '/restaurants' : '/home'); router.refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'No se pudo guardar.'); } finally { setSaving(false); }
  }

  return <main className="min-h-[calc(100dvh-4rem)] bg-zinc-950 px-4 py-5 text-zinc-100 sm:px-6 sm:py-10"><div className="mx-auto max-w-3xl">
    <div className="flex items-center justify-between"><Link href="/home" className="inline-flex h-10 items-center gap-2 rounded-full px-3 text-sm text-zinc-400 transition hover:bg-white/5 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white"><ArrowLeft className="h-4 w-4" />Volver</Link><span className="flex items-center gap-1.5 text-xs text-zinc-600"><Sparkles className="h-3.5 w-3.5" />Guardado en Atlas</span></div>
    <header className="mt-7"><p className="text-xs font-semibold uppercase tracking-[.22em] text-rose-300">Nuevo en tu archivo</p><h1 className="mt-3 text-4xl font-semibold tracking-[-.045em] text-white sm:text-5xl">Guarda lo que importa.</h1><p className="mt-3 max-w-xl text-sm leading-6 text-zinc-400">Tus recuerdos son privados por defecto. Si eliges amigos, solo esas personas podrán ver ese momento.</p></header>
    <div className="mt-8 grid grid-cols-3 rounded-2xl border border-white/10 bg-white/[.035] p-1.5" role="tablist" aria-label="Tipo de elemento"><ModeButton active={mode === 'memory'} onClick={() => setMode('memory')} icon={<MapPin />} label="Memoria" /><ModeButton active={mode === 'restaurant'} onClick={() => setMode('restaurant')} icon={<UtensilsCrossed />} label="Restaurante" /><ModeButton active={mode === 'trip'} onClick={() => setMode('trip')} icon={<Route />} label="Viaje" /></div>
    <form onSubmit={submit} className="mt-5 space-y-5 rounded-[2rem] border border-white/10 bg-[linear-gradient(145deg,rgba(39,39,42,.75),rgba(9,9,11,.9))] p-5 shadow-2xl shadow-black/30 sm:p-8">
      <label className="block text-sm font-medium text-zinc-300">Título<input name="title" required maxLength={160} autoFocus value={title} onChange={(event)=>setTitle(event.target.value)} placeholder={mode === 'restaurant' ? 'Nombre del restaurante' : mode === 'memory' ? 'Cena bajo las estrellas' : 'Costa norte, verano'} className={field} /></label>
      {mode !== 'trip' ? <><div className="grid gap-4 sm:grid-cols-2"><PlaceAutocomplete label={mode === 'restaurant' ? 'Busca el restaurante' : 'Lugar'} required kind={mode === 'restaurant' ? 'restaurant' : undefined} value={memoryLocation} onChange={(value) => { setMemoryLocation(value); setMemoryPlace(null); }} onSelect={(value)=>{setMemoryPlace(value);if(mode==='restaurant'&&value.name)setTitle(value.name)}} placeholder={mode === 'restaurant' ? 'Nombre + ciudad' : 'Escribe una ciudad o calle'} /><Field label="Fecha" name="date" type="date" defaultValue={today} icon={<CalendarDays />} /></div>{mode === 'restaurant' && <RestaurantGuideFields key={memoryPlace?.id??'empty'} status={restaurantStatus} onStatusChange={setRestaurantStatus} place={memoryPlace} initial={restaurantSeed} onSuggestedDescription={setDescription} />}</> : <><div className="grid gap-4 sm:grid-cols-2"><Field label="Inicio" name="startDate" type="date" defaultValue={today} required icon={<CalendarDays />} /><Field label="Fin" name="endDate" type="date" defaultValue={today} required icon={<CalendarDays />} /></div><TransportPicker value={transportMode} onChange={setTransportMode} /><Stops stops={stops} setStops={setStops} /></>}
      <label className="block text-sm font-medium text-zinc-300">Notas<textarea name="description" rows={4} maxLength={2000} value={description} onChange={(event)=>setDescription(event.target.value)} placeholder={mode === 'restaurant' ? 'Tu impresión en una o dos frases' : '¿Qué quieres recordar?'} className={`${field} h-auto resize-none py-3 leading-6`} /></label>
      {mode === 'trip' && <label className="block text-sm font-medium text-zinc-300">Galería del viaje <span className="font-normal text-zinc-600">(opcional)</span><input name="galleryUrl" type="url" inputMode="url" placeholder="https://drive.google.com/..." className={field} /><span className="mt-2 block text-xs font-normal text-zinc-600">Pega un enlace compartido de Google Drive, Google Photos, iCloud o tu galería preferida.</span></label>}
      <ParticipantPicker users={shareable.users} selected={participantIds} onChange={setParticipantIds} loading={shareable.loading} error={shareable.error} />
      <PrivacySummary count={participantIds.length} />
      {error && <p role="alert" className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>}
      <button disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-4 text-sm font-semibold text-zinc-950 shadow-xl transition hover:bg-zinc-200 active:scale-[.99] disabled:opacity-60">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}{saving ? 'Guardando…' : mode === 'memory' ? 'Guardar memoria' : mode === 'restaurant' ? 'Guardar restaurante' : 'Guardar viaje'}</button>
    </form>
  </div></main>;
}

function PrivacySummary({ count }: { count: number }) { return <div className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${count ? 'border-rose-300/15 bg-rose-500/[.055]' : 'border-white/[.07] bg-white/[.025]'}`}><span className={`flex h-9 w-9 items-center justify-center rounded-xl ${count ? 'bg-rose-400/10 text-rose-300' : 'bg-white/5 text-zinc-500'}`}>{count ? <Users className="h-4 w-4" /> : <Lock className="h-4 w-4" />}</span><div><p className="text-xs font-medium text-white">{count ? `Compartido con ${count} ${count === 1 ? 'amigo' : 'amigos'}` : 'Solo tú'}</p><p className="mt-0.5 text-[11px] text-zinc-600">{count ? 'Ningún otro usuario de Atlas podrá verlo.' : 'No aparecerá para nadie más.'}</p></div></div>; }
function ModeButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactElement; label: string }) { return <button type="button" role="tab" aria-selected={active} onClick={onClick} className={`flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-medium transition ${active ? 'bg-white text-zinc-950 shadow-lg' : 'text-zinc-500 hover:text-white'}`}><span className="[&>svg]:h-4 [&>svg]:w-4">{icon}</span>{label}</button>; }
function Field({ label, icon, ...props }: { label: string; icon: React.ReactElement } & React.InputHTMLAttributes<HTMLInputElement>) { return <label className="block text-sm font-medium text-zinc-300">{label}<span className="relative block"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 [&>svg]:h-4 [&>svg]:w-4">{icon}</span><input {...props} className={`${field} pl-11`} /></span></label>; }
function Stops({ stops, setStops }: { stops: Stop[]; setStops: React.Dispatch<React.SetStateAction<Stop[]>> }) { const update = (key: string, values: Partial<Stop>) => setStops((current) => current.map((stop) => stop.key === key ? { ...stop, ...values } : stop)); return <fieldset><div className="flex items-center justify-between"><legend className="text-sm font-medium text-zinc-300">Paradas ordenadas</legend><button type="button" onClick={() => setStops((current) => [...current, blankStop()])} className="flex items-center gap-1 text-xs text-rose-300"><Plus className="h-3.5 w-3.5" />Parada</button></div><p className="mt-1 text-xs text-zinc-600">Busca cada lugar; Atlas completará automáticamente ciudad, país y coordenadas.</p><div className="mt-3 space-y-3">{stops.map((stop, index) => <div key={stop.key} className="relative rounded-2xl border border-white/10 bg-black/15 p-3"><div className="flex items-start gap-3"><span className="mt-7 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs text-zinc-300">{index + 1}</span><div className="min-w-0 flex-1"><PlaceAutocomplete label={`Parada ${index + 1}`} required value={stop.title} onChange={(title) => update(stop.key, { title, latitude: '', longitude: '' })} onSelect={(place) => update(stop.key, { title: place.label, city: place.city ?? '', country: place.country ?? '', latitude: String(place.latitude), longitude: String(place.longitude) })} />{stop.latitude && <p className="mt-2 text-[11px] text-emerald-400/70">Ubicación confirmada{stop.city ? ` · ${stop.city}` : ''}{stop.country ? `, ${stop.country}` : ''}</p>}</div>{stops.length > 2 && <button type="button" onClick={() => setStops((current) => current.filter((item) => item.key !== stop.key))} aria-label={`Eliminar parada ${index + 1}`} className="mt-7 rounded-full p-2 text-zinc-600 hover:bg-white/5 hover:text-red-300"><Trash2 className="h-4 w-4" /></button>}</div></div>)}</div></fieldset>; }
function blankStop(key = crypto.randomUUID()): Stop { return { key, title: '', city: '', country: '', latitude: '', longitude: '' }; }
function validCoordinate(latitude: string, longitude: string) { const lat = Number(latitude), lng = Number(longitude); return latitude.trim() !== '' && longitude.trim() !== '' && Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180; }
function normalizeGalleryUrl(value: string) { if (!value.trim()) return undefined; const url = new URL(value.trim()); if (url.protocol !== 'https:') throw new Error('El enlace de la galería debe comenzar por https://'); return url.toString(); }
function optionalNumber(value: FormDataEntryValue | null) { const parsed = Number(value); return value === null || value === '' || !Number.isFinite(parsed) ? undefined : parsed; }

const transportIcons = { car: CarFront, train: TrainFront, boat: Ship, plane: Plane } satisfies Record<TransportMode, typeof CarFront>;
function TransportPicker({ value, onChange }: { value: TransportMode; onChange: (value: TransportMode) => void }) {
  return <fieldset><legend className="text-sm font-medium text-zinc-300">Medio de transporte</legend><p className="mt-1 text-xs text-zinc-600">Define la forma, el color y el movimiento de la ruta en el mapa.</p><div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">{(['car', 'train', 'boat', 'plane'] as TransportMode[]).map((mode) => { const Icon = transportIcons[mode]; const active = value === mode; return <button key={mode} type="button" onClick={() => onChange(mode)} aria-pressed={active} className={`rounded-2xl border p-3 text-left transition ${active ? 'border-white/25 bg-white/[.1] shadow-lg' : 'border-white/[.07] bg-white/[.025] hover:bg-white/[.05]'}`}><span className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ color: transportMeta[mode].color, backgroundColor: `${transportMeta[mode].color}18` }}><Icon className="h-4 w-4" /></span><span className="mt-2 block text-xs font-medium text-white">{transportMeta[mode].shortLabel}</span><span className="mt-1 block text-[10px] leading-4 text-zinc-600">{transportMeta[mode].description}</span></button>; })}</div></fieldset>;
}

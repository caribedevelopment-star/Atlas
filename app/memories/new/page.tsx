'use client';

import Link from 'next/link';
import { FormEvent, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CalendarDays, Check, Globe2, Loader2, Lock, MapPin, Plus, Route, Sparkles, Trash2, Users } from 'lucide-react';
import { createMemory } from '@/lib/memories/repository';
import { saveTrip } from '@/lib/trips/repository';
import type { WineVisibility } from '@/types/wine';
import { PlaceAutocomplete } from '@/components/place-autocomplete';
import type { AtlasPlace } from '@/lib/places/repository';
import { ParticipantPicker } from '@/components/participant-picker';
import { useShareableUsers } from '@/hooks/use-shareable-users';

type Mode = 'memory' | 'trip';
type Stop = { key: string; title: string; city: string; country: string; latitude: string; longitude: string };
const today = new Date().toISOString().slice(0, 10);
const field = 'mt-2 h-12 w-full rounded-2xl border border-white/10 bg-white/[.045] px-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-white/30 focus:bg-white/[.07] focus:ring-4 focus:ring-white/5';

export default function NewMemoryPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('memory');
  const [visibility, setVisibility] = useState<WineVisibility>('private');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stops, setStops] = useState<Stop[]>([blankStop('stop-1'), blankStop('stop-2')]);
  const [memoryLocation,setMemoryLocation]=useState(''); const [memoryPlace,setMemoryPlace]=useState<AtlasPlace|null>(null);
  const [participantIds,setParticipantIds]=useState<string[]>([]); const shareable=useShareableUsers();
  const validStops = useMemo(() => stops.filter((stop) => stop.title.trim() && validCoordinate(stop.latitude, stop.longitude)), [stops]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setError(null); const data = new FormData(event.currentTarget);
    try {
      if (mode === 'memory') {
        if (!memoryPlace) throw new Error('Selecciona una ubicación de la lista para mostrar la memoria en el mapa.');
        await createMemory({ title: String(data.get('title')), location: memoryLocation, date: String(data.get('date')), description: String(data.get('description')), visibility, participantIds, latitude:memoryPlace?.latitude, longitude:memoryPlace?.longitude, city:memoryPlace?.city, country:memoryPlace?.country });
      } else {
        if (validStops.length < 2) throw new Error('Añade al menos dos paradas con coordenadas válidas.');
        if (new Set(validStops.map((stop) => `${stop.latitude},${stop.longitude}`)).size !== validStops.length) throw new Error('Hay paradas duplicadas. Revisa sus coordenadas.');
        const startDate = String(data.get('startDate')); const endDate = String(data.get('endDate'));
        if (endDate < startDate) throw new Error('La fecha final no puede ser anterior al inicio.');
        await saveTrip({ title: String(data.get('title')), description: String(data.get('description')), coverImageUrl: '', galleryUrl: normalizeGalleryUrl(String(data.get('galleryUrl'))), startDate, endDate, visibility, stops: validStops.map((stop) => ({ title: stop.title.trim(), city: stop.city.trim() || undefined, country: stop.country.trim() || undefined, latitude: Number(stop.latitude), longitude: Number(stop.longitude) })), participantIds, wineIds: [], photos: [] });
      }
      router.push('/home'); router.refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'No se pudo guardar.'); } finally { setSaving(false); }
  }

  return <main className="min-h-[calc(100dvh-4rem)] bg-zinc-950 px-4 py-5 text-zinc-100 sm:px-6 sm:py-10"><div className="mx-auto max-w-3xl">
    <div className="flex items-center justify-between"><Link href="/home" className="inline-flex h-10 items-center gap-2 rounded-full px-3 text-sm text-zinc-400 transition hover:bg-white/5 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white"><ArrowLeft className="h-4 w-4"/>Volver</Link><span className="flex items-center gap-1.5 text-xs text-zinc-600"><Sparkles className="h-3.5 w-3.5"/>Guardado en Atlas</span></div>
    <header className="mt-7"><p className="text-xs font-semibold uppercase tracking-[.22em] text-rose-300">Nuevo en tu archivo</p><h1 className="mt-3 text-4xl font-semibold tracking-[-.045em] text-white sm:text-5xl">Guarda lo que importa.</h1><p className="mt-3 max-w-xl text-sm leading-6 text-zinc-400">Una memoria para un momento. Un viaje para conectar paradas reales en el mapa.</p></header>
    <div className="mt-8 grid grid-cols-2 rounded-2xl border border-white/10 bg-white/[.035] p-1.5" role="tablist" aria-label="Tipo de elemento"><ModeButton active={mode === 'memory'} onClick={() => setMode('memory')} icon={<MapPin/>} label="Memoria"/><ModeButton active={mode === 'trip'} onClick={() => setMode('trip')} icon={<Route/>} label="Viaje"/></div>
    <form onSubmit={submit} className="mt-5 space-y-5 rounded-[2rem] border border-white/10 bg-[linear-gradient(145deg,rgba(39,39,42,.75),rgba(9,9,11,.9))] p-5 shadow-2xl shadow-black/30 sm:p-8">
      <label className="block text-sm font-medium text-zinc-300">Título<input name="title" required maxLength={160} autoFocus placeholder={mode === 'memory' ? 'Cena bajo las estrellas' : 'Costa norte, verano'} className={field}/></label>
      {mode === 'memory' ? <div className="grid gap-4 sm:grid-cols-2"><PlaceAutocomplete label="Lugar" required value={memoryLocation} onChange={(value)=>{setMemoryLocation(value);setMemoryPlace(null)}} onSelect={setMemoryPlace} placeholder="Escribe una ciudad o calle"/><Field label="Fecha" name="date" type="date" defaultValue={today} icon={<CalendarDays/>}/></div> : <><div className="grid gap-4 sm:grid-cols-2"><Field label="Inicio" name="startDate" type="date" defaultValue={today} required icon={<CalendarDays/>}/><Field label="Fin" name="endDate" type="date" defaultValue={today} required icon={<CalendarDays/>}/></div><Stops stops={stops} setStops={setStops}/></>}
      <label className="block text-sm font-medium text-zinc-300">Notas<textarea name="description" rows={4} maxLength={2000} placeholder="¿Qué quieres recordar?" className={`${field} h-auto resize-none py-3 leading-6`}/></label>
      {mode === 'trip' && <label className="block text-sm font-medium text-zinc-300">Galería del viaje <span className="font-normal text-zinc-600">(opcional)</span><input name="galleryUrl" type="url" inputMode="url" placeholder="https://drive.google.com/..." className={field}/><span className="mt-2 block text-xs font-normal text-zinc-600">Pega un enlace compartido de Google Drive, Google Photos, iCloud o tu galería preferida.</span></label>}
      <ParticipantPicker users={shareable.users} selected={participantIds} onChange={setParticipantIds} loading={shareable.loading} error={shareable.error}/>
      <Visibility value={visibility} onChange={setVisibility}/>
      {error && <p role="alert" className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>}
      <button disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-4 text-sm font-semibold text-zinc-950 shadow-xl transition hover:bg-zinc-200 active:scale-[.99] disabled:opacity-60">{saving ? <Loader2 className="h-4 w-4 animate-spin"/> : <Check className="h-4 w-4"/>}{saving ? 'Guardando…' : mode === 'memory' ? 'Guardar memoria' : 'Guardar viaje'}</button>
    </form>
  </div></main>;
}

function ModeButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactElement; label: string }) { return <button type="button" role="tab" aria-selected={active} onClick={onClick} className={`flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-medium transition ${active ? 'bg-white text-zinc-950 shadow-lg' : 'text-zinc-500 hover:text-white'}`}><span className="[&>svg]:h-4 [&>svg]:w-4">{icon}</span>{label}</button>; }
function Field({ label, icon, ...props }: { label: string; icon: React.ReactElement } & React.InputHTMLAttributes<HTMLInputElement>) { return <label className="block text-sm font-medium text-zinc-300">{label}<span className="relative block"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 [&>svg]:h-4 [&>svg]:w-4">{icon}</span><input {...props} className={`${field} pl-11`}/></span></label>; }
function Visibility({ value, onChange }: { value: WineVisibility; onChange: (value: WineVisibility) => void }) { const values = [['private','Solo yo',Lock],['friends','Círculo',Users],['public','Público',Globe2]] as const; return <fieldset><legend className="text-sm font-medium text-zinc-300">Visibilidad</legend><div className="mt-2 grid grid-cols-3 gap-2">{values.map(([key,label,Icon]) => <button key={key} type="button" onClick={() => onChange(key)} aria-pressed={value === key} className={`flex min-h-12 items-center justify-center gap-1.5 rounded-2xl border px-2 text-xs transition ${value === key ? 'border-white/30 bg-white text-zinc-950' : 'border-white/10 text-zinc-500 hover:bg-white/5 hover:text-white'}`}><Icon className="h-3.5 w-3.5"/>{label}</button>)}</div></fieldset>; }
function Stops({ stops, setStops }: { stops: Stop[]; setStops: React.Dispatch<React.SetStateAction<Stop[]>> }) { const update = (key: string, values: Partial<Stop>) => setStops((current) => current.map((stop) => stop.key === key ? { ...stop, ...values } : stop)); return <fieldset><div className="flex items-center justify-between"><legend className="text-sm font-medium text-zinc-300">Paradas ordenadas</legend><button type="button" onClick={() => setStops((current) => [...current, blankStop()])} className="flex items-center gap-1 text-xs text-rose-300"><Plus className="h-3.5 w-3.5"/>Parada</button></div><p className="mt-1 text-xs text-zinc-600">Busca cada lugar; Atlas completará automáticamente ciudad, país y coordenadas.</p><div className="mt-3 space-y-3">{stops.map((stop,index) => <div key={stop.key} className="relative rounded-2xl border border-white/10 bg-black/15 p-3"><div className="flex items-start gap-3"><span className="mt-7 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs text-zinc-300">{index + 1}</span><div className="min-w-0 flex-1"><PlaceAutocomplete label={`Parada ${index+1}`} required value={stop.title} onChange={(title)=>update(stop.key,{title,latitude:'',longitude:''})} onSelect={(place)=>update(stop.key,{title:place.label,city:place.city??'',country:place.country??'',latitude:String(place.latitude),longitude:String(place.longitude)})}/>{stop.latitude&&<p className="mt-2 text-[11px] text-emerald-400/70">Ubicación confirmada{stop.city?` · ${stop.city}`:''}{stop.country?`, ${stop.country}`:''}</p>}</div>{stops.length > 2 && <button type="button" onClick={() => setStops((current) => current.filter((item) => item.key !== stop.key))} aria-label={`Eliminar parada ${index + 1}`} className="mt-7 rounded-full p-2 text-zinc-600 hover:bg-white/5 hover:text-red-300"><Trash2 className="h-4 w-4"/></button>}</div></div>)}</div></fieldset>; }
function blankStop(key = crypto.randomUUID()): Stop { return { key, title:'', city:'', country:'', latitude:'', longitude:'' }; }
function validCoordinate(latitude:string,longitude:string) { const lat=Number(latitude),lng=Number(longitude); return latitude.trim() !== '' && longitude.trim() !== '' && Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180; }
function normalizeGalleryUrl(value:string) { if(!value.trim()) return undefined; const url=new URL(value.trim()); if(url.protocol!=='https:') throw new Error('El enlace de la galería debe comenzar por https://'); return url.toString(); }

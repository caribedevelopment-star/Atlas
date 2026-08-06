'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Check, Loader2 } from 'lucide-react';
import { PlaceAutocomplete } from '@/components/place-autocomplete';
import { getMemory, updateMemory } from '@/lib/memories/repository';
import type { AtlasPlace } from '@/lib/places/repository';
import type { ProfileMemory } from '@/types/profile';
import type { WineVisibility } from '@/types/wine';

const field='mt-2 h-12 w-full rounded-2xl border border-white/10 bg-white/[.045] px-4 text-sm text-white outline-none focus:border-white/30 focus:ring-4 focus:ring-white/5';
export default function EditMemoryPage(){
  const params=useParams(),router=useRouter(),id=String(params?.id??'');
  const [memory,setMemory]=useState<ProfileMemory|null>(null),[place,setPlace]=useState<AtlasPlace|null>(null),[location,setLocation]=useState(''),[visibility,setVisibility]=useState<WineVisibility>('private'),[saving,setSaving]=useState(false),[error,setError]=useState<string|null>(null);
  useEffect(()=>{getMemory(id).then((value)=>{setMemory(value);setLocation(value.place??'');setVisibility(value.visibility);if(value.latitude!==undefined&&value.longitude!==undefined)setPlace({id:`memory-${value.id}`,label:value.place??value.title,latitude:value.latitude,longitude:value.longitude,city:value.city,country:value.country});}).catch((cause)=>setError(cause instanceof Error?cause.message:'No se pudo cargar.'));},[id]);
  async function submit(event:FormEvent<HTMLFormElement>){event.preventDefault();if(!memory||!place)return setError('Selecciona una ubicación válida.');setSaving(true);setError(null);const data=new FormData(event.currentTarget);try{await updateMemory(id,{title:String(data.get('title')),location,date:String(data.get('date')),description:String(data.get('description')),visibility,participantIds:memory.participantIds,latitude:place.latitude,longitude:place.longitude,city:place.city,country:place.country});router.push(`/memories/${id}`);router.refresh();}catch(cause){setError(cause instanceof Error?cause.message:'No se pudo guardar.');}finally{setSaving(false);}}
  if(!memory)return <main className="min-h-screen bg-zinc-950 p-8 text-zinc-400">{error??'Cargando…'}</main>;
  return <main className="min-h-screen bg-zinc-950 px-4 py-6 text-white"><form onSubmit={submit} className="mx-auto max-w-2xl"><Link href={`/memories/${id}`} className="inline-flex items-center gap-2 text-sm text-zinc-400"><ArrowLeft className="h-4 w-4"/>Cancelar</Link><h1 className="mt-8 text-4xl font-semibold tracking-tight">Editar memoria</h1><div className="mt-8 space-y-5 rounded-[2rem] border border-white/10 bg-white/[.03] p-6"><label className="block text-sm text-zinc-300">Título<input name="title" required defaultValue={memory.title} className={field}/></label><PlaceAutocomplete label="Lugar" required value={location} onChange={(value)=>{setLocation(value);setPlace(null);}} onSelect={setPlace}/><label className="block text-sm text-zinc-300">Fecha<input name="date" type="date" defaultValue={memory.date?.slice(0,10)} className={field}/></label><label className="block text-sm text-zinc-300">Notas<textarea name="description" defaultValue={memory.description} rows={6} className={`${field} h-auto py-3`}/></label><label className="block text-sm text-zinc-300">Visibilidad<select value={visibility} onChange={(event)=>setVisibility(event.target.value as WineVisibility)} className={field}><option value="private">Solo yo</option><option value="friends">Mi círculo</option><option value="public">Atlas</option></select></label>{error&&<p className="text-sm text-red-300">{error}</p>}<button disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-4 font-semibold text-zinc-950 disabled:opacity-60">{saving?<Loader2 className="h-4 w-4 animate-spin"/>:<Check className="h-4 w-4"/>}{saving?'Guardando…':'Guardar cambios'}</button></div></form></main>;
}

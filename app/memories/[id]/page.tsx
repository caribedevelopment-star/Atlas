'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, CalendarDays, Edit3, MapPin, Shield } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { getMemory } from '@/lib/memories/repository';
import type { ProfileMemory } from '@/types/profile';

export default function MemoryDetailPage() {
  const params = useParams();
  const id = String(params?.id ?? '');
  const [memory, setMemory] = useState<ProfileMemory | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { getMemory(id).then(setMemory).catch((cause) => setError(cause instanceof Error ? cause.message : 'No se pudo cargar la memoria.')); }, [id]);
  return <AppShell><main className="min-h-[calc(100dvh-4rem)] bg-zinc-950 px-4 py-6 text-white sm:px-8"><div className="mx-auto max-w-3xl">
    <div className="flex items-center justify-between"><Link href="/memories" className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm text-zinc-400 hover:bg-white/5 hover:text-white"><ArrowLeft className="h-4 w-4"/>Archivo</Link>{memory && <Link href={`/memories/${id}/edit`} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-zinc-950"><Edit3 className="h-4 w-4"/>Editar</Link>}</div>
    {error && <p role="alert" className="mt-8 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-200">{error}</p>}
    {!memory && !error && <div className="mt-8 h-72 animate-pulse rounded-[2rem] bg-white/5"/>}
    {memory && <article className="mt-8 overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-zinc-900 to-zinc-950 shadow-2xl"><div className="p-6 sm:p-10"><p className="text-xs font-semibold uppercase tracking-[.2em] text-rose-300">Memoria</p><h1 className="mt-3 text-4xl font-semibold tracking-[-.04em]">{memory.title}</h1><div className="mt-5 flex flex-wrap gap-2 text-sm text-zinc-400">{memory.place && <Meta icon={<MapPin/>}>{memory.place}</Meta>}{memory.date && <Meta icon={<CalendarDays/>}>{new Date(memory.date).toLocaleDateString('es',{dateStyle:'long'})}</Meta>}<Meta icon={<Shield/>}>{memory.visibility === 'private' ? 'Solo tú' : memory.visibility === 'friends' ? 'Tu círculo' : 'Atlas'}</Meta></div>{memory.description ? <p className="mt-8 whitespace-pre-wrap text-lg leading-8 text-zinc-300">{memory.description}</p> : <p className="mt-8 text-zinc-600">Todavía no has añadido notas.</p>}</div></article>}
  </div></main></AppShell>;
}

function Meta({icon,children}:{icon:React.ReactElement;children:React.ReactNode}) { return <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 [&>svg]:h-4 [&>svg]:w-4">{icon}{children}</span>; }

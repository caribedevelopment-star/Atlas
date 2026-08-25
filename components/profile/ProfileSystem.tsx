'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { AlertCircle, Loader2, MapPin, Route, Sparkles, Store, Wine, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useProfile } from '@/hooks/use-profile';
import { useProfileNetwork } from '@/hooks/use-profile-network';
import type { ProfileUpdate } from '@/types/profile';
import { FavoriteWines } from './FavoriteWines';
import { ProfileHeader } from './ProfileHeader';
import { ProfileAtlasBridge } from './ProfileAtlasBridge';
import { ProfileSkeleton } from './ProfileSkeleton';
import { ProfileTimeline } from './ProfileTimeline';
import type { ProfileStatistics } from '@/types/profile';

export function ProfileSystem({ profileId }: { profileId?: string }) {
  const profile = useProfile(profileId);
  const network = useProfileNetwork(profile.data?.viewerId, Boolean(profile.data?.viewerId));
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  if (profile.loading) return <ProfileSkeleton />;
  if (!profile.data) return <main className="mx-auto flex min-h-[70vh] max-w-lg items-center px-4"><div className="w-full rounded-3xl border border-red-500/20 bg-red-500/5 p-8 text-center" role="alert"><AlertCircle className="mx-auto h-8 w-8 text-red-400" /><h1 className="mt-3 text-xl font-semibold text-white">{message(profile.error)}</h1><button onClick={() => void profile.retry()} className="mt-5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-zinc-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400">Reintentar</button></div></main>;
  const data = profile.data;
  const relationship = network.users.find((user) => user.id === data.profile.id);

  return <main className="relative min-h-screen overflow-hidden bg-zinc-950 pb-28 text-zinc-100">
    <div className="pointer-events-none absolute inset-x-0 top-0 h-[440px] bg-[radial-gradient(circle_at_18%_0%,rgba(56,189,248,.08),transparent_34%),radial-gradient(circle_at_82%_8%,rgba(244,63,94,.06),transparent_30%)]" />
    <div className="atlas-profile-enter relative mx-auto max-w-5xl space-y-5 px-4 py-5 sm:px-6 sm:py-8">
      <ProfileHeader profile={data.profile} access={data.access} relationship={relationship} relationshipSaving={network.savingId === data.profile.id} onSendRequest={() => void network.sendRequest(data.profile.id)} onAcceptRequest={() => { if (relationship) void network.acceptRequest(relationship); }} onEdit={() => setEditing(true)} onSignOut={() => void profile.signOut().then(() => router.push('/login'))} />
      <ProfilePulse stats={data.statistics}/>
      <ProfileAtlasBridge data={data} />
      {data.favoriteWines.length>0&&<FavoriteWines wines={data.favoriteWines} />}
      <ProfileTimeline items={data.timeline} />
      <div className="flex items-center justify-center gap-2 py-3 text-[10px] uppercase tracking-[.18em] text-zinc-800"><Sparkles className="h-3 w-3" />{data.access === 'owner' ? 'Tu Atlas sigue creciendo' : `Atlas visible de ${data.profile.fullName || data.profile.username}`}</div>
    </div>
    {editing && <EditProfile initial={{ full_name: data.profile.fullName, username: data.profile.username, bio: data.profile.biography ?? '', city: data.profile.city ?? '', country: data.profile.country ?? '', privacy: data.profile.privacy }} saving={profile.saving} error={profile.error} onClose={() => setEditing(false)} onSave={async (value) => { await profile.save(value); setEditing(false); }} />}
  </main>;
}

function ProfilePulse({stats}:{stats:ProfileStatistics}){const items=[{label:'Memorias',value:stats.memories,icon:MapPin,color:'text-rose-300'},{label:'Viajes',value:stats.trips,icon:Route,color:'text-sky-300'},{label:'Restaurantes',value:stats.restaurants,icon:Store,color:'text-emerald-300'},{label:'Vinos',value:stats.wines,icon:Wine,color:'text-violet-300'}];return <section aria-label="Resumen del perfil" className="grid grid-cols-2 gap-2 sm:grid-cols-4">{items.map(({label,value,icon:Icon,color})=><div key={label} className="group rounded-[1.3rem] border border-white/[.07] bg-white/[.025] p-4 transition hover:-translate-y-0.5 hover:bg-white/[.05]"><Icon className={`h-4 w-4 ${color}`}/><strong className="mt-3 block text-2xl font-semibold tracking-[-.04em] text-white">{value}</strong><span className="mt-0.5 block text-[10px] uppercase tracking-[.14em] text-zinc-600">{label}</span></div>)}</section>}

function EditProfile({ initial, saving, error, onClose, onSave }: { initial: ProfileUpdate; saving: boolean; error: string | null; onClose: () => void; onSave: (value: ProfileUpdate) => Promise<void> }) {
  const [value, setValue] = useState(initial); const closeRef = useRef<HTMLButtonElement>(null); const set = (key: keyof ProfileUpdate, next: string) => setValue((current) => ({ ...current, [key]: next }));
  useEffect(() => { closeRef.current?.focus(); const escape = (event: KeyboardEvent) => event.key === 'Escape' && onClose(); document.addEventListener('keydown', escape); return () => document.removeEventListener('keydown', escape); }, [onClose]);
  async function submit(event: FormEvent) { event.preventDefault(); try { await onSave(value); } catch { /* Hook exposes the error. */ } }
  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 backdrop-blur-sm sm:items-center sm:p-6"><section role="dialog" aria-modal="true" aria-labelledby="edit-profile-title" className="max-h-[95dvh] w-full max-w-xl overflow-y-auto rounded-t-[2rem] border border-white/10 bg-zinc-950 p-6 shadow-2xl sm:rounded-[2rem]"><div className="flex justify-between"><h2 id="edit-profile-title" className="text-xl font-semibold text-white">Editar perfil</h2><button ref={closeRef} onClick={onClose} aria-label="Cerrar" className="rounded-full p-2 text-zinc-400 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"><X className="h-5 w-5" /></button></div><form onSubmit={submit} className="mt-6 grid gap-4 sm:grid-cols-2"><Input label="Nombre completo" value={value.full_name} onChange={(next) => set('full_name', next)} /><Input label="Usuario" value={value.username} onChange={(next) => set('username', next)} /><Input label="Ciudad" value={value.city} onChange={(next) => set('city', next)} /><Input label="País" value={value.country} onChange={(next) => set('country', next)} /><label className="text-sm text-zinc-400 sm:col-span-2">Biografía<textarea rows={4} value={value.bio} onChange={(event) => set('bio', event.target.value)} className="mt-1 w-full rounded-2xl border border-white/10 bg-zinc-900 p-3 text-white outline-none focus:border-sky-300/30" /></label><label className="text-sm text-zinc-400 sm:col-span-2">Privacidad del perfil<select value={value.privacy} onChange={(event) => set('privacy', event.target.value)} className="mt-1 h-12 w-full rounded-2xl border border-white/10 bg-zinc-900 px-3 text-white"><option value="private">Privado</option><option value="friends">Solo amigos</option><option value="public">Visible en Atlas</option></select><span className="mt-1.5 block text-[11px] leading-4 text-zinc-600">Afecta al perfil, no a tus recuerdos: cada recuerdo se comparte explícitamente.</span></label>{error && <p role="alert" className="text-sm text-red-400 sm:col-span-2">{error}</p>}<button disabled={saving} className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-white font-semibold text-zinc-950 disabled:opacity-60 sm:col-span-2">{saving && <Loader2 className="h-4 w-4 animate-spin" />}Guardar cambios</button></form></section></div>;
}
function Input({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) { return <label className="text-sm text-zinc-400">{label}<input value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 h-12 w-full rounded-2xl border border-white/10 bg-zinc-900 px-3 text-white outline-none focus:border-sky-300/30" /></label>; }
function message(error: string | null) { if (error === 'PROFILE_NOT_FOUND') return 'Perfil no encontrado'; if (error === 'PROFILE_FORBIDDEN') return 'Este perfil es privado'; if (error === 'AUTH_REQUIRED') return 'Inicia sesión para ver perfiles'; return 'No pudimos cargar este perfil'; }

'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { AlertCircle, Loader2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useProfile } from '@/hooks/use-profile';
import type { ProfileUpdate } from '@/types/profile';
import { Achievements } from './Achievements';
import { FavoritePlaces } from './FavoritePlaces';
import { FavoriteWines } from './FavoriteWines';
import { NetworkStats } from './NetworkStats';
import { ProfileCities } from './ProfileCities';
import { ProfileCountries } from './ProfileCountries';
import { ProfileHeader } from './ProfileHeader';
import { ProfileSkeleton } from './ProfileSkeleton';
import { ProfileStats } from './ProfileStats';
import { ProfileTimeline } from './ProfileTimeline';
import { TravelStats } from './TravelStats';
import { ProfileNetwork } from './ProfileNetwork';
import { useProfileNetwork } from '@/hooks/use-profile-network';

export function ProfileSystem({ profileId }: { profileId?: string }) {
  const profile = useProfile(profileId); const router = useRouter(); const [editing, setEditing] = useState(false); const network = useProfileNetwork(profile.data?.profile.id, profile.data?.access === 'owner');
  if (profile.loading) return <ProfileSkeleton />;
  if (!profile.data) return <main className="mx-auto flex min-h-[70vh] max-w-lg items-center px-4"><div className="w-full rounded-3xl border border-red-500/20 bg-red-500/5 p-8 text-center" role="alert"><AlertCircle className="mx-auto h-8 w-8 text-red-400" /><h1 className="mt-3 text-xl font-semibold text-white">{message(profile.error)}</h1><button onClick={() => void profile.retry()} className="mt-5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-zinc-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400">Reintentar</button></div></main>;
  const data = profile.data;
  return <main className="min-h-screen bg-zinc-950 pb-28 text-zinc-100"><div className="mx-auto max-w-6xl space-y-6 px-4 py-5 sm:px-6 sm:py-8"><ProfileHeader profile={data.profile} access={data.access} onEdit={() => setEditing(true)} onSignOut={() => void profile.signOut().then(() => router.push('/login'))} /><ProfileStats stats={data.statistics} />{data.access === 'owner' && <ProfileNetwork username={data.profile.username} avatarUrl={data.profile.avatarUrl} users={network.users} loading={network.loading} savingId={network.savingId} error={network.error} retry={() => void network.refresh()} onRelationshipChange={network.changeRelationship} />}<div className="grid gap-6 lg:grid-cols-2"><TravelStats stats={data.statistics} /><NetworkStats stats={data.statistics} /></div><FavoriteWines wines={data.favoriteWines} /><div className="grid gap-8 lg:grid-cols-2"><ProfileCountries countries={data.countries} /><ProfileCities cities={data.cities} /></div><FavoritePlaces places={data.favoritePlaces} /><Achievements achievements={data.achievements} /><ProfileTimeline items={data.timeline} /></div>{editing && <EditProfile initial={{ full_name: data.profile.fullName, username: data.profile.username, bio: data.profile.biography ?? '', city: data.profile.city ?? '', country: data.profile.country ?? '', privacy: data.profile.privacy }} saving={profile.saving} error={profile.error} onClose={() => setEditing(false)} onSave={async (value) => { await profile.save(value); setEditing(false); }} />}</main>;
}

function EditProfile({ initial, saving, error, onClose, onSave }: { initial: ProfileUpdate; saving: boolean; error: string | null; onClose: () => void; onSave: (value: ProfileUpdate) => Promise<void> }) {
  const [value, setValue] = useState(initial); const closeRef = useRef<HTMLButtonElement>(null); const set = (key: keyof ProfileUpdate, next: string) => setValue((current) => ({ ...current, [key]: next }));
  useEffect(() => { closeRef.current?.focus(); const escape = (event: KeyboardEvent) => event.key === 'Escape' && onClose(); document.addEventListener('keydown', escape); return () => document.removeEventListener('keydown', escape); }, [onClose]);
  async function submit(event: FormEvent) { event.preventDefault(); try { await onSave(value); } catch { /* The hook exposes the accessible error message. */ } }
  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 backdrop-blur-sm sm:items-center sm:p-6"><section role="dialog" aria-modal="true" aria-labelledby="edit-profile-title" className="max-h-[95dvh] w-full max-w-xl overflow-y-auto rounded-t-[2rem] border border-white/10 bg-zinc-950 p-6 sm:rounded-[2rem]"><div className="flex justify-between"><h2 id="edit-profile-title" className="text-xl font-semibold text-white">Editar perfil</h2><button ref={closeRef} onClick={onClose} aria-label="Cerrar" className="rounded-full p-2 text-zinc-400 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"><X className="h-5 w-5" /></button></div><form onSubmit={submit} className="mt-6 grid gap-4 sm:grid-cols-2"><Input label="Nombre completo" value={value.full_name} onChange={(next) => set('full_name', next)} /><Input label="Usuario" value={value.username} onChange={(next) => set('username', next)} /><Input label="Ciudad" value={value.city} onChange={(next) => set('city', next)} /><Input label="País" value={value.country} onChange={(next) => set('country', next)} /><label className="sm:col-span-2 text-sm text-zinc-400">Biografía<textarea rows={4} value={value.bio} onChange={(event) => set('bio', event.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-zinc-900 p-3 text-white outline-none focus:border-rose-400" /></label><label className="sm:col-span-2 text-sm text-zinc-400">Privacidad<select value={value.privacy} onChange={(event) => set('privacy', event.target.value)} className="mt-1 h-11 w-full rounded-xl border border-white/10 bg-zinc-900 px-3 text-white"><option value="private">Privado</option><option value="friends">Amigos</option><option value="public">Público</option></select></label>{error && <p role="alert" className="sm:col-span-2 text-sm text-red-400">{error}</p>}<button disabled={saving} className="sm:col-span-2 flex h-12 items-center justify-center gap-2 rounded-xl bg-white font-semibold text-zinc-950 disabled:opacity-60">{saving && <Loader2 className="h-4 w-4 animate-spin" />}Guardar cambios</button></form></section></div>;
}
function Input({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) { return <label className="text-sm text-zinc-400">{label}<input value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 h-11 w-full rounded-xl border border-white/10 bg-zinc-900 px-3 text-white outline-none focus:border-rose-400" /></label>; }
function message(error: string | null) { if (error === 'PROFILE_NOT_FOUND') return 'Perfil no encontrado'; if (error === 'PROFILE_FORBIDDEN') return 'Este perfil es privado'; if (error === 'AUTH_REQUIRED') return 'Inicia sesión para ver perfiles'; return 'No pudimos cargar este perfil'; }

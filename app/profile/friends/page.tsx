'use client';

import Link from 'next/link';
import { ArrowLeft, Orbit, Sparkles } from 'lucide-react';
import { ProfileNetwork } from '@/components/profile/ProfileNetwork';
import { useProfile } from '@/hooks/use-profile';
import { useProfileNetwork } from '@/hooks/use-profile-network';

export default function FriendsUniversePage() {
  const profile = useProfile();
  const network = useProfileNetwork(profile.data?.profile.id, true);

  if (profile.loading) return <main className="flex min-h-[70vh] items-center justify-center bg-zinc-950 text-sm text-zinc-500">Cargando universo…</main>;
  if (!profile.data) return <main className="flex min-h-[70vh] items-center justify-center bg-zinc-950 text-sm text-red-300">No pudimos abrir tu universo de amigos.</main>;

  return <main className="relative min-h-screen overflow-hidden bg-[#050609] pb-28 text-white">
    <div className="atlas-friends-space pointer-events-none absolute inset-0 opacity-70" />
    <div className="pointer-events-none absolute left-[-15vw] top-[-18vh] h-[55vh] w-[55vh] rounded-full bg-sky-400/[.06] blur-[110px]" />
    <div className="relative mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <Link href="/profile" className="inline-flex h-10 items-center gap-2 rounded-full border border-white/[.08] bg-white/[.04] px-3 text-xs text-zinc-400 backdrop-blur-xl transition hover:bg-white/[.08] hover:text-white"><ArrowLeft className="h-4 w-4" />Perfil</Link>
        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.18em] text-sky-300"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-sky-300" />Atlas humano</div>
      </div>

      <header className="mb-7 max-w-2xl">
        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.2em] text-zinc-600"><Orbit className="h-3.5 w-3.5 text-sky-300" />Mundo 3D</div>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-.055em] text-white sm:text-5xl">Personas que forman parte de tu Atlas.</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-500">Explora usuarios, acepta solicitudes y crea amistades para poder compartir recuerdos concretos. Sin seguidores, sin feed.</p>
      </header>

      <ProfileNetwork username={profile.data.profile.username} avatarUrl={profile.data.profile.avatarUrl} users={network.users} loading={network.loading} savingId={network.savingId} error={network.error} retry={() => void network.refresh()} onSend={network.sendRequest} onAccept={network.acceptRequest} onDecline={network.declineRequest} onRemove={network.remove} />

      <div className="mt-8 flex items-center justify-center gap-2 text-[10px] uppercase tracking-[.18em] text-zinc-800"><Sparkles className="h-3 w-3" />Compartir es siempre una decisión explícita</div>
    </div>
  </main>;
}

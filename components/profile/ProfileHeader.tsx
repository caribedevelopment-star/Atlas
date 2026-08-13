import Image from 'next/image';
import { CalendarDays, Edit3, Lock, LogOut, MapPin, ShieldCheck, Sparkles, Users } from 'lucide-react';
import type { AtlasProfile, ProfileAccess } from '@/types/profile';

export function ProfileHeader({ profile, access, onEdit, onSignOut }: { profile: AtlasProfile; access: ProfileAccess; onEdit?: () => void; onSignOut?: () => void }) {
  const privacy = profile.privacy === 'private' ? ['Privado', Lock] : profile.privacy === 'friends' ? ['Amigos', Users] : ['Visible en Atlas', ShieldCheck];
  const PrivacyIcon = privacy[1] as typeof Lock;
  const displayName = profile.fullName || profile.username;

  return <header className="atlas-glass-panel relative overflow-hidden rounded-[2.2rem] border border-white/[.09] bg-[radial-gradient(circle_at_82%_0%,rgba(56,189,248,.13),transparent_34%),radial-gradient(circle_at_12%_100%,rgba(244,63,94,.08),transparent_31%),linear-gradient(145deg,rgba(39,39,42,.95),rgba(9,9,11,.98))] p-5 shadow-[0_28px_90px_rgba(0,0,0,.34),inset_0_1px_0_rgba(255,255,255,.06)] sm:p-8">
    <div className="atlas-profile-orbit pointer-events-none absolute -right-28 -top-32 h-80 w-80 rounded-full border border-sky-300/[.08]" />
    <div className="atlas-profile-orbit atlas-profile-orbit-reverse pointer-events-none absolute -right-10 -top-14 h-52 w-52 rounded-full border border-dashed border-white/[.06]" />
    <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start">
      <div className="relative shrink-0">
        <span className="absolute -inset-4 rounded-[2rem] bg-sky-300/[.06] blur-2xl" />
        <div className="relative h-24 w-24 overflow-hidden rounded-[1.65rem] border border-white/15 bg-zinc-800 text-center text-2xl font-semibold leading-[6rem] text-white shadow-[0_18px_45px_rgba(0,0,0,.36)] sm:h-28 sm:w-28 sm:leading-[7rem]">{profile.avatarUrl ? <Image src={profile.avatarUrl} alt={`Avatar de ${displayName}`} fill unoptimized={profile.avatarUrl.startsWith('http')} className="object-cover" /> : displayName.slice(0, 2).toUpperCase()}</div>
        <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-4 border-zinc-950 bg-white text-zinc-950 shadow-lg"><Sparkles className="h-3 w-3" /></span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div><div className="flex items-center gap-2"><span className="text-sm font-medium text-sky-300">@{profile.username}</span>{access === 'owner' && <span className="rounded-full border border-white/[.07] bg-white/[.04] px-2 py-1 text-[9px] font-semibold uppercase tracking-[.14em] text-zinc-500">Tu perfil</span>}</div><h1 className="mt-1.5 text-3xl font-semibold tracking-[-.045em] text-white sm:text-4xl">{displayName}</h1></div>
          {access === 'owner' && <div className="flex gap-2"><button onClick={onEdit} className="group inline-flex h-10 items-center gap-2 rounded-full border border-white/[.08] bg-white/[.045] px-3 text-xs font-medium text-zinc-300 transition hover:bg-white/[.09] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300" aria-label="Editar perfil"><Edit3 className="h-4 w-4" /><span className="hidden sm:inline">Editar</span></button><button onClick={onSignOut} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/[.08] bg-white/[.035] text-zinc-500 transition hover:bg-red-500/10 hover:text-red-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300" aria-label="Cerrar sesión"><LogOut className="h-4 w-4" /></button></div>}
        </div>

        {profile.biography ? <p className="mt-4 max-w-2xl text-[15px] leading-7 text-zinc-300">{profile.biography}</p> : access === 'owner' ? <p className="mt-4 max-w-xl text-sm leading-6 text-zinc-600">Añade una pequeña biografía para darle más contexto a tu Atlas.</p> : null}

        <div className="mt-5 flex flex-wrap gap-2 text-xs text-zinc-400">
          {(profile.city || profile.country) && <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[.07] bg-black/15 px-3 py-2"><MapPin className="h-3.5 w-3.5 text-sky-300" />{[profile.city, profile.country].filter(Boolean).join(', ')}</span>}
          {profile.memberSince && <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[.07] bg-black/15 px-3 py-2"><CalendarDays className="h-3.5 w-3.5" />Desde {formatDate(profile.memberSince)}</span>}
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[.07] bg-black/15 px-3 py-2"><PrivacyIcon className="h-3.5 w-3.5" />{privacy[0] as string}</span>
        </div>
      </div>
    </div>
  </header>;
}

function formatDate(value: string) { const date = new Date(value); return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('es', { month: 'long', year: 'numeric' }).format(date); }

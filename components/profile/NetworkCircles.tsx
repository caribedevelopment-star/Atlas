'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Check, Clock3, Loader2, Sparkles, UserMinus, UserPlus, Users, X } from 'lucide-react';
import type { NetworkUser } from '@/lib/network';

export default function NetworkCircles({ currentUser, users, savingId, onSend, onAccept, onDecline, onRemove }: {
  currentUser: { username: string; avatarUrl?: string };
  users: NetworkUser[];
  savingId: string | null;
  onSend: (id: string) => Promise<void>;
  onAccept: (user: NetworkUser) => Promise<void>;
  onDecline: (user: NetworkUser) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
}) {
  const friends = users.filter((user) => user.friendship === 'friends');
  const incoming = users.filter((user) => user.friendship === 'pending_incoming');
  const discover = users.filter((user) => user.friendship === 'none' || user.friendship === 'pending_outgoing').slice(0, 12);

  return <div className="space-y-5">
    <div className="relative mx-auto aspect-square w-full max-w-[470px] select-none overflow-hidden rounded-[2.4rem] border border-white/[.08] bg-[radial-gradient(circle_at_50%_48%,rgba(244,63,94,.11),transparent_24%),linear-gradient(145deg,rgba(255,255,255,.045),rgba(255,255,255,.012))] shadow-[inset_0_1px_0_rgba(255,255,255,.08),0_30px_80px_rgba(0,0,0,.28)]" aria-label="Tus amigos en Atlas">
      <div className="absolute inset-[8%] rounded-full border border-white/[.05] atlas-friend-ring" />
      <div className="absolute inset-[22%] rounded-full border border-dashed border-rose-300/[.12] atlas-friend-ring atlas-friend-ring-reverse" />
      <div className="absolute inset-[34%] rounded-full bg-rose-400/[.025] blur-xl atlas-friend-breathe" />
      <div className="absolute left-1/2 top-5 -translate-x-1/2 rounded-full border border-white/[.08] bg-zinc-950/65 px-3 py-1.5 text-[10px] font-medium tracking-wide text-zinc-500 backdrop-blur-xl"><span className="mr-1.5 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-rose-400" />{friends.length} {friends.length === 1 ? 'amigo' : 'amigos'}</div>

      {friends.slice(0, 16).map((user, index) => <FriendBubble key={user.id} user={user} index={index} total={Math.min(friends.length, 16)} />)}

      <div className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 text-center">
        <div className="relative"><span className="absolute -inset-3 animate-pulse rounded-full bg-rose-400/10 blur-xl" /><Avatar name={currentUser.username || 'Tú'} avatarUrl={currentUser.avatarUrl} className="relative h-16 w-16 ring-2 ring-white/80 shadow-2xl" /></div>
        <span className="mt-2 block text-[10px] font-semibold uppercase tracking-[.16em] text-white">Tú</span>
      </div>

      {friends.length === 0 && <div className="absolute inset-x-12 bottom-10 text-center"><Sparkles className="mx-auto h-5 w-5 text-rose-300/70" /><p className="mt-2 text-xs leading-5 text-zinc-500">Añade amigos para compartir recuerdos concretos. Nada de seguidores ni feeds.</p></div>}
    </div>

    {incoming.length > 0 && <section className="rounded-[1.6rem] border border-rose-300/10 bg-rose-500/[.045] p-4"><div className="flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-400/10 text-rose-300"><UserPlus className="h-4 w-4" /></span><div><h3 className="text-sm font-semibold text-white">Solicitudes</h3><p className="text-[11px] text-zinc-500">Ser amigos solo habilita compartir recuerdos.</p></div></div><div className="mt-3 space-y-2">{incoming.map((user) => <PersonRow key={user.id} user={user} saving={savingId === user.id} actions={<><ActionButton label="Ahora no" onClick={() => void onDecline(user)} subtle /><ActionButton label="Aceptar" onClick={() => void onAccept(user)} primary /></>} />)}</div></section>}

    <section><div className="mb-2 flex items-center justify-between"><div><h3 className="text-sm font-semibold text-white">Personas en Atlas</h3><p className="mt-0.5 text-[11px] text-zinc-600">Una solicitud, una aceptación, una amistad. Eso es todo.</p></div><Users className="h-4 w-4 text-zinc-600" /></div><div className="space-y-2">{discover.map((user) => <PersonRow key={user.id} user={user} saving={savingId === user.id} actions={user.friendship === 'pending_outgoing' ? <span className="inline-flex h-9 items-center gap-1.5 rounded-full border border-white/10 px-3 text-[11px] text-zinc-500"><Clock3 className="h-3 w-3" />Enviada</span> : <ActionButton label="Añadir" onClick={() => void onSend(user.id)} icon={<UserPlus className="h-3.5 w-3.5" />} primary />} />)}</div></section>

    {friends.length > 0 && <section><div className="mb-2 flex items-center justify-between"><h3 className="text-sm font-semibold text-white">Tus amigos</h3><span className="text-[11px] text-zinc-600">{friends.length}</span></div><div className="grid gap-2 sm:grid-cols-2">{friends.map((user) => <div key={user.id} className="group flex items-center gap-3 rounded-[1.25rem] border border-white/[.07] bg-white/[.025] p-3 transition hover:bg-white/[.045]"><Avatar name={user.fullName || user.username} avatarUrl={user.avatarUrl} className="h-10 w-10 ring-2 ring-emerald-300/35" /><Link href={`/profile/${user.id}`} className="min-w-0 flex-1"><span className="block truncate text-sm font-medium text-white">{user.fullName || user.username}</span><span className="block truncate text-[11px] text-zinc-600">@{user.username || 'atlas'}</span></Link><button type="button" disabled={savingId === user.id} onClick={() => void onRemove(user.id)} aria-label={`Eliminar amistad con ${user.fullName || user.username}`} className="rounded-full p-2 text-zinc-700 opacity-70 transition hover:bg-red-500/10 hover:text-red-300 group-hover:opacity-100 disabled:opacity-30">{savingId === user.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserMinus className="h-4 w-4" />}</button></div>)}</div></section>}
  </div>;
}

function FriendBubble({ user, index, total }: { user: NetworkUser; index: number; total: number }) {
  const angle = index / Math.max(total, 1) * Math.PI * 2 - Math.PI / 2;
  const radius = index % 2 === 0 ? 37 : 41;
  return <Link href={`/profile/${user.id}`} title={user.fullName || user.username} aria-label={`Abrir perfil de ${user.fullName || user.username}`} className="atlas-friend-avatar absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400" style={{ left: `${50 + radius * Math.cos(angle)}%`, top: `${50 + radius * Math.sin(angle)}%`, animationDelay: `${index * -420}ms` }}><Avatar name={user.fullName || user.username} avatarUrl={user.avatarUrl} className="h-11 w-11 ring-2 ring-white/75 shadow-xl" /></Link>;
}

function PersonRow({ user, saving, actions }: { user: NetworkUser; saving: boolean; actions: React.ReactNode }) {
  return <div className="flex items-center gap-3 rounded-[1.2rem] border border-white/[.07] bg-black/10 p-2.5"><Avatar name={user.fullName || user.username} avatarUrl={user.avatarUrl} className="h-10 w-10 ring-1 ring-white/10" /><div className="min-w-0 flex-1"><Link href={`/profile/${user.id}`} className="block truncate text-sm font-medium text-white hover:underline">{user.fullName || user.username}</Link><span className="block truncate text-[11px] text-zinc-600">@{user.username || 'atlas'}</span></div><div className="flex items-center gap-1.5">{saving ? <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5"><Loader2 className="h-4 w-4 animate-spin text-zinc-400" /></span> : actions}</div></div>;
}

function ActionButton({ label, onClick, primary = false, subtle = false, icon }: { label: string; onClick: () => void; primary?: boolean; subtle?: boolean; icon?: React.ReactNode }) {
  return <button type="button" onClick={onClick} className={`inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[11px] font-semibold transition active:scale-95 ${primary ? 'bg-white text-zinc-950 shadow-lg' : subtle ? 'text-zinc-500 hover:bg-white/5 hover:text-zinc-300' : 'border border-white/10 text-zinc-400'}`}>{icon}{label}{primary && !icon ? <Check className="h-3 w-3" /> : null}</button>;
}

function Avatar({ name, avatarUrl, className }: { name: string; avatarUrl?: string; className: string }) {
  return <span className={`relative flex items-center justify-center overflow-hidden rounded-full bg-zinc-800 text-xs font-semibold text-white ${className}`}>{avatarUrl ? <Image src={avatarUrl} alt="" fill unoptimized={avatarUrl.startsWith('http')} className="object-cover" /> : name.slice(0, 2).toUpperCase()}</span>;
}

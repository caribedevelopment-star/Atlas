'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Check, Clock3, Loader2, Orbit, Sparkles, UserMinus, UserPlus, Users } from 'lucide-react';
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
  const discover = users.filter((user) => user.friendship === 'none' || user.friendship === 'pending_outgoing');
  const universe = users.slice(0, 28);

  return <div className="space-y-5">
    <section className="overflow-hidden rounded-[2rem] border border-white/[.08] bg-[linear-gradient(145deg,rgba(24,24,27,.92),rgba(9,9,11,.96))] shadow-[0_30px_90px_rgba(0,0,0,.35)]">
      <div className="flex items-start justify-between gap-4 px-5 pb-2 pt-5 sm:px-6 sm:pt-6">
        <div><div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.2em] text-sky-300"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-sky-300"/>Atlas humano</div><h3 className="mt-2 text-xl font-semibold tracking-[-.03em] text-white">Tu mundo</h3><p className="mt-1 max-w-md text-xs leading-5 text-zinc-500">Todos los usuarios orbitan en el mismo espacio. Toca una persona para abrir su perfil o añadirla. Sin seguidores.</p></div>
        <div className="rounded-2xl border border-white/[.08] bg-white/[.04] p-2.5 text-zinc-500"><Orbit className="h-5 w-5"/></div>
      </div>

      <div className="atlas-user-world relative mx-3 mb-3 mt-2 h-[390px] overflow-hidden rounded-[1.7rem] border border-white/[.06] bg-[radial-gradient(circle_at_50%_45%,rgba(56,189,248,.12),transparent_18%),radial-gradient(circle_at_50%_50%,rgba(244,63,94,.07),transparent_42%),linear-gradient(180deg,#09090b,#0f1015)] sm:mx-4 sm:h-[470px]">
        <div className="atlas-world-stars absolute inset-0 opacity-50"/>
        <div className="atlas-world-grid absolute inset-[8%] rounded-full border border-white/[.045]"/>
        <div className="atlas-world-grid atlas-world-grid-b absolute inset-[20%] rounded-full border border-sky-300/[.08]"/>
        <div className="atlas-world-core absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 text-center">
          <span className="absolute -inset-10 rounded-full bg-sky-300/10 blur-3xl"/>
          <Avatar name={currentUser.username || 'Tú'} avatarUrl={currentUser.avatarUrl} className="relative h-16 w-16 ring-2 ring-white/90 shadow-[0_0_45px_rgba(125,211,252,.22)]" />
          <span className="mt-2 block text-[10px] font-semibold uppercase tracking-[.18em] text-white">Tú</span>
        </div>

        {universe.map((user, index) => <WorldPerson key={user.id} user={user} index={index} total={universe.length} saving={savingId === user.id} onSend={onSend} />)}

        <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center"><div className="rounded-full border border-white/[.08] bg-zinc-950/65 px-3 py-1.5 text-[10px] text-zinc-500 backdrop-blur-xl"><span className="text-white">{friends.length}</span> amigos · <span className="text-white">{users.length}</span> personas</div></div>
      </div>
    </section>

    {incoming.length > 0 && <section className="rounded-[1.6rem] border border-rose-300/10 bg-rose-500/[.045] p-4"><div className="flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-400/10 text-rose-300"><UserPlus className="h-4 w-4" /></span><div><h3 className="text-sm font-semibold text-white">Solicitudes</h3><p className="text-[11px] text-zinc-500">Ser amigos solo habilita compartir recuerdos.</p></div></div><div className="mt-3 space-y-2">{incoming.map((user) => <PersonRow key={user.id} user={user} saving={savingId === user.id} actions={<><ActionButton label="Ahora no" onClick={() => void onDecline(user)} subtle /><ActionButton label="Aceptar" onClick={() => void onAccept(user)} primary /></>} />)}</div></section>}

    <section className="rounded-[1.6rem] border border-white/[.07] bg-white/[.025] p-4"><div className="mb-3 flex items-center justify-between"><div><h3 className="text-sm font-semibold text-white">Personas en Atlas</h3><p className="mt-0.5 text-[11px] text-zinc-600">Añadir crea una solicitud. Solo hay amistad cuando ambos aceptan.</p></div><Users className="h-4 w-4 text-zinc-600" /></div><div className="grid gap-2 sm:grid-cols-2">{discover.slice(0, 12).map((user) => <PersonRow key={user.id} user={user} saving={savingId === user.id} actions={user.friendship === 'pending_outgoing' ? <span className="inline-flex h-9 items-center gap-1.5 rounded-full border border-white/10 px-3 text-[11px] text-zinc-500"><Clock3 className="h-3 w-3" />Enviada</span> : <ActionButton label="Añadir" onClick={() => void onSend(user.id)} icon={<UserPlus className="h-3.5 w-3.5" />} primary />} />)}</div></section>

    {friends.length > 0 && <section><div className="mb-2 flex items-center justify-between"><h3 className="text-sm font-semibold text-white">Tus amigos</h3><span className="text-[11px] text-zinc-600">{friends.length}</span></div><div className="grid gap-2 sm:grid-cols-2">{friends.map((user) => <div key={user.id} className="group flex items-center gap-3 rounded-[1.25rem] border border-white/[.07] bg-white/[.025] p-3 transition hover:-translate-y-0.5 hover:bg-white/[.05]"><Avatar name={user.fullName || user.username} avatarUrl={user.avatarUrl} className="h-10 w-10 ring-2 ring-emerald-300/35" /><Link href={`/profile/${user.id}`} className="min-w-0 flex-1"><span className="block truncate text-sm font-medium text-white">{user.fullName || user.username}</span><span className="block truncate text-[11px] text-zinc-600">@{user.username || 'atlas'}</span></Link><button type="button" disabled={savingId === user.id} onClick={() => void onRemove(user.id)} aria-label={`Eliminar amistad con ${user.fullName || user.username}`} className="rounded-full p-2 text-zinc-700 opacity-70 transition hover:bg-red-500/10 hover:text-red-300 group-hover:opacity-100 disabled:opacity-30">{savingId === user.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserMinus className="h-4 w-4" />}</button></div>)}</div></section>}
  </div>;
}

function WorldPerson({ user, index, total, saving, onSend }: { user: NetworkUser; index: number; total: number; saving: boolean; onSend: (id: string) => Promise<void> }) {
  const phi = Math.acos(1 - 2 * ((index + .5) / Math.max(total, 1)));
  const theta = Math.PI * (1 + Math.sqrt(5)) * index;
  const x = Math.sin(phi) * Math.cos(theta);
  const y = Math.cos(phi);
  const z = Math.sin(phi) * Math.sin(theta);
  const left = 50 + x * 39;
  const top = 49 + y * 38;
  const scale = .72 + (z + 1) * .18;
  const opacity = .62 + (z + 1) * .17;
  const isFriend = user.friendship === 'friends';
  const pending = user.friendship === 'pending_outgoing';

  return <div className="atlas-world-person absolute z-10 -translate-x-1/2 -translate-y-1/2" style={{ left: `${left}%`, top: `${top}%`, transform: `translate(-50%,-50%) scale(${scale})`, opacity, animationDelay: `${index * -170}ms`, zIndex: Math.round(10 + (z + 1) * 10) }}>
    <Link href={`/profile/${user.id}`} className="group relative block rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300" title={user.fullName || user.username}>
      <span className={`absolute -inset-2 rounded-full blur-md transition ${isFriend ? 'bg-emerald-300/15 group-hover:bg-emerald-300/25' : 'bg-sky-300/0 group-hover:bg-sky-300/15'}`}/>
      <Avatar name={user.fullName || user.username} avatarUrl={user.avatarUrl} className={`relative h-10 w-10 shadow-xl transition group-hover:scale-110 ${isFriend ? 'ring-2 ring-emerald-300/70' : 'ring-1 ring-white/35'}`} />
      {isFriend && <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-zinc-950 bg-emerald-400"/>}
    </Link>
    {!isFriend && <button type="button" disabled={saving || pending} onClick={() => void onSend(user.id)} className="absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/10 bg-zinc-950/85 px-2 py-1 text-[8px] font-medium text-zinc-400 opacity-0 shadow-lg backdrop-blur-xl transition hover:text-white group-hover:opacity-100 sm:atlas-world-action">{saving ? '…' : pending ? 'Enviada' : '+ Añadir'}</button>}
  </div>;
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

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Globe2, Loader2, ShieldCheck, UserPlus, Users, X } from 'lucide-react';
import type { NetworkRelationship, NetworkUser } from '@/lib/network';

export default function NetworkCircles({ currentUser, users, savingId, onRelationshipChange }: { currentUser: { username: string; avatarUrl?: string }; users: NetworkUser[]; savingId: string | null; onRelationshipChange: (id: string, relationship: NetworkRelationship) => Promise<void> }) {
  const [selected, setSelected] = useState<NetworkUser | null>(null);
  const groups: Array<{ relationship: NetworkRelationship; label: string; radius: number; size: string }> = [
    { relationship: 'public', label: 'Público', radius: 44, size: 'h-8 w-8' },
    { relationship: 'network', label: 'Siguiendo', radius: 31, size: 'h-9 w-9' },
    { relationship: 'circle', label: 'Círculo', radius: 18, size: 'h-10 w-10' },
  ];
  async function change(relationship: NetworkRelationship) { if (!selected) return; await onRelationshipChange(selected.id, relationship); setSelected((current) => current ? { ...current, relationship } : null); }
  return <div className="relative mx-auto aspect-square w-full max-w-[500px] select-none" aria-label="Red personal de Atlas">
    <Ring inset="inset-2" label="Público" icon={<Globe2 className="h-3 w-3" />} />
    <Ring inset="inset-[19%]" label="Siguiendo" icon={<UserPlus className="h-3 w-3" />} />
    <Ring inset="inset-[32%]" label="Círculo" icon={<ShieldCheck className="h-3 w-3" />} />
    {groups.flatMap((group) => users.filter((user) => user.relationship === group.relationship).slice(0, 12).map((user, index, members) => <Bubble key={user.id} user={user} index={index} total={members.length} radius={group.radius} size={group.size} onClick={() => setSelected(user)} />))}
    <div className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 text-center"><Avatar name={currentUser.username} avatarUrl={currentUser.avatarUrl} className="h-14 w-14 ring-2 ring-white/80" /><span className="mt-2 block text-[10px] font-semibold text-white">Tú</span></div>
    {selected && <section role="dialog" aria-modal="false" aria-label={`Relación con ${selected.fullName || selected.username}`} className="absolute inset-x-4 bottom-0 z-40 rounded-2xl border border-white/10 bg-zinc-900 p-4 shadow-2xl">
      <div className="flex items-center gap-3"><Avatar name={selected.fullName || selected.username} avatarUrl={selected.avatarUrl} className="h-10 w-10" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-white">{selected.fullName || selected.username}</p><Link href={`/profile/${selected.id}`} className="text-xs text-rose-300 hover:underline">@{selected.username || 'perfil'}</Link></div><button onClick={() => setSelected(null)} aria-label="Cerrar" className="rounded-full p-2 text-zinc-400 hover:bg-white/10"><X className="h-4 w-4" /></button></div>
      <div className="mt-4 grid grid-cols-3 gap-2">{groups.slice().reverse().map((group) => <button key={group.relationship} type="button" disabled={savingId === selected.id} onClick={() => void change(group.relationship)} aria-pressed={selected.relationship === group.relationship} className={`flex min-h-10 items-center justify-center rounded-xl border px-2 text-xs font-medium transition disabled:opacity-60 ${selected.relationship === group.relationship ? 'border-rose-400/50 bg-rose-500/15 text-rose-200' : 'border-white/10 text-zinc-400 hover:bg-white/5 hover:text-white'}`}>{savingId === selected.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : group.label}</button>)}</div>
    </section>}
  </div>;
}

function Ring({ inset, label, icon }: { inset: string; label: string; icon: React.ReactNode }) { return <div className={`absolute ${inset} rounded-full border border-dashed border-white/15`}><span className="absolute left-1/2 top-0 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1 whitespace-nowrap rounded-full bg-zinc-950 px-2 py-1 text-[10px] text-zinc-500">{icon}{label}</span></div>; }
function Bubble({ user, index, total, radius, size, onClick }: { user: NetworkUser; index: number; total: number; radius: number; size: string; onClick: () => void }) { const angle = index / Math.max(total, 1) * Math.PI * 2 - Math.PI / 2; return <button type="button" onClick={onClick} title={user.fullName || user.username} aria-label={`Gestionar relación con ${user.fullName || user.username}`} className={`absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 ${size}`} style={{ left: `${50 + radius * Math.cos(angle)}%`, top: `${50 + radius * Math.sin(angle)}%` }}><Avatar name={user.fullName || user.username} avatarUrl={user.avatarUrl} className={`${size} ring-2 ${ringColor(user.relationship)}`} /></button>; }
function Avatar({ name, avatarUrl, className }: { name: string; avatarUrl?: string; className: string }) { return <span className={`relative flex items-center justify-center overflow-hidden rounded-full bg-zinc-800 text-xs font-semibold text-white ${className}`}>{avatarUrl ? <Image src={avatarUrl} alt="" fill unoptimized={avatarUrl.startsWith('http')} className="object-cover" /> : name.slice(0, 2).toUpperCase()}</span>; }
function ringColor(relationship: NetworkRelationship) { return relationship === 'circle' ? 'ring-emerald-400/70' : relationship === 'network' ? 'ring-amber-400/60' : 'ring-zinc-700'; }

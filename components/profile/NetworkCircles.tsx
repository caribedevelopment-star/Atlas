'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Clock3, Globe2, Loader2, UserCheck, UserPlus, X } from 'lucide-react';
import type { NetworkRelationship, NetworkUser } from '@/lib/network';

export default function NetworkCircles({ currentUser, users, savingId, onRelationshipChange, onResolveRequest }: { currentUser: { username: string; avatarUrl?: string }; users: NetworkUser[]; savingId: string | null; onRelationshipChange: (id: string, relationship: NetworkRelationship) => Promise<void>; onResolveRequest:(id:string,accept:boolean)=>Promise<void> }) {
  const [selected, setSelected] = useState<NetworkUser | null>(null);
  const groups: Array<{ relationship: NetworkRelationship; label: string; radius: number; size: string }> = [
    { relationship: 'public', label: 'Público', radius: 44, size: 'h-8 w-8' },
    { relationship: 'pending', label: 'Solicitudes', radius: 31, size: 'h-9 w-9' },
    { relationship: 'friend', label: 'Amigos', radius: 18, size: 'h-10 w-10' },
  ];
  return <div className="relative mx-auto aspect-square w-full max-w-[500px] select-none" aria-label="Red personal de Atlas">
    <Ring inset="inset-2" label="Público" icon={<Globe2 className="h-3 w-3" />} />
    <Ring inset="inset-[19%]" label="Solicitudes" icon={<Clock3 className="h-3 w-3" />} />
    <Ring inset="inset-[32%]" label="Amigos" icon={<UserCheck className="h-3 w-3" />} />
    {groups.flatMap((group) => users.filter((user) => user.relationship === group.relationship).slice(0, 12).map((user, index, members) => <Bubble key={user.id} user={user} index={index} total={members.length} radius={group.radius} size={group.size} onClick={() => setSelected(user)} />))}
    <div className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 text-center"><Avatar name={currentUser.username} avatarUrl={currentUser.avatarUrl} className="h-14 w-14 ring-2 ring-white/80" /><span className="mt-2 block text-[10px] font-semibold text-white">Tú</span></div>
    {selected && <section role="dialog" aria-modal="false" aria-label={`Relación con ${selected.fullName || selected.username}`} className="absolute inset-x-4 bottom-0 z-40 rounded-2xl border border-white/10 bg-zinc-900 p-4 shadow-2xl">
      <div className="flex items-center gap-3"><Avatar name={selected.fullName || selected.username} avatarUrl={selected.avatarUrl} className="h-10 w-10" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-white">{selected.fullName || selected.username}</p><Link href={`/profile/${selected.id}`} className="text-xs text-rose-300 hover:underline">@{selected.username || 'perfil'}</Link></div><button onClick={() => setSelected(null)} aria-label="Cerrar" className="rounded-full p-2 text-zinc-400 hover:bg-white/10"><X className="h-4 w-4" /></button></div>
      <div className="mt-4 flex gap-2">{selected.relationship==='public'&&<Action onClick={()=>void onRelationshipChange(selected.id,'friend')} loading={savingId===selected.id}>Enviar solicitud</Action>}{selected.relationship==='friend'&&<Action onClick={()=>void onRelationshipChange(selected.id,'public')} loading={savingId===selected.id}>Eliminar amistad</Action>}{selected.relationship==='pending'&&selected.requestDirection==='outgoing'&&<Action onClick={()=>void onRelationshipChange(selected.id,'public')} loading={savingId===selected.id}>Cancelar solicitud</Action>}{selected.relationship==='pending'&&selected.requestDirection==='incoming'&&selected.requestId&&<><Action onClick={()=>void onResolveRequest(selected.requestId!,true)} loading={savingId===selected.requestId}>Aceptar</Action><Action onClick={()=>void onResolveRequest(selected.requestId!,false)} loading={savingId===selected.requestId}>Rechazar</Action></>}</div>
    </section>}
  </div>;
}

function Ring({ inset, label, icon }: { inset: string; label: string; icon: React.ReactNode }) { return <div className={`atlas-orbit absolute ${inset} rounded-full border border-dashed border-white/15`}><span className="absolute left-1/2 top-0 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1 whitespace-nowrap rounded-full bg-zinc-950 px-2 py-1 text-[10px] text-zinc-500">{icon}{label}</span></div>; }
function Bubble({ user, index, total, radius, size, onClick }: { user: NetworkUser; index: number; total: number; radius: number; size: string; onClick: () => void }) { const angle = index / Math.max(total, 1) * Math.PI * 2 - Math.PI / 2; return <button type="button" onClick={onClick} title={user.fullName || user.username} aria-label={`Gestionar relación con ${user.fullName || user.username}`} className={`atlas-person absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 ${size}`} style={{ left: `${50 + radius * Math.cos(angle)}%`, top: `${50 + radius * Math.sin(angle)}%`, animationDelay: `${index * 180}ms` }}><Avatar name={user.fullName || user.username} avatarUrl={user.avatarUrl} className={`${size} ring-2 ${ringColor(user.relationship)}`} /></button>; }
function Avatar({ name, avatarUrl, className }: { name: string; avatarUrl?: string; className: string }) { return <span className={`relative flex items-center justify-center overflow-hidden rounded-full bg-zinc-800 text-xs font-semibold text-white ${className}`}>{avatarUrl ? <Image src={avatarUrl} alt="" fill unoptimized={avatarUrl.startsWith('http')} className="object-cover" /> : name.slice(0, 2).toUpperCase()}</span>; }
function ringColor(relationship: NetworkRelationship) { return relationship === 'friend' ? 'ring-emerald-400/70' : relationship === 'pending' ? 'ring-amber-400/60' : 'ring-zinc-700'; }
function Action({onClick,loading,children}:{onClick:()=>void;loading:boolean;children:React.ReactNode}){return <button type="button" disabled={loading} onClick={onClick} className="flex min-h-10 flex-1 items-center justify-center rounded-xl border border-white/10 px-3 text-xs font-medium text-white hover:bg-white/5 disabled:opacity-60">{loading?<Loader2 className="h-3.5 w-3.5 animate-spin"/>:children}</button>}

'use client';
import Image from 'next/image'; import Link from 'next/link'; import { Globe2, Users } from 'lucide-react'; import type { NetworkUser } from '@/lib/network';

export default function NetworkCircles({ currentUser, users }: { currentUser: { username: string; avatarUrl?: string }; users: NetworkUser[] }) {
  const friends=users.filter((user)=>user.relationship==='accepted'),publicUsers=users.filter((user)=>user.relationship==='public');
  return <div className="relative mx-auto aspect-square w-full max-w-[480px] select-none" aria-label={`${friends.length} amigos aceptados y ${publicUsers.length} perfiles públicos`}>
    <Ring inset="inset-2" label="Atlas público" icon={<Globe2 className="h-3 w-3" />} />
    {publicUsers.slice(0,12).map((user,index)=><Bubble key={user.id} user={user} index={index} total={Math.min(publicUsers.length,12)} radius={43} size="h-8 w-8" />)}
    <Ring inset="inset-[24%]" label="Amigos" icon={<Users className="h-3 w-3" />} />
    {friends.slice(0,10).map((user,index)=><Bubble key={user.id} user={user} index={index} total={Math.min(friends.length,10)} radius={25} size="h-10 w-10" />)}
    <div className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 text-center"><Avatar name={currentUser.username} avatarUrl={currentUser.avatarUrl} className="h-14 w-14 ring-2 ring-white/80" /><span className="mt-2 block text-[10px] font-semibold text-white">Tú</span></div>
  </div>;
}
function Ring({inset,label,icon}:{inset:string;label:string;icon:React.ReactNode}){return <div className={`absolute ${inset} rounded-full border border-dashed border-white/15`}><span className="absolute left-1/2 top-0 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1 whitespace-nowrap rounded-full bg-zinc-950 px-2 py-1 text-[10px] text-zinc-500">{icon}{label}</span></div>}
function Bubble({user,index,total,radius,size}:{user:NetworkUser;index:number;total:number;radius:number;size:string}){const angle=(index/Math.max(total,1))*Math.PI*2-Math.PI/2,x=50+radius*Math.cos(angle),y=50+radius*Math.sin(angle);return <Link href={`/profile/${user.id}`} title={user.fullName||user.username} aria-label={`Ver perfil de ${user.fullName||user.username}`} className={`absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 ${size}`} style={{left:`${x}%`,top:`${y}%`}}><Avatar name={user.fullName||user.username} avatarUrl={user.avatarUrl} className={`${size} ring-2 ${user.relationship==='accepted'?'ring-emerald-400/70':'ring-zinc-700'}`} /></Link>}
function Avatar({name,avatarUrl,className}:{name:string;avatarUrl?:string;className:string}){return <span className={`relative flex overflow-hidden rounded-full bg-zinc-800 items-center justify-center text-xs font-semibold text-white ${className}`}>{avatarUrl?<Image src={avatarUrl} alt="" fill unoptimized={avatarUrl.startsWith('http')} className="object-cover"/>:name.slice(0,2).toUpperCase()}</span>}

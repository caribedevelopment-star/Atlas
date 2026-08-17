import { CalendarDays, Eye, MapPin, Route, Store, Users } from 'lucide-react';
import type { ProfileMemory } from '@/types/profile';
import { MapOwner } from './MapOwner';

export function MemoryPopup({ memory, routeAwake = false }: { memory: ProfileMemory; routeAwake?: boolean }) {
  const restaurant = memory.isRestaurant;
  return <article className="w-64 space-y-3 bg-zinc-950 p-3 text-zinc-100">
    <div>
      <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider ${restaurant ? 'text-emerald-300' : 'text-rose-300'}`}>{restaurant ? <Store className="h-3 w-3" /> : null}{restaurant ? 'Restaurante' : memory.category || 'Memoria'}</span>
      <h3 className="mt-1 text-base font-semibold text-white">{memory.title}</h3>
      {memory.description && <p className="mt-2 line-clamp-3 text-xs leading-5 text-zinc-400">{memory.description}</p>}
    </div>
    <div className="space-y-1.5 text-xs text-zinc-500">
      {memory.place && <p className="flex gap-1.5"><MapPin className="h-3.5 w-3.5" />{memory.place}</p>}
      {(memory.date || memory.createdAt) && <p className="flex gap-1.5"><CalendarDays className="h-3.5 w-3.5" />{memory.date || memory.createdAt}</p>}
      <p className="flex gap-1.5"><Eye className="h-3.5 w-3.5" />{memory.visibility}</p>
      {memory.participantNames.length > 0 && <p className="flex gap-1.5"><Users className="h-3.5 w-3.5" />{memory.participantNames.join(', ')}</p>}
    </div>
    {routeAwake && <div className="flex items-center gap-2 rounded-xl border border-cyan-300/10 bg-cyan-300/[.055] px-3 py-2 text-[10px] leading-4 text-cyan-100/70"><Route className="h-3.5 w-3.5 shrink-0 text-cyan-200"/><span>Esta memoria despierta su viaje asociado en el mapa.</span></div>}
    <MapOwner id={memory.userId} name={memory.ownerName} avatarUrl={memory.ownerAvatarUrl} />
  </article>;
}

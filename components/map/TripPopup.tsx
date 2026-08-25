import { CalendarDays, CarFront, ExternalLink, Images, MapPinned, Plane, Route, Ship, TrainFront } from 'lucide-react';
import type { MapTrip } from '@/types/map';
import type { TransportMode } from '@/types/trip';
import { transportMeta } from '@/lib/trips/transport';
import { MapOwner } from './MapOwner';

const icons = { car: CarFront, train: TrainFront, boat: Ship, plane: Plane } satisfies Record<TransportMode, typeof CarFront>;

export function TripPopup({ trip }: { trip: MapTrip }) {
  const Icon = icons[trip.transportMode];
  return <article className="w-64 bg-zinc-950 p-3 text-zinc-100">
    <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider" style={{ color: transportMeta[trip.transportMode].color }}><Icon className="h-3.5 w-3.5" />{transportMeta[trip.transportMode].label}</span>
    <h3 className="mt-1.5 text-base font-semibold">{trip.title}</h3>
    <div className="mt-3 space-y-2 text-xs text-zinc-500"><p className="flex gap-1.5"><MapPinned className="h-3.5 w-3.5" />{trip.stops.length} paradas confirmadas</p><p className="flex gap-1.5"><Route className="h-3.5 w-3.5" />{trip.distanceKm ? `${trip.distanceKm} km estimados` : `${trip.points.length} puntos ordenados`}</p>{trip.year && <p className="flex gap-1.5"><CalendarDays className="h-3.5 w-3.5" />{trip.year}</p>}</div>
    {trip.stops.length > 0 && <ol className="mt-3 border-l border-white/10 pl-3">{trip.stops.slice(0, 5).map((stop) => <li key={stop.id} className="py-1 text-xs text-zinc-400">{stop.position + 1}. {stop.title}</li>)}</ol>}
    {trip.participants.length > 0 && <p className="mt-3 text-[11px] text-zinc-500">Con {trip.participants.map((person) => person.name).join(', ')}</p>}
    <div className="mt-3 border-t border-white/[.08] pt-3"><MapOwner id={trip.userId} name={trip.ownerName} avatarUrl={trip.ownerAvatarUrl} /></div>
    {trip.galleryUrl && <a href={trip.galleryUrl} target="_blank" rel="noreferrer" className="mt-3 flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white hover:bg-white/10"><span className="flex items-center gap-2"><Images className="h-3.5 w-3.5" />Ver galería</span><ExternalLink className="h-3.5 w-3.5" /></a>}
  </article>;
}

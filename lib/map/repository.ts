import { listMapMemories } from '@/lib/memories/repository';
import { getCurrentWineUserId, listWines } from '@/lib/wines/repository';
import { buildWineRegions } from '@/lib/map/wine-regions';
import type { AtlasMapPoint, AtlasMapSnapshot, MapSource } from '@/types/map';
import { listTrips } from '@/lib/trips/repository';

function valid(latitude?: number, longitude?: number): latitude is number { return latitude !== undefined && longitude !== undefined && Number.isFinite(latitude) && Number.isFinite(longitude) && latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180; }
function personalSource(ownerId: string | undefined, userId: string | null): MapSource { return ownerId && ownerId === userId ? 'mine' : 'shared'; }
function wineSource(ownerId: string | undefined, userId: string | null): MapSource { return ownerId && ownerId === userId ? 'mine' : 'public'; }
function year(value?: string) { if (!value) return undefined; const date = new Date(value); return Number.isNaN(date.getTime()) ? /^\d{4}/.exec(value)?.[0] : String(date.getFullYear()); }

export async function getAtlasMapSnapshot(): Promise<AtlasMapSnapshot> {
  const [memoryResult, wineResult, tripResult, userResult] = await Promise.allSettled([listMapMemories(), listWines(), listTrips(), getCurrentWineUserId()]);
  const memories = memoryResult.status === 'fulfilled' ? memoryResult.value : [];
  const wines = wineResult.status === 'fulfilled' ? wineResult.value : [];
  const authoritativeTrips = tripResult.status === 'fulfilled' ? tripResult.value : [];
  const userId = userResult.status === 'fulfilled' ? userResult.value : null;
  if (memoryResult.status === 'rejected' && wineResult.status === 'rejected' && tripResult.status === 'rejected') throw new Error('No se pudo cargar ningún contenido autorizado del mapa.');

  const points: AtlasMapPoint[] = [];
  // Memory RLS is authoritative: it returns only the user's own memories and memories explicitly shared_with them.
  const authorizedMemories = memories;
  const authorizedWines = wines.filter((wine) => wine.visibility !== 'private' || Boolean(userId && wine.user_id === userId));
  const locatedMemories = authorizedMemories.filter((memory) => valid(memory.latitude, memory.longitude));

  locatedMemories.forEach((memory) => {
    const base = { source: personalSource(memory.userId, userId), latitude: memory.latitude!, longitude: memory.longitude!, title: memory.title, subtitle: memory.place, year: year(memory.date ?? memory.createdAt), participantIds: memory.participantIds, participantNames: memory.participantNames, ownerId: memory.userId, ownerName: memory.ownerName, ownerAvatarUrl: memory.ownerAvatarUrl, memory };
    points.push({ ...base, id: `memory-${memory.id}`, layer: 'memories' });
    if (memory.isFavoritePlace) points.push({ ...base, id: `favorite-${memory.id}`, layer: 'favorites' });
    if (memory.isRestaurant) points.push({ ...base, id: `restaurant-${memory.id}`, layer: 'restaurants' });
  });

  authorizedWines.forEach((wine) => {
    let latitude = wine.latitude; let longitude = wine.longitude;
    if (!valid(latitude, longitude)) {
      const linked = locatedMemories.find((memory) => wine.linked_memories.some((item) => item.id === memory.id) || memory.linkedWineId === wine.id);
      latitude = linked?.latitude; longitude = linked?.longitude;
    }
    if (!valid(latitude, longitude)) return;
    points.push({ id: `wine-${wine.id}`, layer: 'wines', source: wineSource(wine.user_id, userId), latitude, longitude: longitude!, title: wine.name, subtitle: wine.winery, year: wine.vintage ? String(wine.vintage) : year(wine.created_at), participantIds: wine.participants.map((item) => item.id), participantNames: wine.participants.map((item) => item.name), ownerId: wine.user_id, ownerName: wine.owner_name, ownerAvatarUrl: wine.owner_avatar_url, wine });
  });

  // Trip RLS decides which trips are authorized. Non-owner routes are therefore explicitly shared routes, never a follower feed.
  authoritativeTrips.forEach((value) => {
    const routePoints = value.routeGeometry.length > 1 ? value.routeGeometry : value.stops.flatMap((stop) => valid(stop.latitude, stop.longitude) ? [{ latitude: stop.latitude!, longitude: stop.longitude! }] : []);
    const trip = { ...value, source: personalSource(value.userId, userId), points: routePoints, year: year(value.startDate), participantIds: value.participants.map((item) => item.id) };
    if (trip.points.length < 2) return;
    points.push({ id: `trip-${trip.id}`, layer: 'trips', source: trip.source, latitude: trip.points[0].latitude, longitude: trip.points[0].longitude, title: trip.title, subtitle: `${trip.stops.length} paradas`, year: trip.year, participantIds: trip.participantIds, participantNames: trip.participants.map((item) => item.name), ownerId: trip.userId, trip });
  });

  const participantMap = new Map<string, string>();
  authorizedMemories.forEach((memory) => memory.participantIds.forEach((id, index) => participantMap.set(id, memory.participantNames[index] ?? 'Usuario Atlas')));
  authoritativeTrips.forEach((trip) => trip.participants.forEach((person) => participantMap.set(person.id, person.name)));

  return {
    points,
    wineRegions: buildWineRegions(authorizedWines),
    participants: [...participantMap].map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name, 'es')),
    years: unique(points.map((point) => point.year)).sort().reverse(),
  };
}

function unique(values: Array<string | undefined>): string[] { return [...new Set(values.filter((value): value is string => Boolean(value)))]; }

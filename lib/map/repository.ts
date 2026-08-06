import { listMapMemories } from '@/lib/memories/repository';
import { getCurrentWineUserId, listWines } from '@/lib/wines/repository';
import type { AtlasMapPoint, AtlasMapSnapshot, MapSource, MapTrip } from '@/types/map';
import type { ProfileMemory } from '@/types/profile';

function valid(latitude?: number, longitude?: number): latitude is number { return latitude !== undefined && longitude !== undefined && Number.isFinite(latitude) && Number.isFinite(longitude) && latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180; }
function source(ownerId: string | undefined, visibility: ProfileMemory['visibility'], userId: string | null): MapSource { if (ownerId && ownerId === userId) return 'mine'; return visibility === 'friends' ? 'friends' : 'public'; }
function year(value?: string) { if (!value) return undefined; const date = new Date(value); return Number.isNaN(date.getTime()) ? /^\d{4}/.exec(value)?.[0] : String(date.getFullYear()); }

export async function getAtlasMapSnapshot(): Promise<AtlasMapSnapshot> {
  const [memories, wines, userId] = await Promise.all([listMapMemories(), listWines(), getCurrentWineUserId()]);
  const points: AtlasMapPoint[] = [];
  const authorizedMemories = memories.filter((memory) => memory.visibility !== 'private' || Boolean(userId && memory.userId === userId));
  const authorizedWines = wines.filter((wine) => wine.visibility !== 'private' || Boolean(userId && wine.user_id === userId));
  const locatedMemories = authorizedMemories.filter((memory) => valid(memory.latitude, memory.longitude));
  locatedMemories.forEach((memory) => {
    const base = { source: source(memory.userId, memory.visibility, userId), latitude: memory.latitude!, longitude: memory.longitude!, title: memory.title, subtitle: memory.place, year: year(memory.date ?? memory.createdAt), participantIds: memory.participantIds, participantNames: memory.participantNames, ownerId: memory.userId, ownerName: memory.ownerName, ownerAvatarUrl: memory.ownerAvatarUrl, memory };
    points.push({ ...base, id: `memory-${memory.id}`, layer: 'memories' });
    if (memory.isFavoritePlace) points.push({ ...base, id: `favorite-${memory.id}`, layer: 'favorites' });
    if (memory.isRestaurant) points.push({ ...base, id: `restaurant-${memory.id}`, layer: 'restaurants' });
  });
  authorizedWines.forEach((wine) => {
    let latitude = wine.latitude; let longitude = wine.longitude;
    if (!valid(latitude, longitude)) { const linked = locatedMemories.find((memory) => wine.linked_memories.some((item) => item.id === memory.id) || memory.linkedWineId === wine.id); latitude = linked?.latitude; longitude = linked?.longitude; }
    if (!valid(latitude, longitude)) return;
    points.push({ id: `wine-${wine.id}`, layer: 'wines', source: source(wine.user_id, wine.visibility, userId), latitude, longitude: longitude!, title: wine.name, subtitle: wine.winery, year: wine.vintage ? String(wine.vintage) : year(wine.created_at), participantIds: wine.participants.map((item) => item.id), participantNames: wine.participants.map((item) => item.name), ownerId: wine.user_id, ownerName: wine.owner_name, ownerAvatarUrl: wine.owner_avatar_url, wine });
  });
  trips(authorizedMemories, userId).forEach((trip) => points.push({ id: `trip-${trip.id}`, layer: 'trips', source: trip.source, latitude: trip.points[0].latitude, longitude: trip.points[0].longitude, title: trip.title, subtitle: `${trip.memories.length} paradas`, year: trip.year, participantIds: trip.participantIds, participantNames: unique(trip.memories.flatMap((item) => item.participantNames)), trip }));
  const participantMap = new Map<string, string>(); authorizedMemories.forEach((memory) => memory.participantIds.forEach((id, index) => participantMap.set(id, memory.participantNames[index] ?? 'Usuario Atlas'))); authorizedWines.forEach((wine) => wine.participants.forEach((person) => participantMap.set(person.id, person.name)));
  return { points, participants: [...participantMap].map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name, 'es')), years: unique(points.map((point) => point.year)).sort().reverse() };
}

function trips(memories: ProfileMemory[], userId: string | null): MapTrip[] { const groups = new Map<string, ProfileMemory[]>(); memories.filter((memory) => memory.tripId).forEach((memory) => groups.set(memory.tripId!, [...(groups.get(memory.tripId!) ?? []), memory])); return [...groups].flatMap(([id, items]) => { const sorted = [...items].sort((a, b) => new Date(a.date ?? a.createdAt ?? 0).getTime() - new Date(b.date ?? b.createdAt ?? 0).getTime()); const persistedRoute = sorted.flatMap((item) => item.route); const stops = sorted.filter((item) => valid(item.latitude, item.longitude)).map((item) => ({ latitude: item.latitude!, longitude: item.longitude! })); const points = persistedRoute.length ? persistedRoute : stops; if (!points.length) return []; const first = sorted[0]; return [{ id, title: first.category || first.place || 'Viaje', source: source(first.userId, first.visibility, userId), visibility: first.visibility, points, memories: sorted, year: year(first.date ?? first.createdAt), participantIds: unique(sorted.flatMap((item) => item.participantIds)) }]; }); }
function unique(values: Array<string | undefined>): string[] { return [...new Set(values.filter((value): value is string => Boolean(value)))]; }

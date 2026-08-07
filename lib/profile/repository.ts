import { supabase } from '@/lib/supabase';
import { listProfileLibraryItems } from '@/lib/library/repository';
import { listProfileMemories } from '@/lib/memories/repository';
import { listWines } from '@/lib/wines/repository';
import type { AtlasProfile, ProfileAccess, ProfileAchievement, ProfilePlace, ProfileSnapshot, ProfileTimelineItem, ProfileUpdate } from '@/types/profile';
import type { WineItem } from '@/types/wine';

type Row = Record<string, unknown>;
const text = (value: unknown) => typeof value === 'string' && value.trim() ? value : undefined;

function privacy(value: unknown): AtlasProfile['privacy'] {
  if (value === 'private' || value === 'friends' || value === 'public') return value;
  return 'private';
}

function normalizeProfile(row: Row): AtlasProfile {
  return { id: String(row.id), fullName: text(row.full_name) ?? '', username: text(row.username) ?? '', biography: text(row.bio), city: text(row.city), country: text(row.country), avatarUrl: text(row.avatar_url), memberSince: text(row.created_at), privacy: privacy(row.privacy ?? row.visibility) };
}

async function profileAccess(viewerId: string, profile: AtlasProfile): Promise<ProfileAccess | null> {
  if (viewerId === profile.id) return 'owner';
  const [outgoing, incoming] = await Promise.all([
    supabase.from('friendships').select('id').eq('status', 'accepted').eq('requester_id', viewerId).eq('addressee_id', profile.id).maybeSingle(),
    supabase.from('friendships').select('id').eq('status', 'accepted').eq('requester_id', profile.id).eq('addressee_id', viewerId).maybeSingle(),
  ]);
  if (outgoing.error) throw outgoing.error;
  if (incoming.error) throw incoming.error;
  const accepted = Boolean(outgoing.data || incoming.data);
  if (accepted && profile.privacy !== 'private') return 'friend';
  return profile.privacy === 'public' ? 'public' : null;
}

export async function getProfileSnapshot(requestedId?: string): Promise<ProfileSnapshot> {
  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError || !auth.user) throw new Error('AUTH_REQUIRED');
  const profileId = requestedId ?? auth.user.id;
  const { data, error } = await supabase.from('profiles').select('*').eq('id', profileId).maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('PROFILE_NOT_FOUND');
  const profile = normalizeProfile(data as Row);
  const access = await profileAccess(auth.user.id, profile);
  if (!access) throw new Error('PROFILE_FORBIDDEN');

  const [memoryResult, wineResult, libraryResult, friendsResult] = await Promise.allSettled([
    listProfileMemories(profileId, access), listWines(), listProfileLibraryItems(profileId, access), countFriends(profileId),
  ]);
  const memories = memoryResult.status === 'fulfilled' ? memoryResult.value : [];
  const allWines = wineResult.status === 'fulfilled' ? wineResult.value : [];
  const wines = allWines.filter((wine) => wine.user_id === profileId && canSee(wine, access));
  const libraryItems = libraryResult.status === 'fulfilled' ? libraryResult.value : [];
  const friends = friendsResult.status === 'fulfilled' ? friendsResult.value : 0;
  if ([memoryResult, wineResult, libraryResult, friendsResult].every((result) => result.status === 'rejected')) throw new Error('PROFILE_DATA_UNAVAILABLE');

  const countries = places(memories.map((memory) => memory.country));
  const cities = places(memories.map((memory) => memory.city));
  const favoritePlaces = places(memories.filter((memory) => memory.isFavoritePlace).map((memory) => memory.place)).slice(0, 6);
  const favoriteWines = wines.filter((wine) => wine.favorite);
  const tripKeys = new Set(memories.filter((memory) => memory.tripId || memory.category?.toLowerCase().includes('viaj')).map((memory) => memory.tripId ?? memory.id));
  const publicContributions = wines.filter((item) => item.visibility === 'public').length + libraryItems.filter((item) => item.visibility === 'public').length;
  const statistics = { memories: memories.length, wines: wines.length, favoriteWines: favoriteWines.length, countriesVisited: countries.length, citiesVisited: cities.length, trips: tripKeys.size, restaurants: memories.filter((memory) => memory.isRestaurant).length, libraryItems: libraryItems.length, friends, publicContributions, travelDistanceKm: distance(memories) };
  return { profile, access, statistics, memories, wines, libraryItems, countries, cities, favoritePlaces, favoriteWines, achievements: achievements(statistics), timeline: timeline(memories, wines, libraryItems) };
}

function canSee(wine: WineItem, access: ProfileAccess) { return access === 'owner' || wine.visibility === 'public' || (access === 'friend' && wine.visibility === 'friends'); }
async function countFriends(profileId: string) {
  const [outgoing, incoming] = await Promise.all([
    supabase.from('friendships').select('id').eq('status', 'accepted').eq('requester_id', profileId),
    supabase.from('friendships').select('id').eq('status', 'accepted').eq('addressee_id', profileId),
  ]);
  if (outgoing.error) throw outgoing.error;
  if (incoming.error) throw incoming.error;
  return (outgoing.data?.length ?? 0) + (incoming.data?.length ?? 0);
}
function places(values: Array<string | undefined>): ProfilePlace[] { const counts = new Map<string, number>(); values.filter((value): value is string => Boolean(value)).forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1)); return [...counts].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)); }
function achievements(stats: ProfileSnapshot['statistics']): ProfileAchievement[] { return [{ key: 'memories', title: 'Primera memoria', description: 'Guardó su primera memoria.' }, { key: 'wines', title: 'Primera botella', description: 'Añadió su primer vino.' }, { key: 'countriesVisited', title: 'Pasaporte Atlas', description: 'Registró su primer país visitado.' }, { key: 'friends', title: 'Memoria compartida', description: 'Conectó con otra persona en Atlas.' }].filter((item) => stats[item.key as keyof typeof stats] !== null && Number(stats[item.key as keyof typeof stats]) > 0).map(({ key, ...item }) => ({ id: key, ...item })); }
function timeline(memories: ProfileSnapshot['memories'], wines: WineItem[], library: ProfileSnapshot['libraryItems']): ProfileTimelineItem[] { return [...memories.map((item) => ({ id: `memory-${item.id}`, title: item.title, subtitle: item.place, date: item.date ?? item.createdAt, kind: 'memory' as const })), ...wines.map((item) => ({ id: `wine-${item.id}`, title: item.name, subtitle: item.winery, date: item.created_at, kind: 'wine' as const })), ...library.map((item) => ({ id: `library-${item.id}`, title: item.title, date: item.createdAt, kind: 'library' as const }))].sort((a, b) => new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime()).slice(0, 12); }
function distance(memories: ProfileSnapshot['memories']): number | null { let total = 0; let segments = 0; const trips = new Map<string, Array<{ latitude: number; longitude: number }>>(); memories.forEach((memory) => { for (let index = 1; index < memory.route.length; index += 1) { total += haversine(memory.route[index - 1], memory.route[index]); segments += 1; } if (memory.tripId && memory.latitude !== undefined && memory.longitude !== undefined) trips.set(memory.tripId, [...(trips.get(memory.tripId) ?? []), { latitude: memory.latitude, longitude: memory.longitude }]); }); trips.forEach((points) => { for (let index = 1; index < points.length; index += 1) { total += haversine(points[index - 1], points[index]); segments += 1; } }); return segments ? Math.round(total) : null; }
function haversine(a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }) { const rad = (value: number) => value * Math.PI / 180; const lat = rad(b.latitude - a.latitude); const lng = rad(b.longitude - a.longitude); const value = Math.sin(lat / 2) ** 2 + Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(lng / 2) ** 2; return 6371 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value)); }

export async function updateProfile(id: string, update: ProfileUpdate) { const { error } = await supabase.from('profiles').update({ ...update, updated_at: new Date().toISOString() }).eq('id', id); if (error) throw error; }
export async function signOutProfile() { const { error } = await supabase.auth.signOut(); if (error) throw error; }

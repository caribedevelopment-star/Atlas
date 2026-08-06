import { supabase } from '@/lib/supabase';
import type { ProfileAccess, ProfileMemory } from '@/types/profile';

type Row = Record<string, unknown>;
const text = (value: unknown) => typeof value === 'string' && value.trim() ? value : undefined;
const number = (value: unknown) => { const result = Number(value); return Number.isFinite(result) ? result : undefined; };

function visibility(row: Row): ProfileMemory['visibility'] {
  if (row.is_private === true || row.visibility === 'private') return 'private';
  if (row.visibility === 'friends' || row.visibility === 'circle' || row.visibility === 'network') return 'friends';
  return 'public';
}

function normalize(row: Row): ProfileMemory {
  const rawRoute = Array.isArray(row.route) ? row.route : Array.isArray(row.route_points) ? row.route_points : [];
  const category = text(row.category);
  return {
    id: String(row.id), userId: text(row.user_id), title: text(row.title) ?? 'Memoria', description: text(row.description),
    city: text(row.city), country: text(row.country), place: text(row.location_name) ?? text(row.location), category,
    date: text(row.memory_date) ?? text(row.date), createdAt: text(row.created_at), latitude: number(row.latitude), longitude: number(row.longitude),
    route: rawRoute.flatMap((point) => { if (!point || typeof point !== 'object') return []; const value = point as Row; const latitude = number(value.latitude ?? value.lat); const longitude = number(value.longitude ?? value.lng ?? value.lon); return latitude === undefined || longitude === undefined ? [] : [{ latitude, longitude }]; }),
    visibility: visibility(row), isRestaurant: row.is_restaurant === true || category?.toLowerCase().includes('restaur') === true, isFavoritePlace: row.favorite === true || row.is_favorite === true, tripId: text(row.trip_id),
  };
}

export async function listProfileMemories(profileId: string, access: ProfileAccess): Promise<ProfileMemory[]> {
  const { data, error } = await supabase.from('memories').select('*').eq('user_id', profileId).order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => normalize(row as Row)).filter((memory) => access === 'owner' || memory.visibility === 'public' || (access === 'friend' && memory.visibility === 'friends'));
}

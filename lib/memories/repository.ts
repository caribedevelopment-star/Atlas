import { supabase } from '@/lib/supabase';
import type { ProfileAccess, ProfileMemory } from '@/types/profile';
import type { WineVisibility } from '@/types/wine';

type Row = Record<string, unknown>;
const text = (value: unknown) => typeof value === 'string' && value.trim() ? value : undefined;
const number = (value: unknown) => { if (value === null || value === undefined || value === '') return undefined; const result = Number(value); return Number.isFinite(result) ? result : undefined; };

function visibility(row: Row): ProfileMemory['visibility'] {
  if (row.is_private === true || row.visibility === 'private') return 'private';
  if (row.visibility === 'friends' || row.visibility === 'circle' || row.visibility === 'network') return 'friends';
  return 'public';
}

function strings(value: unknown): string[] { return Array.isArray(value) ? value.flatMap((entry) => typeof entry === 'string' ? [entry] : []) : []; }

export function normalizeMemory(row: Row): ProfileMemory {
  const rawRoute = Array.isArray(row.route) ? row.route : Array.isArray(row.route_points) ? row.route_points : [];
  const category = text(row.category);
  return {
    id: String(row.id), userId: text(row.user_id), ownerName: text(row.owner_name), ownerAvatarUrl: text(row.owner_avatar_url), title: text(row.title) ?? 'Memoria', description: text(row.description),
    city: text(row.city), country: text(row.country), place: text(row.location_name) ?? text(row.location), category,
    date: text(row.memory_date) ?? text(row.date), createdAt: text(row.created_at), latitude: number(row.latitude), longitude: number(row.longitude),
    route: rawRoute.flatMap((point) => { if (!point || typeof point !== 'object') return []; const value = point as Row; const latitude = number(value.latitude ?? value.lat); const longitude = number(value.longitude ?? value.lng ?? value.lon); return latitude === undefined || longitude === undefined ? [] : [{ latitude, longitude }]; }), participantIds: strings(row.participant_ids ?? row.tagged_friends), participantNames: strings(row.participant_names), linkedWineId: text(row.wine_id ?? row.linked_wine_id),
    visibility: visibility(row), isRestaurant: row.is_restaurant === true || category?.toLowerCase().includes('restaur') === true, isFavoritePlace: row.favorite === true || row.is_favorite === true, tripId: text(row.trip_id),
  };
}

export async function listProfileMemories(profileId: string, access: ProfileAccess): Promise<ProfileMemory[]> {
  const { data, error } = await supabase.from('memories').select('*').eq('user_id', profileId).order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => normalizeMemory(row as Row)).filter((memory) => access === 'owner' || memory.visibility === 'public' || (access === 'friend' && memory.visibility === 'friends'));
}

export async function listMapMemories(): Promise<ProfileMemory[]> {
  const { data, error } = await supabase.from('memories').select('*');
  if (error) throw error;
  return (data ?? []).map((row) => normalizeMemory(row as Row));
}

export interface CreateMemoryInput { title: string; location: string; date: string; description: string; visibility: WineVisibility; latitude?: number; longitude?: number; city?: string; country?: string }
export async function createMemory(input: CreateMemoryInput): Promise<string> {
  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError || !auth.user) throw new Error('Debes iniciar sesión para guardar una memoria.');
  const { data, error } = await supabase.from('memories').insert({ user_id: auth.user.id, title: input.title.trim(), location_name: input.location.trim() || null, city: input.city || null, country: input.country || null, latitude: input.latitude ?? null, longitude: input.longitude ?? null, memory_date: input.date || null, description: input.description.trim() || null, visibility: input.visibility, tagged_friends: [] }).select('id').single();
  if (error) throw error;
  return String(data.id);
}

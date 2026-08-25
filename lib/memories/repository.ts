import { supabase } from '@/lib/supabase';
import type { ProfileAccess, ProfileMemory } from '@/types/profile';
import type { WineVisibility } from '@/types/wine';

type Row = Record<string, unknown>;
const text = (value: unknown) => typeof value === 'string' && value.trim() ? value : undefined;
const number = (value: unknown) => { if (value === null || value === undefined || value === '') return undefined; const result = Number(value); return Number.isFinite(result) ? result : undefined; };

function visibility(row: Row): ProfileMemory['visibility'] {
  return row.visibility === 'friends' || row.visibility === 'shared' ? 'friends' : 'private';
}

function strings(value: unknown): string[] { return Array.isArray(value) ? value.flatMap((entry) => typeof entry === 'string' ? [entry] : []) : []; }

export function normalizeMemory(row: Row): ProfileMemory {
  const rawRoute = Array.isArray(row.route) ? row.route : Array.isArray(row.route_points) ? row.route_points : [];
  const category = text(row.category);
  return {
    id: String(row.id), userId: text(row.user_id), ownerName: text(row.owner_name) ?? text(row.author_name), ownerAvatarUrl: text(row.owner_avatar_url), title: text(row.title) ?? 'Memoria', description: text(row.description),
    city: text(row.city), country: text(row.country), place: text(row.location_name) ?? text(row.location), category,
    date: text(row.memory_date) ?? text(row.date), createdAt: text(row.created_at), latitude: number(row.latitude), longitude: number(row.longitude),
    route: rawRoute.flatMap((point) => { if (!point || typeof point !== 'object') return []; const value = point as Row; const latitude = number(value.latitude ?? value.lat); const longitude = number(value.longitude ?? value.lng ?? value.lon); return latitude === undefined || longitude === undefined ? [] : [{ latitude, longitude }]; }), participantIds: strings(row.shared_with ?? row.tagged_friends ?? row.participant_ids), participantNames: strings(row.participant_names), linkedWineId: text(row.wine_id ?? row.linked_wine_id),
    visibility: visibility(row), isRestaurant: row.is_restaurant === true || category?.toLowerCase().includes('restaur') === true,
    restaurantCuisine: text(row.restaurant_cuisine), restaurantVibe: text(row.restaurant_vibe), restaurantPriceLevel: number(row.restaurant_price_level), restaurantRating: number(row.restaurant_rating), restaurantMustOrder: text(row.restaurant_must_order), restaurantStatus: row.restaurant_status === 'wishlist' ? 'wishlist' : row.restaurant_status === 'visited' ? 'visited' : undefined,
    restaurantWebsite: text(row.restaurant_website), restaurantPhone: text(row.restaurant_phone), restaurantOpeningHours: text(row.restaurant_opening_hours), restaurantSource: text(row.restaurant_source), restaurantSourceId: text(row.restaurant_source_id),
    isFavoritePlace: row.favorite === true || row.is_favorite === true, tripId: text(row.trip_id),
  };
}

export async function listProfileMemories(profileId: string, _access: ProfileAccess): Promise<ProfileMemory[]> {
  const { data, error } = await supabase.from('memories').select('*').eq('user_id', profileId).order('created_at', { ascending: false });
  if (error) throw error;
  // RLS is authoritative: owners see their memories; other users only receive memories explicitly shared with them.
  return hydrateMemories((data ?? []).map((row) => normalizeMemory(row as Row)));
}

export async function listMapMemories(): Promise<ProfileMemory[]> {
  const { data, error } = await supabase.from('memories').select('*');
  if (error) throw error;
  // RLS returns only own memories + memories where the current user is in shared_with.
  return hydrateMemories((data ?? []).map((row) => normalizeMemory(row as Row)));
}

export async function listMyMemories(): Promise<ProfileMemory[]> { const {data:auth,error:authError}=await supabase.auth.getUser(); if(authError||!auth.user)throw new Error('Debes iniciar sesión para ver tus memorias.'); const {data,error}=await supabase.from('memories').select('*').eq('user_id',auth.user.id).order('created_at',{ascending:false}); if(error)throw error; return hydrateMemories((data??[]).map((row)=>normalizeMemory(row as Row))); }

export async function getMemory(id: string): Promise<ProfileMemory> {
  const { data, error } = await supabase.from('memories').select('*').eq('id', id).single();
  if (error) throw error;
  return (await hydrateMemories([normalizeMemory(data as Row)]))[0];
}

async function hydrateMemories(memories: ProfileMemory[]): Promise<ProfileMemory[]> {
  if (!memories.length) return memories;
  const { data: auth } = await supabase.auth.getUser();
  const ids = [...new Set(memories.flatMap((memory) => [memory.userId, ...memory.participantIds]).filter((id): id is string => Boolean(id)))];
  if (!ids.length) return memories.map((memory) => ({ ...memory, isOwner: Boolean(auth.user && memory.userId === auth.user.id) }));
  const { data, error } = await supabase.from('profiles').select('id,full_name,username,avatar_url').in('id', ids);
  if (error) return memories.map((memory) => ({ ...memory, isOwner: Boolean(auth.user && memory.userId === auth.user.id) }));
  const profiles = new Map((data ?? []).map((profile) => [String(profile.id), { name: profile.full_name || profile.username || 'Usuario Atlas', avatarUrl: profile.avatar_url || undefined }]));
  return memories.map((memory) => {
    const owner = memory.userId ? profiles.get(memory.userId) : undefined;
    return {
      ...memory,
      ownerName: memory.ownerName ?? owner?.name,
      ownerAvatarUrl: memory.ownerAvatarUrl ?? owner?.avatarUrl,
      participantNames: memory.participantIds.map((id, index) => memory.participantNames[index] ?? profiles.get(id)?.name ?? 'Usuario Atlas'),
      isOwner: Boolean(auth.user && memory.userId === auth.user.id),
    };
  });
}

export interface CreateMemoryInput { title: string; location: string; date: string; description: string; visibility?: WineVisibility; participantIds: string[]; latitude?: number; longitude?: number; city?: string; country?: string; isRestaurant?: boolean; category?: string; restaurantCuisine?: string; restaurantVibe?: string; restaurantPriceLevel?: number; restaurantRating?: number; restaurantMustOrder?: string; restaurantStatus?: 'visited' | 'wishlist'; restaurantWebsite?: string; restaurantPhone?: string; restaurantOpeningHours?: string; restaurantSource?: string; restaurantSourceId?: string }
export async function createMemory(input: CreateMemoryInput): Promise<string> {
  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError || !auth.user) throw new Error('Debes iniciar sesión para guardar una memoria.');
  if (!input.title.trim()) throw new Error('Escribe un título para la memoria.');
  const payload = { user_id: auth.user.id, title: input.title.trim(), location_name: input.location.trim() || null, city: input.city || null, country: input.country || null, latitude: input.latitude ?? null, longitude: input.longitude ?? null, memory_date: input.date || null, description: input.description.trim() || null, visibility: input.participantIds.length ? 'friends' : 'private', shared_with: input.participantIds, is_restaurant: Boolean(input.isRestaurant), category: input.category?.trim() || (input.isRestaurant ? 'Restaurante' : 'Memoria'), ...restaurantPayload(input) };
  const { data, error } = await supabase.from('memories').insert(payload).select('id').single();
  if (error) throw new Error(memorySaveMessage(error));
  return String(data.id);
}

export async function updateMemory(id: string, input: CreateMemoryInput): Promise<void> {
  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError || !auth.user) throw new Error('Debes iniciar sesión para editar esta memoria.');
  const payload = { title: input.title.trim(), location_name: input.location.trim() || null, city: input.city || null, country: input.country || null, latitude: input.latitude ?? null, longitude: input.longitude ?? null, memory_date: input.date || null, description: input.description.trim() || null, visibility: input.participantIds.length ? 'friends' : 'private', shared_with: input.participantIds, is_restaurant: Boolean(input.isRestaurant), category: input.category?.trim() || (input.isRestaurant ? 'Restaurante' : 'Memoria'), ...restaurantPayload(input) };
  const { error } = await supabase.from('memories').update(payload).eq('id', id).eq('user_id', auth.user.id);
  if (error) throw new Error(memorySaveMessage(error));
}

function memorySaveMessage(error: { code?: string; message?: string }): string { if (error.code === '42501') return 'No tienes permiso para guardar esta memoria. Revisa tu sesión.'; if (error.code === 'PGRST204') return `La tabla de memorias no está actualizada: ${error.message ?? 'falta una columna requerida'}.`; return error.message || 'No se pudo guardar la memoria.'; }

function restaurantPayload(input: CreateMemoryInput): { restaurant_cuisine: string | null; restaurant_vibe: string | null; restaurant_price_level: number | null; restaurant_rating: number | null; restaurant_must_order: string | null; restaurant_status: 'visited' | 'wishlist' | null; restaurant_website: string | null; restaurant_phone: string | null; restaurant_opening_hours: string | null; restaurant_source: string | null; restaurant_source_id: string | null } {
  if (!input.isRestaurant) return { restaurant_cuisine: null, restaurant_vibe: null, restaurant_price_level: null, restaurant_rating: null, restaurant_must_order: null, restaurant_status: null, restaurant_website: null, restaurant_phone: null, restaurant_opening_hours: null, restaurant_source: null, restaurant_source_id: null };
  return {
    restaurant_cuisine: input.restaurantCuisine?.trim() || null,
    restaurant_vibe: input.restaurantVibe?.trim() || null,
    restaurant_price_level: input.restaurantPriceLevel ?? null,
    restaurant_rating: input.restaurantRating ?? null,
    restaurant_must_order: input.restaurantMustOrder?.trim() || null,
    restaurant_status: input.restaurantStatus ?? 'visited',
    restaurant_website: input.restaurantWebsite?.trim() || null,
    restaurant_phone: input.restaurantPhone?.trim() || null,
    restaurant_opening_hours: input.restaurantOpeningHours?.trim() || null,
    restaurant_source: input.restaurantSource?.trim() || null,
    restaurant_source_id: input.restaurantSourceId?.trim() || null,
  };
}

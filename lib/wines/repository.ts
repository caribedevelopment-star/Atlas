import { supabase } from '@/lib/supabase';
import type { CreateWineInput, WineItem, WineParticipant, WineVisibility } from '@/types/wine';

type DatabaseRecord = Record<string, unknown>;

function text(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined;
}

function number(value: unknown): number | undefined {
  if (value === null || value === undefined || value === '') return undefined;
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function stringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(text).filter((item): item is string => Boolean(item));
  if (typeof value === 'string') return value.split(',').map((item) => item.trim()).filter(Boolean);
  return [];
}

function visibility(value: unknown): WineVisibility {
  if (value === 'private' || value === 'friends' || value === 'public') return value;
  if (value === 'circle' || value === 'network') return 'friends';
  return 'public';
}

function participants(value: unknown): WineParticipant[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    if (!entry || typeof entry !== 'object') return [];
    const row = entry as DatabaseRecord;
    const id = text(row.id) ?? text(row.user_id);
    if (!id) return [];
    return [{ id, name: text(row.name) ?? text(row.full_name) ?? 'Usuario Atlas', avatarUrl: text(row.avatar_url) }];
  });
}

export function normalizeWine(row: DatabaseRecord): WineItem {
  const profile = row.user && typeof row.user === 'object' ? row.user as DatabaseRecord : undefined;
  const memories = Array.isArray(row.linked_memories) ? row.linked_memories : [];
  return {
    id: String(row.id),
    user_id: text(row.user_id),
    owner_name: text(row.owner_name) ?? text(profile?.full_name) ?? text(profile?.username),
    owner_avatar_url: text(row.owner_avatar_url) ?? text(profile?.avatar_url),
    name: text(row.name) ?? 'Vino sin nombre',
    winery: text(row.winery),
    vintage: number(row.vintage),
    rating: number(row.rating),
    supermarket: text(row.supermarket),
    shop: text(row.shop),
    price: number(row.price),
    tasting_notes: text(row.tasting_notes),
    notes: text(row.notes),
    image_url: text(row.image_url),
    photos: stringArray(row.photos),
    country: text(row.country),
    region: text(row.region),
    denomination: text(row.denomination) ?? text(row.denomination_of_origin),
    grapes: stringArray(row.grapes ?? row.grape),
    favorite: row.favorite === true || row.is_favorite === true,
    visibility: visibility(row.visibility),
    participants: participants(row.participants),
    linked_memories: memories.flatMap((entry) => {
      if (!entry || typeof entry !== 'object') return [];
      const memory = entry as DatabaseRecord;
      const id = text(memory.id);
      if (!id) return [];
      return [{ id, title: text(memory.title) ?? 'Memoria', date: text(memory.date) }];
    }),
    latitude: number(row.latitude),
    longitude: number(row.longitude),
    is_popular: row.is_popular === true,
    created_at: text(row.created_at),
  };
}

export async function getCurrentWineUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

export async function listWines(): Promise<WineItem[]> {
  const { data, error } = await supabase.from('wines').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return Promise.all((data ?? []).map(async (row) => hydrateWinePhotos(normalizeWine(row as DatabaseRecord), row as DatabaseRecord)));
}

export async function createWine(input: CreateWineInput): Promise<WineItem> {
  const { data, error } = await supabase.from('wines').insert([input]).select().single();
  if (error) throw error;
  return normalizeWine(data as DatabaseRecord);
}

export async function setWineFavorite(id: string, favorite: boolean): Promise<void> {
  const { error } = await supabase.from('wines').update({ favorite }).eq('id', id);
  if (error) throw error;
}

export async function uploadWinePhoto(file: File): Promise<string> {
  const userId = await getCurrentWineUserId();
  if (!userId) throw new Error('Debes iniciar sesión para subir una fotografía.');
  const extension = file.name.split('.').pop() || 'jpg';
  const path = `${userId}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from('wine-photos').upload(path, file);
  if (error) throw error;
  const { data: signed, error: signedError } = await supabase.storage.from('wine-photos').createSignedUrl(path, 60 * 60 * 24 * 7);
  if (!signedError && signed?.signedUrl) return signed.signedUrl;
  return supabase.storage.from('wine-photos').getPublicUrl(path).data.publicUrl;
}

async function hydrateWinePhotos(wine: WineItem, row: DatabaseRecord): Promise<WineItem> {
  const cover = text(row.image_path) ?? wine.image_url;
  const paths = stringArray(row.photo_paths).length ? stringArray(row.photo_paths) : wine.photos;
  const [imageUrl, ...photos] = await Promise.all([cover, ...paths].map(resolveWinePhoto));
  return { ...wine, image_url: imageUrl, photos: photos.filter((value): value is string => Boolean(value)) };
}

async function resolveWinePhoto(value?: string): Promise<string | undefined> {
  if (!value) return undefined;
  if (/^https?:\/\//.test(value)) return value;
  const path = value.replace(/^wine-photos\//, '');
  const { data, error } = await supabase.storage.from('wine-photos').createSignedUrl(path, 60 * 60);
  return error ? undefined : data.signedUrl;
}

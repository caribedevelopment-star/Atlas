import { supabase } from '@/lib/supabase';
import type { CreateWineInput, WineEnrichmentStatus, WineItem, WineParticipant, WineVisibility } from '@/types/wine';

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
  if (Array.isArray(value)) return value.flatMap((entry) => {
    if (typeof entry === 'string') return entry.trim() ? [entry] : [];
    if (!entry || typeof entry !== 'object') return [];
    const row = entry as DatabaseRecord;
    const reference = text(row.storage_path) ?? text(row.path) ?? text(row.url) ?? text(row.image_url);
    return reference ? [reference] : [];
  });
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
    image_url: text(row.image_url) ?? text(row.photo_url) ?? text(row.bottle_image) ?? text(row.image),
    photos: stringArray(row.photos ?? row.photo_urls ?? row.images),
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
    created_at: text(row.created_at),
    interaction_id: text(row.interaction_id),
    date_tasted: text(row.date_tasted),
    purchase_location: text(row.purchase_location),
    description: text(row.description),
    enrichment_status: enrichmentStatus(row.enrichment_status),
    enrichment_confidence: number(row.enrichment_confidence),
    enrichment_source: text(row.enrichment_source),
    canonical_image_url: text(row.canonical_image_url),
    enriched_at: text(row.enriched_at),
  };
}

export async function getCurrentWineUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

export async function listWines(): Promise<WineItem[]> {
  const userId = await getCurrentWineUserId();
  const [{ data, error }, interactionResult] = await Promise.all([
    supabase.from('wines').select('*').order('created_at', { ascending: false }),
    userId ? supabase.from('user_wines').select('*').eq('user_id', userId) : Promise.resolve({ data: [], error: null }),
  ]);
  if (error) throw error;
  if (interactionResult.error && interactionResult.error.code !== 'PGRST205') throw interactionResult.error;
  const interactions = new Map((interactionResult.data ?? []).map((item) => [item.wine_id, item]));
  return Promise.all((data ?? []).map(async (row) => {
    const interaction = interactions.get(row.id) as DatabaseRecord | undefined;
    const wine = normalizeWine({ ...row, favorite: interaction?.favorite ?? false, rating: interaction?.rating, tasting_notes: interaction?.tasting_notes, price: interaction?.purchase_price, shop: interaction?.shop, interaction_id: interaction?.id, date_tasted: interaction?.date_tasted, purchase_location: interaction?.purchase_location });
    return hydrateWinePhotos(wine, { ...row, personal_image_path:interaction?.image_path, personal_photo_paths:interaction?.photo_paths } as DatabaseRecord);
  }));
}

export async function createWine(input: CreateWineInput): Promise<WineItem> {
  const userId = await getCurrentWineUserId();
  if (!userId) throw new Error('Debes iniciar sesión para añadir un vino.');
  let existing = await findCatalogWine(input);
  const identity=catalogIdentity(input);
  const uploadedReference = input.image_path ? `wine-photos/${input.image_path}` : null;
  const catalogue = { user_id:userId, name:input.name.trim(), winery:input.winery||null, vintage:input.vintage||null, country:input.country||null, region:input.region||null, denomination:input.denomination||null, grapes:input.grapes??[], image_path:input.image_path||null, photo_paths:input.photo_paths??[], description:input.description||null, supermarket:input.supermarket||null,catalog_identity:identity, enrichment_status:input.image_path?'matched':'pending',enrichment_confidence:input.image_path?1:null,enrichment_source:input.image_path?'atlas:user-upload':null,canonical_image_url:uploadedReference,enriched_at:input.image_path?new Date().toISOString():null };
  let result = existing ? { data:existing,error:null } : await supabase.from('wines').insert(catalogue).select().single();
  if(result.error?.code==='23505'){existing=await findCatalogWine(input);result=existing?{data:existing,error:null}:result;}
  const { data, error } = result;
  if (error || !data) throw new Error(wineError(error??{message:'No se pudo crear el registro público del vino.'}));
  const interaction = { user_id:userId, wine_id:data.id, favorite:input.favorite??false, rating:input.rating??null, tasting_notes:input.tasting_notes||null, date_tasted:input.date_tasted||null, purchase_price:input.price??null, purchase_location:input.purchase_location||null, shop:input.shop||null,image_path:input.image_path||null,photo_paths:input.photo_paths??[] };
  const { data: personal, error: personalError } = await supabase.from('user_wines').upsert(interaction,{onConflict:'user_id,wine_id'}).select().single();
  if (personalError) { if(!existing)await supabase.from('wines').delete().eq('id',data.id).eq('user_id',userId);throw new Error(wineError(personalError)); }
  if(!input.image_path&&(data.enrichment_status??'pending')==='pending')void supabase.functions.invoke('enrich-wine-catalog',{body:{wineId:data.id}}).catch((cause)=>console.warn('Enrichment queue unavailable',cause));
  return hydrateWinePhotos(normalizeWine({ ...data, ...interaction, id:data.id, interaction_id:personal?.id }), { ...data,personal_image_path:interaction.image_path,personal_photo_paths:interaction.photo_paths } as DatabaseRecord);
}

export async function setWineFavorite(id: string, favorite: boolean): Promise<void> {
  const userId=await getCurrentWineUserId();if(!userId)throw new Error('Debes iniciar sesión para guardar favoritos.');
  const { error } = await supabase.from('user_wines').upsert({user_id:userId,wine_id:id,favorite},{onConflict:'user_id,wine_id'});
  if (error) throw new Error(wineError(error));
}

export async function updateWine(id:string,input:Partial<CreateWineInput>):Promise<WineItem>{const userId=await getCurrentWineUserId();if(!userId)throw new Error('Debes iniciar sesión para editar un vino.');const catalogue={name:input.name,winery:input.winery||null,vintage:input.vintage||null,country:input.country||null,region:input.region||null,denomination:input.denomination||null,grapes:input.grapes,description:input.description||null};Object.keys(catalogue).forEach((key)=>catalogue[key as keyof typeof catalogue]===undefined&&delete catalogue[key as keyof typeof catalogue]);const{data,error}=await supabase.from('wines').update(catalogue).eq('id',id).eq('user_id',userId).select().single();if(error)throw new Error(wineError(error));const interaction={user_id:userId,wine_id:id,rating:input.rating??null,tasting_notes:input.tasting_notes||null,purchase_price:input.price??null,shop:input.shop||null,favorite:input.favorite??false};const{data:personal,error:personalError}=await supabase.from('user_wines').upsert(interaction,{onConflict:'user_id,wine_id'}).select().single();if(personalError)throw new Error(wineError(personalError));return hydrateWinePhotos(normalizeWine({...data,...interaction,interaction_id:personal?.id}),data as DatabaseRecord);}

export async function uploadWinePhoto(file: File): Promise<string> {
  const userId = await getCurrentWineUserId();
  if (!userId) throw new Error('Debes iniciar sesión para subir una fotografía.');
  const allowed=['image/jpeg','image/png','image/webp','image/heic','image/heif'];
  if(!allowed.includes(file.type))throw new Error('Usa una fotografía JPEG, PNG, WebP, HEIC o HEIF.');
  if(file.size>12*1024*1024)throw new Error('La fotografía supera el límite de 12 MB.');
  const extension = extensionFor(file);
  const path = `${userId}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from('wine-photos').upload(path, file,{contentType:file.type,upsert:false});
  if (error) throw new Error(`No se pudo subir la fotografía: ${error.message}`);
  return path;
}

export async function deleteWinePhoto(path:string){const normalized=parseStorageObject(path);if(!normalized)return;await supabase.storage.from(normalized.bucket).remove([normalized.path]);}

async function hydrateWinePhotos(wine: WineItem, row: DatabaseRecord): Promise<WineItem> {
  const cover = text(row.personal_image_path) ?? text(row.image_path) ?? text(row.canonical_image_url) ?? text(row.photo_path) ?? text(row.storage_path) ?? wine.image_url;
  const personalPaths=stringArray(row.personal_photo_paths);
  const paths = personalPaths.length?personalPaths:stringArray(row.photo_paths).length ? stringArray(row.photo_paths) : wine.photos;
  const [imageUrl, ...photos] = await Promise.all([cover, ...paths].map(resolveWinePhoto));
  return { ...wine, image_url: imageUrl, photos: photos.filter((value): value is string => Boolean(value)) };
}

function extensionFor(file:File){const byType:Record<string,string>={'image/jpeg':'jpg','image/png':'png','image/webp':'webp','image/heic':'heic','image/heif':'heif'};return byType[file.type]??'jpg';}
function enrichmentStatus(value:unknown):WineEnrichmentStatus|undefined{return ['pending','matched','needs_review','no_match','failed'].includes(String(value))?value as WineEnrichmentStatus:undefined;}
async function findCatalogWine(input:CreateWineInput):Promise<DatabaseRecord|null>{const identity=catalogIdentity(input);const identityResult=await supabase.from('wines').select('*').eq('catalog_identity',identity).maybeSingle();if(!identityResult.error&&identityResult.data)return identityResult.data;const name=input.name.trim();const{data,error}=await supabase.from('wines').select('*').ilike('name',name).limit(20);if(error&&error.code!=='42703')throw new Error(wineError(error));return(data??[]).find((row)=>normalizeIdentity(row.name)===normalizeIdentity(name)&&normalizeIdentity(row.winery)===normalizeIdentity(input.winery)&&number(row.vintage)===input.vintage)??null;}
function normalizeIdentity(value:unknown){return String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('es').replace(/[^a-z0-9]+/g,' ').trim();}
function catalogIdentity(input:CreateWineInput){return [input.name,input.winery,input.vintage].map((value)=>String(value??'').trim().replace(/\s+/g,' ').toLocaleLowerCase('es')).join('|');}
function wineError(error:{code?:string;message?:string}){if(error.code==='42501')return 'Supabase bloqueó la operación por permisos. Revisa las políticas RLS de vinos.';if(error.code==='PGRST204'||error.code==='PGRST205')return `La base de datos no tiene instalado el modelo estabilizado de vinos (${error.message??error.code}).`;return error.message||'No se pudo guardar el vino.';}

async function resolveWinePhoto(value?: string): Promise<string | undefined> {
  if (!value) return undefined;
  if (/^https?:\/\//.test(value)) { try { const url=new URL(value); if (/\/storage\/v1\/(?:object|render\/image)\/public\//.test(url.pathname)) return value; } catch { return undefined; } }
  const storageObject = parseStorageObject(value);
  if (!storageObject) return /^https?:\/\//.test(value) ? value : undefined;
  const { data, error } = await supabase.storage.from(storageObject.bucket).createSignedUrl(storageObject.path, 60 * 60);
  return error ? undefined : data.signedUrl;
}

function parseStorageObject(value: string): { bucket: string; path: string } | null {
  if (!/^https?:\/\//.test(value)) {
    const normalized = value.replace(/^\/+/, '');
    const bucket = ['wine-photos', 'wine-images', 'wine_photos', 'wines'].find((name) => normalized.startsWith(`${name}/`));
    return bucket ? { bucket, path: normalized.slice(bucket.length + 1) } : { bucket: 'wine-photos', path: normalized };
  }
  try {
    const url = new URL(value);
    const match = url.pathname.match(/\/storage\/v1\/(?:object|render\/image)\/(?:public|sign|authenticated)\/([^/]+)\/(.+)$/);
    return match ? { bucket: decodeURIComponent(match[1]), path: decodeURIComponent(match[2]) } : null;
  } catch { return null; }
}

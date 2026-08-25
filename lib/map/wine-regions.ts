import { supabase } from '@/lib/supabase';
import type { WineItem } from '@/types/wine';
import type { AtlasWineDenomination, AtlasWineRegion } from '@/types/map';

type RegionDefinition = AtlasWineDenomination;
type Row = Record<string, unknown>;

const FALLBACK_REGIONS: RegionDefinition[] = [
  denomination('es-rioja', 'Rioja', 'España', 'DOCa', 42.466, -2.445, 72000),
  denomination('es-ribera', 'Ribera del Duero', 'España', 'DO', 41.671, -3.689, 76000),
  denomination('es-priorat', 'Priorat', 'España', 'DOCa', 41.145, .821, 36000),
  denomination('es-cava', 'Cava', 'España', 'DO', 41.423, 1.785, 52000),
  denomination('es-rias-baixas', 'Rías Baixas', 'España', 'DO', 42.438, -8.716, 56000),
  denomination('es-rueda', 'Rueda', 'España', 'DO', 41.414, -4.958, 56000),
  denomination('it-barolo', 'Barolo', 'Italia', 'DOCG', 44.61, 7.94, 26000),
  denomination('it-chianti', 'Chianti Classico', 'Italia', 'DOCG', 43.515, 11.31, 44000),
  denomination('it-prosecco', 'Prosecco', 'Italia', 'DOC', 45.876, 12.214, 76000),
  denomination('fr-champagne', 'Champagne', 'Francia', 'AOP', 49.054, 4.027, 72000),
  denomination('fr-bordeaux', 'Bordeaux', 'Francia', 'AOP', 44.84, -.58, 105000),
  denomination('fr-sancerre', 'Sancerre', 'Francia', 'AOP', 47.33, 2.84, 35000),
];

export async function listWineDenominations(): Promise<AtlasWineDenomination[]> {
  const { data, error } = await supabase.from('wine_denominations').select('id,name,country,classification,official_id,source_url,latitude,longitude,radius_m').eq('active', true).order('country').order('name');
  if (error) throw error;
  return (data ?? []).flatMap((raw) => {
    const row = raw as Row;
    const latitude = numeric(row.latitude), longitude = numeric(row.longitude), radius = numeric(row.radius_m);
    if (!row.id || !row.name || !row.country || latitude === undefined || longitude === undefined) return [];
    return [{ id: String(row.id), name: String(row.name), country: String(row.country), classification: text(row.classification), officialId: text(row.official_id), sourceUrl: text(row.source_url), latitude, longitude, radius: radius ?? 42000 }];
  });
}

export function buildWineRegions(wines: WineItem[], catalog: AtlasWineDenomination[] = []): AtlasWineRegion[] {
  const definitions = catalog.length ? catalog : FALLBACK_REGIONS;
  const grouped = new Map<string, WineItem[]>();
  for (const wine of wines) {
    const key = wine.denomination?.trim() || wine.region?.trim();
    if (!key) continue;
    const definition = findDefinition(key, definitions);
    if (definition) grouped.set(definition.id, [...(grouped.get(definition.id) ?? []), wine]);
  }

  return definitions.map((definition) => {
    const items = grouped.get(definition.id) ?? [];
    const wineries = new Set(items.map((wine) => wine.winery).filter(Boolean));
    const favoriteCount = items.filter((wine) => wine.favorite).length;
    const multiplier = 1 + Math.min(items.length, 8) * .035;
    return {
      id: definition.id,
      name: displayName(definition),
      country: definition.country,
      classification: definition.classification,
      officialId: definition.officialId,
      sourceUrl: definition.sourceUrl,
      latitude: definition.latitude,
      longitude: definition.longitude,
      radius: Math.round(definition.radius * multiplier),
      wineCount: items.length,
      wineryCount: wineries.size,
      favoriteCount,
      averageRating: average(items.map((wine) => wine.rating)),
    };
  }).sort((a, b) => b.wineCount - a.wineCount || a.country.localeCompare(b.country, 'es') || a.name.localeCompare(b.name, 'es'));
}

function findDefinition(value: string, definitions: RegionDefinition[]) {
  const normalized = normalize(value);
  return definitions.find((definition) => {
    const name = normalize(definition.name);
    const full = normalize(displayName(definition));
    return normalized === name || normalized === full || normalized.includes(name) || full.includes(normalized);
  });
}

function displayName(definition: RegionDefinition) {
  if (!definition.classification) return definition.name;
  return definition.country === 'España' ? `${definition.classification} ${definition.name}` : `${definition.name} ${definition.classification}`;
}

function denomination(id: string, name: string, country: string, classification: string, latitude: number, longitude: number, radius: number): RegionDefinition {
  return { id, name, country, classification, latitude, longitude, radius };
}

function text(value: unknown) { return typeof value === 'string' && value.trim() ? value : undefined; }
function numeric(value: unknown) { const result = Number(value); return value === null || value === undefined || !Number.isFinite(result) ? undefined : result; }
function normalize(value: string) { return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim(); }
function average(values: Array<number | undefined>) { const valid = values.filter((value): value is number => Number.isFinite(value)); return valid.length ? Math.round((valid.reduce((sum, value) => sum + value, 0) / valid.length) * 10) / 10 : undefined; }

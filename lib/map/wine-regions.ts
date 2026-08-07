import type { WineItem } from '@/types/wine';
import type { AtlasWineRegion } from '@/types/map';

type RegionDefinition = { name: string; aliases: string[]; latitude: number; longitude: number; radius: number; country: string };

const REGION_DEFINITIONS: RegionDefinition[] = [
  { name: 'DOCa Rioja', aliases: ['doca rioja','do rioja','rioja'], latitude: 42.466, longitude: -2.445, radius: 72000, country: 'España' },
  { name: 'DO Ribera del Duero', aliases: ['do ribera del duero','ribera del duero'], latitude: 41.671, longitude: -3.689, radius: 76000, country: 'España' },
  { name: 'DO Rueda', aliases: ['do rueda','rueda'], latitude: 41.414, longitude: -4.958, radius: 56000, country: 'España' },
  { name: 'DO Rías Baixas', aliases: ['do rias baixas','do rías baixas','rias baixas','rías baixas'], latitude: 42.438, longitude: -8.716, radius: 56000, country: 'España' },
  { name: 'DO Jumilla', aliases: ['do jumilla','jumilla'], latitude: 38.479, longitude: -1.325, radius: 52000, country: 'España' },
  { name: 'DO Monterrei', aliases: ['do monterrei','monterrei'], latitude: 41.948, longitude: -7.449, radius: 34000, country: 'España' },
  { name: 'DO Navarra', aliases: ['do navarra','navarra'], latitude: 42.612, longitude: -1.674, radius: 76000, country: 'España' },
  { name: 'DO Uclés', aliases: ['do ucles','do uclés','ucles','uclés'], latitude: 39.981, longitude: -2.861, radius: 43000, country: 'España' },
  { name: 'DO Cava', aliases: ['do cava','cava'], latitude: 41.423, longitude: 1.785, radius: 52000, country: 'España' },
  { name: 'IGP Extremadura', aliases: ['igp extremadura','extremadura'], latitude: 39.179, longitude: -6.142, radius: 98000, country: 'España' },
  { name: 'Douro DOC', aliases: ['douro doc','doc douro','douro'], latitude: 41.167, longitude: -7.55, radius: 82000, country: 'Portugal' },
  { name: 'Prosecco DOC', aliases: ['prosecco doc','doc prosecco','prosecco'], latitude: 45.876, longitude: 12.214, radius: 76000, country: 'Italia' },
  { name: 'Champagne AOC', aliases: ['champagne aoc','aoc champagne','champagne'], latitude: 49.054, longitude: 4.027, radius: 72000, country: 'Francia' },
];

export function buildWineRegions(wines: WineItem[]): AtlasWineRegion[] {
  const grouped = new Map<string, WineItem[]>();
  for (const wine of wines) {
    const key = wine.denomination?.trim() || wine.region?.trim();
    if (!key) continue;
    const definition = findDefinition(key);
    if (!definition) continue;
    grouped.set(definition.name, [...(grouped.get(definition.name) ?? []), wine]);
  }

  return [...grouped.entries()].map(([name, items]) => {
    const definition = REGION_DEFINITIONS.find((item) => item.name === name)!;
    const wineries = new Set(items.map((wine) => wine.winery).filter(Boolean));
    const favorites = items.filter((wine) => wine.favorite).length;
    const averageRating = average(items.map((wine) => wine.rating));
    const multiplier = 1 + Math.min(items.length, 8) * 0.035;
    return {
      id: slug(name),
      name,
      country: definition.country,
      latitude: definition.latitude,
      longitude: definition.longitude,
      radius: Math.round(definition.radius * multiplier),
      wineCount: items.length,
      wineryCount: wineries.size,
      favoriteCount: favorites,
      averageRating,
    };
  }).sort((a, b) => b.wineCount - a.wineCount || a.name.localeCompare(b.name, 'es'));
}

function findDefinition(value: string) {
  const normalized = normalize(value);
  return REGION_DEFINITIONS.find((definition) => definition.aliases.some((alias) => normalized === normalize(alias) || normalized.includes(normalize(alias))));
}

function normalize(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function average(values: Array<number | undefined>) {
  const valid = values.filter((value): value is number => Number.isFinite(value));
  if (!valid.length) return undefined;
  return Math.round((valid.reduce((sum, value) => sum + value, 0) / valid.length) * 10) / 10;
}

function slug(value: string) {
  return normalize(value).replace(/\s+/g, '-');
}

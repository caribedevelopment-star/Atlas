import type { AtlasVisitedCountry } from '@/types/map';
import { normalizeAtlasText } from '@/lib/wines/denomination-style';

const COUNTRY_ALIASES: Record<string, string> = {
  espana: 'Spain', spain: 'Spain', francia: 'France', france: 'France', italia: 'Italy', italy: 'Italy', portugal: 'Portugal',
  alemania: 'Germany', germany: 'Germany', reino_unido: 'United Kingdom', united_kingdom: 'United Kingdom', inglaterra: 'United Kingdom',
  estados_unidos: 'United States of America', united_states: 'United States of America', usa: 'United States of America', japon: 'Japan', japan: 'Japan',
  marruecos: 'Morocco', morocco: 'Morocco', mexico: 'Mexico', argentina: 'Argentina', chile: 'Chile', brasil: 'Brazil', brazil: 'Brazil',
  colombia: 'Colombia', grecia: 'Greece', greece: 'Greece', suiza: 'Switzerland', switzerland: 'Switzerland', austria: 'Austria',
  belgica: 'Belgium', belgium: 'Belgium', paises_bajos: 'Netherlands', netherlands: 'Netherlands', holanda: 'Netherlands', croacia: 'Croatia',
  croatia: 'Croatia', turquia: 'Turkey', turkey: 'Turkey', turkiye: 'Turkey', tailandia: 'Thailand', thailand: 'Thailand', indonesia: 'Indonesia',
  australia: 'Australia', canada: 'Canada',
};

function key(value: string) { return normalizeAtlasText(value).replace(/ /g, '_'); }
export function worldAtlasCountryName(value: string) { return COUNTRY_ALIASES[key(value)] ?? value; }

export function buildVisitedCountries(values: Array<string | undefined>): AtlasVisitedCountry[] {
  const counts = new Map<string, { name: string; itemCount: number }>();
  values.filter((value): value is string => Boolean(value?.trim())).forEach((value) => {
    const worldName = worldAtlasCountryName(value);
    const current = counts.get(worldName) ?? { name: value.trim(), itemCount: 0 };
    current.itemCount += 1;
    counts.set(worldName, current);
  });
  return [...counts.values()].sort((a, b) => b.itemCount - a.itemCount || a.name.localeCompare(b.name, 'es'));
}

export function findVisitedCountry(featureName: string, countries: AtlasVisitedCountry[]) {
  const normalizedFeature = normalizeAtlasText(featureName);
  return countries.find((country) => normalizeAtlasText(worldAtlasCountryName(country.name)) === normalizedFeature);
}

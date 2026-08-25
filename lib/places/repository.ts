export interface AtlasPlace {
  id: string;
  label: string;
  name?: string;
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
  cuisine?: string;
  website?: string;
  phone?: string;
  openingHours?: string;
  source?: 'nominatim' | 'photon';
  sourceId?: string;
}

export async function searchPlaces(query: string, signal?: AbortSignal, kind?: 'restaurant'): Promise<AtlasPlace[]> {
  const params = new URLSearchParams({ q: query });
  if (kind) params.set('kind', kind);
  const response = await fetch(`/api/geocode?${params}`, { signal });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || 'No se pudieron buscar lugares.');
  return body.places ?? [];
}

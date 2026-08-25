import { NextResponse } from 'next/server';

type AtlasPlaceResult = {
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
  category?: string;
  type?: string;
};

const headers = {
  'User-Agent': 'Atlas/1.0 (personal travel archive)',
  Accept: 'application/json',
};

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const kind = params.get('kind') === 'restaurant' ? 'restaurant' as const : undefined;
  const latParam = params.get('lat');
  const lonParam = params.get('lon');

  if (latParam !== null && lonParam !== null) {
    const latitude = Number(latParam);
    const longitude = Number(lonParam);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return NextResponse.json({ error: 'Coordenadas no válidas.' }, { status: 400 });
    }
    return reverseGeocode(latitude, longitude);
  }

  const query = params.get('q')?.trim().replace(/\s+/g, ' ');
  if (!query || query.length < 3) return NextResponse.json({ places: [] });
  if (query.length > 140) return NextResponse.json({ error: 'La búsqueda es demasiado larga.' }, { status: 400 });

  try {
    const places = await searchNominatim(query, kind);
    if (places.length) return NextResponse.json({ places, provider: 'nominatim' });
  } catch (error) {
    console.warn('Nominatim search failed:', error);
  }

  try {
    const places = await searchPhoton(query, kind);
    return NextResponse.json({ places, provider: 'photon' });
  } catch (error) {
    console.error('Geocoding fallback failed:', error);
    return NextResponse.json({ error: 'No se pudieron buscar lugares ahora mismo.' }, { status: 502 });
  }
}

async function searchNominatim(query: string, kind?: 'restaurant'): Promise<AtlasPlaceResult[]> {
  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('q', query);
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('addressdetails', '1');
  url.searchParams.set('namedetails', '1');
  url.searchParams.set('extratags', '1');
  if (kind === 'restaurant') url.searchParams.set('layer', 'poi');
  url.searchParams.set('dedupe', '1');
  url.searchParams.set('limit', '7');
  url.searchParams.set('accept-language', 'es');

  const response = await fetch(url, { headers, next: { revalidate: 86400 } });
  if (!response.ok) throw new Error(`NOMINATIM_${response.status}`);

  const data = await response.json() as Array<{
    place_id: number;
    display_name: string;
    name?: string;
    osm_id?: number | string;
    osm_type?: string;
    category?: string;
    type?: string;
    lat: string;
    lon: string;
    address?: Record<string, string>;
    extratags?: Record<string, string>;
    namedetails?: Record<string, string>;
  }>;

  const mapped = data
    .map((place) => ({
      id: `osm-${place.osm_type ?? 'place'}-${place.osm_id ?? place.place_id}`,
      label: place.display_name,
      name: place.name ?? place.namedetails?.name ?? place.address?.restaurant ?? place.address?.cafe,
      latitude: Number(place.lat),
      longitude: Number(place.lon),
      city: place.address?.city ?? place.address?.town ?? place.address?.village ?? place.address?.municipality ?? place.address?.county,
      country: place.address?.country,
      cuisine: readableCuisine(place.extratags?.cuisine),
      website: place.extratags?.website ?? place.extratags?.['contact:website'],
      phone: place.extratags?.phone ?? place.extratags?.['contact:phone'],
      openingHours: place.extratags?.opening_hours,
      source: 'nominatim' as const,
      sourceId: place.osm_id ? `${place.osm_type ?? ''}${place.osm_id}` : String(place.place_id),
      category: place.category,
      type: place.type,
    }))
    .filter(validPlace);
  if (kind !== 'restaurant') return mapped;
  const restaurantTypes = new Set(['restaurant', 'cafe', 'fast_food', 'food_court', 'bar', 'pub']);
  const exact = mapped.filter((place) => restaurantTypes.has(place.type ?? '') || Boolean(place.cuisine));
  return (exact.length ? exact : mapped).map(({ category: _category, type: _type, ...place }) => place);
}

async function searchPhoton(query: string, kind?: 'restaurant'): Promise<AtlasPlaceResult[]> {
  const url = new URL('https://photon.komoot.io/api/');
  url.searchParams.set('q', query);
  url.searchParams.set('limit', '7');
  url.searchParams.set('lang', 'es');

  const response = await fetch(url, { headers, next: { revalidate: 86400 } });
  if (!response.ok) throw new Error(`PHOTON_${response.status}`);

  const body = await response.json() as {
    features?: Array<{
      properties?: { osm_id?: number | string; osm_type?: string; name?: string; city?: string; state?: string; country?: string; street?: string; housenumber?: string; osm_value?: string; cuisine?: string; website?: string; phone?: string; opening_hours?: string };
      geometry?: { coordinates?: [number, number] };
    }>;
  };

  return (body.features ?? [])
    .map((feature, index) => {
      const properties = feature.properties ?? {};
      const coordinates = feature.geometry?.coordinates;
      const longitude = Number(coordinates?.[0]);
      const latitude = Number(coordinates?.[1]);
      const primary = [properties.name, properties.street, properties.housenumber].filter(Boolean).join(' ');
      const secondary = [properties.city, properties.state, properties.country].filter(Boolean).join(', ');
      return {
        id: `photon-${properties.osm_id ?? index}`,
        label: [primary || properties.city || properties.state || properties.country || query, secondary].filter(Boolean).join(' · '),
        name: properties.name,
        latitude,
        longitude,
        city: properties.city,
        country: properties.country,
        cuisine: readableCuisine(properties.cuisine),
        website: properties.website,
        phone: properties.phone,
        openingHours: properties.opening_hours,
        source: 'photon' as const,
        sourceId: properties.osm_id ? `${properties.osm_type ?? ''}${properties.osm_id}` : undefined,
        type: properties.osm_value,
      } satisfies AtlasPlaceResult;
    })
    .filter(validPlace)
    .filter((place) => kind !== 'restaurant' || !place.type || ['restaurant', 'cafe', 'fast_food', 'food_court', 'bar', 'pub'].includes(place.type))
    .map(({ type: _type, ...place }) => place);
}

async function reverseGeocode(latitude: number, longitude: number) {
  const reverse = new URL('https://nominatim.openstreetmap.org/reverse');
  reverse.searchParams.set('lat', String(latitude));
  reverse.searchParams.set('lon', String(longitude));
  reverse.searchParams.set('format', 'jsonv2');
  reverse.searchParams.set('addressdetails', '1');
  reverse.searchParams.set('accept-language', 'es');

  try {
    const response = await fetch(reverse, { headers, next: { revalidate: 3600 } });
    if (!response.ok) throw new Error(`NOMINATIM_REVERSE_${response.status}`);
    const place = await response.json() as { display_name?: string; address?: Record<string, string> };
    return NextResponse.json({
      label: place.display_name ?? place.address?.city ?? place.address?.town ?? place.address?.village ?? 'Tu ubicación actual',
      city: place.address?.city ?? place.address?.town ?? place.address?.village,
      country: place.address?.country,
      latitude,
      longitude,
    });
  } catch {
    return NextResponse.json({ label: 'Tu ubicación actual', latitude, longitude });
  }
}

function validPlace(place: AtlasPlaceResult) {
  return Number.isFinite(place.latitude)
    && Number.isFinite(place.longitude)
    && place.latitude >= -90
    && place.latitude <= 90
    && place.longitude >= -180
    && place.longitude <= 180;
}

function readableCuisine(value?: string) {
  if (!value) return undefined;
  return value.split(/[;,]/).map((item) => item.trim()).filter(Boolean).map((item) => item.charAt(0).toLocaleUpperCase('es') + item.slice(1).replace(/_/g, ' ')).join(' · ');
}

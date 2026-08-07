import { NextResponse } from 'next/server';

type AtlasPlaceResult = {
  id: string;
  label: string;
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
};

const headers = {
  'User-Agent': 'Atlas/1.0 (personal travel archive)',
  Accept: 'application/json',
};

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
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
    const places = await searchNominatim(query);
    if (places.length) return NextResponse.json({ places, provider: 'nominatim' });
  } catch (error) {
    console.warn('Nominatim search failed:', error);
  }

  try {
    const places = await searchPhoton(query);
    return NextResponse.json({ places, provider: 'photon' });
  } catch (error) {
    console.error('Geocoding fallback failed:', error);
    return NextResponse.json({ error: 'No se pudieron buscar lugares ahora mismo.' }, { status: 502 });
  }
}

async function searchNominatim(query: string): Promise<AtlasPlaceResult[]> {
  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('q', query);
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('addressdetails', '1');
  url.searchParams.set('namedetails', '1');
  url.searchParams.set('dedupe', '1');
  url.searchParams.set('limit', '7');
  url.searchParams.set('accept-language', 'es');

  const response = await fetch(url, { headers, next: { revalidate: 86400 } });
  if (!response.ok) throw new Error(`NOMINATIM_${response.status}`);

  const data = await response.json() as Array<{
    place_id: number;
    display_name: string;
    lat: string;
    lon: string;
    address?: Record<string, string>;
  }>;

  return data
    .map((place) => ({
      id: `osm-${place.place_id}`,
      label: place.display_name,
      latitude: Number(place.lat),
      longitude: Number(place.lon),
      city: place.address?.city ?? place.address?.town ?? place.address?.village ?? place.address?.municipality ?? place.address?.county,
      country: place.address?.country,
    }))
    .filter(validPlace);
}

async function searchPhoton(query: string): Promise<AtlasPlaceResult[]> {
  const url = new URL('https://photon.komoot.io/api/');
  url.searchParams.set('q', query);
  url.searchParams.set('limit', '7');
  url.searchParams.set('lang', 'es');

  const response = await fetch(url, { headers, next: { revalidate: 86400 } });
  if (!response.ok) throw new Error(`PHOTON_${response.status}`);

  const body = await response.json() as {
    features?: Array<{
      properties?: { osm_id?: number | string; name?: string; city?: string; state?: string; country?: string; street?: string; housenumber?: string };
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
        latitude,
        longitude,
        city: properties.city,
        country: properties.country,
      } satisfies AtlasPlaceResult;
    })
    .filter(validPlace);
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

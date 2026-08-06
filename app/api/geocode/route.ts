import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const latitude = Number(params.get('lat'));
  const longitude = Number(params.get('lon'));
  if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
    const reverse = new URL('https://nominatim.openstreetmap.org/reverse');
    reverse.searchParams.set('lat', String(latitude)); reverse.searchParams.set('lon', String(longitude)); reverse.searchParams.set('format', 'jsonv2'); reverse.searchParams.set('accept-language', 'es');
    try { const response=await fetch(reverse,{headers:{'User-Agent':'Atlas/1.0 (personal archive)',Accept:'application/json'},next:{revalidate:3600}});if(!response.ok)throw new Error();const place=await response.json() as {display_name?:string;address?:Record<string,string>};return NextResponse.json({label:place.address?.city??place.address?.town??place.address?.village??place.display_name}); } catch { return NextResponse.json({label:'Tu ubicación actual'}); }
  }
  const query = params.get('q')?.trim();
  if (!query || query.length < 3) return NextResponse.json({ places: [] });
  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('q', query); url.searchParams.set('format', 'jsonv2'); url.searchParams.set('addressdetails', '1'); url.searchParams.set('limit', '5'); url.searchParams.set('accept-language', 'es');
  try {
    const response = await fetch(url, { headers: { 'User-Agent': 'Atlas/1.0 (personal archive)', Accept: 'application/json' }, next: { revalidate: 86400 } });
    if (!response.ok) throw new Error('GEOCODING_UNAVAILABLE');
    const data = await response.json() as Array<{ place_id: number; display_name: string; lat: string; lon: string; address?: Record<string,string> }>;
    return NextResponse.json({ places: data.map((place) => ({ id: String(place.place_id), label: place.display_name, latitude: Number(place.lat), longitude: Number(place.lon), city: place.address?.city ?? place.address?.town ?? place.address?.village, country: place.address?.country })) });
  } catch { return NextResponse.json({ error: 'No se pudieron buscar lugares.' }, { status: 502 }); }
}

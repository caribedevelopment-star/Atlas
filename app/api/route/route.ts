import { NextResponse } from 'next/server';

type Point = { latitude: number; longitude: number };

type OsrmResponse = {
  routes?: Array<{
    distance?: number;
    duration?: number;
    geometry?: { type?: string; coordinates?: number[][] };
  }>;
};

export async function POST(request: Request) {
  try {
    const body = await request.json() as { points?: Point[] };
    const points = (body.points ?? []).filter(validPoint).slice(0, 12);
    if (points.length < 2) return NextResponse.json({ error: 'Se necesitan al menos dos paradas.' }, { status: 400 });

    const coordinates = points.map((point) => `${point.longitude},${point.latitude}`).join(';');
    const url = new URL(`https://router.project-osrm.org/route/v1/driving/${coordinates}`);
    url.searchParams.set('overview', 'full');
    url.searchParams.set('geometries', 'geojson');
    url.searchParams.set('steps', 'false');
    url.searchParams.set('continue_straight', 'false');

    try {
      const response = await fetch(url, {
        headers: { Accept: 'application/json', 'User-Agent': 'Atlas/1.0 personal-memory-map' },
        next: { revalidate: 60 * 60 * 24 * 14 },
      });
      if (!response.ok) throw new Error(`OSRM_${response.status}`);
      const payload = await response.json() as OsrmResponse;
      const route = payload.routes?.[0];
      const coordinates = route?.geometry?.coordinates ?? [];
      const routed = coordinates.flatMap((item) => Array.isArray(item) && Number.isFinite(item[0]) && Number.isFinite(item[1]) ? [{ latitude: item[1], longitude: item[0] }] : []);
      if (routed.length > 1) {
        return NextResponse.json({
          points: routed,
          provider: 'osrm',
          distanceKm: route?.distance ? Math.round(route.distance / 100) / 10 : undefined,
          durationMinutes: route?.duration ? Math.round(route.duration / 60) : undefined,
        }, { headers: { 'Cache-Control': 'public, s-maxage=1209600, stale-while-revalidate=604800' } });
      }
    } catch (error) {
      console.warn('Atlas road routing fallback:', error instanceof Error ? error.message : error);
    }

    return NextResponse.json({ points: curvedFallback(points), provider: 'curve' });
  } catch {
    return NextResponse.json({ error: 'No se pudo calcular la ruta.' }, { status: 400 });
  }
}

function validPoint(point: Point) {
  return point && Number.isFinite(point.latitude) && Number.isFinite(point.longitude) && point.latitude >= -90 && point.latitude <= 90 && point.longitude >= -180 && point.longitude <= 180;
}

function curvedFallback(points: Point[]) {
  return points.flatMap((point, index) => {
    if (index === points.length - 1) return index === 0 ? [point] : [];
    const next = points[index + 1];
    const dx = next.longitude - point.longitude;
    const dy = next.latitude - point.latitude;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const bend = Math.min(2.2, Math.max(0.12, distance * 0.11));
    const length = Math.sqrt(dx * dx + dy * dy) || 1;
    const normalX = -dy / length;
    const normalY = dx / length;
    const control = {
      latitude: (point.latitude + next.latitude) / 2 + normalY * bend,
      longitude: (point.longitude + next.longitude) / 2 + normalX * bend,
    };
    const segment: Point[] = [];
    for (let step = 0; step <= 18; step += 1) {
      const t = step / 18;
      const mt = 1 - t;
      segment.push({
        latitude: mt * mt * point.latitude + 2 * mt * t * control.latitude + t * t * next.latitude,
        longitude: mt * mt * point.longitude + 2 * mt * t * control.longitude + t * t * next.longitude,
      });
    }
    return segment;
  });
}

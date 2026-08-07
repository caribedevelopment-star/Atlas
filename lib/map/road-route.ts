'use client';

import type { MapCoordinate } from '@/types/map';

const cache = new Map<string, MapCoordinate[]>();

export async function getRoadRoute(points: MapCoordinate[], signal?: AbortSignal): Promise<MapCoordinate[]> {
  const clean = points.filter((point) => Number.isFinite(point.latitude) && Number.isFinite(point.longitude)).slice(0, 12);
  if (clean.length < 2) return clean;
  const key = clean.map((point) => `${point.latitude.toFixed(5)},${point.longitude.toFixed(5)}`).join('|');
  const cached = cache.get(key);
  if (cached) return cached;
  const response = await fetch('/api/route', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ points: clean }),
    signal,
  });
  if (!response.ok) return clean;
  const body = await response.json() as { points?: MapCoordinate[] };
  const route = (body.points ?? []).filter((point) => Number.isFinite(point.latitude) && Number.isFinite(point.longitude));
  if (route.length > 1) cache.set(key, route);
  return route.length > 1 ? route : clean;
}

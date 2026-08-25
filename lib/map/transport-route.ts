import type { MapCoordinate } from '@/types/map';
import type { TransportMode } from '@/types/trip';

export function buildTransportRoute(points: MapCoordinate[], mode: Exclude<TransportMode, 'car'>): MapCoordinate[] {
  if (points.length < 2) return points;
  if (mode === 'train') return interpolate(points, 22, 0);
  return interpolate(points, mode === 'plane' ? 52 : 30, mode === 'plane' ? .3 : .085);
}

function interpolate(points: MapCoordinate[], steps: number, bend: number): MapCoordinate[] {
  const route: MapCoordinate[] = [];
  for (let segment = 1; segment < points.length; segment += 1) {
    const start = points[segment - 1];
    const end = points[segment];
    const dLat = end.latitude - start.latitude;
    let dLng = end.longitude - start.longitude;
    if (dLng > 180) dLng -= 360;
    if (dLng < -180) dLng += 360;
    const length = Math.sqrt(dLat ** 2 + dLng ** 2) || 1;
    for (let index = segment === 1 ? 0 : 1; index <= steps; index += 1) {
      const progress = index / steps;
      const curve = Math.sin(Math.PI * progress) * length * bend * (segment % 2 ? 1 : -1);
      let longitude = start.longitude + dLng * progress + (dLat / length) * curve;
      if (longitude > 180) longitude -= 360;
      if (longitude < -180) longitude += 360;
      route.push({
        latitude: Math.max(-84, Math.min(84, start.latitude + dLat * progress - (dLng / length) * curve)),
        longitude,
      });
    }
  }
  return route;
}

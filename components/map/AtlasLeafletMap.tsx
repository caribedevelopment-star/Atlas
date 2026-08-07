'use client';

import { useEffect, useMemo, useState } from 'react';
import L from 'leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { Circle, CircleMarker, MapContainer, Marker, Polyline, Popup, TileLayer, Tooltip, useMap, ZoomControl } from 'react-leaflet';
import type { AtlasMapPoint, AtlasWineRegion, MapCoordinate, MapLayer, MapSource } from '@/types/map';
import { WineCard } from '@/components/wine-ui';
import { getRoadRoute } from '@/lib/map/road-route';
import { MapOwner } from './MapOwner';
import { MemoryPopup } from './MemoryPopup';
import { TripPopup } from './TripPopup';

export function AtlasLeafletMap({ points, wineRegions = [] }: { points: AtlasMapPoint[]; wineRegions?: AtlasWineRegion[] }) {
  const trips = points.filter((point) => point.trip && point.trip.points.length > 1);
  const markers = points.filter((point) => !point.trip);

  return <MapContainer center={[20, 0]} zoom={3} minZoom={2} scrollWheelZoom className="h-full w-full bg-[#d9d8d3]" zoomControl={false} preferCanvas={false}>
    <ZoomControl position="bottomright" />
    <TileLayer attribution='&copy; OpenStreetMap &copy; CARTO' url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
    <FitBounds points={points} />
    <CurrentLocation focus={points.length === 0} />

    {wineRegions.map((region) => <LivingWineRegion key={region.id} region={region} />)}

    <MarkerClusterGroup chunkedLoading chunkInterval={100} chunkDelay={20} removeOutsideVisibleBounds spiderfyOnMaxZoom>
      {markers.map((point) => <Marker key={point.id} position={[point.latitude, point.longitude]} icon={icon(point.layer, point.source)} title={point.title} keyboard>
        <Popup className="atlas-map-popup" maxWidth={340} minWidth={260}>
          {point.wine ? <div className="w-[300px] bg-zinc-950 p-2"><WineCard name={point.wine.name} winery={point.wine.winery} imageUrl={point.wine.image_url} vintage={point.wine.vintage} country={point.wine.country} region={point.wine.denomination ?? point.wine.region} grapes={point.wine.grapes} rating={point.wine.rating} price={point.wine.price} favorite={point.wine.favorite} visibility={point.wine.visibility} /><div className="px-2 pb-2"><MapOwner id={point.ownerId} name={point.ownerName} avatarUrl={point.ownerAvatarUrl} /></div></div> : point.memory ? <MemoryPopup memory={point.memory} /> : null}
        </Popup>
      </Marker>)}
    </MarkerClusterGroup>

    {trips.map((point) => <RoadTripRoute key={`route-${point.id}`} point={point} />)}
  </MapContainer>;
}

function RoadTripRoute({ point }: { point: AtlasMapPoint }) {
  const trip = point.trip!;
  const stops = useMemo(() => trip.stops.flatMap((stop) => validCoordinate(stop.latitude, stop.longitude) ? [{ latitude: stop.latitude!, longitude: stop.longitude! }] : []), [trip.stops]);
  const seed = stops.length > 1 ? stops : trip.points;
  const [route, setRoute] = useState<MapCoordinate[]>(trip.points);

  useEffect(() => {
    if (seed.length < 2) return;
    const controller = new AbortController();
    void getRoadRoute(seed, controller.signal).then((next) => { if (next.length > 1) setRoute(next); }).catch(() => undefined);
    return () => controller.abort();
  }, [seed]);

  const color = routeColor(point.ownerId ?? trip.userId, point.source);
  const positions = route.map((item) => [item.latitude, item.longitude] as [number, number]);

  return <>
    <Polyline positions={positions} interactive={false} pathOptions={{ color: '#0b0b0f', weight: 10, opacity: .14, lineCap: 'round', lineJoin: 'round' }} />
    <Polyline positions={positions} interactive={false} pathOptions={{ color, weight: 7, opacity: .18, lineCap: 'round', lineJoin: 'round', className: 'atlas-route-glow' }} />
    <Polyline positions={positions} pathOptions={{ color, weight: 4.2, opacity: .78, lineCap: 'round', lineJoin: 'round' }}><Popup className="atlas-map-popup"><TripPopup trip={trip} /></Popup></Polyline>
    <Polyline positions={positions} interactive={false} pathOptions={{ color: '#ffffff', weight: 1.8, opacity: .88, dashArray: '1 14', lineCap: 'round', lineJoin: 'round', className: 'atlas-route-flow' }} />
    {stops.map((item, index) => <CircleMarker key={`${trip.id}-stop-${index}`} center={[item.latitude, item.longitude]} radius={6.5} pathOptions={{ color: '#fff', fillColor: color, fillOpacity: 1, weight: 2.5, className: 'atlas-route-stop' }}><Tooltip direction="top">{trip.stops[index]?.title ?? `Parada ${index + 1}`}</Tooltip></CircleMarker>)}
  </>;
}

function LivingWineRegion({ region }: { region: AtlasWineRegion }) {
  const color = wineRegionColor(region.name);
  const intensity = Math.min(.13, .045 + region.wineCount * .012);
  return <>
    <Circle center={[region.latitude, region.longitude]} radius={region.radius} interactive={false} pathOptions={{ color, fillColor: color, fillOpacity: intensity, opacity: .22, weight: 1, className: 'atlas-do-region' }} />
    <Circle center={[region.latitude, region.longitude]} radius={Math.round(region.radius * 1.08)} pathOptions={{ color, fillColor: color, fillOpacity: .015, opacity: .42, weight: 1.6, dashArray: '2 11', className: 'atlas-do-pulse' }}>
      <Tooltip direction="top" sticky opacity={.96}><div className="min-w-[150px] py-1"><strong>{region.name}</strong><br /><span>{region.country}</span><br /><span>{region.wineCount} {region.wineCount === 1 ? 'vino' : 'vinos'} · {region.wineryCount} {region.wineryCount === 1 ? 'bodega' : 'bodegas'}</span>{region.averageRating ? <><br /><span>★ {region.averageRating}/5</span></> : null}</div></Tooltip>
    </Circle>
    <Circle center={[region.latitude, region.longitude]} radius={Math.round(region.radius * .72)} interactive={false} pathOptions={{ color, fillColor: color, fillOpacity: .006, opacity: .18, weight: .8, dashArray: '1 18', className: 'atlas-do-orbit' }} />
    <CircleMarker center={[region.latitude, region.longitude]} radius={4 + Math.min(4, region.wineCount * .65)} pathOptions={{ color: '#fff', fillColor: color, fillOpacity: .94, weight: 2, className: 'atlas-do-core' }}><Tooltip direction="top">{region.name}</Tooltip></CircleMarker>
  </>;
}

function FitBounds({ points }: { points: AtlasMapPoint[] }) {
  const map = useMap();
  useEffect(() => {
    const resize = new ResizeObserver(() => map.invalidateSize({ animate: false }));
    resize.observe(map.getContainer()); map.invalidateSize({ animate: false });
    if (points.length) { const coordinates = points.flatMap((point) => point.trip?.points.map((item) => [item.latitude, item.longitude] as [number, number]) ?? [[point.latitude, point.longitude] as [number, number]]); map.fitBounds(L.latLngBounds(coordinates), { padding: [54, 54], maxZoom: 13, animate: points.length < 300 }); }
    return () => resize.disconnect();
  }, [map, points]);
  return null;
}

function CurrentLocation({ focus }: { focus: boolean }) {
  const map = useMap(), [position, setPosition] = useState<[number, number] | null>(null), [label, setLabel] = useState('Tu ubicación actual');
  useEffect(() => {
    if (!navigator.geolocation) return;
    const watch = navigator.geolocation.watchPosition(({ coords }) => { const next: [number, number] = [coords.latitude, coords.longitude]; setPosition(next); if (focus) map.setView(next, 13, { animate: true }); fetch(`/api/geocode?lat=${coords.latitude}&lon=${coords.longitude}`).then((response) => response.ok ? response.json() : null).then((data) => data?.label && setLabel(data.label)).catch(() => undefined); }, () => undefined, { enableHighAccuracy: true, maximumAge: 30000, timeout: 10000 });
    return () => navigator.geolocation.clearWatch(watch);
  }, [focus, map]);
  return position ? <><Circle center={position} radius={170} pathOptions={{ color: '#0A84FF', fillColor: '#0A84FF', fillOpacity: .035, weight: 1, className: 'atlas-location-pulse' }} /><Circle center={position} radius={75} pathOptions={{ color: '#0A84FF', fillColor: '#0A84FF', fillOpacity: .06, weight: 1 }} /><CircleMarker center={position} radius={8} pathOptions={{ color: '#fff', fillColor: '#0A84FF', fillOpacity: 1, weight: 3, className: 'atlas-location-core' }}><Tooltip direction="top" offset={[0, -8]}>{label}</Tooltip></CircleMarker></> : null;
}

function validCoordinate(latitude?: number, longitude?: number) { return latitude !== undefined && longitude !== undefined && Number.isFinite(latitude) && Number.isFinite(longitude) && latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180; }

function routeColor(ownerId: string, source: AtlasMapPoint['source']) {
  if (source === 'mine') return '#0A84FF';
  const palette = source === 'shared' ? ['#64D2FF', '#BF5AF2', '#30D158', '#FF9F0A', '#FF375F'] : ['#5E5CE6', '#32ADE6', '#AC8E68', '#8E8E93'];
  let hash = 0; for (let index = 0; index < ownerId.length; index += 1) hash = ((hash << 5) - hash + ownerId.charCodeAt(index)) | 0;
  return palette[Math.abs(hash) % palette.length];
}

function wineRegionColor(name: string) { const palette = ['#9F1239', '#7C3AED', '#B45309', '#0F766E', '#BE123C', '#6D28D9', '#A16207']; let hash = 0; for (let index = 0; index < name.length; index += 1) hash = ((hash << 5) - hash + name.charCodeAt(index)) | 0; return palette[Math.abs(hash) % palette.length]; }

const cache = new Map<string, L.DivIcon>();
function icon(layer: MapLayer, source: MapSource) {
  const key = `${layer}-${source}`; const existing = cache.get(key); if (existing) return existing;
  const colors: Record<MapLayer, string> = { memories: source === 'shared' ? '#64D2FF' : '#ff375f', wines: '#7c2d12', trips: '#007aff', favorites: '#ff9f0a', restaurants: '#30d158' };
  const size = layer === 'wines' ? 18 : 28;
  const value = L.divIcon({ className: `atlas-map-marker atlas-map-marker-${layer} atlas-map-source-${source}`, html: `<span style="background:${colors[layer]};width:${size}px;height:${size}px"></span><i style="width:${size + 10}px;height:${size + 10}px"></i>`, iconSize: [size, size], iconAnchor: [size / 2, size / 2], popupAnchor: [0, -size / 2] });
  cache.set(key, value); return value;
}

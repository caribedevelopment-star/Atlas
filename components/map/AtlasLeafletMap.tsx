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

const WORLD_BOUNDS: L.LatLngBoundsExpression = [[-84, -180], [84, 180]];

export function AtlasLeafletMap({ points, tripPoints = [], wineRegions = [] }: { points: AtlasMapPoint[]; tripPoints?: AtlasMapPoint[]; wineRegions?: AtlasWineRegion[] }) {
  const visibleTripAnchors = points.filter((point) => point.trip && point.trip.points.length > 1);
  const markers = points.filter((point) => !point.trip);
  const [activeTripId, setActiveTripId] = useState<string | null>(null);
  const activeTripPoint = useMemo(() => tripPoints.find((point) => point.trip?.id === activeTripId), [activeTripId, tripPoints]);

  useEffect(() => {
    if (activeTripId && !tripPoints.some((point) => point.trip?.id === activeTripId)) setActiveTripId(null);
  }, [activeTripId, tripPoints]);

  const activateMemoryRoute = (point: AtlasMapPoint) => {
    if (!point.memory) return;
    const match = findTripForMemory(point, tripPoints);
    setActiveTripId(match?.trip?.id ?? null);
  };

  return <MapContainer center={[20, 0]} zoom={3} minZoom={2} maxZoom={18} maxBounds={WORLD_BOUNDS} maxBoundsViscosity={1} worldCopyJump={false} scrollWheelZoom className="h-full w-full bg-[#d9d8d3]" zoomControl={false} preferCanvas={false}>
    <ZoomControl position="bottomright" />
    <TileLayer noWrap bounds={WORLD_BOUNDS} attribution='&copy; OpenStreetMap &copy; CARTO' url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
    <FitBounds points={markers.length ? markers : visibleTripAnchors} />
    <ActiveTripFocus point={activeTripPoint} />
    <CurrentLocation focus={points.length === 0} />

    {wineRegions.map((region) => <LivingWineRegion key={region.id} region={region} />)}

    <MarkerClusterGroup chunkedLoading chunkInterval={100} chunkDelay={20} removeOutsideVisibleBounds spiderfyOnMaxZoom showCoverageOnHover={false} maxClusterRadius={52} iconCreateFunction={(cluster: { getChildCount: () => number }) => clusterIcon(cluster.getChildCount())}>
      {markers.map((point) => <Marker key={point.id} position={[point.latitude, point.longitude]} icon={icon(point.layer, point.source)} title={point.title} keyboard eventHandlers={{ click: () => activateMemoryRoute(point) }}>
        <Popup className="atlas-map-popup" maxWidth={340} minWidth={260}>
          {point.wine ? <div className="w-[300px] bg-zinc-950 p-2"><WineCard name={point.wine.name} winery={point.wine.winery} imageUrl={point.wine.image_url} vintage={point.wine.vintage} country={point.wine.country} region={point.wine.denomination ?? point.wine.region} grapes={point.wine.grapes} rating={point.wine.rating} price={point.wine.price} favorite={point.wine.favorite} visibility={point.wine.visibility} /><div className="px-2 pb-2"><MapOwner id={point.ownerId} name={point.ownerName} avatarUrl={point.ownerAvatarUrl} /></div></div> : point.memory ? <MemoryPopup memory={point.memory} routeAwake={Boolean(findTripForMemory(point, tripPoints))} /> : null}
        </Popup>
      </Marker>)}
    </MarkerClusterGroup>

    {visibleTripAnchors.map((point) => <Marker key={`trip-anchor-${point.id}`} position={[point.latitude, point.longitude]} icon={tripAnchorIcon(point.trip!.transportMode, point.source)} title={point.title} eventHandlers={{ click: () => setActiveTripId(point.trip!.id) }}>
      <Tooltip direction="top" offset={[0, -11]}>{point.trip!.transportMode === 'flight' ? 'Vuelo' : 'Roadtrip'} · {point.title}</Tooltip>
      <Popup className="atlas-map-popup"><TripPopup trip={point.trip!} /></Popup>
    </Marker>)}

    {activeTripPoint && <TripRoute point={activeTripPoint} />}
  </MapContainer>;
}

function TripRoute({ point }: { point: AtlasMapPoint }) {
  return point.trip?.transportMode === 'flight' ? <FlightTripRoute point={point} /> : <RoadTripRoute point={point} />;
}

function RoadTripRoute({ point }: { point: AtlasMapPoint }) {
  const trip = point.trip!;
  const stops = useMemo(() => trip.stops.flatMap((stop) => validCoordinate(stop.latitude, stop.longitude) ? [{ latitude: stop.latitude!, longitude: stop.longitude! }] : []), [trip.stops]);
  const seed = stops.length > 1 ? stops : trip.points;
  const [route, setRoute] = useState<MapCoordinate[]>(trip.points);

  useEffect(() => {
    setRoute(trip.points);
    if (seed.length < 2) return;
    const controller = new AbortController();
    void getRoadRoute(seed, controller.signal).then((next) => { if (next.length > 1) setRoute(next); }).catch(() => undefined);
    return () => controller.abort();
  }, [seed, trip.points]);

  const color = routeColor(point.ownerId ?? trip.userId, point.source);
  const positions = route.map((item) => [item.latitude, item.longitude] as [number, number]);

  return <>
    <Polyline positions={positions} interactive={false} pathOptions={{ color: '#0b0b0f', weight: 11, opacity: .12, lineCap: 'round', lineJoin: 'round' }} />
    <Polyline positions={positions} interactive={false} pathOptions={{ color, weight: 8, opacity: .18, lineCap: 'round', lineJoin: 'round', className: 'atlas-route-glow' }} />
    <Polyline positions={positions} pathOptions={{ color, weight: 4, opacity: .76, lineCap: 'round', lineJoin: 'round', className: 'atlas-route-main' }}><Popup className="atlas-map-popup"><TripPopup trip={trip} /></Popup></Polyline>
    <Polyline positions={positions} interactive={false} pathOptions={{ color: '#ffffff', weight: 1.8, opacity: .9, dashArray: '1 16', lineCap: 'round', lineJoin: 'round', className: 'atlas-route-flow' }} />
    <AnimatedRouteBeacon route={route} color={color} />
    {stops.map((item, index) => <RouteStop key={`${trip.id}-stop-${index}`} item={item} color={color} label={trip.stops[index]?.title ?? `Parada ${index + 1}`} index={index} />)}
  </>;
}

function FlightTripRoute({ point }: { point: AtlasMapPoint }) {
  const trip = point.trip!;
  const stops = useMemo(() => trip.stops.flatMap((stop) => validCoordinate(stop.latitude, stop.longitude) ? [{ latitude: stop.latitude!, longitude: stop.longitude! }] : []), [trip.stops]);
  const seed = stops.length > 1 ? stops : trip.points;
  const route = useMemo(() => buildFlightPath(seed), [seed]);
  const color = routeColor(point.ownerId ?? trip.userId, point.source);
  const positions = route.map((item) => [item.latitude, item.longitude] as [number, number]);

  return <>
    <Polyline positions={positions} interactive={false} pathOptions={{ color: '#03040a', weight: 13, opacity: .1, lineCap: 'round', lineJoin: 'round' }} />
    <Polyline positions={positions} interactive={false} pathOptions={{ color, weight: 9, opacity: .17, lineCap: 'round', lineJoin: 'round', className: 'atlas-flight-glow' }} />
    <Polyline positions={positions} pathOptions={{ color, weight: 2.8, opacity: .92, dashArray: '8 13', lineCap: 'round', lineJoin: 'round', className: 'atlas-flight-route' }}><Popup className="atlas-map-popup"><TripPopup trip={trip} /></Popup></Polyline>
    <Polyline positions={positions} interactive={false} pathOptions={{ color: '#ffffff', weight: 1.1, opacity: .7, dashArray: '1 28', lineCap: 'round', lineJoin: 'round', className: 'atlas-flight-stardust' }} />
    <AnimatedFlightBeacon route={route} color={color} />
    {stops.map((item, index) => <FlightStop key={`${trip.id}-flight-stop-${index}`} item={item} color={color} label={trip.stops[index]?.title ?? `Destino ${index + 1}`} index={index} />)}
  </>;
}

function AnimatedRouteBeacon({ route, color }: { route: MapCoordinate[]; color: string }) {
  const [cursor, setCursor] = useState(0);
  useEffect(() => {
    setCursor(0);
    if (route.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const step = Math.max(1, Math.floor(route.length / 140));
    const timer = window.setInterval(() => setCursor((value) => (value + step) % route.length), 120);
    return () => window.clearInterval(timer);
  }, [route]);
  const point = route[Math.min(cursor, route.length - 1)];
  if (!point) return null;
  return <><CircleMarker center={[point.latitude, point.longitude]} radius={9} interactive={false} pathOptions={{ color, fillColor: color, fillOpacity: .08, weight: 1, opacity: .18, className: 'atlas-route-beacon-halo' }} /><CircleMarker center={[point.latitude, point.longitude]} radius={3.6} interactive={false} pathOptions={{ color: '#fff', fillColor: color, fillOpacity: 1, weight: 1.4, className: 'atlas-route-beacon' }} /></>;
}

function AnimatedFlightBeacon({ route, color }: { route: MapCoordinate[]; color: string }) {
  const [cursor, setCursor] = useState(0);
  useEffect(() => {
    setCursor(0);
    if (route.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const step = Math.max(1, Math.floor(route.length / 180));
    const timer = window.setInterval(() => setCursor((value) => (value + step) % route.length), 85);
    return () => window.clearInterval(timer);
  }, [route]);
  const point = route[Math.min(cursor, route.length - 1)];
  const next = route[(cursor + 1) % route.length] ?? point;
  if (!point) return null;
  const angle = Math.atan2(next.longitude - point.longitude, next.latitude - point.latitude) * 180 / Math.PI;
  return <Marker position={[point.latitude, point.longitude]} interactive={false} icon={flightBeaconIcon(color, angle)} />;
}

function RouteStop({ item, color, label, index }: { item: MapCoordinate; color: string; label: string; index: number }) {
  return <><CircleMarker center={[item.latitude, item.longitude]} radius={11} interactive={false} pathOptions={{ color, fillColor: color, fillOpacity: .035, opacity: .14, weight: 1, className: 'atlas-route-stop-wave' }} /><CircleMarker center={[item.latitude, item.longitude]} radius={6.5} pathOptions={{ color: '#fff', fillColor: color, fillOpacity: 1, weight: 2.5, className: 'atlas-route-stop' }}><Tooltip direction="top">{index + 1}. {label}</Tooltip></CircleMarker></>;
}

function FlightStop({ item, color, label, index }: { item: MapCoordinate; color: string; label: string; index: number }) {
  return <><CircleMarker center={[item.latitude, item.longitude]} radius={15} interactive={false} pathOptions={{ color, fillColor: color, fillOpacity: .015, opacity: .12, weight: 1, className: 'atlas-flight-stop-wave' }} /><CircleMarker center={[item.latitude, item.longitude]} radius={5.5} pathOptions={{ color: '#fff', fillColor: color, fillOpacity: 1, weight: 2.2, className: 'atlas-flight-stop' }}><Tooltip direction="top">{index + 1}. {label}</Tooltip></CircleMarker></>;
}

function LivingWineRegion({ region }: { region: AtlasWineRegion }) {
  const color = wineRegionColor(region.name);
  const active = region.wineCount > 0;
  const intensity = active ? Math.min(.13, .045 + region.wineCount * .011) : .016;
  const orbitOpacity = active ? .4 : .18;
  return <>
    <Circle center={[region.latitude, region.longitude]} radius={Math.round(region.radius * 1.28)} interactive={false} pathOptions={{ color, fillColor: color, fillOpacity: .002, opacity: orbitOpacity * .45, weight: .7, dashArray: '1 26', className: 'atlas-do-orbit atlas-do-orbit-wide' }} />
    <Circle center={[region.latitude, region.longitude]} radius={region.radius} interactive={false} pathOptions={{ color, fillColor: color, fillOpacity: intensity, opacity: active ? .26 : .14, weight: 1.1, className: 'atlas-do-region atlas-do-breathe' }} />
    <Circle center={[region.latitude, region.longitude]} radius={Math.round(region.radius * 1.08)} pathOptions={{ color, fillColor: color, fillOpacity: .012, opacity: orbitOpacity, weight: 1.5, dashArray: active ? '2 12' : '1 18', className: 'atlas-do-pulse' }} eventHandlers={{ mouseover: (event) => event.target.bringToFront() }}>
      <Tooltip direction="top" sticky opacity={.98}><div className="max-w-[245px] py-1"><strong>{region.name}</strong><br /><span>{region.country} · {region.signature}</span><br /><span>{region.grapes.slice(0, 3).join(' · ')}</span>{region.wineCount ? <><br /><span>{region.wineCount} {region.wineCount === 1 ? 'vino' : 'vinos'} · {region.wineryCount} {region.wineryCount === 1 ? 'bodega' : 'bodegas'}{region.averageRating ? ` · ★ ${region.averageRating}` : ''}</span></> : <><br /><span>Región por explorar</span></>}</div></Tooltip>
      <Popup className="atlas-map-popup" maxWidth={330}><article className="w-[285px] bg-zinc-950 p-4 text-zinc-100"><div className="text-[10px] font-semibold uppercase tracking-[.18em] text-rose-300">Denominación viva · {region.country}</div><h3 className="mt-2 text-lg font-semibold text-white">{region.name}</h3><p className="mt-2 text-xs leading-5 text-zinc-400">{region.description}</p><div className="mt-3 rounded-xl border border-white/10 bg-white/[.04] p-3"><div className="text-[10px] uppercase tracking-[.15em] text-zinc-600">Firma</div><div className="mt-1 text-xs font-medium text-rose-200">{region.signature}</div><div className="mt-2 text-[11px] text-zinc-500">{region.grapes.join(' · ')}</div></div>{region.wineCount > 0 && <p className="mt-3 text-[11px] text-zinc-500">En tu Atlas: {region.wineCount} vinos · {region.wineryCount} bodegas{region.favoriteCount ? ` · ${region.favoriteCount} favoritos` : ''}</p>}</article></Popup>
    </Circle>
    <Circle center={[region.latitude, region.longitude]} radius={Math.round(region.radius * .72)} interactive={false} pathOptions={{ color, fillColor: color, fillOpacity: .004, opacity: active ? .22 : .1, weight: .9, dashArray: '1 17', className: 'atlas-do-orbit atlas-do-orbit-inner' }} />
    <Circle center={[region.latitude, region.longitude]} radius={Math.round(region.radius * .4)} interactive={false} pathOptions={{ color, fillColor: color, fillOpacity: active ? .018 : .007, opacity: active ? .18 : .09, weight: .8, className: 'atlas-do-heart' }} />
    <CircleMarker center={[region.latitude, region.longitude]} radius={(active ? 4.5 : 3.2) + Math.min(4.5, region.wineCount * .62)} pathOptions={{ color: '#fff', fillColor: color, fillOpacity: active ? .96 : .74, weight: 2, className: 'atlas-do-core' }}><Tooltip direction="top">{region.name}</Tooltip></CircleMarker>
    <CircleMarker center={[region.latitude, region.longitude]} radius={13 + Math.min(6, region.wineCount)} interactive={false} pathOptions={{ color, fillColor: color, fillOpacity: 0, opacity: active ? .08 : .04, weight: 1, className: 'atlas-do-core-halo' }} />
  </>;
}

function FitBounds({ points }: { points: AtlasMapPoint[] }) {
  const map = useMap();
  useEffect(() => {
    const resize = new ResizeObserver(() => map.invalidateSize({ animate: false }));
    resize.observe(map.getContainer()); map.invalidateSize({ animate: false });
    if (points.length) {
      const coordinates = points.map((point) => [point.latitude, point.longitude] as [number, number]);
      map.fitBounds(L.latLngBounds(coordinates), { padding: [54, 54], maxZoom: 13, animate: points.length < 300 });
    }
    return () => resize.disconnect();
  }, [map, points]);
  return null;
}

function ActiveTripFocus({ point }: { point?: AtlasMapPoint }) {
  const map = useMap();
  useEffect(() => {
    if (!point?.trip || point.trip.points.length < 2) return;
    const bounds = L.latLngBounds(point.trip.points.map((item) => [item.latitude, item.longitude] as [number, number]));
    map.fitBounds(bounds, { paddingTopLeft: [50, 90], paddingBottomRight: [50, 130], maxZoom: point.trip.transportMode === 'flight' ? 7 : 11, animate: true });
  }, [map, point]);
  return null;
}

function CurrentLocation({ focus }: { focus: boolean }) {
  const map = useMap(), [position, setPosition] = useState<[number, number] | null>(null), [label, setLabel] = useState('Tu ubicación actual');
  useEffect(() => {
    if (!navigator.geolocation) return;
    const watch = navigator.geolocation.watchPosition(({ coords }) => {
      const next: [number, number] = [coords.latitude, coords.longitude];
      setPosition(next);
      if (focus) map.setView(next, 13, { animate: true });
      fetch(`/api/geocode?lat=${coords.latitude}&lon=${coords.longitude}`).then((response) => response.ok ? response.json() : null).then((data) => data?.label && setLabel(data.label)).catch(() => undefined);
    }, () => undefined, { enableHighAccuracy: true, maximumAge: 30000, timeout: 10000 });
    return () => navigator.geolocation.clearWatch(watch);
  }, [focus, map]);
  return position ? <><Circle center={position} radius={170} pathOptions={{ color: '#0A84FF', fillColor: '#0A84FF', fillOpacity: .035, weight: 1, className: 'atlas-location-pulse' }} /><Circle center={position} radius={75} pathOptions={{ color: '#0A84FF', fillColor: '#0A84FF', fillOpacity: .06, weight: 1 }} /><CircleMarker center={position} radius={8} pathOptions={{ color: '#fff', fillColor: '#0A84FF', fillOpacity: 1, weight: 3, className: 'atlas-location-core' }}><Tooltip direction="top" offset={[0, -8]}>{label}</Tooltip></CircleMarker></> : null;
}

function findTripForMemory(point: AtlasMapPoint, trips: AtlasMapPoint[]) {
  const memory = point.memory;
  if (!memory) return undefined;
  const explicit = trips.find((tripPoint) => tripPoint.trip && (memory.tripId === tripPoint.trip.id || tripPoint.trip.stops.some((stop) => stop.memoryId === memory.id || stop.memory?.id === memory.id)));
  if (explicit) return explicit;
  const memoryDate = parseDate(memory.date ?? memory.createdAt);
  return trips
    .flatMap((tripPoint) => {
      const trip = tripPoint.trip;
      if (!trip) return [];
      if (memoryDate) {
        const start = parseDate(trip.startDate), end = parseDate(trip.endDate);
        if (start && end && (memoryDate < start - 86400000 * 2 || memoryDate > end + 86400000 * 2)) return [];
      }
      const nearby = trip.stops
        .filter((stop) => validCoordinate(stop.latitude, stop.longitude))
        .map((stop) => distanceKm({ latitude: point.latitude, longitude: point.longitude }, { latitude: stop.latitude!, longitude: stop.longitude! }))
        .sort((a, b) => a - b)[0];
      const samePlace = trip.stops.some((stop) => Boolean(memory.city && stop.city && normalize(memory.city) === normalize(stop.city)) || Boolean(memory.country && stop.country && normalize(memory.country) === normalize(stop.country)));
      if (nearby === undefined || (nearby > 35 && !samePlace)) return [];
      return [{ tripPoint, score: nearby + (samePlace ? 0 : 25) }];
    })
    .sort((a, b) => a.score - b.score)[0]?.tripPoint;
}

function buildFlightPath(points: MapCoordinate[]) {
  if (points.length < 2) return points;
  const result: MapCoordinate[] = [];
  for (let index = 1; index < points.length; index += 1) {
    const start = points[index - 1], end = points[index];
    let deltaLng = end.longitude - start.longitude;
    if (deltaLng > 180) deltaLng -= 360;
    if (deltaLng < -180) deltaLng += 360;
    const distance = distanceKm(start, end);
    const lift = Math.min(17, Math.max(2.2, distance / 650));
    const steps = Math.max(36, Math.min(120, Math.round(distance / 35)));
    for (let step = 0; step <= steps; step += 1) {
      if (index > 1 && step === 0) continue;
      const t = step / steps;
      const longitudeRaw = start.longitude + deltaLng * t;
      const longitude = longitudeRaw > 180 ? longitudeRaw - 360 : longitudeRaw < -180 ? longitudeRaw + 360 : longitudeRaw;
      const latitude = start.latitude + (end.latitude - start.latitude) * t + Math.sin(Math.PI * t) * lift;
      result.push({ latitude: Math.max(-84, Math.min(84, latitude)), longitude });
    }
  }
  return result;
}

function parseDate(value?: string) { if (!value) return undefined; const date = new Date(value).getTime(); return Number.isNaN(date) ? undefined : date; }
function normalize(value: string) { return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim(); }
function validCoordinate(latitude?: number, longitude?: number) { return latitude !== undefined && longitude !== undefined && Number.isFinite(latitude) && Number.isFinite(longitude) && latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180; }
function distanceKm(a: MapCoordinate, b: MapCoordinate) { const rad=(value:number)=>value*Math.PI/180,dLat=rad(b.latitude-a.latitude),dLng=rad(b.longitude-a.longitude),x=Math.sin(dLat/2)**2+Math.cos(rad(a.latitude))*Math.cos(rad(b.latitude))*Math.sin(dLng/2)**2; return 6371*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x)); }

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
  const size = layer === 'wines' ? 18 : layer === 'restaurants' ? 25 : 28;
  const symbol = layer === 'restaurants' ? '<b style="font:700 9px/1 system-ui;color:white;letter-spacing:-.05em">R</b>' : '';
  const value = L.divIcon({ className: `atlas-map-marker atlas-map-marker-${layer} atlas-map-source-${source}`, html: `<span style="background:${colors[layer]};width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center">${symbol}</span><i style="width:${size + 10}px;height:${size + 10}px"></i>`, iconSize: [size, size], iconAnchor: [size / 2, size / 2], popupAnchor: [0, -size / 2] });
  cache.set(key, value); return value;
}

function tripAnchorIcon(mode: 'roadtrip' | 'flight', source: MapSource) {
  const key = `trip-${mode}-${source}`; const existing = cache.get(key); if (existing) return existing;
  const color = source === 'mine' ? '#0A84FF' : '#64D2FF';
  const symbol = mode === 'flight' ? '✈' : '↝';
  const value = L.divIcon({ className: `atlas-trip-anchor atlas-trip-anchor-${mode}`, html: `<span style="--atlas-trip-color:${color}">${symbol}</span><i></i>`, iconSize: [38, 38], iconAnchor: [19, 19], popupAnchor: [0, -18] });
  cache.set(key, value); return value;
}

function flightBeaconIcon(color: string, angle: number) {
  return L.divIcon({ className: 'atlas-flight-beacon-icon', html: `<span style="color:${color};transform:rotate(${angle}deg)">✈</span><i style="background:${color}"></i>`, iconSize: [32, 32], iconAnchor: [16, 16] });
}

function clusterIcon(count: number) {
  const size = count > 30 ? 52 : count > 10 ? 46 : 40;
  return L.divIcon({ className: 'atlas-map-cluster', html: `<span style="width:${size}px;height:${size}px"><b>${count}</b><i></i></span>`, iconSize: [size, size], iconAnchor: [size / 2, size / 2] });
}

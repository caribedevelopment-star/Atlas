'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import { LocateFixed } from 'lucide-react';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { Circle, CircleMarker, MapContainer, Marker, Polyline, Popup, TileLayer, Tooltip, useMap, useMapEvents, ZoomControl } from 'react-leaflet';
import type { AtlasMapPoint, AtlasWineRegion, MapCoordinate, MapLayer, MapSource } from '@/types/map';
import { WineCard } from '@/components/wine-ui';
import { getRoadRoute } from '@/lib/map/road-route';
import { buildTransportRoute } from '@/lib/map/transport-route';
import { transportMeta } from '@/lib/trips/transport';
import type { TransportMode } from '@/types/trip';
import { MapOwner } from './MapOwner';
import { MemoryPopup } from './MemoryPopup';
import { TripPopup } from './TripPopup';

const WORLD_BOUNDS: L.LatLngBoundsExpression = [[-84, -180], [84, 180]];

export function AtlasLeafletMap({ points, wineRegions = [], focusPointId }: { points: AtlasMapPoint[]; wineRegions?: AtlasWineRegion[]; focusPointId?: string }) {
  const trips = points.filter((point) => point.trip && point.trip.points.length > 1);
  const markers = points.filter((point) => !point.trip);

  return <MapContainer center={[20, 0]} zoom={3} minZoom={2} maxZoom={18} maxBounds={WORLD_BOUNDS} maxBoundsViscosity={1} worldCopyJump={false} scrollWheelZoom className="h-full w-full bg-[#d9d8d3]" zoomControl={false} preferCanvas={false}>
    <ZoomControl position="bottomleft" />
    <TileLayer noWrap bounds={WORLD_BOUNDS} attribution='&copy; OpenStreetMap &copy; CARTO' url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
    <FitBounds points={points} focusPointId={focusPointId} />
    <CurrentLocation />

    <WineRegionsLayer regions={wineRegions} />

    <MarkerClusterGroup chunkedLoading chunkInterval={100} chunkDelay={20} removeOutsideVisibleBounds spiderfyOnMaxZoom showCoverageOnHover={false} maxClusterRadius={52} iconCreateFunction={(cluster: { getChildCount: () => number }) => clusterIcon(cluster.getChildCount())}>
      {markers.map((point) => <Marker key={point.id} position={[point.latitude, point.longitude]} icon={icon(point.layer, point.source, point.id === focusPointId)} title={point.title} keyboard>
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
  const mode = trip.transportMode;

  useEffect(() => {
    if (seed.length < 2) return;
    if (mode !== 'car') {
      setRoute(buildTransportRoute(seed, mode));
      return;
    }
    if (process.env.NEXT_PUBLIC_ATLAS_DEMO === 'true') {
      setRoute(seed);
      return;
    }
    const controller = new AbortController();
    void getRoadRoute(seed, controller.signal).then((next) => { if (next.length > 1) setRoute(next); }).catch(() => undefined);
    return () => controller.abort();
  }, [mode, seed]);

  const color = transportMeta[mode].color;
  const positions = route.map((item) => [item.latitude, item.longitude] as [number, number]);
  const visual = routeVisual(mode);

  return <>
    <Polyline positions={positions} interactive={false} pathOptions={{ color: '#0b0b0f', weight: mode === 'plane' ? 9 : 12, opacity: .14, lineCap: 'round', lineJoin: 'round' }} />
    <Polyline positions={positions} interactive={false} pathOptions={{ color, weight: visual.glowWeight, opacity: .18, lineCap: 'round', lineJoin: 'round', className: `atlas-route-glow atlas-route-${mode}-glow` }} />
    {mode === 'car' && <Polyline positions={positions} interactive={false} pathOptions={{ color: '#ffffff', weight: 8, opacity: .96, lineCap: 'round', lineJoin: 'round', className: 'atlas-route-car-casing' }} />}
    {mode === 'train' && <><Polyline positions={positions} interactive={false} pathOptions={{ color: '#17211c', weight: 8.5, opacity: .94, lineCap: 'butt', lineJoin: 'round' }} /><Polyline positions={positions} interactive={false} pathOptions={{ color: '#d1d5db', weight: 5.2, opacity: .92, lineCap: 'butt', lineJoin: 'round' }} /></>}
    {mode === 'boat' && <Polyline positions={positions} interactive={false} pathOptions={{ color: '#bae6fd', weight: 13, opacity: .22, dashArray: '1 10', lineCap: 'round', lineJoin: 'round', className: 'atlas-route-boat-wake' }} />}
    <Polyline positions={positions} pathOptions={{ color, weight: visual.weight, opacity: .84, dashArray: visual.mainDash, lineCap: visual.lineCap, lineJoin: 'round', className: `atlas-route-main atlas-route-${mode}` }}><Popup className="atlas-map-popup"><TripPopup trip={trip} /></Popup></Polyline>
    {mode === 'train' && <Polyline positions={positions} interactive={false} pathOptions={{ color: '#07130c', weight: 7.2, opacity: .92, dashArray: '1 9', lineCap: 'butt', lineJoin: 'round', className: 'atlas-route-train-sleepers' }} />}
    <Polyline positions={positions} interactive={false} pathOptions={{ color: visual.flowColor, weight: visual.flowWeight, opacity: .92, dashArray: visual.flowDash, lineCap: visual.lineCap, lineJoin: 'round', className: `atlas-route-flow atlas-route-${mode}-flow` }} />
    <AnimatedRouteBeacon route={route} color={color} mode={mode} />
    {stops.map((item, index) => <RouteStop key={`${trip.id}-stop-${index}`} item={item} color={color} label={trip.stops[index]?.title ?? `Parada ${index + 1}`} index={index} />)}
  </>;
}

function AnimatedRouteBeacon({ route, color, mode }: { route: MapCoordinate[]; color: string; mode: TransportMode }) {
  const haloRef = useRef<L.CircleMarker | null>(null);
  const coreRef = useRef<L.CircleMarker | null>(null);
  const startedAt = useRef<number | null>(null);
  const lastPaint = useRef(0);
  useEffect(() => {
    if (route.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const path = measuredRoute(route);
    const duration = mode === 'plane' ? 11500 : mode === 'train' ? 15500 : mode === 'boat' ? 22000 : 18000;
    let frame = 0;
    startedAt.current = null;
    const tick = (time: number) => {
      if (startedAt.current === null) startedAt.current = time;
      if (time - lastPaint.current >= 48) {
        const next = pointAlongRoute(path, ((time - startedAt.current) % duration) / duration);
        haloRef.current?.setLatLng([next.latitude, next.longitude]);
        coreRef.current?.setLatLng([next.latitude, next.longitude]);
        lastPaint.current = time;
      }
      frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [mode, route]);
  const point = route[0];
  if (!point) return null;
  return <><CircleMarker ref={haloRef} center={[point.latitude, point.longitude]} radius={mode === 'plane' ? 12 : 9} interactive={false} pathOptions={{ color, fillColor: color, fillOpacity: .08, weight: 1, opacity: .18, className: `atlas-route-beacon-halo atlas-route-${mode}-beacon` }} /><CircleMarker ref={coreRef} center={[point.latitude, point.longitude]} radius={mode === 'boat' ? 4.2 : 3.6} interactive={false} pathOptions={{ color: '#fff', fillColor: color, fillOpacity: 1, weight: 1.4, className: `atlas-route-beacon atlas-route-${mode}-beacon` }} /></>;
}

function RouteStop({ item, color, label, index }: { item: MapCoordinate; color: string; label: string; index: number }) {
  return <><CircleMarker center={[item.latitude, item.longitude]} radius={11} interactive={false} pathOptions={{ color, fillColor: color, fillOpacity: .035, opacity: .14, weight: 1, className: 'atlas-route-stop-wave' }} /><CircleMarker center={[item.latitude, item.longitude]} radius={6.5} pathOptions={{ color: '#fff', fillColor: color, fillOpacity: 1, weight: 2.5, className: 'atlas-route-stop' }}><Tooltip direction="top">{index + 1}. {label}</Tooltip></CircleMarker></>;
}

function WineRegionsLayer({ regions }: { regions: AtlasWineRegion[] }) {
  const map = useMap();
  const [zoom, setZoom] = useState(() => map.getZoom());
  useMapEvents({ zoomend: () => setZoom(map.getZoom()) });
  const visible = useMemo(() => {
    if (zoom >= 5) return regions;
    const countryCounts = new Map<string, number>();
    return regions.filter((region) => {
      const shown = countryCounts.get(region.country) ?? 0;
      const keep = region.wineCount > 0 || shown < 7;
      if (keep) countryCounts.set(region.country, shown + 1);
      return keep;
    });
  }, [regions, zoom]);
  return <>{visible.map((region) => <LivingWineRegion key={region.id} region={region} />)}</>;
}

function LivingWineRegion({ region }: { region: AtlasWineRegion }) {
  const color = wineRegionColor(region.country, region.name);
  const intensity = region.wineCount ? Math.min(.105, .025 + region.wineCount * .008) : .006;
  const loved = region.favoriteCount > 0;
  const rated = (region.averageRating ?? 0) >= 4;
  return <>
    <Circle center={[region.latitude, region.longitude]} radius={region.radius} interactive={false} pathOptions={{ color, fillColor: color, fillOpacity: intensity, opacity: region.wineCount ? .32 : .14, weight: 1, className: 'atlas-do-region atlas-do-breathe' }} />
    <Circle center={[region.latitude, region.longitude]} radius={Math.round(region.radius * 1.08)} pathOptions={{ color, fillColor: color, fillOpacity: 0, opacity: region.wineCount ? .52 : .24, weight: region.wineCount ? 1.5 : 1, dashArray: region.wineCount ? '3 13' : '1 18', className: `atlas-do-orbit${loved ? ' atlas-do-favorites' : ''}` }} eventHandlers={{ mouseover: (event) => event.target.bringToFront() }}>
      <Tooltip direction="top" sticky opacity={.98}><div className="min-w-[190px] py-1.5"><span className="text-[9px] font-semibold uppercase tracking-[.14em]" style={{color}}>{region.classification || 'Indicación protegida'} · {region.country}</span><br/><strong className="text-[13px]">{region.name}</strong><br/><span className="text-[11px] text-zinc-500">{region.wineCount ? `${region.wineCount} ${region.wineCount === 1 ? 'vino conectado' : 'vinos conectados'} · ${region.wineryCount} ${region.wineryCount === 1 ? 'bodega' : 'bodegas'}` : 'Denominación del catálogo oficial'}</span>{region.averageRating&&<><br/><span className="text-[10px]">Valoración media {region.averageRating}/5</span></>}{loved&&<><br/><span className="text-[10px]">{region.favoriteCount} {region.favoriteCount===1?'favorito personal':'favoritos personales'}</span></>}</div></Tooltip>
    </Circle>
    <CircleMarker center={[region.latitude, region.longitude]} radius={region.wineCount ? 5 + Math.min(3, region.wineCount * .35) : 3.1} pathOptions={{ color: '#fff', fillColor: color, fillOpacity: region.wineCount ? .98 : .78, weight: region.wineCount ? 2.4 : 1.4, className: `atlas-do-core${rated ? ' atlas-do-core-rated' : ''}` }}><Tooltip direction="top">{region.name}</Tooltip></CircleMarker>
    <CircleMarker center={[region.latitude, region.longitude]} radius={region.wineCount ? 14 : 10} interactive={false} pathOptions={{ color, fillColor: color, fillOpacity: .018, opacity: region.wineCount ? .18 : .08, weight: 1, className: 'atlas-do-core-halo' }} />
  </>;
}

function FitBounds({ points, focusPointId }: { points: AtlasMapPoint[]; focusPointId?: string }) {
  const map = useMap();
  useEffect(() => {
    const resize = new ResizeObserver(() => map.invalidateSize({ animate: false }));
    resize.observe(map.getContainer()); map.invalidateSize({ animate: false });
    const focused = focusPointId ? points.find((point) => point.id === focusPointId) : undefined;
    if (focused?.trip?.points.length) {
      map.fitBounds(L.latLngBounds(focused.trip.points.map((item) => [item.latitude, item.longitude] as [number, number])), { padding: [70, 70], maxZoom: 11, animate: true });
    } else if (focused) {
      map.setView([focused.latitude, focused.longitude], 13, { animate: true });
    } else if (points.length) {
      const coordinates = points.flatMap((point) => point.trip?.points.map((item) => [item.latitude, item.longitude] as [number, number]) ?? [[point.latitude, point.longitude] as [number, number]]);
      map.fitBounds(L.latLngBounds(coordinates), { padding: [54, 54], maxZoom: 13, animate: points.length < 300 });
    }
    return () => resize.disconnect();
  }, [focusPointId, map, points]);
  return null;
}

function CurrentLocation() {
  const map = useMap(), [position, setPosition] = useState<[number, number] | null>(null), [label, setLabel] = useState('Tu ubicación actual'), [locating, setLocating] = useState(false);
  const locate = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      const next: [number, number] = [coords.latitude, coords.longitude];
      setPosition(next);
      setLocating(false);
      map.setView(next, 13, { animate: true });
      fetch(`/api/geocode?lat=${coords.latitude}&lon=${coords.longitude}`).then((response) => response.ok ? response.json() : null).then((data) => data?.label && setLabel(data.label)).catch(() => undefined);
    }, () => setLocating(false), { enableHighAccuracy: true, maximumAge: 30000, timeout: 10000 });
  };
  return <><button type="button" onClick={locate} aria-label="Centrar el mapa en mi ubicación" className="absolute bottom-[132px] left-[10px] z-[800] flex h-[34px] w-[34px] items-center justify-center rounded border-2 border-black/20 bg-white text-zinc-800 shadow-md transition hover:bg-zinc-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"><LocateFixed className={`h-4 w-4 ${locating ? 'animate-pulse text-sky-500' : ''}`} /></button>{position ? <><Circle center={position} radius={170} pathOptions={{ color: '#0A84FF', fillColor: '#0A84FF', fillOpacity: .035, weight: 1, className: 'atlas-location-pulse' }} /><Circle center={position} radius={75} pathOptions={{ color: '#0A84FF', fillColor: '#0A84FF', fillOpacity: .06, weight: 1 }} /><CircleMarker center={position} radius={8} pathOptions={{ color: '#fff', fillColor: '#0A84FF', fillOpacity: 1, weight: 3, className: 'atlas-location-core' }}><Tooltip direction="top" offset={[0, -8]}>{label}</Tooltip></CircleMarker></> : null}</>;
}

type MeasuredRoute = { points: MapCoordinate[]; cumulative: number[]; total: number };
function measuredRoute(points: MapCoordinate[]): MeasuredRoute {
  const cumulative = [0];
  for (let index = 1; index < points.length; index += 1) cumulative.push(cumulative[index - 1] + routeDistance(points[index - 1], points[index]));
  return { points, cumulative, total: cumulative[cumulative.length - 1] || 1 };
}
function pointAlongRoute(path: MeasuredRoute, progress: number): MapCoordinate {
  const target = path.total * progress;
  let high = path.cumulative.findIndex((value) => value >= target);
  if (high <= 0) return path.points[0];
  const low = high - 1;
  const segment = Math.max(.000001, path.cumulative[high] - path.cumulative[low]);
  const amount = (target - path.cumulative[low]) / segment;
  const start = path.points[low], end = path.points[high];
  return { latitude: start.latitude + (end.latitude - start.latitude) * amount, longitude: start.longitude + (end.longitude - start.longitude) * amount };
}
function routeDistance(a: MapCoordinate, b: MapCoordinate) {
  const radians = Math.PI / 180;
  const lat1 = a.latitude * radians, lat2 = b.latitude * radians;
  const dLat = (b.latitude - a.latitude) * radians, dLon = (b.longitude - a.longitude) * radians;
  const value = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}
function validCoordinate(latitude?: number, longitude?: number) { return latitude !== undefined && longitude !== undefined && Number.isFinite(latitude) && Number.isFinite(longitude) && latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180; }

function routeVisual(mode: TransportMode) {
  if (mode === 'train') return { weight: 2.4, glowWeight: 10, mainDash: undefined, flowColor: '#d1fae5', flowWeight: 1.4, flowDash: '10 18', lineCap: 'butt' as const };
  if (mode === 'boat') return { weight: 4.6, glowWeight: 14, mainDash: '12 9', flowColor: '#ffffff', flowWeight: 2.2, flowDash: '2 19', lineCap: 'round' as const };
  if (mode === 'plane') return { weight: 3.2, glowWeight: 15, mainDash: '21 12', flowColor: '#ffffff', flowWeight: 2.8, flowDash: '2 27', lineCap: 'round' as const };
  return { weight: 5, glowWeight: 10, mainDash: undefined, flowColor: '#dbeafe', flowWeight: 1.8, flowDash: '2 16', lineCap: 'round' as const };
}

function wineRegionColor(country: string, name: string) { const palette: Record<string, string[]> = { España: ['#BE123C', '#9F1239', '#B45309'], Italia: ['#047857', '#0F766E', '#15803D'], Francia: ['#6D28D9', '#4338CA', '#7C3AED'] }; const colors = palette[country] ?? ['#9F1239']; let hash = 0; for (let index = 0; index < name.length; index += 1) hash = ((hash << 5) - hash + name.charCodeAt(index)) | 0; return colors[Math.abs(hash) % colors.length]; }

const cache = new Map<string, L.DivIcon>();
function icon(layer: MapLayer, source: MapSource, focused = false) {
  const key = `${layer}-${source}-${focused}`; const existing = cache.get(key); if (existing) return existing;
  const colors: Record<MapLayer, string> = { memories: source === 'shared' ? '#64D2FF' : '#ff375f', wines: '#7c2d12', trips: '#007aff', favorites: '#ff9f0a', restaurants: '#30d158' };
  const size = layer === 'wines' ? 18 : 28;
  const value = L.divIcon({ className: `atlas-map-marker atlas-map-marker-${layer} atlas-map-source-${source}${focused ? ' atlas-map-marker-focused' : ''}`, html: `<span style="background:${colors[layer]};width:${size}px;height:${size}px"></span><i style="width:${size + 10}px;height:${size + 10}px"></i>`, iconSize: [size, size], iconAnchor: [size / 2, size / 2], popupAnchor: [0, -size / 2] });
  cache.set(key, value); return value;
}

function clusterIcon(count: number) {
  const size = count > 30 ? 52 : count > 10 ? 46 : 40;
  return L.divIcon({ className: 'atlas-map-cluster', html: `<span style="width:${size}px;height:${size}px"><b>${count}</b><i></i></span>`, iconSize: [size, size], iconAnchor: [size / 2, size / 2] });
}

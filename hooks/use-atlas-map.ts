'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getAtlasMapSnapshot } from '@/lib/map/repository';
import { getAtlasDemoSnapshot } from '@/lib/map/demo';
import type { AtlasMapFilters, AtlasMapSnapshot, MapLayer, MapSource } from '@/types/map';
import type { TransportMode } from '@/types/trip';

export type AtlasExplorePreset = 'all' | 'mine' | 'wine' | 'trips' | 'shared' | 'public';

const defaultLayers: MapLayer[] = ['memories', 'restaurants', 'wines', 'trips'];
const allLayers: MapLayer[] = ['memories', 'wines', 'trips', 'favorites', 'restaurants'];
const allTransports: TransportMode[] = ['car', 'train', 'boat', 'plane'];
const createInitialFilters = (): AtlasMapFilters => ({ query: '', sources: new Set(['mine', 'shared', 'public']), layers: new Set(defaultLayers), transports: new Set(allTransports), year: '', participant: '' });

export function useAtlasMap() {
  const searchParams = useSearchParams();
  const contextPerson = searchParams.get('person') ?? '';
  const contextSource = searchParams.get('source');
  const requestedMemoryId = searchParams.get('memory');
  const requestedTripId = searchParams.get('trip');
  const [snapshot, setSnapshot] = useState<AtlasMapSnapshot | null>(null);
  const [filters, setFilters] = useState(createInitialFilters);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try { setSnapshot(process.env.NEXT_PUBLIC_ATLAS_DEMO === 'true' ? getAtlasDemoSnapshot() : await getAtlasMapSnapshot()); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'No se pudo cargar el mapa.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);
  useEffect(() => { if (contextPerson) setFilters((current) => ({ ...current, participant: contextPerson })); }, [contextPerson]);
  useEffect(() => { if (contextSource === 'mine' || contextSource === 'shared' || contextSource === 'public') setFilters((current) => ({ ...current, sources: new Set<MapSource>([contextSource]) })); }, [contextSource]);

  const points = useMemo(() => {
    const query = filters.query.trim().toLocaleLowerCase('es');
    return (snapshot?.points ?? []).filter((point) => filters.sources.has(point.source) && filters.layers.has(point.layer) && (!point.trip || filters.transports.has(point.trip.transportMode)) && (!filters.year || point.year === filters.year) && (!filters.participant || point.peopleIds.includes(filters.participant)) && (!query || [point.title, point.subtitle, point.ownerName, point.memory?.city, point.memory?.country, point.wine?.region, point.wine?.denomination, point.wine?.winery, ...point.participantNames].filter(Boolean).join(' ').toLocaleLowerCase('es').includes(query)));
  }, [filters, snapshot]);

  const wineRegions = useMemo(() => {
    if (!filters.layers.has('wines') || !filters.sources.has('public')) return [];
    const query = filters.query.trim().toLocaleLowerCase('es');
    return (snapshot?.wineRegions ?? []).filter((region) => !query || `${region.name} ${region.country}`.toLocaleLowerCase('es').includes(query));
  }, [filters.layers, filters.query, filters.sources, snapshot]);

  const focusPointId = requestedMemoryId ? snapshot?.points.find((point) => point.memory?.id === requestedMemoryId)?.id ?? `memory-${requestedMemoryId}` : requestedTripId ? `trip-${requestedTripId}` : undefined;

  const toggleSource = (value: MapSource) => setFilters((current) => ({ ...current, sources: toggle(current.sources, value) }));
  const toggleLayer = (value: MapLayer) => setFilters((current) => ({ ...current, layers: toggle(current.layers, value) }));
  const applyPreset = (preset: AtlasExplorePreset) => setFilters((current) => {
    const base = { ...current, query: '', year: '', participant: '', transports: new Set<TransportMode>(allTransports) };
    if (preset === 'mine') return { ...base, sources: new Set<MapSource>(['mine']), layers: new Set<MapLayer>(allLayers) };
    if (preset === 'wine') return { ...base, sources: new Set<MapSource>(['public']), layers: new Set<MapLayer>(['wines']) };
    if (preset === 'trips') return { ...base, sources: new Set<MapSource>(['mine', 'shared']), layers: new Set<MapLayer>(['trips']) };
    if (preset === 'shared') return { ...base, sources: new Set<MapSource>(['shared']), layers: new Set<MapLayer>(['memories', 'trips']) };
    if (preset === 'public') return { ...base, sources: new Set<MapSource>(['public']), layers: new Set<MapLayer>(['wines']) };
    return { ...base, sources: new Set<MapSource>(['mine', 'shared', 'public']), layers: new Set<MapLayer>(defaultLayers) };
  });

  return {
    snapshot,
    points,
    wineRegions,
    filters,
    setQuery: (query: string) => setFilters((current) => ({ ...current, query })),
    setYear: (year: string) => setFilters((current) => ({ ...current, year })),
    setParticipant: (participant: string) => setFilters((current) => ({ ...current, participant })),
    toggleTransport: (transport: TransportMode) => setFilters((current) => ({ ...current, transports: toggle(current.transports, transport) })),
    toggleSource,
    toggleLayer,
    applyPreset,
    reset: () => setFilters(createInitialFilters()),
    focusPointId,
    loading,
    error,
    refresh,
  };
}

function toggle<T>(values: Set<T>, value: T) {
  const next = new Set(values);
  if (next.has(value)) next.delete(value); else next.add(value);
  return next;
}

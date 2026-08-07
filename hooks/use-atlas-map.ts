'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getAtlasMapSnapshot } from '@/lib/map/repository';
import type { AtlasMapFilters, AtlasMapSnapshot, MapLayer, MapSource } from '@/types/map';

export type AtlasExplorePreset = 'all' | 'mine' | 'wine' | 'trips' | 'shared' | 'public';

const defaultLayers: MapLayer[] = ['memories', 'wines', 'trips'];
const allLayers: MapLayer[] = ['memories', 'wines', 'trips', 'favorites', 'restaurants'];
const initialFilters: AtlasMapFilters = { query: '', sources: new Set(['mine', 'shared', 'public']), layers: new Set(defaultLayers), year: '', participant: '' };

export function useAtlasMap() {
  const [snapshot, setSnapshot] = useState<AtlasMapSnapshot | null>(null);
  const [filters, setFilters] = useState(initialFilters);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try { setSnapshot(await getAtlasMapSnapshot()); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'No se pudo cargar el mapa.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const points = useMemo(() => {
    const query = filters.query.trim().toLocaleLowerCase('es');
    return (snapshot?.points ?? []).filter((point) => filters.sources.has(point.source) && filters.layers.has(point.layer) && (!filters.year || point.year === filters.year) && (!filters.participant || point.participantIds.includes(filters.participant)) && (!query || [point.title, point.subtitle, point.ownerName, point.memory?.city, point.memory?.country, point.wine?.region, point.wine?.denomination, point.wine?.winery, ...point.participantNames].filter(Boolean).join(' ').toLocaleLowerCase('es').includes(query)));
  }, [filters, snapshot]);

  const wineRegions = useMemo(() => {
    if (!filters.layers.has('wines') || !filters.sources.has('public')) return [];
    const query = filters.query.trim().toLocaleLowerCase('es');
    return (snapshot?.wineRegions ?? []).filter((region) => !query || `${region.name} ${region.country}`.toLocaleLowerCase('es').includes(query));
  }, [filters.layers, filters.query, filters.sources, snapshot]);

  const toggleSource = (value: MapSource) => setFilters((current) => ({ ...current, sources: toggle(current.sources, value) }));
  const toggleLayer = (value: MapLayer) => setFilters((current) => ({ ...current, layers: toggle(current.layers, value) }));
  const applyPreset = (preset: AtlasExplorePreset) => setFilters((current) => {
    const base = { ...current, query: '', year: '', participant: '' };
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
    toggleSource,
    toggleLayer,
    applyPreset,
    reset: () => setFilters(initialFilters),
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

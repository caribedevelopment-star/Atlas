'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getAtlasMapSnapshot } from '@/lib/map/repository';
import type { AtlasMapFilters, AtlasMapSnapshot, MapLayer, MapSource } from '@/types/map';

const initialFilters: AtlasMapFilters = { query: '', sources: new Set(['mine', 'friends', 'public']), layers: new Set(['memories', 'wines', 'trips']), year: '', participant: '' };
export function useAtlasMap() {
  const [snapshot, setSnapshot] = useState<AtlasMapSnapshot | null>(null); const [filters, setFilters] = useState(initialFilters); const [loading, setLoading] = useState(true); const [error, setError] = useState<string | null>(null);
  const refresh = useCallback(async () => { setLoading(true); setError(null); try { setSnapshot(await getAtlasMapSnapshot()); } catch (cause) { setError(cause instanceof Error ? cause.message : 'No se pudo cargar el mapa.'); } finally { setLoading(false); } }, []);
  useEffect(() => { void refresh(); }, [refresh]);
  const points = useMemo(() => { const query = filters.query.trim().toLocaleLowerCase('es'); return (snapshot?.points ?? []).filter((point) => filters.sources.has(point.source) && filters.layers.has(point.layer) && (!filters.year || point.year === filters.year) && (!filters.participant || point.participantIds.includes(filters.participant)) && (!query || [point.title, point.subtitle, point.ownerName, ...point.participantNames].filter(Boolean).join(' ').toLocaleLowerCase('es').includes(query))); }, [filters, snapshot]);
  const wineRegions = useMemo(() => filters.layers.has('wines') ? (snapshot?.wineRegions ?? []) : [], [filters.layers, snapshot]);
  const toggleSource = (value: MapSource) => setFilters((current) => ({ ...current, sources: toggle(current.sources, value) }));
  const toggleLayer = (value: MapLayer) => setFilters((current) => ({ ...current, layers: toggle(current.layers, value) }));
  return { snapshot, points, wineRegions, filters, setQuery: (query: string) => setFilters((current) => ({ ...current, query })), setYear: (year: string) => setFilters((current) => ({ ...current, year })), setParticipant: (participant: string) => setFilters((current) => ({ ...current, participant })), toggleSource, toggleLayer, reset: () => setFilters(initialFilters), loading, error, refresh };
}
function toggle<T>(values: Set<T>, value: T) { const next = new Set(values); if (next.has(value)) next.delete(value); else next.add(value); return next; }

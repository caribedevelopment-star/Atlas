'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { getCurrentWineUserId, listWines, setWineFavorite } from '@/lib/wines/repository';
import type { WineFilters, WineItem, WineSort, WineSource } from '@/types/wine';

export const initialWineFilters: WineFilters = {
  source: 'all', favorite: false, minimumRating: null, minimumPrice: null, maximumPrice: null,
  country: '', region: '', denomination: '', grape: '', vintage: '', retailer: '',
};

function sourceFor(wine: WineItem, userId: string | null): WineSource {
  if (userId && wine.user_id === userId) return 'mine';
  if (wine.visibility === 'friends') return 'friends';
  return 'public';
}

function isVisible(wine: WineItem, userId: string | null) {
  if (wine.user_id === userId) return true;
  if (wine.visibility === 'private') return false;
  if (wine.visibility === 'friends') return wine.participants.some((participant) => participant.id === userId);
  return true;
}

export function useWineLibrary() {
  const [wines, setWines] = useState<WineItem[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<WineFilters>(initialWineFilters);
  const [sort, setSort] = useState<WineSort>('recent');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [selectedWine, setSelectedWine] = useState<WineItem | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [nextWines, nextUserId] = await Promise.all([listWines(), getCurrentWineUserId()]);
      setWines(nextWines); setUserId(nextUserId);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo cargar tu bodega.');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const filteredWines = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('es');
    const result = wines.filter((wine) => {
      if (!isVisible(wine, userId)) return false;
      const searchable = [wine.name, wine.winery, ...wine.grapes, wine.region, wine.country].filter(Boolean).join(' ').toLocaleLowerCase('es');
      if (query && !searchable.includes(query)) return false;
      if (filters.source !== 'all' && sourceFor(wine, userId) !== filters.source) return false;
      if (filters.favorite && !wine.favorite) return false;
      if (filters.minimumRating !== null && (wine.rating ?? 0) < filters.minimumRating) return false;
      if (filters.minimumPrice !== null && (wine.price === undefined || wine.price < filters.minimumPrice)) return false;
      if (filters.maximumPrice !== null && (wine.price === undefined || wine.price > filters.maximumPrice)) return false;
      if (filters.country && wine.country !== filters.country) return false;
      if (filters.region && wine.region !== filters.region) return false;
      if (filters.denomination && wine.denomination !== filters.denomination) return false;
      if (filters.grape && !wine.grapes.includes(filters.grape)) return false;
      if (filters.vintage && String(wine.vintage) !== filters.vintage) return false;
      if (filters.retailer && ![wine.supermarket, wine.shop].includes(filters.retailer)) return false;
      return true;
    });
    return result.sort((a, b) => {
      if (sort === 'rating') return (b.rating ?? -1) - (a.rating ?? -1);
      if (sort === 'price-asc') return (a.price ?? Infinity) - (b.price ?? Infinity);
      if (sort === 'price-desc') return (b.price ?? -1) - (a.price ?? -1);
      if (sort === 'vintage') return (b.vintage ?? -1) - (a.vintage ?? -1);
      if (sort === 'alphabetical') return a.name.localeCompare(b.name, 'es');
      return new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime();
    });
  }, [filters, search, sort, userId, wines]);

  const options = useMemo(() => ({
    countries: unique(wines.map((wine) => wine.country)), regions: unique(wines.map((wine) => wine.region)),
    denominations: unique(wines.map((wine) => wine.denomination)), grapes: unique(wines.flatMap((wine) => wine.grapes)),
    vintages: unique(wines.map((wine) => wine.vintage ? String(wine.vintage) : undefined)).sort().reverse(),
    retailers: unique(wines.flatMap((wine) => [wine.supermarket, wine.shop])),
  }), [wines]);

  const toggleFavorite = useCallback(async (wine: WineItem) => {
    const next = !wine.favorite;
    setWines((current) => current.map((item) => item.id === wine.id ? { ...item, favorite: next } : item));
    setSelectedWine((current) => current?.id === wine.id ? { ...current, favorite: next } : current);
    try { await setWineFavorite(wine.id, next); }
    catch (cause) {
      setWines((current) => current.map((item) => item.id === wine.id ? { ...item, favorite: wine.favorite } : item));
      setError(cause instanceof Error ? cause.message : 'No se pudo actualizar el favorito.');
    }
  }, []);

  const addWine = useCallback((wine: WineItem) => setWines((current) => [wine, ...current]), []);
  return { wines, filteredWines, loading, error, search, setSearch, filters, setFilters, sort, setSort, view, setView, selectedWine, setSelectedWine, options, refresh, toggleFavorite, addWine, clearError: () => setError(null), userId };
}

function unique(values: Array<string | undefined>) {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value)))).sort((a, b) => a.localeCompare(b, 'es'));
}

-- Keep catalogue-level favourite lookups efficient as the wine library grows.
create index if not exists wine_user_favorites_wine_id_idx
  on public.wine_user_favorites (wine_id);

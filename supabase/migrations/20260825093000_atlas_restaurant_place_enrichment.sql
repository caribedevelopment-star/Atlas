-- Enrich private restaurant memories with the place metadata returned by the
-- configured geocoder. Existing memory ownership and explicit-sharing RLS
-- policies continue to govern every column on the row.
alter table public.memories
  add column if not exists restaurant_website text,
  add column if not exists restaurant_phone text,
  add column if not exists restaurant_opening_hours text,
  add column if not exists restaurant_source text,
  add column if not exists restaurant_source_id text;

alter table public.memories drop constraint if exists memories_restaurant_source_check;
alter table public.memories add constraint memories_restaurant_source_check
  check (restaurant_source is null or restaurant_source in ('nominatim', 'photon'));

create index if not exists memories_restaurant_source_lookup_idx
  on public.memories (restaurant_source, restaurant_source_id)
  where is_restaurant = true and restaurant_source_id is not null;

-- The client writes `friends` for explicit sharing. Keep legacy values readable
-- while allowing edits to shared memories to satisfy the table constraint.
alter table public.memories drop constraint if exists memories_visibility_check;
alter table public.memories add constraint memories_visibility_check
  check (visibility in ('public', 'private', 'shared', 'friends'));

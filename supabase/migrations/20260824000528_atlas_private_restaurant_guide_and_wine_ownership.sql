begin;

-- Restaurants stay inside memories so the archive, map and profile keep one
-- coherent source of truth, with structured fields for the private guide.
alter table public.memories
  add column if not exists restaurant_cuisine text,
  add column if not exists restaurant_vibe text,
  add column if not exists restaurant_price_level smallint,
  add column if not exists restaurant_rating numeric(2,1),
  add column if not exists restaurant_must_order text,
  add column if not exists restaurant_status text;

alter table public.memories drop constraint if exists memories_restaurant_price_level_check;
alter table public.memories add constraint memories_restaurant_price_level_check
  check (restaurant_price_level is null or restaurant_price_level between 1 and 4);
alter table public.memories drop constraint if exists memories_restaurant_rating_check;
alter table public.memories add constraint memories_restaurant_rating_check
  check (restaurant_rating is null or restaurant_rating between 0 and 5);
alter table public.memories drop constraint if exists memories_restaurant_status_check;
alter table public.memories add constraint memories_restaurant_status_check
  check (restaurant_status is null or restaurant_status in ('visited', 'wishlist'));

create index if not exists memories_private_restaurant_guide_idx
  on public.memories (user_id, restaurant_status, created_at desc)
  where is_restaurant is true;

-- Personal favourites for shared catalogue wines. The old wines.favorite flag
-- remains for backwards compatibility but no longer makes a catalogue row
-- globally mutable.
create table if not exists public.wine_user_favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  wine_id uuid not null references public.wines(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, wine_id)
);

alter table public.wine_user_favorites enable row level security;
revoke all on table public.wine_user_favorites from anon, authenticated;
grant select, insert, delete on table public.wine_user_favorites to authenticated;

drop policy if exists "Users read own wine favourites" on public.wine_user_favorites;
create policy "Users read own wine favourites"
  on public.wine_user_favorites for select to authenticated
  using ((select auth.uid()) = user_id);
drop policy if exists "Users create own wine favourites" on public.wine_user_favorites;
create policy "Users create own wine favourites"
  on public.wine_user_favorites for insert to authenticated
  with check ((select auth.uid()) = user_id);
drop policy if exists "Users delete own wine favourites" on public.wine_user_favorites;
create policy "Users delete own wine favourites"
  on public.wine_user_favorites for delete to authenticated
  using ((select auth.uid()) = user_id);

-- Replace the legacy globally writable catalogue policies with ownership-aware
-- rules. Public catalogue rows remain readable; personal rows follow privacy.
drop policy if exists "Actualizacion libre de vinos" on public.wines;
drop policy if exists "Eliminacion libre de vinos" on public.wines;
drop policy if exists "Insercion libre de vinos" on public.wines;
drop policy if exists "Lectura publica de vinos" on public.wines;
drop policy if exists "Public catalogue wines are readable" on public.wines;
create policy "Public catalogue wines are readable"
  on public.wines for select to anon, authenticated
  using (user_id is null or visibility = 'public');
drop policy if exists "Users read own and friend wines" on public.wines;
create policy "Users read own and friend wines"
  on public.wines for select to authenticated
  using (
    user_id = (select auth.uid())
    or (
      visibility = 'friends'
      and exists (
        select 1 from public.friendships friendship
        where friendship.status = 'accepted'
          and (
            (friendship.requester_id = (select auth.uid()) and friendship.addressee_id = wines.user_id)
            or (friendship.addressee_id = (select auth.uid()) and friendship.requester_id = wines.user_id)
          )
      )
    )
  );
drop policy if exists "Users create own wines" on public.wines;
create policy "Users create own wines"
  on public.wines for insert to authenticated
  with check (user_id = (select auth.uid()));
drop policy if exists "Users update own wines" on public.wines;
create policy "Users update own wines"
  on public.wines for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
drop policy if exists "Users delete own wines" on public.wines;
create policy "Users delete own wines"
  on public.wines for delete to authenticated
  using (user_id = (select auth.uid()));

-- Tighten the existing memory mutation policies while keeping the same private
-- and explicitly-shared read model.
drop policy if exists "Los usuarios crean sus propias memorias" on public.memories;
create policy "Los usuarios crean sus propias memorias"
  on public.memories for insert to authenticated
  with check ((select auth.uid()) = user_id);
drop policy if exists "Los usuarios editan sus propias memorias" on public.memories;
create policy "Los usuarios editan sus propias memorias"
  on public.memories for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
drop policy if exists "Los usuarios borran sus propias memorias" on public.memories;
create policy "Los usuarios borran sus propias memorias"
  on public.memories for delete to authenticated
  using ((select auth.uid()) = user_id);

-- The existing RPCs perform their own ownership checks, but older migration
-- history left explicit anon grants behind. Keep only their intended callers.
revoke all on function public.atlas_send_friend_request(uuid) from public, anon;
revoke all on function public.atlas_respond_friend_request(uuid, boolean) from public, anon;
revoke all on function public.atlas_remove_friend(uuid) from public, anon;
revoke all on function public.atlas_reorder_trip_stops(uuid, uuid[]) from public, anon;
revoke all on function public.atlas_trip_can_view(uuid, public.atlas_visibility, uuid) from public, anon;
revoke all on function public.atlas_trip_can_view_explicit(uuid, uuid, uuid) from public, anon;
revoke all on function public.atlas_trip_users_are_friends(uuid, uuid) from public, anon;
grant execute on function public.atlas_send_friend_request(uuid) to authenticated;
grant execute on function public.atlas_respond_friend_request(uuid, boolean) to authenticated;
grant execute on function public.atlas_remove_friend(uuid) to authenticated;
grant execute on function public.atlas_reorder_trip_stops(uuid, uuid[]) to authenticated;
grant execute on function public.atlas_trip_can_view(uuid, public.atlas_visibility, uuid) to authenticated;
grant execute on function public.atlas_trip_can_view_explicit(uuid, uuid, uuid) to authenticated;
grant execute on function public.atlas_trip_users_are_friends(uuid, uuid) to authenticated;
revoke all on function public.handle_new_user() from public, anon, authenticated;
alter function public.handle_new_user() set search_path = public, pg_temp;

commit;

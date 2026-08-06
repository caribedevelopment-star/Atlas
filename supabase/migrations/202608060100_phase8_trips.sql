begin;

do $$ begin create type public.atlas_visibility as enum ('private','friends','public'); exception when duplicate_object then null; end $$;

create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (length(trim(title)) between 1 and 160), description text,
  cover_image_url text, start_date date not null, end_date date not null,
  visibility public.atlas_visibility not null default 'private', route_geometry jsonb,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  constraint trips_dates_valid check (end_date >= start_date)
);
create table if not exists public.trip_stops (
  id uuid primary key default gen_random_uuid(), trip_id uuid not null references public.trips(id) on delete cascade,
  memory_id uuid references public.memories(id) on delete set null, position integer not null check (position >= 0),
  title text, latitude double precision check (latitude between -90 and 90), longitude double precision check (longitude between -180 and 180), city text, country text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique (trip_id, position)
);
create table if not exists public.trip_participants (trip_id uuid not null references public.trips(id) on delete cascade, user_id uuid not null references auth.users(id) on delete cascade, created_at timestamptz not null default now(), primary key (trip_id,user_id));
create table if not exists public.trip_wines (trip_id uuid not null references public.trips(id) on delete cascade, wine_id uuid not null references public.wines(id) on delete cascade, created_at timestamptz not null default now(), primary key (trip_id,wine_id));
create table if not exists public.trip_photos (id uuid primary key default gen_random_uuid(), trip_id uuid not null references public.trips(id) on delete cascade, storage_path text not null, caption text, position integer not null default 0 check (position >= 0), created_at timestamptz not null default now(), unique (trip_id,position));
create index if not exists trips_owner_dates_idx on public.trips(user_id,start_date desc);
create index if not exists trips_visibility_idx on public.trips(visibility);
create index if not exists trip_stops_memory_idx on public.trip_stops(memory_id);

create or replace function public.atlas_trip_users_are_friends(first_user uuid, second_user uuid) returns boolean language plpgsql stable security definer set search_path = public,pg_temp as $$
declare result boolean := false;
begin
  if first_user is null or second_user is null or to_regclass('public.user_relationships') is null then return false; end if;
  execute $q$ select exists (select 1 from public.user_relationships a join public.user_relationships b on a.user_id=b.target_user_id and a.target_user_id=b.user_id where a.user_id=$1 and a.target_user_id=$2 and coalesce(to_jsonb(a)->>'status',to_jsonb(a)->>'relationship') in ('accepted','circle') and coalesce(to_jsonb(b)->>'status',to_jsonb(b)->>'relationship') in ('accepted','circle')) $q$ into result using first_user,second_user;
  return result;
end $$;
create or replace function public.atlas_trip_can_view(owner_id uuid, record_visibility public.atlas_visibility, viewer_id uuid default auth.uid()) returns boolean language sql stable security definer set search_path=public,pg_temp as $$ select viewer_id is not null and (viewer_id=owner_id or record_visibility='public' or (record_visibility='friends' and public.atlas_trip_users_are_friends(viewer_id,owner_id))) $$;

alter table public.trips enable row level security; alter table public.trip_stops enable row level security; alter table public.trip_participants enable row level security; alter table public.trip_wines enable row level security; alter table public.trip_photos enable row level security;
drop policy if exists trips_select on public.trips; create policy trips_select on public.trips for select to authenticated using (public.atlas_trip_can_view(user_id,visibility));
drop policy if exists trips_insert on public.trips; create policy trips_insert on public.trips for insert to authenticated with check (user_id=auth.uid());
drop policy if exists trips_update on public.trips; create policy trips_update on public.trips for update to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());
drop policy if exists trips_delete on public.trips; create policy trips_delete on public.trips for delete to authenticated using (user_id=auth.uid());

do $$ declare table_name text; begin foreach table_name in array array['trip_stops','trip_participants','trip_wines','trip_photos'] loop
  execute format('drop policy if exists %I_select on public.%I',table_name,table_name);
  execute format('create policy %I_select on public.%I for select to authenticated using (exists (select 1 from public.trips t where t.id=trip_id and public.atlas_trip_can_view(t.user_id,t.visibility)))',table_name,table_name);
  execute format('drop policy if exists %I_write on public.%I',table_name,table_name);
  execute format('create policy %I_write on public.%I for all to authenticated using (exists (select 1 from public.trips t where t.id=trip_id and t.user_id=auth.uid())) with check (exists (select 1 from public.trips t where t.id=trip_id and t.user_id=auth.uid()))',table_name,table_name);
end loop; end $$;

create or replace function public.atlas_save_trip(trip_id uuid, payload jsonb) returns uuid language plpgsql security definer set search_path=public,pg_temp as $$
declare saved_id uuid; stop jsonb; participant jsonb; wine jsonb; photo jsonb; index_value integer;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if trip_id is null then insert into public.trips(user_id,title,description,cover_image_url,start_date,end_date,visibility,route_geometry) values(auth.uid(),payload->>'title',nullif(payload->>'description',''),nullif(payload->>'coverImageUrl',''),(payload->>'startDate')::date,(payload->>'endDate')::date,coalesce((payload->>'visibility')::public.atlas_visibility,'private'),payload->'routeGeometry') returning id into saved_id;
  else update public.trips set title=payload->>'title',description=nullif(payload->>'description',''),cover_image_url=nullif(payload->>'coverImageUrl',''),start_date=(payload->>'startDate')::date,end_date=(payload->>'endDate')::date,visibility=(payload->>'visibility')::public.atlas_visibility,route_geometry=payload->'routeGeometry',updated_at=now() where id=trip_id and user_id=auth.uid() returning id into saved_id; if saved_id is null then raise exception 'Trip not found or forbidden'; end if; delete from public.trip_stops where trip_stops.trip_id=saved_id; delete from public.trip_participants where trip_participants.trip_id=saved_id; delete from public.trip_wines where trip_wines.trip_id=saved_id; delete from public.trip_photos where trip_photos.trip_id=saved_id; end if;
  index_value:=0; for stop in select * from jsonb_array_elements(coalesce(payload->'stops','[]')) loop insert into public.trip_stops(trip_id,memory_id,position,title,latitude,longitude,city,country) values(saved_id,nullif(stop->>'memoryId','')::uuid,index_value,nullif(stop->>'title',''),nullif(stop->>'latitude','')::double precision,nullif(stop->>'longitude','')::double precision,nullif(stop->>'city',''),nullif(stop->>'country','')); index_value:=index_value+1; end loop;
  for participant in select * from jsonb_array_elements(coalesce(payload->'participantIds','[]')) loop insert into public.trip_participants values(saved_id,(participant#>>'{}')::uuid,now()) on conflict do nothing; end loop;
  for wine in select * from jsonb_array_elements(coalesce(payload->'wineIds','[]')) loop insert into public.trip_wines values(saved_id,(wine#>>'{}')::uuid,now()) on conflict do nothing; end loop;
  index_value:=0; for photo in select * from jsonb_array_elements(coalesce(payload->'photos','[]')) loop insert into public.trip_photos(trip_id,storage_path,caption,position) values(saved_id,photo->>'storagePath',nullif(photo->>'caption',''),index_value); index_value:=index_value+1; end loop;
  return saved_id;
end $$;
revoke all on function public.atlas_save_trip(uuid,jsonb) from public; grant execute on function public.atlas_save_trip(uuid,jsonb) to authenticated;

create or replace function public.atlas_reorder_trip_stops(target_trip_id uuid, ordered_stop_ids uuid[]) returns void language plpgsql security definer set search_path=public,pg_temp as $$ declare stop_id uuid; position_value integer:=0; begin if not exists(select 1 from public.trips where id=target_trip_id and user_id=auth.uid()) then raise exception 'Trip not found or forbidden'; end if; if cardinality(ordered_stop_ids)!=(select count(*) from public.trip_stops where trip_id=target_trip_id) then raise exception 'Stop list is incomplete'; end if; update public.trip_stops set position=position+100000 where trip_id=target_trip_id; foreach stop_id in array ordered_stop_ids loop update public.trip_stops set position=position_value,updated_at=now() where id=stop_id and trip_id=target_trip_id; if not found then raise exception 'Invalid stop'; end if; position_value:=position_value+1; end loop; end $$;
revoke all on function public.atlas_reorder_trip_stops(uuid,uuid[]) from public; grant execute on function public.atlas_reorder_trip_stops(uuid,uuid[]) to authenticated;
commit;

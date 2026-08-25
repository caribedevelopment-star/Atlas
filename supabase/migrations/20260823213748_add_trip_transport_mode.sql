begin;

alter table public.trips add column if not exists transport_mode text;

alter table public.trips drop constraint if exists trips_transport_mode_check;
alter table public.trips drop constraint if exists trips_transport_mode_valid;

update public.trips
set transport_mode = case transport_mode
  when 'roadtrip' then 'car'
  when 'flight' then 'plane'
  else transport_mode
end
where transport_mode in ('roadtrip', 'flight');

update public.trips
set transport_mode = case
  when lower(coalesce(title, '') || ' ' || coalesce(description, '')) ~ '(avión|avion|vuelo|aéreo|aereo|airport|flight)' then 'plane'
  when lower(coalesce(title, '') || ' ' || coalesce(description, '')) ~ '(barco|ferry|crucero|velero|navío|navio|puerto)' then 'boat'
  when lower(coalesce(title, '') || ' ' || coalesce(description, '')) ~ '(tren|ferrocarril|rail|ave\y)' then 'train'
  else 'car'
end
where transport_mode is null;

alter table public.trips alter column transport_mode set default 'car';
alter table public.trips alter column transport_mode set not null;
alter table public.trips add constraint trips_transport_mode_valid check (transport_mode in ('car', 'train', 'boat', 'plane'));

create or replace function public.atlas_save_trip(trip_id uuid, payload jsonb) returns uuid language plpgsql security definer set search_path=public,pg_temp as $$
declare saved_id uuid; stop jsonb; participant jsonb; wine jsonb; photo jsonb; index_value integer;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if trip_id is null then
    insert into public.trips(user_id,title,description,cover_image_url,start_date,end_date,transport_mode,visibility,route_geometry)
    values(auth.uid(),payload->>'title',nullif(payload->>'description',''),nullif(payload->>'coverImageUrl',''),(payload->>'startDate')::date,(payload->>'endDate')::date,coalesce(nullif(payload->>'transportMode',''),'car'),coalesce((payload->>'visibility')::public.atlas_visibility,'private'),payload->'routeGeometry') returning id into saved_id;
  else
    update public.trips set title=payload->>'title',description=nullif(payload->>'description',''),cover_image_url=nullif(payload->>'coverImageUrl',''),start_date=(payload->>'startDate')::date,end_date=(payload->>'endDate')::date,transport_mode=coalesce(nullif(payload->>'transportMode',''),'car'),visibility=(payload->>'visibility')::public.atlas_visibility,route_geometry=payload->'routeGeometry',updated_at=now() where id=trip_id and user_id=auth.uid() returning id into saved_id;
    if saved_id is null then raise exception 'Trip not found or forbidden'; end if;
    delete from public.trip_stops where trip_stops.trip_id=saved_id; delete from public.trip_participants where trip_participants.trip_id=saved_id; delete from public.trip_wines where trip_wines.trip_id=saved_id; delete from public.trip_photos where trip_photos.trip_id=saved_id;
  end if;
  index_value:=0; for stop in select * from jsonb_array_elements(coalesce(payload->'stops','[]')) loop insert into public.trip_stops(trip_id,memory_id,position,title,latitude,longitude,city,country) values(saved_id,nullif(stop->>'memoryId','')::uuid,index_value,nullif(stop->>'title',''),nullif(stop->>'latitude','')::double precision,nullif(stop->>'longitude','')::double precision,nullif(stop->>'city',''),nullif(stop->>'country','')); index_value:=index_value+1; end loop;
  for participant in select * from jsonb_array_elements(coalesce(payload->'participantIds','[]')) loop insert into public.trip_participants values(saved_id,(participant#>>'{}')::uuid,now()) on conflict do nothing; end loop;
  for wine in select * from jsonb_array_elements(coalesce(payload->'wineIds','[]')) loop insert into public.trip_wines values(saved_id,(wine#>>'{}')::uuid,now()) on conflict do nothing; end loop;
  index_value:=0; for photo in select * from jsonb_array_elements(coalesce(payload->'photos','[]')) loop insert into public.trip_photos(trip_id,storage_path,caption,position) values(saved_id,photo->>'storagePath',nullif(photo->>'caption',''),index_value); index_value:=index_value+1; end loop;
  return saved_id;
end $$;

revoke all on function public.atlas_save_trip(uuid,jsonb) from public, anon;
grant execute on function public.atlas_save_trip(uuid,jsonb) to authenticated;

commit;

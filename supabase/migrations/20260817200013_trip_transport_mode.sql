alter table public.trips
  add column if not exists transport_mode text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'trips_transport_mode_check'
      and conrelid = 'public.trips'::regclass
  ) then
    alter table public.trips
      add constraint trips_transport_mode_check
      check (transport_mode is null or transport_mode in ('roadtrip','flight'));
  end if;
end $$;

create or replace function public.atlas_save_trip(trip_id uuid, payload jsonb)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  saved_id uuid;
  stop jsonb;
  participant jsonb;
  wine jsonb;
  photo jsonb;
  index_value integer;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if trip_id is null then
    insert into public.trips (
      user_id, title, description, cover_image_url, start_date, end_date,
      visibility, route_geometry, transport_mode
    )
    values (
      auth.uid(), payload->>'title', nullif(payload->>'description', ''),
      nullif(payload->>'coverImageUrl', ''), (payload->>'startDate')::date,
      (payload->>'endDate')::date,
      coalesce((payload->>'visibility')::public.atlas_visibility, 'private'),
      payload->'routeGeometry', nullif(payload->>'transportMode', '')
    )
    returning id into saved_id;
  else
    update public.trips
    set title = payload->>'title',
        description = nullif(payload->>'description', ''),
        cover_image_url = nullif(payload->>'coverImageUrl', ''),
        start_date = (payload->>'startDate')::date,
        end_date = (payload->>'endDate')::date,
        visibility = (payload->>'visibility')::public.atlas_visibility,
        route_geometry = payload->'routeGeometry',
        transport_mode = coalesce(nullif(payload->>'transportMode', ''), transport_mode),
        updated_at = now()
    where id = trip_id and user_id = auth.uid()
    returning id into saved_id;

    if saved_id is null then
      raise exception 'Trip not found or forbidden';
    end if;

    delete from public.trip_stops where trip_stops.trip_id = saved_id;
    delete from public.trip_participants where trip_participants.trip_id = saved_id;
    delete from public.trip_wines where trip_wines.trip_id = saved_id;
    delete from public.trip_photos where trip_photos.trip_id = saved_id;
  end if;

  index_value := 0;
  for stop in select * from jsonb_array_elements(coalesce(payload->'stops', '[]'::jsonb)) loop
    insert into public.trip_stops (trip_id, memory_id, position, title, latitude, longitude, city, country)
    values (
      saved_id, nullif(stop->>'memoryId', '')::uuid, index_value,
      nullif(stop->>'title', ''), nullif(stop->>'latitude', '')::double precision,
      nullif(stop->>'longitude', '')::double precision, nullif(stop->>'city', ''),
      nullif(stop->>'country', '')
    );
    index_value := index_value + 1;
  end loop;

  for participant in select * from jsonb_array_elements(coalesce(payload->'participantIds', '[]'::jsonb)) loop
    insert into public.trip_participants (trip_id, user_id, created_at)
    values (saved_id, (participant #>> '{}')::uuid, now())
    on conflict do nothing;
  end loop;

  for wine in select * from jsonb_array_elements(coalesce(payload->'wineIds', '[]'::jsonb)) loop
    insert into public.trip_wines (trip_id, wine_id, created_at)
    values (saved_id, (wine #>> '{}')::uuid, now())
    on conflict do nothing;
  end loop;

  index_value := 0;
  for photo in select * from jsonb_array_elements(coalesce(payload->'photos', '[]'::jsonb)) loop
    insert into public.trip_photos (trip_id, storage_path, caption, position)
    values (saved_id, photo->>'storagePath', nullif(photo->>'caption', ''), index_value);
    index_value := index_value + 1;
  end loop;

  return saved_id;
end
$$;

revoke all on function public.atlas_save_trip(uuid, jsonb) from public;
grant execute on function public.atlas_save_trip(uuid, jsonb) to authenticated;

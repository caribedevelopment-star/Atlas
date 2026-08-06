begin;

create or replace function public.atlas_reorder_trip_stops(target_trip_id uuid, ordered_stop_ids uuid[])
returns void
language plpgsql
security definer
set search_path=public,pg_temp
as $$
declare
  stop_id uuid;
  position_value integer := 0;
begin
  if not exists(select 1 from public.trips where id=target_trip_id and user_id=auth.uid()) then
    raise exception 'Trip not found or forbidden';
  end if;

  if cardinality(ordered_stop_ids) != (select count(*) from public.trip_stops where trip_id=target_trip_id)
    or cardinality(ordered_stop_ids) != (select count(distinct item) from unnest(ordered_stop_ids) as item)
    or exists(
      select 1 from unnest(ordered_stop_ids) as item
      where not exists(select 1 from public.trip_stops where id=item and trip_id=target_trip_id)
    ) then
    raise exception 'Stop list is incomplete or contains duplicates';
  end if;

  update public.trip_stops set position=position+100000 where trip_id=target_trip_id;
  foreach stop_id in array ordered_stop_ids loop
    update public.trip_stops
      set position=position_value,updated_at=now()
      where id=stop_id and trip_id=target_trip_id;
    position_value := position_value+1;
  end loop;
end
$$;

revoke all on function public.atlas_reorder_trip_stops(uuid,uuid[]) from public;
grant execute on function public.atlas_reorder_trip_stops(uuid,uuid[]) to authenticated;

commit;

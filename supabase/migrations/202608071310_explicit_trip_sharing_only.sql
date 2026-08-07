-- Trips behave like memories: private by default, visible only to explicitly selected participants.
create or replace function public.atlas_trip_can_view_explicit(target_trip_id uuid, owner_id uuid, viewer_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select viewer_id is not null and (
    viewer_id = owner_id
    or exists (
      select 1 from public.trip_participants p
      where p.trip_id = target_trip_id and p.user_id = viewer_id
    )
  )
$$;

grant execute on function public.atlas_trip_can_view_explicit(uuid, uuid, uuid) to authenticated;

update public.trips t
set visibility = case
  when exists (select 1 from public.trip_participants p where p.trip_id = t.id) then 'friends'::public.atlas_visibility
  else 'private'::public.atlas_visibility
end
where t.visibility = 'public'::public.atlas_visibility;

drop policy if exists trips_select on public.trips;
create policy trips_select on public.trips
  for select to authenticated
  using (public.atlas_trip_can_view_explicit(id, user_id));

do $$
declare table_name text;
begin
  foreach table_name in array array['trip_stops','trip_participants','trip_wines','trip_photos'] loop
    execute format('drop policy if exists %I_select on public.%I', table_name, table_name);
    execute format(
      'create policy %I_select on public.%I for select to authenticated using (exists (select 1 from public.trips t where t.id=trip_id and public.atlas_trip_can_view_explicit(t.id,t.user_id)))',
      table_name, table_name
    );
  end loop;
end $$;

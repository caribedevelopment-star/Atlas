revoke execute on function public.atlas_save_trip(uuid, jsonb) from anon;
revoke execute on function public.atlas_save_trip(uuid, jsonb) from public;
grant execute on function public.atlas_save_trip(uuid, jsonb) to authenticated;

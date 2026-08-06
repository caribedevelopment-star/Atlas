begin;

alter table public.trips
  add column if not exists gallery_url text
  check (gallery_url is null or gallery_url ~ '^https://');

comment on column public.trips.gallery_url is
  'Optional user-provided HTTPS link to an external trip gallery.';

commit;

begin;

create extension if not exists pgcrypto;
create table if not exists public.friendships(id uuid primary key default gen_random_uuid(),requester_id uuid not null references auth.users(id) on delete cascade,addressee_id uuid not null references auth.users(id) on delete cascade,status text not null default 'pending' check(status in ('pending','accepted','rejected','blocked')),created_at timestamptz not null default now(),updated_at timestamptz not null default now(),check(requester_id<>addressee_id),unique(requester_id,addressee_id));

create or replace function public.atlas_are_friends(first_user uuid,second_user uuid) returns boolean language sql stable security definer set search_path=public,pg_temp as $$
  select first_user is not null and second_user is not null and exists(select 1 from public.friendships f where f.status='accepted' and ((f.requester_id=first_user and f.addressee_id=second_user) or (f.requester_id=second_user and f.addressee_id=first_user)));
$$;

alter table public.wines add column if not exists user_id uuid references auth.users(id) on delete set null;
alter table public.wines add column if not exists image_path text;
alter table public.wines add column if not exists photo_paths text[] not null default '{}';
alter table public.wines add column if not exists denomination text;
alter table public.wines add column if not exists description text;
create table if not exists public.atlas_migration_audit(id bigserial primary key,migration text not null,metric text not null,value bigint not null,created_at timestamptz not null default now());
do $$ declare normalized_count bigint:=0; begin
  update public.wines set image_path=case
    when image_url like 'wine-photos/%' then substring(image_url from length('wine-photos/')+1)
    when image_url ~ '/storage/v1/(object|render/image)/(public|sign|authenticated)/wine-photos/' then regexp_replace(image_url,'^.*?/wine-photos/','')
    else image_url end
  where image_path is null and image_url is not null and (image_url like 'wine-photos/%' or image_url ~ '/storage/v1/(object|render/image)/(public|sign|authenticated)/wine-photos/');
  get diagnostics normalized_count=row_count;
  insert into public.atlas_migration_audit(migration,metric,value) values('202608060300','historical_wine_photos_normalized',normalized_count);
end $$;

create table if not exists public.user_wines (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  wine_id uuid not null references public.wines(id) on delete cascade, favorite boolean not null default false,
  rating numeric check (rating between 0 and 5), tasting_notes text, date_tasted date,
  purchase_price numeric check (purchase_price >= 0), purchase_location text, shop text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(user_id,wine_id)
);
create index if not exists user_wines_user_idx on public.user_wines(user_id,created_at desc);

alter table public.library_items add column if not exists user_id uuid references auth.users(id) on delete set null;
alter table public.library_items add column if not exists cover_path text;
alter table public.library_items add column if not exists public_url text;
alter table public.library_items add column if not exists visibility text not null default 'public' check (visibility in ('private','friends','public'));
create table if not exists public.user_library_items (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  library_item_id uuid not null references public.library_items(id) on delete cascade,
  saved boolean not null default true, favorite boolean not null default false,
  reading_progress integer not null default 0 check (reading_progress between 0 and 100),
  personal_notes text, completed boolean not null default false, date_added timestamptz not null default now(),
  unique(user_id,library_item_id)
);

alter table public.wines enable row level security;
alter table public.user_wines enable row level security;
alter table public.library_items enable row level security;
alter table public.user_library_items enable row level security;

do $$ declare policy_row record; begin
  for policy_row in select schemaname,tablename,policyname from pg_policies where schemaname='public' and tablename in ('wines','user_wines','library_items','user_library_items') loop
    execute format('drop policy if exists %I on %I.%I',policy_row.policyname,policy_row.schemaname,policy_row.tablename);
  end loop;
end $$;

drop policy if exists atlas_wines_authenticated_read on public.wines;
create policy atlas_wines_authenticated_read on public.wines for select to authenticated using (true);
drop policy if exists atlas_wines_authenticated_insert on public.wines;
create policy atlas_wines_authenticated_insert on public.wines for insert to authenticated with check (user_id=auth.uid());
drop policy if exists atlas_wines_owner_update on public.wines;
create policy atlas_wines_owner_update on public.wines for update to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());
drop policy if exists atlas_wines_owner_delete on public.wines;
create policy atlas_wines_owner_delete on public.wines for delete to authenticated using (user_id=auth.uid());

drop policy if exists atlas_user_wines_owner_all on public.user_wines;
create policy atlas_user_wines_owner_all on public.user_wines for all to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());
drop policy if exists atlas_library_authenticated_read on public.library_items;
create policy atlas_library_authenticated_read on public.library_items for select to authenticated using (visibility='public' or user_id=auth.uid());
drop policy if exists atlas_library_authenticated_insert on public.library_items;
create policy atlas_library_authenticated_insert on public.library_items for insert to authenticated with check (user_id=auth.uid());
drop policy if exists atlas_library_owner_update on public.library_items;
create policy atlas_library_owner_update on public.library_items for update to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());
drop policy if exists atlas_user_library_owner_all on public.user_library_items;
create policy atlas_user_library_owner_all on public.user_library_items for all to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());

alter table public.memories add column if not exists visibility text not null default 'private' check(visibility in ('private','friends','public'));
alter table public.memories enable row level security;
do $$ declare policy_row record; begin for policy_row in select policyname from pg_policies where schemaname='public' and tablename='memories' loop execute format('drop policy if exists %I on public.memories',policy_row.policyname);end loop;end $$;
create policy atlas_memories_authorized_read on public.memories for select to authenticated using(user_id=auth.uid() or visibility='public' or (visibility='friends' and public.atlas_are_friends(user_id,auth.uid())));
create policy atlas_memories_owner_insert on public.memories for insert to authenticated with check(user_id=auth.uid());
create policy atlas_memories_owner_update on public.memories for update to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy atlas_memories_owner_delete on public.memories for delete to authenticated using(user_id=auth.uid());

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('wine-photos','wine-photos',false,12582912,array['image/jpeg','image/png','image/webp','image/heic','image/heif'])
on conflict(id) do nothing;
drop policy if exists atlas_wine_photos_authenticated_read on storage.objects;
create policy atlas_wine_photos_authenticated_read on storage.objects for select to authenticated using (bucket_id='wine-photos');
drop policy if exists atlas_wine_photos_owner_insert on storage.objects;
create policy atlas_wine_photos_owner_insert on storage.objects for insert to authenticated with check (bucket_id='wine-photos' and (storage.foldername(name))[1]=auth.uid()::text);
drop policy if exists atlas_wine_photos_owner_update on storage.objects;
create policy atlas_wine_photos_owner_update on storage.objects for update to authenticated using (bucket_id='wine-photos' and owner_id=auth.uid()::text);
drop policy if exists atlas_wine_photos_owner_delete on storage.objects;
create policy atlas_wine_photos_owner_delete on storage.objects for delete to authenticated using (bucket_id='wine-photos' and owner_id=auth.uid()::text);

commit;

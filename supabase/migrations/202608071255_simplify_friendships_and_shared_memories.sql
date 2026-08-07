-- Atlas social model: mutual friends only, no followers.
-- Friends are used to explicitly share memories/trips; public catalogues remain independent.

create table if not exists public.friendships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles(id) on delete cascade,
  addressee_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','accepted','declined')),
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  check (requester_id <> addressee_id)
);

create unique index if not exists friendships_unique_pair_idx
  on public.friendships (least(requester_id, addressee_id), greatest(requester_id, addressee_id));
create index if not exists friendships_requester_idx on public.friendships(requester_id, status);
create index if not exists friendships_addressee_idx on public.friendships(addressee_id, status);

alter table public.friendships enable row level security;
drop policy if exists "friendships_read_participants" on public.friendships;
create policy "friendships_read_participants" on public.friendships
  for select to authenticated
  using (auth.uid() = requester_id or auth.uid() = addressee_id);

create or replace function public.atlas_send_friend_request(target_user_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid := auth.uid();
  existing public.friendships%rowtype;
  friendship_id uuid;
begin
  if me is null then raise exception 'AUTH_REQUIRED'; end if;
  if target_user_id is null or target_user_id = me then raise exception 'INVALID_FRIEND'; end if;
  if not exists (select 1 from public.profiles where id = target_user_id) then raise exception 'PROFILE_NOT_FOUND'; end if;

  select * into existing
  from public.friendships
  where (requester_id = me and addressee_id = target_user_id)
     or (requester_id = target_user_id and addressee_id = me)
  limit 1;

  if found then
    if existing.status = 'accepted' then return existing.id; end if;
    if existing.status = 'pending' then
      if existing.addressee_id = me then
        update public.friendships set status = 'accepted', responded_at = now() where id = existing.id;
      end if;
      return existing.id;
    end if;
    update public.friendships
      set requester_id = me, addressee_id = target_user_id, status = 'pending', created_at = now(), responded_at = null
      where id = existing.id;
    return existing.id;
  end if;

  insert into public.friendships(requester_id, addressee_id, status)
  values (me, target_user_id, 'pending') returning id into friendship_id;
  return friendship_id;
end;
$$;

create or replace function public.atlas_respond_friend_request(friendship_id uuid, accept_request boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
  update public.friendships
     set status = case when accept_request then 'accepted' else 'declined' end,
         responded_at = now()
   where id = friendship_id
     and addressee_id = auth.uid()
     and status = 'pending';
  if not found then raise exception 'REQUEST_NOT_AVAILABLE'; end if;
end;
$$;

create or replace function public.atlas_remove_friend(friend_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
  delete from public.friendships
   where status = 'accepted'
     and ((requester_id = auth.uid() and addressee_id = friend_user_id)
       or (addressee_id = auth.uid() and requester_id = friend_user_id));
end;
$$;

grant execute on function public.atlas_send_friend_request(uuid) to authenticated;
grant execute on function public.atlas_respond_friend_request(uuid, boolean) to authenticated;
grant execute on function public.atlas_remove_friend(uuid) to authenticated;

-- Preserve genuinely mutual legacy circle relationships as accepted friendships.
insert into public.friendships(requester_id, addressee_id, status, created_at, responded_at)
select least(a.user_id, a.target_user_id), greatest(a.user_id, a.target_user_id), 'accepted', least(a.created_at, b.created_at), now()
from public.user_relationships a
join public.user_relationships b
  on b.user_id = a.target_user_id and b.target_user_id = a.user_id
where a.relationship = 'circle' and b.relationship = 'circle' and a.user_id < a.target_user_id
on conflict do nothing;

-- A one-way legacy circle becomes a pending friend request. Legacy "network/following" is intentionally not migrated.
insert into public.friendships(requester_id, addressee_id, status, created_at)
select r.user_id, r.target_user_id, 'pending', r.created_at
from public.user_relationships r
where r.relationship = 'circle'
  and not exists (
    select 1 from public.user_relationships reciprocal
    where reciprocal.user_id = r.target_user_id
      and reciprocal.target_user_id = r.user_id
      and reciprocal.relationship = 'circle'
  )
  and not exists (
    select 1 from public.friendships f
    where (f.requester_id = r.user_id and f.addressee_id = r.target_user_id)
       or (f.requester_id = r.target_user_id and f.addressee_id = r.user_id)
  )
on conflict do nothing;

-- Align the memories table with the UI and make explicit sharing the only non-owner access path.
alter table public.memories add column if not exists location_name text;
alter table public.memories add column if not exists city text;
alter table public.memories add column if not exists country text;
alter table public.memories add column if not exists memory_date date;
alter table public.memories add column if not exists category text;
alter table public.memories add column if not exists route jsonb not null default '[]'::jsonb;
alter table public.memories add column if not exists wine_id uuid;
alter table public.memories add column if not exists is_restaurant boolean not null default false;
alter table public.memories add column if not exists favorite boolean not null default false;
alter table public.memories add column if not exists trip_id uuid;

update public.memories
set visibility = case when cardinality(coalesce(shared_with, '{}'::uuid[])) > 0 then 'friends' else 'private' end
where visibility is null or visibility not in ('private','friends');

drop policy if exists "Los usuarios ven solo sus memorias" on public.memories;
drop policy if exists "memories_select_shared" on public.memories;
create policy "memories_select_shared" on public.memories
  for select to authenticated
  using (
    auth.uid() = user_id
    or auth.uid() = any(coalesce(shared_with, '{}'::uuid[]))
  );

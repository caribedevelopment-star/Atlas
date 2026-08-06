begin;
create table if not exists public.friendships (
  id uuid primary key default gen_random_uuid(), requester_id uuid not null references auth.users(id) on delete cascade,
  addressee_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check(status in ('pending','accepted','rejected','blocked')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  check(requester_id<>addressee_id), unique(requester_id,addressee_id)
);
create index if not exists friendships_addressee_idx on public.friendships(addressee_id,status);
alter table public.friendships enable row level security;
drop policy if exists friendships_participant_read on public.friendships;
create policy friendships_participant_read on public.friendships for select to authenticated using(auth.uid() in (requester_id,addressee_id));
drop policy if exists friendships_request on public.friendships;
create policy friendships_request on public.friendships for insert to authenticated with check(requester_id=auth.uid() and status='pending');
drop policy if exists friendships_participant_update on public.friendships;
create policy friendships_participant_update on public.friendships for update to authenticated using(auth.uid() in (requester_id,addressee_id)) with check(auth.uid() in (requester_id,addressee_id));
drop policy if exists friendships_participant_delete on public.friendships;
create policy friendships_participant_delete on public.friendships for delete to authenticated using(auth.uid() in (requester_id,addressee_id));
commit;

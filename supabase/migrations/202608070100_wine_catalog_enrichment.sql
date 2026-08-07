-- Atlas wine catalog enrichment pipeline
-- Adds enrichment state, review queue, secure cron invocation and admin review RPC.

create extension if not exists pg_cron;
create extension if not exists pg_net;
create extension if not exists supabase_vault;

alter table public.wines
  add column if not exists canonical_image_url text,
  add column if not exists canonical_image_path text,
  add column if not exists enrichment_status text not null default 'pending',
  add column if not exists enrichment_confidence numeric(5,4),
  add column if not exists enrichment_source text,
  add column if not exists enrichment_source_url text,
  add column if not exists enrichment_license text,
  add column if not exists enrichment_error text,
  add column if not exists enrichment_attempts integer not null default 0,
  add column if not exists enriched_at timestamptz;

alter table public.wines drop constraint if exists wines_enrichment_status_check;
alter table public.wines
  add constraint wines_enrichment_status_check
  check (enrichment_status in ('pending','matched','needs_review','no_match','failed'));

create table if not exists public.wine_enrichment_reviews (
  id uuid primary key default gen_random_uuid(),
  wine_id uuid not null references public.wines(id) on delete cascade,
  provider_name text not null,
  proposed_image_url text not null,
  source_url text,
  source_license text,
  confidence numeric(5,4) not null,
  proposed_payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (wine_id, provider_name, proposed_image_url)
);

alter table public.wine_enrichment_reviews enable row level security;

drop policy if exists "Admins can read wine enrichment reviews" on public.wine_enrichment_reviews;
create policy "Admins can read wine enrichment reviews"
  on public.wine_enrichment_reviews for select
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Admins can update wine enrichment reviews" on public.wine_enrichment_reviews;
create policy "Admins can update wine enrichment reviews"
  on public.wine_enrichment_reviews for update
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create or replace function public.atlas_queue_wine_enrichment()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    if coalesce(new.is_popular, false) and new.canonical_image_url is null and new.canonical_image_path is null then
      new.enrichment_status := 'pending';
      new.enrichment_error := null;
    end if;
  elsif (new.name, coalesce(new.winery,''), coalesce(new.vintage,0))
        is distinct from
        (old.name, coalesce(old.winery,''), coalesce(old.vintage,0)) then
    new.enrichment_status := 'pending';
    new.enrichment_confidence := null;
    new.enrichment_source := null;
    new.enrichment_source_url := null;
    new.enrichment_license := null;
    new.enrichment_error := null;
    new.enriched_at := null;
  end if;
  return new;
end;
$$;

drop trigger if exists wines_queue_enrichment on public.wines;
create trigger wines_queue_enrichment
before insert or update of name, winery, vintage on public.wines
for each row execute function public.atlas_queue_wine_enrichment();

-- Remove generic stock photography from the seeded public catalog. Real user uploads and
-- winery-specific URLs are preserved.
update public.wines
set image_url = null,
    enrichment_status = 'pending',
    enrichment_error = null
where coalesce(is_popular, false)
  and image_url ilike '%images.unsplash.com%';

-- Existing public catalog rows should be eligible for automated enrichment.
update public.wines
set enrichment_status = 'pending'
where coalesce(is_popular, false)
  and canonical_image_url is null
  and canonical_image_path is null;

-- Vault entries used by pg_cron. No service-role key is stored in Vault: the Edge Function
-- uses Supabase's built-in server environment and a dedicated random cron secret instead.
do $$
begin
  if not exists (select 1 from vault.decrypted_secrets where name = 'project_url') then
    perform vault.create_secret('https://bybwmdnspjqrebvomijf.supabase.co', 'project_url');
  end if;
  if not exists (select 1 from vault.decrypted_secrets where name = 'atlas_wine_enrichment_cron_secret') then
    perform vault.create_secret(encode(gen_random_bytes(32), 'hex'), 'atlas_wine_enrichment_cron_secret');
  end if;
end $$;

create or replace function public.atlas_get_wine_enrichment_cron_secret()
returns text
language sql
security definer
set search_path = public, vault
as $$
  select decrypted_secret
  from vault.decrypted_secrets
  where name = 'atlas_wine_enrichment_cron_secret'
  limit 1;
$$;

revoke all on function public.atlas_get_wine_enrichment_cron_secret() from public, anon, authenticated;
grant execute on function public.atlas_get_wine_enrichment_cron_secret() to service_role;

create or replace function public.atlas_review_wine_enrichment(
  review_id uuid,
  decision text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  review_row public.wine_enrichment_reviews%rowtype;
begin
  if (auth.jwt() -> 'app_metadata' ->> 'role') <> 'admin' then
    raise exception 'ADMIN_REQUIRED';
  end if;
  if decision not in ('approved','rejected') then
    raise exception 'INVALID_DECISION';
  end if;

  select * into review_row
  from public.wine_enrichment_reviews
  where id = review_id and status = 'pending'
  for update;

  if not found then
    raise exception 'REVIEW_NOT_FOUND';
  end if;

  update public.wine_enrichment_reviews
  set status = decision,
      reviewed_by = auth.uid(),
      reviewed_at = now()
  where id = review_id;

  if decision = 'approved' then
    update public.wines
    set canonical_image_url = review_row.proposed_image_url,
        enrichment_status = 'matched',
        enrichment_confidence = review_row.confidence,
        enrichment_source = review_row.provider_name,
        enrichment_source_url = review_row.source_url,
        enrichment_license = review_row.source_license,
        enrichment_error = null,
        enriched_at = now()
    where id = review_row.wine_id;
  else
    update public.wines
    set enrichment_status = 'no_match',
        enrichment_error = 'Candidate rejected by administrator',
        enriched_at = now()
    where id = review_row.wine_id;
  end if;
end;
$$;

revoke all on function public.atlas_review_wine_enrichment(uuid, text) from public, anon;
grant execute on function public.atlas_review_wine_enrichment(uuid, text) to authenticated;

-- Replace any older job with the same name.
do $$
declare
  existing_job bigint;
begin
  select jobid into existing_job from cron.job where jobname = 'atlas-enrich-wine-catalog' limit 1;
  if existing_job is not null then
    perform cron.unschedule(existing_job);
  end if;
end $$;

select cron.schedule(
  'atlas-enrich-wine-catalog',
  '*/30 * * * *',
  $cron$
    select net.http_post(
      url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url' limit 1)
             || '/functions/v1/enrich-wine-catalog',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-atlas-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'atlas_wine_enrichment_cron_secret' limit 1)
      ),
      body := '{"source":"cron","limit":5}'::jsonb
    );
  $cron$
);

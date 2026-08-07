begin;

create extension if not exists pg_cron;
create extension if not exists pg_net;
create extension if not exists supabase_vault;

do $$ begin
  create type public.wine_enrichment_status as enum ('pending','matched','needs_review','no_match','failed');
exception when duplicate_object then null;
end $$;

alter table public.wines add column if not exists enrichment_status public.wine_enrichment_status not null default 'pending';
alter table public.wines add column if not exists enrichment_confidence numeric check (enrichment_confidence between 0 and 1);
alter table public.wines add column if not exists enrichment_source text;
alter table public.wines add column if not exists canonical_image_url text;
alter table public.wines add column if not exists enriched_at timestamptz;
alter table public.wines add column if not exists catalog_identity text;
alter table public.user_wines add column if not exists image_path text;
alter table public.user_wines add column if not exists photo_paths text[] not null default '{}';

create index if not exists wines_enrichment_queue_idx
  on public.wines(enrichment_status,created_at)
  where canonical_image_url is null and image_path is null;

with identities as (
  select id,lower(regexp_replace(trim(name),'\s+',' ','g')) || '|' || lower(regexp_replace(trim(coalesce(winery,'')),'\s+',' ','g')) || '|' || coalesce(vintage::text,'') as identity,
    row_number() over(partition by lower(trim(name)),lower(trim(coalesce(winery,''))),vintage order by created_at,id) as row_number
  from public.wines
)
update public.wines wine set catalog_identity=identities.identity
from identities where wine.id=identities.id and identities.row_number=1 and wine.catalog_identity is null;
create unique index if not exists wines_catalog_identity_unique on public.wines(catalog_identity) where catalog_identity is not null;

create table if not exists public.wine_enrichment_candidates (
  id uuid primary key default gen_random_uuid(),
  wine_id uuid not null references public.wines(id) on delete cascade,
  proposed_image_url text not null check (proposed_image_url ~ '^https://'),
  source_name text not null,
  source_url text not null check (source_url ~ '^https://'),
  source_license text not null,
  confidence numeric not null check (confidence between 0 and 1),
  metadata jsonb not null default '{}',
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  unique(wine_id,proposed_image_url)
);

create or replace function public.atlas_is_admin()
returns boolean language sql stable security definer set search_path=public,pg_temp as $$
  select coalesce(auth.jwt()->'app_metadata'->>'role','') = 'admin';
$$;
revoke all on function public.atlas_is_admin() from public;
grant execute on function public.atlas_is_admin() to authenticated;

alter table public.wine_enrichment_candidates enable row level security;
drop policy if exists atlas_enrichment_candidates_admin_read on public.wine_enrichment_candidates;
create policy atlas_enrichment_candidates_admin_read on public.wine_enrichment_candidates
  for select to authenticated using (public.atlas_is_admin());

create or replace function public.atlas_review_wine_enrichment(candidate_id uuid, approved boolean)
returns void language plpgsql security definer set search_path=public,pg_temp as $$
declare candidate public.wine_enrichment_candidates;
begin
  if not public.atlas_is_admin() then raise exception 'Admin access required'; end if;
  select * into candidate from public.wine_enrichment_candidates where id=candidate_id and status='pending' for update;
  if not found then raise exception 'Candidate not found'; end if;

  update public.wine_enrichment_candidates
    set status=case when approved then 'approved' else 'rejected' end,reviewed_by=auth.uid(),reviewed_at=now()
    where id=candidate_id;
  update public.wines set
    canonical_image_url=case when approved and image_path is null then candidate.proposed_image_url else canonical_image_url end,
    country=case when approved then coalesce(country,nullif(candidate.metadata->>'country','')) else country end,
    region=case when approved then coalesce(region,nullif(candidate.metadata->>'region','')) else region end,
    denomination=case when approved then coalesce(denomination,nullif(candidate.metadata->>'denomination','')) else denomination end,
    description=case when approved then coalesce(description,nullif(candidate.metadata->>'description','')) else description end,
    grapes=case when approved and coalesce(cardinality(grapes),0)=0 and jsonb_typeof(candidate.metadata->'grapes')='array' then array(select jsonb_array_elements_text(candidate.metadata->'grapes')) else grapes end,
    enrichment_status=case when approved then 'matched'::public.wine_enrichment_status else 'no_match'::public.wine_enrichment_status end,
    enrichment_confidence=candidate.confidence,enrichment_source=candidate.source_name,enriched_at=now()
    where id=candidate.wine_id;
end $$;
revoke all on function public.atlas_review_wine_enrichment(uuid,boolean) from public;
grant execute on function public.atlas_review_wine_enrichment(uuid,boolean) to authenticated;

-- The secrets must be created once in Supabase Vault as project_url and
-- service_role_key. Missing secrets safely skip a run instead of exposing keys.
create or replace function public.atlas_invoke_wine_enrichment()
returns void language plpgsql security definer set search_path=public,extensions,net,vault,pg_temp as $$
declare project_url text; service_key text;
begin
  select decrypted_secret into project_url from vault.decrypted_secrets where name='project_url' limit 1;
  select decrypted_secret into service_key from vault.decrypted_secrets where name='service_role_key' limit 1;
  if project_url is null or service_key is null then return; end if;
  perform net.http_post(
    url:=project_url || '/functions/v1/enrich-wine-catalog',
    headers:=jsonb_build_object('Authorization','Bearer ' || service_key,'Content-Type','application/json'),
    body:='{"batchSize":10}'::jsonb
  );
end $$;
revoke all on function public.atlas_invoke_wine_enrichment() from public;

create or replace function public.atlas_queue_new_wine_enrichment()
returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
begin
  perform public.atlas_invoke_wine_enrichment();
  return new;
end $$;
drop trigger if exists atlas_queue_wine_enrichment on public.wines;
create trigger atlas_queue_wine_enrichment after insert on public.wines
  for each row when (new.canonical_image_url is null and new.image_path is null)
  execute function public.atlas_queue_new_wine_enrichment();

do $$ begin
  perform cron.unschedule('atlas-enrich-wine-catalog');
exception when others then null;
end $$;
select cron.schedule('atlas-enrich-wine-catalog','17 * * * *','select public.atlas_invoke_wine_enrichment();');

commit;

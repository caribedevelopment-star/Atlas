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
  if (auth.jwt() -> 'app_metadata' ->> 'role') is distinct from 'admin' then
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

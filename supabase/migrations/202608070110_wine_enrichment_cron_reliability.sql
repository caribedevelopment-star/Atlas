-- Keep each cron request short enough for pg_net's HTTP timeout and process one wine per minute.
do $$
declare existing_job bigint;
begin
  select jobid into existing_job from cron.job where jobname='atlas-enrich-wine-catalog' limit 1;
  if existing_job is not null then perform cron.unschedule(existing_job); end if;
end $$;

select cron.schedule(
  'atlas-enrich-wine-catalog',
  '* * * * *',
  $cron$
    select net.http_post(
      url := (select decrypted_secret from vault.decrypted_secrets where name='project_url' limit 1) || '/functions/v1/enrich-wine-catalog',
      headers := jsonb_build_object(
        'Content-Type','application/json',
        'x-atlas-cron-secret',(select decrypted_secret from vault.decrypted_secrets where name='atlas_wine_enrichment_cron_secret' limit 1)
      ),
      body := '{"source":"cron","limit":1}'::jsonb
    );
  $cron$
);

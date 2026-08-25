-- Atlas wine geography and multi-photo library.
-- Reference catalog rows are read-only to clients; service_role owns future eAmbrosia syncs.

create table if not exists public.wine_denominations (
  id text primary key,
  name text not null,
  country_code text not null check (country_code in ('ES', 'IT', 'FR')),
  country text not null,
  classification text not null,
  official_id text,
  source_url text not null default 'https://ec.europa.eu/agriculture/eambrosia/geographical-indications-register/',
  latitude double precision check (latitude between -90 and 90),
  longitude double precision check (longitude between -180 and 180),
  radius_m integer check (radius_m between 5000 and 250000),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.wine_denominations drop constraint if exists wine_denominations_country_name_key;
alter table public.wine_denominations add constraint wine_denominations_country_name_key unique (country_code, name);
create index if not exists wine_denominations_country_idx
  on public.wine_denominations (country_code) where active;

alter table public.wine_denominations enable row level security;
drop policy if exists "Wine denominations are readable" on public.wine_denominations;
create policy "Wine denominations are readable"
  on public.wine_denominations for select
  to anon, authenticated
  using (active);

revoke all on table public.wine_denominations from anon, authenticated;
grant select on table public.wine_denominations to anon, authenticated;
grant all on table public.wine_denominations to service_role;

insert into public.wine_denominations
  (id, name, country_code, country, classification, latitude, longitude, radius_m)
values
  ('es-rioja', 'Rioja', 'ES', 'España', 'DOCa', 42.466, -2.445, 72000),
  ('es-ribera-duero', 'Ribera del Duero', 'ES', 'España', 'DO', 41.671, -3.689, 76000),
  ('es-priorat', 'Priorat', 'ES', 'España', 'DOCa', 41.145, 0.821, 36000),
  ('es-cava', 'Cava', 'ES', 'España', 'DO', 41.423, 1.785, 52000),
  ('es-rias-baixas', 'Rías Baixas', 'ES', 'España', 'DO', 42.438, -8.716, 56000),
  ('es-rueda', 'Rueda', 'ES', 'España', 'DO', 41.414, -4.958, 56000),
  ('es-toro', 'Toro', 'ES', 'España', 'DO', 41.524, -5.395, 47000),
  ('es-bierzo', 'Bierzo', 'ES', 'España', 'DO', 42.572, -6.643, 50000),
  ('es-jumilla', 'Jumilla', 'ES', 'España', 'DO', 38.479, -1.325, 52000),
  ('es-la-mancha', 'La Mancha', 'ES', 'España', 'DO', 39.198, -3.175, 135000),
  ('es-jerez', 'Jerez-Xérès-Sherry', 'ES', 'España', 'DO', 36.686, -6.137, 52000),
  ('es-montilla-moriles', 'Montilla-Moriles', 'ES', 'España', 'DO', 37.586, -4.639, 46000),
  ('es-navarra', 'Navarra', 'ES', 'España', 'DO', 42.612, -1.674, 76000),
  ('es-penedes', 'Penedès', 'ES', 'España', 'DO', 41.346, 1.699, 50000),
  ('es-somontano', 'Somontano', 'ES', 'España', 'DO', 42.036, 0.126, 44000),
  ('es-valdeorras', 'Valdeorras', 'ES', 'España', 'DO', 42.391, -6.989, 36000),
  ('es-ribeiro', 'Ribeiro', 'ES', 'España', 'DO', 42.289, -8.143, 35000),
  ('es-ribeira-sacra', 'Ribeira Sacra', 'ES', 'España', 'DO', 42.466, -7.623, 43000),
  ('es-monterrei', 'Monterrei', 'ES', 'España', 'DO', 41.948, -7.449, 34000),
  ('es-txakoli-getaria', 'Getariako Txakolina', 'ES', 'España', 'DO', 43.294, -2.203, 28000),
  ('es-alicante', 'Alicante', 'ES', 'España', 'DO', 38.424, -0.735, 76000),
  ('es-valencia', 'Valencia', 'ES', 'España', 'DO', 39.41, -0.68, 79000),
  ('es-utiel-requena', 'Utiel-Requena', 'ES', 'España', 'DO', 39.566, -1.204, 57000),
  ('es-ucles', 'Uclés', 'ES', 'España', 'DO', 39.981, -2.861, 43000),
  ('es-manchuela', 'Manchuela', 'ES', 'España', 'DO', 39.252, -1.522, 65000),
  ('es-malaga', 'Málaga', 'ES', 'España', 'DO', 36.761, -4.421, 62000),
  ('es-catalunya', 'Catalunya', 'ES', 'España', 'DO', 41.73, 1.53, 110000),
  ('es-terra-alta', 'Terra Alta', 'ES', 'España', 'DO', 41.038, 0.432, 41000),
  ('es-costers-segre', 'Costers del Segre', 'ES', 'España', 'DO', 41.67, 0.735, 80000),
  ('es-emporda', 'Empordà', 'ES', 'España', 'DO', 42.247, 3.032, 50000),
  ('es-bullas', 'Bullas', 'ES', 'España', 'DO', 38.047, -1.672, 35000),
  ('es-yecla', 'Yecla', 'ES', 'España', 'DO', 38.613, -1.115, 30000),
  ('es-calatayud', 'Calatayud', 'ES', 'España', 'DO', 41.354, -1.642, 47000),
  ('es-campo-borja', 'Campo de Borja', 'ES', 'España', 'DO', 41.83, -1.522, 43000),
  ('es-carinena', 'Cariñena', 'ES', 'España', 'DO', 41.338, -1.224, 45000),
  ('es-vinos-madrid', 'Vinos de Madrid', 'ES', 'España', 'DO', 40.28, -3.87, 68000),
  ('it-barolo', 'Barolo', 'IT', 'Italia', 'DOCG', 44.61, 7.94, 26000),
  ('it-barbaresco', 'Barbaresco', 'IT', 'Italia', 'DOCG', 44.724, 8.082, 21000),
  ('it-chianti-classico', 'Chianti Classico', 'IT', 'Italia', 'DOCG', 43.515, 11.31, 44000),
  ('it-brunello', 'Brunello di Montalcino', 'IT', 'Italia', 'DOCG', 43.058, 11.489, 28000),
  ('it-amarone', 'Amarone della Valpolicella', 'IT', 'Italia', 'DOCG', 45.52, 10.88, 36000),
  ('it-prosecco', 'Prosecco', 'IT', 'Italia', 'DOC', 45.876, 12.214, 76000),
  ('it-soave', 'Soave', 'IT', 'Italia', 'DOC', 45.421, 11.246, 27000),
  ('it-franciacorta', 'Franciacorta', 'IT', 'Italia', 'DOCG', 45.609, 10.006, 27000),
  ('it-etna', 'Etna', 'IT', 'Italia', 'DOC', 37.75, 15.0, 44000),
  ('it-sicilia', 'Sicilia', 'IT', 'Italia', 'DOC', 37.58, 14.08, 132000),
  ('it-primitivo-manduria', 'Primitivo di Manduria', 'IT', 'Italia', 'DOC', 40.401, 17.633, 42000),
  ('it-taurasi', 'Taurasi', 'IT', 'Italia', 'DOCG', 41.006, 14.955, 33000),
  ('it-verdicchio-castelli-jesi', 'Verdicchio dei Castelli di Jesi', 'IT', 'Italia', 'DOC', 43.48, 13.08, 51000),
  ('it-montepulciano-abruzzo', 'Montepulciano d’Abruzzo', 'IT', 'Italia', 'DOC', 42.26, 13.88, 78000),
  ('it-gavi', 'Gavi', 'IT', 'Italia', 'DOCG', 44.689, 8.802, 29000),
  ('it-bolgheri', 'Bolgheri', 'IT', 'Italia', 'DOC', 43.23, 10.62, 26000),
  ('it-vino-nobile', 'Vino Nobile di Montepulciano', 'IT', 'Italia', 'DOCG', 43.098, 11.787, 25000),
  ('it-trento', 'Trento', 'IT', 'Italia', 'DOC', 46.07, 11.12, 56000),
  ('it-alto-adige', 'Alto Adige', 'IT', 'Italia', 'DOC', 46.5, 11.35, 62000),
  ('it-friuli-colli-orientali', 'Friuli Colli Orientali', 'IT', 'Italia', 'DOC', 46.02, 13.42, 42000),
  ('it-lugana', 'Lugana', 'IT', 'Italia', 'DOC', 45.45, 10.62, 27000),
  ('it-lambrusco', 'Lambrusco di Modena', 'IT', 'Italia', 'DOC', 44.65, 10.92, 53000),
  ('it-asti', 'Asti', 'IT', 'Italia', 'DOCG', 44.9, 8.2, 58000),
  ('it-valpolicella', 'Valpolicella', 'IT', 'Italia', 'DOC', 45.52, 10.9, 35000),
  ('it-orvieto', 'Orvieto', 'IT', 'Italia', 'DOC', 42.716, 12.11, 41000),
  ('fr-champagne', 'Champagne', 'FR', 'Francia', 'AOP', 49.054, 4.027, 72000),
  ('fr-bordeaux', 'Bordeaux', 'FR', 'Francia', 'AOP', 44.84, -0.58, 105000),
  ('fr-medoc', 'Médoc', 'FR', 'Francia', 'AOP', 45.22, -0.76, 59000),
  ('fr-saint-emilion', 'Saint-Émilion', 'FR', 'Francia', 'AOP', 44.893, -0.155, 26000),
  ('fr-pomerol', 'Pomerol', 'FR', 'Francia', 'AOP', 44.93, -0.2, 18000),
  ('fr-sauternes', 'Sauternes', 'FR', 'Francia', 'AOP', 44.533, -0.342, 27000),
  ('fr-bourgogne', 'Bourgogne', 'FR', 'Francia', 'AOP', 47.05, 4.84, 105000),
  ('fr-chablis', 'Chablis', 'FR', 'Francia', 'AOP', 47.815, 3.8, 33000),
  ('fr-cote-nuits', 'Côte de Nuits', 'FR', 'Francia', 'AOP', 47.18, 4.95, 31000),
  ('fr-cote-beaune', 'Côte de Beaune', 'FR', 'Francia', 'AOP', 46.99, 4.79, 33000),
  ('fr-beaujolais', 'Beaujolais', 'FR', 'Francia', 'AOP', 46.15, 4.65, 59000),
  ('fr-cotes-rhone', 'Côtes du Rhône', 'FR', 'Francia', 'AOP', 44.42, 4.82, 115000),
  ('fr-chateauneuf', 'Châteauneuf-du-Pape', 'FR', 'Francia', 'AOP', 44.057, 4.832, 22000),
  ('fr-condrieu', 'Condrieu', 'FR', 'Francia', 'AOP', 45.46, 4.77, 18000),
  ('fr-hermitage', 'Hermitage', 'FR', 'Francia', 'AOP', 45.07, 4.84, 18000),
  ('fr-sancerre', 'Sancerre', 'FR', 'Francia', 'AOP', 47.33, 2.84, 35000),
  ('fr-pouilly-fume', 'Pouilly-Fumé', 'FR', 'Francia', 'AOP', 47.28, 2.96, 30000),
  ('fr-vouvray', 'Vouvray', 'FR', 'Francia', 'AOP', 47.41, 0.8, 30000),
  ('fr-muscadet', 'Muscadet Sèvre et Maine', 'FR', 'Francia', 'AOP', 47.11, -1.37, 45000),
  ('fr-chinon', 'Chinon', 'FR', 'Francia', 'AOP', 47.17, 0.24, 37000),
  ('fr-alsace', 'Alsace', 'FR', 'Francia', 'AOP', 48.22, 7.32, 93000),
  ('fr-provence', 'Côtes de Provence', 'FR', 'Francia', 'AOP', 43.43, 6.25, 93000),
  ('fr-bandol', 'Bandol', 'FR', 'Francia', 'AOP', 43.14, 5.75, 25000),
  ('fr-languedoc', 'Languedoc', 'FR', 'Francia', 'AOP', 43.48, 3.37, 118000),
  ('fr-cahors', 'Cahors', 'FR', 'Francia', 'AOP', 44.45, 1.44, 54000),
  ('fr-madiran', 'Madiran', 'FR', 'Francia', 'AOP', 43.55, -0.06, 40000),
  ('fr-jurancon', 'Jurançon', 'FR', 'Francia', 'AOP', 43.23, -0.43, 36000),
  ('fr-banyuls', 'Banyuls', 'FR', 'Francia', 'AOP', 42.48, 3.12, 26000)
on conflict (id) do update set
  name = excluded.name,
  country_code = excluded.country_code,
  country = excluded.country,
  classification = excluded.classification,
  latitude = excluded.latitude,
  longitude = excluded.longitude,
  radius_m = excluded.radius_m,
  active = true,
  updated_at = now();

alter table public.wines
  add column if not exists photo_paths text[] not null default '{}'::text[];

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('wine-photos', 'wine-photos', false, 12582912, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Wine photos are readable by signed-in users" on storage.objects;
create policy "Wine photos are readable by signed-in users"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'wine-photos'
    and (
      owner_id = (select auth.uid())::text
      or exists (
        select 1
        from public.wines wine
        where objects.name = any(coalesce(wine.photo_paths, '{}'::text[]))
           or (objects.bucket_id || '/' || objects.name) = any(coalesce(wine.photo_paths, '{}'::text[]))
           or wine.canonical_image_path = objects.name
           or wine.canonical_image_path = objects.bucket_id || '/' || objects.name
      )
    )
  );

drop policy if exists "Users upload wine photos in own folder" on storage.objects;
create policy "Users upload wine photos in own folder"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'wine-photos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Users update own wine photos" on storage.objects;
create policy "Users update own wine photos"
  on storage.objects for update to authenticated
  using (bucket_id = 'wine-photos' and owner_id = auth.uid()::text)
  with check (bucket_id = 'wine-photos' and owner_id = auth.uid()::text);

drop policy if exists "Users delete own wine photos" on storage.objects;
create policy "Users delete own wine photos"
  on storage.objects for delete to authenticated
  using (bucket_id = 'wine-photos' and owner_id = auth.uid()::text);

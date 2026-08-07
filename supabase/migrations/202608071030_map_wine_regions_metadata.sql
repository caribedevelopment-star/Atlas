alter table public.wines add column if not exists country text;
alter table public.wines add column if not exists region text;
alter table public.wines add column if not exists denomination text;
alter table public.wines add column if not exists grapes text[] not null default '{}'::text[];
alter table public.wines add column if not exists shop text;
alter table public.wines add column if not exists favorite boolean not null default false;
alter table public.wines add column if not exists visibility text not null default 'public';
alter table public.wines add column if not exists latitude double precision;
alter table public.wines add column if not exists longitude double precision;

do $$ begin
  alter table public.wines add constraint wines_visibility_check check (visibility in ('private','friends','public'));
exception when duplicate_object then null; end $$;

create index if not exists wines_denomination_idx on public.wines (denomination) where denomination is not null;
create index if not exists wines_region_idx on public.wines (region) where region is not null;

update public.wines set country='España', region='La Rioja', denomination='DOCa Rioja' where name in ('Azpilicueta Crianza','Coto de Imaz Reserva','Muga Crianza','Ramón Bilbao Crianza','Viña Ardanza Reserva');
update public.wines set country='España', region='Castilla y León', denomination='DO Ribera del Duero' where name in ('Emilio Moro','Protos Roble');
update public.wines set country='España', region='Castilla y León', denomination='DO Rueda' where name in ('Finca del Mar Verdejo','Vivero de la Vega Verdejo');
update public.wines set country='España', region='Murcia', denomination='DO Jumilla' where name in ('Juan Gil Etiqueta Amarilla','Gamellón Monastrell');
update public.wines set country='España', region='Galicia', denomination='DO Rías Baixas' where name in ('Mar de Frades Albariño','Terras Gauda');
update public.wines set country='España', region='Galicia', denomination='DO Monterrei' where name='Pazo de Monterrey Godello';
update public.wines set country='España', region='Navarra', denomination='DO Navarra' where name='Mezquiriz Crianza';
update public.wines set country='España', region='Castilla-La Mancha', denomination='DO Uclés' where name='Finca La Estacada Syrah';
update public.wines set country='España', region='Cataluña', denomination='DO Cava' where name='Masia D’or Cava Brut';
update public.wines set country='Italia', region='Véneto / Friuli', denomination='Prosecco DOC' where name='Allini Prosecco Rosé';
update public.wines set country='Francia', region='Champagne', denomination='Champagne AOC' where name='Comte de Brismand Champagne';
update public.wines set country='Portugal', region='Douro', denomination='Douro DOC' where name='Ventozelo Douro';
update public.wines set country='España', region='Extremadura', denomination='IGP Extremadura' where name='Habla del Silencio';
update public.wines set country='España', region='Galicia' where name='Marqués de Vizhoja';

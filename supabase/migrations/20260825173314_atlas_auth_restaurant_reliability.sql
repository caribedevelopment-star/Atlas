alter table public.memories
  add column if not exists restaurant_chef text;

alter table public.memories
  alter column author_name set default 'Usuario Atlas';

update public.memories
set author_name = 'Usuario Atlas'
where author_name is null or btrim(author_name) = '';

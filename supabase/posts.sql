-- Tabla de posts
create table if not exists public.posts (
  id bigint generated always as identity primary key,
  title text not null,
  content text not null,
  author text not null,
  author_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table if exists public.posts
  add column if not exists author_id uuid;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'posts_author_id_fkey'
  ) then
    alter table public.posts
      add constraint posts_author_id_fkey
      foreign key (author_id) references public.profiles(id) on delete set null;
  end if;
end $$;

-- Habilitar RLS
alter table public.posts enable row level security;

-- Cualquiera puede leer
create policy "posts_select_public"
  on public.posts for select
  using (true);

-- Solo autenticados pueden insertar
create policy "posts_insert_authenticated"
  on public.posts for insert
  with check (auth.uid() is not null);

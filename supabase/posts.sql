-- Tabla de posts
create table if not exists public.posts (
  id bigint generated always as identity primary key,
  title text not null,
  content text not null,
  author text not null,
  created_at timestamptz not null default now()
);

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

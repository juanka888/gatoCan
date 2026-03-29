-- Unificación de perfiles/perfiles -> profiles (tabla canónica)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text,
  username text unique,
  karma_points integer not null default 0,
  karma_rank integer,
  total_donaciones numeric not null default 0,
  runner_best_score integer not null default 0,
  runner_best_distance_m integer not null default 0,
  runner_global_rank integer,
  updated_at timestamptz default now()
);

-- Campos históricos desde `perfiles` para no perder compatibilidad con la web actual
alter table if exists public.profiles add column if not exists nombre_completo text;
alter table if exists public.profiles add column if not exists avatar_url text;
alter table if exists public.profiles add column if not exists dni_nie text;
alter table if exists public.profiles add column if not exists telefono text;
alter table if exists public.profiles add column if not exists direccion text;
alter table if exists public.profiles add column if not exists codigo_postal text;
alter table if exists public.profiles add column if not exists poblacion text;
alter table if exists public.profiles add column if not exists rol text;
alter table if exists public.profiles add column if not exists fecha_registro timestamptz default now();

-- Migra todos los datos posibles desde la tabla legacy `perfiles`.
insert into public.profiles (
  id,
  email,
  full_name,
  nombre_completo,
  avatar_url,
  dni_nie,
  telefono,
  direccion,
  codigo_postal,
  poblacion,
  rol,
  fecha_registro,
  karma_points,
  total_donaciones,
  runner_best_score,
  runner_best_distance_m,
  updated_at
)
select
  p.id,
  p.email,
  coalesce(p.full_name, p.nombre_completo),
  p.nombre_completo,
  p.avatar_url,
  p.dni_nie,
  p.telefono,
  p.direccion,
  p.codigo_postal,
  p.poblacion,
  p.rol,
  p.fecha_registro,
  coalesce(p.karma_points, 0),
  coalesce(p.total_donaciones, 0),
  coalesce(p.runner_best_score, 0),
  coalesce(p.runner_best_distance_m, 0),
  now()
from public.perfiles p
on conflict (id) do update
set
  email = coalesce(excluded.email, public.profiles.email),
  full_name = coalesce(public.profiles.full_name, excluded.full_name),
  nombre_completo = coalesce(public.profiles.nombre_completo, excluded.nombre_completo),
  avatar_url = coalesce(public.profiles.avatar_url, excluded.avatar_url),
  dni_nie = coalesce(public.profiles.dni_nie, excluded.dni_nie),
  telefono = coalesce(public.profiles.telefono, excluded.telefono),
  direccion = coalesce(public.profiles.direccion, excluded.direccion),
  codigo_postal = coalesce(public.profiles.codigo_postal, excluded.codigo_postal),
  poblacion = coalesce(public.profiles.poblacion, excluded.poblacion),
  rol = coalesce(public.profiles.rol, excluded.rol),
  fecha_registro = coalesce(public.profiles.fecha_registro, excluded.fecha_registro),
  karma_points = greatest(coalesce(public.profiles.karma_points, 0), coalesce(excluded.karma_points, 0)),
  total_donaciones = greatest(coalesce(public.profiles.total_donaciones, 0), coalesce(excluded.total_donaciones, 0)),
  runner_best_score = greatest(coalesce(public.profiles.runner_best_score, 0), coalesce(excluded.runner_best_score, 0)),
  runner_best_distance_m = greatest(coalesce(public.profiles.runner_best_distance_m, 0), coalesce(excluded.runner_best_distance_m, 0)),
  updated_at = now();

-- Restricciones de no-negatividad para runner.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_runner_best_score_nonnegative'
  ) then
    alter table public.profiles
      add constraint profiles_runner_best_score_nonnegative
      check (runner_best_score >= 0);
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'profiles_runner_best_distance_m_nonnegative'
  ) then
    alter table public.profiles
      add constraint profiles_runner_best_distance_m_nonnegative
      check (runner_best_distance_m >= 0);
  end if;
end $$;

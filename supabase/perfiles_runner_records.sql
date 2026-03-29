-- Campos de récords para Gatito Runner en la tabla canónica profiles
alter table if exists public.profiles
  add column if not exists runner_best_distance_m integer not null default 0;

-- Limpieza opcional de campo antiguo (si llegó a existir)
alter table if exists public.profiles
  drop constraint if exists profiles_runner_min_distance_m_nonnegative;

alter table if exists public.profiles
  drop column if exists runner_min_distance_m;

-- Normalización inicial (si existen filas previas)
update public.profiles
set runner_best_distance_m = coalesce(runner_best_distance_m, 0)
where runner_best_distance_m is null;

-- Restricciones básicas para evitar valores negativos
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_runner_best_distance_m_nonnegative'
  ) then
    alter table public.profiles
      add constraint profiles_runner_best_distance_m_nonnegative
      check (runner_best_distance_m >= 0);
  end if;

end $$;

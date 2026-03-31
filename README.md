# gatoCan

Proyecto web de GatoCan con páginas estáticas en `GATOCAN_Web2/`.

## Restauración de la web

La web principal restaurada está en:

- `GATOCAN_Web2/index.html`
- `GATOCAN_Web2/login.html`
- `GATOCAN_Web2/register.html`

El `index.html` raíz redirige a esa versión.

## Supabase configurado

Este proyecto ya incluye en frontend:

- URL: `https://jjeciqwzepkmeeticihg.supabase.co`
- Anon key: configurada para entorno público.

### ¿Es mala idea poner la anon key en un proyecto público?

No, **la anon key de Supabase está diseñada para ser pública**. Lo importante es:

- Tener **RLS (Row Level Security)** activado en tablas.
- Definir políticas que solo permitan a cada usuario leer/escribir sus propios datos.
- **Nunca** exponer la `service_role key` en frontend.

## SQL recomendado (profiles + user_data)

En **SQL Editor** de Supabase, ejecuta:

```sql
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text,
  username text unique,
  karma_points integer not null default 0,
  karma_rank integer,
  total_donaciones numeric not null default 0,
  runner_best_score integer not null default 0,
  runner_global_rank integer,
  updated_at timestamptz default now()
);

create table if not exists public.user_data (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  data_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;
alter table public.user_data enable row level security;

create policy "profile_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profile_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profile_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- Si ya tenías la tabla creada, usa alter table:
-- alter table public.perfiles add column if not exists karma_points integer not null default 0;
-- alter table public.perfiles add column if not exists karma_rank integer;
-- alter table public.perfiles add column if not exists total_donaciones numeric not null default 0;
-- alter table public.perfiles add column if not exists runner_best_score integer not null default 0;
-- alter table public.perfiles add column if not exists runner_global_rank integer;

create policy "user_data_insert_own"
  on public.user_data for insert
  with check (auth.uid() = user_id);

create policy "user_data_select_own"
  on public.user_data for select
  using (auth.uid() = user_id);
```

## Flujo implementado

- `register.html`:
  - Crea usuario en `auth.users` con `signUp`.
  - Guarda perfil en `profiles`.
  - Registra evento inicial en `user_data`.
- `login.html`:
  - Inicia sesión con email/contraseña (`signInWithPassword`).
  - También acepta username y lo resuelve con `profiles`.
- Botón Google:
  - Inicia OAuth con `signInWithOAuth`.

## Siguiente mejora recomendada

Añadir recuperación de contraseña, cierre de sesión y panel de perfil para editar datos de `profiles` desde la web.

## Foro simple en Next.js + Supabase

Se añadió una página de foro en `app/foro/page.tsx` con:

- Formulario React para crear posts (`title`, `content`).
- Carga inicial de publicaciones desde `posts`.
- `useEffect` con suscripción realtime de Supabase para refrescar listado.

### Variables de entorno requeridas

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
```

### SQL para Supabase

Ejecuta `supabase/posts.sql` en el SQL Editor para crear la tabla `posts` con RLS:

- `select`: público (todos leen).
- `insert`: solo usuarios autenticados.

## Diagnóstico de login con Google (NextAuth + Prisma + Vercel)

Si al elegir cuenta en Google vuelves al login sin entrar, suele ser configuración de sesión/callback o conexión DB.

Checklist rápido:

1. Variables en Vercel (Production y Preview):
   - `NEXTAUTH_URL=https://tu-dominio.com` (sin `/` final)
   - `NEXTAUTH_SECRET=<string largo aleatorio>`
   - `GOOGLE_CLIENT_ID=...`
   - `GOOGLE_CLIENT_SECRET=...`
   - `DATABASE_URL=...`
2. En Google Cloud Console, URI autorizada exacta:
   - `https://tu-dominio.com/api/auth/callback/google`
3. Verifica salud de auth:
   - `GET /api/auth/health` debe devolver `ok: true` y `database: "reachable"`.
4. Activa logs de NextAuth:
   - `AUTH_DEBUG=true` para ver trazas en logs de Vercel.
5. Si cambiaste `NEXTAUTH_SECRET`, cierra sesión y borra cookies para evitar bucles con JWT antiguos.

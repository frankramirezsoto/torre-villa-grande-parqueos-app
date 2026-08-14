-- =========================================================
-- Torre Villa Grande · Sistema de Control de Parqueos
-- Esquema de base de datos (Supabase / PostgreSQL)
-- =========================================================
-- Ejecutar en: Supabase Dashboard > SQL Editor > New query

-- ---------------------------------------------------------
-- 1. Tabla de espacios de parqueo (3 pisos x 10 espacios = 30)
-- ---------------------------------------------------------
create table if not exists spots (
  id uuid primary key default gen_random_uuid(),
  floor int not null check (floor between 1 and 3),
  spot_number int not null check (spot_number between 1 and 10),
  code text generated always as (
    'P' || floor || '-' || lpad(spot_number::text, 2, '0')
  ) stored,
  unique (floor, spot_number)
);

-- ---------------------------------------------------------
-- 2. Tabla de visitas (entrada / salida)
-- ---------------------------------------------------------
create table if not exists visits (
  id uuid primary key default gen_random_uuid(),
  spot_id uuid not null references spots(id),
  apartment int not null check (apartment between 1 and 30),
  plate text not null,
  visitor_name text not null,
  entry_time timestamptz not null default now(),
  exit_time timestamptz,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- 3. Reglas de negocio garantizadas por la base de datos
-- ---------------------------------------------------------
-- Un mismo espacio no puede tener dos visitas activas (exit_time nulo) a la vez
create unique index if not exists one_active_visit_per_spot
  on visits (spot_id)
  where exit_time is null;

-- Un mismo apartamento no puede tener más de una visita activa a la vez
create unique index if not exists one_active_visit_per_apartment
  on visits (apartment)
  where exit_time is null;

-- Índices de apoyo para el historial y filtros
create index if not exists idx_visits_plate on visits (plate);
create index if not exists idx_visits_apartment on visits (apartment);
create index if not exists idx_visits_entry_time on visits (entry_time desc);

-- ---------------------------------------------------------
-- 4. Seed: 30 espacios (3 pisos x 10 espacios)
-- ---------------------------------------------------------
insert into spots (floor, spot_number)
select f, s
from generate_series(1, 3) as f, generate_series(1, 10) as s
on conflict (floor, spot_number) do nothing;

-- ---------------------------------------------------------
-- 5. Row Level Security
-- El guarda de seguridad ya viene registrado (usuario "quemado"
-- en Supabase Auth). No hay auto-registro. Cualquier usuario
-- autenticado tiene acceso completo al sistema.
-- ---------------------------------------------------------
alter table spots enable row level security;
alter table visits enable row level security;

create policy "authenticated read spots"
  on spots for select
  using (auth.role() = 'authenticated');

create policy "authenticated read visits"
  on visits for select
  using (auth.role() = 'authenticated');

create policy "authenticated insert visits"
  on visits for insert
  with check (auth.role() = 'authenticated');

create policy "authenticated update visits"
  on visits for update
  using (auth.role() = 'authenticated');

-- ---------------------------------------------------------
-- 6. Habilitar Realtime (para que el grid se actualice solo)
-- ---------------------------------------------------------
alter publication supabase_realtime add table visits;

-- ---------------------------------------------------------
-- 7. Crear el usuario del guarda (HACER DESDE EL DASHBOARD)
-- ---------------------------------------------------------
-- Ve a Authentication > Users > Add User en el dashboard de Supabase
-- y crea el usuario manualmente con correo y contraseña.
-- No se crea por SQL porque Supabase Auth maneja el hash de la
-- contraseña internamente.

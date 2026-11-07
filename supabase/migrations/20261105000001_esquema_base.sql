-- =====================================================================
-- CRM Ártica · Esquema base (versión 1)
-- Tablas: perfiles, configuracion_empresa, empresas, contactos,
--         etapas_pipeline, oportunidades, actividades,
--         cotizaciones, cotizacion_partidas
-- =====================================================================

-- ---------------------------------------------------------------------
-- Utilidades
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- Perfiles y roles
-- Roles técnicos fijos; cada cliente solo cambia la etiqueta visible.
-- rol = null significa "sin acceso" (usuario registrado pero no aprobado).
-- ---------------------------------------------------------------------
create table public.perfiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  nombre      text not null default '',
  email       text,
  rol         text check (rol in ('dueno', 'gerente', 'comercial', 'operativo', 'lectura')),
  activo      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger perfiles_updated_at before update on public.perfiles
  for each row execute function public.set_updated_at();

-- El primer usuario que se registra se vuelve dueño; los demás quedan sin rol
-- hasta que el dueño les asigne uno.
create or replace function public.crear_perfil_nuevo_usuario()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.perfiles (id, nombre, email, rol)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nombre', split_part(new.email, '@', 1)),
    new.email,
    case when exists (select 1 from public.perfiles) then null else 'dueno' end
  );
  return new;
end;
$$;

create trigger al_crear_usuario
  after insert on auth.users
  for each row execute function public.crear_perfil_nuevo_usuario();

-- Rol del usuario actual (security definer para no recursar en RLS).
create or replace function public.mi_rol()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select rol from public.perfiles where id = auth.uid() and activo;
$$;

create or replace function public.tiene_rol(roles text[])
returns boolean
language sql
stable
as $$
  select coalesce(public.mi_rol() = any (roles), false);
$$;

-- ---------------------------------------------------------------------
-- Datos de la empresa que usa el CRM (encabezado de cotizaciones)
-- ---------------------------------------------------------------------
create table public.configuracion_empresa (
  id              smallint primary key default 1 check (id = 1),
  nombre          text not null,
  razon_social    text,
  rfc             text,
  direccion       text,
  telefono        text,
  email           text,
  sitio_web       text,
  logo_url        text,
  condiciones_default text,
  updated_at      timestamptz not null default now()
);

create trigger configuracion_updated_at before update on public.configuracion_empresa
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- Empresas (clientes y prospectos) y contactos
-- ---------------------------------------------------------------------
create table public.empresas (
  id          uuid primary key default gen_random_uuid(),
  nombre      text not null,
  rfc         text,
  giro        text,
  telefono    text,
  email       text,
  sitio_web   text,
  direccion   text,
  ciudad      text,
  notas       text,
  created_by  uuid references public.perfiles (id) on delete set null default auth.uid(),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index empresas_nombre_idx on public.empresas (lower(nombre));
create trigger empresas_updated_at before update on public.empresas
  for each row execute function public.set_updated_at();

create table public.contactos (
  id            uuid primary key default gen_random_uuid(),
  empresa_id    uuid references public.empresas (id) on delete cascade,
  nombre        text not null,
  cargo         text,
  telefono      text,
  email         text,
  es_principal  boolean not null default false,
  notas         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index contactos_empresa_idx on public.contactos (empresa_id);
create trigger contactos_updated_at before update on public.contactos
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- Pipeline
-- ---------------------------------------------------------------------
create table public.etapas_pipeline (
  id            smallserial primary key,
  nombre        text not null,
  orden         smallint not null unique,
  probabilidad  smallint not null check (probabilidad between 0 and 100),
  color         text not null default '#64748b',
  es_ganada     boolean not null default false,
  es_perdida    boolean not null default false
);

create sequence public.oportunidades_codigo_seq;

create table public.oportunidades (
  id                     uuid primary key default gen_random_uuid(),
  codigo                 text not null unique
                           default 'OP-' || lpad(nextval('public.oportunidades_codigo_seq')::text, 4, '0'),
  titulo                 text not null,
  empresa_id             uuid references public.empresas (id) on delete set null,
  contacto_id            uuid references public.contactos (id) on delete set null,
  etapa_id               smallint not null references public.etapas_pipeline (id),
  monto_estimado         numeric(14, 2) not null default 0,
  moneda                 text not null default 'MXN' check (moneda in ('MXN', 'USD')),
  tipo_proyecto          text check (tipo_proyecto in ('obra_nueva', 'reemplazo', 'ampliacion', 'mantenimiento')),
  tipo_sistema           text check (tipo_sistema in ('vrf', 'chiller', 'minisplit', 'paquete', 'extraccion', 'otro')),
  toneladas_tr           numeric(8, 2),
  origen                 text,
  fecha_cierre_estimada  date,
  fecha_cierre_real      date,
  motivo_perdida         text,
  responsable_id         uuid references public.perfiles (id) on delete set null default auth.uid(),
  notas                  text,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create index oportunidades_etapa_idx on public.oportunidades (etapa_id);
create index oportunidades_empresa_idx on public.oportunidades (empresa_id);
create trigger oportunidades_updated_at before update on public.oportunidades
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- Actividades (visitas técnicas, llamadas, seguimientos…)
-- ---------------------------------------------------------------------
create table public.actividades (
  id              uuid primary key default gen_random_uuid(),
  tipo            text not null check (tipo in ('visita_tecnica', 'llamada', 'reunion', 'seguimiento', 'tarea')),
  titulo          text not null,
  descripcion     text,
  fecha           timestamptz not null,
  duracion_min    integer default 60,
  ubicacion       text,
  completada      boolean not null default false,
  oportunidad_id  uuid references public.oportunidades (id) on delete cascade,
  empresa_id      uuid references public.empresas (id) on delete cascade,
  contacto_id     uuid references public.contactos (id) on delete set null,
  responsable_id  uuid references public.perfiles (id) on delete set null default auth.uid(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index actividades_fecha_idx on public.actividades (fecha);
create trigger actividades_updated_at before update on public.actividades
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- Cotizaciones con partidas y versiones
-- ---------------------------------------------------------------------
create sequence public.cotizaciones_folio_seq;

create table public.cotizaciones (
  id              uuid primary key default gen_random_uuid(),
  folio           text not null
                    default 'COT-' || lpad(nextval('public.cotizaciones_folio_seq')::text, 4, '0'),
  version         smallint not null default 1,
  oportunidad_id  uuid references public.oportunidades (id) on delete set null,
  empresa_id      uuid references public.empresas (id) on delete set null,
  contacto_id     uuid references public.contactos (id) on delete set null,
  titulo          text not null,
  estado          text not null default 'borrador'
                    check (estado in ('borrador', 'enviada', 'aceptada', 'rechazada')),
  fecha_emision   date not null default current_date,
  vigencia_dias   smallint not null default 30,
  moneda          text not null default 'MXN' check (moneda in ('MXN', 'USD')),
  descuento_pct   numeric(5, 2) not null default 0 check (descuento_pct between 0 and 100),
  iva_pct         numeric(5, 2) not null default 16,
  condiciones     text,
  notas           text,
  created_by      uuid references public.perfiles (id) on delete set null default auth.uid(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (folio, version)
);

create trigger cotizaciones_updated_at before update on public.cotizaciones
  for each row execute function public.set_updated_at();

create table public.cotizacion_partidas (
  id               uuid primary key default gen_random_uuid(),
  cotizacion_id    uuid not null references public.cotizaciones (id) on delete cascade,
  orden            smallint not null default 0,
  categoria        text not null default 'equipo'
                     check (categoria in ('equipo', 'material', 'mano_obra', 'otro')),
  descripcion      text not null,
  unidad           text not null default 'pza',
  cantidad         numeric(12, 2) not null default 1,
  precio_unitario  numeric(14, 2) not null default 0
);

create index partidas_cotizacion_idx on public.cotizacion_partidas (cotizacion_id, orden);

-- Totales calculados (respeta RLS del usuario que consulta).
create view public.cotizaciones_totales
with (security_invoker = true)
as
select
  c.id,
  coalesce(sum(p.cantidad * p.precio_unitario), 0)::numeric(14, 2) as subtotal,
  (coalesce(sum(p.cantidad * p.precio_unitario), 0) * c.descuento_pct / 100)::numeric(14, 2) as descuento,
  (coalesce(sum(p.cantidad * p.precio_unitario), 0) * (1 - c.descuento_pct / 100) * c.iva_pct / 100)::numeric(14, 2) as iva,
  (coalesce(sum(p.cantidad * p.precio_unitario), 0) * (1 - c.descuento_pct / 100) * (1 + c.iva_pct / 100))::numeric(14, 2) as total
from public.cotizaciones c
left join public.cotizacion_partidas p on p.cotizacion_id = c.id
group by c.id;

-- =====================================================================
-- Seguridad: Row Level Security
--   Lectura: cualquier usuario con rol.
--   Escritura comercial: dueño, gerente y comercial (comercial solo lo suyo).
--   Actividades: operativo puede editar las que tiene asignadas.
--   Borrar: solo dueño y gerente.
--   Configuración y roles: solo dueño.
-- =====================================================================
alter table public.perfiles              enable row level security;
alter table public.configuracion_empresa enable row level security;
alter table public.empresas              enable row level security;
alter table public.contactos             enable row level security;
alter table public.etapas_pipeline       enable row level security;
alter table public.oportunidades         enable row level security;
alter table public.actividades           enable row level security;
alter table public.cotizaciones          enable row level security;
alter table public.cotizacion_partidas   enable row level security;

-- Perfiles
create policy "perfiles: ver" on public.perfiles
  for select to authenticated using (id = auth.uid() or public.mi_rol() is not null);
create policy "perfiles: dueño administra" on public.perfiles
  for update to authenticated using (public.tiene_rol(array['dueno'])) with check (public.tiene_rol(array['dueno']));

-- Configuración
create policy "config: ver" on public.configuracion_empresa
  for select to authenticated using (public.mi_rol() is not null);
create policy "config: dueño edita" on public.configuracion_empresa
  for update to authenticated using (public.tiene_rol(array['dueno'])) with check (public.tiene_rol(array['dueno']));

-- Etapas (solo lectura desde la app; se configuran por migración o por el dueño)
create policy "etapas: ver" on public.etapas_pipeline
  for select to authenticated using (public.mi_rol() is not null);
create policy "etapas: dueño administra" on public.etapas_pipeline
  for all to authenticated using (public.tiene_rol(array['dueno'])) with check (public.tiene_rol(array['dueno']));

-- Empresas y contactos
create policy "empresas: ver" on public.empresas
  for select to authenticated using (public.mi_rol() is not null);
create policy "empresas: crear" on public.empresas
  for insert to authenticated with check (public.tiene_rol(array['dueno', 'gerente', 'comercial']));
create policy "empresas: editar" on public.empresas
  for update to authenticated using (public.tiene_rol(array['dueno', 'gerente', 'comercial']));
create policy "empresas: borrar" on public.empresas
  for delete to authenticated using (public.tiene_rol(array['dueno', 'gerente']));

create policy "contactos: ver" on public.contactos
  for select to authenticated using (public.mi_rol() is not null);
create policy "contactos: crear" on public.contactos
  for insert to authenticated with check (public.tiene_rol(array['dueno', 'gerente', 'comercial']));
create policy "contactos: editar" on public.contactos
  for update to authenticated using (public.tiene_rol(array['dueno', 'gerente', 'comercial']));
create policy "contactos: borrar" on public.contactos
  for delete to authenticated using (public.tiene_rol(array['dueno', 'gerente']));

-- Oportunidades
create policy "oportunidades: ver" on public.oportunidades
  for select to authenticated using (public.mi_rol() is not null);
create policy "oportunidades: crear" on public.oportunidades
  for insert to authenticated with check (public.tiene_rol(array['dueno', 'gerente', 'comercial']));
create policy "oportunidades: editar" on public.oportunidades
  for update to authenticated using (
    public.tiene_rol(array['dueno', 'gerente'])
    or (public.tiene_rol(array['comercial']) and (responsable_id = auth.uid() or responsable_id is null))
  );
create policy "oportunidades: borrar" on public.oportunidades
  for delete to authenticated using (public.tiene_rol(array['dueno', 'gerente']));

-- Actividades
create policy "actividades: ver" on public.actividades
  for select to authenticated using (public.mi_rol() is not null);
create policy "actividades: crear" on public.actividades
  for insert to authenticated with check (public.tiene_rol(array['dueno', 'gerente', 'comercial', 'operativo']));
create policy "actividades: editar" on public.actividades
  for update to authenticated using (
    public.tiene_rol(array['dueno', 'gerente', 'comercial'])
    or (public.tiene_rol(array['operativo']) and responsable_id = auth.uid())
  );
create policy "actividades: borrar" on public.actividades
  for delete to authenticated using (public.tiene_rol(array['dueno', 'gerente']));

-- Cotizaciones y partidas
create policy "cotizaciones: ver" on public.cotizaciones
  for select to authenticated using (public.mi_rol() is not null);
create policy "cotizaciones: crear" on public.cotizaciones
  for insert to authenticated with check (public.tiene_rol(array['dueno', 'gerente', 'comercial']));
create policy "cotizaciones: editar" on public.cotizaciones
  for update to authenticated using (public.tiene_rol(array['dueno', 'gerente', 'comercial']));
create policy "cotizaciones: borrar" on public.cotizaciones
  for delete to authenticated using (public.tiene_rol(array['dueno', 'gerente']));

create policy "partidas: ver" on public.cotizacion_partidas
  for select to authenticated using (public.mi_rol() is not null);
create policy "partidas: escribir" on public.cotizacion_partidas
  for all to authenticated
  using (public.tiene_rol(array['dueno', 'gerente', 'comercial']))
  with check (public.tiene_rol(array['dueno', 'gerente', 'comercial']));

-- ---------------------------------------------------------------------
-- Tiempo real: el Kanban y el dashboard escuchan estos cambios
-- ---------------------------------------------------------------------
alter publication supabase_realtime add table public.oportunidades;
alter publication supabase_realtime add table public.actividades;

-- ---------------------------------------------------------------------
-- Datos base del cliente: etapas del pipeline HVAC y configuración
-- ---------------------------------------------------------------------
insert into public.etapas_pipeline (nombre, orden, probabilidad, color, es_ganada, es_perdida) values
  ('Prospecto',               1,  10, '#94a3b8', false, false),
  ('Calificación',            2,  20, '#60a5fa', false, false),
  ('Visita técnica',          3,  30, '#22d3ee', false, false),
  ('Ingeniería y cotización', 4,  40, '#2dd4bf', false, false),
  ('Propuesta enviada',       5,  50, '#a78bfa', false, false),
  ('Negociación',             6,  70, '#f59e0b', false, false),
  ('Ganada',                  7, 100, '#16a34a', true,  false),
  ('Perdida',                 8,   0, '#dc2626', false, true);

insert into public.configuracion_empresa (id, nombre, razon_social, telefono, email, sitio_web, direccion, condiciones_default) values (
  1,
  'Ártica Ingenieros Especialistas en HVAC',
  'Ártica Ingeniería Térmica, S.A. de C.V.',
  '+52 81 0000 0000',
  'contacto@artica-hvac.example',
  'artica-hvac.example',
  'Monterrey, Nuevo León, México',
  E'Precios en moneda nacional más IVA.\nTiempo de entrega de equipos: 4 a 6 semanas a partir del anticipo.\nForma de pago: 50% anticipo, 40% contra entrega de equipos, 10% a la puesta en marcha.\nGarantía: 1 año en mano de obra; equipos según fabricante.'
);

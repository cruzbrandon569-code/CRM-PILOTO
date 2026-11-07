# CRM Ártica · Piloto HVAC

CRM a la medida para **Ártica Ingenieros Especialistas en HVAC**, un cliente piloto ficticio. Es la plantilla base de la que después saldrá la skill para generar CRMs por industria.

**Stack:** Next.js 16 (App Router) · Supabase (Postgres, Auth, Realtime, RLS) · Tailwind CSS 4 · dnd-kit · lucide-react

## Módulos (versión 1)

| Módulo | Ruta | Qué hace |
|---|---|---|
| Login | `/login` | Correo y contraseña de Supabase Auth; sin registro público |
| Dashboard | `/` | Pipeline abierto, pronóstico ponderado, ganado y tasa de cierre en 90 días, TR en pipeline, agenda de 7 días. Se actualiza en tiempo real |
| Pipeline | `/pipeline` | Kanban con arrastrar y soltar, totales por columna y motivo obligatorio al marcar como perdida |
| Empresas | `/empresas` | Clientes y prospectos, con su detalle de contactos, oportunidades y actividad |
| Contactos | `/contactos` | Directorio general |
| Agenda | `/actividades` | Visitas técnicas, llamadas, reuniones y seguimientos; muestra vencidas y próximas |
| Cotizaciones | `/cotizaciones` | Partidas (equipo, material, mano de obra), descuento, IVA, versiones y PDF imprimible con logo |

## Arranque, la primera vez

### 1. Instalar dependencias
```bash
npm install
```

### 2. Conectar Supabase
1. Crea un proyecto en [supabase.com](https://supabase.com) (por ejemplo `crm-artica-hvac`).
2. Copia `.env.example` como `.env.local` y llena la URL y la **publishable key** (Project Settings → API Keys).

### 3. Crear las tablas y los datos de prueba
Opción A, con la CLI (ya viene instalada en el proyecto):
```bash
npx supabase login
```
```bash
npx supabase link --project-ref TU_PROJECT_REF
```
```bash
npx supabase db push --include-seed
```

Opción B, sin CLI: en Supabase → SQL Editor, pega y ejecuta en este orden:
1. `supabase/migrations/20261105000001_esquema_base.sql`
2. `supabase/seed.sql` (datos ficticios; opcional)

### 4. Crear al dueño
Supabase → Authentication → Users → **Add user** (marca *Auto Confirm User*).
**El primer usuario que se crea queda como `dueno`.** Los siguientes quedan sin acceso hasta que el dueño les asigne un rol en la tabla `perfiles`.

Luego, en Authentication → Sign In / Providers, **desactiva "Allow new users to sign up"**, para que nadie pueda crearse una cuenta desde fuera.

### 5. Correr
```bash
npm run dev
```
Abre http://localhost:3000

## Roles

Los roles técnicos son iguales para todos los clientes; cada industria solo cambia la etiqueta visible en `src/lib/catalogos.ts`.

| Rol | Etiqueta en HVAC | Permisos |
|---|---|---|
| `dueno` | Dueño | Todo, incluido borrar y administrar usuarios y configuración |
| `gerente` | Coordinador de servicio | Todo lo comercial y operativo, incluido borrar |
| `comercial` | Vendedor | Crear y editar empresas, contactos y cotizaciones; editar solo sus oportunidades |
| `operativo` | Técnico de campo | Ver todo; crear actividades y editar las que tiene asignadas |
| `lectura` | Cobranza / consulta | Solo ver |

La seguridad vive en la base de datos (RLS), no solo en la pantalla: aunque alguien manipule el navegador, Postgres rechaza lo que su rol no permite.

## Estructura

```
src/
  app/
    (crm)/            pantallas con menú lateral (dashboard, pipeline, empresas…)
    imprimir/         vista de cotización para PDF, sin menú
    login/
  components/         Kanban, editor de cotización, formularios, UI
  lib/                clientes de Supabase, catálogos, formato, tipos
  proxy.ts            protege las rutas (antes "middleware" en Next.js)
supabase/
  migrations/         esquema versionado: cada cambio es un archivo nuevo
  seed.sql            datos ficticios de Ártica
docs/
  CAMBIO-DE-MAQUINA.md
```

## Cambios al esquema

Nunca edites una migración que ya se aplicó. Crea una nueva:
```bash
npx supabase migration new descripcion_del_cambio
```
y aplícala con `npx supabase db push`. Así todos los clientes quedan con el mismo esquema.

## Pendiente (versión 2)
- Bandeja de WhatsApp e Instagram vía Zernio (API oficial de Meta)
- Pantalla para que el dueño administre usuarios y roles
- Edición de etapas del pipeline desde la app
- Subida del logo y de archivos (planos, fotos de levantamiento) a Supabase Storage

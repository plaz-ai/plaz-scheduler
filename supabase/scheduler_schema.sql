-- ============================================================================
-- plaz-scheduler — esquema de tablas NUEVAS (prefijo scheduler_)
-- Proyecto Supabase: rdumdfoomfidahhwhbum
--
-- REGLA: no se modifica NINGUNA tabla existente (comerciales, companies, calls,
-- reservas_solicitadas, etc.). Estas tablas solo se LEEN desde n8n. Las columnas
-- comercial_id / company_id / call_type_id son referencias LÓGICAS (uuid) sin
-- FOREIGN KEY hacia tablas existentes, para no añadirles constraints.
--
-- Idempotente: se puede ejecutar varias veces sin error.
-- ============================================================================

create extension if not exists pgcrypto;

-- 1) Tokens opacos del scheduler -------------------------------------------------
--    Mapea un token de URL a su contexto. kind:
--      'agent' -> comercial_id (vista /agente/[token] y /disponibilidad)
--      'admin' -> company_id   (vista /admin/[token] y /tipos-llamada)
--      'link'  -> link público de reserva (/agenda/[token]); apunta a un comercial
--                 o a un tipo de llamada de una empresa, con límites de uso.
create table if not exists scheduler_tokens (
  token         text primary key,
  kind          text not null check (kind in ('agent', 'admin', 'link')),
  comercial_id  uuid,                       -- ref lógica a comerciales.id
  company_id    uuid,                       -- ref lógica a companies.id
  call_type_id  uuid,                       -- ref a scheduler_call_types.id (link)
  max_uses      integer,                    -- null = ilimitado (link)
  uses          integer not null default 0,
  expires_at    timestamptz,                -- null = no caduca (link)
  active        boolean not null default true,
  created_at    timestamptz not null default now()
);

-- 2) Tipos de llamada (event types propios) -------------------------------------
create table if not exists scheduler_call_types (
  id               uuid primary key default gen_random_uuid(),
  company_id       uuid not null,           -- ref lógica a companies.id
  name             text not null,
  slug             text not null,
  duration_minutes integer not null default 30,
  active           boolean not null default true,
  location         text not null default 'google_meet'
                     check (location in ('google_meet', 'phone', 'in_person')),
  description      text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (company_id, slug)
);

-- 3) Disponibilidad editable por el scheduler (1:1 con comercial) ----------------
--    Valor inicial se siembra leyendo comerciales.horarios; las ediciones del
--    editor de disponibilidad se guardan AQUÍ, nunca en comerciales.
create table if not exists scheduler_agent_schedules (
  comercial_id uuid primary key,            -- ref lógica a comerciales.id
  timezone     text not null default 'Europe/Madrid',
  days         jsonb not null,              -- [{weekday:1..7, enabled, ranges:[{start,end}]}]
  updated_at   timestamptz not null default now()
);

-- 4) Reservas del scheduler ------------------------------------------------------
create table if not exists scheduler_bookings (
  id               uuid primary key default gen_random_uuid(),
  booking_id       text unique not null default gen_random_uuid()::text,
  comercial_id     uuid not null,           -- ref lógica a comerciales.id
  company_id       uuid,                    -- ref lógica a companies.id
  call_type_id     uuid,                    -- ref a scheduler_call_types.id
  link_token       text,                    -- token usado al reservar
  start_utc        timestamptz not null,
  end_utc          timestamptz,
  duration_minutes integer not null,
  booker_name      text not null,
  booker_email     text not null,
  booker_notes     text,
  status           text not null default 'confirmed'
                     check (status in ('pending', 'confirmed', 'completed', 'cancelled')),
  meet_url         text,
  cal_booking_id   text,                    -- id/uid de la cita espejo en cal.com
  cancel_token     text not null default gen_random_uuid()::text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists idx_scheduler_bookings_comercial on scheduler_bookings (comercial_id, start_utc);
create index if not exists idx_scheduler_bookings_status    on scheduler_bookings (status);
create index if not exists idx_scheduler_call_types_company on scheduler_call_types (company_id);

-- RLS: solo la service_role (n8n) accede. Sin políticas => anon/auth no leen.
alter table scheduler_tokens          enable row level security;
alter table scheduler_call_types      enable row level security;
alter table scheduler_agent_schedules enable row level security;
alter table scheduler_bookings        enable row level security;

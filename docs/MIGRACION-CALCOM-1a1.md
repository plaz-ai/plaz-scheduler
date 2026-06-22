# Plan de migración 1:1 a cal.com — Plaz Scheduler

> Objetivo del usuario: alcanzar **paridad casi total con cal.com (Nivel 4, SaaS completo)**.
> Fecha: 2026-06-22 · Estado actual: booking público funcional (3 pasos) sobre n8n + Supabase + Google Calendar.

---

## 0. Realidad y supuestos (leer primero)

**cal.com es un producto de ~6 años, ~400k líneas, equipo de decenas de ingenieros.** "1:1" literal desde cero es un esfuerzo de **muchos meses-persona**. Este plan es honesto sobre eso: prioriza por valor, define criterios verificables por fase, y **empieza por una decisión estratégica que puede ahorrar el 80% del trabajo**.

Supuestos que asumo (confirmar o corregir):
- "1:1" = **paridad funcional** del producto cal.com Self-Hosted/Teams, no clonar su código UI pixel a pixel.
- Caso de uso Plaz: scheduling B2B (consultores/comercial), no marketplace masivo.
- Se mantiene la identidad visual Plaz (navy + ámbar), no el look de cal.com.

---

## 1. DECISIÓN GATE — Build vs Adopt (resolver ANTES de cualquier fase)

cal.com es **open-source (AGPLv3)** y self-hosteable. Hay tres caminos; el plan de fases (§5) cambia según cuál elijas:

| Opción | Qué es | Tiempo a "1:1" | Coste/riesgo |
|---|---|---|---|
| **A. Adoptar cal.com OSS** | Self-hostear cal.com, rebrandear (logo, colores, dominio), conectar a tus calendarios. Personalizar lo mínimo. | **Días–semanas** | Licencia **AGPLv3** (obliga a publicar modificaciones si lo ofreces como servicio; existe licencia comercial de pago para evitarlo). Mantener un fork al día. Infra (Postgres + app Node). |
| **B. Híbrido** | Adoptar cal.com como motor de scheduling vía su **API/embeds/Platform (Atoms)**, con tu propio front/onboarding por encima. | **Semanas–meses** | Dependes de su API/pricing de Platform. Menos control del dato. |
| **C. Reconstruir (lo que tienes hoy)** | Seguir construyendo el scheduler propio hasta paridad. Control total, sin AGPL, dato 100% tuyo. | **Muchos meses** | Reimplementar disponibilidad, multi-calendario, auth, pagos, etc. Es el grueso de este documento (§5). |

**Recomendación:** si el objetivo de negocio es "tener un cal propio ya", evaluar **A** seriamente (días vs meses). Si el objetivo es un producto diferenciado y propiedad total del stack/dato, **C**. Este documento detalla **C** (el camino más largo), porque es el que requiere plan; si eliges A/B, el plan se reduce a una fracción.

> **Acción requerida:** decidir A / B / C antes de invertir en fases. El resto asume **C**.

---

## 2. Gap analysis — estado actual vs cal.com

### Lo que YA existe (✅)
- Booking público en 3 pasos (elegir slot → datos → confirmación) con identidad Plaz.
- Backend n8n: WF-01 booking, WF-07 cancel, WF-08 get-availability, WF-09/10 OAuth Google.
- Supabase schema `plaz_scheduler`: `persons`, `teams`, `bookings`, `clients`, `booking_links`.
- Round-robin de asignación. Google Calendar (freebusy + crear/borrar evento). Cancelación con HMAC.
- Email de confirmación (WF-06). Links single-use / generales.

### Lo que FALTA para paridad cal.com (❌ / parcial)
| Dominio | cal.com | Plaz hoy |
|---|---|---|
| **Tipos de evento** | N por usuario, con duración, ubicación, descripción, color, slug | ❌ 1 implícito (30 min) |
| **Disponibilidad** | Horarios de trabajo, múltiples schedules, buffers, antelación min/máx, límites/día, date overrides, fechas bloqueadas | ⚠️ slots básicos en WF-08 |
| **Zona horaria invitado** | Detección + selector, todo en su tz | ❌ (Madrid fijo; lo quitamos) |
| **Reagendar** | Flujo real (mueve evento, conserva booking) | ❌ solo cancelar |
| **Ubicaciones** | Meet, Zoom, Teams, presencial, teléfono, link custom | ❌ |
| **Tipos de asignación** | Individual, colectivo, round-robin, managed | ⚠️ solo round-robin |
| **Multi-calendario** | Google, Office365/Outlook, CalDAV, Apple; selección de "calendario destino" y "calendarios de conflicto" | ⚠️ solo Google |
| **Video** | Meet nativo, Zoom/Teams vía OAuth, Daily/Jitsi | ⚠️ Meet vía GCal |
| **Notificaciones** | Confirmación, recordatorios (24h/1h), follow-up, SMS, workflows | ⚠️ solo confirmación |
| **Auth / cuentas** | Email+password, Google/SAML SSO, sesiones | ❌ |
| **Backoffice host** | Dashboard: event types, availability, bookings, integraciones, settings | ❌ (config manual en Supabase) |
| **Multi-tenant** | Cada user/team con slug público `/usuario/evento`, onboarding self-serve | ❌ |
| **Pagos** | Stripe por tipo de evento | ❌ |
| **Embeds / API** | Embed JS, API pública v2, webhooks | ❌ |
| **Routing forms / workflows** | Formularios con enrutado, automatizaciones | ❌ |
| **Admin / billing** | Planes, suscripciones, panel org | ❌ |

---

## 3. Decisiones arquitectónicas (camino C)

El stack actual **no soporta** SaaS multi-tenant. Cambios necesarios:

1. **Front: de static export → Next.js full-stack (SSR/RSC + API routes).**
   GitHub Pages no sirve para páginas dinámicas por slug, auth con cookies, ni server actions. Migrar a hosting con runtime: **Vercel** (natural para Next) o Node en VPS. `basePath`/export se retiran.
2. **Backend: Supabase como núcleo (Postgres + Auth + RLS + Edge Functions/Realtime).**
   n8n deja de ser la "API" y pasa a ser **orquestador de automatizaciones** (recordatorios, follow-ups, sincronizaciones). La lógica transaccional (crear booking, calcular slots) se mueve a código testeable (API routes / Edge Functions) — n8n es difícil de versionar/testear para lógica crítica.
3. **Auth: Supabase Auth** (email+OTP/password, OAuth Google; SAML en plan enterprise).
4. **Multi-calendario:** abstracción `CalendarProvider` con implementaciones Google (existe), **Microsoft Graph** (Outlook), **CalDAV** (Apple/otros). Freebusy unificado.
5. **Pagos: Stripe** (Checkout + webhooks → confirmación condicionada al pago).
6. **Modelo multi-tenant:** todo cuelga de `organization`/`user` con slugs; RLS por tenant.
7. **Testing:** suite e2e (Playwright) del flujo de booking como **loop de verificación** de cada fase.

> Migración incremental: el booking público actual sigue vivo durante la transición; se reescribe endpoint por endpoint.

---

## 4. Modelo de datos objetivo (Supabase, evolución del actual)

```
organizations (id, slug, name, plan, stripe_customer_id)
users (id, org_id, email, name, timezone, avatar_url)            # Supabase Auth
memberships (user_id, org_id, role)                               # owner/admin/member
credentials (id, user_id, type[google|office365|caldav|zoom], tokens, scopes)
schedules (id, user_id, name, timezone)                          # horarios de trabajo
availability (id, schedule_id, weekday, start, end)              # tramos
date_overrides (id, schedule_id, date, start, end | unavailable)
event_types (id, owner[user|team], slug, title, description,
             length, location_type, color, schedule_id,
             assignment[individual|collective|round_robin],
             buffer_before, buffer_after, min_notice, max_notice,
             slot_interval, booking_limits, price, currency, hidden)
event_type_hosts (event_type_id, user_id, priority)              # equipos/round-robin
booking_questions (id, event_type_id, label, type, required)     # form custom
bookings (id, event_type_id, host_user_id, attendee_*, start, end,
          status[accepted|pending|cancelled|rescheduled],
          location, meeting_url, gcal_event_id, payment_id, uid, ics_uid)
booking_references (booking_id, calendar_credential_id, external_event_id)
webhooks (id, org_id, url, events[], secret)
workflows (id, org_id, trigger, steps[])                          # recordatorios/automatizaciones
payments (id, booking_id, stripe_session_id, amount, status)
```
(Conserva `booking_links` actuales como caso particular de links públicos.)

---

## 5. Roadmap por fases (camino C)

Cada fase es desplegable y verificable de forma independiente. Las fases mapean a los niveles del alcance.

### Fase 0 — Cimientos del stack (habilitador, sin features nuevas para el usuario)
- Migrar front a Next.js con runtime (Vercel o VPS). Retirar `output: export`.
- Activar **Supabase Auth**; introducir `organizations`/`users`/`memberships` + RLS.
- Mover WF-01/WF-08 a API routes/Edge Functions con tests (mantener n8n para emails).
- **Aceptación:** el booking público actual sigue funcionando idéntico, ahora servido desde el nuevo runtime y con la nueva capa de datos; suite e2e en verde.

### Fase 1 — Paridad del flujo de invitado (Nivel 1)
- **Tipos de evento** (modelo + render de `/[org]/[evento]`), múltiples duraciones.
- **Zona horaria del invitado** (detección + selector) — reintroducir bien (agrupar slots en la tz del invitado, no solo formatear).
- **Ubicaciones**: Meet (ya), teléfono, presencial, link custom; mostrar en confirmación + ICS.
- **Reagendar** real (link que mueve el evento y conserva el booking).
- **Preguntas custom** en el formulario.
- **Add-to-calendar** (Google/Outlook/.ics) y **recordatorios** por email (n8n workflow 24h/1h).
- **Aceptación:** un invitado reserva un tipo de evento en su zona horaria, recibe confirmación + recordatorio, puede reagendar y cancelar. e2e cubre los 4 caminos.

### Fase 2 — Backoffice del host (Nivel 2)
- Dashboard autenticado: **CRUD de tipos de evento**, **editor de disponibilidad** (horarios, buffers, overrides, antelación, límites), **lista de bookings** (próximos/pasados, cancelar/reagendar), **conectar Google** desde la UI (WF-09 detrás).
- Asignación: individual / colectivo / round-robin configurable por tipo de evento.
- **Aceptación:** un consultor configura su evento y disponibilidad sin tocar Supabase; los cambios se reflejan en su página pública.

### Fase 3 — Multi-tenant / self-serve (Nivel 3)
- **Onboarding**: registro → crear org → slug → conectar calendario → primer event type (wizard estilo cal.com).
- Páginas públicas por slug `/[org]` y `/[org]/[evento]`; gestión de **equipos** (invitar miembros, roles).
- Aislamiento por tenant (RLS), branding básico por org.
- **Aceptación:** un usuario nuevo se registra, conecta su calendario y comparte su link en < 5 min, sin intervención manual.

### Fase 4 — Integraciones y multi-calendario (parte de Nivel 4)
- **Outlook/Office365** (Microsoft Graph) y **CalDAV/Apple**; selección de calendario destino y calendarios de conflicto.
- **Zoom/Teams** como ubicaciones vía OAuth.
- **Webhooks** salientes + **API pública v2** (REST) con API keys.
- **Aceptación:** reservar con conflictos detectados across Google+Outlook; crear reunión Zoom automáticamente; un webhook notifica `booking.created`.

### Fase 5 — Monetización y avanzado (resto de Nivel 4)
- **Stripe**: precio por tipo de evento, booking `pending` hasta pago, webhook confirma.
- **Planes/billing** de la propia plataforma (suscripción de orgs).
- **Embeds** (script JS + iframe), **routing forms**, **workflows** avanzados (SMS, follow-ups).
- **Aceptación:** un evento de pago cobra vía Stripe y solo confirma tras el pago; embed funciona en una web externa.

---

## 6. Riesgos y mitigaciones
- **Subestimar el esfuerzo** → por eso §1 (gate build/adopt). Reevaluar tras Fase 1.
- **n8n como lógica crítica** → migrar transaccional a código testeable; n8n solo automatizaciones.
- **AGPL si se elige A** → usar licencia comercial de cal.com o aislar modificaciones.
- **Zonas horarias / DST** → librería robusta (Luxon/Temporal) + tests de DST; agrupar slots en tz del invitado.
- **OAuth scopes / tokens caducados** → ya visto (`invalid_grant`); publicar la app Google (no Testing), refresh proactivo, alertas.
- **Multi-tenant + RLS mal configurado** → fuga de datos entre orgs; tests de aislamiento obligatorios.

## 7. Checklist de "1:1 conseguido" (criterio de cierre)
```
[ ] Tipos de evento por usuario/equipo (duración, ubicación, color, slug)
[ ] Disponibilidad: horarios, buffers, overrides, antelación, límites/día
[ ] Zona horaria del invitado end-to-end
[ ] Reservar / reagendar / cancelar (invitado y host)
[ ] Multi-calendario: Google + Outlook + CalDAV (destino + conflictos)
[ ] Video: Meet + Zoom/Teams
[ ] Asignación: individual + colectivo + round-robin
[ ] Auth + onboarding self-serve + páginas por slug
[ ] Equipos y roles
[ ] Notificaciones: confirmación + recordatorios + follow-up
[ ] Pagos Stripe por evento
[ ] Webhooks + API pública + embeds
[ ] Billing de la plataforma (planes de orgs)
```

---

## 8. Siguiente paso inmediato
1. **Resolver el gate §1 (A/B/C).**
2. Si **C**: arrancar **Fase 0** (migración de stack) — es bloqueante de todo lo demás.
3. Convertir cada fase en su propio spec + plan de implementación antes de codear.

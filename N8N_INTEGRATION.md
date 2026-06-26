# Integración n8n ↔ backoffice — spec de implementación

> Contrato que el front del backoffice **ya consume**. Pendiente de construir en n8n.
> ⚠️ Todo lo marcado **[verificar]** depende del esquema real de Supabase, que no pude leer
> (DB en timeout) ni de los workflows existentes (no expuestos al MCP). Confirmar antes de codificar.

## Contexto descubierto (n8n-ovh, producción Distrito Legal — 89 workflows)

- **"DL / Cal.com - Sync Citas a Supabase"** (`bAkiBPHPgU2imSbS`) — hoy las citas viven en cal.com y se sincronizan a Supabase. El backoffice debe leer de esa(s) tabla(s). **[verificar nombre tabla: ¿`citas`? ¿`bookings`?]**
- **"Verificar disponibilidad a comercial especifico - Llamadas ia"** (`pgYgTmDm7TRdkpx8`) — ya calcula disponibilidad por comercial. Reutilizar su lógica para el editor.
- **"Agendar a comercial especifico - Llamadas ia"** (`4CPLQOWbPF953sSx`) — ya crea citas. Reutilizar para cancelar/reagendar.
- **"Reparto - …"** (Brecha de Género, Vuelos, Fiscalidad, Kit Digital…) — Grial round-robin por vertical. El toggle `active` del admin debe entrar/salir aquí. **[verificar: ¿Google Sheet o tabla Supabase?]**

## Identidad por token (sin auth, igual que el booking público)

- `agent_token` y `admin_token` → mapear a un comercial / manager. **[verificar: ¿tabla `comerciales`? ¿campo token existente o hay que añadirlo?]**
- Si no existen tokens, añadir columna `agenda_token uuid` a la tabla de comerciales y poblarla.

---

## Los 6 webhooks a crear

### 1. `GET /webhook/plaz-scheduler-agent-agenda?agent_token=…`
Devuelve `{ agent_name, bookings[] }`. Cada booking: `booking_id, start_utc, duration_minutes, booker_name, booker_email, status('confirmed'|'completed'|'cancelled'), meet_url?, vertical?, notes?`.
- Resolver comercial por token → query citas WHERE comercial = X **[verificar tabla/campos]**.
- `status`: derivar de estado de la cita + si `start_utc < now()` → completed.

### 2. `POST /webhook/plaz-scheduler-cancel`  body `{ agent_token, booking_id }`
Devuelve `{ status:'cancelled', booking_id }`.
- Validar que la cita pertenece al comercial del token.
- Cancelar en la fuente (cal.com hoy / Supabase) + propagar. Reutilizar lógica de "Agendar a comercial".

### 3. `GET /webhook/plaz-scheduler-agent-availability?agent_token=…`
Devuelve `{ agent_name, schedule: { timezone, days:[{weekday(1-7), enabled, ranges:[{start,end}]}] } | null }`.
- `null` si el comercial no tiene horario configurado (el front pone default L-V 9-18).
- **[verificar: ¿dónde se guarda hoy la disponibilidad del comercial?]**

### 4. `POST /webhook/plaz-scheduler-agent-availability`  body `{ agent_token, schedule }`
Devuelve `{ status:'saved' }`. Persiste el horario semanal. Debe ser la fuente que lee "Verificar disponibilidad".

### 5. `GET /webhook/plaz-scheduler-admin-team?admin_token=…`
Devuelve `{ admin_name, agents:[{ id, name, email, active, agent_token, upcoming_count, vertical? }] }`.
- `active` = si está en el reparto Grial. `upcoming_count` = citas confirmadas futuras del comercial.

### 6. `POST /webhook/plaz-scheduler-admin-agent-active`  body `{ admin_token, agent_id, active }`
Devuelve `{ status:'ok', agent_id, active }`.
- Activa/desactiva al comercial en el **reparto Grial** **[verificar: Sheet vs tabla]**.

---

## Notas de implementación n8n (SDK)
- Patrón: Webhook node → (Postgres/Supabase node | reusar subworkflow existente) → Respond to Webhook.
- CORS: el front es estático en GitHub Pages → habilitar `Access-Control-Allow-Origin` para el dominio del scheduler.
- Reusar credencial Supabase y los subworkflows de disponibilidad/agendar ya existentes en lugar de duplicar SQL.

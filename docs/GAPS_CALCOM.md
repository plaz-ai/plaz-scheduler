# Análisis de gaps — cal.com vs nuestro scheduler (Plaz) — SÍNTESIS VERIFICADA

> Actualizado 2026-06-26. Este documento NO repite el análisis ya existente: lo **verifica
> contra el estado real del código** (`origin/main`) y lo **reconcilia con la auditoría de
> backend** (`AUDITORIA_N8N_SUPABASE.md`). Conclusión clave abajo.

## ⚠️ El análisis de gaps YA EXISTE (no rehacer)

Hay dos documentos maduros y vigentes en `origin/main` (rama de producción):

1. **`docs/cal-clone-roadmap.md`** — tabla comparativa completa cal.com vs Plaz (viabilidad
   🟢/🟡/🔴, esfuerzo S/M/L, valor, dependencia backend) + roadmap en 3 fases. **Es la
   referencia de gaps.** Leerlo con `git show origin/main:docs/cal-clone-roadmap.md`.
2. **`docs/MIGRACION-CALCOM-1a1.md`** — plan de paridad 1:1. Gate de decisión **RESUELTO:
   camino C (motor propio)**, modelo de datos objetivo, roadmap de 6 fases (0–5), riesgos,
   checklist de cierre. Leerlo con `git show origin/main:docs/MIGRACION-CALCOM-1a1.md`.

> Mi aporte: verificar qué de esos planes YA está hecho, qué falta de verdad, y dónde está
> el cuello de botella real (que esos docs no podían saber porque son previos a la auditoría).

---

## CONCLUSIÓN PRINCIPAL — el gap real es BACKEND, no front

El front de producción (`origin/main`) **ya cubre casi toda la Fase 1** del flujo de invitado.
Pero esas features **corren con mock**: los contratos están definidos en el front, pero los
webhooks n8n que deberían servirlos **no existen** (auditoría 2026-06-26).

**De los 10 webhooks que el front referencia, solo 2 están vivos** (`get-availability`,
`booking`). El resto (cancel, respond, reschedule, agent-agenda, agent-availability,
admin-team, admin-agent-active, admin-call-types) → **404 / inexistentes**. Y n8n está
**bloqueado** para auditar/editar vía MCP (`availableInMCP:false` en los 44 workflows).

→ **Lo que falta para "ponerlo en nuestro cal" no son más componentes de front, sino:**
   1. **Crear los webhooks n8n** que respaldan las features ya construidas en front.
   2. **Levantar el bloqueo MCP** (admin habilita "Enable MCP access" o exporta JSON).
   3. **Reconciliar el backoffice local** (sin commitear) con `origin/main` (ver auditoría).

---

## Estado VERIFICADO de la Fase 1 (flujo de invitado) — código en origin/main

Evidencia: `src/features/agenda/types.ts` y archivos de `src/features/agenda/`.

| Funcionalidad cal.com | Front (origin/main) | Backend (n8n) | Gap real |
|---|---|---|---|
| Tipos de evento (`EventType`) | ✅ `EventTypePicker.tsx` + tipo `EventType` | ❌ availability no devuelve `event_types` real | **Backend**: webhook debe poblar `event_types[]` |
| Múltiples duraciones (`available_durations`) | ✅ en `SlotPicker` | ❌ | **Backend** |
| Preguntas custom (`BookingQuestion`) | ✅ tipos text/textarea/tel | ❌ (`answers` lo ignora el backend) | **Backend** persistir `answers` |
| Ubicación (`location_label`) | ⚠️ solo label único | ❌ | **Front+Backend**: location estructurada/seleccionable |
| Zona horaria invitado | ✅ `lib/timezone.ts` (detect+regroup) | n/a (front) | — |
| Formato 12/24h | ✅ `lib/timeFormat.ts` | n/a | — |
| Add-to-calendar (.ics/Google/Outlook) | ✅ `lib/calendar-export.ts` | n/a | — |
| Reagendar (`RescheduleInfo/Payload`) | ✅ `RescheduleConfirm.tsx` | ❌ webhooks `reschedule`/`reschedule-info` inexistentes | **Backend** |
| Cancelar | ✅ `cancel/CancelPage.tsx` | ❌ `cancel`/`cancel-details` → 404 | **Backend** |
| Confirmación por email | ❌ | ⚠️ infra existe (n8n email) pero sin workflow | **Backend** (alto valor) |
| Recordatorios (email/SMS) | ❌ | ❌ | **Backend** (n8n) |
| Estado "requiere confirmación" (pending) | ❌ (`BookingResult.status` solo `'confirmed'`) | ❌ | Front+Backend |
| Invitados adicionales (`guests[]`) | ❌ | ❌ | Front+Backend (S) |
| Redirect tras reservar | ❌ | ❌ | Front (S) |

## Gaps de disponibilidad (Fase 2) — todo backend

El front es "tonto": pinta los `available_days/slots` que da el webhook. Por eso estos son
**cálculo en n8n** con front mínimo:
- Buffers antes/después · Antelación mínima · Ventana futura (N días) · Incrementos de slot ·
  Límite de frecuencia (día/semana/mes) · Límite de duración total · Restriction schedules.
- Contrato a extender: que `get-availability` devuelva metadatos (`min_notice_minutes`,
  `booking_window_days`) para que el front deshabilite navegación fuera de ventana.

## Gaps grandes (Fase 3–5) — proyectos dedicados (del MIGRACION-CALCOM)

Backoffice del host autenticado · Multi-tenant/self-serve (slugs `/[org]/[evento]`) ·
Auth (Supabase Auth) · Multi-calendario (Outlook/CalDAV) · Video (Zoom/Teams) · Asignación
colectivo/managed · Pagos Stripe · Webhooks salientes + API pública v2 · Routing forms ·
i18n · Embeds · Billing de plataforma. **Requiere el cambio de stack de Fase 0** (salir de
export estático → Next.js full-stack + Supabase Auth + lógica transaccional en código).

## Nota sobre el backoffice local (admin/agente)

El working tree local tiene features de backoffice (`agent-agenda`, `availability`,
`admin-team`, `admin-call-types`) que **no están en `origin/main`** y dependen de 8 webhooks
inexistentes. Son un adelanto de la **Fase 2 (backoffice del host)** pero construidos sobre el
modelo viejo (cal.com/disponibilidad manual/call_types) en vez del real (Google Calendar).
Ver `AUDITORIA_N8N_SUPABASE.md` y la nota de reconciliación git.

---

## Recomendación priorizada — qué poner AHORA en nuestro cal

Dado que el front de Fase 1 ya existe y el cuello de botella es backend:

**P0 — Hacer real lo que el front ya hace (mayor ROI):**
1. Crear webhook **`plaz-scheduler-cancel`** + **`cancel-details`** (el front ya los llama; hoy 404).
2. Crear webhook **`reschedule`** + **`reschedule-info`** (RescheduleConfirm ya construido).
3. **Confirmación por email** vía n8n tras `booking` (infra ya existe — alto valor, esfuerzo M).
4. Que `get-availability` devuelva **`event_types[]`** real (el picker ya existe en front).

**P1 — Quick wins front-light (del roadmap Fase 1):**
5. Invitados adicionales (`guests[]`) · Redirect post-booking · Estado `pending`.

**P2 — Reglas de disponibilidad (Fase 2, backend n8n):**
6. Buffers, antelación mínima, ventana futura → en `get-availability` + metadatos al front.
7. Recordatorios (email/SMS) vía n8n.

**Prerrequisito transversal:** levantar el bloqueo MCP de n8n para poder crear/editar esos
workflows (admin habilita "Enable MCP access"). Sin eso, P0–P2 quedan especificados pero no
implementables vía las herramientas actuales.

---

## Estado de la auditoría / pendientes
**Iteración actual:** 2.
**Áreas del checklist — cubiertas por verificación cruzada:**
- [x] Event Types / duraciones / preguntas → front ✅, backend ❌ (documentado)
- [x] Disponibilidad avanzada → todo backend (documentado)
- [x] Booking flow (reschedule/cancel/locations/guests/redirect/pending) → documentado
- [x] Round-robin/equipos → backend (existe round-robin básico; colectivo/managed faltan)
- [x] Calendario (Google ✅; Outlook/CalDAV faltan) → documentado
- [x] Notificaciones (confirmación/recordatorios) → faltan, n8n → documentado
- [x] Pagos/aprobación/routing forms → Fase 5, documentado
- [x] Equipos y permisos / Auth / multi-tenant → Fase 3, requiere cambio de stack
- [x] Embeds / API pública → Fase 4-5
- [x] Reschedule y políticas → reschedule front ✅ backend ❌; políticas faltan
- [x] Zona horaria / i18n / 12-24h → tz ✅, 12/24h ✅, i18n falta
- [x] Panel de bookings → backoffice local (sin commit) / Fase 2

**Lo único no resoluble por mí:** crear/editar los workflows n8n (BLOQUEO MCP, ver auditoría).
El análisis de gaps en sí está COMPLETO y verificado contra código real.

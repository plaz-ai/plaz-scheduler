# Qué clonar de Cal.com a nuestro scheduler — estudio y roadmap

> Estudio de funcionalidades de Cal.com y su viabilidad de clonado en **plaz-scheduler**
> (Next.js 16 export estático en GitHub Pages + backend n8n/Supabase vía webhooks, identidad navy+ámbar).
> Investigado desde la documentación pública de Cal.com (fuentes al final). Solo lectura, sin tocar backend.

## 1. Resumen ejecutivo

Nuestro scheduler ya cubre el **núcleo del flujo de reserva estilo Cal.com**: tipos de evento,
duraciones múltiples, preguntas personalizadas, calendario+slots, zona horaria del invitado,
reserva, reagendado, cancelación y add-to-calendar. Lo que falta son **reglas de disponibilidad
avanzadas, automatizaciones y tipos de evento de equipo**.

Clave de viabilidad para nuestro stack: el **front es estático** y solo renderiza lo que el webhook
de disponibilidad le da. Por eso la mayoría de las "reglas de límites" de Cal (buffers, antelación
mínima, ventana futura, frecuencia) son **trabajo de backend** (n8n calcula slots) con cambio de
front mínimo. Y los **recordatorios/workflows** encajan de forma natural con n8n, que ya usamos.

**Quick wins recomendados (Fase 1, front-light, alto valor):**
1. **Formato 12/24h** del horario (puro front). 
2. **Confirmación por email** de la reserva (n8n, ya tenemos infra de email).
3. **Estado "requiere confirmación"** (pending) en la pantalla de éxito (front + status backend).
4. **Invitados adicionales / ocultar invitados** en el formulario (campo + payload).
5. **Políticas de reagendar/cancelar** (mensaje + límite de tiempo) en la UI.

## 2. Tabla comparativa

Leyenda viabilidad: 🟢 front-only · 🟡 front + contrato backend · 🔴 backend pesado / servicio externo.
Esfuerzo: S (≤1 día) · M (días) · L (semana+).

| Funcionalidad | ¿Cal? | ¿Nosotros ya? | Viabilidad stack | Esf. | Valor | Dependencia backend |
|---|---|---|---|---|---|---|
| Tipos de evento múltiples | ✅ | ✅ EventTypePicker | 🟢 | — | — | — |
| Duraciones múltiples por tipo | ✅ | ✅ SlotPicker `available_durations` | 🟢 | — | — | — |
| Preguntas personalizadas (booking questions) | ✅ | ✅ parcial (text/tel/textarea, req/opt) | 🟡 ampliar tipos (select, multi, número, checkbox) | M | Medio | esquema de preguntas |
| Ubicaciones (presencial/teléfono/video/link) | ✅ | ⚠️ solo label único | 🟡 elección de ubicación por el invitado | M | Medio | tipo+valor de location |
| Zona horaria del invitado | ✅ | ✅ auto-detect + regroup | 🟢 | — | — | — |
| **Formato 12/24h** | ✅ | ❌ | 🟢 toggle de display | **S** | Medio | — |
| Reagendar | ✅ | ✅ RescheduleConfirm | 🟡 ya existe | — | — | webhook reschedule |
| Cancelar | ✅ | ✅ CancelPage | 🟡 ya existe | — | — | webhook cancel |
| **Políticas reagendar/cancelar** (límite de tiempo) | ✅ | ❌ | 🟡 mensaje+gate en UI, enforcement backend | S | Medio | flag/política |
| **Confirmación por email** | ✅ | ❌ (solo add-to-calendar en pantalla) | 🔴→🟡 n8n nativo | M | **Alto** | workflow n8n |
| **Recordatorios/workflows (email/SMS)** | ✅ | ❌ | 🔴→🟡 n8n nativo | M | **Alto** | workflows n8n |
| **Requiere confirmación (aprobación manual)** | ✅ | ❌ | 🟡 estado "pending" en éxito | M | Medio | status=pending |
| Buffers antes/después | ✅ (Limits) | ❌ | 🟡 front ya renderiza slots | S-M | Medio | cálculo en availability |
| Antelación mínima | ✅ | ❌ | 🟡 idem | S | Medio | availability |
| Ventana de reserva futura (N días / rango) | ✅ | ❌ | 🟡 front puede limitar nav; backend filtra | S-M | Medio | availability |
| Límite de frecuencia (por día/semana/mes) | ✅ | ❌ | 🔴 lógica backend | M | Medio | Supabase + availability |
| Límite de duración total reservable | ✅ | ❌ | 🔴 lógica backend | M | Bajo | Supabase |
| Incrementos/offset de slots | ✅ | ❌ | 🟡 | S | Bajo | availability |
| Invitados adicionales / desactivar invitados | ✅ | ❌ | 🟢 campo + payload | S | Medio | acepta `guests[]` |
| Redirect tras reservar | ✅ | ❌ | 🟢 leer URL del tipo y redirigir | S | Bajo | campo en event type |
| Eventos recurrentes | ✅ | ❌ | 🔴 front (recurrencia) + backend | L | Bajo-Medio | series en backend |
| Seats (varios asistentes por slot) | ✅ | ❌ | 🔴 front (cupos) + backend | L | Bajo | conteo de seats |
| Round-robin / colectivo / managed (equipo) | ✅ | ❌ | 🔴 backend asigna host; front agnóstico | L | Bajo* | asignación host |
| Restriction schedules (equipo) | ✅ | ❌ | 🔴 backend | M | Bajo | availability |
| Pagos (Stripe) / no-show fee | ✅ | ❌ | 🔴 front (checkout) + backend + Stripe | L | Bajo-Medio | Stripe + webhooks |
| Routing forms (enrutado por respuestas) | ✅ | ❌ | 🔴 front (form) + backend | L | Bajo | reglas de routing |
| Branding/tema | ✅ | ✅ navy+ámbar, dark/light | 🟢 | — | — | — |
| Accesibilidad (focus, aria, reduced-motion, tap targets) | ✅ | ✅ pase a11y reciente | 🟢 | — | — | — |
| i18n | ✅ | ⚠️ es fijo | 🟢 extraer strings | M | Bajo | — |
| Embeds (iframe/popup) | ✅ | ❌ | 🟢 export ya embebible vía iframe | S | Bajo | — |
| Webhooks salientes / integraciones | ✅ | ⚠️ vía n8n | 🟡 ya es n8n | — | — | n8n |
| Add-to-calendar (Google/Outlook/.ics) | ✅ | ✅ SuccessScreen | 🟢 | — | — | — |
| "Lo antes posible" (atajo) | ⚠️ no destacado | ✅ propio | 🟢 ventaja nuestra | — | — | — |

\* Round-robin tiene bajo valor **para nuestro caso si cada link es de un host único**; sube si
vendemos agendado de equipo.

## 3. Roadmap priorizado

### Fase 1 — Quick wins (front-light, 1 sprint)
- **Formato 12/24h** (toggle de display, puro front). 🟢 S
- **Invitados adicionales / desactivar invitados** (campo en BookingForm + payload). 🟢 S
- **Confirmación por email** vía n8n (workflow tras `booking`). 🟡 M — alto valor, infra ya existe.
- **Estado "requiere confirmación"** (variante pending de SuccessScreen + `status: pending`). 🟡 M
- **Políticas reagendar/cancelar** (copy + gate por tiempo en UI). 🟡 S
- **Redirect tras reservar** (campo opcional en event type). 🟢 S

### Fase 2 — Reglas de disponibilidad + automatización (leverage n8n)
- **Buffers, antelación mínima, ventana futura, incrementos** — el webhook de disponibilidad calcula
  y el front ya renderiza; sumar enforcement visual en el calendario (deshabilitar fuera de ventana). 🟡 S-M c/u
- **Recordatorios/workflows (email/SMS)** vía n8n. 🟡 M — alto valor.
- **Límites de frecuencia/duración** (Supabase + availability). 🔴 M
- **Ubicaciones seleccionables por el invitado** (multi-location). 🟡 M

### Fase 3 — Features grandes (proyecto dedicado c/u)
- **Pagos (Stripe)** + no-show fee. 🔴 L
- **Eventos recurrentes**. 🔴 L
- **Seats** (cupos por slot). 🔴 L
- **Tipos de equipo** (round-robin/colectivo/managed) + restriction schedules. 🔴 L
- **Routing forms**. 🔴 L
- **i18n** completo. 🟢-🟡 M

## 4. Notas de arquitectura

- **El front ya es "tonto" respecto a disponibilidad**: pinta los `available_days/slots` que devuelve
  `GET /webhook/plaz-scheduler-get-availability`. Por eso buffers/antelación/ventana/frecuencia son
  **cambios en ese webhook** (n8n + cálculo), con front mínimo (a lo sumo deshabilitar navegación de
  calendario fuera de la ventana). Contrato a extender: que la respuesta incluya metadatos de límites
  (p. ej. `min_notice_minutes`, `booking_window_days`) para que el front los refleje sin recalcular.
- **Automatización = n8n**: confirmación por email y recordatorios encajan como workflows n8n
  disparados por el webhook de `booking` (no requieren front salvo, quizá, opt-in de SMS). Es el área
  de **mejor relación valor/esfuerzo** porque ya tenemos n8n + Universal Email Sender.
- **Requiere confirmación**: backend devuelve `status: 'pending'` en `createBooking`; el front necesita
  una variante de `SuccessScreen` ("Tu solicitud está pendiente de confirmación") — hoy `api.ts`
  exige `status === 'confirmed'`, habría que aceptar `pending`.
- **Tipos de evento de equipo / round-robin**: la asignación de host vive en backend (de hecho el
  sistema LSO ya hace round-robin de comerciales en n8n). El front del scheduler es agnóstico al host,
  así que el clonado es casi todo backend; el front solo mostraría el host asignado al confirmar.
- **Pagos/recurrentes/seats/routing**: cada uno es un proyecto con front + backend + (Stripe) propios;
  no son quick wins.
- **Contratos a definir con backend (n8n/Supabase)** para Fase 1-2: campos de location estructurada,
  `guests[]` en el payload de booking, `status: pending`, metadatos de límites en availability, y
  workflows de email/recordatorio.

## 5. Fuentes

- Event types — guía: https://cal.com/blog/event-types-guide-calcom
- Guía de settings y features: https://cal.com/blog/a-guide-to-cal-com-s-event-settings-and-features
- Booking limits (frecuencia/duración/futuro): https://cal.com/blog/booking-limits-frequency-duration-future
- Booking frequency: https://cal.com/help/event-types/booking-frequency
- Limitar reservas futuras: https://cal.com/docs/core-features/event-types/limit-future-bookings
- Requires confirmation: https://cal.com/help/event-types/how-to-requires
- Round robin: https://cal.com/help/event-types/round-robin
- Restriction schedule: https://cal.com/help/event-types/restriction-schedule
- API v2 (en uso por LSO): `GET /v2/slots/available`, `POST /v2/bookings`, header `cal-api-version: 2024-08-13`

---
_Estado actual nuestro inventariado desde el código (src/features/agenda, src/features/cancel, api.ts,
types.ts, mock.ts) y docs/FRONTEND.md. Estudio sin cambios de código ni deploy._

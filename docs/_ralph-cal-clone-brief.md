# Brief Ralph — Estudio: qué clonar de Cal.com a nuestro scheduler

## Objetivo
Investigar el conjunto de funcionalidades de Cal.com (vía su documentación y API públicas) y
producir un catálogo PRIORIZADO de funcionalidades clonables a nuestro scheduler (plaz-scheduler),
con análisis de viabilidad y esfuerzo para nuestro stack: Next.js 16 export estático
(`output: export`, basePath `/plaz-scheduler`, GitHub Pages) + backend n8n/Supabase (vía webhooks),
identidad visual navy+ámbar.

## Fuentes de investigación (orden de preferencia)
1. **Documentación pública de Cal.com**: `cal.com/docs` y el API reference de `api.cal.com` (v2,
   header `cal-api-version: 2024-08-13`). Usar WebFetch y/o context7 (`resolve-library-id "cal.com"`
   → `query-docs`) para extraer capacidades y modelo de datos.
2. **Endpoints que YA usamos** (del sistema LSO de DL): `GET /v2/slots/available`, `POST /v2/bookings`.
   Pistas del contrato real.
3. **Nuestro estado actual** — inventariar lo que YA tenemos. Antes de leer código para entender
   arquitectura, usar `graphify query "<pregunta>"` (hay grafo activo en graphify-out/). Archivos:
   `src/features/agenda/*` (EventTypePicker, SlotPicker, CalendarGrid, BookingForm, SuccessScreen,
   RescheduleConfirm), `src/features/cancel/*`, `api.ts`, `types.ts`, `mock.ts`, `docs/FRONTEND.md`.

## Restricciones de investigación (no violar)
- SOLO lectura. Si se consulta la API de Cal.com en vivo: únicamente GET (event-types, schedules,
  slots). NUNCA POST/PUT/DELETE — no crear ni mutar reservas reales.
- NO hardcodear ninguna API key en los documentos. Priorizar documentación pública; si algo requiere
  clave en vivo para verificarse, anotarlo como "pendiente de verificar con key" y continuar.
- Es un ESTUDIO: NO escribir código de feature, NO desplegar, NO tocar el backend. Solo el documento.

## Superficie de Cal.com a evaluar (mínimo; añade lo que descubras)
Para CADA funcionalidad rellenar: descripción · ¿Cal la tiene? · ¿nosotros ya? · viabilidad en
nuestro stack (static export + n8n/Supabase) · esfuerzo (S/M/L) · valor (alto/medio/bajo) ·
dependencias de backend.
- Tipos de evento múltiples · duraciones múltiples · ubicaciones (presencial/teléfono/video/link)
- Booking questions personalizadas (ya tenemos parcial)
- Disponibilidad avanzada: horarios por día, buffers antes/después, mínimo de antelación,
  ventana de fechas reservables, límite de reservas por día/semana, incrementos de slot
- Zonas horarias (ya tenemos) · formato 12/24h
- Reagendar / cancelar (ya tenemos) · políticas (límite de tiempo para cancelar/reagendar)
- Reservas recurrentes · seats (varios asistentes por slot)
- Tipos colectivos / round-robin / asignación de host
- Confirmación manual (requiere aprobación del host) · no-show
- Workflows/recordatorios (email/SMS) · email de confirmación · add-to-calendar (ya tenemos)
- Pagos (Stripe) · routing forms / enrutado por respuestas
- Branding/tema · i18n · accesibilidad
- Webhooks / integraciones salientes

## Método (trozos pequeños, iterativo)
- Iteración 1: inventario de NUESTRO estado actual (qué features ya existen) + crear el esqueleto de
  `docs/cal-clone-roadmap.md` con la tabla y la lista de bloques por investigar.
- Iteraciones siguientes: investigar Cal.com por bloques, rellenar la tabla, marcar el bloque como
  investigado dentro del propio doc. Citar URLs de las fuentes.
- Al final: priorizar (quick wins → medio → grande) y escribir resumen ejecutivo + notas de arquitectura.

## Entregable: `docs/cal-clone-roadmap.md`
1. Resumen ejecutivo — qué clonar primero y por qué (3-5 quick wins).
2. Tabla comparativa — funcionalidad · ¿Cal? · ¿nosotros ya? · viabilidad · esfuerzo S/M/L · valor · deps backend.
3. Roadmap priorizado — fases (quick wins, medio, grande) con lo que entra en cada una.
4. Notas de arquitectura — qué cambios de front + qué contratos n8n/Supabase harían falta por feature.
5. Fuentes citadas — URLs de la doc de Cal.com usadas.

## Criterio de finalización
Cuando `docs/cal-clone-roadmap.md` exista con las 5 secciones completas, TODOS los bloques de la
superficie evaluados (o marcados "fuera de alcance" con razón), y un roadmap priorizado coherente
con nuestro stack. Promise: CAL_CLONE_ESTUDIO_LISTO.

# Brief Ralph — Auto-agendar la cita en Google Calendar (solo front, sin backend)

## Objetivo
Tras una reserva confirmada (`SuccessScreen`), automatizar el alta del evento en el Google Calendar
DEL INVITADO sin que tenga que hacerlo a mano con los botones actuales. Restricción dura: **solo
front, SIN cambiar nada en el backend** (n8n/Supabase/OAuth del scheduler intactos).

## Realidad técnica (asumida y verificada — no rediscutir)
- Un front estático NO puede escribir en el Google Calendar de otra persona sin su consentimiento
  OAuth. Por tanto "100% silencioso, cero clic" es IMPOSIBLE front-only.
- Mejor resultado alcanzable front-only: **OAuth en cliente con Google Identity Services (GIS)** —
  un único clic de permiso y el evento se inserta solo vía Calendar API. Mejora real frente a los
  botones actuales (no hay que teclear ni pulsar "Guardar" en la página de Google).
- El Client ID de Google (Web) es un valor **público** (va embebido en el front) → NO es backend ni
  secreto. Se lee de `NEXT_PUBLIC_GOOGLE_CLIENT_ID`.

## Estado actual (ya verificado)
- `src/features/agenda/steps/SuccessScreen.tsx` arma `calEvent: CalEvent` ({title, start, end,
  location, description, uid}) y muestra botones Google/Outlook/.ics (manuales) vía
  `lib/calendar-export.ts` (`googleCalendarUrl`, `outlookCalendarUrl`, `icsObjectUrl`).
- Tiene `userTz` (TZ del invitado) y `timeFormat` (recién añadido).

## Diseño propuesto (mínimo código, quirúrgico)
1. **`src/features/agenda/lib/google-calendar.ts`** (NUEVO):
   - `getGoogleClientId(): string | undefined` → lee `process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID`.
   - `loadGis(): Promise<void>` → inyecta `https://accounts.google.com/gsi/client` una sola vez (client-side).
   - `addToGoogleCalendar(event: CalEvent, tz: string): Promise<void>`:
     - `await loadGis()`, crea `google.accounts.oauth2.initTokenClient({ client_id, scope: 'https://www.googleapis.com/auth/calendar.events', callback })`.
     - `requestAccessToken()` → con el `access_token`, `POST` a
       `https://www.googleapis.com/calendar/v3/calendars/primary/events` con
       `{ summary, location, description, start:{dateTime, timeZone:tz}, end:{dateTime, timeZone:tz} }`.
     - Resuelve en éxito; rechaza si el usuario declina o la API falla.
   - Tipos: declarar el mínimo global `window.google.accounts.oauth2` (sin dependencias nuevas).
2. **`SuccessScreen.tsx`**: estado `'idle' | 'adding' | 'done' | 'error'`.
   - Si HAY client ID → botón primario "Añadir a Google Calendar" (estilo ámbar, coherente, focus-visible,
     min-h-44, aria-live para el estado). Al pulsar: `addToGoogleCalendar(calEvent, tz)`; en `done`
     mostrar "✓ Añadido a tu Google Calendar"; en `error`/declina → caer a los botones manuales.
   - Si NO hay client ID → comportamiento ACTUAL intacto (botones Google/Outlook/.ics). Cero regresión.
   - Mantener SIEMPRE Outlook/.ics como alternativa (usuarios no-Google). El Google manual puede quedar
     como "otras opciones" o conservarse; decisión del loop, prioriza claridad.
3. **SSR/export-estático safe**: nada de `window`/`google` en render inicial; cargar GIS en el handler/efecto.

## Restricciones (no violar)
- SOLO front. NO tocar `api.ts` contratos, NO n8n/Supabase, NO el OAuth del scheduler.
- NO desplegar, NO commitear. Branch `feat/calcom-fase0`. Trabajar solo en este repo (no el monorepo Front).
- Sin dependencias npm nuevas (GIS se carga por <script>, Calendar API por fetch).
- Mínimo código, sin features extra.

## Método (loop de verificación)
- `graphify query` antes de leer fuentes para arquitectura.
- Gate por iteración: `npm run build` Y `npm run lint` limpios, TS sin errores.
- El flujo OAuth real NO se puede verificar headless (requiere Client ID + cuenta Google interactiva):
  verificar build/lint/TS + revisión de lógica (uso correcto de GIS + Calendar API events.insert +
  manejo de error/declina + fallback). La verificación E2E queda explícitamente para revisión humana.
- Registrar progreso en `docs/_ralph-autogcal-progress.md`: qué se implementó, archivos tocados,
  y el **setup requerido** (crear Client ID OAuth Web en Google Cloud, habilitar Calendar API,
  autorizar orígenes JS `https://plaz-ai.github.io` y `http://localhost:3000`, definir
  `NEXT_PUBLIC_GOOGLE_CLIENT_ID`; nota: la app en modo Testing muestra aviso de "app no verificada").

## Criterio de finalización
Cuando: (a) `lib/google-calendar.ts` implemente el flujo GIS + Calendar API insert; (b) `SuccessScreen`
ofrezca el alta automática con un clic cuando hay Client ID, con estados y fallback a los botones
actuales; (c) sin Client ID el comportamiento actual quede intacto (cero regresión); (d) `npm run build`
y `npm run lint` limpios; (e) progreso + setup documentados en `docs/_ralph-autogcal-progress.md`.
Promise: AUTO_GCAL_LISTO.

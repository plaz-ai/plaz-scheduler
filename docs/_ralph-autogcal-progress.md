# Progreso — Auto-agendar en Google Calendar (solo front, OAuth en cliente)

> Gate por iteración: `npm run build` + `npm run lint` limpios.
> Estado: ✅ build OK · ✅ lint limpio · ✅ TS OK. ⚠️ Flujo OAuth E2E: pendiente verificación humana (requiere Client ID + cuenta Google).

## Qué se implementó
Tras una reserva confirmada, el invitado puede añadir la cita a **su** Google Calendar con **un solo
clic de permiso**; el evento se inserta solo vía Calendar API. Sin backend, sin secretos, sin
dependencias npm nuevas. Si no hay Client ID configurado, el comportamiento es el actual (botones
manuales Google/Outlook/.ics) → **cero regresión**.

## Por qué no es "cero clic"
Un front estático no puede escribir en el calendario de otra persona sin su consentimiento OAuth.
Lo máximo front-only es 1 clic de permiso → luego inserción automática (mejor que el flujo manual,
que obliga a abrir Google y pulsar "Guardar").

## Archivos tocados
- `src/features/agenda/lib/google-calendar.ts` — NUEVO: `getGoogleClientId()`, `loadGis()` (carga GIS
  una vez), `addToGoogleCalendar(event, tz)` (token OAuth implícito + `POST .../calendars/primary/events`).
  Tipos GIS declarados localmente (sin dependencias).
- `src/features/agenda/steps/SuccessScreen.tsx` — estado `idle/adding/done/error`, handler
  `handleAddToGoogle`, botón primario "Añadir a Google Calendar" (con spinner/aria-live), confirmación
  "✓ Añadido a tu Google Calendar", y fallback a los botones manuales (extraídos a `calendarButtons`).

## Comportamiento
- **Con Client ID**: botón primario ámbar → consentimiento → inserta → "✓ Añadido". Error/declina →
  mensaje + botones manuales. Outlook/.ics siempre disponibles para no-Google.
- **Sin Client ID**: idéntico a hoy (botones manuales). Cero regresión.

## Setup requerido para activarlo (fuera del código, NO es backend)
1. En Google Cloud Console (mismo proyecto del scheduler o uno nuevo): crear un **OAuth 2.0 Client ID
   tipo "Web application"**.
2. Habilitar la **Google Calendar API** en ese proyecto.
3. **Authorized JavaScript origins**: `https://plaz-ai.github.io` y `http://localhost:3000`.
4. Definir `NEXT_PUBLIC_GOOGLE_CLIENT_ID=<client_id>` (el Client ID es público; se inyecta en build —
   en GitHub Actions como variable, en local en `.env.local`).
5. Scope usado: `https://www.googleapis.com/auth/calendar.events`.

⚠️ Nota: si la app OAuth está en modo **Testing**, Google muestra aviso de "app no verificada" y solo
permite usuarios de prueba. Para producción pública habría que **publicar/verificar** la app (esto NO
es código front; es config de Google Cloud, decisión del admin).

## Verificación
- `npm run lint`: limpio.
- `npm run build`: compila, TS OK, 6/6 páginas.
- Lógica revisada: popup tras gesto de usuario (no bloqueado), sin estados colgados (error→fallback),
  dateTime UTC+timeZone correcto, SSR-safe (Client ID inlined, sin `window` en render).
- ⚠️ El flujo OAuth real (consentimiento + insert) NO es verificable headless: requiere Client ID y
  login interactivo de Google. Queda para revisión humana.

## Sin tocar (respetando "solo front, sin back")
- `api.ts`, contratos, n8n, Supabase, OAuth del scheduler: intactos.
- No deploy, no commit. Branch `feat/calcom-fase0`. Copia en monorepo Front: NO tocada (pendiente portar
  `lib/google-calendar.ts` + cambios de SuccessScreen si se quiere paridad).

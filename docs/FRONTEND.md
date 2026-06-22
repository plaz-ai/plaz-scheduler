# Frontend del Scheduler (plaz-scheduler)

Documentación del frontend de agendamiento de citas de Plaz: un clon autohospedado del flujo de reserva de cal.com, con la identidad visual de Plaz (navy + ámbar). Sustituye a cal.com como página pública donde el cliente elige horario, reserva y, si lo necesita, cancela.

> Estado actual: desplegado en producción en **GitHub Pages** funcionando sobre una **capa de datos simulada (mock)**. Aún no está conectado al backend real (n8n + Supabase). Ver [Backend pendiente](#backend-pendiente).

---

## Stack

- **Next.js 16** (App Router, Turbopack) con **export estático** (`output: 'export'`).
- **React 19**.
- **Tailwind CSS v4** (con *container queries* nativas).
- **GSAP** (`@gsap/react`) para animaciones de entrada/transición.
- Despliegue: **GitHub Pages** vía GitHub Actions.

---

## Estructura de carpetas

```
src/
├── app/                          # App Router (rutas + estáticos)
│   ├── layout.tsx                # layout raíz: fuentes (Fraunces + Plus Jakarta), metadata
│   ├── globals.css               # tokens de color de marca + utilidades
│   ├── agenda/page.tsx           # ruta /agenda  → renderiza AgendaLoader
│   └── cancelar/page.tsx         # ruta /cancelar → renderiza CancelLoader
│
└── features/
    ├── agenda/                   # feature de reserva (pasos 1-3)
    │   ├── AgendaLoader.tsx      # lee ?id= y monta AgendaPage dentro de <Suspense>
    │   ├── AgendaPage.tsx        # orquesta los 3 pasos + estados (loading/error/...)
    │   ├── api.ts                # fetchAvailability / createBooking (+ conmutador mock)
    │   ├── mock.ts               # datos simulados (sin backend)
    │   ├── types.ts              # contratos de datos
    │   ├── steps/
    │   │   ├── SlotPicker.tsx    # paso 1 — selector estilo cal.com
    │   │   ├── BookingForm.tsx   # paso 2 — datos del cliente
    │   │   └── SuccessScreen.tsx # paso 3 — confirmación
    │   └── components/
    │       ├── MonthCalendar.tsx # calendario mensual navegable
    │       └── TimeSlotButton.tsx# botón de horario
    │
    └── cancel/                   # feature de cancelación
        ├── CancelLoader.tsx      # lee ?token= y monta CancelPage dentro de <Suspense>
        ├── CancelPage.tsx        # estados: cargando / error / confirmar / cancelada / mantenida
        ├── api.ts                # fetchCancelDetails / cancelBooking (+ mock)
        └── types.ts              # contratos de cancelación
```

Convención: cada *feature* (`agenda`, `cancel`) es autónoma — sus tipos, su capa de datos (`api.ts` + `mock.ts`), sus vistas y sus componentes viven juntos.

---

## Rutas y export estático

El sitio se exporta como HTML estático (`output: 'export'`), por lo que **no hay rutas dinámicas** (`[token]`). El identificador viaja como *query param* y se lee en cliente:

| Ruta | Param | Ejemplo |
|---|---|---|
| `/agenda` | `?id=<token>` | `/agenda/?id=demo` |
| `/cancelar` | `?token=<token>` | `/cancelar/?token=demo` |

Patrón **Loader**: como `useSearchParams()` requiere ejecución en cliente bajo export estático, cada página estática renderiza un *Loader* (`AgendaLoader` / `CancelLoader`) que:
1. envuelve el contenido en `<Suspense>`,
2. lee el token del query param,
3. si falta el token muestra un mensaje de enlace inválido,
4. si existe, monta la vista real (`AgendaPage` / `CancelPage`).

Configuración relevante en `next.config.ts`:

```ts
const basePath = '/plaz-scheduler';   // el repo se sirve en github.io/plaz-scheduler
output: 'export', trailingSlash: true, basePath, assetPrefix: basePath,
images: { unoptimized: true }
```

> Por el `basePath`, los enlaces internos (p. ej. `cancel_url`) usan `next/link` o rutas relativas con el prefijo `/plaz-scheduler` para no romperse.

---

## Capa de datos

`types.ts` define los contratos (resumen):

- `AvailabilityResponse` — `team_name`, `duration_minutes`, `available_days[]`, banderas `link_expired` / `link_exhausted`.
- `AvailableDay` — `date` (`"YYYY-MM-DD"`), `label`, `short_label`, `slots[]`.
- `TimeSlot` — `start_utc`, `end_utc`, `start_madrid` (`"HH:00"`).
- `BookingPayload` / `BookingResult` — datos de envío y respuesta de reserva.
- `SelectedSlot` — par `{ day, slot }` elegido.

**Conmutador mock/real** (`api.ts`): si `NEXT_PUBLIC_N8N_BASE_URL` está vacío, `USE_MOCK = true` y las funciones devuelven datos simulados de `mock.ts`; si tuviera valor, llamarían a los webhooks reales. El despliegue de producción actual corre **sin** esa variable, por lo que usa el mock.

Tokens de prueba del mock (solo en modo mock): un token que contenga `expired`, `exhausted` o `empty` fuerza esos estados; `error` / `bookfail` / `invalid` / `cancelfail` simulan fallos.

---

## Vistas y flujo

### Agenda — 3 pasos (`AgendaPage`)

`AgendaPage` mantiene el `step` (1·2·3), el `data` de disponibilidad, el slot `selected` y el `booking` resultante. Los puntos indicadores de paso del header **se ocultan** en estados terminales (error de carga, enlace caducado/agotado).

**Paso 1 — `SlotPicker` (layout cal.com).** Tres paneles:
- **Info**: consultor (avatar + nombre), duración y zona horaria (Europa/Madrid).
- **Calendario** (`MonthCalendar`): mes navegable; los días con disponibilidad se marcan con **negrita + punto ámbar** (no solo color), el día elegido en ámbar sólido, el resto deshabilitado.
- **Horarios**: lista de `TimeSlotButton` del día seleccionado.

Al elegir un horario → `onSelect(day, slot)` avanza al paso 2.

**Paso 2 — `BookingForm`.** Resumen de la cita + nombre y email. Valida que nombre/email no queden vacíos tras `trim()` (rechaza solo-espacios) con error accesible. Botón "Cambiar horario" vuelve al paso 1 conservando el día elegido.

**Paso 3 — `SuccessScreen`.** Confirmación con fecha/hora, consultor y enlace para cancelar (`cancel_url`, respeta `basePath`).

### Cancelación (`CancelPage`)

Estados: **cargando** → **error** (enlace inválido) · **confirmar** (muestra la cita y ofrece cancelar) · **cancelada** (ya estaba o se acaba de cancelar) · **mantenida** ("Tu cita sigue en pie", cuando el usuario elige no cancelar). La opción de mantener **no** depende del historial del navegador (funciona aunque se abra directo desde el email).

---

## Diseño responsive

Regla del proyecto: **responsividad fluida** con *container queries* y `minmax`, **sin valores planos ni breakpoints de viewport** y **sin** las restricciones de tap-target/escala fija de Apple HIG (que entraban en conflicto con la fluidez).

El selector (`SlotPicker`) usa `@container` y reacciona al **ancho del contenedor**, no del viewport:

| Ancho del contenedor | Layout |
|---|---|
| estrecho (móvil) | apilado: info → calendario → horarios (grilla compacta de 3) |
| `@md` (intermedio / tablet) | 2 columnas: calendario \| horarios, info arriba |
| `@3xl` (desktop) | 3 paneles: info \| calendario \| horarios |

Esto es agnóstico de dispositivo: funciona igual en Android estrecho, tablets no-Apple, ultrawide o ventana redimensionada. Los pasos 2 y 3 y la cancelación son tarjetas centradas (`max-w-md mx-auto`) fluidas. Las listas de horarios fluyen con su contenido (sin `max-h` fijo que provoque scroll interno).

---

## Sistema visual

Tokens de marca en `globals.css` (no se hardcodean hex en componentes):

- **Navy**: `--color-navy #0A1628`, `navy-mid #162236`, `navy-light #1B3553`, `navy-card #1E2E45`.
- **Ámbar**: `--color-amber #E8A24A`, `amber-hover #D08F36`, `amber-dim`/`amber-soft` (tintes translúcidos).
- **Crema/texto**: `--color-cream #FAF7F2`, `muted` (50%), `subtle` (25%).
- Tipografía: **Fraunces** (display, serif) + **Plus Jakarta Sans** (texto), cargadas en `layout.tsx`.

---

## Accesibilidad (auditoría aplicada)

- `prefers-reduced-motion` respetado en las 4 vistas animadas (sin guard, el contenido podía quedar en `opacity:0`).
- Mensajes de error con `role="alert"` (carga, reserva, cancelación) → se anuncian a lectores de pantalla.
- Labels de formulario asociados a sus inputs (`htmlFor`/`id`).
- Un `<h1>` por vista (jerarquía de encabezados coherente).
- `type="button"` en botones que no envían formulario.
- `aria-current`/`aria-pressed` correctos en el calendario (sin ruido en días deshabilitados).
- `focus-visible` visible en todos los controles; `truncate`/`break-words` para nombres largos.

---

## Despliegue

- **GitHub Actions** (`.github/workflows/deploy.yml`): en cada push a `main` → `npm ci` → `npm run build` → publica `./out` en GitHub Pages.
- El build de producción corre **sin** `NEXT_PUBLIC_N8N_BASE_URL`, por lo que sale con la capa mock.
- URL de producción: **https://plaz-ai.github.io/plaz-scheduler/agenda/?id=demo**
- Integración a `main` siempre por **rebase** (sin commits de merge).

---

## Backend pendiente

Para conectar las reservas reales (fuera del alcance de esta fase):
1. Definir los 2 webhooks de n8n (disponibilidad + reserva/cancelación).
2. El admin configura la clave de servicio de Supabase (no se embebe en el código; es secreta).
3. Definir `NEXT_PUBLIC_N8N_BASE_URL` en el build → desactiva el mock automáticamente.
4. Resolver el mapeo personas↔comerciales y el criterio de reparto con el admin.

El contrato (tipos y firmas de `api.ts`) ya está alineado con el del demo original, por lo que el cambio mock→real no debería tocar las vistas.

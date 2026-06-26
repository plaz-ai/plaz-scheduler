# Cal.com — Referencia de interfaz para clonado

> Estudio realizado sobre cuenta real `techdl` · Junio 2026  
> Screenshots guardados en el directorio raíz del proyecto

---

## 1. Arquitectura general de la app

### Rutas principales

| Sección | Ruta | Descripción |
|---|---|---|
| Login | `/auth/login` | Página de entrada |
| Event Types | `/event-types` | Lista y gestión de tipos de evento |
| Bookings | `/bookings/upcoming` | Reservas (5 tabs) |
| Availability | `/availability` | Horarios de disponibilidad |
| Teams | `/teams` | Gestión de equipos |
| Apps | `/apps` (botón en sidebar) | Integraciones |
| Routing | `/routing` | Formularios de enrutamiento |
| Workflows | `/workflows` | Automatizaciones |
| Insights | `/insights` | Analytics |
| Settings | `/settings` → subsecciones | Configuración personal |
| **Página pública** | `cal.com/:username` | Perfil público con lista de eventos |
| **Booking page** | `cal.com/:username/:slug` | Calendario de reserva individual |

---

## 2. Layout del shell principal (app logueada)

```
┌─────────────────────────────────────────────────────────┐
│  TOPBAR                                                   │
│  [Cal.com logo/link]          [⌘ Cmd palette] [Avatar ▼] │
├──────────────┬──────────────────────────────────────────┤
│   SIDEBAR    │                                           │
│   (izq.)     │              MAIN CONTENT                 │
│              │                                           │
│  Nav items   │   Header de sección                       │
│  (iconos +   │   ─────────────────                       │
│   labels)    │   Contenido principal                     │
│              │                                           │
│  ──────────  │                                           │
│  Bottom nav  │                                           │
└──────────────┴──────────────────────────────────────────┘
```

### Sidebar — Navegación principal (top)
1. **Tipos de Evento** → `/event-types`
2. **Reservas** → `/bookings/upcoming`
3. **Disponibilidad** → `/availability`
4. **Equipos** → `/teams`
5. **Aplicaciones** → (botón, abre submenu/dropdown)
6. **Enrutamiento** → `/routing`
7. **Flujos de trabajo** → `/workflows`
8. **Perspectivas** → (botón, navega a `/insights`)

### Sidebar — Navegación inferior (bottom)
- **Ver página pública** → `https://cal.com/:username` (abre en nueva tab)
- **Copiar enlace de página pública** → (botón, copia al portapapeles)
- **Gana 20% de referencia** → `/refer`
- **Ajustes** → `/settings`

### Topbar
- Izquierda: Logo "Cal.com" (link a `/event-types`)
- Derecha: Botón "Abrir paleta de comandos" (icono) + User menu (avatar + chevron)

---

## 3. Página: Event Types (`/event-types`)

**screenshot:** `cal-02-event-types.png`

### Layout
- Header con título "Tipos de Evento" + descripción
- Barra de acciones: searchbox "Buscar" + botón "**Nuevo**" (primary, con icono +)
- Tabs por contexto: **[avatar] Tech DL** | **[avatar] DistritoLegal** (selector personal/equipo)
- Lista de cards draggable (reordenables)

### Event Type Card — estructura
```
[≡ drag handle] | [Nombre del evento]       [toggle ON/OFF] [checkbox] [acciones]
                  /username/slug                                        [Vista Previa]
                  [icono clock] 15m [badge opcional]                   [Copiar Enlace]
                                                                        [Opciones ···]
```

### Campos por card
- Nombre (h2, link al editor)
- URL slug (`/username/slug`) — texto secundario gris
- Duración con icono de reloj (ej: `15m`, `30m`)
- Badge adicional (ej: "Oculto" para eventos hidden)
- Toggle activo/inactivo
- Checkbox de selección
- Grupo de acciones: Vista Previa | Copiar Enlace | Opciones

### Evento tipos detectados en la cuenta
| Nombre | Slug | Duración | Estado |
|---|---|---|---|
| Test Arley | `/techdl/test-arley` | 15m | Activo |
| TestsNico | `/techdl/testsnico` | 15m | Activo |
| Reunión de 30 min | `/techdl/30min` | 30m | Activo |
| Reunión Secreta | `/techdl/secret` | 15m | Oculto / Inactivo |
| Reunión de 15 min | `/techdl/15min` | 15m | Activo |

---

## 4. Página: Bookings (`/bookings/upcoming`)

**screenshot:** `cal-03-bookings.png`

### Tabs de estado
- **Próximamente** (selected por default)
- **Sin confirmar**
- **Recurrente**
- **Pasado**
- **Cancelado**

### Controles de filtro/vista
- Combobox "Añadir filtro" / "Filtrar" (con icono)
- Textbox de búsqueda
- Combobox "Filtros guardados"
- Toggle de vista: **Vista de lista** | **Vista de calendario**

### Secciones del contenido
- Cabecera "Siguiente" (próximas reservas agrupadas)
- Cards de booking con detalles de la reserva

---

## 5. Página: Availability (`/availability`)

**screenshot:** `cal-04-availability.png`

Gestión de horarios de disponibilidad. Permite crear múltiples schedules y asignarlos a event types.

---

## 6. Página: Teams (`/teams`)

**screenshot:** `cal-05-teams.png`

Gestión de equipos. La cuenta tiene el equipo **DistritoLegal** (teamId=97563).

---

## 7. Página: Routing (`/routing`)

**screenshot:** `cal-06-routing.png`  
Título completo: "Formularios de enrutamiento | Cal.com Forms"

Formularios que enrutan a distintos event types según respuestas del usuario.

---

## 8. Página: Workflows (`/workflows`)

**screenshot:** `cal-07-workflows.png`

Automatizaciones: emails de confirmación, recordatorios SMS, etc.

---

## 9. Página: Insights (`/insights`)

**screenshot:** `cal-08-insights.png`

Analytics del calendario con filtros de fecha. URL incluye `activeFilters` como query param JSON codificado.

---

## 10. Editor de Evento (`/event-types/:id?tabName=`)

**screenshots:** `cal-17-event-editor-setup.png`, `cal-18-event-editor-availability.png`, `cal-19-event-editor-limits.png`, `cal-20-event-editor-advanced.png`

### Layout del editor
```
┌──────────────────────────────────────────────────────────┐
│  TOPBAR (mismo que el shell)                              │
├──────────────────────────────────────────────────────────┤
│  Breadcrumb nav    |  [botón secundario]  [Guardar ▶]    │
├──────────────────────────────────────┬───────────────────┤
│                                      │                   │
│   FORMULARIO (panel izquierdo)       │   PREVIEW         │
│   Secciones colapsables              │   (panel derecho) │
│                                      │   Vista previa    │
│                                      │   del booking     │
└──────────────────────────────────────┴───────────────────┘
```

### Tabs del editor (via `?tabName=`)
1. **setup** — Configuración básica
2. **availability** — Disponibilidad específica del evento
3. **limits** — Límites de reserva (buffer, máx por día, etc.)
4. **advanced** — Opciones avanzadas (confirmación manual, redirects, etc.)

### Tab Setup — campos
- **Título** del evento
- **URL slug** (editable)
- **Descripción**
- **Duración** (selector: 15m, 30m, 45m, 60m, custom)
- **Ubicación** (Videollamada, Teléfono, Presencial, etc.)
- Panel derecho: preview en tiempo real del booking page

### Tab Availability
- Selector de schedule a usar
- Opción para personalizar availability solo para este evento

### Tab Limits
- Buffer antes/después de la reunión
- Máximo de reservas por día
- Mínimo de aviso previo
- Rango de fechas disponibles

### Tab Advanced
- Confirmación manual (requiere aprobación)
- Redirect URL post-booking
- Preguntas adicionales al formulario de booking
- Opciones de privacidad

---

## 11. Settings (`/settings`)

**screenshots:** `cal-09-settings-profile.png`, `cal-10-settings-main.png`, `cal-11-settings-general.png`, `cal-12-settings-calendars.png`, `cal-13-billing.png`

### Layout del settings — diferente al shell principal
```
┌────────────────────────────────────────────────────────┐
│  [← Atrás]                           [☰ Menú]          │
├────────────────────────────────────────────────────────┤
│  CONTENIDO (ocupa todo el ancho)                       │
│  Con searchbox en el header                            │
│                                                        │
│  Card grid de navegación por categorías                │
└────────────────────────────────────────────────────────┘
```

### Categorías de Settings
**Configuración personal:**
- Perfil (`/settings/my-account/profile`)
- General (`/settings/my-account/general`)
- Calendarios (`/settings/my-account/calendars`)
- (8 ítems en total en esta sección)

**Seguridad:**
- (4 ítems: contraseña, 2FA, sesiones, etc.)

**Desarrollador:**
- API keys, webhooks, etc. (3 ítems)

**Facturación:**
- `/settings/billing` — Plan actual, historial

### Profile page — campos
- Avatar / foto de perfil
- Nombre
- Bio/descripción
- Username (slug público)
- Zona horaria

---

## 12. Página pública de perfil (`cal.com/:username`)

**screenshot:** `cal-15-public-profile.png`

### Layout (sin sidebar, minimalista)
```
┌─────────────────────────────────────┐
│           [Avatar]                  │
│         [Nombre: Tech DL]           │
├─────────────────────────────────────┤
│  ┌──────────────────────────────┐   │
│  │ [icono] Nombre del evento    │   │
│  │         [clock] 15m          │   │
│  └──────────────────────────────┘   │
│  ┌──────────────────────────────┐   │
│  │ [icono] Reunión de 30 min    │   │
│  │         [clock] 30m          │   │
│  └──────────────────────────────┘   │
│  ...                                │
│           [Powered by Cal.com]      │
└─────────────────────────────────────┘
```

### Event cards en el perfil público
Cada card contiene:
- Icono del evento (cuadrado con color)
- Nombre del evento (h2)
- Duración con icono de reloj
- Link a `/:username/:slug`

---

## 13. Booking page (`cal.com/:username/:slug`)

**screenshot:** `cal-16-booking-page.png`

### Layout de 3 paneles (desktop)
```
┌──────────────┬────────────────┬──────────────────────┐
│   INFO       │   CALENDARIO   │   SLOTS DE TIEMPO    │
│              │                │                      │
│  [Avatar]    │  ← Jun 2026 →  │  10:00 AM           │
│  Nombre host │  L M X J V S D │  10:30 AM           │
│  ─────────── │                │  11:00 AM           │
│  Duración    │  [días del mes]│  ...                │
│  [clock] 15m │                │                      │
│  Videollamada│                │                      │
│              │                │                      │
└──────────────┴────────────────┴──────────────────────┘
                                  [Powered by Cal.com]
```

### Panel izquierdo (info del evento)
- Avatar del host
- Nombre del host
- Nombre del evento (h1 o h2)
- Duración: `[clock icon] 15 min`
- Tipo de reunión: `[video icon] Videollamada`
- Descripción (si tiene)
- Zona horaria del usuario

### Panel central (calendario)
- Navegación mes: `← Mes Año →`
- Grid semana: L M X J V S D
- Días clicables (disponibles) vs grises (no disponibles)
- Día seleccionado resaltado

### Panel derecho (time slots)
- Lista de slots disponibles en el día seleccionado
- Botones de hora: `10:00`, `10:30`, etc.
- Al seleccionar → formulario de datos del invitado

### Formulario de booking (paso final)
- Nombre completo
- Email
- Notas (opcional)
- Botón "Confirmar reserva"

---

## 14. Diseño y sistema de diseño

### Colores principales (observados)
| Token | Uso | Valor aproximado |
|---|---|---|
| Background app | Fondo general | `#FAFAFA` o blanco roto |
| Sidebar bg | Fondo sidebar | Blanco `#FFFFFF` |
| Border | Líneas divisorias | `#E5E7EB` (gris claro) |
| Primary | Botones CTA, links activos | `#111827` (negro) o azul |
| Text primary | Texto principal | `#111827` |
| Text secondary | Subtextos, slugs | `#6B7280` |
| Active nav item | Item seleccionado en sidebar | Fondo gris `#F3F4F6` |
| Toggle on | Switch activado | Verde `#10B981` aprox. |

### Tipografía
- Family: Inter (Google Font estándar en la mayoría de apps NextJS)
- Heading principal (`h1` settings): `text-2xl font-bold` aprox.
- Heading secciones (`h3`): `text-xl font-semibold`
- Labels de nav sidebar: `text-sm font-medium`
- Slugs / texto secundario: `text-sm text-gray-500`

### Componentes clave a implementar
| Componente | Dónde aparece |
|---|---|
| Sidebar con scroll | Shell completo |
| TopBar fija | Shell completo |
| Avatar + user menu | Topbar |
| Command palette | Topbar (⌘K) |
| Event type card draggable | `/event-types` |
| Toggle switch | Cards de eventos |
| Tab navigation | Bookings, event editor |
| Calendar picker | Booking page |
| Time slots list | Booking page |
| Settings card grid | `/settings` |
| Split form+preview | Event editor |
| Notification/toast | Global (region "Notifications") |
| Intercom chat | Global (esquina inferior derecha) |
| Modal / Dialog | Crear nuevo evento, confirmaciones |

### Patrones de interacción
- **Drag & drop** reordenar event types
- **Inline toggle** para activar/desactivar eventos
- **Split view** editor: formulario izquierda + preview derecha
- **Tab navigation** dentro del editor (setup / availability / limits / advanced)
- **Breadcrumb** en el editor de evento
- **Command palette** (`⌘K`) para navegación rápida
- **Empty states** con ilustración + descripción + CTA

---

## 15. Flujos de usuario clave a clonar

### Flujo 1: Crear un evento
1. `/event-types` → botón "Nuevo"
2. Modal de creación: elegir tipo (individual, grupal, round robin)
3. Redirige a `/event-types/:id?tabName=setup`
4. Editar tabs: setup → availability → limits → advanced
5. Guardar

### Flujo 2: Hacer una reserva (usuario externo)
1. `cal.com/:username` → elige evento
2. `cal.com/:username/:slug` → selecciona día en calendario
3. Selecciona hora del slot
4. Llena formulario (nombre, email, notas)
5. Confirma → página de confirmación

### Flujo 3: Ver reservas
1. `/bookings/upcoming` → lista de reservas próximas
2. Click en reserva → detalle con opciones (cancelar, reagendar)

### Flujo 4: Configurar disponibilidad
1. `/availability` → lista de schedules
2. Editar schedule → seleccionar días y horas por día de semana
3. Asignar schedule a event types

---

## 16. URLs de referencia para screenshots

| Archivo | Contenido |
|---|---|
| `cal-01-login.png` | Página de login |
| `cal-02-event-types.png` | Lista de tipos de evento |
| `cal-03-bookings.png` | Reservas (tab Próximamente) |
| `cal-04-availability.png` | Disponibilidad |
| `cal-05-teams.png` | Equipos |
| `cal-06-routing.png` | Formularios de enrutamiento |
| `cal-07-workflows.png` | Flujos de trabajo |
| `cal-08-insights.png` | Perspectivas / Analytics |
| `cal-09-settings-profile.png` | Settings — Perfil |
| `cal-10-settings-main.png` | Settings — Inicio |
| `cal-11-settings-general.png` | Settings — General |
| `cal-12-settings-calendars.png` | Settings — Calendarios |
| `cal-13-billing.png` | Facturación |
| `cal-14-new-event-dialog.png` | Dialog "Nuevo evento" |
| `cal-15-public-profile.png` | Perfil público `cal.com/techdl` |
| `cal-16-booking-page.png` | Booking page `cal.com/techdl/15min` |
| `cal-17-event-editor-setup.png` | Editor evento — tab Setup |
| `cal-18-event-editor-availability.png` | Editor evento — tab Availability |
| `cal-19-event-editor-limits.png` | Editor evento — tab Limits |
| `cal-20-event-editor-advanced.png` | Editor evento — tab Advanced |

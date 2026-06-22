# Graph Report - .  (2026-06-19)

## Corpus Check
- Corpus is ~5,791 words - fits in a single context window. You may not need a graph.

## Summary
- 86 nodes · 165 edges · 12 communities (7 shown, 5 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 13 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_AgendaPage.tsx, Props|AgendaPage.tsx, Props]]
- [[_COMMUNITY_AgendaPage(), api.ts|AgendaPage(), api.ts]]
- [[_COMMUNITY_CancelLoader.tsx, CancelInner()|CancelLoader.tsx, CancelInner()]]
- [[_COMMUNITY_api.ts, cancelBooking()|api.ts, cancelBooking()]]
- [[_COMMUNITY_MonthCalendar.tsx, MonthCalendar()|MonthCalendar.tsx, MonthCalendar()]]
- [[_COMMUNITY_AgendaLoader.tsx, AgendaInner()|AgendaLoader.tsx, AgendaInner()]]
- [[_COMMUNITY_layout.tsx, fraunces|layout.tsx, fraunces]]
- [[_COMMUNITY_BookingResult, SuccessScreen.tsx|BookingResult, SuccessScreen.tsx]]
- [[_COMMUNITY_postcss.config.mjs, config|postcss.config.mjs, config]]
- [[_COMMUNITY_Accesibilidad (auditoría aplicada)|Accesibilidad (auditoría aplicada)]]
- [[_COMMUNITY_Responsividad fluida (container queries)|Responsividad fluida (container queries)]]
- [[_COMMUNITY_Sistema visual (tokens navy+ámbar)|Sistema visual (tokens navy+ámbar)]]

## God Nodes (most connected - your core abstractions)
1. `createBooking()` - 9 edges
2. `AgendaPage()` - 8 edges
3. `fetchAvailability()` - 8 edges
4. `TimeSlot` - 8 edges
5. `AvailabilityResponse` - 8 edges
6. `BookingPayload` - 8 edges
7. `fetchCancelDetails()` - 8 edges
8. `BookingResult` - 7 edges
9. `AvailableDay` - 6 edges
10. `SelectedSlot` - 6 edges

## Surprising Connections (you probably didn't know these)
- `Patrón Loader` --references--> `AgendaPage()`  [INFERRED]
  docs/FRONTEND.md → src/features/agenda/AgendaPage.tsx
- `Capa de datos por feature` --references--> `CancelDetails`  [INFERRED]
  docs/FRONTEND.md → src/features/cancel/types.ts
- `Despliegue GitHub Pages` --references--> `nextConfig`  [INFERRED]
  docs/FRONTEND.md → next.config.ts
- `Export estático (output: export)` --references--> `nextConfig`  [INFERRED]
  docs/FRONTEND.md → next.config.ts
- `Patrón Loader` --references--> `AgendaLoader()`  [EXTRACTED]
  docs/FRONTEND.md → src/features/agenda/AgendaLoader.tsx

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Flujo de reserva en 3 pasos** — agenda_steps_slotpicker_slotpicker, agenda_steps_bookingform_bookingform, agenda_steps_successscreen_successscreen, agenda_agendapage_agendapage [EXTRACTED 1.00]
- **Patrón Loader sobre export estático** — agenda_agendaloader_agendaloader, cancel_cancelloader_cancelloader, next_config_nextconfig [INFERRED 0.85]
- **Capa de datos mock/real en ambas features** — agenda_api_fetchavailability, agenda_api_createbooking, cancel_api_fetchcanceldetails, cancel_api_cancelbooking [INFERRED 0.85]

## Communities (12 total, 5 thin omitted)

### Community 0 - "AgendaPage.tsx, Props"
Cohesion: 0.25
Nodes (12): Props, Step, AvailabilityResponse, AvailableDay, BookingPayload, SelectedSlot, TimeSlot, Props (+4 more)

### Community 1 - "AgendaPage(), api.ts"
Cohesion: 0.20
Nodes (15): AgendaPage(), createBooking(), delay(), fetchAvailability(), buildDay(), mockAvailability(), mockBooking(), MONTHS (+7 more)

### Community 2 - "CancelLoader.tsx, CancelInner()"
Cohesion: 0.19
Nodes (10): CancelInner(), CancelLoader(), CancelPage(), metadata, Page(), Despliegue GitHub Pages, Estados de cancelación, Export estático (output: export) (+2 more)

### Community 3 - "api.ts, cancelBooking()"
Cohesion: 0.44
Nodes (7): cancelBooking(), delay(), fetchCancelDetails(), mockDetails(), Props, CancelDetails, CancelResult

### Community 4 - "MonthCalendar.tsx, MonthCalendar()"
Cohesion: 0.33
Nodes (5): MonthCalendar(), MONTHS, parseISO(), Props, WEEKDAYS_MIN

### Community 5 - "AgendaLoader.tsx, AgendaInner()"
Cohesion: 0.47
Nodes (4): AgendaInner(), AgendaLoader(), metadata, Page()

### Community 6 - "layout.tsx, fraunces"
Cohesion: 0.40
Nodes (3): fraunces, metadata, plusJakarta

## Knowledge Gaps
- **22 isolated node(s):** `config`, `metadata`, `metadata`, `fraunces`, `plusJakarta` (+17 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AgendaPage()` connect `AgendaPage(), api.ts` to `AgendaPage.tsx, Props`, `CancelLoader.tsx, CancelInner()`, `AgendaLoader.tsx, AgendaInner()`?**
  _High betweenness centrality (0.167) - this node is a cross-community bridge._
- **Why does `Patrón Loader` connect `CancelLoader.tsx, CancelInner()` to `AgendaPage(), api.ts`, `AgendaLoader.tsx, AgendaInner()`?**
  _High betweenness centrality (0.126) - this node is a cross-community bridge._
- **Why does `createBooking()` connect `AgendaPage(), api.ts` to `AgendaPage.tsx, Props`, `api.ts, cancelBooking()`, `BookingResult, SuccessScreen.tsx`?**
  _High betweenness centrality (0.081) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `AgendaPage()` (e.g. with `SelectedSlot` and `CancelPage()`) actually correct?**
  _`AgendaPage()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `config`, `metadata`, `metadata` to the rest of the system?**
  _23 weakly-connected nodes found - possible documentation gaps or missing edges._
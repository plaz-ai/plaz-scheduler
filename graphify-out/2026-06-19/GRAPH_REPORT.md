# Graph Report - .  (2026-06-19)

## Corpus Check
- Corpus is ~4,361 words - fits in a single context window. You may not need a graph.

## Summary
- 71 nodes · 125 edges · 8 communities (6 shown, 2 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Flujo de agenda (pasos)|Flujo de agenda (pasos)]]
- [[_COMMUNITY_API y mock de agenda|API y mock de agenda]]
- [[_COMMUNITY_Flujo de cancelacion|Flujo de cancelacion]]
- [[_COMMUNITY_Seleccion de horario|Seleccion de horario]]
- [[_COMMUNITY_Calendario mensual|Calendario mensual]]
- [[_COMMUNITY_Ruta agenda (loader)|Ruta /agenda (loader)]]
- [[_COMMUNITY_Ruta cancelar (loader)|Ruta /cancelar (loader)]]
- [[_COMMUNITY_Layout y fuentes raiz|Layout y fuentes raiz]]

## God Nodes (most connected - your core abstractions)
1. `TimeSlot` - 7 edges
2. `AvailabilityResponse` - 6 edges
3. `BookingPayload` - 6 edges
4. `BookingResult` - 6 edges
5. `AvailableDay` - 5 edges
6. `fetchAvailability()` - 4 edges
7. `createBooking()` - 4 edges
8. `mockAvailability()` - 4 edges
9. `Props` - 4 edges
10. `SelectedSlot` - 4 edges

## Surprising Connections (you probably didn't know these)
- `Props` --references--> `TimeSlot`  [EXTRACTED]
  src/features/agenda/components/TimeSlotButton.tsx → src/features/agenda/types.ts
- `Props` --references--> `BookingResult`  [EXTRACTED]
  src/features/agenda/steps/SuccessScreen.tsx → src/features/agenda/types.ts
- `fetchAvailability()` --calls--> `mockAvailability()`  [EXTRACTED]
  src/features/agenda/api.ts → src/features/agenda/mock.ts
- `createBooking()` --calls--> `mockBooking()`  [EXTRACTED]
  src/features/agenda/api.ts → src/features/agenda/mock.ts
- `Props` --references--> `BookingPayload`  [EXTRACTED]
  src/features/agenda/steps/BookingForm.tsx → src/features/agenda/types.ts

## Import Cycles
- None detected.

## Communities (8 total, 2 thin omitted)

### Community 0 - "Flujo de agenda (pasos)"
Cohesion: 0.26
Nodes (7): Props, Step, BookingPayload, BookingResult, SelectedSlot, Props, Props

### Community 1 - "API y mock de agenda"
Cohesion: 0.26
Nodes (11): createBooking(), delay(), fetchAvailability(), buildDay(), mockAvailability(), mockBooking(), MONTHS, pad() (+3 more)

### Community 2 - "Flujo de cancelacion"
Cohesion: 0.35
Nodes (7): cancelBooking(), delay(), fetchCancelDetails(), mockDetails(), Props, CancelDetails, CancelResult

### Community 3 - "Seleccion de horario"
Cohesion: 0.39
Nodes (6): AvailabilityResponse, AvailableDay, TimeSlot, Props, TimeSlotButton(), Props

### Community 4 - "Calendario mensual"
Cohesion: 0.33
Nodes (5): MonthCalendar(), MONTHS, parseISO(), Props, WEEKDAYS_MIN

### Community 7 - "Layout y fuentes raiz"
Cohesion: 0.40
Nodes (3): fraunces, metadata, plusJakarta

## Knowledge Gaps
- **15 isolated node(s):** `metadata`, `metadata`, `fraunces`, `plusJakarta`, `metadata` (+10 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `TimeSlot` connect `Seleccion de horario` to `Flujo de agenda (pasos)`, `API y mock de agenda`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **Why does `BookingResult` connect `Flujo de agenda (pasos)` to `API y mock de agenda`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **Why does `AvailabilityResponse` connect `Seleccion de horario` to `Flujo de agenda (pasos)`, `API y mock de agenda`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **What connects `metadata`, `metadata`, `fraunces` to the rest of the system?**
  _15 weakly-connected nodes found - possible documentation gaps or missing edges._
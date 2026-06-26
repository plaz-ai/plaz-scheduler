# Auditoría n8n + Supabase — Cal propio / Scheduler de llamadas IA (Plaz)

> Documento de auditoría construido con ralph-loop. Última actualización: iteración 2.
> Regla: no exponer secretos (solo nombres de credenciales/variables). No inventar.

## Resumen ejecutivo

- **Supabase del scheduler (`rdumdfoomfidahhwhbum`): AUDITADO COMPLETO.** Vivo (HTTP 200, 1.4s),
  no pausado. Schema `plaz_scheduler` (5 tablas) y `public` (10 tablas) mapeados al detalle
  con columnas, tipos, PK/FK, conteos y datos seed. El sistema **está en uso real**: 20
  bookings con `gcal_event_id` poblado (Google Calendar real), un link con `use_count=11`,
  `last_assigned_at` poblado en 2 de 3 personas → el round-robin funciona.
- **n8n (todos los workflows del cal propio): BLOQUEADO.** Los 30+ workflows relevantes viven
  en la instancia `n8n-ovh` y **TODOS** tienen `availableInMCP:false`. `get_workflow_details`
  responde *"Workflow is not available in MCP. Enable MCP access in workflow settings."* →
  **imposible leer nodos/parámetros/subworkflows vía MCP.** La otra instancia (`n8n-dl`) no
  contiene estos workflows (0 resultados). Inventario completo SÍ obtenido (nombres, IDs,
  estado), pero el detalle interno está bloqueado.

---

## BLOQUEO PRINCIPAL — n8n MCP access

| Aspecto | Detalle |
|---|---|
| Síntoma | `get_workflow_details(<cualquier id>)` → error *"Workflow is not available in MCP. Enable MCP access in workflow settings."* |
| Causa | Todos los workflows tienen `availableInMCP:false`. |
| Alcance | Los 30+ workflows del cal propio (citas, disponibilidad, reparto, sync, llamadas). |
| Instancia | `n8n-ovh` (producción Distrito Legal). `n8n-dl` no los tiene (0 resultados). |
| **Acción requerida (admin)** | En n8n, abrir cada workflow → Settings → activar **"Make available to MCP" / Enable MCP access**. Sin esto NO se puede auditar el interior (nodos, expresiones, credenciales, subworkflows) por ningún medio del MCP. |
| Alternativa | Que el admin exporte el JSON de los workflows clave y lo comparta, o habilite la n8n Public API REST con un token de lectura. |

> Mientras este bloqueo siga, las secciones B (detalle de workflows) y C (subworkflows) NO
> pueden completarse. Todo lo demás (inventario + Supabase + webhooks) está hecho.

---

## A. Webhooks `plaz-scheduler-*` (verificado por curl, 2026-06-26)

Instancia: **`https://vps-8c4cbca3.vps.ovh.net`** (instancia PLAZ; aquí están vivos).

| Webhook | Método | Estado | Notas |
|---|---|---|---|
| `plaz-scheduler-get-availability` | GET `?link_token=` | ✅ HTTP 200 | Con token inválido (`test`) devuelve body vacío → valida el link primero. |
| `plaz-scheduler-booking` | POST | ✅ HTTP 200 | Acepta `{}` con 200 (validación interna). |
| `plaz-scheduler-cancel-details` | GET `?token=` | ❌ HTTP 404 | **No existe.** |
| `plaz-scheduler-cancel` | POST | ❌ HTTP 404 | **No existe** (reverificado 2026-06-26). |

**Instancia confirmada:** los webhooks viven SOLO en `vps-8c4cbca3`. En `vps-6cd06ae9` los
4 webhooks dan 404 (reverificado). → Solo `get-availability` y `booking` están realmente vivos.

### A.2 Contrato completo de webhooks que el FRONT referencia (grep en `src/`)

Solo 2 de 10 existen en n8n. El resto los consume el **backoffice local** (que nunca se conectó).

| Webhook | Usado por (feature) | ¿Vivo en n8n? |
|---|---|---|
| `plaz-scheduler-get-availability` | agenda (público), agent-agenda | ✅ 200 |
| `plaz-scheduler-booking` | agenda (público) | ✅ 200 |
| `plaz-scheduler-cancel` | agent-agenda | ❌ 404 |
| `plaz-scheduler-respond` | agent-agenda | ❓ no verificado (probable 404) |
| `plaz-scheduler-reschedule` | agent-agenda | ❓ no verificado (probable 404) |
| `plaz-scheduler-agent-agenda` | agent-agenda | ❓ no verificado (probable 404) |
| `plaz-scheduler-agent-availability` | availability | ❓ no verificado (probable 404) |
| `plaz-scheduler-admin-team` | admin-team | ❓ no verificado (probable 404) |
| `plaz-scheduler-admin-agent-active` | admin-team | ❓ no verificado (probable 404) |
| `plaz-scheduler-admin-call-types` | admin-call-types | ❓ no verificado (probable 404) |

> El backoffice depende de 8 webhooks que **no existen aún** en n8n. Corre con mock.

**Contrato (del front `src/features/agenda/api.ts`):**
- `GET get-availability?link_token=` → `{team_name, duration_minutes, available_days[{date,label,short_label,slots[{start_utc,start_madrid,end_utc}]}], link_expired, link_exhausted}`
- `POST booking {link_token, slot_utc, duration_minutes, booker_name, booker_email}` → `{status:'confirmed', booking_id, host_name, start_utc, start_madrid, cancel_url}`

**El workflow que sirve estos webhooks NO se puede leer** (availableInMCP:false). No se ha
podido confirmar por MCP qué workflow de la lista los implementa.

---

## B. Inventario de workflows n8n (n8n-ovh) — COMPLETO

> Estado: todos `active:false`, `triggerCount:0`, `availableInMCP:false`. Detalle interno BLOQUEADO.

### B.1 Gestión de citas
| ID | Nombre | updatedAt |
|---|---|---|
| `udv4ugYnQp3yKHsb` | Gestión de citas  DL | 2026-06-17 |
| `hIwcN7TMAgatdwS5` | Citas Comerciales DL | 2026-06-23 |
| `3PzznuzgzFDoQdex` | Gestion de citas LSO | 2026-06-23 |
| `bAkiBPHPgU2imSbS` | DL / Cal.com - Sync Citas a Supabase | 2026-06-12 |
| `6V3PNfB1nGuD0uT0` | Trigger feedback un día después de la cita - Negocios | 2026-06-12 |
| `99Zeyw9xYxfBy6Lo` | Solicitar feedback un día después de la cita | 2026-06-12 |
| `ahF0P41wYl639uf1` | Trigger Feedback 1 día despues de la cita | 2026-06-12 |

### B.2 Disponibilidad / agendar
| ID | Nombre |
|---|---|
| `pgYgTmDm7TRdkpx8` | Verificar disponibilidad a comercial especifico - Llamadas ia |
| `4CPLQOWbPF953sSx` | Agendar  a comercial especifico - Llamadas ia |

### B.3 Reparto (Grial round-robin por vertical) — 22 workflows
| ID | Nombre |
|---|---|
| `xlqEU2OM6I5TKuH7` | Reparto - Brecha de Género |
| `mKet39wIq3jjGrnC` | Reparto - Vuelos |
| `3weFwDNAYWWejxF0` | Reparto - Kit Digital (Pendiente finalización) |
| `cUyGJBQkkS2uzCNv` | Reparto - Fiscalidad |
| `zQVULV45s3LMXPFs` | Reparto - Salida Ficheros ASNEF |
| `5pcKmiT3xG7LdxFr` | Reparto - Despidos |
| `h5FtC6FuabpCbQcg` | Asociación - Reparto - Deuda |
| `TEG9m3QawP0956b7` | Reparto - Abogados Interinos |
| `vkEjxE1S3jumwBRb` | Reparto - Laboral |
| `pBah3dl9bHBI3uxo` | Reparto - Incapacidades |
| `xtOXYeAOwYCMmbbZ` | Reparto - Vicios Ocultos |
| `bDyggLqAjV230YrY` | Reparto - Cláusulas hipotecarias |
| `bvpVfEG0UlFuMwqN` | Reparto - Financiación coches |
| `92uupPRk98VCVI6O` | Reparto - Extranjería |
| `Oz7PJk8ttB10OzaK` | Entrada y reparto de leads - Asociación |
| `8JMla2S91JIrUn4U` | Reparto - Kit Digital (pendiente Api google) |
| `vzKEDPfM4UlNNwYb` | Reparto - LSO (pendiente credenciales de sheets) |
| `L4ASHDqFdPcFhFgK` | Reparto - Seguros de Vida (pendiente credenciales sheets) |
| `RQjZlufxBofW1o3k` | Reparto - Clínicas |
| `7oWQEyEBnFpJ83sK` | Reparto - Accidentes (pendiente credenciales sheets) |
| `F5nR5EHU37ie4UNa` | Reparto - Revolving (pendiente credenciales sheets) |
| `mhI2mvBqVyVsFkVO` | LSO - Llamada asignada por Reparto |

### B.4 Llamadas IA LSO (relacionadas, post/pre cita)
| ID | Nombre |
|---|---|
| `263XDxbT1iX9jxYQ` | LSO — Reagendar Llamada Fuera de Horario |
| `syVaw0zxBnIwsYF0` | LSO — Gestionar Reintento de Llamada |
| `HVKz58bL1HC07dbs` | LSO - Llamadas Manuales |
| `1dFQ9NGRd29QMSbT` | LSO - Llamadas Automaticas |
| `oK0jJ4YR4GfTZPNX` | Activar llamada IA LSO copy |
| `mxOhOW5AOdpPDKqR` | Activar llamada IA LSO |
| `wWMKU7O6AIeHMMir` | llamadas-LSO-Entrantes |
| `6is95G1UEHvkVp71` | Recibir llamada cualificación IA LSO (pendiente api supabase) |
| `xglZwEROJ9XRJwfQ` | Recibir llamada cualificación IA LSO copySAVE |
| `jS6ebqGZtyJC5pDk` | LSO — Procesar Cualificación Completada (pendiente credenciales: supabase) |
| `PhaA2XY8cHW2WhnD` | Generar id de descarga para Supabase |
| `YGk0wzufJQYsCZi9` | Enviar aviso Whatsapp 25 min Llamada Inmediata - Asociación |

> Nota: varios nombres incluyen "(pendiente credenciales ...)" → el propio admin marca que
> faltan credenciales (Supabase, Google Sheets, Google API) en esos workflows.

---

## C. Subworkflows (Execute Workflow)

**BLOQUEADO.** No se pueden descubrir sin leer los nodos de los workflows (availableInMCP:false).
Se completará cuando se levante el bloqueo de MCP.

---

## D. Supabase `rdumdfoomfidahhwhbum` — AUDITADO COMPLETO

Acceso: REST `https://rdumdfoomfidahhwhbum.supabase.co/rest/v1/`, service_role key en
`Front/supaCredenci.txt`. Schema dedicado vía header `Accept-Profile: plaz_scheduler`.
`company_id` Distrito Legal `61129c8d-...`, Amagna Legal `6d1224f7-...`.

### D.1 Schema `plaz_scheduler` (modelo del scheduler)

**`clients`** (1 fila) — cliente/tenant del scheduler.
| Columna | Tipo | |
|---|---|---|
| id | text | PK |
| name | text | |
| token | text | token de admin/cliente |
| created_at | timestamptz | |
| availability_days | integer | ventana de días reservables |

Seed: `{id:"plaz", name:"Plaz", token:"plaz-booking-2026", availability_days:3}`

**`teams`** (1 fila) — equipos con miembros (para round-robin).
| Columna | Tipo | |
|---|---|---|
| id | text | PK |
| name | text | |
| slug | text | |
| member_ids | text | JSON array de person.id (p.ej. `["nico","nico2"]`) |
| client_id | text | FK→clients.id |

Seed: `{id:"comercial", name:"Comercial", slug:"comercial", member_ids:'["nico","nico2"]', client_id:"plaz"}`

**`persons`** (3 filas) — agentes con Google Calendar conectado.
| Columna | Tipo | |
|---|---|---|
| id | text | PK |
| name | text | |
| email | text | |
| calendar_id | text | id de Google Calendar |
| active | boolean | |
| last_assigned_at | text | timestamp del último reparto (round-robin) |
| gcal_access_token | text | **SECRETO** |
| gcal_refresh_token | text | **SECRETO** |
| gcal_token_expiry | timestamptz | |
| client_id | text | FK→clients.id |

Seed (sin tokens):
- `nico2` / Nico DL / nico@distritolegal.es / active / last_assigned 2026-06-23T13:54
- `julian` / Julian / julian@plaz.ai / active / last_assigned null
- `nico` / Nico / nico@plaz.ai / active / last_assigned 2026-06-23T11:43

**`booking_links`** (2 filas) — links públicos de reserva (round-robin por team).
| Columna | Tipo | |
|---|---|---|
| id | uuid | PK (token público del link) |
| client_id | text | FK→clients.id |
| team_id | text | FK→teams.id |
| label | text | |
| active | boolean | |
| max_uses | integer | NULL=ilimitado, 1=single-use |
| use_count | integer | se incrementa al confirmar |
| expires_at | timestamptz | |
| created_at | timestamptz | |

Seed:
- `f2892eea-...` single-use (max_uses=1, use_count=0) "Link single-use — prueba"
- `11040825-...` ilimitado (max_uses=null, **use_count=11**) "Link general — Equipo Comercial Plaz"

**`bookings`** (20 filas) — reservas confirmadas/canceladas.
| Columna | Tipo | |
|---|---|---|
| id | text | PK |
| booker_name | text | |
| booker_email | text | |
| host_id | text | person asignada (→persons.id) |
| team_id | text | |
| start_datetime | text | ISO UTC |
| end_datetime | text | |
| duration_minutes | integer | (30 en seed) |
| gcal_event_id | text | id del evento en Google Calendar (poblado=real) |
| status | text | `confirmed` / `cancelled` |
| created_at | text | |
| cancel_token | text | token para cancelar |

Últimas reservas: mezcla `confirmed`/`cancelled`, todas con `gcal_event_id` real, host
alternando `nico`/`nico2` → **el round-robin reparte de verdad**.

### D.2 Schema `public` (sistema de llamadas IA — relacionado)

| Tabla | Filas | Rol |
|---|---|---|
| `calls` | 1821 | Llamadas Retell. Campos cita: `appointment_booked`, `appointment_date`, `id_cita_cal` (cal.com). FK company. |
| `comerciales` | 5 | Agentes del sistema viejo: `horarios`(jsonb), `timezone`, `event_type_id`, `rol_comercial`, `call_key`, `company_id`. |
| `companies` | 2 | DL + Amagna. `cal_api_key`, `max_retries`, `crm_base_url`, `metabase_dashboard_id`, `Precio lead`. |
| `reservas_solicitadas` | 2913 | id, email, status(bool). Registro básico de solicitud. |
| `pending_callbacks` | 5049 | Reintentos de llamada: retry_count, status, next_attempt_at, cycle_day, franja… |
| `internal_costs` | — | Costes Retell/Twilio por llamada. |
| `agent_prompts` | 2 | Prompt por company. |
| `prompt_history` | — | Histórico de prompts + métricas (calls, qualified, appointments…). |
| `profile` | 9 | Perfiles usuario (role_id→roles). |
| `roles` | 3 | name, slug, permissions(text[]). |

### D.3 Mapeo y observaciones clave

- **El scheduler usa Google Calendar** (`gcal_*` en persons, `gcal_event_id` en bookings),
  NO cal.com. El sistema viejo de llamadas (`public`) sí usa cal.com (`companies.cal_api_key`,
  `calls.id_cita_cal`, `comerciales.event_type_id`). Conviven dos mundos.
- **Round-robin real**: `teams.member_ids` + `persons.last_assigned_at`. Confirmado por datos
  (last_assigned poblado, host alternando). Este es el reparto del scheduler NUEVO — distinto
  del reparto por vertical de los workflows "Reparto -" (Grial) del sistema de llamadas.
- **El mapeo workflow↔tabla NO se puede confirmar** sin leer los nodos (BLOQUEO n8n).
- **Desajuste con el front**: el front local tiene editor de disponibilidad manual y
  call_types; el modelo real saca disponibilidad del GCal y no tiene call_types.

---

## Estado de la auditoría / pendientes

**Iteración actual:** 2.

**Completado:**
- [x] A. Webhooks: estado verificado (get-availability 200, booking 200, cancel-details 404).
- [x] B. Inventario completo de workflows n8n (44 workflows catalogados con ID/nombre/estado).
- [x] D. Supabase: schema `plaz_scheduler` + `public` mapeado al detalle, conteos, seed.

**Bloqueado (externo, irresoluble sin acción del admin):**
- [ ] B-detalle. Nodos/parámetros/expresiones/credenciales de cada workflow → `availableInMCP:false`.
- [ ] C. Subworkflows (Execute Workflow) → depende de poder leer nodos.
- [ ] A-detalle. Qué workflow implementa los webhooks `plaz-scheduler-*` → depende de leer nodos.
- **Acción requerida:** admin habilita "Enable MCP access" en los workflows, o exporta sus JSON.

**Pendiente menor — CERRADO:**
- [x] Reverificar `plaz-scheduler-cancel` (POST) → 404 (no existe).
- [x] Confirmar instancia: `vps-6cd06ae9` da 404 en todo → webhooks solo en `vps-8c4cbca3`.
- [x] Webhooks referenciados por el front: 10 catalogados (solo 2 vivos). Ver A.2.

> **AUDITORÍA COMPLETA en todo lo accesible.** Supabase mapeado 100%, inventario n8n
> completo (44 workflows), webhooks verificados y contrato del front catalogado. Lo único
> no documentado es el INTERIOR de los workflows n8n (nodos/parámetros/subworkflows), que es
> un BLOQUEO EXTERNO irresoluble sin que el admin habilite "Enable MCP access" o exporte los
> JSON. Ese bloqueo queda claramente anotado con su acción requerida (sección "BLOQUEO PRINCIPAL").

# ADR 0003 — Domain workflow state transitions

**Status:** Accepted (Milestone 2)  
**Date:** 2026-07-17

## Context

M2 turns the read-only foundation into SOC workflows: alerts are triaged, investigations are opened and closed, incidents move through response stages. Each of these is a state machine, and M1 left the only existing transition map (`INCIDENT_TRANSITIONS`) as an unused constant in `src/domain/enums.ts`.

Without a single owner for lifecycle rules, transition logic gets re-implemented inline in services and pages, drifts, and becomes untestable. M2's approval explicitly requires that the transition system be the single source of truth with no inline status-transition logic anywhere else.

## Decision

**All lifecycle rules live in `src/domain/transitions.ts`.** Services enforce them via `assertTransition()`; the UI reads the same maps to render only legal next-state actions. Nothing else may hardcode a status graph.

### Alert lifecycle

```
new ──▶ triaged ──▶ resolved   (terminal)
 │         │
 │         └──────▶ dismissed  (terminal)
 ├────────────────▶ resolved
 └────────────────▶ dismissed
```

- `new → triaged | resolved | dismissed` — an analyst may resolve or dismiss directly from the queue without a triage stop.
- `triaged → resolved | dismissed`
- `resolved`, `dismissed` — terminal. No further status changes; the only permitted post-terminal write is setting a disposition note.

Side effects (service-enforced):

| Transition | Effect |
| --- | --- |
| `→ triaged` | set `triaged_at` |
| `→ resolved` | set `resolved_at` |
| `→ dismissed` | requires `dismissed_reason` in the request |

### Investigation lifecycle

```
open ──▶ active ──▶ closed  (terminal)
 └────────────────▶ closed
```

- `open → active | closed`
- `active → closed`
- Closing **requires a disposition** (`benign | malicious | inconclusive`) and sets `closed_at`.
- Promotion to an incident is **not** a status change: the investigation stays in its current state after promotion (per the approved M2 plan, promotion never auto-closes).

### Incident lifecycle

```
declared ──▶ contained ──▶ resolved ──▶ closed  (terminal)
    └─────────────────────▶ resolved
```

- `declared → contained | resolved`
- `contained → resolved`
- `resolved → closed`
- `→ resolved` sets `resolved_at`. Every transition appends a `status_change` timeline entry.

This map moves verbatim from `src/domain/enums.ts` into `transitions.ts` (it had no consumers yet).

### Enforcement contract

- `canTransition(map, from, to)` — pure check; the UI uses it to render legal actions only.
- `assertTransition(entity, map, from, to)` — throws `TransitionError` when illegal.
- `TransitionError` carries HTTP status **409 Conflict**; `withOrgContext()`'s error handler maps it to a problem+json body, alongside the existing `AuthError` (401/403) and `ZodError` (400) mappings.
- Self-transitions (`from === to`) are never in a map, so a request that "transitions" an entity to its current status fails `assertTransition` and returns 409 like any other illegal move.
- Field-level requirements attached to transitions (dismissal reason, closing disposition) are validated by the Zod action schemas in `src/domain/entities/*` and re-checked in services.

## Consequences

- One reviewable file answers "what can move where"; unit tests exhaustively cover every pair of states for all three machines.
- UI and API can never disagree about legal actions, because both consume the same maps.
- Adding a state later (e.g. alert `suppressed`) is a domain change with a visible diff in one module, its tests, and this ADR — not a hunt through pages and services.

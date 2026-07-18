# M3 Checkpoint 1 — Recovery Plan — 2026-07-17

## What was implemented

Planning correction only. No application code, route changes, commits, or
Checkpoint 2 work.

Checkpoint 1 (commits `682b0f8`, `ee564a3`) is **rejected**. The
implementation correctly removed fake operational records but incorrectly
collapsed the product into a 10-item CRUD-shaped shell with a generic
unavailable page for former SOC capabilities. The dark-only theme strategy is
also rejected; light and dark are now M3 acceptance requirements.

A revised CP1 recovery Canvas was produced after four read-only audits
(routes/capabilities, PostgreSQL analytics feasibility, dual-theme/contrast,
and M3 plan/history). Implementation waits for explicit approval of that plan.

## Files added

| File | Purpose |
|---|---|
| `~/.cursor/projects/.../canvases/m3-cp1-recovery-plan.canvas.tsx` | Canonical recovery plan (16 required sections) |
| `~/.cursor/projects/.../canvases/m3-cp1-theme-audit.canvas.tsx` | Supporting dual-theme audit (from theme audit) |
| `docs/status/2026-07-17-m3-cp1-recovery-plan.md` | This status document |

## Files modified

| File | Change |
|---|---|
| `~/.cursor/projects/.../canvases/project-state.canvas.tsx` | Mark CP1 rejected; point to recovery plan |
| `~/.cursor/projects/.../canvases/m3-checkpoint-1-review.canvas.tsx` | Mark rejected / superseded by recovery plan |

No application source under `app/`, `src/`, `components/`, or `tests/` was
changed in this planning step.

## Architectural decisions

- Distinguish capability concepts from legacy mock implementations.
- Classify every surface as Live / Preview / Planned / Retired.
- Only Retired routes may stay deleted; no further deletions until approved.
- Replace generic unavailable pages with capability-specific Planned pages.
- Recover SOC IA depth with grouped navigation and maturity labels.
- Dual-theme semantic tokens are a CP1 acceptance requirement.
- Prefer real PostgreSQL aggregates for analytics before classifying a surface as M4-only.
- Narrow aggregate APIs are allowed later in M3; they must remain service-owned and org-scoped.
- Preserve Auth.js, OrgContext, orgScoped, service layer, M2.6 protections, and no AI/connectors in M3.

## Deviations from plan

This document itself is a deviation from the previously approved CP1
direction (dark-only + 10-item nav shrink). That direction is superseded by
the recovery Canvas pending approval.

## Open risks

| Risk | Notes |
|---|---|
| Restoring old pages verbatim | Would reintroduce mocks — forbidden |
| Overloading nav | Grouped IA + maturity labels required |
| Seed lifecycle gaps | MTTA/MTTI remain Preview with eligibility counts |
| Theme migration breadth | Shell, menus, portals, and tokens must move together |

## Tests executed

None required for planning-only deliverable. Prior CP1 verification remains
historical evidence only and does not constitute visual approval.

## Acceptance criteria status

| Criterion | Status |
|---|---|
| Recovery Canvas with 16 required sections | ✅ |
| No application code written | ✅ |
| CP2 not started | ✅ |
| No further route deletion | ✅ |
| Explicit user approval of recovery plan | ❌ pending |

## Next recommended step

User reviews and explicitly approves the recovery Canvas, then recovered
Checkpoint 1 implementation begins (dual-theme foundations + maturity-aware
IA) and stops again for dual-theme visual approval.

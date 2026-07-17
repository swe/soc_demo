# M2 implementation checklist — SOC Operations Layer

Source of truth for M2 execution. Approved 2026-07-17. Baseline: `v0.1.0-m1-foundation`.

**Hard boundaries (approved):** no AI features, no connectors, no RLS, no queues, no major UI redesign, no `unified-ui.tsx` refactor, no new top-level routes outside `/overview`, no email infrastructure. Auth.js stays behind `server/auth`; all business logic in services; all tenant access through `OrgContext` + `orgScoped()`; every mutation = Zod validation + `can()` + `writeAudit()`. All status graphs live in `src/domain/transitions.ts` only.

## Step 1 — Transition system foundation

- [x] ADR-0003 (`docs/adr/0003-domain-workflow-state-transitions.md`)
- [x] This checklist
- [x] Migration review (`docs/m2/migration-review.md`)
- [x] `src/domain/transitions.ts` — alert/investigation/incident maps, `canTransition`, `assertTransition`, `TransitionError` (409); `INCIDENT_TRANSITIONS` moved out of `enums.ts`
- [x] `tests/unit/transitions.test.ts` — exhaustive pair coverage for all three machines

## Step 2 — Database migration

- [x] `alert`: + `assigned_membership_id` (FK membership, set null), `analyst_note`, `triaged_at`, `resolved_at`, `dismissed_reason` (all nullable)
- [x] `investigation`: + `created_from_alert_id` (FK alert, set null), `notes jsonb not null default '[]'`
- [x] New table `organization_invite` (see migration review)
- [x] `drizzle/0003_*.sql` generated and reviewed; `db:migrate` clean on dev + test databases
- [x] Seed determinism tests still green (columns nullable; seed untouched)

## Step 3 — Alert workflow

- [ ] Action schemas in `src/domain/entities/alert.ts` (assign / severity / status / note / dismiss / resolve)
- [ ] `patchAlert()` in `src/server/services/alerts.ts` — transitions via `assertTransition`, side-effect timestamps, audit per action
- [ ] `PATCH /api/v1/alerts/:id` (`alert:triage`)
- [ ] `TransitionError → 409` mapping in `src/server/api/respond.ts`; `parseJsonBody()` helper
- [ ] Alerts page detail modal: transition controls, assignee select, severity select, analyst note, dismiss-with-reason, audit preview; permission-gated buttons
- [ ] Integration tests: happy paths, illegal transition 409, cross-tenant 404, viewer 403, audit rows written

## Step 4 — Investigation workflow

- [ ] `src/domain/entities/investigation.ts` DTOs + action schemas
- [ ] `src/server/services/investigations.ts` — create (with related alert ids), list, detail (+linked alerts), patch (assign/status/hypothesis), close-with-disposition, notes append
- [ ] `POST/GET /api/v1/investigations`, `GET/PATCH /api/v1/investigations/:id` (`investigation:write` for writes)
- [ ] `POST /api/v1/alerts/:id/create-investigation` — links alert, copies entity refs, sets `created_from_alert_id`, marks alert triaged, audits
- [ ] Integration tests incl. tenancy + permissions

## Step 5 — Incident promotion

- [ ] `promoteFromInvestigation()` in `src/server/services/incidents.ts` — transaction: lock org row → increment `incident_counter` → insert incident (severity = max of linked alerts, entity refs copied, `investigation_id` set, `declared` timeline entry) → audit
- [ ] `POST /api/v1/investigations/:id/promote` (`incident:write`)
- [ ] Investigation not auto-closed
- [ ] Incident PATCH: lifecycle transitions + timeline notes (`incident:write`)
- [ ] Tests: promotion, duplicate-number race (concurrent promote), illegal lifecycle 409

## Step 6 — Assets + identities (read-only)

- [ ] `src/domain/entities/asset.ts`, `identity.ts`; services; `GET /api/v1/assets(/;id)`, `GET /api/v1/identities(/:id)` (`data:read`)
- [ ] Detail includes related alerts (entity_refs) + vulnerabilities / owned assets
- [ ] New pages `/overview/assets`, `/overview/identities` — existing components only; legacy static pages untouched
- [ ] Integration tests incl. isolation

## Step 7 — Vulnerability module (read-only)

- [ ] `src/domain/entities/vulnerability.ts`; service; `GET /api/v1/vulnerabilities(/:id)` (`data:read`)
- [ ] Page `/overview/vulnerabilities` — CVE, asset, CVSS, EPSS, exploited, status
- [ ] Integration tests

## Step 8 — Member management

- [ ] `src/domain/entities/member.ts`; `src/server/services/members.ts`
- [ ] `GET /api/v1/members`, `POST /api/v1/members/invite`, `PATCH /api/v1/members/:id` (all `admin:members`)
- [ ] Secure accept-link only (token hash stored; no email); `app/(auth)/accept-invite/page.tsx`
- [ ] Guard: cannot suspend/demote the last active admin
- [ ] Tests: invite → accept → member visible; role change; suspend; non-admin 403; tenancy

## Step 9 — Audit UI

- [ ] `listAudit(ctx, query)` in `src/server/services/audit.ts`; `GET /api/v1/audit` (`admin:audit`) — filters actor/action/target, keyset pagination
- [ ] Page `/overview/settings/audit` (admin-only; no new top-level route)
- [ ] Integration tests

## Step 10 — E2E + close-out

- [ ] `tests/e2e/m2-workflow.spec.ts`: login as analyst → open alert → triage → create investigation → promote → verify incident → verify audit trail
- [ ] Full regression: `ci:local` + e2e green
- [ ] Remove M1 "arrives in the next milestone" placeholders on alerts/incidents pages
- [ ] Tag `v0.2.0-m2-workflows`

## Completion criteria (from approved plan)

- SOC analyst can process an alert end-to-end; investigation workflow works; incidents created from investigations; assets/identities/vulnerabilities visible; members manageable; audit log usable from UI; all tests pass.

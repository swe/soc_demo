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
- [x] `drizzle/0003_big_queen_noir.sql` generated and reviewed against the migration review (partial unique index emitted correctly with `lower(email)`); `db:migrate` clean on dev + test databases
- [x] Seed determinism tests still green (columns nullable; seed untouched)

## Step 3 — Alert workflow

- [x] Action schemas in `src/domain/entities/alert.ts` (assign / severity / status / note / dismiss / resolve)
- [x] `patchAlert()` in `src/server/services/alerts.ts` — transitions via `assertTransition`, side-effect timestamps, audit per action, terminal immutability (disposition only)
- [x] `PATCH /api/v1/alerts/:id` (`alert:triage`)
- [x] `TransitionError → 409` + `ServiceError` mapping in `src/server/api/respond.ts`; `parseJsonBody()` helper
- [x] Alerts page detail modal: transition controls, assignee select, severity select, analyst note, dismiss-with-reason, audit preview; permission-gated buttons
- [x] Integration tests: happy paths, illegal transition 409, cross-tenant null/404, viewer 403, audit rows written; e2e regression green
- [x] Deviations recorded: member directory `GET /api/v1/members` shipped early with `data:read` (assignment UI needs it; Step 8 mutations stay `admin:members`); alert detail embeds its own audit history so analysts see triage history without `admin:audit`; `GET /organizations/current` now also returns `membershipId`

## Step 4 — Investigation workflow

- [x] `src/domain/entities/investigation.ts` DTOs + action schemas (close requires disposition)
- [x] `src/server/services/investigations.ts` — create (with related alert ids; linking triages still-new alerts), list, detail (+linked alerts + notes), patch (assign/status/hypothesis/note), close-with-disposition sets `closed_at`, closed = immutable
- [x] `POST/GET /api/v1/investigations`, `GET/PATCH /api/v1/investigations/:id` (`investigation:write` for writes)
- [x] `POST /api/v1/alerts/:id/create-investigation` — links alert, sets `created_from_alert_id`, triages if new, audits both sides
- [x] Alerts modal: "Start investigation from this alert" (permission-gated)
- [x] Integration tests incl. tenancy + permissions + double-link 409

## Step 5 — Incident promotion

- [x] `promoteFromInvestigation()` — transaction: `FOR UPDATE` lock on org row → increment `incident_counter` → insert incident (severity = max of linked alerts, `investigation_id` set, `declared` timeline entry) → audit both sides. Entity refs are inherited through linked alerts per the Phase 1 domain design (no incident column)
- [x] `POST /api/v1/investigations/:id/promote` (`incident:write`); double-promote → 409 with existing INC number
- [x] Investigation not auto-closed
- [x] Incident PATCH: lifecycle transitions, owner assignment, impact summary, timeline notes (`incident:write`); closed = immutable
- [x] UI: promote button in alerts modal investigation banner; response panel (transitions/owner/notes) in incidents modal
- [x] Tests: promotion, concurrent-promotion unique numbers, double-promote 409, illegal lifecycle 409, viewer 403, tenancy

## Step 6 — Assets + identities (read-only)

- [x] `src/domain/entities/asset.ts`, `identity.ts`; services; `GET /api/v1/assets(/:id)`, `GET /api/v1/identities(/:id)` (`data:read`)
- [x] Detail includes related alerts (jsonb `@>` on entity_refs) + vulnerabilities / owned assets
- [x] New pages `/overview/assets`, `/overview/identities` — existing components only; legacy static pages untouched; sidebar links added
- [x] `StatusBadge` extended to entity/vulnerability/membership statuses (additive, no refactor)
- [x] Integration tests incl. isolation

## Step 7 — Vulnerability module (read-only)

- [x] `src/domain/entities/vulnerability.ts`; service; `GET /api/v1/vulnerabilities(/:id)` (`data:read`)
- [x] Page `/overview/vulnerabilities` — CVE, asset, CVSS, EPSS, exploited, fix-available, status; sidebar link
- [x] Integration tests incl. isolation

## Step 8 — Member management

- [x] `src/domain/entities/member.ts` invite + patch schemas; `src/server/services/members.ts`
- [x] `POST /api/v1/members/invite`, `GET /api/v1/members/invites`, `DELETE /api/v1/members/invites/:id`, `PATCH /api/v1/members/:id` (all `admin:members`); `POST /api/v1/members/accept-invite` (session-only, email-bound)
- [x] Secure accept-link only: SHA-256 token hash stored, 7-day expiry, single-use, revocable; `app/(auth)/accept-invite/page.tsx` redirects unauthenticated users through sign-in
- [x] Guard: cannot suspend/demote the last active admin (409)
- [x] New admin page `/overview/administration/members` (invite form + copy-link, role select, suspend/reactivate, invite list); legacy user-management page untouched for M3
- [x] Tests: invite → accept → member visible; single-use/email-bound/revoked/expired handling; duplicate 409; role change; suspend; last-admin guard; non-admin 403; tenancy

## Step 9 — Audit UI

- [x] `listAudit(ctx, query)` in `src/server/services/audit.ts` with actor name resolution; `GET /api/v1/audit` (`admin:audit`) — filters actor/action/target, keyset pagination
- [x] Page `/overview/settings/audit` (admin-only with in-page notice for non-admins; no new top-level route)
- [x] Integration tests: ordering, filters, pagination, analyst 403, tenant isolation

## Step 10 — E2E + close-out

- [ ] `tests/e2e/m2-workflow.spec.ts`: login as analyst → open alert → triage → create investigation → promote → verify incident → verify audit trail
- [ ] Full regression: `ci:local` + e2e green
- [ ] Remove M1 "arrives in the next milestone" placeholders on alerts/incidents pages
- [ ] Tag `v0.2.0-m2-workflows`

## Completion criteria (from approved plan)

- SOC analyst can process an alert end-to-end; investigation workflow works; incidents created from investigations; assets/identities/vulnerabilities visible; members manageable; audit log usable from UI; all tests pass.

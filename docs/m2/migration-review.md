# M2 migration review — `0003` workflow columns + invites

Reviewed before generation. One migration for all M2 schema changes; no destructive statements; no changes to seed data files.

## Changes

### `alert` — five new nullable columns

| Column | Type | Notes |
| --- | --- | --- |
| `assigned_membership_id` | text, FK → `membership.id`, `on delete set null` | Assignee survives member removal as unassigned |
| `analyst_note` | text | Free-form triage note |
| `triaged_at` | timestamptz | Set by service on `→ triaged` |
| `resolved_at` | timestamptz | Set by service on `→ resolved` |
| `dismissed_reason` | text | Required by action schema on `→ dismissed` |

New index: `alert_assigned_membership_idx (assigned_membership_id)` — "my queue" filter.

### `investigation` — two new columns

| Column | Type | Notes |
| --- | --- | --- |
| `created_from_alert_id` | text, FK → `alert.id`, `on delete set null` | Provenance of alert-initiated investigations. Circular FK with `alert.investigation_id` is intentional; both are `set null`, so deletes cannot cascade in a loop. In Drizzle this needs an `AnyPgColumn`-typed reference callback |
| `notes` | jsonb, not null, default `'[]'` | Append-only entries `{ at, membershipId, text }`, written by service only |

### New table `organization_invite`

| Column | Type |
| --- | --- |
| `id` | text PK (uuidv7) |
| `organization_id` | text, FK → `organization.id`, cascade |
| `email` | text, not null |
| `role` | `role` enum, not null, default `viewer` |
| `token_hash` | text, not null, unique — SHA-256 of the accept token; raw token appears only in the returned accept URL |
| `invited_by_membership_id` | text, FK → `membership.id`, set null |
| `expires_at` | timestamptz, not null |
| `accepted_at` / `revoked_at` | timestamptz, nullable |
| `created_at` | timestamptz, not null, default now |

Indexes: partial unique `(organization_id, email) WHERE accepted_at IS NULL AND revoked_at IS NULL` (one live invite per address per org — drizzle-kit does not emit partial indexes from `uniqueIndex().where()` on this version, so verify the generated SQL and hand-add if missing); `(organization_id, created_at)` for listing.

## Risk assessment

| Concern | Assessment |
| --- | --- |
| Seed determinism | Safe. All new columns nullable or defaulted; seed inserts unchanged; snapshot tests must stay green post-migrate (verified in Step 2) |
| Existing rows | Safe. No backfill needed; `NULL` means "never triaged/assigned" which is true for M1 data |
| Circular FK alert ↔ investigation | Safe. Both directions `set null`; migration adds the second edge via `ALTER TABLE`, so creation order is irrelevant |
| Enum changes | None. All statuses reuse M1 enums; `role` enum reused for invites |
| Rollback | Additive-only: dropping the new columns/table restores the M1 shape. No data rewrite to reverse |
| RLS compatibility | Preserved. New table carries `organization_id`; access goes through `orgScoped()` like everything else |

## Procedure

1. Update `src/server/db/schema/soc.ts` (+ new `invites.ts`, exported from `schema/index.ts`).
2. `pnpm db:generate` → review generated SQL against this document (naming, FK actions, partial index).
3. `pnpm db:migrate` on dev; integration suite migrates the test database via existing setup.
4. Run seed determinism + full integration suite before committing.

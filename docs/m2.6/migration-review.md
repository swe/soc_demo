# M2.6 migration review — hardening indexes and rate-limit storage

Scope: the additive migrations introduced by the M2.6 hardening sprint.
All are non-destructive; each reverses with a `DROP INDEX` / `DROP TABLE`.

> Note: the planning Canvas listed separate migrations `0004` (unique index)
> and `0006` (list/GIN indexes). They were landed together as a single
> additive migration `0004` to keep the journal compact; rate limiting is
> `0005`. There is no `0006` in this sprint.

## 0004 — promotion uniqueness + list/lookup indexes

`drizzle/0004_superb_madrox.sql`

| Change | Purpose |
| --- | --- |
| `incident_org_investigation_uq` — UNIQUE `(organization_id, investigation_id)` WHERE `investigation_id IS NOT NULL` (partial) | Database enforcement of the promote-once invariant: at most one incident per investigation. Closes the concurrent double-promotion race; the service translates the unique violation (23505) into the existing 409. |
| `alert_org_detected_id_idx` — `(organization_id, detected_at DESC, id DESC)` | Serves the default (unfiltered) alert list keyset: `ORDER BY detected_at DESC, id DESC`. The pre-existing `alert_org_status_time_idx` leads with `status` and cannot serve the unfiltered sort. |
| `alert_entity_refs_gin_idx` — GIN `(entity_refs jsonb_path_ops)` | Serves the `entity_refs @> …` containment lookup used by asset/identity detail pages. `jsonb_path_ops` is smaller and faster than the default operator class and supports `@>`, the only operator we use. |
| `investigation_org_created_id_idx` — `(organization_id, created_at DESC, id DESC)` | Default investigation list keyset. |
| `vulnerability_org_detected_id_idx` — `(organization_id, detected_at DESC, id DESC)` | Default vulnerability list keyset. |

### Precondition (verified before apply)

The partial unique index requires that no organization already has two
incidents for the same investigation:

```sql
SELECT organization_id, investigation_id, count(*)
FROM incident
WHERE investigation_id IS NOT NULL
GROUP BY 1, 2
HAVING count(*) > 1;
```

Verified 2026-07-17: zero rows on both the dev database (`soc` @ 5432) and
the test database (`soc_test` @ 5433).

### Operational notes

- Plain `CREATE INDEX` (not `CONCURRENTLY`): current deployments are small;
  for a large production table these should be re-created with
  `CREATE INDEX CONCURRENTLY` outside the migration transaction.
- `event.entity_refs` deliberately has no GIN index — no query path uses it
  yet. Revisit when event search lands (M4).

## 0005 — login_attempt table (rate limiting)

`drizzle/0005_bright_susan_delgado.sql`

| Change | Purpose |
| --- | --- |
| `CREATE TABLE login_attempt` — `(id, scope, key, window_start, count, strikes, locked_until, updated_at)` | Fixed-window failure counters with exponential lockout for `/api/login` and `/api/register`. One row per `(scope, key)` where scope ∈ `login_email` / `login_ip` / `register_ip`; the window resets in place when `window_start` ages out. `strikes` counts consecutive lockouts and drives the 5→10→20→40→60-minute backoff. DB-backed so limits survive restarts and apply across all server processes; no Redis dependency (consistent with the single-Node + PostgreSQL architecture). |
| `login_attempt_scope_key_uq` — UNIQUE `(scope, key)` | Enables the atomic `INSERT … ON CONFLICT … DO UPDATE` upsert that makes counting race-free. |

### Operational notes

- Rows idle for more than 24 h are opportunistically deleted on write; the
  table stays small (bounded by distinct attackers per day).
- No FK to `user` — attempts are recorded for unknown emails too, and the
  table is platform-level (no `organization_id`).
- Contains no secrets: emails are stored lowercased for keying; consider
  hashing keys if retention requirements change.
- Thresholds are centralized in `src/server/auth/rate-limit.ts`
  (`RATE_LIMITS`, `LOCKOUT_BASE_MS`, `LOCKOUT_CAP_MS`).
- Rollback: `DROP TABLE login_attempt;` (feature-gated by the route guards,
  which would also be reverted).

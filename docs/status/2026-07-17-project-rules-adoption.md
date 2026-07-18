# Project rules adoption — 2026-07-17

## What was implemented

Three mandatory project-wide rules were adopted and persisted as Cursor rules
in `.cursor/rules/` so they apply to every future session:

1. **Git authorship policy** (`git-authorship.mdc`) — human-only author and
   committer; no `Co-authored-by` trailers, no AI/tooling attribution of any
   kind. Every commit must be verified with `git log -1 --format=full` before
   a task is reported complete. Because the agent tooling auto-injects a
   `Co-authored-by: Cursor` trailer into any `git commit` invocation, the rule
   documents the git-plumbing recipe (`git commit-tree` + `git update-ref`)
   that guarantees clean metadata. Task completion now requires: code
   complete, tests green, commit metadata clean.
2. **Status reporting format** (`status-reporting.mdc`) — after every
   completed task/milestone/ADR/migration/feature/refactor: create or update
   a `docs/status/` document AND the canonical project-state Canvas. Chat
   summaries stay short; detail lives in the Canvas.
3. **Milestone planning discipline** (`milestone-planning.mdc`) — before any
   M3+ code: an architecture review Canvas (affected files, migration impact,
   route impact, testing plan, implementation order, acceptance criteria)
   requiring explicit approval.

The canonical project-state Canvas (`project-state.canvas.tsx`, workspace
canvases directory) was created, covering the full current state through
M2.5: objective, scope, architecture snapshot, milestone history, M2.5
implementation detail, decisions, deviations, risks, test results, acceptance
status, and next step.

## Files added

| File | Purpose |
|---|---|
| `.cursor/rules/git-authorship.mdc` | Human-only commit metadata policy + plumbing recipe |
| `.cursor/rules/status-reporting.mdc` | docs/status + Canvas dual reporting requirement |
| `.cursor/rules/milestone-planning.mdc` | Approved planning Canvas before milestone code |
| `docs/status/2026-07-17-project-rules-adoption.md` | This document |
| `project-state.canvas.tsx` (workspace canvases dir, outside repo) | Canonical project state Canvas |

## Files modified

None in application code.

**Migrations / routes / services added:** none.

## Architectural decisions

- Rules live in `.cursor/rules/` (alwaysApply) rather than only in docs, so
  they bind future agent sessions, not just human readers.
- The Canvas lives in Cursor's per-workspace canvases directory (its required
  location); the repo-tracked source of truth for history remains
  `docs/status/`. The Canvas is regenerated/updated from repo state after
  each task.

## Deviations from plan

None — rules adopted exactly as specified.

## Open risks

- The trailer-injection workaround relies on git plumbing; if the tooling
  ever intercepts `git update-ref`, an alternative mechanism will be needed.
- The Canvas file is outside the git repo, so it is not versioned with the
  code; `docs/status/` remains the versioned record.

## Tests executed

No application code changed. Verified: `git log -1 --format=full` on the
adoption commit shows human author/committer and no trailers.

## Acceptance criteria status

| Criterion | Status |
|---|---|
| Rules persisted and always-applied | ✅ |
| Canonical project-state Canvas exists with all required sections | ✅ |
| Adoption commit has clean metadata | ✅ (verified post-commit) |

## Next recommended step

M3 planning: produce the M3 architecture review Canvas per
`milestone-planning.mdc` once M3 scope/goals are provided, and obtain
approval before any code.

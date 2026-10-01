# Portal redesign CP0 — baseline hygiene

- **Date:** 2026-09-30
- **Milestone / checkpoint:** Portal UI redesign, CP0 of CP0–CP9
- **Branch / commit:** dev
- **Status:** Complete

## Objective

Make the repository safe to redesign: green lint, a repeatable route-level
regression suite, a measured layout baseline, and a status-report home. The
redesign plan was approved on 2026-09-30 (canvas `portal-redesign-plan`).

## Scope

In scope: lint errors, Playwright suite, overflow baseline, status docs,
project-state canvas reconciliation. Out of scope: any visual change.

## What was implemented

- ESLint brought from 55 errors to 0 (46 import-sort autofixes, 4 unused
  bindings, a ref-read-during-render in `date-input`, a component created
  during render in `header`).
- Playwright route suite: all 70 UI routes plus 3 detail routes and 5
  redirects, at phone (390px), tablet (834px) and desktop (1440px). Each check
  asserts no uncaught page errors, no console errors, a visible `<main>`
  landmark, and no horizontal overflow outside scrollable containers.
- Overflow baseline (`e2e/layout-baseline.ts`): 57 pre-existing
  route/viewport pairs that overflow. They are allowed but annotated; any new
  overflow fails. The list must be empty at CP9.
- `<main id="main-content">` landmark added to Threat analytics and Playbook
  builder (were plain `div`s).
- `docs/status/` and this template created.

## Files added

- `playwright.config.ts`
- `e2e/routes.ts`, `e2e/helpers.ts`, `e2e/routes.spec.ts`
- `e2e/layout-baseline.ts`, `e2e/write-layout-baseline.mjs`
- `docs/status/TEMPLATE.md`, `docs/status/2026-09-30-redesign-cp0-baseline.md`

## Files modified

- `package.json` (scripts `typecheck`, `test:e2e`, `test:e2e:layout-report`;
  dev dependency `@playwright/test` 1.63.0), `pnpm-lock.yaml`, `.gitignore`
- Import order only: 43 files under `src/`
- `src/components/date-input.tsx`, `src/components/layout/header.tsx`,
  `src/components/assets/identity-list.tsx`,
  `src/components/assist/triage-assist-panel.tsx`,
  `src/components/knowledge-base/trainings-center.tsx`,
  `src/components/threat-intelligence/dark-web-center.tsx`,
  `src/components/vulnerabilities/vulnerabilities-center.tsx`,
  `src/components/threat-hunting/threat-analytics.tsx`,
  `src/components/automation/playbook-builder.tsx`

## Architectural decisions

- Tests sign in by seeding the existing `soc.auth.session` localStorage key
  as a SOC Manager (the role that can reach every route); no test-only code
  in the app.
- Detail routes are found from list pages (link, else first row click) so the
  suite does not hardcode mock IDs.
- The suite runs against `next start`; run `next build` first.

## Deviations from plan

- Playwright was installed with pnpm 12.3.4 via `npx pnpm@12.3.4` because the
  machine's global pnpm is 11.17.0. Until the global pnpm is upgraded, run
  tools via `node_modules/.bin/*` or `npx pnpm@12.3.4`.

## Risks

- 57 baseline overflow cases. Nearly all phone-width ones share one cause:
  the header's action buttons exceed 390px. Addressed in CP3.
- List rows navigate via `onClick` on `<tr>` (not keyboard reachable). To be
  fixed with the responsive table in CP2/CP5.

## Test results

- `tsc --noEmit`: pass
- `eslint .`: pass (0 problems)
- `next build`: pass
- `playwright test`: 207 passed (57 baseline overflow annotations)

## Acceptance status

All CP0 items met.

## Next recommended step

CP1 — design tokens (type scale, spacing, radius, elevation, materials,
motion, severity tokens, system font, accessibility media queries).

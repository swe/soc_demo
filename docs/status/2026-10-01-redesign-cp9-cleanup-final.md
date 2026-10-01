# CP9 cleanup and final sweep — status report

- **Date:** 2026-10-01
- **Milestone / checkpoint:** Portal UI redesign, CP9 (cleanup, dependency removal, full
  route × breakpoint × theme sweep). Final checkpoint.
- **Branch / commit:** dev, commit after `ab534fb`
- **Status:** Complete

## Objective

Remove what the redesign made obsolete, widen automated coverage to dark mode and open
overlays, and confirm the whole portal against the acceptance criteria.

## Scope

In scope: unused dependencies, dead CSS, remaining hard-coded status colours, test coverage
for dark mode and interactive states, final docs.

Out of scope: new features or behaviour changes.

## What was implemented

- **Dependencies removed:** `@tabler/icons-react`, `@radix-ui/react-icons`, `framer-motion` and
  `motion`. The date-range picker's last Radix icons became Lucide. Removal used the pinned
  pnpm 12.3.4 (`pnpm --pm-on-fail=ignore dlx pnpm@12.3.4 remove …`), so the lockfile format is
  unchanged.
- **Dead CSS removed from `globals.css`:** `gap-section` and its `--section-gap` variable,
  `scroll-fade-x`, and the theme view-transition keyframes (no component set the
  `theme-transition` class).
- **Colours:** the notification menu's severity badges use the shared badge variants; the
  incident kind icon and the playbook run-step badges use the success, warning and
  destructive text tokens. Remaining literal hues are categorical by agreement (violet
  "investigating", graph node kinds, notification kinds, map styling).
- **Copy:** sentence case for "Team members", "Pending invitations" and "Security snapshot".
- **Tests:**
  - New `mobile-dark` and `desktop-dark` projects run the full route suite in dark mode
    (overflow, console errors, landmarks).
  - The zoom sweep now covers open states as well as default pages: the alerts filter menu,
    the invite dialog, the notifications menu, and the pending-invitations, API-keys and
    integrations-catalogue tabs, each at 15 widths.
- **`e2e/shoot.mjs`:** kept as a documented dev helper for signed-in screenshots
  (`node e2e/shoot.mjs <base> <outDir> <route>@<width>[:dark]`). It is not part of the suite.

## Files added

- `docs/status/2026-10-01-redesign-cp9-cleanup-final.md`

## Files modified

- `package.json`, `pnpm-lock.yaml`
- `src/app/globals.css`
- `src/components/date-range-picker.tsx`
- `src/components/layout/header-notifications.tsx`
- `src/components/playbooks/run-playbook-control.tsx`
- `src/components/administration/user-management.tsx`
- `src/components/profile/security-snapshot.tsx`
- `playwright.config.ts`, `e2e/zoom.spec.ts`

## Architectural decisions

- **Dark mode is tested by `colorScheme`, not by a toggle:** the app defaults to the system
  theme, so the emulated preference exercises the same path users take.
- **Only the route suite runs in dark mode:** workflow and zoom tests check layout and
  behaviour, which do not change with the theme.

## Deviations from plan

- None.

## Risks

- `pnpm` 11 is the global install; package changes need the pinned 12.3.4 through `dlx`
  until the global install is upgraded.

## Test results

- `tsc --noEmit`: pass
- `eslint .`: 0 problems
- `next build`: pass
- `playwright test`: 435/435 passed (mobile, tablet, desktop, mobile-dark, desktop-dark and
  zoom); zoom summary `withProblems=0`.
- Dark-mode screenshots reviewed: compliance, procedures and enterprise at 1440px; users,
  on-call and profile security at 390px.

## Acceptance status

- Whole portal redesigned in the agreed style with the palette preserved: met.
- Functionality, data, routes and flows preserved: met (e2e across every route).
- Desktop, tablet and mobile with no horizontal overflow, including zoom to 320px and open
  overlays: met.
- 44px touch targets: met (primitives grow on coarse pointers).
- Lucide for UI icons, no emoji icons, Recharts kept, no unnecessary dependencies: met.
- Obsolete styles and packages removed: met.

## Next recommended step

Upgrade the global pnpm to 12.3.4. Otherwise the redesign is complete; any further passes
(for example detail-view layout polish on alerts and incidents) can be scheduled as
separate work.

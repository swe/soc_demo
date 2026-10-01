# Zoom and reflow fit — status report

- **Date:** 2026-09-30
- **Milestone / checkpoint:** Portal UI redesign, between CP3 and CP4 (user-reported bug)
- **Branch / commit:** dev, commit after `d8594ca`
- **Status:** Complete

## Objective

The user reported that at some zoom levels tiles no longer fit the screen width. Make sure all
content stays visible at every zoom level and breakpoint, and add a regression check for it.

Browser zoom shrinks the CSS viewport (1440px at 200% lays out at 720px), so zoom levels map to
viewport widths. The existing suite checked only 390, 834 and 1440px, and only flagged content
past the window edge. Tiles clipped inside an `overflow: hidden` card or scroll area were never
detected.

## Scope

In scope: all 60 UI routes, 3 detail routes and the overview for all 7 roles, at 15 widths from
1920px down to the 320px WCAG reflow minimum. Out of scope: open dialogs, sheets and secondary
tabs (default page state only).

## What was implemented

- **Zoom sweep** (`e2e/zoom.spec.ts`, Playwright project `zoom`). It resizes each page through
  1920, 1440, 1280, 1152, 1024, 960, 853, 768, 720, 640, 576, 480, 427, 360 and 320px, covering
  100–400% zoom on 1280, 1440 and 1920px screens. Any problem fails the test.
- **Clipping detector** (`findClipped` in `e2e/helpers.ts`). It flags text or controls cut off
  by an ancestor that hides overflow. Ellipsis truncation, SVG internals, `sr-only` and
  `aria-hidden` content are ignored.
- **Overflow detector refined.** It now skips elements already clipped by an in-bounds
  ancestor, so each problem is reported once.
- **Fixes:**
  1. `ui/scroll-area`: Radix wraps content in `display: table`, which grows to the widest
     child and never shrinks. After zooming in, the page stayed at its old width and the right
     side was cut off. Vertical scroll areas now force the wrapper to `block`. This fixed
     `/overview`, `/investigate` and `/investigate/saved`, and the header notifications list.
  2. `soc/panel` (`PanelGrid`, `OverviewSplit`), the SOC performance metric grid and the
     threat-analytics grid had no base column template. An implicit `auto` column can't shrink
     below its widest card, so they now use `grid-cols-1` (`minmax(0, 1fr)`).
  3. `threat-hunting/technique-inventory`: the table's `sr-only` labels anchored to a block
     outside their scroll container and widened the document by 70px. The scroller is now
     `relative`.
  4. `knowledge-base-primitives` `OwnerCell`: the linked variant gets `min-w-0`, so the due
     date in training cards is no longer pushed out of the card.
- **Overflow baseline:** `e2e/layout-baseline.ts` is now empty (was 6).
- **`e2e/summarize-zoom.mjs`** summarises a JSON report.

## Files added

- `e2e/zoom.spec.ts`
- `e2e/summarize-zoom.mjs`
- `docs/status/2026-09-30-redesign-zoom-fit.md`

## Files modified

- `e2e/helpers.ts`, `playwright.config.ts`, `e2e/layout-baseline.ts`
- `src/components/ui/scroll-area.tsx`
- `src/components/soc/panel.tsx`
- `src/components/overview/soc-performance-panel.tsx`
- `src/components/threat-hunting/threat-analytics.tsx`
- `src/components/threat-hunting/technique-inventory.tsx`
- `src/components/knowledge-base/knowledge-base-primitives.tsx`

## Architectural decisions

- **Zoom is tested as viewport width.** Chrome zoom changes the layout viewport and media
  queries identically to a narrower window, so a width sweep covers it deterministically.
- **The sweep resizes a loaded page rather than reloading per width.** That is what zooming
  does, and it exposed the "never shrinks back" bug that a fresh load at each width would hide.
- **Fixes were made in shared components** (ScrollArea, PanelGrid, OverviewSplit) rather than
  per page.

## Deviations from plan

- The remaining overflow debt (planned for CP4–CP6) is already cleared, so the CP9 requirement
  of an empty baseline is met early.

## Risks

- The sweep covers the default state of each page. Dialogs, sheets, other tabs and filtered
  states are not swept. These will be added as each module is restyled in CP4–CP8.
- Other `grid … sm:grid-cols-*` blocks without a base template carry the same latent risk. None
  currently overflow, and the sweep will catch any that start to.

## Test results

- `tsc --noEmit -p .`: pass
- `eslint .`: 0 problems
- `next build`: pass
- `playwright test`: 276/276 passed. That is 207 route checks (mobile, tablet, desktop) plus 69
  zoom sweeps (60 routes, 3 detail pages and 6 role overviews, each at 15 widths). There are no
  overflow annotations and no stale baseline entries.

## Acceptance status

- All content fits from 1920px to 320px on every route: met.
- Regression check in the suite: met (the zoom project fails on any problem).
- No palette, route or behaviour changes: met.

## Next recommended step

Visual review of the CP3 shell, then CP4 (dashboards and charts).

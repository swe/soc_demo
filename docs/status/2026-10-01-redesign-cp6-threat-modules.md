# CP6 threat modules — status report

- **Date:** 2026-10-01
- **Milestone / checkpoint:** Portal UI redesign, CP6 (threat hunting, threat intelligence,
  purple team, automation)
- **Branch / commit:** dev, commit after `d4aa42a`
- **Status:** Complete

## Objective

Bring the threat and automation modules onto the CP5 toolbar, filter, table and token patterns,
so they look and behave like the core workflows. Data, URL state, routes and role logic stay as
they were.

## Scope

In scope:

- Threat hunting: hunt library, detections, threat analytics, threat map, purple team.
- Threat intelligence: indicators, actors and campaigns, feeds, dark web monitoring.
- Automation: playbooks, builder, approvals.

Out of scope:

- The relationship graph and playbook canvas internals (xyflow nodes keep their layout).
- `FilterPanelHeader` copies in knowledge base, compliance and user management (CP7).

## What was implemented

- **Dark web:**
  - The filter popover with six hand-built drill-in panels is now one `FilterMenu` (type,
    severity, status, source, domain and sort). Phones get the bottom sheet.
  - Toolbar moved onto `ModuleShell` slots; the type chips are `FilterChip`s in a labelled
    group that scrolls on phones.
  - Severity, status and risk badges use the shared badge variants, as in alerts.
  - The exposures table folds type and severity under the title on phones; breaches and
    watchlist hide secondary columns.
- **Indicators:** nine type and status toggle buttons became one `FilterMenu`, so the toolbar
  fits on one line on phones.
- **Threat analytics:** moved onto `ModuleShell`; search is the shared input group, severity
  is `FilterChip`s, and the two switches are `ToolbarToggle`s.
- **Threat map:** stays full-bleed. Severity is a `SegmentedControl`, the stats are a
  definition list, the hotspot list is a grouped card with a selected bar, and severity
  badges use variants. On phones the map and list scroll as one page.
- **Approvals:** moved onto `ModuleShell`; shared empty and loading states replace the
  header-only table; the table hides secondary columns on phones and the decide buttons
  become icon buttons with screen-reader labels.
- **Builder:** header on gutter spacing with tokenised badges; the "no playbook" screen uses
  `EmptyState`; controls fit a phone.
- **Detections, purple team, hunt library:** responsive columns; titles wrap to two lines
  on phones; the hunt ID folds under the title.
- **Colours:** status and severity classes replaced with tokens across all CP6 modules.
  Category hues (graph node kinds, playbook step kinds, indicator and exposure types) stay,
  as agreed for categorical colour.

## Files added

- `docs/status/2026-10-01-redesign-cp6-threat-modules.md`

## Files modified

- `src/components/automation/`: approval-queue, playbook-builder, playbooks-center
- `src/components/detections/detections-center.tsx`
- `src/components/threat-hunting/`: mitre-coverage-map, purple-team-center,
  technique-inventory, threat-analytics, threat-detail-sheet, threat-map-center,
  threat-relationship-map
- `src/components/threat-intelligence/`: dark-web-breaches-table, dark-web-center,
  dark-web-exposures-table, dark-web-primitives, dark-web-watchlist
- `src/components/threats/`: feeds-center, hunt-library-center, indicators-center,
  stix-taxii-panel, threat-shared-primitives

## Architectural decisions

- **Severity maps use the severity tokens:** maps keyed critical, high, medium and low now use
  `severity-*` rather than the generic destructive, warning and info tokens, so they match the
  alerts badges exactly.
- **Full-bleed pages keep their own frame:** the threat map and the playbook builder need the
  whole content area, so they keep a custom `main` but use the same toolbar chrome
  (`bg-background`, `border-separator`, `px-gutter`).

## Deviations from plan

- None in scope. The duplicate React key warning on detections (a rule listing the same
  technique twice) was fixed by de-duplicating at render.

## Risks

- On phones the dark-web exposures toolbar wraps the Export button onto a second row, because
  it has two toggles. That is acceptable, and it never overflows.
- Approval rows with data were checked in code only; the demo queue is empty until a playbook
  run is started.

## Test results

- `tsc --noEmit`: pass
- `eslint .`: 0 problems
- `next build`: pass
- `playwright test`: 282/282 passed (mobile, tablet, desktop and zoom fit); zoom summary
  `withProblems=0`.
- Dev console check on detections, indicators, purple team and map: no React errors after
  the key fix (map WebGL performance notices only).
- Screenshots reviewed: dark web exposures and breaches, threat map, threat analytics,
  approvals, builder, purple team, detections, indicators, actors, hunt library and playbooks
  at 390px; dark web, map, analytics, builder and purple team at 1440px; dark web and map in
  dark mode.

## Acceptance status

- Threat and automation modules use the shared toolbar, filter, chip and toggle controls: met.
- No horizontal overflow at any breakpoint or zoom level: met.
- Palette preserved; status colours from tokens, category hues unchanged: met.
- Functionality and URL state preserved: met (e2e).

## Next recommended step

CP7: compliance, knowledge base (`FilterPanelHeader` copies), administration (user
management filters, integrations detail sparkline), on-call and profile.

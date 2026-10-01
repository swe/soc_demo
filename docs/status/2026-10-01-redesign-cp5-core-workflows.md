# CP5 core workflows — status report

- **Date:** 2026-10-01
- **Milestone / checkpoint:** Portal UI redesign, CP5 (core workflows)
- **Branch / commit:** dev, commit after `e3e6320`
- **Status:** Complete

## Objective

Give the day-to-day analyst modules one toolbar, one tab style, one filter control and tables
that work on a phone, using the CP1 tokens and CP2 primitives. Data, URL state, filters, routes
and role logic stay as they were.

## Scope

In scope:

- Alerts, incidents, mailbox (phishing), investigate, assets (devices and identities), cloud
  posture, vulnerabilities (all sub-views) and data security.
- Shared tab, filter, toggle and chip controls, and keyboard-operable table rows.

Out of scope:

- Full layout pass on alert and incident detail views (tokens and colours only here).
- `FilterPanelHeader` copies in knowledge base, compliance, user management and dark web
  (CP6 and CP7).

## What was implemented

- **Shared controls** (`src/components/soc/`):
  - **`ModuleTabsList` / `ModuleTabsTrigger` / `TabCount`:** underline tabs that scroll
    horizontally without a scrollbar; 44px tall on coarse pointers. Used by 12 modules.
  - **`FilterMenu`:** one "Filter" button with an active-count pill. On desktop it is a popover
    with a drill-in per facet; on phones a bottom sheet listing every facet with
    "Clear all" and "Done". Facets can be multi-select or single-choice (used for sort).
  - **`ToolbarToggle`:** a switch styled as a toolbar button, with a visible focus ring.
  - **`FilterChip`:** rounded `aria-pressed` chips for presets and quick filters.
- **`TableRow`:** rows with `onClick` are now focusable and open with Enter or Space, with an
  inset focus bar. This fixes the CP0 "rows not keyboard reachable" finding everywhere at once.
- **Module toolbars** moved onto `ModuleShell` toolbar slots: alerts, incidents, devices,
  identities, vulnerabilities, exposure and work.
- **Alerts and incidents:** assigned-scope is a `SegmentedControl`; severity, priority, status,
  risk and SLA badges use the severity and status tokens; the title leads each row and the
  secondary badges fold under it on small screens.
- **Responsive tables:** fixed layout and fewer columns below `md` across alerts, incidents,
  devices, identities, vulnerabilities (findings, exposure, work, recommendations,
  remediations, inventories, weaknesses, event timeline), data security, mailbox and the SOC
  performance team table. Severity always stays visible.
- **Colour codemod:** hard-coded red, amber, emerald, sky and similar classes replaced with
  token classes across the CP5 modules; violet stays as the "investigating" hue.
- **Investigate:** template and source chips, token health dots, gutter spacing and a canvas
  side panel.

## Files added

- `src/components/soc/module-tabs.tsx`, `filter-menu.tsx`, `toolbar-toggle.tsx`,
  `filter-chip.tsx`
- `e2e/workflows.spec.ts`
- `docs/status/2026-10-01-redesign-cp5-core-workflows.md`

## Files modified

- `src/components/ui/table.tsx`, `src/components/soc/module-shell.tsx`
- Alerts, incidents, phishing, investigate, assets, cloud posture, vulnerabilities and data
  security components.
- Tab migration only (no other changes) in automation, compliance, detections, knowledge base,
  on-call, threat hunting, threat intelligence, threats and administration.
- `src/components/overview/soc-performance-panel.tsx` (phone table layout).

## Architectural decisions

- **One `FilterMenu` instead of a separate `FilterSheet`:** the same facet description drives
  both the desktop popover and the phone sheet, so the two cannot drift apart.
- **Keyboard support lives in `TableRow`:** every clickable row gets it without per-table code.
  Enter only fires when the row itself has focus, so links and buttons inside rows still work.
- **No `ResponsiveTable` component:** column hiding with breakpoint classes covered every table
  without a card-list fallback. A new abstraction was not needed.

## Deviations from plan

- `ResponsiveTable` and `FilterSheet` (deferred from CP2) were not built; see the decisions
  above.
- The tab migration touched modules owned by CP6 and CP7, because it was a mechanical swap and
  doing it once kept tabs consistent everywhere.

## Risks

- Alert and incident detail views only received the colour codemod; their layout gets a pass
  together with the other detail sheets in CP7 or CP9.
- `FilterPanelHeader` copies remain in other modules until CP6 and CP7.

## Test results

- `tsc --noEmit`: pass
- `eslint .`: 0 problems
- `next build`: pass
- `playwright test`: 282/282 passed (mobile 390, tablet 834, desktop 1440 and zoom fit);
  zoom summary `withProblems=0`.
- New `e2e/workflows.spec.ts`: filter menu applies a facet and syncs `?severity=` on all three
  form factors (phone sheet with "Done", desktop popover drill-in); a focused incident row
  opens its detail page with Enter.

## Acceptance status

- Consistent tabs, toolbars and filters across core workflows: met.
- No horizontal overflow at 390, 834 and 1440, or at zoom levels: met.
- 44px touch targets on coarse pointers for tabs, filters, chips and toggles: met.
- Keyboard-operable rows: met.
- Palette preserved (token classes only): met.
- Functionality and URL state preserved: met (e2e).

## Next recommended step

CP6: threat hunting, threat intelligence (dark web `FilterPanelHeader`), purple team and
automation.

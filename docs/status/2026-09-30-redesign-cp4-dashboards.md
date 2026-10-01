# CP4 dashboards and charts — status report

- **Date:** 2026-09-30
- **Milestone / checkpoint:** Portal UI redesign, CP4 (dashboards and charts)
- **Branch / commit:** dev, commit after `4f6114a`
- **Status:** Complete, awaiting visual review

## Objective

Give every dashboard the same chart language and card structure, built on the CP1 tokens and
CP2 primitives: one chart card, one set of axis and tooltip defaults, severity and status colours
from tokens, and consistent "View all" links. Data, filters, routes and role logic stay as they
were.

## Scope

In scope:

- Role overview (`/overview`) and its subpanels.
- Module overviews: alerts, incidents, vulnerabilities, dark web, compliance and integrations.
- Status colours in the integrations management view.

Out of scope:

- Module toolbars and tabs, and responsive tables (CP5).
- Detail sheets, such as the integrations volume sparkline (CP7).

## What was implemented

- **Chart kit** (`src/components/soc/charts/`):
  - **`chart-palette`:** severity, priority and status colours as CSS variables; shared axis,
    grid and margin defaults; compact number formatting.
  - **`ChartCard`:** a panel with a fixed-height body, so loading (skeleton), empty and error
    states take the same space as the chart.
  - **`TrendAreaChart`:**
    - Stacked or overlaid areas with gradient fills.
    - Dashed target lines.
    - A "Total" line in the tooltip.
    - A custom y-axis format.
  - **`CategoryBarChart`:** vertical or horizontal bars, per-row colour, clickable bars.
  - **`DonutBreakdown`:** donut with the total in the centre. Its legend rows are the
    accessible, tappable controls.
  - **`RankedBarList`:** workload and top-N rows with inline bars.
  - **`MetricTiles`:** compact count tiles with an optional context line.
- **`ui/chart`:**
  - Grid lines use the separator token.
  - Tooltips use the thick material and overlay shadow.
  - Zero values are now shown.
  - Legends follow the config order instead of being sorted by name.
- **`PanelLink`** replaces the ad-hoc "View all", "Open" and "Exposure" links and buttons. It is
  a primary link with a chevron and a 44px touch target on coarse pointers.
- **`OverviewSplit` and `PanelGrid`** stretch cards in a row to equal height.
- **Module overviews converted:** alerts, incidents, vulnerabilities, dark web, compliance and
  integrations.
- **`/overview` rewritten** on `ModuleShell` and `PageHeader`:
  - KPI tiles match `StatsStrip` and keep their sparklines.
  - Trend and breakdown panels use the kit.
  - Queues and lists use `Panel`, separator dividers and `Badge` tones.
  - Subpanels restyled: unified ingest, unified risk queue, SOC performance, PagerDuty on-call
    and identity risk.
- **Status colours moved to tokens:**
  - Data maps: compliance control status, integration health buckets, overview breakdowns.
  - About 40 `text-*-600` / `dark:text-*-400` classes.
- **`e2e/shoot.mjs`:** a dev helper that takes signed-in screenshots at chosen widths and themes,
  for visual review.

## Files added

- `src/components/soc/charts/` (7 files)
- `e2e/shoot.mjs`
- `docs/status/2026-09-30-redesign-cp4-dashboards.md`

## Files modified

- `src/components/ui/chart.tsx`, `src/components/soc/panel.tsx`
- `src/components/alerts/alerts-overview.tsx`, `src/components/incidents/incidents-overview.tsx`
- `src/components/vulnerabilities/vulnerabilities-overview.tsx`
- `src/components/threat-intelligence/dark-web-overview.tsx`
- `src/components/compliance/compliance-overview.tsx`, `compliance-data.ts`
- `src/components/administration/integrations-overview.tsx`, `integrations-data.ts`,
  `integrations-management.tsx`
- `src/components/overview/`: `role-overview.tsx`, `overview-data.ts`,
  `ingest-health-strip.tsx`, `unified-risk-queue.tsx`, `soc-performance-panel.tsx`,
  `pagerduty-on-call-panel.tsx`, `identity-risk-widget.tsx`

## Architectural decisions

- **Colours are CSS variables, not hex values.** One value serves both themes, so the
  `theme: {light, dark}` pairs in chart configs are gone wherever a token exists.
- **Categorical hues stay local.** These colours carry no status meaning, and the brief says not
  to add a new colour system. They are kept as named local constants:
  - exposure types (credential, stealer, mention, ransomware);
  - ingestion source categories;
  - the "investigating" workflow stage;
  - framework accents.
- **Fixed chart body heights** (`sm`, `md`, `lg`) so a grid row never jumps between states.
- **Donut legends are buttons** where slices filter, so filtering works by keyboard and by
  touch, not only by clicking a slice.

## Deviations from plan

- The integrations detail-sheet sparkline was only re-coloured. Its layout belongs to the
  administration pass (CP7).
- The overview's "Investigating" donut label can truncate with an ellipsis in the narrow
  three-column row at desktop widths. Nothing is cut off; the full label is still in the
  tooltip.

## Risks

- Only the default state of each page was screenshotted. Range toggles (7d, 14d, 30d) and other
  roles share the same components but were not individually inspected.
- The SOC performance team table is cramped at 390px. Responsive tables are part of CP5.

## Test results

- `tsc --noEmit -p .`: pass
- `eslint .`: 0 problems
- `next build`: pass
- `playwright test`: 276/276 passed, including the zoom sweep (15 widths, 1920px to 320px). No
  overflow or clipping problems.
- Visual check:
  - Light mode at 1440, 834 and 390px.
  - Dark mode at 1440 and 834px.
  - Pages: `/overview`, alerts, incidents, vulnerabilities, dark web, compliance and
    integrations.

## Acceptance status

- Consistent chart cards, axes, tooltips and legends on all overview pages: met.
- Severity and status colours from tokens, light and dark: met.
- Empty, loading and error states for charts: met (built into `ChartCard`).
- No data, route or behaviour changes: met.

## Next recommended step

Visual review of CP4, then CP5 (core workflows, responsive tables, filter sheets, module tabs and
toolbars).

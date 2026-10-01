# Portal redesign CP3 — shell and navigation

- **Date:** 2026-09-30
- **Milestone / checkpoint:** Portal UI redesign, CP3 of CP0–CP9
- **Branch / commit:** dev
- **Status:** Complete — paused for visual review (per approved cadence)

## Objective

Give every authenticated route a shell that adapts to the device instead of
shrinking: sidebar on desktop, icon rail on tablet, bottom tab bar on phones,
and a header with real, clickable breadcrumbs.

## Scope

In scope: `AdminShell`, header, sidebar primitive and nav components, nav
data, route breadcrumbs, command palette, mobile navigation, shell icons.
Out of scope: page bodies (CP4–CP8).

## What was implemented

| Breakpoint | Navigation |
| --- | --- |
| Desktop ≥ 1280px | Expanded sidebar; collapse to rail with the header button or ⌘B; preference persisted in the existing cookie |
| Tablet 768–1279px | Icon rail (56px, 40px targets, tooltips, sub-sections as flyout menus) by default; expanding is temporary and does not overwrite the desktop preference |
| Phone < 768px | Sidebar not rendered. Bottom tab bar (Overview, Alerts, Investigate, Assets, More) in the layout flow, so it never covers content. Tabs the role cannot access are dropped |

- **More sheet (phones):** bottom sheet on the grouped canvas containing the
  account (links to profile), the View-as role switcher, every section the
  role can reach as inset grouped lists, and Log out. It reuses the sidebar's
  mobile open state, so ⌘B and close-on-navigate behave as before.
- **Header:** fixed height from `--header-height`. On tablet and desktop:
  sidebar toggle, section icon, breadcrumbs whose ancestors are links (only
  when the role can open them), role switcher, borderless search (with ⌘K
  hint at `lg`), notifications. On phones: a back chevron to the nearest
  ancestor, the page title, search and notifications; the role switcher moves
  into More. This removes the header overflow behind 51 baseline entries.
- **Breadcrumbs:** `route-chrome.ts` is now one data table of sections
  (label, icon, landing href, sub-pages, detail-route label) instead of a long
  `if` chain, and returns `{ label, href }` crumbs.
- **Icons:** all navigation, header, command palette, search and theme switch
  icons are Lucide, defined once in `navIcons` (sidebar-data). Data security,
  Compliance and On-call previously shared icons with other sections and now
  have their own.
- **Labels:** nav and breadcrumbs use sentence case consistently (for
  example "Cloud posture", "Threat intelligence", "User management").
- **Command palette:** pages listed with their section icons; sub-pages are
  grouped under their section heading, so the two "Overview" entries are no
  longer ambiguous.
- **Sidebar styling:** quieter hover, primary-tinted active icon, focus rings,
  40px rows on touch, sub-items without heavy fills.
- **Hooks:** one `use-mobile.ts` (`useIsMobile`, `useIsTablet`, built on
  `useSyncExternalStore`); the duplicate `use-mobile.tsx` and the unused
  `use-media-query.tsx` are deleted. The undefined `border-grid` wrapper is gone.

## Files added

- `src/components/layout/mobile-tab-bar.tsx`
- `src/components/layout/mobile-more-sheet.tsx`
- `docs/status/2026-09-30-redesign-cp3-shell.md`

## Files modified

- `src/components/layout/`: admin-shell, app-sidebar, header,
  header-notifications, header-role-switcher, nav-user
- `src/components/ui/sidebar.tsx`
- `src/data/sidebar-data.tsx`, `src/data/route-chrome.ts`
- `src/components/command-menu.tsx`, `search.tsx`, `theme-switch.tsx`
- `src/hooks/use-mobile.ts`
- `src/app/globals.css` (`--tab-bar-height` includes the safe area; 0 from `md`)
- `src/components/soc/module-shell.tsx` (no tab-bar inset needed any more)
- `e2e/layout-baseline.ts` (57 → 6 entries)

## Files deleted

- `src/hooks/use-mobile.tsx`, `src/hooks/use-media-query.tsx`

## Architectural decisions

- The tab bar is part of the viewport-locked content column rather than a
  fixed overlay, so pages need no bottom padding and nothing scrolls under it.
- Tablet rail state lives in the sidebar provider (`openTablet`) instead of a
  resize effect, which avoids writing the persisted cookie on every resize.
- The tab bar labels Alerts & incidents as "Alerts" (it stays active on
  incident routes) because tab titles must stay short at 390px.

## Deviations from plan

- The role switcher moved into the More sheet rather than the user menu,
  because the user menu lives in the sidebar, which phones no longer render.

## Risks

- On first load at tablet width the sidebar can render expanded for one frame
  before the media query resolves (server snapshot is "not tablet").
- Remaining overflow entries are page-level: `/overview` at all sizes (CP4),
  `/investigate` and `/investigate/saved` tables on phones (CP5),
  `/threat-hunting/analytics` on desktop (CP6).
- Four files still import Tabler (`password-input`, `copy-button`,
  `date-range-picker`, `profile-layout-nav`); they belong to CP7–CP8, and the
  package is removed in CP9.

## Test results

- `tsc --noEmit`: pass
- `eslint .`: pass (0 problems)
- `next build`: pass
- `playwright test`: 207 passed; 6 overflow annotations, all on the baseline,
  which was regenerated from 57 to 6 entries
- Screenshots reviewed: findings page at desktop, tablet and phone; More
  sheet; user detail on phone; command palette at desktop and tablet

## Acceptance status

CP3 items met. Waiting for visual review before CP4.

## Next recommended step

CP4 — dashboards and charts: the overview (fixing its overflow) and the six
module overviews, tokenised chart colours, a shared chart card with loading
and empty states. Then pause for a second visual review.

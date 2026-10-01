# Portal redesign CP2 — UI primitives and shared patterns

- **Date:** 2026-09-30
- **Milestone / checkpoint:** Portal UI redesign, CP2 of CP0–CP9
- **Branch / commit:** dev
- **Status:** Complete

## Objective

Move every shadcn primitive and the shared SOC building blocks onto the CP1
tokens so that pages restyled in CP3–CP8 inherit one consistent look,
interaction model and touch behaviour. Component APIs stay unchanged.

## Scope

In scope: `src/components/ui/*` (except `sidebar`, `chart`, `calendar`, which
belong to CP3/CP4), `src/components/soc/*`, and the three duplicated overview
range controls. Out of scope: page layouts, the app shell, charts.

## What was implemented

Primitives:

| Area | Change |
| --- | --- |
| Button | `pressable` press feedback, 3px soft focus ring, raised outline variant on `bg-card`, `text-callout` small size; every size grows to 44px under `pointer: coarse` |
| Fields | `fieldControlClassName` shared by Input, Textarea, SelectTrigger; InputGroup matches (card fill, card shadow, focus ring, 44px touch height). Inputs use 16px text below `md` so iOS does not zoom on focus |
| Checkbox / Radio / Switch | Filled checked state in primary, invisible enlarged hit areas, focus rings |
| Badge | Pill shape; tinted tone variants `critical`, `high`, `medium`, `low`, `success`, `warning`, `info`, `muted`, `accent` using the AA `*-text` shades |
| Tabs | Segmented track with raised active segment, horizontal scroll instead of overflow |
| Menus (Select, DropdownMenu, Popover) | `material-thick` translucent surface, `shadow-raised`, scale-in from 97% anchored to the trigger via Radix transform-origin, 8px collision padding, 44px rows on touch, destructive item variant |
| Tooltip | Neutral inverted fill (`bg-foreground`) instead of primary indigo; text-balance; nested muted text stays legible |
| Dialog / AlertDialog | Bottom sheet below `sm` (slide up, safe-area padding, 92svh cap), centred card from `sm` (scale from 97%), `rounded-2xl`, `shadow-overlay`, round close button |
| Sheet | Full-width on phones; floating inset panel with `rounded-2xl` from `sm`; leaves through the edge it entered; sheet easing |
| Drawer | iOS-sized grabber, card surface, safe-area padding; background scaling off by default |
| Scrim | One shared overlay (`bg-black/35` + 2px blur, darker in dark mode) |
| Command palette | Spotlight-style: positioned in the upper third on desktop, larger rows, muted icons |
| Toasts | Material surface, `rounded-xl`, tone-coloured icons; on mobile they sit above the tab bar via `--tab-bar-height` |
| Card / Table | `rounded-xl` + `shadow-card`; table head 12px muted, roomier cells with 16px outer inset, tabular numerals, `border-separator` hairlines, horizontal scroll contained |
| Others | Alert (grid layout + `warning`/`success`/`info` variants), Progress (thinner, `indicatorClassName`), Breadcrumb (truncation, focus ring), Pagination (wrapping), Empty, Skeleton (`bg-muted`, reduced-motion safe), Label, Separator, Accordion, map popups |

Shared SOC components:

- `soc/segmented-control.tsx` — radiogroup with arrow-key roving; replaces
  three copies of `OverviewRangeControl` (alerts, incidents, dark web).
- `soc/page-header.tsx` — title/description/actions block whose actions wrap.
- `soc/state.tsx` — `EmptyState`, `ErrorState` (with retry), `LoadingState`.
- `Panel` / `PanelHeading` — raised `rounded-xl` cards, `text-headline` titles.
- `ModuleShell` — grouped `bg-canvas` body, `px-gutter`, 1600px content cap,
  bottom padding that clears the mobile tab bar.
- `StatsStrip` — individual metric tiles (2-up on phones), `text-metric`
  values, delta arrows in success/destructive text tokens instead of
  hard-coded emerald/rose.
- `ModulePageSkeleton` — mirrors the new toolbar + tile + card layout.

Typography floor: all 225 `text-[10px]` / `text-[11px]` uses (71 files) are now
`text-xs` (12px).

## Files added

- `src/components/soc/segmented-control.tsx`
- `src/components/soc/page-header.tsx`
- `src/components/soc/state.tsx`
- `docs/status/2026-09-30-redesign-cp2-primitives.md`

## Files modified

- `src/components/ui/`: accordion, alert, alert-dialog, badge, breadcrumb,
  button, card, checkbox, command, dialog, drawer, dropdown-menu, empty, input,
  input-group, label, map, pagination, popover, progress, radio-group, select,
  separator, sheet, skeleton, sonner, switch, table, tabs, textarea, tooltip
- `src/components/soc/`: panel, module-shell, stats-strip, module-page-skeleton
- `src/components/alerts/alerts-overview.tsx`,
  `src/components/incidents/incidents-overview.tsx`,
  `src/components/threat-intelligence/dark-web-overview.tsx` (range control)
- 71 files for the 12px text floor (class substitution only)

## Architectural decisions

- Responsive dialogs are handled inside `DialogContent` rather than by a
  separate `ResponsiveDialog` wrapper, so all 19 existing dialogs adapt with no
  call-site changes. Trade-off: no drag-to-dismiss on mobile (close button and
  scrim tap still work).
- Touch sizing is driven by `pointer-coarse:` in the primitives, so consumer
  size overrides such as `size-8` still grow to 44px on touch devices.
- Tooltips are neutral rather than indigo. This is a component colour choice,
  not a palette change; indigo stays reserved for actions and selection.

## Deviations from plan

- `ResponsiveDialog`: not created (see the first decision above).
- `ResponsiveTable` and `FilterSheet`: moved to CP5, where they will be built
  against the real alerts/incidents tables instead of a speculative API.

## Risks

- Dialog consumers that set an unprefixed `max-h-*` keep it on desktop, but on
  phones the bottom-sheet cap (92svh) applies.
- Module-specific underline tabs and table wrappers without `bg-card` still sit
  directly on the canvas until their module is restyled (CP4–CP7).

## Test results

- `tsc --noEmit`: pass
- `eslint .`: pass (0 problems)
- `next build`: pass
- `playwright test`: 207 passed; 57 overflow annotations, all on the CP0
  baseline (53 mobile — mostly the header, fixed in CP3); no new overflow, no
  stale entries
- Visual spot check: alerts overview at desktop and mobile

## Acceptance status

CP2 items met apart from the two deferrals listed above.

## Next recommended step

CP3 — shell and navigation: sidebar (expanded / icon rail / hidden), mobile
bottom tab bar with More sheet, translucent header with breadcrumbs, Lucide nav
icons. Then pause for visual review.

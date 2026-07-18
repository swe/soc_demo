# M3 Checkpoint 1 — Foundations & AppShell — 2026-07-17

## Revision 2 — visual direction rework (same day)

CP1 was reviewed and rejected as "too dark and visually heavy." This revision
changes presentation only — no routes, APIs, or behavior.

**Before → after:** near-black blue-tinted surfaces with a saturated indigo
accent became a neutral graphite ladder with visible zoning: outer shell
`#17181c` → sidebar `#1c1e23` → page canvas `#212328` (visibly lighter) →
panels `#26282e` → raised `#2c2f35` → overlays `#34373e`. Structure now comes
from borders and surface shifts, not darkness or glow.

Token changes (`app/css/product-tokens.css`, mirrored in
`landing-overview.css` dark block):

| Token | Before | After |
|---|---|---|
| `--soc-shell` (new) | — | `#17181c` |
| `--soc-sidebar` (new) | — | `#1c1e23` |
| `--soc-bg` | `#0f1218` | `#212328` |
| `--soc-surface` | `#161b24` | `#26282e` |
| `--soc-raised` | `#1c222d` | `#2c2f35` |
| `--soc-overlay` | `#242b38` | `#34373e` |
| `--soc-accent` | `#6b7cff` | `#7d8ee8` (muted) |
| text ramp | blue-tinted | neutral gray (`#e7e9ec` …) |
| borders | 0.07 alpha | 0.08 / 0.13 / 0.24 alpha |
| severity/status bg | 0.12 alpha, saturated | 0.10 alpha, desaturated |

Component revisions (CP1 scope only):

- **Sidebar** — own `--soc-sidebar` surface; active item is a neutral fill
  with a 2px accent bar (no accent-filled glow); 15px muted icons; 13px labels.
- **Header** — 48px (was 56px), sits on the page canvas with a hairline
  border instead of a separate dark band.
- **PageHeader** — 18px semibold title (was 20px), quieter section label,
  13px secondary description. Mono reserved for technical values only.
- **Unavailable + Investigations placeholder** — flat bordered `soc-panel`
  sections instead of card stacks.
- **e2e spec** — waits for live data and disables animations before capturing
  the four evidence screenshots (previous captures raced skeletons/fade-in).

Verified after revision: `pnpm typecheck` ✓ · `pnpm lint` ✓ · unit 37/37 ✓ ·
`pnpm build` ✓ · `m3-cp1-shell` e2e ✓. No functional routes or APIs changed.

**Stopped again for visual approval before Checkpoint 2.**

## What was implemented

Checkpoint 1 delivers the M3 product chrome and information-architecture
shrink — nothing else. The operational app now runs inside a dark-only
`AppShell` with refined `--soc-*` product tokens, IBM Plex Sans/Mono
typography, visible focus rings, a flat workflow-shaped sidebar, and a
header without a theme toggle. Mock-only destinations are gone from primary
navigation. M4 URL routes remain reachable but show a shared restrained
unavailable state with no fake data. Exact duplicates and the internal
preview were deleted (with redirects).

Live workflows (alerts, incidents, members, audit, overview data) continue
to work under the new shell. Investigations has a nav entry and an honest
placeholder until Checkpoint 4.

**Stopped for visual review before Checkpoint 2.**

## Files added

| File | Purpose |
|---|---|
| `app/css/product-tokens.css` | Canonical dark product tokens, spacing, focus, mono helper, skip link |
| `src/components/layout/app-shell.tsx` | Sidebar + header + main chrome |
| `src/components/layout/sidebar.tsx` | Primary nav (10 items only) |
| `src/components/layout/header.tsx` | Org + profile header (no theme toggle) |
| `src/components/layout/page-header.tsx` | Standard page header |
| `src/components/layout/page-shell.tsx` | Content width container |
| `src/components/layout/unavailable.tsx` | Shared M4 unavailable state |
| `src/components/layout/index.ts` | Barrel |
| `app/overview/investigations/page.tsx` | CP4 placeholder (honest, no fake data) |
| `tests/e2e/m3-cp1-shell.spec.ts` | Nav shrink + screenshots |
| `docs/status/evidence/m3-cp1-*.png` | Visual evidence |

## Files modified

| File | Change |
|---|---|
| `app/overview/layout.tsx` | AppShell + IBM Plex font variables; forces product surface |
| `app/css/style.css` | Imports product-tokens.css |
| `app/css/landing-overview.css` | Align dark --soc-* with product palette |
| `components/overview/unified-ui.tsx` | OverviewPageShell/Header re-export layout components |
| `components/ui/icon.tsx` | grid / people / person icons |
| `next.config.js` | Redirects for deleted duplicates/preview/devices |
| M4 route `page.tsx` files (18) | Replaced mock UIs with `UnavailablePage` |

## Files deleted

| Path | Reason |
|---|---|
| `app/overview/unified-preview/` | Internal kit showcase |
| `app/overview/assets/identities/` | Exact duplicate of live Identities |
| `app/overview/administration/user-management/` | Exact duplicate of Members |
| `app/overview/assets/devices/` | Redirects to `/overview/assets` |

## Architectural decisions

- **Dark-only product shell** via `.product-shell` tokens that do not depend on
  `html.light`. Light token hook reserved under `.product-shell-light-ready`
  (not shipped). Theme toggle removed from product header.
- **Typography:** IBM Plex Sans + IBM Plex Mono — technical, deliberate, not
  Inter-default. Marketing fonts unchanged.
- **Nav shrink at CP1** (not deferred to CP8): only functional surfaces.
- **Investigations in nav now** with an honest placeholder; full UI in CP4.
- **M4 routes:** hide from nav + unavailable page; physical delete at CP8.
- **unified-ui:** PageShell/PageHeader extracted behind re-exports; no
  big-bang rewrite.

## Deviations from plan

- `/overview/assets/devices` deleted + redirected to Assets (cleaner than an
  unavailable stub for a retired duplicate concept).
- Old `components/ui/sidebar.tsx` and `header.tsx` left on disk unused —
  remove in CP8 with the rest of chrome cleanup.

## Open risks

| Risk | Notes |
|---|---|
| Org/profile dropdowns still use Tailwind gray classes | Acceptable under `.dark` ancestor; restyle in later CP if needed |
| Overview dashboard content still pre-M3 | Intentional — CP7 owns overview redesign |
| Collapse control on sidebar is label-only (width not icon-rail yet) | Full collapse behavior can refine in CP2+ |

## Tests executed

| Suite | Result |
|---|---|
| `pnpm typecheck` | Pass |
| `pnpm lint` | Pass |
| `pnpm ci:local` | Pass (37 unit / 70 integration) |
| `pnpm build` | Pass |
| `pnpm test:e2e` | 8 passed (includes m3-cp1-shell) |

## Visual evidence

| Screenshot | What it shows |
|---|---|
| `docs/status/evidence/m3-cp1-overview-shell.png` | AppShell, Svalbard brand, 10-item nav, live overview |
| `docs/status/evidence/m3-cp1-alerts.png` | Alerts under new shell (table still pre-CP3) |
| `docs/status/evidence/m3-cp1-unavailable.png` | Threat Intelligence unavailable state |
| `docs/status/evidence/m3-cp1-investigations-placeholder.png` | Investigations CP4 placeholder |

## Acceptance criteria status (CP1 only)

| Criterion | Status |
|---|---|
| Product tokens + typography + focus states | ✅ |
| AppShell / Sidebar / Header / PageHeader | ✅ |
| Mock-only nav removed; primary IA matches approval | ✅ |
| Duplicates/preview deleted; M4 routes unavailable | ✅ |
| Live workflows still green under new shell | ✅ |
| Visual evidence + status doc + stop for review | ✅ |
| Checkpoint 2 not started | ✅ |

## Next recommended step

**Visual review / explicit approval of Checkpoint 1**, then Checkpoint 2:
DataTable + FilterBar + URL-backed filter state.

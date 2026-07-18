# M3 Checkpoint 1 correction — component, theme, layering, accessibility defects — 2026-07-17

## What was implemented

CP1 was rejected because the shell contained concrete defects: unreadable header
text in light theme, a permanently visible skip link, template-styled profile and
organization menus, uncontrolled z-index stacking, oversized filter controls,
debug copy (`25+ shown`, "Checkpoint 4"), duplicated ALERTS headings, and a heavy
navigation active state. This correction fixes all of them systematically and
makes both themes first-class.

The root cause of the theme defects was two competing theme systems: `AppShell`
forced a `dark` class while legacy header dropdowns keyed off `html.dark` with
hardcoded `gray-*`/`bg-white` Tailwind classes, and the blocking theme-init
script existed but was never injected. The product token sheet is now the single
source of truth with a light block (default) and a dark block keyed off the
resolved html theme class; the init script runs before first paint; the forced
`dark` class is gone; and every shell component consumes semantic tokens only.

## Defects fixed (user-reported list)

1. **Header contrast** — header, org/profile triggers, separators, chevrons all
   use semantic tokens; verified readable in light and dark (evidence
   `01-header-default`, `07/08` focus states).
2. **Skip link** — rebuilt on the sr-only/focus-reveal pattern (`clip` +
   `clip-path`, fixed position, `--z-skip-link`); keyboard test covers hidden →
   Tab → visible → Enter → focus lands on `#main-content` (now `tabIndex={-1}`).
3. **Profile/org menus** — rebuilt on a shared menu primitive
   (`src/components/layout/menu.tsx`): identity header (name + secondary email),
   divider, 32px rows, left-aligned icons, full-row hover/focus, destructive
   Sign out revealed only on hover/focus, shared surface/border/radius/shadow/
   typography/stacking. No browser-default link styling, no indigo default rows.
   (Root cause of "Account" placeholder identity: sign-in used `router.push`,
   so the root-level SessionProvider kept its cached pre-login `null` session;
   sign-in now performs a full navigation with a same-origin-only callback.)
4. **Overlay and z-index architecture** — one documented z-scale in
   `product-tokens.css` (see table below); all shell overlays reference it; menus
   portal via Headless UI `anchor` (no `overflow: hidden` clipping) and carry
   `overview-dashboard product-shell` so portaled content inherits the active
   theme; modals use `--z-modal` + `--soc-scrim`. Stacking smoke test asserts a
   menu is topmost via `elementFromPoint` and a modal covers the sticky header.
5. **Filter/select controls** — one shared `.soc-select` treatment (32px height,
   `--radius-md`, 13px type, token chevron, hover/focus/disabled states) applied
   to every native select on Alerts, Assets, Identities, Vulnerabilities,
   Incidents, Audit log, and Members; search inputs aligned to the same height.
6. **Copy cleanup** — see copy inventory below; no `25+ shown`, no internal
   checkpoint terminology, no `N total`.
7. **Table hierarchy** — list pages no longer wrap tables in a titled card that
   duplicates the page title; the table sits in a single `soc-panel` boundary
   with the result count moved into the toolbar row.
8. **Navigation active state** — quieter `--soc-selected` fill with a 2px inset
   accent indicator, primary-text icon, `--soc-hover` hover, higher-contrast
   11px section headings (no more `--soc-text-dim` labels).
9. **Dual-theme rules** — light and dark token blocks in one sheet; no `dark:`
   classes, no `text-white`/`bg-white`, no white-alpha hovers, no dark-only
   shadows, no inline z-indexes in product shell components. Interaction fills,
   scrims, shadows, knobs, and select chevrons are all tokens.

## Centralized z-scale

| Token | Value | Layer |
|---|---|---|
| `--z-content` | 0 | base content |
| `--z-sticky` | 10 | sticky table header |
| `--z-header` | 20 | app header |
| `--z-sidebar` | 30 | sidebar + mobile scrim |
| `--z-dropdown` / `--z-popover` | 40 | menus, filter popovers, selects |
| `--z-drawer` | 50 | drawer (reserved for CP3+) |
| `--z-modal` | 60 | dialogs + scrim |
| `--z-toast` | 70 | toasts (reserved) |
| `--z-skip-link` | 100 | focused skip link |

## Token changes (`app/css/product-tokens.css`)

- Light theme is now the default `.product-shell` block; dark values apply under
  `html.dark .product-shell`. The old always-dark block and the unused
  `product-shell-light-ready` hook were removed.
- New semantic tokens (both themes): `--soc-menu`, `--soc-input-bg`,
  `--soc-hover`, `--soc-selected`, `--soc-scrim`, `--soc-knob`,
  `--soc-accent-contrast`, `--soc-text-disabled`, `--soc-destructive(-bg)`,
  `--soc-shadow-menu`, `--soc-shadow-modal`, `--soc-select-chevron`, plus the
  z-scale above.
- New shared classes: `.soc-select` (select/filter control) and the rebuilt
  `.soc-skip-link` (sr-only until `:focus-visible`).
- `.soc-btn-primary` text and toggle knobs no longer hardcode `#fff`.

## Removed hardcoded theme classes

- `src/components/layout/sidebar.tsx`: `bg-white/[0.06]`, `hover:bg-white/[0.04]`,
  `bg-black/40` scrim.
- `src/components/layout/header.tsx` now composes new `OrgMenu`/`ProfileMenu`/
  `ThemeToggle` (token-only) instead of `components/dropdown-org.tsx` /
  `components/dropdown-profile.tsx` (which carried `bg-white dark:bg-gray-800`,
  `text-gray-600 dark:text-gray-100`, `text-indigo-600`, `z-10`). The legacy
  components remain only in the retired pre-M3 shell (`components/ui/header.tsx`),
  which no route renders.
- `components/overview/unified-ui.tsx`: toggle knob `bg-white` → `--soc-knob`;
  menus/popovers `z-40`→`--z-dropdown`, dialogs `z-50`→`--z-modal`; dark-only
  rgba shadows → `--soc-shadow-menu/modal`; fixed rgba scrim → `--soc-scrim`.
- Justified exception: `text-white` on brand-colored integration tiles/avatars
  (fixed saturated backgrounds independent of theme).

## Copy inventory

| Before | After | Where |
|---|---|---|
| `25+ shown` / `N shown` | `First 25 alerts` / `N alerts` (exact) | Alerts |
| `N+ shown` | `First N assets` / `N assets` | Assets |
| `N+ shown` | `First N identities` / `N identities` | Identities |
| `N+ shown` | `First N findings` / `N findings` | Vulnerabilities |
| `N+ shown` | `First N entries` / `N entries` | Audit log |
| `N total` | `N incidents` | Incidents |
| `N total` | `N members` / `N invites` | Members |
| `ALERTS` section heading under "Security Alerts" title | removed (single table surface) | Alerts (same for other single-table pages) |
| "The investigations workspace arrives in Checkpoint 4" | "A dedicated investigations workspace is coming soon" + operational guidance | Investigations placeholder |

## Files added

| File | Purpose |
|---|---|
| `src/components/layout/menu.tsx` | Shared menu primitive: trigger, portal-safe panel, identity header, group label, divider, row classes (incl. destructive) |
| `src/components/layout/org-menu.tsx` | Organization switcher on the shared primitive |
| `src/components/layout/profile-menu.tsx` | Profile menu (identity header, Settings, Sign out) |
| `src/components/layout/theme-toggle.tsx` | Token-styled header light/dark toggle |
| `tests/e2e/m3-cp1-correction.spec.ts` | Skip link, theme switching, menu behavior, stacking smoke + both-theme state matrix |
| `docs/status/evidence/cp1-correction/{light,dark}/*.png` | 23-state component matrix per theme |

## Files modified

| File | Change |
|---|---|
| `app/css/product-tokens.css` | Dual-theme SSOT, z-scale, new tokens, `.soc-select`, sr-only skip link |
| `app/css/landing-overview.css` | `.soc-btn-primary` / `.soc-input` consume new tokens with fallbacks |
| `app/layout.tsx` | Inject blocking theme-init script; product font variables moved to `<html>` so portaled overlays inherit typography |
| `app/overview/layout.tsx` | Dropped duplicate font declarations |
| `src/components/layout/app-shell.tsx` | Removed forced `dark` class; `main` focusable for skip link |
| `src/components/layout/header.tsx` | New menus + theme toggle; `--z-header`; token-only states |
| `src/components/layout/sidebar.tsx` | Token hover/selected, inset indicator, readable section headings, token scrim |
| `src/components/layout/index.ts` | Export new components |
| `components/ui/icon.tsx` | Added `checkmark-outline`, `log-out-outline` |
| `components/auth/signin-form.tsx` | Full navigation after login (fixes null session in header); same-origin callback guard |
| `components/overview/unified-ui.tsx` | Control height 32px; z/shadow/scrim/knob tokens; dialogs carry theme scope classes |
| `app/overview/{alerts,assets,identities,vulnerabilities,incidents}/page.tsx` | Hierarchy cleanup, `.soc-select`, exact counts |
| `app/overview/settings/audit/page.tsx`, `app/overview/administration/members/page.tsx` | Same treatment |
| `app/overview/settings/page.tsx` | Toggle knob token |
| `app/overview/investigations/page.tsx` | Copy rewrite (no internal jargon) |
| `tests/e2e/m3-cp1-shell.spec.ts` | Updated placeholder copy assertion |

## Architectural decisions

- **One token sheet, theme by html class.** Light is the default block; dark
  overrides under `html.dark`. Components never branch on theme.
- **Portaled overlays carry the theme scope.** Any Headless UI portal root gets
  `overview-dashboard product-shell` classes so tokens resolve outside the
  AppShell subtree.
- **Semantic z-scale as tokens.** Components reference `var(--z-*)` only;
  arbitrary values are prohibited.
- **Native selects styled via `.soc-select`** rather than a custom listbox —
  CP1 scope is visual consistency; a composed FilterSelect belongs to CP2.

## Deviations from plan

- The sign-in navigation change (`router.push` → `window.location.assign`) was
  not in the defect list but was the root cause of the placeholder identity in
  the header/profile menu; fixed minimally with a same-origin guard.
- The header regained a compact theme toggle (allowed scope) because both themes
  are first-class and reviewers need to switch quickly; Settings retains the
  three-way (light/dark/system) control.

## Open risks

- Native `<select>` popups are OS-rendered: the open-dropdown state cannot be
  screenshotted or themed; the CP2 FilterSelect will replace them where option
  styling matters.
- Legacy `components/{dropdown-org,dropdown-profile,theme-toggle,ui/header,ui/sidebar}.tsx`
  still contain hardcoded theme classes but are rendered by no route; they are
  retirement candidates for the `unified-ui` decomposition track.
- `evidence/m3-cp1-*.png` (old shell spec) were regenerated in light theme since
  the default system theme now resolves honestly.

## Tests executed

- `pnpm typecheck` — pass
- `pnpm lint` — pass (0 warnings)
- `pnpm test:unit` — 37 passed (9 files)
- `pnpm exec playwright test` — full e2e suite, **14 passed** (demo login, M1
  acceptance, M2 workflow, security headers, M3 CP1 shell, M3 CP1 correction ×
  behavior + light/dark state matrices)
- Evidence: `docs/status/evidence/cp1-correction/{light,dark}/01…23-*.png`

## Acceptance criteria status

| Criterion | Status |
|---|---|
| 1. Header readable in both themes | ✅ |
| 2. Skip link invisible until keyboard focus | ✅ (Playwright-verified) |
| 3. Menus look like polished product menus | ✅ |
| 4. One documented stacking model | ✅ (token z-scale) |
| 5. No overlay collision in screenshots | ✅ (`elementFromPoint` asserted) |
| 6. Search/filter controls share styling | ✅ (`.soc-select` + 32px controls) |
| 7. No white-on-white / dark-on-dark text | ✅ |
| 8. No debug/placeholder copy | ✅ (inventory above) |
| 9. Alerts page no repeated nested headings | ✅ |
| 10. Navigation states professional | ✅ |
| 11. Component states have light+dark evidence | ✅ (23 states × 2 themes) |
| 12. Playwright covers skip link, theme, menus, stacking | ✅ |
| 13. Existing workflows green | ✅ (full suite 14/14) |
| 14. Canvas + status report updated | ✅ |
| 15. Human-only commit metadata | ✅ (verified post-commit) |

## Next recommended step

CP1 visual review of the correction evidence (both themes). CP2 (shared
DataTable / FilterBar / URL state) remains blocked until CP1 is approved. The
open recovery-plan question (restoring SOC IA depth with maturity states)
also still awaits a product decision.

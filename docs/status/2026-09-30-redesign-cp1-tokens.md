# Portal redesign CP1 — design tokens

- **Date:** 2026-09-30
- **Milestone / checkpoint:** Portal UI redesign, CP1 of CP0–CP9
- **Branch / commit:** dev
- **Status:** Complete

## Objective

Give the redesign one source of truth for type, spacing, radius, surfaces,
elevation, materials, motion and semantic colour, without changing any
palette value.

## Scope

In scope: `globals.css`, root layout font loading, theme preset defaults.
Out of scope: component restyling (CP2+).

## What was implemented

Tokens (all in `src/app/globals.css`, light and dark):

| Group | Tokens / utilities |
| --- | --- |
| Surfaces | `bg-canvas` (grouped page background, derived from `--muted`/`--background` so presets follow), `border-separator` |
| Severity | `severity-{critical,high,medium,low,info}` fills and `severity-*-text` AA text shades (the red/orange/amber/blue 600 and 700 shades already used ad hoc) |
| Status | `info`, `info-text`, `success-text`, `warning-text`, `destructive-text` |
| Type | `text-large-title`, `title-1..3`, `headline`, `body`, `callout`, `footnote`, `caption`, `metric`, each with size-specific tracking/leading/weight; stock `text-xs..4xl` gain matching tracking |
| Radius | concentric scale from `--radius`: `xs, sm, md, lg, xl, 2xl, 3xl, 4xl` (additive above `xl` instead of multiplicative) |
| Elevation | `shadow-card`, `shadow-raised`, `shadow-overlay` (dark mode uses a top highlight instead of a drop shadow for cards) |
| Rhythm | `--gutter` (16/24/32px by breakpoint) with `px-gutter`, `-mx-gutter`; `--section-gap` with `gap-section`; `--header-height`, `--tab-bar-height` |
| Materials | `material-chrome` (bars), `material-thick` (menus, popovers, toasts); solid under `prefers-reduced-transparency` and `prefers-contrast: more` |
| Motion | `ease-standard`, `ease-sheet`; `pressable` (scale 0.97 on pointer-down); `scroll-fade-x` edge mask |
| Accessibility | global focus-visible outline safety net; reduced motion keeps fades but zeroes tw-animate slide/zoom/rotate and press scaling; theme view-transition disabled under reduced motion |

Font: UI now uses the system stack (SF Pro on Apple platforms). Geist Sans is
no longer downloaded. Geist Mono is kept for code and IDs and is now actually
applied: its variable moved to `<html>`, and `--font-mono` references it
(previously it named a family that next/font never registers, so it fell
back).

## Files added

- `docs/status/2026-09-30-redesign-cp1-tokens.md`

## Files modified

- `src/app/globals.css`
- `src/app/layout.tsx`
- `src/lib/theme-presets.ts`, `src/lib/theme-preset-defaults.ts`

## Architectural decisions

- `--background` stays white and remains the base for inputs and popovers; the
  grouped page tone is a new `--canvas` token so existing components keep
  working until restyled.
- Presets no longer carry font, shadow, spacing or letter-spacing keys.
  Minimal named fonts that were never loaded (Inter, JetBrains Mono, Source
  Serif). Colours and radius still vary per preset.
- Removed the unused `faded-bottom` utility (it used `hsl()` around an OKLCH
  variable, so it never rendered correctly).

## Deviations from plan

None.

## Risks

- System fonts differ slightly in width across platforms; covered by the
  overflow suite at three widths.

## Test results

- `tsc --noEmit`: pass
- `eslint .`: pass
- `next build`: pass
- `playwright test`: 207 passed, no new overflow, no stale baseline entries

## Acceptance status

All CP1 items met. Palette values are byte-identical to CP0.

## Next recommended step

CP2 — restyle `src/components/ui/*` onto these tokens and add the shared
patterns (PageHeader, SegmentedControl, ResponsiveDialog, state components,
ResponsiveTable, FilterSheet).

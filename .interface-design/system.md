# SOC Portal — Interface Design System
Direction: **Data & Analysis + Utility & Function**

## Intent
Precision analytical instrument for SOC portal. C-level + analyst audience.
Every element earns its place. Numbers lead, color signals, layout recedes.
Two themes: zinc-clean light · near-black dark. Toggle preserved.

## Palette

### Light (default)
```
bg:           #f4f5f7
surface:      #ffffff
raised:       #f9fafb
overlay:      #f3f4f6
border:       #e5e7eb
border-mid:   #d1d5db
text:         #111827
text-sec:     #4b5563
text-muted:   #9ca3af
text-dim:     #d1d5db
accent:       #2563eb
accent-bg:    #eff6ff
```

### Dark
```
bg:           #0d0f14
surface:      #161b26
raised:       #1e2535
overlay:      #252d40
border:       rgba(255,255,255,0.07)
border-mid:   rgba(255,255,255,0.12)
text:         #e2e8f0
text-sec:     #94a3b8
text-muted:   #64748b
accent:       #3b82f6
accent-bg:    rgba(59,130,246,0.10)
```

### Severity (adaptive per theme)
```
critical: #ef4444 light / #f87171 dark
high:     #f97316 / #fb923c
medium:   #d97706 / #fbbf24
low:      #16a34a / #4ade80
```

## CSS Architecture
- Variables defined in `.overview-dashboard {}` (light default)
- Dark overrides in `.dark .overview-dashboard {}`
- Token prefix: `--soc-*` (primary) with legacy `--color-sot-*` aliases
- Tokens in `@theme` + `app/css/landing-overview.css` (SOC section; imported from `app/css/style.css`)

## Components
| Class | Purpose |
|---|---|
| `.soc-card` | Surface with border (1rem pad, 0.5rem radius) |
| `.soc-label` | 11px/600/tracked/uppercase section label |
| `.soc-metric-lg` | 2.5rem/800 primary number |
| `.soc-metric-sm` | 1.375rem/700 secondary number |
| `.soc-badge` | 11px pill badge (use `soc-badge-[severity]`) |
| `.soc-btn` | Button base (use `-primary`, `-secondary`) |
| `.soc-table` | Semantic data table |
| `.soc-progress-track` / `.soc-progress-fill` | 3px track bar |
| `.soc-severity-bar` | 2px left accent for list rows |
| `.soc-dot` | 6px status dot |
| `.soc-live-dot` | Pulsing green live indicator |
| `.soc-risk-bar` | Gradient risk spectrum bar |
| `.soc-link` | Accent-colored inline link |
| `.soc-trend-up/down/stable` | Colored delta text |
| `.soc-divider` | 1px horizontal separator |

## Layout Patterns
- Page: `max-w-7xl mx-auto px-6 py-6`
- Page header: label → h1 → subtext, with action buttons right
- KPI strip: `grid grid-cols-2 lg:grid-cols-4 gap-3`
- Main grid: `grid grid-cols-12` (8+4 split typical)
- Cards: `soc-card p-0` + inner header with border-b for sections

## Typography
- Section label: `.soc-label` (11px, uppercase, tracked, muted)
- Page title: `text-xl font-bold tracking-tight`
- Body: 13px/400, line-height 1.5
- Table header: 11px/600/uppercase
- Numbers: tabular-nums, font-bold

## Interaction
- Hover rows: inline `onMouseEnter/Leave` with `var(--soc-raised)` bg
- Expand rows: inline chevron rotation `transform: rotate(180deg)`
- Modals: `rgba(0,0,0,0.5)` backdrop + `backdrop-filter: blur(4px)`
- Transitions: `transition-colors`, 0.1–0.12s

## Theme System
- `ThemeToggle` in header sets `dark` class on `<html>` via `@/lib/theme`
- Layout does NOT force dark (no `dark` class on wrapper)
- CSS adapts via `.dark .overview-dashboard` selector

'use client'

import {
  Description,
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from '@headlessui/react'
import { ReactNode, useEffect, useRef, useState } from 'react'

// ─── Shared Types ─────────────────────────────────────────────────────────────

type HeaderAction = {
  id: string
  label: string
  variant?: 'primary' | 'secondary'
  onClick?: () => void
}

type KpiItem = {
  label: string
  value: string | number
  sub?: string
  tone?: 'default' | 'accent' | 'critical' | 'high' | 'medium' | 'low'
}

type FilterItem = {
  id: string
  label: string
}

// ─── Tone → CSS class map ─────────────────────────────────────────────────────
// Replaces the inline `toneToColor` record + style={{ color: toneToColor[…] }}.

const toneClass: Record<NonNullable<KpiItem['tone']>, string> = {
  default:  'text-[color:var(--soc-text)]',
  accent:   'text-[color:var(--soc-accent)]',
  critical: 'text-[color:var(--soc-critical)]',
  high:     'text-[color:var(--soc-high)]',
  medium:   'text-[color:var(--soc-medium)]',
  low:      'text-[color:var(--soc-low)]',
}

/** Shared control height applied via className. */
export const overviewControlHeight = 'h-9 min-h-9 box-border' as const

// ─── OverviewPageShell ────────────────────────────────────────────────────────

export function OverviewPageShell({ children }: { children: ReactNode }) {
  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-6 soc-fade-in">
      {children}
    </div>
  )
}

// ─── OverviewPageHeader ───────────────────────────────────────────────────────

export function OverviewPageHeader({
  section,
  title,
  description,
  actions = [],
}: {
  section: string
  title: string
  description: string
  actions?: HeaderAction[]
}) {
  return (
    <div className="flex items-start justify-between mb-5">
      <div>
        <p className="soc-label mb-1">{section}</p>
        <h1 className="text-xl font-bold tracking-tight mb-1.5 text-[color:var(--soc-text)]">
          {title}
        </h1>
        <p className="text-sm text-[color:var(--soc-text-secondary)]">
          {description}
        </p>
      </div>
      {actions.length > 0 && (
        <div className="flex items-center gap-2 mt-1">
          {actions.map((action) => (
            <button
              key={action.id}
              className={`soc-btn ${action.variant === 'secondary' ? 'soc-btn-secondary' : 'soc-btn-primary'}`}
              onClick={action.onClick}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── OverviewKpiRow ───────────────────────────────────────────────────────────

export function OverviewKpiRow({
  items,
  columns = 4,
}: {
  items: KpiItem[]
  columns?: 3 | 4 | 5
}) {
  const gridClass =
    columns === 3
      ? 'grid grid-cols-1 md:grid-cols-3 gap-3 mb-5'
      : columns === 5
        ? 'grid grid-cols-2 lg:grid-cols-5 gap-3 mb-5'
        : 'grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5'

  return (
    <div className={gridClass}>
      {items.map((item) => (
        <div key={item.label} className="soc-card">
          <p className="soc-label mb-2">{item.label}</p>
          <p className={`soc-metric-sm ${toneClass[item.tone ?? 'default']}`}>
            {item.value}
          </p>
          {item.sub && (
            <p className="text-xs mt-1 text-[color:var(--soc-text-muted)]">
              {item.sub}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}

// ─── OverviewToolbar ──────────────────────────────────────────────────────────

export function OverviewToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  filters = [],
  activeFilter,
  onFilterChange,
  rightMeta,
}: {
  searchValue?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
  filters?: FilterItem[]
  activeFilter?: string
  onFilterChange?: (id: string) => void
  rightMeta?: ReactNode
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap mb-4">
      {typeof searchValue === 'string' && onSearchChange && (
        <input
          className={`soc-input text-xs w-60 ${overviewControlHeight}`}
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      )}
      {filters.map((filter) => {
        const active = activeFilter === filter.id
        return (
          <button
            key={filter.id}
            className={`soc-btn text-xs ${active ? 'soc-btn-primary' : 'soc-btn-secondary'}`}
            onClick={() => onFilterChange?.(filter.id)}
          >
            {filter.label}
          </button>
        )
      })}
      {rightMeta}
    </div>
  )
}

// ─── OverviewTableToolbar ─────────────────────────────────────────────────────

export function OverviewTableToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  end,
}: {
  searchValue: string
  onSearchChange: (value: string) => void
  searchPlaceholder?: string
  end: ReactNode
}) {
  return (
    <div className="mb-4 flex w-full flex-col gap-2 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
      <div className="order-1 flex w-full min-w-0 flex-col items-stretch gap-2 lg:order-2 lg:ml-auto lg:w-auto lg:max-w-full lg:shrink lg:items-end xl:max-w-[52%]">
        {end}
      </div>
      <div className="order-2 w-full min-w-0 lg:order-1 lg:max-w-md lg:flex-1">
        <input
          className={`soc-input w-full text-sm leading-none ${overviewControlHeight}`}
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </div>
  )
}

// ─── OverviewToggle ───────────────────────────────────────────────────────────

export function OverviewToggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (next: boolean) => void
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`overview-toggle flex min-w-0 max-w-full flex-[1_1_12rem] items-center justify-between gap-2 rounded-md border
        border-[color:var(--soc-border-mid)] bg-[color:var(--soc-surface)]
        text-left leading-none transition-colors
        sm:max-w-[min(100%,14rem)] lg:flex-[0_1_auto] lg:max-w-[14rem] px-3 ${overviewControlHeight}`}
    >
      <span
        className="min-w-0 truncate text-xs font-medium text-[color:var(--soc-text)]"
        aria-hidden="true"
      >
        {label}
      </span>
      <span
        className={`inline-flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors ${
          checked
            ? 'justify-end bg-[color:var(--soc-accent)]'
            : 'justify-start bg-[color:var(--soc-border-mid)]'
        }`}
        aria-hidden
      >
        <span className="pointer-events-none block h-[18px] w-[18px] shrink-0 translate-y-px rounded-full bg-white shadow-sm transition-transform duration-200 ease-out" />
      </span>
    </button>
  )
}

// ─── OverviewNestedStatCard ───────────────────────────────────────────────────

export function OverviewNestedStatCard({
  label,
  value,
  sub,
  accentColor,
  variant = 'default',
}: {
  label: string
  value: string
  sub?: string
  /** Use a CSS var string, e.g. "var(--soc-critical)" */
  accentColor?: string
  variant?: 'default' | 'subtle'
}) {
  const subtle = variant === 'subtle'
  return (
    <div className="soc-card-raised text-center">
      <p className={`soc-label mb-0.5 ${subtle ? 'opacity-90' : ''}`}>{label}</p>
      <p
        className={`tabular-nums ${subtle ? 'text-sm font-semibold' : 'text-base font-bold sm:text-lg'}`}
        style={accentColor ? { color: accentColor } : undefined}
      >
        {value}
      </p>
      {sub && (
        <p className="mt-0.5 text-[0.65rem] leading-snug text-[color:var(--soc-text-muted)]">
          {sub}
        </p>
      )}
    </div>
  )
}

// ─── OverviewIntegrationTile ──────────────────────────────────────────────────

export function OverviewIntegrationTile({
  title,
  subtitle,
  icon,
  iconBackground,
  statusLabel,
  statusColor,
  kpiLeft,
  kpiRight,
  regions,
  alerts,
  footerMeta,
  footerAction,
}: {
  title: string
  subtitle: string
  icon: ReactNode
  iconBackground: string
  statusLabel: string
  /** CSS color string, e.g. "var(--soc-low)" */
  statusColor: string
  kpiLeft: { label: string; value: string }
  kpiRight: { label: string; value: string }
  regions?: string[]
  alerts?: { critical?: number; high?: number; medium?: number }
  footerMeta: string
  footerAction?: ReactNode
}) {
  const showAlerts =
    alerts && (alerts.critical || 0) + (alerts.high || 0) + (alerts.medium || 0) > 0

  return (
    <div className="soc-card flex flex-col p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg text-lg leading-none text-white"
            style={{ backgroundColor: iconBackground }}
          >
            {icon}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium leading-snug text-[color:var(--soc-text)]">
              {title}
            </p>
            <p className="text-xs leading-snug text-[color:var(--soc-text-muted)]">
              {subtitle}
            </p>
          </div>
        </div>
        <span
          className="shrink-0 text-[0.65rem] font-medium capitalize tracking-wide"
          style={{ color: statusColor }}
        >
          {statusLabel}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="soc-card-raised text-center">
          <p className="soc-label mb-1 opacity-90">{kpiLeft.label}</p>
          <p className="text-sm font-semibold tabular-nums text-[color:var(--soc-text)]">
            {kpiLeft.value}
          </p>
        </div>
        <div className="soc-card-raised text-center">
          <p className="soc-label mb-1 opacity-90">{kpiRight.label}</p>
          <p className="text-sm font-semibold tabular-nums text-[color:var(--soc-text)]">
            {kpiRight.value}
          </p>
        </div>
      </div>

      {regions && regions.length > 0 && (
        <div className="mt-3">
          <p className="soc-label mb-1.5">Active regions</p>
          <div className="flex flex-wrap gap-1">
            {regions.map((r) => (
              <span
                key={r}
                className="rounded-md border border-[color:var(--soc-border)] bg-[color:var(--soc-surface)] px-2 py-0.5 text-[0.65rem] font-medium text-[color:var(--soc-text-secondary)]"
              >
                {r}
              </span>
            ))}
          </div>
        </div>
      )}

      {showAlerts && (
        <div className="mt-3">
          <p className="soc-label mb-1.5">Active alerts</p>
          <div className="flex flex-wrap gap-1">
            {(alerts!.critical ?? 0) > 0 && (
              <span className="soc-badge soc-badge-critical rounded-md px-2 py-0.5 text-[0.65rem]">
                {alerts!.critical} critical
              </span>
            )}
            {(alerts!.high ?? 0) > 0 && (
              <span className="soc-badge soc-badge-high rounded-md px-2 py-0.5 text-[0.65rem]">
                {alerts!.high} high
              </span>
            )}
            {(alerts!.medium ?? 0) > 0 && (
              <span className="soc-badge soc-badge-medium rounded-md px-2 py-0.5 text-[0.65rem]">
                {alerts!.medium} medium
              </span>
            )}
          </div>
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[color:var(--soc-border)] pt-3">
        <span className="text-xs text-[color:var(--soc-text-muted)]">{footerMeta}</span>
        {footerAction}
      </div>
    </div>
  )
}

// ─── OverviewComplianceTile ───────────────────────────────────────────────────

type StatusVariant = 'compliant' | 'partial' | 'atrisk'

const complianceBadgeClass: Record<StatusVariant, string> = {
  compliant: 'border-[color:var(--soc-low)]   bg-[color:var(--soc-low-bg)]      text-[color:var(--soc-low)]',
  partial:   'border-[color:var(--soc-medium)] bg-[color:var(--soc-medium-bg)]  text-[color:var(--soc-medium)]',
  atrisk:    'border-[color:var(--soc-critical)] bg-[color:var(--soc-critical-bg)] text-[color:var(--soc-critical)]',
}

export function OverviewComplianceTile({
  title,
  auditLine,
  scorePercent,
  statusLabel,
  statusVariant,
  breakdown,
  footerMeta,
  footerAction,
}: {
  title: string
  auditLine: string
  scorePercent: number
  statusLabel: string
  statusVariant: StatusVariant
  breakdown: { implemented: number; inProgress: number; notStarted: number }
  footerMeta?: string
  footerAction?: ReactNode
}) {
  const total = breakdown.implemented + breakdown.inProgress + breakdown.notStarted
  const safeScore = Math.max(0, Math.min(100, Number.isFinite(scorePercent) ? scorePercent : 0))

  return (
    <div className="soc-card flex flex-col p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium leading-snug text-[color:var(--soc-text)]">{title}</p>
          <p className="mt-0.5 text-xs leading-snug text-[color:var(--soc-text-muted)]">{auditLine}</p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
          <span className="text-lg font-semibold tabular-nums text-[color:var(--soc-accent-text)]">
            {safeScore}%
          </span>
          <span className={`rounded-md border px-2 py-0.5 text-[0.65rem] font-medium capitalize ${complianceBadgeClass[statusVariant]}`}>
            {statusLabel}
          </span>
        </div>
      </div>

      <div className="mt-3">
        <OverviewProgressBar value={safeScore} showValue={false} />
        <div className="mt-1.5 flex items-center justify-between gap-2 text-xs text-[color:var(--soc-text-muted)]">
          <span>{safeScore}% controls implemented</span>
          <span className="tabular-nums">{breakdown.implemented}/{total}</span>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className="soc-card-raised text-center">
          <p className="text-sm font-semibold tabular-nums text-[color:var(--soc-low)]">
            {breakdown.implemented}
          </p>
          <p className="soc-label mt-1 opacity-90">Implemented</p>
        </div>
        <div className="soc-card-raised text-center">
          <p className="text-sm font-semibold tabular-nums text-[color:var(--soc-medium)]">
            {breakdown.inProgress}
          </p>
          <p className="soc-label mt-1 opacity-90">In progress</p>
        </div>
        <div className="soc-card-raised text-center">
          <p className="text-sm font-semibold tabular-nums text-[color:var(--soc-critical)]">
            {breakdown.notStarted}
          </p>
          <p className="soc-label mt-1 opacity-90">Not started</p>
        </div>
      </div>

      {(footerMeta || footerAction) && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[color:var(--soc-border)] pt-3">
          {footerMeta && (
            <span className="text-xs text-[color:var(--soc-text-muted)]">{footerMeta}</span>
          )}
          {footerAction}
        </div>
      )}
    </div>
  )
}

// ─── OverviewSection ──────────────────────────────────────────────────────────

export function OverviewSection({
  title,
  right,
  children,
  flush = false,
  headerClassName = '',
}: {
  title: string
  right?: ReactNode
  children: ReactNode
  /**
   * When true, the card has no padding (content fills edge-to-edge).
   * Renamed from the confusing `padded` prop whose logic was inverted.
   */
  flush?: boolean
  headerClassName?: string
}) {
  return (
    <div className={`soc-card ${flush ? 'p-0' : ''} overflow-hidden`}>
      <div className={`px-4 py-3 border-b border-[color:var(--soc-border)] flex items-center justify-between ${headerClassName}`}>
        <p className="soc-label">{title}</p>
        {right}
      </div>
      {children}
    </div>
  )
}

// ─── OverviewAlert ────────────────────────────────────────────────────────────

const alertClass: Record<
  'info' | 'attention' | 'warning' | 'critical' | 'success',
  { wrap: string; title: string }
> = {
  info:      { wrap: 'bg-[color:var(--soc-accent-bg)]   border-[color:var(--soc-accent)]',   title: 'text-[color:var(--soc-accent-text)]' },
  attention: { wrap: 'bg-[color:var(--soc-medium-bg)]   border-[color:var(--soc-medium)]',   title: 'text-[color:var(--soc-medium)]' },
  warning:   { wrap: 'bg-[color:var(--soc-high-bg)]     border-[color:var(--soc-high)]',     title: 'text-[color:var(--soc-high)]' },
  critical:  { wrap: 'bg-[color:var(--soc-critical-bg)] border-[color:var(--soc-critical)]', title: 'text-[color:var(--soc-critical)]' },
  success:   { wrap: 'bg-[color:var(--soc-low-bg)]      border-[color:var(--soc-low)]',      title: 'text-[color:var(--soc-low)]' },
}

export function OverviewAlert({
  tone,
  title,
  description,
}: {
  tone: 'info' | 'attention' | 'warning' | 'critical' | 'success'
  title: string
  description?: string
}) {
  const cls = alertClass[tone]
  return (
    <div className={`rounded-lg px-4 py-3 border ${cls.wrap}`}>
      <p className={`text-sm font-semibold ${cls.title}`}>{title}</p>
      {description && (
        <p className="text-xs mt-1 text-[color:var(--soc-text-secondary)]">{description}</p>
      )}
    </div>
  )
}

// ─── OverviewProgressBar ──────────────────────────────────────────────────────

export function OverviewProgressBar({
  value,
  color,
  showValue = true,
}: {
  value: number
  /** Optional CSS color override, e.g. "var(--soc-critical)". Defaults to accent. */
  color?: string
  showValue?: boolean
}) {
  // FIX: guard NaN — if value is not a finite number, fall back to 0
  const safe = Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 0
  return (
    <div className="flex items-center gap-2">
      <div className="soc-progress-track flex-1">
        <div
          className="soc-progress-fill"
          style={{
            width: `${safe}%`,
            // Only set backgroundColor if a custom color is provided;
            // the CSS class default (var(--soc-accent)) handles the base case.
            ...(color ? { backgroundColor: color } : {}),
          }}
        />
      </div>
      {showValue && (
        <span className="text-xs font-semibold tabular-nums text-[color:var(--soc-text-secondary)] min-w-[2.4rem]">
          {safe}%
        </span>
      )}
    </div>
  )
}

// ─── OverviewStatusTile ───────────────────────────────────────────────────────

const statusTileClass: Record<
  'healthy' | 'warning' | 'error' | 'partial',
  { value: string; badge: string; label: string }
> = {
  healthy: { value: 'text-[color:var(--soc-low)]',      badge: 'text-[color:var(--soc-low)]      bg-[color:var(--soc-low-bg)]',      label: 'HEALTHY'  },
  warning: { value: 'text-[color:var(--soc-high)]',     badge: 'text-[color:var(--soc-high)]     bg-[color:var(--soc-high-bg)]',     label: 'WARNING'  },
  error:   { value: 'text-[color:var(--soc-critical)]', badge: 'text-[color:var(--soc-critical)] bg-[color:var(--soc-critical-bg)]', label: 'ERROR'    },
  partial: { value: 'text-[color:var(--soc-medium)]',   badge: 'text-[color:var(--soc-medium)]   bg-[color:var(--soc-medium-bg)]',   label: 'PARTIAL'  },
}

export function OverviewStatusTile({
  title,
  value,
  status,
  sub,
}: {
  title: string
  value: string
  status: 'healthy' | 'warning' | 'error' | 'partial'
  sub?: string
}) {
  const cls = statusTileClass[status]
  return (
    <div className="soc-card">
      <div className="flex items-center justify-between mb-2">
        <p className="soc-label">{title}</p>
        <span className={`soc-badge ${cls.badge}`}>{cls.label}</span>
      </div>
      <p className={`soc-metric-sm ${cls.value}`}>{value}</p>
      {sub && (
        <p className="text-xs mt-1 text-[color:var(--soc-text-muted)]">{sub}</p>
      )}
    </div>
  )
}

// ─── OverviewPagination ───────────────────────────────────────────────────────

export function OverviewPagination({
  page,
  totalPages,
  totalItems,
  onPageChange,
}: {
  page: number
  totalPages: number
  totalItems?: number
  onPageChange: (page: number) => void
}) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
  return (
    <div className="px-4 py-3 border-t border-[color:var(--soc-border)] flex items-center justify-between">
      <span className="text-xs text-[color:var(--soc-text-muted)]">
        {typeof totalItems === 'number'
          ? `Total ${totalItems}${totalPages > 1 ? ` · Page ${page} of ${totalPages}` : ''}`
          : `Page ${page} of ${totalPages}`}
      </span>
      <div className="flex items-center gap-1.5">
        <button
          className="soc-btn soc-btn-secondary text-xs"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
        >
          Prev
        </button>
        {pages.map((p) => (
          <button
            key={p}
            className={`soc-btn text-xs ${
              p === page
                ? 'soc-btn-primary'
                : 'soc-btn-secondary'
            }`}
            onClick={() => onPageChange(p)}
          >
            {p}
          </button>
        ))}
        <button
          className="soc-btn soc-btn-secondary text-xs"
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  )
}

// ─── OverviewRowsPerPageMenu ──────────────────────────────────────────────────

export function OverviewRowsPerPageMenu({
  value,
  options = [5, 10],
  onChange,
  label = 'Rows per page',
  optionLabel,
  compact = false,
}: {
  value: number
  options?: number[]
  onChange: (n: number) => void
  label?: string
  optionLabel?: (n: number) => string
  compact?: boolean
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const selectedLabel = optionLabel ? optionLabel(value) : `${value}`

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`inline-flex w-full items-center gap-2 rounded-md border border-[color:var(--soc-border-mid)]
          bg-[color:var(--soc-surface)] transition-colors
          ${compact ? 'px-2.5 lg:min-w-[4.5rem] lg:max-w-[4.5rem]' : 'px-3.5 lg:min-w-[10.5rem]'}
          lg:w-auto ${compact ? 'h-8 min-h-8' : overviewControlHeight}`}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        {label ? <span className="text-xs font-medium text-[color:var(--soc-text-muted)]">{label}</span> : null}
        <span className="text-sm font-semibold tabular-nums min-w-[1.25rem] text-[color:var(--soc-text)]">
          {selectedLabel}
        </span>
        <svg
          width="14" height="14" viewBox="0 0 12 12" fill="none"
          className="ml-auto shrink-0 text-[color:var(--soc-text-muted)]"
          aria-hidden
        >
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute right-0 mt-1 min-w-full rounded-md border border-[color:var(--soc-border-mid)]
            bg-[color:var(--soc-surface)] py-1 z-40 overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.14)]"
          role="listbox"
        >
          {options.map((n) => (
            <button
              key={n}
              type="button"
              role="option"
              aria-selected={n === value}
              className={`w-full text-left px-3 py-2.5 text-sm font-medium transition-colors
                ${n === value
                  ? 'text-[color:var(--soc-accent-text)] bg-[color:var(--soc-accent-bg)]'
                  : 'text-[color:var(--soc-text)] hover:bg-[color:var(--soc-raised)]'
                }`}
              onClick={() => { onChange(n); setOpen(false) }}
            >
              {optionLabel ? optionLabel(n) : `${n} per page`}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── OverviewFilterMenu ───────────────────────────────────────────────────────

export type OverviewFilterMenuOption = { id: string; label: string; /** When set, options are grouped under this heading in the panel */ section?: string }

const OVERVIEW_FILTER_ALL_ID = '__overview_filter_all__'

function selectedToDraft(selected: string[], options: OverviewFilterMenuOption[]): string[] {
  const ids = new Set(options.map((o) => o.id))
  const valid = selected.filter((id) => ids.has(id))
  if (valid.length === 0) return []
  if (valid.length === options.length) return [OVERVIEW_FILTER_ALL_ID]
  return valid
}

function draftToAppliedIds(draft: string[], options: OverviewFilterMenuOption[]): string[] | null {
  if (draft.length === 0) return null
  if (draft.length === 1 && draft[0] === OVERVIEW_FILTER_ALL_ID) return options.map((o) => o.id)
  return draft.filter((id) => id !== OVERVIEW_FILTER_ALL_ID)
}

export function OverviewFilterMenu({
  options,
  selected,
  onApply,
}: {
  options: OverviewFilterMenuOption[]
  selected: string[]
  onApply: (next: string[]) => void
}) {
  const [open, setOpen] = useState(false)
  // FIX: memoize optionsKey outside of effect to avoid stale closure
  const optionsKey = options.map((o) => o.id).join(',')
  const [draft, setDraft] = useState<string[]>(() => selectedToDraft(selected, options))
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) setDraft(selectedToDraft(selected, options))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, selected, optionsKey])

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  const toggleAll = () => {
    setDraft((d) => (d.length === 1 && d[0] === OVERVIEW_FILTER_ALL_ID ? [] : [OVERVIEW_FILTER_ALL_ID]))
  }

  const toggleOption = (id: string) => {
    setDraft((d) => {
      const base = d.includes(OVERVIEW_FILTER_ALL_ID) ? [] : [...d]
      return base.includes(id) ? base.filter((x) => x !== id) : [...base, id]
    })
  }

  const allChecked = draft.length === 1 && draft[0] === OVERVIEW_FILTER_ALL_ID
  const canApply = draft.length > 0

  return (
    <div
      className="relative w-full min-w-0 sm:flex-1 lg:w-auto lg:shrink-0 lg:flex-none"
      ref={ref}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`inline-flex w-full items-center justify-center gap-2 rounded-md border
          border-[color:var(--soc-border-mid)] bg-[color:var(--soc-surface)] text-[color:var(--soc-text-secondary)]
          transition-colors lg:w-9 lg:min-w-[2.25rem] lg:max-w-[2.25rem] lg:gap-0 lg:px-0 ${overviewControlHeight}`}
        aria-label="Open filters"
        aria-expanded={open}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M4 6h16M7 12h10M10 18h4" strokeLinecap="round" />
        </svg>
        <span className="text-xs font-medium text-[color:var(--soc-text)] lg:sr-only">Filters</span>
      </button>

      {open && (
        <div
          className="absolute left-0 right-0 z-40 mt-1 max-h-[min(70vh,28rem)] overflow-y-auto
            rounded-lg border border-[color:var(--soc-border-mid)] bg-[color:var(--soc-surface)]
            shadow-[0_12px_40px_rgba(0,0,0,0.14)] sm:left-auto sm:right-0 sm:w-64"
          role="listbox"
        >
          <p className="soc-label px-3 pt-3 pb-1">Filters</p>
          <div className="px-2 pb-2 space-y-0.5">
            <label className="flex items-center gap-2.5 px-2 py-2 rounded-md cursor-pointer">
              <input
                type="checkbox"
                checked={allChecked}
                onChange={toggleAll}
                className="h-3.5 w-3.5 rounded border shrink-0 accent-[color:var(--soc-accent)] border-[color:var(--soc-border-mid)]"
              />
              <span className="text-sm font-medium text-[color:var(--soc-text)]">All</span>
            </label>
            {(() => {
              const hasSections = options.some((o) => o.section)
              if (!hasSections) {
                return options.map((opt) => (
                  <label
                    key={opt.id}
                    className="flex items-center gap-2.5 px-2 py-2 rounded-md cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={!allChecked && draft.includes(opt.id)}
                      onChange={() => toggleOption(opt.id)}
                      className="h-3.5 w-3.5 rounded border shrink-0 accent-[color:var(--soc-accent)] border-[color:var(--soc-border-mid)]"
                    />
                    <span className="text-sm text-[color:var(--soc-text)]">{opt.label}</span>
                  </label>
                ))
              }
              const order: string[] = []
              const bySection = new Map<string, OverviewFilterMenuOption[]>()
              for (const opt of options) {
                const key = opt.section ?? ''
                if (!bySection.has(key)) {
                  bySection.set(key, [])
                  order.push(key)
                }
                bySection.get(key)!.push(opt)
              }
              return order.map((sec) => (
                <div key={sec || '_ungrouped'} className="pt-1">
                  {sec ? (
                    <p className="soc-label px-2 pt-2 pb-1.5 text-[0.65rem] tracking-wide opacity-90">{sec}</p>
                  ) : null}
                  <div className="space-y-0.5">
                    {(bySection.get(sec) ?? []).map((opt) => (
                      <label
                        key={opt.id}
                        className="flex items-center gap-2.5 px-2 py-2 rounded-md cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={!allChecked && draft.includes(opt.id)}
                          onChange={() => toggleOption(opt.id)}
                          className="h-3.5 w-3.5 rounded border shrink-0 accent-[color:var(--soc-accent)] border-[color:var(--soc-border-mid)]"
                        />
                        <span className="text-sm text-[color:var(--soc-text)]">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))
            })()}
          </div>
          <div className="flex gap-2 px-3 py-2.5 border-t border-[color:var(--soc-border)]">
            <button
              type="button"
              className="soc-btn soc-btn-secondary flex-1 text-xs"
              onClick={() => setDraft([OVERVIEW_FILTER_ALL_ID])}
            >
              Clear
            </button>
            <button
              type="button"
              className="soc-btn soc-btn-primary flex-1 text-xs"
              disabled={!canApply}
              onClick={() => {
                const next = draftToAppliedIds(draft, options)
                if (!next) return
                onApply(next)
                setOpen(false)
              }}
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── OverviewDateRangeMenu ────────────────────────────────────────────────────

function formatOverviewDateLabel(iso: string) {
  if (!iso) return '…'
  const d = new Date(`${iso}T12:00:00`)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function OverviewDateRangeMenu({
  fromDate,
  toDate,
  onApply,
}: {
  fromDate: string
  toDate: string
  onApply: (from: string, to: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [draftFrom, setDraftFrom] = useState(fromDate)
  const [draftTo, setDraftTo] = useState(toDate)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) {
      setDraftFrom(fromDate)
      setDraftTo(toDate)
    }
  }, [open, fromDate, toDate])

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  const setPreset = (days: number) => {
    const n = new Date()
    const f = new Date()
    f.setDate(n.getDate() - days)
    setDraftFrom(f.toISOString().slice(0, 10))
    setDraftTo(n.toISOString().slice(0, 10))
  }

  return (
    <div
      className="relative w-full min-w-0 sm:flex-1 lg:w-auto lg:shrink-0 lg:flex-none"
      ref={ref}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`inline-flex w-full min-w-0 items-center justify-center gap-2 rounded-md border overflow-hidden
          border-[color:var(--soc-border-mid)] bg-[color:var(--soc-surface)] text-[color:var(--soc-text)]
          px-3 text-xs font-medium transition-colors
          lg:w-auto lg:min-w-[14rem] lg:max-w-max lg:justify-start lg:text-sm ${overviewControlHeight}`}
        aria-expanded={open}
      >
        <svg className="shrink-0" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
        </svg>
        <span className="min-w-0 truncate tabular-nums text-left">
          {formatOverviewDateLabel(fromDate)} – {formatOverviewDateLabel(toDate)}
        </span>
      </button>

      {open && (
        <div
          className="absolute right-0 mt-1 w-72 rounded-lg border border-[color:var(--soc-border-mid)]
            bg-[color:var(--soc-surface)] p-3 z-40 shadow-[0_12px_40px_rgba(0,0,0,0.14)]"
        >
          <p className="soc-label mb-2">Date range</p>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-[color:var(--soc-text-muted)]">
              From
              <input
                type="date"
                className="soc-input w-full mt-1 text-xs"
                value={draftFrom}
                onChange={(e) => setDraftFrom(e.target.value)}
              />
            </label>
            <label className="text-xs font-medium text-[color:var(--soc-text-muted)]">
              To
              <input
                type="date"
                className="soc-input w-full mt-1 text-xs"
                value={draftTo}
                onChange={(e) => setDraftTo(e.target.value)}
              />
            </label>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-3">
            <button type="button" className="soc-btn soc-btn-secondary text-xs" onClick={() => setPreset(7)}>Last 7d</button>
            <button type="button" className="soc-btn soc-btn-secondary text-xs" onClick={() => setPreset(30)}>Last 30d</button>
            <button type="button" className="soc-btn soc-btn-secondary text-xs" onClick={() => setPreset(90)}>Last 90d</button>
          </div>
          <div className="flex gap-2 mt-3 pt-3 border-t border-[color:var(--soc-border)]">
            <button type="button" className="soc-btn soc-btn-secondary flex-1 text-xs" onClick={() => setOpen(false)}>
              Cancel
            </button>
            <button
              type="button"
              className="soc-btn soc-btn-primary flex-1 text-xs"
              onClick={() => { onApply(draftFrom, draftTo); setOpen(false) }}
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── OverviewModal ────────────────────────────────────────────────────────────

function PanelCloseBtn({ onClose }: { onClose: () => void }) {
  return (
    <button
      type="button"
      aria-label="Close"
      onClick={onClose}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--soc-overlay)'; e.currentTarget.style.borderColor = 'var(--soc-border-mid)' }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--soc-border)' }}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: 28, height: 28, borderRadius: 6,
        border: '1px solid var(--soc-border)',
        background: 'transparent',
        color: 'var(--soc-text-muted)',
        cursor: 'pointer', flexShrink: 0,
        transition: 'background 0.1s, border-color 0.1s',
        outline: 'none',
      }}
    >
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M1 1l8 8M9 1L1 9" />
      </svg>
    </button>
  )
}

export function OverviewModal({
  open,
  title,
  subtitle,
  onClose,
  children,
  footer,
  maxWidth = 'max-w-lg',
}: {
  open: boolean
  title: string
  subtitle?: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  maxWidth?: string
}) {
  if (!open) return null

  return (
    <Dialog open onClose={onClose} className="relative z-50 overview-dashboard">
      <DialogBackdrop
        transition
        className="fixed inset-0 transition-opacity duration-150 ease-out data-[closed]:opacity-0"
        style={{ backgroundColor: 'rgba(0,0,0,0.52)', backdropFilter: 'blur(3px)' }}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <DialogPanel
          transition
          className={`relative flex w-full ${maxWidth} max-h-[90vh] flex-col overflow-hidden transition-all duration-150 ease-out data-[closed]:opacity-0 data-[closed]:scale-[0.97]`}
          style={{
            borderRadius: 10,
            border: '1px solid var(--soc-border-mid)',
            background: 'var(--soc-surface)',
            color: 'var(--soc-text)',
            boxShadow: '0 0 0 1px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.1), 0 20px 56px rgba(0,0,0,0.18)',
          }}
        >
          {/* ── Header ── */}
          <div
            style={{
              display: 'flex', alignItems: 'flex-start', gap: 16,
              padding: '22px 24px 22px 0',
              borderBottom: '1px solid var(--soc-border)',
              flexShrink: 0,
            }}
          >
            {/* Left accent bar */}
            <div style={{ width: 3, alignSelf: 'stretch', minHeight: 32, background: 'var(--soc-accent)', borderRadius: '0 3px 3px 0', flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              {subtitle ? (
                <Description as="p" className="soc-label" style={{ marginBottom: 6 }}>
                  {subtitle}
                </Description>
              ) : null}
              <DialogTitle
                style={{
                  fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em',
                  lineHeight: 1.25, color: 'var(--soc-text)', margin: 0,
                }}
              >
                {title}
              </DialogTitle>
            </div>
            <PanelCloseBtn onClose={onClose} />
          </div>

          {/* ── Body ── */}
          <div
            style={{
              flex: 1, overflowY: 'auto',
              padding: '24px 24px',
              fontSize: 13, lineHeight: 1.6,
              color: 'var(--soc-text)',
            }}
          >
            {children}
          </div>

          {/* ── Footer ── */}
          {footer ? (
            <div
              style={{
                flexShrink: 0,
                padding: '16px 24px',
                borderTop: '1px solid var(--soc-border)',
              }}
            >
              {footer}
            </div>
          ) : null}
        </DialogPanel>
      </div>
    </Dialog>
  )
}

// ─── OverviewStepModal ────────────────────────────────────────────────────────

export type WizardStep = {
  id: string
  title: string
  content: ReactNode
  canProceed?: () => boolean | Promise<boolean>
  /** Message shown in the footer when canProceed returns false. Use a function for dynamic messages. */
  validationHint?: string | (() => string)
}

export function OverviewStepModal({
  open,
  subtitle,
  steps,
  currentStep,
  maxWidth = 'max-w-4xl',
  onClose,
  onStepChange,
  onFinish,
}: {
  open: boolean
  subtitle?: string
  steps: WizardStep[]
  currentStep: number
  maxWidth?: string
  onClose: () => void
  onStepChange: (next: number) => void
  onFinish: () => void
}) {
  const [busy, setBusy] = useState(false)
  const active = steps[currentStep]
  const isFirst = currentStep === 0
  const isLast = currentStep === steps.length - 1

  // Sync guard evaluation for disabled state (all real guards are sync booleans)
  const guardResult = active?.canProceed?.()
  const isBlocked = typeof guardResult === 'boolean' ? !guardResult : false
  const validationHint = isBlocked
    ? (typeof active?.validationHint === 'function' ? active.validationHint() : active?.validationHint)
    : undefined

  const runGuard = async (then: () => void) => {
    if (busy) return
    const guard = active?.canProceed
    if (guard) {
      setBusy(true)
      try { if (!(await guard())) return }
      finally { setBusy(false) }
    }
    then()
  }

  if (!open) return null

  return (
    <Dialog open onClose={onClose} className="relative z-50 overview-dashboard">
      <DialogBackdrop
        transition
        className="fixed inset-0 transition-opacity duration-150 ease-out data-[closed]:opacity-0"
        style={{ backgroundColor: 'rgba(0,0,0,0.52)', backdropFilter: 'blur(3px)' }}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <DialogPanel
          transition
          className={`relative flex w-full ${maxWidth} max-h-[90vh] flex-col overflow-hidden transition-all duration-150 ease-out data-[closed]:opacity-0 data-[closed]:scale-[0.97]`}
          style={{
            borderRadius: 10,
            border: '1px solid var(--soc-border-mid)',
            background: 'var(--soc-surface)',
            color: 'var(--soc-text)',
            boxShadow: '0 0 0 1px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.1), 0 20px 56px rgba(0,0,0,0.18)',
          }}
        >
          {/* ── Header ── */}
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: 16,
              padding: '20px 24px 20px 0',
              borderBottom: '1px solid var(--soc-border)',
              flexShrink: 0,
            }}
          >
            <div style={{ width: 3, height: 36, background: 'var(--soc-accent)', borderRadius: '0 3px 3px 0', flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              {subtitle ? (
                <p className="soc-label" style={{ marginBottom: 4 }}>{subtitle}</p>
              ) : null}
              <DialogTitle
                style={{
                  fontSize: 16, fontWeight: 700, letterSpacing: '-0.015em',
                  lineHeight: 1.25, color: 'var(--soc-text)', margin: 0,
                }}
              >
                {active?.title ?? ''}
              </DialogTitle>
            </div>
            <PanelCloseBtn onClose={onClose} />
          </div>

          {/* ── Two-column body ── */}
          <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>

            {/* Left: step list */}
            <div
              className="hidden sm:flex"
              style={{
                width: 220, flexShrink: 0, flexDirection: 'column',
                borderRight: '1px solid var(--soc-border)',
                padding: '20px 0', overflowY: 'auto',
              }}
            >
              {steps.map((step, idx) => {
                const isCompleted = idx < currentStep
                const isActive = idx === currentStep
                const label = step.title.replace(/^Step \d+:\s*/i, '')

                return (
                  <button
                    key={step.id}
                    type="button"
                    disabled={busy}
                    onClick={() => { if (!busy) onStepChange(idx) }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '10px 20px',
                      background: isActive ? 'var(--soc-accent-bg)' : 'transparent',
                      borderLeft: isActive ? '2px solid var(--soc-accent)' : '2px solid transparent',
                      cursor: busy ? 'default' : 'pointer',
                      textAlign: 'left', width: '100%',
                      transition: 'background 0.1s',
                      outline: 'none',
                    }}
                    onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'var(--soc-overlay)' }}
                    onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
                  >
                    {/* Step indicator */}
                    <span
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                        fontSize: 10, fontWeight: 700,
                        background: isActive
                          ? 'var(--soc-accent)'
                          : isCompleted
                            ? 'var(--soc-low)'
                            : 'transparent',
                        border: isActive || isCompleted
                          ? 'none'
                          : '1.5px solid var(--soc-text-dim)',
                        color: isActive || isCompleted
                          ? '#fff'
                          : 'var(--soc-text-dim)',
                      }}
                    >
                      {isCompleted ? (
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1.5 5l2.5 2.5L8.5 2" />
                        </svg>
                      ) : (
                        idx + 1
                      )}
                    </span>

                    {/* Step name */}
                    <span
                      style={{
                        fontSize: 13, lineHeight: 1.4,
                        fontWeight: isActive ? 600 : 400,
                        color: isActive
                          ? 'var(--soc-text)'
                          : isCompleted
                            ? 'var(--soc-text-secondary)'
                            : 'var(--soc-text-muted)',
                      }}
                    >
                      {label}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Right: step content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px', fontSize: 13, lineHeight: 1.6 }}>
              {/* Mobile-only compact step header */}
              <div
                className="flex sm:hidden items-center gap-2 mb-5 pb-4"
                style={{ borderBottom: '1px solid var(--soc-border)' }}
              >
                {steps.map((_, idx) => (
                  <div
                    key={idx}
                    style={{
                      height: 3, flex: 1, borderRadius: 2,
                      background: idx <= currentStep ? 'var(--soc-accent)' : 'var(--soc-border)',
                      transition: 'background 0.2s',
                    }}
                  />
                ))}
                <span style={{ fontSize: 11, color: 'var(--soc-text-muted)', marginLeft: 6, whiteSpace: 'nowrap' }}>
                  {currentStep + 1}/{steps.length}
                </span>
              </div>

              {active?.content}
            </div>
          </div>

          {/* ── Footer ── */}
          <div
            style={{
              padding: '14px 24px',
              borderTop: '1px solid var(--soc-border)',
              flexShrink: 0,
            }}
          >
            {/* Validation hint — shown when the current step guard fails */}
            {validationHint && (
              <div
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  marginBottom: 12,
                  padding: '8px 12px',
                  borderRadius: 6,
                  background: 'var(--soc-medium-bg)',
                  border: '1px solid var(--soc-medium)',
                  fontSize: 12,
                  color: 'var(--soc-medium)',
                  lineHeight: 1.4,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <path d="M8 6v3M8 11.5v.5" />
                  <path d="M6.6 2.3L1.2 12a1.6 1.6 0 0 0 1.4 2.4h10.8a1.6 1.6 0 0 0 1.4-2.4L9.4 2.3a1.6 1.6 0 0 0-2.8 0z" />
                </svg>
                {validationHint}
              </div>
            )}

            {/* Step counter + action buttons */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
              <span style={{ fontSize: 12, color: 'var(--soc-text-muted)', whiteSpace: 'nowrap' }}>
                Step {currentStep + 1} of {steps.length}
              </span>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <button
                  type="button"
                  className="soc-btn soc-btn-secondary"
                  style={{ fontSize: 13 }}
                  onClick={onClose}
                  disabled={busy}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="soc-btn soc-btn-secondary"
                  style={{ fontSize: 13 }}
                  disabled={isFirst || busy}
                  onClick={() => onStepChange(Math.max(0, currentStep - 1))}
                >
                  Back
                </button>
                {isLast ? (
                  <button
                    type="button"
                    className="soc-btn soc-btn-primary"
                    style={{ fontSize: 13 }}
                    disabled={busy}
                    onClick={() => runGuard(onFinish)}
                  >
                    {busy ? 'Saving…' : 'Finish'}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="soc-btn soc-btn-primary"
                    style={{ fontSize: 13 }}
                    disabled={isBlocked || busy}
                    onClick={() => runGuard(() => onStepChange(Math.min(steps.length - 1, currentStep + 1)))}
                  >
                    {busy ? 'Checking…' : 'Next'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  )
}

// ─── Shared primitives ────────────────────────────────────────────────────────

type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info'

const severityBadgeClass: Record<Severity, string> = {
  critical: 'soc-badge soc-badge-critical',
  high:     'soc-badge soc-badge-high',
  medium:   'soc-badge soc-badge-medium',
  low:      'soc-badge soc-badge-low',
  info:     'soc-badge soc-badge-accent',
}

const severityDotStyle: Record<Severity, string> = {
  critical: 'bg-[color:var(--soc-critical)]',
  high:     'bg-[color:var(--soc-high)]',
  medium:   'bg-[color:var(--soc-medium)]',
  low:      'bg-[color:var(--soc-low)]',
  info:     'bg-[color:var(--soc-accent)]',
}

const severityBarStyle: Record<Severity, string> = {
  critical: 'bg-[color:var(--soc-critical)]',
  high:     'bg-[color:var(--soc-high)]',
  medium:   'bg-[color:var(--soc-medium)]',
  low:      'bg-[color:var(--soc-low)]',
  info:     'bg-[color:var(--soc-accent)]',
}

function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <span className={severityBadgeClass[severity]}>
      {severity.charAt(0).toUpperCase() + severity.slice(1)}
    </span>
  )
}

function SeverityDot({ severity }: { severity: Severity }) {
  return <span className={`soc-dot ${severityDotStyle[severity]}`} />
}

/** Chevron that rotates when expanded */
function ExpandChevron({ open }: { open: boolean }) {
  return (
    <svg
      width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={`shrink-0 transition-transform duration-200 text-[color:var(--soc-text-muted)] ${open ? 'rotate-180' : ''}`}
      aria-hidden
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

/** Expandable detail panel — consistent padding & background */
function ExpandPanel({ children }: { children: ReactNode }) {
  return (
    <tr className="border-b border-[color:var(--soc-border)]">
      <td colSpan={999} className="soc-expand-cell p-0">
        <div className="border-t border-[color:var(--soc-border)] bg-[color:var(--soc-raised)] px-3 py-2.5 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
          {children}
        </div>
      </td>
    </tr>
  )
}

/** Two-column detail grid used in expand panels */
function DetailGrid({ items }: { items: { label: string; value: ReactNode }[] }) {
  return (
    <dl className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-3 lg:grid-cols-4">
      {items.map(({ label, value }) => (
        <div key={label}>
          <dt className="soc-label mb-0.5">{label}</dt>
          <dd className="text-sm text-[color:var(--soc-text)]">{value}</dd>
        </div>
      ))}
    </dl>
  )
}

/** Monospace code chip */
function Mono({ children }: { children: ReactNode }) {
  return (
    <code className="font-mono text-xs bg-[color:var(--soc-raised)] border border-[color:var(--soc-border)] px-1.5 py-0.5 rounded text-[color:var(--soc-text-secondary)]">
      {children}
    </code>
  )
}

/** Avatar circle */
function Avatar({ initials, color = 'var(--soc-accent)' }: { initials: string; color?: string }) {
  return (
    <span
      className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[0.6rem] font-bold text-white"
      style={{ backgroundColor: color }}
    >
      {initials}
    </span>
  )
}

/** Platform/OS icon chip */
function PlatformChip({ label }: { label: string }) {
  return (
    <span className="rounded border border-[color:var(--soc-border)] bg-[color:var(--soc-raised)] px-1.5 py-0.5 text-[0.65rem] font-medium text-[color:var(--soc-text-secondary)]">
      {label}
    </span>
  )
}

/** Inline action button (ghost) */
function RowAction({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="soc-btn soc-btn-secondary text-xs py-1 px-2">
      {label}
    </button>
  )
}

/** Confidence / score pill */
function ScorePill({ value, max = 100 }: { value: number; max?: number }) {
  const pct = value / max
  const cls =
    pct >= 0.75 ? 'text-[color:var(--soc-critical)] bg-[color:var(--soc-critical-bg)]'
    : pct >= 0.5 ? 'text-[color:var(--soc-high)] bg-[color:var(--soc-high-bg)]'
    : pct >= 0.25 ? 'text-[color:var(--soc-medium)] bg-[color:var(--soc-medium-bg)]'
    : 'text-[color:var(--soc-low)] bg-[color:var(--soc-low-bg)]'
  return (
    <span className={`inline-flex items-center justify-center rounded px-2 py-0.5 text-xs font-bold tabular-nums ${cls}`}>
      {value}
    </span>
  )
}

const interactiveRowClass =
  'cursor-pointer select-none align-top'
const staticRowClass = 'align-top'

// ─── Shared table shell ───────────────────────────────────────────────────────

export function SocTable({
  columns,
  children,
}: {
  columns: string[]
  children: ReactNode
}) {
  return (
    <div className="overflow-x-auto">
      <table className="soc-table w-full">
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th key={`${col || 'column'}-${idx}`}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody className="[&_tr]:border-b [&_tr]:border-[color:var(--soc-border)] [&_td]:align-top">{children}</tbody>
      </table>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// 1. ALERT ROW  (expandable)
// ═══════════════════════════════════════════════════════════════════════════════

export type AlertRow = {
  id: string
  title: string
  severity: Severity
  source: string
  assignee?: string
  status: 'open' | 'investigating' | 'resolved' | 'suppressed'
  firstSeen: string
  lastSeen: string
  count: number
  description?: string
  mitreTactic?: string
  mitreTechnique?: string
  affectedAssets?: string[]
}

const alertStatusClass: Record<AlertRow['status'], string> = {
  open:          'soc-badge',
  investigating: 'soc-badge soc-badge-medium',
  resolved:      'soc-badge soc-badge-low',
  suppressed:    'soc-badge',
}

export function AlertTableRow({ row }: { row: AlertRow }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <tr className={interactiveRowClass} onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <td>
          <div className="flex items-center gap-2">
            <span className={`soc-severity-bar ${severityBarStyle[row.severity]}`} />
            <span className="font-medium text-[color:var(--soc-text)]">{row.title}</span>
          </div>
        </td>
        <td><SeverityBadge severity={row.severity} /></td>
        <td className="text-[color:var(--soc-text-secondary)]">{row.source}</td>
        <td>
          <span className={alertStatusClass[row.status]}>
            {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
          </span>
        </td>
        <td className="tabular-nums text-[color:var(--soc-text-secondary)]">{row.count}×</td>
        <td className="text-[color:var(--soc-text-muted)] text-xs">{row.lastSeen}</td>
        <td><ExpandChevron open={open} /></td>
      </tr>
      {open && (
        <ExpandPanel>
          <p className="text-sm text-[color:var(--soc-text-secondary)] mb-4">{row.description}</p>
          <DetailGrid items={[
            { label: 'Alert ID',        value: <Mono>{row.id}</Mono> },
            { label: 'First Seen',      value: row.firstSeen },
            { label: 'Last Seen',       value: row.lastSeen },
            { label: 'Occurrences',     value: row.count },
            { label: 'Assignee',        value: row.assignee ?? '—' },
            { label: 'MITRE Tactic',    value: row.mitreTactic ?? '—' },
            { label: 'MITRE Technique', value: row.mitreTechnique ?? '—' },
            { label: 'Affected Assets', value: (row.affectedAssets ?? []).join(', ') || '—' },
          ]} />
        </ExpandPanel>
      )}
    </>
  )
}

export function AlertTable({ rows }: { rows: AlertRow[] }) {
  return (
    <SocTable columns={['Alert', 'Severity', 'Source', 'Status', 'Count', 'Last Seen', '']}>
      {rows.map((r) => <AlertTableRow key={r.id} row={r} />)}
    </SocTable>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. INCIDENT ROW  (expandable)
// ═══════════════════════════════════════════════════════════════════════════════

export type IncidentRow = {
  id: string
  title: string
  severity: Severity
  status: 'new' | 'triaging' | 'active' | 'contained' | 'resolved' | 'closed'
  assignee: string
  alertCount: number
  affectedSystems: number
  opened: string
  updated: string
  summary?: string
  tags?: string[]
}

const incidentStatusClass: Record<IncidentRow['status'], string> = {
  new:       'soc-badge soc-badge-critical',
  triaging:  'soc-badge soc-badge-high',
  active:    'soc-badge soc-badge-high',
  contained: 'soc-badge soc-badge-medium',
  resolved:  'soc-badge soc-badge-low',
  closed:    'soc-badge',
}

export function IncidentTableRow({ row }: { row: IncidentRow }) {
  const [open, setOpen] = useState(false)
  const toggleOpen = () => setOpen((o) => !o)
  const onRowKeyDown = (event: React.KeyboardEvent<HTMLTableRowElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      toggleOpen()
    }
  }
  return (
    <>
      <tr
        className={`${interactiveRowClass} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--soc-accent)]`}
        onClick={toggleOpen}
        onKeyDown={onRowKeyDown}
        aria-expanded={open}
        aria-label={`Toggle details for incident ${row.id}`}
        role="button"
        tabIndex={0}
      >
        <td>
          <div className="flex items-center gap-2">
            <SeverityDot severity={row.severity} />
            <div>
              <p className="font-medium text-[color:var(--soc-text)]">{row.title}</p>
              <p className="text-xs text-[color:var(--soc-text-muted)]">{row.id}</p>
            </div>
          </div>
        </td>
        <td><SeverityBadge severity={row.severity} /></td>
        <td>
          <span className={incidentStatusClass[row.status]}>
            {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
          </span>
        </td>
        <td>
          <div className="flex items-center gap-1.5">
            <Avatar initials={row.assignee.slice(0, 2).toUpperCase()} />
            <span className="text-[color:var(--soc-text-secondary)]">{row.assignee}</span>
          </div>
        </td>
        <td className="tabular-nums text-[color:var(--soc-text-secondary)]">{row.alertCount}</td>
        <td className="tabular-nums text-[color:var(--soc-text-secondary)]">{row.affectedSystems}</td>
        <td className="text-xs text-[color:var(--soc-text-muted)]">{row.updated}</td>
        <td><ExpandChevron open={open} /></td>
      </tr>
      {open && (
        <ExpandPanel>
          <p className="text-sm text-[color:var(--soc-text-secondary)] mb-4">{row.summary}</p>
          <DetailGrid items={[
            { label: 'Incident ID',       value: <Mono>{row.id}</Mono> },
            { label: 'Opened',            value: row.opened },
            { label: 'Last Updated',      value: row.updated },
            { label: 'Alerts Linked',     value: row.alertCount },
            { label: 'Affected Systems',  value: row.affectedSystems },
          ]} />
          {row.tags && row.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {row.tags.map((t) => (
                <span key={t} className="soc-badge">{t}</span>
              ))}
            </div>
          )}
          <div className="mt-4 flex gap-2">
            <RowAction label="View Timeline" />
            <RowAction label="Assign" />
            <RowAction label="Close" />
          </div>
        </ExpandPanel>
      )}
    </>
  )
}

export function IncidentTable({ rows }: { rows: IncidentRow[] }) {
  return (
    <SocTable columns={['Incident', 'Severity', 'Status', 'Assignee', 'Alerts', 'Systems', 'Updated', '']}>
      {rows.map((r) => <IncidentTableRow key={r.id} row={r} />)}
    </SocTable>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. DEVICE ROW  (expandable)
// ═══════════════════════════════════════════════════════════════════════════════

export type DeviceRow = {
  id: string
  hostname: string
  ip: string
  os: string
  platform: string
  status: 'online' | 'offline' | 'isolated' | 'unknown'
  riskScore: number
  lastSeen: string
  owner?: string
  location?: string
  agentVersion?: string
  openAlerts: number
  criticalVulns: number
  tags?: string[]
}

const deviceStatusClass: Record<DeviceRow['status'], string> = {
  online:   'soc-badge soc-badge-low',
  offline:  'soc-badge',
  isolated: 'soc-badge soc-badge-medium',
  unknown:  'soc-badge',
}

export function DeviceTableRow({ row }: { row: DeviceRow }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <tr className={interactiveRowClass} onClick={() => setOpen((o) => !o)}>
        <td>
          <p className="font-medium font-mono text-sm text-[color:var(--soc-text)]">{row.hostname}</p>
          <p className="text-xs text-[color:var(--soc-text-muted)]">{row.ip}</p>
        </td>
        <td>
          <div className="flex items-center gap-1.5 flex-wrap">
            <PlatformChip label={row.platform} />
            <span className="text-xs text-[color:var(--soc-text-secondary)]">{row.os}</span>
          </div>
        </td>
        <td><span className={deviceStatusClass[row.status]}>{row.status}</span></td>
        <td><ScorePill value={row.riskScore} /></td>
        <td className="tabular-nums text-[color:var(--soc-text-secondary)]">{row.openAlerts}</td>
        <td className="tabular-nums text-[color:var(--soc-text-secondary)]">{row.criticalVulns}</td>
        <td className="text-xs text-[color:var(--soc-text-muted)]">{row.lastSeen}</td>
        <td><ExpandChevron open={open} /></td>
      </tr>
      {open && (
        <ExpandPanel>
          <DetailGrid items={[
            { label: 'Device ID',      value: <Mono>{row.id}</Mono> },
            { label: 'Hostname',       value: <Mono>{row.hostname}</Mono> },
            { label: 'IP Address',     value: <Mono>{row.ip}</Mono> },
            { label: 'OS',             value: row.os },
            { label: 'Platform',       value: row.platform },
            { label: 'Owner',          value: row.owner ?? '—' },
            { label: 'Location',       value: row.location ?? '—' },
            { label: 'Agent Version',  value: row.agentVersion ?? '—' },
            { label: 'Last Seen',      value: row.lastSeen },
          ]} />
          {row.tags && row.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {row.tags.map((t) => <span key={t} className="soc-badge">{t}</span>)}
            </div>
          )}
          <div className="mt-4 flex gap-2">
            <RowAction label="Isolate" />
            <RowAction label="Run Scan" />
            <RowAction label="View Alerts" />
          </div>
        </ExpandPanel>
      )}
    </>
  )
}

export function DeviceTable({ rows }: { rows: DeviceRow[] }) {
  return (
    <SocTable columns={['Hostname / IP', 'Platform', 'Status', 'Risk', 'Alerts', 'Critical Vulns', 'Last Seen', '']}>
      {rows.map((r) => <DeviceTableRow key={r.id} row={r} />)}
    </SocTable>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. USER (IDENTITY) ROW  (expandable)
// ═══════════════════════════════════════════════════════════════════════════════

export type UserRow = {
  id: string
  name: string
  email: string
  department: string
  role: string
  riskScore: number
  mfaEnabled: boolean
  status: 'active' | 'inactive' | 'suspended' | 'locked'
  lastLogin: string
  location?: string
  openAlerts: number
  privileged: boolean
}

const userStatusClass: Record<UserRow['status'], string> = {
  active:    'soc-badge soc-badge-low',
  inactive:  'soc-badge',
  suspended: 'soc-badge soc-badge-high',
  locked:    'soc-badge soc-badge-critical',
}

const avatarColors = [
  'var(--soc-accent)', '#7c3aed', '#0891b2', '#dc2626',
  '#d97706', '#16a34a', '#db2777',
]

export function UserTableRow({ row, colorIndex = 0 }: { row: UserRow; colorIndex?: number }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <tr className={interactiveRowClass} onClick={() => setOpen((o) => !o)}>
        <td>
          <div className="flex items-center gap-2.5">
            <Avatar
              initials={row.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
              color={avatarColors[colorIndex % avatarColors.length]}
            />
            <div>
              <p className="font-medium text-[color:var(--soc-text)]">{row.name}</p>
              <p className="text-xs text-[color:var(--soc-text-muted)]">{row.email}</p>
            </div>
          </div>
        </td>
        <td className="text-[color:var(--soc-text-secondary)]">{row.department}</td>
        <td className="text-[color:var(--soc-text-secondary)]">{row.role}</td>
        <td><span className={userStatusClass[row.status]}>{row.status}</span></td>
        <td>
          <div className="flex items-center gap-2">
            <ScorePill value={row.riskScore} />
            {row.privileged && (
              <span className="soc-badge soc-badge-accent">Privileged</span>
            )}
          </div>
        </td>
        <td>
          <span className={row.mfaEnabled ? 'soc-badge soc-badge-low' : 'soc-badge soc-badge-critical'}>
            {row.mfaEnabled ? 'MFA On' : 'No MFA'}
          </span>
        </td>
        <td className="text-xs text-[color:var(--soc-text-muted)]">{row.lastLogin}</td>
        <td><ExpandChevron open={open} /></td>
      </tr>
      {open && (
        <ExpandPanel>
          <DetailGrid items={[
            { label: 'User ID',     value: <Mono>{row.id}</Mono> },
            { label: 'Email',       value: row.email },
            { label: 'Department',  value: row.department },
            { label: 'Role',        value: row.role },
            { label: 'Location',    value: row.location ?? '—' },
            { label: 'Last Login',  value: row.lastLogin },
            { label: 'MFA',         value: row.mfaEnabled ? 'Enabled' : 'Disabled' },
            { label: 'Open Alerts', value: row.openAlerts },
          ]} />
          <div className="mt-4 flex gap-2">
            <RowAction label="View Activity" />
            <RowAction label="Reset Password" />
            <RowAction label="Suspend" />
          </div>
        </ExpandPanel>
      )}
    </>
  )
}

export function UserTable({ rows }: { rows: UserRow[] }) {
  return (
    <SocTable columns={['User', 'Department', 'Role', 'Status', 'Risk', 'MFA', 'Last Login', '']}>
      {rows.map((r, i) => <UserTableRow key={r.id} row={r} colorIndex={i} />)}
    </SocTable>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// 5. CVE ROW  (expandable)
// ═══════════════════════════════════════════════════════════════════════════════

export type CveRow = {
  id: string          // CVE-YYYY-NNNNN
  title: string
  cvss: number
  severity: Severity
  affectedProducts: string[]
  published: string
  patchAvailable: boolean
  exploitAvailable: boolean
  affectedDevices: number
  epss?: number       // 0-1 probability score
  vector?: string
  description?: string
}

export function CveTableRow({ row }: { row: CveRow }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <tr className={interactiveRowClass} onClick={() => setOpen((o) => !o)}>
        <td>
          <a className="soc-link font-mono text-sm" onClick={(e) => e.stopPropagation()}>
            {row.id}
          </a>
        </td>
        <td className="max-w-xs">
          <p className="text-[color:var(--soc-text)] truncate">{row.title}</p>
        </td>
        <td><SeverityBadge severity={row.severity} /></td>
        <td>
          <span className="tabular-nums font-bold text-sm text-[color:var(--soc-text)]">
            {row.cvss.toFixed(1)}
          </span>
        </td>
        <td>
          <div className="flex gap-1 flex-wrap">
            {row.exploitAvailable && (
              <span className="soc-badge soc-badge-critical">Exploit</span>
            )}
            {row.patchAvailable
              ? <span className="soc-badge soc-badge-low">Patch</span>
              : <span className="soc-badge soc-badge-high">No Patch</span>
            }
          </div>
        </td>
        <td className="tabular-nums text-[color:var(--soc-text-secondary)]">{row.affectedDevices}</td>
        <td className="text-xs text-[color:var(--soc-text-muted)]">{row.published}</td>
        <td><ExpandChevron open={open} /></td>
      </tr>
      {open && (
        <ExpandPanel>
          <p className="text-sm text-[color:var(--soc-text-secondary)] mb-4">{row.description}</p>
          <DetailGrid items={[
            { label: 'CVE ID',            value: <Mono>{row.id}</Mono> },
            { label: 'CVSS Score',        value: <span className="font-bold tabular-nums">{row.cvss.toFixed(1)}</span> },
            { label: 'EPSS Probability',  value: row.epss != null ? `${(row.epss * 100).toFixed(1)}%` : '—' },
            { label: 'Attack Vector',     value: row.vector ?? '—' },
            { label: 'Published',         value: row.published },
            { label: 'Affected Devices',  value: row.affectedDevices },
            { label: 'Patch Available',   value: row.patchAvailable ? 'Yes' : 'No' },
            { label: 'Exploit Available', value: row.exploitAvailable ? 'Yes' : 'No' },
          ]} />
          <div className="mt-3">
            <p className="soc-label mb-1.5">Affected Products</p>
            <div className="flex flex-wrap gap-1">
              {row.affectedProducts.map((p) => (
                <span key={p} className="soc-badge">{p}</span>
              ))}
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <RowAction label="View on NVD" />
            <RowAction label="Start Remediation" />
          </div>
        </ExpandPanel>
      )}
    </>
  )
}

export function CveTable({ rows }: { rows: CveRow[] }) {
  return (
    <SocTable columns={['CVE ID', 'Title', 'Severity', 'CVSS', 'Flags', 'Affected', 'Published', '']}>
      {rows.map((r) => <CveTableRow key={r.id} row={r} />)}
    </SocTable>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// 6. SECURITY RECOMMENDATION ROW  (expandable)
// ═══════════════════════════════════════════════════════════════════════════════

export type RecommendationRow = {
  id: string
  title: string
  category: string
  priority: Severity
  effort: 'low' | 'medium' | 'high'
  impact: 'low' | 'medium' | 'high'
  status: 'open' | 'in-progress' | 'completed' | 'accepted-risk'
  affectedAssets: number
  dueDate?: string
  description?: string
  steps?: string[]
}

const effortClass: Record<RecommendationRow['effort'], string> = {
  low:    'soc-badge soc-badge-low',
  medium: 'soc-badge soc-badge-medium',
  high:   'soc-badge soc-badge-high',
}

const recStatusClass: Record<RecommendationRow['status'], string> = {
  'open':          'soc-badge soc-badge-critical',
  'in-progress':   'soc-badge soc-badge-medium',
  'completed':     'soc-badge soc-badge-low',
  'accepted-risk': 'soc-badge',
}

export function RecommendationTableRow({ row }: { row: RecommendationRow }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <tr className={interactiveRowClass} onClick={() => setOpen((o) => !o)}>
        <td>
          <p className="font-medium text-[color:var(--soc-text)]">{row.title}</p>
          <p className="text-xs text-[color:var(--soc-text-muted)]">{row.category}</p>
        </td>
        <td><SeverityBadge severity={row.priority} /></td>
        <td><span className={effortClass[row.effort]}>{row.effort} effort</span></td>
        <td>
          <span className={`soc-badge ${
            row.impact === 'high' ? 'soc-badge-critical'
            : row.impact === 'medium' ? 'soc-badge-medium'
            : 'soc-badge-low'
          }`}>
            {row.impact} impact
          </span>
        </td>
        <td><span className={recStatusClass[row.status]}>{row.status}</span></td>
        <td className="tabular-nums text-[color:var(--soc-text-secondary)]">{row.affectedAssets}</td>
        <td className="text-xs text-[color:var(--soc-text-muted)]">{row.dueDate ?? '—'}</td>
        <td><ExpandChevron open={open} /></td>
      </tr>
      {open && (
        <ExpandPanel>
          <p className="text-sm text-[color:var(--soc-text-secondary)] mb-4">{row.description}</p>
          {row.steps && row.steps.length > 0 && (
            <div className="mb-4">
              <p className="soc-label mb-2">Remediation Steps</p>
              <ol className="space-y-1.5 pl-4">
                {row.steps.map((step, i) => (
                  <li key={i} className="text-sm text-[color:var(--soc-text-secondary)] list-decimal">
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          )}
          <div className="flex gap-2">
            <RowAction label="Start Remediation" />
            <RowAction label="Accept Risk" />
            <RowAction label="Assign" />
          </div>
        </ExpandPanel>
      )}
    </>
  )
}

export function RecommendationTable({ rows }: { rows: RecommendationRow[] }) {
  return (
    <SocTable columns={['Recommendation', 'Priority', 'Effort', 'Impact', 'Status', 'Assets', 'Due', '']}>
      {rows.map((r) => <RecommendationTableRow key={r.id} row={r} />)}
    </SocTable>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// 7. DARK WEB MONITORING ROW  (expandable)
// ═══════════════════════════════════════════════════════════════════════════════

export type DarkWebRow = {
  id: string
  type: 'credential' | 'data-breach' | 'mention' | 'paste' | 'forum-post'
  keyword: string
  source: string
  severity: Severity
  detectedAt: string
  dataType?: string
  affectedAccounts?: number
  verified: boolean
  description?: string
  rawPreview?: string     // truncated snippet (never full sensitive data)
}

const dwTypeLabel: Record<DarkWebRow['type'], string> = {
  'credential':  'Credential',
  'data-breach': 'Data Breach',
  'mention':     'Mention',
  'paste':       'Paste',
  'forum-post':  'Forum Post',
}

export function DarkWebTableRow({ row }: { row: DarkWebRow }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <tr className={interactiveRowClass} onClick={() => setOpen((o) => !o)}>
        <td>
          <span className="soc-badge">{dwTypeLabel[row.type]}</span>
        </td>
        <td>
          <p className="font-medium text-[color:var(--soc-text)]">{row.keyword}</p>
        </td>
        <td><SeverityBadge severity={row.severity} /></td>
        <td className="text-[color:var(--soc-text-secondary)] text-xs">{row.source}</td>
        <td>
          {row.verified
            ? <span className="soc-badge soc-badge-critical">Verified</span>
            : <span className="soc-badge">Unverified</span>
          }
        </td>
        {row.affectedAccounts != null
          ? <td className="tabular-nums text-[color:var(--soc-text-secondary)]">{row.affectedAccounts.toLocaleString()}</td>
          : <td className="text-[color:var(--soc-text-muted)]">—</td>
        }
        <td className="text-xs text-[color:var(--soc-text-muted)]">{row.detectedAt}</td>
        <td><ExpandChevron open={open} /></td>
      </tr>
      {open && (
        <ExpandPanel>
          <p className="text-sm text-[color:var(--soc-text-secondary)] mb-4">{row.description}</p>
          {row.rawPreview && (
            <div className="mb-4 rounded border border-[color:var(--soc-border)] bg-[color:var(--soc-overlay)] p-3">
              <p className="soc-label mb-1">Preview (redacted)</p>
              <p className="font-mono text-xs text-[color:var(--soc-text-secondary)] break-all">{row.rawPreview}</p>
            </div>
          )}
          <DetailGrid items={[
            { label: 'Finding ID',        value: <Mono>{row.id}</Mono> },
            { label: 'Type',              value: dwTypeLabel[row.type] },
            { label: 'Source',            value: row.source },
            { label: 'Data Type',         value: row.dataType ?? '—' },
            { label: 'Affected Accounts', value: row.affectedAccounts?.toLocaleString() ?? '—' },
            { label: 'Verified',          value: row.verified ? 'Yes' : 'No' },
            { label: 'Detected',          value: row.detectedAt },
          ]} />
          <div className="mt-4 flex gap-2">
            <RowAction label="Investigate" />
            <RowAction label="Notify Users" />
            <RowAction label="Mark Resolved" />
          </div>
        </ExpandPanel>
      )}
    </>
  )
}

export function DarkWebTable({ rows }: { rows: DarkWebRow[] }) {
  return (
    <SocTable columns={['Type', 'Keyword / Asset', 'Severity', 'Source', 'Verified', 'Accounts', 'Detected', '']}>
      {rows.map((r) => <DarkWebTableRow key={r.id} row={r} />)}
    </SocTable>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// 8. VULNERABILITY REMEDIATION ROW  (expandable)
// ═══════════════════════════════════════════════════════════════════════════════

export type VulnRemRow = {
  id: string
  cveId?: string
  title: string
  severity: Severity
  status: 'open' | 'in-progress' | 'patched' | 'mitigated' | 'accepted'
  owner: string
  affectedDevices: number
  patchedDevices: number
  dueDate: string
  overdue: boolean
  notes?: string
}

const remStatusClass: Record<VulnRemRow['status'], string> = {
  open:        'soc-badge soc-badge-critical',
  'in-progress':'soc-badge soc-badge-medium',
  patched:     'soc-badge soc-badge-low',
  mitigated:   'soc-badge soc-badge-accent',
  accepted:    'soc-badge',
}

export function VulnRemTableRow({ row }: { row: VulnRemRow }) {
  const [open, setOpen] = useState(false)
  const pct = row.affectedDevices > 0 ? Math.round((row.patchedDevices / row.affectedDevices) * 100) : 0
  return (
    <>
      <tr className={interactiveRowClass} onClick={() => setOpen((o) => !o)}>
        <td style={{ padding: 0, width: '6px', verticalAlign: 'middle' }}>
          <div
            style={{
              width: '3px',
              marginLeft: '1px',
              height: '100%',
              minHeight: '2.6rem',
              backgroundColor:
                row.severity === 'critical' ? 'var(--soc-critical)' :
                row.severity === 'high' ? 'var(--soc-high)' :
                row.severity === 'medium' ? 'var(--soc-medium)' :
                row.severity === 'low' ? 'var(--soc-low)' :
                'var(--soc-accent)',
              borderRadius: '0 2px 2px 0',
            }}
          />
        </td>
        <td>
          <span className="text-xs font-mono truncate block text-[color:var(--soc-text-muted)]">{row.id}</span>
        </td>
        <td>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[color:var(--soc-text)]">{row.title}</p>
            <p className="text-xs mt-0.5 text-[color:var(--soc-text-muted)]">
              {row.cveId ?? 'No CVE linked'} · {row.patchedDevices}/{row.affectedDevices} patched
            </p>
          </div>
        </td>
        <td className="text-xs leading-snug text-[color:var(--soc-text-secondary)]">{row.owner}</td>
        <td><SeverityBadge severity={row.severity} /></td>
        <td><span className={remStatusClass[row.status]}>{row.status}</span></td>
        <td className="text-right">
          <div className="ml-auto flex items-center gap-2 min-w-[6rem] max-w-[8rem]">
            <div className="soc-progress-track flex-1">
              <div className="soc-progress-fill" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs tabular-nums text-[color:var(--soc-text-muted)] w-8 text-right">{pct}%</span>
          </div>
        </td>
        <td>
          <span className={row.overdue ? 'text-[color:var(--soc-critical)] text-xs font-semibold' : 'text-xs text-[color:var(--soc-text-muted)]'}>
            {row.dueDate}
            {row.overdue && ' ⚠'}
          </span>
        </td>
        <td><ExpandChevron open={open} /></td>
      </tr>
      {open && (
        <ExpandPanel>
          <DetailGrid items={[
            { label: 'Task ID',           value: <Mono>{row.id}</Mono> },
            { label: 'Linked CVE',        value: row.cveId ?? '—' },
            { label: 'Patch Coverage',    value: `${row.patchedDevices} / ${row.affectedDevices}` },
            { label: 'Devices Remaining', value: Math.max(row.affectedDevices - row.patchedDevices, 0) },
            { label: 'Overdue',           value: row.overdue ? 'Yes' : 'No' },
          ]} />
          {row.notes && <p className="mt-3 text-sm text-[color:var(--soc-text-secondary)]">{row.notes}</p>}
          <div className="mt-4 flex gap-2">
            <RowAction label="Update Progress" />
            <RowAction label="Reassign" />
          </div>
        </ExpandPanel>
      )}
    </>
  )
}

export function VulnRemTable({ rows }: { rows: VulnRemRow[] }) {
  return (
    <SocTable columns={['', 'ID', 'Vulnerability', 'Owner', 'Severity', 'Status', 'Progress', 'Due', '']}>
      {rows.map((r) => <VulnRemTableRow key={r.id} row={r} />)}
    </SocTable>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// 9. SOFTWARE INVENTORY ROW  (not expandable — flat, dense)
// ═══════════════════════════════════════════════════════════════════════════════

export type SoftwareRow = {
  id: string
  name: string
  vendor: string
  version: string
  installCount: number
  licenseType: 'commercial' | 'open-source' | 'freeware' | 'trial' | 'unknown'
  riskLevel: 'none' | 'low' | 'medium' | 'high'
  lastUpdated: string
  eolDate?: string
  eol: boolean
}

const licenseClass: Record<SoftwareRow['licenseType'], string> = {
  commercial:   'soc-badge',
  'open-source':'soc-badge soc-badge-accent',
  freeware:     'soc-badge soc-badge-low',
  trial:        'soc-badge soc-badge-medium',
  unknown:      'soc-badge',
}

export function SoftwareTableRow({ row }: { row: SoftwareRow }) {
  return (
    <tr className={staticRowClass}>
      <td>
        <p className="font-medium text-[color:var(--soc-text)]">{row.name}</p>
        <p className="text-xs text-[color:var(--soc-text-muted)]">{row.vendor}</p>
      </td>
      <td><Mono>{row.version}</Mono></td>
      <td><span className={licenseClass[row.licenseType]}>{row.licenseType}</span></td>
      <td className="tabular-nums text-[color:var(--soc-text-secondary)]">{row.installCount.toLocaleString()}</td>
      <td>
        {row.riskLevel !== 'none'
          ? <SeverityBadge severity={row.riskLevel as Severity} />
          : <span className="soc-badge soc-badge-low">None</span>
        }
      </td>
      <td>
        {row.eol
          ? <span className="soc-badge soc-badge-high">EOL {row.eolDate}</span>
          : <span className="soc-badge soc-badge-low">Supported</span>
        }
      </td>
      <td className="text-xs text-[color:var(--soc-text-muted)]">{row.lastUpdated}</td>
    </tr>
  )
}

export function SoftwareTable({ rows }: { rows: SoftwareRow[] }) {
  return (
    <SocTable columns={['Software', 'Version', 'License', 'Installs', 'Risk', 'Support', 'Updated']}>
      {rows.map((r) => <SoftwareTableRow key={r.id} row={r} />)}
    </SocTable>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// 10. SECURITY WEAKNESS ROW  (expandable)
// ═══════════════════════════════════════════════════════════════════════════════

export type WeaknessRow = {
  id: string
  cweId?: string        // e.g. CWE-79
  title: string
  category: string
  severity: Severity
  occurrences: number
  affectedComponents: string[]
  detectedAt: string
  status: 'open' | 'in-review' | 'mitigated' | 'false-positive'
  description?: string
  remediation?: string
}

const weakStatusClass: Record<WeaknessRow['status'], string> = {
  open:          'soc-badge soc-badge-critical',
  'in-review':   'soc-badge soc-badge-medium',
  mitigated:     'soc-badge soc-badge-low',
  'false-positive': 'soc-badge',
}

export function WeaknessTableRow({ row }: { row: WeaknessRow }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <tr className={interactiveRowClass} onClick={() => setOpen((o) => !o)}>
        <td>
          {row.cweId && <Mono>{row.cweId}</Mono>}
          <p className="font-medium text-[color:var(--soc-text)] mt-0.5">{row.title}</p>
        </td>
        <td className="text-[color:var(--soc-text-secondary)]">{row.category}</td>
        <td><SeverityBadge severity={row.severity} /></td>
        <td className="tabular-nums text-[color:var(--soc-text-secondary)]">{row.occurrences}</td>
        <td><span className={weakStatusClass[row.status]}>{row.status}</span></td>
        <td className="text-xs text-[color:var(--soc-text-muted)]">{row.detectedAt}</td>
        <td><ExpandChevron open={open} /></td>
      </tr>
      {open && (
        <ExpandPanel>
          <DetailGrid items={[
            { label: 'CWE ID',      value: row.cweId ? <Mono>{row.cweId}</Mono> : '—' },
            { label: 'Category',    value: row.category },
            { label: 'Occurrences', value: row.occurrences },
            { label: 'Detected',    value: row.detectedAt },
          ]} />
          {row.description && <p className="mt-3 text-sm text-[color:var(--soc-text-secondary)]">{row.description}</p>}
          {row.remediation && (
            <div className="mt-3 p-3 rounded-lg bg-[color:var(--soc-accent-bg)] border border-[color:var(--soc-border)]">
              <p className="soc-label mb-1">Recommended Remediation</p>
              <p className="text-sm text-[color:var(--soc-text-secondary)]">{row.remediation}</p>
            </div>
          )}
          <div className="mt-3">
            <p className="soc-label mb-1.5">Affected Components</p>
            <div className="flex flex-wrap gap-1">
              {row.affectedComponents.map((c) => <span key={c} className="soc-badge">{c}</span>)}
            </div>
          </div>
        </ExpandPanel>
      )}
    </>
  )
}

export function WeaknessTable({ rows }: { rows: WeaknessRow[] }) {
  return (
    <SocTable columns={['Weakness', 'Category', 'Severity', 'Occurrences', 'Status', 'Detected', '']}>
      {rows.map((r) => <WeaknessTableRow key={r.id} row={r} />)}
    </SocTable>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// 11. THREAT ROW  (expandable)
// ═══════════════════════════════════════════════════════════════════════════════

export type ThreatRow = {
  id: string
  name: string
  type: 'malware' | 'ransomware' | 'apt' | 'phishing' | 'insider' | 'supply-chain' | 'other'
  severity: Severity
  confidence: number      // 0-100
  status: 'active' | 'monitoring' | 'contained' | 'resolved'
  firstDetected: string
  lastActivity: string
  affectedSystems: number
  mitreTactics?: string[]
  description?: string
  iocs?: string[]
}

const threatTypeClass: Record<ThreatRow['type'], string> = {
  malware:        'soc-badge soc-badge-critical',
  ransomware:     'soc-badge soc-badge-critical',
  apt:            'soc-badge soc-badge-high',
  phishing:       'soc-badge soc-badge-medium',
  insider:        'soc-badge soc-badge-high',
  'supply-chain': 'soc-badge soc-badge-high',
  other:          'soc-badge',
}

export function ThreatTableRow({ row }: { row: ThreatRow }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <tr className={interactiveRowClass} onClick={() => setOpen((o) => !o)}>
        <td>
          <div className="flex items-center gap-2">
            <span className={`soc-severity-bar ${severityBarStyle[row.severity]}`} />
            <p className="font-medium text-[color:var(--soc-text)]">{row.name}</p>
          </div>
        </td>
        <td><span className={threatTypeClass[row.type]}>{row.type}</span></td>
        <td><SeverityBadge severity={row.severity} /></td>
        <td><ScorePill value={row.confidence} /></td>
        <td>
          <span className={
            row.status === 'active' ? 'soc-badge soc-badge-critical'
            : row.status === 'monitoring' ? 'soc-badge soc-badge-high'
            : row.status === 'contained' ? 'soc-badge soc-badge-medium'
            : 'soc-badge soc-badge-low'
          }>{row.status}</span>
        </td>
        <td className="tabular-nums text-[color:var(--soc-text-secondary)]">{row.affectedSystems}</td>
        <td className="text-xs text-[color:var(--soc-text-muted)]">{row.lastActivity}</td>
        <td><ExpandChevron open={open} /></td>
      </tr>
      {open && (
        <ExpandPanel>
          <p className="text-sm text-[color:var(--soc-text-secondary)] mb-4">{row.description}</p>
          <DetailGrid items={[
            { label: 'Threat ID',         value: <Mono>{row.id}</Mono> },
            { label: 'First Detected',    value: row.firstDetected },
            { label: 'Last Activity',     value: row.lastActivity },
            { label: 'Affected Systems',  value: row.affectedSystems },
            { label: 'Confidence',        value: `${row.confidence}%` },
          ]} />
          {row.mitreTactics && row.mitreTactics.length > 0 && (
            <div className="mt-3">
              <p className="soc-label mb-1.5">MITRE ATT&CK Tactics</p>
              <div className="flex flex-wrap gap-1">
                {row.mitreTactics.map((t) => <span key={t} className="soc-badge soc-badge-accent">{t}</span>)}
              </div>
            </div>
          )}
          {row.iocs && row.iocs.length > 0 && (
            <div className="mt-3">
              <p className="soc-label mb-1.5">Indicators of Compromise</p>
              <div className="flex flex-wrap gap-1.5">
                {row.iocs.map((ioc) => <Mono key={ioc}>{ioc}</Mono>)}
              </div>
            </div>
          )}
          <div className="mt-4 flex gap-2">
            <RowAction label="Investigate" />
            <RowAction label="Contain" />
            <RowAction label="Create Incident" />
          </div>
        </ExpandPanel>
      )}
    </>
  )
}

export function ThreatTable({ rows }: { rows: ThreatRow[] }) {
  return (
    <SocTable columns={['Threat', 'Type', 'Severity', 'Confidence', 'Status', 'Systems', 'Last Activity', '']}>
      {rows.map((r) => <ThreatTableRow key={r.id} row={r} />)}
    </SocTable>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// 12. ACTIVE THREAT ACTOR ROW  (expandable)
// ═══════════════════════════════════════════════════════════════════════════════

export type ThreatActorRow = {
  id: string
  name: string
  aliases?: string[]
  origin?: string
  motivation: 'financial' | 'espionage' | 'hacktivism' | 'destruction' | 'unknown'
  sophistication: 'novice' | 'intermediate' | 'advanced' | 'nation-state'
  targetSectors: string[]
  lastSeen: string
  active: boolean
  iocCount: number
  campaignCount: number
  description?: string
  ttps?: string[]
}

const motivationClass: Record<ThreatActorRow['motivation'], string> = {
  financial:   'soc-badge soc-badge-high',
  espionage:   'soc-badge soc-badge-critical',
  hacktivism:  'soc-badge soc-badge-medium',
  destruction: 'soc-badge soc-badge-critical',
  unknown:     'soc-badge',
}

const sophClass: Record<ThreatActorRow['sophistication'], string> = {
  novice:       'soc-badge soc-badge-low',
  intermediate: 'soc-badge soc-badge-medium',
  advanced:     'soc-badge soc-badge-high',
  'nation-state':'soc-badge soc-badge-critical',
}

export function ThreatActorTableRow({ row }: { row: ThreatActorRow }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <tr className={interactiveRowClass} onClick={() => setOpen((o) => !o)}>
        <td>
          <div className="flex items-center gap-2">
            {row.active && <span className="soc-live-dot" />}
            <div>
              <p className="font-medium text-[color:var(--soc-text)]">{row.name}</p>
              {row.aliases && row.aliases.length > 0 && (
                <p className="text-xs text-[color:var(--soc-text-muted)]">
                  aka {row.aliases.slice(0, 2).join(', ')}
                  {row.aliases.length > 2 && ` +${row.aliases.length - 2}`}
                </p>
              )}
            </div>
          </div>
        </td>
        <td>{row.origin ?? <span className="text-[color:var(--soc-text-muted)]">Unknown</span>}</td>
        <td><span className={motivationClass[row.motivation]}>{row.motivation}</span></td>
        <td><span className={sophClass[row.sophistication]}>{row.sophistication}</span></td>
        <td className="tabular-nums text-[color:var(--soc-text-secondary)]">{row.iocCount}</td>
        <td className="tabular-nums text-[color:var(--soc-text-secondary)]">{row.campaignCount}</td>
        <td className="text-xs text-[color:var(--soc-text-muted)]">{row.lastSeen}</td>
        <td><ExpandChevron open={open} /></td>
      </tr>
      {open && (
        <ExpandPanel>
          <p className="text-sm text-[color:var(--soc-text-secondary)] mb-4">{row.description}</p>
          <DetailGrid items={[
            { label: 'Actor ID',       value: <Mono>{row.id}</Mono> },
            { label: 'Origin',         value: row.origin ?? 'Unknown' },
            { label: 'Motivation',     value: row.motivation },
            { label: 'Sophistication', value: row.sophistication },
            { label: 'IOC Count',      value: row.iocCount },
            { label: 'Campaigns',      value: row.campaignCount },
            { label: 'Last Seen',      value: row.lastSeen },
          ]} />
          <div className="mt-3">
            <p className="soc-label mb-1.5">Target Sectors</p>
            <div className="flex flex-wrap gap-1">
              {row.targetSectors.map((s) => <span key={s} className="soc-badge">{s}</span>)}
            </div>
          </div>
          {row.ttps && row.ttps.length > 0 && (
            <div className="mt-3">
              <p className="soc-label mb-1.5">Known TTPs</p>
              <div className="flex flex-wrap gap-1">
                {row.ttps.map((t) => <span key={t} className="soc-badge soc-badge-accent">{t}</span>)}
              </div>
            </div>
          )}
        </ExpandPanel>
      )}
    </>
  )
}

export function ThreatActorTable({ rows }: { rows: ThreatActorRow[] }) {
  return (
    <SocTable columns={['Actor', 'Origin', 'Motivation', 'Sophistication', 'IOCs', 'Campaigns', 'Last Seen', '']}>
      {rows.map((r) => <ThreatActorTableRow key={r.id} row={r} />)}
    </SocTable>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// 13. INDICATOR OF COMPROMISE (IOC) ROW  (not expandable — dense, fast-scan)
// ═══════════════════════════════════════════════════════════════════════════════

export type IocRow = {
  id: string
  type: 'ip' | 'domain' | 'url' | 'hash-md5' | 'hash-sha256' | 'email' | 'file'
  value: string
  severity: Severity
  confidence: number
  source: string
  firstSeen: string
  lastSeen: string
  tags?: string[]
  blocked: boolean
}

const iocTypeIcon: Record<IocRow['type'], string> = {
  'ip':         'IP',
  'domain':     'DOM',
  'url':        'URL',
  'hash-md5':   'MD5',
  'hash-sha256':'SHA',
  'email':      'EML',
  'file':       'FILE',
}

export function IocTableRow({ row }: { row: IocRow }) {
  return (
    <tr className={staticRowClass}>
      <td>
        <span className="soc-badge soc-badge-accent font-mono">{iocTypeIcon[row.type]}</span>
      </td>
      <td>
        <Mono>{row.value.length > 48 ? row.value.slice(0, 45) + '…' : row.value}</Mono>
      </td>
      <td><SeverityBadge severity={row.severity} /></td>
      <td><ScorePill value={row.confidence} /></td>
      <td className="text-xs text-[color:var(--soc-text-secondary)]">{row.source}</td>
      <td>
        {row.blocked
          ? <span className="soc-badge soc-badge-critical">Blocked</span>
          : <span className="soc-badge soc-badge-medium">Allowed</span>
        }
      </td>
      <td className="text-xs text-[color:var(--soc-text-muted)]">{row.lastSeen}</td>
      <td>
        <div className="flex gap-1">
          <RowAction label="Block" />
          <RowAction label="Hunt" />
        </div>
      </td>
    </tr>
  )
}

export function IocTable({ rows }: { rows: IocRow[] }) {
  return (
    <SocTable columns={['Type', 'Indicator', 'Severity', 'Conf.', 'Source', 'State', 'Last Seen', 'Actions']}>
      {rows.map((r) => <IocTableRow key={r.id} row={r} />)}
    </SocTable>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// 14. THREAT INTELLIGENCE FEED ROW  (not expandable — operational status table)
// ═══════════════════════════════════════════════════════════════════════════════

export type TiFeedRow = {
  id: string
  name: string
  provider: string
  type: 'commercial' | 'open-source' | 'isac' | 'government' | 'internal'
  status: 'active' | 'degraded' | 'inactive' | 'error'
  lastSync: string
  iocCount: number
  frequency: string
  confidence: 'high' | 'medium' | 'low'
}

const feedStatusClass: Record<TiFeedRow['status'], string> = {
  active:   'soc-badge soc-badge-low',
  degraded: 'soc-badge soc-badge-medium',
  inactive: 'soc-badge',
  error:    'soc-badge soc-badge-critical',
}

const feedTypeClass: Record<TiFeedRow['type'], string> = {
  commercial:   'soc-badge',
  'open-source':'soc-badge soc-badge-accent',
  isac:         'soc-badge soc-badge-medium',
  government:   'soc-badge soc-badge-high',
  internal:     'soc-badge soc-badge-low',
}

export function TiFeedTableRow({ row }: { row: TiFeedRow }) {
  return (
    <tr className={staticRowClass}>
      <td>
        <p className="font-medium text-[color:var(--soc-text)]">{row.name}</p>
        <p className="text-xs text-[color:var(--soc-text-muted)]">{row.provider}</p>
      </td>
      <td><span className={feedTypeClass[row.type]}>{row.type}</span></td>
      <td>
        <div className="flex items-center gap-1.5">
          {row.status === 'active' && <span className="soc-live-dot" />}
          <span className={feedStatusClass[row.status]}>{row.status}</span>
        </div>
      </td>
      <td className="tabular-nums text-[color:var(--soc-text-secondary)]">{row.iocCount.toLocaleString()}</td>
      <td>
        <span className={
          row.confidence === 'high' ? 'soc-badge soc-badge-low'
          : row.confidence === 'medium' ? 'soc-badge soc-badge-medium'
          : 'soc-badge'
        }>{row.confidence}</span>
      </td>
      <td className="text-xs text-[color:var(--soc-text-secondary)]">{row.frequency}</td>
      <td className="text-xs text-[color:var(--soc-text-muted)]">{row.lastSync}</td>
      <td>
        <div className="flex gap-1">
          <RowAction label="Sync" />
          <RowAction label="Config" />
        </div>
      </td>
    </tr>
  )
}

export function TiFeedTable({ rows }: { rows: TiFeedRow[] }) {
  return (
    <SocTable columns={['Feed', 'Type', 'Status', 'IOCs', 'Confidence', 'Frequency', 'Last Sync', 'Actions']}>
      {rows.map((r) => <TiFeedTableRow key={r.id} row={r} />)}
    </SocTable>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// 15. DOCUMENTATION ROW  (not expandable — directory listing)
// ═══════════════════════════════════════════════════════════════════════════════

export type DocRow = {
  id: string
  title: string
  category: string
  type: 'policy' | 'procedure' | 'runbook' | 'guide' | 'template' | 'reference'
  author: string
  version: string
  status: 'published' | 'draft' | 'review' | 'archived'
  updatedAt: string
  tags?: string[]
}

const docStatusClass: Record<DocRow['status'], string> = {
  published: 'soc-badge soc-badge-low',
  draft:     'soc-badge soc-badge-medium',
  review:    'soc-badge soc-badge-accent',
  archived:  'soc-badge',
}

const docTypeIcon: Record<DocRow['type'], string> = {
  policy:    '📋',
  procedure: '📝',
  runbook:   '📒',
  guide:     '📖',
  template:  '📄',
  reference: '🔖',
}

export function DocTableRow({ row }: { row: DocRow }) {
  return (
    <tr className={staticRowClass}>
      <td>
        <div className="flex items-center gap-2">
          <span className="text-base" aria-hidden>{docTypeIcon[row.type]}</span>
          <div>
            <p className="font-medium text-[color:var(--soc-text)] soc-link cursor-pointer">{row.title}</p>
            <p className="text-xs text-[color:var(--soc-text-muted)]">{row.category}</p>
          </div>
        </div>
      </td>
      <td><span className="soc-badge">{row.type}</span></td>
      <td><span className={docStatusClass[row.status]}>{row.status}</span></td>
      <td className="text-[color:var(--soc-text-secondary)]">{row.author}</td>
      <td><Mono>v{row.version}</Mono></td>
      <td className="text-xs text-[color:var(--soc-text-muted)]">{row.updatedAt}</td>
      <td>
        <div className="flex gap-1">
          <RowAction label="View" />
          <RowAction label="Edit" />
        </div>
      </td>
    </tr>
  )
}

export function DocTable({ rows }: { rows: DocRow[] }) {
  return (
    <SocTable columns={['Document', 'Type', 'Status', 'Author', 'Version', 'Updated', 'Actions']}>
      {rows.map((r) => <DocTableRow key={r.id} row={r} />)}
    </SocTable>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// 16. PROCEDURE ROW  (expandable — shows steps inline)
// ═══════════════════════════════════════════════════════════════════════════════

export type ProcedureRow = {
  id: string
  name: string
  triggerCondition: string
  owner: string
  type: 'manual' | 'automated' | 'semi-automated'
  lastRun?: string
  runCount: number
  avgDuration: string
  status: 'active' | 'draft' | 'deprecated'
  steps?: string[]
  description?: string
}

const procTypeClass: Record<ProcedureRow['type'], string> = {
  manual:          'soc-badge',
  automated:       'soc-badge soc-badge-accent',
  'semi-automated':'soc-badge soc-badge-medium',
}

export function ProcedureTableRow({ row }: { row: ProcedureRow }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <tr className={interactiveRowClass} onClick={() => setOpen((o) => !o)}>
        <td>
          <p className="font-medium text-[color:var(--soc-text)]">{row.name}</p>
          <p className="text-xs text-[color:var(--soc-text-muted)]">{row.triggerCondition}</p>
        </td>
        <td><span className={procTypeClass[row.type]}>{row.type}</span></td>
        <td className="text-[color:var(--soc-text-secondary)]">{row.owner}</td>
        <td>
          <span className={
            row.status === 'active' ? 'soc-badge soc-badge-low'
            : row.status === 'draft' ? 'soc-badge soc-badge-medium'
            : 'soc-badge'
          }>{row.status}</span>
        </td>
        <td className="tabular-nums text-[color:var(--soc-text-secondary)]">{row.runCount}×</td>
        <td className="text-xs text-[color:var(--soc-text-secondary)]">{row.avgDuration}</td>
        <td className="text-xs text-[color:var(--soc-text-muted)]">{row.lastRun ?? '—'}</td>
        <td><ExpandChevron open={open} /></td>
      </tr>
      {open && (
        <ExpandPanel>
          {row.description && (
            <p className="text-sm text-[color:var(--soc-text-secondary)] mb-4">{row.description}</p>
          )}
          {row.steps && row.steps.length > 0 && (
            <div className="mb-4">
              <p className="soc-label mb-2">Steps ({row.steps.length})</p>
              <ol className="space-y-2">
                {row.steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[color:var(--soc-accent-bg)] text-[0.6rem] font-bold text-[color:var(--soc-accent-text)]">
                      {i + 1}
                    </span>
                    <p className="text-sm text-[color:var(--soc-text-secondary)]">{step}</p>
                  </li>
                ))}
              </ol>
            </div>
          )}
          <div className="flex gap-2">
            <RowAction label="Run Now" />
            <RowAction label="Edit" />
            <RowAction label="View History" />
          </div>
        </ExpandPanel>
      )}
    </>
  )
}

export function ProcedureTable({ rows }: { rows: ProcedureRow[] }) {
  return (
    <SocTable columns={['Procedure', 'Type', 'Owner', 'Status', 'Runs', 'Avg Duration', 'Last Run', '']}>
      {rows.map((r) => <ProcedureTableRow key={r.id} row={r} />)}
    </SocTable>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// 17. REPORT ROW  (not expandable — clean download/view table)
// ═══════════════════════════════════════════════════════════════════════════════

export type ReportRow = {
  id: string
  title: string
  type: 'executive' | 'technical' | 'compliance' | 'incident' | 'threat-intel' | 'audit'
  period: string
  author: string
  generatedAt: string
  format: 'pdf' | 'csv' | 'xlsx' | 'html'
  size: string
  status: 'ready' | 'generating' | 'failed' | 'scheduled'
}

const reportStatusClass: Record<ReportRow['status'], string> = {
  ready:      'soc-badge soc-badge-low',
  generating: 'soc-badge soc-badge-medium',
  failed:     'soc-badge soc-badge-critical',
  scheduled:  'soc-badge soc-badge-accent',
}

const reportTypeClass: Record<ReportRow['type'], string> = {
  executive:    'soc-badge soc-badge-accent',
  technical:    'soc-badge',
  compliance:   'soc-badge soc-badge-medium',
  incident:     'soc-badge soc-badge-high',
  'threat-intel':'soc-badge soc-badge-critical',
  audit:        'soc-badge soc-badge-low',
}

const formatIcon: Record<ReportRow['format'], string> = {
  pdf: '📄', csv: '📊', xlsx: '📊', html: '🌐',
}

export function ReportTableRow({ row }: { row: ReportRow }) {
  return (
    <tr className={staticRowClass}>
      <td>
        <div className="flex items-center gap-2">
          <span aria-hidden>{formatIcon[row.format]}</span>
          <div>
            <p className="font-medium text-[color:var(--soc-text)] soc-link cursor-pointer">{row.title}</p>
            <p className="text-xs text-[color:var(--soc-text-muted)]">{row.period}</p>
          </div>
        </div>
      </td>
      <td><span className={reportTypeClass[row.type]}>{row.type}</span></td>
      <td><span className={reportStatusClass[row.status]}>{row.status}</span></td>
      <td className="text-[color:var(--soc-text-secondary)]">{row.author}</td>
      <td>
        <span className="soc-badge font-mono">{row.format.toUpperCase()}</span>
        <span className="ml-1.5 text-xs text-[color:var(--soc-text-muted)]">{row.size}</span>
      </td>
      <td className="text-xs text-[color:var(--soc-text-muted)]">{row.generatedAt}</td>
      <td>
        <div className="flex gap-1">
          {row.status === 'ready' && <RowAction label="Download" />}
          {row.status === 'ready' && <RowAction label="Share" />}
          {row.status === 'failed' && <RowAction label="Retry" />}
        </div>
      </td>
    </tr>
  )
}

export function ReportTable({ rows }: { rows: ReportRow[] }) {
  return (
    <SocTable columns={['Report', 'Type', 'Status', 'Author', 'Format', 'Generated', 'Actions']}>
      {rows.map((r) => <ReportTableRow key={r.id} row={r} />)}
    </SocTable>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// 18. COURSE ROW  (expandable — shows syllabus preview)
// ═══════════════════════════════════════════════════════════════════════════════

export type CourseRow = {
  id: string
  title: string
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  duration: string
  enrolledCount: number
  completionRate: number     // 0-100
  mandatory: boolean
  dueDate?: string
  status: 'active' | 'draft' | 'archived'
  description?: string
  modules?: string[]
}

const difficultyClass: Record<CourseRow['difficulty'], string> = {
  beginner:     'soc-badge soc-badge-low',
  intermediate: 'soc-badge soc-badge-medium',
  advanced:     'soc-badge soc-badge-high',
}

export function CourseTableRow({ row }: { row: CourseRow }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <tr className={interactiveRowClass} onClick={() => setOpen((o) => !o)}>
        <td>
          <p className="font-medium text-[color:var(--soc-text)]">{row.title}</p>
          <p className="text-xs text-[color:var(--soc-text-muted)]">{row.category}</p>
        </td>
        <td><span className={difficultyClass[row.difficulty]}>{row.difficulty}</span></td>
        <td className="text-[color:var(--soc-text-secondary)]">{row.duration}</td>
        <td>
          <div className="flex items-center gap-2 min-w-[5rem]">
            <div className="soc-progress-track flex-1">
              <div
                className={`soc-progress-fill ${
                  row.completionRate >= 80 ? 'bg-[color:var(--soc-low)]'
                  : row.completionRate >= 50 ? 'bg-[color:var(--soc-medium)]'
                  : 'bg-[color:var(--soc-high)]'
                }`}
                style={{ width: `${row.completionRate}%` }}
              />
            </div>
            <span className="text-xs tabular-nums text-[color:var(--soc-text-muted)] w-7 text-right">
              {row.completionRate}%
            </span>
          </div>
        </td>
        <td className="tabular-nums text-[color:var(--soc-text-secondary)]">{row.enrolledCount}</td>
        <td>
          {row.mandatory
            ? <span className="soc-badge soc-badge-critical">Mandatory</span>
            : <span className="soc-badge">Optional</span>
          }
        </td>
        <td className="text-xs text-[color:var(--soc-text-muted)]">{row.dueDate ?? '—'}</td>
        <td><ExpandChevron open={open} /></td>
      </tr>
      {open && (
        <ExpandPanel>
          {row.description && (
            <p className="text-sm text-[color:var(--soc-text-secondary)] mb-4">{row.description}</p>
          )}
          {row.modules && row.modules.length > 0 && (
            <div className="mb-4">
              <p className="soc-label mb-2">Modules ({row.modules.length})</p>
              <ul className="space-y-1.5">
                {row.modules.map((m, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-[color:var(--soc-text-secondary)]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--soc-accent)] shrink-0" />
                    {m}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="flex gap-2">
            <RowAction label="View Course" />
            <RowAction label="Assign Users" />
            <RowAction label="View Progress" />
          </div>
        </ExpandPanel>
      )}
    </>
  )
}

export function CourseTable({ rows }: { rows: CourseRow[] }) {
  return (
    <SocTable columns={['Course', 'Level', 'Duration', 'Completion', 'Enrolled', 'Required', 'Due', '']}>
      {rows.map((r) => <CourseTableRow key={r.id} row={r} />)}
    </SocTable>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// 19. USERS (ADMIN) ROW  — platform user management, different from identity
// ═══════════════════════════════════════════════════════════════════════════════

export type AdminUserRow = {
  id: string
  name: string
  email: string
  role: 'super-admin' | 'admin' | 'analyst' | 'viewer' | 'responder'
  status: 'active' | 'inactive' | 'pending' | 'suspended'
  lastLogin: string
  mfaEnabled: boolean
  teamsCount: number
  createdAt: string
}

const adminRoleClass: Record<AdminUserRow['role'], string> = {
  'super-admin': 'soc-badge soc-badge-critical',
  admin:         'soc-badge soc-badge-high',
  analyst:       'soc-badge soc-badge-accent',
  viewer:        'soc-badge',
  responder:     'soc-badge soc-badge-medium',
}

const adminStatusClass: Record<AdminUserRow['status'], string> = {
  active:    'soc-badge soc-badge-low',
  inactive:  'soc-badge',
  pending:   'soc-badge soc-badge-medium',
  suspended: 'soc-badge soc-badge-critical',
}

export function AdminUserTableRow({ row, colorIndex = 0 }: { row: AdminUserRow; colorIndex?: number }) {
  return (
    <tr className={staticRowClass}>
      <td>
        <div className="flex items-center gap-2.5">
          <Avatar
            initials={row.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
            color={avatarColors[colorIndex % avatarColors.length]}
          />
          <div>
            <p className="font-medium text-[color:var(--soc-text)]">{row.name}</p>
            <p className="text-xs text-[color:var(--soc-text-muted)]">{row.email}</p>
          </div>
        </div>
      </td>
      <td><span className={adminRoleClass[row.role]}>{row.role}</span></td>
      <td><span className={adminStatusClass[row.status]}>{row.status}</span></td>
      <td>
        <span className={row.mfaEnabled ? 'soc-badge soc-badge-low' : 'soc-badge soc-badge-critical'}>
          {row.mfaEnabled ? 'MFA On' : 'No MFA'}
        </span>
      </td>
      <td className="tabular-nums text-[color:var(--soc-text-secondary)]">{row.teamsCount}</td>
      <td className="text-xs text-[color:var(--soc-text-muted)]">{row.lastLogin}</td>
      <td className="text-xs text-[color:var(--soc-text-muted)]">{row.createdAt}</td>
      <td>
        <div className="flex gap-1">
          <RowAction label="Edit" />
          <RowAction label="Disable" />
        </div>
      </td>
    </tr>
  )
}

export function AdminUserTable({ rows }: { rows: AdminUserRow[] }) {
  return (
    <SocTable columns={['User', 'Role', 'Status', 'MFA', 'Teams', 'Last Login', 'Created', 'Actions']}>
      {rows.map((r, i) => <AdminUserTableRow key={r.id} row={r} colorIndex={i} />)}
    </SocTable>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// 20. INTEGRATION ROW  (expandable — on-premise / SIEM / ticketing / etc.)
// ═══════════════════════════════════════════════════════════════════════════════

export type IntegrationRow = {
  id: string
  name: string
  vendor: string
  category: 'siem' | 'edr' | 'ticketing' | 'identity' | 'email' | 'network' | 'vulnerability' | 'other'
  status: 'connected' | 'degraded' | 'disconnected' | 'pending'
  lastSync: string
  eventsPerDay: number
  version?: string
  region?: string
  healthScore: number    // 0-100
  description?: string
  configKeys?: string[]
}

const intStatusClass: Record<IntegrationRow['status'], string> = {
  connected:    'soc-badge soc-badge-low',
  degraded:     'soc-badge soc-badge-medium',
  disconnected: 'soc-badge soc-badge-critical',
  pending:      'soc-badge soc-badge-accent',
}

const intCategoryClass: Record<IntegrationRow['category'], string> = {
  siem:          'soc-badge soc-badge-accent',
  edr:           'soc-badge soc-badge-high',
  ticketing:     'soc-badge',
  identity:      'soc-badge soc-badge-medium',
  email:         'soc-badge',
  network:       'soc-badge soc-badge-low',
  vulnerability: 'soc-badge soc-badge-critical',
  other:         'soc-badge',
}

export function IntegrationTableRow({ row }: { row: IntegrationRow }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <tr className={interactiveRowClass} onClick={() => setOpen((o) => !o)}>
        <td>
          <p className="font-medium text-[color:var(--soc-text)]">{row.name}</p>
          <p className="text-xs text-[color:var(--soc-text-muted)]">{row.vendor}</p>
        </td>
        <td><span className={intCategoryClass[row.category]}>{row.category}</span></td>
        <td>
          <div className="flex items-center gap-1.5">
            {row.status === 'connected' && <span className="soc-live-dot" />}
            <span className={intStatusClass[row.status]}>{row.status}</span>
          </div>
        </td>
        <td>
          <div className="flex items-center gap-2 min-w-[5rem]">
            <div className="soc-progress-track flex-1">
              <div
                className={`soc-progress-fill ${
                  row.healthScore >= 80 ? 'bg-[color:var(--soc-low)]'
                  : row.healthScore >= 50 ? 'bg-[color:var(--soc-medium)]'
                  : 'bg-[color:var(--soc-critical)]'
                }`}
                style={{ width: `${row.healthScore}%` }}
              />
            </div>
            <span className="text-xs tabular-nums text-[color:var(--soc-text-muted)] w-7 text-right">
              {row.healthScore}%
            </span>
          </div>
        </td>
        <td className="tabular-nums text-[color:var(--soc-text-secondary)]">
          {row.eventsPerDay.toLocaleString()}<span className="text-[color:var(--soc-text-muted)] text-xs">/d</span>
        </td>
        <td className="text-xs text-[color:var(--soc-text-muted)]">{row.lastSync}</td>
        <td><ExpandChevron open={open} /></td>
      </tr>
      {open && (
        <ExpandPanel>
          {row.description && (
            <p className="text-sm text-[color:var(--soc-text-secondary)] mb-4">{row.description}</p>
          )}
          <DetailGrid items={[
            { label: 'Integration ID', value: <Mono>{row.id}</Mono> },
            { label: 'Vendor',         value: row.vendor },
            { label: 'Version',        value: row.version ?? '—' },
            { label: 'Region',         value: row.region ?? '—' },
            { label: 'Events / Day',   value: row.eventsPerDay.toLocaleString() },
            { label: 'Health Score',   value: `${row.healthScore}%` },
          ]} />
          {row.configKeys && row.configKeys.length > 0 && (
            <div className="mt-3">
              <p className="soc-label mb-1.5">Configuration Fields</p>
              <div className="flex flex-wrap gap-1">
                {row.configKeys.map((k) => <Mono key={k}>{k}</Mono>)}
              </div>
            </div>
          )}
          <div className="mt-4 flex gap-2">
            <RowAction label="Test Connection" />
            <RowAction label="Configure" />
            <RowAction label="View Logs" />
          </div>
        </ExpandPanel>
      )}
    </>
  )
}

export function IntegrationTable({ rows }: { rows: IntegrationRow[] }) {
  return (
    <SocTable columns={['Integration', 'Category', 'Status', 'Health', 'Events', 'Last Sync', '']}>
      {rows.map((r) => <IntegrationTableRow key={r.id} row={r} />)}
    </SocTable>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// 21. CLOUD INTEGRATION ROW  (expandable — cloud-specific metadata)
// ═══════════════════════════════════════════════════════════════════════════════

export type CloudIntegrationRow = {
  id: string
  name: string
  provider: 'aws' | 'azure' | 'gcp' | 'oci' | 'other'
  accountId: string
  regions: string[]
  status: 'active' | 'degraded' | 'inactive' | 'error'
  resources: number
  alerts: number
  misconfigurations: number
  lastScan: string
  complianceScore: number   // 0-100
  services?: string[]
}

const cloudProviderColor: Record<CloudIntegrationRow['provider'], string> = {
  aws:   '#f97316',
  azure: '#3b82f6',
  gcp:   '#16a34a',
  oci:   '#dc2626',
  other: 'var(--soc-accent)',
}

const cloudStatusClass: Record<CloudIntegrationRow['status'], string> = {
  active:   'soc-badge soc-badge-low',
  degraded: 'soc-badge soc-badge-medium',
  inactive: 'soc-badge',
  error:    'soc-badge soc-badge-critical',
}

export function CloudIntegrationTableRow({ row }: { row: CloudIntegrationRow }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <tr className={interactiveRowClass} onClick={() => setOpen((o) => !o)}>
        <td>
          <div className="flex items-center gap-2.5">
            <span
              className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[0.6rem] font-bold text-white"
              style={{ backgroundColor: cloudProviderColor[row.provider] }}
            >
              {row.provider.toUpperCase().slice(0, 3)}
            </span>
            <div>
              <p className="font-medium text-[color:var(--soc-text)]">{row.name}</p>
              <p className="font-mono text-xs text-[color:var(--soc-text-muted)]">{row.accountId}</p>
            </div>
          </div>
        </td>
        <td>
          <div className="flex items-center gap-1.5">
            {row.status === 'active' && <span className="soc-live-dot" />}
            <span className={cloudStatusClass[row.status]}>{row.status}</span>
          </div>
        </td>
        <td className="tabular-nums text-[color:var(--soc-text-secondary)]">{row.resources.toLocaleString()}</td>
        <td>
          {row.alerts > 0
            ? <span className="soc-badge soc-badge-critical">{row.alerts} alerts</span>
            : <span className="soc-badge soc-badge-low">Clean</span>
          }
        </td>
        <td>
          {row.misconfigurations > 0
            ? <span className="soc-badge soc-badge-medium">{row.misconfigurations} issues</span>
            : <span className="soc-badge soc-badge-low">Clean</span>
          }
        </td>
        <td>
          <div className="flex items-center gap-2 min-w-[5rem]">
            <div className="soc-progress-track flex-1">
              <div
                className={`soc-progress-fill ${
                  row.complianceScore >= 80 ? 'bg-[color:var(--soc-low)]'
                  : row.complianceScore >= 60 ? 'bg-[color:var(--soc-medium)]'
                  : 'bg-[color:var(--soc-critical)]'
                }`}
                style={{ width: `${row.complianceScore}%` }}
              />
            </div>
            <span className="text-xs tabular-nums text-[color:var(--soc-text-muted)] w-7 text-right">
              {row.complianceScore}%
            </span>
          </div>
        </td>
        <td className="text-xs text-[color:var(--soc-text-muted)]">{row.lastScan}</td>
        <td><ExpandChevron open={open} /></td>
      </tr>
      {open && (
        <ExpandPanel>
          <DetailGrid items={[
            { label: 'Account ID',       value: <Mono>{row.accountId}</Mono> },
            { label: 'Provider',         value: row.provider.toUpperCase() },
            { label: 'Resources',        value: row.resources.toLocaleString() },
            { label: 'Open Alerts',      value: row.alerts },
            { label: 'Misconfigurations',value: row.misconfigurations },
            { label: 'Compliance',       value: `${row.complianceScore}%` },
            { label: 'Last Scan',        value: row.lastScan },
          ]} />
          <div className="mt-3">
            <p className="soc-label mb-1.5">Active Regions</p>
            <div className="flex flex-wrap gap-1">
              {row.regions.map((r) => <span key={r} className="soc-badge"><Mono>{r}</Mono></span>)}
            </div>
          </div>
          {row.services && row.services.length > 0 && (
            <div className="mt-3">
              <p className="soc-label mb-1.5">Monitored Services</p>
              <div className="flex flex-wrap gap-1">
                {row.services.map((s) => <span key={s} className="soc-badge">{s}</span>)}
              </div>
            </div>
          )}
          <div className="mt-4 flex gap-2">
            <RowAction label="Scan Now" />
            <RowAction label="View Assets" />
            <RowAction label="Compliance Report" />
          </div>
        </ExpandPanel>
      )}
    </>
  )
}

export function CloudIntegrationTable({ rows }: { rows: CloudIntegrationRow[] }) {
  return (
    <SocTable columns={['Account', 'Status', 'Resources', 'Alerts', 'Misconfigs', 'Compliance', 'Last Scan', '']}>
      {rows.map((r) => <CloudIntegrationTableRow key={r.id} row={r} />)}
    </SocTable>
  )
}
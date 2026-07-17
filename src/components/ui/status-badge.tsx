import type { AlertStatus, IncidentStatus, InvestigationStatus } from '../../domain/enums'

type AnyStatus = AlertStatus | IncidentStatus | InvestigationStatus

const STYLE: Record<AnyStatus, { label: string; tone: string; bg: string }> = {
  // alerts
  new: { label: 'NEW', tone: 'var(--soc-critical)', bg: 'var(--soc-critical-bg)' },
  triaged: { label: 'TRIAGED', tone: 'var(--soc-high)', bg: 'var(--soc-high-bg)' },
  dismissed: { label: 'DISMISSED', tone: 'var(--soc-text-muted)', bg: 'var(--soc-overlay)' },
  // incidents
  declared: { label: 'DECLARED', tone: 'var(--soc-critical)', bg: 'var(--soc-critical-bg)' },
  contained: { label: 'CONTAINED', tone: 'var(--soc-medium)', bg: 'var(--soc-medium-bg)' },
  closed: { label: 'CLOSED', tone: 'var(--soc-text-muted)', bg: 'var(--soc-overlay)' },
  // shared by alerts + incidents
  resolved: { label: 'RESOLVED', tone: 'var(--soc-low)', bg: 'var(--soc-low-bg)' },
  // investigations
  open: { label: 'OPEN', tone: 'var(--soc-high)', bg: 'var(--soc-high-bg)' },
  active: { label: 'ACTIVE', tone: 'var(--soc-medium)', bg: 'var(--soc-medium-bg)' },
}

export function StatusBadge({ status }: { status: AnyStatus }) {
  const style = STYLE[status]
  return (
    <span className="soc-badge" style={{ backgroundColor: style.bg, color: style.tone }}>
      {style.label}
    </span>
  )
}

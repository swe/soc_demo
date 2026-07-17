import type {
  AlertStatus,
  EntityStatus,
  IncidentStatus,
  InvestigationStatus,
  MembershipStatus,
  VulnerabilityStatus,
} from '../../domain/enums'

type AnyStatus =
  | AlertStatus
  | IncidentStatus
  | InvestigationStatus
  | EntityStatus
  | VulnerabilityStatus
  | MembershipStatus

const STYLE: Record<AnyStatus, { label: string; tone: string; bg: string }> = {
  // alerts
  new: { label: 'NEW', tone: 'var(--soc-critical)', bg: 'var(--soc-critical-bg)' },
  triaged: { label: 'TRIAGED', tone: 'var(--soc-high)', bg: 'var(--soc-high-bg)' },
  dismissed: { label: 'DISMISSED', tone: 'var(--soc-text-muted)', bg: 'var(--soc-overlay)' },
  // incidents
  declared: { label: 'DECLARED', tone: 'var(--soc-critical)', bg: 'var(--soc-critical-bg)' },
  contained: { label: 'CONTAINED', tone: 'var(--soc-medium)', bg: 'var(--soc-medium-bg)' },
  closed: { label: 'CLOSED', tone: 'var(--soc-text-muted)', bg: 'var(--soc-overlay)' },
  // shared by alerts + incidents + vulnerabilities
  resolved: { label: 'RESOLVED', tone: 'var(--soc-low)', bg: 'var(--soc-low-bg)' },
  // investigations (open also used by vulnerabilities; active also by entities)
  open: { label: 'OPEN', tone: 'var(--soc-high)', bg: 'var(--soc-high-bg)' },
  active: { label: 'ACTIVE', tone: 'var(--soc-medium)', bg: 'var(--soc-medium-bg)' },
  // graph entities (assets, identities)
  discovered: { label: 'DISCOVERED', tone: 'var(--soc-medium)', bg: 'var(--soc-medium-bg)' },
  disabled: { label: 'DISABLED', tone: 'var(--soc-text-muted)', bg: 'var(--soc-overlay)' },
  decommissioned: { label: 'DECOMMISSIONED', tone: 'var(--soc-text-muted)', bg: 'var(--soc-overlay)' },
  deprovisioned: { label: 'DEPROVISIONED', tone: 'var(--soc-text-muted)', bg: 'var(--soc-overlay)' },
  // vulnerabilities
  in_progress: { label: 'IN PROGRESS', tone: 'var(--soc-medium)', bg: 'var(--soc-medium-bg)' },
  accepted: { label: 'ACCEPTED', tone: 'var(--soc-text-muted)', bg: 'var(--soc-overlay)' },
  // memberships
  invited: { label: 'INVITED', tone: 'var(--soc-medium)', bg: 'var(--soc-medium-bg)' },
  suspended: { label: 'SUSPENDED', tone: 'var(--soc-critical)', bg: 'var(--soc-critical-bg)' },
}

export function StatusBadge({ status }: { status: AnyStatus }) {
  const style = STYLE[status]
  return (
    <span className="soc-badge" style={{ backgroundColor: style.bg, color: style.tone }}>
      {style.label}
    </span>
  )
}

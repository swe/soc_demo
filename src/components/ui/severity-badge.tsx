import type { Severity } from '../../domain/enums'

const STYLE: Record<Severity, { tone: string; bg: string }> = {
  critical: { tone: 'var(--soc-critical)', bg: 'var(--soc-critical-bg)' },
  high: { tone: 'var(--soc-high)', bg: 'var(--soc-high-bg)' },
  medium: { tone: 'var(--soc-medium)', bg: 'var(--soc-medium-bg)' },
  low: { tone: 'var(--soc-low)', bg: 'var(--soc-low-bg)' },
}

export function SeverityBadge({ severity }: { severity: Severity }) {
  const style = STYLE[severity]
  return (
    <span className="soc-badge" style={{ backgroundColor: style.bg, color: style.tone }}>
      {severity.toUpperCase()}
    </span>
  )
}

/** Accent color for a severity — for severity rails, chart series, dots. */
export function severityColor(severity: Severity): string {
  return STYLE[severity].tone
}

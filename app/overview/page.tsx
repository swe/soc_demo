'use client'

import { useEffect, useState } from 'react'
import { usePageTitle } from '@/app/page-title-context'

const INCIDENTS = [
  { id: 'INC-2024-001', title: 'Ransomware Attack Detected', severity: 'critical', status: 'investigating', category: 'Malware', detectedAt: '15m ago', assignedTo: 'Sarah Chen', affectedAssets: 23 },
  { id: 'INC-2024-009', title: 'Supply Chain Alert — npm Package', severity: 'critical', status: 'new', category: 'Supply Chain', detectedAt: '3d ago', assignedTo: 'Sarah Chen', affectedAssets: 14 },
  { id: 'INC-2024-003', title: 'Privilege Escalation — Domain Admin', severity: 'high', status: 'investigating', category: 'Unauthorized Access', detectedAt: '4h ago', assignedTo: 'Sarah Chen', affectedAssets: 2 },
  { id: 'INC-2024-005', title: 'Phishing Campaign — CFO Impersonation', severity: 'high', status: 'investigating', category: 'Social Engineering', detectedAt: '10h ago', assignedTo: 'Emily Taylor', affectedAssets: 8 },
  { id: 'INC-2024-008', title: 'Insider Threat — Bulk Download', severity: 'high', status: 'investigating', category: 'Insider Threat', detectedAt: '2d ago', assignedTo: 'James Rodriguez', affectedAssets: 1 },
]

const SEV_COLOR: Record<string, string> = {
  critical: 'var(--soc-critical)',
  high:     'var(--soc-high)',
  medium:   'var(--soc-medium)',
  low:      'var(--soc-low)',
}

const SEV_BG: Record<string, string> = {
  critical: 'var(--soc-critical-bg)',
  high:     'var(--soc-high-bg)',
  medium:   'var(--soc-medium-bg)',
  low:      'var(--soc-low-bg)',
}

const STATUS_COLOR: Record<string, string> = {
  investigating: 'var(--soc-high)',
  new:           'var(--soc-critical)',
  contained:     'var(--soc-medium)',
  resolved:      'var(--soc-low)',
  closed:        'var(--soc-text-muted)',
}

const COMPLIANCE = [
  { name: 'PCI DSS',   score: 94, delta: '+2%',  status: 'compliant' },
  { name: 'SOC 2',     score: 97, delta: '+1%',  status: 'compliant' },
  { name: 'ISO 27001', score: 89, delta: '-1%',  status: 'partial' },
  { name: 'GDPR',      score: 91, delta: '0%',   status: 'compliant' },
  { name: 'HIPAA',     score: 78, delta: '-3%',  status: 'partial' },
]

const RISK_DIMENSIONS = [
  { label: 'Threat Exposure',  score: 61, delta: -2 },
  { label: 'Patch Posture',    score: 84, delta: +5 },
  { label: 'Identity Risk',    score: 71, delta: -1 },
  { label: 'Network Exposure', score: 68, delta:  0 },
  { label: 'Data Protection',  score: 79, delta: +2 },
]

const TEAM_ACTIVITY = [
  { analyst: 'Sarah Chen',      role: 'Lead Analyst',  assigned: 3, resolved: 2, mttr: '2.1h' },
  { analyst: 'James Rodriguez', role: 'Analyst II',     assigned: 2, resolved: 4, mttr: '3.4h' },
  { analyst: 'Emily Taylor',    role: 'Analyst II',     assigned: 2, resolved: 1, mttr: '5.2h' },
  { analyst: 'Michael Kim',     role: 'Analyst I',      assigned: 1, resolved: 3, mttr: '4.1h' },
  { analyst: 'Alex Petrov',     role: 'Analyst I',      assigned: 1, resolved: 2, mttr: '3.8h' },
]

const ALERT_SPARK  = [42, 67, 55, 81, 73, 94, 127]
const BLOCK_SPARK  = [1840, 2100, 1950, 2380, 2200, 2570, 2341]
const INC_SPARK    = [3, 5, 4, 6, 4, 5, 6]
const RISK_SPARK   = [78, 75, 76, 74, 73, 74, 73]

function SparkBar({ values, color }: { values: number[]; color: string }) {
  const max = Math.max(...values)
  return (
    <div className="flex items-end gap-0.5" style={{ height: '24px' }}>
      {values.map((v, i) => (
        <div
          key={i}
          style={{
            width: '4px',
            height: `${(v / max) * 100}%`,
            backgroundColor: color,
            opacity: i === values.length - 1 ? 1 : 0.35,
            borderRadius: '1px',
          }}
        />
      ))}
    </div>
  )
}

function TrendBadge({ delta }: { delta: number }) {
  if (delta === 0) return <span className="soc-trend soc-trend-stable">—</span>
  if (delta > 0) return <span className="soc-trend soc-trend-down">▲ +{delta}</span>
  return <span className="soc-trend soc-trend-up">▼ {delta}</span>
}

export default function OverviewPage() {
  const { setPageTitle } = usePageTitle()
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    setPageTitle('Security Operations Center')
    const t = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(t)
  }, [setPageTitle])

  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

  const criticalCount = INCIDENTS.filter(i => i.severity === 'critical').length
  const openCount = INCIDENTS.filter(i => i.status !== 'resolved' && i.status !== 'closed').length
  const overallRisk = 73
  const riskLabel = overallRisk < 60 ? 'LOW RISK' : overallRisk < 75 ? 'MODERATE' : overallRisk < 85 ? 'ELEVATED' : 'HIGH RISK'
  const riskColor = overallRisk < 60 ? 'var(--soc-low)' : overallRisk < 75 ? 'var(--soc-medium)' : 'var(--soc-high)'

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-6">

      {/* Top bar */}
      <div className="flex items-center justify-between mb-5 hig-fade-in">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="soc-live-dot" />
            <span className="text-xs font-semibold" style={{ color: 'var(--soc-low)' }}>LIVE</span>
            <span style={{ color: 'var(--soc-text-dim)' }}>·</span>
            <span className="text-xs" style={{ color: 'var(--soc-text-muted)' }}>{dateStr} · {timeStr}</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--soc-text)' }}>
            Security Operations Center
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="soc-btn soc-btn-secondary">Export Report</button>
          <button className="soc-btn soc-btn-primary">+ New Incident</button>
        </div>
      </div>

      {/* Situation banner */}
      <div
        className="rounded-lg px-4 py-3 mb-5 flex items-center gap-5 flex-wrap"
        style={{
          backgroundColor: criticalCount > 0 ? 'var(--soc-critical-bg)' : 'var(--soc-accent-bg)',
          border: `1px solid ${criticalCount > 0 ? 'var(--soc-critical)' : 'var(--soc-accent)'}33`,
        }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ backgroundColor: criticalCount > 0 ? 'var(--soc-critical)' : 'var(--soc-accent)' }}
          />
          <span className="text-sm font-semibold" style={{ color: criticalCount > 0 ? 'var(--soc-critical)' : 'var(--soc-accent)' }}>
            {criticalCount > 0
              ? `${criticalCount} critical incident${criticalCount > 1 ? 's' : ''} require immediate attention`
              : 'No critical incidents — posture nominal'}
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--soc-text-secondary)' }}>
          <span><strong style={{ color: 'var(--soc-text)' }}>{openCount}</strong> open incidents</span>
          <span><strong style={{ color: 'var(--soc-text)' }}>2,341</strong> threats blocked today</span>
          <span>Block rate <strong style={{ color: 'var(--soc-low)' }}>95.3%</strong></span>
          <span>MTTR <strong style={{ color: 'var(--soc-text)' }}>3.8h</strong></span>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'ACTIVE THREATS',  value: '47',   spark: ALERT_SPARK, sparkColor: 'var(--soc-critical)', sub: '↑ 3 since yesterday', subColor: 'var(--soc-critical)' },
          { label: 'OPEN INCIDENTS',  value: String(openCount), spark: INC_SPARK,  sparkColor: 'var(--soc-high)', sub: `${criticalCount} critical`, subColor: 'var(--soc-high)' },
          { label: 'RISK SCORE',      value: String(overallRisk), spark: RISK_SPARK, sparkColor: riskColor, sub: riskLabel, subColor: riskColor },
          { label: 'BLOCKED TODAY',   value: '2,341', spark: BLOCK_SPARK, sparkColor: 'var(--soc-low)', sub: '↑ +12% vs avg', subColor: 'var(--soc-low)' },
        ].map(({ label, value, spark, sparkColor, sub, subColor }) => (
          <div key={label} className="soc-card flex flex-col gap-3">
            <p className="soc-label">{label}</p>
            <div className="flex items-end justify-between">
              <p className="soc-metric-lg">{value}</p>
              <SparkBar values={spark} color={sparkColor} />
            </div>
            <p className="text-xs font-medium" style={{ color: subColor }}>{sub}</p>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-12 gap-4 mb-4">

        {/* Left: incidents + team */}
        <div className="col-span-12 lg:col-span-8 space-y-4">

          {/* Requires attention */}
          <div className="soc-card p-0 overflow-hidden">
            <div className="px-4 py-3 flex items-center justify-between border-b" style={{ borderColor: 'var(--soc-border)' }}>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: 'var(--soc-critical)' }} />
                <p className="soc-label">REQUIRES ATTENTION</p>
              </div>
              <a href="/overview/incidents" className="soc-link text-xs">All incidents →</a>
            </div>
            {INCIDENTS.map((inc, idx, arr) => {
              const sc = SEV_COLOR[inc.severity]
              const sbg = SEV_BG[inc.severity]
              const stc = STATUS_COLOR[inc.status]
              return (
                <div
                  key={inc.id}
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-all"
                  style={{
                    borderBottom: idx < arr.length - 1 ? `1px solid var(--soc-border)` : 'none',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.backgroundColor = 'var(--soc-raised)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent' }}
                >
                  <div className="w-0.5 self-stretch rounded-full flex-shrink-0" style={{ backgroundColor: sc, minHeight: '2rem' }} />
                  <span className="text-xs font-mono w-28 flex-shrink-0" style={{ color: 'var(--soc-text-muted)' }}>{inc.id}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--soc-text)' }}>{inc.title}</p>
                    <p className="text-xs" style={{ color: 'var(--soc-text-secondary)' }}>
                      {inc.category} · {inc.affectedAssets} assets · {inc.assignedTo}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="soc-badge" style={{ backgroundColor: sbg, color: sc }}>{inc.severity.toUpperCase()}</span>
                    <span className="soc-badge" style={{ color: stc, border: `1px solid ${stc}44`, background: 'transparent' }}>{inc.status}</span>
                    <span className="text-xs tabular-nums" style={{ color: 'var(--soc-text-muted)' }}>{inc.detectedAt}</span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Team performance */}
          <div className="soc-card p-0 overflow-hidden">
            <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--soc-border)' }}>
              <p className="soc-label">TEAM PERFORMANCE</p>
              <span className="text-xs" style={{ color: 'var(--soc-text-muted)' }}>Today</span>
            </div>
            <table className="soc-table">
              <thead>
                <tr>
                  <th>Analyst</th>
                  <th className="text-center">Assigned</th>
                  <th className="text-center">Resolved</th>
                  <th className="text-right">MTTR</th>
                </tr>
              </thead>
              <tbody>
                {TEAM_ACTIVITY.map((a) => (
                  <tr key={a.analyst}>
                    <td>
                      <p className="text-sm font-medium" style={{ color: 'var(--soc-text)' }}>{a.analyst}</p>
                      <p className="text-xs" style={{ color: 'var(--soc-text-muted)' }}>{a.role}</p>
                    </td>
                    <td className="text-center">
                      <span className="text-sm tabular-nums font-semibold" style={{ color: 'var(--soc-text)' }}>{a.assigned}</span>
                    </td>
                    <td className="text-center">
                      <span className="text-sm tabular-nums font-semibold" style={{ color: 'var(--soc-low)' }}>{a.resolved}</span>
                    </td>
                    <td className="text-right">
                      <span className="text-sm tabular-nums font-mono" style={{ color: 'var(--soc-text-secondary)' }}>{a.mttr}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: risk + compliance + soc metrics */}
        <div className="col-span-12 lg:col-span-4 space-y-4">

          {/* Risk scorecard */}
          <div className="soc-card">
            <div className="flex items-center justify-between mb-3">
              <p className="soc-label">RISK SCORECARD</p>
              <span className="soc-badge soc-badge-high">{riskLabel}</span>
            </div>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="soc-metric-lg" style={{ color: riskColor }}>{overallRisk}</span>
              <span className="soc-trend soc-trend-up text-xs">▼ -2pts this week</span>
            </div>
            <div className="soc-risk-bar mb-4">
              <div className="soc-risk-indicator" style={{ left: `${overallRisk}%` }} />
            </div>
            <div className="space-y-2.5">
              {RISK_DIMENSIONS.map(({ label, score, delta }) => (
                <div key={label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs" style={{ color: 'var(--soc-text-secondary)' }}>{label}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold tabular-nums" style={{ color: 'var(--soc-text)' }}>{score}</span>
                      <TrendBadge delta={delta} />
                    </div>
                  </div>
                  <div className="soc-progress-track">
                    <div
                      className="soc-progress-fill"
                      style={{
                        width: `${score}%`,
                        backgroundColor: score >= 80 ? 'var(--soc-low)' : score >= 65 ? 'var(--soc-medium)' : 'var(--soc-critical)',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Compliance */}
          <div className="soc-card">
            <div className="flex items-center justify-between mb-3">
              <p className="soc-label">COMPLIANCE</p>
              <a href="/overview/compliance" className="soc-link text-xs">Details →</a>
            </div>
            {COMPLIANCE.map(({ name, score, delta, status }, i, arr) => (
              <div
                key={name}
                className="flex items-center justify-between py-2"
                style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--soc-border)' : 'none' }}
              >
                <div className="flex items-center gap-2">
                  <div className="soc-dot" style={{ backgroundColor: status === 'compliant' ? 'var(--soc-low)' : 'var(--soc-medium)' }} />
                  <span className="text-xs" style={{ color: 'var(--soc-text)' }}>{name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs" style={{ color: delta.startsWith('-') ? 'var(--soc-critical)' : delta === '0%' ? 'var(--soc-text-muted)' : 'var(--soc-low)' }}>{delta}</span>
                  <span className="text-sm font-bold tabular-nums" style={{ color: score >= 90 ? 'var(--soc-low)' : score >= 80 ? 'var(--soc-medium)' : 'var(--soc-critical)' }}>{score}%</span>
                </div>
              </div>
            ))}
          </div>

          {/* SOC metrics */}
          <div className="soc-card">
            <p className="soc-label mb-3">SOC METRICS</p>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {[
                { label: 'MTTR', value: '3.8h' },
                { label: 'SLA',  value: '91%' },
                { label: 'FPR',  value: '6.2%' },
              ].map(({ label, value }) => (
                <div key={label} className="p-2 rounded" style={{ backgroundColor: 'var(--soc-raised)', textAlign: 'center' }}>
                  <p className="soc-label">{label}</p>
                  <p className="text-base font-bold mt-0.5" style={{ color: 'var(--soc-text)' }}>{value}</p>
                </div>
              ))}
            </div>
            <div className="soc-divider" />
            {[
              { label: 'Alerts today', value: '127', trend: '↑ +12%', good: false },
              { label: 'Closed today', value: '94',  trend: '↑ +8%',  good: true },
              { label: 'Escalated',   value: '3',   trend: '→ steady', good: null },
            ].map(({ label, value, trend, good }, i, arr) => (
              <div
                key={label}
                className="flex items-center justify-between py-2"
                style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--soc-border)' : 'none' }}
              >
                <span className="text-xs" style={{ color: 'var(--soc-text-secondary)' }}>{label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold tabular-nums" style={{ color: 'var(--soc-text)' }}>{value}</span>
                  <span className="text-xs" style={{ color: good === true ? 'var(--soc-low)' : good === false ? 'var(--soc-critical)' : 'var(--soc-text-muted)' }}>{trend}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row: threat map + integrations */}
      <div className="grid grid-cols-12 gap-4">

        {/* Threat map */}
        <div className="col-span-12 lg:col-span-8 soc-card p-0 overflow-hidden">
          <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--soc-border)' }}>
            <p className="soc-label">GLOBAL THREAT ACTIVITY</p>
            <span className="text-xs" style={{ color: 'var(--soc-text-muted)' }}>Last 24 hours</span>
          </div>
          <div
            className="relative"
            style={{ height: '180px', backgroundColor: 'var(--soc-raised)' }}
          >
            {/* Grid overlay */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 180" fill="none" style={{ opacity: 0.06 }}>
              {Array.from({ length: 21 }).map((_, i) => (
                <line key={`v${i}`} x1={i * 40} y1="0" x2={i * 40} y2="180" stroke="currentColor" strokeWidth="1" />
              ))}
              {Array.from({ length: 5 }).map((_, i) => (
                <line key={`h${i}`} x1="0" y1={i * 45} x2="800" y2={i * 45} stroke="currentColor" strokeWidth="1" />
              ))}
            </svg>

            {/* Origin dots */}
            {[
              { x: '72%', y: '35%', color: 'var(--soc-critical)', size: 7, label: 'RU' },
              { x: '80%', y: '40%', color: 'var(--soc-high)',     size: 5, label: 'CN' },
              { x: '22%', y: '30%', color: 'var(--soc-medium)',   size: 6, label: 'US' },
              { x: '55%', y: '62%', color: 'var(--soc-high)',     size: 4, label: 'BR' },
              { x: '62%', y: '28%', color: 'var(--soc-medium)',   size: 5, label: 'IR' },
              { x: '48%', y: '25%', color: 'var(--soc-low)',      size: 3, label: 'DE' },
            ].map(({ x, y, color, size, label }) => (
              <div
                key={label}
                className="absolute flex flex-col items-center gap-0.5"
                style={{ left: x, top: y, transform: 'translate(-50%, -50%)' }}
              >
                <div
                  className="rounded-full animate-pulse"
                  style={{ width: size * 2, height: size * 2, backgroundColor: color, boxShadow: `0 0 ${size * 3}px ${color}60` }}
                />
                <span style={{ fontSize: '9px', fontWeight: 700, color }}>{label}</span>
              </div>
            ))}

            <div className="absolute bottom-3 left-4">
              <p className="text-xs" style={{ color: 'var(--soc-text-secondary)' }}>
                14 attack origins · 6 countries · 2,341 blocked
              </p>
            </div>
          </div>
        </div>

        {/* Integrations */}
        <div className="col-span-12 lg:col-span-4 soc-card">
          <div className="flex items-center justify-between mb-3">
            <p className="soc-label">INTEGRATIONS</p>
            <a href="/overview/administration/integrations" className="soc-link text-xs">Manage →</a>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { label: 'ACTIVE',  value: '8', color: 'var(--soc-low)' },
              { label: 'WARNING', value: '1', color: 'var(--soc-medium)' },
              { label: 'ERROR',   value: '3', color: 'var(--soc-critical)' },
            ].map(({ label, value, color }) => (
              <div key={label} className="p-2 rounded text-center" style={{ backgroundColor: 'var(--soc-raised)' }}>
                <p className="text-xl font-bold" style={{ color }}>{value}</p>
                <p className="soc-label mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {[
            { name: 'Splunk SIEM',        status: 'connected', events: '45.2k' },
            { name: 'CrowdStrike Falcon', status: 'connected', events: '23.8k' },
            { name: 'AWS CloudTrail',     status: 'connected', events: '156.7k' },
            { name: 'FortiGate',          status: 'warning',   events: '67.4k' },
            { name: 'Tenable Nessus',     status: 'error',     events: '—' },
          ].map(({ name, status, events }, i, arr) => {
            const dotColor = status === 'connected' ? 'var(--soc-low)' : status === 'warning' ? 'var(--soc-medium)' : 'var(--soc-critical)'
            return (
              <div
                key={name}
                className="flex items-center justify-between py-2"
                style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--soc-border)' : 'none' }}
              >
                <div className="flex items-center gap-2">
                  <div className="soc-dot" style={{ backgroundColor: dotColor }} />
                  <span className="text-xs" style={{ color: 'var(--soc-text)' }}>{name}</span>
                </div>
                <span className="text-xs tabular-nums font-mono" style={{ color: 'var(--soc-text-muted)' }}>{events}/day</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

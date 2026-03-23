'use client'
import { useEffect, useState } from 'react'
import { usePageTitle } from '@/app/page-title-context'

interface Incident {
  id: string
  title: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  status: 'new' | 'investigating' | 'contained' | 'resolved' | 'closed'
  category: string
  detectedAt: string
  assignedTo: string
  affectedAssets: number
  mitreTechniques: string[]
  description: string
}

const INCIDENTS: Incident[] = [
  { id: 'INC-2024-001', title: 'Ransomware Attack Detected', severity: 'critical', status: 'investigating', category: 'Malware', detectedAt: '15m ago', assignedTo: 'Sarah Chen', affectedAssets: 23, mitreTechniques: ['T1486', 'T1490', 'T1489'], description: 'LockBit 3.0 ransomware payload detected on prod-db-01. Lateral movement in progress. 23 assets potentially affected.' },
  { id: 'INC-2024-002', title: 'Data Exfiltration Attempt', severity: 'high', status: 'contained', category: 'Data Breach', detectedAt: '2h ago', assignedTo: 'James Rodriguez', affectedAssets: 5, mitreTechniques: ['T1048', 'T1567'], description: 'Large outbound data transfer detected to 185.220.101.43. DLP rule triggered on finance-ws-12.' },
  { id: 'INC-2024-003', title: 'Privilege Escalation — Domain Admin', severity: 'high', status: 'investigating', category: 'Unauthorized Access', detectedAt: '4h ago', assignedTo: 'Sarah Chen', affectedAssets: 2, mitreTechniques: ['T1068', 'T1078'], description: 'Kerberoasting attack detected. Service account credentials compromised. Attacker attempting DA elevation.' },
  { id: 'INC-2024-004', title: 'DDoS Attack on Web Infrastructure', severity: 'medium', status: 'resolved', category: 'Network Attack', detectedAt: '8h ago', assignedTo: 'Michael Kim', affectedAssets: 12, mitreTechniques: ['T1498', 'T1499'], description: 'HTTP/2 Rapid Reset attack peaking at 3.2M RPS. WAF rate limiting engaged. Fully mitigated.' },
  { id: 'INC-2024-005', title: 'Phishing Campaign — CFO Impersonation', severity: 'high', status: 'investigating', category: 'Social Engineering', detectedAt: '10h ago', assignedTo: 'Emily Taylor', affectedAssets: 8, mitreTechniques: ['T1566', 'T1598'], description: 'Spear-phishing campaign targeting finance team. 8 users clicked malicious link. Credential harvesting form deployed.' },
  { id: 'INC-2024-006', title: 'Cryptominer on Cloud VM', severity: 'medium', status: 'resolved', category: 'Malware', detectedAt: '1d ago', assignedTo: 'Alex Petrov', affectedAssets: 3, mitreTechniques: ['T1496', 'T1059.004'], description: 'XMRig cryptominer detected on AWS EC2 instance. Suspected compromise via exposed Docker API.' },
  { id: 'INC-2024-007', title: 'Brute Force on VPN Gateway', severity: 'medium', status: 'contained', category: 'Credential Attack', detectedAt: '1d ago', assignedTo: 'Michael Kim', affectedAssets: 1, mitreTechniques: ['T1110', 'T1133'], description: '47,000 login attempts from 203.0.113.8 over 6 hours. Account lockout policy engaged. IP blocked at perimeter.' },
  { id: 'INC-2024-008', title: 'Insider Threat — Bulk Download', severity: 'high', status: 'investigating', category: 'Insider Threat', detectedAt: '2d ago', assignedTo: 'James Rodriguez', affectedAssets: 1, mitreTechniques: ['T1005', 'T1039'], description: 'Employee downloaded 4.7GB of customer data to personal USB drive. DLP alert triggered. HR involved.' },
  { id: 'INC-2024-009', title: 'Supply Chain Alert — npm Package', severity: 'critical', status: 'new', category: 'Supply Chain', detectedAt: '3d ago', assignedTo: 'Sarah Chen', affectedAssets: 14, mitreTechniques: ['T1195', 'T1059.007'], description: 'Malicious npm package "lodash-utils" in CI/CD pipeline. Backdoor with C2 callback to 91.219.236.197.' },
  { id: 'INC-2024-010', title: 'Lateral Movement via WMI', severity: 'high', status: 'closed', category: 'Lateral Movement', detectedAt: '5d ago', assignedTo: 'Emily Taylor', affectedAssets: 7, mitreTechniques: ['T1047', 'T1021'], description: 'Attacker used WMI to move laterally across 7 workstations. Fully contained and remediated. RCA complete.' },
]

const MITRE_COVERAGE = [
  { tactic: 'Initial Access',       pct: 78 },
  { tactic: 'Execution',            pct: 65 },
  { tactic: 'Persistence',          pct: 82 },
  { tactic: 'Privilege Escalation', pct: 71 },
  { tactic: 'Defense Evasion',      pct: 58 },
  { tactic: 'Command & Control',    pct: 89 },
]

const SEV: Record<string, { color: string; bg: string }> = {
  critical: { color: 'var(--soc-critical)', bg: 'var(--soc-critical-bg)' },
  high:     { color: 'var(--soc-high)',     bg: 'var(--soc-high-bg)' },
  medium:   { color: 'var(--soc-medium)',   bg: 'var(--soc-medium-bg)' },
  low:      { color: 'var(--soc-low)',      bg: 'var(--soc-low-bg)' },
}

const STAT: Record<string, string> = {
  new:           'var(--soc-critical)',
  investigating: 'var(--soc-high)',
  contained:     'var(--soc-medium)',
  resolved:      'var(--soc-low)',
  closed:        'var(--soc-text-muted)',
}

const FILTERS = ['all', 'new', 'investigating', 'contained', 'resolved', 'closed'] as const

export default function IncidentsPage() {
  const { setPageTitle } = usePageTitle()
  const [filter, setFilter] = useState<string>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [selected, setSelected] = useState<Incident | null>(null)

  useEffect(() => { setPageTitle('Incidents') }, [setPageTitle])

  const visible = filter === 'all' ? INCIDENTS : INCIDENTS.filter(i => i.status === filter)

  const stats = {
    critical:     INCIDENTS.filter(i => i.severity === 'critical').length,
    high:         INCIDENTS.filter(i => i.severity === 'high').length,
    investigating:INCIDENTS.filter(i => i.status === 'investigating').length,
    resolved:     INCIDENTS.filter(i => i.status === 'resolved' || i.status === 'closed').length,
  }

  const seenCats = new Set<string>()
  const catCounts = INCIDENTS
    .map(i => i.category)
    .filter(c => { if (seenCats.has(c)) return false; seenCats.add(c); return true })
    .map(cat => ({ cat, n: INCIDENTS.filter(i => i.category === cat).length }))
    .sort((a, b) => b.n - a.n)

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-6">

      {/* Header */}
      <div className="flex items-start justify-between mb-5 hig-fade-in">
        <div>
          <p className="soc-label mb-1">SECURITY INCIDENTS</p>
          <h1 className="text-xl font-bold tracking-tight mb-1.5" style={{ color: 'var(--soc-text)' }}>
            Incident Management
          </h1>
          <p className="text-sm" style={{ color: 'var(--soc-text-secondary)' }}>
            {stats.critical > 0
              ? <><strong style={{ color: 'var(--soc-critical)' }}>{stats.critical} critical</strong> {stats.critical === 1 ? 'incident requires' : 'incidents require'} immediate attention.</>
              : 'No critical incidents.'
            }
            {' '}{stats.investigating} under investigation · MTTR{' '}
            <strong style={{ color: 'var(--soc-text)' }}>3.8h</strong>
          </p>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <button className="soc-btn soc-btn-secondary">Export</button>
          <button className="soc-btn soc-btn-primary">+ New Incident</button>
        </div>
      </div>

      {/* Severity summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'CRITICAL', count: stats.critical,      color: 'var(--soc-critical)', bg: 'var(--soc-critical-bg)', desc: 'Immediate action' },
          { label: 'HIGH',     count: stats.high,           color: 'var(--soc-high)',     bg: 'var(--soc-high-bg)',     desc: 'Elevated priority' },
          { label: 'ACTIVE',   count: stats.investigating,  color: 'var(--soc-medium)',   bg: 'var(--soc-medium-bg)',   desc: 'Investigating now' },
          { label: 'RESOLVED', count: stats.resolved,       color: 'var(--soc-low)',      bg: 'var(--soc-low-bg)',      desc: 'Contained or closed' },
        ].map(({ label, count, color, bg, desc }) => (
          <div
            key={label}
            className="soc-card flex flex-col gap-2"
          >
            <p className="soc-label">{label}</p>
            <p className="soc-metric-sm" style={{ color }}>{count}</p>
            <p className="text-xs" style={{ color: 'var(--soc-text-muted)' }}>{desc}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-4">

        {/* Main list */}
        <div className="col-span-12 lg:col-span-8 space-y-3">

          {/* Filter bar */}
          <div className="flex items-center gap-2 flex-wrap">
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="soc-btn"
                style={filter === f ? {
                  backgroundColor: 'var(--soc-accent)',
                  borderColor: 'var(--soc-accent)',
                  color: '#fff',
                } : {
                  borderColor: 'var(--soc-border-mid)',
                  color: 'var(--soc-text-secondary)',
                  background: 'transparent',
                }}
              >
                {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                {f === 'all' && (
                  <span className="ml-1.5 text-xs" style={{ opacity: 0.7 }}>{INCIDENTS.length}</span>
                )}
              </button>
            ))}
            <span className="text-xs ml-1" style={{ color: 'var(--soc-text-muted)' }}>
              {visible.length} incident{visible.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Table */}
          <div className="soc-card p-0 overflow-hidden">
            <table className="soc-table">
              <thead>
                <tr>
                  <th style={{ width: '4px', padding: '0.5rem 0' }} />
                  <th>Incident</th>
                  <th>Severity</th>
                  <th>Status</th>
                  <th>Assets</th>
                  <th>Assignee</th>
                  <th className="text-right">Detected</th>
                  <th style={{ width: '60px' }} />
                </tr>
              </thead>
              <tbody>
                {visible.map((inc) => {
                  const sc = SEV[inc.severity]
                  const stc = STAT[inc.status]
                  const isExpanded = expandedId === inc.id

                  return (
                    <>
                      <tr
                        key={inc.id}
                        className="cursor-pointer"
                        onClick={() => setExpandedId(isExpanded ? null : inc.id)}
                        style={{ backgroundColor: isExpanded ? 'var(--soc-raised)' : 'transparent' }}
                      >
                        {/* Severity bar cell */}
                        <td style={{ padding: 0, width: '4px' }}>
                          <div style={{ width: '3px', height: '100%', minHeight: '3rem', backgroundColor: sc.color, borderRadius: '0 2px 2px 0' }} />
                        </td>
                        <td>
                          <p className="text-sm font-medium" style={{ color: 'var(--soc-text)' }}>{inc.title}</p>
                          <p className="text-xs mt-0.5 font-mono" style={{ color: 'var(--soc-text-muted)' }}>{inc.id} · {inc.category}</p>
                        </td>
                        <td>
                          <span className="soc-badge" style={{ backgroundColor: sc.bg, color: sc.color }}>
                            {inc.severity.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <span className="soc-badge" style={{ color: stc, border: `1px solid ${stc}44`, background: 'transparent' }}>
                            {inc.status}
                          </span>
                        </td>
                        <td>
                          <span className="text-sm tabular-nums" style={{ color: 'var(--soc-text)' }}>{inc.affectedAssets}</span>
                        </td>
                        <td>
                          <span className="text-xs" style={{ color: 'var(--soc-text-secondary)' }}>{inc.assignedTo}</span>
                        </td>
                        <td className="text-right">
                          <span className="text-xs tabular-nums" style={{ color: 'var(--soc-text-muted)' }}>{inc.detectedAt}</span>
                        </td>
                        <td>
                          <div className="flex items-center gap-1 justify-end">
                            <button
                              onClick={e => { e.stopPropagation(); setSelected(inc) }}
                              className="soc-link text-xs"
                            >
                              Details
                            </button>
                            <svg
                              className="w-3.5 h-3.5 transition-transform"
                              style={{ color: 'var(--soc-text-muted)', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                              fill="none" stroke="currentColor" viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr key={`${inc.id}-exp`} style={{ backgroundColor: 'var(--soc-raised)' }}>
                          <td />
                          <td colSpan={7} style={{ paddingTop: '0.5rem', paddingBottom: '1rem' }}>
                            <p className="text-sm mb-3" style={{ color: 'var(--soc-text-secondary)' }}>{inc.description}</p>
                            {inc.mitreTechniques.length > 0 && (
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="soc-label mr-1">MITRE:</span>
                                {inc.mitreTechniques.map(t => (
                                  <span key={t} className="soc-badge soc-badge-critical font-mono">{t}</span>
                                ))}
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-span-12 lg:col-span-4 space-y-4">

          {/* Response metrics */}
          <div className="soc-card">
            <p className="soc-label mb-3">RESPONSE METRICS</p>
            {[
              { label: 'Avg Initial Response', value: '12m',  note: 'SLA: 15m ✓' },
              { label: 'Avg Containment',       value: '1.4h', note: 'SLA: 2h ✓' },
              { label: 'MTTR',                  value: '3.8h', note: 'SLA: 4h ✓' },
              { label: 'SLA Compliance',         value: '91%',  note: '+3% vs last month' },
              { label: 'Re-opened Rate',          value: '2.3%', note: 'Target: <5% ✓' },
            ].map((m, i, arr) => (
              <div
                key={m.label}
                className="flex items-center justify-between py-2.5"
                style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--soc-border)' : 'none' }}
              >
                <div>
                  <p className="text-xs" style={{ color: 'var(--soc-text-secondary)' }}>{m.label}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--soc-text-muted)' }}>{m.note}</p>
                </div>
                <span className="text-base font-bold tabular-nums" style={{ color: 'var(--soc-text)' }}>{m.value}</span>
              </div>
            ))}
          </div>

          {/* Categories */}
          <div className="soc-card">
            <p className="soc-label mb-3">BY CATEGORY</p>
            <div className="space-y-2.5">
              {catCounts.map(({ cat, n }) => (
                <div key={cat}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs" style={{ color: 'var(--soc-text-secondary)' }}>{cat}</span>
                    <span className="text-xs font-semibold" style={{ color: 'var(--soc-text)' }}>{n}</span>
                  </div>
                  <div className="soc-progress-track">
                    <div className="soc-progress-fill" style={{ width: `${(n / INCIDENTS.length) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* MITRE coverage */}
          <div className="soc-card">
            <p className="soc-label mb-3">MITRE ATT&CK COVERAGE</p>
            <div className="space-y-2.5">
              {MITRE_COVERAGE.map(({ tactic, pct }) => {
                const barColor = pct >= 80 ? 'var(--soc-low)' : pct >= 65 ? 'var(--soc-medium)' : 'var(--soc-critical)'
                return (
                  <div key={tactic}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs" style={{ color: 'var(--soc-text-secondary)' }}>{tactic}</span>
                      <span className="text-xs font-semibold" style={{ color: barColor }}>{pct}%</span>
                    </div>
                    <div className="soc-progress-track">
                      <div className="soc-progress-fill" style={{ width: `${pct}%`, backgroundColor: barColor }} />
                    </div>
                  </div>
                )
              })}
            </div>
            <p className="text-xs mt-3 pt-3" style={{ color: 'var(--soc-text-muted)', borderTop: '1px solid var(--soc-border)' }}>
              Avg coverage: <strong style={{ color: 'var(--soc-text-secondary)' }}>74%</strong> across 6 tactics
            </p>
          </div>
        </div>
      </div>

      {/* Detail modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full max-w-xl flex flex-col max-h-[85vh] rounded-xl overflow-hidden"
            style={{ backgroundColor: 'var(--soc-surface)', border: '1px solid var(--soc-border-mid)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--soc-border)' }}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="soc-label mb-1">{selected.id}</p>
                  <h2 className="text-base font-bold" style={{ color: 'var(--soc-text)' }}>{selected.title}</h2>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="text-sm w-7 h-7 flex items-center justify-center rounded"
                  style={{ color: 'var(--soc-text-muted)', backgroundColor: 'var(--soc-raised)' }}
                >
                  ✕
                </button>
              </div>
              <div className="h-0.5 rounded-full mt-3" style={{ backgroundColor: SEV[selected.severity].color }} />
            </div>

            {/* Modal body */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              <div className="flex gap-2">
                <span className="soc-badge" style={{ backgroundColor: SEV[selected.severity].bg, color: SEV[selected.severity].color }}>{selected.severity.toUpperCase()}</span>
                <span className="soc-badge" style={{ color: STAT[selected.status], border: `1px solid ${STAT[selected.status]}44`, background: 'transparent' }}>{selected.status.toUpperCase()}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'CATEGORY',    value: selected.category },
                  { label: 'ASSIGNED TO', value: selected.assignedTo },
                  { label: 'DETECTED',    value: selected.detectedAt },
                  { label: 'ASSETS HIT',  value: String(selected.affectedAssets) },
                ].map(({ label, value }) => (
                  <div key={label} className="p-3 rounded" style={{ backgroundColor: 'var(--soc-raised)' }}>
                    <p className="soc-label mb-1">{label}</p>
                    <p className="text-sm font-medium" style={{ color: 'var(--soc-text)' }}>{value}</p>
                  </div>
                ))}
              </div>

              <div>
                <p className="soc-label mb-2">DESCRIPTION</p>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--soc-text-secondary)' }}>{selected.description}</p>
              </div>

              {selected.mitreTechniques.length > 0 && (
                <div>
                  <p className="soc-label mb-2">MITRE ATT&CK</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {selected.mitreTechniques.map(t => (
                      <span key={t} className="soc-badge soc-badge-critical font-mono">{t}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal footer */}
            <div className="px-5 py-4 flex gap-3 border-t" style={{ borderColor: 'var(--soc-border)' }}>
              <button className="soc-btn soc-btn-primary flex-1">Update Status</button>
              <button onClick={() => setSelected(null)} className="soc-btn soc-btn-secondary flex-1">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

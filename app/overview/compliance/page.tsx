'use client'
import { useEffect, useState } from 'react'
import { usePageTitle } from '@/app/page-title-context'

interface ComplianceFramework {
  id: string
  name: string
  score: number
  status: 'compliant' | 'partial' | 'non-compliant'
  controls: { total: number; implemented: number; inProgress: number; notImplemented: number }
  lastAudit: string
  nextAudit: string
}

const FRAMEWORKS: ComplianceFramework[] = [
  { id: 'iso27001', name: 'ISO 27001',    score: 98, status: 'compliant',     controls: { total: 114, implemented: 112, inProgress: 2,  notImplemented: 0  }, lastAudit: '2024-01-15', nextAudit: '2024-07-15' },
  { id: 'soc2',     name: 'SOC 2 Type II',score: 95, status: 'compliant',     controls: { total: 64,  implemented: 61,  inProgress: 3,  notImplemented: 0  }, lastAudit: '2024-02-01', nextAudit: '2024-08-01' },
  { id: 'gdpr',     name: 'GDPR',         score: 87, status: 'partial',       controls: { total: 99,  implemented: 86,  inProgress: 10, notImplemented: 3  }, lastAudit: '2023-12-10', nextAudit: '2024-06-10' },
  { id: 'hipaa',    name: 'HIPAA',        score: 92, status: 'compliant',     controls: { total: 45,  implemented: 42,  inProgress: 2,  notImplemented: 1  }, lastAudit: '2024-01-20', nextAudit: '2024-07-20' },
  { id: 'pci-dss',  name: 'PCI DSS',      score: 88, status: 'partial',       controls: { total: 329, implemented: 290, inProgress: 28, notImplemented: 11 }, lastAudit: '2023-11-30', nextAudit: '2024-05-30' },
  { id: 'nist',     name: 'NIST CSF',     score: 94, status: 'compliant',     controls: { total: 108, implemented: 102, inProgress: 5,  notImplemented: 1  }, lastAudit: '2024-02-15', nextAudit: '2024-08-15' },
]

const AUDIT_ACTIVITY = [
  { date: '2024-03-28', framework: 'ISO 27001',    type: 'Control Review',   status: 'passed',  auditor: 'External — Deloitte' },
  { date: '2024-03-25', framework: 'SOC 2 Type II', type: 'Evidence Collect', status: 'passed',  auditor: 'Internal' },
  { date: '2024-03-22', framework: 'PCI DSS',       type: 'Gap Assessment',   status: 'finding', auditor: 'External — KPMG' },
  { date: '2024-03-18', framework: 'GDPR',           type: 'Data Mapping',     status: 'in-progress', auditor: 'Internal' },
  { date: '2024-03-15', framework: 'HIPAA',          type: 'Risk Assessment',  status: 'passed',  auditor: 'External — PwC' },
]

const STATUS_CONFIG = {
  compliant:     { color: 'var(--soc-low)',      bg: 'var(--soc-low-bg)',      label: 'Compliant' },
  partial:       { color: 'var(--soc-medium)',   bg: 'var(--soc-medium-bg)',   label: 'Partial' },
  'non-compliant':{ color: 'var(--soc-critical)', bg: 'var(--soc-critical-bg)', label: 'Non-Compliant' },
}

const AUDIT_STATUS = {
  passed:       { color: 'var(--soc-low)',    label: 'Passed' },
  finding:      { color: 'var(--soc-medium)', label: 'Finding' },
  'in-progress':{ color: 'var(--soc-accent)', label: 'In Progress' },
  failed:       { color: 'var(--soc-critical)', label: 'Failed' },
}

export default function CompliancePage() {
  const { setPageTitle } = usePageTitle()
  const [selected, setSelected] = useState<ComplianceFramework | null>(null)

  useEffect(() => { setPageTitle('Compliance') }, [setPageTitle])

  const compliantCount  = FRAMEWORKS.filter(f => f.status === 'compliant').length
  const avgScore = Math.round(FRAMEWORKS.reduce((s, f) => s + f.score, 0) / FRAMEWORKS.length)
  const totalControls = FRAMEWORKS.reduce((s, f) => s + f.controls.total, 0)
  const implControls = FRAMEWORKS.reduce((s, f) => s + f.controls.implemented, 0)

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-6">

      {/* Header */}
      <div className="flex items-start justify-between mb-5 hig-fade-in">
        <div>
          <p className="soc-label mb-1">GOVERNANCE & COMPLIANCE</p>
          <h1 className="text-xl font-bold tracking-tight mb-1.5" style={{ color: 'var(--soc-text)' }}>
            Compliance Overview
          </h1>
          <p className="text-sm" style={{ color: 'var(--soc-text-secondary)' }}>
            <strong style={{ color: 'var(--soc-low)' }}>{compliantCount}/{FRAMEWORKS.length}</strong> frameworks fully compliant ·
            Avg score <strong style={{ color: avgScore >= 90 ? 'var(--soc-low)' : 'var(--soc-medium)' }}>{avgScore}%</strong>
          </p>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <button className="soc-btn soc-btn-secondary">Download Report</button>
          <button className="soc-btn soc-btn-primary">Schedule Audit</button>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'FRAMEWORKS',    value: String(FRAMEWORKS.length), sub: `${compliantCount} compliant`, color: 'var(--soc-text)' },
          { label: 'AVG SCORE',     value: `${avgScore}%`,   sub: 'Across all frameworks', color: avgScore >= 90 ? 'var(--soc-low)' : 'var(--soc-medium)' },
          { label: 'TOTAL CONTROLS',value: String(totalControls), sub: `${implControls} implemented`, color: 'var(--soc-text)' },
          { label: 'NEXT AUDIT',    value: 'May 30', sub: 'PCI DSS review', color: 'var(--soc-accent)' },
        ].map(({ label, value, sub, color }) => (
          <div key={label} className="soc-card">
            <p className="soc-label mb-2">{label}</p>
            <p className="soc-metric-sm mb-1" style={{ color }}>{value}</p>
            <p className="text-xs" style={{ color: 'var(--soc-text-muted)' }}>{sub}</p>
          </div>
        ))}
      </div>

      {/* Frameworks grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
        {FRAMEWORKS.map((fw) => {
          const sc = STATUS_CONFIG[fw.status]
          const implementedPct = Math.round((fw.controls.implemented / fw.controls.total) * 100)
          return (
            <div
              key={fw.id}
              className="soc-card cursor-pointer transition-colors"
              onClick={() => setSelected(fw)}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.backgroundColor = 'var(--soc-raised)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.backgroundColor = 'var(--soc-surface)' }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--soc-text)' }}>{fw.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--soc-text-muted)' }}>
                    Last audit: {fw.lastAudit} · Next: {fw.nextAudit}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-2xl font-bold tabular-nums" style={{ color: sc.color }}>{fw.score}%</p>
                  <span className="soc-badge" style={{ backgroundColor: sc.bg, color: sc.color }}>{sc.label}</span>
                </div>
              </div>

              <div className="mb-3">
                <div className="soc-progress-track">
                  <div className="soc-progress-fill" style={{ width: `${implementedPct}%`, backgroundColor: sc.color }} />
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs" style={{ color: 'var(--soc-text-muted)' }}>{implementedPct}% controls implemented</span>
                  <span className="text-xs" style={{ color: 'var(--soc-text-muted)' }}>{fw.controls.implemented}/{fw.controls.total}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Implemented', value: fw.controls.implemented, color: 'var(--soc-low)' },
                  { label: 'In Progress', value: fw.controls.inProgress,  color: 'var(--soc-medium)' },
                  { label: 'Not Started', value: fw.controls.notImplemented, color: 'var(--soc-critical)' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="p-2 rounded text-center" style={{ backgroundColor: 'var(--soc-raised)' }}>
                    <p className="text-base font-bold" style={{ color }}>{value}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--soc-text-muted)' }}>{label}</p>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Audit activity */}
      <div className="soc-card p-0 overflow-hidden">
        <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--soc-border)' }}>
          <p className="soc-label">RECENT AUDIT ACTIVITY</p>
          <span className="text-xs" style={{ color: 'var(--soc-text-muted)' }}>Last 30 days</span>
        </div>
        <table className="soc-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Framework</th>
              <th>Activity</th>
              <th>Auditor</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            {AUDIT_ACTIVITY.map((a, i) => {
              const as = AUDIT_STATUS[a.status as keyof typeof AUDIT_STATUS] ?? AUDIT_STATUS.passed
              return (
                <tr key={i}>
                  <td><span className="text-xs font-mono" style={{ color: 'var(--soc-text-muted)' }}>{a.date}</span></td>
                  <td><span className="text-sm" style={{ color: 'var(--soc-text)' }}>{a.framework}</span></td>
                  <td><span className="text-sm" style={{ color: 'var(--soc-text-secondary)' }}>{a.type}</span></td>
                  <td><span className="text-xs" style={{ color: 'var(--soc-text-muted)' }}>{a.auditor}</span></td>
                  <td>
                    <span className="soc-badge" style={{ color: as.color, border: `1px solid ${as.color}44`, background: 'transparent' }}>
                      {as.label}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Framework detail modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full max-w-lg rounded-xl overflow-hidden"
            style={{ backgroundColor: 'var(--soc-surface)', border: '1px solid var(--soc-border-mid)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b flex items-start justify-between" style={{ borderColor: 'var(--soc-border)' }}>
              <div>
                <p className="soc-label mb-1">FRAMEWORK DETAILS</p>
                <h2 className="text-base font-bold" style={{ color: 'var(--soc-text)' }}>{selected.name}</h2>
              </div>
              <button onClick={() => setSelected(null)} className="text-sm w-7 h-7 flex items-center justify-center rounded" style={{ color: 'var(--soc-text-muted)', backgroundColor: 'var(--soc-raised)' }}>✕</button>
            </div>
            <div className="px-5 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'SCORE',       value: `${selected.score}%` },
                  { label: 'STATUS',      value: STATUS_CONFIG[selected.status].label },
                  { label: 'LAST AUDIT',  value: selected.lastAudit },
                  { label: 'NEXT AUDIT',  value: selected.nextAudit },
                ].map(({ label, value }) => (
                  <div key={label} className="p-3 rounded" style={{ backgroundColor: 'var(--soc-raised)' }}>
                    <p className="soc-label mb-1">{label}</p>
                    <p className="text-sm font-medium" style={{ color: 'var(--soc-text)' }}>{value}</p>
                  </div>
                ))}
              </div>
              <div>
                <p className="soc-label mb-2">CONTROLS BREAKDOWN</p>
                <div className="space-y-2">
                  {[
                    { label: 'Implemented', value: selected.controls.implemented, color: 'var(--soc-low)' },
                    { label: 'In Progress', value: selected.controls.inProgress,  color: 'var(--soc-medium)' },
                    { label: 'Not Started', value: selected.controls.notImplemented, color: 'var(--soc-critical)' },
                  ].map(({ label, value, color }) => (
                    <div key={label}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs" style={{ color: 'var(--soc-text-secondary)' }}>{label}</span>
                        <span className="text-xs font-semibold" style={{ color }}>{value} / {selected.controls.total}</span>
                      </div>
                      <div className="soc-progress-track">
                        <div className="soc-progress-fill" style={{ width: `${(value / selected.controls.total) * 100}%`, backgroundColor: color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-5 py-4 flex gap-3 border-t" style={{ borderColor: 'var(--soc-border)' }}>
              <button className="soc-btn soc-btn-primary flex-1">View Controls</button>
              <button onClick={() => setSelected(null)} className="soc-btn soc-btn-secondary flex-1">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

import { formatDate } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { usePageTitle } from '@/app/page-title-context'

interface Procedure {
  id: string
  title: string
  type: 'incident-response' | 'threat-hunting' | 'vulnerability' | 'compliance'
  priority: 'critical' | 'high' | 'medium' | 'low'
  description: string
  steps: number
  estimatedTime: string
  lastReviewed: string
  owner: string
  related: string[]
}

export default function ProceduresPage() {
  const { setPageTitle } = usePageTitle()
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedProcedure, setSelectedProcedure] = useState<Procedure | null>(null)

  useEffect(() => {
    setPageTitle('Procedures')
  }, [setPageTitle])

  const procedures: Procedure[] = [
    { id: 'PROC-001', title: 'Ransomware Response Procedure', type: 'incident-response', priority: 'critical', description: 'Step-by-step procedure for responding to ransomware incidents', steps: 12, estimatedTime: '2-4 hours', lastReviewed: '2024-02-15', owner: 'Incident Response Team', related: ['PROC-002', 'PROC-005'] },
    { id: 'PROC-002', title: 'Data Breach Response', type: 'incident-response', priority: 'critical', description: 'Procedures for handling data breach incidents and notifications', steps: 15, estimatedTime: '4-8 hours', lastReviewed: '2024-01-20', owner: 'Incident Response Team', related: ['PROC-001', 'PROC-008'] },
    { id: 'PROC-003', title: 'Threat Hunt: Lateral Movement', type: 'threat-hunting', priority: 'high', description: 'Hunting procedure for detecting lateral movement activities', steps: 8, estimatedTime: '1-2 hours', lastReviewed: '2024-02-28', owner: 'Threat Hunting Team', related: ['PROC-004'] },
    { id: 'PROC-004', title: 'Threat Hunt: C2 Communication', type: 'threat-hunting', priority: 'high', description: 'Hunting for command and control communication patterns', steps: 10, estimatedTime: '2-3 hours', lastReviewed: '2024-03-05', owner: 'Threat Hunting Team', related: ['PROC-003'] },
    { id: 'PROC-005', title: 'Critical Vulnerability Patching', type: 'vulnerability', priority: 'critical', description: 'Emergency patching procedure for critical vulnerabilities', steps: 7, estimatedTime: '1-3 hours', lastReviewed: '2024-02-10', owner: 'Vulnerability Management', related: ['PROC-006'] },
    { id: 'PROC-006', title: 'Vulnerability Assessment Workflow', type: 'vulnerability', priority: 'medium', description: 'Standard workflow for conducting vulnerability assessments', steps: 9, estimatedTime: '4-6 hours', lastReviewed: '2024-01-15', owner: 'Vulnerability Management', related: ['PROC-005'] },
    { id: 'PROC-007', title: 'SOC 2 Audit Preparation', type: 'compliance', priority: 'high', description: 'Preparation procedures for SOC 2 Type II audits', steps: 14, estimatedTime: '2-3 days', lastReviewed: '2024-02-01', owner: 'Compliance Team', related: ['PROC-008'] },
    { id: 'PROC-008', title: 'GDPR Incident Reporting', type: 'compliance', priority: 'critical', description: 'Procedures for GDPR-compliant incident reporting', steps: 11, estimatedTime: '4-6 hours', lastReviewed: '2024-03-01', owner: 'Compliance Team', related: ['PROC-002', 'PROC-007'] },
  ]

  const getTypeColor = (type: string) => {
    const map: Record<string, string> = { 'incident-response': 'var(--soc-critical)', 'threat-hunting': 'var(--soc-high)', 'vulnerability': 'var(--soc-medium)', 'compliance': 'var(--soc-accent)' }
    return map[type] || 'var(--soc-text-muted)'
  }
  const getTypeBg = (type: string) => {
    const map: Record<string, string> = { 'incident-response': 'var(--soc-critical-bg)', 'threat-hunting': 'var(--soc-high-bg)', 'vulnerability': 'var(--soc-medium-bg)', 'compliance': 'var(--soc-accent-bg)' }
    return map[type] || 'var(--soc-border)'
  }
  const getPriorityColor = (priority: string) => {
    const map: Record<string, string> = { critical: 'var(--soc-critical)', high: 'var(--soc-high)', medium: 'var(--soc-medium)', low: 'var(--soc-low)' }
    return map[priority] || 'var(--soc-text-muted)'
  }
  const getPriorityBg = (priority: string) => {
    const map: Record<string, string> = { critical: 'var(--soc-critical-bg)', high: 'var(--soc-high-bg)', medium: 'var(--soc-medium-bg)', low: 'var(--soc-low-bg)' }
    return map[priority] || 'var(--soc-border)'
  }

  const filteredProcedures = selectedType === 'all' ? procedures : procedures.filter(p => p.type === selectedType)

  const stats = {
    total: procedures.length,
    critical: procedures.filter(p => p.priority === 'critical').length,
    incident: procedures.filter(p => p.type === 'incident-response').length,
    avgSteps: Math.round(procedures.reduce((s, p) => s + p.steps, 0) / procedures.length),
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-6 hig-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="soc-label mb-1">KNOWLEDGE BASE</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--soc-text)', lineHeight: 1.2 }}>Security Procedures</h1>
          <p style={{ color: 'var(--soc-text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Standard operating procedures for security operations and incident response</p>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'TOTAL PROCEDURES', value: String(stats.total), sub: 'Across all types' },
          { label: 'CRITICAL PRIORITY', value: String(stats.critical), sub: 'Require immediate action', err: true },
          { label: 'INCIDENT RESPONSE', value: String(stats.incident), sub: 'IR procedures', accent: true },
          { label: 'AVG STEPS', value: String(stats.avgSteps), sub: 'Per procedure' },
        ].map((kpi, i) => (
          <div key={i} className="soc-card" style={{ padding: '1.25rem' }}>
            <div className="soc-label mb-2">{kpi.label}</div>
            <div className="soc-metric-lg" style={kpi.err ? { color: 'var(--soc-critical)' } : kpi.accent ? { color: 'var(--soc-accent)' } : {}}>{kpi.value}</div>
            <div className="soc-metric-sm mt-1">{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ marginBottom: '1.25rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {['all', 'incident-response', 'threat-hunting', 'vulnerability', 'compliance'].map(type => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`soc-btn ${selectedType === type ? 'soc-btn-primary' : 'soc-btn-secondary'}`}
          >
            {type === 'all' ? 'All Types' : type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
          </button>
        ))}
      </div>

      {/* Procedures Table */}
      <div className="soc-card" style={{ padding: 0 }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--soc-border)' }}>
          <div className="flex items-center justify-between">
            <span style={{ fontWeight: 600, color: 'var(--soc-text)', fontSize: '0.9375rem' }}>Procedures</span>
            <span className="soc-metric-sm">{filteredProcedures.length} shown</span>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="soc-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Priority</th>
                <th>Steps</th>
                <th>Est. Time</th>
                <th>Owner</th>
                <th>Last Reviewed</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProcedures.map((proc) => (
                <tr key={proc.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedProcedure(proc)}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--soc-text)', fontSize: '0.875rem' }}>{proc.title}</div>
                    <div style={{ color: 'var(--soc-text-muted)', fontSize: '0.75rem', fontFamily: 'monospace' }}>{proc.id}</div>
                  </td>
                  <td>
                    <span className="soc-badge" style={{ backgroundColor: getTypeBg(proc.type), color: getTypeColor(proc.type) }}>
                      {proc.type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </span>
                  </td>
                  <td>
                    <span className="soc-badge" style={{ backgroundColor: getPriorityBg(proc.priority), color: getPriorityColor(proc.priority) }}>
                      {proc.priority.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ color: 'var(--soc-text-secondary)', fontSize: '0.875rem' }}>{proc.steps}</td>
                  <td style={{ color: 'var(--soc-text-secondary)', fontSize: '0.875rem' }}>{proc.estimatedTime}</td>
                  <td style={{ color: 'var(--soc-text-secondary)', fontSize: '0.875rem' }}>{proc.owner}</td>
                  <td style={{ color: 'var(--soc-text-muted)', fontSize: '0.8125rem' }}>{formatDate(proc.lastReviewed)}</td>
                  <td>
                    <button className="soc-link" style={{ fontSize: '0.8125rem' }} onClick={(e) => { e.stopPropagation(); setSelectedProcedure(proc) }}>View →</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Procedure Detail Modal */}
      {selectedProcedure && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} onClick={() => setSelectedProcedure(null)}>
          <div className="w-full max-w-lg rounded-xl overflow-hidden flex flex-col" style={{ backgroundColor: 'var(--soc-surface)', border: '1px solid var(--soc-border-mid)', maxHeight: '90vh' }} onClick={(e) => e.stopPropagation()}>
            <div className="px-5 py-4 border-b flex items-start justify-between flex-shrink-0" style={{ borderColor: 'var(--soc-border)' }}>
              <div>
                <p className="soc-label mb-1 font-mono">{selectedProcedure.id}</p>
                <h2 className="text-base font-bold" style={{ color: 'var(--soc-text)' }}>{selectedProcedure.title}</h2>
              </div>
              <button onClick={() => setSelectedProcedure(null)} className="text-sm w-7 h-7 flex items-center justify-center rounded flex-shrink-0" style={{ color: 'var(--soc-text-muted)', backgroundColor: 'var(--soc-raised)' }}>✕</button>
            </div>
            <div className="px-5 py-4 overflow-y-auto space-y-4">
              <div className="flex gap-2">
                <span className="soc-badge" style={{ backgroundColor: getTypeBg(selectedProcedure.type), color: getTypeColor(selectedProcedure.type) }}>
                  {selectedProcedure.type.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </span>
                <span className="soc-badge" style={{ backgroundColor: getPriorityBg(selectedProcedure.priority), color: getPriorityColor(selectedProcedure.priority) }}>
                  {selectedProcedure.priority.toUpperCase()}
                </span>
              </div>
              <p className="text-sm" style={{ color: 'var(--soc-text-secondary)' }}>{selectedProcedure.description}</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'STEPS',        value: String(selectedProcedure.steps) },
                  { label: 'EST. TIME',    value: selectedProcedure.estimatedTime },
                  { label: 'OWNER',        value: selectedProcedure.owner },
                  { label: 'LAST REVIEWED',value: formatDate(selectedProcedure.lastReviewed) },
                ].map(({ label, value }) => (
                  <div key={label} className="p-3 rounded" style={{ backgroundColor: 'var(--soc-raised)' }}>
                    <p className="soc-label mb-1">{label}</p>
                    <p className="text-sm font-medium" style={{ color: 'var(--soc-text)' }}>{value}</p>
                  </div>
                ))}
              </div>
              <div>
                <p className="soc-label mb-2">RELATED PROCEDURES</p>
                <div className="flex flex-wrap gap-1">
                  {selectedProcedure.related.map((relId: string, idx: number) => (
                    <span key={idx} className="soc-badge">{relId}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-5 py-4 flex gap-3 border-t flex-shrink-0" style={{ borderColor: 'var(--soc-border)' }}>
              <button className="soc-btn soc-btn-primary flex-1">View Full Procedure</button>
              <button onClick={() => setSelectedProcedure(null)} className="soc-btn soc-btn-secondary flex-1">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

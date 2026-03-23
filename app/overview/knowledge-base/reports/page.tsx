'use client'

import { formatDate } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { usePageTitle } from '@/app/page-title-context'

interface Report {
  id: string
  title: string
  type: 'security' | 'compliance' | 'incident' | 'threat' | 'vulnerability'
  period: string
  generatedAt: string
  generatedBy: string
  status: 'final' | 'draft' | 'review'
  pages: number
  format: 'PDF' | 'Excel' | 'Word'
  recipients: string[]
}

export default function ReportsPage() {
  const { setPageTitle } = usePageTitle()
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)

  useEffect(() => {
    setPageTitle('Reports')
  }, [setPageTitle])

  const reports: Report[] = [
    { id: 'REP-2024-03-001', title: 'Monthly Security Operations Report', type: 'security', period: 'March 2024', generatedAt: '2024-03-31', generatedBy: 'SOC Manager', status: 'final', pages: 45, format: 'PDF', recipients: ['CISO', 'Security Team', 'Executive Team'] },
    { id: 'REP-2024-Q1-001', title: 'Q1 2024 Compliance Report', type: 'compliance', period: 'Q1 2024', generatedAt: '2024-03-30', generatedBy: 'Compliance Team', status: 'final', pages: 78, format: 'PDF', recipients: ['Board', 'Audit Committee', 'CISO'] },
    { id: 'REP-2024-INC-012', title: 'Ransomware Incident Post-Mortem', type: 'incident', period: 'February 2024', generatedAt: '2024-02-28', generatedBy: 'IR Team', status: 'final', pages: 23, format: 'PDF', recipients: ['CISO', 'IT Management', 'Legal'] },
    { id: 'REP-2024-THR-005', title: 'Threat Intelligence Report', type: 'threat', period: 'March 2024', generatedAt: '2024-03-29', generatedBy: 'Threat Intel Team', status: 'final', pages: 34, format: 'PDF', recipients: ['Security Team', 'CISO', 'Risk Management'] },
    { id: 'REP-2024-VUL-003', title: 'Vulnerability Management Report', type: 'vulnerability', period: 'March 2024', generatedAt: '2024-03-28', generatedBy: 'Vuln Management', status: 'final', pages: 56, format: 'Excel', recipients: ['Security Team', 'IT Operations', 'CISO'] },
    { id: 'REP-2024-04-001', title: 'Weekly Security Summary', type: 'security', period: 'Week 13 2024', generatedAt: '2024-03-30', generatedBy: 'SOC Analyst', status: 'review', pages: 12, format: 'PDF', recipients: ['Security Team', 'SOC Manager'] },
    { id: 'REP-2024-THR-006', title: 'APT Activity Report', type: 'threat', period: 'Q1 2024', generatedAt: '2024-03-27', generatedBy: 'Threat Intel Team', status: 'draft', pages: 67, format: 'PDF', recipients: ['CISO', 'Executive Team'] },
  ]

  const getTypeColor = (type: string) => {
    const map: Record<string, string> = { security: 'var(--soc-accent)', compliance: 'var(--soc-accent)', incident: 'var(--soc-critical)', threat: 'var(--soc-high)', vulnerability: 'var(--soc-medium)' }
    return map[type] || 'var(--soc-text-muted)'
  }
  const getTypeBg = (type: string) => {
    const map: Record<string, string> = { security: 'var(--soc-accent-bg)', compliance: 'var(--soc-accent-bg)', incident: 'var(--soc-critical-bg)', threat: 'var(--soc-high-bg)', vulnerability: 'var(--soc-medium-bg)' }
    return map[type] || 'var(--soc-border)'
  }
  const getStatusColor = (status: string) => {
    const map: Record<string, string> = { final: 'var(--soc-low)', review: 'var(--soc-high)', draft: 'var(--soc-text-muted)' }
    return map[status] || 'var(--soc-text-muted)'
  }
  const getStatusBg = (status: string) => {
    const map: Record<string, string> = { final: 'var(--soc-low-bg)', review: 'var(--soc-high-bg)', draft: 'var(--soc-border)' }
    return map[status] || 'var(--soc-border)'
  }

  const filteredReports = selectedType === 'all' ? reports : reports.filter(r => r.type === selectedType)

  const stats = {
    total: reports.length,
    final: reports.filter(r => r.status === 'final').length,
    thisMonth: reports.filter(r => new Date(r.generatedAt).getMonth() === 2).length,
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-6 hig-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="soc-label mb-1">KNOWLEDGE BASE</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--soc-text)', lineHeight: 1.2 }}>Security Reports</h1>
          <p style={{ color: 'var(--soc-text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Access security reports, compliance documents, and incident analyses</p>
        </div>
        <button className="soc-btn soc-btn-primary">Generate Report</button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'TOTAL REPORTS', value: String(stats.total), sub: 'In library' },
          { label: 'FINAL', value: String(stats.final), sub: 'Ready to distribute', accent: true },
          { label: 'THIS MONTH', value: String(stats.thisMonth), sub: 'Generated in March 2024', accent: true },
        ].map((kpi, i) => (
          <div key={i} className="soc-card" style={{ padding: '1.25rem' }}>
            <div className="soc-label mb-2">{kpi.label}</div>
            <div className="soc-metric-lg" style={kpi.accent ? { color: 'var(--soc-accent)' } : {}}>{kpi.value}</div>
            <div className="soc-metric-sm mt-1">{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ marginBottom: '1.25rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {['all', 'security', 'compliance', 'incident', 'threat', 'vulnerability'].map(type => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`soc-btn ${selectedType === type ? 'soc-btn-primary' : 'soc-btn-secondary'}`}
          >
            {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Reports Table */}
      <div className="soc-card" style={{ padding: 0 }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--soc-border)' }}>
          <div className="flex items-center justify-between">
            <span style={{ fontWeight: 600, color: 'var(--soc-text)', fontSize: '0.9375rem' }}>Reports</span>
            <span className="soc-metric-sm">{filteredReports.length} total</span>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="soc-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Period</th>
                <th>Pages</th>
                <th>Format</th>
                <th>Generated By</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((report) => (
                <tr key={report.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--soc-text)', fontSize: '0.875rem' }}>{report.title}</div>
                    <div style={{ color: 'var(--soc-text-muted)', fontSize: '0.75rem', fontFamily: 'monospace' }}>{report.id}</div>
                  </td>
                  <td>
                    <span className="soc-badge" style={{ backgroundColor: getTypeBg(report.type), color: getTypeColor(report.type) }}>
                      {report.type.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ color: 'var(--soc-text-secondary)', fontSize: '0.875rem' }}>{report.period}</td>
                  <td style={{ color: 'var(--soc-text-secondary)', fontSize: '0.875rem' }}>{report.pages}</td>
                  <td style={{ color: 'var(--soc-text-secondary)', fontSize: '0.875rem' }}>{report.format}</td>
                  <td style={{ color: 'var(--soc-text-secondary)', fontSize: '0.875rem' }}>{report.generatedBy}</td>
                  <td style={{ color: 'var(--soc-text-muted)', fontSize: '0.8125rem' }}>{formatDate(report.generatedAt)}</td>
                  <td>
                    <span className="soc-badge" style={{ backgroundColor: getStatusBg(report.status), color: getStatusColor(report.status) }}>
                      {report.status.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <button className="soc-link" style={{ fontSize: '0.8125rem' }}
                        onClick={(e) => {
                          e.stopPropagation()
                          alert(`Downloading ${report.title}...`)
                        }}>
                        Download →
                      </button>
                      <button className="soc-link" style={{ fontSize: '0.8125rem' }}
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedReport(report)
                        }}>
                        Share →
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Share Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} onClick={() => setSelectedReport(null)}>
          <div className="w-full max-w-md rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--soc-surface)', border: '1px solid var(--soc-border-mid)' }} onClick={(e) => e.stopPropagation()}>
            <div className="px-5 py-4 border-b flex items-start justify-between" style={{ borderColor: 'var(--soc-border)' }}>
              <div>
                <p className="soc-label mb-1 font-mono">{selectedReport.id}</p>
                <h2 className="text-base font-bold" style={{ color: 'var(--soc-text)' }}>Share Report</h2>
              </div>
              <button onClick={() => setSelectedReport(null)} className="text-sm w-7 h-7 flex items-center justify-center rounded" style={{ color: 'var(--soc-text-muted)', backgroundColor: 'var(--soc-raised)' }}>✕</button>
            </div>
            <div className="px-5 py-4 space-y-4">
              <p className="text-sm font-medium" style={{ color: 'var(--soc-text)' }}>{selectedReport.title}</p>
              <div>
                <p className="soc-label mb-2">EMAIL ADDRESSES</p>
                <textarea
                  placeholder="email1@company.com, email2@company.com"
                  rows={3}
                  className="w-full text-sm px-3 py-2 rounded-md resize-none"
                  style={{ backgroundColor: 'var(--soc-raised)', border: '1px solid var(--soc-border-mid)', color: 'var(--soc-text)', outline: 'none' }}
                />
              </div>
              <div>
                <p className="soc-label mb-2">MESSAGE (OPTIONAL)</p>
                <textarea
                  placeholder="Add a message..."
                  rows={3}
                  className="w-full text-sm px-3 py-2 rounded-md resize-none"
                  style={{ backgroundColor: 'var(--soc-raised)', border: '1px solid var(--soc-border-mid)', color: 'var(--soc-text)', outline: 'none' }}
                />
              </div>
            </div>
            <div className="px-5 py-4 flex gap-3 border-t" style={{ borderColor: 'var(--soc-border)' }}>
              <button className="soc-btn soc-btn-primary flex-1" onClick={() => { alert('Report shared successfully!'); setSelectedReport(null) }}>Send Report</button>
              <button className="soc-btn soc-btn-secondary flex-1" onClick={() => setSelectedReport(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

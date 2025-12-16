'use client'
import { formatDate, formatDateTime } from '@/lib/utils'
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
    {
      id: 'REP-2024-03-001',
      title: 'Monthly Security Operations Report',
      type: 'security',
      period: 'March 2024',
      generatedAt: '2024-03-31',
      generatedBy: 'SOC Manager',
      status: 'final',
      pages: 45,
      format: 'PDF',
      recipients: ['CISO', 'Security Team', 'Executive Team']
    },
    {
      id: 'REP-2024-Q1-001',
      title: 'Q1 2024 Compliance Report',
      type: 'compliance',
      period: 'Q1 2024',
      generatedAt: '2024-03-30',
      generatedBy: 'Compliance Team',
      status: 'final',
      pages: 78,
      format: 'PDF',
      recipients: ['Board', 'Audit Committee', 'CISO']
    },
    {
      id: 'REP-2024-INC-012',
      title: 'Ransomware Incident Post-Mortem',
      type: 'incident',
      period: 'February 2024',
      generatedAt: '2024-02-28',
      generatedBy: 'IR Team',
      status: 'final',
      pages: 23,
      format: 'PDF',
      recipients: ['CISO', 'IT Management', 'Legal']
    },
    {
      id: 'REP-2024-THR-005',
      title: 'Threat Intelligence Report',
      type: 'threat',
      period: 'March 2024',
      generatedAt: '2024-03-29',
      generatedBy: 'Threat Intel Team',
      status: 'final',
      pages: 34,
      format: 'PDF',
      recipients: ['Security Team', 'CISO', 'Risk Management']
    },
    {
      id: 'REP-2024-VUL-003',
      title: 'Vulnerability Management Report',
      type: 'vulnerability',
      period: 'March 2024',
      generatedAt: '2024-03-28',
      generatedBy: 'Vuln Management',
      status: 'final',
      pages: 56,
      format: 'Excel',
      recipients: ['Security Team', 'IT Operations', 'CISO']
    },
    {
      id: 'REP-2024-04-001',
      title: 'Weekly Security Summary',
      type: 'security',
      period: 'Week 13 2024',
      generatedAt: '2024-03-30',
      generatedBy: 'SOC Analyst',
      status: 'review',
      pages: 12,
      format: 'PDF',
      recipients: ['Security Team', 'SOC Manager']
    },
    {
      id: 'REP-2024-THR-006',
      title: 'APT Activity Report',
      type: 'threat',
      period: 'Q1 2024',
      generatedAt: '2024-03-27',
      generatedBy: 'Threat Intel Team',
      status: 'draft',
      pages: 67,
      format: 'PDF',
      recipients: ['CISO', 'Executive Team']
    }
  ]

  const getTypeColor = (type: string): string => {
    const colors: Record<string, string> = {
      security: '#007AFF',
      compliance: '#007AFF',
      incident: '#FF3B30',
      threat: '#FF9500',
      vulnerability: '#FFCC00'
    }
    return colors[type] || '#8E8E93'
  }

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      final: '#34C759',
      review: '#FF9500',
      draft: '#8E8E93'
    }
    return colors[status] || '#8E8E93'
  }

  const filteredReports = selectedType === 'all' 
    ? reports 
    : reports.filter(r => r.type === selectedType)

  const stats = {
    total: reports.length,
    final: reports.filter(r => r.status === 'final').length,
    thisMonth: reports.filter(r => new Date(r.generatedAt).getMonth() === 2).length
  }

  return (
    <div className="py-8 w-full max-w-7xl mx-auto">
      <div className="mb-6 px-4 hig-fade-in">
        <h1 className="hig-title-large text-gray-900 dark:text-gray-100 mb-2">Security Reports</h1>
        <p className="hig-body text-gray-600 dark:text-gray-400">Access security reports, compliance documents, and incident analyses</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 px-4">
        <div className="hig-card bg-gray-50 dark:bg-[#334155]/30 p-4 text-center">
          <div className="hig-caption text-gray-600 dark:text-gray-400 mb-2">Total Reports</div>
          <div className="hig-metric-value text-4xl text-gray-900 dark:text-gray-100">{stats.total}</div>
        </div>

        <div className="hig-card bg-gray-50 dark:bg-[#334155]/30 p-4 text-center">
          <div className="hig-caption text-gray-600 dark:text-gray-400 mb-2">Final Reports</div>
          <div className="hig-metric-value text-4xl" style={{ color: '#34C759', WebkitTextFillColor: '#34C759' }}>
            {stats.final}
          </div>
        </div>

        <div className="hig-card bg-gray-50 dark:bg-[#334155]/30 p-4 text-center">
          <div className="hig-caption text-gray-600 dark:text-gray-400 mb-2">This Month</div>
          <div className="hig-metric-value text-4xl" style={{ color: '#007AFF', WebkitTextFillColor: '#007AFF' }}>
            {stats.thisMonth}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 px-4">
        <div className="flex flex-wrap gap-2">
          {['all', 'security', 'compliance', 'incident', 'threat', 'vulnerability'].map(type => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`hig-button ${
                selectedType === type
                  ? 'hig-button-primary'
                  : 'hig-button-secondary'
              }`}
            >
              {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Reports Table */}
      <div className="px-4">
        <div className="hig-card p-0">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700/60 px-6 pt-6">
            <h2 className="hig-headline text-gray-900 dark:text-gray-100">Reports</h2>
            <span className="hig-caption text-gray-600 dark:text-gray-400">{filteredReports.length} total</span>
          </div>

          <div className="overflow-x-auto">
          <table className="hig-table w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700/60">
                <th className="px-6 py-3 text-left hig-caption font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Report</th>
                <th className="px-6 py-3 text-left hig-caption font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Type</th>
                <th className="px-6 py-3 text-left hig-caption font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Period</th>
                <th className="px-6 py-3 text-left hig-caption font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Pages</th>
                <th className="px-6 py-3 text-left hig-caption font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Format</th>
                <th className="px-6 py-3 text-left hig-caption font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Generated</th>
                <th className="px-6 py-3 text-left hig-caption font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</th>
                <th className="px-6 py-3 text-left hig-caption font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700/60">
              {filteredReports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50 dark:hover:bg-[#334155]/20">
                  <td className="px-6 py-4">
                    <div>
                      <div className="hig-body font-semibold text-gray-900 dark:text-gray-100">{report.title}</div>
                      <div className="hig-caption text-gray-600 dark:text-gray-400 font-mono mt-0.5">{report.id}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span 
                      className="hig-badge"
                      style={{
                        backgroundColor: `${getTypeColor(report.type)}20`,
                        color: getTypeColor(report.type)
                      }}
                    >
                      {report.type.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="hig-body text-gray-700 dark:text-gray-300">{report.period}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="hig-body text-gray-700 dark:text-gray-300">{report.pages}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="hig-body text-gray-700 dark:text-gray-300">{report.format}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="hig-body text-gray-700 dark:text-gray-300">{formatDate(report.generatedAt)}</div>
                      <div className="hig-caption text-gray-500 dark:text-gray-400">{report.generatedBy}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span 
                      className="hig-badge"
                      style={{
                        backgroundColor: `${getStatusColor(report.status)}20`,
                        color: getStatusColor(report.status)
                      }}
                    >
                      {report.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation()
                          const link = document.createElement('a')
                          link.href = '#'
                          link.download = `${report.id}_${report.title.replace(/\s+/g, '_')}.${report.format.toLowerCase()}`
                          document.body.appendChild(link)
                          link.click()
                          document.body.removeChild(link)
                          alert(`Downloading ${report.title}...`)
                        }}
                        className="hig-caption hover:text-[#AF52DE] hig-link-hover"
                      >
                        Download →
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedReport(report)
                        }}
                        className="hig-caption hover:text-[#AF52DE] hig-link-hover"
                      >
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
      </div>

      {/* Share Modal */}
      {selectedReport && (
        <>
          <div 
            className="hig-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedReport(null)}
          >
            <div 
              className="hig-modal p-0 max-w-4xl w-full flex flex-col max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Fixed Header */}
              <div 
                className="sticky top-0 z-10 backdrop-blur-xl backdrop-saturate-150 bg-white/80 dark:bg-[#1E293B]/80 border-b border-gray-200 dark:border-gray-700/60 p-6 pb-4"
                style={{
                  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                  backdropFilter: 'blur(20px) saturate(180%)'
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h2 className="hig-headline text-gray-900 dark:text-gray-100">Share Report</h2>
                  <button
                    onClick={() => setSelectedReport(null)}
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto px-6 py-6">
                <div className="space-y-6">
                  <div>
                    <div className="hig-body font-semibold text-gray-900 dark:text-gray-100 mb-1">{selectedReport.title}</div>
                    <div className="hig-caption text-gray-600 dark:text-gray-400 font-mono">{selectedReport.id}</div>
                  </div>

                  <div>
                    <label className="block hig-caption text-gray-600 dark:text-gray-400 mb-2 font-semibold">
                      Email addresses (comma separated)
                    </label>
                    <textarea 
                      placeholder="email1@company.com, email2@company.com"
                      rows={3}
                      className="hig-input w-full min-h-[100px] resize-none"
                    />
                  </div>

                  <div>
                    <label className="block hig-caption text-gray-600 dark:text-gray-400 mb-2 font-semibold">
                      Message (optional)
                    </label>
                    <textarea 
                      placeholder="Add a message..."
                      rows={3}
                      className="hig-input w-full min-h-[100px] resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Fixed Footer */}
              <div 
                className="sticky bottom-0 z-10 backdrop-blur-xl backdrop-saturate-150 bg-white/80 dark:bg-[#1E293B]/80 border-t border-gray-200 dark:border-gray-700/60 p-6 pt-4"
                style={{
                  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                  backdropFilter: 'blur(20px) saturate(180%)'
                }}
              >
                <div className="flex gap-3">
                  <button 
                    onClick={() => {
                      alert('Report shared successfully!')
                      setSelectedReport(null)
                    }}
                    className="flex-1 hig-button hig-button-primary"
                  >
                    Send Report
                  </button>
                  <button 
                    onClick={() => setSelectedReport(null)}
                    className="flex-1 hig-button hig-button-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

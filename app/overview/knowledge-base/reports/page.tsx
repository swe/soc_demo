'use client'
import { formatDate, formatDateTime } from '@/lib/utils'


import { useEffect, useState } from 'react'
import { usePageTitle } from '@/app/page-title-context'
import { PageHeader, Card, Badge } from '@/components/ui/card'

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

  const getTypeColor = (type: string) => {
    const colors = {
      security: 'bg-indigo-600 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-500',
      compliance: 'bg-indigo-600 dark:bg-indigo-600/20 text-blue-700 dark:text-blue-400',
      incident: 'bg-rose-600 dark:bg-rose-700/20 text-red-700 dark:text-red-400',
      threat: 'bg-orange-600 dark:bg-orange-700/20 text-orange-700 dark:text-orange-400',
      vulnerability: 'bg-amber-600 dark:bg-amber-700/20 text-yellow-700 dark:text-yellow-400'
    }
    return colors[type as keyof typeof colors]
  }

  const getStatusColor = (status: string) => {
    const colors = {
      final: 'bg-emerald-600 dark:bg-emerald-700/20 text-green-700 dark:text-green-400',
      review: 'bg-amber-600 dark:bg-amber-700/20 text-yellow-700 dark:text-yellow-400',
      draft: 'bg-gray-500/20 text-gray-700 dark:text-gray-400'
    }
    return colors[status as keyof typeof colors]
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
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-7xl mx-auto">
      <PageHeader 
        title="Security Reports" 
        description="Access security reports, compliance documents, and incident analyses" 
      />

      {/* Stats */}
      <div className="grid grid-cols-12 gap-4 mb-6">
        <div className="col-span-12 sm:col-span-4">
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Reports</div>
              <div className="w-10 h-10 bg-indigo-600 dark:bg-indigo-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" />
                  <path d="M3 8a2 2 0 012-2v10h8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</div>
          </div>
        </div>

        <div className="col-span-12 sm:col-span-4">
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600 dark:text-gray-400">Final Reports</div>
              <div className="w-10 h-10 bg-emerald-600 dark:bg-emerald-700/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-700 dark:text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-emerald-700 dark:text-emerald-400">{stats.final}</div>
          </div>
        </div>

        <div className="col-span-12 sm:col-span-4">
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600 dark:text-gray-400">This Month</div>
              <div className="w-10 h-10 bg-indigo-600 dark:bg-indigo-600/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-indigo-700 dark:text-indigo-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-indigo-700 dark:text-indigo-300">{stats.thisMonth}</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {['all', 'security', 'compliance', 'incident', 'threat', 'vulnerability'].map(type => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedType === type
                  ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-sm'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20">
              <tr>
                <th className="px-4 py-3 text-left">Report</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">Period</th>
                <th className="px-4 py-3 text-left">Pages</th>
                <th className="px-4 py-3 text-left">Format</th>
                <th className="px-4 py-3 text-left">Generated</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-200 dark:divide-gray-700">
              {filteredReports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/20">
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-medium text-gray-800 dark:text-gray-100">{report.title}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{report.id}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getTypeColor(report.type)}`}>
                      {report.type.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gray-700 dark:text-gray-300">{report.period}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gray-700 dark:text-gray-300">{report.pages}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gray-700 dark:text-gray-300">{report.format}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <div className="text-gray-700 dark:text-gray-300">{formatDate(report.generatedAt)}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{report.generatedBy}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                      {report.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
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
                        className="text-indigo-600 hover:text-indigo-700 dark:hover:text-indigo-500 font-medium"
                      >
                        Download
                      </button>
                      <span className="text-gray-300 dark:text-gray-600">|</span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedReport(report)
                        }}
                        className="text-blue-500 hover:text-blue-600 font-medium"
                      >
                        Share
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Share Modal (Only for sharing) */}
      {selectedReport && (
        <>
          <div 
            className="fixed inset-0 bg-gray-900/50 z-40"
            onClick={() => setSelectedReport(null)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Share Report</h2>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{selectedReport.title}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{selectedReport.id}</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email addresses (comma separated)
                  </label>
                  <textarea 
                    placeholder="email1@company.com, email2@company.com"
                    rows={3}
                    className="form-input w-full bg-white dark:bg-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Message (optional)
                  </label>
                  <textarea 
                    placeholder="Add a message..."
                    rows={3}
                    className="form-input w-full bg-white dark:bg-gray-800"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => {
                      alert('Report shared successfully!')
                      setSelectedReport(null)
                    }}
                    className="flex-1 btn bg-indigo-600 dark:bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-700 text-white"
                  >
                    Send Report
                  </button>
                  <button 
                    onClick={() => setSelectedReport(null)}
                    className="flex-1 btn bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600"
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

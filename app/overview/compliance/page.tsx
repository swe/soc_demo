'use client'

import { useEffect, useState } from 'react'
import { usePageTitle } from '@/app/page-title-context'
import { format } from 'date-fns'

// Format date consistently for SSR/CSR
const formatDate = (dateString: string) => {
  return format(new Date(dateString), 'MMM d, yyyy')
}

interface ComplianceFramework {
  id: string
  name: string
  score: number
  status: 'compliant' | 'partial' | 'non-compliant'
  controls: {
    total: number
    implemented: number
    inProgress: number
    notImplemented: number
  }
  lastAudit: string
  nextAudit: string
}

export default function CompliancePage() {
  const { setPageTitle } = usePageTitle()
  const [activeTab, setActiveTab] = useState<string>('overview')
  const [selectedFramework, setSelectedFramework] = useState<ComplianceFramework | null>(null)

  useEffect(() => {
    setPageTitle('Compliance')
  }, [setPageTitle])

  const frameworks: ComplianceFramework[] = [
    {
      id: 'iso27001',
      name: 'ISO 27001',
      score: 98,
      status: 'compliant',
      controls: { total: 114, implemented: 112, inProgress: 2, notImplemented: 0 },
      lastAudit: '2024-01-15',
      nextAudit: '2024-07-15'
    },
    {
      id: 'soc2',
      name: 'SOC 2 Type II',
      score: 95,
      status: 'compliant',
      controls: { total: 64, implemented: 61, inProgress: 3, notImplemented: 0 },
      lastAudit: '2024-02-01',
      nextAudit: '2024-08-01'
    },
    {
      id: 'gdpr',
      name: 'GDPR',
      score: 87,
      status: 'partial',
      controls: { total: 99, implemented: 86, inProgress: 10, notImplemented: 3 },
      lastAudit: '2023-12-10',
      nextAudit: '2024-06-10'
    },
    {
      id: 'hipaa',
      name: 'HIPAA',
      score: 92,
      status: 'compliant',
      controls: { total: 45, implemented: 42, inProgress: 2, notImplemented: 1 },
      lastAudit: '2024-01-20',
      nextAudit: '2024-07-20'
    },
    {
      id: 'pci-dss',
      name: 'PCI DSS',
      score: 88,
      status: 'partial',
      controls: { total: 329, implemented: 290, inProgress: 28, notImplemented: 11 },
      lastAudit: '2023-11-30',
      nextAudit: '2024-05-30'
    },
    {
      id: 'nist',
      name: 'NIST CSF',
      score: 94,
      status: 'compliant',
      controls: { total: 108, implemented: 102, inProgress: 5, notImplemented: 1 },
      lastAudit: '2024-02-15',
      nextAudit: '2024-08-15'
    }
  ]

  const getStatusColor = (status: string) => {
    const colors = {
      compliant: 'bg-emerald-600 dark:bg-emerald-700/20 text-green-700 dark:text-green-400',
      partial: 'bg-amber-600 dark:bg-amber-700/20 text-yellow-700 dark:text-yellow-400',
      'non-compliant': 'bg-rose-600 dark:bg-rose-700/20 text-red-700 dark:text-red-400'
    }
    return colors[status as keyof typeof colors]
  }

  const getScoreColor = (score: number) => {
    if (score >= 95) return 'text-emerald-700 dark:text-emerald-400'
    if (score >= 85) return 'text-amber-700 dark:text-amber-400'
    return 'text-rose-700 dark:text-rose-400'
  }

  const overallScore = Math.round(
    frameworks.reduce((sum, f) => sum + f.score, 0) / frameworks.length
  )

  const totalControls = frameworks.reduce((sum, f) => sum + f.controls.total, 0)
  const implementedControls = frameworks.reduce((sum, f) => sum + f.controls.implemented, 0)

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold mb-2">Compliance Management</h1>
        <p className="text-gray-600  dark:text-gray-400">Monitor and manage compliance with security standards and regulations</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-12 gap-4 mb-6">
        <div className="col-span-12 lg:col-span-6">
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg rounded-xl p-8 text-white">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Overall Compliance Score
            </h2>
            <div className="flex items-center justify-center">
              <div className="relative">
                <svg className="w-44 h-44 transform -rotate-90">
                  <circle
                    cx="88"
                    cy="88"
                    r="80"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    className="text-white/20"
                  />
                  <circle
                    cx="88"
                    cy="88"
                    r="80"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${overallScore * 5.03} 503`}
                    strokeLinecap="round"
                    className="text-white transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <div className="text-5xl font-bold mb-1">{overallScore}%</div>
                  <div className="text-sm opacity-90">Compliant</div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-6">
              <div className="text-center p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                <div className="text-2xl font-bold">{frameworks.filter(f => f.status === 'compliant').length}</div>
                <div className="text-xs opacity-80">Compliant</div>
              </div>
              <div className="text-center p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                <div className="text-2xl font-bold">{frameworks.filter(f => f.status === 'partial').length}</div>
                <div className="text-xs opacity-80">Partial</div>
              </div>
              <div className="text-center p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                <div className="text-2xl font-bold">{frameworks.length}</div>
                <div className="text-xs opacity-80">Total</div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-6">
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Control Implementation</h2>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Controls</span>
                  <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalControls}</span>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Implemented</span>
                  <span className="text-xl font-bold text-emerald-700 dark:text-emerald-400">{implementedControls}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div className="bg-emerald-600 dark:bg-emerald-700 h-3 rounded-full" style={{ width: `${(implementedControls / totalControls) * 100}%` }}></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">
                    {frameworks.reduce((sum, f) => sum + f.controls.inProgress, 0)}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">In Progress</div>
                </div>
                <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-rose-700 dark:text-rose-400">
                    {frameworks.reduce((sum, f) => sum + f.controls.notImplemented, 0)}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Not Implemented</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            {['overview', 'frameworks', 'audits', 'reports'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                  activeTab === tab
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-12 gap-4">
          {frameworks.map((framework) => (
            <div key={framework.id} className="col-span-12 lg:col-span-6">
              <div 
                onClick={() => setSelectedFramework(framework)}
                className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{framework.name}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${getStatusColor(framework.status)}`}>
                      {framework.status.replace('-', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div className={`text-3xl font-bold ${getScoreColor(framework.score)}`}>{framework.score}%</div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Controls:</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {framework.controls.implemented}/{framework.controls.total}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-emerald-600 dark:bg-emerald-700 h-2 rounded-full" 
                      style={{ width: `${(framework.controls.implemented / framework.controls.total) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>Last Audit: {formatDate(framework.lastAudit)}</span>
                    <span>Next: {formatDate(framework.nextAudit)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'frameworks' && (
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Compliance Frameworks</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20">
                <tr>
                  <th className="px-4 py-3 text-left">Framework</th>
                  <th className="px-4 py-3 text-left">Score</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Controls</th>
                  <th className="px-4 py-3 text-left">Last Audit</th>
                  <th className="px-4 py-3 text-left">Next Audit</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-200 dark:divide-gray-700">
                {frameworks.map((framework) => (
                  <tr key={framework.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/20">
                    <td className="px-4 py-3">
                      <span className="font-medium text-gray-800 dark:text-gray-100">{framework.name}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-lg font-bold ${getScoreColor(framework.score)}`}>{framework.score}%</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(framework.status)}`}>
                        {framework.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-gray-700 dark:text-gray-300">
                        {framework.controls.implemented}/{framework.controls.total}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-gray-600 dark:text-gray-400">
                        {formatDate(framework.lastAudit)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-gray-600 dark:text-gray-400">
                        {formatDate(framework.nextAudit)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'audits' && (
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Audit Schedule</h2>
          <div className="space-y-4">
            {frameworks.map((framework) => (
              <div key={framework.id} className="border-l-3 border-indigo-600 pl-4 py-3 bg-gray-50 dark:bg-gray-900/20 rounded-r">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-100">{framework.name}</h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(framework.status)}`}>
                    {framework.status.toUpperCase()}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Last Audit: </span>
                    <span className="font-medium text-gray-800 dark:text-gray-100">
                      {formatDate(framework.lastAudit)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Next Audit: </span>
                    <span className="font-medium text-gray-800 dark:text-gray-100">
                      {formatDate(framework.nextAudit)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Compliance Reports</h2>
          <div className="space-y-3">
            {[
              { name: 'Q1 2024 Compliance Report', date: '2024-03-31', type: 'Quarterly', status: 'Available' },
              { name: 'ISO 27001 Audit Report', date: '2024-01-15', type: 'Audit', status: 'Available' },
              { name: 'SOC 2 Attestation', date: '2024-02-01', type: 'Certification', status: 'Available' },
              { name: 'GDPR Assessment', date: '2023-12-10', type: 'Assessment', status: 'Available' }
            ].map((report, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900/30 transition-all duration-200 cursor-pointer">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800 dark:text-gray-100 mb-1">{report.name}</h3>
                  <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                    <span>{formatDate(report.date)}</span>
                    <span>•</span>
                    <span>{report.type}</span>
                  </div>
                </div>
                <button className="btn bg-indigo-600 dark:bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-700 text-white text-sm">
                  Download
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Framework Detail Panel */}
      {selectedFramework && (
        <>
          <div 
            className="fixed inset-0 bg-gray-900/50 z-40"
            onClick={() => setSelectedFramework(null)}
          />
          <div className="fixed inset-y-0 right-0 w-full md:w-2/3 lg:w-1/2 bg-white dark:bg-gray-800 shadow-xl z-50 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{selectedFramework.name} Details</h2>
                <button
                  onClick={() => setSelectedFramework(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Compliance Score</div>
                  <div className={`text-4xl font-bold ${getScoreColor(selectedFramework.score)}`}>{selectedFramework.score}%</div>
                </div>

                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Status</div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedFramework.status)}`}>
                    {selectedFramework.status.replace('-', ' ').toUpperCase()}
                  </span>
                </div>

                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">Control Implementation</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                      <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{selectedFramework.controls.implemented}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Implemented</div>
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                      <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">{selectedFramework.controls.inProgress}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">In Progress</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Last Audit</div>
                    <div className="text-gray-800 dark:text-gray-100">{formatDate(selectedFramework.lastAudit)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Next Audit</div>
                    <div className="text-gray-800 dark:text-gray-100">{formatDate(selectedFramework.nextAudit)}</div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button className="btn bg-indigo-600 dark:bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-700 text-white w-full">
                    View Full Report
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

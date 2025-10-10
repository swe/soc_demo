'use client'

import { useEffect, useState } from 'react'
import { usePageTitle } from '@/app/page-title-context'
import { formatDate } from '@/lib/utils'
import { PageHeader, Card, Badge } from '@/components/ui/card'

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
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-7xl mx-auto">
      <PageHeader 
        title="Compliance" 
        description="Monitor compliance with security standards and regulations" 
      />

      {/* Overview Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card padding="lg">
          <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">Overall Score</div>
          <div className="text-5xl font-light text-gray-900 dark:text-gray-100">{overallScore}%</div>
        </Card>

        <Card padding="lg">
          <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">Total Controls</div>
          <div className="text-5xl font-light text-gray-900 dark:text-gray-100">{totalControls}</div>
        </Card>

        <Card padding="lg">
          <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">Implemented</div>
          <div className="text-5xl font-light text-emerald-600 dark:text-emerald-400">{implementedControls}</div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <div className="border-b border-gray-200 dark:border-gray-700/60">
          <nav className="flex gap-8">
            {['overview', 'frameworks', 'audits'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-sm transition-colors ${
                  activeTab === tab
                    ? 'border-b-2 border-indigo-600 text-gray-900 dark:text-gray-100'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {frameworks.map((framework) => (
            <Card 
              key={framework.id} 
              hover
              onClick={() => setSelectedFramework(framework)}
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-lg font-light text-gray-900 dark:text-gray-100 mb-2">{framework.name}</h3>
                  <Badge variant={framework.status === 'compliant' ? 'success' : 'medium'}>
                    {framework.status.replace('-', ' ').toUpperCase()}
                  </Badge>
                </div>
                <div className={`text-4xl font-light ${getScoreColor(framework.score)}`}>{framework.score}%</div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm pb-2 border-b border-gray-100 dark:border-gray-700/60">
                  <span className="text-gray-500 dark:text-gray-400">Controls</span>
                  <span className="text-gray-900 dark:text-gray-100">
                    {framework.controls.implemented} / {framework.controls.total}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 dark:text-gray-400">Last: {formatDate(framework.lastAudit)}</span>
                  <span className="text-gray-500 dark:text-gray-400">Next: {formatDate(framework.nextAudit)}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'frameworks' && (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700/60">
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Framework</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Controls</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Last Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700/60">
                {frameworks.map((framework) => (
                  <tr key={framework.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/20 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{framework.name}</td>
                    <td className="px-6 py-4 text-sm font-light text-gray-900 dark:text-gray-100">{framework.score}%</td>
                    <td className="px-6 py-4">
                      <Badge variant={framework.status === 'compliant' ? 'success' : 'medium'}>
                        {framework.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {framework.controls.implemented}/{framework.controls.total}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(framework.lastAudit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'audits' && (
        <div className="space-y-4">
          {frameworks.map((framework) => (
            <Card key={framework.id} padding="md">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">{framework.name}</div>
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <span>Last: {formatDate(framework.lastAudit)}</span>
                    <span>•</span>
                    <span>Next: {formatDate(framework.nextAudit)}</span>
                  </div>
                </div>
                <Badge variant={framework.status === 'compliant' ? 'success' : 'medium'}>
                  {framework.status.toUpperCase()}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Framework Detail Panel */}
      {selectedFramework && (
        <>
          <div 
            className="fixed inset-0 bg-gray-900/50 z-40"
            onClick={() => setSelectedFramework(null)}
          />
          <div className="fixed inset-y-0 right-0 w-full md:w-96 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700/60 z-50 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-8 pb-6 border-b border-gray-200 dark:border-gray-700/60">
                <div>
                  <h2 className="text-xl font-light text-gray-900 dark:text-gray-100 mb-1">{selectedFramework.name}</h2>
                  <div className={`text-3xl font-light ${getScoreColor(selectedFramework.score)}`}>{selectedFramework.score}%</div>
                </div>
                <button
                  onClick={() => setSelectedFramework(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">Status</div>
                  <Badge variant={selectedFramework.status === 'compliant' ? 'success' : 'medium'}>
                    {selectedFramework.status.replace('-', ' ').toUpperCase()}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="border border-gray-200 dark:border-gray-700/60 p-4">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Implemented</div>
                    <div className="text-2xl font-light text-emerald-600 dark:text-emerald-400">{selectedFramework.controls.implemented}</div>
                  </div>
                  <div className="border border-gray-200 dark:border-gray-700/60 p-4">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">In Progress</div>
                    <div className="text-2xl font-light text-amber-600 dark:text-amber-400">{selectedFramework.controls.inProgress}</div>
                  </div>
                </div>

                <div>
                  <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-3">Audit Schedule</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700/60">
                      <span className="text-gray-500 dark:text-gray-400">Last Audit</span>
                      <span className="text-gray-900 dark:text-gray-100">{formatDate(selectedFramework.lastAudit)}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-500 dark:text-gray-400">Next Audit</span>
                      <span className="text-gray-900 dark:text-gray-100">{formatDate(selectedFramework.nextAudit)}</span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedFramework(null)}
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-900/20 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

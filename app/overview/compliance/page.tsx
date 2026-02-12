'use client'

import { useEffect, useState } from 'react'
import { usePageTitle } from '@/app/page-title-context'
import { formatDate, formatNumber } from '@/lib/utils'

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
    const colors: Record<string, string> = {
      compliant: '#059669',
      partial: '#ea580c',
      'non-compliant': '#e11d48'
    }
    return colors[status] || '#6b7280'
  }

  const getStatusBadgeColor = (status: string) => {
    const color = getStatusColor(status)
    return {
      backgroundColor: `${color}20`,
      color: color
    }
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
    <div className="py-4 w-full max-w-7xl mx-auto">
      <div className="mb-6 px-4 hig-fade-in">
        <h1 className="hig-title-large text-gray-900 dark:text-gray-100 mb-2">Compliance</h1>
        <p className="hig-body text-gray-600 dark:text-gray-400">Monitor compliance with security standards and regulations</p>
      </div>

      {/* Sticky Status Bar */}
      <div className="sticky top-16 z-40 before:absolute before:inset-0 before:backdrop-blur-xl before:bg-white/80 dark:before:bg-gray-950/80 before:-z-10 border-b border-gray-200 dark:border-gray-700/60 mb-3 -mx-4 sm:-mx-6 lg:-mx-8">
        <div className="px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#059669] rounded-full"></div>
                <span className="hig-caption font-semibold text-gray-900 dark:text-gray-100">
                  Overall: {overallScore}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="hig-caption font-semibold text-gray-900 dark:text-gray-100">
                  {frameworks.filter(f => f.status === 'compliant').length} Compliant
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#ea580c] rounded-full"></div>
                <span className="hig-caption font-semibold text-gray-900 dark:text-gray-100">
                  {frameworks.filter(f => f.status === 'partial').length} Partial
                </span>
              </div>
              <div className="hig-caption">
                {frameworks.length} frameworks • {formatNumber(totalControls)} controls
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-8 px-4">
        <div className="hig-card bg-gray-50 dark:bg-gray-700/30 p-4 text-center">
          <div className="hig-caption text-gray-600 dark:text-gray-400 mb-2">Overall Score</div>
          <div className="hig-metric-value text-4xl text-gray-900 dark:text-gray-100 mb-2">{overallScore}%</div>
        </div>

        <div className="hig-card bg-gray-50 dark:bg-gray-700/30 p-4 text-center">
          <div className="hig-caption text-gray-600 dark:text-gray-400 mb-2">Total Controls</div>
          <div className="hig-metric-value text-4xl text-gray-900 dark:text-gray-100 mb-2">{formatNumber(totalControls)}</div>
          <div className="hig-caption text-gray-600 dark:text-gray-400">{frameworks.length} frameworks</div>
        </div>

        <div className="hig-card bg-gray-50 dark:bg-gray-700/30 p-4 text-center">
          <div className="hig-caption text-gray-600 dark:text-gray-400 mb-2">Implemented</div>
          <div className="hig-metric-value text-4xl text-gray-900 dark:text-gray-100 mb-2">{formatNumber(implementedControls)}</div>
          <div className="hig-caption text-gray-600 dark:text-gray-400">{Math.round((implementedControls / totalControls) * 100)}% complete</div>
        </div>
      </div>

      {/* Frameworks List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 px-4">
        {frameworks.map((framework) => (
          <div 
            key={framework.id} 
            className="hig-card cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/30"
            onClick={() => setSelectedFramework(framework)}
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="hig-headline text-gray-900 dark:text-gray-100 mb-2">{framework.name}</h3>
                <span 
                  className="hig-badge"
                  style={getStatusBadgeColor(framework.status)}
                >
                  {framework.status.replace('-', ' ').toUpperCase()}
                </span>
              </div>
              <div className={`hig-metric-value-accent ${getScoreColor(framework.score)}`}>{framework.score}%</div>
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
          </div>
        ))}
      </div>

      {/* Framework Detail Panel */}
      {selectedFramework && (
        <>
          <div 
            className="hig-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedFramework(null)}
          >
            <div 
              className="hig-modal p-0 max-w-4xl w-full flex flex-col max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Fixed Header */}
              <div 
                className="sticky top-0 z-10 backdrop-blur-xl backdrop-saturate-150 bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-700/60 p-6 pb-4"
                style={{
                  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                  backdropFilter: 'blur(20px) saturate(180%)'
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h2 className="hig-headline text-gray-900 dark:text-gray-100 mb-1">{selectedFramework.name}</h2>
                    <div className={`hig-metric-value-accent ${getScoreColor(selectedFramework.score)}`}>{selectedFramework.score}%</div>
                  </div>
                  <button
                    onClick={() => setSelectedFramework(null)}
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                    </svg>
                  </button>
                </div>
                {/* Compliance Status Indicator Bar */}
                <div 
                  className="h-1 rounded-full mt-3" 
                  style={{ 
                    backgroundColor: selectedFramework.status === 'compliant' ? '#059669' : selectedFramework.status === 'partial' ? '#ea580c' : '#e11d48'
                  }}
                />
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto px-6 py-6">
                <div className="space-y-6">
                  <div>
                    <div className="hig-caption text-gray-600 dark:text-gray-400 mb-2 font-semibold">Status</div>
                    <span 
                      className="hig-badge"
                      style={getStatusBadgeColor(selectedFramework.status)}
                    >
                      {selectedFramework.status.replace('-', ' ').toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="hig-card bg-gray-50 dark:bg-gray-700/30 p-4 text-center">
                      <div className="hig-caption text-gray-600 dark:text-gray-400 mb-2">Implemented</div>
                      <div className="hig-metric-value text-3xl" style={{ color: '#059669', WebkitTextFillColor: '#059669' }}>
                        {selectedFramework.controls.implemented}
                      </div>
                    </div>
                    <div className="hig-card bg-gray-50 dark:bg-gray-700/30 p-4 text-center">
                      <div className="hig-caption text-gray-600 dark:text-gray-400 mb-2">In Progress</div>
                      <div className="hig-metric-value text-3xl" style={{ color: '#ea580c', WebkitTextFillColor: '#ea580c' }}>
                        {selectedFramework.controls.inProgress}
                      </div>
                    </div>
                  </div>

                  <div className="pb-4 border-b border-gray-200 dark:border-gray-700/60">
                    <div className="hig-headline mb-4">Controls Overview</div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="hig-caption text-gray-600 dark:text-gray-400 mb-1">Total Controls</div>
                        <div className="hig-body font-semibold text-gray-900 dark:text-gray-100">{selectedFramework.controls.total}</div>
                      </div>
                      <div>
                        <div className="hig-caption text-gray-600 dark:text-gray-400 mb-1">Not Implemented</div>
                        <div className="hig-body font-semibold text-gray-900 dark:text-gray-100">{selectedFramework.controls.notImplemented}</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="hig-headline mb-4">Audit Schedule</div>
                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700/60">
                        <span className="hig-body text-gray-600 dark:text-gray-400">Last Audit</span>
                        <span className="hig-body font-semibold text-gray-900 dark:text-gray-100">{formatDate(selectedFramework.lastAudit)}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="hig-body text-gray-600 dark:text-gray-400">Next Audit</span>
                        <span className="hig-body font-semibold text-gray-900 dark:text-gray-100">{formatDate(selectedFramework.nextAudit)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fixed Footer */}
              <div 
                className="sticky bottom-0 z-10 backdrop-blur-xl backdrop-saturate-150 bg-white/80 dark:bg-gray-900/80 border-t border-gray-200 dark:border-gray-700/60 p-6 pt-4"
                style={{
                  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                  backdropFilter: 'blur(20px) saturate(180%)'
                }}
              >
                <button 
                  onClick={() => setSelectedFramework(null)}
                  className="hig-button hig-button-secondary w-full"
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

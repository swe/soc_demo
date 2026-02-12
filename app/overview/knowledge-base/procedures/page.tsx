'use client'
import { formatDate, formatDateTime } from '@/lib/utils'
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
    {
      id: 'PROC-001',
      title: 'Ransomware Response Procedure',
      type: 'incident-response',
      priority: 'critical',
      description: 'Step-by-step procedure for responding to ransomware incidents',
      steps: 12,
      estimatedTime: '2-4 hours',
      lastReviewed: '2024-02-15',
      owner: 'Incident Response Team',
      related: ['PROC-002', 'PROC-005']
    },
    {
      id: 'PROC-002',
      title: 'Data Breach Response',
      type: 'incident-response',
      priority: 'critical',
      description: 'Procedures for handling data breach incidents and notifications',
      steps: 15,
      estimatedTime: '4-8 hours',
      lastReviewed: '2024-01-20',
      owner: 'Incident Response Team',
      related: ['PROC-001', 'PROC-008']
    },
    {
      id: 'PROC-003',
      title: 'Threat Hunt: Lateral Movement',
      type: 'threat-hunting',
      priority: 'high',
      description: 'Hunting procedure for detecting lateral movement activities',
      steps: 8,
      estimatedTime: '1-2 hours',
      lastReviewed: '2024-02-28',
      owner: 'Threat Hunting Team',
      related: ['PROC-004']
    },
    {
      id: 'PROC-004',
      title: 'Threat Hunt: C2 Communication',
      type: 'threat-hunting',
      priority: 'high',
      description: 'Hunting for command and control communication patterns',
      steps: 10,
      estimatedTime: '2-3 hours',
      lastReviewed: '2024-03-05',
      owner: 'Threat Hunting Team',
      related: ['PROC-003']
    },
    {
      id: 'PROC-005',
      title: 'Critical Vulnerability Patching',
      type: 'vulnerability',
      priority: 'critical',
      description: 'Emergency patching procedure for critical vulnerabilities',
      steps: 7,
      estimatedTime: '1-3 hours',
      lastReviewed: '2024-02-10',
      owner: 'Vulnerability Management',
      related: ['PROC-006']
    },
    {
      id: 'PROC-006',
      title: 'Vulnerability Assessment Workflow',
      type: 'vulnerability',
      priority: 'medium',
      description: 'Standard workflow for conducting vulnerability assessments',
      steps: 9,
      estimatedTime: '4-6 hours',
      lastReviewed: '2024-01-15',
      owner: 'Vulnerability Management',
      related: ['PROC-005']
    },
    {
      id: 'PROC-007',
      title: 'SOC 2 Audit Preparation',
      type: 'compliance',
      priority: 'high',
      description: 'Preparation procedures for SOC 2 Type II audits',
      steps: 14,
      estimatedTime: '2-3 days',
      lastReviewed: '2024-02-01',
      owner: 'Compliance Team',
      related: ['PROC-008']
    },
    {
      id: 'PROC-008',
      title: 'GDPR Incident Reporting',
      type: 'compliance',
      priority: 'critical',
      description: 'Procedures for GDPR-compliant incident reporting',
      steps: 11,
      estimatedTime: '4-6 hours',
      lastReviewed: '2024-03-01',
      owner: 'Compliance Team',
      related: ['PROC-002', 'PROC-007']
    }
  ]

  const getTypeColor = (type: string): string => {
    const colors: Record<string, string> = {
      'incident-response': '#e11d48',
      'threat-hunting': '#ea580c',
      'vulnerability': '#d97706',
      'compliance': '#4f46e5'
    }
    return colors[type] || '#6b7280'
  }

  const getPriorityColor = (priority: string): string => {
    const colors: Record<string, string> = {
      critical: '#e11d48',
      high: '#ea580c',
      medium: '#d97706',
      low: '#4f46e5'
    }
    return colors[priority] || '#6b7280'
  }

  const filteredProcedures = selectedType === 'all' 
    ? procedures 
    : procedures.filter(p => p.type === selectedType)

  const stats = {
    total: procedures.length,
    critical: procedures.filter(p => p.priority === 'critical').length,
    incident: procedures.filter(p => p.type === 'incident-response').length
  }

  return (
    <div className="py-4 w-full max-w-7xl mx-auto">
      <div className="mb-6 px-4 hig-fade-in">
        <h1 className="hig-title-large text-gray-900 dark:text-gray-100 mb-2">Security Procedures</h1>
        <p className="hig-body text-gray-600 dark:text-gray-400">Standard operating procedures for security operations and incident response</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-3 px-4">
        <div className="hig-card bg-gray-50 dark:bg-gray-700/30 p-4 text-center">
          <div className="hig-caption text-gray-600 dark:text-gray-400 mb-2">Total Procedures</div>
          <div className="hig-metric-value text-4xl text-gray-900 dark:text-gray-100">{stats.total}</div>
        </div>

        <div className="hig-card bg-gray-50 dark:bg-gray-700/30 p-4 text-center">
          <div className="hig-caption text-gray-600 dark:text-gray-400 mb-2">Critical Priority</div>
          <div className="hig-metric-value text-4xl" style={{ color: '#e11d48', WebkitTextFillColor: '#e11d48' }}>
            {stats.critical}
          </div>
        </div>

        <div className="hig-card bg-gray-50 dark:bg-gray-700/30 p-4 text-center">
          <div className="hig-caption text-gray-600 dark:text-gray-400 mb-2">Incident Response</div>
          <div className="hig-metric-value text-4xl" style={{ color: '#ea580c', WebkitTextFillColor: '#ea580c' }}>
            {stats.incident}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 px-4">
        <div className="flex flex-wrap gap-2">
          {['all', 'incident-response', 'threat-hunting', 'vulnerability', 'compliance'].map(type => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`hig-button ${
                selectedType === type
                  ? 'hig-button-primary'
                  : 'hig-button-secondary'
              }`}
            >
              {type === 'all' ? 'All Types' : type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Procedures List */}
      <div className="grid grid-cols-12 gap-4 px-4">
        {filteredProcedures.map((procedure) => (
          <div key={procedure.id} className="col-span-12 lg:col-span-6">
            <div 
              onClick={() => setSelectedProcedure(procedure)}
              className="hig-card cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="hig-body font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2" title={procedure.title}>
                    {procedure.title}
                  </h3>
                  <p className="hig-caption text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{procedure.description}</p>
                </div>
                <span 
                  className="hig-badge flex-shrink-0 ml-2"
                  style={{
                    backgroundColor: `${getPriorityColor(procedure.priority)}20`,
                    color: getPriorityColor(procedure.priority)
                  }}
                >
                  {procedure.priority.toUpperCase()}
                </span>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <span 
                  className="hig-badge"
                  style={{
                    backgroundColor: `${getTypeColor(procedure.type)}20`,
                    color: getTypeColor(procedure.type)
                  }}
                >
                  {procedure.type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="hig-card bg-gray-50 dark:bg-gray-700/30 p-3 text-center">
                  <div className="hig-caption text-gray-600 dark:text-gray-400 mb-1">Steps</div>
                  <div className="hig-metric-value text-3xl text-gray-900 dark:text-gray-100">{procedure.steps}</div>
                </div>
                <div className="hig-card bg-gray-50 dark:bg-gray-700/30 p-3 text-center">
                  <div className="hig-caption text-gray-600 dark:text-gray-400 mb-1">Time</div>
                  <div className="hig-body font-semibold text-gray-900 dark:text-gray-100">{procedure.estimatedTime}</div>
                </div>
                <div className="hig-card bg-gray-50 dark:bg-gray-700/30 p-3 text-center">
                  <div className="hig-caption text-gray-600 dark:text-gray-400 mb-1">Related</div>
                  <div className="hig-metric-value text-3xl text-gray-900 dark:text-gray-100">{procedure.related.length}</div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700/60">
                <span className="hig-caption text-gray-600 dark:text-gray-400">{procedure.owner}</span>
                <span className="text-gray-500 dark:text-gray-400">Reviewed: {formatDate(procedure.lastReviewed)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Procedure Detail Panel */}
      {selectedProcedure && (
        <>
          <div 
            className="hig-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedProcedure(null)}
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
                <div className="flex items-center justify-between mb-2">
                  <h2 className="hig-headline text-gray-900 dark:text-gray-100">Procedure Details</h2>
                  <button
                    onClick={() => setSelectedProcedure(null)}
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                    </svg>
                  </button>
                </div>
                {/* Priority Indicator Bar */}
                <div 
                  className="h-1 rounded-full mt-3" 
                  style={{ backgroundColor: getPriorityColor(selectedProcedure.priority) }}
                />
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto px-6 py-6">
                <div className="space-y-6">
                  <div>
                    <div className="hig-headline text-gray-900 dark:text-gray-100 mb-2">{selectedProcedure.title}</div>
                    <div className="hig-caption text-gray-600 dark:text-gray-400 font-mono">{selectedProcedure.id}</div>
                  </div>

                  <div className="pb-4 border-b border-gray-200 dark:border-gray-700/60">
                    <div className="hig-headline mb-4">Description</div>
                    <div className="hig-body text-gray-700 dark:text-gray-300 leading-relaxed">{selectedProcedure.description}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="hig-caption text-gray-600 dark:text-gray-400 mb-2">Type</div>
                      <span 
                        className="hig-badge"
                        style={{
                          backgroundColor: `${getTypeColor(selectedProcedure.type)}20`,
                          color: getTypeColor(selectedProcedure.type)
                        }}
                      >
                        {selectedProcedure.type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </span>
                    </div>
                    <div>
                      <div className="hig-caption text-gray-600 dark:text-gray-400 mb-2">Priority</div>
                      <span 
                        className="hig-badge"
                        style={{
                          backgroundColor: `${getPriorityColor(selectedProcedure.priority)}20`,
                          color: getPriorityColor(selectedProcedure.priority)
                        }}
                      >
                        {selectedProcedure.priority.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="hig-card bg-gray-50 dark:bg-gray-700/30 p-4 text-center">
                      <div className="hig-caption text-gray-600 dark:text-gray-400 mb-2">Steps</div>
                      <div className="hig-metric-value text-3xl text-gray-900 dark:text-gray-100">{selectedProcedure.steps}</div>
                    </div>
                    <div className="hig-card bg-gray-50 dark:bg-gray-700/30 p-4 text-center">
                      <div className="hig-caption text-gray-600 dark:text-gray-400 mb-2">Time</div>
                      <div className="hig-body font-semibold text-gray-900 dark:text-gray-100">{selectedProcedure.estimatedTime}</div>
                    </div>
                    <div>
                      <div className="hig-caption text-gray-600 dark:text-gray-400 mb-2">Owner</div>
                      <div className="hig-body font-semibold text-gray-900 dark:text-gray-100">{selectedProcedure.owner}</div>
                    </div>
                    <div>
                      <div className="hig-caption text-gray-600 dark:text-gray-400 mb-2">Last Reviewed</div>
                      <div className="hig-body font-semibold text-gray-900 dark:text-gray-100">{formatDate(selectedProcedure.lastReviewed)}</div>
                    </div>
                  </div>

                  <div>
                    <div className="hig-headline mb-4">Related Procedures</div>
                    <div className="flex flex-wrap gap-2">
                      {selectedProcedure.related.map((relatedId, idx) => (
                        <span key={idx} className="hig-badge bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                          {relatedId}
                        </span>
                      ))}
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
                <button className="hig-button hig-button-primary w-full">
                  View Full Procedure
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

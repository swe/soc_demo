'use client'
import { formatDate, formatDateTime } from '@/lib/utils'


import { useEffect, useState } from 'react'
import { usePageTitle } from '@/app/page-title-context'
import { PageHeader, Card, Badge } from '@/components/ui/card'

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

  const getTypeColor = (type: string) => {
    const colors = {
      'incident-response': 'bg-rose-600 dark:bg-rose-700/20 text-red-700 dark:text-red-400',
      'threat-hunting': 'bg-orange-600 dark:bg-orange-700/20 text-orange-700 dark:text-orange-400',
      'vulnerability': 'bg-amber-600 dark:bg-amber-700/20 text-yellow-700 dark:text-yellow-400',
      'compliance': 'bg-indigo-600 dark:bg-indigo-600/20 text-blue-700 dark:text-blue-400'
    }
    return colors[type as keyof typeof colors]
  }

  const getPriorityColor = (priority: string) => {
    const colors = {
      critical: 'bg-rose-600 dark:bg-rose-700/20 text-red-700 dark:text-red-400',
      high: 'bg-orange-600 dark:bg-orange-700/20 text-orange-700 dark:text-orange-400',
      medium: 'bg-amber-600 dark:bg-amber-700/20 text-yellow-700 dark:text-yellow-400',
      low: 'bg-indigo-600 dark:bg-indigo-600/20 text-blue-700 dark:text-blue-400'
    }
    return colors[priority as keyof typeof colors]
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
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-7xl mx-auto">
      <PageHeader 
        title="Security Procedures" 
        description="Standard operating procedures for security operations and incident response" 
      />

      {/* Stats */}
      <div className="grid grid-cols-12 gap-4 mb-6">
        <div className="col-span-12 sm:col-span-4">
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Procedures</div>
              <div className="w-10 h-10 bg-indigo-600 dark:bg-indigo-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</div>
          </div>
        </div>

        <div className="col-span-12 sm:col-span-4">
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600 dark:text-gray-400">Critical Priority</div>
              <div className="w-10 h-10 bg-rose-600 dark:bg-rose-700/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-rose-700 dark:text-rose-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-rose-700 dark:text-rose-400">{stats.critical}</div>
          </div>
        </div>

        <div className="col-span-12 sm:col-span-4">
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600 dark:text-gray-400">Incident Response</div>
              <div className="w-10 h-10 bg-orange-600 dark:bg-orange-700/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-orange-700 dark:text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-orange-700 dark:text-orange-400">{stats.incident}</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {['all', 'incident-response', 'threat-hunting', 'vulnerability', 'compliance'].map(type => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedType === type
                  ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-sm'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              {type === 'all' ? 'All Types' : type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Procedures List */}
      <div className="grid grid-cols-12 gap-4">
        {filteredProcedures.map((procedure) => (
          <div key={procedure.id} className="col-span-12 lg:col-span-6">
            <div 
              onClick={() => setSelectedProcedure(procedure)}
              className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">{procedure.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{procedure.description}</p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(procedure.priority)}`}>
                  {procedure.priority.toUpperCase()}
                </span>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(procedure.type)}`}>
                  {procedure.type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Steps</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-gray-100">{procedure.steps}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Time</div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{procedure.estimatedTime}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Related</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-gray-100">{procedure.related.length}</div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700 text-sm">
                <span className="text-gray-600 dark:text-gray-400">{procedure.owner}</span>
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
            className="fixed inset-0 bg-gray-900/50 z-40"
            onClick={() => setSelectedProcedure(null)}
          />
          <div className="fixed inset-y-0 right-0 w-full md:w-2/3 lg:w-1/2 bg-white dark:bg-gray-800 shadow-xl z-50 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Procedure Details</h2>
                <button
                  onClick={() => setSelectedProcedure(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">{selectedProcedure.title}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{selectedProcedure.id}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Description</div>
                  <div className="text-gray-800 dark:text-gray-100">{selectedProcedure.description}</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Type</div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(selectedProcedure.type)}`}>
                      {selectedProcedure.type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Priority</div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(selectedProcedure.priority)}`}>
                      {selectedProcedure.priority.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Number of Steps</div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{selectedProcedure.steps}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Estimated Time</div>
                  <div className="text-xl font-semibold text-gray-900 dark:text-gray-100">{selectedProcedure.estimatedTime}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Owner</div>
                  <div className="text-gray-800 dark:text-gray-100">{selectedProcedure.owner}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Last Reviewed</div>
                  <div className="text-gray-800 dark:text-gray-100">{formatDate(selectedProcedure.lastReviewed)}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Related Procedures</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedProcedure.related.map((relatedId, idx) => (
                      <span key={idx} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                        {relatedId}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button className="btn bg-indigo-600 dark:bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-700 text-white w-full">
                    View Full Procedure
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

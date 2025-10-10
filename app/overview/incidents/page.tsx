'use client'

import { useEffect, useState } from 'react'
import { usePageTitle } from '@/app/page-title-context'

interface Incident {
  id: string
  title: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  status: 'new' | 'investigating' | 'contained' | 'resolved' | 'closed'
  category: string
  detectedAt: string
  assignedTo: string
  affectedAssets: number
  mitreTechniques: string[]
}

export default function IncidentsPage() {
  const { setPageTitle } = usePageTitle()
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')

  useEffect(() => {
    setPageTitle('Incidents')
  }, [setPageTitle])

  const incidents: Incident[] = [
    {
      id: 'INC-2024-001',
      title: 'Ransomware Attack Detected',
      severity: 'critical',
      status: 'investigating',
      category: 'Malware',
      detectedAt: '15 minutes ago',
      assignedTo: 'Security Team A',
      affectedAssets: 23,
      mitreTechniques: ['T1486', 'T1490', 'T1489']
    },
    {
      id: 'INC-2024-002',
      title: 'Data Exfiltration Attempt',
      severity: 'high',
      status: 'contained',
      category: 'Data Breach',
      detectedAt: '2 hours ago',
      assignedTo: 'Security Team B',
      affectedAssets: 5,
      mitreTechniques: ['T1048', 'T1567']
    },
    {
      id: 'INC-2024-003',
      title: 'Privilege Escalation',
      severity: 'high',
      status: 'investigating',
      category: 'Unauthorized Access',
      detectedAt: '4 hours ago',
      assignedTo: 'Security Team A',
      affectedAssets: 2,
      mitreTechniques: ['T1068', 'T1078']
    },
    {
      id: 'INC-2024-004',
      title: 'DDoS Attack',
      severity: 'medium',
      status: 'resolved',
      category: 'Network Attack',
      detectedAt: '8 hours ago',
      assignedTo: 'Network Team',
      affectedAssets: 12,
      mitreTechniques: ['T1498', 'T1499']
    },
    {
      id: 'INC-2024-005',
      title: 'Phishing Campaign',
      severity: 'low',
      status: 'resolved',
      category: 'Social Engineering',
      detectedAt: '1 day ago',
      assignedTo: 'Security Team C',
      affectedAssets: 8,
      mitreTechniques: ['T1566']
    }
  ]

  const getSeverityColor = (severity: string) => {
    const colors = {
      critical: 'bg-rose-100 dark:bg-rose-900/40 text-rose-800 dark:text-rose-300',
      high: 'bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-300',
      medium: 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300',
      low: 'bg-slate-100 dark:bg-slate-900/40 text-slate-800 dark:text-slate-300'
    }
    return colors[severity as keyof typeof colors]
  }

  const getStatusColor = (status: string) => {
    const colors = {
      new: 'bg-rose-100 dark:bg-rose-900/40 text-rose-800 dark:text-rose-300',
      investigating: 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300',
      contained: 'bg-sky-100 dark:bg-sky-900/40 text-sky-800 dark:text-sky-300',
      resolved: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300',
      closed: 'bg-slate-100 dark:bg-slate-900/40 text-slate-800 dark:text-slate-300'
    }
    return colors[status as keyof typeof colors]
  }

  const stats = {
    total: incidents.length,
    critical: incidents.filter(i => i.severity === 'critical').length,
    investigating: incidents.filter(i => i.status === 'investigating').length,
    resolved: incidents.filter(i => i.status === 'resolved').length
  }

  const filteredIncidents = filterStatus === 'all' 
    ? incidents 
    : incidents.filter(i => i.status === filterStatus)

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold mb-2">Security Incidents</h1>
        <p className="text-gray-600 dark:text-gray-400">Monitor and manage security incidents and response activities</p>
      </div>

      {/* Sticky Status Bar - Consolidated metrics */}
      <div className="sticky top-16 z-40 before:absolute before:inset-0 before:backdrop-blur-md before:bg-white/90 dark:before:bg-gray-800/90 before:-z-10 border-b border-gray-200 dark:border-gray-700/60 mb-6 -mx-4 sm:-mx-6 lg:-mx-8">
        <div className="px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-6">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {stats.total} Total
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-rose-600 dark:bg-rose-500 rounded-full animate-pulse"></div>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {stats.critical} Critical
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-600 dark:bg-amber-500 rounded-full"></div>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {stats.investigating} Investigating
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-600 dark:bg-emerald-500 rounded-full"></div>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {stats.resolved} Resolved Today
                </span>
              </div>
            </div>
            <div className="text-gray-500 dark:text-gray-400">
              MTTR: <span className="font-semibold text-gray-900 dark:text-gray-100">3.8h</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {['all', 'investigating', 'contained', 'resolved'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                filterStatus === status
                  ? 'bg-slate-700 dark:bg-slate-600 text-white shadow-sm'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Incidents Table */}
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-8">
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Active Incidents</h2>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredIncidents.map((incident) => (
                <div
                  key={incident.id}
                  onClick={() => setSelectedIncident(incident)}
                  className="p-6 hover:bg-gray-50 dark:hover:bg-gray-900/20 cursor-pointer transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100">{incident.title}</h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(incident.severity)}`}>
                          {incident.severity.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <span className="font-mono text-indigo-600">{incident.id}</span>
                        <span>•</span>
                        <span>{incident.category}</span>
                        <span>•</span>
                        <span>{incident.detectedAt}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(incident.status)}`}>
                          {incident.status.toUpperCase()}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                          {incident.affectedAssets} assets affected
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-100 dark:bg-sky-900/40 text-sky-800 dark:text-sky-300">
                          {incident.assignedTo}
                        </span>
                      </div>
                    </div>
                    <button className="text-indigo-600 hover:text-indigo-700 dark:hover:text-indigo-500 ml-4">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Incident Categories & Response Times */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Incident Categories</h2>
            <div className="space-y-3">
              {[
                { name: 'Malware', count: 1, color: 'bg-rose-600 dark:bg-rose-700' },
                { name: 'Data Breach', count: 1, color: 'bg-orange-600 dark:bg-orange-700' },
                { name: 'Unauthorized Access', count: 1, color: 'bg-amber-600 dark:bg-amber-700' },
                { name: 'Network Attack', count: 1, color: 'bg-sky-600 dark:bg-sky-700' },
                { name: 'Social Engineering', count: 1, color: 'bg-slate-600 dark:bg-slate-700' }
              ].map((category, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{category.name}</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{category.count}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className={`${category.color} h-2 rounded-full`} style={{ width: `${(category.count / incidents.length) * 100}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Response Metrics</h2>
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-4">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Avg Response Time</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">12m</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-4">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Avg Resolution Time</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">4.2h</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-4">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">MTTR (Mean Time to Resolve)</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">3.8h</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Panel */}
      {selectedIncident && (
        <>
          <div 
            className="fixed inset-0 bg-gray-900/50 z-40"
            onClick={() => setSelectedIncident(null)}
          />
          <div className="fixed inset-y-0 right-0 w-full md:w-2/3 lg:w-1/2 bg-white dark:bg-gray-800 shadow-xl z-50 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Incident Details</h2>
                <button
                  onClick={() => setSelectedIncident(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Incident ID</div>
                  <div className="text-lg font-mono text-indigo-600">{selectedIncident.id}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Title</div>
                  <div className="text-lg font-semibold text-gray-800 dark:text-gray-100">{selectedIncident.title}</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Severity</div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(selectedIncident.severity)}`}>
                      {selectedIncident.severity.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Status</div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedIncident.status)}`}>
                      {selectedIncident.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Category</div>
                  <div className="text-gray-800 dark:text-gray-100">{selectedIncident.category}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Detected</div>
                  <div className="text-gray-800 dark:text-gray-100">{selectedIncident.detectedAt}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Assigned To</div>
                  <div className="text-gray-800 dark:text-gray-100">{selectedIncident.assignedTo}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Affected Assets</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{selectedIncident.affectedAssets}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">MITRE ATT&CK Techniques</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedIncident.mitreTechniques.map((technique, idx) => (
                      <span key={idx} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-rose-100 dark:bg-rose-900/40 text-red-700 dark:text-red-400 font-mono">
                        {technique}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-2 gap-3">
                    <button className="btn bg-slate-700 hover:bg-slate-800 dark:bg-slate-600 dark:hover:bg-slate-700 text-white">
                      Update Status
                    </button>
                    <button className="btn bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600">
                      Assign to Me
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

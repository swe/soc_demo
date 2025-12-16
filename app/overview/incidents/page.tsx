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
  const [expandedIncidentId, setExpandedIncidentId] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)

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

  const getSeverityColor = (severity: string): string => {
    const colors: Record<string, string> = {
      'critical': '#FF3B30',  // System red
      'high': '#FF9500',      // System orange
      'medium': '#FFCC00',    // System yellow
      'low': '#007AFF'        // System blue
    }
    return colors[severity.toLowerCase()] || '#8E8E93'
  }

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      'new': '#FF3B30',        // System red
      'investigating': '#FF9500', // System orange
      'contained': '#007AFF',   // System blue
      'resolved': '#34C759',    // System green
      'closed': '#8E8E93'      // System gray
    }
    return colors[status.toLowerCase()] || '#8E8E93'
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
    <div className="py-8 w-full max-w-7xl mx-auto">
      <div className="mb-6 px-4 hig-fade-in">
        <h1 className="hig-title-large text-gray-900 dark:text-gray-100 mb-2">Security Incidents</h1>
        <p className="hig-body text-gray-600 dark:text-gray-400">Monitor and manage security incidents and response activities</p>
      </div>

      {/* Sticky Status Bar - Consolidated metrics */}
      <div className="sticky top-16 z-40 before:absolute before:inset-0 before:backdrop-blur-xl before:bg-white/80 dark:before:bg-[#0F172A]/80 before:-z-10 border-b border-gray-200 dark:border-gray-700/60 mb-6 -mx-4 sm:-mx-6 lg:-mx-8">
        <div className="px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-6">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#007AFF]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span className="hig-caption font-semibold text-gray-900 dark:text-gray-100">
                  {stats.total} Total
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#FF3B30] rounded-full animate-pulse"></div>
                <span className="hig-caption font-semibold text-gray-900 dark:text-gray-100">
                  {stats.critical} Critical
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#FF9500] rounded-full"></div>
                <span className="hig-caption font-semibold text-gray-900 dark:text-gray-100">
                  {stats.investigating} Investigating
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#34C759] rounded-full"></div>
                <span className="hig-caption font-semibold text-gray-900 dark:text-gray-100">
                  {stats.resolved} Resolved Today
                </span>
              </div>
            </div>
            <div className="hig-caption">
              MTTR: <span className="font-semibold text-gray-900 dark:text-gray-100">3.8h</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 px-4">
        <div className="flex flex-wrap gap-2">
          {['all', 'investigating', 'contained', 'resolved'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`hig-button ${filterStatus === status ? 'hig-button-primary' : 'hig-button-secondary'}`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Incidents List with Expandable Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 px-4">
        <div className="lg:col-span-8">
          <div className="hig-card">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700/60">
              <h2 className="hig-headline text-gray-900 dark:text-gray-100">Active Incidents</h2>
              <span className="hig-caption text-gray-600 dark:text-gray-400">{filteredIncidents.length} total</span>
            </div>

            <div className="space-y-0">
              {filteredIncidents.map((incident, idx) => {
                const isExpanded = expandedIncidentId === incident.id
                const severityColor = getSeverityColor(incident.severity)
                const statusColor = getStatusColor(incident.status)
                
                return (
                  <div key={incident.id}>
                    <div 
                      className={`flex items-center gap-4 p-4 cursor-pointer transition-colors ${
                        idx !== filteredIncidents.length - 1 ? 'border-b border-gray-200 dark:border-gray-700/60' : ''
                      } ${isExpanded ? 'bg-gray-50 dark:bg-[#334155]/30' : 'hover:bg-gray-50 dark:hover:bg-[#334155]/20'}`}
                      onClick={() => setExpandedIncidentId(isExpanded ? null : incident.id)}
                    >
                      {/* Severity Indicator */}
                      <div 
                        className="w-1 h-12 rounded-full flex-shrink-0"
                        style={{ 
                          backgroundColor: severityColor,
                          boxShadow: `0 0 8px ${severityColor}40`
                        }}
                      />
                      
                      {/* Incident ID */}
                      <div className="w-32 flex-shrink-0">
                        <span className="hig-caption font-mono text-gray-600 dark:text-gray-400">
                          {incident.id}
                        </span>
                      </div>
                      
                      {/* Title and Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="hig-body font-semibold text-gray-900 dark:text-gray-100 mb-1 line-clamp-2" title={incident.title}>
                          {incident.title}
                        </h3>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span 
                            className="hig-badge"
                            style={{
                              backgroundColor: `${severityColor}20`,
                              color: severityColor
                            }}
                          >
                            {incident.severity.toUpperCase()}
                          </span>
                          <span 
                            className="hig-badge"
                            style={{
                              backgroundColor: `${statusColor}20`,
                              color: statusColor
                            }}
                          >
                            {incident.status.toUpperCase()}
                          </span>
                          <span className="hig-caption text-gray-600 dark:text-gray-400">{incident.category}</span>
                          <span className="hig-caption text-gray-600 dark:text-gray-400">•</span>
                          <span className="hig-caption text-gray-600 dark:text-gray-400">{incident.affectedAssets} assets</span>
                        </div>
                      </div>
                      
                      {/* Metrics */}
                      <div className="flex items-center gap-6 flex-shrink-0">
                        <div className="text-right">
                          <div className="hig-caption text-gray-600 dark:text-gray-400">Detected</div>
                          <div className="hig-caption text-gray-900 dark:text-gray-100 font-medium mt-1">
                            {incident.detectedAt}
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedIncident(incident)
                            setTimeout(() => setIsModalOpen(true), 10)
                          }}
                          className="hig-caption hig-link-hover transition-colors"
                        >
                          View Details →
                        </button>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="px-4 pb-4 bg-gray-50 dark:bg-[#334155]/30 border-b border-gray-200 dark:border-gray-700/60">
                        <div className="pt-4 space-y-4">
                          {/* Category and Assignment */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="hig-caption text-gray-600 dark:text-gray-400 mb-1">Category</div>
                              <div className="hig-body text-gray-900 dark:text-gray-100">{incident.category}</div>
                            </div>
                            <div>
                              <div className="hig-caption text-gray-600 dark:text-gray-400 mb-1">Assigned To</div>
                              <div className="hig-body text-gray-900 dark:text-gray-100">{incident.assignedTo}</div>
                            </div>
                          </div>

                          {/* MITRE Techniques */}
                          {incident.mitreTechniques.length > 0 && (
                            <div>
                              <div className="hig-caption text-gray-600 dark:text-gray-400 mb-2">MITRE ATT&CK Techniques</div>
                              <div className="flex flex-wrap gap-2">
                                {incident.mitreTechniques.map((technique, idx) => (
                                  <span 
                                    key={idx}
                                    className="hig-badge font-mono"
                                    style={{
                                      backgroundColor: '#FF3B3020',
                                      color: '#FF3B30'
                                    }}
                                  >
                                    {technique}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Action Button */}
                          <div className="flex gap-3 pt-2">
                            <button 
                              className="hig-button hig-button-primary flex-1"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedIncident(incident)
                                setTimeout(() => setIsModalOpen(true), 10)
                              }}
                            >
                              View Full Details
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Incident Categories & Response Times */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          <div className="hig-card">
            <h2 className="hig-headline text-gray-900 dark:text-gray-100 mb-4">Incident Categories</h2>
            <div className="space-y-3">
              {[
                { name: 'Malware', count: 1, color: 'bg-[#FF3B30] dark:bg-[#FF3B30]' },
                { name: 'Data Breach', count: 1, color: 'bg-[#FF9500] dark:bg-[#FF9500]' },
                { name: 'Unauthorized Access', count: 1, color: 'bg-[#FFCC00] dark:bg-[#FFCC00]' },
                { name: 'Network Attack', count: 1, color: 'bg-[#393A84] dark:bg-[#393A84]' },
                { name: 'Social Engineering', count: 1, color: 'bg-[#393A84] dark:bg-[#393A84]' }
              ].map((category, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="hig-body text-gray-700 dark:text-gray-300">{category.name}</span>
                    <span className="hig-body font-semibold text-gray-900 dark:text-gray-100">{category.count}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className={`${category.color} h-2 rounded-full`} style={{ width: `${(category.count / incidents.length) * 100}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="hig-card">
            <h2 className="hig-headline text-gray-900 dark:text-gray-100 mb-4">Response Metrics</h2>
            <div className="space-y-4">
              <div className="hig-card bg-gray-50 dark:bg-[#334155]/30 p-4 text-center">
                <div className="hig-caption text-gray-600 dark:text-gray-400 mb-2">Avg Response Time</div>
                <div className="hig-metric-value text-3xl text-gray-900 dark:text-gray-100">12m</div>
              </div>
              <div className="hig-card bg-gray-50 dark:bg-[#334155]/30 p-4 text-center">
                <div className="hig-caption text-gray-600 dark:text-gray-400 mb-2">Avg Resolution Time</div>
                <div className="hig-metric-value text-3xl text-gray-900 dark:text-gray-100">4.2h</div>
              </div>
              <div className="hig-card bg-gray-50 dark:bg-[#334155]/30 p-4 text-center">
                <div className="hig-caption text-gray-600 dark:text-gray-400 mb-2">MTTR (Mean Time to Resolve)</div>
                <div className="hig-metric-value text-3xl text-gray-900 dark:text-gray-100">3.8h</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Incident Details */}
      {selectedIncident && (
        <div className="hig-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="hig-modal p-0 max-w-4xl w-full flex flex-col max-h-[90vh]">
            {/* Fixed Header */}
            <div 
              className="sticky top-0 z-10 backdrop-blur-xl backdrop-saturate-150 bg-white/80 dark:bg-[#1E293B]/80 border-b border-gray-200 dark:border-gray-700/60 p-6 pb-4"
              style={{
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                backdropFilter: 'blur(20px) saturate(180%)'
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="hig-headline text-gray-900 dark:text-gray-100">Incident Details</h2>
                <button
                  onClick={() => {
                    setIsModalOpen(false)
                    setTimeout(() => setSelectedIncident(null), 300)
                  }}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
                >
                  <span className="sr-only">Close</span>
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  </svg>
                </button>
              </div>
              {/* Risk Indicator Bar */}
              <div 
                className="h-1 rounded-full" 
                style={{ backgroundColor: getSeverityColor(selectedIncident.severity) }}
              />
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              {/* Metric Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="hig-card bg-gray-50 dark:bg-[#334155]/30 p-4 text-center">
                  <div className="hig-caption text-gray-600 dark:text-gray-400 mb-2">Affected Assets</div>
                  <div className="hig-metric-value text-3xl text-gray-900 dark:text-gray-100">
                    {selectedIncident.affectedAssets}
                  </div>
                </div>
                <div className="hig-card bg-gray-50 dark:bg-[#334155]/30 p-4 text-center">
                  <div className="hig-caption text-gray-600 dark:text-gray-400 mb-2">MITRE Techniques</div>
                  <div className="hig-metric-value text-3xl text-gray-900 dark:text-gray-100">
                    {selectedIncident.mitreTechniques.length}
                  </div>
                </div>
              </div>

              {/* Incident Information */}
              <div className="space-y-4 pb-4 border-b border-gray-200 dark:border-gray-700/60 mb-4">
                <div>
                  <div className="hig-caption text-gray-600 dark:text-gray-400 mb-1">Incident ID</div>
                  <div className="hig-body font-mono text-gray-900 dark:text-gray-100">{selectedIncident.id}</div>
                </div>
                <div>
                  <div className="hig-caption text-gray-600 dark:text-gray-400 mb-1">Title</div>
                  <div className="hig-headline text-gray-900 dark:text-gray-100">{selectedIncident.title}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div>
                    <div className="hig-caption text-gray-600 dark:text-gray-400 mb-1">Severity</div>
                    <span 
                      className="hig-badge"
                      style={{
                        backgroundColor: `${getSeverityColor(selectedIncident.severity)}20`,
                        color: getSeverityColor(selectedIncident.severity)
                      }}
                    >
                      {selectedIncident.severity.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="hig-caption text-gray-600 dark:text-gray-400 mb-1">Status</div>
                    <span 
                      className="hig-badge"
                      style={{
                        backgroundColor: `${getStatusColor(selectedIncident.status)}20`,
                        color: getStatusColor(selectedIncident.status)
                      }}
                    >
                      {selectedIncident.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Detailed Information */}
              <div className="space-y-4 pb-4 border-b border-gray-200 dark:border-gray-700/60 mb-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="hig-caption text-gray-600 dark:text-gray-400 mb-1">Category</div>
                    <div className="hig-body text-gray-900 dark:text-gray-100">{selectedIncident.category}</div>
                  </div>
                  <div>
                    <div className="hig-caption text-gray-600 dark:text-gray-400 mb-1">Detected</div>
                    <div className="hig-body text-gray-900 dark:text-gray-100">{selectedIncident.detectedAt}</div>
                  </div>
                  <div>
                    <div className="hig-caption text-gray-600 dark:text-gray-400 mb-1">Assigned To</div>
                    <div className="hig-body text-gray-900 dark:text-gray-100">{selectedIncident.assignedTo}</div>
                  </div>
                </div>
              </div>

              {/* MITRE Techniques */}
              {selectedIncident.mitreTechniques.length > 0 && (
                <div className="pb-4 border-b border-gray-200 dark:border-gray-700/60 mb-4">
                  <h3 className="hig-headline mb-4">MITRE ATT&CK Techniques</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedIncident.mitreTechniques.map((technique, idx) => (
                      <span 
                        key={idx}
                        className="hig-badge font-mono"
                        style={{
                          backgroundColor: '#FF3B3020',
                          color: '#FF3B30'
                        }}
                      >
                        {technique}
                      </span>
                    ))}
                  </div>
                </div>
              )}
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
                <button className="hig-button hig-button-primary flex-1">
                  Update Status
                </button>
                <button className="hig-button hig-button-secondary flex-1" onClick={() => {
                  setIsModalOpen(false)
                  setTimeout(() => setSelectedIncident(null), 300)
                }}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

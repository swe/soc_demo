'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { usePageTitle } from '@/app/page-title-context'
import Icon from '@/components/ui/icon'
import { getSeverity, getStatus, getSeverityColor, getStatusColor, formatNumber } from '@/lib/utils'

// Dynamically import AttackMap to avoid SSR issues with Leaflet
const AttackMap = dynamic(() => import('@/components/attack-map'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="hig-caption">Loading map...</div>
    </div>
  )
})

// Realistic threat actors and attack types
const THREAT_ACTORS = [
  'APT29 (Cozy Bear)', 'APT28 (Fancy Bear)', 'Lazarus Group', 'Scattered Spider', 
  'BlackCat/ALPHV', 'LockBit 3.0', 'Conti', 'FIN7', 'Kimsuky'
]

const ATTACK_TYPES = [
  'Ransomware', 'Phishing Campaign', 'DDoS Attack', 'SQL Injection', 
  'Credential Stuffing', 'Zero-Day Exploit', 'Supply Chain Attack', 
  'Business Email Compromise', 'Cryptojacking'
]

// Realistic incident data pool
const generateIncident = (id: number) => {
  const statuses = ['investigating', 'resolved', 'escalated']
  const severities = ['critical', 'high', 'medium', 'low']
  const analysts = ['Sarah Chen', 'James Rodriguez', 'Michael Kim', 'Emily Taylor', 'Alex Petrov', 'Maria Garcia']
  const sources = [
    '185.220.101.43', '45.142.212.61', '193.169.194.75', '91.219.236.197',
    'prod-db-01.internal', 'finance-ws-12', 'marketing-lt-08', 'hr-srv-03'
  ]
  
  const severity = severities[Math.floor(Math.random() * severities.length)]
  const status = statuses[Math.floor(Math.random() * statuses.length)]
  const attackType = ATTACK_TYPES[Math.floor(Math.random() * ATTACK_TYPES.length)]
  const analyst = analysts[Math.floor(Math.random() * analysts.length)]
  const source = sources[Math.floor(Math.random() * sources.length)]
  
  const hours = Math.floor(Math.random() * 12) + 1
  
  return {
    id: `INC-2024-${String(id).padStart(4, '0')}`,
    title: attackType,
    severity,
    status,
    description: `${attackType} detected from ${source}`,
    source,
    analyst,
    time: `${hours} hour${hours > 1 ? 's' : ''} ago`
  }
}

export default function OverviewPage() {
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null)
  const { setPageTitle } = usePageTitle()
  
  // Live updating metrics
  const [metrics, setMetrics] = useState({
    activeThreats: 47,
    incidents: 23,
    vulnerabilities: 1247,
    assets: 2847,
    threatChange: 12.5,
    incidentChange: -8.2,
    vulnChange: 5.3,
    assetChange: 2.1
  })
  
  // Live incidents
  const [incidents, setIncidents] = useState<any[]>([])
  const [topThreatActor, setTopThreatActor] = useState(THREAT_ACTORS[0])
  const [isClient, setIsClient] = useState(false)
  
  // Modal states
  const [showIncidentModal, setShowIncidentModal] = useState(false)
  const [editingIncident, setEditingIncident] = useState<any>(null)

  // Initialize data on client side only
  useEffect(() => {
    setIsClient(true)
    setIncidents(Array.from({ length: 5 }, (_, i) => generateIncident(847 + i)))
  }, [])

  useEffect(() => {
    setPageTitle('Security Operations Center')
  }, [setPageTitle])

  // Live data updates every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        activeThreats: Math.max(30, prev.activeThreats + (Math.random() > 0.5 ? 1 : -1)),
        incidents: Math.max(15, prev.incidents + (Math.random() > 0.6 ? 1 : -1)),
        vulnerabilities: Math.max(1000, prev.vulnerabilities + Math.floor(Math.random() * 10 - 3)),
        assets: Math.max(2800, prev.assets + Math.floor(Math.random() * 5 - 2)),
        threatChange: parseFloat((Math.random() * 20 - 5).toFixed(1)),
        incidentChange: parseFloat((Math.random() * 15 - 7).toFixed(1)),
        vulnChange: parseFloat((Math.random() * 10 - 2).toFixed(1)),
        assetChange: parseFloat((Math.random() * 5 - 1).toFixed(1))
      }))
      
      if (Math.random() > 0.7) {
        const newId = 847 + Math.floor(Math.random() * 100)
        setIncidents(prev => [generateIncident(newId), ...prev.slice(0, 4)])
      }
      
      if (Math.random() > 0.8) {
        const newActor = THREAT_ACTORS[Math.floor(Math.random() * THREAT_ACTORS.length)]
        setTopThreatActor(newActor)
      }
      
      setLastUpdateTime(new Date())
    }, 5000)
    
    return () => clearInterval(interval)
  }, [])

  const handleAddIncident = () => {
    setEditingIncident(null)
    setShowIncidentModal(true)
  }

  const handleEditIncident = (incident: any) => {
    setEditingIncident(incident)
    setShowIncidentModal(true)
  }

  const handleSaveIncident = (data: any) => {
    if (editingIncident) {
      setIncidents(prev => prev.map(inc => inc.id === editingIncident.id ? { ...inc, ...data } : inc))
    } else {
      const newIncident = {
        ...data,
        id: `INC-2024-${String(Math.floor(Math.random() * 1000) + 900).padStart(4, '0')}`,
        time: 'Just now'
      }
      setIncidents(prev => [newIncident, ...prev.slice(0, 4)])
    }
    setShowIncidentModal(false)
  }

  return (
    <div className="py-4 w-full max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="mb-3 px-4 hig-fade-in">
        <h1 className="hig-title-large text-gray-900 dark:text-gray-100 mb-2">
          Security Operations Center
        </h1>
        <p className="hig-body text-gray-600 dark:text-gray-400">
          Real-time security monitoring and threat intelligence
        </p>
      </div>

      {/* Key Metrics */}
      <div className="mb-3 px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="hig-card">
            <div className="hig-caption text-gray-600 dark:text-gray-400 mb-3">Active Threats</div>
            <div className="flex items-start justify-between mb-3">
              <div className="hig-metric-value">{metrics.activeThreats}</div>
              <div className={`px-2 py-1 rounded-md text-xs font-semibold ${parseFloat(metrics.threatChange as any) > 0 ? 'bg-rose-100 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400' : 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'}`}>
                {parseFloat(metrics.threatChange as any) > 0 ? '+' : ''}{metrics.threatChange}%
              </div>
            </div>
            <div className="pt-3 border-t border-gray-100 dark:border-gray-700/60">
              <div className="flex items-center gap-2 hig-caption text-gray-500">
                <span className="text-rose-600 dark:text-rose-400 font-medium">{Math.floor(metrics.activeThreats * 0.17)}</span>
                <span>critical</span>
                <span>•</span>
                <span className="text-orange-600 dark:text-orange-400 font-medium">{Math.floor(metrics.activeThreats * 0.32)}</span>
                <span>high</span>
              </div>
            </div>
          </div>

          <div className="hig-card">
            <div className="hig-caption text-gray-600 dark:text-gray-400 mb-3">Incidents</div>
            <div className="flex items-start justify-between mb-3">
              <div className="hig-metric-value">{metrics.incidents}</div>
              <div className={`px-2 py-1 rounded-lg text-xs font-semibold ${parseFloat(metrics.incidentChange as any) > 0 ? 'bg-rose-100 dark:bg-rose-900/20 text-[#e11d48]' : 'bg-emerald-100 dark:bg-emerald-900/20 text-[#059669]'}`}>
                {parseFloat(metrics.incidentChange as any) > 0 ? '+' : ''}{metrics.incidentChange}%
              </div>
            </div>
            <div className="pt-3 border-t border-gray-100 dark:border-gray-700/60">
              <div className="flex items-center gap-2 hig-caption text-gray-500">
                <span className="text-[#ea580c] font-medium">{Math.floor(metrics.incidents * 0.3)}</span>
                <span>investigating</span>
                <span>•</span>
                <span className="text-[#059669] font-medium">{Math.floor(metrics.incidents * 0.7)}</span>
                <span>resolved</span>
              </div>
            </div>
          </div>

          <div className="hig-card">
            <div className="hig-caption text-gray-600 dark:text-gray-400 mb-3">Vulnerabilities</div>
            <div className="flex items-start justify-between mb-3">
              <div className="hig-metric-value">{formatNumber(metrics.vulnerabilities)}</div>
              <div className={`px-2 py-1 rounded-lg text-xs font-semibold ${parseFloat(metrics.vulnChange as any) > 0 ? 'bg-rose-100 dark:bg-rose-900/20 text-[#e11d48]' : 'bg-emerald-100 dark:bg-emerald-900/20 text-[#059669]'}`}>
                {parseFloat(metrics.vulnChange as any) > 0 ? '+' : ''}{metrics.vulnChange}%
              </div>
            </div>
            <div className="pt-3 border-t border-gray-100 dark:border-gray-700/60">
              <div className="flex items-center gap-2 hig-caption text-gray-500">
                <span className="text-[#e11d48] font-medium">{Math.floor(metrics.vulnerabilities * 0.018)}</span>
                <span>critical</span>
                <span>•</span>
                <span className="text-[#ea580c] font-medium">{Math.floor(metrics.vulnerabilities * 0.125)}</span>
                <span>high</span>
              </div>
            </div>
          </div>

          <div className="hig-card">
            <div className="hig-caption text-gray-600 dark:text-gray-400 mb-3">Assets Protected</div>
            <div className="hig-metric-value mb-3">{formatNumber(metrics.assets)}</div>
            <div className="pt-3 border-t border-gray-100 dark:border-gray-700/60">
              <div className="flex items-center gap-2 hig-caption text-gray-500">
                <span className="text-indigo-600 dark:text-indigo-400 font-medium">{formatNumber(Math.floor(metrics.assets * 0.433))}</span>
              <span>devices</span>
              <span>•</span>
              <span className="text-violet-600 dark:text-violet-400 font-medium">{formatNumber(Math.floor(metrics.assets * 0.567))}</span>
                <span>users</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky System Status Bar */}
      <div className="sticky top-16 z-40 before:absolute before:inset-0 before:backdrop-blur-xl before:bg-white/80 dark:before:bg-gray-950/80 before:-z-10 border-b border-gray-200 dark:border-gray-700/60 mb-3 -mx-4 sm:-mx-6 lg:-mx-8">
        <div className="px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-8 flex-wrap">
            <span className="hig-caption text-gray-600 dark:text-gray-400 font-medium">Systems Status:</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#059669] rounded-full"></div>
              <span className="hig-caption text-gray-900 dark:text-gray-100">SIEM</span>
              <span className="hig-body font-semibold text-[#059669]">99.9%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#059669] rounded-full"></div>
              <span className="hig-caption text-gray-900 dark:text-gray-100">Threat Intel</span>
              <span className="hig-body font-semibold text-[#059669]">100%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#059669] rounded-full"></div>
              <span className="hig-caption text-gray-900 dark:text-gray-100">Endpoints</span>
              <span className="hig-body font-semibold text-[#059669]">99.8%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#059669] rounded-full"></div>
              <span className="hig-caption text-gray-900 dark:text-gray-100">Network</span>
              <span className="hig-body font-semibold text-[#059669]">99.7%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Three Cards Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-3 px-4">
        {/* SOC Performance */}
        <div className="hig-card">
          <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200 dark:border-gray-700/60">
            <h3 className="hig-headline text-gray-900 dark:text-gray-100">SOC Performance</h3>
            <div className="w-2 h-2 bg-[#059669] rounded-full animate-pulse"></div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-700/60">
              <span className="hig-body text-gray-600 dark:text-gray-400">Mean Time to Detect</span>
              <span className="hig-body font-semibold text-gray-900 dark:text-gray-100">3.2m</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-700/60">
              <span className="hig-body text-gray-600 dark:text-gray-400">Mean Time to Respond</span>
              <span className="hig-body font-semibold text-gray-900 dark:text-gray-100">8.7m</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-700/60">
              <span className="hig-body text-gray-600 dark:text-gray-400">False Positive Rate</span>
              <span className="hig-body font-semibold text-[#059669]">7.2%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="hig-body text-gray-600 dark:text-gray-400">Alert Accuracy</span>
              <span className="hig-body font-semibold text-[#059669]">92.8%</span>
            </div>
          </div>
        </div>

        {/* Threat Landscape */}
        <div className="hig-card">
          <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200 dark:border-gray-700/60">
            <h3 className="hig-headline text-gray-900 dark:text-gray-100">Threat Landscape</h3>
            <Link href="/overview/threat-intelligence/overview" className="hig-caption hig-link-hover font-semibold">
              View →
            </Link>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-700/60">
              <span className="hig-body text-gray-600 dark:text-gray-400">Top Threat Actor</span>
              <span className="hig-body font-semibold text-[#e11d48] text-right max-w-[60%] truncate">{topThreatActor}</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-700/60">
              <span className="hig-body text-gray-600 dark:text-gray-400">Active Campaigns</span>
              <span className="hig-body font-semibold text-gray-900 dark:text-gray-100">12</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-700/60">
              <span className="hig-body text-gray-600 dark:text-gray-400">IOCs Detected</span>
              <span className="hig-body font-semibold text-gray-900 dark:text-gray-100">1,247</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="hig-body text-gray-600 dark:text-gray-400">Block Rate</span>
              <span className="hig-body font-semibold text-[#059669]">95.3%</span>
            </div>
          </div>
        </div>

        {/* Compliance */}
        <div className="hig-card">
          <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200 dark:border-gray-700/60">
            <h3 className="hig-headline text-gray-900 dark:text-gray-100">Compliance</h3>
            <Link href="/overview/compliance" className="hig-caption hig-link-hover font-semibold">
              View →
            </Link>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="hig-body text-gray-600 dark:text-gray-400">Overall Score</span>
                <span className="hig-body font-semibold text-[#059669]">92%</span>
              </div>
              <div className="hig-progress">
                <div className="hig-progress-bar" style={{ width: '92%' }}></div>
              </div>
            </div>
            <div className="space-y-2">
              {[
                { name: 'ISO 27001', score: 98, status: 'compliant' },
                { name: 'SOC 2 Type II', score: 95, status: 'compliant' },
                { name: 'HIPAA', score: 92, status: 'compliant' }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-700/60 last:border-0 last:pb-0">
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${item.status === 'compliant' ? 'bg-[#059669]' : 'bg-[#d97706]'}`}></div>
                    <span className="hig-body text-gray-900 dark:text-gray-100">{item.name}</span>
                  </div>
                  <span className="hig-body font-semibold text-gray-900 dark:text-gray-100">{item.score}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Full Width */}
      <div className="mb-6 px-4">
        {/* Incidents List - Full Width */}
        <div className="col-span-12">
          {/* Enhanced List Design */}
          <div className="hig-card overflow-hidden">
            {/* Header inside card */}
            <div className="flex items-center justify-between mb-3 pb-4 border-b border-gray-200 dark:border-gray-700/60">
              <h2 className="hig-headline text-gray-900 dark:text-gray-100">Recent Incidents</h2>
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleAddIncident}
                  className="hig-button hig-button-primary text-sm px-4 py-2"
                >
                  <Icon name="add-outline" className="text-base mr-1" />
                  New
                </button>
                <Link href="/overview/incidents" className="hig-caption hig-link-hover font-semibold">
                  View All →
                </Link>
              </div>
            </div>
            <div className="space-y-0">
              {!isClient || incidents.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <div className="hig-caption">Loading incidents...</div>
                </div>
              ) : (
                incidents.map((incident, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center gap-4 py-3 px-6 cursor-pointer border-b border-gray-100 dark:border-gray-700/60 last:border-0 hover:bg-gray-50/50 dark:hover:bg-gray-800/30"
                    onClick={() => handleEditIncident(incident)}
                  >
                    <div 
                      className="w-1.5 h-12 rounded-full flex-shrink-0 shadow-sm" 
                      style={{ 
                        backgroundColor: getSeverityColor(incident.severity),
                        boxShadow: `0 0 8px ${getSeverityColor(incident.severity)}40`
                      }}
                    ></div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1 flex-wrap">
                        <span className="hig-body font-semibold text-gray-900 dark:text-gray-100">{incident.title}</span>
                        <span
                          className="hig-badge"
                          style={{
                            backgroundColor: `${getStatusColor(incident.status)}20`,
                            color: getStatusColor(incident.status)
                          }}
                        >
                          {incident.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 hig-caption text-gray-500">
                        <span className="font-mono">{incident.id}</span>
                        <span>•</span>
                        <span>{incident.source}</span>
                        <span>•</span>
                        <span>{incident.analyst}</span>
                        <span>•</span>
                        <span>{incident.time}</span>
                      </div>
                    </div>
                    
                    <div className="flex-shrink-0">
                      <Icon name="chevron-forward-outline" className="text-base text-gray-400" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Threat Map - Full Width */}
      <div className="mb-6 px-4">
        <div className="hig-card overflow-hidden">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700/60">
            <h2 className="hig-headline text-gray-900 dark:text-gray-100">Global Threat Map</h2>
            <Link href="/overview/threat-hunting/map" className="hig-caption hig-link-hover font-semibold">
              View Details →
            </Link>
          </div>
          <div className="h-[500px]">
            <AttackMap />
          </div>
        </div>
      </div>

      {/* Incident Modal */}
      {showIncidentModal && (
        <IncidentModal
          incident={editingIncident}
          onClose={() => setShowIncidentModal(false)}
          onSave={handleSaveIncident}
        />
      )}
    </div>
  )
}

// Incident Modal Component
function IncidentModal({ incident, onClose, onSave }: any) {
  const [formData, setFormData] = useState({
    title: incident?.title || '',
    severity: incident?.severity || 'medium',
    status: incident?.status || 'investigating',
    description: incident?.description || '',
    source: incident?.source || '',
    analyst: incident?.analyst || 'Sarah Chen'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case 'critical': return '#e11d48'
      case 'high': return '#ea580c'
      case 'medium': return '#d97706'
      default: return '#4f46e5'
    }
  }

  return (
    <div className="hig-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="hig-modal p-0 max-w-2xl w-full flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <form id="incident-form" onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          {/* Fixed Header */}
          <div 
            className="sticky top-0 z-10 backdrop-blur-xl backdrop-saturate-150 bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-700/60 p-6 pb-4"
            style={{
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              backdropFilter: 'blur(20px) saturate(180%)'
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <h2 className="hig-headline text-gray-900 dark:text-gray-100">
                {incident ? 'Edit Incident' : 'New Incident'}
              </h2>
              <button 
                type="button"
                onClick={onClose} 
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
              >
                <Icon name="close-outline" className="text-2xl" />
              </button>
            </div>
            {/* Severity Indicator Bar */}
            <div 
              className="h-1 rounded-full" 
              style={{ backgroundColor: getSeverityColor(formData.severity) }}
            />
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="space-y-4">
            <div>
              <label className="block hig-body font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="hig-input w-full"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block hig-body font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Severity
                </label>
                <select
                  value={formData.severity}
                  onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                  className="hig-input w-full"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="block hig-body font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="hig-input w-full"
                >
                  <option value="investigating">Investigating</option>
                  <option value="resolved">Resolved</option>
                  <option value="escalated">Escalated</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block hig-body font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="hig-input w-full min-h-[100px] resize-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block hig-body font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Source
                </label>
                <input
                  type="text"
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  className="hig-input w-full"
                  placeholder="IP or hostname"
                />
              </div>

              <div>
                <label className="block hig-body font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Assigned Analyst
                </label>
                <select
                  value={formData.analyst}
                  onChange={(e) => setFormData({ ...formData, analyst: e.target.value })}
                  className="hig-input w-full"
                >
                  <option value="Sarah Chen">Sarah Chen</option>
                  <option value="James Rodriguez">James Rodriguez</option>
                  <option value="Michael Kim">Michael Kim</option>
                  <option value="Emily Taylor">Emily Taylor</option>
                  <option value="Alex Petrov">Alex Petrov</option>
                  <option value="Maria Garcia">Maria Garcia</option>
                </select>
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
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="hig-button hig-button-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="hig-button hig-button-primary"
              >
                {incident ? 'Save Changes' : 'Create Incident'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

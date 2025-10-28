'use client'
import { formatDate, formatDateTime } from '../../lib/utils'


import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { usePageTitle } from '@/app/page-title-context'
import Icon from '@/components/ui/icon'

// Dynamically import AttackMap to avoid SSR issues with Leaflet
const AttackMap = dynamic(() => import('@/components/attack-map'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900/20 rounded-lg">
      <div className="text-gray-500 dark:text-gray-400">Loading map...</div>
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

const COMPANIES = [
  'Amazon Web Services', 'Microsoft Azure', 'Google Cloud', 'Oracle',
  'Salesforce', 'Adobe', 'ServiceNow', 'Slack', 'Zoom', 'Dropbox'
]

const CVES = [
  'CVE-2024-3400', 'CVE-2024-4577', 'CVE-2023-46805', 'CVE-2024-21887',
  'CVE-2024-1086', 'CVE-2024-26169', 'CVE-2024-20353', 'CVE-2024-23897'
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

// Generate vulnerabilities
const generateVulnerability = (id: number) => {
  const cve = CVES[Math.floor(Math.random() * CVES.length)]
  const severities = ['critical', 'high', 'medium', 'low']
  const severity = severities[Math.floor(Math.random() * severities.length)]
  const company = COMPANIES[Math.floor(Math.random() * COMPANIES.length)]
  const affected = Math.floor(Math.random() * 150) + 5
  
  return {
    id: `VUL-${String(id).padStart(5, '0')}`,
    cve,
    severity,
    title: `${cve} in ${company}`,
    affected,
    patched: Math.floor(affected * (Math.random() * 0.7 + 0.1))
  }
}

export default function OverviewPage() {
  const [lastUpdateTime, setLastUpdateTime] = useState(new Date())
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
  
  // Live incidents - Initialize with empty arrays to avoid hydration mismatch
  const [incidents, setIncidents] = useState<any[]>([])
  
  const [vulnerabilities, setVulnerabilities] = useState<any[]>([])
  
  const [topThreatActor, setTopThreatActor] = useState(THREAT_ACTORS[0])
  
  const [isClient, setIsClient] = useState(false)
  
  // Modal states
  const [showIncidentModal, setShowIncidentModal] = useState(false)
  const [showVulnModal, setShowVulnModal] = useState(false)
  const [editingIncident, setEditingIncident] = useState<any>(null)

  // Initialize data on client side only to avoid hydration mismatch
  useEffect(() => {
    setIsClient(true)
    setIncidents(Array.from({ length: 4 }, (_, i) => generateIncident(847 + i)))
    setVulnerabilities(Array.from({ length: 3 }, (_, i) => generateVulnerability(1001 + i)))
  }, [])

  useEffect(() => {
    setPageTitle('Security Operations Center')
  }, [setPageTitle])

  // Live data updates every 5 seconds
  useEffect(() => {
    console.log('🚀 Starting live data updates...')
    
    const interval = setInterval(() => {
      console.log('⚡ Updating metrics at', new Date().toLocaleTimeString())
      
      // Update metrics with small random changes
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
      
      // Occasionally update incidents (30% chance)
      if (Math.random() > 0.7) {
        const newId = 847 + Math.floor(Math.random() * 100)
        console.log('🔴 Adding new incident:', `INC-2024-${newId}`)
        setIncidents(prev => [generateIncident(newId), ...prev.slice(0, 3)])
      }
      
      // Update threat actor occasionally
      if (Math.random() > 0.8) {
        const newActor = THREAT_ACTORS[Math.floor(Math.random() * THREAT_ACTORS.length)]
        console.log('👤 New top threat actor:', newActor)
        setTopThreatActor(newActor)
      }
      
      setLastUpdateTime(new Date())
    }, 5000)
    
    return () => {
      console.log('🛑 Stopping live data updates')
      clearInterval(interval)
    }
  }, [])

  const formatRelativeTime = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSeconds = Math.floor(diffMs / 1000)
    
    if (diffSeconds < 10) return 'Just now'
    if (diffSeconds < 60) return `${diffSeconds} seconds ago`
    
    const diffMinutes = Math.floor(diffSeconds / 60)
    if (diffMinutes === 1) return '1 minute ago'
    if (diffMinutes < 60) return `${diffMinutes} minutes ago`
    
    const diffHours = Math.floor(diffMinutes / 60)
    if (diffHours === 1) return '1 hour ago'
    return `${diffHours} hours ago`
  }

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
      setIncidents(prev => [newIncident, ...prev.slice(0, 3)])
    }
    setShowIncidentModal(false)
  }

  const handleAddVulnerability = () => {
    setShowVulnModal(true)
  }

  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case 'critical': return 'bg-rose-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-amber-500'
      default: return 'bg-blue-500'
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch(severity) {
      case 'critical': return 'bg-rose-100 dark:bg-rose-900/50 text-rose-800 dark:text-rose-200'
      case 'high': return 'bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-200'
      case 'medium': return 'bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200'
      default: return 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200'
    }
  }

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'resolved': return 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200'
      case 'investigating': return 'bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200'
      case 'escalated': return 'bg-rose-100 dark:bg-rose-900/50 text-rose-800 dark:text-rose-200'
      default: return 'bg-gray-100 dark:bg-gray-900/50 text-gray-800 dark:text-gray-200'
    }
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">
      {/* Executive Header with Status */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold mb-2">Security Operations Center</h1>
            <p className="text-gray-600 dark:text-gray-400">Real-time security posture and threat intelligence dashboard</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">Live</span>
          </div>
        </div>
      </div>

      {/* Security Metrics - New Design */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {/* Active Threats */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {metrics.activeThreats}
            </div>
            <div className={`flex items-center text-sm font-medium ${parseFloat(metrics.threatChange as any) > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
              {parseFloat(metrics.threatChange as any) > 0 ? '+' : ''}{metrics.threatChange}%
              <Icon name={parseFloat(metrics.threatChange as any) > 0 ? "trending-up-outline" : "trending-down-outline"} className="text-sm ml-1" />
            </div>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Active threats
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            <span className="text-rose-600 font-medium">{Math.floor(metrics.activeThreats * 0.17)} critical</span> • 
            <span className="text-orange-600 font-medium"> {Math.floor(metrics.activeThreats * 0.32)} high</span> • 
            <span className="text-amber-600 font-medium"> {Math.floor(metrics.activeThreats * 0.51)} medium</span>
          </div>
        </div>

        {/* Security Incidents */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {metrics.incidents}
            </div>
            <div className={`flex items-center text-sm font-medium ${parseFloat(metrics.incidentChange as any) > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
              {parseFloat(metrics.incidentChange as any) > 0 ? '+' : ''}{metrics.incidentChange}%
              <Icon name={parseFloat(metrics.incidentChange as any) > 0 ? "trending-up-outline" : "trending-down-outline"} className="text-sm ml-1" />
            </div>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Security incidents
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            <span className="text-amber-600 font-medium">{Math.floor(metrics.incidents * 0.3)} investigating</span> • 
            <span className="text-emerald-600 font-medium"> {Math.floor(metrics.incidents * 0.7)} resolved</span>
          </div>
        </div>

        {/* Vulnerabilities */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {metrics.vulnerabilities}
            </div>
            <div className={`flex items-center text-sm font-medium ${parseFloat(metrics.vulnChange as any) > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
              {parseFloat(metrics.vulnChange as any) > 0 ? '+' : ''}{metrics.vulnChange}%
              <Icon name={parseFloat(metrics.vulnChange as any) > 0 ? "trending-up-outline" : "trending-down-outline"} className="text-sm ml-1" />
            </div>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Vulnerabilities
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            <span className="text-rose-600 font-medium">{Math.floor(metrics.vulnerabilities * 0.018)} critical</span> • 
            <span className="text-orange-600 font-medium"> {Math.floor(metrics.vulnerabilities * 0.125)} high</span> • 
            <span className="text-amber-600 font-medium"> {Math.floor(metrics.vulnerabilities * 0.715)} medium</span>
          </div>
        </div>

        {/* Assets Protected */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="mb-3">
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {metrics.assets}
            </div>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Assets protected
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            <span className="text-blue-600 font-medium">{Math.floor(metrics.assets * 0.433)} devices</span> • 
            <span className="text-indigo-600 font-medium"> {Math.floor(metrics.assets * 0.567)} users</span>
          </div>
        </div>
      </div>

      {/* System Status Bar */}
      <div className="sticky top-16 z-40 before:absolute before:inset-0 before:backdrop-blur-md before:bg-white/90 dark:before:bg-gray-800/90 before:-z-10 border-b border-gray-200 dark:border-gray-700/60 mb-6 -mx-4 sm:-mx-6 lg:-mx-8">
        <div className="px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium">Systems Status:</span>
              <div className="flex items-center gap-4">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  SIEM: <span className="text-emerald-600 dark:text-emerald-400 font-medium">99.9%</span>
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Threat Intel: <span className="text-emerald-600 dark:text-emerald-400 font-medium">100%</span>
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Endpoints: <span className="text-emerald-600 dark:text-emerald-400 font-medium">99.8%</span>
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Network Monitoring: <span className="text-emerald-600 dark:text-emerald-400 font-medium">99.7%</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Operational Metrics & Threat Landscape */}
      <div className="grid grid-cols-12 gap-4 mb-6">
        {/* SOC Performance */}
        <div className="col-span-12 sm:col-span-6 lg:col-span-4">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">SOC Performance</h3>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Optimal</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Mean Time to Detect</span>
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">3.2 minutes</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Mean Time to Respond</span>
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">8.7 minutes</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">False Positive Rate</span>
                <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">7.2%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Alert Accuracy</span>
                <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">92.8%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Threat Landscape */}
        <div className="col-span-12 sm:col-span-6 lg:col-span-4">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Threat Landscape</h3>
              <Link href="/overview/threat-intelligence/overview" className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium">
                View Details →
              </Link>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Top Threat Actor</span>
                <span className="text-sm font-semibold text-rose-600 dark:text-rose-400">{topThreatActor}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Active Campaigns</span>
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">12</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">IOCs Detected</span>
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">2,847</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Block Rate</span>
                <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">95.3%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Business Impact */}
        <div className="col-span-12 sm:col-span-6 lg:col-span-4">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Business Impact</h3>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Positive ROI</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Cost Avoided (30d)</span>
                <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">$8.5M</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">System Uptime</span>
                <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">99.8%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Downtime Reduced</span>
                <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">-67%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Compliance Score</span>
                <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">94.2%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-12 gap-4 mb-6">
        {/* Recent Security Incidents */}
        <div className="col-span-12 lg:col-span-8">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Recent Security Incidents</h3>
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleAddIncident}
                  className="btn bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-3 py-1.5"
                >
                  <Icon name="add-outline" className="text-base mr-1" />
                  New Incident
                </button>
                <Link href="/overview/incidents" className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium">
                  View All →
                </Link>
              </div>
            </div>
            <div className="space-y-4">
              {!isClient || incidents.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-gray-500 dark:text-gray-400">Loading incidents...</div>
                </div>
              ) : (
                incidents.map((incident, idx) => (
                  <div key={idx} className="flex items-start gap-4 p-4 border border-gray-100 dark:border-gray-700 rounded-xl hover:border-gray-200 dark:hover:border-gray-600 transition-all duration-200 group cursor-pointer" onClick={() => handleEditIncident(incident)}>
                    <div className={`w-3 h-3 rounded-full mt-2 ${getSeverityColor(incident.severity)}`}></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-medium text-gray-900 dark:text-gray-100">{incident.title}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">{incident.id}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(incident.status)}`}>
                          {incident.status.charAt(0).toUpperCase() + incident.status.slice(1)}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getSeverityBadge(incident.severity)}`}>
                          {incident.severity.charAt(0).toUpperCase() + incident.severity.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{incident.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <span>Source: {incident.source}</span>
                        <span>•</span>
                        <span>Analyst: {incident.analyst}</span>
                        <span>•</span>
                        <span>{incident.time}</span>
                      </div>
                    </div>
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Icon name="create-outline" className="text-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" />
                  </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions & Compliance */}
        <div className="col-span-12 lg:col-span-4">
          <div className="space-y-4 h-full">
            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link href="/overview/alerts" className="block w-full text-left px-4 py-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-950/50 transition-all duration-200">
                  <div className="text-sm font-medium text-rose-800 dark:text-rose-200">View Active Alerts</div>
                  <div className="text-xs text-rose-600 dark:text-rose-400">{metrics.activeThreats} active threats</div>
                </Link>
                <Link href="/overview/incidents" className="block w-full text-left px-4 py-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl hover:bg-amber-100 dark:hover:bg-amber-950/50 transition-all duration-200">
                  <div className="text-sm font-medium text-amber-800 dark:text-amber-200">Manage Incidents</div>
                  <div className="text-xs text-amber-600 dark:text-amber-400">{Math.floor(metrics.incidents * 0.3)} investigating</div>
                </Link>
              </div>
            </div>

            {/* Compliance */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Compliance</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Overall Score</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="w-4/5 h-full bg-emerald-500 rounded-full"></div>
                    </div>
                    <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">94.2%</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {[
                    { name: 'GDPR', score: 96, status: 'compliant' },
                    { name: 'SOC 2', score: 92, status: 'compliant' },
                    { name: 'ISO 27001', score: 89, status: 'in-progress' },
                    { name: 'HIPAA', score: 98, status: 'compliant' }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${item.status === 'compliant' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">{item.name}</span>
                      </div>
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{item.score}%</span>
                    </div>
                  ))}
                </div>
                
                <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                  <Link href="/overview/compliance" className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium">
                    View Full Report →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Threat Map - Large */}
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Global Threat Map</h2>
              <Link href="/overview/threat-hunting/map" className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium">
                View Details →
              </Link>
            </div>
            <div className="h-[600px]">
              <AttackMap />
            </div>
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

      {/* Vulnerability Modal */}
      {showVulnModal && (
        <VulnerabilityModal
          onClose={() => setShowVulnModal(false)}
          onSave={(data: any) => {
            const newVuln = generateVulnerability(Math.floor(Math.random() * 10000))
            setVulnerabilities(prev => [{ ...newVuln, ...data }, ...prev.slice(0, 2)])
            setShowVulnModal(false)
          }}
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

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-2xl w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {incident ? 'Edit Incident' : 'New Incident'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <Icon name="close-outline" className="text-2xl" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Severity
              </label>
              <select
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              >
                <option value="investigating">Investigating</option>
                <option value="resolved">Resolved</option>
                <option value="escalated">Escalated</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-[100px]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Source
              </label>
              <input
                type="text"
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                placeholder="IP or hostname"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Assigned Analyst
              </label>
              <select
                value={formData.analyst}
                onChange={(e) => setFormData({ ...formData, analyst: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
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

          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
            >
              {incident ? 'Save Changes' : 'Create Incident'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Vulnerability Modal Component
function VulnerabilityModal({ onClose, onSave }: any) {
  const [formData, setFormData] = useState({
    cve: '',
    severity: 'medium',
    title: '',
    affected: 0
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-2xl w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Add Vulnerability
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <Icon name="close-outline" className="text-2xl" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              CVE ID
            </label>
            <input
              type="text"
              value={formData.cve}
              onChange={(e) => setFormData({ ...formData, cve: e.target.value })}
              placeholder="CVE-2024-XXXX"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Severity
              </label>
              <select
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Affected Systems
              </label>
              <input
                type="number"
                value={formData.affected}
                onChange={(e) => setFormData({ ...formData, affected: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
            >
              Add Vulnerability
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

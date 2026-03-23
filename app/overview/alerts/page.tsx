'use client'
import { useEffect, useState } from 'react'
import { usePageTitle } from '@/app/page-title-context'
import { formatDateTime } from '@/lib/utils'

interface AlertData {
  id: string
  status: string
  title: string
  severity: string
  detectedAt: string
  lastUpdated: string
  closingDate: string | null
  slaDeadline: string
  assignedTo: { analyst: string; team: string; assignedAt: string }
  source: string
  alertRule: { id: string; name: string; version: string }
  sourceIp: string
  geolocation: { country: string; city: string; coordinates: number[]; asn: string }
  affectedDevices: Array<{ hostname: string; ip: string; os: string; user: string; riskScore: number; department: string; lastSeen: string }>
  userRisk: { score: number; factors: string[]; lastRiskAssessment: string }
  businessImpact: { level: string; affectedSystems: string[]; potentialDataExposure: string }
  containmentStatus: { isContained: boolean; actions: string[]; containedAt: string | null }
  tags: string[]
  description: string
  recommendedAction: string
  remediationSteps: Array<{ action: string; completedAt: string; completedBy: string }>
  relatedEvents: string[]
  similarIncidents: string[]
  confidence: number
  falsePositiveRisk: number
  escalationLevel: number
  escalationCriteria: string
  mitreTechniques: string[]
  evidenceUrls: string[]
  createdBy: string
}

type FilterType = 'all' | 'critical' | 'high' | 'active'

const SEV_COLOR: Record<string, string> = {
  CRITICAL: 'var(--soc-critical)',
  HIGH:     'var(--soc-high)',
  MEDIUM:   'var(--soc-medium)',
  LOW:      'var(--soc-low)',
}
const SEV_BG: Record<string, string> = {
  CRITICAL: 'var(--soc-critical-bg)',
  HIGH:     'var(--soc-high-bg)',
  MEDIUM:   'var(--soc-medium-bg)',
  LOW:      'var(--soc-low-bg)',
}
const STATUS_COLOR: Record<string, string> = {
  NEW:           'var(--soc-accent)',
  ACTIVE:        'var(--soc-critical)',
  INVESTIGATING: 'var(--soc-high)',
  RESOLVED:      'var(--soc-low)',
  CLOSED:        'var(--soc-text-muted)',
}

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
  })
}

function generateFallbackData(): AlertData[] {
  const now = new Date()
  const severities = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']
  const statuses = ['NEW', 'ACTIVE', 'INVESTIGATING', 'RESOLVED', 'CLOSED']
  const sources = ['SIEM', 'EDR', 'Network IDS', 'Email Security', 'Cloud Security']
  const titles = [
    'Suspicious Login Attempt', 'Malware Detection', 'Network Anomaly', 'Data Exfiltration Attempt',
    'Privilege Escalation', 'Brute Force Attack', 'SQL Injection Attempt', 'Ransomware Activity',
    'Unauthorized Access', 'DDoS Attack', 'Phishing Email', 'Insider Threat', 'Zero-Day Exploit',
    'Cryptomining Activity', 'Lateral Movement',
  ]
  const analysts = ['Sarah Chen', 'James Rodriguez', 'Michael Kim', 'Emily Taylor', 'Alex Petrov', 'Maria Garcia']
  const teams = ['Security Team A', 'Security Team B', 'Incident Response']
  const countries = ['United States', 'China', 'Russia', 'Brazil', 'India', 'Germany']
  const cities = ['New York', 'Beijing', 'Moscow', 'São Paulo', 'Mumbai', 'Berlin']

  return Array.from({ length: 45 }, (_, i) => {
    const detectedAt = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000)
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    const geo = Math.floor(Math.random() * 6)
    return {
      id: `SA-${generateUUID().substring(0, 8)}`,
      status,
      title: titles[Math.floor(Math.random() * titles.length)],
      severity: severities[Math.floor(Math.random() * severities.length)],
      detectedAt: detectedAt.toISOString(),
      lastUpdated: new Date(detectedAt.getTime() + Math.random() * 60 * 60 * 1000).toISOString(),
      closingDate: (status === 'RESOLVED' || status === 'CLOSED') ? new Date(detectedAt.getTime() + Math.random() * 24 * 60 * 60 * 1000).toISOString() : null,
      slaDeadline: new Date(detectedAt.getTime() + 8 * 60 * 60 * 1000).toISOString(),
      assignedTo: { analyst: analysts[Math.floor(Math.random() * 6)], team: teams[Math.floor(Math.random() * 3)], assignedAt: new Date(detectedAt.getTime() + 30 * 60 * 1000).toISOString() },
      source: sources[Math.floor(Math.random() * sources.length)],
      alertRule: { id: `rule-${String(Math.floor(Math.random() * 100) + 1).padStart(3, '0')}`, name: 'Detection Rule', version: '1.' + Math.floor(Math.random() * 10) },
      sourceIp: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      geolocation: { country: countries[geo], city: cities[geo], coordinates: [-74.006, 40.7128], asn: `AS${Math.floor(Math.random() * 90000) + 10000}` },
      affectedDevices: [{ hostname: `workstation-${String(Math.floor(Math.random() * 100) + 1).padStart(2, '0')}`, ip: `192.168.1.${Math.floor(Math.random() * 255)}`, os: ['Windows 10', 'Windows 11', 'Ubuntu 22.04', 'macOS'][Math.floor(Math.random() * 4)], user: analysts[Math.floor(Math.random() * 6)].toLowerCase().replace(' ', '.'), riskScore: Math.floor(Math.random() * 100), department: ['IT', 'Finance', 'HR', 'Operations'][Math.floor(Math.random() * 4)], lastSeen: new Date(now.getTime() - Math.random() * 60 * 60 * 1000).toISOString() }],
      userRisk: { score: Math.floor(Math.random() * 100), factors: ['Unusual login time', 'New device', 'Multiple failed attempts'], lastRiskAssessment: detectedAt.toISOString() },
      businessImpact: { level: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'][Math.floor(Math.random() * 4)], affectedSystems: ['Email Server', 'Database'], potentialDataExposure: 'User credentials' },
      containmentStatus: { isContained: Math.random() > 0.5, actions: ['Monitor activity', 'Block IP'], containedAt: Math.random() > 0.5 ? new Date(detectedAt.getTime() + 60 * 60 * 1000).toISOString() : null },
      tags: ['Security', 'Network'],
      description: 'Alert detected by automated security system',
      recommendedAction: 'Investigate and respond according to playbook',
      remediationSteps: [],
      relatedEvents: [],
      similarIncidents: [],
      confidence: Math.floor(Math.random() * 40) + 60,
      falsePositiveRisk: Math.floor(Math.random() * 30),
      escalationLevel: Math.floor(Math.random() * 3) + 1,
      escalationCriteria: 'Standard criteria',
      mitreTechniques: ['T1078', 'T1110'],
      evidenceUrls: [],
      createdBy: 'Automated System',
    }
  }).sort((a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime())
}

export default function AllAlerts() {
  const { setPageTitle } = usePageTitle()
  const [alertsData, setAlertsData] = useState<AlertData[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [dateRange, setDateRange] = useState<'all' | 'today' | 'week' | 'month'>('all')
  const [selectedAlert, setSelectedAlert] = useState<AlertData | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const itemsPerPage = 15

  useEffect(() => { setPageTitle('All Alerts') }, [setPageTitle])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const res = await fetch('https://raw.githubusercontent.com/swe/jsoncsvdata/refs/heads/master/soc_new.json')
        if (!res.ok) throw new Error('HTTP ' + res.status)
        const raw = await res.json()
        let data: AlertData[]
        if (Array.isArray(raw)) data = raw
        else if (raw?.alerts && Array.isArray(raw.alerts)) data = raw.alerts
        else if (raw?.data && Array.isArray(raw.data)) data = raw.data
        else throw new Error('bad shape')
        setAlertsData(data)
      } catch {
        setAlertsData(generateFallbackData())
      } finally {
        setLoading(false)
      }
    }
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const getFiltered = () => {
    let d = alertsData
    if (activeFilter === 'critical') d = d.filter(a => a.severity === 'CRITICAL')
    else if (activeFilter === 'high') d = d.filter(a => a.severity === 'HIGH')
    else if (activeFilter === 'active') d = d.filter(a => a.status === 'ACTIVE')

    if (dateRange !== 'all') {
      const now = new Date()
      const start = dateRange === 'today'
        ? new Date(now.getFullYear(), now.getMonth(), now.getDate())
        : new Date(now.getTime() - (dateRange === 'week' ? 7 : 30) * 24 * 60 * 60 * 1000)
      d = d.filter(a => new Date(a.detectedAt) >= start)
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      d = d.filter(a =>
        a.id.toLowerCase().includes(q) ||
        a.title.toLowerCase().includes(q) ||
        a.severity.toLowerCase().includes(q) ||
        a.status.toLowerCase().includes(q) ||
        a.source.toLowerCase().includes(q) ||
        a.sourceIp.toLowerCase().includes(q)
      )
    }
    return d
  }

  const filtered = getFiltered()
  const totalPages = Math.ceil(filtered.length / itemsPerPage)
  const pageAlerts = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const changePage = (p: number) => {
    setCurrentPage(p)
    setExpandedId(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const changeFilter = (f: FilterType) => {
    setActiveFilter(f)
    setCurrentPage(1)
    setExpandedId(null)
  }

  const critical = alertsData.filter(a => a.severity === 'CRITICAL').length
  const high = alertsData.filter(a => a.severity === 'HIGH').length
  const active = alertsData.filter(a => a.status === 'ACTIVE')?.length ?? 0
  const newCount = alertsData.filter(a => a.status === 'NEW').length

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-6">

      {/* Header */}
      <div className="flex items-start justify-between mb-5 hig-fade-in">
        <div>
          <p className="soc-label mb-1">SECURITY OPERATIONS</p>
          <h1 className="text-xl font-bold tracking-tight mb-1.5" style={{ color: 'var(--soc-text)' }}>
            All Alerts
          </h1>
          <p className="text-sm" style={{ color: 'var(--soc-text-secondary)' }}>
            <strong style={{ color: 'var(--soc-critical)' }}>{critical}</strong> critical ·{' '}
            <strong style={{ color: 'var(--soc-high)' }}>{high}</strong> high ·{' '}
            <strong style={{ color: 'var(--soc-accent)' }}>{newCount}</strong> new ·{' '}
            <strong style={{ color: 'var(--soc-text)' }}>{alertsData.length}</strong> total
          </p>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <button className="soc-btn soc-btn-secondary">Export</button>
          <button className="soc-btn soc-btn-primary">Create Alert</button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'TOTAL ALERTS', value: alertsData.length, sub: 'All time',        color: 'var(--soc-text)' },
          { label: 'CRITICAL',     value: critical,           sub: 'Needs action',    color: 'var(--soc-critical)' },
          { label: 'ACTIVE',       value: active,             sub: 'In progress',     color: 'var(--soc-high)' },
          { label: 'NEW',          value: newCount,           sub: 'Unassigned',      color: 'var(--soc-accent)' },
        ].map(({ label, value, sub, color }) => (
          <div key={label} className="soc-card">
            <p className="soc-label mb-2">{label}</p>
            <p className="soc-metric-sm mb-1" style={{ color }}>{loading ? '…' : value}</p>
            <p className="text-xs" style={{ color: 'var(--soc-text-muted)' }}>{sub}</p>
          </div>
        ))}
      </div>

      {/* Filters + Search */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {(['all', 'critical', 'high', 'active'] as FilterType[]).map(f => {
          const count = f === 'all' ? alertsData.length : f === 'critical' ? critical : f === 'high' ? high : active
          return (
            <button
              key={f}
              onClick={() => changeFilter(f)}
              className="soc-btn text-xs"
              style={activeFilter === f
                ? { backgroundColor: 'var(--soc-accent)', borderColor: 'var(--soc-accent)', color: '#fff' }
                : { borderColor: 'var(--soc-border-mid)', color: 'var(--soc-text-secondary)', background: 'transparent' }}
            >
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}{' '}
              <span style={{ opacity: 0.7 }}>{loading ? '' : count}</span>
            </button>
          )
        })}
        <div className="flex-1" />
        <input
          type="search"
          placeholder="Search alerts…"
          value={searchQuery}
          onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1) }}
          className="text-sm px-3 py-1.5 rounded-md w-48"
          style={{ backgroundColor: 'var(--soc-raised)', border: '1px solid var(--soc-border-mid)', color: 'var(--soc-text)', outline: 'none' }}
        />
        <select
          value={dateRange}
          onChange={e => { setDateRange(e.target.value as typeof dateRange); setCurrentPage(1) }}
          className="text-sm px-3 py-1.5 rounded-md"
          style={{ backgroundColor: 'var(--soc-raised)', border: '1px solid var(--soc-border-mid)', color: 'var(--soc-text)', outline: 'none' }}
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">Last 7 Days</option>
          <option value="month">Last 30 Days</option>
        </select>
      </div>

      {/* Alerts table */}
      <div className="soc-card p-0 overflow-hidden mb-4">
        <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--soc-border)' }}>
          <p className="soc-label">SECURITY ALERTS</p>
          <span className="text-xs" style={{ color: 'var(--soc-text-muted)' }}>{loading ? 'Loading…' : `${filtered.length} results`}</span>
        </div>

        {loading ? (
          <div className="py-12 text-center">
            <p className="text-sm" style={{ color: 'var(--soc-text-muted)' }}>Loading alerts…</p>
          </div>
        ) : pageAlerts.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm" style={{ color: 'var(--soc-text-muted)' }}>No alerts found</p>
          </div>
        ) : (
          <table className="soc-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Alert</th>
                <th>Source</th>
                <th>Source IP</th>
                <th>Assigned To</th>
                <th>Severity</th>
                <th>Status</th>
                <th>Confidence</th>
                <th>Detected</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {pageAlerts.map(alert => {
                const sevColor = SEV_COLOR[alert.severity] || 'var(--soc-text-muted)'
                const sevBg    = SEV_BG[alert.severity]    || 'transparent'
                const stColor  = STATUS_COLOR[alert.status] || 'var(--soc-text-muted)'
                const isExpanded = expandedId === alert.id
                return [
                  <tr
                    key={alert.id}
                    className="cursor-pointer"
                    style={isExpanded ? { backgroundColor: 'var(--soc-raised)' } : undefined}
                    onClick={() => setExpandedId(isExpanded ? null : alert.id)}
                  >
                    <td><span className="text-xs font-mono font-bold" style={{ color: 'var(--soc-accent)' }}>{alert.id}</span></td>
                    <td>
                      <p className="text-sm font-medium" style={{ color: 'var(--soc-text)' }}>{alert.title}</p>
                    </td>
                    <td><span className="soc-badge">{alert.source}</span></td>
                    <td><span className="text-xs font-mono" style={{ color: 'var(--soc-text-secondary)' }}>{alert.sourceIp}</span></td>
                    <td>
                      <p className="text-xs" style={{ color: 'var(--soc-text-secondary)' }}>{alert.assignedTo.analyst}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--soc-text-muted)' }}>{alert.assignedTo.team}</p>
                    </td>
                    <td><span className="soc-badge" style={{ backgroundColor: sevBg, color: sevColor }}>{alert.severity}</span></td>
                    <td><span className="soc-badge" style={{ color: stColor, border: `1px solid ${stColor}44`, background: 'transparent' }}>{alert.status}</span></td>
                    <td>
                      <span className="text-sm tabular-nums font-bold" style={{ color: alert.confidence >= 80 ? 'var(--soc-low)' : alert.confidence >= 60 ? 'var(--soc-medium)' : 'var(--soc-high)' }}>
                        {alert.confidence}%
                      </span>
                    </td>
                    <td><span className="text-xs tabular-nums" style={{ color: 'var(--soc-text-muted)' }}>{formatDateTime(alert.detectedAt)}</span></td>
                    <td>
                      <button
                        className="soc-link text-xs"
                        onClick={e => { e.stopPropagation(); setSelectedAlert(alert) }}
                      >
                        Details →
                      </button>
                    </td>
                  </tr>,
                  isExpanded && (
                    <tr key={`${alert.id}-expanded`} style={{ backgroundColor: 'var(--soc-raised)' }}>
                      <td colSpan={10} style={{ padding: '12px 16px' }}>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                          <div>
                            <p className="soc-label mb-1">LOCATION</p>
                            <p style={{ color: 'var(--soc-text)' }}>{alert.geolocation.city}, {alert.geolocation.country}</p>
                            <p style={{ color: 'var(--soc-text-muted)' }}>{alert.geolocation.asn}</p>
                          </div>
                          <div>
                            <p className="soc-label mb-1">AFFECTED DEVICE</p>
                            <p className="font-mono" style={{ color: 'var(--soc-text)' }}>{alert.affectedDevices[0]?.hostname}</p>
                            <p style={{ color: 'var(--soc-text-muted)' }}>{alert.affectedDevices[0]?.os}</p>
                          </div>
                          <div>
                            <p className="soc-label mb-1">MITRE ATT&CK</p>
                            <div className="flex gap-1 flex-wrap">
                              {alert.mitreTechniques.map(t => (
                                <span key={t} className="soc-badge font-mono" style={{ color: 'var(--soc-critical)', backgroundColor: 'var(--soc-critical-bg)' }}>{t}</span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="soc-label mb-1">DESCRIPTION</p>
                            <p style={{ color: 'var(--soc-text-secondary)' }}>{alert.description}</p>
                          </div>
                        </div>
                        <div className="mt-3 flex gap-2">
                          <button
                            className="soc-btn soc-btn-primary text-xs"
                            onClick={e => { e.stopPropagation(); setSelectedAlert(alert) }}
                          >
                            View Full Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                ]
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between mb-6">
          <p className="text-xs" style={{ color: 'var(--soc-text-muted)' }}>
            Showing {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              className="soc-btn text-xs"
              disabled={currentPage === 1}
              onClick={() => changePage(currentPage - 1)}
              style={{ opacity: currentPage === 1 ? 0.4 : 1 }}
            >
              ‹ Prev
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let p: number
              if (totalPages <= 5) p = i + 1
              else if (currentPage <= 3) p = i + 1
              else if (currentPage >= totalPages - 2) p = totalPages - 4 + i
              else p = currentPage - 2 + i
              return (
                <button
                  key={p}
                  className="soc-btn text-xs"
                  onClick={() => changePage(p)}
                  style={currentPage === p
                    ? { backgroundColor: 'var(--soc-accent)', borderColor: 'var(--soc-accent)', color: '#fff' }
                    : { borderColor: 'var(--soc-border-mid)', color: 'var(--soc-text-secondary)', background: 'transparent' }}
                >
                  {p}
                </button>
              )
            })}
            <button
              className="soc-btn text-xs"
              disabled={currentPage === totalPages}
              onClick={() => changePage(currentPage + 1)}
              style={{ opacity: currentPage === totalPages ? 0.4 : 1 }}
            >
              Next ›
            </button>
          </div>
        </div>
      )}

      {/* Detail modal */}
      {selectedAlert && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          onClick={() => setSelectedAlert(null)}
        >
          <div
            className="w-full max-w-2xl rounded-xl overflow-hidden flex flex-col"
            style={{ backgroundColor: 'var(--soc-surface)', border: '1px solid var(--soc-border-mid)', maxHeight: '90vh' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="px-5 py-4 border-b flex items-start justify-between flex-shrink-0" style={{ borderColor: 'var(--soc-border)' }}>
              <div>
                <p className="soc-label mb-1 font-mono">{selectedAlert.id} · {selectedAlert.source}</p>
                <h2 className="text-base font-bold" style={{ color: 'var(--soc-text)' }}>{selectedAlert.title}</h2>
              </div>
              <button onClick={() => setSelectedAlert(null)} className="text-sm w-7 h-7 flex items-center justify-center rounded flex-shrink-0" style={{ color: 'var(--soc-text-muted)', backgroundColor: 'var(--soc-raised)' }}>✕</button>
            </div>

            {/* Modal body */}
            <div className="px-5 py-4 overflow-y-auto space-y-4">
              <div className="flex gap-2 flex-wrap">
                <span className="soc-badge" style={{ backgroundColor: SEV_BG[selectedAlert.severity], color: SEV_COLOR[selectedAlert.severity] }}>{selectedAlert.severity}</span>
                <span className="soc-badge" style={{ color: STATUS_COLOR[selectedAlert.status], border: `1px solid ${STATUS_COLOR[selectedAlert.status]}44`, background: 'transparent' }}>{selectedAlert.status}</span>
                {selectedAlert.containmentStatus.isContained && <span className="soc-badge" style={{ color: 'var(--soc-low)', border: '1px solid var(--soc-low-bg)', backgroundColor: 'var(--soc-low-bg)' }}>Contained</span>}
              </div>

              <p className="text-sm" style={{ color: 'var(--soc-text-secondary)' }}>{selectedAlert.description}</p>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'DETECTED',      value: formatDateTime(selectedAlert.detectedAt) },
                  { label: 'LAST UPDATED',  value: formatDateTime(selectedAlert.lastUpdated) },
                  { label: 'SOURCE IP',     value: selectedAlert.sourceIp },
                  { label: 'LOCATION',      value: `${selectedAlert.geolocation.city}, ${selectedAlert.geolocation.country}` },
                  { label: 'ASSIGNED TO',   value: selectedAlert.assignedTo.analyst },
                  { label: 'TEAM',          value: selectedAlert.assignedTo.team },
                  { label: 'CONFIDENCE',    value: `${selectedAlert.confidence}%` },
                  { label: 'FP RISK',       value: `${selectedAlert.falsePositiveRisk}%` },
                ].map(({ label, value }) => (
                  <div key={label} className="p-3 rounded" style={{ backgroundColor: 'var(--soc-raised)' }}>
                    <p className="soc-label mb-1">{label}</p>
                    <p className="text-sm font-medium" style={{ color: 'var(--soc-text)' }}>{value}</p>
                  </div>
                ))}
              </div>

              {selectedAlert.affectedDevices.length > 0 && (
                <div>
                  <p className="soc-label mb-2">AFFECTED DEVICES</p>
                  {selectedAlert.affectedDevices.map((d, i) => (
                    <div key={i} className="p-3 rounded mb-2" style={{ backgroundColor: 'var(--soc-raised)' }}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-mono font-medium" style={{ color: 'var(--soc-text)' }}>{d.hostname}</p>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--soc-text-muted)' }}>{d.ip} · {d.os} · {d.department}</p>
                        </div>
                        <span className="text-sm font-bold" style={{ color: d.riskScore >= 70 ? 'var(--soc-critical)' : d.riskScore >= 40 ? 'var(--soc-medium)' : 'var(--soc-low)' }}>
                          Risk {d.riskScore}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selectedAlert.mitreTechniques.length > 0 && (
                <div>
                  <p className="soc-label mb-2">MITRE ATT&CK TECHNIQUES</p>
                  <div className="flex gap-1 flex-wrap">
                    {selectedAlert.mitreTechniques.map(t => (
                      <span key={t} className="soc-badge font-mono" style={{ color: 'var(--soc-critical)', backgroundColor: 'var(--soc-critical-bg)' }}>{t}</span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="soc-label mb-2">RECOMMENDED ACTION</p>
                <p className="text-sm" style={{ color: 'var(--soc-text-secondary)' }}>{selectedAlert.recommendedAction}</p>
              </div>
            </div>

            <div className="px-5 py-4 flex gap-3 border-t flex-shrink-0" style={{ borderColor: 'var(--soc-border)' }}>
              <button className="soc-btn soc-btn-primary flex-1">Investigate</button>
              <button className="soc-btn flex-1" style={{ borderColor: 'var(--soc-medium)', color: 'var(--soc-medium)' }}>Escalate</button>
              <button onClick={() => setSelectedAlert(null)} className="soc-btn soc-btn-secondary flex-1">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

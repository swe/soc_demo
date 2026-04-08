'use client'

import { Fragment, useEffect, useMemo, useState } from 'react'
import { usePageTitle } from '@/app/page-title-context'
import { formatDateTime } from '@/lib/utils'
import {
  OverviewDateRangeMenu,
  OverviewFilterMenu,
  OverviewKpiRow,
  OverviewModal,
  OverviewPageHeader,
  OverviewPageShell,
  OverviewPagination,
  OverviewRowsPerPageMenu,
  OverviewSection,
  OverviewStepModal,
  OverviewTableToolbar,
} from '@/components/overview/unified-ui'

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
  const [searchQuery, setSearchQuery] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [severityFilters, setSeverityFilters] = useState<string[]>(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'])
  const [itemsPerPage, setItemsPerPage] = useState(15)
  const [selectedAlert, setSelectedAlert] = useState<AlertData | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [createStep, setCreateStep] = useState(0)
  const [createdAlertId, setCreatedAlertId] = useState('')
  const [createDraft, setCreateDraft] = useState({
    title: '',
    severity: 'HIGH',
    source: 'SIEM',
    analyst: '',
    team: 'Security Team A',
    description: '',
  })
  const [investigateOpen, setInvestigateOpen] = useState(false)
  const [investigateNote, setInvestigateNote] = useState('')
  const [escalateOpen, setEscalateOpen] = useState(false)
  const [escalateStep, setEscalateStep] = useState(0)
  const [escalateLevel, setEscalateLevel] = useState(2)
  const [escalateReason, setEscalateReason] = useState('')

  useEffect(() => { setPageTitle('All Alerts') }, [setPageTitle])

  useEffect(() => {
    const now = new Date()
    const from = new Date()
    from.setDate(now.getDate() - 30)
    setFromDate(from.toISOString().slice(0, 10))
    setToDate(now.toISOString().slice(0, 10))
  }, [])

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

  const filtered = useMemo(() => {
    return alertsData
      .filter((a) => severityFilters.includes(a.severity))
      .filter((a) => !fromDate || a.detectedAt.slice(0, 10) >= fromDate)
      .filter((a) => !toDate || a.detectedAt.slice(0, 10) <= toDate)
      .filter((a) => {
        const q = searchQuery.trim().toLowerCase()
        return !q
          || a.id.toLowerCase().includes(q)
          || a.title.toLowerCase().includes(q)
          || a.severity.toLowerCase().includes(q)
          || a.status.toLowerCase().includes(q)
          || a.source.toLowerCase().includes(q)
          || a.sourceIp.toLowerCase().includes(q)
          || a.assignedTo.analyst.toLowerCase().includes(q)
      })
  }, [alertsData, severityFilters, fromDate, toDate, searchQuery])

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage))
  const pageAlerts = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1)
  }, [currentPage, totalPages])

  const changePage = (p: number) => {
    setCurrentPage(p)
    setExpandedId(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const critical = alertsData.filter(a => a.severity === 'CRITICAL').length
  const high = alertsData.filter(a => a.severity === 'HIGH').length
  const active = alertsData.filter(a => a.status === 'ACTIVE')?.length ?? 0
  const newCount = alertsData.filter(a => a.status === 'NEW').length
  const severityOptions = [
    { id: 'CRITICAL', label: 'Critical' },
    { id: 'HIGH', label: 'High' },
    { id: 'MEDIUM', label: 'Medium' },
    { id: 'LOW', label: 'Low' },
  ]

  const resetCreateFlow = () => {
    setCreateOpen(false)
    setCreateStep(0)
    setCreateDraft({
      title: '',
      severity: 'HIGH',
      source: 'SIEM',
      analyst: '',
      team: 'Security Team A',
      description: '',
    })
  }

  const handleCreateFinish = () => {
    const now = new Date().toISOString()
    const newAlert: AlertData = {
      id: `SA-${generateUUID().slice(0, 8)}`,
      status: 'NEW',
      title: createDraft.title.trim(),
      severity: createDraft.severity,
      detectedAt: now,
      lastUpdated: now,
      closingDate: null,
      slaDeadline: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
      assignedTo: {
        analyst: createDraft.analyst.trim() || 'Unassigned',
        team: createDraft.team,
        assignedAt: now,
      },
      source: createDraft.source,
      alertRule: { id: 'rule-manual-001', name: 'Manual Alert', version: '1.0' },
      sourceIp: '0.0.0.0',
      geolocation: { country: 'Unknown', city: 'Unknown', coordinates: [0, 0], asn: 'AS00000' },
      affectedDevices: [],
      userRisk: { score: 50, factors: ['Manual creation'], lastRiskAssessment: now },
      businessImpact: { level: 'MEDIUM', affectedSystems: ['TBD'], potentialDataExposure: 'Under review' },
      containmentStatus: { isContained: false, actions: [], containedAt: null },
      tags: ['Manual'],
      description: createDraft.description.trim() || 'Created from All Alerts flow.',
      recommendedAction: 'Triage and assign ownership.',
      remediationSteps: [],
      relatedEvents: [],
      similarIncidents: [],
      confidence: 70,
      falsePositiveRisk: 20,
      escalationLevel: 1,
      escalationCriteria: 'Manual triage',
      mitreTechniques: [],
      evidenceUrls: [],
      createdBy: 'SOC Analyst',
    }
    setAlertsData((prev) => [newAlert, ...prev])
    setCreatedAlertId(newAlert.id)
    resetCreateFlow()
  }

  const handleInvestigate = () => {
    if (!selectedAlert) return
    const now = new Date().toISOString()
    setAlertsData((prev) =>
      prev.map((a) =>
        a.id === selectedAlert.id
          ? {
              ...a,
              status: 'INVESTIGATING',
              lastUpdated: now,
              recommendedAction: investigateNote.trim()
                ? `Investigation note: ${investigateNote.trim()}`
                : a.recommendedAction,
            }
          : a,
      ),
    )
    setSelectedAlert((prev) =>
      prev ? {
        ...prev,
        status: 'INVESTIGATING',
        lastUpdated: now,
        recommendedAction: investigateNote.trim()
          ? `Investigation note: ${investigateNote.trim()}`
          : prev.recommendedAction,
      } : prev)
    setInvestigateOpen(false)
    setEscalateOpen(false)
    setEscalateStep(0)
    setInvestigateNote('')
    setSelectedAlert(null)
  }

  const handleEscalateFinish = () => {
    if (!selectedAlert) return
    const now = new Date().toISOString()
    setAlertsData((prev) =>
      prev.map((a) =>
        a.id === selectedAlert.id
          ? {
              ...a,
              status: 'ACTIVE',
              escalationLevel: escalateLevel,
              escalationCriteria: escalateReason.trim() || a.escalationCriteria,
              lastUpdated: now,
            }
          : a,
      ),
    )
    setSelectedAlert((prev) =>
      prev ? {
        ...prev,
        status: 'ACTIVE',
        escalationLevel: escalateLevel,
        escalationCriteria: escalateReason.trim() || prev.escalationCriteria,
        lastUpdated: now,
      } : prev)
    setEscalateOpen(false)
    setEscalateStep(0)
    setInvestigateOpen(false)
    setInvestigateNote('')
    setEscalateReason('')
    setSelectedAlert(null)
  }

  return (
    <OverviewPageShell>
      <OverviewPageHeader
        section="SECURITY OPERATIONS"
        title="All Alerts"
        description={`${critical} critical · ${high} high · ${newCount} new · ${alertsData.length} total alerts`}
        actions={[
          {
            id: 'create-alert',
            label: 'Create Alert',
            variant: 'primary',
            onClick: () => setCreateOpen(true),
          },
        ]}
      />

      <OverviewKpiRow
        columns={4}
        items={[
          { label: 'TOTAL ALERTS', value: loading ? '…' : alertsData.length, sub: 'All time', tone: 'default' },
          { label: 'CRITICAL', value: loading ? '…' : critical, sub: 'Needs action', tone: 'critical' },
          { label: 'ACTIVE', value: loading ? '…' : active, sub: 'In progress', tone: 'high' },
          { label: 'NEW', value: loading ? '…' : newCount, sub: 'Unassigned', tone: 'accent' },
        ]}
      />

      <OverviewTableToolbar
        searchValue={searchQuery}
        onSearchChange={(value) => {
          setSearchQuery(value)
          setCurrentPage(1)
        }}
        searchPlaceholder="Search id, title, source, analyst..."
        end={(
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-stretch sm:justify-end sm:gap-2">
            <OverviewFilterMenu
              options={severityOptions}
              selected={severityFilters}
              onApply={(next) => {
                setSeverityFilters(next)
                setCurrentPage(1)
              }}
            />
            <OverviewDateRangeMenu
              fromDate={fromDate}
              toDate={toDate}
              onApply={(from, to) => {
                setFromDate(from)
                setToDate(to)
                setCurrentPage(1)
              }}
            />
          </div>
        )}
      />

      <OverviewSection
        title="SECURITY ALERTS"
        flush
        right={(
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: 'var(--soc-text-muted)' }}>
              {loading ? 'Loading…' : `${filtered.length} results`}
            </span>
            <OverviewRowsPerPageMenu
              value={itemsPerPage}
              options={[10, 15, 25]}
              onChange={(n) => {
                setItemsPerPage(n)
                setCurrentPage(1)
              }}
            />
          </div>
        )}
      >
        {loading ? (
          <div className="py-12 text-center">
            <p className="text-sm" style={{ color: 'var(--soc-text-muted)' }}>Loading alerts…</p>
          </div>
        ) : pageAlerts.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm" style={{ color: 'var(--soc-text-muted)' }}>No alerts found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
          <table className="soc-table min-w-[1180px]" style={{ tableLayout: 'auto', width: '100%' }}>
            <thead>
              <tr>
                <th style={{ width: '6px', padding: 0 }} />
                <th className="whitespace-nowrap">ID</th>
                <th className="whitespace-nowrap">Alert</th>
                <th className="whitespace-nowrap">Source</th>
                <th className="whitespace-nowrap">Assigned To</th>
                <th className="whitespace-nowrap">Severity</th>
                <th className="whitespace-nowrap">Status</th>
                <th className="text-right whitespace-nowrap">Conf.</th>
                <th className="text-right whitespace-nowrap">Detected</th>
                <th className="whitespace-nowrap text-right" />
              </tr>
            </thead>
            <tbody>
              {pageAlerts.map((alert) => {
                const sevColor = SEV_COLOR[alert.severity] || 'var(--soc-text-muted)'
                const sevBg = SEV_BG[alert.severity] || 'transparent'
                const stColor = STATUS_COLOR[alert.status] || 'var(--soc-text-muted)'
                const isExpanded = expandedId === alert.id
                return (
                  <Fragment key={alert.id}>
                    <tr
                      className="cursor-pointer"
                      style={isExpanded ? { backgroundColor: 'var(--soc-raised)' } : undefined}
                      onClick={() => setExpandedId(isExpanded ? null : alert.id)}
                    >
                      <td style={{ padding: 0, width: '6px', verticalAlign: 'middle' }}>
                        <div
                          style={{
                            width: '3px',
                            marginLeft: '1px',
                            height: '100%',
                            minHeight: '2.8rem',
                            backgroundColor: sevColor,
                            borderRadius: '0 2px 2px 0',
                          }}
                        />
                      </td>
                      <td>
                        <span className="text-xs font-mono font-semibold truncate block" style={{ color: 'var(--soc-text-muted)' }}>
                          {alert.id}
                        </span>
                      </td>
                      <td className="align-top">
                        <p className="text-sm font-medium leading-snug whitespace-nowrap" style={{ color: 'var(--soc-text)' }} title={alert.title}>
                          {alert.title}
                        </p>
                      </td>
                      <td className="align-top">
                        <span className="soc-badge">{alert.source}</span>
                        <span className="text-[11px] font-mono whitespace-nowrap block mt-1" style={{ color: 'var(--soc-text-secondary)' }} title={alert.sourceIp}>
                          {alert.sourceIp}
                        </span>
                      </td>
                      <td className="align-top">
                        <p className="text-xs leading-snug whitespace-nowrap" style={{ color: 'var(--soc-text-secondary)' }} title={alert.assignedTo.analyst}>
                          {alert.assignedTo.analyst}
                        </p>
                        <p className="text-xs mt-0.5 whitespace-nowrap" style={{ color: 'var(--soc-text-muted)' }} title={alert.assignedTo.team}>
                          {alert.assignedTo.team}
                        </p>
                      </td>
                      <td className="align-top">
                        <span className="soc-badge whitespace-nowrap" style={{ backgroundColor: sevBg, color: sevColor }}>
                          {alert.severity}
                        </span>
                      </td>
                      <td className="align-top">
                        <span className="soc-badge whitespace-nowrap" style={{ color: stColor, border: `1px solid ${stColor}44`, background: 'transparent' }}>
                          {alert.status}
                        </span>
                      </td>
                      <td className="text-right align-top">
                        <span
                          className="text-sm tabular-nums font-bold"
                          style={{
                            color:
                              alert.confidence >= 80
                                ? 'var(--soc-low)'
                                : alert.confidence >= 60
                                  ? 'var(--soc-medium)'
                                  : 'var(--soc-high)',
                          }}
                        >
                          {alert.confidence}%
                        </span>
                      </td>
                      <td className="text-right align-top">
                        <span className="text-xs tabular-nums whitespace-nowrap" style={{ color: 'var(--soc-text-muted)' }}>
                          {formatDateTime(alert.detectedAt)}
                        </span>
                      </td>
                      <td className="text-right align-top">
                        <button
                          type="button"
                          className="inline-flex items-center justify-center h-7 w-7 text-[color:var(--soc-text-muted)]"
                          aria-label={isExpanded ? 'Collapse row' : 'Expand row'}
                          aria-expanded={isExpanded}
                          onClick={(e) => {
                            e.stopPropagation()
                            setExpandedId(isExpanded ? null : alert.id)
                          }}
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className={`shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                            aria-hidden
                          >
                            <path d="M6 9l6 6 6-6" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr style={{ backgroundColor: 'var(--soc-raised)' }}>
                        <td colSpan={10} style={{ padding: '12px 16px' }}>
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                            <div>
                              <p className="soc-label mb-1">LOCATION</p>
                              <p style={{ color: 'var(--soc-text)' }}>
                                {alert.geolocation.city}, {alert.geolocation.country}
                              </p>
                              <p style={{ color: 'var(--soc-text-muted)' }}>{alert.geolocation.asn}</p>
                            </div>
                            <div>
                              <p className="soc-label mb-1">AFFECTED DEVICE</p>
                              <p className="font-mono" style={{ color: 'var(--soc-text)' }}>{alert.affectedDevices[0]?.hostname || '—'}</p>
                              <p style={{ color: 'var(--soc-text-muted)' }}>{alert.affectedDevices[0]?.os || '—'}</p>
                            </div>
                            <div>
                              <p className="soc-label mb-1">MITRE ATT&CK</p>
                              <div className="flex gap-1 flex-wrap">
                                {alert.mitreTechniques.length ? alert.mitreTechniques.map((t) => (
                                  <span key={t} className="soc-badge font-mono" style={{ color: 'var(--soc-critical)', backgroundColor: 'var(--soc-critical-bg)' }}>
                                    {t}
                                  </span>
                                )) : <span style={{ color: 'var(--soc-text-muted)' }}>—</span>}
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
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedAlert(alert)
                              }}
                            >
                              View Full Details
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
          </div>
        )}
        {!loading && (
          <OverviewPagination
            page={currentPage}
            totalPages={totalPages}
            totalItems={filtered.length}
            onPageChange={changePage}
          />
        )}
      </OverviewSection>

      <OverviewModal
        open={!!selectedAlert}
        title={selectedAlert?.title ?? ''}
        subtitle={selectedAlert ? `${selectedAlert.id} · ${selectedAlert.source}` : ''}
        onClose={() => setSelectedAlert(null)}
        maxWidth="max-w-3xl"
        footer={(
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              className="soc-btn soc-btn-primary"
              onClick={() => setInvestigateOpen(true)}
            >
              Investigate
            </button>
            <button
              type="button"
              className="soc-btn"
              style={{ borderColor: 'var(--soc-medium)', color: 'var(--soc-medium)' }}
              onClick={() => setEscalateOpen(true)}
            >
              Escalate
            </button>
            <button type="button" className="soc-btn soc-btn-secondary" onClick={() => setSelectedAlert(null)}>
              Close
            </button>
          </div>
        )}
      >
        {selectedAlert && (
          <div className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              <span className="soc-badge" style={{ backgroundColor: SEV_BG[selectedAlert.severity], color: SEV_COLOR[selectedAlert.severity] }}>
                {selectedAlert.severity}
              </span>
              <span className="soc-badge" style={{ color: STATUS_COLOR[selectedAlert.status], border: `1px solid ${STATUS_COLOR[selectedAlert.status]}44`, background: 'transparent' }}>
                {selectedAlert.status}
              </span>
              {selectedAlert.containmentStatus.isContained && (
                <span className="soc-badge" style={{ color: 'var(--soc-low)', border: '1px solid var(--soc-low-bg)', backgroundColor: 'var(--soc-low-bg)' }}>
                  CONTAINED
                </span>
              )}
            </div>

            <p className="text-sm leading-relaxed" style={{ color: 'var(--soc-text-secondary)' }}>{selectedAlert.description}</p>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: 'DETECTED', value: formatDateTime(selectedAlert.detectedAt) },
                { label: 'LAST UPDATED', value: formatDateTime(selectedAlert.lastUpdated) },
                { label: 'SOURCE IP', value: selectedAlert.sourceIp },
                { label: 'LOCATION', value: `${selectedAlert.geolocation.city}, ${selectedAlert.geolocation.country}` },
                { label: 'ASSIGNED TO', value: selectedAlert.assignedTo.analyst },
                { label: 'TEAM', value: selectedAlert.assignedTo.team },
                { label: 'CONFIDENCE', value: `${selectedAlert.confidence}%` },
                { label: 'FP RISK', value: `${selectedAlert.falsePositiveRisk}%` },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-md border p-3" style={{ borderColor: 'var(--soc-border)', backgroundColor: 'var(--soc-raised)' }}>
                  <p className="soc-label mb-1">{label}</p>
                  <p className="text-sm font-medium" style={{ color: 'var(--soc-text)' }}>{value}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </OverviewModal>

      <OverviewModal
        open={investigateOpen && !!selectedAlert}
        title="Start Investigation"
        subtitle={selectedAlert?.id}
        onClose={() => {
          setInvestigateOpen(false)
          setInvestigateNote('')
        }}
        footer={(
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="soc-btn soc-btn-secondary"
              onClick={() => {
                setInvestigateOpen(false)
                setInvestigateNote('')
              }}
            >
              Cancel
            </button>
            <button type="button" className="soc-btn soc-btn-primary" onClick={handleInvestigate}>
              Confirm Investigate
            </button>
          </div>
        )}
      >
        <div className="space-y-3">
          <p className="text-sm" style={{ color: 'var(--soc-text-secondary)' }}>
            This flow moves the alert to <strong>INVESTIGATING</strong> and records your triage note.
          </p>
          <label className="block">
            <span className="soc-label mb-1 block">Investigation note</span>
            <textarea
              value={investigateNote}
              onChange={(e) => setInvestigateNote(e.target.value)}
              className="soc-input w-full min-h-[100px]"
              placeholder="Example: Started timeline review and identity correlation."
            />
          </label>
        </div>
      </OverviewModal>

      <OverviewStepModal
        open={createOpen}
        subtitle="ALERT CREATION"
        currentStep={createStep}
        onStepChange={setCreateStep}
        onClose={resetCreateFlow}
        onFinish={handleCreateFinish}
        steps={[
          {
            id: 'details',
            title: 'Step 1: Alert details',
            canProceed: () => createDraft.title.trim().length > 5,
            validationHint: 'Add an alert title (at least 6 chars) to continue.',
            content: (
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block sm:col-span-2">
                  <span className="soc-label mb-1 block">Alert title</span>
                  <input
                    type="text"
                    className="soc-input w-full"
                    value={createDraft.title}
                    onChange={(e) => setCreateDraft((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Example: Suspicious privileged login from unmanaged device"
                  />
                </label>
                <label className="block">
                  <span className="soc-label mb-1 block">Severity</span>
                  <select
                    className="soc-input w-full"
                    value={createDraft.severity}
                    onChange={(e) => setCreateDraft((prev) => ({ ...prev, severity: e.target.value }))}
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </label>
                <label className="block">
                  <span className="soc-label mb-1 block">Source</span>
                  <select
                    className="soc-input w-full"
                    value={createDraft.source}
                    onChange={(e) => setCreateDraft((prev) => ({ ...prev, source: e.target.value }))}
                  >
                    <option value="SIEM">SIEM</option>
                    <option value="EDR">EDR</option>
                    <option value="Cloud Security">Cloud Security</option>
                    <option value="Network IDS">Network IDS</option>
                    <option value="Email Security">Email Security</option>
                  </select>
                </label>
              </div>
            ),
          },
          {
            id: 'assignment',
            title: 'Step 2: Assignment',
            canProceed: () => createDraft.analyst.trim().length > 1,
            validationHint: 'Provide an analyst name to continue.',
            content: (
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="soc-label mb-1 block">Analyst</span>
                  <input
                    type="text"
                    className="soc-input w-full"
                    value={createDraft.analyst}
                    onChange={(e) => setCreateDraft((prev) => ({ ...prev, analyst: e.target.value }))}
                    placeholder="Example: Sarah Chen"
                  />
                </label>
                <label className="block">
                  <span className="soc-label mb-1 block">Team</span>
                  <select
                    className="soc-input w-full"
                    value={createDraft.team}
                    onChange={(e) => setCreateDraft((prev) => ({ ...prev, team: e.target.value }))}
                  >
                    <option value="Security Team A">Security Team A</option>
                    <option value="Security Team B">Security Team B</option>
                    <option value="Incident Response">Incident Response</option>
                  </select>
                </label>
                <label className="block sm:col-span-2">
                  <span className="soc-label mb-1 block">Description</span>
                  <textarea
                    className="soc-input w-full min-h-[100px]"
                    value={createDraft.description}
                    onChange={(e) => setCreateDraft((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Optional context for responders."
                  />
                </label>
              </div>
            ),
          },
          {
            id: 'review',
            title: 'Step 3: Review',
            content: (
              <div className="space-y-3">
                <p className="text-sm" style={{ color: 'var(--soc-text-secondary)' }}>
                  Review values before creating the alert.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    ['Title', createDraft.title || '—'],
                    ['Severity', createDraft.severity],
                    ['Source', createDraft.source],
                    ['Analyst', createDraft.analyst || '—'],
                    ['Team', createDraft.team],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-md border p-3" style={{ borderColor: 'var(--soc-border)', backgroundColor: 'var(--soc-raised)' }}>
                      <p className="soc-label mb-1">{label}</p>
                      <p className="text-sm font-medium" style={{ color: 'var(--soc-text)' }}>{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            ),
          },
        ]}
      />

      <OverviewStepModal
        open={escalateOpen && !!selectedAlert}
        subtitle={selectedAlert?.id ? `ESCALATION · ${selectedAlert.id}` : 'ESCALATION'}
        currentStep={escalateStep}
        onStepChange={setEscalateStep}
        onClose={() => {
          setEscalateOpen(false)
          setEscalateStep(0)
          setEscalateReason('')
        }}
        onFinish={handleEscalateFinish}
        steps={[
          {
            id: 'level',
            title: 'Step 1: Escalation level',
            content: (
              <div className="space-y-3">
                <p className="text-sm" style={{ color: 'var(--soc-text-secondary)' }}>
                  Select the response level for this alert.
                </p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {[1, 2, 3].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      className={`soc-btn ${escalateLevel === lvl ? 'soc-btn-primary' : 'soc-btn-secondary'}`}
                      onClick={() => setEscalateLevel(lvl)}
                    >
                      Level {lvl}
                    </button>
                  ))}
                </div>
              </div>
            ),
          },
          {
            id: 'reason',
            title: 'Step 2: Reason',
            canProceed: () => escalateReason.trim().length > 7,
            validationHint: 'Add a reason (at least 8 chars).',
            content: (
              <label className="block">
                <span className="soc-label mb-1 block">Escalation reason</span>
                <textarea
                  className="soc-input w-full min-h-[130px]"
                  value={escalateReason}
                  onChange={(e) => setEscalateReason(e.target.value)}
                  placeholder="Example: Confirmed privilege misuse and cross-system impact."
                />
              </label>
            ),
          },
          {
            id: 'review',
            title: 'Step 3: Review',
            content: (
              <div className="space-y-3">
                <p className="text-sm" style={{ color: 'var(--soc-text-secondary)' }}>
                  Confirm escalation to update status and criteria.
                </p>
                <div className="rounded-md border p-3" style={{ borderColor: 'var(--soc-border)', backgroundColor: 'var(--soc-raised)' }}>
                  <p className="soc-label mb-1">Outcome</p>
                  <p className="text-sm" style={{ color: 'var(--soc-text)' }}>
                    Set <strong>Level {escalateLevel}</strong> and status to <strong>ACTIVE</strong>.
                  </p>
                </div>
              </div>
            ),
          },
        ]}
      />

      <OverviewModal
        open={!!createdAlertId}
        title="Alert Created"
        subtitle={createdAlertId}
        onClose={() => setCreatedAlertId('')}
        footer={(
          <div className="flex justify-end">
            <button type="button" className="soc-btn soc-btn-primary" onClick={() => setCreatedAlertId('')}>
              Done
            </button>
          </div>
        )}
      >
        <p className="text-sm" style={{ color: 'var(--soc-text-secondary)' }}>
          The alert was created successfully and added to the top of the table.
        </p>
      </OverviewModal>
    </OverviewPageShell>
  )
}

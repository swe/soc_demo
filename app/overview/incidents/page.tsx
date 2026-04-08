'use client'

import { Fragment, useEffect, useMemo, useState } from 'react'
import { usePageTitle } from '@/app/page-title-context'
import {
  OverviewFilterMenu,
  OverviewKpiRow,
  OverviewModal,
  OverviewNestedStatCard,
  OverviewPageHeader,
  OverviewPageShell,
  OverviewPagination,
  OverviewRowsPerPageMenu,
  OverviewSection,
  OverviewStepModal,
  OverviewTableToolbar,
} from '@/components/overview/unified-ui'

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
  description: string
  triageNote?: string
  escalationLevel?: number
}

const SEED_INCIDENTS: Incident[] = [
  { id: 'INC-2024-001', title: 'Ransomware Attack Detected', severity: 'critical', status: 'investigating', category: 'Malware', detectedAt: '15m ago', assignedTo: 'Sarah Chen', affectedAssets: 23, mitreTechniques: ['T1486', 'T1490', 'T1489'], description: 'LockBit 3.0 ransomware payload detected on prod-db-01. Lateral movement in progress. 23 assets potentially affected.' },
  { id: 'INC-2024-002', title: 'Data Exfiltration Attempt', severity: 'high', status: 'contained', category: 'Data Breach', detectedAt: '2h ago', assignedTo: 'James Rodriguez', affectedAssets: 5, mitreTechniques: ['T1048', 'T1567'], description: 'Large outbound data transfer detected to 185.220.101.43. DLP rule triggered on finance-ws-12.' },
  { id: 'INC-2024-003', title: 'Privilege Escalation — Domain Admin', severity: 'high', status: 'investigating', category: 'Unauthorized Access', detectedAt: '4h ago', assignedTo: 'Sarah Chen', affectedAssets: 2, mitreTechniques: ['T1068', 'T1078'], description: 'Kerberoasting attack detected. Service account credentials compromised. Attacker attempting DA elevation.' },
  { id: 'INC-2024-004', title: 'DDoS Attack on Web Infrastructure', severity: 'medium', status: 'resolved', category: 'Network Attack', detectedAt: '8h ago', assignedTo: 'Michael Kim', affectedAssets: 12, mitreTechniques: ['T1498', 'T1499'], description: 'HTTP/2 Rapid Reset attack peaking at 3.2M RPS. WAF rate limiting engaged. Fully mitigated.' },
  { id: 'INC-2024-005', title: 'Phishing Campaign — CFO Impersonation', severity: 'high', status: 'investigating', category: 'Social Engineering', detectedAt: '10h ago', assignedTo: 'Emily Taylor', affectedAssets: 8, mitreTechniques: ['T1566', 'T1598'], description: 'Spear-phishing campaign targeting finance team. 8 users clicked malicious link. Credential harvesting form deployed.' },
  { id: 'INC-2024-006', title: 'Cryptominer on Cloud VM', severity: 'medium', status: 'resolved', category: 'Malware', detectedAt: '1d ago', assignedTo: 'Alex Petrov', affectedAssets: 3, mitreTechniques: ['T1496', 'T1059.004'], description: 'XMRig cryptominer detected on AWS EC2 instance. Suspected compromise via exposed Docker API.' },
  { id: 'INC-2024-007', title: 'Brute Force on VPN Gateway', severity: 'medium', status: 'contained', category: 'Credential Attack', detectedAt: '1d ago', assignedTo: 'Michael Kim', affectedAssets: 1, mitreTechniques: ['T1110', 'T1133'], description: '47,000 login attempts from 203.0.113.8 over 6 hours. Account lockout policy engaged. IP blocked at perimeter.' },
  { id: 'INC-2024-008', title: 'Insider Threat — Bulk Download', severity: 'high', status: 'investigating', category: 'Insider Threat', detectedAt: '2d ago', assignedTo: 'James Rodriguez', affectedAssets: 1, mitreTechniques: ['T1005', 'T1039'], description: 'Employee downloaded 4.7GB of customer data to personal USB drive. DLP alert triggered. HR involved.' },
  { id: 'INC-2024-009', title: 'Supply Chain Alert — npm Package', severity: 'critical', status: 'new', category: 'Supply Chain', detectedAt: '3d ago', assignedTo: 'Sarah Chen', affectedAssets: 14, mitreTechniques: ['T1195', 'T1059.007'], description: 'Malicious npm package "lodash-utils" in CI/CD pipeline. Backdoor with C2 callback to 91.219.236.197.' },
  { id: 'INC-2024-010', title: 'Lateral Movement via WMI', severity: 'high', status: 'closed', category: 'Lateral Movement', detectedAt: '5d ago', assignedTo: 'Emily Taylor', affectedAssets: 7, mitreTechniques: ['T1047', 'T1021'], description: 'Attacker used WMI to move laterally across 7 workstations. Fully contained and remediated. RCA complete.' },
]

const MITRE_COVERAGE = [
  { tactic: 'Initial Access', pct: 78 },
  { tactic: 'Execution', pct: 65 },
  { tactic: 'Persistence', pct: 82 },
  { tactic: 'Privilege Escalation', pct: 71 },
  { tactic: 'Defense Evasion', pct: 58 },
  { tactic: 'Command & Control', pct: 89 },
]

const SEV_COLOR: Record<Incident['severity'], string> = {
  critical: 'var(--soc-critical)',
  high: 'var(--soc-high)',
  medium: 'var(--soc-medium)',
  low: 'var(--soc-low)',
}
const SEV_BG: Record<Incident['severity'], string> = {
  critical: 'var(--soc-critical-bg)',
  high: 'var(--soc-high-bg)',
  medium: 'var(--soc-medium-bg)',
  low: 'var(--soc-low-bg)',
}

const STATUS_COLOR: Record<Incident['status'], string> = {
  new: 'var(--soc-accent)',
  investigating: 'var(--soc-high)',
  contained: 'var(--soc-medium)',
  resolved: 'var(--soc-low)',
  closed: 'var(--soc-text-muted)',
}

const STATUS_FILTER_OPTIONS = [
  { id: 'new', label: 'New' },
  { id: 'investigating', label: 'Investigating' },
  { id: 'contained', label: 'Contained' },
  { id: 'resolved', label: 'Resolved' },
  { id: 'closed', label: 'Closed' },
] as const

const SEVERITY_FILTER_OPTIONS = [
  { id: 'critical', label: 'Critical' },
  { id: 'high', label: 'High' },
  { id: 'medium', label: 'Medium' },
  { id: 'low', label: 'Low' },
] as const

/** Status and severity ids are disjoint — one filter menu for both dimensions. */
const STATUS_IDS = STATUS_FILTER_OPTIONS.map((o) => o.id)
const SEVERITY_IDS = SEVERITY_FILTER_OPTIONS.map((o) => o.id)
const COMBINED_FILTER_OPTIONS = [
  ...SEVERITY_FILTER_OPTIONS.map((o) => ({ ...o, section: 'Severity' })),
  ...STATUS_FILTER_OPTIONS.map((o) => ({ ...o, section: 'Status' })),
]

const ANALYST_OPTIONS = [
  'Alex Petrov',
  'Emily Taylor',
  'James Rodriguez',
  'Michael Kim',
  'Sarah Chen',
  'Unassigned',
] as const

function formatIncidentStatus(status: Incident['status']): string {
  return status.replace(/_/g, ' ').toUpperCase()
}

function nextIncidentId(list: Incident[]): string {
  const nums = list.map((i) => {
    const m = i.id.match(/INC-\d{4}-(\d+)/)
    return m ? parseInt(m[1], 10) : 0
  })
  const n = Math.max(0, ...nums) + 1
  return `INC-2024-${String(n).padStart(3, '0')}`
}

export default function IncidentsPage() {
  const { setPageTitle } = usePageTitle()
  const [incidents, setIncidents] = useState<Incident[]>(() => SEED_INCIDENTS.map((i) => ({ ...i })))

  const [searchQuery, setSearchQuery] = useState('')
  const [combinedFilters, setCombinedFilters] = useState<string[]>(() => [...STATUS_IDS, ...SEVERITY_IDS])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null)
  const [updateStatusOpen, setUpdateStatusOpen] = useState(false)
  const [statusDraft, setStatusDraft] = useState<Incident['status']>('investigating')
  const [statusNote, setStatusNote] = useState('')

  const [assignOpen, setAssignOpen] = useState(false)
  const [assignDraft, setAssignDraft] = useState('')

  const [investigateOpen, setInvestigateOpen] = useState(false)
  const [investigateNote, setInvestigateNote] = useState('')

  const [escalateOpen, setEscalateOpen] = useState(false)
  const [escalateStep, setEscalateStep] = useState(0)
  const [escalateLevel, setEscalateLevel] = useState(2)
  const [escalateReason, setEscalateReason] = useState('')

  const [timelineOpen, setTimelineOpen] = useState(false)
  const [timelineFor, setTimelineFor] = useState<Incident | null>(null)

  const [createOpen, setCreateOpen] = useState(false)
  const [createStep, setCreateStep] = useState(0)
  const [createDraft, setCreateDraft] = useState({
    title: '',
    severity: 'high' as Incident['severity'],
    category: 'Malware',
    assignedTo: '',
    affectedAssets: 1,
    description: '',
  })
  const [createdId, setCreatedId] = useState('')

  const [exportOpen, setExportOpen] = useState(false)
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv')
  const [exportDoneLabel, setExportDoneLabel] = useState('')

  useEffect(() => {
    setPageTitle('Incidents')
  }, [setPageTitle])

  const stats = useMemo(() => {
    const critical = incidents.filter((i) => i.severity === 'critical').length
    const high = incidents.filter((i) => i.severity === 'high').length
    const investigating = incidents.filter((i) => i.status === 'investigating').length
    const resolved = incidents.filter((i) => i.status === 'resolved' || i.status === 'closed').length
    return { critical, high, investigating, resolved }
  }, [incidents])

  const seenCats = new Set<string>()
  const catCounts = incidents
    .map((i) => i.category)
    .filter((c) => {
      if (seenCats.has(c)) return false
      seenCats.add(c)
      return true
    })
    .map((cat) => ({ cat, n: incidents.filter((i) => i.category === cat).length }))
    .sort((a, b) => b.n - a.n)

  const filtered = useMemo(() => {
    const statusSet = new Set<string>(STATUS_IDS)
    const severitySet = new Set<string>(SEVERITY_IDS)
    const selStatuses = combinedFilters.filter((id) => statusSet.has(id))
    const selSeverities = combinedFilters.filter((id) => severitySet.has(id))
    return incidents
      .filter((i) => (selStatuses.length === 0 || selStatuses.includes(i.status))
        && (selSeverities.length === 0 || selSeverities.includes(i.severity)))
      .filter((i) => {
        const q = searchQuery.trim().toLowerCase()
        if (!q) return true
        return (
          i.id.toLowerCase().includes(q)
          || i.title.toLowerCase().includes(q)
          || i.category.toLowerCase().includes(q)
          || i.assignedTo.toLowerCase().includes(q)
          || i.description.toLowerCase().includes(q)
          || i.mitreTechniques.some((t) => t.toLowerCase().includes(q))
        )
      })
  }, [incidents, combinedFilters, searchQuery])

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage))
  const pageRows = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1)
  }, [currentPage, totalPages])

  const changePage = (p: number) => {
    setCurrentPage(p)
    setExpandedId(null)
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const patchIncident = (id: string, patch: Partial<Incident>) => {
    setIncidents((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch } : x)))
    setSelectedIncident((cur) => (cur && cur.id === id ? { ...cur, ...patch } : cur))
  }

  const openDetail = (inc: Incident) => {
    setSelectedIncident(inc)
    setStatusDraft(inc.status)
    setStatusNote('')
  }

  const handleUpdateStatus = () => {
    if (!selectedIncident) return
    const note = statusNote.trim()
    patchIncident(selectedIncident.id, {
      status: statusDraft,
      triageNote: note ? [selectedIncident.triageNote, note].filter(Boolean).join('\n— ') : selectedIncident.triageNote,
    })
    setUpdateStatusOpen(false)
    setStatusNote('')
    setSelectedIncident(null)
  }

  const handleAssign = () => {
    if (!selectedIncident) return
    const name = assignDraft.trim()
    if (!name) return
    patchIncident(selectedIncident.id, { assignedTo: name })
    setAssignOpen(false)
    setAssignDraft('')
    setSelectedIncident(null)
  }

  const handleInvestigate = () => {
    if (!selectedIncident) return
    const note = investigateNote.trim()
    patchIncident(selectedIncident.id, {
      status: 'investigating',
      triageNote: note ? [selectedIncident.triageNote, `Investigation: ${note}`].filter(Boolean).join('\n') : selectedIncident.triageNote,
    })
    setInvestigateOpen(false)
    setInvestigateNote('')
    setEscalateOpen(false)
    setEscalateStep(0)
    setSelectedIncident(null)
  }

  const handleEscalateFinish = () => {
    if (!selectedIncident) return
    patchIncident(selectedIncident.id, {
      severity: 'critical',
      escalationLevel: escalateLevel,
      description: escalateReason.trim()
        ? `${selectedIncident.description}\n\n[Escalation L${escalateLevel}]: ${escalateReason.trim()}`
        : selectedIncident.description,
    })
    setEscalateOpen(false)
    setEscalateStep(0)
    setEscalateReason('')
    setInvestigateOpen(false)
    setInvestigateNote('')
    setSelectedIncident(null)
  }

  const resetCreateFlow = () => {
    setCreateOpen(false)
    setCreateStep(0)
    setCreateDraft({
      title: '',
      severity: 'high',
      category: 'Malware',
      assignedTo: '',
      affectedAssets: 1,
      description: '',
    })
  }

  const handleCreateFinish = () => {
    const id = nextIncidentId(incidents)
    const inc: Incident = {
      id,
      title: createDraft.title.trim(),
      severity: createDraft.severity,
      status: 'new',
      category: createDraft.category,
      detectedAt: 'just now',
      assignedTo: createDraft.assignedTo.trim() || 'Unassigned',
      affectedAssets: Math.max(0, createDraft.affectedAssets),
      mitreTechniques: [],
      description: createDraft.description.trim() || 'Incident opened from Incident Management.',
    }
    setIncidents((prev) => [inc, ...prev])
    setCreatedId(id)
    resetCreateFlow()
  }

  const runExport = () => {
    const rows = filtered
    let blob: Blob
    let name: string
    if (exportFormat === 'json') {
      blob = new Blob([JSON.stringify(rows, null, 2)], { type: 'application/json' })
      name = `incidents-export-${new Date().toISOString().slice(0, 10)}.json`
    } else {
      const header = ['id', 'title', 'severity', 'status', 'category', 'detectedAt', 'assignedTo', 'affectedAssets', 'description']
      const lines = [
        header.join(','),
        ...rows.map((r) =>
          header
            .map((h) => {
              const key = h as keyof Incident
              let v: string | number | undefined
              if (key === 'status') v = formatIncidentStatus(r.status)
              else {
                const raw = r[key]
                v = raw === undefined || raw === null ? '' : Array.isArray(raw) ? raw.join(';') : String(raw)
              }
              const s = String(v ?? '')
              return `"${s.replace(/"/g, '""')}"`
            })
            .join(','),
        ),
      ]
      blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' })
      name = `incidents-export-${new Date().toISOString().slice(0, 10)}.csv`
    }
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = name
    a.click()
    URL.revokeObjectURL(url)
    setExportOpen(false)
    setExportDoneLabel(name)
  }

  const headerDescription = `${incidents.length} incident${incidents.length === 1 ? '' : 's'} in queue · ${stats.investigating} active investigation${stats.investigating === 1 ? '' : 's'} · MTTR 3.8h (SLA)`

  return (
    <OverviewPageShell>
      <OverviewPageHeader
        section="SECURITY INCIDENTS"
        title="Incident Management"
        description={headerDescription}
        actions={[
          {
            id: 'export',
            label: 'Export',
            variant: 'secondary',
            onClick: () => setExportOpen(true),
          },
          {
            id: 'new',
            label: '+ New Incident',
            variant: 'primary',
            onClick: () => setCreateOpen(true),
          },
        ]}
      />

      <OverviewKpiRow
        columns={4}
        items={[
          { label: 'CRITICAL', value: stats.critical, sub: 'Immediate action', tone: 'critical' },
          { label: 'HIGH', value: stats.high, sub: 'Elevated priority', tone: 'high' },
          { label: 'ACTIVE', value: stats.investigating, sub: 'Investigating now', tone: 'medium' },
          { label: 'RESOLVED', value: stats.resolved, sub: 'Contained or closed', tone: 'low' },
        ]}
      />

      <div className="soc-card mb-5">
        <div className="border-b px-4 py-3" style={{ borderColor: 'var(--soc-border)' }}>
          <p className="soc-label">RESPONSE SNAPSHOT</p>
          <p className="mt-0.5 text-sm" style={{ color: 'var(--soc-text-secondary)' }}>
            Key response metrics — same nested tile language as the Unified Overview pattern.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-3 lg:grid-cols-6">
          <OverviewNestedStatCard label="FIRST RESPONSE" value="12m" sub="SLA 15m" accentColor="var(--soc-low)" />
          <OverviewNestedStatCard label="CONTAINMENT" value="1.4h" sub="SLA 2h" accentColor="var(--soc-low)" />
          <OverviewNestedStatCard label="MTTR" value="3.8h" sub="SLA 4h" accentColor="var(--soc-accent)" />
          <OverviewNestedStatCard label="SLA" value="91%" sub="Compliance" accentColor="var(--soc-low)" />
          <OverviewNestedStatCard label="RE-OPEN" value="2.3%" sub="Target under 5%" accentColor="var(--soc-medium)" />
          <OverviewNestedStatCard label="QUEUE" value={String(incidents.length)} sub="Total incidents" accentColor="var(--soc-text)" />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 space-y-4 lg:col-span-8">
          <OverviewTableToolbar
            searchValue={searchQuery}
            onSearchChange={(value) => {
              setSearchQuery(value)
              setCurrentPage(1)
            }}
            searchPlaceholder="Search id, title, category, assignee, MITRE…"
            end={(
              <OverviewFilterMenu
                options={[...COMBINED_FILTER_OPTIONS]}
                selected={combinedFilters}
                onApply={(next) => {
                  setCombinedFilters(next)
                  setCurrentPage(1)
                }}
              />
            )}
          />

          <OverviewSection
            title="SECURITY INCIDENTS"
            flush
            right={(
              <div className="flex items-center gap-2">
                <span className="text-xs" style={{ color: 'var(--soc-text-muted)' }}>
                  {filtered.length}
                  {' '}
                  results
                </span>
                <OverviewRowsPerPageMenu
                  value={itemsPerPage}
                  options={[5, 10, 15]}
                  onChange={(n) => {
                    setItemsPerPage(n)
                    setCurrentPage(1)
                  }}
                />
              </div>
            )}
          >
            {pageRows.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm" style={{ color: 'var(--soc-text-muted)' }}>No incidents match your filters</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="soc-table min-w-[960px]" style={{ tableLayout: 'auto', width: '100%' }}>
                  <thead>
                    <tr>
                      <th style={{ width: '6px', padding: 0 }} />
                      <th className="whitespace-nowrap">Incident</th>
                      <th className="whitespace-nowrap">Severity</th>
                      <th className="whitespace-nowrap">Status</th>
                      <th className="whitespace-nowrap text-right">Assets</th>
                      <th className="whitespace-nowrap">Assignee</th>
                      <th className="text-right whitespace-nowrap">Detected</th>
                      <th className="whitespace-nowrap text-right" />
                    </tr>
                  </thead>
                  <tbody>
                    {pageRows.map((inc) => {
                      const sevColor = SEV_COLOR[inc.severity]
                      const sevBg = SEV_BG[inc.severity]
                      const stColor = STATUS_COLOR[inc.status]
                      const isExpanded = expandedId === inc.id
                      return (
                        <Fragment key={inc.id}>
                          <tr
                            className="cursor-pointer"
                            style={isExpanded ? { backgroundColor: 'var(--soc-raised)' } : undefined}
                            onClick={() => setExpandedId(isExpanded ? null : inc.id)}
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
                            <td className="align-top">
                              <p className="text-sm font-medium leading-snug" style={{ color: 'var(--soc-text)' }} title={inc.title}>
                                {inc.title}
                              </p>
                              <p className="text-xs mt-0.5 font-mono" style={{ color: 'var(--soc-text-muted)' }}>
                                {inc.id}
                                {' · '}
                                {inc.category}
                              </p>
                            </td>
                            <td className="align-top">
                              <span className="soc-badge whitespace-nowrap" style={{ backgroundColor: sevBg, color: sevColor }}>
                                {inc.severity.toUpperCase()}
                              </span>
                            </td>
                            <td className="align-top">
                              <span
                                className="soc-badge whitespace-nowrap"
                                style={{ color: stColor, border: `1px solid ${stColor}44`, background: 'transparent' }}
                              >
                                {formatIncidentStatus(inc.status)}
                              </span>
                            </td>
                            <td className="text-right align-top">
                              <span className="text-sm tabular-nums" style={{ color: 'var(--soc-text)' }}>{inc.affectedAssets}</span>
                            </td>
                            <td className="align-top">
                              <span className="text-xs" style={{ color: 'var(--soc-text-secondary)' }}>{inc.assignedTo}</span>
                            </td>
                            <td className="text-right align-top">
                              <span className="text-xs tabular-nums whitespace-nowrap" style={{ color: 'var(--soc-text-muted)' }}>
                                {inc.detectedAt}
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
                                  setExpandedId(isExpanded ? null : inc.id)
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
                              <td colSpan={8} style={{ padding: '12px 16px' }}>
                                <p className="text-sm mb-3" style={{ color: 'var(--soc-text-secondary)' }}>{inc.description}</p>
                                {inc.mitreTechniques.length > 0 && (
                                  <div className="flex items-center gap-1.5 flex-wrap mb-3">
                                    <span className="soc-label mr-1">MITRE</span>
                                    {inc.mitreTechniques.map((t) => (
                                      <span key={t} className="soc-badge soc-badge-critical font-mono">{t}</span>
                                    ))}
                                  </div>
                                )}
                                <div className="flex flex-wrap gap-2">
                                  <button
                                    type="button"
                                    className="soc-btn soc-btn-primary text-xs"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      openDetail(inc)
                                    }}
                                  >
                                    View full details
                                  </button>
                                  <button
                                    type="button"
                                    className="soc-btn soc-btn-secondary text-xs"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setSelectedIncident(inc)
                                      setAssignDraft(inc.assignedTo)
                                      setAssignOpen(true)
                                    }}
                                  >
                                    Assign
                                  </button>
                                  <button
                                    type="button"
                                    className="soc-btn soc-btn-secondary text-xs"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setTimelineFor(inc)
                                      setTimelineOpen(true)
                                    }}
                                  >
                                    View timeline
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
            <OverviewPagination
              page={currentPage}
              totalPages={totalPages}
              totalItems={filtered.length}
              onPageChange={changePage}
            />
          </OverviewSection>
        </div>

        <div className="col-span-12 space-y-4 lg:col-span-4">
          <div className="soc-card">
            <p className="soc-label mb-3">RESPONSE METRICS</p>
            {[
              { label: 'Avg Initial Response', value: '12m', note: 'SLA: 15m ✓' },
              { label: 'Avg Containment', value: '1.4h', note: 'SLA: 2h ✓' },
              { label: 'MTTR', value: '3.8h', note: 'SLA: 4h ✓' },
              { label: 'SLA Compliance', value: '91%', note: '+3% vs last month' },
              { label: 'Re-opened Rate', value: '2.3%', note: 'Target: under 5% ✓' },
            ].map((m, i, arr) => (
              <div
                key={m.label}
                className="flex items-center justify-between py-2.5"
                style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--soc-border)' : 'none' }}
              >
                <div>
                  <p className="text-xs" style={{ color: 'var(--soc-text-secondary)' }}>{m.label}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--soc-text-muted)' }}>{m.note}</p>
                </div>
                <span className="text-base font-bold tabular-nums" style={{ color: 'var(--soc-text)' }}>{m.value}</span>
              </div>
            ))}
          </div>

          <div className="soc-card">
            <p className="soc-label mb-3">BY CATEGORY</p>
            <div className="space-y-2.5">
              {catCounts.map(({ cat, n }) => (
                <div key={cat}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs" style={{ color: 'var(--soc-text-secondary)' }}>{cat}</span>
                    <span className="text-xs font-semibold" style={{ color: 'var(--soc-text)' }}>{n}</span>
                  </div>
                  <div className="soc-progress-track">
                    <div className="soc-progress-fill" style={{ width: `${(n / incidents.length) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="soc-card">
            <p className="soc-label mb-3">MITRE ATT&CK COVERAGE</p>
            <div className="space-y-2.5">
              {MITRE_COVERAGE.map(({ tactic, pct }) => {
                const barColor = pct >= 80 ? 'var(--soc-low)' : pct >= 65 ? 'var(--soc-medium)' : 'var(--soc-critical)'
                return (
                  <div key={tactic}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs" style={{ color: 'var(--soc-text-secondary)' }}>{tactic}</span>
                      <span className="text-xs font-semibold" style={{ color: barColor }}>{pct}%</span>
                    </div>
                    <div className="soc-progress-track">
                      <div className="soc-progress-fill" style={{ width: `${pct}%`, backgroundColor: barColor }} />
                    </div>
                  </div>
                )
              })}
            </div>
            <p className="text-xs mt-3 pt-3" style={{ color: 'var(--soc-text-muted)', borderTop: '1px solid var(--soc-border)' }}>
              Avg coverage:
              {' '}
              <strong style={{ color: 'var(--soc-text-secondary)' }}>74%</strong>
              {' '}
              across 6 tactics
            </p>
          </div>
        </div>
      </div>

      {/* Detail modal */}
      <OverviewModal
        open={!!selectedIncident && !updateStatusOpen && !assignOpen && !investigateOpen && !escalateOpen && !timelineOpen}
        title={selectedIncident?.title ?? ''}
        subtitle={selectedIncident ? `${selectedIncident.id} · ${selectedIncident.category}` : ''}
        onClose={() => setSelectedIncident(null)}
        maxWidth="max-w-3xl"
        footer={selectedIncident ? (
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
            <button
              type="button"
              className="soc-btn soc-btn-primary"
              onClick={() => {
                setStatusDraft(selectedIncident.status)
                setStatusNote('')
                setUpdateStatusOpen(true)
              }}
            >
              Update status
            </button>
            <button
              type="button"
              className="soc-btn soc-btn-secondary"
              onClick={() => {
                setAssignDraft(selectedIncident.assignedTo)
                setAssignOpen(true)
              }}
            >
              Assign
            </button>
            <button
              type="button"
              className="soc-btn"
              style={{ borderColor: 'var(--soc-medium)', color: 'var(--soc-medium)' }}
              onClick={() => setInvestigateOpen(true)}
            >
              Investigate
            </button>
            <button
              type="button"
              className="soc-btn"
              style={{ borderColor: 'var(--soc-critical)', color: 'var(--soc-critical)' }}
              onClick={() => setEscalateOpen(true)}
            >
              Escalate
            </button>
            <button type="button" className="soc-btn soc-btn-secondary" onClick={() => setSelectedIncident(null)}>
              Close
            </button>
          </div>
        ) : null}
      >
        {selectedIncident && (
          <div className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              <span className="soc-badge" style={{ backgroundColor: SEV_BG[selectedIncident.severity], color: SEV_COLOR[selectedIncident.severity] }}>
                {selectedIncident.severity.toUpperCase()}
              </span>
              <span
                className="soc-badge"
                style={{
                  color: STATUS_COLOR[selectedIncident.status],
                  border: `1px solid ${STATUS_COLOR[selectedIncident.status]}44`,
                  background: 'transparent',
                }}
              >
                {formatIncidentStatus(selectedIncident.status)}
              </span>
              {selectedIncident.escalationLevel != null && selectedIncident.escalationLevel > 0 && (
                <span className="soc-badge" style={{ color: 'var(--soc-critical)', border: '1px solid var(--soc-critical-bg)', backgroundColor: 'var(--soc-critical-bg)' }}>
                  ESCALATION L
                  {selectedIncident.escalationLevel}
                </span>
              )}
            </div>

            <p className="text-sm leading-relaxed" style={{ color: 'var(--soc-text-secondary)' }}>{selectedIncident.description}</p>

            {selectedIncident.triageNote && (
              <div className="rounded-md border p-3" style={{ borderColor: 'var(--soc-border)', backgroundColor: 'var(--soc-raised)' }}>
                <p className="soc-label mb-1">Notes</p>
                <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--soc-text-secondary)' }}>{selectedIncident.triageNote}</p>
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: 'CATEGORY', value: selectedIncident.category },
                { label: 'ASSIGNED TO', value: selectedIncident.assignedTo },
                { label: 'DETECTED', value: selectedIncident.detectedAt },
                { label: 'ASSETS', value: String(selectedIncident.affectedAssets) },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-md border p-3" style={{ borderColor: 'var(--soc-border)', backgroundColor: 'var(--soc-raised)' }}>
                  <p className="soc-label mb-1">{label}</p>
                  <p className="text-sm font-medium" style={{ color: 'var(--soc-text)' }}>{value}</p>
                </div>
              ))}
            </div>

            {selectedIncident.mitreTechniques.length > 0 && (
              <div>
                <p className="soc-label mb-2">MITRE ATT&CK</p>
                <div className="flex gap-1.5 flex-wrap">
                  {selectedIncident.mitreTechniques.map((t) => (
                    <span key={t} className="soc-badge soc-badge-critical font-mono">{t}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </OverviewModal>

      {/* Update status */}
      <OverviewModal
        open={updateStatusOpen && !!selectedIncident}
        title="Update incident status"
        subtitle={selectedIncident?.id}
        onClose={() => {
          setUpdateStatusOpen(false)
          setStatusNote('')
        }}
        footer={(
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="soc-btn soc-btn-secondary"
              onClick={() => {
                setUpdateStatusOpen(false)
                setStatusNote('')
              }}
            >
              Cancel
            </button>
            <button type="button" className="soc-btn soc-btn-primary" onClick={handleUpdateStatus}>
              Save status
            </button>
          </div>
        )}
      >
        <div className="space-y-3">
          <p className="text-sm" style={{ color: 'var(--soc-text-secondary)' }}>
            Choose the new lifecycle state. An optional note is appended to the incident record.
          </p>
          <label className="block">
            <span className="soc-label mb-1 block">Status</span>
            <select
              className="soc-input w-full"
              value={statusDraft}
              onChange={(e) => setStatusDraft(e.target.value as Incident['status'])}
            >
              {(Object.keys(STATUS_COLOR) as Incident['status'][]).map((s) => (
                <option key={s} value={s}>{formatIncidentStatus(s)}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="soc-label mb-1 block">Note (optional)</span>
            <textarea
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
              className="soc-input w-full min-h-[100px]"
              placeholder="Example: Containment verified on segment A; handoff to remediation."
            />
          </label>
        </div>
      </OverviewModal>

      {/* Assign */}
      <OverviewModal
        open={assignOpen && !!selectedIncident}
        title="Assign incident"
        subtitle={selectedIncident?.id}
        onClose={() => {
          setAssignOpen(false)
          setAssignDraft('')
        }}
        footer={(
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="soc-btn soc-btn-secondary"
              onClick={() => {
                setAssignOpen(false)
                setAssignDraft('')
              }}
            >
              Cancel
            </button>
            <button type="button" className="soc-btn soc-btn-primary" onClick={handleAssign} disabled={!assignDraft.trim()}>
              Save assignee
            </button>
          </div>
        )}
      >
        <label className="block">
          <span className="soc-label mb-1 block">Assignee</span>
          <select
            className="soc-input w-full"
            value={assignDraft}
            onChange={(e) => setAssignDraft(e.target.value)}
          >
            {assignDraft && !ANALYST_OPTIONS.some((a) => a === assignDraft) && (
              <option value={assignDraft}>{assignDraft}</option>
            )}
            {ANALYST_OPTIONS.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </label>
      </OverviewModal>

      {/* Investigate */}
      <OverviewModal
        open={investigateOpen && !!selectedIncident}
        title="Start investigation"
        subtitle={selectedIncident?.id}
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
              Confirm investigate
            </button>
          </div>
        )}
      >
        <div className="space-y-3">
          <p className="text-sm" style={{ color: 'var(--soc-text-secondary)' }}>
            Sets status to
            {' '}
            <strong>INVESTIGATING</strong>
            {' '}
            and records your triage note on the incident.
          </p>
          <label className="block">
            <span className="soc-label mb-1 block">Investigation note</span>
            <textarea
              value={investigateNote}
              onChange={(e) => setInvestigateNote(e.target.value)}
              className="soc-input w-full min-h-[100px]"
              placeholder="Example: Correlating auth logs and EDR telemetry for lateral movement."
            />
          </label>
        </div>
      </OverviewModal>

      {/* Escalate — step modal like All Alerts */}
      <OverviewStepModal
        open={escalateOpen && !!selectedIncident}
        subtitle={selectedIncident?.id ? `ESCALATION · ${selectedIncident.id}` : 'ESCALATION'}
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
                  Choose response tier. Finishing sets severity to
                  {' '}
                  <strong>critical</strong>
                  {' '}
                  and records escalation metadata.
                </p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {[1, 2, 3].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      className={`soc-btn ${escalateLevel === lvl ? 'soc-btn-primary' : 'soc-btn-secondary'}`}
                      onClick={() => setEscalateLevel(lvl)}
                    >
                      Level
                      {' '}
                      {lvl}
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
            validationHint: 'Add a reason (at least 8 characters).',
            content: (
              <label className="block">
                <span className="soc-label mb-1 block">Escalation reason</span>
                <textarea
                  className="soc-input w-full min-h-[130px]"
                  value={escalateReason}
                  onChange={(e) => setEscalateReason(e.target.value)}
                  placeholder="Example: Confirmed data impact and executive escalation requested."
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
                  Confirm to apply escalation to this incident.
                </p>
                <div className="rounded-md border p-3" style={{ borderColor: 'var(--soc-border)', backgroundColor: 'var(--soc-raised)' }}>
                  <p className="soc-label mb-1">Outcome</p>
                  <p className="text-sm" style={{ color: 'var(--soc-text)' }}>
                    Set
                    {' '}
                    <strong>
                      Level
                      {escalateLevel}
                    </strong>
                    , severity
                    {' '}
                    <strong>critical</strong>
                    , and append reason to the description.
                  </p>
                </div>
              </div>
            ),
          },
        ]}
      />

      {/* New incident wizard */}
      <OverviewStepModal
        open={createOpen}
        subtitle="INCIDENT CREATION"
        currentStep={createStep}
        onStepChange={setCreateStep}
        onClose={resetCreateFlow}
        onFinish={handleCreateFinish}
        steps={[
          {
            id: 'basics',
            title: 'Step 1: Basics',
            canProceed: () => createDraft.title.trim().length > 5,
            validationHint: 'Title must be at least 6 characters.',
            content: (
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block sm:col-span-2">
                  <span className="soc-label mb-1 block">Title</span>
                  <input
                    type="text"
                    className="soc-input w-full"
                    value={createDraft.title}
                    onChange={(e) => setCreateDraft((p) => ({ ...p, title: e.target.value }))}
                    placeholder="Example: Suspicious bulk export from CRM"
                  />
                </label>
                <label className="block">
                  <span className="soc-label mb-1 block">Severity</span>
                  <select
                    className="soc-input w-full"
                    value={createDraft.severity}
                    onChange={(e) => setCreateDraft((p) => ({ ...p, severity: e.target.value as Incident['severity'] }))}
                  >
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </label>
                <label className="block">
                  <span className="soc-label mb-1 block">Category</span>
                  <select
                    className="soc-input w-full"
                    value={createDraft.category}
                    onChange={(e) => setCreateDraft((p) => ({ ...p, category: e.target.value }))}
                  >
                    <option value="Malware">Malware</option>
                    <option value="Data Breach">Data Breach</option>
                    <option value="Unauthorized Access">Unauthorized Access</option>
                    <option value="Network Attack">Network Attack</option>
                    <option value="Social Engineering">Social Engineering</option>
                    <option value="Insider Threat">Insider Threat</option>
                    <option value="Supply Chain">Supply Chain</option>
                  </select>
                </label>
              </div>
            ),
          },
          {
            id: 'context',
            title: 'Step 2: Context',
            canProceed: () => createDraft.assignedTo.trim().length > 0,
            validationHint: 'Select an assignee.',
            content: (
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="soc-label mb-1 block">Assignee</span>
                  <select
                    className="soc-input w-full"
                    value={createDraft.assignedTo}
                    onChange={(e) => setCreateDraft((p) => ({ ...p, assignedTo: e.target.value }))}
                  >
                    <option value="">Select assignee…</option>
                    {ANALYST_OPTIONS.map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="soc-label mb-1 block">Affected assets (count)</span>
                  <input
                    type="number"
                    min={0}
                    className="soc-input w-full"
                    value={createDraft.affectedAssets}
                    onChange={(e) => setCreateDraft((p) => ({ ...p, affectedAssets: parseInt(e.target.value, 10) || 0 }))}
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="soc-label mb-1 block">Description</span>
                  <textarea
                    className="soc-input w-full min-h-[120px]"
                    value={createDraft.description}
                    onChange={(e) => setCreateDraft((p) => ({ ...p, description: e.target.value }))}
                    placeholder="What happened, scope, and immediate risk."
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
                <p className="text-sm" style={{ color: 'var(--soc-text-secondary)' }}>Confirm before creating the incident.</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    ['Title', createDraft.title || '—'],
                    ['Severity', createDraft.severity],
                    ['Category', createDraft.category],
                    ['Assignee', createDraft.assignedTo || '—'],
                    ['Assets', String(createDraft.affectedAssets)],
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

      {/* Export */}
      <OverviewModal
        open={exportOpen}
        title="Export incidents"
        subtitle="FILTERED RESULT SET"
        onClose={() => setExportOpen(false)}
        footer={(
          <div className="flex justify-end gap-2">
            <button type="button" className="soc-btn soc-btn-secondary" onClick={() => setExportOpen(false)}>Cancel</button>
            <button type="button" className="soc-btn soc-btn-primary" onClick={runExport} disabled={filtered.length === 0}>
              Download
            </button>
          </div>
        )}
      >
        <div className="space-y-3">
          <p className="text-sm" style={{ color: 'var(--soc-text-secondary)' }}>
            Exports
            {' '}
            <strong>{filtered.length}</strong>
            {' '}
            incident(s) matching current filters and search.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              className={`soc-btn text-xs ${exportFormat === 'csv' ? 'soc-btn-primary' : 'soc-btn-secondary'}`}
              onClick={() => setExportFormat('csv')}
            >
              CSV
            </button>
            <button
              type="button"
              className={`soc-btn text-xs ${exportFormat === 'json' ? 'soc-btn-primary' : 'soc-btn-secondary'}`}
              onClick={() => setExportFormat('json')}
            >
              JSON
            </button>
          </div>
        </div>
      </OverviewModal>

      <OverviewModal
        open={!!exportDoneLabel}
        title="Export ready"
        subtitle={exportDoneLabel}
        onClose={() => setExportDoneLabel('')}
        footer={(
          <div className="flex justify-end">
            <button type="button" className="soc-btn soc-btn-primary" onClick={() => setExportDoneLabel('')}>Done</button>
          </div>
        )}
      >
        <p className="text-sm" style={{ color: 'var(--soc-text-secondary)' }}>
          Your download should start automatically. If not, run export again from the toolbar.
        </p>
      </OverviewModal>

      {/* Timeline */}
      <OverviewModal
        open={timelineOpen && !!timelineFor}
        title="Incident timeline"
        subtitle={timelineFor?.id}
        onClose={() => {
          setTimelineOpen(false)
          setTimelineFor(null)
        }}
        footer={(
          <div className="flex justify-end">
            <button
              type="button"
              className="soc-btn soc-btn-primary"
              onClick={() => {
                setTimelineOpen(false)
                setTimelineFor(null)
              }}
            >
              Close
            </button>
          </div>
        )}
      >
        {timelineFor && (
          <ul className="space-y-3 text-sm" style={{ color: 'var(--soc-text-secondary)' }}>
            <li>
              <span className="font-mono text-xs" style={{ color: 'var(--soc-text-muted)' }}>T+0</span>
              {' '}
              Detection signal raised —
              {' '}
              {timelineFor.detectedAt}
            </li>
            <li>
              <span className="font-mono text-xs" style={{ color: 'var(--soc-text-muted)' }}>T+15m</span>
              {' '}
              Incident opened and routed to
              {' '}
              {timelineFor.assignedTo}
            </li>
            <li>
              <span className="font-mono text-xs" style={{ color: 'var(--soc-text-muted)' }}>T+45m</span>
              {' '}
              Triage: scope
              {' '}
              {timelineFor.affectedAssets}
              {' '}
              assets; MITRE
              {' '}
              {timelineFor.mitreTechniques.slice(0, 2).join(', ') || '—'}
            </li>
            <li>
              <span className="font-mono text-xs" style={{ color: 'var(--soc-text-muted)' }}>T+2h</span>
              {' '}
              Status
              {' '}
              <strong style={{ color: 'var(--soc-text)' }}>{formatIncidentStatus(timelineFor.status)}</strong>
              {' '}
              — next step per IR playbook.
            </li>
          </ul>
        )}
      </OverviewModal>

      <OverviewModal
        open={!!createdId}
        title="Incident created"
        subtitle={createdId}
        onClose={() => setCreatedId('')}
        footer={(
          <div className="flex justify-end">
            <button type="button" className="soc-btn soc-btn-primary" onClick={() => setCreatedId('')}>Done</button>
          </div>
        )}
      >
        <p className="text-sm" style={{ color: 'var(--soc-text-secondary)' }}>
          The incident was added to the top of the queue with status
          {' '}
          <strong>new</strong>
          .
        </p>
      </OverviewModal>
    </OverviewPageShell>
  )
}

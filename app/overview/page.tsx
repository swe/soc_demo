'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  ArcElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
  type ChartData,
  type ChartOptions,
} from 'chart.js'
import { Doughnut, Line } from 'react-chartjs-2'
import { usePageTitle } from '@/app/page-title-context'
import {
  OverviewAlert,
  OverviewComplianceTile,
  OverviewIntegrationTile,
  OverviewModal,
  OverviewPageHeader,
  OverviewPageShell,
  OverviewProgressBar,
  OverviewRowsPerPageMenu,
  OverviewSection,
  OverviewStepModal,
  OverviewToggle,
} from '@/components/overview/unified-ui'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler)

type Incident = {
  id: string
  title: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  status: 'new' | 'investigating' | 'contained' | 'resolved'
  category: string
  detectedAt: string
  detectedDate: string
  assignedTo: string
  affectedAssets: number
}

type Integration = {
  id: string
  name: string
  subtitle: string
  status: 'connected' | 'warning' | 'error'
  events: string
  regions?: string[]
  critical: number
  high: number
  medium: number
  lastSync: string
}

type IncidentAsset = {
  id: string
  label: string
  type: string
  owner: string
  exposure: 'critical' | 'high' | 'medium'
}

const INITIAL_INCIDENTS: Incident[] = [
  { id: 'INC-2024-001', title: 'Ransomware Attack Detected', severity: 'critical', status: 'investigating', category: 'Malware', detectedAt: '15m ago', detectedDate: '2026-04-07', assignedTo: 'Sarah Chen', affectedAssets: 23 },
  { id: 'INC-2024-009', title: 'Supply Chain Alert — npm Package', severity: 'critical', status: 'new', category: 'Supply Chain', detectedAt: '3d ago', detectedDate: '2026-04-04', assignedTo: 'Sarah Chen', affectedAssets: 14 },
  { id: 'INC-2024-003', title: 'Privilege Escalation — Domain Admin', severity: 'high', status: 'investigating', category: 'Unauthorized Access', detectedAt: '4h ago', detectedDate: '2026-04-07', assignedTo: 'Sarah Chen', affectedAssets: 2 },
  { id: 'INC-2024-005', title: 'Phishing Campaign — CFO Impersonation', severity: 'high', status: 'investigating', category: 'Social Engineering', detectedAt: '10h ago', detectedDate: '2026-04-07', assignedTo: 'Emily Taylor', affectedAssets: 8 },
  { id: 'INC-2024-008', title: 'Insider Threat — Bulk Download', severity: 'high', status: 'investigating', category: 'Insider Threat', detectedAt: '2d ago', detectedDate: '2026-04-05', assignedTo: 'James Rodriguez', affectedAssets: 1 },
]

const COMPLIANCE = [
  { name: 'PCI DSS', score: 94, delta: '+2%', statusLabel: 'Compliant', statusVariant: 'compliant' as const, breakdown: { implemented: 188, inProgress: 7, notStarted: 5 } },
  { name: 'SOC 2', score: 97, delta: '+1%', statusLabel: 'Compliant', statusVariant: 'compliant' as const, breakdown: { implemented: 140, inProgress: 2, notStarted: 0 } },
  { name: 'ISO 27001', score: 89, delta: '-1%', statusLabel: 'Partial', statusVariant: 'partial' as const, breakdown: { implemented: 101, inProgress: 10, notStarted: 3 } },
  { name: 'GDPR', score: 91, delta: '0%', statusLabel: 'Compliant', statusVariant: 'compliant' as const, breakdown: { implemented: 88, inProgress: 5, notStarted: 3 } },
  { name: 'HIPAA', score: 78, delta: '-3%', statusLabel: 'At risk', statusVariant: 'atrisk' as const, breakdown: { implemented: 52, inProgress: 12, notStarted: 9 } },
]

const RISK_DIMENSIONS = [
  { label: 'Threat Exposure', score: 61, delta: -2 },
  { label: 'Patch Posture', score: 84, delta: +5 },
  { label: 'Identity Risk', score: 71, delta: -1 },
  { label: 'Network Exposure', score: 68, delta: 0 },
  { label: 'Data Protection', score: 79, delta: +2 },
]

const TEAM_ACTIVITY = [
  { analyst: 'Sarah Chen', role: 'Lead Analyst', assigned: 3, resolved: 2, mttr: '2.1h' },
  { analyst: 'James Rodriguez', role: 'Analyst II', assigned: 2, resolved: 4, mttr: '3.4h' },
  { analyst: 'Emily Taylor', role: 'Analyst II', assigned: 2, resolved: 1, mttr: '5.2h' },
  { analyst: 'Michael Kim', role: 'Analyst I', assigned: 1, resolved: 3, mttr: '4.1h' },
  { analyst: 'Alex Petrov', role: 'Analyst I', assigned: 1, resolved: 2, mttr: '3.8h' },
]

const INTEGRATIONS: Integration[] = [
  { id: 'int-1', name: 'Splunk SIEM', subtitle: 'SIEM · Primary sink', status: 'connected', events: '45.2k/day', regions: ['eu-central', 'us-east'], critical: 0, high: 2, medium: 8, lastSync: '1m ago' },
  { id: 'int-2', name: 'CrowdStrike Falcon', subtitle: 'EDR · Endpoint telemetry', status: 'connected', events: '23.8k/day', regions: ['eu-central'], critical: 1, high: 3, medium: 11, lastSync: '2m ago' },
  { id: 'int-3', name: 'AWS CloudTrail', subtitle: 'Cloud · Audit log stream', status: 'connected', events: '156.7k/day', regions: ['us-east-1', 'eu-west-1'], critical: 2, high: 7, medium: 19, lastSync: '40s ago' },
  { id: 'int-4', name: 'FortiGate', subtitle: 'Network perimeter', status: 'warning', events: '67.4k/day', regions: ['dc-1'], critical: 0, high: 6, medium: 12, lastSync: '18m ago' },
  { id: 'int-5', name: 'Tenable Nessus', subtitle: 'Vulnerability scanner', status: 'error', events: '—', regions: ['dc-1'], critical: 3, high: 0, medium: 0, lastSync: '2h ago' },
]

const INCIDENT_CATEGORIES = ['Malware', 'Unauthorized Access', 'Supply Chain', 'Insider Threat', 'Data Exfiltration', 'Credential Abuse']
const INCIDENT_ASSIGNEES = ['Sarah Chen', 'Emily Taylor', 'James Rodriguez', 'Michael Kim', 'Alex Petrov']
const INCIDENT_SOURCES = ['CrowdStrike Falcon', 'Splunk SIEM', 'AWS GuardDuty', 'Microsoft Defender', 'User Report', 'Threat Intel Feed']
const INCIDENT_PRIORITY_WINDOWS = ['15 minutes', '30 minutes', '1 hour', '4 hours']
const INCIDENT_PLAYBOOKS = ['Identity compromise response', 'Endpoint malware containment', 'Cloud credential abuse', 'Data exfiltration protocol']
const INCIDENT_ASSET_CATALOG: IncidentAsset[] = [
  { id: 'asset-ec2-prod-api', label: 'prod-api-ec2-13', type: 'Compute', owner: 'Cloud Platform', exposure: 'critical' },
  { id: 'asset-okta-admin', label: 'Okta Admin Tenant', type: 'Identity', owner: 'IAM Team', exposure: 'critical' },
  { id: 'asset-vpn-gateway', label: 'VPN Gateway EU-1', type: 'Network', owner: 'NetSec', exposure: 'high' },
  { id: 'asset-finance-laptop', label: 'FIN-LAPTOP-244', type: 'Endpoint', owner: 'Finance IT', exposure: 'high' },
  { id: 'asset-s3-archive', label: 'S3 Security Archive', type: 'Storage', owner: 'Cloud Platform', exposure: 'medium' },
  { id: 'asset-ad-dc2', label: 'AD-DC2', type: 'Identity', owner: 'Infra Ops', exposure: 'critical' },
]

const ALERT_TREND_BASE_30 = [
  612, 640, 658, 671, 702, 689, 711, 735, 755, 782,
  801, 824, 861, 879, 842, 918, 891, 1042, 1105, 1188,
  1156, 1284, 1197, 1169, 1211, 1239, 1208, 1242, 1260, 1284,
]

const BLOCKED_HOURLY_SERIES = [
  980, 1015, 1068, 1120, 1186, 1264, 1342, 1431, 1520, 1628, 1744, 1882,
  2051, 2218, 2384, 2460, 2422, 2310, 2184, 2062, 1968, 1884, 1808, 1740,
]
const SERVICES_IMPACTED_COUNTS: Record<7 | 14 | 30, number> = { 7: 3, 14: 4, 30: 6 }
const INCIDENT_OPEN_BASE_30 = [
  14, 14, 13, 13, 12, 12, 11, 11, 10, 10,
  10, 9, 9, 9, 8, 8, 9, 9, 10, 10,
  9, 9, 8, 8, 7, 7, 7, 6, 6, 6,
]
const INCIDENT_CLOSED_BASE_30 = [
  2, 2, 3, 3, 3, 4, 4, 4, 5, 5,
  5, 6, 6, 6, 7, 7, 7, 8, 8, 8,
  8, 8, 9, 9, 9, 9, 9, 9, 9, 10,
]

const STATUS_TO_DISPLAY: Record<Incident['status'], { label: string; tone: string; bg: string }> = {
  new: { label: 'NEW', tone: 'var(--soc-critical)', bg: 'var(--soc-critical-bg)' },
  investigating: { label: 'INVESTIGATING', tone: 'var(--soc-high)', bg: 'var(--soc-high-bg)' },
  contained: { label: 'CONTAINED', tone: 'var(--soc-medium)', bg: 'var(--soc-medium-bg)' },
  resolved: { label: 'RESOLVED', tone: 'var(--soc-low)', bg: 'var(--soc-low-bg)' },
}

const SEVERITY_STYLE: Record<Incident['severity'], { tone: string; bg: string }> = {
  critical: { tone: 'var(--soc-critical)', bg: 'var(--soc-critical-bg)' },
  high: { tone: 'var(--soc-high)', bg: 'var(--soc-high-bg)' },
  medium: { tone: 'var(--soc-medium)', bg: 'var(--soc-medium-bg)' },
  low: { tone: 'var(--soc-low)', bg: 'var(--soc-low-bg)' },
}

function trendText(delta: number) {
  if (delta === 0) return 'stable'
  return delta > 0 ? `+${delta}` : `${delta}`
}

function getLastNDaysLabels(days: number) {
  const now = new Date()
  return Array.from({ length: days }, (_, idx) => {
    const d = new Date(now)
    d.setDate(now.getDate() - (days - 1 - idx))
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  })
}

function trendIcon(delta: number) {
  if (delta > 0) {
    return (
      <span
        className="inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-semibold"
        style={{ backgroundColor: 'var(--soc-low-bg)', color: 'var(--soc-low)' }}
        title="Improving trend"
      >
        ↑
      </span>
    )
  }
  if (delta < 0) {
    return (
      <span
        className="inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-semibold"
        style={{ backgroundColor: 'var(--soc-critical-bg)', color: 'var(--soc-critical)' }}
        title="Deteriorating trend"
      >
        ↓
      </span>
    )
  }
  return (
    <span
      className="inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-semibold"
      style={{ backgroundColor: 'var(--soc-medium-bg)', color: 'var(--soc-medium)' }}
      title="Stable trend"
    >
      →
    </span>
  )
}

export default function OverviewPage() {
  const { setPageTitle } = usePageTitle()
  const [now, setNow] = useState(new Date())
  const [incidents, setIncidents] = useState<Incident[]>(INITIAL_INCIDENTS)

  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null)
  const [exportOpen, setExportOpen] = useState(false)
  const [exportFormat, setExportFormat] = useState<'pdf' | 'csv'>('pdf')
  const [includeRaw, setIncludeRaw] = useState(false)
  const [newIncidentOpen, setNewIncidentOpen] = useState(false)
  const [newIncidentStep, setNewIncidentStep] = useState(0)
  const [newIncidentTitle, setNewIncidentTitle] = useState('')
  const [newIncidentSummary, setNewIncidentSummary] = useState('')
  const [newIncidentCategory, setNewIncidentCategory] = useState('Malware')
  const [newIncidentSeverity, setNewIncidentSeverity] = useState<Incident['severity']>('high')
  const [newIncidentAssignee, setNewIncidentAssignee] = useState('Sarah Chen')
  const [newIncidentSource, setNewIncidentSource] = useState('CrowdStrike Falcon')
  const [newIncidentPriorityWindow, setNewIncidentPriorityWindow] = useState('30 minutes')
  const [newIncidentPlaybook, setNewIncidentPlaybook] = useState('Identity compromise response')
  const [newIncidentStatus, setNewIncidentStatus] = useState<Incident['status']>('new')
  const [newIncidentAssets, setNewIncidentAssets] = useState<string[]>([])
  const [newIncidentContainmentPlan, setNewIncidentContainmentPlan] = useState('')
  const [newIncidentTags, setNewIncidentTags] = useState('identity, privileged-access')
  const [newIncidentNotifyExec, setNewIncidentNotifyExec] = useState(true)
  const [newIncidentNotifyItOps, setNewIncidentNotifyItOps] = useState(true)
  const [newIncidentCreateWarRoom, setNewIncidentCreateWarRoom] = useState(false)
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null)
  const [integrationStep, setIntegrationStep] = useState(0)
  const [integrationPageCritical, setIntegrationPageCritical] = useState(true)
  const [integrationEscalateHigh, setIntegrationEscalateHigh] = useState(true)
  const [integrationSuppressDupes, setIntegrationSuppressDupes] = useState(true)
  const [selectedFramework, setSelectedFramework] = useState<(typeof COMPLIANCE)[number] | null>(null)
  const [frameworkStep, setFrameworkStep] = useState(0)
  const [frameworkReviewChecked, setFrameworkReviewChecked] = useState<Record<string, boolean>>({})
  const [exportDateRange, setExportDateRange] = useState<'7d' | '30d' | '90d'>('30d')
  const [exportSections, setExportSections] = useState({ incidents: true, vulnerabilities: true, compliance: true, team: true, rawEvents: false })
  const [exportDelivery, setExportDelivery] = useState<'download' | 'email'>('download')
  const [actionNote, setActionNote] = useState<string | null>(null)
  const [showCriticalBanner, setShowCriticalBanner] = useState(true)
  const [showIntegrationBanner, setShowIntegrationBanner] = useState(true)
  const [alertTrendWindow, setAlertTrendWindow] = useState<7 | 14 | 30>(7)
  const [incidentTrendWindow, setIncidentTrendWindow] = useState<7 | 14 | 30>(7)

  const resetNewIncidentDraft = () => {
    setNewIncidentStep(0)
    setNewIncidentTitle('')
    setNewIncidentSummary('')
    setNewIncidentCategory(INCIDENT_CATEGORIES[0])
    setNewIncidentSeverity('high')
    setNewIncidentAssignee(INCIDENT_ASSIGNEES[0])
    setNewIncidentSource(INCIDENT_SOURCES[0])
    setNewIncidentPriorityWindow(INCIDENT_PRIORITY_WINDOWS[1])
    setNewIncidentPlaybook(INCIDENT_PLAYBOOKS[0])
    setNewIncidentStatus('new')
    setNewIncidentAssets([])
    setNewIncidentContainmentPlan('')
    setNewIncidentTags('identity, privileged-access')
    setNewIncidentNotifyExec(true)
    setNewIncidentNotifyItOps(true)
    setNewIncidentCreateWarRoom(false)
  }

  useEffect(() => {
    setPageTitle('Security Operations Center')
    const t = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(t)
  }, [setPageTitle])

  useEffect(() => {
    if (!actionNote) return
    const timeout = setTimeout(() => setActionNote(null), 4000)
    return () => clearTimeout(timeout)
  }, [actionNote])

  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

  const latestIncidents = useMemo(() => incidents.slice(0, 5), [incidents])
  const selectedAssetDetails = useMemo(
    () => INCIDENT_ASSET_CATALOG.filter((asset) => newIncidentAssets.includes(asset.id)),
    [newIncidentAssets],
  )

  const toggleIncidentAsset = (assetId: string) => {
    setNewIncidentAssets((prev) => (
      prev.includes(assetId) ? prev.filter((id) => id !== assetId) : [...prev, assetId]
    ))
  }

  const criticalCount = incidents.filter((i) => i.severity === 'critical').length
  const openCount = incidents.filter((i) => i.status !== 'resolved').length
  const closedCount = incidents.filter((i) => i.status === 'resolved').length
  const overallRisk = 73
  const riskLabel = overallRisk < 60 ? 'Low' : overallRisk < 75 ? 'Moderate' : overallRisk < 85 ? 'Elevated' : 'High'
  const impactedServices = SERVICES_IMPACTED_COUNTS[7]
  const servicesImpactedPercent = Math.round((impactedServices / 27) * 100)
  /** Stable array refs so Line chart data useMemos do not invalidate on unrelated re-renders (e.g. modals). */
  const alertWindowSeries = useMemo(
    () => ALERT_TREND_BASE_30.slice(-alertTrendWindow),
    [alertTrendWindow],
  )
  const blockedWindowSeries = BLOCKED_HOURLY_SERIES
  const blockedDelta = blockedWindowSeries[blockedWindowSeries.length - 1] - blockedWindowSeries[0]
  const incidentWindowSeries = useMemo(
    () => ({
      open: INCIDENT_OPEN_BASE_30.slice(-incidentTrendWindow),
      closed: INCIDENT_CLOSED_BASE_30.slice(-incidentTrendWindow),
    }),
    [incidentTrendWindow],
  )
  const alertLabels = useMemo(() => getLastNDaysLabels(alertTrendWindow), [alertTrendWindow])
  const incidentLabels = useMemo(() => getLastNDaysLabels(incidentTrendWindow), [incidentTrendWindow])

  const baseLineOptions: ChartOptions<'line'> = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: { intersect: false, mode: 'index' },
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true, backgroundColor: '#0f172a', borderColor: '#334155', borderWidth: 1 },
    },
    elements: {
      line: { tension: 0.35, borderWidth: 2 },
      point: { radius: 0, hoverRadius: 3 },
    },
    scales: {
      x: { display: false, grid: { display: false } },
      y: {
        display: false,
        grid: { color: 'rgba(148,163,184,0.25)', drawBorder: false },
      },
    },
  }), [])

  const alertLineData: ChartData<'line'> = useMemo(() => ({
    labels: alertLabels,
    datasets: [
      {
        data: alertWindowSeries,
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37,99,235,0.2)',
        fill: true,
      },
    ],
  }), [alertLabels, alertWindowSeries])

  const blockedLineData: ChartData<'line'> = useMemo(() => ({
    labels: blockedWindowSeries.map((_, i) => String(i).padStart(2, '0')),
    datasets: [
      {
        data: blockedWindowSeries,
        borderColor: '#16a34a',
        backgroundColor: 'rgba(22,163,74,0.22)',
        fill: true,
      },
    ],
  }), [blockedWindowSeries])

  const blockedLineOptions: ChartOptions<'line'> = useMemo(() => ({
    ...baseLineOptions,
    plugins: {
      ...baseLineOptions.plugins,
      tooltip: { enabled: false },
    },
  }), [baseLineOptions])

  const incidentsLineData: ChartData<'line'> = useMemo(() => ({
    labels: incidentLabels,
    datasets: [
      { data: incidentWindowSeries.open, borderColor: '#f97316', backgroundColor: 'rgba(249,115,22,0.15)', fill: false },
      { data: incidentWindowSeries.closed, borderColor: '#16a34a', backgroundColor: 'rgba(22,163,74,0.15)', fill: false },
    ],
  }), [incidentLabels, incidentWindowSeries])

  const servicesGaugeData: ChartData<'doughnut'> = useMemo(() => ({
    labels: ['Impacted', 'Healthy'],
    datasets: [
      {
        data: [impactedServices, 27 - impactedServices],
        backgroundColor: ['#f97316', 'rgba(148,163,184,0.25)'],
        borderWidth: 0,
        hoverOffset: 0,
        circumference: 180,
        rotation: 270,
        cutout: '78%',
      },
    ],
  }), [impactedServices])

  const servicesGaugeOptions: ChartOptions<'doughnut'> = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: 0 },
    events: [],
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
  }), [])

  return (
    <OverviewPageShell>
      <OverviewPageHeader
        section="SOC OPERATIONS"
        title="Security Operations Center"
        description={`Live posture and incident command board · ${dateStr} · ${timeStr}`}
        actions={[
          { id: 'export', label: 'Export Report', variant: 'secondary', onClick: () => setExportOpen(true) },
          { id: 'new-incident', label: '+ New Incident', variant: 'primary', onClick: () => setNewIncidentOpen(true) },
        ]}
      />

      {actionNote ? (
        <div className="mb-4">
          <OverviewAlert tone="success" title={actionNote} />
        </div>
      ) : null}

      <div className="mb-5 space-y-3">
        {showCriticalBanner ? (
          <div
            className="flex w-full items-start justify-between gap-4 rounded-lg border px-4 py-3"
            style={{
              borderColor: criticalCount > 0 ? 'var(--soc-critical)' : 'var(--soc-low)',
              backgroundColor: criticalCount > 0 ? 'var(--soc-critical-bg)' : 'var(--soc-low-bg)',
            }}
          >
            <div>
              <p className="text-sm font-semibold" style={{ color: criticalCount > 0 ? 'var(--soc-critical)' : 'var(--soc-low)' }}>
                {criticalCount > 0 ? `${criticalCount} critical incidents require immediate attention` : 'No critical incidents detected'}
              </p>
              <p className="mt-1 text-xs" style={{ color: 'var(--soc-text-secondary)' }}>
                {`${openCount} open incidents · 2,341 threats blocked today · MTTR 3.8h`}
              </p>
            </div>
            <button
              type="button"
              className="shrink-0 rounded p-1 text-sm leading-none transition-colors hover:bg-black/5"
              aria-label="Dismiss critical incidents banner"
              onClick={() => setShowCriticalBanner(false)}
              style={{ color: criticalCount > 0 ? 'var(--soc-critical)' : 'var(--soc-low)' }}
            >
              ×
            </button>
          </div>
        ) : null}

        {showIntegrationBanner ? (
          <div
            className="flex w-full items-start justify-between gap-4 rounded-lg border px-4 py-3"
            style={{ borderColor: 'var(--soc-medium)', backgroundColor: 'var(--soc-medium-bg)' }}
          >
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--soc-medium)' }}>
                Attention: integration quality checks pending
              </p>
              <p className="mt-1 text-xs" style={{ color: 'var(--soc-text-secondary)' }}>
                FortiGate latency and Nessus reconnect require owner action.
              </p>
            </div>
            <button
              type="button"
              className="shrink-0 rounded p-1 text-sm leading-none transition-colors hover:bg-black/5"
              aria-label="Dismiss integration quality banner"
              onClick={() => setShowIntegrationBanner(false)}
              style={{ color: 'var(--soc-medium)' }}
            >
              ×
            </button>
          </div>
        ) : null}
      </div>

      <div className="mb-5 grid grid-cols-12 gap-3">
        <div className="soc-card col-span-12 lg:col-span-6" title="Estimated quarterly financial impact avoided by current detections and containment.">
          <p className="soc-label mb-2">EXECUTIVE EXPOSURE</p>
          <p className="soc-metric-lg" style={{ color: 'var(--soc-text)' }}>$2.8M</p>
          <p className="mt-1 text-xs" style={{ color: 'var(--soc-text-muted)' }}>
            Estimated loss prevented this quarter · based on blocked threat classes and historical response costs.
          </p>
        </div>
        <div className="col-span-12 sm:col-span-6 lg:col-span-6">
          <OverviewSection title="BOARD RISK FLAGS">
            <div className="space-y-2 px-4 py-3">
              <div className="flex items-center justify-between" title="Frameworks not fully compliant and requiring executive attention.">
                <span className="text-xs" style={{ color: 'var(--soc-text-secondary)' }}>Regulatory gaps</span>
                <span className="text-xs font-semibold" style={{ color: 'var(--soc-critical)' }}>2 frameworks</span>
              </div>
              <div className="flex items-center justify-between" title="Vendors with degraded or failed telemetry impacting governance reporting.">
                <span className="text-xs" style={{ color: 'var(--soc-text-secondary)' }}>Third-party risk</span>
                <span className="text-xs font-semibold" style={{ color: 'var(--soc-medium)' }}>4 vendors</span>
              </div>
              <div className="flex items-center justify-between" title="Executive SLA commitment adherence for incident response timelines.">
                <span className="text-xs" style={{ color: 'var(--soc-text-secondary)' }}>SLA commitment</span>
                <span className="text-xs font-semibold" style={{ color: 'var(--soc-low)' }}>91% met</span>
              </div>
            </div>
          </OverviewSection>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-12 gap-4">
        <div className="col-span-12 min-w-0 sm:col-span-6 xl:col-span-3 h-full [&>div]:h-full">
          <OverviewSection
            title="ALERT TREND"
            headerClassName="pt-0"
            right={(
              <div className="flex h-8 items-center">
                <div className="shrink-0">
                  <OverviewRowsPerPageMenu
                    label=""
                    value={alertTrendWindow}
                    options={[7, 14, 30]}
                    onChange={(n) => setAlertTrendWindow(n as 7 | 14 | 30)}
                    optionLabel={(n) => `${n}d`}
                    compact
                  />
                </div>
              </div>
            )}
          >
            <div className="flex flex-col px-4 py-3">
              <div className="rounded-md border p-2" style={{ borderColor: 'var(--soc-border)', backgroundColor: 'var(--soc-raised)' }}>
                <div className="h-[88px] w-full">
                  <Line data={alertLineData} options={baseLineOptions} />
                </div>
                <div className="mt-2 flex items-center gap-3 text-[11px]">
                  <span className="inline-flex items-center gap-1" style={{ color: 'var(--soc-text-muted)' }}>
                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: '#2563eb' }} />
                    Ingested alerts
                  </span>
                </div>
              </div>
            </div>
          </OverviewSection>
        </div>

        <div className="col-span-12 min-w-0 sm:col-span-6 xl:col-span-3 h-full [&>div]:h-full">
          <OverviewSection
            title="BLOCKED TODAY"
            headerClassName="pt-0"
            right={(
              <div className="flex h-8 items-center">
                <span
                  className="inline-flex h-8 items-center text-xs font-semibold tabular-nums"
                  style={{ color: blockedDelta >= 0 ? 'var(--soc-low)' : 'var(--soc-critical)' }}
                >
                  {blockedWindowSeries[blockedWindowSeries.length - 1].toLocaleString()} {blockedDelta >= 0 ? '↑' : '↓'}
                </span>
              </div>
            )}
          >
            <div className="flex flex-col px-4 py-3">
              <div className="rounded-md border p-2" style={{ borderColor: 'var(--soc-border)', backgroundColor: 'var(--soc-raised)' }}>
                <div className="h-[88px] w-full">
                  <Line data={blockedLineData} options={blockedLineOptions} />
                </div>
              </div>
              <p className="pt-2 text-[11px]" style={{ color: 'var(--soc-text-muted)' }}>
                Peak blocking window: 14:00-16:00 UTC
              </p>
            </div>
          </OverviewSection>
        </div>

        <div className="col-span-12 min-w-0 sm:col-span-6 xl:col-span-3 h-full [&>div]:h-full">
          <OverviewSection
            title="INCIDENTS"
            headerClassName="pt-0"
            right={(
              <div className="flex h-8 items-center">
                <div className="shrink-0">
                  <OverviewRowsPerPageMenu
                    label=""
                    value={incidentTrendWindow}
                    options={[7, 14, 30]}
                    onChange={(n) => setIncidentTrendWindow(n as 7 | 14 | 30)}
                    optionLabel={(n) => `${n}d`}
                    compact
                  />
                </div>
              </div>
            )}
          >
            <div className="flex flex-col px-4 py-3">
              <div className="rounded-md border p-2" style={{ borderColor: 'var(--soc-border)', backgroundColor: 'var(--soc-raised)' }}>
                <div className="h-[88px] w-full">
                  <Line data={incidentsLineData} options={baseLineOptions} />
                </div>
                <div className="mt-2 flex items-center gap-3 text-[11px]">
                  <span className="inline-flex items-center gap-1" style={{ color: 'var(--soc-text-muted)' }}>
                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: '#f97316' }} />
                    Open
                  </span>
                  <span className="inline-flex items-center gap-1" style={{ color: 'var(--soc-text-muted)' }}>
                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: '#16a34a' }} />
                    Closed
                  </span>
                </div>
              </div>
            </div>
          </OverviewSection>
        </div>

        <div className="col-span-12 min-w-0 sm:col-span-6 xl:col-span-3 h-full [&>div]:h-full">
          <OverviewSection
            title="SERVICES IMPACTED"
            headerClassName="pt-0"
            right={<div className="h-8 w-[4.5rem]" aria-hidden />}
          >
            <div className="flex min-w-0 flex-col px-4 py-3">
              <div
                className="min-w-0 overflow-hidden rounded-md border p-2"
                style={{ borderColor: 'var(--soc-border)', backgroundColor: 'var(--soc-raised)' }}
              >
                <div className="relative mx-auto aspect-[190/120] w-full min-w-0 max-w-[190px]">
                  <Doughnut data={servicesGaugeData} options={servicesGaugeOptions} />
                  <div className="pointer-events-none absolute inset-0 flex items-end justify-center pb-[10%]">
                    <p className="text-base font-semibold tabular-nums" style={{ color: 'var(--soc-text)' }}>
                      {impactedServices}/27
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </OverviewSection>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-8 space-y-4">
          <OverviewSection
            title="INCIDENT COMMAND BOARD"
            flush
            right={(
              <a href="/overview/incidents" className="soc-link text-xs font-medium">
                View all →
              </a>
            )}
          >
            <table className="soc-table" style={{ tableLayout: 'fixed', width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ width: '6px', padding: 0 }} />
                  <th style={{ width: '17%' }}>ID</th>
                  <th style={{ width: '38%' }}>Incident</th>
                  <th style={{ width: '14%' }}>Severity</th>
                  <th style={{ width: '16%' }}>Status</th>
                  <th className="text-right" style={{ width: '15%' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {latestIncidents.map((inc) => (
                  <tr key={inc.id}>
                    <td style={{ padding: 0 }}>
                      <div style={{ width: '3px', height: '100%', minHeight: '2.75rem', backgroundColor: SEVERITY_STYLE[inc.severity].tone }} />
                    </td>
                    <td>
                      <p className="text-xs font-mono" style={{ color: 'var(--soc-text-muted)' }}>{inc.id}</p>
                      <p className="text-xs" style={{ color: 'var(--soc-text-secondary)' }}>{inc.detectedAt}</p>
                    </td>
                    <td>
                      <p className="text-sm font-semibold" style={{ color: 'var(--soc-text)' }}>{inc.title}</p>
                      <p className="text-xs" style={{ color: 'var(--soc-text-muted)' }}>
                        {inc.category} · {inc.affectedAssets} assets · {inc.assignedTo}
                      </p>
                    </td>
                    <td>
                      <span className="soc-badge" style={{ backgroundColor: SEVERITY_STYLE[inc.severity].bg, color: SEVERITY_STYLE[inc.severity].tone }}>
                        {inc.severity.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <span className="soc-badge" style={{ backgroundColor: STATUS_TO_DISPLAY[inc.status].bg, color: STATUS_TO_DISPLAY[inc.status].tone }}>
                        {STATUS_TO_DISPLAY[inc.status].label}
                      </span>
                    </td>
                    <td className="text-right">
                      <button type="button" className="soc-btn soc-btn-secondary text-xs" onClick={() => setSelectedIncident(inc)}>
                        Investigate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </OverviewSection>

          <OverviewSection title="TEAM PERFORMANCE" flush right={<span className="text-xs" style={{ color: 'var(--soc-text-muted)' }}>Today</span>}>
            <table className="soc-table">
              <thead>
                <tr>
                  <th>Analyst</th>
                  <th className="text-center">Assigned</th>
                  <th className="text-center">Resolved</th>
                  <th className="text-right">MTTR</th>
                </tr>
              </thead>
              <tbody>
                {TEAM_ACTIVITY.map((a) => (
                  <tr key={a.analyst}>
                    <td>
                      <p className="text-sm font-medium" style={{ color: 'var(--soc-text)' }}>{a.analyst}</p>
                      <p className="text-xs" style={{ color: 'var(--soc-text-muted)' }}>{a.role}</p>
                    </td>
                    <td className="text-center"><span className="text-sm tabular-nums font-semibold" style={{ color: 'var(--soc-text)' }}>{a.assigned}</span></td>
                    <td className="text-center"><span className="text-sm tabular-nums font-semibold" style={{ color: 'var(--soc-low)' }}>{a.resolved}</span></td>
                    <td className="text-right"><span className="text-sm tabular-nums font-mono" style={{ color: 'var(--soc-text-secondary)' }}>{a.mttr}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </OverviewSection>
        
          <OverviewSection title="INTEGRATIONS">
            <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
              {INTEGRATIONS.map((integration) => (
                <OverviewIntegrationTile
                  key={integration.id}
                  title={integration.name}
                  subtitle={integration.subtitle}
                  icon={
                    <span className="text-[0.65rem] font-semibold tracking-tight" aria-hidden>
                      {integration.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
                    </span>
                  }
                  iconBackground={integration.status === 'connected' ? 'var(--soc-accent)' : integration.status === 'warning' ? 'var(--soc-medium)' : 'var(--soc-critical)'}
                  statusLabel={integration.status === 'connected' ? 'Connected' : integration.status === 'warning' ? 'Warning' : 'Error'}
                  statusColor={integration.status === 'connected' ? 'var(--soc-low)' : integration.status === 'warning' ? 'var(--soc-medium)' : 'var(--soc-critical)'}
                  kpiLeft={{ label: 'Events', value: integration.events }}
                  kpiRight={{ label: 'Health', value: integration.status === 'connected' ? '100%' : integration.status === 'warning' ? '72%' : '24%' }}
                  regions={integration.regions}
                  alerts={{ critical: integration.critical, high: integration.high, medium: integration.medium }}
                  footerMeta={`Last sync: ${integration.lastSync}`}
                  footerAction={
                    <button type="button" className="soc-link text-xs font-medium" onClick={() => setSelectedIntegration(integration)}>
                      Configure →
                    </button>
                  }
                />
              ))}
            </div>
          </OverviewSection>
        </div>

        <div className="col-span-12 lg:col-span-4 space-y-4">
          <OverviewSection title="RISK SCORECARD" right={<span className="text-xs" style={{ color: 'var(--soc-text-muted)' }}>Composite</span>}>
            <div className="space-y-3 px-4 py-3">
              <div className="flex items-center gap-3">
                <svg viewBox="8 18 104 58" className="h-auto w-full max-w-[150px]">
                  <title>{`Risk posture gauge, current score ${overallRisk}.`}</title>
                  <path d="M 14 70 A 46 46 0 0 1 106 70" fill="none" stroke="var(--soc-border)" strokeWidth="8" strokeLinecap="round" pathLength={100} />
                  <path d="M 14 70 A 46 46 0 0 1 106 70" fill="none" stroke="var(--soc-medium)" strokeWidth="8" strokeLinecap="round" pathLength={100} strokeDasharray={`${overallRisk} ${100 - overallRisk}`} />
                  <text x="60" y="54" textAnchor="middle" dominantBaseline="central" style={{ fontSize: '22px', fontWeight: 700, fill: 'var(--soc-text)' }}>
                    {overallRisk}
                  </text>
                </svg>
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--soc-text)' }}>{riskLabel} risk</p>
                  <p className="text-xs" style={{ color: 'var(--soc-text-muted)' }} title="Week-over-week change for aggregate risk score.">Weekly delta: -2 pts</p>
                </div>
              </div>
              <div className="space-y-2">
                {RISK_DIMENSIONS.map(({ label, score, delta }) => (
                  <div key={label} title={`${label}: score ${score}, trend ${trendText(delta)}`}>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-xs" style={{ color: 'var(--soc-text-secondary)' }}>{label}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs tabular-nums" style={{ color: 'var(--soc-text-muted)' }}>
                          {score}%
                        </span>
                        {trendIcon(delta)}
                      </div>
                    </div>
                    <OverviewProgressBar value={score} showValue={false} color={score >= 80 ? 'var(--soc-low)' : score >= 65 ? 'var(--soc-medium)' : 'var(--soc-critical)'} />
                  </div>
                ))}
              </div>
            </div>
          </OverviewSection>

          <OverviewSection title="COMPLIANCE STANDARDS">
            <div className="space-y-3">
              {COMPLIANCE.map((framework) => (
                <OverviewComplianceTile
                  key={framework.name}
                  title={framework.name}
                  auditLine={`Trend ${framework.delta} · latest control check`}
                  scorePercent={framework.score}
                  statusLabel={framework.statusLabel}
                  statusVariant={framework.statusVariant}
                  breakdown={framework.breakdown}
                  footerMeta={`Score ${framework.score}%`}
                  footerAction={(
                    <button type="button" className="soc-link text-xs font-medium" onClick={() => setSelectedFramework(framework)}>
                      Open framework →
                    </button>
                  )}
                />
              ))}
            </div>
          </OverviewSection>

          <OverviewSection title="GLOBAL THREAT ACTIVITY" right={<span className="text-xs" style={{ color: 'var(--soc-text-muted)' }}>Last 24 hours</span>}>
            <div className="relative" style={{ height: '180px', backgroundColor: 'var(--soc-raised)' }}>
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 180" fill="none" style={{ opacity: 0.06 }}>
                {Array.from({ length: 21 }).map((_, i) => (
                  <line key={`v${i}`} x1={i * 40} y1="0" x2={i * 40} y2="180" stroke="currentColor" strokeWidth="1" />
                ))}
                {Array.from({ length: 5 }).map((_, i) => (
                  <line key={`h${i}`} x1="0" y1={i * 45} x2="800" y2={i * 45} stroke="currentColor" strokeWidth="1" />
                ))}
              </svg>
              {[
                { x: '72%', y: '35%', color: 'var(--soc-critical)', size: 7, label: 'RU' },
                { x: '80%', y: '40%', color: 'var(--soc-high)', size: 5, label: 'CN' },
                { x: '22%', y: '30%', color: 'var(--soc-medium)', size: 6, label: 'US' },
                { x: '55%', y: '62%', color: 'var(--soc-high)', size: 4, label: 'BR' },
                { x: '62%', y: '28%', color: 'var(--soc-medium)', size: 5, label: 'IR' },
                { x: '48%', y: '25%', color: 'var(--soc-low)', size: 3, label: 'DE' },
              ].map(({ x, y, color, size, label }) => (
                <div key={label} className="absolute flex flex-col items-center gap-0.5" style={{ left: x, top: y, transform: 'translate(-50%, -50%)' }} title={`Threat origin marker: ${label}`}>
                  <div className="rounded-full animate-pulse" style={{ width: size * 2, height: size * 2, backgroundColor: color, boxShadow: `0 0 ${size * 3}px ${color}60` }} />
                  <span style={{ fontSize: '9px', fontWeight: 700, color }}>{label}</span>
                </div>
              ))}
              <div className="absolute bottom-3 left-4">
                <p className="text-xs" style={{ color: 'var(--soc-text-secondary)' }}>14 attack origins · 6 countries · 2,341 blocked</p>
              </div>
            </div>
          </OverviewSection>
        </div>
      </div>

      {/* ── Incident detail modal ── */}
      <OverviewModal
        open={!!selectedIncident}
        title={selectedIncident?.title ?? ''}
        subtitle={selectedIncident?.id}
        onClose={() => setSelectedIncident(null)}
        maxWidth="max-w-xl"
        footer={(
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs" style={{ color: 'var(--soc-text-muted)' }}>
              Detected {selectedIncident?.detectedAt} · {selectedIncident?.detectedDate}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                className="soc-btn soc-btn-secondary text-xs"
                onClick={() => {
                  if (!selectedIncident) return
                  setActionNote(`Escalation queued for ${selectedIncident.id}.`)
                  setSelectedIncident(null)
                }}
              >
                Escalate to Tier 2
              </button>
              <button type="button" className="soc-btn soc-btn-primary text-xs" onClick={() => setSelectedIncident(null)}>
                Acknowledge
              </button>
            </div>
          </div>
        )}
      >
        {selectedIncident ? (
          <div className="space-y-5">
            {/* Status row */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="soc-badge" style={{ backgroundColor: SEVERITY_STYLE[selectedIncident.severity].bg, color: SEVERITY_STYLE[selectedIncident.severity].tone }}>
                {selectedIncident.severity.toUpperCase()}
              </span>
              <span className="soc-badge" style={{ backgroundColor: STATUS_TO_DISPLAY[selectedIncident.status].bg, color: STATUS_TO_DISPLAY[selectedIncident.status].tone }}>
                {STATUS_TO_DISPLAY[selectedIncident.status].label}
              </span>
              <span className="soc-badge" style={{ backgroundColor: 'var(--soc-overlay)', color: 'var(--soc-text-secondary)' }}>
                {selectedIncident.category}
              </span>
            </div>

            {/* Metadata grid */}
            <div className="grid grid-cols-3 gap-px rounded-lg overflow-hidden" style={{ border: '1px solid var(--soc-border)', backgroundColor: 'var(--soc-border)' }}>
              {[
                { label: 'Assigned to', value: selectedIncident.assignedTo },
                { label: 'Affected assets', value: `${selectedIncident.affectedAssets} endpoint${selectedIncident.affectedAssets !== 1 ? 's' : ''}` },
                { label: 'Detected', value: selectedIncident.detectedAt },
              ].map(({ label, value }) => (
                <div key={label} className="flex flex-col gap-1 px-4 py-3" style={{ backgroundColor: 'var(--soc-surface)' }}>
                  <span className="soc-label">{label}</span>
                  <span className="text-sm font-semibold" style={{ color: 'var(--soc-text)' }}>{value}</span>
                </div>
              ))}
            </div>

            {/* Recommended actions */}
            <div>
              <p className="soc-label mb-3">Recommended response</p>
              <div className="space-y-2">
                {[
                  { step: '01', action: 'Isolate affected endpoints from the network', done: false },
                  { step: '02', action: 'Rotate credentials for all impacted identities', done: false },
                  { step: '03', action: 'Collect forensic timeline from detection source', done: false },
                  { step: '04', action: 'Notify stakeholders per comms playbook', done: false },
                ].map(({ step, action }) => (
                  <div key={step} className="flex items-start gap-3 rounded-md px-3 py-2.5" style={{ backgroundColor: 'var(--soc-raised)', border: '1px solid var(--soc-border)' }}>
                    <span className="mt-0.5 shrink-0 text-[10px] font-bold tabular-nums" style={{ color: 'var(--soc-text-muted)' }}>{step}</span>
                    <span className="text-xs" style={{ color: 'var(--soc-text-secondary)' }}>{action}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Playbook + SLA */}
            <div className="flex flex-wrap gap-4 rounded-md px-4 py-3" style={{ backgroundColor: 'var(--soc-accent-bg)', border: '1px solid var(--soc-accent)' }}>
              <div>
                <p className="soc-label mb-0.5">Suggested playbook</p>
                <p className="text-xs font-medium" style={{ color: 'var(--soc-accent-text)' }}>Identity compromise response</p>
              </div>
              <div>
                <p className="soc-label mb-0.5">Response SLA</p>
                <p className="text-xs font-medium" style={{ color: 'var(--soc-accent-text)' }}>30 minutes</p>
              </div>
              <div>
                <p className="soc-label mb-0.5">Source</p>
                <p className="text-xs font-medium" style={{ color: 'var(--soc-accent-text)' }}>CrowdStrike Falcon</p>
              </div>
            </div>
          </div>
        ) : null}
      </OverviewModal>

      {/* ── Export modal ── */}
      <OverviewModal
        open={exportOpen}
        title="Export SOC report"
        subtitle="REPORT ACTION"
        onClose={() => setExportOpen(false)}
        maxWidth="max-w-xl"
        footer={(
          <div className="flex justify-end gap-2">
            <button type="button" className="soc-btn soc-btn-secondary text-xs" onClick={() => setExportOpen(false)}>
              Cancel
            </button>
            <button
              type="button"
              className="soc-btn soc-btn-primary text-xs"
              onClick={() => {
                const sectionList = Object.entries(exportSections).filter(([, v]) => v).map(([k]) => k).join(', ')
                setActionNote(`Report queued — ${exportFormat.toUpperCase()}, ${exportDateRange}, sections: ${sectionList}.`)
                setExportOpen(false)
              }}
            >
              Generate report
            </button>
          </div>
        )}
      >
        <div className="space-y-5">
          {/* Format */}
          <div>
            <p className="soc-label mb-2">Format</p>
            <div className="flex gap-2">
              {(['pdf', 'csv', 'json'] as const).map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => setExportFormat(fmt as 'pdf' | 'csv')}
                  className="soc-btn text-xs"
                  style={{
                    borderColor: exportFormat === fmt ? 'var(--soc-accent)' : 'var(--soc-border-mid)',
                    backgroundColor: exportFormat === fmt ? 'var(--soc-accent-bg)' : 'transparent',
                    color: exportFormat === fmt ? 'var(--soc-accent-text)' : 'var(--soc-text-secondary)',
                    fontWeight: exportFormat === fmt ? 600 : 400,
                  }}
                >
                  {fmt.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Date range */}
          <div>
            <p className="soc-label mb-2">Date range</p>
            <div className="flex gap-2">
              {([['7d', 'Last 7 days'], ['30d', 'Last 30 days'], ['90d', 'Last 90 days']] as const).map(([val, label]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setExportDateRange(val)}
                  className="soc-btn text-xs"
                  style={{
                    borderColor: exportDateRange === val ? 'var(--soc-accent)' : 'var(--soc-border-mid)',
                    backgroundColor: exportDateRange === val ? 'var(--soc-accent-bg)' : 'transparent',
                    color: exportDateRange === val ? 'var(--soc-accent-text)' : 'var(--soc-text-secondary)',
                    fontWeight: exportDateRange === val ? 600 : 400,
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Sections */}
          <div>
            <p className="soc-label mb-2">Sections to include</p>
            <div className="grid grid-cols-2 gap-1.5">
              {([
                ['incidents', 'Incidents & alerts'],
                ['vulnerabilities', 'Vulnerability report'],
                ['compliance', 'Compliance summary'],
                ['team', 'Team activity log'],
                ['rawEvents', 'Raw event appendix'],
              ] as const).map(([key, label]) => (
                <label
                  key={key}
                  className="flex cursor-pointer items-center gap-2.5 rounded-md px-3 py-2 text-xs transition-colors"
                  style={{
                    border: '1px solid var(--soc-border)',
                    backgroundColor: exportSections[key] ? 'var(--soc-accent-bg)' : 'var(--soc-raised)',
                    color: exportSections[key] ? 'var(--soc-text)' : 'var(--soc-text-secondary)',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={exportSections[key]}
                    onChange={(e) => setExportSections((s) => ({ ...s, [key]: e.target.checked }))}
                    className="h-3.5 w-3.5 shrink-0 accent-[color:var(--soc-accent)]"
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>

          {/* Delivery */}
          <div className="flex items-center justify-between rounded-md px-4 py-3" style={{ backgroundColor: 'var(--soc-raised)', border: '1px solid var(--soc-border)' }}>
            <div>
              <p className="soc-label mb-0.5">Delivery method</p>
              <p className="text-xs" style={{ color: 'var(--soc-text-secondary)' }}>
                {exportDelivery === 'download' ? 'File will be downloaded immediately' : 'Sent to your registered email'}
              </p>
            </div>
            <div className="flex gap-2">
              {(['download', 'email'] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setExportDelivery(d)}
                  className="soc-btn text-xs capitalize"
                  style={{
                    borderColor: exportDelivery === d ? 'var(--soc-accent)' : 'var(--soc-border-mid)',
                    backgroundColor: exportDelivery === d ? 'var(--soc-accent-bg)' : 'transparent',
                    color: exportDelivery === d ? 'var(--soc-accent-text)' : 'var(--soc-text-secondary)',
                  }}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>
      </OverviewModal>

      {/* ── Integration modal (2-step) ── */}
      <OverviewStepModal
        open={!!selectedIntegration}
        subtitle="INTEGRATION"
        currentStep={integrationStep}
        onStepChange={setIntegrationStep}
        maxWidth="max-w-2xl"
        onClose={() => { setSelectedIntegration(null); setIntegrationStep(0) }}
        onFinish={() => {
          if (!selectedIntegration) return
          setActionNote(`Health check started for ${selectedIntegration.name}.`)
          setSelectedIntegration(null)
          setIntegrationStep(0)
        }}
        steps={selectedIntegration ? [
          {
            id: 'health',
            title: `Step 1: ${selectedIntegration.name}`,
            content: (
              <div className="space-y-5">
                {/* Connection status */}
                <div className="flex items-center gap-3 rounded-lg px-4 py-3" style={{
                  backgroundColor: selectedIntegration.status === 'connected' ? 'var(--soc-low-bg)' : selectedIntegration.status === 'warning' ? 'var(--soc-medium-bg)' : 'var(--soc-critical-bg)',
                  border: `1px solid ${selectedIntegration.status === 'connected' ? 'var(--soc-low)' : selectedIntegration.status === 'warning' ? 'var(--soc-medium)' : 'var(--soc-critical)'}`,
                }}>
                  <span className="soc-dot shrink-0" style={{ backgroundColor: selectedIntegration.status === 'connected' ? 'var(--soc-low)' : selectedIntegration.status === 'warning' ? 'var(--soc-medium)' : 'var(--soc-critical)' }} />
                  <div>
                    <p className="text-xs font-semibold" style={{ color: 'var(--soc-text)' }}>
                      {selectedIntegration.status === 'connected' ? 'Connected — operating normally' : selectedIntegration.status === 'warning' ? 'Warning — degraded performance' : 'Error — connection lost'}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--soc-text-secondary)' }}>{selectedIntegration.subtitle}</p>
                  </div>
                </div>

                {/* Metrics grid */}
                <div className="grid grid-cols-3 gap-px rounded-lg overflow-hidden" style={{ border: '1px solid var(--soc-border)', backgroundColor: 'var(--soc-border)' }}>
                  {[
                    { label: 'Throughput', value: selectedIntegration.events },
                    { label: 'Last sync', value: selectedIntegration.lastSync },
                    { label: 'Regions', value: (selectedIntegration.regions ?? []).length.toString() },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex flex-col gap-1 px-4 py-3" style={{ backgroundColor: 'var(--soc-surface)' }}>
                      <span className="soc-label">{label}</span>
                      <span className="text-sm font-semibold tabular-nums" style={{ color: 'var(--soc-text)' }}>{value}</span>
                    </div>
                  ))}
                </div>

                {/* Alert activity */}
                <div>
                  <p className="soc-label mb-2">Alert activity (30d)</p>
                  <div className="flex gap-3">
                    {[
                      { label: 'Critical', count: selectedIntegration.critical, color: 'var(--soc-critical)', bg: 'var(--soc-critical-bg)' },
                      { label: 'High', count: selectedIntegration.high, color: 'var(--soc-high)', bg: 'var(--soc-high-bg)' },
                      { label: 'Medium', count: selectedIntegration.medium, color: 'var(--soc-medium)', bg: 'var(--soc-medium-bg)' },
                    ].map(({ label, count, color, bg }) => (
                      <div key={label} className="flex-1 rounded-md px-3 py-2.5 text-center" style={{ backgroundColor: bg, border: `1px solid ${color}` }}>
                        <p className="text-lg font-bold tabular-nums" style={{ color }}>{count}</p>
                        <p className="text-[10px] font-semibold uppercase tracking-wide mt-0.5" style={{ color }}>{label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Active regions */}
                {(selectedIntegration.regions ?? []).length > 0 && (
                  <div>
                    <p className="soc-label mb-2">Active regions</p>
                    <div className="flex flex-wrap gap-1.5">
                      {(selectedIntegration.regions ?? []).map((r) => (
                        <span key={r} className="rounded-md px-2.5 py-1 text-xs font-medium" style={{ backgroundColor: 'var(--soc-overlay)', border: '1px solid var(--soc-border)', color: 'var(--soc-text-secondary)' }}>{r}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ),
          },
          {
            id: 'configure',
            title: 'Step 2: Configuration',
            content: (
              <div className="space-y-5">
                {/* Alert thresholds */}
                <div>
                  <p className="soc-label mb-3">Alert thresholds</p>
                  <div className="space-y-2">
                    <OverviewToggle label="Page on-call for critical alerts" checked={integrationPageCritical} onChange={setIntegrationPageCritical} />
                    <OverviewToggle label="Auto-escalate high alerts after 30 min" checked={integrationEscalateHigh} onChange={setIntegrationEscalateHigh} />
                    <OverviewToggle label="Suppress duplicate events within 5 min window" checked={integrationSuppressDupes} onChange={setIntegrationSuppressDupes} />
                  </div>
                </div>

                {/* Sync settings */}
                <div>
                  <p className="soc-label mb-2">Sync interval</p>
                  <select className="soc-input w-full text-sm" defaultValue="1m">
                    <option value="30s">Every 30 seconds</option>
                    <option value="1m">Every 1 minute</option>
                    <option value="5m">Every 5 minutes</option>
                  </select>
                </div>

                {/* Data retention */}
                <div>
                  <p className="soc-label mb-2">Data retention</p>
                  <select className="soc-input w-full text-sm" defaultValue="90">
                    <option value="30">30 days</option>
                    <option value="90">90 days</option>
                    <option value="365">1 year</option>
                  </select>
                </div>

                <div className="rounded-md px-4 py-3" style={{ backgroundColor: 'var(--soc-raised)', border: '1px solid var(--soc-border)' }}>
                  <p className="text-xs" style={{ color: 'var(--soc-text-secondary)' }}>
                    Changes apply to all regions. Running a health check will verify connectivity and refresh alert counts.
                  </p>
                </div>
              </div>
            ),
          },
        ] : [{ id: 'empty', title: '', content: null }]}
      />

      {/* ── Compliance framework modal (2-step) ── */}
      <OverviewStepModal
        open={!!selectedFramework}
        subtitle="COMPLIANCE"
        currentStep={frameworkStep}
        onStepChange={setFrameworkStep}
        maxWidth="max-w-2xl"
        onClose={() => { setSelectedFramework(null); setFrameworkStep(0) }}
        onFinish={() => {
          if (!selectedFramework) return
          setActionNote(`Control review queued for ${selectedFramework.name}.`)
          setSelectedFramework(null)
          setFrameworkStep(0)
        }}
        steps={selectedFramework ? [
          {
            id: 'overview',
            title: `Step 1: ${selectedFramework.name} overview`,
            content: (
              <div className="space-y-5">
                {/* Score + status */}
                <div className="flex items-start gap-4">
                  <div className="text-center rounded-lg px-6 py-4" style={{ backgroundColor: 'var(--soc-raised)', border: '1px solid var(--soc-border)', minWidth: 100 }}>
                    <p className="soc-metric-lg tabular-nums" style={{ color: selectedFramework.score >= 90 ? 'var(--soc-low)' : selectedFramework.score >= 75 ? 'var(--soc-medium)' : 'var(--soc-critical)' }}>
                      {selectedFramework.score}%
                    </p>
                    <p className="soc-label mt-1">Score</p>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className={`soc-badge ${selectedFramework.statusVariant === 'compliant' ? 'soc-badge-low' : selectedFramework.statusVariant === 'partial' ? 'soc-badge-medium' : 'soc-badge-critical'}`}>
                        {selectedFramework.statusLabel}
                      </span>
                      <span className="text-xs" style={{ color: 'var(--soc-text-muted)' }}>Trend: {selectedFramework.delta}</span>
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--soc-text-secondary)' }}>
                      {selectedFramework.breakdown.implemented} controls implemented out of {selectedFramework.breakdown.implemented + selectedFramework.breakdown.inProgress + selectedFramework.breakdown.notStarted} total.
                      {selectedFramework.breakdown.notStarted > 0 && ` ${selectedFramework.breakdown.notStarted} not yet started.`}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--soc-text-muted)' }}>Last audit: Jan 15, 2026 · Next audit due: Jul 15, 2026</p>
                  </div>
                </div>

                {/* Control breakdown bars */}
                <div>
                  <p className="soc-label mb-3">Control breakdown</p>
                  <div className="space-y-3">
                    {[
                      { label: 'Implemented', count: selectedFramework.breakdown.implemented, color: 'var(--soc-low)', bg: 'var(--soc-low-bg)' },
                      { label: 'In progress', count: selectedFramework.breakdown.inProgress, color: 'var(--soc-medium)', bg: 'var(--soc-medium-bg)' },
                      { label: 'Not started', count: selectedFramework.breakdown.notStarted, color: 'var(--soc-critical)', bg: 'var(--soc-critical-bg)' },
                    ].map(({ label, count, color, bg }) => {
                      const total = selectedFramework.breakdown.implemented + selectedFramework.breakdown.inProgress + selectedFramework.breakdown.notStarted
                      const pct = total > 0 ? Math.round((count / total) * 100) : 0
                      return (
                        <div key={label}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs" style={{ color: 'var(--soc-text-secondary)' }}>{label}</span>
                            <span className="text-xs font-semibold tabular-nums" style={{ color }}>{count}</span>
                          </div>
                          <div className="soc-progress-track">
                            <div className="soc-progress-fill transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Risk areas */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { area: 'Access Control', status: 'Compliant' },
                    { area: 'Data Encryption', status: selectedFramework.score < 90 ? 'Partial' : 'Compliant' },
                    { area: 'Incident Response', status: selectedFramework.score < 85 ? 'Review needed' : 'Compliant' },
                    { area: 'Vendor Management', status: selectedFramework.score < 92 ? 'Partial' : 'Compliant' },
                  ].map(({ area, status }) => (
                    <div key={area} className="flex items-center justify-between rounded-md px-3 py-2" style={{ backgroundColor: 'var(--soc-raised)', border: '1px solid var(--soc-border)' }}>
                      <span className="text-xs" style={{ color: 'var(--soc-text-secondary)' }}>{area}</span>
                      <span className="text-[10px] font-semibold" style={{ color: status === 'Compliant' ? 'var(--soc-low)' : status === 'Partial' ? 'var(--soc-medium)' : 'var(--soc-critical)' }}>{status}</span>
                    </div>
                  ))}
                </div>
              </div>
            ),
          },
          {
            id: 'review',
            title: 'Step 2: Control review',
            content: (
              <div className="space-y-5">
                <p className="text-xs" style={{ color: 'var(--soc-text-secondary)' }}>
                  Select controls to include in this review cycle. Priority items are pre-selected based on current compliance posture.
                </p>

                <div className="space-y-2">
                  {[
                    { id: 'access-mfa', label: 'Multi-factor authentication enforcement', priority: 'high', effort: '2h' },
                    { id: 'data-rest', label: 'Data encryption at rest — storage tier', priority: 'high', effort: '4h' },
                    { id: 'ir-playbook', label: 'Incident response playbook review', priority: 'medium', effort: '3h' },
                    { id: 'vendor-assess', label: 'Third-party vendor risk assessment', priority: 'medium', effort: '6h' },
                    { id: 'log-retention', label: 'Log retention policy alignment', priority: 'low', effort: '1h' },
                    { id: 'vuln-scan', label: 'Vulnerability scan schedule update', priority: 'low', effort: '1h' },
                  ].map(({ id, label, priority, effort }) => {
                    const checked = frameworkReviewChecked[id] ?? priority !== 'low'
                    return (
                      <label
                        key={id}
                        className="flex cursor-pointer items-start gap-3 rounded-md px-3 py-2.5 transition-colors"
                        style={{
                          backgroundColor: checked ? 'var(--soc-accent-bg)' : 'var(--soc-raised)',
                          border: `1px solid ${checked ? 'var(--soc-accent)' : 'var(--soc-border)'}`,
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => setFrameworkReviewChecked((s) => ({ ...s, [id]: e.target.checked }))}
                          className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-[color:var(--soc-accent)]"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs" style={{ color: 'var(--soc-text)' }}>{label}</p>
                          <p className="text-[10px] mt-0.5" style={{ color: 'var(--soc-text-muted)' }}>Est. {effort}</p>
                        </div>
                        <span
                          className="shrink-0 text-[10px] font-semibold uppercase"
                          style={{ color: priority === 'high' ? 'var(--soc-critical)' : priority === 'medium' ? 'var(--soc-medium)' : 'var(--soc-text-muted)' }}
                        >
                          {priority}
                        </span>
                      </label>
                    )
                  })}
                </div>

                <div className="flex items-center justify-between rounded-md px-4 py-3" style={{ backgroundColor: 'var(--soc-raised)', border: '1px solid var(--soc-border)' }}>
                  <span className="text-xs" style={{ color: 'var(--soc-text-secondary)' }}>
                    {Object.values(frameworkReviewChecked).filter(Boolean).length + 4} controls selected
                  </span>
                  <span className="text-xs" style={{ color: 'var(--soc-text-muted)' }}>
                    Est. total: {(Object.values(frameworkReviewChecked).filter(Boolean).length + 4) * 2}–{(Object.values(frameworkReviewChecked).filter(Boolean).length + 4) * 3}h
                  </span>
                </div>
              </div>
            ),
          },
        ] : [{ id: 'empty', title: '', content: null }]}
      />

      <OverviewStepModal
        open={newIncidentOpen}
        subtitle="INCIDENT CREATION"
        currentStep={newIncidentStep}
        onStepChange={setNewIncidentStep}
        maxWidth="max-w-4xl"
        onClose={() => {
          setNewIncidentOpen(false)
          resetNewIncidentDraft()
        }}
        onFinish={() => {
          const nextId = `INC-2026-${String(500 + incidents.length + 1)}`
          const nowIso = new Date().toISOString().slice(0, 10)
          const cleanTitle = newIncidentTitle.trim() || 'Untitled incident'
          setIncidents((prev) => [
            {
              id: nextId,
              title: cleanTitle,
              severity: newIncidentSeverity,
              status: newIncidentStatus,
              category: newIncidentCategory,
              detectedAt: 'just now',
              detectedDate: nowIso,
              assignedTo: newIncidentAssignee,
              affectedAssets: Math.max(selectedAssetDetails.length, 1),
            },
            ...prev,
          ])
          setActionNote(`New incident ${nextId} created with ${Math.max(selectedAssetDetails.length, 1)} linked asset(s).`)
          setNewIncidentOpen(false)
          resetNewIncidentDraft()
        }}
        steps={[
          {
            id: 'intake',
            title: 'Step 1: Intake details',
            canProceed: () => newIncidentTitle.trim().length > 6 && newIncidentSummary.trim().length > 20,
            validationHint: () => {
              const missing: string[] = []
              if (newIncidentTitle.trim().length <= 6) missing.push('incident title (min 7 characters)')
              if (newIncidentSummary.trim().length <= 20) missing.push('analyst summary (min 20 characters)')
              return `Required before continuing: ${missing.join(' and ')}`
            },
            content: (
              <div className="grid gap-4 lg:grid-cols-12">
                <div className="space-y-3 lg:col-span-8">
                  <label className="block text-xs font-medium" style={{ color: 'var(--soc-text-secondary)' }}>
                    Incident title
                    <input
                      className="soc-input mt-1 w-full text-sm"
                      value={newIncidentTitle}
                      onChange={(e) => setNewIncidentTitle(e.target.value)}
                      placeholder="Example: Suspicious token replay against cloud admin account"
                    />
                  </label>
                  <label className="block text-xs font-medium" style={{ color: 'var(--soc-text-secondary)' }}>
                    Analyst summary
                    <textarea
                      className="soc-input mt-1 min-h-[112px] w-full resize-y text-sm"
                      value={newIncidentSummary}
                      onChange={(e) => setNewIncidentSummary(e.target.value)}
                      placeholder="What happened, what is at risk, and what needs immediate attention?"
                    />
                  </label>
                </div>
                <div className="space-y-3 lg:col-span-4">
                  <label className="block text-xs font-medium" style={{ color: 'var(--soc-text-secondary)' }}>
                    Detection source
                    <select className="soc-input mt-1 w-full text-sm" value={newIncidentSource} onChange={(e) => setNewIncidentSource(e.target.value)}>
                      {INCIDENT_SOURCES.map((source) => (
                        <option key={source} value={source}>{source}</option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-xs font-medium" style={{ color: 'var(--soc-text-secondary)' }}>
                    Category
                    <select className="soc-input mt-1 w-full text-sm" value={newIncidentCategory} onChange={(e) => setNewIncidentCategory(e.target.value)}>
                      {INCIDENT_CATEGORIES.map((category) => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>
            ),
          },
          {
            id: 'scope',
            title: 'Step 2: Scope & assets',
            canProceed: () => newIncidentAssets.length > 0,
            validationHint: 'Select at least one impacted asset to continue',
            content: (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--soc-text-secondary)' }}>
                    Link impacted assets
                  </p>
                  <span className="soc-badge" style={{ backgroundColor: 'var(--soc-accent-bg)', color: 'var(--soc-accent)' }}>
                    {newIncidentAssets.length} selected
                  </span>
                </div>
                <div className="grid gap-2 md:grid-cols-2">
                  {INCIDENT_ASSET_CATALOG.map((asset) => {
                    const selected = newIncidentAssets.includes(asset.id)
                    return (
                      <button
                        key={asset.id}
                        type="button"
                        onClick={() => toggleIncidentAsset(asset.id)}
                        className="rounded-md border p-3 text-left transition-colors"
                        style={{
                          borderColor: selected ? 'var(--soc-accent)' : 'var(--soc-border)',
                          backgroundColor: selected ? 'var(--soc-accent-bg)' : 'var(--soc-raised)',
                        }}
                      >
                        <p className="text-sm font-semibold" style={{ color: 'var(--soc-text)' }}>{asset.label}</p>
                        <p className="mt-1 text-xs" style={{ color: 'var(--soc-text-secondary)' }}>
                          {asset.type} · Owner: {asset.owner}
                        </p>
                        <p className="mt-1 text-[11px] font-medium uppercase tracking-wide" style={{ color: 'var(--soc-text-muted)' }}>
                          Exposure: {asset.exposure}
                        </p>
                      </button>
                    )
                  })}
                </div>
              </div>
            ),
          },
          {
            id: 'classification',
            title: 'Step 3: Classification & owner',
            content: (
              <div className="grid gap-3 md:grid-cols-2">
                <label className="block text-xs font-medium" style={{ color: 'var(--soc-text-secondary)' }}>
                  Severity
                  <select className="soc-input mt-1 w-full text-sm" value={newIncidentSeverity} onChange={(e) => setNewIncidentSeverity(e.target.value as Incident['severity'])}>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </label>
                <label className="block text-xs font-medium" style={{ color: 'var(--soc-text-secondary)' }}>
                  Initial status
                  <select className="soc-input mt-1 w-full text-sm" value={newIncidentStatus} onChange={(e) => setNewIncidentStatus(e.target.value as Incident['status'])}>
                    <option value="new">New</option>
                    <option value="investigating">Investigating</option>
                    <option value="contained">Contained</option>
                  </select>
                </label>
                <label className="block text-xs font-medium" style={{ color: 'var(--soc-text-secondary)' }}>
                  Assignee
                  <select className="soc-input mt-1 w-full text-sm" value={newIncidentAssignee} onChange={(e) => setNewIncidentAssignee(e.target.value)}>
                    {INCIDENT_ASSIGNEES.map((assignee) => (
                      <option key={assignee} value={assignee}>{assignee}</option>
                    ))}
                  </select>
                </label>
                <label className="block text-xs font-medium" style={{ color: 'var(--soc-text-secondary)' }}>
                  Response window
                  <select className="soc-input mt-1 w-full text-sm" value={newIncidentPriorityWindow} onChange={(e) => setNewIncidentPriorityWindow(e.target.value)}>
                    {INCIDENT_PRIORITY_WINDOWS.map((window) => (
                      <option key={window} value={window}>{window}</option>
                    ))}
                  </select>
                </label>
                <label className="block text-xs font-medium md:col-span-2" style={{ color: 'var(--soc-text-secondary)' }}>
                  Suggested playbook
                  <select className="soc-input mt-1 w-full text-sm" value={newIncidentPlaybook} onChange={(e) => setNewIncidentPlaybook(e.target.value)}>
                    {INCIDENT_PLAYBOOKS.map((playbook) => (
                      <option key={playbook} value={playbook}>{playbook}</option>
                    ))}
                  </select>
                </label>
              </div>
            ),
          },
          {
            id: 'response',
            title: 'Step 4: Response & communications',
            canProceed: () => newIncidentContainmentPlan.trim().length > 15,
            validationHint: 'Describe the initial containment plan (min 15 characters) before continuing',
            content: (
              <div className="space-y-3">
                <label className="block text-xs font-medium" style={{ color: 'var(--soc-text-secondary)' }}>
                  Initial containment plan
                  <textarea
                    className="soc-input mt-1 min-h-[116px] w-full resize-y text-sm"
                    value={newIncidentContainmentPlan}
                    onChange={(e) => setNewIncidentContainmentPlan(e.target.value)}
                    placeholder="Example: disable suspect tokens, isolate host, rotate privileged credentials, and start timeline collection."
                  />
                </label>
                <label className="block text-xs font-medium" style={{ color: 'var(--soc-text-secondary)' }}>
                  Tags
                  <input
                    className="soc-input mt-1 w-full text-sm"
                    value={newIncidentTags}
                    onChange={(e) => setNewIncidentTags(e.target.value)}
                    placeholder="identity, cloud, lateral-movement"
                  />
                </label>
                <div className="grid gap-2 md:grid-cols-3">
                  <label className="flex items-center gap-2 rounded-md border px-3 py-2 text-xs" style={{ borderColor: 'var(--soc-border)', color: 'var(--soc-text-secondary)' }}>
                    <input type="checkbox" checked={newIncidentNotifyExec} onChange={(e) => setNewIncidentNotifyExec(e.target.checked)} />
                    Notify executive channel
                  </label>
                  <label className="flex items-center gap-2 rounded-md border px-3 py-2 text-xs" style={{ borderColor: 'var(--soc-border)', color: 'var(--soc-text-secondary)' }}>
                    <input type="checkbox" checked={newIncidentNotifyItOps} onChange={(e) => setNewIncidentNotifyItOps(e.target.checked)} />
                    Notify IT operations
                  </label>
                  <label className="flex items-center gap-2 rounded-md border px-3 py-2 text-xs" style={{ borderColor: 'var(--soc-border)', color: 'var(--soc-text-secondary)' }}>
                    <input type="checkbox" checked={newIncidentCreateWarRoom} onChange={(e) => setNewIncidentCreateWarRoom(e.target.checked)} />
                    Open war room
                  </label>
                </div>
              </div>
            ),
          },
          {
            id: 'review',
            title: 'Step 5: Review',
            content: (
              <div className="grid gap-3 lg:grid-cols-12">
                <div className="space-y-2 rounded-md border p-3 lg:col-span-8" style={{ borderColor: 'var(--soc-border)', backgroundColor: 'var(--soc-raised)' }}>
                  <p className="text-xs uppercase tracking-wide" style={{ color: 'var(--soc-text-muted)' }}>Incident draft</p>
                  <p className="text-sm font-semibold" style={{ color: 'var(--soc-text)' }}>{newIncidentTitle || 'Untitled incident'}</p>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--soc-text-secondary)' }}>{newIncidentSummary || 'No summary provided.'}</p>
                  <p className="text-xs" style={{ color: 'var(--soc-text-secondary)' }}>
                    {newIncidentCategory} · {newIncidentSeverity.toUpperCase()} · {newIncidentStatus.toUpperCase()} · Owner: {newIncidentAssignee}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--soc-text-muted)' }}>
                    Source: {newIncidentSource} · Playbook: {newIncidentPlaybook} · SLA: {newIncidentPriorityWindow}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--soc-text-muted)' }}>
                    Communications: Exec {newIncidentNotifyExec ? 'on' : 'off'} · IT Ops {newIncidentNotifyItOps ? 'on' : 'off'} · War room {newIncidentCreateWarRoom ? 'on' : 'off'}
                  </p>
                </div>
                <div className="space-y-2 rounded-md border p-3 lg:col-span-4" style={{ borderColor: 'var(--soc-border)', backgroundColor: 'var(--soc-raised)' }}>
                  <p className="text-xs uppercase tracking-wide" style={{ color: 'var(--soc-text-muted)' }}>Linked assets</p>
                  {selectedAssetDetails.length > 0 ? (
                    <ul className="space-y-1">
                      {selectedAssetDetails.map((asset) => (
                        <li key={asset.id} className="text-xs" style={{ color: 'var(--soc-text-secondary)' }}>
                          {asset.label} · {asset.type}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs" style={{ color: 'var(--soc-text-muted)' }}>No assets selected.</p>
                  )}
                  <p className="pt-2 text-xs" style={{ color: 'var(--soc-text-muted)' }}>
                    Tags: {newIncidentTags || 'none'}
                  </p>
                </div>
              </div>
            ),
          },
        ]}
      />
    </OverviewPageShell>
  )
}

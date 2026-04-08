'use client'

import { Fragment, useEffect, useMemo, useState } from 'react'
import { usePageTitle } from '@/app/page-title-context'
import {
  AdminUserTable,
  AlertTable,
  CloudIntegrationTable,
  CourseTable,
  CveTable,
  DarkWebTable,
  DeviceTable,
  DocTable,
  IncidentTable,
  IntegrationTable,
  IocTable,
  OverviewAlert,
  OverviewComplianceTile,
  OverviewDateRangeMenu,
  OverviewFilterMenu,
  OverviewIntegrationTile,
  OverviewKpiRow,
  OverviewModal,
  OverviewNestedStatCard,
  OverviewPagination,
  OverviewPageHeader,
  OverviewPageShell,
  OverviewProgressBar,
  OverviewRowsPerPageMenu,
  OverviewSection,
  OverviewStatusTile,
  OverviewStepModal,
  OverviewTableToolbar,
  OverviewToggle,
  ProcedureTable,
  RecommendationTable,
  ReportTable,
  SoftwareTable,
  ThreatActorTable,
  ThreatTable,
  TiFeedTable,
  UserTable,
  VulnRemTable,
  WeaknessTable,
} from '@/components/overview/unified-ui'
import type {
  AdminUserRow,
  AlertRow,
  CloudIntegrationRow,
  CourseRow,
  CveRow,
  DarkWebRow,
  DeviceRow,
  DocRow,
  IncidentRow,
  IntegrationRow,
  IocRow,
  ProcedureRow,
  RecommendationRow,
  ReportRow,
  SoftwareRow,
  ThreatActorRow,
  ThreatRow,
  TiFeedRow,
  UserRow,
  VulnRemRow,
  WeaknessRow,
} from '@/components/overview/unified-ui'

type RowLayout = 'standard' | 'compact' | 'rich' | 'metric'

type RowItem = {
  id: string
  title: string
  owner: string
  accountName?: string
  status: 'active' | 'review' | 'blocked'
  severity: 'critical' | 'high' | 'medium' | 'low'
  score: number
  updated: string
  updatedDate: string
  description: string
  layout?: RowLayout
  tags?: string[]
  trend?: number[]
}

const ROWS: RowItem[] = [
  { id: 'SOC-001', title: 'Identity Access Review', owner: 'Sarah Chen', accountName: 'Sarah Chen', status: 'active', severity: 'low', score: 92, updated: '10m ago', updatedDate: '2026-04-07', description: 'Quarterly access review completed for privileged identities.', layout: 'standard' },
  { id: 'SOC-002', title: 'Cloud Pipeline Health', owner: 'James Rodriguez', status: 'review', severity: 'medium', score: 78, updated: '25m ago', updatedDate: '2026-04-07', description: 'Two cloud connectors lagging due to throttling.', layout: 'compact' },
  { id: 'SOC-003', title: 'Critical Alerts Triage', owner: 'Emily Taylor', accountName: 'Emily Taylor', status: 'blocked', severity: 'critical', score: 41, updated: '1h ago', updatedDate: '2026-04-07', description: 'Three unresolved alerts require escalation.', layout: 'rich', tags: ['IR', 'Escalation', 'P1'] },
  { id: 'SOC-004', title: 'Threat Feed Validation', owner: 'Alex Petrov', status: 'active', severity: 'high', score: 88, updated: '2h ago', updatedDate: '2026-04-06', description: 'Feed quality check passed for 4 providers.', layout: 'metric', trend: [62, 70, 68, 82, 79, 85, 88] },
  { id: 'SOC-005', title: 'MFA Coverage Audit', owner: 'Nina Patel', accountName: 'Nina Patel', status: 'review', severity: 'medium', score: 73, updated: '5h ago', updatedDate: '2026-04-06', description: 'MFA gaps detected in legacy contractors group.', layout: 'standard' },
  { id: 'SOC-006', title: 'Endpoint Isolation Validation', owner: 'Michael Kim', status: 'active', severity: 'high', score: 85, updated: '6h ago', updatedDate: '2026-04-06', description: 'Isolation policy replay successful on sample endpoints.', layout: 'compact' },
  { id: 'SOC-007', title: 'Privileged Account Session Check', owner: 'Olivia Martinez', accountName: 'Olivia Martinez', status: 'blocked', severity: 'critical', score: 39, updated: '9h ago', updatedDate: '2026-04-05', description: 'Unusual admin session duration detected.', layout: 'rich', tags: ['Identity', 'UEBA', 'SOC2'] },
  { id: 'SOC-008', title: 'Network Segmentation Drift', owner: 'Daniel Park', status: 'review', severity: 'high', score: 67, updated: '12h ago', updatedDate: '2026-04-05', description: 'Two VLAN policies diverged from baseline.', layout: 'metric', trend: [55, 58, 60, 62, 64, 66, 67] },
  { id: 'SOC-009', title: 'SIEM Rule Tuning Batch', owner: 'Tom Walsh', status: 'active', severity: 'low', score: 90, updated: '1d ago', updatedDate: '2026-04-04', description: 'False-positive reduction reached target threshold.', layout: 'standard' },
  { id: 'SOC-010', title: 'Incident Closure QA', owner: 'Ryan Lee', accountName: 'Ryan Lee', status: 'review', severity: 'medium', score: 76, updated: '1d ago', updatedDate: '2026-04-04', description: 'Post-incident documentation missing two artifacts.', layout: 'compact' },
  { id: 'SOC-011', title: 'Data Loss Prevention Drift', owner: 'Aisha Johnson', status: 'blocked', severity: 'critical', score: 44, updated: '2d ago', updatedDate: '2026-04-03', description: 'DLP signatures outdated in one region.', layout: 'rich', tags: ['DLP', 'Compliance'] },
  { id: 'SOC-012', title: 'Threat Intel Source Rotation', owner: 'Zoe Brooks', status: 'active', severity: 'low', score: 94, updated: '2d ago', updatedDate: '2026-04-03', description: 'Source rotation completed, confidence improved.', layout: 'metric', trend: [80, 82, 85, 88, 90, 92, 94] },
]

const DEMO_GAUGE_SCORE = 73
/** Semicircle arc: flat base at y=70, center (60,70), r=46 — opening upward (gauge “bowl” below the arc). */
const DEMO_GAUGE_ARC_D = 'M 14 70 A 46 46 0 0 1 106 70'

const CLOUD_LOGO: Record<'aws' | 'azure' | 'gcp', string> = {
  aws: '/logos/aws.svg',
  azure: '/logos/azure.svg',
  gcp: '/logos/googlecloud.svg',
}

function CloudProviderIcon({ type }: { type: keyof typeof CLOUD_LOGO }) {
  return <img src={CLOUD_LOGO[type]} alt="" className="h-6 w-6 brightness-0 invert" />
}

function MiniSpark({ values, color }: { values: number[]; color: string }) {
  const max = Math.max(...values, 1)
  const barMaxPx = 22
  return (
    <div className="flex items-end gap-px" style={{ height: `${barMaxPx}px` }}>
      {values.map((v, i) => (
        <div
          key={i}
          title={`Sample ${i + 1}: ${v} (max ${max})`}
          style={{
            width: '3px',
            height: `${Math.max(4, Math.round((v / max) * barMaxPx))}px`,
            backgroundColor: color,
            borderRadius: '1px',
            opacity: i === values.length - 1 ? 1 : 0.45,
          }}
        />
      ))}
    </div>
  )
}

const ALERT_ROWS: AlertRow[] = [
  {
    id: 'ALT-2041',
    title: 'Impossible travel sign-in pattern',
    severity: 'high',
    source: 'Okta',
    assignee: 'Sarah Chen',
    status: 'investigating',
    firstSeen: '2026-04-07 08:12',
    lastSeen: '2m ago',
    count: 6,
    description: 'User session switched geolocation twice in under 15 minutes.',
    mitreTactic: 'Credential Access',
    mitreTechnique: 'T1078',
    affectedAssets: ['idp-gateway', 'vpn-eu-2'],
  },
  {
    id: 'ALT-2037',
    title: 'Suspicious OAuth consent grant',
    severity: 'critical',
    source: 'Microsoft Entra ID',
    assignee: 'Daniel Park',
    status: 'open',
    firstSeen: '2026-04-07 07:41',
    lastSeen: '9m ago',
    count: 3,
    description: 'High-privilege consent accepted by non-admin account from unmanaged device.',
    mitreTactic: 'Persistence',
    mitreTechnique: 'T1098',
    affectedAssets: ['entra-tenant', 'mail-gateway'],
  },
  {
    id: 'ALT-1988',
    title: 'Endpoint malware quarantine success',
    severity: 'medium',
    source: 'CrowdStrike Falcon',
    assignee: 'Alex Petrov',
    status: 'resolved',
    firstSeen: '2026-04-06 21:03',
    lastSeen: '4h ago',
    count: 11,
    description: 'Quarantine policy contained payload before execution chain completed.',
    mitreTactic: 'Execution',
    mitreTechnique: 'T1204',
    affectedAssets: ['wkstn-mkt-022'],
  },
]

const INCIDENT_ROWS: IncidentRow[] = [
  {
    id: 'INC-2026-0442',
    title: 'Privileged token replay',
    severity: 'critical',
    status: 'active',
    assignee: 'Emily Taylor',
    alertCount: 14,
    affectedSystems: 5,
    opened: '2026-04-07 09:14',
    updated: '1m ago',
    summary: 'Containment in progress while token scope and blast radius are validated.',
    tags: ['P1', 'Identity', 'SOC2'],
  },
  {
    id: 'INC-2026-0435',
    title: 'Email gateway bypass attempt',
    severity: 'high',
    status: 'triaging',
    assignee: 'Michael Kim',
    alertCount: 8,
    affectedSystems: 3,
    opened: '2026-04-07 06:50',
    updated: '14m ago',
    summary: 'Attachment detonation mismatch triggered escalation to SOC L2.',
    tags: ['Phishing', 'Mail', 'P2'],
  },
  {
    id: 'INC-2026-0412',
    title: 'Legacy VPN brute-force campaign',
    severity: 'medium',
    status: 'contained',
    assignee: 'Tom Walsh',
    alertCount: 42,
    affectedSystems: 2,
    opened: '2026-04-05 18:11',
    updated: '1d ago',
    summary: 'Rate-limit + geofence controls halted repeated auth failures.',
    tags: ['Network', 'Access'],
  },
]

const DEVICE_ROWS: DeviceRow[] = [
  {
    id: 'DEV-1192',
    hostname: 'wkstn-fin-014',
    ip: '10.24.18.41',
    os: 'Windows 11',
    platform: 'EDR',
    status: 'isolated',
    riskScore: 84,
    lastSeen: '4m ago',
    owner: 'Finance Ops',
    location: 'Tallinn',
    agentVersion: '7.11.2',
    openAlerts: 5,
    criticalVulns: 2,
    tags: ['finance', 'vip-endpoint'],
  },
  {
    id: 'DEV-1118',
    hostname: 'srv-payroll-02',
    ip: '10.24.3.14',
    os: 'Ubuntu 22.04',
    platform: 'Server',
    status: 'online',
    riskScore: 39,
    lastSeen: '40s ago',
    owner: 'Payroll Platform',
    location: 'Riga',
    agentVersion: '7.11.2',
    openAlerts: 1,
    criticalVulns: 0,
    tags: ['production', 'linux'],
  },
  {
    id: 'DEV-998',
    hostname: 'mac-design-09',
    ip: '10.33.10.90',
    os: 'macOS 14',
    platform: 'EDR',
    status: 'offline',
    riskScore: 57,
    lastSeen: '6h ago',
    owner: 'Creative Team',
    location: 'Vilnius',
    agentVersion: '7.10.9',
    openAlerts: 2,
    criticalVulns: 1,
    tags: ['laptop'],
  },
]

const USER_ROWS: UserRow[] = [
  {
    id: 'USR-8821',
    name: 'Jason Smith',
    email: 'jason.smith@demo.local',
    department: 'Finance',
    role: 'Manager',
    riskScore: 78,
    mfaEnabled: true,
    status: 'active',
    lastLogin: '9m ago',
    location: 'Tallinn',
    openAlerts: 3,
    privileged: true,
  },
  {
    id: 'USR-7740',
    name: 'Emma Roberts',
    email: 'emma.roberts@demo.local',
    department: 'Engineering',
    role: 'Platform Engineer',
    riskScore: 31,
    mfaEnabled: true,
    status: 'active',
    lastLogin: '1h ago',
    location: 'Riga',
    openAlerts: 0,
    privileged: false,
  },
  {
    id: 'USR-5521',
    name: 'Liam Novak',
    email: 'liam.novak@demo.local',
    department: 'Support',
    role: 'Analyst',
    riskScore: 91,
    mfaEnabled: false,
    status: 'locked',
    lastLogin: '2d ago',
    location: 'Tallinn',
    openAlerts: 7,
    privileged: false,
  },
]

const CVE_ROWS: CveRow[] = [
  {
    id: 'CVE-2026-18432',
    title: 'Privilege escalation in endpoint service',
    cvss: 8.8,
    severity: 'high',
    affectedProducts: ['Agent Core', 'Windows Sensor'],
    published: '2026-03-29',
    patchAvailable: true,
    exploitAvailable: true,
    affectedDevices: 42,
    epss: 0.83,
    vector: 'AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:H',
    description: 'Exploitable race condition may allow local privilege escalation.',
  },
  {
    id: 'CVE-2026-11205',
    title: 'SSRF in cloud metadata collector',
    cvss: 7.4,
    severity: 'high',
    affectedProducts: ['Collector API', 'Integration Worker'],
    published: '2026-04-01',
    patchAvailable: false,
    exploitAvailable: false,
    affectedDevices: 12,
    epss: 0.32,
    vector: 'AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N',
    description: 'Insufficient URL allowlisting permits internal metadata endpoint probing.',
  },
  {
    id: 'CVE-2025-99821',
    title: 'Privilege misuse in backup scheduler',
    cvss: 5.6,
    severity: 'medium',
    affectedProducts: ['Backup Agent'],
    published: '2025-12-18',
    patchAvailable: true,
    exploitAvailable: false,
    affectedDevices: 64,
    epss: 0.12,
    vector: 'AV:L/AC:H/PR:H/UI:N/S:U/C:L/I:L/A:L',
    description: 'Mis-scoped local service account allows unauthorized backup job execution.',
  },
]

const RECOMMENDATION_ROWS: RecommendationRow[] = [
  {
    id: 'REC-031',
    title: 'Rotate stale privileged credentials',
    category: 'Identity Hardening',
    priority: 'high',
    effort: 'medium',
    impact: 'high',
    status: 'in-progress',
    affectedAssets: 27,
    dueDate: '2026-04-15',
    description: 'Enforce 30-day rotation for service and break-glass credentials.',
    steps: ['Inventory privileged accounts', 'Apply secret rotation policy', 'Validate login workflows'],
  },
  {
    id: 'REC-029',
    title: 'Enforce phishing-resistant MFA for admins',
    category: 'Identity Control',
    priority: 'critical',
    effort: 'high',
    impact: 'high',
    status: 'open',
    affectedAssets: 41,
    dueDate: '2026-04-20',
    description: 'Migrate privileged accounts from TOTP/SMS to FIDO2-based authentication.',
    steps: ['Identify admin accounts', 'Issue hardware keys', 'Disable legacy MFA factors'],
  },
  {
    id: 'REC-018',
    title: 'Decommission unsupported endpoint agent versions',
    category: 'Endpoint Hygiene',
    priority: 'medium',
    effort: 'low',
    impact: 'medium',
    status: 'completed',
    affectedAssets: 63,
    dueDate: '2026-04-02',
    description: 'Completed rollout to supported EDR versions across workstations and servers.',
    steps: ['Detect old versions', 'Deploy staged update', 'Verify telemetry continuity'],
  },
]

const DARK_WEB_ROWS: DarkWebRow[] = [
  {
    id: 'DW-5518',
    type: 'credential',
    keyword: 'demo.local',
    source: 'Forum dump monitor',
    severity: 'critical',
    detectedAt: '2026-04-07 07:53',
    dataType: 'email/password pairs',
    affectedAccounts: 18,
    verified: true,
    description: 'Credential set appears in a newly indexed leak bundle.',
    rawPreview: 'j.s***@demo.local:********',
  },
  {
    id: 'DW-5487',
    type: 'mention',
    keyword: 'api.demo.local',
    source: 'Private forum crawler',
    severity: 'high',
    detectedAt: '2026-04-06 23:10',
    verified: false,
    description: 'Service endpoint mentioned in threat actor tooling thread.',
  },
  {
    id: 'DW-5464',
    type: 'data-breach',
    keyword: 'partner-sync-export.csv',
    source: 'Paste aggregation',
    severity: 'critical',
    detectedAt: '2026-04-05 14:44',
    dataType: 'customer metadata',
    affectedAccounts: 240,
    verified: true,
    description: 'Leaked export sample includes internal account identifiers.',
    rawPreview: 'acct_id,tenant_id,last_login,...',
  },
]

const VULN_REM_ROWS: VulnRemRow[] = [
  {
    id: 'VR-918',
    cveId: 'CVE-2026-18432',
    title: 'Patch endpoint escalation issue',
    severity: 'high',
    status: 'in-progress',
    owner: 'Platform Security',
    affectedDevices: 42,
    patchedDevices: 19,
    dueDate: '2026-04-12',
    overdue: false,
    notes: 'Rolling waves split by business unit to reduce downtime risk.',
  },
  {
    id: 'VR-911',
    cveId: 'CVE-2026-11205',
    title: 'Restrict metadata collector egress',
    severity: 'critical',
    status: 'open',
    owner: 'Cloud Security',
    affectedDevices: 18,
    patchedDevices: 2,
    dueDate: '2026-04-09',
    overdue: true,
    notes: 'Emergency change request pending architecture review.',
  },
  {
    id: 'VR-874',
    cveId: 'CVE-2025-99821',
    title: 'Upgrade backup scheduler service',
    severity: 'medium',
    status: 'patched',
    owner: 'Infrastructure',
    affectedDevices: 64,
    patchedDevices: 64,
    dueDate: '2026-03-30',
    overdue: false,
    notes: 'Validation complete in production and DR environments.',
  },
]

const SOFTWARE_ROWS: SoftwareRow[] = [
  {
    id: 'SW-992',
    name: 'OpenSSL',
    vendor: 'OpenSSL Foundation',
    version: '3.0.8',
    installCount: 146,
    licenseType: 'open-source',
    riskLevel: 'medium',
    lastUpdated: '2026-04-01',
    eolDate: '2026-09-30',
    eol: false,
  },
  {
    id: 'SW-776',
    name: 'Java Runtime',
    vendor: 'Oracle',
    version: '8u301',
    installCount: 52,
    licenseType: 'commercial',
    riskLevel: 'high',
    lastUpdated: '2026-03-15',
    eolDate: '2026-05-01',
    eol: true,
  },
  {
    id: 'SW-442',
    name: 'Nmap',
    vendor: 'Nmap Project',
    version: '7.95',
    installCount: 19,
    licenseType: 'freeware',
    riskLevel: 'low',
    lastUpdated: '2026-04-04',
    eol: false,
  },
]

const WEAKNESS_ROWS: WeaknessRow[] = [
  {
    id: 'W-311',
    cweId: 'CWE-79',
    title: 'Stored XSS in admin comment field',
    category: 'Web Application',
    severity: 'high',
    occurrences: 7,
    affectedComponents: ['admin-panel', 'audit-comments'],
    detectedAt: '2026-04-05',
    status: 'in-review',
    description: 'Input encoding is skipped on legacy render path.',
    remediation: 'Apply server-side sanitization and strict output encoding.',
  },
  {
    id: 'W-305',
    cweId: 'CWE-89',
    title: 'Unsafe query composition in reporting API',
    category: 'Backend API',
    severity: 'critical',
    occurrences: 2,
    affectedComponents: ['report-service'],
    detectedAt: '2026-04-06',
    status: 'open',
    description: 'Interpolated parameters bypass query sanitizer in one legacy endpoint.',
    remediation: 'Move to parameterized query builder and enforce strict schema validation.',
  },
  {
    id: 'W-280',
    cweId: 'CWE-200',
    title: 'Overly verbose error responses',
    category: 'API Hygiene',
    severity: 'low',
    occurrences: 14,
    affectedComponents: ['public-api', 'auth-api'],
    detectedAt: '2026-04-01',
    status: 'mitigated',
    description: 'Stack traces leaked during malformed payload handling.',
    remediation: 'Standardize error boundary responses and redact internal exception details.',
  },
]

const THREAT_ROWS: ThreatRow[] = [
  {
    id: 'TH-221',
    name: 'Loader chain via phishing lure',
    type: 'phishing',
    severity: 'high',
    confidence: 74,
    status: 'monitoring',
    firstDetected: '2026-04-03',
    lastActivity: '36m ago',
    affectedSystems: 9,
    mitreTactics: ['Initial Access', 'Execution'],
    description: 'Campaign leverages macro-enabled invoice attachments.',
    iocs: ['mal-site.example', '198.51.100.27'],
  },
  {
    id: 'TH-219',
    name: 'Credential stuffing wave',
    type: 'other',
    severity: 'medium',
    confidence: 62,
    status: 'contained',
    firstDetected: '2026-04-02',
    lastActivity: '5h ago',
    affectedSystems: 4,
    mitreTactics: ['Credential Access'],
    description: 'Automated login attempts targeted stale user/password pairs.',
    iocs: ['203.0.113.44', '203.0.113.77'],
  },
  {
    id: 'TH-201',
    name: 'Ransomware loader telemetry',
    type: 'ransomware',
    severity: 'critical',
    confidence: 88,
    status: 'active',
    firstDetected: '2026-04-01',
    lastActivity: '3m ago',
    affectedSystems: 2,
    mitreTactics: ['Execution', 'Impact'],
    description: 'Pre-encryption tooling behavior detected on segmented endpoint pair.',
    iocs: ['hash:5f3d...9a1', 'c2-node.example'],
  },
]

const THREAT_ACTOR_ROWS: ThreatActorRow[] = [
  {
    id: 'TA-009',
    name: 'Night Lantern',
    aliases: ['NLT', 'Lantern Crew'],
    origin: 'Unknown',
    motivation: 'financial',
    sophistication: 'advanced',
    targetSectors: ['Finance', 'SaaS'],
    lastSeen: '2026-04-06',
    active: true,
    iocCount: 133,
    campaignCount: 4,
    description: 'Known for rapid reuse of fresh compromised infrastructure.',
    ttps: ['T1566', 'T1059', 'T1071'],
  },
  {
    id: 'TA-014',
    name: 'Iron Sleet',
    aliases: ['Blue Lake'],
    origin: 'APAC',
    motivation: 'espionage',
    sophistication: 'nation-state',
    targetSectors: ['Technology', 'Telecom'],
    lastSeen: '2026-04-05',
    active: true,
    iocCount: 402,
    campaignCount: 9,
    description: 'Targets cloud identity chains and long-lived API tokens.',
    ttps: ['T1078', 'T1550', 'T1021'],
  },
  {
    id: 'TA-006',
    name: 'Cash Viper',
    aliases: ['CV Group'],
    origin: 'Unknown',
    motivation: 'financial',
    sophistication: 'intermediate',
    targetSectors: ['Retail', 'SaaS'],
    lastSeen: '2026-03-28',
    active: false,
    iocCount: 89,
    campaignCount: 2,
    description: 'Commodity phishing kits with rotating infrastructure.',
    ttps: ['T1566', 'T1056'],
  },
]

const IOC_ROWS: IocRow[] = [
  {
    id: 'IOC-6032',
    type: 'domain',
    value: 'portal-verify-login-secure.example',
    severity: 'high',
    confidence: 81,
    source: 'MISP',
    firstSeen: '2026-04-07 06:21',
    lastSeen: '11m ago',
    tags: ['phishing', 'credential-harvest'],
    blocked: true,
  },
  {
    id: 'IOC-6004',
    type: 'ip',
    value: '198.51.100.27',
    severity: 'critical',
    confidence: 92,
    source: 'AbuseIPDB',
    firstSeen: '2026-04-07 01:14',
    lastSeen: '7m ago',
    tags: ['c2', 'ransomware'],
    blocked: true,
  },
  {
    id: 'IOC-5922',
    type: 'hash-sha256',
    value: '7a4d5e911f7e3d8f2ac2bd31c6d9e41bc2c3e25e7624a9d1516b0048ab39c211',
    severity: 'medium',
    confidence: 67,
    source: 'Internal sandbox',
    firstSeen: '2026-04-05 09:00',
    lastSeen: '1d ago',
    tags: ['dropper'],
    blocked: false,
  },
]

const FEED_ROWS: TiFeedRow[] = [
  {
    id: 'TF-18',
    name: 'AbuseIPDB Plus',
    provider: 'AbuseIPDB',
    type: 'commercial',
    status: 'active',
    lastSync: '30s ago',
    iocCount: 58421,
    frequency: 'Every 5 min',
    confidence: 'high',
  },
  {
    id: 'TF-12',
    name: 'MISP Community Feed',
    provider: 'MISP',
    type: 'open-source',
    status: 'degraded',
    lastSync: '41m ago',
    iocCount: 31120,
    frequency: 'Hourly',
    confidence: 'medium',
  },
  {
    id: 'TF-03',
    name: 'National CERT Advisory',
    provider: 'CERT',
    type: 'government',
    status: 'active',
    lastSync: '8m ago',
    iocCount: 8420,
    frequency: 'Every 30 min',
    confidence: 'high',
  },
]

const DOC_ROWS: DocRow[] = [
  {
    id: 'DOC-77',
    title: 'Privileged Access Response Runbook',
    category: 'Incident Response',
    type: 'runbook',
    author: 'SOC Enablement',
    version: '3.2',
    status: 'published',
    updatedAt: '2026-04-01',
    tags: ['IAM', 'P1'],
  },
  {
    id: 'DOC-71',
    title: 'Incident Severity Classification Policy',
    category: 'Governance',
    type: 'policy',
    author: 'GRC Team',
    version: '2.4',
    status: 'published',
    updatedAt: '2026-03-28',
    tags: ['Compliance'],
  },
  {
    id: 'DOC-59',
    title: 'SOC Shift Handover Template',
    category: 'Operations',
    type: 'template',
    author: 'SOC Ops',
    version: '1.8',
    status: 'review',
    updatedAt: '2026-04-06',
    tags: ['L1', 'Template'],
  },
]

const PROCEDURE_ROWS: ProcedureRow[] = [
  {
    id: 'PRC-11',
    name: 'Compromised account containment',
    triggerCondition: 'High-confidence identity alert',
    owner: 'SOC L2',
    type: 'semi-automated',
    lastRun: '2026-04-07 09:44',
    runCount: 19,
    avgDuration: '14m',
    status: 'active',
    steps: ['Disable account', 'Revoke sessions', 'Rotate credentials'],
    description: 'Standard response flow for identity compromise events.',
  },
  {
    id: 'PRC-08',
    name: 'Ransomware containment kickoff',
    triggerCondition: 'Critical ransomware detection',
    owner: 'IR Lead',
    type: 'manual',
    lastRun: '2026-04-03 11:12',
    runCount: 5,
    avgDuration: '22m',
    status: 'active',
    steps: ['Isolate hosts', 'Disable lateral movement paths', 'Collect volatile evidence'],
    description: 'Human-in-the-loop playbook for high-risk endpoint encryption events.',
  },
  {
    id: 'PRC-15',
    name: 'Daily IOC sync sanity check',
    triggerCondition: 'Scheduled 06:00 UTC',
    owner: 'Automation Bot',
    type: 'automated',
    lastRun: '2026-04-07 06:00',
    runCount: 184,
    avgDuration: '2m',
    status: 'active',
    steps: ['Run feed sync', 'Validate count deltas', 'Notify on anomaly'],
    description: 'Automated quality gate for threat-intel ingestion health.',
  },
]

const REPORT_ROWS: ReportRow[] = [
  {
    id: 'RPT-402',
    title: 'Weekly SOC Executive Digest',
    type: 'executive',
    period: 'Week 14, 2026',
    author: 'Security Operations',
    generatedAt: '2026-04-07 08:00',
    format: 'pdf',
    size: '2.3 MB',
    status: 'ready',
  },
  {
    id: 'RPT-399',
    title: 'Monthly Vulnerability Exposure',
    type: 'technical',
    period: 'March 2026',
    author: 'Vulnerability Team',
    generatedAt: '2026-04-02 06:40',
    format: 'xlsx',
    size: '5.9 MB',
    status: 'ready',
  },
  {
    id: 'RPT-391',
    title: 'Dark Web Monitoring Pulse',
    type: 'threat-intel',
    period: 'Week 13, 2026',
    author: 'Threat Intel',
    generatedAt: '2026-03-31 18:10',
    format: 'html',
    size: '1.1 MB',
    status: 'scheduled',
  },
]

const COURSE_ROWS: CourseRow[] = [
  {
    id: 'CRS-210',
    title: 'Phishing Triage Fundamentals',
    category: 'Blue Team',
    difficulty: 'beginner',
    duration: '45 min',
    enrolledCount: 86,
    completionRate: 69,
    mandatory: true,
    dueDate: '2026-04-30',
    status: 'active',
    description: 'Hands-on triage flow for suspicious email reports.',
    modules: ['Mailbox analysis', 'Header tracing', 'IOC extraction'],
  },
  {
    id: 'CRS-188',
    title: 'Cloud IAM Misconfiguration Hunt',
    category: 'Cloud Security',
    difficulty: 'intermediate',
    duration: '90 min',
    enrolledCount: 41,
    completionRate: 48,
    mandatory: false,
    dueDate: '2026-05-14',
    status: 'active',
    description: 'Practical walkthrough of risky trust policies and external identities.',
    modules: ['Trust policies', 'Cross-account roles', 'Guardrail automation'],
  },
  {
    id: 'CRS-121',
    title: 'Advanced Incident Command',
    category: 'Incident Response',
    difficulty: 'advanced',
    duration: '120 min',
    enrolledCount: 22,
    completionRate: 91,
    mandatory: true,
    dueDate: '2026-04-18',
    status: 'active',
    description: 'Escalation leadership, comms cadence, and executive reporting for P1 incidents.',
    modules: ['War room patterns', 'Stakeholder updates', 'Post-incident review'],
  },
]

const ADMIN_USER_ROWS: AdminUserRow[] = [
  {
    id: 'ADM-77',
    name: 'Nina Patel',
    email: 'nina.patel@demo.local',
    role: 'admin',
    status: 'active',
    lastLogin: '22m ago',
    mfaEnabled: true,
    teamsCount: 3,
    createdAt: '2025-10-02',
  },
  {
    id: 'ADM-52',
    name: 'Ryan Lee',
    email: 'ryan.lee@demo.local',
    role: 'analyst',
    status: 'active',
    lastLogin: '11m ago',
    mfaEnabled: true,
    teamsCount: 2,
    createdAt: '2025-12-11',
  },
  {
    id: 'ADM-29',
    name: 'Olivia Martinez',
    email: 'olivia.martinez@demo.local',
    role: 'responder',
    status: 'pending',
    lastLogin: 'Never',
    mfaEnabled: false,
    teamsCount: 1,
    createdAt: '2026-04-05',
  },
]

const INTEGRATION_ROWS: IntegrationRow[] = [
  {
    id: 'INT-41',
    name: 'Splunk Enterprise Security',
    vendor: 'Splunk',
    category: 'siem',
    status: 'connected',
    lastSync: '45s ago',
    eventsPerDay: 1254400,
    version: '8.2.4',
    region: 'eu-central',
    healthScore: 96,
    description: 'Primary telemetry sink for correlation and detections.',
    configKeys: ['index', 'token', 'sourcetype'],
  },
  {
    id: 'INT-32',
    name: 'ServiceNow Security Ops',
    vendor: 'ServiceNow',
    category: 'ticketing',
    status: 'degraded',
    lastSync: '18m ago',
    eventsPerDay: 84200,
    version: 'Rome',
    region: 'us-east',
    healthScore: 71,
    description: 'Ticket sync lag due to API rate limiting.',
    configKeys: ['instance', 'api_user', 'table'],
  },
  {
    id: 'INT-09',
    name: 'Tenable Nessus',
    vendor: 'Tenable',
    category: 'vulnerability',
    status: 'disconnected',
    lastSync: '2h ago',
    eventsPerDay: 0,
    version: '10.6',
    region: 'eu-central',
    healthScore: 22,
    description: 'Connection token revoked; scanner feed inactive.',
    configKeys: ['access_key', 'secret_key'],
  },
]

const CLOUD_INTEGRATION_ROWS: CloudIntegrationRow[] = [
  {
    id: 'CLD-201',
    name: 'AWS Production',
    provider: 'aws',
    accountId: '123456789012',
    regions: ['eu-central-1', 'us-east-1', 'ap-southeast-1'],
    status: 'active',
    resources: 12437,
    alerts: 4,
    misconfigurations: 11,
    lastScan: '3m ago',
    complianceScore: 84,
    services: ['EC2', 'S3', 'IAM', 'EKS'],
  },
  {
    id: 'CLD-187',
    name: 'Azure Shared Services',
    provider: 'azure',
    accountId: '8f44-tenant-22c9',
    regions: ['northeurope', 'westeurope'],
    status: 'degraded',
    resources: 8431,
    alerts: 9,
    misconfigurations: 27,
    lastScan: '14m ago',
    complianceScore: 68,
    services: ['Azure AD', 'Key Vault', 'VM', 'AKS'],
  },
  {
    id: 'CLD-145',
    name: 'GCP Analytics',
    provider: 'gcp',
    accountId: 'soc-analytics-prd',
    regions: ['europe-west1'],
    status: 'active',
    resources: 3122,
    alerts: 0,
    misconfigurations: 3,
    lastScan: '9m ago',
    complianceScore: 92,
    services: ['Compute Engine', 'Cloud SQL', 'GKE'],
  },
]

export default function UnifiedPreviewPage() {
  const { setPageTitle } = usePageTitle()
  const [query, setQuery] = useState('')
  const [statusFilters, setStatusFilters] = useState<string[]>(['active', 'review', 'blocked'])
  const [selected, setSelected] = useState<RowItem | null>(null)
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [wizardOpen, setWizardOpen] = useState(false)
  const [wizardStep, setWizardStep] = useState(0)
  const [expanded, setExpanded] = useState<string[]>([])
  const [criticalOnly, setCriticalOnly] = useState(false)
  const [liveDigest, setLiveDigest] = useState(true)

  const statusFilterOptions = useMemo(
    () => [
      { id: 'active', label: 'Active' },
      { id: 'review', label: 'In review' },
      { id: 'blocked', label: 'Blocked' },
    ],
    [],
  )

  useEffect(() => {
    setPageTitle('Unified Overview Preview')
  }, [setPageTitle])

  useEffect(() => {
    const now = new Date()
    const from = new Date()
    from.setDate(now.getDate() - 30)
    setFromDate(from.toISOString().slice(0, 10))
    setToDate(now.toISOString().slice(0, 10))
  }, [])

  const visible = useMemo(() => {
    return ROWS
      .filter((row) => statusFilters.length === 0 || statusFilters.includes(row.status))
      .filter((row) => !criticalOnly || row.severity === 'critical')
      .filter((row) => !fromDate || row.updatedDate >= fromDate)
      .filter((row) => !toDate || row.updatedDate <= toDate)
      .filter((row) => {
        const q = query.toLowerCase()
        return !q || row.title.toLowerCase().includes(q) || row.owner.toLowerCase().includes(q) || row.id.toLowerCase().includes(q)
      })
  }, [statusFilters, criticalOnly, query, fromDate, toDate])

  const totalPages = Math.max(1, Math.ceil(visible.length / rowsPerPage))
  const pagedRows = visible.slice((page - 1) * rowsPerPage, page * rowsPerPage)

  useEffect(() => {
    if (page > totalPages) setPage(1)
  }, [page, totalPages])

  const severityStyles: Record<RowItem['severity'], { bar: string; bg: string; color: string }> = {
    critical: { bar: 'var(--soc-critical)', bg: 'var(--soc-critical-bg)', color: 'var(--soc-critical)' },
    high: { bar: 'var(--soc-high)', bg: 'var(--soc-high-bg)', color: 'var(--soc-high)' },
    medium: { bar: 'var(--soc-medium)', bg: 'var(--soc-medium-bg)', color: 'var(--soc-medium)' },
    low: { bar: 'var(--soc-low)', bg: 'var(--soc-low-bg)', color: 'var(--soc-low)' },
  }

  const statusStyles: Record<RowItem['status'], { bg: string; color: string; label: string }> = {
    active: { bg: 'var(--soc-low-bg)', color: 'var(--soc-low)', label: 'ACTIVE' },
    review: { bg: 'var(--soc-high-bg)', color: 'var(--soc-high)', label: 'IN REVIEW' },
    blocked: { bg: 'var(--soc-critical-bg)', color: 'var(--soc-critical)', label: 'BLOCKED' },
  }

  /** Tailwind-only badges for the row-detail modal (classical UI). */
  const modalStatusBadgeClass: Record<RowItem['status'], string> = {
    active:
      'bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/30',
    review:
      'bg-amber-50 text-amber-800 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/30',
    blocked: 'bg-red-50 text-red-800 ring-red-600/20 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/30',
  }
  const modalSeverityBadgeClass: Record<RowItem['severity'], string> = {
    critical:
      'bg-red-50 text-red-800 ring-red-600/20 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-500/30',
    high: 'bg-orange-50 text-orange-800 ring-orange-600/20 dark:bg-orange-500/10 dark:text-orange-300 dark:ring-orange-500/30',
    medium:
      'bg-amber-50 text-amber-800 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30',
    low: 'bg-green-50 text-green-800 ring-green-600/20 dark:bg-green-500/10 dark:text-green-300 dark:ring-green-500/30',
  }

  const renderTitleCell = (row: RowItem) => {
    const layout = row.layout ?? 'standard'
    const initials = row.accountName
      ? row.accountName.split(' ').map((n) => n[0]).join('').slice(0, 2)
      : null

    if (layout === 'compact') {
      return (
        <div className="flex items-center gap-2 min-w-0">
          {initials && (
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
              style={{ backgroundColor: 'var(--soc-accent-bg)', color: 'var(--soc-accent-text)' }}
            >
              {initials}
            </div>
          )}
          <span className="text-sm font-medium truncate" style={{ color: 'var(--soc-text)' }}>
            {row.title}
          </span>
        </div>
      )
    }

    if (layout === 'rich') {
      return (
        <div className="flex items-start gap-2 min-w-0">
          {initials && (
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 mt-0.5"
              style={{ backgroundColor: 'var(--soc-accent-bg)', color: 'var(--soc-accent-text)' }}
            >
              {initials}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-semibold" style={{ color: 'var(--soc-text)' }}>
              {row.title}
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--soc-text-muted)' }}>
              {row.id} · {row.owner}
            </p>
            {row.tags && row.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {row.tags.map((t) => (
                  <span key={t} className="soc-badge">
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )
    }

    if (layout === 'metric') {
      return (
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="w-8 h-8 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0"
            style={{ backgroundColor: 'var(--soc-raised)', color: 'var(--soc-text-secondary)', border: '1px solid var(--soc-border)' }}
          >
            KPI
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold" style={{ color: 'var(--soc-text)' }}>
              {row.title}
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--soc-text-muted)' }}>
              Health trend · last 7 checks
            </p>
          </div>
        </div>
      )
    }

    return (
      <div className="flex items-center gap-2 min-w-0">
        {row.accountName && (
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
            style={{ backgroundColor: 'var(--soc-accent-bg)', color: 'var(--soc-accent-text)' }}
          >
            {row.accountName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
          </div>
        )}
        <div className="min-w-0">
          <span className="text-sm font-medium" style={{ color: 'var(--soc-text)' }}>
            {row.title}
          </span>
          <p className="text-xs mt-0.5" style={{ color: 'var(--soc-text-muted)' }}>
            {row.id} · Owner: {row.owner} · Last update: {row.updatedDate}
          </p>
        </div>
      </div>
    )
  }

  const renderScoreCell = (row: RowItem) => {
    const color = row.score >= 85 ? 'var(--soc-low)' : row.score >= 60 ? 'var(--soc-medium)' : 'var(--soc-critical)'
    if (row.layout === 'metric' && row.trend?.length) {
      return (
        <div className="flex items-center justify-end gap-2">
          <MiniSpark values={row.trend} color={color} />
          <span className="text-base font-bold tabular-nums" style={{ color }}>
            {row.score}
          </span>
        </div>
      )
    }
    return (
      <span className="text-sm font-bold tabular-nums" style={{ color }}>
        {row.score}
      </span>
    )
  }

  return (
    <OverviewPageShell>
      <OverviewPageHeader
        section="UI SYSTEM"
        title="Unified Overview Page Pattern"
        description="Single baseline for headers, KPI tiles, filters, data sections, and modal behavior."
        actions={[
          { id: 'export', label: 'Export', variant: 'secondary' },
          { id: 'wizard', label: 'Open Multi-Step Modal', variant: 'primary', onClick: () => setWizardOpen(true) },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
        <OverviewAlert tone="critical" title="Critical alert: 3 assets require containment" description="Immediate action required by SOC response team." />
        <OverviewAlert tone="attention" title="Attention: review pending approvals" description="6 policy changes are awaiting sign-off." />
      </div>

      <OverviewKpiRow
        columns={4}
        items={[
          { label: 'TOTAL ITEMS', value: ROWS.length, sub: 'System-wide', tone: 'default' },
          { label: 'ACTIVE', value: ROWS.filter((r) => r.status === 'active').length, sub: 'Operational', tone: 'low' },
          { label: 'IN REVIEW', value: ROWS.filter((r) => r.status === 'review').length, sub: 'Pending sign-off', tone: 'high' },
          { label: 'BLOCKED', value: ROWS.filter((r) => r.status === 'blocked').length, sub: 'Needs action', tone: 'critical' },
        ]}
      />

      <div className="soc-card mb-5">
        <div className="border-b px-4 py-3" style={{ borderColor: 'var(--soc-border)' }}>
          <p className="soc-label">OPERATIONS SNAPSHOT</p>
          <p className="mt-0.5 text-sm" style={{ color: 'var(--soc-text-secondary)' }}>
            Outer tile with nested statistic tiles — use for SOC posture, queue depth, or connector summaries.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-4 lg:grid-cols-6">
          <OverviewNestedStatCard label="OPEN" value="47" sub="Items" accentColor="var(--soc-text)" />
          <OverviewNestedStatCard label="P1" value="3" sub="Critical path" accentColor="var(--soc-critical)" />
          <OverviewNestedStatCard label="MTTR" value="3.8h" sub="Rolling 7d" accentColor="var(--soc-accent)" />
          <OverviewNestedStatCard label="SLA" value="91%" sub="Compliance" accentColor="var(--soc-low)" />
          <OverviewNestedStatCard label="F/P RATE" value="6.2%" sub="Tuning" accentColor="var(--soc-medium)" />
          <OverviewNestedStatCard label="DIGEST" value={liveDigest ? 'ON' : 'OFF'} sub="Notifications" accentColor="var(--soc-text-muted)" />
        </div>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div>
          <p className="soc-label mb-1.5">Connectors</p>
          <p className="mb-3 text-xs leading-snug" style={{ color: 'var(--soc-text-secondary)' }}>
            Same card language as compliance: soft KPIs, region chips, and a quiet footer row.
          </p>
          <div className="space-y-3">
            <OverviewIntegrationTile
              title="AWS Production"
              subtitle="AWS"
              icon={<CloudProviderIcon type="aws" />}
              iconBackground="#ea580c"
              statusLabel="Connected"
              statusColor="var(--soc-low)"
              kpiLeft={{ label: 'Accounts', value: '5' }}
              kpiRight={{ label: 'Resources', value: '1189/1247' }}
              regions={['us-east-1', 'eu-west-1', 'ap-southeast-1']}
              alerts={{ critical: 3, high: 12, medium: 45 }}
              footerMeta="Last sync: 2 minutes ago"
              footerAction={
                <button type="button" className="soc-link text-xs font-medium">
                  Configure →
                </button>
              }
            />
            <OverviewIntegrationTile
              title="Splunk Cloud"
              subtitle="SIEM · primary"
              icon={
                <span className="text-[0.65rem] font-semibold tracking-tight" aria-hidden>
                  SPL
                </span>
              }
              iconBackground="var(--soc-accent)"
              statusLabel="Connected"
              statusColor="var(--soc-low)"
              kpiLeft={{ label: 'Events', value: '45.2k/d' }}
              kpiRight={{ label: 'Health', value: '100%' }}
              regions={['tenant-us-1']}
              alerts={{ critical: 0, high: 2, medium: 8 }}
              footerMeta="Last sync: 1 minute ago"
              footerAction={
                <button type="button" className="soc-link text-xs font-medium">
                  View pipeline →
                </button>
              }
            />
            <OverviewIntegrationTile
              title="Tenable Nessus"
              subtitle="Vulnerability"
              icon={
                <span className="text-[0.65rem] font-semibold tracking-tight" aria-hidden>
                  TN
                </span>
              }
              iconBackground="var(--soc-text-muted)"
              statusLabel="Error"
              statusColor="var(--soc-critical)"
              kpiLeft={{ label: 'Events', value: '—' }}
              kpiRight={{ label: 'Health', value: '0%' }}
              footerMeta="Last sync: 2 hours ago"
              footerAction={
                <button type="button" className="soc-link text-xs font-medium">
                  Reconnect →
                </button>
              }
            />
          </div>
        </div>

        <div>
          <p className="soc-label mb-1.5">Compliance standards</p>
          <p className="mb-3 text-xs leading-snug" style={{ color: 'var(--soc-text-secondary)' }}>
            Matched layout: score header, thin progress strip, and the same inner stat cells as connectors.
          </p>
          <div className="space-y-3">
            <OverviewComplianceTile
              title="GDPR"
              auditLine="Last audit: 2023-12-10 · Next: 2024-06-10"
              scorePercent={87}
              statusLabel="Partial"
              statusVariant="partial"
              breakdown={{ implemented: 86, inProgress: 10, notStarted: 3 }}
              footerMeta="Evidence pack v3.2"
              footerAction={
                <button type="button" className="soc-link text-xs font-medium">
                  Open framework →
                </button>
              }
            />
            <OverviewComplianceTile
              title="SOC 2 Type II"
              auditLine="Audit window May 2026 · Controls 142 tracked"
              scorePercent={97}
              statusLabel="Compliant"
              statusVariant="compliant"
              breakdown={{ implemented: 138, inProgress: 3, notStarted: 1 }}
              footerMeta="Auditor: Northbridge"
              footerAction={
                <button type="button" className="soc-link text-xs font-medium">
                  View report →
                </button>
              }
            />
            <OverviewComplianceTile
              title="ISO 27001"
              auditLine="CAPA in flight · Target remediation 45d"
              scorePercent={72}
              statusLabel="At risk"
              statusVariant="atrisk"
              breakdown={{ implemented: 64, inProgress: 18, notStarted: 12 }}
              footerMeta="Gap: asset inventory"
              footerAction={
                <button type="button" className="soc-link text-xs font-medium">
                  Remediation plan →
                </button>
              }
            />
          </div>
        </div>
      </div>

      <OverviewTableToolbar
        searchValue={query}
        onSearchChange={setQuery}
        searchPlaceholder="Search id, title, owner..."
        end={(
          <>
            <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-stretch sm:justify-end sm:gap-2">
              <OverviewFilterMenu
                options={statusFilterOptions}
                selected={statusFilters}
                onApply={(next) => {
                  setStatusFilters(next)
                  setPage(1)
                }}
              />
              <OverviewDateRangeMenu
                fromDate={fromDate}
                toDate={toDate}
                onApply={(from, to) => {
                  setFromDate(from)
                  setToDate(to)
                  setPage(1)
                }}
              />
            </div>
            <div className="flex w-full flex-wrap gap-2 sm:justify-end">
              <OverviewToggle
                label="Critical only"
                checked={criticalOnly}
                onChange={(v) => {
                  setCriticalOnly(v)
                  setPage(1)
                }}
              />
              <OverviewToggle label="Live digest" checked={liveDigest} onChange={setLiveDigest} />
            </div>
          </>
        )}
      />

      <OverviewSection
        title="STANDARDIZED TABLE SECTION"
        right={(
          <OverviewRowsPerPageMenu
            value={rowsPerPage}
            options={[5, 10]}
            onChange={(n) => {
              setRowsPerPage(n)
              setPage(1)
            }}
          />
        )}
      >
        <table className="soc-table" style={{ tableLayout: 'fixed', width: '100%' }}>
          <thead>
            <tr>
              <th style={{ width: '6px', padding: 0 }} />
              <th style={{ width: '7%' }}>ID</th>
              <th style={{ width: '34%' }}>Title</th>
              <th style={{ width: '14%' }}>Owner</th>
              <th style={{ width: '11%' }}>Severity</th>
              <th style={{ width: '12%' }}>Status</th>
              <th className="text-right" style={{ width: '12%' }}>
                Score
              </th>
              <th className="text-right" style={{ width: '10%' }}>
                Updated
              </th>
            </tr>
          </thead>
          <tbody>
            {pagedRows.map((row) => (
              <Fragment key={row.id}>
                <tr
                  className="cursor-pointer"
                  onClick={() =>
                    setExpanded((prev) =>
                      prev.includes(row.id) ? prev.filter((id) => id !== row.id) : [...prev, row.id]
                    )
                  }
                >
                  <td style={{ padding: 0, width: '6px', verticalAlign: 'middle' }}>
                    <div
                      style={{
                        width: '3px',
                        marginLeft: '1px',
                        height: '100%',
                        minHeight: row.layout === 'rich' ? '3.25rem' : '2.6rem',
                        backgroundColor: severityStyles[row.severity].bar,
                        borderRadius: '0 2px 2px 0',
                      }}
                    />
                  </td>
                  <td>
                    <span className="text-xs font-mono truncate block" style={{ color: 'var(--soc-text-muted)' }}>
                      {row.id}
                    </span>
                  </td>
                  <td className="align-top">{renderTitleCell(row)}</td>
                  <td className="align-top">
                    <span className="text-xs leading-snug" style={{ color: 'var(--soc-text-secondary)' }}>
                      {row.owner}
                    </span>
                  </td>
                  <td className="align-top">
                    <span
                      className="soc-badge"
                      style={{
                        backgroundColor: severityStyles[row.severity].bg,
                        color: severityStyles[row.severity].color,
                      }}
                    >
                      {row.severity.toUpperCase()}
                    </span>
                  </td>
                  <td className="align-top">
                    <span
                      className="soc-badge"
                      style={{ backgroundColor: statusStyles[row.status].bg, color: statusStyles[row.status].color }}
                    >
                      {statusStyles[row.status].label}
                    </span>
                  </td>
                  <td className="text-right align-top">{renderScoreCell(row)}</td>
                  <td className="text-right align-top">
                    <span className="text-xs whitespace-nowrap" style={{ color: 'var(--soc-text-muted)' }}>
                      {row.updated}
                    </span>
                  </td>
                </tr>
                {expanded.includes(row.id) && (
                  <tr>
                    <td
                      colSpan={8}
                      style={{
                        padding: 0,
                        verticalAlign: 'top',
                        backgroundColor: 'var(--soc-raised)',
                        borderTop: '1px solid var(--soc-border)',
                      }}
                    >
                      <div className="min-w-0 space-y-2 px-4 py-3">
                        <p className="text-sm leading-relaxed" style={{ color: 'var(--soc-text-secondary)' }}>
                          {row.description}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--soc-text-muted)' }}>
                          Updated on {row.updatedDate}
                        </p>
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div className="space-y-1 text-xs" style={{ color: 'var(--soc-text-secondary)' }}>
                            <p>
                              <span className="font-semibold" style={{ color: 'var(--soc-text)' }}>
                                Extended context
                              </span>{' '}
                              — correlation across identity, endpoint, and network telemetry. SLA clock and assignee history
                              appear here on real pages.
                            </p>
                            <p style={{ color: 'var(--soc-text-muted)' }}>
                              Layout: <span className="font-mono">{row.layout ?? 'standard'}</span>
                              {row.tags?.length ? ` · Tags: ${row.tags.join(', ')}` : ''}
                            </p>
                          </div>
                          <button
                            type="button"
                            className="soc-btn soc-btn-secondary shrink-0 self-start text-xs"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelected(row)
                            }}
                          >
                            View details
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
        <OverviewPagination page={page} totalPages={totalPages} totalItems={visible.length} onPageChange={setPage} />
      </OverviewSection>

      <div className="grid grid-cols-12 gap-4 mt-4">
        <div className="col-span-12 lg:col-span-8">
          <OverviewSection title="MAP SAMPLE" right={<span className="text-xs" style={{ color: 'var(--soc-text-muted)' }}>Last 24h</span>}>
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
                { x: '22%', y: '30%', color: 'var(--soc-medium)' },
                { x: '48%', y: '25%', color: 'var(--soc-low)' },
                { x: '72%', y: '35%', color: 'var(--soc-critical)' },
              ].map((dot, idx) => (
                <div
                  key={idx}
                  className="absolute rounded-full animate-pulse"
                  style={{ width: '12px', height: '12px', left: dot.x, top: dot.y, backgroundColor: dot.color }}
                />
              ))}
            </div>
          </OverviewSection>
        </div>
        <div className="col-span-12 lg:col-span-4 space-y-4">
          <OverviewStatusTile title="Compliance Posture" value="94%" status="healthy" sub="SOC2 / ISO / PCI aggregated" />
          <OverviewStatusTile title="Cloud Connection" value="8/9" status="warning" sub="One integration degraded" />
        </div>
      </div>

      <div className="mt-4">
        <OverviewSection
          title="INCIDENT TIMELINE"
          right={<span className="text-xs" style={{ color: 'var(--soc-text-muted)' }}>INC-2026-0442 · Full narrative</span>}
        >
          <div className="px-4 py-4">
            {(
              [
                {
                  day: 'Tuesday, April 7, 2026',
                  events: [
                    {
                      time: '10:42',
                      type: 'VERIFICATION',
                      title: 'Containment verified',
                      detail: 'No new auth from IOC set; EDR posture green on 23/23 hosts.',
                      actor: 'Emily Taylor',
                      system: 'CrowdStrike',
                      tone: 'var(--soc-low)',
                    },
                    {
                      time: '09:44',
                      type: 'ACTION',
                      title: 'Session revoked & tokens invalidated',
                      detail: 'Forced sign-out for user corp\\jsmith; refresh tokens rotated in IdP.',
                      actor: 'SOC L2',
                      system: 'Okta',
                      tone: 'var(--soc-medium)',
                    },
                    {
                      time: '09:21',
                      type: 'TRIAGE',
                      title: 'Case acknowledged & routed',
                      detail: 'P1 queue · Assigned to Emily Taylor · War room link posted.',
                      actor: 'Sarah Chen',
                      system: 'ServiceNow',
                      tone: 'var(--soc-high)',
                    },
                    {
                      time: '09:14',
                      type: 'ALERT',
                      title: 'Impossible travel + new device',
                      detail: 'Rule SOC-AUTH-218 fired; risk score 82; geo jump NYC → Tallinn in 14m.',
                      actor: 'SIEM',
                      system: 'Splunk',
                      tone: 'var(--soc-critical)',
                    },
                  ],
                },
                {
                  day: 'Monday, April 6, 2026',
                  events: [
                    {
                      time: '16:03',
                      type: 'BASELINE',
                      title: 'Policy baseline snapshot',
                      detail: 'Scheduled drift check; MFA coverage 96% org-wide.',
                      actor: 'GRC Bot',
                      system: 'Compliance',
                      tone: 'var(--soc-text-muted)',
                    },
                    {
                      time: '11:20',
                      type: 'INTEL',
                      title: 'Threat feed enrichment',
                      detail: 'IP 203.0.113.8 matched active C2 list (medium confidence).',
                      actor: 'ThreatIntel',
                      system: 'MISP',
                      tone: 'var(--soc-accent)',
                    },
                  ],
                },
              ] as const
            ).map((group) => (
              <div key={group.day} className="mb-6 last:mb-0">
                <p className="soc-label mb-3" style={{ color: 'var(--soc-text-secondary)' }}>
                  {group.day}
                </p>
                <div className="relative pl-2">
                  <div
                    className="absolute left-[7px] top-2 bottom-2 w-px"
                    style={{ backgroundColor: 'var(--soc-border)' }}
                    aria-hidden
                  />
                  {group.events.map((item, idx) => (
                    <div key={`${group.day}-${item.time}-${idx}`} className="relative flex gap-3 pb-5 last:pb-0">
                      <div className="relative z-[1] flex w-4 shrink-0 justify-center pt-1">
                        <div
                          className="h-2.5 w-2.5 rounded-full border-2"
                          style={{ backgroundColor: item.tone, borderColor: 'var(--soc-bg)' }}
                        />
                      </div>
                      <div className="min-w-0 flex-1 rounded-lg border px-3 py-2.5" style={{ borderColor: 'var(--soc-border)', backgroundColor: 'var(--soc-surface)' }}>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs tabular-nums" style={{ color: 'var(--soc-text-muted)' }}>
                            {item.time}
                          </span>
                          <span className="soc-badge text-[0.625rem]">{item.type}</span>
                          <span className="text-xs" style={{ color: 'var(--soc-text-muted)' }}>
                            {item.actor} · {item.system}
                          </span>
                        </div>
                        <p className="mt-1 text-sm font-semibold" style={{ color: 'var(--soc-text)' }}>
                          {item.title}
                        </p>
                        <p className="mt-1 text-xs leading-relaxed" style={{ color: 'var(--soc-text-secondary)' }}>
                          {item.detail}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </OverviewSection>
      </div>

      <div className="grid grid-cols-12 gap-4 mt-4">
        <div className="col-span-12 lg:col-span-6">
          <OverviewSection title="CHART: ALERT TREND" right={<span className="text-xs" style={{ color: 'var(--soc-text-muted)' }}>7 days</span>}>
            <div className="px-4 py-4">
              <svg viewBox="0 0 500 180" className="w-full h-[170px]">
                <title>Alert trend — hover points for daily totals (ingested vs. critical).</title>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--soc-accent)" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="var(--soc-accent)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <polygon
                  fill="url(#areaGrad)"
                  points="0,180 0,140 70,125 140,130 210,95 280,88 350,70 420,76 500,52 500,180"
                >
                  <title>Volume under primary series (7-day window)</title>
                </polygon>
                <polyline
                  fill="none"
                  stroke="var(--soc-accent)"
                  strokeWidth="3"
                  points="0,140 70,125 140,130 210,95 280,88 350,70 420,76 500,52"
                >
                  <title>Primary: ingested alerts by day</title>
                </polyline>
                <polyline
                  fill="none"
                  stroke="var(--soc-critical)"
                  strokeWidth="2"
                  points="0,154 70,148 140,142 210,132 280,126 350,118 420,123 500,110"
                  opacity="0.85"
                >
                  <title>Critical-class subset (same window)</title>
                </polyline>
                {(
                  [
                    [0, 140, 'Mon', 842, 312],
                    [70, 125, 'Tue', 918, 298],
                    [140, 130, 'Wed', 891, 285],
                    [210, 95, 'Thu', 1042, 268],
                    [280, 88, 'Fri', 1105, 255],
                    [350, 70, 'Sat', 1188, 241],
                    [420, 76, 'Sun', 1156, 248],
                    [500, 52, 'Today', 1284, 229],
                  ] as const
                ).map(([x, y, day, ing, crit]) => (
                  <g key={`${x}-${y}`}>
                    <title>{`${day}: ${ing.toLocaleString()} ingested · ${crit.toLocaleString()} critical`}</title>
                    <circle cx={x} cy={y} r="10" fill="transparent" />
                    <circle cx={x} cy={y} r="3.5" fill="var(--soc-accent)" opacity="0.9" />
                  </g>
                ))}
              </svg>
            </div>
          </OverviewSection>
        </div>
        <div className="col-span-12 lg:col-span-6">
          <OverviewSection title="CHART: SOURCE DISTRIBUTION" right={<span className="text-xs" style={{ color: 'var(--soc-text-muted)' }}>Current</span>}>
            <div className="px-4 py-4 space-y-3">
              {[
                { label: 'Cloud', value: 76, color: 'var(--soc-accent)' },
                { label: 'Endpoint', value: 58, color: 'var(--soc-high)' },
                { label: 'Identity', value: 34, color: 'var(--soc-medium)' },
                { label: 'Network', value: 88, color: 'var(--soc-low)' },
              ].map((bar) => (
                <div key={bar.label} title={`${bar.label}: ${bar.value}% of normalized alert volume (demo)`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs" style={{ color: 'var(--soc-text-secondary)' }}>
                      {bar.label}
                    </span>
                    <span className="text-xs tabular-nums" style={{ color: 'var(--soc-text-muted)' }}>
                      {bar.value}%
                    </span>
                  </div>
                  <OverviewProgressBar value={bar.value} color={bar.color} showValue={false} />
                </div>
              ))}
            </div>
          </OverviewSection>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 mt-4">
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <OverviewSection title="CHART: DONUT" right={<span className="text-xs" style={{ color: 'var(--soc-text-muted)' }}>Mix</span>}>
            <div className="px-4 py-6 flex justify-center">
              <svg viewBox="0 0 120 120" width="140" height="140" role="img" aria-label="Source mix donut chart">
                <title>Hover each ring segment for share (demo data).</title>
                <circle cx="60" cy="60" r="40" fill="none" stroke="var(--soc-border)" strokeWidth="16" />
                <g transform="rotate(-90 60 60)">
                  <circle cx="60" cy="60" r="40" fill="none" stroke="var(--soc-accent)" strokeWidth="16" strokeDasharray="125.6 125.6">
                    <title>{'Operations & workflow: 50%'}</title>
                  </circle>
                  <circle
                    cx="60"
                    cy="60"
                    r="40"
                    fill="none"
                    stroke="var(--soc-low)"
                    strokeWidth="16"
                    strokeDasharray="62.8 188.4"
                    strokeDashoffset="-125.6"
                  >
                    <title>Automated enrichment: 25%</title>
                  </circle>
                  <circle
                    cx="60"
                    cy="60"
                    r="40"
                    fill="none"
                    stroke="var(--soc-critical)"
                    strokeWidth="16"
                    strokeDasharray="37.7 213.3"
                    strokeDashoffset="-188.4"
                  >
                    <title>Manual triage: 15%</title>
                  </circle>
                </g>
                <text x="60" y="64" textAnchor="middle" style={{ fontSize: '14px', fontWeight: 700, fill: 'var(--soc-text)' }}>
                  100%
                </text>
                <text x="60" y="78" textAnchor="middle" style={{ fontSize: '9px', fill: 'var(--soc-text-muted)' }}>
                  mix
                </text>
              </svg>
            </div>
          </OverviewSection>
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <OverviewSection title="CHART: STACKED BAR" right={<span className="text-xs" style={{ color: 'var(--soc-text-muted)' }}>24h</span>}>
            <div className="px-4 py-5 space-y-3">
              {[
                { a: 40, b: 35, c: 25 },
                { a: 55, b: 30, c: 15 },
                { a: 30, b: 45, c: 25 },
              ].map((s, i) => (
                <div
                  key={i}
                  className="flex h-3 rounded overflow-hidden"
                  style={{ backgroundColor: 'var(--soc-border)' }}
                  title={`Row ${i + 1}: tier A ${s.a}% · tier B ${s.b}% · tier C ${s.c}% (24h demo)`}
                >
                  <div style={{ width: `${s.a}%`, backgroundColor: 'var(--soc-accent)' }} />
                  <div style={{ width: `${s.b}%`, backgroundColor: 'var(--soc-high)' }} />
                  <div style={{ width: `${s.c}%`, backgroundColor: 'var(--soc-medium)' }} />
                </div>
              ))}
            </div>
          </OverviewSection>
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <OverviewSection title="CHART: SPARK STRIP" right={<span className="text-xs" style={{ color: 'var(--soc-text-muted)' }}>Live</span>}>
            <div className="px-4 py-5">
              <MiniSpark values={[12, 18, 15, 22, 19, 28, 31, 27, 35, 33]} color="var(--soc-accent)" />
              <p className="text-xs mt-2" style={{ color: 'var(--soc-text-muted)' }}>
                Normalized event rate (sample)
              </p>
            </div>
          </OverviewSection>
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <OverviewSection title="CHART: GAUGE" right={<span className="text-xs" style={{ color: 'var(--soc-text-muted)' }}>Risk</span>}>
            <div className="px-4 py-3 flex flex-col items-center justify-center">
              <svg
                viewBox="8 18 104 58"
                className="w-full max-w-[200px] aspect-[104/58] h-auto"
                role="img"
                aria-label={`Risk score ${DEMO_GAUGE_SCORE} out of 100`}
              >
                <title>{`Risk posture: ${DEMO_GAUGE_SCORE} / 100 — hover arcs for details`}</title>
                <path
                  d={DEMO_GAUGE_ARC_D}
                  fill="none"
                  stroke="var(--soc-border)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  pathLength={100}
                >
                  <title>Full scale 0–100</title>
                </path>
                <path
                  d={DEMO_GAUGE_ARC_D}
                  fill="none"
                  stroke="var(--soc-medium)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  pathLength={100}
                  strokeDasharray={`${DEMO_GAUGE_SCORE} ${100 - DEMO_GAUGE_SCORE}`}
                >
                  <title>{`Current score: ${DEMO_GAUGE_SCORE}`}</title>
                </path>
                {/* Optically centered in the semicircle (slightly below geometric centroid so the arc feels balanced). */}
                <text
                  x="60"
                  y="54"
                  textAnchor="middle"
                  dominantBaseline="central"
                  style={{ fontSize: '22px', fontWeight: 700, fill: 'var(--soc-text)' }}
                >
                  {DEMO_GAUGE_SCORE}
                </text>
                <text
                  x="60"
                  y="69"
                  textAnchor="middle"
                  dominantBaseline="central"
                  style={{ fontSize: '9px', fontWeight: 600, fill: 'var(--soc-text-muted)', letterSpacing: '0.08em' }}
                >
                  SCORE
                </text>
              </svg>
            </div>
          </OverviewSection>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
        <div className="soc-card">
          <p className="soc-label mb-2">PROGRESS: HEALTHY</p>
          <OverviewProgressBar value={92} color="var(--soc-low)" />
        </div>
        <div className="soc-card">
          <p className="soc-label mb-2">PROGRESS: ATTENTION</p>
          <OverviewProgressBar value={66} color="var(--soc-medium)" />
        </div>
        <div className="soc-card">
          <p className="soc-label mb-2">PROGRESS: CRITICAL</p>
          <OverviewProgressBar value={34} color="var(--soc-critical)" />
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <OverviewSection title="TABLE LIBRARY · ALERTS"><AlertTable rows={ALERT_ROWS} /></OverviewSection>
        <OverviewSection title="TABLE LIBRARY · INCIDENTS"><IncidentTable rows={INCIDENT_ROWS} /></OverviewSection>
        <OverviewSection title="TABLE LIBRARY · DEVICES"><DeviceTable rows={DEVICE_ROWS} /></OverviewSection>
        <OverviewSection title="TABLE LIBRARY · IDENTITIES"><UserTable rows={USER_ROWS} /></OverviewSection>
        <OverviewSection title="TABLE LIBRARY · CVE"><CveTable rows={CVE_ROWS} /></OverviewSection>
        <OverviewSection title="TABLE LIBRARY · RECOMMENDATIONS"><RecommendationTable rows={RECOMMENDATION_ROWS} /></OverviewSection>
        <OverviewSection title="TABLE LIBRARY · DARK WEB"><DarkWebTable rows={DARK_WEB_ROWS} /></OverviewSection>
        <OverviewSection title="TABLE LIBRARY · REMEDIATION"><VulnRemTable rows={VULN_REM_ROWS} /></OverviewSection>
        <OverviewSection title="TABLE LIBRARY · SOFTWARE"><SoftwareTable rows={SOFTWARE_ROWS} /></OverviewSection>
        <OverviewSection title="TABLE LIBRARY · WEAKNESSES"><WeaknessTable rows={WEAKNESS_ROWS} /></OverviewSection>
        <OverviewSection title="TABLE LIBRARY · THREATS"><ThreatTable rows={THREAT_ROWS} /></OverviewSection>
        <OverviewSection title="TABLE LIBRARY · THREAT ACTORS"><ThreatActorTable rows={THREAT_ACTOR_ROWS} /></OverviewSection>
        <OverviewSection title="TABLE LIBRARY · IOC"><IocTable rows={IOC_ROWS} /></OverviewSection>
        <OverviewSection title="TABLE LIBRARY · FEEDS"><TiFeedTable rows={FEED_ROWS} /></OverviewSection>
        <OverviewSection title="TABLE LIBRARY · DOCUMENTS"><DocTable rows={DOC_ROWS} /></OverviewSection>
        <OverviewSection title="TABLE LIBRARY · PROCEDURES"><ProcedureTable rows={PROCEDURE_ROWS} /></OverviewSection>
        <OverviewSection title="TABLE LIBRARY · REPORTS"><ReportTable rows={REPORT_ROWS} /></OverviewSection>
        <OverviewSection title="TABLE LIBRARY · COURSES"><CourseTable rows={COURSE_ROWS} /></OverviewSection>
        <OverviewSection title="TABLE LIBRARY · ADMIN USERS"><AdminUserTable rows={ADMIN_USER_ROWS} /></OverviewSection>
        <OverviewSection title="TABLE LIBRARY · INTEGRATIONS"><IntegrationTable rows={INTEGRATION_ROWS} /></OverviewSection>
        <OverviewSection title="TABLE LIBRARY · CLOUD"><CloudIntegrationTable rows={CLOUD_INTEGRATION_ROWS} /></OverviewSection>
      </div>

      <OverviewModal
        open={!!selected}
        title={selected?.title || ''}
        subtitle={selected?.id}
        onClose={() => setSelected(null)}
        maxWidth="max-w-2xl"
        footer={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Last synced with overview table context.
            </p>
            <div className="flex gap-2 sm:min-w-[260px] sm:justify-end">
              <button
                type="button"
                className="inline-flex flex-1 justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:flex-none dark:bg-indigo-500 dark:hover:bg-indigo-400"
              >
                Primary Action
              </button>
              <button
                type="button"
                className="inline-flex flex-1 justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:flex-none dark:bg-gray-800 dark:text-gray-100 dark:ring-gray-600 dark:hover:bg-gray-700"
                onClick={() => setSelected(null)}
              >
                Close
              </button>
            </div>
          </div>
        }
      >
        {selected && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${modalStatusBadgeClass[selected.status]}`}
              >
                {statusStyles[selected.status].label}
              </span>
              <span
                className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${modalSeverityBadgeClass[selected.severity]}`}
              >
                {selected.severity.toUpperCase()}
              </span>
              <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-700 ring-1 ring-inset ring-gray-500/10 dark:bg-gray-700 dark:text-gray-200 dark:ring-white/10">
                Score {selected.score}
              </span>
            </div>

            <div className="grid gap-3 lg:grid-cols-[1.5fr_1fr]">
              <div className="space-y-3 rounded-md border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800/50">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">Description</p>
                  <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                    {selected.description}
                  </p>
                </div>
                <div className="h-px bg-gray-200 dark:bg-gray-700" />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">Owner</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {selected.owner}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">Updated</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {selected.updated}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { label: 'ITEM ID', value: selected.id },
                  { label: 'ROW LAYOUT', value: selected.layout ?? 'standard' },
                  { label: 'LAST DATE', value: selected.updatedDate },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-md border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/80">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">{label}</p>
                    <p className="text-sm font-medium capitalize text-gray-900 dark:text-white">
                      {value}
                    </p>
                  </div>
                ))}
                {selected.tags?.length ? (
                  <div className="rounded-md border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/80">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Tags</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selected.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 ring-1 ring-inset ring-gray-500/10 dark:bg-gray-700 dark:text-gray-200 dark:ring-white/10"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        )}
      </OverviewModal>

      <OverviewStepModal
        open={wizardOpen}
        subtitle="NEW WORKFLOW"
        currentStep={wizardStep}
        onStepChange={setWizardStep}
        onClose={() => {
          setWizardOpen(false)
          setWizardStep(0)
        }}
        onFinish={() => {
          setWizardOpen(false)
          setWizardStep(0)
        }}
        steps={[
          {
            id: 'scope',
            title: 'Step 1: Scope',
            content: (
              <div className="grid gap-3 sm:grid-cols-[1.25fr_0.75fr]">
                <div className="rounded-md border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800/50">
                  <label className="block text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
                    Choose scope
                  </label>
                  <input
                    type="text"
                    className="block w-full rounded-md border-0 py-1.5 pl-3 pr-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-white/5 dark:text-white dark:ring-white/10 dark:placeholder:text-gray-500 dark:focus:ring-indigo-500"
                    placeholder="Example: Production environment"
                  />
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Define the exact segment where this workflow should run.
                  </p>
                </div>
                <div className="rounded-md border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/80">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">Scope guidance</p>
                  <ul className="list-disc space-y-1.5 pl-4 text-xs text-gray-600 dark:text-gray-300">
                    <li>Use environment or business unit names.</li>
                    <li>Avoid broad values like &quot;all systems&quot;.</li>
                    <li>Keep naming aligned with table filters.</li>
                  </ul>
                </div>
              </div>
            ),
          },
          {
            id: 'owners',
            title: 'Step 2: Owners',
            content: (
              <div className="grid gap-3 sm:grid-cols-[1.25fr_0.75fr]">
                <div className="rounded-md border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800/50">
                  <label className="block text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
                    Assign owner
                  </label>
                  <input
                    type="text"
                    className="block w-full rounded-md border-0 py-1.5 pl-3 pr-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-white/5 dark:text-white dark:ring-white/10 dark:placeholder:text-gray-500 dark:focus:ring-indigo-500"
                    placeholder="Example: Sarah Chen"
                  />
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Owner receives alerts, approvals, and escalation reminders.
                  </p>
                </div>
                <div className="rounded-md border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/80">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">Responsibilities</p>
                  <ul className="list-disc space-y-1.5 pl-4 text-xs text-gray-600 dark:text-gray-300">
                    <li>Review triggered incidents.</li>
                    <li>Track SLA and completion status.</li>
                    <li>Approve final remediation action.</li>
                  </ul>
                </div>
              </div>
            ),
          },
          {
            id: 'review',
            title: 'Step 3: Review',
            content: (
              <div className="space-y-3 rounded-md border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/80">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Review configuration</p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <div className="rounded-md border border-gray-200 bg-white p-2.5 dark:border-gray-700 dark:bg-gray-800/50">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">Scope</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Production environment</p>
                  </div>
                  <div className="rounded-md border border-gray-200 bg-white p-2.5 dark:border-gray-700 dark:bg-gray-800/50">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">Owner</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Sarah Chen</p>
                  </div>
                  <div className="rounded-md border border-gray-200 bg-white p-2.5 dark:border-gray-700 dark:bg-gray-800/50">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">Mode</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Manual approval</p>
                  </div>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  Ready to create workflow. Click Finish to submit.
                </p>
              </div>
            ),
          },
        ]}
      />
    </OverviewPageShell>
  )
}

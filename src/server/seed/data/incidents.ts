import type { IncidentStatus, InvestigationStatus, Severity } from '../../../domain/enums'
import { DAY, HOUR } from '../shift'

export type SeedInvestigation = {
  key: string
  title: string
  status: InvestigationStatus
  hypothesis: string
  disposition: 'benign' | 'malicious' | 'inconclusive' | null
  minutesAgo: number
  closedMinutesAgo: number | null
}

export type SeedIncident = {
  key: string
  title: string
  severity: Severity
  status: IncidentStatus
  investigationKey: string | null
  impactSummary: string
  minutesAgo: number
  resolvedMinutesAgo: number | null
  timeline: { minutesAgo: number; kind: 'declared' | 'status_change' | 'note' | 'evidence' | 'action'; summary: string; actor?: string }[]
}

export const SEED_INVESTIGATIONS: SeedInvestigation[] = [
  {
    key: 'inv-phishing-chain',
    title: 'Phishing chain — maya.okafor credential compromise',
    status: 'active',
    hypothesis: 'Targeted phishing led to credential theft and MFA bypass; possible data staging from LT-0447.',
    disposition: null,
    minutesAgo: 2 * DAY + 4 * HOUR,
    closedMinutesAgo: null,
  },
  {
    key: 'inv-vpn-cve',
    title: 'VPN gateway CVE-2025-22457 exploitation attempt',
    status: 'active',
    hypothesis: 'External actor exploiting unpatched Ivanti gateway; dormant service account activity may be related.',
    disposition: null,
    minutesAgo: 5 * DAY + 7 * HOUR,
    closedMinutesAgo: null,
  },
  {
    key: 'inv-password-spray',
    title: 'Password spray against Okta tenant',
    status: 'closed',
    hypothesis: 'Commodity spray from residential proxies; no successful authentications.',
    disposition: 'benign',
    minutesAgo: 12 * DAY,
    closedMinutesAgo: 11 * DAY,
  },
]

export const SEED_INCIDENTS: SeedIncident[] = [
  {
    key: 'inc-phishing',
    title: 'Credential compromise via targeted phishing — Treasury',
    severity: 'critical',
    status: 'declared',
    investigationKey: 'inv-phishing-chain',
    impactSummary: 'One Treasury analyst account compromised. Session revoked; scope of data staging under review. Wire approval flows temporarily require dual control.',
    minutesAgo: 25 * HOUR,
    resolvedMinutesAgo: null,
    timeline: [
      { minutesAgo: 25 * HOUR, kind: 'declared', summary: 'Incident declared from investigation after exfil-volume alert on LT-0447.', actor: 'SOC Shift Lead' },
      { minutesAgo: 24 * HOUR, kind: 'action', summary: 'maya.okafor sessions revoked, password reset forced, LT-0447 network-isolated via EDR.', actor: 'IR On-call' },
      { minutesAgo: 22 * HOUR, kind: 'evidence', summary: 'DLP logs confirm 2.3 GB upload to unsanctioned endpoint; file inventory requested.', actor: 'IR On-call' },
      { minutesAgo: 20 * HOUR, kind: 'note', summary: 'Treasury leadership briefed. Dual-control enforced on wire approvals until further notice.', actor: 'CISO' },
    ],
  },
  {
    key: 'inc-vpn',
    title: 'Ivanti VPN gateway exploitation attempts (CVE-2025-22457)',
    severity: 'high',
    status: 'contained',
    investigationKey: 'inv-vpn-cve',
    impactSummary: 'Gateway patched and rebuilt. No confirmed post-exploitation; dormant service account activity still under review.',
    minutesAgo: 5 * DAY + 6 * HOUR,
    resolvedMinutesAgo: null,
    timeline: [
      { minutesAgo: 5 * DAY + 6 * HOUR, kind: 'declared', summary: 'Declared after exploit signatures matched against vpn-gw-nyc-01.', actor: 'SOC Analyst' },
      { minutesAgo: 5 * DAY + 4 * HOUR, kind: 'action', summary: 'Emergency patch applied; gateway config exported for forensics.', actor: 'Network Engineering' },
      { minutesAgo: 4 * DAY, kind: 'status_change', summary: 'Status → contained. Monitoring for related authentication anomalies.', actor: 'IR Lead' },
      { minutesAgo: 3 * DAY, kind: 'evidence', summary: 'svc-backup VPN session traced to residential IP; account disabled pending review.', actor: 'IR Lead' },
    ],
  },
  {
    key: 'inc-s3',
    title: 'Client statements bucket exposed to public reads',
    severity: 'high',
    status: 'resolved',
    investigationKey: null,
    impactSummary: 'Bucket policy misconfiguration during IaC change exposed s3://mfg-client-statements for 47 minutes. Access logs show no external reads.',
    minutesAgo: 9 * DAY,
    resolvedMinutesAgo: 8 * DAY + 20 * HOUR,
    timeline: [
      { minutesAgo: 9 * DAY, kind: 'declared', summary: 'GuardDuty flagged public ACL on client statements bucket.', actor: 'SOC Analyst' },
      { minutesAgo: 9 * DAY - 47, kind: 'action', summary: 'Public access blocked at account level; offending Terraform change reverted.', actor: 'Cloud Platform' },
      { minutesAgo: 8 * DAY + 20 * HOUR, kind: 'status_change', summary: 'Status → resolved. Access-log review confirmed zero external object reads.', actor: 'IR Lead' },
    ],
  },
  {
    key: 'inc-spray',
    title: 'Password spray campaign against workforce identities',
    severity: 'medium',
    status: 'closed',
    investigationKey: 'inv-password-spray',
    impactSummary: 'Commodity spray; zero successful logins. Source ASNs rate-limited at the edge.',
    minutesAgo: 12 * DAY,
    resolvedMinutesAgo: 11 * DAY,
    timeline: [
      { minutesAgo: 12 * DAY, kind: 'declared', summary: 'Spray pattern across 300+ accounts from residential proxy ranges.', actor: 'SOC Analyst' },
      { minutesAgo: 11 * DAY + 12 * HOUR, kind: 'action', summary: 'Edge rate-limits applied to offending ASNs; conditional access tightened.', actor: 'IAM Engineering' },
      { minutesAgo: 11 * DAY, kind: 'status_change', summary: 'Closed — no successful authentications, activity ceased.', actor: 'SOC Shift Lead' },
    ],
  },
  {
    key: 'inc-malware-lt',
    title: 'Malware infection on Operations workstation',
    severity: 'medium',
    status: 'closed',
    investigationKey: null,
    impactSummary: 'Commodity infostealer quarantined by EDR before execution. Device reimaged out of caution.',
    minutesAgo: 18 * DAY,
    resolvedMinutesAgo: 17 * DAY,
    timeline: [
      { minutesAgo: 18 * DAY, kind: 'declared', summary: 'EDR quarantined RedLine variant delivered via drive-by download.', actor: 'SOC Analyst' },
      { minutesAgo: 17 * DAY + 18 * HOUR, kind: 'action', summary: 'Device reimaged; user credentials rotated as precaution.', actor: 'IT Support' },
      { minutesAgo: 17 * DAY, kind: 'status_change', summary: 'Closed after clean post-reimage scan.', actor: 'SOC Shift Lead' },
    ],
  },
  {
    key: 'inc-dc-flood',
    title: 'Degraded logging pipeline during log storm',
    severity: 'low',
    status: 'closed',
    investigationKey: null,
    impactSummary: 'Misconfigured debug logging flooded the SIEM ingest; 40-minute detection gap on two servers.',
    minutesAgo: 24 * DAY,
    resolvedMinutesAgo: 23 * DAY + 12 * HOUR,
    timeline: [
      { minutesAgo: 24 * DAY, kind: 'declared', summary: 'Ingest lag alarms; debug flag left on after maintenance window.', actor: 'Detection Engineering' },
      { minutesAgo: 23 * DAY + 12 * HOUR, kind: 'status_change', summary: 'Closed — logging normalized, backfill completed, gap documented.', actor: 'Detection Engineering' },
    ],
  },
]

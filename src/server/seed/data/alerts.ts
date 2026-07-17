import type { AlertStatus, Disposition, Severity } from '../../../domain/enums'
import type { Rng } from '../rand'
import { DAY, HOUR, MINUTE } from '../shift'
import type { SeedAsset } from './assets'
import type { SeedIdentity } from './identities'

export type SeedAlert = {
  key: string
  title: string
  description: string
  severity: Severity
  status: AlertStatus
  disposition: Disposition | null
  source: string
  ruleKey: string
  mitreTechniques: string[]
  identityKeys: string[]
  assetKeys: string[]
  minutesAgo: number
  investigationKey: string | null
}

type Rule = {
  ruleKey: string
  title: string
  description: string
  severity: Severity
  source: string
  mitre: string[]
  weight: number
}

const RULES: Rule[] = [
  { ruleKey: 'edr.credential-dumping', title: 'Credential dumping tool execution detected', description: 'Process behavior matching LSASS memory access patterns.', severity: 'critical', source: 'CrowdStrike Falcon', mitre: ['T1003'], weight: 1 },
  { ruleKey: 'idp.impossible-travel', title: 'Impossible travel sign-in', description: 'Successive sign-ins from geographically impossible locations.', severity: 'high', source: 'Okta', mitre: ['T1078'], weight: 4 },
  { ruleKey: 'idp.mfa-fatigue', title: 'MFA push fatigue pattern', description: 'Repeated denied MFA pushes followed by approval.', severity: 'high', source: 'Okta', mitre: ['T1621'], weight: 3 },
  { ruleKey: 'email.phishing-url', title: 'Phishing URL clicked', description: 'User clicked a URL matching known phishing infrastructure.', severity: 'high', source: 'Proofpoint', mitre: ['T1566.002'], weight: 5 },
  { ruleKey: 'edr.suspicious-powershell', title: 'Suspicious PowerShell execution', description: 'Encoded PowerShell command with network callback.', severity: 'high', source: 'CrowdStrike Falcon', mitre: ['T1059.001'], weight: 5 },
  { ruleKey: 'net.c2-beacon', title: 'Potential C2 beaconing', description: 'Periodic outbound connections to a low-reputation domain.', severity: 'critical', source: 'Zeek NDR', mitre: ['T1071'], weight: 2 },
  { ruleKey: 'cloud.s3-public', title: 'S3 bucket policy allows public access', description: 'Bucket ACL changed to allow public reads.', severity: 'high', source: 'AWS GuardDuty', mitre: ['T1530'], weight: 3 },
  { ruleKey: 'cloud.iam-anomaly', title: 'Anomalous IAM API activity', description: 'Unusual volume of IAM enumeration calls.', severity: 'medium', source: 'AWS GuardDuty', mitre: ['T1087'], weight: 5 },
  { ruleKey: 'idp.brute-force', title: 'Password spray attempt', description: 'Multiple failed logins across accounts from one source.', severity: 'medium', source: 'Okta', mitre: ['T1110.003'], weight: 7 },
  { ruleKey: 'edr.malware-quarantined', title: 'Malware detected and quarantined', description: 'Known malware signature blocked on endpoint.', severity: 'medium', source: 'CrowdStrike Falcon', mitre: ['T1204'], weight: 8 },
  { ruleKey: 'dlp.exfil-volume', title: 'Unusual outbound data volume', description: 'Endpoint uploaded significantly more data than baseline.', severity: 'medium', source: 'Netskope DLP', mitre: ['T1567'], weight: 4 },
  { ruleKey: 'net.port-scan', title: 'Internal port scan detected', description: 'Host scanning multiple internal addresses.', severity: 'low', source: 'Zeek NDR', mitre: ['T1046'], weight: 8 },
  { ruleKey: 'email.spam-campaign', title: 'Spam campaign targeting employees', description: 'Bulk unsolicited email wave detected and filtered.', severity: 'low', source: 'Proofpoint', mitre: [], weight: 10 },
  { ruleKey: 'idp.dormant-account-login', title: 'Dormant account sign-in', description: 'Account inactive for 90+ days signed in.', severity: 'low', source: 'Okta', mitre: ['T1078'], weight: 6 },
  { ruleKey: 'vuln.eol-software', title: 'End-of-life software in use', description: 'Endpoint running software past end-of-support.', severity: 'low', source: 'Qualys', mitre: [], weight: 7 },
]

/**
 * The phishing-chain storyline: Maya Okafor receives a payload, credentials
 * are abused, and lateral movement begins. Powers demo narrative + INC-6.
 */
export const STORYLINE_ALERTS: SeedAlert[] = [
  {
    key: 'story-phish-1',
    title: 'Phishing URL clicked',
    description: 'Maya Okafor clicked a link in a "DocuSign settlement notice" email pointing to meridian-secure-docs[.]com, a domain registered 4 days ago.',
    severity: 'high',
    status: 'triaged',
    disposition: null,
    source: 'Proofpoint',
    ruleKey: 'email.phishing-url',
    mitreTechniques: ['T1566.002'],
    identityKeys: ['maya-okafor'],
    assetKeys: ['lt-maya'],
    minutesAgo: 2 * DAY + 5 * HOUR,
    investigationKey: 'inv-phishing-chain',
  },
  {
    key: 'story-phish-2',
    title: 'Suspicious PowerShell execution',
    description: 'Encoded PowerShell on LT-0447 spawning from a macro-enabled document, with callback to meridian-secure-docs[.]com.',
    severity: 'high',
    status: 'triaged',
    disposition: 'malicious',
    source: 'CrowdStrike Falcon',
    ruleKey: 'edr.suspicious-powershell',
    mitreTechniques: ['T1059.001', 'T1204.002'],
    identityKeys: ['maya-okafor'],
    assetKeys: ['lt-maya'],
    minutesAgo: 2 * DAY + 4 * HOUR + 41 * MINUTE,
    investigationKey: 'inv-phishing-chain',
  },
  {
    key: 'story-phish-3',
    title: 'MFA push fatigue pattern',
    description: '7 denied MFA pushes for maya.okafor within 10 minutes, followed by an approval from a new device in Amsterdam.',
    severity: 'high',
    status: 'triaged',
    disposition: 'malicious',
    source: 'Okta',
    ruleKey: 'idp.mfa-fatigue',
    mitreTechniques: ['T1621'],
    identityKeys: ['maya-okafor'],
    assetKeys: [],
    minutesAgo: 1 * DAY + 22 * HOUR,
    investigationKey: 'inv-phishing-chain',
  },
  {
    key: 'story-phish-4',
    title: 'Impossible travel sign-in',
    description: 'maya.okafor signed in from New York and Amsterdam within 31 minutes.',
    severity: 'high',
    status: 'triaged',
    disposition: 'malicious',
    source: 'Okta',
    ruleKey: 'idp.impossible-travel',
    mitreTechniques: ['T1078'],
    identityKeys: ['maya-okafor'],
    assetKeys: ['app-treasury'],
    minutesAgo: 1 * DAY + 21 * HOUR + 29 * MINUTE,
    investigationKey: 'inv-phishing-chain',
  },
  {
    key: 'story-phish-5',
    title: 'Potential C2 beaconing',
    description: 'LT-0447 beaconing every 300s to 185.220.101[.]4 (AS held by bulletproof hosting provider).',
    severity: 'critical',
    status: 'triaged',
    disposition: 'malicious',
    source: 'Zeek NDR',
    ruleKey: 'net.c2-beacon',
    mitreTechniques: ['T1071.001'],
    identityKeys: ['maya-okafor'],
    assetKeys: ['lt-maya'],
    minutesAgo: 1 * DAY + 18 * HOUR,
    investigationKey: 'inv-phishing-chain',
  },
  {
    key: 'story-phish-6',
    title: 'Unusual outbound data volume',
    description: 'LT-0447 uploaded 2.3 GB to an unsanctioned cloud storage endpoint — 40x the device baseline.',
    severity: 'critical',
    status: 'new',
    disposition: null,
    source: 'Netskope DLP',
    ruleKey: 'dlp.exfil-volume',
    mitreTechniques: ['T1567.002'],
    identityKeys: ['maya-okafor'],
    assetKeys: ['lt-maya', 's3-statements'],
    minutesAgo: 26 * HOUR,
    investigationKey: 'inv-phishing-chain',
  },
  // VPN storyline alerts
  {
    key: 'story-vpn-1',
    title: 'Exploit attempt against VPN gateway',
    description: 'HTTP requests matching CVE-2025-22457 exploitation signatures against vpn-gw-nyc-01 from 4 distinct sources.',
    severity: 'critical',
    status: 'triaged',
    disposition: 'malicious',
    source: 'Zeek NDR',
    ruleKey: 'net.vpn-exploit',
    mitreTechniques: ['T1190'],
    identityKeys: [],
    assetKeys: ['vpn-gw-1'],
    minutesAgo: 5 * DAY + 8 * HOUR,
    investigationKey: 'inv-vpn-cve',
  },
  {
    key: 'story-vpn-2',
    title: 'Dormant account sign-in',
    description: 'svc-backup authenticated through VPN for the first time in 140 days, from an unrecognized network.',
    severity: 'high',
    status: 'triaged',
    disposition: 'inconclusive',
    source: 'Okta',
    ruleKey: 'idp.dormant-account-login',
    mitreTechniques: ['T1078.004'],
    identityKeys: ['svc-backup'],
    assetKeys: ['vpn-gw-1', 'srv-backup-1'],
    minutesAgo: 5 * DAY + 6 * HOUR,
    investigationKey: 'inv-vpn-cve',
  },
]

export function buildAlerts(
  rng: Rng,
  identities: SeedIdentity[],
  assets: SeedAsset[],
): SeedAlert[] {
  const generated: SeedAlert[] = []
  const humans = identities.filter((i) => i.type === 'human')
  const devices = assets.filter((a) => a.type === 'device')
  const cloud = assets.filter((a) => a.type === 'cloud_resource')

  const STATUS_BY_AGE = (minutesAgo: number): [AlertStatus, Disposition | null] => {
    if (minutesAgo < 12 * HOUR) return rng.chance(0.8) ? ['new', null] : ['triaged', null]
    if (minutesAgo < 3 * DAY) {
      return rng.weighted([
        [['new', null] as [AlertStatus, Disposition | null], 2],
        [['triaged', null] as [AlertStatus, Disposition | null], 3],
        [['resolved', 'benign'] as [AlertStatus, Disposition | null], 3],
        [['dismissed', 'benign'] as [AlertStatus, Disposition | null], 2],
      ])
    }
    return rng.weighted([
      [['resolved', 'benign'] as [AlertStatus, Disposition | null], 5],
      [['resolved', 'malicious'] as [AlertStatus, Disposition | null], 1],
      [['dismissed', 'benign'] as [AlertStatus, Disposition | null], 3],
      [['triaged', null] as [AlertStatus, Disposition | null], 1],
    ])
  }

  for (let i = 1; i <= 192; i++) {
    const rule = rng.weighted(RULES.map((r) => [r, r.weight] as const))
    const minutesAgo = rng.int(10 * MINUTE, 30 * DAY)
    const [status, disposition] = STATUS_BY_AGE(minutesAgo)

    const cloudRule = rule.ruleKey.startsWith('cloud.')
    const identity = rng.chance(cloudRule ? 0.3 : 0.85) ? rng.pick(humans) : null
    const asset = cloudRule ? rng.pick(cloud) : rng.chance(0.8) ? rng.pick(devices) : null

    generated.push({
      key: `gen-${i}`,
      title: rule.title,
      description: rule.description,
      severity: rule.severity,
      status,
      disposition,
      source: rule.source,
      ruleKey: rule.ruleKey,
      mitreTechniques: rule.mitre,
      identityKeys: identity ? [identity.key] : [],
      assetKeys: asset ? [asset.key] : [],
      minutesAgo,
      investigationKey: null,
    })
  }

  return [...STORYLINE_ALERTS, ...generated]
}

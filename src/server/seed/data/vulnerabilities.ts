import type { Severity, VulnerabilityStatus } from '../../../domain/enums'
import type { Rng } from '../rand'
import { DAY } from '../shift'
import type { SeedAsset } from './assets'

export type SeedVulnerability = {
  key: string
  assetKey: string
  cveId: string | null
  title: string
  cvss: number
  epss: number
  exploitedInWild: boolean
  severity: Severity
  status: VulnerabilityStatus
  fixAvailable: boolean
  minutesAgo: number
  resolvedMinutesAgo: number | null
}

type CveDef = {
  cveId: string | null
  title: string
  cvss: number
  epss: number
  exploited: boolean
  severity: Severity
  fixAvailable: boolean
  appliesTo: (a: SeedAsset) => boolean
}

const CVES: CveDef[] = [
  { cveId: 'CVE-2025-22457', title: 'Ivanti Connect Secure stack buffer overflow (RCE)', cvss: 9.8, epss: 0.94, exploited: true, severity: 'critical', fixAvailable: true, appliesTo: (a) => a.attributes.kind === 'vpn_gateway' },
  { cveId: 'CVE-2025-53770', title: 'SharePoint deserialization RCE ("ToolShell")', cvss: 9.8, epss: 0.9, exploited: true, severity: 'critical', fixAvailable: true, appliesTo: (a) => a.attributes.kind === 'file_server' },
  { cveId: 'CVE-2024-38063', title: 'Windows TCP/IP IPv6 remote code execution', cvss: 9.8, epss: 0.45, exploited: false, severity: 'critical', fixAvailable: true, appliesTo: (a) => String(a.attributes.os ?? '').startsWith('Windows') },
  { cveId: 'CVE-2025-1094', title: 'PostgreSQL psql SQL injection via invalid encoding', cvss: 8.1, epss: 0.3, exploited: true, severity: 'high', fixAvailable: true, appliesTo: (a) => a.attributes.kind === 'db_server' },
  { cveId: 'CVE-2024-6387', title: 'OpenSSH regreSSHion race condition RCE', cvss: 8.1, epss: 0.25, exploited: false, severity: 'high', fixAvailable: true, appliesTo: (a) => String(a.attributes.os ?? '').startsWith('Ubuntu') },
  { cveId: 'CVE-2025-24085', title: 'macOS CoreMedia use-after-free privilege escalation', cvss: 7.8, epss: 0.12, exploited: true, severity: 'high', fixAvailable: true, appliesTo: (a) => String(a.attributes.os ?? '').startsWith('macOS') },
  { cveId: 'CVE-2024-21762', title: 'FortiOS out-of-bounds write', cvss: 9.6, epss: 0.7, exploited: true, severity: 'critical', fixAvailable: true, appliesTo: (a) => a.attributes.kind === 'vpn_gateway' },
  { cveId: null, title: 'TLS certificate expires within 14 days', cvss: 5.3, epss: 0, exploited: false, severity: 'medium', fixAvailable: true, appliesTo: (a) => a.type === 'application' },
  { cveId: null, title: 'S3 bucket without default encryption', cvss: 5.0, epss: 0, exploited: false, severity: 'medium', fixAvailable: true, appliesTo: (a) => a.attributes.service === 's3' },
  { cveId: null, title: 'Security agent version out of date', cvss: 4.0, epss: 0, exploited: false, severity: 'low', fixAvailable: true, appliesTo: (a) => a.attributes.kind === 'laptop' },
  { cveId: null, title: 'Local admin rights not reviewed in 180 days', cvss: 4.4, epss: 0, exploited: false, severity: 'low', fixAvailable: false, appliesTo: (a) => a.attributes.kind === 'laptop' },
  { cveId: 'CVE-2024-3400', title: 'PAN-OS GlobalProtect command injection', cvss: 10.0, epss: 0.92, exploited: true, severity: 'critical', fixAvailable: true, appliesTo: (a) => a.attributes.kind === 'web_server' },
]

export function buildVulnerabilities(rng: Rng, assets: SeedAsset[]): SeedVulnerability[] {
  const out: SeedVulnerability[] = []
  let n = 0

  for (const cve of CVES) {
    const eligible = assets.filter((a) => cve.appliesTo(a))
    // Sample a subset so we land around ~80 instances overall
    const target = cve.cveId === 'CVE-2025-22457' ? eligible.length : Math.min(eligible.length, rng.int(5, 16))
    const chosen = [...eligible].slice(0, target)

    for (const asset of chosen) {
      n++
      const minutesAgo = rng.int(1 * DAY, 45 * DAY)
      const resolved = !cve.exploited && rng.chance(0.35)
      out.push({
        key: `vuln-${n}`,
        assetKey: asset.key,
        cveId: cve.cveId,
        title: cve.title,
        cvss: cve.cvss,
        epss: cve.epss,
        exploitedInWild: cve.exploited,
        severity: cve.severity,
        status: resolved ? 'resolved' : cve.exploited && rng.chance(0.5) ? 'in_progress' : 'open',
        fixAvailable: cve.fixAvailable,
        minutesAgo,
        resolvedMinutesAgo: resolved ? Math.floor(minutesAgo / 2) : null,
      })
    }
  }

  return out
}

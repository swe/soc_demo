'use client'
import { useEffect } from 'react'
import { usePageTitle } from '@/app/page-title-context'

const THREAT_ACTORS = [
  { name: 'APT28 (Fancy Bear)',  country: 'Russia',       sectors: ['Government', 'Military', 'Energy'],               activity: 'high',     lastSeen: '2d ago',  techniques: ['T1566', 'T1078', 'T1059'] },
  { name: 'Lazarus Group',       country: 'North Korea',  sectors: ['Financial', 'Cryptocurrency'],                    activity: 'critical', lastSeen: '1d ago',  techniques: ['T1195', 'T1048', 'T1486'] },
  { name: 'APT29 (Cozy Bear)',   country: 'Russia',       sectors: ['Government', 'Think Tanks'],                      activity: 'medium',   lastSeen: '5d ago',  techniques: ['T1078', 'T1098'] },
  { name: 'APT41',               country: 'China',        sectors: ['Healthcare', 'Technology', 'Telecom'],            activity: 'high',     lastSeen: '3d ago',  techniques: ['T1190', 'T1059'] },
]

const IOCS = [
  { type: 'IP',     value: '192.0.2.146',          threat: 'C2 Server',         confidence: 95, source: 'MISP' },
  { type: 'Domain', value: 'malicious-site.example', threat: 'Phishing',          confidence: 88, source: 'AlienVault' },
  { type: 'Hash',   value: 'a3f5e7b2c8d1f4a9e6b3',  threat: 'Ransomware',         confidence: 92, source: 'VirusTotal' },
  { type: 'Email',  value: 'phish@evil.net',         threat: 'Phishing Campaign',  confidence: 85, source: 'Internal' },
  { type: 'URL',    value: 'http://drop.example/p',  threat: 'Malware Drop',       confidence: 78, source: 'URLhaus' },
  { type: 'IP',     value: '91.219.236.197',         threat: 'Supply Chain C2',    confidence: 97, source: 'Internal' },
]

const CVES = [
  { cve: 'CVE-2024-1234', severity: 'critical', cvss: 9.8, desc: 'Remote Code Execution in Apache Struts',       exploited: true,  daysAgo: 2 },
  { cve: 'CVE-2024-9012', severity: 'critical', cvss: 9.1, desc: 'Authentication Bypass in Enterprise Software', exploited: true,  daysAgo: 1 },
  { cve: 'CVE-2024-5678', severity: 'high',     cvss: 8.1, desc: 'SQL Injection in Web Application',             exploited: false, daysAgo: 5 },
  { cve: 'CVE-2024-2341', severity: 'critical', cvss: 9.5, desc: 'Remote Code Execution in Log4j',               exploited: true,  daysAgo: 4 },
]

const SEV: Record<string, { color: string; bg: string }> = {
  critical: { color: 'var(--soc-critical)', bg: 'var(--soc-critical-bg)' },
  high:     { color: 'var(--soc-high)',     bg: 'var(--soc-high-bg)' },
  medium:   { color: 'var(--soc-medium)',   bg: 'var(--soc-medium-bg)' },
  low:      { color: 'var(--soc-low)',      bg: 'var(--soc-low-bg)' },
}

export default function ThreatIntelligenceOverview() {
  const { setPageTitle } = usePageTitle()
  useEffect(() => { setPageTitle('Threat Intelligence') }, [setPageTitle])

  const criticalActors = THREAT_ACTORS.filter(a => a.activity === 'critical').length

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-6">

      {/* Header */}
      <div className="flex items-start justify-between mb-5 soc-fade-in">
        <div>
          <p className="soc-label mb-1">THREAT INTELLIGENCE</p>
          <h1 className="text-xl font-bold tracking-tight mb-1.5" style={{ color: 'var(--soc-text)' }}>
            Intelligence Overview
          </h1>
          <p className="text-sm" style={{ color: 'var(--soc-text-secondary)' }}>
            {criticalActors > 0 && <><strong style={{ color: 'var(--soc-critical)' }}>{criticalActors} critical threat actor</strong> with active campaigns · </>}
            {IOCS.length} active IOCs · {CVES.filter(c => c.exploited).length} exploited CVEs
          </p>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <button className="soc-btn soc-btn-secondary">Export IOCs</button>
          <button className="soc-btn soc-btn-primary">Add Feed</button>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'THREAT ACTORS', value: THREAT_ACTORS.length, sub: `${criticalActors} critical`, color: 'var(--soc-critical)' },
          { label: 'ACTIVE IOCs',   value: '1,247',              sub: `${IOCS.length} new today`,    color: 'var(--soc-text)' },
          { label: 'CRITICAL CVEs', value: CVES.filter(c => c.severity === 'critical').length, sub: `${CVES.filter(c => c.exploited).length} with exploits`, color: 'var(--soc-critical)' },
          { label: 'FEED SOURCES',  value: '15',                 sub: 'All feeds active',            color: 'var(--soc-low)' },
        ].map(({ label, value, sub, color }) => (
          <div key={label} className="soc-card">
            <p className="soc-label mb-2">{label}</p>
            <p className="soc-metric-sm mb-1" style={{ color }}>{value}</p>
            <p className="text-xs" style={{ color: 'var(--soc-text-muted)' }}>{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-4">

        {/* Left: threat actors + IOCs */}
        <div className="col-span-12 lg:col-span-8 space-y-4">

          {/* Threat actors */}
          <div className="soc-card p-0 overflow-hidden">
            <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--soc-border)' }}>
              <p className="soc-label">ACTIVE THREAT ACTORS</p>
              <span className="text-xs" style={{ color: 'var(--soc-text-muted)' }}>Updated daily</span>
            </div>
            <table className="soc-table">
              <thead>
                <tr>
                  <th>Actor</th>
                  <th>Origin</th>
                  <th>Target Sectors</th>
                  <th>Activity</th>
                  <th>MITRE TTPs</th>
                  <th>Last Seen</th>
                </tr>
              </thead>
              <tbody>
                {THREAT_ACTORS.map((a) => {
                  const s = SEV[a.activity] ?? SEV.medium
                  return (
                    <tr key={a.name}>
                      <td><p className="text-sm font-semibold" style={{ color: 'var(--soc-text)' }}>{a.name}</p></td>
                      <td><span className="text-xs" style={{ color: 'var(--soc-text-secondary)' }}>{a.country}</span></td>
                      <td>
                        <div className="flex gap-1 flex-wrap">
                          {a.sectors.slice(0, 2).map(sec => (
                            <span key={sec} className="soc-badge">{sec}</span>
                          ))}
                          {a.sectors.length > 2 && <span className="soc-badge">+{a.sectors.length - 2}</span>}
                        </div>
                      </td>
                      <td>
                        <span className="soc-badge" style={{ backgroundColor: s.bg, color: s.color }}>
                          {a.activity.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <div className="flex gap-1">
                          {a.techniques.slice(0, 2).map(t => (
                            <span key={t} className="soc-badge font-mono" style={{ backgroundColor: 'var(--soc-critical-bg)', color: 'var(--soc-critical)' }}>{t}</span>
                          ))}
                        </div>
                      </td>
                      <td><span className="text-xs tabular-nums" style={{ color: 'var(--soc-text-muted)' }}>{a.lastSeen}</span></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* IOCs */}
          <div className="soc-card p-0 overflow-hidden">
            <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--soc-border)' }}>
              <p className="soc-label">INDICATORS OF COMPROMISE</p>
              <button className="soc-link text-xs">Export all →</button>
            </div>
            <table className="soc-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Indicator</th>
                  <th>Threat</th>
                  <th className="text-right">Confidence</th>
                  <th>Source</th>
                </tr>
              </thead>
              <tbody>
                {IOCS.map((ioc, i) => (
                  <tr key={i}>
                    <td><span className="soc-badge soc-badge-accent">{ioc.type}</span></td>
                    <td><span className="text-xs font-mono" style={{ color: 'var(--soc-text)' }}>{ioc.value}</span></td>
                    <td><span className="text-xs" style={{ color: 'var(--soc-text-secondary)' }}>{ioc.threat}</span></td>
                    <td className="text-right">
                      <span
                        className="text-sm font-bold tabular-nums"
                        style={{ color: ioc.confidence >= 90 ? 'var(--soc-critical)' : ioc.confidence >= 80 ? 'var(--soc-high)' : 'var(--soc-medium)' }}
                      >
                        {ioc.confidence}%
                      </span>
                    </td>
                    <td><span className="soc-badge">{ioc.source}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: CVEs + feed status */}
        <div className="col-span-12 lg:col-span-4 space-y-4">

          {/* Critical CVEs */}
          <div className="soc-card">
            <p className="soc-label mb-3">CRITICAL CVEs</p>
            <div className="space-y-0">
              {CVES.map((cve, i, arr) => {
                const s = SEV[cve.severity]
                return (
                  <div
                    key={cve.cve}
                    className="py-3"
                    style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--soc-border)' : 'none' }}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <span className="text-xs font-mono font-bold" style={{ color: 'var(--soc-text)' }}>{cve.cve}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold" style={{ color: s.color }}>{cve.cvss}</span>
                        {cve.exploited && <span className="soc-badge soc-badge-critical">EXPLOIT</span>}
                      </div>
                    </div>
                    <p className="text-xs" style={{ color: 'var(--soc-text-secondary)' }}>{cve.desc}</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--soc-text-muted)' }}>Published {cve.daysAgo}d ago</p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Feed health */}
          <div className="soc-card">
            <p className="soc-label mb-3">FEED HEALTH</p>
            {[
              { name: 'MISP',         status: 'active', iocs: 523,  updated: '5m ago' },
              { name: 'AlienVault OTX', status: 'active', iocs: 312,  updated: '12m ago' },
              { name: 'VirusTotal',   status: 'active', iocs: 189,  updated: '3m ago' },
              { name: 'URLhaus',      status: 'active', iocs: 78,   updated: '8m ago' },
              { name: 'Internal',     status: 'active', iocs: 145,  updated: '1m ago' },
            ].map((f, i, arr) => (
              <div
                key={f.name}
                className="flex items-center justify-between py-2.5"
                style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--soc-border)' : 'none' }}
              >
                <div className="flex items-center gap-2">
                  <div className="soc-dot" style={{ backgroundColor: 'var(--soc-low)' }} />
                  <span className="text-xs" style={{ color: 'var(--soc-text)' }}>{f.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs tabular-nums" style={{ color: 'var(--soc-text-muted)' }}>{f.iocs} IOCs</span>
                  <span className="text-xs" style={{ color: 'var(--soc-text-muted)' }}>{f.updated}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

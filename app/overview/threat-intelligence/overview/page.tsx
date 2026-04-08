'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePageTitle } from '@/app/page-title-context'
import {
  OverviewAlert,
  OverviewFilterMenu,
  OverviewKpiRow,
  OverviewModal,
  OverviewPageHeader,
  OverviewPageShell,
  OverviewSection,
  OverviewStepModal,
  OverviewTableToolbar,
  OverviewToggle,
} from '@/components/overview/unified-ui'

const THREAT_ACTORS = [
  { name: 'APT28 (Fancy Bear)', country: 'Russia', sectors: ['Government', 'Military', 'Energy'], activity: 'high', lastSeen: '2d ago', techniques: ['T1566', 'T1078', 'T1059'] },
  { name: 'Lazarus Group', country: 'North Korea', sectors: ['Financial', 'Cryptocurrency'], activity: 'critical', lastSeen: '1d ago', techniques: ['T1195', 'T1048', 'T1486'] },
  { name: 'APT29 (Cozy Bear)', country: 'Russia', sectors: ['Government', 'Think Tanks'], activity: 'medium', lastSeen: '5d ago', techniques: ['T1078', 'T1098'] },
  { name: 'APT41', country: 'China', sectors: ['Healthcare', 'Technology', 'Telecom'], activity: 'high', lastSeen: '3d ago', techniques: ['T1190', 'T1059'] },
]
const IOCS = [
  { type: 'IP', value: '192.0.2.146', threat: 'C2 Server', confidence: 95, source: 'MISP' },
  { type: 'Domain', value: 'malicious-site.example', threat: 'Phishing', confidence: 88, source: 'AlienVault' },
  { type: 'Hash', value: 'a3f5e7b2c8d1f4a9e6b3', threat: 'Ransomware', confidence: 92, source: 'VirusTotal' },
  { type: 'Email', value: 'phish@evil.net', threat: 'Phishing Campaign', confidence: 85, source: 'Internal' },
  { type: 'URL', value: 'http://drop.example/p', threat: 'Malware Drop', confidence: 78, source: 'URLhaus' },
  { type: 'IP', value: '91.219.236.197', threat: 'Supply Chain C2', confidence: 97, source: 'Internal' },
]
const CVES = [
  { cve: 'CVE-2024-1234', severity: 'critical', cvss: 9.8, desc: 'Remote Code Execution in Apache Struts', exploited: true, daysAgo: 2 },
  { cve: 'CVE-2024-9012', severity: 'critical', cvss: 9.1, desc: 'Authentication Bypass in Enterprise Software', exploited: true, daysAgo: 1 },
  { cve: 'CVE-2024-5678', severity: 'high', cvss: 8.1, desc: 'SQL Injection in Web Application', exploited: false, daysAgo: 5 },
  { cve: 'CVE-2024-2341', severity: 'critical', cvss: 9.5, desc: 'Remote Code Execution in Log4j', exploited: true, daysAgo: 4 },
]
const FEED_HEALTH = [
  { name: 'MISP', iocs: 523, updated: '5m ago' },
  { name: 'AlienVault OTX', iocs: 312, updated: '12m ago' },
  { name: 'VirusTotal', iocs: 189, updated: '3m ago' },
  { name: 'URLhaus', iocs: 78, updated: '8m ago' },
  { name: 'Internal', iocs: 145, updated: '1m ago' },
]
const SEV: Record<string, { color: string; bg: string }> = {
  critical: { color: 'var(--soc-critical)', bg: 'var(--soc-critical-bg)' },
  high: { color: 'var(--soc-high)', bg: 'var(--soc-high-bg)' },
  medium: { color: 'var(--soc-medium)', bg: 'var(--soc-medium-bg)' },
}

export default function ThreatIntelligenceOverview() {
  const { setPageTitle } = usePageTitle()
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<string[]>([])
  const [criticalOnly, setCriticalOnly] = useState(false)
  const [exploitedOnly, setExploitedOnly] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const [addFeedOpen, setAddFeedOpen] = useState(false)
  const [feedStep, setFeedStep] = useState(0)
  const [feedName, setFeedName] = useState('MISP Community')
  const [feedUrl, setFeedUrl] = useState('https://misp.local/feed')
  const [feedFrequency, setFeedFrequency] = useState('hourly')
  const [flash, setFlash] = useState<{ tone: 'success' | 'attention'; title: string; description: string } | null>(null)

  useEffect(() => setPageTitle('Threat Intelligence'), [setPageTitle])
  const filterOptions = useMemo(() => [
    { id: 'activity:critical', label: 'Critical', section: 'Actor activity' },
    { id: 'activity:high', label: 'High', section: 'Actor activity' },
    { id: 'activity:medium', label: 'Medium', section: 'Actor activity' },
    { id: 'ioc:critical', label: 'Critical confidence', section: 'IOC confidence' },
    { id: 'ioc:high', label: 'High confidence', section: 'IOC confidence' },
    { id: 'ioc:medium', label: 'Medium confidence', section: 'IOC confidence' },
  ], [])
  useEffect(() => { if (filters.length === 0) setFilters(filterOptions.map((o) => o.id)) }, [filters.length, filterOptions])

  const criticalActors = THREAT_ACTORS.filter((a) => a.activity === 'critical').length
  const visibleActors = THREAT_ACTORS.filter((actor) => {
    const q = query.toLowerCase()
    const selected = filters.filter((f) => f.startsWith('activity:')).map((f) => f.replace('activity:', ''))
    return (selected.length === 0 || selected.includes(actor.activity)) && (!q || actor.name.toLowerCase().includes(q) || actor.country.toLowerCase().includes(q))
  })
  const visibleIocs = IOCS.filter((ioc) => {
    const q = query.toLowerCase()
    const selected = filters.filter((f) => f.startsWith('ioc:')).map((f) => f.replace('ioc:', ''))
    const bucket = ioc.confidence >= 90 ? 'critical' : ioc.confidence >= 80 ? 'high' : 'medium'
    return (selected.length === 0 || selected.includes(bucket)) && (!criticalOnly || ioc.confidence >= 90) && (!q || ioc.value.toLowerCase().includes(q) || ioc.threat.toLowerCase().includes(q))
  })
  const visibleCves = CVES.filter((cve) => !exploitedOnly || cve.exploited)

  return (
    <OverviewPageShell>
      <OverviewPageHeader
        section="THREAT INTELLIGENCE"
        title="Intelligence Overview"
        description={`${criticalActors} critical threat actor${criticalActors === 1 ? '' : 's'} with active campaigns · ${IOCS.length} active IOCs · ${CVES.filter((c) => c.exploited).length} exploited CVEs`}
        actions={[
          { id: 'export', label: 'Export IOCs', variant: 'secondary', onClick: () => setExportOpen(true) },
          { id: 'add-feed', label: 'Add Feed', variant: 'primary', onClick: () => setAddFeedOpen(true) },
        ]}
      />

      {flash && <div className="mb-4"><OverviewAlert tone={flash.tone} title={flash.title} description={flash.description} /></div>}

      <OverviewKpiRow columns={4} items={[
        { label: 'THREAT ACTORS', value: THREAT_ACTORS.length, sub: `${criticalActors} critical`, tone: 'critical' },
        { label: 'ACTIVE IOCs', value: '1,247', sub: `${IOCS.length} new today` },
        { label: 'CRITICAL CVEs', value: CVES.filter((c) => c.severity === 'critical').length, sub: `${CVES.filter((c) => c.exploited).length} with exploits`, tone: 'critical' },
        { label: 'FEED SOURCES', value: 15, sub: 'All feeds active', tone: 'low' },
      ]} />

      <OverviewTableToolbar
        searchValue={query}
        onSearchChange={setQuery}
        searchPlaceholder="Search actor, IOC, source..."
        end={<div className="flex w-full flex-wrap items-center gap-2 sm:justify-end">
          <OverviewFilterMenu options={filterOptions} selected={filters} onApply={setFilters} />
          <div className="flex flex-wrap items-center gap-2">
            <OverviewToggle label="Critical IOCs only" checked={criticalOnly} onChange={setCriticalOnly} />
            <OverviewToggle label="Exploited CVEs only" checked={exploitedOnly} onChange={setExploitedOnly} />
          </div>
        </div>}
      />

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 space-y-4 lg:col-span-8">
          <OverviewSection title="ACTIVE THREAT ACTORS" right={<span className="text-xs text-[color:var(--soc-text-muted)]">Updated daily</span>} flush>
            <table className="soc-table">
              <thead><tr><th>Actor</th><th>Origin</th><th>Target Sectors</th><th>Activity</th><th>MITRE TTPs</th><th>Last Seen</th></tr></thead>
              <tbody>
                {visibleActors.map((a) => <tr key={a.name}>
                  <td><p className="text-sm font-semibold text-[color:var(--soc-text)]">{a.name}</p></td>
                  <td><span className="text-xs text-[color:var(--soc-text-secondary)]">{a.country}</span></td>
                  <td><div className="flex flex-wrap gap-1">{a.sectors.slice(0, 2).map((s) => <span key={s} className="soc-badge">{s}</span>)}{a.sectors.length > 2 && <span className="soc-badge">+{a.sectors.length - 2}</span>}</div></td>
                  <td><span className="soc-badge" style={{ backgroundColor: SEV[a.activity].bg, color: SEV[a.activity].color }}>{a.activity.toUpperCase()}</span></td>
                  <td><div className="flex gap-1">{a.techniques.slice(0, 2).map((t) => <span key={t} className="soc-badge font-mono" style={{ backgroundColor: 'var(--soc-critical-bg)', color: 'var(--soc-critical)' }}>{t}</span>)}</div></td>
                  <td><span className="text-xs text-[color:var(--soc-text-muted)]">{a.lastSeen}</span></td>
                </tr>)}
              </tbody>
            </table>
          </OverviewSection>

          <OverviewSection title="INDICATORS OF COMPROMISE" right={<button type="button" className="soc-link text-xs" onClick={() => setExportOpen(true)}>Export all →</button>} flush>
            <table className="soc-table">
              <thead><tr><th>Type</th><th>Indicator</th><th>Threat</th><th className="text-right">Confidence</th><th>Source</th></tr></thead>
              <tbody>
                {visibleIocs.map((ioc) => <tr key={ioc.value}>
                  <td><span className="soc-badge soc-badge-accent">{ioc.type}</span></td>
                  <td><span className="text-xs font-mono text-[color:var(--soc-text)]">{ioc.value}</span></td>
                  <td><span className="text-xs text-[color:var(--soc-text-secondary)]">{ioc.threat}</span></td>
                  <td className="text-right"><span className="text-sm font-bold tabular-nums" style={{ color: ioc.confidence >= 90 ? 'var(--soc-critical)' : ioc.confidence >= 80 ? 'var(--soc-high)' : 'var(--soc-medium)' }}>{ioc.confidence}%</span></td>
                  <td><span className="soc-badge">{ioc.source}</span></td>
                </tr>)}
              </tbody>
            </table>
          </OverviewSection>
        </div>

        <div className="col-span-12 space-y-4 lg:col-span-4">
          <OverviewSection title="CRITICAL CVEs">
            <div className="px-4 py-1">
              {visibleCves.map((cve, i) => <div key={cve.cve} className="py-3" style={{ borderBottom: i < visibleCves.length - 1 ? '1px solid var(--soc-border)' : 'none' }}>
                <div className="mb-1 flex items-start justify-between"><span className="text-xs font-mono font-bold text-[color:var(--soc-text)]">{cve.cve}</span><div className="flex items-center gap-1.5"><span className="text-xs font-bold" style={{ color: SEV[cve.severity].color }}>{cve.cvss}</span>{cve.exploited && <span className="soc-badge soc-badge-critical">EXPLOIT</span>}</div></div>
                <p className="text-xs text-[color:var(--soc-text-secondary)]">{cve.desc}</p><p className="mt-1 text-xs text-[color:var(--soc-text-muted)]">Published {cve.daysAgo}d ago</p>
              </div>)}
            </div>
          </OverviewSection>
          <OverviewSection title="FEED HEALTH">
            <div className="px-4 py-1">
              {FEED_HEALTH.map((f, i) => <div key={f.name} className="flex items-center justify-between py-2.5" style={{ borderBottom: i < FEED_HEALTH.length - 1 ? '1px solid var(--soc-border)' : 'none' }}>
                <div className="flex items-center gap-2"><div className="soc-dot" style={{ backgroundColor: 'var(--soc-low)' }} /><span className="text-xs text-[color:var(--soc-text)]">{f.name}</span></div>
                <div className="flex items-center gap-3"><span className="text-xs tabular-nums text-[color:var(--soc-text-muted)]">{f.iocs} IOCs</span><span className="text-xs text-[color:var(--soc-text-muted)]">{f.updated}</span></div>
              </div>)}
            </div>
          </OverviewSection>
        </div>
      </div>

      <OverviewModal
        open={exportOpen}
        title="Export IOCs"
        subtitle="THREAT INTELLIGENCE"
        onClose={() => setExportOpen(false)}
        footer={<div className="flex gap-2 sm:justify-end"><button type="button" className="soc-btn soc-btn-secondary" onClick={() => setExportOpen(false)}>Close</button><button type="button" className="soc-btn soc-btn-primary" onClick={() => { setFlash({ tone: 'success', title: 'IOC export prepared', description: `${visibleIocs.length} rows are ready for download.` }); setExportOpen(false) }}>Start export</button></div>}
      >
        <p className="text-sm text-[color:var(--soc-text-secondary)]">This export uses current table filters and includes the active IOC visibility scope.</p>
      </OverviewModal>

      <OverviewStepModal
        open={addFeedOpen}
        subtitle="ADD FEED"
        currentStep={feedStep}
        onStepChange={setFeedStep}
        onClose={() => { setAddFeedOpen(false); setFeedStep(0) }}
        onFinish={() => { setAddFeedOpen(false); setFeedStep(0); setFlash({ tone: 'attention', title: 'Feed added to intake', description: `${feedName} (${feedFrequency}) will start syncing after validation.` }) }}
        steps={[
          { id: 'source', title: 'Step 1: Source', canProceed: () => feedName.trim().length > 2 && feedUrl.trim().length > 5, validationHint: 'Provide a feed name and URL.', content: <div className="grid gap-3 sm:grid-cols-2"><label className="text-xs font-medium text-[color:var(--soc-text-secondary)]">Feed name<input className="soc-input mt-1 w-full text-sm" value={feedName} onChange={(e) => setFeedName(e.target.value)} /></label><label className="text-xs font-medium text-[color:var(--soc-text-secondary)]">Source URL<input className="soc-input mt-1 w-full text-sm" value={feedUrl} onChange={(e) => setFeedUrl(e.target.value)} /></label></div> },
          { id: 'cadence', title: 'Step 2: Cadence', content: <label className="text-xs font-medium text-[color:var(--soc-text-secondary)]">Sync frequency<select className="soc-input mt-1 w-full text-sm" value={feedFrequency} onChange={(e) => setFeedFrequency(e.target.value)}><option value="hourly">Hourly</option><option value="realtime">Real-time</option></select></label> },
          { id: 'review', title: 'Step 3: Review', content: <div className="space-y-2 rounded-md border p-3 text-sm text-[color:var(--soc-text-secondary)]" style={{ borderColor: 'var(--soc-border)', backgroundColor: 'var(--soc-raised)' }}><p><strong style={{ color: 'var(--soc-text)' }}>Name:</strong> {feedName}</p><p><strong style={{ color: 'var(--soc-text)' }}>URL:</strong> {feedUrl}</p><p><strong style={{ color: 'var(--soc-text)' }}>Frequency:</strong> {feedFrequency}</p></div> },
        ]}
      />
    </OverviewPageShell>
  )
}

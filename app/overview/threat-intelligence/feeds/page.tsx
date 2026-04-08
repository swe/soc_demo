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

interface ThreatFeed {
  id: string
  name: string
  provider: string
  type: 'open-source' | 'commercial' | 'internal'
  status: 'active' | 'inactive' | 'error'
  indicators: number
  lastUpdate: string
  updateFrequency: string
  coverage: string[]
  reliability: number
}

const BASE_FEEDS: ThreatFeed[] = [
  { id: 'misp-1', name: 'MISP Threat Sharing', provider: 'MISP Project', type: 'open-source', status: 'active', indicators: 1247, lastUpdate: '2m ago', updateFrequency: 'Real-time', coverage: ['Malware', 'Network', 'Email'], reliability: 95 },
  { id: 'alienvault-1', name: 'AlienVault OTX', provider: 'AT&T Cybersecurity', type: 'open-source', status: 'active', indicators: 892, lastUpdate: '5m ago', updateFrequency: 'Every 5 minutes', coverage: ['IPs', 'Domains', 'Hashes'], reliability: 88 },
  { id: 'abuse-1', name: 'Abuse.ch URLhaus', provider: 'Abuse.ch', type: 'open-source', status: 'active', indicators: 456, lastUpdate: '10m ago', updateFrequency: 'Every 15 minutes', coverage: ['URLs', 'Malware'], reliability: 92 },
  { id: 'virustotal-1', name: 'VirusTotal Intelligence', provider: 'Google', type: 'commercial', status: 'active', indicators: 2341, lastUpdate: '1m ago', updateFrequency: 'Real-time', coverage: ['Hashes', 'Files', 'URLs', 'Domains'], reliability: 98 },
  { id: 'crowdstrike-1', name: 'CrowdStrike Intel', provider: 'CrowdStrike', type: 'commercial', status: 'active', indicators: 1567, lastUpdate: '3m ago', updateFrequency: 'Every 2 minutes', coverage: ['APT', 'Malware', 'Indicators'], reliability: 96 },
  { id: 'internal-1', name: 'Internal Threat Feed', provider: 'Your Organization', type: 'internal', status: 'active', indicators: 234, lastUpdate: '30m ago', updateFrequency: 'Hourly', coverage: ['Custom', 'Internal'], reliability: 100 },
  { id: 'emerging-1', name: 'Emerging Threats', provider: 'Proofpoint', type: 'commercial', status: 'error', indicators: 0, lastUpdate: '2h ago', updateFrequency: 'Every hour', coverage: ['Network', 'IDS/IPS'], reliability: 0 },
]

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  active: { color: 'var(--soc-low)', bg: 'var(--soc-low-bg)', label: 'Active' },
  inactive: { color: 'var(--soc-text-muted)', bg: 'transparent', label: 'Inactive' },
  error: { color: 'var(--soc-critical)', bg: 'var(--soc-critical-bg)', label: 'Error' },
}
const TYPE_COLOR: Record<string, string> = {
  'open-source': 'var(--soc-accent)',
  commercial: 'var(--soc-medium)',
  internal: 'var(--soc-low)',
}

export default function ThreatFeeds() {
  const { setPageTitle } = usePageTitle()
  const [feeds, setFeeds] = useState(BASE_FEEDS)
  const [selected, setSelected] = useState<ThreatFeed | null>(null)
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<string[]>([])
  const [errorsOnly, setErrorsOnly] = useState(false)
  const [activeOnly, setActiveOnly] = useState(false)
  const [syncAllOpen, setSyncAllOpen] = useState(false)
  const [addFeedOpen, setAddFeedOpen] = useState(false)
  const [addFeedStep, setAddFeedStep] = useState(0)
  const [configureOpen, setConfigureOpen] = useState(false)
  const [toggleOpen, setToggleOpen] = useState(false)
  const [flash, setFlash] = useState<{ tone: 'success' | 'attention'; title: string; description: string } | null>(null)

  useEffect(() => setPageTitle('Threat Feeds'), [setPageTitle])
  const filterOptions = useMemo(() => [
    { id: 'type:open-source', label: 'Open-source', section: 'Feed type' },
    { id: 'type:commercial', label: 'Commercial', section: 'Feed type' },
    { id: 'type:internal', label: 'Internal', section: 'Feed type' },
    { id: 'status:active', label: 'Active', section: 'Status' },
    { id: 'status:inactive', label: 'Inactive', section: 'Status' },
    { id: 'status:error', label: 'Error', section: 'Status' },
  ], [])
  useEffect(() => { if (filters.length === 0) setFilters(filterOptions.map((o) => o.id)) }, [filters.length, filterOptions])

  const visible = feeds.filter((feed) => {
    const q = query.toLowerCase()
    const type = filters.filter((f) => f.startsWith('type:')).map((f) => f.replace('type:', ''))
    const status = filters.filter((f) => f.startsWith('status:')).map((f) => f.replace('status:', ''))
    return (type.length === 0 || type.includes(feed.type)) &&
      (status.length === 0 || status.includes(feed.status)) &&
      (!errorsOnly || feed.status === 'error') &&
      (!activeOnly || feed.status === 'active') &&
      (!q || feed.name.toLowerCase().includes(q) || feed.provider.toLowerCase().includes(q))
  })

  const activeFeeds = feeds.filter((f) => f.status === 'active').length
  const totalIndicators = feeds.reduce((sum, feed) => sum + feed.indicators, 0)
  const avgReliability = Math.round(feeds.filter((f) => f.status === 'active').reduce((sum, feed) => sum + feed.reliability, 0) / Math.max(activeFeeds, 1))
  const errorFeeds = feeds.filter((f) => f.status === 'error').length
  const reliabilityColor = (value: number) => (value >= 90 ? 'var(--soc-low)' : value >= 70 ? 'var(--soc-medium)' : 'var(--soc-critical)')

  return (
    <OverviewPageShell>
      <OverviewPageHeader
        section="THREAT INTELLIGENCE"
        title="Threat Intelligence Feeds"
        description={`${activeFeeds} active feeds · ${totalIndicators.toLocaleString()} total indicators${errorFeeds ? ` · ${errorFeeds} error` : ''}`}
        actions={[
          { id: 'sync-all', label: 'Sync All', variant: 'secondary', onClick: () => setSyncAllOpen(true) },
          { id: 'add-feed', label: 'Add Feed', variant: 'primary', onClick: () => setAddFeedOpen(true) },
        ]}
      />

      {flash && <div className="mb-4"><OverviewAlert tone={flash.tone} title={flash.title} description={flash.description} /></div>}

      <OverviewKpiRow columns={4} items={[
        { label: 'TOTAL FEEDS', value: feeds.length, sub: `${activeFeeds} active` },
        { label: 'TOTAL INDICATORS', value: totalIndicators.toLocaleString(), sub: 'Across all sources', tone: 'accent' },
        { label: 'AVG RELIABILITY', value: `${avgReliability}%`, sub: 'Active feeds only', tone: avgReliability >= 90 ? 'low' : avgReliability >= 70 ? 'medium' : 'critical' },
        { label: 'FEED ERRORS', value: errorFeeds, sub: errorFeeds ? 'Needs attention' : 'All healthy', tone: errorFeeds ? 'critical' : 'low' },
      ]} />

      <OverviewTableToolbar
        searchValue={query}
        onSearchChange={setQuery}
        searchPlaceholder="Search feed or provider..."
        end={<div className="flex w-full flex-wrap items-center gap-2 sm:justify-end">
          <OverviewFilterMenu options={filterOptions} selected={filters} onApply={setFilters} />
          <div className="flex flex-wrap items-center gap-2">
            <OverviewToggle label="Errors only" checked={errorsOnly} onChange={setErrorsOnly} />
            <OverviewToggle label="Active only" checked={activeOnly} onChange={setActiveOnly} />
          </div>
        </div>}
      />

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 space-y-4 lg:col-span-8">
          <OverviewSection title="THREAT FEEDS" flush>
            <table className="soc-table">
              <thead><tr><th>Feed</th><th>Provider</th><th>Type</th><th className="text-right">Indicators</th><th className="text-right">Reliability</th><th>Frequency</th><th>Status</th><th>Updated</th></tr></thead>
              <tbody>
                {visible.map((feed) => <tr key={feed.id} className="cursor-pointer" onClick={() => setSelected(feed)}>
                  <td><p className="text-sm font-medium text-[color:var(--soc-text)]">{feed.name}</p></td>
                  <td><span className="text-xs text-[color:var(--soc-text-secondary)]">{feed.provider}</span></td>
                  <td><span className="soc-badge" style={{ color: TYPE_COLOR[feed.type], border: `1px solid ${TYPE_COLOR[feed.type]}44`, background: 'transparent' }}>{feed.type}</span></td>
                  <td className="text-right"><span className="text-sm font-bold tabular-nums text-[color:var(--soc-text)]">{feed.indicators.toLocaleString()}</span></td>
                  <td className="text-right"><span className="text-sm font-bold tabular-nums" style={{ color: reliabilityColor(feed.reliability) }}>{feed.reliability > 0 ? `${feed.reliability}%` : '—'}</span></td>
                  <td><span className="text-xs text-[color:var(--soc-text-muted)]">{feed.updateFrequency}</span></td>
                  <td><span className="soc-badge" style={{ backgroundColor: STATUS_CONFIG[feed.status].bg, color: STATUS_CONFIG[feed.status].color }}>{STATUS_CONFIG[feed.status].label}</span></td>
                  <td><span className="text-xs text-[color:var(--soc-text-muted)]">{feed.lastUpdate}</span></td>
                </tr>)}
              </tbody>
            </table>
          </OverviewSection>
        </div>

        <div className="col-span-12 space-y-4 lg:col-span-4">
          <OverviewSection title="RELIABILITY SCORES">
            <div className="space-y-2.5 px-4 py-3">
              {[...feeds].sort((a, b) => b.reliability - a.reliability).map((feed) => <div key={feed.id}>
                <div className="mb-1 flex items-center justify-between"><span className="text-xs text-[color:var(--soc-text-secondary)]">{feed.name.length > 22 ? `${feed.name.slice(0, 22)}...` : feed.name}</span><span className="text-xs font-semibold" style={{ color: reliabilityColor(feed.reliability) }}>{feed.reliability > 0 ? `${feed.reliability}%` : 'Error'}</span></div>
                <div className="soc-progress-track"><div className="soc-progress-fill" style={{ width: `${feed.reliability}%`, backgroundColor: reliabilityColor(feed.reliability) }} /></div>
              </div>)}
            </div>
          </OverviewSection>

          <OverviewSection title="INDICATORS BY FEED">
            <div className="px-4 py-1">
              {[...feeds].filter((feed) => feed.indicators > 0).sort((a, b) => b.indicators - a.indicators).map((feed, i, arr) => <div key={feed.id} className="flex items-center justify-between py-2.5" style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--soc-border)' : 'none' }}>
                <div><p className="text-xs font-medium text-[color:var(--soc-text)]">{feed.name.length > 20 ? `${feed.name.slice(0, 20)}...` : feed.name}</p><p className="mt-0.5 text-xs text-[color:var(--soc-text-muted)]">{feed.provider}</p></div>
                <span className="text-sm font-bold tabular-nums text-[color:var(--soc-accent)]">{feed.indicators.toLocaleString()}</span>
              </div>)}
            </div>
          </OverviewSection>
        </div>
      </div>

      <OverviewModal
        open={syncAllOpen}
        title="Sync all feeds"
        subtitle="THREAT INTELLIGENCE"
        onClose={() => setSyncAllOpen(false)}
        footer={<div className="flex gap-2 sm:justify-end"><button type="button" className="soc-btn soc-btn-secondary" onClick={() => setSyncAllOpen(false)}>Cancel</button><button type="button" className="soc-btn soc-btn-primary" onClick={() => { setFlash({ tone: 'success', title: 'Feed sync started', description: `${activeFeeds} active feeds are now syncing.` }); setSyncAllOpen(false) }}>Confirm sync</button></div>}
      >
        <p className="text-sm text-[color:var(--soc-text-secondary)]">This action triggers immediate synchronization for all active feeds and refreshes IOC ingestion counters.</p>
      </OverviewModal>

      <OverviewStepModal
        open={addFeedOpen}
        subtitle="ADD FEED"
        currentStep={addFeedStep}
        onStepChange={setAddFeedStep}
        onClose={() => { setAddFeedOpen(false); setAddFeedStep(0) }}
        onFinish={() => { setAddFeedOpen(false); setAddFeedStep(0); setFlash({ tone: 'attention', title: 'Feed intake created', description: 'A new feed record was added for validation.' }) }}
        steps={[
          { id: 'identity', title: 'Step 1: Identity', content: <div className="grid gap-3 sm:grid-cols-2"><label className="text-xs font-medium text-[color:var(--soc-text-secondary)]">Feed name<input className="soc-input mt-1 w-full text-sm" defaultValue="New feed" /></label><label className="text-xs font-medium text-[color:var(--soc-text-secondary)]">Provider<input className="soc-input mt-1 w-full text-sm" defaultValue="Provider name" /></label></div> },
          { id: 'type', title: 'Step 2: Type', content: <label className="text-xs font-medium text-[color:var(--soc-text-secondary)]">Feed type<select className="soc-input mt-1 w-full text-sm"><option>Open-source</option><option>Commercial</option><option>Internal</option></select></label> },
          { id: 'review', title: 'Step 3: Review', content: <p className="text-sm text-[color:var(--soc-text-secondary)]">Submitting this wizard creates a new feed integration request in pending state.</p> },
        ]}
      />

      <OverviewModal
        open={!!selected}
        title={selected?.name ?? ''}
        subtitle={selected?.id}
        onClose={() => setSelected(null)}
        maxWidth="max-w-xl"
        footer={<div className="flex gap-2 sm:justify-end"><button type="button" className="soc-btn soc-btn-secondary" onClick={() => setSelected(null)}>Close</button><button type="button" className="soc-btn soc-btn-primary" onClick={() => setConfigureOpen(true)}>Configure</button><button type="button" className="soc-btn soc-btn-secondary" onClick={() => setToggleOpen(true)}>{selected?.status === 'active' ? 'Disable Feed' : 'Enable Feed'}</button></div>}
      >
        {selected && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2"><span className="soc-badge" style={{ backgroundColor: STATUS_CONFIG[selected.status].bg, color: STATUS_CONFIG[selected.status].color }}>{STATUS_CONFIG[selected.status].label}</span><span className="soc-badge" style={{ color: TYPE_COLOR[selected.type], border: `1px solid ${TYPE_COLOR[selected.type]}44`, background: 'transparent' }}>{selected.type}</span></div>
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Provider', selected.provider],
                ['Reliability', selected.reliability > 0 ? `${selected.reliability}%` : 'N/A'],
                ['Indicators', selected.indicators.toLocaleString()],
                ['Frequency', selected.updateFrequency],
              ].map(([label, value]) => <div key={label} className="rounded-md border p-3" style={{ borderColor: 'var(--soc-border)', backgroundColor: 'var(--soc-raised)' }}><p className="soc-label mb-1">{label}</p><p className="text-sm font-medium text-[color:var(--soc-text)]">{value}</p></div>)}
            </div>
          </div>
        )}
      </OverviewModal>

      <OverviewModal
        open={configureOpen && !!selected}
        title="Configure feed"
        subtitle={selected?.id}
        onClose={() => setConfigureOpen(false)}
        footer={<div className="flex gap-2 sm:justify-end"><button type="button" className="soc-btn soc-btn-secondary" onClick={() => setConfigureOpen(false)}>Cancel</button><button type="button" className="soc-btn soc-btn-primary" onClick={() => { setFlash({ tone: 'success', title: 'Feed configuration saved', description: `${selected?.name} settings were updated.` }); setConfigureOpen(false) }}>Save changes</button></div>}
      >
        <p className="text-sm text-[color:var(--soc-text-secondary)]">Apply ingestion throttling, key rotation, and routing changes for this feed.</p>
      </OverviewModal>

      <OverviewModal
        open={toggleOpen && !!selected}
        title={selected?.status === 'active' ? 'Disable feed' : 'Enable feed'}
        subtitle={selected?.id}
        onClose={() => setToggleOpen(false)}
        footer={<div className="flex gap-2 sm:justify-end"><button type="button" className="soc-btn soc-btn-secondary" onClick={() => setToggleOpen(false)}>Cancel</button><button type="button" className="soc-btn soc-btn-primary" onClick={() => { if (selected) { const nextStatus = selected.status === 'active' ? 'inactive' : 'active'; setFeeds((prev) => prev.map((feed) => feed.id === selected.id ? { ...feed, status: nextStatus } : feed)); setSelected((prev) => prev ? { ...prev, status: nextStatus } : prev); setFlash({ tone: 'attention', title: `${selected.name} is now ${nextStatus}`, description: 'Feed state was updated and reflected in monitoring KPIs.' }) } setToggleOpen(false) }}>Confirm</button></div>}
      >
        <p className="text-sm text-[color:var(--soc-text-secondary)]">Changing status will affect ingestion and visibility in active feed summaries.</p>
      </OverviewModal>
    </OverviewPageShell>
  )
}

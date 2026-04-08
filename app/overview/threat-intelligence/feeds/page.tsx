'use client'
import { useEffect, useState } from 'react'
import { usePageTitle } from '@/app/page-title-context'

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

const FEEDS: ThreatFeed[] = [
  { id: 'misp-1',        name: 'MISP Threat Sharing',      provider: 'MISP Project',        type: 'open-source', status: 'active',   indicators: 1247, lastUpdate: '2m ago',    updateFrequency: 'Real-time',       coverage: ['Malware', 'Network', 'Email'],        reliability: 95 },
  { id: 'alienvault-1',  name: 'AlienVault OTX',           provider: 'AT&T Cybersecurity',  type: 'open-source', status: 'active',   indicators: 892,  lastUpdate: '5m ago',    updateFrequency: 'Every 5 minutes', coverage: ['IPs', 'Domains', 'Hashes'],           reliability: 88 },
  { id: 'abuse-1',       name: 'Abuse.ch URLhaus',          provider: 'Abuse.ch',            type: 'open-source', status: 'active',   indicators: 456,  lastUpdate: '10m ago',   updateFrequency: 'Every 15 minutes',coverage: ['URLs', 'Malware'],                   reliability: 92 },
  { id: 'virustotal-1',  name: 'VirusTotal Intelligence',   provider: 'Google',              type: 'commercial',  status: 'active',   indicators: 2341, lastUpdate: '1m ago',    updateFrequency: 'Real-time',       coverage: ['Hashes', 'Files', 'URLs', 'Domains'],reliability: 98 },
  { id: 'crowdstrike-1', name: 'CrowdStrike Intel',         provider: 'CrowdStrike',         type: 'commercial',  status: 'active',   indicators: 1567, lastUpdate: '3m ago',    updateFrequency: 'Every 2 minutes', coverage: ['APT', 'Malware', 'Indicators'],       reliability: 96 },
  { id: 'internal-1',    name: 'Internal Threat Feed',      provider: 'Your Organization',   type: 'internal',    status: 'active',   indicators: 234,  lastUpdate: '30m ago',   updateFrequency: 'Hourly',          coverage: ['Custom', 'Internal'],                reliability: 100 },
  { id: 'emerging-1',    name: 'Emerging Threats',          provider: 'Proofpoint',          type: 'commercial',  status: 'error',    indicators: 0,    lastUpdate: '2h ago',    updateFrequency: 'Every hour',      coverage: ['Network', 'IDS/IPS'],                reliability: 0 },
]

const TYPE_COLOR: Record<string, string> = {
  'open-source': 'var(--soc-accent)',
  'commercial':  'var(--soc-medium)',
  'internal':    'var(--soc-low)',
}

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  active:   { color: 'var(--soc-low)',      bg: 'var(--soc-low-bg)',      label: 'Active' },
  inactive: { color: 'var(--soc-text-muted)', bg: 'transparent',           label: 'Inactive' },
  error:    { color: 'var(--soc-critical)', bg: 'var(--soc-critical-bg)', label: 'Error' },
}

export default function ThreatFeeds() {
  const { setPageTitle } = usePageTitle()
  const [filterType, setFilterType] = useState('all')
  const [selected, setSelected] = useState<ThreatFeed | null>(null)

  useEffect(() => { setPageTitle('Threat Feeds') }, [setPageTitle])

  const visible = filterType === 'all' ? FEEDS : FEEDS.filter(f => f.type === filterType)

  const activeFeeds = FEEDS.filter(f => f.status === 'active').length
  const totalIndicators = FEEDS.reduce((s, f) => s + f.indicators, 0)
  const avgReliability = Math.round(FEEDS.filter(f => f.status === 'active').reduce((s, f) => s + f.reliability, 0) / activeFeeds)
  const errorFeeds = FEEDS.filter(f => f.status === 'error').length

  const reliabilityColor = (r: number) =>
    r >= 90 ? 'var(--soc-low)' : r >= 70 ? 'var(--soc-medium)' : 'var(--soc-critical)'

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-6">

      {/* Header */}
      <div className="flex items-start justify-between mb-5 soc-fade-in">
        <div>
          <p className="soc-label mb-1">THREAT INTELLIGENCE</p>
          <h1 className="text-xl font-bold tracking-tight mb-1.5" style={{ color: 'var(--soc-text)' }}>
            Threat Intelligence Feeds
          </h1>
          <p className="text-sm" style={{ color: 'var(--soc-text-secondary)' }}>
            <strong style={{ color: 'var(--soc-low)' }}>{activeFeeds}</strong> active feeds ·{' '}
            <strong style={{ color: 'var(--soc-text)' }}>{totalIndicators.toLocaleString()}</strong> total indicators
            {errorFeeds > 0 && <> · <strong style={{ color: 'var(--soc-critical)' }}>{errorFeeds} error</strong></>}
          </p>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <button className="soc-btn soc-btn-secondary">Sync All</button>
          <button className="soc-btn soc-btn-primary">Add Feed</button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'TOTAL FEEDS',      value: FEEDS.length,                  sub: `${activeFeeds} active`,              color: 'var(--soc-text)' },
          { label: 'TOTAL INDICATORS', value: totalIndicators.toLocaleString(), sub: 'Across all sources',              color: 'var(--soc-accent)' },
          { label: 'AVG RELIABILITY',  value: `${avgReliability}%`,           sub: 'Active feeds only',                 color: reliabilityColor(avgReliability) },
          { label: 'FEED ERRORS',      value: errorFeeds,                     sub: errorFeeds > 0 ? 'Needs attention' : 'All healthy', color: errorFeeds > 0 ? 'var(--soc-critical)' : 'var(--soc-low)' },
        ].map(({ label, value, sub, color }) => (
          <div key={label} className="soc-card">
            <p className="soc-label mb-2">{label}</p>
            <p className="soc-metric-sm mb-1" style={{ color }}>{value}</p>
            <p className="text-xs" style={{ color: 'var(--soc-text-muted)' }}>{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-4">

        {/* Main feed table */}
        <div className="col-span-12 lg:col-span-8 space-y-3">
          <div className="flex items-center gap-1 flex-wrap">
            {['all', 'open-source', 'commercial', 'internal'].map(t => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className="soc-btn text-xs"
                style={filterType === t
                  ? { backgroundColor: 'var(--soc-accent)', borderColor: 'var(--soc-accent)', color: '#fff' }
                  : { borderColor: 'var(--soc-border-mid)', color: 'var(--soc-text-secondary)', background: 'transparent' }}
              >
                {t === 'all' ? 'All Types' : t.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join('-')}
              </button>
            ))}
          </div>

          <div className="soc-card p-0 overflow-hidden">
            <table className="soc-table">
              <thead>
                <tr>
                  <th>Feed</th>
                  <th>Provider</th>
                  <th>Type</th>
                  <th className="text-right">Indicators</th>
                  <th className="text-right">Reliability</th>
                  <th>Frequency</th>
                  <th>Status</th>
                  <th>Updated</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((f) => {
                  const sc = STATUS_CONFIG[f.status]
                  return (
                    <tr key={f.id} className="cursor-pointer" onClick={() => setSelected(f)}>
                      <td><p className="text-sm font-medium" style={{ color: 'var(--soc-text)' }}>{f.name}</p></td>
                      <td><span className="text-xs" style={{ color: 'var(--soc-text-secondary)' }}>{f.provider}</span></td>
                      <td>
                        <span className="soc-badge" style={{ color: TYPE_COLOR[f.type], border: `1px solid ${TYPE_COLOR[f.type]}44`, background: 'transparent' }}>
                          {f.type}
                        </span>
                      </td>
                      <td className="text-right">
                        <span className="text-sm font-bold tabular-nums" style={{ color: 'var(--soc-text)' }}>
                          {f.indicators.toLocaleString()}
                        </span>
                      </td>
                      <td className="text-right">
                        <span className="text-sm font-bold tabular-nums" style={{ color: reliabilityColor(f.reliability) }}>
                          {f.reliability > 0 ? `${f.reliability}%` : '—'}
                        </span>
                      </td>
                      <td><span className="text-xs" style={{ color: 'var(--soc-text-muted)' }}>{f.updateFrequency}</span></td>
                      <td>
                        <span className="soc-badge" style={{ backgroundColor: sc.bg, color: sc.color }}>{sc.label}</span>
                      </td>
                      <td><span className="text-xs tabular-nums" style={{ color: 'var(--soc-text-muted)' }}>{f.lastUpdate}</span></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-span-12 lg:col-span-4 space-y-4">

          {/* Reliability breakdown */}
          <div className="soc-card">
            <p className="soc-label mb-3">RELIABILITY SCORES</p>
            <div className="space-y-2.5">
              {[...FEEDS].sort((a, b) => b.reliability - a.reliability).map(f => (
                <div key={f.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs" style={{ color: 'var(--soc-text-secondary)' }}>{f.name.length > 22 ? f.name.slice(0, 22) + '…' : f.name}</span>
                    <span className="text-xs font-semibold" style={{ color: reliabilityColor(f.reliability) }}>
                      {f.reliability > 0 ? `${f.reliability}%` : 'Error'}
                    </span>
                  </div>
                  <div className="soc-progress-track">
                    <div className="soc-progress-fill" style={{ width: `${f.reliability}%`, backgroundColor: reliabilityColor(f.reliability) }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Coverage summary */}
          <div className="soc-card">
            <p className="soc-label mb-3">INDICATORS BY FEED</p>
            <div className="space-y-0">
              {[...FEEDS].filter(f => f.indicators > 0).sort((a, b) => b.indicators - a.indicators).map((f, i, arr) => (
                <div key={f.id} className="flex items-center justify-between py-2.5" style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--soc-border)' : 'none' }}>
                  <div>
                    <p className="text-xs font-medium" style={{ color: 'var(--soc-text)' }}>{f.name.length > 20 ? f.name.slice(0, 20) + '…' : f.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--soc-text-muted)' }}>{f.provider}</p>
                  </div>
                  <span className="text-sm font-bold tabular-nums" style={{ color: 'var(--soc-accent)' }}>{f.indicators.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Detail modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full max-w-lg rounded-xl overflow-hidden"
            style={{ backgroundColor: 'var(--soc-surface)', border: '1px solid var(--soc-border-mid)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b flex items-start justify-between" style={{ borderColor: 'var(--soc-border)' }}>
              <div>
                <p className="soc-label mb-1 font-mono">{selected.id}</p>
                <h2 className="text-base font-bold" style={{ color: 'var(--soc-text)' }}>{selected.name}</h2>
              </div>
              <button onClick={() => setSelected(null)} className="text-sm w-7 h-7 flex items-center justify-center rounded" style={{ color: 'var(--soc-text-muted)', backgroundColor: 'var(--soc-raised)' }}>✕</button>
            </div>
            <div className="px-5 py-4 space-y-4">
              <div className="flex gap-2 flex-wrap">
                <span className="soc-badge" style={{ backgroundColor: STATUS_CONFIG[selected.status].bg, color: STATUS_CONFIG[selected.status].color }}>{STATUS_CONFIG[selected.status].label}</span>
                <span className="soc-badge" style={{ color: TYPE_COLOR[selected.type], border: `1px solid ${TYPE_COLOR[selected.type]}44`, background: 'transparent' }}>{selected.type}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'PROVIDER',    value: selected.provider },
                  { label: 'RELIABILITY', value: selected.reliability > 0 ? `${selected.reliability}%` : 'N/A' },
                  { label: 'INDICATORS',  value: selected.indicators.toLocaleString() },
                  { label: 'FREQUENCY',   value: selected.updateFrequency },
                  { label: 'LAST UPDATE', value: selected.lastUpdate },
                ].map(({ label, value }) => (
                  <div key={label} className="p-3 rounded" style={{ backgroundColor: 'var(--soc-raised)' }}>
                    <p className="soc-label mb-1">{label}</p>
                    <p className="text-sm font-medium" style={{ color: 'var(--soc-text)' }}>{value}</p>
                  </div>
                ))}
              </div>
              <div>
                <p className="soc-label mb-2">COVERAGE</p>
                <div className="flex flex-wrap gap-1">
                  {selected.coverage.map(c => (
                    <span key={c} className="soc-badge">{c}</span>
                  ))}
                </div>
              </div>
              {selected.reliability > 0 && (
                <div>
                  <p className="soc-label mb-2">RELIABILITY</p>
                  <div className="soc-progress-track">
                    <div className="soc-progress-fill" style={{ width: `${selected.reliability}%`, backgroundColor: reliabilityColor(selected.reliability) }} />
                  </div>
                  <p className="text-xs mt-1" style={{ color: 'var(--soc-text-muted)' }}>
                    {selected.reliability >= 90 ? 'High reliability — accurate and timely indicators' : selected.reliability >= 70 ? 'Moderate reliability — occasional false positives' : 'Low reliability — may contain inaccurate data'}
                  </p>
                </div>
              )}
            </div>
            <div className="px-5 py-4 flex gap-3 border-t" style={{ borderColor: 'var(--soc-border)' }}>
              <button className="soc-btn soc-btn-primary flex-1">Configure</button>
              <button onClick={() => setSelected(null)} className="soc-btn soc-btn-secondary flex-1">
                {selected.status === 'active' ? 'Disable Feed' : 'Enable Feed'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

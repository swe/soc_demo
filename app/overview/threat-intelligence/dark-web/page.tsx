'use client'
import { useEffect, useState } from 'react'
import { usePageTitle } from '@/app/page-title-context'

interface DarkWebMention {
  id: string
  source: string
  category: 'credentials' | 'data-leak' | 'ransomware' | 'exploit' | 'marketplace' | 'forum'
  severity: 'critical' | 'high' | 'medium' | 'low'
  title: string
  description: string
  discoveredAt: string
  url: string
  indicators: { emails?: string[]; domains?: string[]; ips?: string[]; credentials?: number }
  status: 'new' | 'investigating' | 'mitigated' | 'false-positive'
}

const MENTIONS: DarkWebMention[] = [
  { id: 'DW-2024-001', source: 'RaidForums Mirror',    category: 'data-leak',    severity: 'critical', title: 'Employee Database Leak',              description: 'Database containing employee credentials and personal information found on dark web marketplace', discoveredAt: '15m ago',  url: 'onion://[redacted]', indicators: { emails: ['peter.pan@neverlands.art', 'sarah.chen@neverlands.art'], credentials: 1247 }, status: 'new' },
  { id: 'DW-2024-002', source: 'Breach Forums',         category: 'credentials', severity: 'high',     title: 'Corporate Credentials for Sale',      description: 'Verified corporate email credentials being sold for $500 on underground forum',                  discoveredAt: '2h ago',   url: 'onion://[redacted]', indicators: { emails: ['admin@neverlands.art'], credentials: 23 },                                    status: 'investigating' },
  { id: 'DW-2024-003', source: 'XSS Forum',             category: 'exploit',     severity: 'critical', title: 'Zero-Day Exploit Discussion',         description: 'Active discussion about exploiting company infrastructure with proof-of-concept code',             discoveredAt: '4h ago',   url: 'onion://[redacted]', indicators: { domains: ['portal.company.com', 'api.company.com'], ips: ['203.0.113.0'] },                status: 'investigating' },
  { id: 'DW-2024-004', source: 'AlphaBay Successor',    category: 'marketplace', severity: 'high',     title: 'VPN Access for Sale',                 description: 'Compromised VPN credentials for company network being auctioned',                                  discoveredAt: '6h ago',   url: 'onion://[redacted]', indicators: { domains: ['vpn.company.com'], credentials: 5 },                                         status: 'mitigated' },
  { id: 'DW-2024-005', source: 'Russian Carder Forum',  category: 'ransomware',  severity: 'medium',   title: 'Ransomware Gang Targeting Sector',    description: 'Known ransomware group discussing targeting companies in your industry sector',                    discoveredAt: '12h ago',  url: 'onion://[redacted]', indicators: { domains: ['company.com'] },                                                              status: 'investigating' },
]

const SEV: Record<string, { color: string; bg: string }> = {
  critical: { color: 'var(--soc-critical)', bg: 'var(--soc-critical-bg)' },
  high:     { color: 'var(--soc-high)',     bg: 'var(--soc-high-bg)' },
  medium:   { color: 'var(--soc-medium)',   bg: 'var(--soc-medium-bg)' },
  low:      { color: 'var(--soc-low)',      bg: 'var(--soc-low-bg)' },
}

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  'new':            { color: 'var(--soc-accent)',   label: 'New' },
  'investigating':  { color: 'var(--soc-high)',     label: 'Investigating' },
  'mitigated':      { color: 'var(--soc-low)',      label: 'Mitigated' },
  'false-positive': { color: 'var(--soc-text-muted)', label: 'False Positive' },
}

const CAT_LABEL: Record<string, string> = {
  credentials: 'Credentials',
  'data-leak':  'Data Leak',
  ransomware:   'Ransomware',
  exploit:      'Exploit',
  marketplace:  'Marketplace',
  forum:        'Forum',
}

const SOURCES = [
  { name: 'Dark Web Forums',    count: 247 },
  { name: 'Marketplaces',       count: 89 },
  { name: 'Paste Sites',        count: 156 },
  { name: 'Telegram Channels',  count: 432 },
  { name: 'IRC Channels',       count: 67 },
  { name: 'Code Repositories',  count: 123 },
]

export default function DarkWebMonitoring() {
  const { setPageTitle } = usePageTitle()
  const [filter, setFilter] = useState<'all' | 'credentials' | 'data-leak' | 'threats'>('all')
  const [selected, setSelected] = useState<DarkWebMention | null>(null)

  useEffect(() => { setPageTitle('Dark Web Monitoring') }, [setPageTitle])

  const visible = filter === 'all'
    ? MENTIONS
    : MENTIONS.filter(m =>
        filter === 'threats'
          ? (m.category === 'ransomware' || m.category === 'exploit')
          : m.category === filter
      )

  const critical = MENTIONS.filter(m => m.severity === 'critical').length
  const newCount = MENTIONS.filter(m => m.status === 'new').length
  const investigating = MENTIONS.filter(m => m.status === 'investigating').length

  const catCounts = ['credentials', 'data-leak', 'exploit', 'ransomware', 'marketplace'].map(cat => ({
    cat,
    n: MENTIONS.filter(m => m.category === cat).length,
  }))

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-6">

      {/* Header */}
      <div className="flex items-start justify-between mb-5 soc-fade-in">
        <div>
          <p className="soc-label mb-1">THREAT INTELLIGENCE</p>
          <h1 className="text-xl font-bold tracking-tight mb-1.5" style={{ color: 'var(--soc-text)' }}>
            Dark Web Monitoring
          </h1>
          <p className="text-sm" style={{ color: 'var(--soc-text-secondary)' }}>
            <strong style={{ color: 'var(--soc-critical)' }}>{critical}</strong> critical mentions ·{' '}
            <strong style={{ color: 'var(--soc-accent)' }}>{newCount}</strong> new ·{' '}
            <strong style={{ color: 'var(--soc-high)' }}>{investigating}</strong> under investigation
          </p>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <button className="soc-btn soc-btn-secondary">Export</button>
          <button className="soc-btn soc-btn-primary">Configure Sources</button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'SOURCES MONITORED', value: '1,114', sub: 'Last scan 2m ago',       color: 'var(--soc-text)' },
          { label: 'TOTAL MENTIONS',    value: MENTIONS.length, sub: 'All categories', color: 'var(--soc-text)' },
          { label: 'CRITICAL',          value: critical,   sub: 'Immediate action',    color: 'var(--soc-critical)' },
          { label: 'NEW FINDINGS',      value: newCount,   sub: 'Unreviewed',          color: 'var(--soc-accent)' },
        ].map(({ label, value, sub, color }) => (
          <div key={label} className="soc-card">
            <p className="soc-label mb-2">{label}</p>
            <p className="soc-metric-sm mb-1" style={{ color }}>{value}</p>
            <p className="text-xs" style={{ color: 'var(--soc-text-muted)' }}>{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-4">

        {/* Main mentions table */}
        <div className="col-span-12 lg:col-span-8 space-y-3">

          {/* Category filter */}
          <div className="flex items-center gap-1 flex-wrap">
            {([
              { id: 'all',         label: 'All Mentions' },
              { id: 'credentials', label: 'Credentials' },
              { id: 'data-leak',   label: 'Data Leaks' },
              { id: 'threats',     label: 'Active Threats' },
            ] as const).map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setFilter(id)}
                className="soc-btn text-xs"
                style={filter === id
                  ? { backgroundColor: 'var(--soc-accent)', borderColor: 'var(--soc-accent)', color: '#fff' }
                  : { borderColor: 'var(--soc-border-mid)', color: 'var(--soc-text-secondary)', background: 'transparent' }}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="soc-card p-0 overflow-hidden">
            <table className="soc-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Source</th>
                  <th>Severity</th>
                  <th>Status</th>
                  <th>Discovered</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((m) => {
                  const s = SEV[m.severity]
                  const st = STATUS_CONFIG[m.status]
                  return (
                    <tr key={m.id} className="cursor-pointer" onClick={() => setSelected(m)}>
                      <td><span className="text-xs font-mono font-bold" style={{ color: 'var(--soc-accent)' }}>{m.id}</span></td>
                      <td>
                        <p className="text-sm font-medium" style={{ color: 'var(--soc-text)' }}>{m.title}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--soc-text-muted)' }}>
                          {m.description.length > 60 ? m.description.slice(0, 60) + '…' : m.description}
                        </p>
                      </td>
                      <td><span className="soc-badge">{CAT_LABEL[m.category]}</span></td>
                      <td><span className="text-xs" style={{ color: 'var(--soc-text-secondary)' }}>{m.source}</span></td>
                      <td><span className="soc-badge" style={{ backgroundColor: s.bg, color: s.color }}>{m.severity.toUpperCase()}</span></td>
                      <td><span className="soc-badge" style={{ color: st.color, border: `1px solid ${st.color}44`, background: 'transparent' }}>{st.label}</span></td>
                      <td><span className="text-xs tabular-nums" style={{ color: 'var(--soc-text-muted)' }}>{m.discoveredAt}</span></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-span-12 lg:col-span-4 space-y-4">

          {/* Monitored Sources */}
          <div className="soc-card">
            <p className="soc-label mb-3">MONITORED SOURCES</p>
            <div className="space-y-0">
              {SOURCES.map((src, i, arr) => (
                <div key={src.name} className="flex items-center justify-between py-2" style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--soc-border)' : 'none' }}>
                  <div className="flex items-center gap-2">
                    <div className="soc-dot" style={{ backgroundColor: 'var(--soc-low)' }} />
                    <span className="text-xs" style={{ color: 'var(--soc-text-secondary)' }}>{src.name}</span>
                  </div>
                  <span className="text-xs font-semibold tabular-nums" style={{ color: 'var(--soc-text)' }}>{src.count}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--soc-border)' }}>
              <div className="flex items-center justify-between">
                <span className="soc-label">TOTAL</span>
                <span className="text-base font-bold tabular-nums" style={{ color: 'var(--soc-text)' }}>1,114</span>
              </div>
            </div>
          </div>

          {/* Category breakdown */}
          <div className="soc-card">
            <p className="soc-label mb-3">CATEGORY BREAKDOWN</p>
            <div className="space-y-2.5">
              {catCounts.map(({ cat, n }) => {
                const pct = Math.round((n / MENTIONS.length) * 100)
                return (
                  <div key={cat}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs" style={{ color: 'var(--soc-text-secondary)' }}>{CAT_LABEL[cat]}</span>
                      <span className="text-xs font-semibold" style={{ color: 'var(--soc-text)' }}>{n}</span>
                    </div>
                    <div className="soc-progress-track">
                      <div className="soc-progress-fill" style={{ width: `${pct}%`, backgroundColor: 'var(--soc-accent)' }} />
                    </div>
                  </div>
                )
              })}
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
                <p className="soc-label mb-1 font-mono">{selected.id} · {selected.source}</p>
                <h2 className="text-base font-bold" style={{ color: 'var(--soc-text)' }}>{selected.title}</h2>
              </div>
              <button onClick={() => setSelected(null)} className="text-sm w-7 h-7 flex items-center justify-center rounded" style={{ color: 'var(--soc-text-muted)', backgroundColor: 'var(--soc-raised)' }}>✕</button>
            </div>
            <div className="px-5 py-4 space-y-4">
              <p className="text-sm" style={{ color: 'var(--soc-text-secondary)' }}>{selected.description}</p>
              <div className="flex gap-2 flex-wrap">
                <span className="soc-badge" style={{ backgroundColor: SEV[selected.severity].bg, color: SEV[selected.severity].color }}>{selected.severity.toUpperCase()}</span>
                <span className="soc-badge" style={{ color: STATUS_CONFIG[selected.status].color, border: `1px solid ${STATUS_CONFIG[selected.status].color}44`, background: 'transparent' }}>{STATUS_CONFIG[selected.status].label}</span>
                <span className="soc-badge">{CAT_LABEL[selected.category]}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'DISCOVERED', value: selected.discoveredAt },
                  { label: 'URL',        value: selected.url },
                ].map(({ label, value }) => (
                  <div key={label} className="p-3 rounded" style={{ backgroundColor: 'var(--soc-raised)' }}>
                    <p className="soc-label mb-1">{label}</p>
                    <p className="text-xs font-mono" style={{ color: 'var(--soc-text)' }}>{value}</p>
                  </div>
                ))}
              </div>
              {selected.indicators.credentials && (
                <div className="p-3 rounded" style={{ backgroundColor: 'var(--soc-critical-bg)' }}>
                  <p className="soc-label mb-1" style={{ color: 'var(--soc-critical)' }}>EXPOSED CREDENTIALS</p>
                  <p className="text-2xl font-bold tabular-nums" style={{ color: 'var(--soc-critical)' }}>{selected.indicators.credentials.toLocaleString()}</p>
                </div>
              )}
              {selected.indicators.emails && selected.indicators.emails.length > 0 && (
                <div>
                  <p className="soc-label mb-2">COMPROMISED EMAILS</p>
                  {selected.indicators.emails.map(e => (
                    <p key={e} className="text-xs font-mono mb-1" style={{ color: 'var(--soc-critical)' }}>{e}</p>
                  ))}
                </div>
              )}
              {selected.indicators.domains && selected.indicators.domains.length > 0 && (
                <div>
                  <p className="soc-label mb-2">AFFECTED DOMAINS</p>
                  {selected.indicators.domains.map(d => (
                    <p key={d} className="text-xs font-mono mb-1" style={{ color: 'var(--soc-high)' }}>{d}</p>
                  ))}
                </div>
              )}
            </div>
            <div className="px-5 py-4 flex gap-3 border-t" style={{ borderColor: 'var(--soc-border)' }}>
              <button className="soc-btn soc-btn-primary flex-1">Mark Investigating</button>
              <button onClick={() => setSelected(null)} className="soc-btn soc-btn-secondary flex-1">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

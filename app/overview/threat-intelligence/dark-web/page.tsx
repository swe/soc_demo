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

interface DarkWebMention {
  id: string
  source: string
  category: 'credentials' | 'data-leak' | 'ransomware' | 'exploit' | 'marketplace' | 'forum'
  severity: 'critical' | 'high' | 'medium' | 'low'
  title: string
  description: string
  discoveredAt: string
  discoveredDate: string
  url: string
  indicators: { emails?: string[]; domains?: string[]; ips?: string[]; credentials?: number }
  status: 'new' | 'investigating' | 'mitigated' | 'false-positive'
}

const BASE_MENTIONS: DarkWebMention[] = [
  { id: 'DW-2024-001', source: 'RaidForums Mirror', category: 'data-leak', severity: 'critical', title: 'Employee Database Leak', description: 'Database containing employee credentials and personal information found on dark web marketplace', discoveredAt: '15m ago', discoveredDate: '2026-04-08', url: 'onion://[redacted]', indicators: { emails: ['peter.pan@neverlands.art', 'sarah.chen@neverlands.art'], credentials: 1247 }, status: 'new' },
  { id: 'DW-2024-002', source: 'Breach Forums', category: 'credentials', severity: 'high', title: 'Corporate Credentials for Sale', description: 'Verified corporate email credentials being sold for $500 on underground forum', discoveredAt: '2h ago', discoveredDate: '2026-04-08', url: 'onion://[redacted]', indicators: { emails: ['admin@neverlands.art'], credentials: 23 }, status: 'investigating' },
  { id: 'DW-2024-003', source: 'XSS Forum', category: 'exploit', severity: 'critical', title: 'Zero-Day Exploit Discussion', description: 'Active discussion about exploiting company infrastructure with proof-of-concept code', discoveredAt: '4h ago', discoveredDate: '2026-04-08', url: 'onion://[redacted]', indicators: { domains: ['portal.company.com', 'api.company.com'], ips: ['203.0.113.0'] }, status: 'investigating' },
  { id: 'DW-2024-004', source: 'AlphaBay Successor', category: 'marketplace', severity: 'high', title: 'VPN Access for Sale', description: 'Compromised VPN credentials for company network being auctioned', discoveredAt: '6h ago', discoveredDate: '2026-04-07', url: 'onion://[redacted]', indicators: { domains: ['vpn.company.com'], credentials: 5 }, status: 'mitigated' },
  { id: 'DW-2024-005', source: 'Russian Carder Forum', category: 'ransomware', severity: 'medium', title: 'Ransomware Gang Targeting Sector', description: 'Known ransomware group discussing targeting companies in your industry sector', discoveredAt: '12h ago', discoveredDate: '2026-04-07', url: 'onion://[redacted]', indicators: { domains: ['company.com'] }, status: 'investigating' },
]

const CAT_LABEL: Record<string, string> = {
  credentials: 'Credentials',
  'data-leak': 'Data Leak',
  ransomware: 'Ransomware',
  exploit: 'Exploit',
  marketplace: 'Marketplace',
  forum: 'Forum',
}
const STATUS_LABEL: Record<string, string> = { new: 'New', investigating: 'Investigating', mitigated: 'Mitigated', 'false-positive': 'False Positive' }
const SEV: Record<string, { color: string; bg: string }> = {
  critical: { color: 'var(--soc-critical)', bg: 'var(--soc-critical-bg)' },
  high: { color: 'var(--soc-high)', bg: 'var(--soc-high-bg)' },
  medium: { color: 'var(--soc-medium)', bg: 'var(--soc-medium-bg)' },
  low: { color: 'var(--soc-low)', bg: 'var(--soc-low-bg)' },
}
const SOURCES = [
  { name: 'Dark Web Forums', count: 247 },
  { name: 'Marketplaces', count: 89 },
  { name: 'Paste Sites', count: 156 },
  { name: 'Telegram Channels', count: 432 },
  { name: 'IRC Channels', count: 67 },
  { name: 'Code Repositories', count: 123 },
]

export default function DarkWebMonitoring() {
  const { setPageTitle } = usePageTitle()
  const [mentions, setMentions] = useState(BASE_MENTIONS)
  const [selected, setSelected] = useState<DarkWebMention | null>(null)
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<string[]>([])
  const [criticalOnly, setCriticalOnly] = useState(false)
  const [newOnly, setNewOnly] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const [configureOpen, setConfigureOpen] = useState(false)
  const [configureStep, setConfigureStep] = useState(0)
  const [markOpen, setMarkOpen] = useState(false)
  const [flash, setFlash] = useState<{ tone: 'success' | 'attention'; title: string; description: string } | null>(null)

  useEffect(() => setPageTitle('Dark Web Monitoring'), [setPageTitle])
  const filterOptions = useMemo(() => [
    { id: 'category:credentials', label: 'Credentials', section: 'Category' },
    { id: 'category:data-leak', label: 'Data Leak', section: 'Category' },
    { id: 'category:ransomware', label: 'Ransomware', section: 'Category' },
    { id: 'category:exploit', label: 'Exploit', section: 'Category' },
    { id: 'severity:critical', label: 'Critical', section: 'Severity' },
    { id: 'severity:high', label: 'High', section: 'Severity' },
    { id: 'severity:medium', label: 'Medium', section: 'Severity' },
    { id: 'status:new', label: 'New', section: 'Status' },
    { id: 'status:investigating', label: 'Investigating', section: 'Status' },
    { id: 'status:mitigated', label: 'Mitigated', section: 'Status' },
  ], [])
  useEffect(() => { if (filters.length === 0) setFilters(filterOptions.map((o) => o.id)) }, [filters.length, filterOptions])

  const visible = mentions.filter((m) => {
    const q = query.toLowerCase()
    const cats = filters.filter((f) => f.startsWith('category:')).map((f) => f.replace('category:', ''))
    const sev = filters.filter((f) => f.startsWith('severity:')).map((f) => f.replace('severity:', ''))
    const stat = filters.filter((f) => f.startsWith('status:')).map((f) => f.replace('status:', ''))
    return (cats.length === 0 || cats.includes(m.category)) &&
      (sev.length === 0 || sev.includes(m.severity)) &&
      (stat.length === 0 || stat.includes(m.status)) &&
      (!criticalOnly || m.severity === 'critical') &&
      (!newOnly || m.status === 'new') &&
      (!q || m.id.toLowerCase().includes(q) || m.title.toLowerCase().includes(q) || m.source.toLowerCase().includes(q))
  })

  const critical = mentions.filter((m) => m.severity === 'critical').length
  const newCount = mentions.filter((m) => m.status === 'new').length
  const investigating = mentions.filter((m) => m.status === 'investigating').length

  return (
    <OverviewPageShell>
      <OverviewPageHeader
        section="THREAT INTELLIGENCE"
        title="Dark Web Monitoring"
        description={`${critical} critical mentions · ${newCount} new · ${investigating} under investigation`}
        actions={[
          { id: 'export', label: 'Export', variant: 'secondary', onClick: () => setExportOpen(true) },
          { id: 'configure', label: 'Configure Sources', variant: 'primary', onClick: () => setConfigureOpen(true) },
        ]}
      />

      {flash && <div className="mb-4"><OverviewAlert tone={flash.tone} title={flash.title} description={flash.description} /></div>}

      <OverviewKpiRow columns={4} items={[
        { label: 'SOURCES MONITORED', value: '1,114', sub: 'Last scan 2m ago' },
        { label: 'TOTAL MENTIONS', value: mentions.length, sub: 'All categories' },
        { label: 'CRITICAL', value: critical, sub: 'Immediate action', tone: 'critical' },
        { label: 'NEW FINDINGS', value: newCount, sub: 'Unreviewed', tone: 'accent' },
      ]} />

      <OverviewTableToolbar
        searchValue={query}
        onSearchChange={setQuery}
        searchPlaceholder="Search mention, source, id..."
        end={<div className="flex w-full flex-wrap items-center gap-2 sm:justify-end">
          <OverviewFilterMenu options={filterOptions} selected={filters} onApply={setFilters} />
          <div className="flex flex-wrap items-center gap-2">
            <OverviewToggle label="Critical only" checked={criticalOnly} onChange={setCriticalOnly} />
            <OverviewToggle label="New only" checked={newOnly} onChange={setNewOnly} />
          </div>
        </div>}
      />

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 space-y-4 lg:col-span-8">
          <OverviewSection title="DARK WEB MENTIONS" flush>
            <table className="soc-table">
              <thead><tr><th>ID</th><th>Title</th><th>Category</th><th>Source</th><th>Severity</th><th>Status</th><th>Discovered</th></tr></thead>
              <tbody>
                {visible.map((m) => <tr key={m.id} className="cursor-pointer" onClick={() => setSelected(m)}>
                  <td><span className="text-xs font-mono font-bold text-[color:var(--soc-accent)]">{m.id}</span></td>
                  <td><p className="text-sm font-medium text-[color:var(--soc-text)]">{m.title}</p><p className="mt-0.5 text-xs text-[color:var(--soc-text-muted)]">{m.description.length > 65 ? `${m.description.slice(0, 65)}...` : m.description}</p></td>
                  <td><span className="soc-badge">{CAT_LABEL[m.category]}</span></td>
                  <td><span className="text-xs text-[color:var(--soc-text-secondary)]">{m.source}</span></td>
                  <td><span className="soc-badge" style={{ backgroundColor: SEV[m.severity].bg, color: SEV[m.severity].color }}>{m.severity.toUpperCase()}</span></td>
                  <td><span className="soc-badge">{STATUS_LABEL[m.status]}</span></td>
                  <td><span className="text-xs text-[color:var(--soc-text-muted)]">{m.discoveredAt}</span></td>
                </tr>)}
              </tbody>
            </table>
          </OverviewSection>
        </div>

        <div className="col-span-12 space-y-4 lg:col-span-4">
          <OverviewSection title="MONITORED SOURCES">
            <div className="px-4 py-1">
              {SOURCES.map((s, i) => <div key={s.name} className="flex items-center justify-between py-2.5" style={{ borderBottom: i < SOURCES.length - 1 ? '1px solid var(--soc-border)' : 'none' }}>
                <span className="text-xs text-[color:var(--soc-text-secondary)]">{s.name}</span>
                <span className="text-xs font-semibold tabular-nums text-[color:var(--soc-text)]">{s.count}</span>
              </div>)}
            </div>
          </OverviewSection>
          <OverviewSection title="CATEGORY BREAKDOWN">
            <div className="space-y-2.5 px-4 py-3">
              {['credentials', 'data-leak', 'exploit', 'ransomware', 'marketplace'].map((cat) => {
                const count = mentions.filter((m) => m.category === cat).length
                const pct = Math.round((count / mentions.length) * 100)
                return (
                  <div key={cat}>
                    <div className="mb-1 flex items-center justify-between"><span className="text-xs text-[color:var(--soc-text-secondary)]">{CAT_LABEL[cat]}</span><span className="text-xs font-semibold text-[color:var(--soc-text)]">{count}</span></div>
                    <div className="soc-progress-track"><div className="soc-progress-fill" style={{ width: `${pct}%`, backgroundColor: 'var(--soc-accent)' }} /></div>
                  </div>
                )
              })}
            </div>
          </OverviewSection>
        </div>
      </div>

      <OverviewModal open={exportOpen} title="Export dark web findings" subtitle="THREAT INTELLIGENCE" onClose={() => setExportOpen(false)} footer={<div className="flex gap-2 sm:justify-end"><button type="button" className="soc-btn soc-btn-secondary" onClick={() => setExportOpen(false)}>Close</button><button type="button" className="soc-btn soc-btn-primary" onClick={() => { setFlash({ tone: 'success', title: 'Export queued', description: `${visible.length} filtered findings added to reporting queue.` }); setExportOpen(false) }}>Start export</button></div>}>
        <p className="text-sm text-[color:var(--soc-text-secondary)]">Export includes the current filter state and mention status metadata.</p>
      </OverviewModal>

      <OverviewStepModal
        open={configureOpen}
        subtitle="CONFIGURE SOURCES"
        currentStep={configureStep}
        onStepChange={setConfigureStep}
        onClose={() => { setConfigureOpen(false); setConfigureStep(0) }}
        onFinish={() => { setConfigureOpen(false); setConfigureStep(0); setFlash({ tone: 'attention', title: 'Source configuration updated', description: 'Collection cadence and alerting scope were applied.' }) }}
        steps={[
          { id: 'scope', title: 'Step 1: Scope', content: <label className="text-xs font-medium text-[color:var(--soc-text-secondary)]">Source group<input className="soc-input mt-1 w-full text-sm" defaultValue="Forums + marketplaces" /></label> },
          { id: 'cadence', title: 'Step 2: Cadence', content: <label className="text-xs font-medium text-[color:var(--soc-text-secondary)]">Scan interval<select className="soc-input mt-1 w-full text-sm"><option>Every 15 minutes</option><option>Hourly</option></select></label> },
          { id: 'review', title: 'Step 3: Review', content: <p className="text-sm text-[color:var(--soc-text-secondary)]">Confirming this flow updates crawler cadence and notifies the intel queue.</p> },
        ]}
      />

      <OverviewModal
        open={!!selected}
        title={selected?.title ?? ''}
        subtitle={selected ? `${selected.id} · ${selected.source}` : ''}
        onClose={() => setSelected(null)}
        maxWidth="max-w-2xl"
        footer={<div className="flex gap-2 sm:justify-end"><button type="button" className="soc-btn soc-btn-secondary" onClick={() => setSelected(null)}>Close</button><button type="button" className="soc-btn soc-btn-primary" onClick={() => setMarkOpen(true)}>Mark Investigating</button></div>}
      >
        {selected && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2"><span className="soc-badge" style={{ backgroundColor: SEV[selected.severity].bg, color: SEV[selected.severity].color }}>{selected.severity.toUpperCase()}</span><span className="soc-badge">{CAT_LABEL[selected.category]}</span><span className="soc-badge">{STATUS_LABEL[selected.status]}</span></div>
            <p className="text-sm text-[color:var(--soc-text-secondary)]">{selected.description}</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-md border p-3 text-xs" style={{ borderColor: 'var(--soc-border)', backgroundColor: 'var(--soc-raised)' }}><p className="soc-label mb-1">DISCOVERED</p><p className="font-mono text-[color:var(--soc-text)]">{selected.discoveredAt}</p></div>
              <div className="rounded-md border p-3 text-xs" style={{ borderColor: 'var(--soc-border)', backgroundColor: 'var(--soc-raised)' }}><p className="soc-label mb-1">URL</p><p className="font-mono text-[color:var(--soc-text)]">{selected.url}</p></div>
            </div>
          </div>
        )}
      </OverviewModal>

      <OverviewModal
        open={markOpen && !!selected}
        title="Update mention status"
        subtitle={selected?.id}
        onClose={() => setMarkOpen(false)}
        footer={<div className="flex gap-2 sm:justify-end"><button type="button" className="soc-btn soc-btn-secondary" onClick={() => setMarkOpen(false)}>Cancel</button><button type="button" className="soc-btn soc-btn-primary" onClick={() => { if (selected) { setMentions((prev) => prev.map((m) => m.id === selected.id ? { ...m, status: 'investigating' } : m)); setSelected((prev) => prev ? { ...prev, status: 'investigating' } : prev); setFlash({ tone: 'success', title: `${selected.id} moved to investigating`, description: 'Case owner and triage queue were updated.' }) } setMarkOpen(false) }}>Confirm</button></div>}
      >
        <p className="text-sm text-[color:var(--soc-text-secondary)]">This action changes mention status and adds the case to active triage.</p>
      </OverviewModal>
    </OverviewPageShell>
  )
}

'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePageTitle } from '@/app/page-title-context'
import {
  type IntegrationRow,
  IntegrationTable,
  OverviewFilterMenu,
  OverviewKpiRow,
  OverviewModal,
  OverviewPageHeader,
  OverviewPageShell,
  OverviewPagination,
  OverviewRowsPerPageMenu,
  OverviewSection,
  OverviewStepModal,
  OverviewTableToolbar,
  OverviewToggle,
} from '@/components/overview/unified-ui'

const INTEGRATION_ROWS: IntegrationRow[] = [
  { id: 'INT-401', name: 'Splunk SIEM', vendor: 'Splunk', category: 'siem', status: 'connected', lastSync: '2 min ago', eventsPerDay: 45231, version: '8.2.4', region: 'eu-central', healthScore: 100, description: 'Primary SIEM ingest path.', configKeys: ['index', 'token', 'sourcetype'] },
  { id: 'INT-402', name: 'CrowdStrike Falcon', vendor: 'CrowdStrike', category: 'edr', status: 'connected', lastSync: '1 min ago', eventsPerDay: 23812, version: '7.1', region: 'global', healthScore: 98, description: 'Endpoint telemetry and prevention stream.', configKeys: ['client_id', 'client_secret'] },
  { id: 'INT-403', name: 'Palo Alto Firewall', vendor: 'Palo Alto', category: 'network', status: 'connected', lastSync: '5 min ago', eventsPerDay: 89344, version: '11.0', region: 'hq', healthScore: 100, description: 'North-south network logs.', configKeys: ['collector', 'api_key'] },
  { id: 'INT-404', name: 'Microsoft Defender', vendor: 'Microsoft', category: 'edr', status: 'connected', lastSync: '3 min ago', eventsPerDay: 34109, version: 'MDE', region: 'eu', healthScore: 95, description: 'Endpoint and identity signals.', configKeys: ['tenant', 'app_id'] },
  { id: 'INT-405', name: 'Proofpoint Email', vendor: 'Proofpoint', category: 'email', status: 'connected', lastSync: '10 min ago', eventsPerDay: 12700, version: '2026.1', region: 'eu', healthScore: 100, description: 'Email threat telemetry and detections.' },
  { id: 'INT-406', name: 'Okta SSO', vendor: 'Okta', category: 'identity', status: 'connected', lastSync: '1 min ago', eventsPerDay: 8902, version: 'v1', region: 'us-east', healthScore: 100, description: 'Identity/authentication events and risk context.' },
  { id: 'INT-407', name: 'Tenable Nessus', vendor: 'Tenable', category: 'vulnerability', status: 'disconnected', lastSync: '2 hours ago', eventsPerDay: 0, version: '10.6', region: 'eu-central', healthScore: 0, description: 'Scanner token expired. Re-authentication required.' },
  { id: 'INT-408', name: 'Carbon Black', vendor: 'VMware', category: 'edr', status: 'connected', lastSync: '4 min ago', eventsPerDay: 19213, version: '8.9', region: 'eu', healthScore: 97, description: 'Secondary EDR source for contractor fleet.' },
  { id: 'INT-409', name: 'Cisco ISE', vendor: 'Cisco', category: 'network', status: 'connected', lastSync: '7 min ago', eventsPerDay: 5624, version: '3.2', region: 'hq', healthScore: 92, description: 'NAC and identity-device linkage.' },
  { id: 'INT-410', name: 'FortiGate', vendor: 'Fortinet', category: 'network', status: 'degraded', lastSync: '45 min ago', eventsPerDay: 67421, version: '7.4', region: 'branch', healthScore: 75, description: 'Intermittent API throttling on branch clusters.' },
  { id: 'INT-411', name: 'AWS CloudTrail', vendor: 'AWS', category: 'other', status: 'connected', lastSync: '2 min ago', eventsPerDay: 156742, version: 'native', region: 'multi-region', healthScore: 100, description: 'Cloud control-plane telemetry.' },
  { id: 'INT-412', name: 'Azure Sentinel', vendor: 'Microsoft', category: 'siem', status: 'connected', lastSync: '3 min ago', eventsPerDay: 98312, version: 'native', region: 'westeurope', healthScore: 99, description: 'Dedicated azure-native telemetry route.' },
]

const FILTER_OPTIONS = [
  { id: 'status:connected', label: 'Connected', section: 'Status' },
  { id: 'status:degraded', label: 'Degraded', section: 'Status' },
  { id: 'status:disconnected', label: 'Disconnected', section: 'Status' },
  { id: 'category:siem', label: 'SIEM', section: 'Category' },
  { id: 'category:edr', label: 'EDR', section: 'Category' },
  { id: 'category:network', label: 'Network', section: 'Category' },
  { id: 'category:identity', label: 'Identity', section: 'Category' },
  { id: 'category:vulnerability', label: 'Vulnerability', section: 'Category' },
  { id: 'category:email', label: 'Email', section: 'Category' },
]

export default function IntegrationsPage() {
  const { setPageTitle } = usePageTitle()
  const [rows, setRows] = useState<IntegrationRow[]>(INTEGRATION_ROWS)
  const [query, setQuery] = useState('')
  const [selectedFilters, setSelectedFilters] = useState<string[]>([])
  const [showOnlyIssues, setShowOnlyIssues] = useState(false)
  const [syncOpen, setSyncOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [addStep, setAddStep] = useState(0)
  const [activeAction, setActiveAction] = useState<{
    type: 'test' | 'reconnect' | 'configure' | 'logs'
    row: IntegrationRow
  } | null>(null)
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(5)

  const [newName, setNewName] = useState('')
  const [newVendor, setNewVendor] = useState('')
  const [newCategory, setNewCategory] = useState<IntegrationRow['category']>('siem')
  const [newRegion, setNewRegion] = useState('eu-central')
  const [syncScope, setSyncScope] = useState<'all' | 'connected' | 'issues'>('all')
  const [syncIncludeDisconnected, setSyncIncludeDisconnected] = useState(true)
  const [syncNotify, setSyncNotify] = useState(true)
  const [syncReason, setSyncReason] = useState('Routine platform sync window')
  const [actionNote, setActionNote] = useState('')
  const [configRegion, setConfigRegion] = useState('eu-central')
  const [configVersionTag, setConfigVersionTag] = useState('patch')

  useEffect(() => {
    setPageTitle('Integrations')
  }, [setPageTitle])

  useEffect(() => {
    if (!activeAction) return
    setActionNote('')
    setConfigRegion(activeAction.row.region ?? 'eu-central')
    setConfigVersionTag('patch')
  }, [activeAction])

  const visibleRows = useMemo(() => {
    const statusFilters = selectedFilters
      .filter((id) => id.startsWith('status:'))
      .map((id) => id.replace('status:', '')) as IntegrationRow['status'][]
    const categoryFilters = selectedFilters
      .filter((id) => id.startsWith('category:'))
      .map((id) => id.replace('category:', '')) as IntegrationRow['category'][]
    const q = query.trim().toLowerCase()

    return rows
      .filter((row) => statusFilters.length === 0 || statusFilters.includes(row.status))
      .filter((row) => categoryFilters.length === 0 || categoryFilters.includes(row.category))
      .filter((row) => !showOnlyIssues || row.status !== 'connected' || row.healthScore < 95)
      .filter((row) => !q || row.name.toLowerCase().includes(q) || row.vendor.toLowerCase().includes(q) || row.id.toLowerCase().includes(q))
  }, [rows, selectedFilters, showOnlyIssues, query])

  const totalPages = Math.max(1, Math.ceil(visibleRows.length / rowsPerPage))
  const pagedRows = visibleRows.slice((page - 1) * rowsPerPage, page * rowsPerPage)

  useEffect(() => {
    if (page > totalPages) setPage(1)
  }, [page, totalPages])

  const connectedCount = rows.filter((i) => i.status === 'connected').length
  const issueCount = rows.filter((i) => i.status !== 'connected' || i.healthScore < 95).length
  const totalEvents = rows.reduce((sum, row) => sum + row.eventsPerDay, 0)

  return (
    <OverviewPageShell>
      <OverviewPageHeader
        section="ADMINISTRATION"
        title="Integrations"
        description="Manage third-party connections, sync posture, and ingestion health through one standardized administration layout."
        actions={[
          { id: 'sync-all', label: 'Sync All', variant: 'secondary', onClick: () => setSyncOpen(true) },
          { id: 'add-integration', label: 'Add Integration', variant: 'primary', onClick: () => setAddOpen(true) },
        ]}
      />

      <OverviewKpiRow
        columns={4}
        items={[
          { label: 'ACTIVE', value: `${connectedCount}/${rows.length}`, sub: 'Integrations connected', tone: 'low' },
          { label: 'ISSUES', value: issueCount, sub: 'Need attention', tone: issueCount > 0 ? 'critical' : 'default' },
          { label: 'TOTAL EVENTS/DAY', value: totalEvents.toLocaleString(), sub: 'Across all integrations', tone: 'accent' },
          { label: 'LATEST SYNC', value: '1 min ago', sub: 'Platform-wide refresh clock' },
        ]}
      />

      <OverviewTableToolbar
        searchValue={query}
        onSearchChange={(value) => {
          setQuery(value)
          setPage(1)
        }}
        searchPlaceholder="Search integration, vendor, or id..."
        end={(
          <div className="flex w-full items-center justify-end gap-2 whitespace-nowrap">
            <OverviewFilterMenu
              options={FILTER_OPTIONS}
              selected={selectedFilters}
              onApply={(next) => {
                setSelectedFilters(next)
                setPage(1)
              }}
            />
            <OverviewToggle
              label="Issue focus"
              checked={showOnlyIssues}
              onChange={(next) => {
                setShowOnlyIssues(next)
                setPage(1)
              }}
            />
          </div>
        )}
      />

      <OverviewSection
        title="ALL INTEGRATIONS"
        right={(
          <OverviewRowsPerPageMenu
            value={rowsPerPage}
            options={[5, 10]}
            onChange={(next) => {
              setRowsPerPage(next)
              setPage(1)
            }}
          />
        )}
      >
        <IntegrationTable
          rows={pagedRows}
          onAction={(type, row) => {
            setActiveAction({ type, row })
          }}
        />
        <OverviewPagination page={page} totalPages={totalPages} totalItems={visibleRows.length} onPageChange={setPage} />
      </OverviewSection>

      <OverviewModal
        open={syncOpen}
        title="Sync All Integrations"
        subtitle="PIPELINE ACTION"
        onClose={() => setSyncOpen(false)}
        footer={(
          <div className="flex justify-end gap-2">
            <button type="button" className="soc-btn soc-btn-secondary text-xs" onClick={() => setSyncOpen(false)}>
              Cancel
            </button>
            <button
              type="button"
              className="soc-btn soc-btn-primary text-xs"
              onClick={() => {
                setRows((prev) =>
                  prev.map((row) => ({
                    ...row,
                    lastSync: 'Just now',
                    status: row.status === 'disconnected' ? 'pending' : row.status,
                  }))
                )
                setSyncOpen(false)
              }}
            >
              Run Sync
            </button>
          </div>
        )}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <label className="text-xs font-medium text-[color:var(--soc-text-muted)]">
              Sync scope
              <select className="soc-input mt-1 w-full text-sm" value={syncScope} onChange={(e) => setSyncScope(e.target.value as 'all' | 'connected' | 'issues')}>
                <option value="all">All integrations</option>
                <option value="connected">Connected only</option>
                <option value="issues">Issue-only (degraded/disconnected)</option>
              </select>
            </label>
            <label className="text-xs font-medium text-[color:var(--soc-text-muted)]">
              Change note
              <input className="soc-input mt-1 w-full text-sm" value={syncReason} onChange={(e) => setSyncReason(e.target.value)} />
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            <OverviewToggle label="Include disconnected" checked={syncIncludeDisconnected} onChange={setSyncIncludeDisconnected} />
            <OverviewToggle label="Notify on completion" checked={syncNotify} onChange={setSyncNotify} />
          </div>
          <div className="rounded-md border border-[color:var(--soc-border)] bg-[color:var(--soc-raised)] p-3 text-xs text-[color:var(--soc-text-secondary)]">
            <p className="font-semibold text-[color:var(--soc-text)]">Execution preview</p>
            <p className="mt-1">
              Scope: {syncScope}. {syncIncludeDisconnected ? 'Disconnected integrations will move to pending.' : 'Disconnected integrations are skipped.'}
            </p>
            <p className="mt-1">Completion signal: {syncNotify ? 'SOC notification + activity log entry.' : 'Activity log entry only.'}</p>
          </div>
        </div>
      </OverviewModal>

      <OverviewModal
        open={!!activeAction}
        title={
          activeAction?.type === 'test'
            ? `Test Connection: ${activeAction.row.name}`
            : activeAction?.type === 'reconnect'
              ? `Reconnect Integration: ${activeAction.row.name}`
            : activeAction?.type === 'configure'
              ? `Configure Integration: ${activeAction.row.name}`
              : activeAction?.type === 'logs'
                ? `View Logs: ${activeAction.row.name}`
                : ''
        }
        subtitle="INTEGRATION ACTION"
        onClose={() => setActiveAction(null)}
        footer={(
          <div className="flex justify-end gap-2">
            <button type="button" className="soc-btn soc-btn-secondary text-xs" onClick={() => setActiveAction(null)}>
              Cancel
            </button>
            <button
              type="button"
              className="soc-btn soc-btn-primary text-xs"
              onClick={() => {
                if (!activeAction) return
                if (activeAction.type === 'test') {
                  setRows((prev) =>
                    prev.map((r) =>
                      r.id === activeAction.row.id
                        ? { ...r, status: 'connected', healthScore: Math.max(85, r.healthScore), lastSync: 'Just now' }
                        : r
                    )
                  )
                }
                if (activeAction.type === 'reconnect') {
                  setRows((prev) =>
                    prev.map((r) =>
                      r.id === activeAction.row.id
                        ? { ...r, status: 'pending', lastSync: 'Reconnect queued', healthScore: Math.max(40, r.healthScore) }
                        : r
                    )
                  )
                }
                if (activeAction.type === 'configure') {
                  setRows((prev) =>
                    prev.map((r) =>
                      r.id === activeAction.row.id
                        ? { ...r, version: `${configVersionTag}:${r.version ?? 'configured'}`, region: configRegion, lastSync: 'Just now' }
                        : r
                    )
                  )
                }
                setActiveAction(null)
              }}
            >
              {activeAction?.type === 'logs' ? 'Close' : 'Apply'}
            </button>
          </div>
        )}
      >
        {activeAction?.type === 'test' ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-md border border-[color:var(--soc-border)] p-3">
                <p className="soc-label mb-1">Current Health</p>
                <p className="text-sm font-semibold text-[color:var(--soc-text)]">{activeAction.row.healthScore}%</p>
              </div>
              <div className="rounded-md border border-[color:var(--soc-border)] p-3">
                <p className="soc-label mb-1">Last Sync</p>
                <p className="text-sm font-semibold text-[color:var(--soc-text)]">{activeAction.row.lastSync}</p>
              </div>
            </div>
            <label className="text-xs font-medium text-[color:var(--soc-text-muted)]">
              Test note
              <input className="soc-input mt-1 w-full text-sm" value={actionNote} onChange={(e) => setActionNote(e.target.value)} placeholder="Connectivity validation before release cutover" />
            </label>
            <p className="text-xs text-[color:var(--soc-text-secondary)]">
              Test executes auth handshake, API latency probe, and event sample ingestion check.
            </p>
          </div>
        ) : activeAction?.type === 'reconnect' ? (
          <div className="space-y-4">
            <div className="rounded-md border border-[color:var(--soc-border)] bg-[color:var(--soc-raised)] p-3 text-xs text-[color:var(--soc-text-secondary)]">
              <p className="font-semibold text-[color:var(--soc-text)]">Reconnect flow</p>
              <p className="mt-1">Queues credential handshake, endpoint reachability test, and initial event poll.</p>
            </div>
            <label className="text-xs font-medium text-[color:var(--soc-text-muted)]">
              Reconnect reason
              <textarea className="soc-input mt-1 w-full text-sm" rows={3} value={actionNote} onChange={(e) => setActionNote(e.target.value)} />
            </label>
          </div>
        ) : activeAction?.type === 'configure' ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <label className="text-xs font-medium text-[color:var(--soc-text-muted)]">
                Target region
                <input className="soc-input mt-1 w-full text-sm" value={configRegion} onChange={(e) => setConfigRegion(e.target.value)} />
              </label>
              <label className="text-xs font-medium text-[color:var(--soc-text-muted)]">
                Version tag
                <select className="soc-input mt-1 w-full text-sm" value={configVersionTag} onChange={(e) => setConfigVersionTag(e.target.value)}>
                  <option value="patch">Patch update</option>
                  <option value="minor">Minor upgrade</option>
                  <option value="major">Major upgrade</option>
                </select>
              </label>
            </div>
            <label className="text-xs font-medium text-[color:var(--soc-text-muted)]">
              Change note
              <textarea className="soc-input mt-1 w-full text-sm" rows={3} value={actionNote} onChange={(e) => setActionNote(e.target.value)} />
            </label>
            <p className="text-xs text-[color:var(--soc-text-secondary)]">
              Configuration update writes metadata, rotates connector token references, and records an audit entry.
            </p>
          </div>
        ) : activeAction?.type === 'logs' ? (
          <div className="space-y-3">
            <div className="rounded-md border border-[color:var(--soc-border)] bg-[color:var(--soc-raised)] p-3 text-xs font-mono text-[color:var(--soc-text-secondary)]">
              <p>[INFO] Last poll 00:00:45 ago</p>
              <p>[INFO] Event pipeline healthy</p>
              <p>[WARN] Retry spikes 14:22-14:24 UTC</p>
              <p>[INFO] Backpressure normalized</p>
            </div>
            <p className="text-xs text-[color:var(--soc-text-secondary)]">
              Log window shows most recent connector heartbeat, ingestion throughput checks, and retry diagnostics.
            </p>
          </div>
        ) : null}
      </OverviewModal>

      <OverviewStepModal
        open={addOpen}
        subtitle="NEW INTEGRATION"
        currentStep={addStep}
        onStepChange={setAddStep}
        onClose={() => {
          setAddOpen(false)
          setAddStep(0)
        }}
        onFinish={() => {
          setRows((prev) => [
            {
              id: `INT-${500 + prev.length}`,
              name: newName.trim(),
              vendor: newVendor.trim(),
              category: newCategory,
              status: 'pending',
              lastSync: 'Not synced',
              eventsPerDay: 0,
              version: 'new',
              region: newRegion,
              healthScore: 0,
              description: 'Newly created integration awaiting credential validation.',
            },
            ...prev,
          ])
          setNewName('')
          setNewVendor('')
          setNewCategory('siem')
          setNewRegion('eu-central')
          setAddOpen(false)
          setAddStep(0)
          setPage(1)
        }}
        steps={[
          {
            id: 'identity',
            title: 'Step 1: Integration Identity',
            canProceed: () => newName.trim().length > 1 && newVendor.trim().length > 1,
            validationHint: 'Integration name and vendor are required.',
            content: (
              <div className="grid gap-3">
                <label className="text-xs font-medium text-[color:var(--soc-text-muted)]">
                  Integration Name
                  <input className="soc-input mt-1 w-full text-sm" value={newName} onChange={(e) => setNewName(e.target.value)} />
                </label>
                <label className="text-xs font-medium text-[color:var(--soc-text-muted)]">
                  Vendor
                  <input className="soc-input mt-1 w-full text-sm" value={newVendor} onChange={(e) => setNewVendor(e.target.value)} />
                </label>
              </div>
            ),
          },
          {
            id: 'type',
            title: 'Step 2: Type & Region',
            content: (
              <div className="grid gap-3">
                <label className="text-xs font-medium text-[color:var(--soc-text-muted)]">
                  Category
                  <select className="soc-input mt-1 w-full text-sm" value={newCategory} onChange={(e) => setNewCategory(e.target.value as IntegrationRow['category'])}>
                    <option value="siem">SIEM</option>
                    <option value="edr">EDR</option>
                    <option value="ticketing">Ticketing</option>
                    <option value="identity">Identity</option>
                    <option value="email">Email</option>
                    <option value="network">Network</option>
                    <option value="vulnerability">Vulnerability</option>
                    <option value="other">Other</option>
                  </select>
                </label>
                <label className="text-xs font-medium text-[color:var(--soc-text-muted)]">
                  Region
                  <input className="soc-input mt-1 w-full text-sm" value={newRegion} onChange={(e) => setNewRegion(e.target.value)} />
                </label>
              </div>
            ),
          },
          {
            id: 'review',
            title: 'Step 3: Review & Create',
            content: (
              <div className="space-y-2 text-sm text-[color:var(--soc-text-secondary)]">
                <p><span className="font-semibold text-[color:var(--soc-text)]">Name:</span> {newName || '—'}</p>
                <p><span className="font-semibold text-[color:var(--soc-text)]">Vendor:</span> {newVendor || '—'}</p>
                <p><span className="font-semibold text-[color:var(--soc-text)]">Category:</span> {newCategory}</p>
                <p><span className="font-semibold text-[color:var(--soc-text)]">Region:</span> {newRegion}</p>
              </div>
            ),
          },
        ]}
      />
    </OverviewPageShell>
  )
}

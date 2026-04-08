'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePageTitle } from '@/app/page-title-context'
import { formatNumber } from '@/lib/utils'
import {
  CloudIntegrationTable,
  type CloudIntegrationRow,
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

type CloudProviderCard = {
  id: string
  name: string
  type: 'aws' | 'azure' | 'gcp' | 'oci' | 'alibaba'
  status: 'connected' | 'disconnected' | 'error' | 'pending'
  accounts: number
  regions: string[]
  lastSync: string
  resources: { total: number; monitored: number }
  alerts: { critical: number; high: number; medium: number; low: number }
  color: string
}

const CLOUD_CARDS: CloudProviderCard[] = [
  {
    id: 'aws-1', name: 'AWS Production', type: 'aws', status: 'connected',
    accounts: 5, regions: ['us-east-1', 'eu-west-1', 'ap-southeast-1'], lastSync: '2 minutes ago',
    resources: { total: 1247, monitored: 1189 },
    alerts: { critical: 3, high: 12, medium: 45, low: 89 },
    color: '#ea580c',
  },
  {
    id: 'azure-1', name: 'Azure Enterprise', type: 'azure', status: 'connected',
    accounts: 3, regions: ['East US', 'West Europe', 'Southeast Asia'], lastSync: '5 minutes ago',
    resources: { total: 843, monitored: 821 },
    alerts: { critical: 1, high: 8, medium: 23, low: 67 },
    color: '#4f46e5',
  },
  {
    id: 'gcp-1', name: 'Google Cloud', type: 'gcp', status: 'connected',
    accounts: 2, regions: ['us-central1', 'europe-west1'], lastSync: '8 minutes ago',
    resources: { total: 456, monitored: 445 },
    alerts: { critical: 0, high: 5, medium: 18, low: 34 },
    color: '#e11d48',
  },
  {
    id: 'oci-1', name: 'Oracle Cloud', type: 'oci', status: 'disconnected',
    accounts: 1, regions: ['us-ashburn-1'], lastSync: '2 hours ago',
    resources: { total: 123, monitored: 0 },
    alerts: { critical: 0, high: 0, medium: 0, low: 0 },
    color: '#dc2626',
  },
]

const CLOUD_TABLE_ROWS: CloudIntegrationRow[] = [
  {
    id: 'CLD-201',
    name: 'AWS Production',
    provider: 'aws',
    accountId: '123456789012',
    regions: ['eu-central-1', 'us-east-1', 'ap-southeast-1'],
    status: 'active',
    resources: 12437,
    alerts: 4,
    misconfigurations: 11,
    lastScan: '3m ago',
    complianceScore: 84,
    services: ['EC2', 'S3', 'IAM', 'EKS'],
  },
  {
    id: 'CLD-187',
    name: 'Azure Shared Services',
    provider: 'azure',
    accountId: '8f44-tenant-22c9',
    regions: ['northeurope', 'westeurope'],
    status: 'degraded',
    resources: 8431,
    alerts: 9,
    misconfigurations: 27,
    lastScan: '14m ago',
    complianceScore: 68,
    services: ['Azure AD', 'Key Vault', 'VM', 'AKS'],
  },
  {
    id: 'CLD-145',
    name: 'GCP Analytics',
    provider: 'gcp',
    accountId: 'soc-analytics-prd',
    regions: ['europe-west1'],
    status: 'active',
    resources: 3122,
    alerts: 0,
    misconfigurations: 3,
    lastScan: '9m ago',
    complianceScore: 92,
    services: ['Compute Engine', 'Cloud SQL', 'GKE'],
  },
  {
    id: 'CLD-101',
    name: 'OCI Billing',
    provider: 'oci',
    accountId: 'ocid1.tenancy.oc1..abc',
    regions: ['us-ashburn-1'],
    status: 'inactive',
    resources: 931,
    alerts: 0,
    misconfigurations: 0,
    lastScan: '2h ago',
    complianceScore: 41,
    services: ['Object Storage', 'VCN'],
  },
]

const CLOUD_FILTERS = [
  { id: 'status:active', label: 'Active', section: 'Status' },
  { id: 'status:degraded', label: 'Degraded', section: 'Status' },
  { id: 'status:inactive', label: 'Inactive', section: 'Status' },
  { id: 'status:error', label: 'Error', section: 'Status' },
  { id: 'provider:aws', label: 'AWS', section: 'Provider' },
  { id: 'provider:azure', label: 'Azure', section: 'Provider' },
  { id: 'provider:gcp', label: 'GCP', section: 'Provider' },
  { id: 'provider:oci', label: 'OCI', section: 'Provider' },
]

export default function CloudIntegrations() {
  const { setPageTitle } = usePageTitle()
  const [cards, setCards] = useState<CloudProviderCard[]>(CLOUD_CARDS)
  const [rows, setRows] = useState<CloudIntegrationRow[]>(CLOUD_TABLE_ROWS)
  const [query, setQuery] = useState('')
  const [selectedFilters, setSelectedFilters] = useState<string[]>([])
  const [riskOnly, setRiskOnly] = useState(false)
  const [scanModalOpen, setScanModalOpen] = useState(false)
  const [wizardOpen, setWizardOpen] = useState(false)
  const [wizardStep, setWizardStep] = useState(0)
  const [cardAction, setCardAction] = useState<{
    type: 'configure' | 'reconnect'
    card: CloudProviderCard
  } | null>(null)
  const [tableAction, setTableAction] = useState<{
    type: 'scan' | 'activate' | 'assets' | 'report'
    row: CloudIntegrationRow
  } | null>(null)
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(5)

  const [providerName, setProviderName] = useState('')
  const [providerType, setProviderType] = useState<CloudIntegrationRow['provider']>('aws')
  const [accountId, setAccountId] = useState('')
  const [scanImmediately, setScanImmediately] = useState(true)
  const [scanDepth, setScanDepth] = useState<'quick' | 'standard' | 'deep'>('standard')
  const [scanScope, setScanScope] = useState<'all' | 'connected' | 'risky'>('connected')
  const [scanNotify, setScanNotify] = useState(true)
  const [cardNote, setCardNote] = useState('')
  const [tableRegion, setTableRegion] = useState('all regions')
  const [reportFormat, setReportFormat] = useState<'pdf' | 'xlsx' | 'html'>('pdf')

  useEffect(() => {
    setPageTitle('Cloud Integrations')
  }, [setPageTitle])

  useEffect(() => {
    if (!cardAction) return
    setCardNote('')
  }, [cardAction])

  useEffect(() => {
    if (!tableAction) return
    setTableRegion('all regions')
    setReportFormat('pdf')
  }, [tableAction])

  const getStatusColor = (status: string) => {
    const map: Record<string, string> = { connected: 'var(--soc-low)', disconnected: 'var(--soc-text-muted)', error: 'var(--soc-critical)', pending: 'var(--soc-high)' }
    return map[status] || 'var(--soc-text-muted)'
  }
  const getStatusBg = (status: string) => {
    const map: Record<string, string> = { connected: 'var(--soc-low-bg)', disconnected: 'var(--soc-border)', error: 'var(--soc-critical-bg)', pending: 'var(--soc-high-bg)' }
    return map[status] || 'var(--soc-border)'
  }

  const getProviderIcon = (type: string) => {
    const iconPaths: Record<string, string> = { aws: '/logos/aws.svg', azure: '/logos/azure.svg', gcp: '/logos/googlecloud.svg', oci: '/logos/oracle.svg', alibaba: '/logos/aws.svg' }
    return <img src={iconPaths[type] || iconPaths.aws} alt={type} className="w-8 h-8 brightness-0 invert" />
  }

  const visibleRows = useMemo(() => {
    const statusFilters = selectedFilters
      .filter((id) => id.startsWith('status:'))
      .map((id) => id.replace('status:', '')) as CloudIntegrationRow['status'][]
    const providerFilters = selectedFilters
      .filter((id) => id.startsWith('provider:'))
      .map((id) => id.replace('provider:', '')) as CloudIntegrationRow['provider'][]
    const q = query.trim().toLowerCase()

    return rows
      .filter((row) => statusFilters.length === 0 || statusFilters.includes(row.status))
      .filter((row) => providerFilters.length === 0 || providerFilters.includes(row.provider))
      .filter((row) => !riskOnly || row.alerts > 0 || row.misconfigurations > 0 || row.complianceScore < 75)
      .filter((row) => !q || row.name.toLowerCase().includes(q) || row.accountId.toLowerCase().includes(q) || row.id.toLowerCase().includes(q))
  }, [rows, selectedFilters, riskOnly, query])

  const totalPages = Math.max(1, Math.ceil(visibleRows.length / rowsPerPage))
  const pagedRows = visibleRows.slice((page - 1) * rowsPerPage, page * rowsPerPage)

  useEffect(() => {
    if (page > totalPages) setPage(1)
  }, [page, totalPages])

  const connectedProviders = cards.filter((p) => p.status === 'connected')
  const totalCritical = cards.reduce((s, p) => s + p.alerts.critical, 0)
  const totalMonitored = cards.reduce((s, p) => s + p.resources.monitored, 0)
  const totalResources = cards.reduce((s, p) => s + p.resources.total, 0)

  return (
    <OverviewPageShell>
      <OverviewPageHeader
        section="ADMINISTRATION"
        title="Cloud Integrations"
        description="Manage and monitor multi-cloud connectors, compliance posture, and provider-specific issues in one unified flow."
        actions={[
          { id: 'run-scan', label: 'Run Scan', variant: 'secondary', onClick: () => setScanModalOpen(true) },
          { id: 'add-integration', label: 'Add Integration', variant: 'primary', onClick: () => setWizardOpen(true) },
        ]}
      />

      <OverviewKpiRow
        columns={4}
        items={[
          { label: 'PROVIDERS', value: cards.length, sub: 'Configured' },
          { label: 'CONNECTED', value: connectedProviders.length, sub: 'Active connections', tone: 'low' },
          { label: 'CRITICAL ALERTS', value: totalCritical, sub: 'Across all providers', tone: totalCritical > 0 ? 'critical' : 'default' },
          { label: 'RESOURCES MONITORED', value: formatNumber(totalMonitored), sub: `of ${formatNumber(totalResources)} total`, tone: 'accent' },
        ]}
      />

      <div className="grid grid-cols-12 gap-4 mb-4">
        {cards.map((provider) => (
          <div key={provider.id} className="col-span-12 lg:col-span-6">
            <div className="soc-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ backgroundColor: provider.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '2.5rem', height: '2.5rem', borderRadius: '8px', flexShrink: 0 }}>
                    {getProviderIcon(provider.type)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--soc-text)', fontSize: '0.9375rem' }}>{provider.name}</div>
                    <div style={{ color: 'var(--soc-text-muted)', fontSize: '0.8125rem', textTransform: 'capitalize' }}>{provider.type}</div>
                  </div>
                </div>
                <span className="soc-badge" style={{ backgroundColor: getStatusBg(provider.status), color: getStatusColor(provider.status) }}>
                  {provider.status.toUpperCase()}
                </span>
              </div>

              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ background: 'var(--soc-raised)', border: '1px solid var(--soc-border)', borderRadius: '6px', padding: '0.75rem', textAlign: 'center' }}>
                  <div style={{ color: 'var(--soc-text-muted)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Accounts</div>
                  <div style={{ fontWeight: 700, fontSize: '1.5rem', color: 'var(--soc-text)' }}>{provider.accounts}</div>
                </div>
                <div style={{ background: 'var(--soc-raised)', border: '1px solid var(--soc-border)', borderRadius: '6px', padding: '0.75rem', textAlign: 'center' }}>
                  <div style={{ color: 'var(--soc-text-muted)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Resources</div>
                  <div style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--soc-text)' }}>{provider.resources.monitored}/{provider.resources.total}</div>
                </div>
              </div>

              {/* Regions */}
              <div style={{ marginBottom: '0.75rem' }}>
                <div style={{ color: 'var(--soc-text-muted)', fontSize: '0.75rem', marginBottom: '0.375rem' }}>Active Regions</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                  {provider.regions.map((region, idx) => (
                    <span key={idx} className="soc-badge" style={{ background: 'var(--soc-raised)', color: 'var(--soc-text-secondary)' }}>{region}</span>
                  ))}
                </div>
              </div>

              {/* Alerts */}
              {provider.status === 'connected' && (provider.alerts.critical > 0 || provider.alerts.high > 0 || provider.alerts.medium > 0) && (
                <div style={{ marginBottom: '0.75rem' }}>
                  <div style={{ color: 'var(--soc-text-muted)', fontSize: '0.75rem', marginBottom: '0.375rem' }}>Active Alerts</div>
                  <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                    {provider.alerts.critical > 0 && (
                      <span className="soc-badge" style={{ backgroundColor: 'var(--soc-critical-bg)', color: 'var(--soc-critical)' }}>{provider.alerts.critical} Critical</span>
                    )}
                    {provider.alerts.high > 0 && (
                      <span className="soc-badge" style={{ backgroundColor: 'var(--soc-high-bg)', color: 'var(--soc-high)' }}>{provider.alerts.high} High</span>
                    )}
                    {provider.alerts.medium > 0 && (
                      <span className="soc-badge" style={{ backgroundColor: 'var(--soc-medium-bg)', color: 'var(--soc-medium)' }}>{provider.alerts.medium} Medium</span>
                    )}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div style={{ borderTop: '1px solid var(--soc-border)', paddingTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--soc-text-muted)', fontSize: '0.8125rem' }}>Last sync: {provider.lastSync}</span>
                <button
                  className="soc-link"
                  style={{ fontSize: '0.8125rem' }}
                  onClick={() =>
                    setCardAction({
                      type: provider.status === 'connected' ? 'configure' : 'reconnect',
                      card: provider,
                    })
                  }
                >
                  {provider.status === 'connected' ? 'Configure →' : 'Reconnect →'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <OverviewTableToolbar
        searchValue={query}
        onSearchChange={(value) => {
          setQuery(value)
          setPage(1)
        }}
        searchPlaceholder="Search cloud account, name, or id..."
        end={(
          <div className="flex w-full items-center justify-end gap-2 whitespace-nowrap">
            <OverviewFilterMenu
              options={CLOUD_FILTERS}
              selected={selectedFilters}
              onApply={(next) => {
                setSelectedFilters(next)
                setPage(1)
              }}
            />
            <OverviewToggle
              label="Risk focus"
              checked={riskOnly}
              onChange={(next) => {
                setRiskOnly(next)
                setPage(1)
              }}
            />
          </div>
        )}
      />

      <OverviewSection
        title="CLOUD ACCOUNTS"
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
        <CloudIntegrationTable
          rows={pagedRows}
          onAction={(type, row) => {
            setTableAction({ type, row })
          }}
        />
        <OverviewPagination page={page} totalPages={totalPages} totalItems={visibleRows.length} onPageChange={setPage} />
      </OverviewSection>

      <OverviewModal
        open={scanModalOpen}
        title="Run Cloud Posture Scan"
        subtitle="CLOUD ACTION"
        onClose={() => setScanModalOpen(false)}
        footer={(
          <div className="flex justify-end gap-2">
            <button type="button" className="soc-btn soc-btn-secondary text-xs" onClick={() => setScanModalOpen(false)}>
              Cancel
            </button>
            <button
              type="button"
              className="soc-btn soc-btn-primary text-xs"
              onClick={() => {
                setRows((prev) => prev.map((row) => ({ ...row, lastScan: 'Just now' })))
                setCards((prev) => prev.map((card) => ({ ...card, lastSync: 'Just now' })))
                if (scanScope === 'risky') {
                  setRows((prev) =>
                    prev.map((row) =>
                      row.alerts > 0 || row.misconfigurations > 0 || row.complianceScore < 75
                        ? { ...row, lastScan: 'Just now' }
                        : row
                    )
                  )
                }
                setScanModalOpen(false)
              }}
            >
              Run Scan Now
            </button>
          </div>
        )}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <label className="text-xs font-medium text-[color:var(--soc-text-muted)]">
              Scan scope
              <select className="soc-input mt-1 w-full text-sm" value={scanScope} onChange={(e) => setScanScope(e.target.value as 'all' | 'connected' | 'risky')}>
                <option value="all">All providers</option>
                <option value="connected">Connected providers only</option>
                <option value="risky">Only risky providers</option>
              </select>
            </label>
            <label className="text-xs font-medium text-[color:var(--soc-text-muted)]">
              Scan depth
              <select className="soc-input mt-1 w-full text-sm" value={scanDepth} onChange={(e) => setScanDepth(e.target.value as 'quick' | 'standard' | 'deep')}>
                <option value="quick">Quick (config drift only)</option>
                <option value="standard">Standard (full baseline)</option>
                <option value="deep">Deep (full + policy evidence)</option>
              </select>
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            <OverviewToggle label="Notify owners after completion" checked={scanNotify} onChange={setScanNotify} />
          </div>
          <div className="rounded-md border border-[color:var(--soc-border)] bg-[color:var(--soc-raised)] p-3 text-xs text-[color:var(--soc-text-secondary)]">
            <p className="font-semibold text-[color:var(--soc-text)]">Execution plan</p>
            <p className="mt-1">Scope: {scanScope} · Depth: {scanDepth}</p>
            <p className="mt-1">{scanNotify ? 'Owner notifications enabled.' : 'No owner notifications.'}</p>
          </div>
        </div>
      </OverviewModal>

      <OverviewModal
        open={!!cardAction}
        title={
          cardAction?.type === 'configure'
            ? `Configure ${cardAction.card.name}`
            : cardAction?.type === 'reconnect'
              ? `Reconnect ${cardAction.card.name}`
              : ''
        }
        subtitle="PROVIDER ACTION"
        onClose={() => setCardAction(null)}
        footer={(
          <div className="flex justify-end gap-2">
            <button type="button" className="soc-btn soc-btn-secondary text-xs" onClick={() => setCardAction(null)}>
              Cancel
            </button>
            <button
              type="button"
              className="soc-btn soc-btn-primary text-xs"
              onClick={() => {
                if (!cardAction) return
                if (cardAction.type === 'configure') {
                  setCards((prev) =>
                    prev.map((c) =>
                      c.id === cardAction.card.id ? { ...c, lastSync: cardNote ? `Configured: ${cardNote}` : 'Configured just now' } : c
                    )
                  )
                } else {
                  setCards((prev) =>
                    prev.map((c) =>
                      c.id === cardAction.card.id ? { ...c, status: 'pending', lastSync: cardNote ? `Reconnect: ${cardNote}` : 'Reconnect queued' } : c
                    )
                  )
                }
                setCardAction(null)
              }}
            >
              Apply
            </button>
          </div>
        )}
      >
        <div className="space-y-4">
          <div className="rounded-md border border-[color:var(--soc-border)] bg-[color:var(--soc-raised)] p-3 text-xs text-[color:var(--soc-text-secondary)]">
            <p className="font-semibold text-[color:var(--soc-text)]">Target Provider</p>
            <p className="mt-1">{cardAction?.card.name} ({cardAction?.card.type.toUpperCase()})</p>
            <p className="mt-1">Current status: {cardAction?.card.status}</p>
          </div>
          <label className="text-xs font-medium text-[color:var(--soc-text-muted)]">
            Change note
            <textarea className="soc-input mt-1 w-full text-sm" rows={3} value={cardNote} onChange={(e) => setCardNote(e.target.value)} />
          </label>
          <p className="text-xs text-[color:var(--soc-text-secondary)]">
            {cardAction?.type === 'configure'
              ? 'Configuration applies provider metadata updates and writes an audit event.'
              : 'Reconnect queues credential validation and transitions provider state to pending.'}
          </p>
        </div>
      </OverviewModal>

      <OverviewModal
        open={!!tableAction}
        title={
          tableAction?.type === 'scan'
            ? `Scan Now: ${tableAction.row.name}`
            : tableAction?.type === 'activate'
              ? `Activate Connection: ${tableAction.row.name}`
            : tableAction?.type === 'assets'
              ? `Assets: ${tableAction.row.name}`
              : tableAction?.type === 'report'
                ? `Compliance Report: ${tableAction.row.name}`
                : ''
        }
        subtitle="CLOUD ACCOUNT ACTION"
        onClose={() => setTableAction(null)}
        footer={(
          <div className="flex justify-end gap-2">
            <button type="button" className="soc-btn soc-btn-secondary text-xs" onClick={() => setTableAction(null)}>
              Close
            </button>
            <button
              type="button"
              className="soc-btn soc-btn-primary text-xs"
              onClick={() => {
                if (!tableAction) return
                if (tableAction.type === 'scan') {
                  setRows((prev) =>
                    prev.map((r) => (r.id === tableAction.row.id ? { ...r, lastScan: `Just now (${tableRegion})` } : r))
                  )
                }
                if (tableAction.type === 'activate') {
                  setRows((prev) =>
                    prev.map((r) =>
                      r.id === tableAction.row.id
                        ? { ...r, status: 'active', lastScan: 'Activation validation queued' }
                        : r
                    )
                  )
                }
                setTableAction(null)
              }}
            >
              {tableAction?.type === 'scan' ? 'Run' : tableAction?.type === 'activate' ? 'Activate' : 'Done'}
            </button>
          </div>
        )}
      >
        {tableAction?.type === 'scan' ? (
          <div className="space-y-3">
            <label className="text-xs font-medium text-[color:var(--soc-text-muted)]">
              Region scope
              <input className="soc-input mt-1 w-full text-sm" value={tableRegion} onChange={(e) => setTableRegion(e.target.value)} />
            </label>
            <p className="text-xs text-[color:var(--soc-text-secondary)]">
              Executes targeted scan for {tableRegion}, updates account posture snapshot, and refreshes scan timeline.
            </p>
          </div>
        ) : tableAction?.type === 'activate' ? (
          <div className="space-y-3">
            <p className="text-sm text-[color:var(--soc-text-secondary)]">
              Activation enables continuous posture checks, service discovery, and alert generation for this account.
            </p>
            <label className="text-xs font-medium text-[color:var(--soc-text-muted)]">
              Initial region scope
              <input className="soc-input mt-1 w-full text-sm" value={tableRegion} onChange={(e) => setTableRegion(e.target.value)} />
            </label>
          </div>
        ) : tableAction?.type === 'assets' ? (
          <div className="space-y-3">
            <p className="text-sm text-[color:var(--soc-text-secondary)]">
              Asset inventory includes compute nodes, storage buckets, and identity principals discovered in this account.
            </p>
            <div className="rounded-md border border-[color:var(--soc-border)] bg-[color:var(--soc-raised)] p-3 text-xs text-[color:var(--soc-text-secondary)]">
              <p>Resources: {tableAction.row.resources.toLocaleString()}</p>
              <p className="mt-1">Open alerts: {tableAction.row.alerts}</p>
              <p className="mt-1">Misconfigurations: {tableAction.row.misconfigurations}</p>
            </div>
          </div>
        ) : tableAction?.type === 'report' ? (
          <div className="space-y-3">
            <label className="text-xs font-medium text-[color:var(--soc-text-muted)]">
              Report format
              <select className="soc-input mt-1 w-full text-sm" value={reportFormat} onChange={(e) => setReportFormat(e.target.value as 'pdf' | 'xlsx' | 'html')}>
                <option value="pdf">PDF (executive summary)</option>
                <option value="xlsx">XLSX (control-level export)</option>
                <option value="html">HTML (interactive portal)</option>
              </select>
            </label>
            <p className="text-xs text-[color:var(--soc-text-secondary)]">
              Generates account-specific compliance evidence package in {reportFormat.toUpperCase()} format.
            </p>
          </div>
        ) : null}
      </OverviewModal>

      <OverviewStepModal
        open={wizardOpen}
        subtitle="ADD CLOUD INTEGRATION"
        currentStep={wizardStep}
        onStepChange={setWizardStep}
        onClose={() => {
          setWizardOpen(false)
          setWizardStep(0)
        }}
        onFinish={() => {
          const safeName = providerName.trim()
          const safeAccount = accountId.trim()
          setRows((prev) => [
            {
              id: `CLD-${300 + prev.length}`,
              name: safeName,
              provider: providerType,
              accountId: safeAccount,
              regions: ['pending-discovery'],
              status: 'inactive',
              resources: 0,
              alerts: 0,
              misconfigurations: 0,
              lastScan: scanImmediately ? 'Queued' : 'Not scanned',
              complianceScore: 0,
              services: [],
            },
            ...prev,
          ])
          setCards((prev) => [
            {
              id: `card-${providerType}-${prev.length + 1}`,
              name: safeName,
              type: providerType === 'other' ? 'alibaba' : providerType,
              status: 'pending',
              accounts: 1,
              regions: ['pending-discovery'],
              lastSync: 'Not synced',
              resources: { total: 0, monitored: 0 },
              alerts: { critical: 0, high: 0, medium: 0, low: 0 },
              color: providerType === 'aws' ? '#ea580c' : providerType === 'azure' ? '#4f46e5' : providerType === 'gcp' ? '#16a34a' : '#dc2626',
            },
            ...prev,
          ])
          setProviderName('')
          setAccountId('')
          setProviderType('aws')
          setScanImmediately(true)
          setWizardOpen(false)
          setWizardStep(0)
          setPage(1)
        }}
        steps={[
          {
            id: 'provider',
            title: 'Step 1: Provider',
            canProceed: () => providerName.trim().length > 1 && accountId.trim().length > 2,
            validationHint: 'Provider name and account id are required.',
            content: (
              <div className="grid gap-3">
                <label className="text-xs font-medium text-[color:var(--soc-text-muted)]">
                  Integration Name
                  <input className="soc-input mt-1 w-full text-sm" value={providerName} onChange={(e) => setProviderName(e.target.value)} />
                </label>
                <label className="text-xs font-medium text-[color:var(--soc-text-muted)]">
                  Cloud Provider
                  <select
                    className="soc-input mt-1 w-full text-sm"
                    value={providerType}
                    onChange={(e) => setProviderType(e.target.value as CloudIntegrationRow['provider'])}
                  >
                    <option value="aws">AWS</option>
                    <option value="azure">Azure</option>
                    <option value="gcp">GCP</option>
                    <option value="oci">OCI</option>
                    <option value="other">Other</option>
                  </select>
                </label>
                <label className="text-xs font-medium text-[color:var(--soc-text-muted)]">
                  Account / Tenant Id
                  <input className="soc-input mt-1 w-full text-sm" value={accountId} onChange={(e) => setAccountId(e.target.value)} />
                </label>
              </div>
            ),
          },
          {
            id: 'scan',
            title: 'Step 2: Scan Preference',
            content: <OverviewToggle label="Queue first posture scan after creation" checked={scanImmediately} onChange={setScanImmediately} />,
          },
          {
            id: 'review',
            title: 'Step 3: Review & Create',
            content: (
              <div className="space-y-2 text-sm text-[color:var(--soc-text-secondary)]">
                <p><span className="font-semibold text-[color:var(--soc-text)]">Name:</span> {providerName || '—'}</p>
                <p><span className="font-semibold text-[color:var(--soc-text)]">Provider:</span> {providerType.toUpperCase()}</p>
                <p><span className="font-semibold text-[color:var(--soc-text)]">Account ID:</span> {accountId || '—'}</p>
                <p><span className="font-semibold text-[color:var(--soc-text)]">First scan:</span> {scanImmediately ? 'Queued automatically' : 'Manual trigger later'}</p>
              </div>
            ),
          },
        ]}
      />
    </OverviewPageShell>
  )
}

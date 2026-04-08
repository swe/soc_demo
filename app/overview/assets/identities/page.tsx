'use client'

import { Fragment, useEffect, useMemo, useState } from 'react'
import { usePageTitle } from '@/app/page-title-context'
import {
  OverviewAlert,
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

type IdentityStatus = 'active' | 'inactive' | 'locked'
type AccessLevel = 'admin' | 'user' | 'guest'

interface Identity {
  id: string
  name: string
  email: string
  role: string
  department: string
  status: IdentityStatus
  riskScore: number
  lastLogin: string
  updatedDate: string
  mfaEnabled: boolean
  accessLevel: AccessLevel
  activeSessions: number
  failedLoginAttempts: number
  anomalousActivity: boolean
}

const INITIAL_IDENTITIES: Identity[] = [
  { id: 'USR-001', name: 'Peter Pan', email: 'peter.pan@company.com', role: 'Security Analyst', department: 'Security Operations', status: 'active', riskScore: 15, lastLogin: '5m ago', updatedDate: '2026-04-08', mfaEnabled: true, accessLevel: 'user', activeSessions: 2, failedLoginAttempts: 0, anomalousActivity: false },
  { id: 'USR-002', name: 'Sarah Chen', email: 'sarah.chen@company.com', role: 'SOC Manager', department: 'Security Operations', status: 'active', riskScore: 8, lastLogin: '2h ago', updatedDate: '2026-04-08', mfaEnabled: true, accessLevel: 'admin', activeSessions: 1, failedLoginAttempts: 0, anomalousActivity: false },
  { id: 'USR-003', name: 'Mike Johnson', email: 'mike.johnson@company.com', role: 'Developer', department: 'Engineering', status: 'inactive', riskScore: 42, lastLogin: '3d ago', updatedDate: '2026-04-06', mfaEnabled: false, accessLevel: 'user', activeSessions: 0, failedLoginAttempts: 3, anomalousActivity: true },
  { id: 'USR-004', name: 'Sarah Williams', email: 'sarah.williams@company.com', role: 'Admin', department: 'IT', status: 'active', riskScore: 12, lastLogin: '1h ago', updatedDate: '2026-04-08', mfaEnabled: true, accessLevel: 'admin', activeSessions: 1, failedLoginAttempts: 0, anomalousActivity: false },
  { id: 'USR-005', name: 'James Rodriguez', email: 'james.rodriguez@company.com', role: 'Analyst II', department: 'Security Operations', status: 'active', riskScore: 20, lastLogin: '30m ago', updatedDate: '2026-04-08', mfaEnabled: true, accessLevel: 'user', activeSessions: 2, failedLoginAttempts: 0, anomalousActivity: false },
  { id: 'USR-006', name: 'Emily Taylor', email: 'emily.taylor@company.com', role: 'Analyst II', department: 'Security Operations', status: 'active', riskScore: 18, lastLogin: '1h ago', updatedDate: '2026-04-08', mfaEnabled: true, accessLevel: 'user', activeSessions: 1, failedLoginAttempts: 0, anomalousActivity: false },
  { id: 'USR-007', name: 'Alex Petrov', email: 'alex.petrov@company.com', role: 'Analyst I', department: 'Security Operations', status: 'active', riskScore: 25, lastLogin: '4h ago', updatedDate: '2026-04-07', mfaEnabled: true, accessLevel: 'user', activeSessions: 1, failedLoginAttempts: 1, anomalousActivity: false },
  { id: 'USR-008', name: 'Chris Thompson', email: 'chris.thompson@company.com', role: 'Finance Manager', department: 'Finance', status: 'active', riskScore: 35, lastLogin: '20m ago', updatedDate: '2026-04-08', mfaEnabled: false, accessLevel: 'user', activeSessions: 1, failedLoginAttempts: 0, anomalousActivity: false },
  { id: 'USR-009', name: 'Lisa Wong', email: 'lisa.wong@company.com', role: 'Cloud Architect', department: 'Engineering', status: 'active', riskScore: 22, lastLogin: '3h ago', updatedDate: '2026-04-07', mfaEnabled: true, accessLevel: 'user', activeSessions: 1, failedLoginAttempts: 0, anomalousActivity: false },
  { id: 'USR-010', name: 'David Kim', email: 'david.kim@company.com', role: 'HR Director', department: 'HR', status: 'locked', riskScore: 58, lastLogin: '5d ago', updatedDate: '2026-04-05', mfaEnabled: false, accessLevel: 'user', activeSessions: 0, failedLoginAttempts: 7, anomalousActivity: true },
]

const STATUS_CONFIG: Record<IdentityStatus, { color: string; bg: string; bar: string; label: string }> = {
  active: { color: 'var(--soc-low)', bg: 'var(--soc-low-bg)', bar: 'var(--soc-low)', label: 'Active' },
  inactive: { color: 'var(--soc-text-muted)', bg: 'var(--soc-overlay)', bar: 'var(--soc-text-muted)', label: 'Inactive' },
  locked: { color: 'var(--soc-critical)', bg: 'var(--soc-critical-bg)', bar: 'var(--soc-critical)', label: 'Locked' },
}

const ACCESS_CONFIG: Record<AccessLevel, { color: string; label: string }> = {
  admin: { color: 'var(--soc-accent)', label: 'Admin' },
  user: { color: 'var(--soc-text-secondary)', label: 'User' },
  guest: { color: 'var(--soc-text-muted)', label: 'Guest' },
}

type PendingAction = { type: 'reset-mfa' | 'lock' | 'unlock'; identityId: string }
type Flash = { tone: 'success' | 'attention'; title: string; description: string } | null

function getTodayIso() {
  return new Date().toISOString().slice(0, 10)
}

export default function IdentitiesPage() {
  const { setPageTitle } = usePageTitle()
  const [identities, setIdentities] = useState<Identity[]>(INITIAL_IDENTITIES)
  const [query, setQuery] = useState('')
  const [combinedFilters, setCombinedFilters] = useState<string[]>([
    'active',
    'inactive',
    'locked',
    'admin',
    'user',
    'guest',
  ])
  const [criticalOnly, setCriticalOnly] = useState(false)
  const [mfaOnly, setMfaOnly] = useState(false)
  const [expanded, setExpanded] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(5)

  const [selectedIdentityId, setSelectedIdentityId] = useState<string | null>(null)
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null)
  const [actionBusy, setActionBusy] = useState(false)
  const [flash, setFlash] = useState<Flash>(null)

  const [exportOpen, setExportOpen] = useState(false)
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'pdf'>('csv')
  const [exportFilteredOnly, setExportFilteredOnly] = useState(true)
  const [exportState, setExportState] = useState<'idle' | 'running' | 'done'>('idle')

  const [addOpen, setAddOpen] = useState(false)
  const [addStep, setAddStep] = useState(0)
  const [newIdentity, setNewIdentity] = useState({
    name: '',
    email: '',
    role: '',
    department: '',
    accessLevel: 'user' as AccessLevel,
  })

  useEffect(() => {
    setPageTitle('Identities')
  }, [setPageTitle])

  const counts = useMemo(() => {
    const total = identities.length
    const active = identities.filter((i) => i.status === 'active').length
    const locked = identities.filter((i) => i.status === 'locked').length
    const noMfa = identities.filter((i) => !i.mfaEnabled).length
    const admins = identities.filter((i) => i.accessLevel === 'admin').length
    const anomalous = identities.filter((i) => i.anomalousActivity).length
    const highRisk = identities.filter((i) => i.riskScore >= 40).length
    return { total, active, locked, noMfa, admins, anomalous, highRisk }
  }, [identities])

  const visible = useMemo(() => {
    const q = query.toLowerCase()
    const selectedStatuses = combinedFilters.filter((id): id is IdentityStatus =>
      ['active', 'inactive', 'locked'].includes(id),
    )
    const selectedAccess = combinedFilters.filter((id): id is AccessLevel =>
      ['admin', 'user', 'guest'].includes(id),
    )
    return identities
      .filter((i) => selectedStatuses.length === 0 || selectedStatuses.includes(i.status))
      .filter((i) => selectedAccess.length === 0 || selectedAccess.includes(i.accessLevel))
      .filter((i) => !criticalOnly || i.riskScore >= 40 || i.anomalousActivity)
      .filter((i) => !mfaOnly || i.mfaEnabled)
      .filter(
        (i) =>
          !q ||
          i.name.toLowerCase().includes(q) ||
          i.email.toLowerCase().includes(q) ||
          i.role.toLowerCase().includes(q) ||
          i.department.toLowerCase().includes(q),
      )
  }, [identities, combinedFilters, criticalOnly, mfaOnly, query])

  const totalPages = Math.max(1, Math.ceil(visible.length / rowsPerPage))
  const pagedRows = visible.slice((page - 1) * rowsPerPage, page * rowsPerPage)
  const selectedIdentity = selectedIdentityId ? identities.find((i) => i.id === selectedIdentityId) ?? null : null
  const pendingIdentity = pendingAction ? identities.find((i) => i.id === pendingAction.identityId) ?? null : null

  useEffect(() => {
    if (page > totalPages) setPage(1)
  }, [page, totalPages])

  const executeIdentityAction = async () => {
    if (!pendingAction || !pendingIdentity) return
    setActionBusy(true)
    await new Promise((resolve) => setTimeout(resolve, 900))
    const today = getTodayIso()

    setIdentities((prev) =>
      prev.map((identity) => {
        if (identity.id !== pendingAction.identityId) return identity
        if (pendingAction.type === 'reset-mfa') {
          return {
            ...identity,
            mfaEnabled: true,
            failedLoginAttempts: 0,
            lastLogin: 'just now',
            updatedDate: today,
          }
        }
        if (pendingAction.type === 'lock') {
          return {
            ...identity,
            status: 'locked',
            activeSessions: 0,
            updatedDate: today,
          }
        }
        return {
          ...identity,
          status: 'active',
          failedLoginAttempts: Math.max(0, identity.failedLoginAttempts - 2),
          updatedDate: today,
        }
      }),
    )

    setActionBusy(false)
    const actionTitle =
      pendingAction.type === 'reset-mfa'
        ? `MFA reset completed for ${pendingIdentity.name}`
        : pendingAction.type === 'lock'
          ? `${pendingIdentity.name} account locked`
          : `${pendingIdentity.name} account unlocked`

    setFlash({
      tone: pendingAction.type === 'reset-mfa' ? 'success' : 'attention',
      title: actionTitle,
      description: 'Identity posture was updated and reflected in table metrics.',
    })
    setPendingAction(null)
  }

  const startExport = async () => {
    setExportState('running')
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setExportState('done')
  }

  const resetAddFlow = () => {
    setAddOpen(false)
    setAddStep(0)
    setNewIdentity({
      name: '',
      email: '',
      role: '',
      department: '',
      accessLevel: 'user',
    })
  }

  const addIdentity = () => {
    const nextNumber =
      Math.max(
        ...identities
          .map((i) => Number.parseInt(i.id.replace('USR-', ''), 10))
          .filter((n) => Number.isFinite(n)),
      ) + 1
    const today = getTodayIso()
    setIdentities((prev) => [
      {
        id: `USR-${String(nextNumber).padStart(3, '0')}`,
        name: newIdentity.name,
        email: newIdentity.email,
        role: newIdentity.role,
        department: newIdentity.department,
        status: 'active',
        riskScore: 18,
        lastLogin: 'Never',
        updatedDate: today,
        mfaEnabled: true,
        accessLevel: newIdentity.accessLevel,
        activeSessions: 0,
        failedLoginAttempts: 0,
        anomalousActivity: false,
      },
      ...prev,
    ])
    setFlash({
      tone: 'success',
      title: `Identity ${newIdentity.name} created`,
      description: 'New identity was added with baseline security controls.',
    })
    resetAddFlow()
  }

  const combinedFilterOptions = [
    { id: 'active', label: 'Active', section: 'Status' },
    { id: 'inactive', label: 'Inactive', section: 'Status' },
    { id: 'locked', label: 'Locked', section: 'Status' },
    { id: 'admin', label: 'Admin', section: 'Access level' },
    { id: 'user', label: 'User', section: 'Access level' },
    { id: 'guest', label: 'Guest', section: 'Access level' },
  ]

  return (
    <OverviewPageShell>
      <OverviewPageHeader
        section="IDENTITY & ACCESS"
        title="Identities"
        description="Identity inventory for access hygiene, risky behavior detection, and account containment."
        actions={[
          {
            id: 'export',
            label: 'Export',
            variant: 'secondary',
            onClick: () => {
              setExportOpen(true)
              setExportState('idle')
            },
          },
          { id: 'add-identity', label: 'Add Identity', variant: 'primary', onClick: () => setAddOpen(true) },
        ]}
      />

      {flash && (
        <div className="mb-4">
          <OverviewAlert tone={flash.tone} title={flash.title} description={flash.description} />
        </div>
      )}

      <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-2">
        <OverviewAlert
          tone={counts.highRisk > 0 ? 'critical' : 'success'}
          title={counts.highRisk > 0 ? `${counts.highRisk} risky identities need review` : 'Identity risk posture is stable'}
          description="High risk includes score >= 40 or anomalous activity marker."
        />
        <OverviewAlert
          tone={counts.noMfa > 0 ? 'attention' : 'info'}
          title={counts.noMfa > 0 ? `${counts.noMfa} identities without MFA` : 'MFA coverage complete'}
          description="Use Reset MFA from row details or identity modal to remediate accounts."
        />
      </div>

      <OverviewKpiRow
        columns={5}
        items={[
          { label: 'TOTAL IDENTITIES', value: counts.total, sub: 'Managed accounts' },
          { label: 'ACTIVE', value: counts.active, sub: 'Operational', tone: 'low' },
          { label: 'LOCKED', value: counts.locked, sub: 'Restricted', tone: counts.locked > 0 ? 'critical' : 'default' },
          { label: 'ADMINS', value: counts.admins, sub: 'Privileged', tone: 'high' },
          { label: 'ANOMALOUS', value: counts.anomalous, sub: 'Behavioral flags', tone: counts.anomalous > 0 ? 'critical' : 'low' },
        ]}
      />

      <OverviewTableToolbar
        searchValue={query}
        onSearchChange={setQuery}
        searchPlaceholder="Search name, email, role, department..."
        end={
          <div className="flex w-full flex-wrap gap-2 sm:justify-end">
            <OverviewFilterMenu
              options={combinedFilterOptions}
              selected={combinedFilters}
              onApply={(next) => {
                setCombinedFilters(next)
                setPage(1)
              }}
            />
            <OverviewToggle
              label="Critical only"
              checked={criticalOnly}
              onChange={(next) => {
                setCriticalOnly(next)
                setPage(1)
              }}
            />
            <OverviewToggle
              label="MFA enabled only"
              checked={mfaOnly}
              onChange={(next) => {
                setMfaOnly(next)
                setPage(1)
              }}
            />
          </div>
        }
      />

      <OverviewSection
        title="IDENTITY INVENTORY"
        right={
          <OverviewRowsPerPageMenu
            value={rowsPerPage}
            options={[5, 10]}
            onChange={(n) => {
              setRowsPerPage(n)
              setPage(1)
            }}
          />
        }
        flush
      >
        <table className="soc-table" style={{ tableLayout: 'fixed', width: '100%' }}>
          <thead>
            <tr>
              <th style={{ width: '6px', padding: 0 }} />
              <th style={{ width: '25%' }}>Identity</th>
              <th style={{ width: '12%' }}>Role</th>
              <th style={{ width: '12%' }}>Department</th>
              <th style={{ width: '10%' }}>Access</th>
              <th className="text-center" style={{ width: '8%' }}>MFA</th>
              <th className="text-center" style={{ width: '8%' }}>Failed</th>
              <th className="text-right" style={{ width: '8%' }}>Risk</th>
              <th style={{ width: '9%' }}>Status</th>
              <th style={{ width: '8%' }}>Last Login</th>
            </tr>
          </thead>
          <tbody>
            {pagedRows.map((identity) => {
              const status = STATUS_CONFIG[identity.status]
              const access = ACCESS_CONFIG[identity.accessLevel]
              const isExpanded = expanded.includes(identity.id)
              return (
                <Fragment key={identity.id}>
                  <tr
                    className="cursor-pointer"
                    onClick={() =>
                      setExpanded((prev) =>
                        prev.includes(identity.id) ? prev.filter((id) => id !== identity.id) : [...prev, identity.id],
                      )
                    }
                  >
                    <td style={{ padding: 0 }}>
                      <div
                        style={{
                          width: '3px',
                          marginLeft: '1px',
                          height: '100%',
                          minHeight: '2.7rem',
                          backgroundColor: status.bar,
                          borderRadius: '0 2px 2px 0',
                        }}
                      />
                    </td>
                    <td>
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                          style={{ backgroundColor: 'var(--soc-accent-bg)', color: 'var(--soc-accent-text)' }}
                        >
                          {identity.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .slice(0, 2)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="truncate text-sm font-medium" style={{ color: 'var(--soc-text)' }}>{identity.name}</p>
                            {identity.anomalousActivity && <span className="soc-badge soc-badge-critical">!</span>}
                          </div>
                          <p className="truncate text-xs" style={{ color: 'var(--soc-text-muted)' }}>{identity.email}</p>
                        </div>
                      </div>
                    </td>
                    <td><span className="text-xs" style={{ color: 'var(--soc-text-secondary)' }}>{identity.role}</span></td>
                    <td><span className="text-xs" style={{ color: 'var(--soc-text-secondary)' }}>{identity.department}</span></td>
                    <td>
                      <span className="soc-badge" style={{ color: access.color, border: `1px solid ${access.color}44`, background: 'transparent' }}>
                        {access.label}
                      </span>
                    </td>
                    <td className="text-center">
                      <span style={{ color: identity.mfaEnabled ? 'var(--soc-low)' : 'var(--soc-critical)', fontSize: '14px' }}>
                        {identity.mfaEnabled ? '✓' : '✗'}
                      </span>
                    </td>
                    <td className="text-center">
                      <span
                        className="text-sm font-semibold tabular-nums"
                        style={{
                          color:
                            identity.failedLoginAttempts >= 3
                              ? 'var(--soc-critical)'
                              : identity.failedLoginAttempts > 0
                                ? 'var(--soc-medium)'
                                : 'var(--soc-text-muted)',
                        }}
                      >
                        {identity.failedLoginAttempts}
                      </span>
                    </td>
                    <td className="text-right">
                      <span
                        className="text-sm font-bold tabular-nums"
                        style={{
                          color:
                            identity.riskScore >= 50
                              ? 'var(--soc-critical)'
                              : identity.riskScore >= 30
                                ? 'var(--soc-medium)'
                                : 'var(--soc-low)',
                        }}
                      >
                        {identity.riskScore}
                      </span>
                    </td>
                    <td>
                      <span className="soc-badge" style={{ backgroundColor: status.bg, color: status.color }}>
                        {status.label}
                      </span>
                    </td>
                    <td>
                      <span className="text-xs" style={{ color: 'var(--soc-text-muted)' }}>{identity.lastLogin}</span>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr>
                      <td colSpan={10} style={{ padding: 0, backgroundColor: 'var(--soc-raised)', borderTop: '1px solid var(--soc-border)' }}>
                        <div className="space-y-3 px-4 py-3">
                          <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2 lg:grid-cols-4" style={{ color: 'var(--soc-text-secondary)' }}>
                            <p><span className="font-semibold" style={{ color: 'var(--soc-text)' }}>Identity ID:</span> {identity.id}</p>
                            <p><span className="font-semibold" style={{ color: 'var(--soc-text)' }}>Sessions:</span> {identity.activeSessions}</p>
                            <p><span className="font-semibold" style={{ color: 'var(--soc-text)' }}>Updated:</span> {identity.updatedDate}</p>
                            <p><span className="font-semibold" style={{ color: 'var(--soc-text)' }}>Anomaly:</span> {identity.anomalousActivity ? 'Detected' : 'None'}</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              className="soc-btn soc-btn-secondary text-xs"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedIdentityId(identity.id)
                              }}
                            >
                              View details
                            </button>
                            <button
                              type="button"
                              className="soc-btn soc-btn-secondary text-xs"
                              onClick={(e) => {
                                e.stopPropagation()
                                setPendingAction({ type: 'reset-mfa', identityId: identity.id })
                              }}
                            >
                              Reset MFA
                            </button>
                            <button
                              type="button"
                              className={`soc-btn text-xs ${identity.status === 'locked' ? 'soc-btn-primary' : 'soc-btn-secondary'}`}
                              onClick={(e) => {
                                e.stopPropagation()
                                setPendingAction({
                                  type: identity.status === 'locked' ? 'unlock' : 'lock',
                                  identityId: identity.id,
                                })
                              }}
                            >
                              {identity.status === 'locked' ? 'Unlock account' : 'Lock account'}
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
          </tbody>
        </table>
        <OverviewPagination page={page} totalPages={totalPages} totalItems={visible.length} onPageChange={setPage} />
      </OverviewSection>

      <OverviewModal
        open={!!selectedIdentity}
        title={selectedIdentity?.name ?? ''}
        subtitle={selectedIdentity?.id}
        onClose={() => setSelectedIdentityId(null)}
        maxWidth="max-w-2xl"
        footer={
          selectedIdentity ? (
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                className="soc-btn soc-btn-secondary"
                onClick={() => setPendingAction({ type: 'reset-mfa', identityId: selectedIdentity.id })}
              >
                Reset MFA
              </button>
              <button
                type="button"
                className="soc-btn soc-btn-primary"
                onClick={() =>
                  setPendingAction({
                    type: selectedIdentity.status === 'locked' ? 'unlock' : 'lock',
                    identityId: selectedIdentity.id,
                  })
                }
              >
                {selectedIdentity.status === 'locked' ? 'Unlock account' : 'Lock account'}
              </button>
            </div>
          ) : null
        }
      >
        {selectedIdentity && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <span className="soc-badge" style={{ backgroundColor: STATUS_CONFIG[selectedIdentity.status].bg, color: STATUS_CONFIG[selectedIdentity.status].color }}>
                {STATUS_CONFIG[selectedIdentity.status].label}
              </span>
              <span className="soc-badge" style={{ color: ACCESS_CONFIG[selectedIdentity.accessLevel].color, border: `1px solid ${ACCESS_CONFIG[selectedIdentity.accessLevel].color}44`, background: 'transparent' }}>
                {ACCESS_CONFIG[selectedIdentity.accessLevel].label}
              </span>
              <span className="soc-badge">Risk {selectedIdentity.riskScore}</span>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                ['Email', selectedIdentity.email],
                ['Role', selectedIdentity.role],
                ['Department', selectedIdentity.department],
                ['MFA', selectedIdentity.mfaEnabled ? 'Enabled' : 'Disabled'],
                ['Last login', selectedIdentity.lastLogin],
                ['Active sessions', String(selectedIdentity.activeSessions)],
                ['Failed logins', String(selectedIdentity.failedLoginAttempts)],
                ['Anomalous activity', selectedIdentity.anomalousActivity ? 'Detected' : 'None'],
              ].map(([label, value]) => (
                <div key={label} className="rounded-md border p-3" style={{ borderColor: 'var(--soc-border)', backgroundColor: 'var(--soc-raised)' }}>
                  <p className="soc-label mb-1">{label}</p>
                  <p className="text-sm font-medium" style={{ color: 'var(--soc-text)' }}>{value}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </OverviewModal>

      <OverviewModal
        open={!!pendingAction && !!pendingIdentity}
        title={
          pendingAction?.type === 'reset-mfa'
            ? 'Reset MFA enrollment'
            : pendingAction?.type === 'lock'
              ? 'Lock identity'
              : 'Unlock identity'
        }
        subtitle={pendingIdentity?.name}
        onClose={() => (actionBusy ? undefined : setPendingAction(null))}
        maxWidth="max-w-lg"
        footer={
          <div className="flex gap-2 sm:justify-end">
            <button type="button" className="soc-btn soc-btn-secondary" disabled={actionBusy} onClick={() => setPendingAction(null)}>
              Cancel
            </button>
            <button type="button" className="soc-btn soc-btn-primary" disabled={actionBusy} onClick={() => void executeIdentityAction()}>
              {actionBusy ? 'Applying...' : 'Confirm action'}
            </button>
          </div>
        }
      >
        {pendingIdentity && pendingAction && (
          <div className="space-y-3">
            <p className="text-sm" style={{ color: 'var(--soc-text-secondary)' }}>
              {pendingAction.type === 'reset-mfa' && 'This will reset MFA enrollment and require re-registration on next sign-in.'}
              {pendingAction.type === 'lock' && 'This will block interactive sign-ins and terminate active identity sessions.'}
              {pendingAction.type === 'unlock' && 'This will restore identity access and move status back to active.'}
            </p>
            <div className="rounded-md border p-3 text-xs" style={{ borderColor: 'var(--soc-border)', backgroundColor: 'var(--soc-raised)', color: 'var(--soc-text-secondary)' }}>
              <p><span className="font-semibold" style={{ color: 'var(--soc-text)' }}>Identity:</span> {pendingIdentity.name}</p>
              <p><span className="font-semibold" style={{ color: 'var(--soc-text)' }}>Current status:</span> {STATUS_CONFIG[pendingIdentity.status].label}</p>
              <p><span className="font-semibold" style={{ color: 'var(--soc-text)' }}>Current risk:</span> {pendingIdentity.riskScore}</p>
            </div>
          </div>
        )}
      </OverviewModal>

      <OverviewModal
        open={exportOpen}
        title="Export identities"
        subtitle="IDENTITY REPORT"
        onClose={() => setExportOpen(false)}
        maxWidth="max-w-xl"
        footer={
          <div className="flex gap-2 sm:justify-end">
            <button type="button" className="soc-btn soc-btn-secondary" onClick={() => setExportOpen(false)}>
              Close
            </button>
            <button
              type="button"
              className="soc-btn soc-btn-primary"
              onClick={() => void startExport()}
              disabled={exportState === 'running'}
            >
              {exportState === 'running' ? 'Preparing...' : exportState === 'done' ? 'Export again' : 'Start export'}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <p className="soc-label mb-2">FORMAT</p>
            <div className="flex flex-wrap gap-2">
              {(['csv', 'json', 'pdf'] as const).map((format) => (
                <button
                  key={format}
                  type="button"
                  className={`soc-btn text-xs ${exportFormat === format ? 'soc-btn-primary' : 'soc-btn-secondary'}`}
                  onClick={() => setExportFormat(format)}
                >
                  {format.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <OverviewToggle label="Export filtered results only" checked={exportFilteredOnly} onChange={setExportFilteredOnly} />
          <div className="rounded-md border p-3 text-xs" style={{ borderColor: 'var(--soc-border)', backgroundColor: 'var(--soc-raised)', color: 'var(--soc-text-secondary)' }}>
            Export scope: {exportFilteredOnly ? `${visible.length} visible identities` : `${identities.length} total identities`}
          </div>
          {exportState === 'done' && (
            <OverviewAlert
              tone="success"
              title="Export package ready"
              description={`Generated ${exportFormat.toUpperCase()} package for ${exportFilteredOnly ? 'filtered' : 'full'} identity inventory.`}
            />
          )}
        </div>
      </OverviewModal>

      <OverviewStepModal
        open={addOpen}
        subtitle="ADD IDENTITY"
        currentStep={addStep}
        onStepChange={setAddStep}
        onClose={resetAddFlow}
        onFinish={addIdentity}
        steps={[
          {
            id: 'identity',
            title: 'Step 1: Identity profile',
            canProceed: () => newIdentity.name.trim().length > 2 && newIdentity.email.trim().length > 5,
            validationHint: 'Name and email are required.',
            content: (
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-xs font-medium" style={{ color: 'var(--soc-text-secondary)' }}>
                  Full name
                  <input
                    className="soc-input mt-1 w-full text-sm"
                    value={newIdentity.name}
                    onChange={(e) => setNewIdentity((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Jane Doe"
                  />
                </label>
                <label className="text-xs font-medium" style={{ color: 'var(--soc-text-secondary)' }}>
                  Email
                  <input
                    className="soc-input mt-1 w-full text-sm"
                    value={newIdentity.email}
                    onChange={(e) => setNewIdentity((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="jane.doe@company.com"
                  />
                </label>
                <label className="text-xs font-medium" style={{ color: 'var(--soc-text-secondary)' }}>
                  Role
                  <input
                    className="soc-input mt-1 w-full text-sm"
                    value={newIdentity.role}
                    onChange={(e) => setNewIdentity((prev) => ({ ...prev, role: e.target.value }))}
                    placeholder="Security Analyst"
                  />
                </label>
                <label className="text-xs font-medium" style={{ color: 'var(--soc-text-secondary)' }}>
                  Department
                  <input
                    className="soc-input mt-1 w-full text-sm"
                    value={newIdentity.department}
                    onChange={(e) => setNewIdentity((prev) => ({ ...prev, department: e.target.value }))}
                    placeholder="Security Operations"
                  />
                </label>
              </div>
            ),
          },
          {
            id: 'access',
            title: 'Step 2: Access setup',
            canProceed: () => newIdentity.role.trim().length > 1 && newIdentity.department.trim().length > 1,
            validationHint: 'Role and department are required.',
            content: (
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-xs font-medium" style={{ color: 'var(--soc-text-secondary)' }}>
                  Access level
                  <select
                    className="soc-input mt-1 w-full text-sm"
                    value={newIdentity.accessLevel}
                    onChange={(e) => setNewIdentity((prev) => ({ ...prev, accessLevel: e.target.value as AccessLevel }))}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="guest">Guest</option>
                  </select>
                </label>
                <div className="rounded-md border p-3 text-xs" style={{ borderColor: 'var(--soc-border)', backgroundColor: 'var(--soc-raised)', color: 'var(--soc-text-secondary)' }}>
                  MFA will be enabled by default and first login will require enrollment.
                </div>
              </div>
            ),
          },
          {
            id: 'review',
            title: 'Step 3: Review',
            content: (
              <div className="space-y-3 rounded-md border p-4" style={{ borderColor: 'var(--soc-border)', backgroundColor: 'var(--soc-raised)' }}>
                {[
                  ['Name', newIdentity.name || '—'],
                  ['Email', newIdentity.email || '—'],
                  ['Role', newIdentity.role || '—'],
                  ['Department', newIdentity.department || '—'],
                  ['Access level', ACCESS_CONFIG[newIdentity.accessLevel].label],
                  ['MFA', 'Enabled by default'],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between border-b pb-2 last:border-b-0 last:pb-0" style={{ borderColor: 'var(--soc-border)' }}>
                    <p className="soc-label">{label}</p>
                    <p className="text-sm font-medium" style={{ color: 'var(--soc-text)' }}>{value}</p>
                  </div>
                ))}
              </div>
            ),
          },
        ]}
      />
    </OverviewPageShell>
  )
}

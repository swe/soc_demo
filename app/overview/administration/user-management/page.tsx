'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePageTitle } from '@/app/page-title-context'
import {
  AdminUserTable,
  type AdminUserRow,
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

const INITIAL_USERS: AdminUserRow[] = [
  { id: 'ADM-1001', name: 'Peter Pan', email: 'peter.pan@neverlands.art', role: 'analyst', status: 'active', lastLogin: '2 min ago', mfaEnabled: true, teamsCount: 3, createdAt: '2025-07-11' },
  { id: 'ADM-1002', name: 'Sarah Chen', email: 'sarah.chen@neverlands.art', role: 'admin', status: 'active', lastLogin: '1 hour ago', mfaEnabled: true, teamsCount: 4, createdAt: '2025-04-20' },
  { id: 'ADM-1003', name: 'James Rodriguez', email: 'james.rodriguez@neverlands.art', role: 'admin', status: 'active', lastLogin: '3 hours ago', mfaEnabled: true, teamsCount: 2, createdAt: '2025-09-30' },
  { id: 'ADM-1004', name: 'Emily Taylor', email: 'emily.taylor@neverlands.art', role: 'super-admin', status: 'active', lastLogin: 'Today, 09:14', mfaEnabled: true, teamsCount: 5, createdAt: '2024-12-03' },
  { id: 'ADM-1005', name: 'Michael Kim', email: 'michael.kim@neverlands.art', role: 'analyst', status: 'inactive', lastLogin: '2 days ago', mfaEnabled: false, teamsCount: 1, createdAt: '2025-11-12' },
  { id: 'ADM-1006', name: 'Olivia Martinez', email: 'o.martinez@neverlands.art', role: 'responder', status: 'active', lastLogin: '30 min ago', mfaEnabled: true, teamsCount: 3, createdAt: '2025-06-18' },
  { id: 'ADM-1007', name: 'Daniel Park', email: 'd.park@neverlands.art', role: 'analyst', status: 'active', lastLogin: '1 day ago', mfaEnabled: true, teamsCount: 2, createdAt: '2025-08-07' },
  { id: 'ADM-1008', name: 'Aisha Johnson', email: 'a.johnson@neverlands.art', role: 'responder', status: 'active', lastLogin: 'Today, 11:47', mfaEnabled: true, teamsCount: 3, createdAt: '2025-03-26' },
  { id: 'ADM-1009', name: 'Tom Walsh', email: 't.walsh@neverlands.art', role: 'viewer', status: 'active', lastLogin: 'Yesterday', mfaEnabled: true, teamsCount: 1, createdAt: '2025-01-15' },
  { id: 'ADM-1010', name: 'Nina Patel', email: 'n.patel@neverlands.art', role: 'admin', status: 'active', lastLogin: 'Today, 08:30', mfaEnabled: true, teamsCount: 2, createdAt: '2025-05-09' },
  { id: 'ADM-1011', name: 'Ryan Lee', email: 'r.lee@neverlands.art', role: 'analyst', status: 'pending', lastLogin: '5 hours ago', mfaEnabled: false, teamsCount: 2, createdAt: '2026-03-29' },
  { id: 'ADM-1012', name: 'Zoe Brooks', email: 'z.brooks@neverlands.art', role: 'super-admin', status: 'active', lastLogin: 'Today, 07:55', mfaEnabled: true, teamsCount: 4, createdAt: '2024-10-01' },
]

const USER_FILTERS = [
  { id: 'status:active', label: 'Active', section: 'Status' },
  { id: 'status:inactive', label: 'Inactive', section: 'Status' },
  { id: 'status:pending', label: 'Pending', section: 'Status' },
  { id: 'status:suspended', label: 'Suspended', section: 'Status' },
  { id: 'role:super-admin', label: 'Super Admin', section: 'Role' },
  { id: 'role:admin', label: 'Admin', section: 'Role' },
  { id: 'role:analyst', label: 'Analyst', section: 'Role' },
  { id: 'role:responder', label: 'Responder', section: 'Role' },
  { id: 'role:viewer', label: 'Viewer', section: 'Role' },
  { id: 'mfa:on', label: 'MFA Enabled', section: 'Security' },
  { id: 'mfa:off', label: 'MFA Missing', section: 'Security' },
]

export default function UserManagementPage() {
  const { setPageTitle } = usePageTitle()
  const [users, setUsers] = useState<AdminUserRow[]>(INITIAL_USERS)
  const [query, setQuery] = useState('')
  const [selectedFilters, setSelectedFilters] = useState<string[]>([])
  const [highRiskOnly, setHighRiskOnly] = useState(false)
  const [showInviteFlow, setShowInviteFlow] = useState(false)
  const [inviteStep, setInviteStep] = useState(0)
  const [showBulkSuspendModal, setShowBulkSuspendModal] = useState(false)
  const [activeUserAction, setActiveUserAction] = useState<{
    type: 'edit' | 'disable' | 'enable'
    row: AdminUserRow
  } | null>(null)
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(5)

  const [inviteName, setInviteName] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<AdminUserRow['role']>('analyst')
  const [inviteMfa, setInviteMfa] = useState(true)
  const [bulkReason, setBulkReason] = useState('Dormant and non-compliant account sweep')
  const [bulkCreateTicket, setBulkCreateTicket] = useState(true)
  const [bulkNotifyOwners, setBulkNotifyOwners] = useState(true)
  const [editRole, setEditRole] = useState<AdminUserRow['role']>('analyst')
  const [editStatus, setEditStatus] = useState<AdminUserRow['status']>('active')
  const [editMfa, setEditMfa] = useState(true)
  const [editTeamCount, setEditTeamCount] = useState(1)
  const [actionReason, setActionReason] = useState('')

  useEffect(() => {
    setPageTitle('User Management')
  }, [setPageTitle])

  useEffect(() => {
    if (!activeUserAction) return
    const row = activeUserAction.row
    setEditRole(row.role)
    setEditStatus(row.status)
    setEditMfa(row.mfaEnabled)
    setEditTeamCount(row.teamsCount)
    setActionReason('')
  }, [activeUserAction])

  const filteredUsers = useMemo(() => {
    const statusFilters = selectedFilters
      .filter((id) => id.startsWith('status:'))
      .map((id) => id.replace('status:', '')) as AdminUserRow['status'][]
    const roleFilters = selectedFilters
      .filter((id) => id.startsWith('role:'))
      .map((id) => id.replace('role:', '')) as AdminUserRow['role'][]
    const wantsMfaOn = selectedFilters.includes('mfa:on')
    const wantsMfaOff = selectedFilters.includes('mfa:off')
    const q = query.trim().toLowerCase()

    return users
      .filter((u) => statusFilters.length === 0 || statusFilters.includes(u.status))
      .filter((u) => roleFilters.length === 0 || roleFilters.includes(u.role))
      .filter((u) => {
        if (wantsMfaOn && !wantsMfaOff) return u.mfaEnabled
        if (!wantsMfaOn && wantsMfaOff) return !u.mfaEnabled
        return true
      })
      .filter((u) => !highRiskOnly || !u.mfaEnabled || u.status === 'pending' || u.status === 'suspended')
      .filter((u) => !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.id.toLowerCase().includes(q))
  }, [users, selectedFilters, highRiskOnly, query])

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / rowsPerPage))
  const pagedUsers = filteredUsers.slice((page - 1) * rowsPerPage, page * rowsPerPage)

  useEffect(() => {
    if (page > totalPages) setPage(1)
  }, [page, totalPages])

  const activeUsers = users.filter((u) => u.status === 'active').length
  const mfaEnabledUsers = users.filter((u) => u.mfaEnabled).length
  const adminUsers = users.filter((u) => u.role === 'admin' || u.role === 'super-admin').length
  const pendingOrSuspended = users.filter((u) => u.status === 'pending' || u.status === 'suspended').length

  return (
    <OverviewPageShell>
      <OverviewPageHeader
        section="ADMINISTRATION"
        title="User Management"
        description="Manage portal users, roles, permissions, and identity hygiene with a unified control pattern."
        actions={[
          { id: 'bulk-suspend', label: 'Bulk Suspend', variant: 'secondary', onClick: () => setShowBulkSuspendModal(true) },
          { id: 'invite-user', label: 'Invite User', variant: 'primary', onClick: () => setShowInviteFlow(true) },
        ]}
      />

      <OverviewKpiRow
        columns={4}
        items={[
          { label: 'TOTAL USERS', value: users.length, sub: 'Across all departments' },
          { label: 'ACTIVE', value: activeUsers, sub: `${Math.round((activeUsers / users.length) * 100)}% operational`, tone: 'low' },
          { label: 'MFA COVERAGE', value: `${Math.round((mfaEnabledUsers / users.length) * 100)}%`, sub: `${mfaEnabledUsers} accounts protected`, tone: 'accent' },
          { label: 'PRIVILEGED + PENDING', value: `${adminUsers} / ${pendingOrSuspended}`, sub: 'Admins and accounts requiring action', tone: 'high' },
        ]}
      />

      <OverviewTableToolbar
        searchValue={query}
        onSearchChange={(value) => {
          setQuery(value)
          setPage(1)
        }}
        searchPlaceholder="Search user, email, or id..."
        end={(
          <div className="flex w-full items-center justify-end gap-2 whitespace-nowrap">
            <OverviewFilterMenu
              options={USER_FILTERS}
              selected={selectedFilters}
              onApply={(next) => {
                setSelectedFilters(next)
                setPage(1)
              }}
            />
            <OverviewToggle
              label="Risk focus"
              checked={highRiskOnly}
              onChange={(next) => {
                setHighRiskOnly(next)
                setPage(1)
              }}
            />
          </div>
        )}
      />

      <OverviewSection
        title="PLATFORM USERS"
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
        <AdminUserTable
          rows={pagedUsers}
          onAction={(type, row) => {
            setActiveUserAction({ type, row })
          }}
        />
        <OverviewPagination page={page} totalPages={totalPages} totalItems={filteredUsers.length} onPageChange={setPage} />
      </OverviewSection>

      <OverviewModal
        open={showBulkSuspendModal}
        title="Bulk Suspend Accounts"
        subtitle="ADMIN ACTION"
        onClose={() => setShowBulkSuspendModal(false)}
        footer={(
          <div className="flex justify-end gap-2">
            <button type="button" className="soc-btn soc-btn-secondary text-xs" onClick={() => setShowBulkSuspendModal(false)}>
              Cancel
            </button>
            <button
              type="button"
              className="soc-btn soc-btn-primary text-xs"
              onClick={() => {
                setUsers((prev) =>
                  prev.map((u) =>
                    u.status === 'inactive' || (!u.mfaEnabled && u.status !== 'active')
                      ? { ...u, status: 'suspended' }
                      : u
                  )
                )
                if (bulkCreateTicket || bulkNotifyOwners) {
                  // In demo mode we reflect workflow side-effects as recent activity markers.
                  setUsers((prev) => prev.map((u) => (u.status === 'suspended' ? { ...u, lastLogin: 'Bulk action applied' } : u)))
                }
                setShowBulkSuspendModal(false)
              }}
            >
              Suspend Matching Accounts
            </button>
          </div>
        )}
      >
        <div className="space-y-4">
          <div className="rounded-md border border-[color:var(--soc-border)] bg-[color:var(--soc-raised)] p-3 text-xs text-[color:var(--soc-text-secondary)]">
            <p className="font-semibold text-[color:var(--soc-text)]">Targeted accounts</p>
            <p className="mt-1">
              {users.filter((u) => u.status === 'inactive' || (!u.mfaEnabled && u.status !== 'active')).length} users will be suspended by this policy.
            </p>
          </div>
          <label className="text-xs font-medium text-[color:var(--soc-text-muted)]">
            Reason
            <textarea className="soc-input mt-1 w-full text-sm" rows={3} value={bulkReason} onChange={(e) => setBulkReason(e.target.value)} />
          </label>
          <div className="flex flex-wrap gap-2">
            <OverviewToggle label="Create incident ticket" checked={bulkCreateTicket} onChange={setBulkCreateTicket} />
            <OverviewToggle label="Notify account owners" checked={bulkNotifyOwners} onChange={setBulkNotifyOwners} />
          </div>
        </div>
      </OverviewModal>

      <OverviewModal
        open={!!activeUserAction}
        title={
          activeUserAction?.type === 'edit'
            ? `Edit User: ${activeUserAction.row.name}`
            : activeUserAction?.type === 'disable'
              ? `Disable User: ${activeUserAction.row.name}`
              : activeUserAction?.type === 'enable'
                ? `Enable User: ${activeUserAction.row.name}`
              : ''
        }
        subtitle="USER ACTION"
        onClose={() => setActiveUserAction(null)}
        footer={(
          <div className="flex justify-end gap-2">
            <button type="button" className="soc-btn soc-btn-secondary text-xs" onClick={() => setActiveUserAction(null)}>
              Cancel
            </button>
            <button
              type="button"
              className="soc-btn soc-btn-primary text-xs"
              onClick={() => {
                if (!activeUserAction) return
                if (activeUserAction.type === 'edit') {
                  setUsers((prev) =>
                    prev.map((u) =>
                      u.id === activeUserAction.row.id
                        ? {
                            ...u,
                            role: editRole,
                            status: editStatus,
                            mfaEnabled: editMfa,
                            teamsCount: editTeamCount,
                            lastLogin: actionReason ? `Updated: ${actionReason}` : 'Just updated',
                          }
                        : u
                    )
                  )
                }
                if (activeUserAction.type === 'disable') {
                  setUsers((prev) =>
                    prev.map((u) =>
                      u.id === activeUserAction.row.id
                        ? { ...u, status: 'suspended', lastLogin: actionReason ? `Disabled: ${actionReason}` : 'Disabled by admin' }
                        : u
                    )
                  )
                }
                if (activeUserAction.type === 'enable') {
                  setUsers((prev) =>
                    prev.map((u) =>
                      u.id === activeUserAction.row.id
                        ? {
                            ...u,
                            status: 'active',
                            mfaEnabled: editMfa,
                            lastLogin: actionReason ? `Enabled: ${actionReason}` : 'Enabled by admin',
                          }
                        : u
                    )
                  )
                }
                setActiveUserAction(null)
              }}
            >
              Apply
            </button>
          </div>
        )}
      >
        {activeUserAction?.type === 'edit' ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <label className="text-xs font-medium text-[color:var(--soc-text-muted)]">
                Role
                <select className="soc-input mt-1 w-full text-sm" value={editRole} onChange={(e) => setEditRole(e.target.value as AdminUserRow['role'])}>
                  <option value="viewer">Viewer</option>
                  <option value="analyst">Analyst</option>
                  <option value="responder">Responder</option>
                  <option value="admin">Admin</option>
                  <option value="super-admin">Super Admin</option>
                </select>
              </label>
              <label className="text-xs font-medium text-[color:var(--soc-text-muted)]">
                Status
                <select className="soc-input mt-1 w-full text-sm" value={editStatus} onChange={(e) => setEditStatus(e.target.value as AdminUserRow['status'])}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                  <option value="suspended">Suspended</option>
                </select>
              </label>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <label className="text-xs font-medium text-[color:var(--soc-text-muted)]">
                Teams
                <input type="number" min={0} className="soc-input mt-1 w-full text-sm" value={editTeamCount} onChange={(e) => setEditTeamCount(Number(e.target.value) || 0)} />
              </label>
              <div className="flex items-end">
                <OverviewToggle label="MFA enabled" checked={editMfa} onChange={setEditMfa} />
              </div>
            </div>
            <label className="text-xs font-medium text-[color:var(--soc-text-muted)]">
              Change note
              <textarea className="soc-input mt-1 w-full text-sm" rows={2} value={actionReason} onChange={(e) => setActionReason(e.target.value)} />
            </label>
          </div>
        ) : activeUserAction?.type === 'disable' ? (
          <div className="space-y-4">
            <div className="rounded-md border border-[color:var(--soc-border)] bg-[color:var(--soc-raised)] p-3 text-xs text-[color:var(--soc-text-secondary)]">
              <p className="font-semibold text-[color:var(--soc-text)]">Account impact</p>
              <p className="mt-1">Active sessions are revoked immediately and API tokens are invalidated on next auth check.</p>
            </div>
            <label className="text-xs font-medium text-[color:var(--soc-text-muted)]">
              Disable reason
              <textarea className="soc-input mt-1 w-full text-sm" rows={3} value={actionReason} onChange={(e) => setActionReason(e.target.value)} />
            </label>
          </div>
        ) : activeUserAction?.type === 'enable' ? (
          <div className="space-y-4">
            <div className="rounded-md border border-[color:var(--soc-border)] bg-[color:var(--soc-raised)] p-3 text-xs text-[color:var(--soc-text-secondary)]">
              <p className="font-semibold text-[color:var(--soc-text)]">Enable impact</p>
              <p className="mt-1">Restores interactive login and API access according to assigned role and MFA policy.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <OverviewToggle label="Require MFA at next login" checked={editMfa} onChange={setEditMfa} />
            </div>
            <label className="text-xs font-medium text-[color:var(--soc-text-muted)]">
              Enable reason
              <textarea className="soc-input mt-1 w-full text-sm" rows={3} value={actionReason} onChange={(e) => setActionReason(e.target.value)} />
            </label>
          </div>
        ) : null}
      </OverviewModal>

      <OverviewStepModal
        open={showInviteFlow}
        subtitle="NEW USER"
        currentStep={inviteStep}
        onStepChange={setInviteStep}
        onClose={() => {
          setShowInviteFlow(false)
          setInviteStep(0)
        }}
        onFinish={() => {
          setUsers((prev) => [
            {
              id: `ADM-${1000 + prev.length + 1}`,
              name: inviteName.trim(),
              email: inviteEmail.trim().toLowerCase(),
              role: inviteRole,
              status: 'pending',
              lastLogin: 'Never',
              mfaEnabled: inviteMfa,
              teamsCount: 1,
              createdAt: new Date().toISOString().slice(0, 10),
            },
            ...prev,
          ])
          setInviteName('')
          setInviteEmail('')
          setInviteRole('analyst')
          setInviteMfa(true)
          setShowInviteFlow(false)
          setInviteStep(0)
          setPage(1)
        }}
        steps={[
          {
            id: 'identity',
            title: 'Step 1: Identity',
            canProceed: () => inviteName.trim().length > 1 && inviteEmail.includes('@'),
            validationHint: 'Name and a valid email are required.',
            content: (
              <div className="grid gap-3">
                <label className="text-xs font-medium text-[color:var(--soc-text-muted)]">
                  Full name
                  <input className="soc-input mt-1 w-full text-sm" value={inviteName} onChange={(e) => setInviteName(e.target.value)} />
                </label>
                <label className="text-xs font-medium text-[color:var(--soc-text-muted)]">
                  Email
                  <input className="soc-input mt-1 w-full text-sm" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
                </label>
              </div>
            ),
          },
          {
            id: 'access',
            title: 'Step 2: Access',
            content: (
              <div className="grid gap-3">
                <label className="text-xs font-medium text-[color:var(--soc-text-muted)]">
                  Role
                  <select
                    className="soc-input mt-1 w-full text-sm"
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as AdminUserRow['role'])}
                  >
                    <option value="viewer">Viewer</option>
                    <option value="analyst">Analyst</option>
                    <option value="responder">Responder</option>
                    <option value="admin">Admin</option>
                    <option value="super-admin">Super Admin</option>
                  </select>
                </label>
                <OverviewToggle label="Require MFA on first login" checked={inviteMfa} onChange={setInviteMfa} />
              </div>
            ),
          },
          {
            id: 'review',
            title: 'Step 3: Review & Invite',
            content: (
              <div className="space-y-2 text-sm text-[color:var(--soc-text-secondary)]">
                <p><span className="font-semibold text-[color:var(--soc-text)]">Name:</span> {inviteName || '—'}</p>
                <p><span className="font-semibold text-[color:var(--soc-text)]">Email:</span> {inviteEmail || '—'}</p>
                <p><span className="font-semibold text-[color:var(--soc-text)]">Role:</span> {inviteRole}</p>
                <p><span className="font-semibold text-[color:var(--soc-text)]">MFA:</span> {inviteMfa ? 'Required' : 'Optional'}</p>
              </div>
            ),
          },
        ]}
      />
    </OverviewPageShell>
  )
}

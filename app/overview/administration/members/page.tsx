'use client'

import { useCallback, useEffect, useState } from 'react'

import { usePageTitle } from '@/app/page-title-context'
import {
  OverviewPageHeader,
  OverviewPageShell,
  OverviewSection,
} from '@/components/overview/unified-ui'
import type { InviteDto, MemberDto } from '@domain/entities/member'
import { ROLES, type Role } from '@domain/enums'
import { roleHasPermission } from '@domain/permissions'
import { api } from '@lib/api-client'
import { EmptyState } from '@ui/empty-state'
import { TableSkeleton } from '@ui/skeleton'
import { StatusBadge } from '@ui/status-badge'

function inviteState(invite: InviteDto): { label: string; tone: string } {
  if (invite.acceptedAt) return { label: 'ACCEPTED', tone: 'var(--soc-low)' }
  if (invite.revokedAt) return { label: 'REVOKED', tone: 'var(--soc-text-muted)' }
  if (new Date(invite.expiresAt).getTime() < Date.now())
    return { label: 'EXPIRED', tone: 'var(--soc-text-muted)' }
  return { label: 'PENDING', tone: 'var(--soc-medium)' }
}

export default function MembersPage() {
  const { setPageTitle } = usePageTitle()
  const [members, setMembers] = useState<MemberDto[]>([])
  const [invites, setInvites] = useState<InviteDto[]>([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [ownMembershipId, setOwnMembershipId] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [busy, setBusy] = useState(false)

  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<Role>('viewer')
  const [acceptUrl, setAcceptUrl] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setPageTitle('Members')
  }, [setPageTitle])

  const reload = useCallback(async (admin: boolean) => {
    const [memberPage, invitePage] = await Promise.all([
      api.members.list(),
      admin ? api.members.invites() : Promise.resolve({ items: [] as InviteDto[] }),
    ])
    setMembers(memberPage.items)
    setInvites(invitePage.items)
  }, [])

  useEffect(() => {
    let cancelled = false
    api
      .currentOrg()
      .then(async (org) => {
        if (cancelled) return
        const admin = roleHasPermission(org.role, 'admin:members')
        setIsAdmin(admin)
        setOwnMembershipId(org.membershipId)
        await reload(admin)
        if (!cancelled) setLoading(false)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Failed to load members')
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [reload])

  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true)
    setActionError('')
    try {
      await fn()
      await reload(isAdmin)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Action failed')
    } finally {
      setBusy(false)
    }
  }

  const sendInvite = () =>
    run(async () => {
      const result = await api.members.invite({ email: inviteEmail.trim(), role: inviteRole })
      setAcceptUrl(result.acceptUrl)
      setCopied(false)
      setInviteEmail('')
    })

  return (
    <OverviewPageShell>
      <OverviewPageHeader
        section="ADMINISTRATION"
        title="Members"
        description="People with access to this organization, their roles, and pending invites."
      />

      {actionError && (
        <p className="text-xs font-medium" style={{ color: 'var(--soc-critical)' }}>{actionError}</p>
      )}

      {isAdmin && (
        <OverviewSection title="INVITE A MEMBER">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <input
                className="soc-input h-9 min-h-9 box-border flex-1 text-sm"
                style={{ minWidth: '220px' }}
                type="email"
                placeholder="name@company.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
              <select
                className="soc-input h-9 min-h-9 box-border text-sm"
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as Role)}
                aria-label="Invite role"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                ))}
              </select>
              <button
                type="button"
                className="soc-btn soc-btn-primary text-xs"
                disabled={busy || !inviteEmail.includes('@')}
                onClick={() => void sendInvite()}
              >
                Create invite link
              </button>
            </div>
            {acceptUrl && (
              <div className="flex items-center gap-2 rounded-md px-3 py-2" style={{ backgroundColor: 'var(--soc-overlay)', border: '1px solid var(--soc-border)' }}>
                <code className="min-w-0 flex-1 truncate text-xs" style={{ color: 'var(--soc-text-secondary)' }}>{acceptUrl}</code>
                <button
                  type="button"
                  className="soc-btn soc-btn-secondary text-xs"
                  onClick={() => {
                    void navigator.clipboard.writeText(acceptUrl)
                    setCopied(true)
                  }}
                >
                  {copied ? 'Copied' : 'Copy link'}
                </button>
              </div>
            )}
            <p className="text-xs" style={{ color: 'var(--soc-text-muted)' }}>
              No email is sent — share the link with the invitee. Links expire after 7 days and can be used once.
            </p>
          </div>
        </OverviewSection>
      )}

      <OverviewSection title="MEMBERS" flush right={(
        <span className="text-xs tabular-nums" style={{ color: 'var(--soc-text-muted)' }}>
          {loading ? 'Loading…' : `${members.length} total`}
        </span>
      )}>
        {loading ? (
          <TableSkeleton rows={4} />
        ) : error ? (
          <EmptyState title="Could not load members" description={error} />
        ) : (
          <table className="soc-table" style={{ tableLayout: 'fixed', width: '100%' }}>
            <thead>
              <tr>
                <th style={{ width: '34%' }}>Member</th>
                <th style={{ width: '18%' }}>Role</th>
                <th style={{ width: '14%' }}>Status</th>
                <th style={{ width: '16%' }}>Joined</th>
                {isAdmin && <th className="text-right" style={{ width: '18%' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {members.map((member) => {
                const isSelf = member.membershipId === ownMembershipId
                return (
                  <tr key={member.membershipId}>
                    <td>
                      <p className="truncate text-sm font-semibold" style={{ color: 'var(--soc-text)' }}>
                        {member.name ?? member.email}
                        {isSelf && <span className="ml-1.5 text-xs font-normal" style={{ color: 'var(--soc-text-muted)' }}>(you)</span>}
                      </p>
                      <p className="truncate text-xs" style={{ color: 'var(--soc-text-muted)' }}>{member.email}</p>
                    </td>
                    <td>
                      {isAdmin ? (
                        <select
                          className="soc-input h-8 min-h-8 box-border text-xs"
                          value={member.role}
                          disabled={busy}
                          onChange={(e) =>
                            void run(() => api.members.patch(member.membershipId, { role: e.target.value as Role }))
                          }
                          aria-label={`Role for ${member.email}`}
                        >
                          {ROLES.map((r) => (
                            <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-xs font-medium uppercase" style={{ color: 'var(--soc-text-secondary)' }}>{member.role}</span>
                      )}
                    </td>
                    <td><StatusBadge status={member.status} /></td>
                    <td>
                      <span className="text-xs tabular-nums" style={{ color: 'var(--soc-text-secondary)' }}>
                        {new Date(member.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="text-right">
                        {member.status === 'suspended' ? (
                          <button
                            type="button"
                            className="soc-btn soc-btn-secondary text-xs"
                            disabled={busy}
                            onClick={() => void run(() => api.members.patch(member.membershipId, { status: 'active' }))}
                          >
                            Reactivate
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="soc-btn soc-btn-secondary text-xs"
                            disabled={busy || isSelf}
                            title={isSelf ? 'You cannot suspend yourself' : undefined}
                            onClick={() => void run(() => api.members.patch(member.membershipId, { status: 'suspended' }))}
                          >
                            Suspend
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </OverviewSection>

      {isAdmin && (
        <OverviewSection title="INVITES" flush right={(
          <span className="text-xs tabular-nums" style={{ color: 'var(--soc-text-muted)' }}>
            {invites.length} total
          </span>
        )}>
          {invites.length === 0 ? (
            <EmptyState title="No invites yet" description="Create an invite link above to add teammates." />
          ) : (
            <table className="soc-table" style={{ tableLayout: 'fixed', width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ width: '34%' }}>Email</th>
                  <th style={{ width: '14%' }}>Role</th>
                  <th style={{ width: '14%' }}>State</th>
                  <th style={{ width: '20%' }}>Expires</th>
                  <th className="text-right" style={{ width: '18%' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invites.map((invite) => {
                  const state = inviteState(invite)
                  return (
                    <tr key={invite.id}>
                      <td>
                        <p className="truncate text-sm" style={{ color: 'var(--soc-text)' }}>{invite.email}</p>
                      </td>
                      <td>
                        <span className="text-xs font-medium uppercase" style={{ color: 'var(--soc-text-secondary)' }}>{invite.role}</span>
                      </td>
                      <td>
                        <span className="soc-badge" style={{ backgroundColor: 'var(--soc-overlay)', color: state.tone }}>{state.label}</span>
                      </td>
                      <td>
                        <span className="text-xs tabular-nums" style={{ color: 'var(--soc-text-secondary)' }}>
                          {new Date(invite.expiresAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                      <td className="text-right">
                        {state.label === 'PENDING' && (
                          <button
                            type="button"
                            className="soc-btn soc-btn-secondary text-xs"
                            disabled={busy}
                            onClick={() => void run(() => api.members.revokeInvite(invite.id))}
                          >
                            Revoke
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </OverviewSection>
      )}
    </OverviewPageShell>
  )
}

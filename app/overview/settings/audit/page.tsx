'use client'

import { useCallback, useEffect, useState } from 'react'

import { usePageTitle } from '@/app/page-title-context'
import {
  OverviewPageHeader,
  OverviewPageShell,
  OverviewSection,
  OverviewTableToolbar,
} from '@/components/overview/unified-ui'
import type { AuditListItemDto } from '@domain/entities/audit'
import type { MemberDto } from '@domain/entities/member'
import { roleHasPermission } from '@domain/permissions'
import { api, ApiError } from '@lib/api-client'
import { EmptyState } from '@ui/empty-state'
import { TableSkeleton } from '@ui/skeleton'

const PAGE_SIZE = 50

const TARGET_TYPES = [
  'alert',
  'investigation',
  'incident',
  'membership',
  'organization_invite',
  'organization',
  'user',
] as const

export default function AuditPage() {
  const { setPageTitle } = usePageTitle()
  const [allowed, setAllowed] = useState<boolean | null>(null)
  const [items, setItems] = useState<AuditListItemDto[]>([])
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')

  const [members, setMembers] = useState<MemberDto[]>([])
  const [action, setAction] = useState('')
  const [targetType, setTargetType] = useState('')
  const [actor, setActor] = useState('')

  useEffect(() => {
    setPageTitle('Audit Log')
  }, [setPageTitle])

  useEffect(() => {
    let cancelled = false
    Promise.all([api.currentOrg(), api.members.list()])
      .then(([org, memberPage]) => {
        if (cancelled) return
        setAllowed(roleHasPermission(org.role, 'admin:audit'))
        setMembers(memberPage.items)
      })
      .catch(() => {
        if (!cancelled) setAllowed(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const load = useCallback(
    async (cursor?: string) =>
      api.audit.list({
        limit: PAGE_SIZE,
        action: action.trim() || undefined,
        targetType: targetType || undefined,
        actorMembershipId: actor || undefined,
        cursor,
      }),
    [action, targetType, actor],
  )

  useEffect(() => {
    if (allowed !== true) {
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    setError('')
    const timeout = setTimeout(() => {
      load()
        .then((page) => {
          if (cancelled) return
          setItems(page.items)
          setNextCursor(page.nextCursor)
          setLoading(false)
        })
        .catch((err) => {
          if (cancelled) return
          setError(err instanceof ApiError ? err.message : 'Failed to load audit log')
          setLoading(false)
        })
    }, action ? 250 : 0)
    return () => {
      cancelled = true
      clearTimeout(timeout)
    }
  }, [allowed, load, action])

  const loadMore = async () => {
    if (!nextCursor) return
    setLoadingMore(true)
    try {
      const page = await load(nextCursor)
      setItems((prev) => [...prev, ...page.items])
      setNextCursor(page.nextCursor)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more entries')
    } finally {
      setLoadingMore(false)
    }
  }

  if (allowed === false) {
    return (
      <OverviewPageShell>
        <OverviewPageHeader section="SETTINGS" title="Audit Log" description="Immutable record of all actions in this organization." />
        <OverviewSection title="AUDIT LOG" flush>
          <EmptyState
            title="Admin access required"
            description="The audit log is visible to organization admins only."
          />
        </OverviewSection>
      </OverviewPageShell>
    )
  }

  return (
    <OverviewPageShell>
      <OverviewPageHeader
        section="SETTINGS"
        title="Audit Log"
        description="Immutable record of all actions in this organization, newest first."
      />

      <OverviewTableToolbar
        searchValue={action}
        onSearchChange={setAction}
        searchPlaceholder="Filter by exact action (e.g. alert.triage)…"
        end={(
          <div className="flex items-center gap-2">
            <select
              className="soc-input h-9 min-h-9 box-border text-sm"
              value={targetType}
              onChange={(e) => setTargetType(e.target.value)}
              aria-label="Filter by target type"
            >
              <option value="">All targets</option>
              {TARGET_TYPES.map((t) => (
                <option key={t} value={t}>{t.replace('_', ' ')}</option>
              ))}
            </select>
            <select
              className="soc-input h-9 min-h-9 box-border text-sm"
              value={actor}
              onChange={(e) => setActor(e.target.value)}
              aria-label="Filter by actor"
            >
              <option value="">All actors</option>
              {members.map((m) => (
                <option key={m.membershipId} value={m.membershipId}>{m.name ?? m.email}</option>
              ))}
            </select>
          </div>
        )}
      />

      <OverviewSection title="AUDIT LOG" flush right={(
        <span className="text-xs tabular-nums" style={{ color: 'var(--soc-text-muted)' }}>
          {loading ? 'Loading…' : `${items.length}${nextCursor ? '+' : ''} shown`}
        </span>
      )}>
        {loading || allowed === null ? (
          <TableSkeleton rows={10} />
        ) : error ? (
          <EmptyState title="Could not load audit log" description={error} />
        ) : items.length === 0 ? (
          <EmptyState
            title="No audit entries match"
            description={action || targetType || actor ? 'Try adjusting the filters.' : 'Actions appear here as they happen.'}
          />
        ) : (
          <>
            <table className="soc-table" style={{ tableLayout: 'fixed', width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ width: '18%' }}>When</th>
                  <th style={{ width: '20%' }}>Actor</th>
                  <th style={{ width: '20%' }}>Action</th>
                  <th style={{ width: '14%' }}>Target</th>
                  <th style={{ width: '28%' }}>Details</th>
                </tr>
              </thead>
              <tbody>
                {items.map((entry) => (
                  <tr key={entry.id}>
                    <td>
                      <span className="text-xs tabular-nums" style={{ color: 'var(--soc-text-secondary)' }}>
                        {new Date(entry.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </td>
                    <td>
                      <span className="truncate text-xs" style={{ color: 'var(--soc-text-secondary)' }}>
                        {entry.actorName ?? 'System'}
                      </span>
                    </td>
                    <td>
                      <span className="text-xs font-mono font-medium" style={{ color: 'var(--soc-text)' }}>{entry.action}</span>
                    </td>
                    <td>
                      <span className="text-xs" style={{ color: 'var(--soc-text-secondary)' }}>{entry.targetType.replace('_', ' ')}</span>
                    </td>
                    <td>
                      <span className="block truncate text-xs font-mono" style={{ color: 'var(--soc-text-muted)' }} title={JSON.stringify(entry.metadata)}>
                        {Object.keys(entry.metadata).length > 0 ? JSON.stringify(entry.metadata) : '—'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {nextCursor && (
              <div className="border-t px-4 py-3 text-center" style={{ borderColor: 'var(--soc-border)' }}>
                <button type="button" className="soc-btn soc-btn-secondary text-xs" onClick={loadMore} disabled={loadingMore}>
                  {loadingMore ? 'Loading…' : 'Load older entries'}
                </button>
              </div>
            )}
          </>
        )}
      </OverviewSection>
    </OverviewPageShell>
  )
}

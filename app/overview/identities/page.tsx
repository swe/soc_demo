'use client'

import { useCallback, useEffect, useState } from 'react'

import { usePageTitle } from '@/app/page-title-context'
import {
  OverviewModal,
  OverviewPageHeader,
  OverviewPageShell,
  OverviewSection,
  OverviewTableToolbar,
} from '@/components/overview/unified-ui'
import type { IdentityDetailDto, IdentityDto } from '@domain/entities/identity'
import { IDENTITY_TYPES, PRIVILEGE_TIERS, type IdentityType, type PrivilegeTier } from '@domain/enums'
import { api } from '@lib/api-client'
import { EmptyState } from '@ui/empty-state'
import { SeverityBadge } from '@ui/severity-badge'
import { Skeleton, TableSkeleton } from '@ui/skeleton'
import { StatusBadge } from '@ui/status-badge'

const PAGE_SIZE = 25

const TYPE_LABEL: Record<IdentityType, string> = {
  human: 'Human',
  service: 'Service',
  machine: 'Machine',
}

const TIER_LABEL: Record<PrivilegeTier, string> = {
  standard: 'Standard',
  elevated: 'Elevated',
  privileged: 'Privileged',
}

function riskTone(score: number): string {
  if (score >= 75) return 'var(--soc-critical)'
  if (score >= 50) return 'var(--soc-high)'
  if (score >= 25) return 'var(--soc-medium)'
  return 'var(--soc-low)'
}

export default function IdentitiesPage() {
  const { setPageTitle } = usePageTitle()
  const [items, setItems] = useState<IdentityDto[]>([])
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')

  const [search, setSearch] = useState('')
  const [type, setType] = useState<IdentityType | ''>('')
  const [tier, setTier] = useState<PrivilegeTier | ''>('')

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detail, setDetail] = useState<IdentityDetailDto | null>(null)
  const [detailError, setDetailError] = useState('')

  useEffect(() => {
    setPageTitle('Identities')
  }, [setPageTitle])

  const load = useCallback(
    async (cursor?: string) =>
      api.identities.list({
        limit: PAGE_SIZE,
        q: search || undefined,
        type: type || undefined,
        privilegeTier: tier || undefined,
        cursor,
      }),
    [search, type, tier],
  )

  useEffect(() => {
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
          setError(err.message ?? 'Failed to load identities')
          setLoading(false)
        })
    }, search ? 250 : 0)
    return () => {
      cancelled = true
      clearTimeout(timeout)
    }
  }, [load, search])

  const loadMore = async () => {
    if (!nextCursor) return
    setLoadingMore(true)
    try {
      const page = await load(nextCursor)
      setItems((prev) => [...prev, ...page.items])
      setNextCursor(page.nextCursor)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more identities')
    } finally {
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    if (!selectedId) {
      setDetail(null)
      setDetailError('')
      return
    }
    let cancelled = false
    api.identities
      .get(selectedId)
      .then((identity) => {
        if (!cancelled) setDetail(identity)
      })
      .catch((err) => {
        if (!cancelled) setDetailError(err.message ?? 'Failed to load identity')
      })
    return () => {
      cancelled = true
    }
  }, [selectedId])

  return (
    <OverviewPageShell>
      <OverviewPageHeader
        section="IDENTITY SECURITY"
        title="Identities"
        description="Human, service, and machine identities, highest risk first."
      />

      <OverviewTableToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search identities by name or principal…"
        end={(
          <div className="flex items-center gap-2">
            <select
              className="soc-input h-9 min-h-9 box-border text-sm"
              value={type}
              onChange={(e) => setType(e.target.value as IdentityType | '')}
              aria-label="Filter by type"
            >
              <option value="">All types</option>
              {IDENTITY_TYPES.map((t) => (
                <option key={t} value={t}>{TYPE_LABEL[t]}</option>
              ))}
            </select>
            <select
              className="soc-input h-9 min-h-9 box-border text-sm"
              value={tier}
              onChange={(e) => setTier(e.target.value as PrivilegeTier | '')}
              aria-label="Filter by privilege tier"
            >
              <option value="">All tiers</option>
              {PRIVILEGE_TIERS.map((t) => (
                <option key={t} value={t}>{TIER_LABEL[t]}</option>
              ))}
            </select>
          </div>
        )}
      />

      <OverviewSection title="IDENTITIES" flush right={(
        <span className="text-xs tabular-nums" style={{ color: 'var(--soc-text-muted)' }}>
          {loading ? 'Loading…' : `${items.length}${nextCursor ? '+' : ''} shown`}
        </span>
      )}>
        {loading ? (
          <TableSkeleton rows={10} />
        ) : error ? (
          <EmptyState title="Could not load identities" description={error} />
        ) : items.length === 0 ? (
          <EmptyState
            title="No identities match"
            description={search || type || tier
              ? 'Try adjusting the search or filters.'
              : 'Identities appear once directory sources are connected or demo data is loaded.'}
          />
        ) : (
          <>
            <table className="soc-table" style={{ tableLayout: 'fixed', width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ width: '30%' }}>Identity</th>
                  <th style={{ width: '10%' }}>Type</th>
                  <th style={{ width: '12%' }}>Privilege</th>
                  <th style={{ width: '8%' }}>MFA</th>
                  <th style={{ width: '10%' }}>Risk</th>
                  <th style={{ width: '14%' }}>Status</th>
                  <th style={{ width: '16%' }}>Last seen</th>
                </tr>
              </thead>
              <tbody>
                {items.map((identity) => (
                  <tr key={identity.id} className="cursor-pointer" onClick={() => setSelectedId(identity.id)}>
                    <td>
                      <p className="truncate text-sm font-semibold" style={{ color: 'var(--soc-text)' }}>{identity.displayName}</p>
                      <p className="truncate text-xs" style={{ color: 'var(--soc-text-muted)' }}>{identity.principal}</p>
                    </td>
                    <td>
                      <span className="text-xs" style={{ color: 'var(--soc-text-secondary)' }}>{TYPE_LABEL[identity.type]}</span>
                    </td>
                    <td>
                      <span
                        className="soc-badge"
                        style={identity.privilegeTier === 'privileged'
                          ? { backgroundColor: 'var(--soc-high-bg)', color: 'var(--soc-high)' }
                          : { backgroundColor: 'var(--soc-overlay)', color: 'var(--soc-text-secondary)' }}
                      >
                        {TIER_LABEL[identity.privilegeTier].toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <span className="text-xs font-semibold" style={{ color: identity.mfaEnabled ? 'var(--soc-low)' : 'var(--soc-critical)' }}>
                        {identity.mfaEnabled ? 'ON' : 'OFF'}
                      </span>
                    </td>
                    <td>
                      <span className="text-sm font-bold tabular-nums" style={{ color: riskTone(identity.riskScore) }}>
                        {identity.riskScore}
                      </span>
                    </td>
                    <td><StatusBadge status={identity.status} /></td>
                    <td>
                      <span className="text-xs tabular-nums" style={{ color: 'var(--soc-text-secondary)' }}>
                        {new Date(identity.lastSeen).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {nextCursor && (
              <div className="border-t px-4 py-3 text-center" style={{ borderColor: 'var(--soc-border)' }}>
                <button type="button" className="soc-btn soc-btn-secondary text-xs" onClick={loadMore} disabled={loadingMore}>
                  {loadingMore ? 'Loading…' : 'Load more identities'}
                </button>
              </div>
            )}
          </>
        )}
      </OverviewSection>

      {/* ── Identity detail modal ── */}
      <OverviewModal
        open={Boolean(selectedId)}
        title={detail?.displayName ?? 'Identity'}
        subtitle={detail?.principal}
        onClose={() => setSelectedId(null)}
        maxWidth="max-w-xl"
      >
        {detailError ? (
          <EmptyState title="Could not load identity" description={detailError} />
        ) : !detail ? (
          <div className="space-y-3">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : (
          <div className="space-y-5">
            <div className="grid grid-cols-3 gap-px overflow-hidden rounded-lg" style={{ border: '1px solid var(--soc-border)', backgroundColor: 'var(--soc-border)' }}>
              {[
                { label: 'Privilege tier', value: TIER_LABEL[detail.privilegeTier] },
                { label: 'MFA', value: detail.mfaEnabled ? 'Enabled' : 'Disabled' },
                { label: 'Risk score', value: String(detail.riskScore) },
              ].map(({ label, value }) => (
                <div key={label} className="flex flex-col gap-1 px-4 py-3" style={{ backgroundColor: 'var(--soc-surface)' }}>
                  <span className="soc-label">{label}</span>
                  <span className="text-xs font-semibold break-words" style={{ color: 'var(--soc-text)' }}>{value}</span>
                </div>
              ))}
            </div>

            <div>
              <p className="soc-label mb-2">Owned assets ({detail.ownedAssets.length})</p>
              {detail.ownedAssets.length === 0 ? (
                <p className="text-xs" style={{ color: 'var(--soc-text-muted)' }}>No assets owned by this identity.</p>
              ) : (
                <ul className="space-y-1.5">
                  {detail.ownedAssets.map((a) => (
                    <li key={a.id} className="flex items-center justify-between gap-3 text-xs">
                      <span className="min-w-0 truncate" style={{ color: 'var(--soc-text-secondary)' }}>{a.name}</span>
                      <span className="shrink-0 tabular-nums font-semibold" style={{ color: riskTone(a.riskScore) }}>
                        risk {a.riskScore}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <p className="soc-label mb-2">Related alerts ({detail.relatedAlerts.length})</p>
              {detail.relatedAlerts.length === 0 ? (
                <p className="text-xs" style={{ color: 'var(--soc-text-muted)' }}>No alerts reference this identity.</p>
              ) : (
                <ul className="space-y-1.5">
                  {detail.relatedAlerts.map((a) => (
                    <li key={a.id} className="flex items-center justify-between gap-3 text-xs">
                      <span className="min-w-0 truncate" style={{ color: 'var(--soc-text-secondary)' }}>{a.title}</span>
                      <span className="flex shrink-0 items-center gap-1.5">
                        <SeverityBadge severity={a.severity} />
                        <StatusBadge status={a.status} />
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </OverviewModal>
    </OverviewPageShell>
  )
}

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
import type { AssetDetailDto, AssetDto } from '@domain/entities/asset'
import { ASSET_TYPES, CRITICALITIES, type AssetType, type Criticality } from '@domain/enums'
import { api } from '@lib/api-client'
import { EmptyState } from '@ui/empty-state'
import { SeverityBadge } from '@ui/severity-badge'
import { Skeleton, TableSkeleton } from '@ui/skeleton'
import { StatusBadge } from '@ui/status-badge'

const PAGE_SIZE = 25

const TYPE_LABEL: Record<AssetType, string> = {
  device: 'Device',
  cloud_resource: 'Cloud resource',
  application: 'Application',
}

function riskTone(score: number): string {
  if (score >= 75) return 'var(--soc-critical)'
  if (score >= 50) return 'var(--soc-high)'
  if (score >= 25) return 'var(--soc-medium)'
  return 'var(--soc-low)'
}

export default function AssetsPage() {
  const { setPageTitle } = usePageTitle()
  const [items, setItems] = useState<AssetDto[]>([])
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')

  const [search, setSearch] = useState('')
  const [type, setType] = useState<AssetType | ''>('')
  const [criticality, setCriticality] = useState<Criticality | ''>('')

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detail, setDetail] = useState<AssetDetailDto | null>(null)
  const [detailError, setDetailError] = useState('')

  useEffect(() => {
    setPageTitle('Assets')
  }, [setPageTitle])

  const load = useCallback(
    async (cursor?: string) =>
      api.assets.list({
        limit: PAGE_SIZE,
        q: search || undefined,
        type: type || undefined,
        criticality: criticality || undefined,
        cursor,
      }),
    [search, type, criticality],
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
          setError(err.message ?? 'Failed to load assets')
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
      setError(err instanceof Error ? err.message : 'Failed to load more assets')
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
    api.assets
      .get(selectedId)
      .then((asset) => {
        if (!cancelled) setDetail(asset)
      })
      .catch((err) => {
        if (!cancelled) setDetailError(err.message ?? 'Failed to load asset')
      })
    return () => {
      cancelled = true
    }
  }, [selectedId])

  return (
    <OverviewPageShell>
      <OverviewPageHeader
        section="ASSET MANAGEMENT"
        title="Assets"
        description="Monitored devices, cloud resources, and applications, highest risk first."
      />

      <OverviewTableToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search assets by name…"
        end={(
          <div className="flex items-center gap-2">
            <select
              className="soc-input h-9 min-h-9 box-border text-sm"
              value={type}
              onChange={(e) => setType(e.target.value as AssetType | '')}
              aria-label="Filter by type"
            >
              <option value="">All types</option>
              {ASSET_TYPES.map((t) => (
                <option key={t} value={t}>{TYPE_LABEL[t]}</option>
              ))}
            </select>
            <select
              className="soc-input h-9 min-h-9 box-border text-sm"
              value={criticality}
              onChange={(e) => setCriticality(e.target.value as Criticality | '')}
              aria-label="Filter by criticality"
            >
              <option value="">All tiers</option>
              {CRITICALITIES.map((c) => (
                <option key={c} value={c}>{c.toUpperCase()}</option>
              ))}
            </select>
          </div>
        )}
      />

      <OverviewSection title="ASSETS" flush right={(
        <span className="text-xs tabular-nums" style={{ color: 'var(--soc-text-muted)' }}>
          {loading ? 'Loading…' : `${items.length}${nextCursor ? '+' : ''} shown`}
        </span>
      )}>
        {loading ? (
          <TableSkeleton rows={10} />
        ) : error ? (
          <EmptyState title="Could not load assets" description={error} />
        ) : items.length === 0 ? (
          <EmptyState
            title="No assets match"
            description={search || type || criticality
              ? 'Try adjusting the search or filters.'
              : 'Assets appear once inventory sources are connected or demo data is loaded.'}
          />
        ) : (
          <>
            <table className="soc-table" style={{ tableLayout: 'fixed', width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ width: '30%' }}>Asset</th>
                  <th style={{ width: '14%' }}>Type</th>
                  <th style={{ width: '10%' }}>Criticality</th>
                  <th style={{ width: '10%' }}>Risk</th>
                  <th style={{ width: '12%' }}>Status</th>
                  <th style={{ width: '18%' }}>Owner</th>
                  <th style={{ width: '16%' }}>Last seen</th>
                </tr>
              </thead>
              <tbody>
                {items.map((asset) => (
                  <tr key={asset.id} className="cursor-pointer" onClick={() => setSelectedId(asset.id)}>
                    <td>
                      <p className="truncate text-sm font-semibold" style={{ color: 'var(--soc-text)' }}>{asset.name}</p>
                    </td>
                    <td>
                      <span className="text-xs" style={{ color: 'var(--soc-text-secondary)' }}>{TYPE_LABEL[asset.type]}</span>
                    </td>
                    <td>
                      <span className="soc-badge" style={{ backgroundColor: 'var(--soc-overlay)', color: 'var(--soc-text-secondary)' }}>
                        {asset.criticality.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <span className="text-sm font-bold tabular-nums" style={{ color: riskTone(asset.riskScore) }}>
                        {asset.riskScore}
                      </span>
                    </td>
                    <td><StatusBadge status={asset.status} /></td>
                    <td>
                      <span className="truncate text-xs" style={{ color: 'var(--soc-text-secondary)' }}>{asset.ownerName ?? '—'}</span>
                    </td>
                    <td>
                      <span className="text-xs tabular-nums" style={{ color: 'var(--soc-text-secondary)' }}>
                        {new Date(asset.lastSeen).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {nextCursor && (
              <div className="border-t px-4 py-3 text-center" style={{ borderColor: 'var(--soc-border)' }}>
                <button type="button" className="soc-btn soc-btn-secondary text-xs" onClick={loadMore} disabled={loadingMore}>
                  {loadingMore ? 'Loading…' : 'Load more assets'}
                </button>
              </div>
            )}
          </>
        )}
      </OverviewSection>

      {/* ── Asset detail modal ── */}
      <OverviewModal
        open={Boolean(selectedId)}
        title={detail?.name ?? 'Asset'}
        subtitle={detail ? TYPE_LABEL[detail.type] : undefined}
        onClose={() => setSelectedId(null)}
        maxWidth="max-w-xl"
      >
        {detailError ? (
          <EmptyState title="Could not load asset" description={detailError} />
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
                { label: 'Criticality', value: detail.criticality.toUpperCase() },
                { label: 'Risk score', value: String(detail.riskScore) },
                { label: 'Owner', value: detail.ownerName ?? '—' },
              ].map(({ label, value }) => (
                <div key={label} className="flex flex-col gap-1 px-4 py-3" style={{ backgroundColor: 'var(--soc-surface)' }}>
                  <span className="soc-label">{label}</span>
                  <span className="text-xs font-semibold break-words" style={{ color: 'var(--soc-text)' }}>{value}</span>
                </div>
              ))}
            </div>

            <div>
              <p className="soc-label mb-2">Vulnerabilities ({detail.vulnerabilities.length})</p>
              {detail.vulnerabilities.length === 0 ? (
                <p className="text-xs" style={{ color: 'var(--soc-text-muted)' }}>No open vulnerabilities on this asset.</p>
              ) : (
                <ul className="space-y-1.5">
                  {detail.vulnerabilities.map((v) => (
                    <li key={v.id} className="flex items-center justify-between gap-3 text-xs">
                      <span className="min-w-0 truncate" style={{ color: 'var(--soc-text-secondary)' }}>
                        {v.cveId ? `${v.cveId} · ` : ''}{v.title}
                        {v.exploitedInWild && (
                          <span className="ml-1.5 font-semibold" style={{ color: 'var(--soc-critical)' }}>EXPLOITED</span>
                        )}
                      </span>
                      <SeverityBadge severity={v.severity} />
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <p className="soc-label mb-2">Related alerts ({detail.relatedAlerts.length})</p>
              {detail.relatedAlerts.length === 0 ? (
                <p className="text-xs" style={{ color: 'var(--soc-text-muted)' }}>No alerts reference this asset.</p>
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

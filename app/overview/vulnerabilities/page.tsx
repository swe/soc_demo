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
import type { VulnerabilityDto } from '@domain/entities/vulnerability'
import { SEVERITIES, VULNERABILITY_STATUSES, type Severity, type VulnerabilityStatus } from '@domain/enums'
import { api } from '@lib/api-client'
import { EmptyState } from '@ui/empty-state'
import { SeverityBadge, severityColor } from '@ui/severity-badge'
import { Skeleton, TableSkeleton } from '@ui/skeleton'
import { StatusBadge } from '@ui/status-badge'

const PAGE_SIZE = 25

const STATUS_LABEL: Record<VulnerabilityStatus, string> = {
  open: 'Open',
  in_progress: 'In progress',
  resolved: 'Resolved',
  accepted: 'Accepted',
}

export default function VulnerabilitiesPage() {
  const { setPageTitle } = usePageTitle()
  const [items, setItems] = useState<VulnerabilityDto[]>([])
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')

  const [search, setSearch] = useState('')
  const [severity, setSeverity] = useState<Severity | ''>('')
  const [status, setStatus] = useState<VulnerabilityStatus | ''>('')

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detail, setDetail] = useState<VulnerabilityDto | null>(null)
  const [detailError, setDetailError] = useState('')

  useEffect(() => {
    setPageTitle('Vulnerabilities')
  }, [setPageTitle])

  const load = useCallback(
    async (cursor?: string) =>
      api.vulnerabilities.list({
        limit: PAGE_SIZE,
        q: search || undefined,
        severity: severity || undefined,
        status: status || undefined,
        cursor,
      }),
    [search, severity, status],
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
          setError(err.message ?? 'Failed to load vulnerabilities')
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
      setError(err instanceof Error ? err.message : 'Failed to load more vulnerabilities')
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
    api.vulnerabilities
      .get(selectedId)
      .then((v) => {
        if (!cancelled) setDetail(v)
      })
      .catch((err) => {
        if (!cancelled) setDetailError(err.message ?? 'Failed to load vulnerability')
      })
    return () => {
      cancelled = true
    }
  }, [selectedId])

  return (
    <OverviewPageShell>
      <OverviewPageHeader
        section="VULNERABILITY MANAGEMENT"
        title="Vulnerabilities"
        description="Findings across monitored assets, newest first."
      />

      <OverviewTableToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by title or CVE…"
        end={(
          <div className="flex items-center gap-2">
            <select
              className="soc-input h-9 min-h-9 box-border text-sm"
              value={severity}
              onChange={(e) => setSeverity(e.target.value as Severity | '')}
              aria-label="Filter by severity"
            >
              <option value="">All severities</option>
              {SEVERITIES.map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
            <select
              className="soc-input h-9 min-h-9 box-border text-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value as VulnerabilityStatus | '')}
              aria-label="Filter by status"
            >
              <option value="">All statuses</option>
              {VULNERABILITY_STATUSES.map((s) => (
                <option key={s} value={s}>{STATUS_LABEL[s]}</option>
              ))}
            </select>
          </div>
        )}
      />

      <OverviewSection title="VULNERABILITIES" flush right={(
        <span className="text-xs tabular-nums" style={{ color: 'var(--soc-text-muted)' }}>
          {loading ? 'Loading…' : `${items.length}${nextCursor ? '+' : ''} shown`}
        </span>
      )}>
        {loading ? (
          <TableSkeleton rows={10} />
        ) : error ? (
          <EmptyState title="Could not load vulnerabilities" description={error} />
        ) : items.length === 0 ? (
          <EmptyState
            title="No vulnerabilities match"
            description={search || severity || status
              ? 'Try adjusting the search or filters.'
              : 'Findings appear once scanners are connected or demo data is loaded.'}
          />
        ) : (
          <>
            <table className="soc-table" style={{ tableLayout: 'fixed', width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ width: '6px', padding: 0 }} />
                  <th style={{ width: '34%' }}>Vulnerability</th>
                  <th style={{ width: '18%' }}>Asset</th>
                  <th style={{ width: '10%' }}>Severity</th>
                  <th style={{ width: '8%' }}>CVSS</th>
                  <th style={{ width: '8%' }}>EPSS</th>
                  <th style={{ width: '10%' }}>Exploited</th>
                  <th style={{ width: '12%' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map((v) => (
                  <tr key={v.id} className="cursor-pointer" onClick={() => setSelectedId(v.id)}>
                    <td style={{ padding: 0 }}>
                      <div style={{ width: '3px', height: '100%', minHeight: '2.75rem', backgroundColor: severityColor(v.severity) }} />
                    </td>
                    <td>
                      <p className="truncate text-sm font-semibold" style={{ color: 'var(--soc-text)' }}>{v.title}</p>
                      <p className="truncate text-xs font-mono" style={{ color: 'var(--soc-text-muted)' }}>{v.cveId ?? v.ruleKey ?? '—'}</p>
                    </td>
                    <td>
                      <span className="truncate text-xs" style={{ color: 'var(--soc-text-secondary)' }}>{v.assetName ?? '—'}</span>
                    </td>
                    <td><SeverityBadge severity={v.severity} /></td>
                    <td>
                      <span className="text-xs font-semibold tabular-nums" style={{ color: 'var(--soc-text-secondary)' }}>
                        {v.cvss?.toFixed(1) ?? '—'}
                      </span>
                    </td>
                    <td>
                      <span className="text-xs tabular-nums" style={{ color: 'var(--soc-text-secondary)' }}>
                        {v.epss !== null ? `${Math.round(v.epss * 100)}%` : '—'}
                      </span>
                    </td>
                    <td>
                      {v.exploitedInWild ? (
                        <span className="text-xs font-bold" style={{ color: 'var(--soc-critical)' }}>YES</span>
                      ) : (
                        <span className="text-xs" style={{ color: 'var(--soc-text-muted)' }}>No</span>
                      )}
                    </td>
                    <td><StatusBadge status={v.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {nextCursor && (
              <div className="border-t px-4 py-3 text-center" style={{ borderColor: 'var(--soc-border)' }}>
                <button type="button" className="soc-btn soc-btn-secondary text-xs" onClick={loadMore} disabled={loadingMore}>
                  {loadingMore ? 'Loading…' : 'Load more vulnerabilities'}
                </button>
              </div>
            )}
          </>
        )}
      </OverviewSection>

      {/* ── Vulnerability detail modal ── */}
      <OverviewModal
        open={Boolean(selectedId)}
        title={detail?.title ?? 'Vulnerability'}
        subtitle={detail?.cveId ?? detail?.ruleKey ?? undefined}
        onClose={() => setSelectedId(null)}
        maxWidth="max-w-xl"
      >
        {detailError ? (
          <EmptyState title="Could not load vulnerability" description={detailError} />
        ) : !detail ? (
          <div className="space-y-3">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <SeverityBadge severity={detail.severity} />
              <StatusBadge status={detail.status} />
              {detail.exploitedInWild && (
                <span className="soc-badge" style={{ backgroundColor: 'var(--soc-critical-bg)', color: 'var(--soc-critical)' }}>
                  EXPLOITED IN WILD
                </span>
              )}
              {detail.fixAvailable && (
                <span className="soc-badge" style={{ backgroundColor: 'var(--soc-low-bg)', color: 'var(--soc-low)' }}>
                  FIX AVAILABLE
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-px overflow-hidden rounded-lg" style={{ border: '1px solid var(--soc-border)', backgroundColor: 'var(--soc-border)' }}>
              {[
                { label: 'Asset', value: detail.assetName ?? '—' },
                { label: 'CVSS', value: detail.cvss?.toFixed(1) ?? '—' },
                { label: 'EPSS', value: detail.epss !== null ? `${Math.round(detail.epss * 100)}%` : '—' },
              ].map(({ label, value }) => (
                <div key={label} className="flex flex-col gap-1 px-4 py-3" style={{ backgroundColor: 'var(--soc-surface)' }}>
                  <span className="soc-label">{label}</span>
                  <span className="text-xs font-semibold break-words" style={{ color: 'var(--soc-text)' }}>{value}</span>
                </div>
              ))}
            </div>

            <p className="text-xs" style={{ color: 'var(--soc-text-muted)' }}>
              Detected {new Date(detail.detectedAt).toLocaleString()}
              {detail.resolvedAt && ` · Resolved ${new Date(detail.resolvedAt).toLocaleString()}`}
            </p>
          </div>
        )}
      </OverviewModal>
    </OverviewPageShell>
  )
}

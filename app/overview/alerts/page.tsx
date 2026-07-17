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
import type { AlertDetailDto, AlertDto, AlertPatch } from '@domain/entities/alert'
import type { MemberDto } from '@domain/entities/member'
import { ALERT_STATUSES, SEVERITIES, type AlertStatus, type Severity } from '@domain/enums'
import { roleHasPermission } from '@domain/permissions'
import { ALERT_TRANSITIONS, nextStatuses } from '@domain/transitions'
import { api } from '@lib/api-client'
import { EmptyState } from '@ui/empty-state'
import { SeverityBadge, severityColor } from '@ui/severity-badge'
import { Skeleton, TableSkeleton } from '@ui/skeleton'
import { StatusBadge } from '@ui/status-badge'

const PAGE_SIZE = 25

const STATUS_ACTION_LABEL: Record<AlertStatus, string> = {
  new: 'Reopen',
  triaged: 'Mark triaged',
  resolved: 'Resolve',
  dismissed: 'Dismiss',
}

const AUDIT_ACTION_LABEL: Record<string, string> = {
  'alert.triage': 'Triaged',
  'alert.resolve': 'Resolved',
  'alert.dismiss': 'Dismissed',
  'alert.assign': 'Assignment changed',
  'alert.severity_change': 'Severity changed',
  'alert.note': 'Note updated',
  'alert.disposition': 'Disposition set',
}

export default function AlertsPage() {
  const { setPageTitle } = usePageTitle()
  const [items, setItems] = useState<AlertDto[]>([])
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')

  const [search, setSearch] = useState('')
  const [severity, setSeverity] = useState<Severity | ''>('')
  const [status, setStatus] = useState<AlertStatus | ''>('')

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detail, setDetail] = useState<AlertDetailDto | null>(null)
  const [detailError, setDetailError] = useState('')

  const [canTriage, setCanTriage] = useState(false)
  const [canInvestigate, setCanInvestigate] = useState(false)
  const [canPromote, setCanPromote] = useState(false)
  const [promoteNotice, setPromoteNotice] = useState('')
  const [members, setMembers] = useState<MemberDto[]>([])
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState('')
  const [noteDraft, setNoteDraft] = useState('')
  const [dismissReason, setDismissReason] = useState('')
  const [dismissOpen, setDismissOpen] = useState(false)

  useEffect(() => {
    setPageTitle('Security Alerts')
  }, [setPageTitle])

  // Role for permission-gated affordances (hiding is UX; services enforce).
  useEffect(() => {
    let cancelled = false
    Promise.all([api.currentOrg(), api.members.list()])
      .then(([org, memberPage]) => {
        if (cancelled) return
        setCanTriage(roleHasPermission(org.role, 'alert:triage'))
        setCanInvestigate(roleHasPermission(org.role, 'investigation:write'))
        setCanPromote(roleHasPermission(org.role, 'incident:write'))
        setMembers(memberPage.items.filter((m) => m.status === 'active'))
      })
      .catch(() => {
        /* affordances stay hidden; reads still work */
      })
    return () => {
      cancelled = true
    }
  }, [])

  const load = useCallback(
    async (cursor?: string) => {
      const page = await api.alerts.list({
        limit: PAGE_SIZE,
        q: search || undefined,
        severity: severity || undefined,
        status: status || undefined,
        cursor,
      })
      return page
    },
    [search, severity, status],
  )

  // Initial load + reload on filter/search change (debounced for typing)
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
          setError(err.message ?? 'Failed to load alerts')
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
      setError(err instanceof Error ? err.message : 'Failed to load more alerts')
    } finally {
      setLoadingMore(false)
    }
  }

  // Detail modal loads the single-alert endpoint (alert + audit history)
  useEffect(() => {
    if (!selectedId) {
      setDetail(null)
      setDetailError('')
      setActionError('')
      setDismissOpen(false)
      setDismissReason('')
      setPromoteNotice('')
      return
    }
    let cancelled = false
    api.alerts
      .get(selectedId)
      .then((alert) => {
        if (cancelled) return
        setDetail(alert)
        setNoteDraft(alert.analystNote ?? '')
      })
      .catch((err) => {
        if (!cancelled) setDetailError(err.message ?? 'Failed to load alert')
      })
    return () => {
      cancelled = true
    }
  }, [selectedId])

  // Refresh the modal (history included) and the list row after a mutation.
  const refreshDetail = async (id: string) => {
    const refreshed = await api.alerts.get(id)
    setDetail(refreshed)
    setNoteDraft(refreshed.analystNote ?? '')
    setDismissOpen(false)
    setDismissReason('')
    setItems((prev) => prev.map((a) => (a.id === refreshed.id ? { ...a, ...refreshed } : a)))
  }

  const applyPatch = async (patch: AlertPatch) => {
    if (!selectedId) return
    setBusy(true)
    setActionError('')
    try {
      await api.alerts.patch(selectedId, patch)
      await refreshDetail(selectedId)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Action failed')
    } finally {
      setBusy(false)
    }
  }

  const startInvestigation = async () => {
    if (!selectedId) return
    setBusy(true)
    setActionError('')
    try {
      await api.alerts.createInvestigation(selectedId)
      await refreshDetail(selectedId)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not create investigation')
    } finally {
      setBusy(false)
    }
  }

  const promoteInvestigation = async () => {
    if (!selectedId || !detail?.investigationId) return
    setBusy(true)
    setActionError('')
    try {
      const incident = await api.investigations.promote(detail.investigationId)
      setPromoteNotice(`Declared INC-${incident.number} from this investigation.`)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not promote investigation')
    } finally {
      setBusy(false)
    }
  }

  return (
    <OverviewPageShell>
      <OverviewPageHeader
        section="DETECTION & RESPONSE"
        title="Security Alerts"
        description="Alerts from connected detection sources, newest first."
      />

      <OverviewTableToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search alerts by title or description…"
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
              onChange={(e) => setStatus(e.target.value as AlertStatus | '')}
              aria-label="Filter by status"
            >
              <option value="">All statuses</option>
              {ALERT_STATUSES.map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>
        )}
      />

      <OverviewSection title="ALERTS" flush right={(
        <span className="text-xs tabular-nums" style={{ color: 'var(--soc-text-muted)' }}>
          {loading ? 'Loading…' : `${items.length}${nextCursor ? '+' : ''} shown`}
        </span>
      )}>
        {loading ? (
          <TableSkeleton rows={10} />
        ) : error ? (
          <EmptyState title="Could not load alerts" description={error} />
        ) : items.length === 0 ? (
          <EmptyState
            title="No alerts match"
            description={search || severity || status
              ? 'Try adjusting the search or filters.'
              : 'Alerts appear once detection sources are connected or demo data is loaded.'}
          />
        ) : (
          <>
            <table className="soc-table" style={{ tableLayout: 'fixed', width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ width: '6px', padding: 0 }} />
                  <th style={{ width: '44%' }}>Alert</th>
                  <th style={{ width: '12%' }}>Severity</th>
                  <th style={{ width: '12%' }}>Status</th>
                  <th style={{ width: '16%' }}>Source</th>
                  <th style={{ width: '16%' }}>Detected</th>
                </tr>
              </thead>
              <tbody>
                {items.map((alert) => (
                  <tr
                    key={alert.id}
                    className="cursor-pointer"
                    onClick={() => setSelectedId(alert.id)}
                  >
                    <td style={{ padding: 0 }}>
                      <div style={{ width: '3px', height: '100%', minHeight: '2.75rem', backgroundColor: severityColor(alert.severity) }} />
                    </td>
                    <td>
                      <p className="truncate text-sm font-semibold" style={{ color: 'var(--soc-text)' }}>{alert.title}</p>
                      <p className="truncate text-xs" style={{ color: 'var(--soc-text-muted)' }}>
                        {alert.ruleKey}
                        {alert.mitreTechniques.length > 0 && ` · ${alert.mitreTechniques.join(', ')}`}
                      </p>
                    </td>
                    <td><SeverityBadge severity={alert.severity} /></td>
                    <td><StatusBadge status={alert.status} /></td>
                    <td>
                      <span className="text-xs" style={{ color: 'var(--soc-text-secondary)' }}>{alert.source}</span>
                    </td>
                    <td>
                      <span className="text-xs tabular-nums" style={{ color: 'var(--soc-text-secondary)' }}>
                        {new Date(alert.detectedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {nextCursor && (
              <div className="border-t px-4 py-3 text-center" style={{ borderColor: 'var(--soc-border)' }}>
                <button
                  type="button"
                  className="soc-btn soc-btn-secondary text-xs"
                  onClick={loadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? 'Loading…' : 'Load more alerts'}
                </button>
              </div>
            )}
          </>
        )}
      </OverviewSection>

      {/* ── Alert detail modal ── */}
      <OverviewModal
        open={Boolean(selectedId)}
        title={detail?.title ?? 'Alert'}
        subtitle={detail ? detail.ruleKey : undefined}
        onClose={() => setSelectedId(null)}
        maxWidth="max-w-xl"
      >
        {detailError ? (
          <EmptyState title="Could not load alert" description={detailError} />
        ) : !detail ? (
          <div className="space-y-3">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <SeverityBadge severity={detail.severity} />
              <StatusBadge status={detail.status} />
              {detail.disposition && (
                <span className="soc-badge" style={{ backgroundColor: 'var(--soc-overlay)', color: 'var(--soc-text-secondary)' }}>
                  {detail.disposition.toUpperCase()}
                </span>
              )}
            </div>

            <p className="text-sm leading-relaxed" style={{ color: 'var(--soc-text-secondary)' }}>
              {detail.description || 'No description provided by the detection source.'}
            </p>

            <div className="grid grid-cols-3 gap-px overflow-hidden rounded-lg" style={{ border: '1px solid var(--soc-border)', backgroundColor: 'var(--soc-border)' }}>
              {[
                { label: 'Source', value: detail.source },
                { label: 'Detected', value: new Date(detail.detectedAt).toLocaleString() },
                { label: 'MITRE', value: detail.mitreTechniques.length > 0 ? detail.mitreTechniques.join(', ') : '—' },
              ].map(({ label, value }) => (
                <div key={label} className="flex flex-col gap-1 px-4 py-3" style={{ backgroundColor: 'var(--soc-surface)' }}>
                  <span className="soc-label">{label}</span>
                  <span className="text-xs font-semibold break-words" style={{ color: 'var(--soc-text)' }}>{value}</span>
                </div>
              ))}
            </div>

            {detail.entityRefs.length > 0 && (
              <div>
                <p className="soc-label mb-2">Linked entities</p>
                <div className="flex flex-wrap gap-1.5">
                  {detail.entityRefs.map((ref) => (
                    <span
                      key={`${ref.type}-${ref.id}`}
                      className="rounded-md px-2.5 py-1 text-xs font-medium"
                      style={{ backgroundColor: 'var(--soc-overlay)', border: '1px solid var(--soc-border)', color: 'var(--soc-text-secondary)' }}
                    >
                      {ref.type}: {ref.label ?? ref.id.split('_').slice(1, 3).join(' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {detail.investigationId ? (
              <div className="rounded-md px-4 py-3" style={{ backgroundColor: 'var(--soc-accent-bg)', border: '1px solid var(--soc-accent)' }}>
                <p className="soc-label mb-0.5">Investigation</p>
                <p className="text-xs font-medium" style={{ color: 'var(--soc-accent-text)' }}>
                  This alert is part of an active investigation.
                </p>
                {promoteNotice ? (
                  <p className="mt-2 text-xs font-semibold" style={{ color: 'var(--soc-accent-text)' }}>{promoteNotice}</p>
                ) : canPromote ? (
                  <button
                    type="button"
                    className="soc-btn soc-btn-secondary mt-2 text-xs"
                    disabled={busy}
                    onClick={() => void promoteInvestigation()}
                  >
                    Promote to incident
                  </button>
                ) : null}
              </div>
            ) : canInvestigate ? (
              <div>
                <button
                  type="button"
                  className="soc-btn soc-btn-secondary text-xs"
                  disabled={busy}
                  onClick={() => void startInvestigation()}
                >
                  Start investigation from this alert
                </button>
              </div>
            ) : null}

            {detail.dismissedReason && (
              <div className="rounded-md px-4 py-3" style={{ backgroundColor: 'var(--soc-overlay)', border: '1px solid var(--soc-border)' }}>
                <p className="soc-label mb-0.5">Dismissal reason</p>
                <p className="text-xs" style={{ color: 'var(--soc-text-secondary)' }}>{detail.dismissedReason}</p>
              </div>
            )}

            {canTriage && (
              <div className="space-y-4 rounded-lg p-4" style={{ border: '1px solid var(--soc-border)', backgroundColor: 'var(--soc-overlay)' }}>
                <p className="soc-label">Triage</p>

                {actionError && (
                  <p className="text-xs font-medium" style={{ color: 'var(--soc-critical)' }}>{actionError}</p>
                )}

                {nextStatuses(ALERT_TRANSITIONS, detail.status).length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {nextStatuses(ALERT_TRANSITIONS, detail.status).map((to) =>
                      to === 'dismissed' ? (
                        <button
                          key={to}
                          type="button"
                          className="soc-btn soc-btn-secondary text-xs"
                          disabled={busy}
                          onClick={() => setDismissOpen((v) => !v)}
                        >
                          {STATUS_ACTION_LABEL[to]}…
                        </button>
                      ) : (
                        <button
                          key={to}
                          type="button"
                          className="soc-btn soc-btn-primary text-xs"
                          disabled={busy}
                          onClick={() => void applyPatch({ status: to })}
                        >
                          {STATUS_ACTION_LABEL[to]}
                        </button>
                      ),
                    )}
                  </div>
                )}

                {dismissOpen && (
                  <div className="flex items-center gap-2">
                    <input
                      className="soc-input h-9 min-h-9 box-border flex-1 text-sm"
                      placeholder="Dismissal reason (required)"
                      value={dismissReason}
                      onChange={(e) => setDismissReason(e.target.value)}
                    />
                    <button
                      type="button"
                      className="soc-btn soc-btn-primary text-xs"
                      disabled={busy || dismissReason.trim().length < 3}
                      onClick={() => void applyPatch({ status: 'dismissed', dismissedReason: dismissReason.trim() })}
                    >
                      Confirm dismiss
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <label className="flex flex-col gap-1">
                    <span className="soc-label">Severity</span>
                    <select
                      className="soc-input h-9 min-h-9 box-border text-sm"
                      value={detail.severity}
                      disabled={busy || nextStatuses(ALERT_TRANSITIONS, detail.status).length === 0}
                      onChange={(e) => void applyPatch({ severity: e.target.value as Severity })}
                    >
                      {SEVERITIES.map((s) => (
                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                      ))}
                    </select>
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="soc-label">Assignee</span>
                    <select
                      className="soc-input h-9 min-h-9 box-border text-sm"
                      value={detail.assignedMembershipId ?? ''}
                      disabled={busy || nextStatuses(ALERT_TRANSITIONS, detail.status).length === 0}
                      onChange={(e) => void applyPatch({ assignedMembershipId: e.target.value || null })}
                    >
                      <option value="">Unassigned</option>
                      {members.map((m) => (
                        <option key={m.membershipId} value={m.membershipId}>
                          {m.name ?? m.email} ({m.role})
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="soc-label">Analyst note</span>
                  <textarea
                    className="soc-input box-border w-full text-sm"
                    rows={2}
                    placeholder="Findings, context, next steps…"
                    value={noteDraft}
                    disabled={busy || nextStatuses(ALERT_TRANSITIONS, detail.status).length === 0}
                    onChange={(e) => setNoteDraft(e.target.value)}
                  />
                  {noteDraft !== (detail.analystNote ?? '') && (
                    <div>
                      <button
                        type="button"
                        className="soc-btn soc-btn-secondary text-xs"
                        disabled={busy}
                        onClick={() => void applyPatch({ analystNote: noteDraft.trim() || null })}
                      >
                        Save note
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {detail.history.length > 0 && (
              <div>
                <p className="soc-label mb-2">History</p>
                <ul className="space-y-1.5">
                  {detail.history.map((entry) => (
                    <li key={entry.id} className="flex items-baseline justify-between gap-3 text-xs">
                      <span style={{ color: 'var(--soc-text-secondary)' }}>
                        {AUDIT_ACTION_LABEL[entry.action] ?? entry.action}
                        {entry.action !== 'alert.assign' &&
                        typeof entry.metadata.to === 'string' &&
                        typeof entry.metadata.from === 'string'
                          ? ` · ${entry.metadata.from} → ${entry.metadata.to}`
                          : ''}
                      </span>
                      <span className="whitespace-nowrap tabular-nums" style={{ color: 'var(--soc-text-muted)' }}>
                        {new Date(entry.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </OverviewModal>
    </OverviewPageShell>
  )
}

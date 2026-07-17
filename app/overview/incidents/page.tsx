'use client'

import { useEffect, useState } from 'react'

import { usePageTitle } from '@/app/page-title-context'
import {
  OverviewModal,
  OverviewPageHeader,
  OverviewPageShell,
  OverviewSection,
} from '@/components/overview/unified-ui'
import type { IncidentDetailDto, IncidentDto, IncidentPatch } from '@domain/entities/incident'
import type { MemberDto } from '@domain/entities/member'
import { INCIDENT_STATUSES, type IncidentStatus } from '@domain/enums'
import { roleHasPermission } from '@domain/permissions'
import { INCIDENT_TRANSITIONS, nextStatuses } from '@domain/transitions'
import { api } from '@lib/api-client'
import { EmptyState } from '@ui/empty-state'
import { SeverityBadge, severityColor } from '@ui/severity-badge'
import { Skeleton, TableSkeleton } from '@ui/skeleton'
import { StatusBadge } from '@ui/status-badge'

const TIMELINE_KIND_LABEL: Record<string, string> = {
  declared: 'Declared',
  status_change: 'Status change',
  note: 'Note',
  evidence: 'Evidence',
  action: 'Action',
}

const STATUS_ACTION_LABEL: Record<IncidentStatus, string> = {
  declared: 'Reopen',
  contained: 'Mark contained',
  resolved: 'Resolve',
  closed: 'Close',
}

export default function IncidentsPage() {
  const { setPageTitle } = usePageTitle()
  const [items, setItems] = useState<IncidentDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [status, setStatus] = useState<IncidentStatus | ''>('')
  const [notice, setNotice] = useState('')

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detail, setDetail] = useState<IncidentDetailDto | null>(null)
  const [detailError, setDetailError] = useState('')

  const [canRespond, setCanRespond] = useState(false)
  const [members, setMembers] = useState<MemberDto[]>([])
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState('')
  const [noteDraft, setNoteDraft] = useState('')

  useEffect(() => {
    setPageTitle('Incidents')
  }, [setPageTitle])

  // Role for permission-gated affordances (hiding is UX; services enforce).
  useEffect(() => {
    let cancelled = false
    Promise.all([api.currentOrg(), api.members.list()])
      .then(([org, memberPage]) => {
        if (cancelled) return
        setCanRespond(roleHasPermission(org.role, 'incident:write'))
        setMembers(memberPage.items.filter((m) => m.status === 'active'))
      })
      .catch(() => {
        /* affordances stay hidden; reads still work */
      })
    return () => {
      cancelled = true
    }
  }, [])

  const applyPatch = async (patch: IncidentPatch) => {
    if (!selectedId) return
    setBusy(true)
    setActionError('')
    try {
      const refreshed = await api.incidents.patch(selectedId, patch)
      setDetail(refreshed)
      setNoteDraft('')
      setItems((prev) => prev.map((i) => (i.id === refreshed.id ? { ...i, ...refreshed } : i)))
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Action failed')
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    api.incidents
      .list({ status: status || undefined, limit: 100 })
      .then((page) => {
        if (cancelled) return
        setItems(page.items)
        setLoading(false)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err.message ?? 'Failed to load incidents')
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [status])

  useEffect(() => {
    if (!selectedId) {
      setDetail(null)
      setDetailError('')
      return
    }
    let cancelled = false
    api.incidents
      .get(selectedId)
      .then((incident) => {
        if (!cancelled) setDetail(incident)
      })
      .catch((err) => {
        if (!cancelled) setDetailError(err.message ?? 'Failed to load incident')
      })
    return () => {
      cancelled = true
    }
  }, [selectedId])

  useEffect(() => {
    if (!notice) return
    const timeout = setTimeout(() => setNotice(''), 4000)
    return () => clearTimeout(timeout)
  }, [notice])

  return (
    <OverviewPageShell>
      <OverviewPageHeader
        section="INCIDENT RESPONSE"
        title="Incidents"
        description="Declared incidents with response timelines, numbered per organization."
        actions={[
          {
            id: 'new-incident',
            label: '+ New Incident',
            variant: 'primary',
            onClick: () => setNotice('Incidents are declared by promoting an investigation — open an alert, start an investigation, then promote it.'),
          },
        ]}
      />

      {notice && (
        <div
          className="mb-4 rounded-lg border px-4 py-3 text-sm"
          style={{ borderColor: 'var(--soc-accent)', backgroundColor: 'var(--soc-accent-bg)', color: 'var(--soc-accent-text)' }}
        >
          {notice}
        </div>
      )}

      <div className="mb-4 flex justify-end">
        <select
          className="soc-input h-9 min-h-9 box-border text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value as IncidentStatus | '')}
          aria-label="Filter by status"
        >
          <option value="">All statuses</option>
          {INCIDENT_STATUSES.map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      <OverviewSection title="INCIDENTS" flush right={(
        <span className="text-xs tabular-nums" style={{ color: 'var(--soc-text-muted)' }}>
          {loading ? 'Loading…' : `${items.length} total`}
        </span>
      )}>
        {loading ? (
          <TableSkeleton rows={6} />
        ) : error ? (
          <EmptyState title="Could not load incidents" description={error} />
        ) : items.length === 0 ? (
          <EmptyState
            title="No incidents"
            description={status ? 'No incidents with this status.' : 'Declared incidents will appear here.'}
          />
        ) : (
          <table className="soc-table" style={{ tableLayout: 'fixed', width: '100%' }}>
            <thead>
              <tr>
                <th style={{ width: '6px', padding: 0 }} />
                <th style={{ width: '10%' }}>ID</th>
                <th style={{ width: '42%' }}>Incident</th>
                <th style={{ width: '12%' }}>Severity</th>
                <th style={{ width: '14%' }}>Status</th>
                <th style={{ width: '12%' }}>Declared</th>
                <th className="text-right" style={{ width: '10%' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((incident) => (
                <tr key={incident.id}>
                  <td style={{ padding: 0 }}>
                    <div style={{ width: '3px', height: '100%', minHeight: '2.75rem', backgroundColor: severityColor(incident.severity) }} />
                  </td>
                  <td>
                    <p className="text-xs font-mono" style={{ color: 'var(--soc-text-muted)' }}>INC-{incident.number}</p>
                  </td>
                  <td>
                    <p className="truncate text-sm font-semibold" style={{ color: 'var(--soc-text)' }}>{incident.title}</p>
                    <p className="truncate text-xs" style={{ color: 'var(--soc-text-muted)' }}>{incident.impactSummary}</p>
                  </td>
                  <td><SeverityBadge severity={incident.severity} /></td>
                  <td><StatusBadge status={incident.status} /></td>
                  <td>
                    <span className="text-xs tabular-nums" style={{ color: 'var(--soc-text-secondary)' }}>
                      {new Date(incident.declaredAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </td>
                  <td className="text-right">
                    <button type="button" className="soc-btn soc-btn-secondary text-xs" onClick={() => setSelectedId(incident.id)}>
                      Open
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </OverviewSection>

      {/* ── Incident detail modal ── */}
      <OverviewModal
        open={Boolean(selectedId)}
        title={detail ? `INC-${detail.number} · ${detail.title}` : 'Incident'}
        subtitle="INCIDENT DETAIL"
        onClose={() => setSelectedId(null)}
        maxWidth="max-w-2xl"
      >
        {detailError ? (
          <EmptyState title="Could not load incident" description={detailError} />
        ) : !detail ? (
          <div className="space-y-3">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <SeverityBadge severity={detail.severity} />
              <StatusBadge status={detail.status} />
              <span className="text-xs" style={{ color: 'var(--soc-text-muted)' }}>
                Declared {new Date(detail.declaredAt).toLocaleString()}
                {detail.resolvedAt && ` · Resolved ${new Date(detail.resolvedAt).toLocaleString()}`}
              </span>
            </div>

            <div>
              <p className="soc-label mb-1.5">Impact</p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--soc-text-secondary)' }}>
                {detail.impactSummary || 'No impact summary recorded.'}
              </p>
            </div>

            {canRespond && (
              <div className="space-y-4 rounded-lg p-4" style={{ border: '1px solid var(--soc-border)', backgroundColor: 'var(--soc-overlay)' }}>
                <p className="soc-label">Response</p>

                {actionError && (
                  <p className="text-xs font-medium" style={{ color: 'var(--soc-critical)' }}>{actionError}</p>
                )}

                {nextStatuses(INCIDENT_TRANSITIONS, detail.status).length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {nextStatuses(INCIDENT_TRANSITIONS, detail.status).map((to) => (
                      <button
                        key={to}
                        type="button"
                        className="soc-btn soc-btn-primary text-xs"
                        disabled={busy}
                        onClick={() => void applyPatch({ status: to })}
                      >
                        {STATUS_ACTION_LABEL[to]}
                      </button>
                    ))}
                  </div>
                )}

                <label className="flex max-w-xs flex-col gap-1">
                  <span className="soc-label">Owner</span>
                  <select
                    className="soc-input h-9 min-h-9 box-border text-sm"
                    value={detail.ownerMembershipId ?? ''}
                    disabled={busy || nextStatuses(INCIDENT_TRANSITIONS, detail.status).length === 0}
                    onChange={(e) => void applyPatch({ ownerMembershipId: e.target.value || null })}
                  >
                    <option value="">Unassigned</option>
                    {members.map((m) => (
                      <option key={m.membershipId} value={m.membershipId}>
                        {m.name ?? m.email} ({m.role})
                      </option>
                    ))}
                  </select>
                </label>

                {nextStatuses(INCIDENT_TRANSITIONS, detail.status).length > 0 && (
                  <div className="flex items-start gap-2">
                    <textarea
                      className="soc-input box-border flex-1 text-sm"
                      rows={2}
                      placeholder="Add a timeline note…"
                      value={noteDraft}
                      disabled={busy}
                      onChange={(e) => setNoteDraft(e.target.value)}
                    />
                    <button
                      type="button"
                      className="soc-btn soc-btn-secondary text-xs"
                      disabled={busy || noteDraft.trim().length === 0}
                      onClick={() => void applyPatch({ note: noteDraft.trim() })}
                    >
                      Add note
                    </button>
                  </div>
                )}
              </div>
            )}

            <div>
              <p className="soc-label mb-3">Response timeline</p>
              {detail.timeline.length === 0 ? (
                <p className="text-xs" style={{ color: 'var(--soc-text-muted)' }}>No timeline entries yet.</p>
              ) : (
                <div className="space-y-0">
                  {detail.timeline.map((entry, i) => (
                    <div key={`${entry.at}-${i}`} className="relative flex gap-3 pb-4">
                      {i < detail.timeline.length - 1 && (
                        <div className="absolute left-[5px] top-4 bottom-0 w-px" style={{ backgroundColor: 'var(--soc-border)' }} />
                      )}
                      <div
                        className="relative mt-1.5 h-[11px] w-[11px] shrink-0 rounded-full border-2"
                        style={{
                          borderColor: entry.kind === 'declared' ? 'var(--soc-critical)' : entry.kind === 'action' ? 'var(--soc-accent)' : 'var(--soc-border-mid)',
                          backgroundColor: 'var(--soc-surface)',
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline gap-x-2">
                          <span className="text-xs font-semibold" style={{ color: 'var(--soc-text)' }}>
                            {TIMELINE_KIND_LABEL[entry.kind] ?? entry.kind}
                          </span>
                          <span className="text-[11px] tabular-nums" style={{ color: 'var(--soc-text-muted)' }}>
                            {new Date(entry.at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {entry.actor && (
                            <span className="text-[11px]" style={{ color: 'var(--soc-text-muted)' }}>· {entry.actor}</span>
                          )}
                        </div>
                        <p className="mt-0.5 text-xs leading-relaxed" style={{ color: 'var(--soc-text-secondary)' }}>
                          {entry.summary}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </OverviewModal>
    </OverviewPageShell>
  )
}

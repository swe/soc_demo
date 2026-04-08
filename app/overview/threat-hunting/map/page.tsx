'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePageTitle } from '@/app/page-title-context'
import dynamic from 'next/dynamic'
import {
  OverviewAlert,
  OverviewDateRangeMenu,
  OverviewFilterMenu,
  OverviewKpiRow,
  OverviewModal,
  OverviewPageHeader,
  OverviewPageShell,
  OverviewSection,
  OverviewStepModal,
  OverviewTableToolbar,
} from '@/components/overview/unified-ui'

const AttackMap = dynamic(() => import('@/components/attack-map'), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center">
      <p className="text-sm" style={{ color: 'var(--soc-text-muted)' }}>Loading map...</p>
    </div>
  ),
})

interface AttackEvent {
  id: string
  source: string
  target: string
  type: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  timestamp: string
  blocked: boolean
}

const SEV: Record<AttackEvent['severity'], { color: string; bg: string }> = {
  critical: { color: 'var(--soc-critical)', bg: 'var(--soc-critical-bg)' },
  high: { color: 'var(--soc-high)', bg: 'var(--soc-high-bg)' },
  medium: { color: 'var(--soc-medium)', bg: 'var(--soc-medium-bg)' },
  low: { color: 'var(--soc-low)', bg: 'var(--soc-low-bg)' },
}

const ATTACK_TYPES = ['DDoS', 'Brute Force', 'SQL Injection', 'Phishing', 'Malware', 'Ransomware']
const SOURCES = ['China', 'Russia', 'North Korea', 'Brazil', 'India']
const SEVERITIES: Array<AttackEvent['severity']> = ['critical', 'high', 'medium', 'low']

function makeEvent(): AttackEvent {
  return {
    id: Math.random().toString(36).slice(2, 11),
    source: SOURCES[Math.floor(Math.random() * SOURCES.length)],
    target: 'Your Network',
    type: ATTACK_TYPES[Math.floor(Math.random() * ATTACK_TYPES.length)],
    severity: SEVERITIES[Math.floor(Math.random() * SEVERITIES.length)],
    timestamp: new Date().toISOString(),
    blocked: Math.random() > 0.3,
  }
}

type PendingAction = { type: 'block' | 'unblock' | 'create-case'; eventId: string } | null
type Flash = { tone: 'success' | 'attention'; title: string; description: string } | null

export default function ThreatMap() {
  const { setPageTitle } = usePageTitle()
  const [events, setEvents] = useState<AttackEvent[]>([])
  const [query, setQuery] = useState('')
  const [combinedFilters, setCombinedFilters] = useState<string[]>([])
  const [liveMode] = useState(true)
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [pendingAction, setPendingAction] = useState<PendingAction>(null)
  const [actionBusy, setActionBusy] = useState(false)
  const [flash, setFlash] = useState<Flash>(null)

  const [playbookOpen, setPlaybookOpen] = useState(false)
  const [playbookStep, setPlaybookStep] = useState(0)
  const [playbookScope, setPlaybookScope] = useState('Global map high-severity events')
  const [playbookOwner, setPlaybookOwner] = useState('Threat Hunt Lead')

  const [exportOpen, setExportOpen] = useState(false)
  const [exportState, setExportState] = useState<'idle' | 'running' | 'done'>('idle')
  const [exportFilteredOnly, setExportFilteredOnly] = useState(true)

  useEffect(() => {
    setPageTitle('Threat Map')
  }, [setPageTitle])

  useEffect(() => {
    const now = new Date()
    const from = new Date()
    from.setDate(now.getDate() - 7)
    setFromDate(from.toISOString().slice(0, 10))
    setToDate(now.toISOString().slice(0, 10))
  }, [])

  useEffect(() => {
    setEvents(Array.from({ length: 10 }, makeEvent))
  }, [])

  useEffect(() => {
    if (!liveMode) return
    const interval = setInterval(() => {
      setEvents((prev) => [makeEvent(), ...prev].slice(0, 20))
    }, 5000)
    return () => clearInterval(interval)
  }, [liveMode])

  const combinedFilterOptions = useMemo(
    () => [
      ...ATTACK_TYPES.map((type) => ({ id: `type:${type}`, label: type, section: 'Attack type' })),
      ...SEVERITIES.map((severity) => ({ id: `sev:${severity}`, label: severity.toUpperCase(), section: 'Severity' })),
      { id: 'state:blocked', label: 'Blocked', section: 'State' },
      { id: 'state:active', label: 'Active', section: 'State' },
    ],
    [],
  )

  useEffect(() => {
    if (combinedFilters.length === 0 && combinedFilterOptions.length > 0) {
      setCombinedFilters(combinedFilterOptions.map((option) => option.id))
    }
  }, [combinedFilterOptions, combinedFilters.length])

  const visible = useMemo(() => {
    const q = query.toLowerCase()
    const selectedTypes = combinedFilters.filter((id) => id.startsWith('type:')).map((id) => id.slice(5))
    const selectedSeverity = combinedFilters
      .filter((id): id is `sev:${AttackEvent['severity']}` => id.startsWith('sev:'))
      .map((id) => id.slice(4) as AttackEvent['severity'])
    const stateOptions = combinedFilters.filter((id) => id.startsWith('state:')).map((id) => id.slice(6))

    return events
      .filter((event) => selectedTypes.length === 0 || selectedTypes.includes(event.type))
      .filter((event) => selectedSeverity.length === 0 || selectedSeverity.includes(event.severity))
      .filter((event) => {
        if (stateOptions.length === 0) return true
        if (stateOptions.includes('blocked') && event.blocked) return true
        if (stateOptions.includes('active') && !event.blocked) return true
        return false
      })
      .filter((event) => !fromDate || event.timestamp.slice(0, 10) >= fromDate)
      .filter((event) => !toDate || event.timestamp.slice(0, 10) <= toDate)
      .filter(
        (event) =>
          !q ||
          event.id.toLowerCase().includes(q) ||
          event.source.toLowerCase().includes(q) ||
          event.type.toLowerCase().includes(q),
      )
  }, [combinedFilters, events, fromDate, query, toDate])

  const selectedEvent = selectedEventId ? events.find((event) => event.id === selectedEventId) ?? null : null
  const pendingEvent = pendingAction ? events.find((event) => event.id === pendingAction.eventId) ?? null : null

  const blocked = events.filter((event) => event.blocked).length
  const critical = events.filter((event) => event.severity === 'critical').length
  const active = events.filter((event) => !event.blocked).length

  const typeDistribution = ATTACK_TYPES.map((type) => ({
    type,
    count: events.filter((event) => event.type === type).length,
  }))
  const maxCount = Math.max(...typeDistribution.map((item) => item.count), 1)

  const formatTime = (iso: string) => {
    const date = new Date(iso)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }

  const formatDateTime = (iso: string) =>
    new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })

  const executePendingAction = async () => {
    if (!pendingAction || !pendingEvent) return
    setActionBusy(true)
    await new Promise((resolve) => setTimeout(resolve, 900))

    setEvents((prev) =>
      prev.map((event) => {
        if (event.id !== pendingAction.eventId) return event
        if (pendingAction.type === 'block') return { ...event, blocked: true }
        if (pendingAction.type === 'unblock') return { ...event, blocked: false }
        return event
      }),
    )

    setActionBusy(false)
    const title =
      pendingAction.type === 'create-case'
        ? `Case created for event ${pendingEvent.id}`
        : pendingAction.type === 'block'
          ? `Source blocked for ${pendingEvent.id}`
          : `Source unblocked for ${pendingEvent.id}`
    setFlash({
      tone: pendingAction.type === 'create-case' ? 'success' : 'attention',
      title,
      description: 'Threat map feed, response state, and analyst queue were refreshed.',
    })
    setPendingAction(null)
  }

  const runExport = async () => {
    setExportState('running')
    await new Promise((resolve) => setTimeout(resolve, 900))
    setExportState('done')
  }

  const finishPlaybook = () => {
    setPlaybookOpen(false)
    setPlaybookStep(0)
    setFlash({
      tone: 'success',
      title: 'Response playbook launched',
      description: `${playbookOwner} now coordinates ${playbookScope.toLowerCase()} from the threat map queue.`,
    })
  }

  return (
    <OverviewPageShell>
      <OverviewPageHeader
        section="THREAT HUNTING"
        title="Global Threat Map"
        description="Live attack origin telemetry, active response state, and event-level actions in one operational workspace."
        actions={[
          { id: 'export', label: 'Export Snapshot', variant: 'secondary', onClick: () => setExportOpen(true) },
          { id: 'playbook', label: 'Run Playbook', variant: 'primary', onClick: () => setPlaybookOpen(true) },
        ]}
      />

      {flash && (
        <div className="mb-4">
          <OverviewAlert tone={flash.tone} title={flash.title} description={flash.description} />
        </div>
      )}

      <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-2">
        <OverviewAlert
          tone={critical > 0 ? 'critical' : 'success'}
          title={critical > 0 ? `${critical} critical live events detected` : 'No critical live events'}
          description="Critical map events should trigger immediate review in the event details panel."
        />
        <OverviewAlert
          tone={liveMode ? 'info' : 'attention'}
          title={liveMode ? 'Live stream enabled (5s interval)' : 'Live stream paused'}
          description="Toggle live updates from the toolbar to freeze or resume real-time map ingestion."
        />
      </div>

      <OverviewKpiRow
        columns={4}
        items={[
          { label: 'TOTAL EVENTS', value: events.length, sub: 'Last 20 events' },
          {
            label: 'BLOCKED',
            value: blocked,
            sub: `${events.length > 0 ? Math.round((blocked / events.length) * 100) : 0}% block rate`,
            tone: 'low',
          },
          { label: 'CRITICAL', value: critical, sub: 'Immediate attention', tone: 'critical' },
          { label: 'ACTIVE THREATS', value: active, sub: 'Not blocked', tone: 'high' },
        ]}
      />

      <OverviewTableToolbar
        searchValue={query}
        onSearchChange={setQuery}
        searchPlaceholder="Search event id, source, or attack type..."
        end={(
          <>
            <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-stretch sm:justify-end sm:gap-2">
              <OverviewFilterMenu
                options={combinedFilterOptions}
                selected={combinedFilters}
                onApply={(next) => setCombinedFilters(next)}
              />
              <OverviewDateRangeMenu
                fromDate={fromDate}
                toDate={toDate}
                onApply={(from, to) => {
                  setFromDate(from)
                  setToDate(to)
                }}
              />
            </div>
          </>
        )}
      />

      <div className="mb-4">
        <OverviewSection
          title="ATTACK ORIGINS"
          right={(
            <span className="text-xs" style={{ color: 'var(--soc-text-muted)' }}>
              {liveMode ? 'Live updates every 5s' : 'Paused'}
            </span>
          )}
          flush
        >
          <div className="h-[480px]">
            <AttackMap />
          </div>
        </OverviewSection>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <OverviewSection
          title="LIVE FEED"
          right={(
            <span className="text-xs tabular-nums" style={{ color: 'var(--soc-text-muted)' }}>
              {visible.length} events
            </span>
          )}
          flush
        >
          <div className="max-h-[360px] overflow-y-auto">
            {visible.map((event, index, array) => {
              const s = SEV[event.severity]
              return (
                <button
                  key={event.id}
                  type="button"
                  className="w-full px-4 py-2.5 text-left transition-colors hover:bg-[color:var(--soc-raised)]"
                  style={{ borderBottom: index < array.length - 1 ? '1px solid var(--soc-border)' : 'none' }}
                  onClick={() => setSelectedEventId(event.id)}
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-xs font-medium" style={{ color: 'var(--soc-text)' }}>{event.type}</span>
                    <span className="soc-badge" style={{ backgroundColor: s.bg, color: s.color }}>{event.severity.toUpperCase()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: 'var(--soc-text-muted)' }}>{event.source} → {event.target}</span>
                    <span className="text-xs font-medium" style={{ color: event.blocked ? 'var(--soc-low)' : 'var(--soc-high)' }}>
                      {event.blocked ? 'BLOCKED' : 'ACTIVE'}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs tabular-nums" style={{ color: 'var(--soc-text-muted)' }}>
                    {formatTime(event.timestamp)}
                  </p>
                </button>
              )
            })}
          </div>
        </OverviewSection>

        <OverviewSection title="ATTACK TYPE DISTRIBUTION">
          <div className="grid grid-cols-1 gap-3 px-4 py-4">
            {typeDistribution.map(({ type, count }) => (
              <div key={type}>
                <div className="mb-1 flex items-end justify-between">
                  <span className="text-xs" style={{ color: 'var(--soc-text-secondary)' }}>{type}</span>
                  <span className="text-xs font-bold tabular-nums" style={{ color: 'var(--soc-text)' }}>{count}</span>
                </div>
                <div className="soc-progress-track">
                  <div className="soc-progress-fill" style={{ width: `${(count / maxCount) * 100}%`, backgroundColor: 'var(--soc-accent)' }} />
                </div>
              </div>
            ))}
          </div>
        </OverviewSection>
      </div>

      <OverviewModal
        open={!!selectedEvent}
        title={selectedEvent ? `${selectedEvent.type} event` : ''}
        subtitle={selectedEvent?.id}
        onClose={() => setSelectedEventId(null)}
        maxWidth="max-w-2xl"
        footer={selectedEvent ? (
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              className="soc-btn soc-btn-secondary"
              onClick={() => setPendingAction({ type: 'create-case', eventId: selectedEvent.id })}
            >
              Create case
            </button>
            <button
              type="button"
              className="soc-btn soc-btn-primary"
              onClick={() =>
                setPendingAction({
                  type: selectedEvent.blocked ? 'unblock' : 'block',
                  eventId: selectedEvent.id,
                })
              }
            >
              {selectedEvent.blocked ? 'Unblock source' : 'Block source'}
            </button>
          </div>
        ) : null}
      >
        {selectedEvent && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <span className="soc-badge" style={{ backgroundColor: SEV[selectedEvent.severity].bg, color: SEV[selectedEvent.severity].color }}>
                {selectedEvent.severity.toUpperCase()}
              </span>
              <span className="soc-badge">{selectedEvent.type}</span>
              <span className="soc-badge">{selectedEvent.blocked ? 'BLOCKED' : 'ACTIVE'}</span>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                ['Source', selectedEvent.source],
                ['Target', selectedEvent.target],
                ['Timestamp', formatDateTime(selectedEvent.timestamp)],
                ['Event ID', selectedEvent.id],
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
        open={!!pendingAction && !!pendingEvent}
        title={
          pendingAction?.type === 'create-case'
            ? 'Create incident case'
            : pendingAction?.type === 'block'
              ? 'Block attack source'
              : 'Unblock attack source'
        }
        subtitle={pendingEvent?.id}
        onClose={() => (actionBusy ? undefined : setPendingAction(null))}
        maxWidth="max-w-lg"
        footer={(
          <div className="flex gap-2 sm:justify-end">
            <button type="button" className="soc-btn soc-btn-secondary" disabled={actionBusy} onClick={() => setPendingAction(null)}>
              Cancel
            </button>
            <button type="button" className="soc-btn soc-btn-primary" disabled={actionBusy} onClick={() => void executePendingAction()}>
              {actionBusy ? 'Applying...' : 'Confirm action'}
            </button>
          </div>
        )}
      >
        {pendingEvent && pendingAction && (
          <p className="text-sm" style={{ color: 'var(--soc-text-secondary)' }}>
            {pendingAction.type === 'create-case' && 'This will create a response case and link this event to the active investigation queue.'}
            {pendingAction.type === 'block' && `This will block source ${pendingEvent.source} and update this event state to blocked.`}
            {pendingAction.type === 'unblock' && `This will unblock source ${pendingEvent.source} and return this event to active monitoring.`}
          </p>
        )}
      </OverviewModal>

      <OverviewModal
        open={exportOpen}
        title="Export map snapshot"
        subtitle="THREAT HUNTING"
        onClose={() => setExportOpen(false)}
        maxWidth="max-w-xl"
        footer={(
          <div className="flex gap-2 sm:justify-end">
            <button type="button" className="soc-btn soc-btn-secondary" onClick={() => setExportOpen(false)}>
              Close
            </button>
            <button type="button" className="soc-btn soc-btn-primary" disabled={exportState === 'running'} onClick={() => void runExport()}>
              {exportState === 'running' ? 'Preparing...' : exportState === 'done' ? 'Export again' : 'Start export'}
            </button>
          </div>
        )}
      >
        <div className="space-y-4">
          <label className="flex items-center gap-2 text-xs font-medium" style={{ color: 'var(--soc-text-secondary)' }}>
            <input
              type="checkbox"
              checked={exportFilteredOnly}
              onChange={(event) => setExportFilteredOnly(event.target.checked)}
              className="h-3.5 w-3.5 rounded border accent-[color:var(--soc-accent)] border-[color:var(--soc-border-mid)]"
            />
            Export filtered feed only
          </label>
          <div className="rounded-md border p-3 text-xs" style={{ borderColor: 'var(--soc-border)', backgroundColor: 'var(--soc-raised)', color: 'var(--soc-text-secondary)' }}>
            Export scope: {exportFilteredOnly ? `${visible.length} visible events` : `${events.length} total events`}
          </div>
          {exportState === 'done' && (
            <OverviewAlert tone="success" title="Snapshot package ready" description="Threat map export generated for incident and hunt reporting." />
          )}
        </div>
      </OverviewModal>

      <OverviewStepModal
        open={playbookOpen}
        subtitle="RUN RESPONSE PLAYBOOK"
        currentStep={playbookStep}
        onStepChange={setPlaybookStep}
        onClose={() => {
          setPlaybookOpen(false)
          setPlaybookStep(0)
        }}
        onFinish={finishPlaybook}
        steps={[
          {
            id: 'scope',
            title: 'Step 1: Scope',
            canProceed: () => playbookScope.trim().length > 3,
            validationHint: 'Scope is required.',
            content: (
              <label className="text-xs font-medium" style={{ color: 'var(--soc-text-secondary)' }}>
                Playbook scope
                <input
                  className="soc-input mt-1 w-full text-sm"
                  value={playbookScope}
                  onChange={(event) => setPlaybookScope(event.target.value)}
                  placeholder="Global map high-severity events"
                />
              </label>
            ),
          },
          {
            id: 'owner',
            title: 'Step 2: Ownership',
            canProceed: () => playbookOwner.trim().length > 2,
            validationHint: 'Owner is required.',
            content: (
              <label className="text-xs font-medium" style={{ color: 'var(--soc-text-secondary)' }}>
                Incident owner
                <input
                  className="soc-input mt-1 w-full text-sm"
                  value={playbookOwner}
                  onChange={(event) => setPlaybookOwner(event.target.value)}
                  placeholder="Threat Hunt Lead"
                />
              </label>
            ),
          },
          {
            id: 'review',
            title: 'Step 3: Review',
            content: (
              <div className="space-y-3 rounded-md border p-4" style={{ borderColor: 'var(--soc-border)', backgroundColor: 'var(--soc-raised)' }}>
                {[
                  ['Scope', playbookScope],
                  ['Owner', playbookOwner],
                  ['Live feed mode', liveMode ? 'Enabled' : 'Paused'],
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

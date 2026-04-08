'use client'

import { Fragment, useEffect, useMemo, useState } from 'react'
import { usePageTitle } from '@/app/page-title-context'
import {
  OverviewAlert,
  OverviewDateRangeMenu,
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

type TechniqueSeverity = 'critical' | 'high' | 'medium' | 'low'
type TechniqueTrend = 'up' | 'down' | 'stable'

interface MitreTechnique {
  id: string
  name: string
  tactic: string
  detections: number
  severity: TechniqueSeverity
  lastDetected: string
  detectedDate: string
  trend: TechniqueTrend
}

const TECHNIQUES: MitreTechnique[] = [
  { id: 'T1566', name: 'Phishing', tactic: 'Initial Access', detections: 89, severity: 'high', lastDetected: '2h ago', detectedDate: '2026-04-08', trend: 'up' },
  { id: 'T1059', name: 'Command and Scripting Interpreter', tactic: 'Execution', detections: 234, severity: 'critical', lastDetected: '15m ago', detectedDate: '2026-04-08', trend: 'up' },
  { id: 'T1078', name: 'Valid Accounts', tactic: 'Persistence', detections: 156, severity: 'high', lastDetected: '1h ago', detectedDate: '2026-04-08', trend: 'stable' },
  { id: 'T1068', name: 'Exploitation for Privilege Escalation', tactic: 'Privilege Escalation', detections: 34, severity: 'critical', lastDetected: '30m ago', detectedDate: '2026-04-08', trend: 'up' },
  { id: 'T1027', name: 'Obfuscated Files or Information', tactic: 'Defense Evasion', detections: 178, severity: 'medium', lastDetected: '3h ago', detectedDate: '2026-04-08', trend: 'down' },
  { id: 'T1003', name: 'OS Credential Dumping', tactic: 'Credential Access', detections: 67, severity: 'critical', lastDetected: '45m ago', detectedDate: '2026-04-08', trend: 'up' },
  { id: 'T1083', name: 'File and Directory Discovery', tactic: 'Discovery', detections: 245, severity: 'low', lastDetected: '5h ago', detectedDate: '2026-04-07', trend: 'stable' },
  { id: 'T1021', name: 'Remote Services', tactic: 'Lateral Movement', detections: 123, severity: 'high', lastDetected: '1h ago', detectedDate: '2026-04-07', trend: 'up' },
  { id: 'T1119', name: 'Automated Collection', tactic: 'Collection', detections: 45, severity: 'medium', lastDetected: '4h ago', detectedDate: '2026-04-07', trend: 'stable' },
  { id: 'T1048', name: 'Exfiltration Over Alternative Protocol', tactic: 'Exfiltration', detections: 28, severity: 'critical', lastDetected: '20m ago', detectedDate: '2026-04-07', trend: 'up' },
  { id: 'T1486', name: 'Data Encrypted for Impact', tactic: 'Impact', detections: 12, severity: 'critical', lastDetected: '10m ago', detectedDate: '2026-04-07', trend: 'up' },
]

const TACTIC_COVERAGE = [
  { tactic: 'Initial Access', pct: 78 },
  { tactic: 'Execution', pct: 91 },
  { tactic: 'Persistence', pct: 82 },
  { tactic: 'Privilege Escalation', pct: 71 },
  { tactic: 'Defense Evasion', pct: 58 },
  { tactic: 'Credential Access', pct: 85 },
  { tactic: 'Lateral Movement', pct: 74 },
  { tactic: 'Exfiltration', pct: 67 },
  { tactic: 'Impact', pct: 88 },
]

const SEV: Record<TechniqueSeverity, { color: string; bg: string; bar: string }> = {
  critical: { color: 'var(--soc-critical)', bg: 'var(--soc-critical-bg)', bar: 'var(--soc-critical)' },
  high: { color: 'var(--soc-high)', bg: 'var(--soc-high-bg)', bar: 'var(--soc-high)' },
  medium: { color: 'var(--soc-medium)', bg: 'var(--soc-medium-bg)', bar: 'var(--soc-medium)' },
  low: { color: 'var(--soc-low)', bg: 'var(--soc-low-bg)', bar: 'var(--soc-low)' },
}

const TREND_ICON: Record<TechniqueTrend, string> = { up: '↑', down: '↓', stable: '—' }
const TREND_COLOR: Record<TechniqueTrend, string> = {
  up: 'var(--soc-critical)',
  down: 'var(--soc-low)',
  stable: 'var(--soc-text-muted)',
}

function getTodayIso() {
  return new Date().toISOString().slice(0, 10)
}

type Flash = { tone: 'success' | 'attention'; title: string; description: string } | null

export default function ThreatAnalytics() {
  const { setPageTitle } = usePageTitle()
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<MitreTechnique | null>(null)
  const [combinedFilters, setCombinedFilters] = useState<string[]>([])
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [criticalOnly, setCriticalOnly] = useState(false)
  const [trendingOnly, setTrendingOnly] = useState(false)
  const [expanded, setExpanded] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(5)

  const [huntOpen, setHuntOpen] = useState(false)
  const [huntStep, setHuntStep] = useState(0)
  const [huntScope, setHuntScope] = useState('All production telemetry')
  const [huntOwner, setHuntOwner] = useState('SOC L2')
  const [huntMode, setHuntMode] = useState<'manual' | 'continuous'>('continuous')

  const [exportOpen, setExportOpen] = useState(false)
  const [exportState, setExportState] = useState<'idle' | 'running' | 'done'>('idle')
  const [exportFilteredOnly, setExportFilteredOnly] = useState(true)

  const [ruleFlowOpen, setRuleFlowOpen] = useState(false)
  const [ruleBusy, setRuleBusy] = useState(false)
  const [flash, setFlash] = useState<Flash>(null)

  useEffect(() => {
    setPageTitle('Threat Analytics')
  }, [setPageTitle])

  useEffect(() => {
    const now = new Date()
    const from = new Date()
    from.setDate(now.getDate() - 30)
    setFromDate(from.toISOString().slice(0, 10))
    setToDate(now.toISOString().slice(0, 10))
  }, [])

  const tacticOptions = useMemo(() => Array.from(new Set(TECHNIQUES.map((t) => t.tactic))), [])
  const combinedFilterOptions = useMemo(
    () => [
      ...tacticOptions.map((tactic) => ({ id: `tactic:${tactic}`, label: tactic, section: 'Tactic' })),
      { id: 'sev:critical', label: 'Critical', section: 'Severity' },
      { id: 'sev:high', label: 'High', section: 'Severity' },
      { id: 'sev:medium', label: 'Medium', section: 'Severity' },
      { id: 'sev:low', label: 'Low', section: 'Severity' },
      { id: 'trend:up', label: 'Trending up', section: 'Trend' },
      { id: 'trend:stable', label: 'Stable', section: 'Trend' },
      { id: 'trend:down', label: 'Trending down', section: 'Trend' },
    ],
    [tacticOptions],
  )

  useEffect(() => {
    if (combinedFilters.length === 0 && combinedFilterOptions.length > 0) {
      setCombinedFilters(combinedFilterOptions.map((opt) => opt.id))
    }
  }, [combinedFilters.length, combinedFilterOptions])

  const visible = useMemo(() => {
    const q = query.toLowerCase()
    const selectedTactics = combinedFilters.filter((id) => id.startsWith('tactic:')).map((id) => id.slice(7))
    const selectedSev = combinedFilters
      .filter((id): id is `sev:${TechniqueSeverity}` => id.startsWith('sev:'))
      .map((id) => id.slice(4) as TechniqueSeverity)
    const selectedTrend = combinedFilters
      .filter((id): id is `trend:${TechniqueTrend}` => id.startsWith('trend:'))
      .map((id) => id.slice(6) as TechniqueTrend)

    return TECHNIQUES
      .filter((t) => selectedTactics.length === 0 || selectedTactics.includes(t.tactic))
      .filter((t) => selectedSev.length === 0 || selectedSev.includes(t.severity))
      .filter((t) => selectedTrend.length === 0 || selectedTrend.includes(t.trend))
      .filter((t) => !criticalOnly || t.severity === 'critical')
      .filter((t) => !trendingOnly || t.trend === 'up')
      .filter((t) => !fromDate || t.detectedDate >= fromDate)
      .filter((t) => !toDate || t.detectedDate <= toDate)
      .filter(
        (t) =>
          !q ||
          t.id.toLowerCase().includes(q) ||
          t.name.toLowerCase().includes(q) ||
          t.tactic.toLowerCase().includes(q),
      )
  }, [combinedFilters, criticalOnly, trendingOnly, fromDate, query, toDate])

  const totalPages = Math.max(1, Math.ceil(visible.length / rowsPerPage))
  const pagedRows = visible.slice((page - 1) * rowsPerPage, page * rowsPerPage)

  useEffect(() => {
    if (page > totalPages) setPage(1)
  }, [page, totalPages])

  const totalDetections = TECHNIQUES.reduce((sum, t) => sum + t.detections, 0)
  const criticalTechniques = TECHNIQUES.filter((t) => t.severity === 'critical').length
  const trending = TECHNIQUES.filter((t) => t.trend === 'up').length
  const avgCoverage = Math.round(TACTIC_COVERAGE.reduce((s, t) => s + t.pct, 0) / TACTIC_COVERAGE.length)

  const runExport = async () => {
    setExportState('running')
    await new Promise((resolve) => setTimeout(resolve, 900))
    setExportState('done')
  }

  const runCreateRule = async () => {
    if (!selected) return
    setRuleBusy(true)
    await new Promise((resolve) => setTimeout(resolve, 900))
    setRuleBusy(false)
    setRuleFlowOpen(false)
    setFlash({
      tone: 'success',
      title: `Hunt rule created for ${selected.id}`,
      description: 'Detection pipeline and technique watchlist were updated with the new rule scope.',
    })
  }

  const finishHuntWizard = () => {
    setHuntOpen(false)
    setHuntStep(0)
    setFlash({
      tone: 'attention',
      title: 'New hunt session started',
      description: `${huntOwner} now owns ${huntScope.toLowerCase()} in ${huntMode} mode.`,
    })
  }

  return (
    <OverviewPageShell>
      <OverviewPageHeader
        section="THREAT HUNTING"
        title="MITRE ATT&CK Analytics"
        description="Technique-level hunting coverage, trend shifts, and high-priority detections in one unified workflow."
        actions={[
          { id: 'export', label: 'Export', variant: 'secondary', onClick: () => setExportOpen(true) },
          { id: 'start-hunt', label: 'Start Hunt', variant: 'primary', onClick: () => setHuntOpen(true) },
        ]}
      />

      {flash && (
        <div className="mb-4">
          <OverviewAlert tone={flash.tone} title={flash.title} description={flash.description} />
        </div>
      )}

      <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-2">
        <OverviewAlert
          tone={criticalTechniques > 0 ? 'critical' : 'success'}
          title={criticalTechniques > 0 ? `${criticalTechniques} critical techniques are active` : 'No critical technique pressure'}
          description="Critical techniques should be prioritized for rule tuning and hunt task allocation."
        />
        <OverviewAlert
          tone={trending > 0 ? 'attention' : 'info'}
          title={`${trending} techniques are trending up`}
          description="Use trend filters and date range controls to focus on fast-changing behavior."
        />
      </div>

      <OverviewKpiRow
        columns={4}
        items={[
          { label: 'TOTAL DETECTIONS', value: totalDetections.toLocaleString(), sub: 'Across mapped techniques' },
          { label: 'CRITICAL TECHNIQUES', value: criticalTechniques, sub: 'Priority triage', tone: 'critical' },
          { label: 'TRENDING UP', value: trending, sub: 'Potential escalation', tone: 'high' },
          { label: 'AVG COVERAGE', value: `${avgCoverage}%`, sub: 'Tactic coverage baseline', tone: 'low' },
        ]}
      />

      <OverviewTableToolbar
        searchValue={query}
        onSearchChange={setQuery}
        searchPlaceholder="Search technique id, name, or tactic..."
        end={
          <>
            <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-stretch sm:justify-end sm:gap-2">
              <OverviewFilterMenu
                options={combinedFilterOptions}
                selected={combinedFilters}
                onApply={(next) => {
                  setCombinedFilters(next)
                  setPage(1)
                }}
              />
              <OverviewDateRangeMenu
                fromDate={fromDate}
                toDate={toDate}
                onApply={(from, to) => {
                  setFromDate(from)
                  setToDate(to)
                  setPage(1)
                }}
              />
            </div>
            <div className="flex w-full flex-wrap gap-2 sm:justify-end">
              <OverviewToggle
                label="Critical only"
                checked={criticalOnly}
                onChange={(next) => {
                  setCriticalOnly(next)
                  setPage(1)
                }}
              />
              <OverviewToggle
                label="Trending up only"
                checked={trendingOnly}
                onChange={(next) => {
                  setTrendingOnly(next)
                  setPage(1)
                }}
              />
            </div>
          </>
        }
      />

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-8">
          <OverviewSection
            title="TECHNIQUE INVENTORY"
            right={(
              <OverviewRowsPerPageMenu
                value={rowsPerPage}
                options={[5, 10]}
                onChange={(n) => {
                  setRowsPerPage(n)
                  setPage(1)
                }}
              />
            )}
            flush
          >
            <table className="soc-table" style={{ tableLayout: 'fixed', width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ width: '6px', padding: 0 }} />
                  <th style={{ width: '11%' }}>ID</th>
                  <th style={{ width: '34%' }}>Technique</th>
                  <th style={{ width: '17%' }}>Tactic</th>
                  <th className="text-right" style={{ width: '11%' }}>Detections</th>
                  <th style={{ width: '12%' }}>Severity</th>
                  <th className="text-center" style={{ width: '7%' }}>Trend</th>
                  <th style={{ width: '8%' }}>Last Seen</th>
                </tr>
              </thead>
              <tbody>
                {pagedRows.map((technique) => {
                  const isExpanded = expanded.includes(technique.id)
                  return (
                    <Fragment key={technique.id}>
                      <tr
                        className="cursor-pointer"
                        onClick={() =>
                          setExpanded((prev) =>
                            prev.includes(technique.id) ? prev.filter((id) => id !== technique.id) : [...prev, technique.id],
                          )
                        }
                      >
                        <td style={{ padding: 0 }}>
                          <div
                            style={{
                              width: '3px',
                              marginLeft: '1px',
                              height: '100%',
                              minHeight: '2.6rem',
                              backgroundColor: SEV[technique.severity].bar,
                              borderRadius: '0 2px 2px 0',
                            }}
                          />
                        </td>
                        <td>
                          <span className="text-xs font-mono font-semibold" style={{ color: 'var(--soc-text-muted)' }}>
                            {technique.id}
                          </span>
                        </td>
                        <td>
                          <span className="text-sm font-medium" style={{ color: 'var(--soc-text)' }}>
                            {technique.name}
                          </span>
                        </td>
                        <td><span className="soc-badge">{technique.tactic}</span></td>
                        <td className="text-right">
                          <span className="text-sm font-bold tabular-nums" style={{ color: 'var(--soc-text)' }}>
                            {technique.detections}
                          </span>
                        </td>
                        <td>
                          <span className="soc-badge" style={{ backgroundColor: SEV[technique.severity].bg, color: SEV[technique.severity].color }}>
                            {technique.severity.toUpperCase()}
                          </span>
                        </td>
                        <td className="text-center">
                          <span className="text-sm font-bold" style={{ color: TREND_COLOR[technique.trend] }}>
                            {TREND_ICON[technique.trend]}
                          </span>
                        </td>
                        <td>
                          <span className="text-xs" style={{ color: 'var(--soc-text-muted)' }}>
                            {technique.lastDetected}
                          </span>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan={8} style={{ padding: 0, backgroundColor: 'var(--soc-raised)', borderTop: '1px solid var(--soc-border)' }}>
                            <div className="space-y-3 px-4 py-3">
                              <p className="text-xs" style={{ color: 'var(--soc-text-secondary)' }}>
                                Technique {technique.id} belongs to {technique.tactic}. Use details to create a dedicated hunt rule with scoped ownership.
                              </p>
                              <div className="flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  className="soc-btn soc-btn-secondary text-xs"
                                  onClick={(event) => {
                                    event.stopPropagation()
                                    setSelected(technique)
                                  }}
                                >
                                  View details
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
        </div>

        <div className="col-span-12 space-y-4 lg:col-span-4">
          <OverviewSection title="TACTIC COVERAGE">
            <div className="space-y-2.5 px-4 py-4">
              {TACTIC_COVERAGE.map(({ tactic, pct }) => {
                const barColor = pct >= 80 ? 'var(--soc-low)' : pct >= 65 ? 'var(--soc-medium)' : 'var(--soc-critical)'
                return (
                  <div key={tactic}>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-xs" style={{ color: 'var(--soc-text-secondary)' }}>{tactic}</span>
                      <span className="text-xs font-semibold" style={{ color: barColor }}>{pct}%</span>
                    </div>
                    <div className="soc-progress-track">
                      <div className="soc-progress-fill" style={{ width: `${pct}%`, backgroundColor: barColor }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </OverviewSection>

          <OverviewSection title="TOP DETECTIONS">
            <div className="px-4 py-2">
              {[...TECHNIQUES]
                .sort((a, b) => b.detections - a.detections)
                .slice(0, 5)
                .map((technique, index, array) => (
                  <div
                    key={technique.id}
                    className="flex items-center justify-between py-2.5"
                    style={{ borderBottom: index < array.length - 1 ? '1px solid var(--soc-border)' : 'none' }}
                  >
                    <div>
                      <p className="text-xs font-mono font-semibold" style={{ color: 'var(--soc-text)' }}>{technique.id}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--soc-text-muted)' }}>
                        {technique.name.length > 30 ? `${technique.name.slice(0, 30)}...` : technique.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold tabular-nums" style={{ color: SEV[technique.severity].color }}>
                        {technique.detections}
                      </span>
                      <span style={{ color: TREND_COLOR[technique.trend], fontSize: '12px' }}>{TREND_ICON[technique.trend]}</span>
                    </div>
                  </div>
                ))}
            </div>
          </OverviewSection>
        </div>
      </div>

      <OverviewModal
        open={!!selected}
        title={selected?.name ?? ''}
        subtitle={selected ? `${selected.id} · ${selected.tactic}` : ''}
        onClose={() => setSelected(null)}
        maxWidth="max-w-2xl"
        footer={selected ? (
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              className="soc-btn soc-btn-secondary"
              onClick={() => setSelected(null)}
            >
              Close
            </button>
            <button
              type="button"
              className="soc-btn soc-btn-primary"
              onClick={() => setRuleFlowOpen(true)}
            >
              Create Hunt Rule
            </button>
          </div>
        ) : null}
      >
        {selected && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <span className="soc-badge" style={{ backgroundColor: SEV[selected.severity].bg, color: SEV[selected.severity].color }}>
                {selected.severity.toUpperCase()}
              </span>
              <span
                className="soc-badge"
                style={{ color: TREND_COLOR[selected.trend], border: `1px solid ${TREND_COLOR[selected.trend]}44`, background: 'transparent' }}
              >
                {TREND_ICON[selected.trend]} {selected.trend}
              </span>
              <span className="soc-badge">{selected.tactic}</span>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                ['Detections', String(selected.detections)],
                ['Last detected', selected.lastDetected],
                ['Technique ID', selected.id],
                ['Detected date', selected.detectedDate],
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
        open={ruleFlowOpen && !!selected}
        title="Create hunt rule"
        subtitle={selected?.id}
        onClose={() => (ruleBusy ? undefined : setRuleFlowOpen(false))}
        maxWidth="max-w-lg"
        footer={(
          <div className="flex gap-2 sm:justify-end">
            <button type="button" className="soc-btn soc-btn-secondary" disabled={ruleBusy} onClick={() => setRuleFlowOpen(false)}>
              Cancel
            </button>
            <button type="button" className="soc-btn soc-btn-primary" disabled={ruleBusy} onClick={() => void runCreateRule()}>
              {ruleBusy ? 'Creating...' : 'Confirm rule'}
            </button>
          </div>
        )}
      >
        {selected && (
          <p className="text-sm" style={{ color: 'var(--soc-text-secondary)' }}>
            This action will create an active hunt rule for <strong style={{ color: 'var(--soc-text)' }}>{selected.id}</strong> and assign it to the current hunt queue.
          </p>
        )}
      </OverviewModal>

      <OverviewModal
        open={exportOpen}
        title="Export hunt analytics"
        subtitle="THREAT HUNTING"
        onClose={() => setExportOpen(false)}
        maxWidth="max-w-xl"
        footer={(
          <div className="flex gap-2 sm:justify-end">
            <button type="button" className="soc-btn soc-btn-secondary" onClick={() => setExportOpen(false)}>
              Close
            </button>
            <button
              type="button"
              className="soc-btn soc-btn-primary"
              onClick={() => void runExport()}
              disabled={exportState === 'running'}
            >
              {exportState === 'running' ? 'Preparing...' : exportState === 'done' ? 'Export again' : 'Start export'}
            </button>
          </div>
        )}
      >
        <div className="space-y-4">
          <OverviewToggle
            label="Export filtered techniques only"
            checked={exportFilteredOnly}
            onChange={setExportFilteredOnly}
          />
          <div className="rounded-md border p-3 text-xs" style={{ borderColor: 'var(--soc-border)', backgroundColor: 'var(--soc-raised)', color: 'var(--soc-text-secondary)' }}>
            Export scope: {exportFilteredOnly ? `${visible.length} visible techniques` : `${TECHNIQUES.length} full techniques`}
          </div>
          {exportState === 'done' && (
            <OverviewAlert tone="success" title="Analytics export ready" description="Package prepared for handoff to threat hunting reporting workflows." />
          )}
        </div>
      </OverviewModal>

      <OverviewStepModal
        open={huntOpen}
        subtitle="START HUNT SESSION"
        currentStep={huntStep}
        onStepChange={setHuntStep}
        onClose={() => {
          setHuntOpen(false)
          setHuntStep(0)
        }}
        onFinish={finishHuntWizard}
        steps={[
          {
            id: 'scope',
            title: 'Step 1: Scope',
            canProceed: () => huntScope.trim().length > 2,
            validationHint: 'Scope is required.',
            content: (
              <label className="text-xs font-medium" style={{ color: 'var(--soc-text-secondary)' }}>
                Hunt scope
                <input
                  className="soc-input mt-1 w-full text-sm"
                  value={huntScope}
                  onChange={(event) => setHuntScope(event.target.value)}
                  placeholder="All production telemetry"
                />
              </label>
            ),
          },
          {
            id: 'ownership',
            title: 'Step 2: Ownership',
            canProceed: () => huntOwner.trim().length > 1,
            validationHint: 'Owner is required.',
            content: (
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-xs font-medium" style={{ color: 'var(--soc-text-secondary)' }}>
                  Hunt owner
                  <input
                    className="soc-input mt-1 w-full text-sm"
                    value={huntOwner}
                    onChange={(event) => setHuntOwner(event.target.value)}
                    placeholder="SOC L2"
                  />
                </label>
                <label className="text-xs font-medium" style={{ color: 'var(--soc-text-secondary)' }}>
                  Mode
                  <select
                    className="soc-input mt-1 w-full text-sm"
                    value={huntMode}
                    onChange={(event) => setHuntMode(event.target.value as 'manual' | 'continuous')}
                  >
                    <option value="continuous">Continuous</option>
                    <option value="manual">Manual</option>
                  </select>
                </label>
              </div>
            ),
          },
          {
            id: 'review',
            title: 'Step 3: Review',
            content: (
              <div className="space-y-3 rounded-md border p-4" style={{ borderColor: 'var(--soc-border)', backgroundColor: 'var(--soc-raised)' }}>
                {[
                  ['Scope', huntScope],
                  ['Owner', huntOwner],
                  ['Mode', huntMode],
                  ['Started', getTodayIso()],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between border-b pb-2 last:border-b-0 last:pb-0" style={{ borderColor: 'var(--soc-border)' }}>
                    <p className="soc-label">{label}</p>
                    <p className="text-sm font-medium capitalize" style={{ color: 'var(--soc-text)' }}>{value}</p>
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

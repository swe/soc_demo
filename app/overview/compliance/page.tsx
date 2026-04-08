'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePageTitle } from '@/app/page-title-context'
import {
  OverviewAlert,
  OverviewComplianceTile,
  OverviewKpiRow,
  OverviewModal,
  OverviewPageHeader,
  OverviewPageShell,
  OverviewPagination,
  OverviewRowsPerPageMenu,
  OverviewSection,
  OverviewStepModal,
} from '@/components/overview/unified-ui'

interface ComplianceFramework {
  id: string
  name: string
  score: number
  status: 'compliant' | 'partial' | 'non-compliant'
  controls: { total: number; implemented: number; inProgress: number; notImplemented: number }
  lastAudit: string
  nextAudit: string
}

type AuditStatus = 'passed' | 'finding' | 'in-progress' | 'failed'
type ExportFormat = 'csv' | 'json' | 'pdf'
type Flash = { tone: 'success' | 'attention'; title: string; description: string } | null

interface AuditEntry {
  date: string
  framework: string
  type: string
  status: AuditStatus
  auditor: string
}

const FRAMEWORKS: ComplianceFramework[] = [
  { id: 'iso27001', name: 'ISO 27001', score: 98, status: 'compliant', controls: { total: 114, implemented: 112, inProgress: 2, notImplemented: 0 }, lastAudit: '2024-01-15', nextAudit: '2024-07-15' },
  { id: 'soc2', name: 'SOC 2 Type II', score: 95, status: 'compliant', controls: { total: 64, implemented: 61, inProgress: 3, notImplemented: 0 }, lastAudit: '2024-02-01', nextAudit: '2024-08-01' },
  { id: 'gdpr', name: 'GDPR', score: 87, status: 'partial', controls: { total: 99, implemented: 86, inProgress: 10, notImplemented: 3 }, lastAudit: '2023-12-10', nextAudit: '2024-06-10' },
  { id: 'hipaa', name: 'HIPAA', score: 92, status: 'compliant', controls: { total: 45, implemented: 42, inProgress: 2, notImplemented: 1 }, lastAudit: '2024-01-20', nextAudit: '2024-07-20' },
  { id: 'pci-dss', name: 'PCI DSS', score: 88, status: 'partial', controls: { total: 329, implemented: 290, inProgress: 28, notImplemented: 11 }, lastAudit: '2023-11-30', nextAudit: '2024-05-30' },
  { id: 'nist', name: 'NIST CSF', score: 94, status: 'compliant', controls: { total: 108, implemented: 102, inProgress: 5, notImplemented: 1 }, lastAudit: '2024-02-15', nextAudit: '2024-08-15' },
]

const AUDIT_ACTIVITY: AuditEntry[] = [
  { date: '2024-03-28', framework: 'ISO 27001', type: 'Control Review', status: 'passed', auditor: 'External — Deloitte' },
  { date: '2024-03-25', framework: 'SOC 2 Type II', type: 'Evidence Collect', status: 'passed', auditor: 'Internal' },
  { date: '2024-03-22', framework: 'PCI DSS', type: 'Gap Assessment', status: 'finding', auditor: 'External — KPMG' },
  { date: '2024-03-18', framework: 'GDPR', type: 'Data Mapping', status: 'in-progress', auditor: 'Internal' },
  { date: '2024-03-15', framework: 'HIPAA', type: 'Risk Assessment', status: 'passed', auditor: 'External — PwC' },
]

const STATUS_CONFIG: Record<ComplianceFramework['status'], { color: string; bg: string; label: string; tileVariant: 'compliant' | 'partial' | 'atrisk' }> = {
  compliant: { color: 'var(--soc-low)', bg: 'var(--soc-low-bg)', label: 'Compliant', tileVariant: 'compliant' },
  partial: { color: 'var(--soc-medium)', bg: 'var(--soc-medium-bg)', label: 'Partial', tileVariant: 'partial' },
  'non-compliant': { color: 'var(--soc-critical)', bg: 'var(--soc-critical-bg)', label: 'Non-Compliant', tileVariant: 'atrisk' },
}

const AUDIT_STATUS: Record<AuditStatus, { color: string; label: string }> = {
  passed: { color: 'var(--soc-low)', label: 'Passed' },
  finding: { color: 'var(--soc-medium)', label: 'Finding' },
  'in-progress': { color: 'var(--soc-accent)', label: 'In Progress' },
  failed: { color: 'var(--soc-critical)', label: 'Failed' },
}

export default function CompliancePage() {
  const { setPageTitle } = usePageTitle()

  const [query, setQuery] = useState('')
  const [rowsPerPage, setRowsPerPage] = useState(4)
  const [page, setPage] = useState(1)

  const [selectedFramework, setSelectedFramework] = useState<ComplianceFramework | null>(null)
  const [remediationTarget, setRemediationTarget] = useState<ComplianceFramework | null>(null)
  const [remediationOwner, setRemediationOwner] = useState('GRC Team')
  const [remediationDueDate, setRemediationDueDate] = useState('')
  const [remediationBusy, setRemediationBusy] = useState(false)

  const [exportOpen, setExportOpen] = useState(false)
  const [exportFormat, setExportFormat] = useState<ExportFormat>('pdf')
  const [exportFilteredOnly, setExportFilteredOnly] = useState(true)
  const [exportState, setExportState] = useState<'idle' | 'running' | 'done'>('idle')

  const [scheduleOpen, setScheduleOpen] = useState(false)
  const [scheduleStep, setScheduleStep] = useState(0)
  const [scheduleDraft, setScheduleDraft] = useState({
    frameworkId: FRAMEWORKS[0].id,
    owner: 'Security Governance',
    auditType: 'Control Review',
    windowStart: '',
    windowEnd: '',
    notes: '',
  })

  const [flash, setFlash] = useState<Flash>(null)

  useEffect(() => {
    setPageTitle('Compliance')
  }, [setPageTitle])

  const visibleFrameworks = useMemo(() => {
    const q = query.toLowerCase()
    return FRAMEWORKS
      .filter(
        (fw) =>
          !q ||
          fw.name.toLowerCase().includes(q) ||
          fw.id.toLowerCase().includes(q) ||
          STATUS_CONFIG[fw.status].label.toLowerCase().includes(q),
      )
  }, [query])

  const visibleActivity = useMemo(() => {
    const q = query.toLowerCase()
    return AUDIT_ACTIVITY
      .filter(
        (item) =>
          !q ||
          item.framework.toLowerCase().includes(q) ||
          item.auditor.toLowerCase().includes(q) ||
          item.type.toLowerCase().includes(q) ||
          item.status.toLowerCase().includes(q),
      )
  }, [query])

  const totalPages = Math.max(1, Math.ceil(visibleFrameworks.length / rowsPerPage))
  const pagedFrameworks = visibleFrameworks.slice((page - 1) * rowsPerPage, page * rowsPerPage)

  useEffect(() => {
    if (page > totalPages) setPage(1)
  }, [page, totalPages])

  const totals = useMemo(() => {
    const compliantCount = FRAMEWORKS.filter((f) => f.status === 'compliant').length
    const avgScore = Math.round(FRAMEWORKS.reduce((sum, f) => sum + f.score, 0) / FRAMEWORKS.length)
    const totalControls = FRAMEWORKS.reduce((sum, f) => sum + f.controls.total, 0)
    const implementedControls = FRAMEWORKS.reduce((sum, f) => sum + f.controls.implemented, 0)
    const openFindings = AUDIT_ACTIVITY.filter((a) => a.status !== 'passed').length
    return { compliantCount, avgScore, totalControls, implementedControls, openFindings }
  }, [])

  const startExport = async () => {
    setExportState('running')
    await new Promise((resolve) => setTimeout(resolve, 900))
    setExportState('done')
  }

  const completeRemediation = async () => {
    if (!remediationTarget || !remediationOwner.trim() || !remediationDueDate) return
    setRemediationBusy(true)
    await new Promise((resolve) => setTimeout(resolve, 850))
    setRemediationBusy(false)
    setRemediationTarget(null)
    setSelectedFramework(null)
    setFlash({
      tone: 'attention',
      title: `Remediation task created for ${remediationTarget.name}`,
      description: `Owner ${remediationOwner} received the action plan due on ${remediationDueDate}.`,
    })
  }

  const resetSchedule = () => {
    setScheduleOpen(false)
    setScheduleStep(0)
  }

  const finishSchedule = () => {
    const frameworkName = FRAMEWORKS.find((f) => f.id === scheduleDraft.frameworkId)?.name ?? 'Framework'
    setFlash({
      tone: 'success',
      title: `Audit scheduled for ${frameworkName}`,
      description: `${scheduleDraft.auditType} is assigned to ${scheduleDraft.owner}.`,
    })
    resetSchedule()
  }

  return (
    <OverviewPageShell>
      <OverviewPageHeader
        section="GOVERNANCE & COMPLIANCE"
        title="Compliance Overview"
        description="Framework readiness, control completion, and recent audit activity in one place."
        actions={[
          {
            id: 'download',
            label: 'Download Report',
            variant: 'secondary',
            onClick: () => {
              setExportOpen(true)
              setExportState('idle')
            },
          },
          { id: 'schedule', label: 'Schedule Audit', variant: 'primary', onClick: () => setScheduleOpen(true) },
        ]}
      />

      {flash && (
        <div className="mb-4">
          <OverviewAlert tone={flash.tone} title={flash.title} description={flash.description} />
        </div>
      )}

      <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-2">
        <OverviewAlert
          tone={totals.openFindings > 0 ? 'attention' : 'success'}
          title={totals.openFindings > 0 ? `${totals.openFindings} audit findings need follow-up` : 'No open findings in recent activity'}
          description="Use gap-focused mode to isolate frameworks with incomplete control coverage."
        />
        <OverviewAlert
          tone={totals.avgScore >= 90 ? 'info' : 'critical'}
          title={`Average control score: ${totals.avgScore}%`}
          description={`${totals.compliantCount}/${FRAMEWORKS.length} frameworks are fully compliant right now.`}
        />
      </div>

      <OverviewKpiRow
        columns={4}
        items={[
          { label: 'FRAMEWORKS', value: FRAMEWORKS.length, sub: `${totals.compliantCount} compliant` },
          { label: 'AVG SCORE', value: `${totals.avgScore}%`, sub: 'Across all frameworks', tone: totals.avgScore >= 90 ? 'low' : 'medium' },
          { label: 'TOTAL CONTROLS', value: totals.totalControls, sub: 'Tracked controls' },
          { label: 'NEXT AUDIT', value: 'May 30', sub: 'PCI DSS review', tone: 'accent' },
        ]}
      />

      <div className="mb-4">
        <input
          className="soc-input w-full text-sm md:max-w-md"
          placeholder="Search framework, auditor, activity..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setPage(1)
          }}
        />
      </div>

      <OverviewSection
        title="COMPLIANCE FRAMEWORKS"
        right={
          <OverviewRowsPerPageMenu
            value={rowsPerPage}
            options={[4, 6]}
            onChange={(next) => {
              setRowsPerPage(next)
              setPage(1)
            }}
          />
        }
      >
        {pagedFrameworks.length === 0 ? (
          <div className="px-4 py-6 text-sm" style={{ color: 'var(--soc-text-muted)' }}>
            No frameworks match the current search and filter scope.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 px-3 py-3 lg:grid-cols-2">
            {pagedFrameworks.map((fw) => (
              <OverviewComplianceTile
                key={fw.id}
                title={fw.name}
                auditLine={`Last audit: ${fw.lastAudit} · Next: ${fw.nextAudit}`}
                scorePercent={fw.score}
                statusLabel={STATUS_CONFIG[fw.status].label}
                statusVariant={STATUS_CONFIG[fw.status].tileVariant}
                breakdown={{
                  implemented: fw.controls.implemented,
                  inProgress: fw.controls.inProgress,
                  notStarted: fw.controls.notImplemented,
                }}
                footerMeta={`${fw.controls.total} total controls`}
                footerAction={
                  <button type="button" className="soc-link text-xs font-medium" onClick={() => setSelectedFramework(fw)}>
                    View framework →
                  </button>
                }
              />
            ))}
          </div>
        )}
        <OverviewPagination page={page} totalPages={totalPages} totalItems={visibleFrameworks.length} onPageChange={setPage} />
      </OverviewSection>

      <div className="mt-4">
        <OverviewSection title="RECENT AUDIT ACTIVITY" right={<span className="text-xs" style={{ color: 'var(--soc-text-muted)' }}>Filtered scope</span>} flush>
          <table className="soc-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Framework</th>
                <th>Activity</th>
                <th>Auditor</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              {visibleActivity.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-sm" style={{ color: 'var(--soc-text-muted)' }}>
                    No audit activity matches current controls.
                  </td>
                </tr>
              ) : (
                visibleActivity.map((item, idx) => (
                  <tr key={`${item.framework}-${item.date}-${idx}`}>
                    <td>
                      <span className="text-xs font-mono" style={{ color: 'var(--soc-text-muted)' }}>
                        {item.date}
                      </span>
                    </td>
                    <td>
                      <span className="text-sm" style={{ color: 'var(--soc-text)' }}>
                        {item.framework}
                      </span>
                    </td>
                    <td>
                      <span className="text-sm" style={{ color: 'var(--soc-text-secondary)' }}>
                        {item.type}
                      </span>
                    </td>
                    <td>
                      <span className="text-xs" style={{ color: 'var(--soc-text-muted)' }}>
                        {item.auditor}
                      </span>
                    </td>
                    <td>
                      <span
                        className="soc-badge"
                        style={{ color: AUDIT_STATUS[item.status].color, border: `1px solid ${AUDIT_STATUS[item.status].color}44`, background: 'transparent' }}
                      >
                        {AUDIT_STATUS[item.status].label}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </OverviewSection>
      </div>

      <OverviewModal
        open={!!selectedFramework}
        title={selectedFramework?.name ?? ''}
        subtitle="FRAMEWORK DETAILS"
        onClose={() => setSelectedFramework(null)}
        maxWidth="max-w-3xl"
        footer={
          selectedFramework ? (
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button type="button" className="soc-btn soc-btn-secondary" onClick={() => setSelectedFramework(null)}>
                Close
              </button>
              <button
                type="button"
                className="soc-btn soc-btn-primary"
                onClick={() => {
                  setRemediationTarget(selectedFramework)
                  setRemediationDueDate(selectedFramework.nextAudit)
                }}
              >
                Create remediation task
              </button>
            </div>
          ) : null
        }
      >
        {selectedFramework && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <span className="soc-badge" style={{ backgroundColor: STATUS_CONFIG[selectedFramework.status].bg, color: STATUS_CONFIG[selectedFramework.status].color }}>
                {STATUS_CONFIG[selectedFramework.status].label}
              </span>
              <span className="soc-badge">Score {selectedFramework.score}%</span>
              <span className="soc-badge">{selectedFramework.controls.total} controls</span>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                ['Last audit', selectedFramework.lastAudit],
                ['Next audit', selectedFramework.nextAudit],
                ['Implemented', `${selectedFramework.controls.implemented}`],
                ['In progress', `${selectedFramework.controls.inProgress}`],
              ].map(([label, value]) => (
                <div key={label} className="rounded-md border p-3" style={{ borderColor: 'var(--soc-border)', backgroundColor: 'var(--soc-raised)' }}>
                  <p className="soc-label mb-1">{label}</p>
                  <p className="text-sm font-medium" style={{ color: 'var(--soc-text)' }}>
                    {value}
                  </p>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <p className="soc-label">Controls breakdown</p>
              {[
                { label: 'Implemented', value: selectedFramework.controls.implemented, color: 'var(--soc-low)' },
                { label: 'In Progress', value: selectedFramework.controls.inProgress, color: 'var(--soc-medium)' },
                { label: 'Not Started', value: selectedFramework.controls.notImplemented, color: 'var(--soc-critical)' },
              ].map(({ label, value, color }) => (
                <div key={label}>
                  <div className="mb-1 flex items-center justify-between text-xs" style={{ color: 'var(--soc-text-secondary)' }}>
                    <span>{label}</span>
                    <span className="font-semibold" style={{ color }}>
                      {value} / {selectedFramework.controls.total}
                    </span>
                  </div>
                  <div className="soc-progress-track">
                    <div className="soc-progress-fill" style={{ width: `${Math.round((value / selectedFramework.controls.total) * 100)}%`, backgroundColor: color }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-md border p-3 text-xs" style={{ borderColor: 'var(--soc-border)', backgroundColor: 'var(--soc-raised)', color: 'var(--soc-text-secondary)' }}>
              Recent activities: {(AUDIT_ACTIVITY.filter((a) => a.framework === selectedFramework.name).length || 0).toString()} entries in current sample.
            </div>
          </div>
        )}
      </OverviewModal>

      <OverviewModal
        open={!!remediationTarget}
        title="Create remediation task"
        subtitle={remediationTarget?.name}
        onClose={() => (remediationBusy ? undefined : setRemediationTarget(null))}
        maxWidth="max-w-xl"
        footer={
          <div className="flex gap-2 sm:justify-end">
            <button type="button" className="soc-btn soc-btn-secondary" disabled={remediationBusy} onClick={() => setRemediationTarget(null)}>
              Cancel
            </button>
            <button
              type="button"
              className="soc-btn soc-btn-primary"
              disabled={remediationBusy || !remediationOwner.trim() || !remediationDueDate}
              onClick={() => void completeRemediation()}
            >
              {remediationBusy ? 'Creating...' : 'Create task'}
            </button>
          </div>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-xs font-medium" style={{ color: 'var(--soc-text-secondary)' }}>
            Owner
            <input className="soc-input mt-1 w-full text-sm" value={remediationOwner} onChange={(e) => setRemediationOwner(e.target.value)} />
          </label>
          <label className="text-xs font-medium" style={{ color: 'var(--soc-text-secondary)' }}>
            Due date
            <input type="date" className="soc-input mt-1 w-full text-sm" value={remediationDueDate} onChange={(e) => setRemediationDueDate(e.target.value)} />
          </label>
        </div>
      </OverviewModal>

      <OverviewModal
        open={exportOpen}
        title="Download compliance report"
        subtitle="EXPORT PACKAGE"
        onClose={() => setExportOpen(false)}
        maxWidth="max-w-xl"
        footer={
          <div className="flex gap-2 sm:justify-end">
            <button type="button" className="soc-btn soc-btn-secondary" onClick={() => setExportOpen(false)}>
              Close
            </button>
            <button type="button" className="soc-btn soc-btn-primary" disabled={exportState === 'running'} onClick={() => void startExport()}>
              {exportState === 'running' ? 'Preparing...' : exportState === 'done' ? 'Generate again' : 'Generate file'}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <p className="soc-label mb-2">Format</p>
            <div className="flex flex-wrap gap-2">
              {(['csv', 'json', 'pdf'] as const).map((fmt) => (
                <button key={fmt} type="button" className={`soc-btn text-xs ${exportFormat === fmt ? 'soc-btn-primary' : 'soc-btn-secondary'}`} onClick={() => setExportFormat(fmt)}>
                  {fmt.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="soc-label mb-2">Scope</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className={`soc-btn text-xs ${exportFilteredOnly ? 'soc-btn-primary' : 'soc-btn-secondary'}`}
                onClick={() => setExportFilteredOnly(true)}
              >
                Filtered scope
              </button>
              <button
                type="button"
                className={`soc-btn text-xs ${!exportFilteredOnly ? 'soc-btn-primary' : 'soc-btn-secondary'}`}
                onClick={() => setExportFilteredOnly(false)}
              >
                Full scope
              </button>
            </div>
          </div>
          <div className="rounded-md border p-3 text-xs" style={{ borderColor: 'var(--soc-border)', backgroundColor: 'var(--soc-raised)', color: 'var(--soc-text-secondary)' }}>
            Scope: {exportFilteredOnly ? `${visibleFrameworks.length} frameworks + ${visibleActivity.length} activities` : `${FRAMEWORKS.length} frameworks + ${AUDIT_ACTIVITY.length} activities`}
          </div>
          {exportState === 'done' && (
            <OverviewAlert tone="success" title="Export package ready" description={`Generated ${exportFormat.toUpperCase()} report for ${exportFilteredOnly ? 'filtered' : 'full'} scope.`} />
          )}
        </div>
      </OverviewModal>

      <OverviewStepModal
        open={scheduleOpen}
        subtitle="SCHEDULE AUDIT"
        currentStep={scheduleStep}
        onStepChange={setScheduleStep}
        onClose={resetSchedule}
        onFinish={finishSchedule}
        steps={[
          {
            id: 'scope',
            title: 'Step 1: Scope & owner',
            canProceed: () => scheduleDraft.owner.trim().length > 2,
            validationHint: 'Owner is required.',
            content: (
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-xs font-medium" style={{ color: 'var(--soc-text-secondary)' }}>
                  Framework
                  <select
                    className="soc-input mt-1 w-full text-sm"
                    value={scheduleDraft.frameworkId}
                    onChange={(e) => setScheduleDraft((prev) => ({ ...prev, frameworkId: e.target.value }))}
                  >
                    {FRAMEWORKS.map((fw) => (
                      <option key={fw.id} value={fw.id}>
                        {fw.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-xs font-medium" style={{ color: 'var(--soc-text-secondary)' }}>
                  Owner
                  <input className="soc-input mt-1 w-full text-sm" value={scheduleDraft.owner} onChange={(e) => setScheduleDraft((prev) => ({ ...prev, owner: e.target.value }))} />
                </label>
              </div>
            ),
          },
          {
            id: 'window',
            title: 'Step 2: Audit window',
            canProceed: () => !!scheduleDraft.windowStart && !!scheduleDraft.windowEnd && scheduleDraft.windowStart <= scheduleDraft.windowEnd,
            validationHint: 'Set a valid start and end date.',
            content: (
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-xs font-medium" style={{ color: 'var(--soc-text-secondary)' }}>
                  Audit type
                  <select
                    className="soc-input mt-1 w-full text-sm"
                    value={scheduleDraft.auditType}
                    onChange={(e) => setScheduleDraft((prev) => ({ ...prev, auditType: e.target.value }))}
                  >
                    <option>Control Review</option>
                    <option>Evidence Collection</option>
                    <option>Gap Assessment</option>
                    <option>Risk Assessment</option>
                  </select>
                </label>
                <div />
                <label className="text-xs font-medium" style={{ color: 'var(--soc-text-secondary)' }}>
                  Start date
                  <input type="date" className="soc-input mt-1 w-full text-sm" value={scheduleDraft.windowStart} onChange={(e) => setScheduleDraft((prev) => ({ ...prev, windowStart: e.target.value }))} />
                </label>
                <label className="text-xs font-medium" style={{ color: 'var(--soc-text-secondary)' }}>
                  End date
                  <input type="date" className="soc-input mt-1 w-full text-sm" value={scheduleDraft.windowEnd} onChange={(e) => setScheduleDraft((prev) => ({ ...prev, windowEnd: e.target.value }))} />
                </label>
              </div>
            ),
          },
          {
            id: 'review',
            title: 'Step 3: Review & submit',
            content: (
              <div className="space-y-3 rounded-md border p-4" style={{ borderColor: 'var(--soc-border)', backgroundColor: 'var(--soc-raised)' }}>
                {[
                  ['Framework', FRAMEWORKS.find((f) => f.id === scheduleDraft.frameworkId)?.name ?? '—'],
                  ['Owner', scheduleDraft.owner || '—'],
                  ['Audit type', scheduleDraft.auditType || '—'],
                  ['Window', scheduleDraft.windowStart && scheduleDraft.windowEnd ? `${scheduleDraft.windowStart} → ${scheduleDraft.windowEnd}` : '—'],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between border-b pb-2 last:border-b-0 last:pb-0" style={{ borderColor: 'var(--soc-border)' }}>
                    <p className="soc-label">{label}</p>
                    <p className="text-sm font-medium" style={{ color: 'var(--soc-text)' }}>
                      {value}
                    </p>
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

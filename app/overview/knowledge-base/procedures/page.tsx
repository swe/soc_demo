'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePageTitle } from '@/app/page-title-context'
import { formatDate } from '@/lib/utils'
import {
  OverviewAlert,
  OverviewFilterMenu,
  OverviewKpiRow,
  OverviewModal,
  OverviewPageHeader,
  OverviewPageShell,
  OverviewPagination,
  OverviewRowsPerPageMenu,
  OverviewSection,
  OverviewStepModal,
  OverviewToggle,
} from '@/components/overview/unified-ui'

interface Procedure {
  id: string
  title: string
  type: 'incident-response' | 'threat-hunting' | 'vulnerability' | 'compliance'
  priority: 'critical' | 'high' | 'medium' | 'low'
  description: string
  steps: number
  estimatedTime: string
  lastReviewed: string
  owner: string
  related: string[]
}

export default function ProceduresPage() {
  const { setPageTitle } = usePageTitle()
  const [query, setQuery] = useState('')
  const [selectedFilters, setSelectedFilters] = useState<string[]>([
    'type:incident-response',
    'type:threat-hunting',
    'type:vulnerability',
    'type:compliance',
    'priority:critical',
    'priority:high',
    'priority:medium',
    'priority:low',
  ])
  const [criticalOnly, setCriticalOnly] = useState(false)
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [selectedProcedure, setSelectedProcedure] = useState<Procedure | null>(null)
  const [runProcedure, setRunProcedure] = useState<Procedure | null>(null)
  const [runStep, setRunStep] = useState(0)
  const [notifyOnCompletion, setNotifyOnCompletion] = useState(true)
  const [requireApproval, setRequireApproval] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    setPageTitle('Procedures')
  }, [setPageTitle])

  const procedures: Procedure[] = [
    { id: 'PROC-001', title: 'Ransomware Response Procedure', type: 'incident-response', priority: 'critical', description: 'Step-by-step procedure for responding to ransomware incidents', steps: 12, estimatedTime: '2-4 hours', lastReviewed: '2024-02-15', owner: 'Incident Response Team', related: ['PROC-002', 'PROC-005'] },
    { id: 'PROC-002', title: 'Data Breach Response', type: 'incident-response', priority: 'critical', description: 'Procedures for handling data breach incidents and notifications', steps: 15, estimatedTime: '4-8 hours', lastReviewed: '2024-01-20', owner: 'Incident Response Team', related: ['PROC-001', 'PROC-008'] },
    { id: 'PROC-003', title: 'Threat Hunt: Lateral Movement', type: 'threat-hunting', priority: 'high', description: 'Hunting procedure for detecting lateral movement activities', steps: 8, estimatedTime: '1-2 hours', lastReviewed: '2024-02-28', owner: 'Threat Hunting Team', related: ['PROC-004'] },
    { id: 'PROC-004', title: 'Threat Hunt: C2 Communication', type: 'threat-hunting', priority: 'high', description: 'Hunting for command and control communication patterns', steps: 10, estimatedTime: '2-3 hours', lastReviewed: '2024-03-05', owner: 'Threat Hunting Team', related: ['PROC-003'] },
    { id: 'PROC-005', title: 'Critical Vulnerability Patching', type: 'vulnerability', priority: 'critical', description: 'Emergency patching procedure for critical vulnerabilities', steps: 7, estimatedTime: '1-3 hours', lastReviewed: '2024-02-10', owner: 'Vulnerability Management', related: ['PROC-006'] },
    { id: 'PROC-006', title: 'Vulnerability Assessment Workflow', type: 'vulnerability', priority: 'medium', description: 'Standard workflow for conducting vulnerability assessments', steps: 9, estimatedTime: '4-6 hours', lastReviewed: '2024-01-15', owner: 'Vulnerability Management', related: ['PROC-005'] },
    { id: 'PROC-007', title: 'SOC 2 Audit Preparation', type: 'compliance', priority: 'high', description: 'Preparation procedures for SOC 2 Type II audits', steps: 14, estimatedTime: '2-3 days', lastReviewed: '2024-02-01', owner: 'Compliance Team', related: ['PROC-008'] },
    { id: 'PROC-008', title: 'GDPR Incident Reporting', type: 'compliance', priority: 'critical', description: 'Procedures for GDPR-compliant incident reporting', steps: 11, estimatedTime: '4-6 hours', lastReviewed: '2024-03-01', owner: 'Compliance Team', related: ['PROC-002', 'PROC-007'] },
  ]

  const getTypeColor = (type: string) => {
    const map: Record<string, string> = { 'incident-response': 'var(--soc-critical)', 'threat-hunting': 'var(--soc-high)', 'vulnerability': 'var(--soc-medium)', 'compliance': 'var(--soc-accent)' }
    return map[type] || 'var(--soc-text-muted)'
  }
  const getTypeBg = (type: string) => {
    const map: Record<string, string> = { 'incident-response': 'var(--soc-critical-bg)', 'threat-hunting': 'var(--soc-high-bg)', 'vulnerability': 'var(--soc-medium-bg)', 'compliance': 'var(--soc-accent-bg)' }
    return map[type] || 'var(--soc-border)'
  }
  const getPriorityColor = (priority: string) => {
    const map: Record<string, string> = { critical: 'var(--soc-critical)', high: 'var(--soc-high)', medium: 'var(--soc-medium)', low: 'var(--soc-low)' }
    return map[priority] || 'var(--soc-text-muted)'
  }
  const getPriorityBg = (priority: string) => {
    const map: Record<string, string> = { critical: 'var(--soc-critical-bg)', high: 'var(--soc-high-bg)', medium: 'var(--soc-medium-bg)', low: 'var(--soc-low-bg)' }
    return map[priority] || 'var(--soc-border)'
  }

  const filterOptions = [
    { id: 'type:incident-response', label: 'Incident Response', section: 'Type' },
    { id: 'type:threat-hunting', label: 'Threat Hunting', section: 'Type' },
    { id: 'type:vulnerability', label: 'Vulnerability', section: 'Type' },
    { id: 'type:compliance', label: 'Compliance', section: 'Type' },
    { id: 'priority:critical', label: 'Critical', section: 'Priority' },
    { id: 'priority:high', label: 'High', section: 'Priority' },
    { id: 'priority:medium', label: 'Medium', section: 'Priority' },
    { id: 'priority:low', label: 'Low', section: 'Priority' },
  ]

  const visible = useMemo(() => {
    const typeSet = new Set(selectedFilters.filter((id) => id.startsWith('type:')).map((id) => id.replace('type:', '')))
    const prioritySet = new Set(selectedFilters.filter((id) => id.startsWith('priority:')).map((id) => id.replace('priority:', '')))
    const q = query.trim().toLowerCase()
    return procedures
      .filter((proc) => typeSet.has(proc.type))
      .filter((proc) => prioritySet.has(proc.priority))
      .filter((proc) => !criticalOnly || proc.priority === 'critical')
      .filter((proc) => {
        if (!q) return true
        return (
          proc.id.toLowerCase().includes(q) ||
          proc.title.toLowerCase().includes(q) ||
          proc.description.toLowerCase().includes(q) ||
          proc.owner.toLowerCase().includes(q)
        )
      })
  }, [criticalOnly, procedures, query, selectedFilters])

  const totalPages = Math.max(1, Math.ceil(visible.length / rowsPerPage))
  const pagedRows = visible.slice((page - 1) * rowsPerPage, page * rowsPerPage)

  useEffect(() => {
    if (page > totalPages) setPage(1)
  }, [page, totalPages])

  const stats = {
    total: procedures.length,
    critical: procedures.filter(p => p.priority === 'critical').length,
    incident: procedures.filter(p => p.type === 'incident-response').length,
    avgSteps: Math.round(procedures.reduce((s, p) => s + p.steps, 0) / procedures.length),
  }

  return (
    <OverviewPageShell>
      {toast ? (
        <div className="mb-4">
          <OverviewAlert tone="success" title={toast} />
        </div>
      ) : null}

      <OverviewPageHeader
        section="KNOWLEDGE BASE"
        title="Security Procedures"
        description="Standard operating procedures for incident response, threat hunting, vulnerability, and compliance workflows."
      />

      <OverviewKpiRow
        items={[
          { label: 'TOTAL PROCEDURES', value: stats.total, sub: 'Across all types' },
          { label: 'CRITICAL PRIORITY', value: stats.critical, sub: 'Require immediate action', tone: 'critical' },
          { label: 'INCIDENT RESPONSE', value: stats.incident, sub: 'IR procedures', tone: 'accent' },
          { label: 'AVG STEPS', value: stats.avgSteps, sub: 'Per procedure' },
        ]}
      />

      <div className="mb-4 flex items-center gap-2 flex-nowrap">
        <input
          className="soc-input h-9 min-h-9 w-72 shrink-0 text-sm"
          placeholder="Search id, title, owner, description..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setPage(1)
          }}
        />
        <div className="ml-auto flex items-center gap-2">
          <OverviewFilterMenu
            options={filterOptions}
            selected={selectedFilters}
            onApply={(next) => {
              setSelectedFilters(next)
              setPage(1)
            }}
          />
          <OverviewToggle
            label="Critical only"
            checked={criticalOnly}
            onChange={(next) => {
              setCriticalOnly(next)
              setPage(1)
            }}
          />
        </div>
      </div>

      <OverviewSection
        title="PROCEDURES"
        flush
        right={(
          <OverviewRowsPerPageMenu
            value={rowsPerPage}
            options={[5, 10]}
            onChange={(next) => {
              setRowsPerPage(next)
              setPage(1)
            }}
          />
        )}
      >
        <div className="overflow-x-auto">
          <table className="soc-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Type</th>
                <th>Priority</th>
                <th>Steps</th>
                <th>Est. Time</th>
                <th>Owner</th>
                <th>Last Reviewed</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pagedRows.map((proc) => (
                <tr key={proc.id}>
                  <td className="font-mono text-xs" style={{ color: 'var(--soc-text-muted)' }}>{proc.id}</td>
                  <td>
                    <button type="button" className="text-left" onClick={() => setSelectedProcedure(proc)}>
                      <p className="text-sm font-semibold" style={{ color: 'var(--soc-text)' }}>{proc.title}</p>
                      <p className="text-xs" style={{ color: 'var(--soc-text-muted)' }}>{proc.description}</p>
                    </button>
                  </td>
                  <td>
                    <span className="soc-badge" style={{ backgroundColor: getTypeBg(proc.type), color: getTypeColor(proc.type) }}>
                      {proc.type.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </span>
                  </td>
                  <td>
                    <span className="soc-badge" style={{ backgroundColor: getPriorityBg(proc.priority), color: getPriorityColor(proc.priority) }}>
                      {proc.priority.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ color: 'var(--soc-text-secondary)' }}>{proc.steps}</td>
                  <td style={{ color: 'var(--soc-text-secondary)' }}>{proc.estimatedTime}</td>
                  <td style={{ color: 'var(--soc-text-secondary)' }}>{proc.owner}</td>
                  <td style={{ color: 'var(--soc-text-muted)' }}>{formatDate(proc.lastReviewed)}</td>
                  <td>
                    <div className="flex items-center justify-end gap-2">
                      <button type="button" className="soc-link text-xs" onClick={() => setSelectedProcedure(proc)}>View</button>
                      <button
                        type="button"
                        className="soc-link text-xs"
                        onClick={() => {
                          setRunProcedure(proc)
                          setRunStep(0)
                          setNotifyOnCompletion(true)
                          setRequireApproval(false)
                        }}
                      >
                        Execute
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <OverviewPagination page={page} totalPages={totalPages} totalItems={visible.length} onPageChange={setPage} />
      </OverviewSection>

      <OverviewModal
        open={!!selectedProcedure}
        title={selectedProcedure?.title || ''}
        subtitle={selectedProcedure?.id}
        onClose={() => setSelectedProcedure(null)}
        maxWidth="max-w-2xl"
        footer={(
          <div className="flex items-center justify-end gap-2">
            <button type="button" className="soc-btn soc-btn-secondary" onClick={() => setSelectedProcedure(null)}>
              Close
            </button>
            <button
              type="button"
              className="soc-btn soc-btn-primary"
              onClick={() => {
                if (!selectedProcedure) return
                setSelectedProcedure(null)
                setRunProcedure(selectedProcedure)
                setRunStep(0)
              }}
            >
              Run Procedure
            </button>
          </div>
        )}
      >
        {selectedProcedure ? (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <span className="soc-badge" style={{ backgroundColor: getTypeBg(selectedProcedure.type), color: getTypeColor(selectedProcedure.type) }}>
                {selectedProcedure.type.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </span>
              <span className="soc-badge" style={{ backgroundColor: getPriorityBg(selectedProcedure.priority), color: getPriorityColor(selectedProcedure.priority) }}>
                {selectedProcedure.priority.toUpperCase()}
              </span>
            </div>
            <p className="text-sm" style={{ color: 'var(--soc-text-secondary)' }}>{selectedProcedure.description}</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Steps', value: String(selectedProcedure.steps) },
                { label: 'Estimated time', value: selectedProcedure.estimatedTime },
                { label: 'Owner', value: selectedProcedure.owner },
                { label: 'Last reviewed', value: formatDate(selectedProcedure.lastReviewed) },
              ].map((item) => (
                <div key={item.label} className="soc-card-raised p-3">
                  <p className="soc-label mb-1">{item.label.toUpperCase()}</p>
                  <p className="text-sm font-semibold" style={{ color: 'var(--soc-text)' }}>{item.value}</p>
                </div>
              ))}
            </div>
            <div>
              <p className="soc-label mb-2">RELATED PROCEDURES</p>
              <div className="flex flex-wrap gap-1">
                {selectedProcedure.related.map((id) => (
                  <span key={id} className="soc-badge">{id}</span>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </OverviewModal>

      <OverviewStepModal
        open={!!runProcedure}
        subtitle="PROCEDURE EXECUTION"
        currentStep={runStep}
        onStepChange={setRunStep}
        onClose={() => {
          setRunProcedure(null)
          setRunStep(0)
        }}
        onFinish={() => {
          if (!runProcedure) return
          setToast(`${runProcedure.id} execution launched and routed to ${runProcedure.owner}.`)
          setRunProcedure(null)
          setRunStep(0)
        }}
        steps={[
          {
            id: 'scope',
            title: 'Step 1: Scope',
            content: (
              <div className="space-y-3">
                <p className="text-sm" style={{ color: 'var(--soc-text-secondary)' }}>
                  Validate the execution scope and target systems before launch.
                </p>
                <div className="soc-card-raised p-3">
                  <p className="soc-label">TARGET</p>
                  <p className="text-sm font-semibold" style={{ color: 'var(--soc-text)' }}>
                    {runProcedure?.title || 'Procedure'}
                  </p>
                </div>
              </div>
            ),
          },
          {
            id: 'controls',
            title: 'Step 2: Controls',
            content: (
              <div className="space-y-3">
                <OverviewToggle
                  label="Notify owner on completion"
                  checked={notifyOnCompletion}
                  onChange={setNotifyOnCompletion}
                />
                <OverviewToggle
                  label="Require manual approval before final step"
                  checked={requireApproval}
                  onChange={setRequireApproval}
                />
              </div>
            ),
          },
          {
            id: 'review',
            title: 'Step 3: Review',
            content: (
              <div className="space-y-3">
                <p className="text-sm" style={{ color: 'var(--soc-text-secondary)' }}>
                  Review execution safeguards and submit run request.
                </p>
                <div className="soc-card-raised p-3 space-y-1">
                  <p className="soc-label">NOTIFY OWNER</p>
                  <p className="text-sm font-semibold" style={{ color: 'var(--soc-text)' }}>{notifyOnCompletion ? 'Enabled' : 'Disabled'}</p>
                  <p className="soc-label pt-2">MANUAL APPROVAL</p>
                  <p className="text-sm font-semibold" style={{ color: 'var(--soc-text)' }}>{requireApproval ? 'Required' : 'Not required'}</p>
                </div>
              </div>
            ),
          },
        ]}
      />
    </OverviewPageShell>
  )
}

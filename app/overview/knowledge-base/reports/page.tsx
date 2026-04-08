'use client'

import { formatDate } from '@/lib/utils'
import { useEffect, useMemo, useState } from 'react'
import { usePageTitle } from '@/app/page-title-context'
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

interface Report {
  id: string
  title: string
  type: 'security' | 'compliance' | 'incident' | 'threat' | 'vulnerability'
  period: string
  generatedAt: string
  generatedBy: string
  status: 'final' | 'draft' | 'review'
  pages: number
  format: 'PDF' | 'Excel' | 'Word'
  recipients: string[]
}

export default function ReportsPage() {
  const { setPageTitle } = usePageTitle()
  const [query, setQuery] = useState('')
  const [selectedFilters, setSelectedFilters] = useState<string[]>([
    'type:security',
    'type:compliance',
    'type:incident',
    'type:threat',
    'type:vulnerability',
    'status:final',
    'status:review',
    'status:draft',
  ])
  const [finalOnly, setFinalOnly] = useState(false)
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [downloadReport, setDownloadReport] = useState<Report | null>(null)
  const [shareEmails, setShareEmails] = useState('')
  const [shareMessage, setShareMessage] = useState('')
  const [reportWizardOpen, setReportWizardOpen] = useState(false)
  const [reportWizardStep, setReportWizardStep] = useState(0)
  const [newReportName, setNewReportName] = useState('')
  const [newReportAudience, setNewReportAudience] = useState('')
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    setPageTitle('Reports')
  }, [setPageTitle])

  const reports: Report[] = [
    { id: 'REP-2024-03-001', title: 'Monthly Security Operations Report', type: 'security', period: 'March 2024', generatedAt: '2024-03-31', generatedBy: 'SOC Manager', status: 'final', pages: 45, format: 'PDF', recipients: ['CISO', 'Security Team', 'Executive Team'] },
    { id: 'REP-2024-Q1-001', title: 'Q1 2024 Compliance Report', type: 'compliance', period: 'Q1 2024', generatedAt: '2024-03-30', generatedBy: 'Compliance Team', status: 'final', pages: 78, format: 'PDF', recipients: ['Board', 'Audit Committee', 'CISO'] },
    { id: 'REP-2024-INC-012', title: 'Ransomware Incident Post-Mortem', type: 'incident', period: 'February 2024', generatedAt: '2024-02-28', generatedBy: 'IR Team', status: 'final', pages: 23, format: 'PDF', recipients: ['CISO', 'IT Management', 'Legal'] },
    { id: 'REP-2024-THR-005', title: 'Threat Intelligence Report', type: 'threat', period: 'March 2024', generatedAt: '2024-03-29', generatedBy: 'Threat Intel Team', status: 'final', pages: 34, format: 'PDF', recipients: ['Security Team', 'CISO', 'Risk Management'] },
    { id: 'REP-2024-VUL-003', title: 'Vulnerability Management Report', type: 'vulnerability', period: 'March 2024', generatedAt: '2024-03-28', generatedBy: 'Vuln Management', status: 'final', pages: 56, format: 'Excel', recipients: ['Security Team', 'IT Operations', 'CISO'] },
    { id: 'REP-2024-04-001', title: 'Weekly Security Summary', type: 'security', period: 'Week 13 2024', generatedAt: '2024-03-30', generatedBy: 'SOC Analyst', status: 'review', pages: 12, format: 'PDF', recipients: ['Security Team', 'SOC Manager'] },
    { id: 'REP-2024-THR-006', title: 'APT Activity Report', type: 'threat', period: 'Q1 2024', generatedAt: '2024-03-27', generatedBy: 'Threat Intel Team', status: 'draft', pages: 67, format: 'PDF', recipients: ['CISO', 'Executive Team'] },
  ]

  const getTypeColor = (type: string) => {
    const map: Record<string, string> = { security: 'var(--soc-accent)', compliance: 'var(--soc-accent)', incident: 'var(--soc-critical)', threat: 'var(--soc-high)', vulnerability: 'var(--soc-medium)' }
    return map[type] || 'var(--soc-text-muted)'
  }
  const getTypeBg = (type: string) => {
    const map: Record<string, string> = { security: 'var(--soc-accent-bg)', compliance: 'var(--soc-accent-bg)', incident: 'var(--soc-critical-bg)', threat: 'var(--soc-high-bg)', vulnerability: 'var(--soc-medium-bg)' }
    return map[type] || 'var(--soc-border)'
  }
  const getStatusColor = (status: string) => {
    const map: Record<string, string> = { final: 'var(--soc-low)', review: 'var(--soc-high)', draft: 'var(--soc-text-muted)' }
    return map[status] || 'var(--soc-text-muted)'
  }
  const getStatusBg = (status: string) => {
    const map: Record<string, string> = { final: 'var(--soc-low-bg)', review: 'var(--soc-high-bg)', draft: 'var(--soc-border)' }
    return map[status] || 'var(--soc-border)'
  }

  const filterOptions = [
    { id: 'type:security', label: 'Security', section: 'Type' },
    { id: 'type:compliance', label: 'Compliance', section: 'Type' },
    { id: 'type:incident', label: 'Incident', section: 'Type' },
    { id: 'type:threat', label: 'Threat', section: 'Type' },
    { id: 'type:vulnerability', label: 'Vulnerability', section: 'Type' },
    { id: 'status:final', label: 'Final', section: 'Status' },
    { id: 'status:review', label: 'Review', section: 'Status' },
    { id: 'status:draft', label: 'Draft', section: 'Status' },
  ]

  const visible = useMemo(() => {
    const typeSet = new Set(selectedFilters.filter((id) => id.startsWith('type:')).map((id) => id.replace('type:', '')))
    const statusSet = new Set(selectedFilters.filter((id) => id.startsWith('status:')).map((id) => id.replace('status:', '')))
    const q = query.trim().toLowerCase()
    return reports
      .filter((report) => typeSet.has(report.type))
      .filter((report) => statusSet.has(report.status))
      .filter((report) => !finalOnly || report.status === 'final')
      .filter((report) => {
        if (!q) return true
        return (
          report.id.toLowerCase().includes(q) ||
          report.title.toLowerCase().includes(q) ||
          report.generatedBy.toLowerCase().includes(q) ||
          report.period.toLowerCase().includes(q)
        )
      })
  }, [finalOnly, query, reports, selectedFilters])

  const totalPages = Math.max(1, Math.ceil(visible.length / rowsPerPage))
  const pagedRows = visible.slice((page - 1) * rowsPerPage, page * rowsPerPage)

  useEffect(() => {
    if (page > totalPages) setPage(1)
  }, [page, totalPages])

  const stats = {
    total: reports.length,
    final: reports.filter(r => r.status === 'final').length,
    thisMonth: reports.filter(r => new Date(r.generatedAt).getMonth() === 2).length,
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
        title="Security Reports"
        description="Access security reports, compliance documents, and incident analyses."
        actions={[
          {
            id: 'generate',
            label: 'Generate Report',
            variant: 'primary',
            onClick: () => {
              setReportWizardOpen(true)
              setReportWizardStep(0)
            },
          },
        ]}
      />

      <OverviewKpiRow
        columns={3}
        items={[
          { label: 'TOTAL REPORTS', value: stats.total, sub: 'In library' },
          { label: 'FINAL', value: stats.final, sub: 'Ready to distribute', tone: 'low' },
          { label: 'THIS MONTH', value: stats.thisMonth, sub: 'Generated in March 2024', tone: 'accent' },
        ]}
      />

      <div className="mb-4 flex items-center gap-2 flex-nowrap">
        <input
          className="soc-input h-9 min-h-9 w-72 shrink-0 text-sm"
          placeholder="Search id, title, period, owner..."
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
            label="Final only"
            checked={finalOnly}
            onChange={(next) => {
              setFinalOnly(next)
              setPage(1)
            }}
          />
        </div>
      </div>

      <OverviewSection
        title="REPORTS"
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
                <th>Period</th>
                <th>Pages</th>
                <th>Format</th>
                <th>Generated By</th>
                <th>Date</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pagedRows.map((report) => (
                <tr key={report.id}>
                  <td className="font-mono text-xs" style={{ color: 'var(--soc-text-muted)' }}>{report.id}</td>
                  <td>
                    <p className="text-sm font-semibold" style={{ color: 'var(--soc-text)' }}>{report.title}</p>
                  </td>
                  <td>
                    <span className="soc-badge" style={{ backgroundColor: getTypeBg(report.type), color: getTypeColor(report.type) }}>
                      {report.type.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ color: 'var(--soc-text-secondary)' }}>{report.period}</td>
                  <td style={{ color: 'var(--soc-text-secondary)' }}>{report.pages}</td>
                  <td style={{ color: 'var(--soc-text-secondary)' }}>{report.format}</td>
                  <td style={{ color: 'var(--soc-text-secondary)' }}>{report.generatedBy}</td>
                  <td style={{ color: 'var(--soc-text-muted)' }}>{formatDate(report.generatedAt)}</td>
                  <td>
                    <span className="soc-badge" style={{ backgroundColor: getStatusBg(report.status), color: getStatusColor(report.status) }}>
                      {report.status.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center justify-end gap-2">
                      <button type="button" className="soc-link text-xs" onClick={() => setDownloadReport(report)}>Download</button>
                      <button
                        type="button"
                        className="soc-link text-xs"
                        onClick={() => {
                          setSelectedReport(report)
                          setShareEmails(report.recipients.join(', '))
                          setShareMessage('')
                        }}
                      >
                        Share
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
        open={!!downloadReport}
        title={downloadReport ? `Download ${downloadReport.title}` : ''}
        subtitle={downloadReport?.id}
        onClose={() => setDownloadReport(null)}
        maxWidth="max-w-xl"
        footer={(
          <div className="flex items-center justify-end gap-2">
            <button type="button" className="soc-btn soc-btn-secondary" onClick={() => setDownloadReport(null)}>
              Cancel
            </button>
            <button
              type="button"
              className="soc-btn soc-btn-primary"
              onClick={() => {
                if (!downloadReport) return
                setToast(`${downloadReport.id} is being prepared for download.`)
                setDownloadReport(null)
              }}
            >
              Download
            </button>
          </div>
        )}
      >
        <p className="text-sm" style={{ color: 'var(--soc-text-secondary)' }}>
          This action will prepare the latest approved version and include metadata for audit tracking.
        </p>
      </OverviewModal>

      <OverviewModal
        open={!!selectedReport}
        title={selectedReport ? `Share ${selectedReport.title}` : ''}
        subtitle={selectedReport?.id}
        onClose={() => setSelectedReport(null)}
        maxWidth="max-w-2xl"
        footer={(
          <div className="flex items-center justify-end gap-2">
            <button type="button" className="soc-btn soc-btn-secondary" onClick={() => setSelectedReport(null)}>
              Cancel
            </button>
            <button
              type="button"
              className="soc-btn soc-btn-primary"
              disabled={shareEmails.trim().length === 0}
              onClick={() => {
                if (!selectedReport) return
                setToast(`${selectedReport.id} shared with selected recipients.`)
                setSelectedReport(null)
                setShareEmails('')
                setShareMessage('')
              }}
            >
              Send Report
            </button>
          </div>
        )}
      >
        <div className="space-y-4">
          <label className="block text-xs font-medium" style={{ color: 'var(--soc-text-secondary)' }}>
            Email addresses
            <textarea
              rows={3}
              className="soc-input mt-1 w-full resize-none"
              value={shareEmails}
              onChange={(e) => setShareEmails(e.target.value)}
              placeholder="email1@company.com, email2@company.com"
            />
          </label>
          <label className="block text-xs font-medium" style={{ color: 'var(--soc-text-secondary)' }}>
            Message (optional)
            <textarea
              rows={3}
              className="soc-input mt-1 w-full resize-none"
              value={shareMessage}
              onChange={(e) => setShareMessage(e.target.value)}
              placeholder="Add message"
            />
          </label>
        </div>
      </OverviewModal>

      <OverviewStepModal
        open={reportWizardOpen}
        subtitle="REPORT GENERATOR"
        currentStep={reportWizardStep}
        onStepChange={setReportWizardStep}
        onClose={() => {
          setReportWizardOpen(false)
          setReportWizardStep(0)
        }}
        onFinish={() => {
          setReportWizardOpen(false)
          setReportWizardStep(0)
          setToast(`Report "${newReportName}" queued for generation.`)
          setNewReportName('')
          setNewReportAudience('')
        }}
        steps={[
          {
            id: 'metadata',
            title: 'Step 1: Metadata',
            canProceed: () => newReportName.trim().length >= 3,
            validationHint: 'Report title must be at least 3 characters.',
            content: (
              <label className="block text-xs font-medium" style={{ color: 'var(--soc-text-secondary)' }}>
                Report title
                <input
                  className="soc-input mt-1 w-full"
                  value={newReportName}
                  onChange={(e) => setNewReportName(e.target.value)}
                  placeholder="Example: Weekly Security Summary"
                />
              </label>
            ),
          },
          {
            id: 'audience',
            title: 'Step 2: Audience',
            canProceed: () => newReportAudience.trim().length >= 3,
            validationHint: 'Audience is required for routing.',
            content: (
              <label className="block text-xs font-medium" style={{ color: 'var(--soc-text-secondary)' }}>
                Audience group
                <input
                  className="soc-input mt-1 w-full"
                  value={newReportAudience}
                  onChange={(e) => setNewReportAudience(e.target.value)}
                  placeholder="Example: Executive Team"
                />
              </label>
            ),
          },
          {
            id: 'review',
            title: 'Step 3: Review',
            content: (
              <div className="soc-card-raised p-3 space-y-1">
                <p className="soc-label">TITLE</p>
                <p className="text-sm font-semibold" style={{ color: 'var(--soc-text)' }}>{newReportName || 'Not set'}</p>
                <p className="soc-label pt-2">AUDIENCE</p>
                <p className="text-sm font-semibold" style={{ color: 'var(--soc-text)' }}>{newReportAudience || 'Not set'}</p>
              </div>
            ),
          },
        ]}
      />
    </OverviewPageShell>
  )
}

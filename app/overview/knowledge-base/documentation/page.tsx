'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePageTitle } from '@/app/page-title-context'
import { formatDate, formatNumber } from '@/lib/utils'
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
  OverviewToggle,
} from '@/components/overview/unified-ui'

interface Document {
  id: string
  title: string
  category: 'security' | 'technical' | 'policy' | 'guide'
  description: string
  version: string
  lastUpdated: string
  author: string
  tags: string[]
  downloads: number
  status: 'published' | 'draft' | 'archived'
}

const DOCUMENTS: Document[] = [
  { id: 'DOC-001', title: 'SOC Operations Manual', category: 'security', description: 'Comprehensive guide for SOC operations including alert handling, escalation procedures, and best practices', version: '2.1', lastUpdated: '2026-03-25', author: 'Security Team', tags: ['Operations', 'Manual', 'SOC'], downloads: 234, status: 'published' },
  { id: 'DOC-002', title: 'Incident Response Playbook', category: 'security', description: 'Step-by-step procedures for responding to various types of security incidents', version: '3.0', lastUpdated: '2026-02-18', author: 'IR Team', tags: ['Incident Response', 'Playbook', 'Security'], downloads: 567, status: 'published' },
  { id: 'DOC-003', title: 'SIEM Configuration Guide', category: 'technical', description: 'Technical documentation for configuring and maintaining the SIEM platform', version: '1.5', lastUpdated: '2026-01-29', author: 'Technical Team', tags: ['SIEM', 'Configuration', 'Technical'], downloads: 189, status: 'published' },
  { id: 'DOC-004', title: 'Security Policies Framework', category: 'policy', description: 'Organization-wide security policies and compliance requirements', version: '4.2', lastUpdated: '2026-03-03', author: 'Compliance Team', tags: ['Policy', 'Compliance', 'Framework'], downloads: 423, status: 'published' },
  { id: 'DOC-005', title: 'Threat Intelligence Integration Guide', category: 'guide', description: 'Guide for integrating threat intelligence feeds into security operations', version: '1.0', lastUpdated: '2026-03-31', author: 'Threat Intel Team', tags: ['Threat Intelligence', 'Integration', 'Guide'], downloads: 156, status: 'published' },
  { id: 'DOC-006', title: 'Cloud Security Best Practices', category: 'guide', description: 'Best practices for securing cloud infrastructure and services', version: '2.0', lastUpdated: '2026-02-09', author: 'Cloud Security Team', tags: ['Cloud', 'Best Practices', 'Security'], downloads: 301, status: 'published' },
  { id: 'DOC-007', title: 'API Security Standards', category: 'technical', description: 'Technical standards and requirements for API security', version: '1.3', lastUpdated: '2026-01-15', author: 'AppSec Team', tags: ['API', 'Security', 'Standards'], downloads: 98, status: 'draft' },
  { id: 'DOC-008', title: 'Data Classification Policy', category: 'policy', description: 'Guidelines for classifying and handling sensitive data', version: '3.1', lastUpdated: '2026-02-24', author: 'Data Governance', tags: ['Data', 'Classification', 'Policy'], downloads: 267, status: 'published' },
]

const FILTER_OPTIONS = [
  { id: 'cat:security', label: 'Security', section: 'Category' },
  { id: 'cat:technical', label: 'Technical', section: 'Category' },
  { id: 'cat:policy', label: 'Policy', section: 'Category' },
  { id: 'cat:guide', label: 'Guide', section: 'Category' },
  { id: 'status:published', label: 'Published', section: 'Status' },
  { id: 'status:draft', label: 'Draft', section: 'Status' },
  { id: 'status:archived', label: 'Archived', section: 'Status' },
] as const

const CATEGORY_STYLE: Record<Document['category'], { bg: string; color: string }> = {
  security: { bg: 'var(--soc-critical-bg)', color: 'var(--soc-critical)' },
  technical: { bg: 'var(--soc-accent-bg)', color: 'var(--soc-accent)' },
  policy: { bg: 'var(--soc-medium-bg)', color: 'var(--soc-medium)' },
  guide: { bg: 'var(--soc-low-bg)', color: 'var(--soc-low)' },
}

const STATUS_STYLE: Record<Document['status'], { bg: string; color: string; label: string }> = {
  published: { bg: 'var(--soc-low-bg)', color: 'var(--soc-low)', label: 'PUBLISHED' },
  draft: { bg: 'var(--soc-high-bg)', color: 'var(--soc-high)', label: 'DRAFT' },
  archived: { bg: 'var(--soc-border)', color: 'var(--soc-text-muted)', label: 'ARCHIVED' },
}

export default function DocumentationPage() {
  const { setPageTitle } = usePageTitle()
  const [query, setQuery] = useState('')
  const [filterIds, setFilterIds] = useState<string[]>(FILTER_OPTIONS.map((option) => option.id))
  const [publishedOnly, setPublishedOnly] = useState(false)
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null)
  const [downloadDoc, setDownloadDoc] = useState<Document | null>(null)
  const [includeAttachments, setIncludeAttachments] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [createStep, setCreateStep] = useState(0)
  const [createTitle, setCreateTitle] = useState('')
  const [createOwner, setCreateOwner] = useState('')
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    setPageTitle('Documentation')
  }, [setPageTitle])

  useEffect(() => {
    const now = new Date()
    const from = new Date()
    from.setDate(now.getDate() - 120)
    setFromDate(from.toISOString().slice(0, 10))
    setToDate(now.toISOString().slice(0, 10))
  }, [])

  const categorySelection = useMemo(
    () => new Set(filterIds.filter((id) => id.startsWith('cat:')).map((id) => id.replace('cat:', ''))),
    [filterIds],
  )
  const statusSelection = useMemo(
    () => new Set(filterIds.filter((id) => id.startsWith('status:')).map((id) => id.replace('status:', ''))),
    [filterIds],
  )

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return DOCUMENTS
      .filter((doc) => categorySelection.has(doc.category))
      .filter((doc) => statusSelection.has(doc.status))
      .filter((doc) => !publishedOnly || doc.status === 'published')
      .filter((doc) => !fromDate || doc.lastUpdated >= fromDate)
      .filter((doc) => !toDate || doc.lastUpdated <= toDate)
      .filter((doc) => {
        if (!q) return true
        return (
          doc.id.toLowerCase().includes(q) ||
          doc.title.toLowerCase().includes(q) ||
          doc.description.toLowerCase().includes(q) ||
          doc.author.toLowerCase().includes(q) ||
          doc.tags.some((tag) => tag.toLowerCase().includes(q))
        )
      })
  }, [categorySelection, statusSelection, publishedOnly, fromDate, toDate, query])

  const totalPages = Math.max(1, Math.ceil(visible.length / rowsPerPage))
  const pagedRows = visible.slice((page - 1) * rowsPerPage, page * rowsPerPage)

  useEffect(() => {
    if (page > totalPages) setPage(1)
  }, [page, totalPages])

  const stats = useMemo(
    () => ({
      total: DOCUMENTS.length,
      published: DOCUMENTS.filter((doc) => doc.status === 'published').length,
      draft: DOCUMENTS.filter((doc) => doc.status === 'draft').length,
      downloads: DOCUMENTS.reduce((sum, doc) => sum + doc.downloads, 0),
    }),
    [],
  )

  return (
    <OverviewPageShell>
      {toast ? (
        <div className="mb-4">
          <OverviewAlert tone="success" title={toast} />
        </div>
      ) : null}

      <OverviewPageHeader
        section="KNOWLEDGE BASE"
        title="Documentation"
        description="Access security documentation, guides, policy assets, and technical references."
        actions={[
          {
            id: 'new-document',
            label: 'New Document',
            variant: 'primary',
            onClick: () => {
              setCreateOpen(true)
              setCreateStep(0)
            },
          },
        ]}
      />

      <OverviewKpiRow
        columns={4}
        items={[
          { label: 'TOTAL DOCUMENTS', value: stats.total, sub: 'In library' },
          { label: 'PUBLISHED', value: stats.published, sub: 'Available to teams', tone: 'low' },
          { label: 'DRAFTS', value: stats.draft, sub: 'Pending publication', tone: 'high' },
          { label: 'TOTAL DOWNLOADS', value: formatNumber(stats.downloads), sub: 'All time', tone: 'accent' },
        ]}
      />

      <div className="mb-4 flex items-center gap-2 flex-nowrap">
        <input
          className="soc-input h-9 min-h-9 w-72 shrink-0 text-sm"
          placeholder="Search id, title, author, tags..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setPage(1)
          }}
        />
        <div className="ml-auto flex items-center gap-2">
          <OverviewFilterMenu
            options={FILTER_OPTIONS.map((item) => ({ ...item }))}
            selected={filterIds}
            onApply={(next) => {
              setFilterIds(next)
              setPage(1)
            }}
          />
          <OverviewDateRangeMenu
            fromDate={fromDate}
            toDate={toDate}
            onApply={(nextFrom, nextTo) => {
              setFromDate(nextFrom)
              setToDate(nextTo)
              setPage(1)
            }}
          />
          <OverviewToggle
            label="Published only"
            checked={publishedOnly}
            onChange={(next) => {
              setPublishedOnly(next)
              setPage(1)
            }}
          />
        </div>
      </div>

      <OverviewSection
        title="DOCUMENTS"
        flush
        right={(
          <OverviewRowsPerPageMenu
            value={rowsPerPage}
            options={[5, 10]}
            onChange={(value) => {
              setRowsPerPage(value)
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
                <th>Category</th>
                <th>Version</th>
                <th>Updated</th>
                <th>Author</th>
                <th>Downloads</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pagedRows.map((doc) => (
                <tr key={doc.id}>
                  <td className="font-mono text-xs" style={{ color: 'var(--soc-text-muted)' }}>{doc.id}</td>
                  <td>
                    <button
                      type="button"
                      className="text-left"
                      onClick={() => setSelectedDoc(doc)}
                    >
                      <p className="text-sm font-semibold" style={{ color: 'var(--soc-text)' }}>{doc.title}</p>
                      <p className="text-xs" style={{ color: 'var(--soc-text-muted)' }}>{doc.description}</p>
                    </button>
                  </td>
                  <td>
                    <span className="soc-badge" style={{ backgroundColor: CATEGORY_STYLE[doc.category].bg, color: CATEGORY_STYLE[doc.category].color }}>
                      {doc.category.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ color: 'var(--soc-text-secondary)' }}>v{doc.version}</td>
                  <td style={{ color: 'var(--soc-text-muted)' }}>{formatDate(doc.lastUpdated)}</td>
                  <td style={{ color: 'var(--soc-text-secondary)' }}>{doc.author}</td>
                  <td style={{ color: 'var(--soc-text-secondary)' }}>{formatNumber(doc.downloads)}</td>
                  <td>
                    <span className="soc-badge" style={{ backgroundColor: STATUS_STYLE[doc.status].bg, color: STATUS_STYLE[doc.status].color }}>
                      {STATUS_STYLE[doc.status].label}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center justify-end gap-2">
                      <button type="button" className="soc-link text-xs" onClick={() => setSelectedDoc(doc)}>View</button>
                      <button
                        type="button"
                        className="soc-link text-xs"
                        onClick={() => {
                          setDownloadDoc(doc)
                          setIncludeAttachments(true)
                        }}
                      >
                        Download
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
        open={!!selectedDoc}
        title={selectedDoc?.title || ''}
        subtitle={selectedDoc?.id}
        onClose={() => setSelectedDoc(null)}
        maxWidth="max-w-3xl"
        footer={(
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              className="soc-btn soc-btn-secondary"
              onClick={() => setSelectedDoc(null)}
            >
              Close
            </button>
            <button
              type="button"
              className="soc-btn soc-btn-primary"
              onClick={() => {
                if (!selectedDoc) return
                setSelectedDoc(null)
                setDownloadDoc(selectedDoc)
              }}
            >
              Download
            </button>
          </div>
        )}
      >
        {selectedDoc ? (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <span className="soc-badge" style={{ backgroundColor: CATEGORY_STYLE[selectedDoc.category].bg, color: CATEGORY_STYLE[selectedDoc.category].color }}>
                {selectedDoc.category.toUpperCase()}
              </span>
              <span className="soc-badge" style={{ backgroundColor: STATUS_STYLE[selectedDoc.status].bg, color: STATUS_STYLE[selectedDoc.status].color }}>
                {STATUS_STYLE[selectedDoc.status].label}
              </span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--soc-text-secondary)' }}>
              {selectedDoc.description}
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Version', value: `v${selectedDoc.version}` },
                { label: 'Author', value: selectedDoc.author },
                { label: 'Last updated', value: formatDate(selectedDoc.lastUpdated) },
                { label: 'Downloads', value: formatNumber(selectedDoc.downloads) },
              ].map((item) => (
                <div key={item.label} className="soc-card-raised p-3">
                  <p className="soc-label mb-1">{item.label.toUpperCase()}</p>
                  <p className="text-sm font-semibold" style={{ color: 'var(--soc-text)' }}>{item.value}</p>
                </div>
              ))}
            </div>
            <div>
              <p className="soc-label mb-2">TAGS</p>
              <div className="flex flex-wrap gap-1">
                {selectedDoc.tags.map((tag) => (
                  <span key={tag} className="soc-badge">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </OverviewModal>

      <OverviewModal
        open={!!downloadDoc}
        title={downloadDoc ? `Download ${downloadDoc.title}` : ''}
        subtitle={downloadDoc?.id}
        onClose={() => setDownloadDoc(null)}
        maxWidth="max-w-xl"
        footer={(
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              className="soc-btn soc-btn-secondary"
              onClick={() => setDownloadDoc(null)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="soc-btn soc-btn-primary"
              onClick={() => {
                if (!downloadDoc) return
                const note = includeAttachments ? 'with attachment package' : 'without attachment package'
                setToast(`${downloadDoc.id} download started ${note}.`)
                setDownloadDoc(null)
              }}
            >
              Start Download
            </button>
          </div>
        )}
      >
        <div className="space-y-3">
          <p className="text-sm" style={{ color: 'var(--soc-text-secondary)' }}>
            Select the export scope before generating the package.
          </p>
          <OverviewToggle
            label="Include related attachment assets"
            checked={includeAttachments}
            onChange={setIncludeAttachments}
          />
        </div>
      </OverviewModal>

      <OverviewStepModal
        open={createOpen}
        subtitle="NEW DOCUMENT"
        currentStep={createStep}
        onStepChange={setCreateStep}
        onClose={() => {
          setCreateOpen(false)
          setCreateStep(0)
        }}
        onFinish={() => {
          setCreateOpen(false)
          setCreateStep(0)
          setCreateTitle('')
          setCreateOwner('')
          setToast('Draft document flow created and routed for review.')
        }}
        steps={[
          {
            id: 'metadata',
            title: 'Step 1: Metadata',
            canProceed: () => createTitle.trim().length >= 3,
            validationHint: 'Document title must be at least 3 characters.',
            content: (
              <div className="space-y-3">
                <label className="block text-xs font-medium" style={{ color: 'var(--soc-text-secondary)' }}>
                  Document title
                  <input
                    className="soc-input mt-1 w-full"
                    value={createTitle}
                    onChange={(e) => setCreateTitle(e.target.value)}
                    placeholder="Example: Endpoint hardening baseline"
                  />
                </label>
              </div>
            ),
          },
          {
            id: 'ownership',
            title: 'Step 2: Ownership',
            canProceed: () => createOwner.trim().length >= 3,
            validationHint: 'Owner is required to route review tasks.',
            content: (
              <div className="space-y-3">
                <label className="block text-xs font-medium" style={{ color: 'var(--soc-text-secondary)' }}>
                  Document owner
                  <input
                    className="soc-input mt-1 w-full"
                    value={createOwner}
                    onChange={(e) => setCreateOwner(e.target.value)}
                    placeholder="Example: Security Architecture Team"
                  />
                </label>
              </div>
            ),
          },
          {
            id: 'review',
            title: 'Step 3: Review',
            content: (
              <div className="space-y-3">
                <p className="text-sm" style={{ color: 'var(--soc-text-secondary)' }}>
                  Confirm draft creation and workflow routing.
                </p>
                <div className="soc-card-raised p-3 space-y-1">
                  <p className="soc-label">TITLE</p>
                  <p className="text-sm font-semibold" style={{ color: 'var(--soc-text)' }}>{createTitle || 'Not set'}</p>
                  <p className="soc-label pt-2">OWNER</p>
                  <p className="text-sm font-semibold" style={{ color: 'var(--soc-text)' }}>{createOwner || 'Not set'}</p>
                </div>
              </div>
            ),
          },
        ]}
      />
    </OverviewPageShell>
  )
}

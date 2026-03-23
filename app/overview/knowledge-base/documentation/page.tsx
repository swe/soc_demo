'use client'

import { formatDate } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { usePageTitle } from '@/app/page-title-context'

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

export default function DocumentationPage() {
  const { setPageTitle } = usePageTitle()
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null)

  useEffect(() => {
    setPageTitle('Documentation')
  }, [setPageTitle])

  const documents: Document[] = [
    { id: 'DOC-001', title: 'SOC Operations Manual', category: 'security', description: 'Comprehensive guide for SOC operations including alert handling, escalation procedures, and best practices', version: '2.1', lastUpdated: '2024-03-01', author: 'Security Team', tags: ['Operations', 'Manual', 'SOC'], downloads: 234, status: 'published' },
    { id: 'DOC-002', title: 'Incident Response Playbook', category: 'security', description: 'Step-by-step procedures for responding to various types of security incidents', version: '3.0', lastUpdated: '2024-02-15', author: 'IR Team', tags: ['Incident Response', 'Playbook', 'Security'], downloads: 567, status: 'published' },
    { id: 'DOC-003', title: 'SIEM Configuration Guide', category: 'technical', description: 'Technical documentation for configuring and maintaining the SIEM platform', version: '1.5', lastUpdated: '2024-01-20', author: 'Technical Team', tags: ['SIEM', 'Configuration', 'Technical'], downloads: 189, status: 'published' },
    { id: 'DOC-004', title: 'Security Policies Framework', category: 'policy', description: 'Organization-wide security policies and compliance requirements', version: '4.2', lastUpdated: '2024-02-28', author: 'Compliance Team', tags: ['Policy', 'Compliance', 'Framework'], downloads: 423, status: 'published' },
    { id: 'DOC-005', title: 'Threat Intelligence Integration Guide', category: 'guide', description: 'Guide for integrating threat intelligence feeds into security operations', version: '1.0', lastUpdated: '2024-03-10', author: 'Threat Intel Team', tags: ['Threat Intelligence', 'Integration', 'Guide'], downloads: 156, status: 'published' },
    { id: 'DOC-006', title: 'Cloud Security Best Practices', category: 'guide', description: 'Best practices for securing cloud infrastructure and services', version: '2.0', lastUpdated: '2024-02-05', author: 'Cloud Security Team', tags: ['Cloud', 'Best Practices', 'Security'], downloads: 301, status: 'published' },
    { id: 'DOC-007', title: 'API Security Standards', category: 'technical', description: 'Technical standards and requirements for API security', version: '1.3', lastUpdated: '2024-01-15', author: 'AppSec Team', tags: ['API', 'Security', 'Standards'], downloads: 98, status: 'draft' },
    { id: 'DOC-008', title: 'Data Classification Policy', category: 'policy', description: 'Guidelines for classifying and handling sensitive data', version: '3.1', lastUpdated: '2024-02-20', author: 'Data Governance', tags: ['Data', 'Classification', 'Policy'], downloads: 267, status: 'published' },
  ]

  const getCategoryColor = (category: string) => {
    const map: Record<string, string> = { security: 'var(--soc-critical)', technical: 'var(--soc-accent)', policy: 'var(--soc-accent)', guide: 'var(--soc-low)' }
    return map[category] || 'var(--soc-text-muted)'
  }
  const getCategoryBg = (category: string) => {
    const map: Record<string, string> = { security: 'var(--soc-critical-bg)', technical: 'var(--soc-accent-bg)', policy: 'var(--soc-accent-bg)', guide: 'var(--soc-low-bg)' }
    return map[category] || 'var(--soc-border)'
  }
  const getStatusColor = (status: string) => {
    const map: Record<string, string> = { published: 'var(--soc-low)', draft: 'var(--soc-high)', archived: 'var(--soc-text-muted)' }
    return map[status] || 'var(--soc-text-muted)'
  }
  const getStatusBg = (status: string) => {
    const map: Record<string, string> = { published: 'var(--soc-low-bg)', draft: 'var(--soc-high-bg)', archived: 'var(--soc-border)' }
    return map[status] || 'var(--soc-border)'
  }

  const filteredDocs = documents.filter(doc => {
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  const stats = {
    total: documents.length,
    published: documents.filter(d => d.status === 'published').length,
    totalDownloads: documents.reduce((sum, d) => sum + d.downloads, 0),
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-6 hig-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="soc-label mb-1">KNOWLEDGE BASE</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--soc-text)', lineHeight: 1.2 }}>Documentation</h1>
          <p style={{ color: 'var(--soc-text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Access security documentation, guides, and technical resources</p>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'TOTAL DOCUMENTS', value: String(stats.total), sub: 'In library' },
          { label: 'PUBLISHED', value: String(stats.published), sub: 'Available to team', accent: true },
          { label: 'TOTAL DOWNLOADS', value: String(stats.totalDownloads), sub: 'All time', accent: true },
        ].map((kpi, i) => (
          <div key={i} className="soc-card" style={{ padding: '1.25rem' }}>
            <div className="soc-label mb-2">{kpi.label}</div>
            <div className="soc-metric-lg" style={kpi.accent ? { color: 'var(--soc-accent)' } : {}}>{kpi.value}</div>
            <div className="soc-metric-sm mt-1">{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Search + Filters */}
      <div style={{ marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <input
          type="text"
          placeholder="Search documentation..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="text-sm px-3 py-1.5 rounded-md"
          style={{ width: '100%', maxWidth: '28rem', backgroundColor: 'var(--soc-raised)', border: '1px solid var(--soc-border-mid)', color: 'var(--soc-text)', outline: 'none' }}
        />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {['all', 'security', 'technical', 'policy', 'guide'].map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`soc-btn ${selectedCategory === category ? 'soc-btn-primary' : 'soc-btn-secondary'}`}
            >
              {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Docs Table */}
      <div className="soc-card" style={{ padding: 0 }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--soc-border)' }}>
          <div className="flex items-center justify-between">
            <span style={{ fontWeight: 600, color: 'var(--soc-text)', fontSize: '0.9375rem' }}>Documents</span>
            <span className="soc-metric-sm">{filteredDocs.length} shown</span>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="soc-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Version</th>
                <th>Updated</th>
                <th>Author</th>
                <th>Downloads</th>
                <th>Status</th>
                <th>Link</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocs.map((doc) => (
                <tr key={doc.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedDoc(doc)}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--soc-text)', fontSize: '0.875rem' }}>{doc.title}</div>
                    <div style={{ color: 'var(--soc-text-muted)', fontSize: '0.75rem', fontFamily: 'monospace' }}>{doc.id}</div>
                  </td>
                  <td>
                    <span className="soc-badge" style={{ backgroundColor: getCategoryBg(doc.category), color: getCategoryColor(doc.category) }}>
                      {doc.category.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ color: 'var(--soc-text-secondary)', fontSize: '0.875rem' }}>v{doc.version}</td>
                  <td style={{ color: 'var(--soc-text-muted)', fontSize: '0.8125rem' }}>{formatDate(doc.lastUpdated)}</td>
                  <td style={{ color: 'var(--soc-text-secondary)', fontSize: '0.875rem' }}>{doc.author}</td>
                  <td style={{ color: 'var(--soc-text-secondary)', fontSize: '0.875rem' }}>{doc.downloads}</td>
                  <td>
                    <span className="soc-badge" style={{ backgroundColor: getStatusBg(doc.status), color: getStatusColor(doc.status) }}>
                      {doc.status.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <button className="soc-link" style={{ fontSize: '0.8125rem' }} onClick={(e) => { e.stopPropagation(); setSelectedDoc(doc) }}>View →</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Document Detail Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} onClick={() => setSelectedDoc(null)}>
          <div className="w-full max-w-lg rounded-xl overflow-hidden flex flex-col" style={{ backgroundColor: 'var(--soc-surface)', border: '1px solid var(--soc-border-mid)', maxHeight: '90vh' }} onClick={(e) => e.stopPropagation()}>
            <div className="px-5 py-4 border-b flex items-start justify-between flex-shrink-0" style={{ borderColor: 'var(--soc-border)' }}>
              <div>
                <p className="soc-label mb-1 font-mono">{selectedDoc.id}</p>
                <h2 className="text-base font-bold" style={{ color: 'var(--soc-text)' }}>{selectedDoc.title}</h2>
              </div>
              <button onClick={() => setSelectedDoc(null)} className="text-sm w-7 h-7 flex items-center justify-center rounded flex-shrink-0" style={{ color: 'var(--soc-text-muted)', backgroundColor: 'var(--soc-raised)' }}>✕</button>
            </div>
            <div className="px-5 py-4 overflow-y-auto space-y-4">
              <div className="flex gap-2">
                <span className="soc-badge" style={{ backgroundColor: getCategoryBg(selectedDoc.category), color: getCategoryColor(selectedDoc.category) }}>{selectedDoc.category.toUpperCase()}</span>
                <span className="soc-badge" style={{ backgroundColor: getStatusBg(selectedDoc.status), color: getStatusColor(selectedDoc.status) }}>{selectedDoc.status.toUpperCase()}</span>
              </div>
              <p className="text-sm" style={{ color: 'var(--soc-text-secondary)' }}>{selectedDoc.description}</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'VERSION',      value: `v${selectedDoc.version}` },
                  { label: 'DOWNLOADS',    value: String(selectedDoc.downloads) },
                  { label: 'AUTHOR',       value: selectedDoc.author },
                  { label: 'LAST UPDATED', value: formatDate(selectedDoc.lastUpdated) },
                ].map(({ label, value }) => (
                  <div key={label} className="p-3 rounded" style={{ backgroundColor: 'var(--soc-raised)' }}>
                    <p className="soc-label mb-1">{label}</p>
                    <p className="text-sm font-medium" style={{ color: 'var(--soc-text)' }}>{value}</p>
                  </div>
                ))}
              </div>
              <div>
                <p className="soc-label mb-2">TAGS</p>
                <div className="flex flex-wrap gap-1">
                  {selectedDoc.tags.map((tag, idx) => (
                    <span key={idx} className="soc-badge">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-5 py-4 flex gap-3 border-t flex-shrink-0" style={{ borderColor: 'var(--soc-border)' }}>
              <button className="soc-btn soc-btn-primary flex-1">Download PDF</button>
              <button onClick={() => setSelectedDoc(null)} className="soc-btn soc-btn-secondary flex-1">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

'use client'
import { formatDate, formatDateTime } from '@/lib/utils'
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
    {
      id: 'DOC-001',
      title: 'SOC Operations Manual',
      category: 'security',
      description: 'Comprehensive guide for SOC operations including alert handling, escalation procedures, and best practices',
      version: '2.1',
      lastUpdated: '2024-03-01',
      author: 'Security Team',
      tags: ['Operations', 'Manual', 'SOC'],
      downloads: 234,
      status: 'published'
    },
    {
      id: 'DOC-002',
      title: 'Incident Response Playbook',
      category: 'security',
      description: 'Step-by-step procedures for responding to various types of security incidents',
      version: '3.0',
      lastUpdated: '2024-02-15',
      author: 'IR Team',
      tags: ['Incident Response', 'Playbook', 'Security'],
      downloads: 567,
      status: 'published'
    },
    {
      id: 'DOC-003',
      title: 'SIEM Configuration Guide',
      category: 'technical',
      description: 'Technical documentation for configuring and maintaining the SIEM platform',
      version: '1.5',
      lastUpdated: '2024-01-20',
      author: 'Technical Team',
      tags: ['SIEM', 'Configuration', 'Technical'],
      downloads: 189,
      status: 'published'
    },
    {
      id: 'DOC-004',
      title: 'Security Policies Framework',
      category: 'policy',
      description: 'Organization-wide security policies and compliance requirements',
      version: '4.2',
      lastUpdated: '2024-02-28',
      author: 'Compliance Team',
      tags: ['Policy', 'Compliance', 'Framework'],
      downloads: 423,
      status: 'published'
    },
    {
      id: 'DOC-005',
      title: 'Threat Intelligence Integration Guide',
      category: 'guide',
      description: 'Guide for integrating threat intelligence feeds into security operations',
      version: '1.0',
      lastUpdated: '2024-03-10',
      author: 'Threat Intel Team',
      tags: ['Threat Intelligence', 'Integration', 'Guide'],
      downloads: 156,
      status: 'published'
    },
    {
      id: 'DOC-006',
      title: 'Cloud Security Best Practices',
      category: 'guide',
      description: 'Best practices for securing cloud infrastructure and services',
      version: '2.0',
      lastUpdated: '2024-02-05',
      author: 'Cloud Security Team',
      tags: ['Cloud', 'Best Practices', 'Security'],
      downloads: 301,
      status: 'published'
    },
    {
      id: 'DOC-007',
      title: 'API Security Standards',
      category: 'technical',
      description: 'Technical standards and requirements for API security',
      version: '1.3',
      lastUpdated: '2024-01-15',
      author: 'AppSec Team',
      tags: ['API', 'Security', 'Standards'],
      downloads: 98,
      status: 'draft'
    },
    {
      id: 'DOC-008',
      title: 'Data Classification Policy',
      category: 'policy',
      description: 'Guidelines for classifying and handling sensitive data',
      version: '3.1',
      lastUpdated: '2024-02-20',
      author: 'Data Governance',
      tags: ['Data', 'Classification', 'Policy'],
      downloads: 267,
      status: 'published'
    }
  ]

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      security: '#e11d48',
      technical: '#4f46e5',
      policy: '#4f46e5',
      guide: '#059669'
    }
    return colors[category] || '#6b7280'
  }

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      published: '#059669',
      draft: '#ea580c',
      archived: '#6b7280'
    }
    return colors[status] || '#6b7280'
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
    totalDownloads: documents.reduce((sum, d) => sum + d.downloads, 0)
  }

  return (
    <div className="py-4 w-full max-w-7xl mx-auto">
      <div className="mb-6 px-4 hig-fade-in">
        <h1 className="hig-title-large text-gray-900 dark:text-gray-100 mb-2">Documentation</h1>
        <p className="hig-body text-gray-600 dark:text-gray-400">Access security documentation, guides, and technical resources</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-3 px-4">
        <div className="hig-card bg-gray-50 dark:bg-gray-700/30 p-4 text-center">
          <div className="hig-caption text-gray-600 dark:text-gray-400 mb-2">Total Documents</div>
          <div className="hig-metric-value text-4xl text-gray-900 dark:text-gray-100">{stats.total}</div>
        </div>

        <div className="hig-card bg-gray-50 dark:bg-gray-700/30 p-4 text-center">
          <div className="hig-caption text-gray-600 dark:text-gray-400 mb-2">Published</div>
          <div className="hig-metric-value text-4xl text-gray-900 dark:text-gray-100">{stats.published}</div>
        </div>

        <div className="hig-card bg-gray-50 dark:bg-gray-700/30 p-4 text-center">
          <div className="hig-caption text-gray-600 dark:text-gray-400 mb-2">Total Downloads</div>
          <div className="hig-metric-value text-4xl" style={{ color: '#4f46e5', WebkitTextFillColor: '#4f46e5' }}>
            {stats.totalDownloads}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 px-4">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-1">
            <input 
              type="text"
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="hig-input w-full"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {['all', 'security', 'technical', 'policy', 'guide'].map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`hig-button ${
                selectedCategory === category
                  ? 'hig-button-primary'
                  : 'hig-button-secondary'
              }`}
            >
              {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-12 gap-4 px-4">
        {filteredDocs.map((doc) => (
          <div key={doc.id} className="col-span-12 lg:col-span-6">
            <div 
              onClick={() => setSelectedDoc(doc)}
              className="hig-card cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="hig-body font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2" title={doc.title}>
                    {doc.title}
                  </h3>
                  <p className="hig-caption text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{doc.description}</p>
                </div>
                <span 
                  className="hig-badge flex-shrink-0 ml-2"
                  style={{
                    backgroundColor: `${getCategoryColor(doc.category)}20`,
                    color: getCategoryColor(doc.category)
                  }}
                >
                  {doc.category.toUpperCase()}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {doc.tags.map((tag, idx) => (
                  <span key={idx} className="hig-badge bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700/60">
                <div className="flex items-center gap-4 hig-caption text-gray-600 dark:text-gray-400">
                  <span>v{doc.version}</span>
                  <span>•</span>
                  <span>{formatDate(doc.lastUpdated)}</span>
                  <span>•</span>
                  <span>{doc.downloads} downloads</span>
                </div>
                <span 
                  className="hig-badge"
                  style={{
                    backgroundColor: `${getStatusColor(doc.status)}20`,
                    color: getStatusColor(doc.status)
                  }}
                >
                  {doc.status.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Document Detail Panel */}
      {selectedDoc && (
        <>
          <div 
            className="hig-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedDoc(null)}
          >
            <div 
              className="hig-modal p-0 max-w-4xl w-full flex flex-col max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Fixed Header */}
              <div 
                className="sticky top-0 z-10 backdrop-blur-xl backdrop-saturate-150 bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-700/60 p-6 pb-4"
                style={{
                  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                  backdropFilter: 'blur(20px) saturate(180%)'
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h2 className="hig-headline text-gray-900 dark:text-gray-100">Document Details</h2>
                  <button
                    onClick={() => setSelectedDoc(null)}
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto px-6 py-6">
                <div className="space-y-6">
                  <div>
                    <div className="hig-headline text-gray-900 dark:text-gray-100 mb-2">{selectedDoc.title}</div>
                    <div className="hig-caption text-gray-600 dark:text-gray-400 font-mono">{selectedDoc.id}</div>
                  </div>

                  <div className="pb-4 border-b border-gray-200 dark:border-gray-700/60">
                    <div className="hig-headline mb-4">Overview</div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="hig-caption text-gray-600 dark:text-gray-400 mb-2">Category</div>
                        <span 
                          className="hig-badge"
                          style={{
                            backgroundColor: `${getCategoryColor(selectedDoc.category)}20`,
                            color: getCategoryColor(selectedDoc.category)
                          }}
                        >
                          {selectedDoc.category.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="hig-caption text-gray-600 dark:text-gray-400 mb-2">Status</div>
                        <span 
                          className="hig-badge"
                          style={{
                            backgroundColor: `${getStatusColor(selectedDoc.status)}20`,
                            color: getStatusColor(selectedDoc.status)
                          }}
                        >
                          {selectedDoc.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pb-4 border-b border-gray-200 dark:border-gray-700/60">
                    <div className="hig-headline mb-4">Description</div>
                    <div className="hig-body text-gray-700 dark:text-gray-300 leading-relaxed">{selectedDoc.description}</div>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="hig-card bg-gray-50 dark:bg-gray-700/30 p-4 text-center">
                      <div className="hig-caption text-gray-600 dark:text-gray-400 mb-2">Version</div>
                      <div className="hig-metric-value text-3xl text-gray-900 dark:text-gray-100">v{selectedDoc.version}</div>
                    </div>
                    <div className="hig-card bg-gray-50 dark:bg-gray-700/30 p-4 text-center">
                      <div className="hig-caption text-gray-600 dark:text-gray-400 mb-2">Downloads</div>
                      <div className="hig-metric-value text-3xl text-gray-900 dark:text-gray-100">{selectedDoc.downloads}</div>
                    </div>
                    <div>
                      <div className="hig-caption text-gray-600 dark:text-gray-400 mb-2">Author</div>
                      <div className="hig-body font-semibold text-gray-900 dark:text-gray-100">{selectedDoc.author}</div>
                    </div>
                    <div>
                      <div className="hig-caption text-gray-600 dark:text-gray-400 mb-2">Last Updated</div>
                      <div className="hig-body font-semibold text-gray-900 dark:text-gray-100">{formatDate(selectedDoc.lastUpdated)}</div>
                    </div>
                  </div>

                  <div>
                    <div className="hig-headline mb-4">Tags</div>
                    <div className="flex flex-wrap gap-2">
                      {selectedDoc.tags.map((tag, idx) => (
                        <span key={idx} className="hig-badge bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Fixed Footer */}
              <div 
                className="sticky bottom-0 z-10 backdrop-blur-xl backdrop-saturate-150 bg-white/80 dark:bg-gray-900/80 border-t border-gray-200 dark:border-gray-700/60 p-6 pt-4"
                style={{
                  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                  backdropFilter: 'blur(20px) saturate(180%)'
                }}
              >
                <div className="grid grid-cols-2 gap-3">
                  <button className="hig-button hig-button-primary">
                    Download PDF
                  </button>
                  <button className="hig-button hig-button-secondary">
                    View Online
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

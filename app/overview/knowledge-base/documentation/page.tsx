'use client'

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

  const getCategoryColor = (category: string) => {
    const colors = {
      security: 'bg-rose-600 dark:bg-rose-700/20 text-red-700 dark:text-red-400',
      technical: 'bg-indigo-600 dark:bg-indigo-600/20 text-blue-700 dark:text-blue-400',
      policy: 'bg-indigo-500/20 text-purple-700 dark:text-purple-400',
      guide: 'bg-emerald-600 dark:bg-emerald-700/20 text-green-700 dark:text-green-400'
    }
    return colors[category as keyof typeof colors]
  }

  const getStatusColor = (status: string) => {
    const colors = {
      published: 'bg-emerald-600 dark:bg-emerald-700/20 text-green-700 dark:text-green-400',
      draft: 'bg-amber-600 dark:bg-amber-700/20 text-yellow-700 dark:text-yellow-400',
      archived: 'bg-gray-500/20 text-gray-700 dark:text-gray-400'
    }
    return colors[status as keyof typeof colors]
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
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold mb-2">Documentation</h1>
        <p className="text-gray-600  dark:text-gray-400">Access security documentation, guides, and technical resources</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-12 gap-4 mb-6">
        <div className="col-span-12 sm:col-span-4">
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Documents</div>
              <div className="w-10 h-10 bg-indigo-600 dark:bg-indigo-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</div>
          </div>
        </div>

        <div className="col-span-12 sm:col-span-4">
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600 dark:text-gray-400">Published</div>
              <div className="w-10 h-10 bg-emerald-600 dark:bg-emerald-700/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-700 dark:text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-emerald-700 dark:text-emerald-400">{stats.published}</div>
          </div>
        </div>

        <div className="col-span-12 sm:col-span-4">
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Downloads</div>
              <div className="w-10 h-10 bg-indigo-600 dark:bg-indigo-600/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-indigo-700 dark:text-indigo-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-indigo-700 dark:text-indigo-300">{stats.totalDownloads}</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-1">
            <input 
              type="text"
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input w-full bg-white dark:bg-gray-800"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {['all', 'security', 'technical', 'policy', 'guide'].map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedCategory === category
                  ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-sm'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-12 gap-4">
        {filteredDocs.map((doc) => (
          <div key={doc.id} className="col-span-12 lg:col-span-6">
            <div 
              onClick={() => setSelectedDoc(doc)}
              className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">{doc.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{doc.description}</p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(doc.category)}`}>
                  {doc.category.toUpperCase()}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {doc.tags.map((tag, idx) => (
                  <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <span>v{doc.version}</span>
                  <span>•</span>
                  <span>{new Date(doc.lastUpdated).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>{doc.downloads} downloads</span>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
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
            className="fixed inset-0 bg-gray-900/50 z-40"
            onClick={() => setSelectedDoc(null)}
          />
          <div className="fixed inset-y-0 right-0 w-full md:w-2/3 lg:w-1/2 bg-white dark:bg-gray-800 shadow-xl z-50 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Document Details</h2>
                <button
                  onClick={() => setSelectedDoc(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">{selectedDoc.title}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{selectedDoc.id}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Category</div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(selectedDoc.category)}`}>
                    {selectedDoc.category.toUpperCase()}
                  </span>
                </div>

                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Description</div>
                  <div className="text-gray-800 dark:text-gray-100">{selectedDoc.description}</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Version</div>
                    <div className="text-gray-800 dark:text-gray-100">v{selectedDoc.version}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Status</div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedDoc.status)}`}>
                      {selectedDoc.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Author</div>
                  <div className="text-gray-800 dark:text-gray-100">{selectedDoc.author}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Last Updated</div>
                  <div className="text-gray-800 dark:text-gray-100">{new Date(selectedDoc.lastUpdated).toLocaleDateString()}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Downloads</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{selectedDoc.downloads}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Tags</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedDoc.tags.map((tag, idx) => (
                      <span key={idx} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-2 gap-3">
                    <button className="btn bg-indigo-600 dark:bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-700 text-white">
                      Download PDF
                    </button>
                    <button className="btn bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600">
                      View Online
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

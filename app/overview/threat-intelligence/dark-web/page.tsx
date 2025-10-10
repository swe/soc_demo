'use client'

import { useEffect, useState } from 'react'
import { usePageTitle } from '@/app/page-title-context'
import { PageHeader, Card, Badge } from '@/components/ui/card'

interface DarkWebMention {
  id: string
  source: string
  category: 'credentials' | 'data-leak' | 'ransomware' | 'exploit' | 'marketplace' | 'forum'
  severity: 'critical' | 'high' | 'medium' | 'low'
  title: string
  description: string
  discoveredAt: string
  url: string
  indicators: {
    emails?: string[]
    domains?: string[]
    ips?: string[]
    credentials?: number
  }
  status: 'new' | 'investigating' | 'mitigated' | 'false-positive'
}

export default function DarkWebMonitoring() {
  const { setPageTitle } = usePageTitle()
  const [activeTab, setActiveTab] = useState<'all' | 'credentials' | 'data-leak' | 'threats'>('all')
  const [selectedMention, setSelectedMention] = useState<DarkWebMention | null>(null)

  useEffect(() => {
    setPageTitle('Dark Web Monitoring')
  }, [setPageTitle])

  const darkWebMentions: DarkWebMention[] = [
    {
      id: 'DW-2024-001',
      source: 'RaidForums Mirror',
      category: 'data-leak',
      severity: 'critical',
      title: 'Employee Database Leak',
      description: 'Database containing employee credentials and personal information found on dark web marketplace',
      discoveredAt: '15 minutes ago',
      url: 'onion://[redacted]',
      indicators: {
        emails: ['peter.pan@neverlands.art', 'sarah.chen@neverlands.art'],
        credentials: 1247
      },
      status: 'new'
    },
    {
      id: 'DW-2024-002',
      source: 'Breach Forums',
      category: 'credentials',
      severity: 'high',
      title: 'Corporate Credentials for Sale',
      description: 'Verified corporate email credentials being sold for $500 on underground forum',
      discoveredAt: '2 hours ago',
      url: 'onion://[redacted]',
      indicators: {
        emails: ['admin@neverlands.art'],
        credentials: 23
      },
      status: 'investigating'
    },
    {
      id: 'DW-2024-003',
      source: 'XSS Forum',
      category: 'exploit',
      severity: 'critical',
      title: 'Zero-Day Exploit Discussion',
      description: 'Active discussion about exploiting company infrastructure with proof-of-concept code',
      discoveredAt: '4 hours ago',
      url: 'onion://[redacted]',
      indicators: {
        domains: ['portal.company.com', 'api.company.com'],
        ips: ['203.0.113.0']
      },
      status: 'investigating'
    },
    {
      id: 'DW-2024-004',
      source: 'AlphaBay Successor',
      category: 'marketplace',
      severity: 'high',
      title: 'VPN Access for Sale',
      description: 'Compromised VPN credentials for company network being auctioned',
      discoveredAt: '6 hours ago',
      url: 'onion://[redacted]',
      indicators: {
        domains: ['vpn.company.com'],
        credentials: 5
      },
      status: 'mitigated'
    },
    {
      id: 'DW-2024-005',
      source: 'Russian Carder Forum',
      category: 'ransomware',
      severity: 'medium',
      title: 'Ransomware Gang Targeting Sector',
      description: 'Known ransomware group discussing targeting companies in your industry sector',
      discoveredAt: '12 hours ago',
      url: 'onion://[redacted]',
      indicators: {
        domains: ['company.com']
      },
      status: 'investigating'
    },
  ]

  const getSeverityColor = (severity: string) => {
    const colors = {
      critical: 'bg-rose-600 dark:bg-rose-700/20 text-red-700 dark:text-red-400',
      high: 'bg-orange-600 dark:bg-orange-700/20 text-orange-700 dark:text-orange-400',
      medium: 'bg-amber-600 dark:bg-amber-700/20 text-yellow-700 dark:text-yellow-400',
      low: 'bg-indigo-600 dark:bg-indigo-600/20 text-blue-700 dark:text-blue-400'
    }
    return colors[severity as keyof typeof colors]
  }

  const getStatusColor = (status: string) => {
    const colors = {
      new: 'bg-indigo-500/20 text-purple-700 dark:text-purple-400',
      investigating: 'bg-amber-600 dark:bg-amber-700/20 text-yellow-700 dark:text-yellow-400',
      mitigated: 'bg-emerald-600 dark:bg-emerald-700/20 text-green-700 dark:text-green-400',
      'false-positive': 'bg-gray-500/20 text-gray-700 dark:text-gray-400'
    }
    return colors[status as keyof typeof colors]
  }

  const getCategoryIcon = (category: string) => {
    const icons = {
      credentials: '🔑',
      'data-leak': '💾',
      ransomware: '🔒',
      exploit: '⚠️',
      marketplace: '🛒',
      forum: '💬'
    }
    return icons[category as keyof typeof icons] || '🔍'
  }

  const filteredMentions = activeTab === 'all' 
    ? darkWebMentions 
    : darkWebMentions.filter(m => m.category === activeTab || 
        (activeTab === 'threats' && (m.category === 'ransomware' || m.category === 'exploit')))

  const stats = {
    total: darkWebMentions.length,
    critical: darkWebMentions.filter(m => m.severity === 'critical').length,
    new: darkWebMentions.filter(m => m.status === 'new').length,
    mitigated: darkWebMentions.filter(m => m.status === 'mitigated').length
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-7xl mx-auto">
      <PageHeader 
        title="Dark Web Monitoring" 
        description="Track mentions of your organization on the dark web and hidden forums" 
      />

      {/* Sticky Status Bar */}
      <div className="sticky top-16 z-40 before:absolute before:inset-0 before:backdrop-blur-md before:bg-white/90 dark:before:bg-gray-800/90 before:-z-10 border-b border-gray-200 dark:border-gray-700/60 mb-6 -mx-4 sm:-mx-6 lg:-mx-8">
        <div className="px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-6">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🌐</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  1,114 sources monitored
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-rose-600 dark:bg-rose-700 rounded-full animate-pulse"></div>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {darkWebMentions.filter(m => m.severity === 'critical').length} Critical
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {darkWebMentions.filter(m => m.status === 'new').length} New Findings
                </span>
              </div>
              <div className="text-gray-500 dark:text-gray-400">
                Last scan: 2 minutes ago
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'all', label: 'All Mentions' },
              { id: 'credentials', label: 'Credentials' },
              { id: 'data-leak', label: 'Data Leaks' },
              { id: 'threats', label: 'Active Threats' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Mentions List */}
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-8">
          <div className="space-y-4">
            {filteredMentions.map((mention) => (
              <div 
                key={mention.id}
                className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6 hover:shadow-md transition-all group"
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-lg flex items-center justify-center text-2xl flex-shrink-0 ${
                    mention.severity === 'critical' ? 'bg-rose-600 dark:bg-rose-700/10' :
                    mention.severity === 'high' ? 'bg-orange-600 dark:bg-orange-700/10' :
                    'bg-amber-600 dark:bg-amber-700/10'
                  }`}>
                    {getCategoryIcon(mention.category)}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-500 transition-all duration-200">
                            {mention.title}
                          </h3>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(mention.severity)}`}>
                            {mention.severity.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {mention.description}
                        </p>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(mention.status)}`}>
                        {mention.status.replace('-', ' ').toUpperCase()}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/20 text-purple-700 dark:text-purple-400">
                        {mention.category.replace('-', ' ').toUpperCase()}
                      </span>
                    </div>

                    {/* Indicators Preview */}
                    {(mention.indicators.emails || mention.indicators.credentials) && (
                      <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-3">
                        <div className="flex items-center gap-4 text-sm">
                          {mention.indicators.credentials && (
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4 text-rose-700 dark:text-rose-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                              </svg>
                              <span className="text-red-700 dark:text-red-400 font-semibold">
                                {mention.indicators.credentials} credentials exposed
                              </span>
                            </div>
                          )}
                          {mention.indicators.emails && (
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4 text-rose-700 dark:text-rose-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                              </svg>
                              <span className="text-red-700 dark:text-red-400 font-semibold">
                                {mention.indicators.emails.length} emails
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Meta & Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                        <span className="font-mono">{mention.id}</span>
                        <span>•</span>
                        <span>{mention.source}</span>
                        <span>•</span>
                        <span>{mention.discoveredAt}</span>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedMention(mention)
                        }}
                        className="btn-sm bg-indigo-600 dark:bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-700 text-white"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar - Monitoring Sources */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          {/* Monitored Sources */}
          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 shadow-sm rounded-xl p-6 text-white">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span>🌐</span>
              Monitored Sources
            </h2>
            <div className="space-y-2">
              {[
                { name: 'Dark Web Forums', count: 247 },
                { name: 'Marketplaces', count: 89 },
                { name: 'Paste Sites', count: 156 },
                { name: 'Telegram Channels', count: 432 },
                { name: 'IRC Channels', count: 67 },
                { name: 'Code Repositories', count: 123 }
              ].map((source, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                  <span className="text-sm font-medium">{source.name}</span>
                  <span className="text-sm font-bold">{source.count}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-white/20">
              <div className="text-center">
                <div className="text-3xl font-bold">1,114</div>
                <div className="text-sm opacity-90">Total Sources</div>
              </div>
            </div>
          </div>

          {/* Threat Categories */}
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Threat Categories</h2>
            <div className="space-y-3">
              {[
                { name: 'Credentials', count: darkWebMentions.filter(m => m.category === 'credentials').length, color: 'bg-indigo-600 dark:bg-indigo-600', icon: '🔑' },
                { name: 'Data Leaks', count: darkWebMentions.filter(m => m.category === 'data-leak').length, color: 'bg-indigo-500', icon: '💾' },
                { name: 'Exploits', count: darkWebMentions.filter(m => m.category === 'exploit').length, color: 'bg-rose-600 dark:bg-rose-700', icon: '⚠️' },
                { name: 'Ransomware', count: darkWebMentions.filter(m => m.category === 'ransomware').length, color: 'bg-orange-600 dark:bg-orange-700', icon: '🔒' },
                { name: 'Marketplace', count: darkWebMentions.filter(m => m.category === 'marketplace').length, color: 'bg-emerald-600 dark:bg-emerald-700', icon: '🛒' }
              ].map((category, idx) => (
                <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-900/20 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900/30 transition-all duration-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{category.icon}</span>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{category.name}</span>
                    </div>
                    <span className="text-lg font-bold text-gray-900 dark:text-gray-100">{category.count}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className={`${category.color} h-2 rounded-full transition-all duration-200`} style={{ width: `${(category.count / darkWebMentions.length) * 100}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Detail Panel */}
      {selectedMention && (
        <>
          <div 
            className="fixed inset-0 bg-gray-900/50 z-40 transition-opacity"
            onClick={() => setSelectedMention(null)}
          />
          <div className="fixed inset-y-0 right-0 w-full md:w-2/3 lg:w-1/2 bg-white dark:bg-gray-800 shadow-xl z-50 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Mention Details</h2>
                <button
                  onClick={() => setSelectedMention(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Title</div>
                  <div className="text-lg font-semibold text-gray-800 dark:text-gray-100">{selectedMention.title}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Description</div>
                  <div className="text-gray-700 dark:text-gray-300">{selectedMention.description}</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Severity</div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(selectedMention.severity)}`}>
                      {selectedMention.severity.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Status</div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedMention.status)}`}>
                      {selectedMention.status.replace('-', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Source</div>
                  <div className="text-gray-800 dark:text-gray-100">{selectedMention.source}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Discovered</div>
                  <div className="text-gray-800 dark:text-gray-100">{selectedMention.discoveredAt}</div>
                </div>

                {selectedMention.indicators.emails && selectedMention.indicators.emails.length > 0 && (
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Compromised Emails</div>
                    <div className="space-y-1">
                      {selectedMention.indicators.emails.map((email, idx) => (
                        <div key={idx} className="bg-rose-600 dark:bg-rose-700/10 text-red-700 dark:text-red-400 px-3 py-2 rounded text-sm font-mono">
                          {email}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedMention.indicators.domains && selectedMention.indicators.domains.length > 0 && (
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Affected Domains</div>
                    <div className="space-y-1">
                      {selectedMention.indicators.domains.map((domain, idx) => (
                        <div key={idx} className="bg-orange-600 dark:bg-orange-700/10 text-orange-700 dark:text-orange-400 px-3 py-2 rounded text-sm font-mono">
                          {domain}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedMention.indicators.credentials && (
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Exposed Credentials</div>
                    <div className="text-2xl font-bold text-rose-700 dark:text-rose-400">
                      {selectedMention.indicators.credentials} credentials
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex gap-3">
                    <button className="flex-1 btn bg-indigo-600 dark:bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-700 text-white">
                      Mark as Investigating
                    </button>
                    <button className="flex-1 btn bg-emerald-600 dark:bg-emerald-700 hover:bg-green-600 text-white">
                      Mark as Mitigated
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


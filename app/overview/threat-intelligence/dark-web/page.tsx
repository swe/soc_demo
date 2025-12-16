'use client'
import { useEffect, useState } from 'react'
import { usePageTitle } from '@/app/page-title-context'

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

  const getSeverityColor = (severity: string): string => {
    const colors: Record<string, string> = {
      critical: '#FF3B30',  // System red
      high: '#FF9500',      // System orange
      medium: '#FFCC00',    // System yellow
      low: '#007AFF'        // System blue
    }
    return colors[severity] || '#8E8E93'
  }

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      new: '#AF52DE',        // System purple
      investigating: '#FF9500', // System orange
      mitigated: '#34C759',     // System green
      'false-positive': '#8E8E93' // System gray
    }
    return colors[status] || '#8E8E93'
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
    <div className="py-8 w-full max-w-7xl mx-auto">
      <div className="mb-6 px-4 hig-fade-in">
        <h1 className="hig-title-large text-gray-900 dark:text-gray-100 mb-2">Dark Web Monitoring</h1>
        <p className="hig-body text-gray-600 dark:text-gray-400">Track mentions of your organization on the dark web and hidden forums</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 px-4">
        <div className="hig-card bg-gray-50 dark:bg-[#334155]/30 p-4 text-center">
          <div className="hig-caption text-gray-600 dark:text-gray-400 mb-2">Sources Monitored</div>
          <div className="hig-metric-value text-4xl text-gray-900 dark:text-gray-100">1,114</div>
          <div className="hig-caption text-gray-500 dark:text-gray-400 mt-1">Last scan: 2 min ago</div>
        </div>
        <div className="hig-card bg-gray-50 dark:bg-[#334155]/30 p-4 text-center">
          <div className="hig-caption text-gray-600 dark:text-gray-400 mb-2">Total Mentions</div>
          <div className="hig-metric-value text-4xl text-gray-900 dark:text-gray-100">{stats.total}</div>
        </div>
        <div className="hig-card bg-gray-50 dark:bg-[#334155]/30 p-4 text-center">
          <div className="hig-caption text-gray-600 dark:text-gray-400 mb-2">Critical</div>
          <div className="hig-metric-value text-4xl" style={{ color: '#FF3B30', WebkitTextFillColor: '#FF3B30' }}>
            {stats.critical}
          </div>
        </div>
        <div className="hig-card bg-gray-50 dark:bg-[#334155]/30 p-4 text-center">
          <div className="hig-caption text-gray-600 dark:text-gray-400 mb-2">New Findings</div>
          <div className="hig-metric-value text-4xl" style={{ color: '#AF52DE', WebkitTextFillColor: '#AF52DE' }}>
            {stats.new}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 px-4">
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'all', label: 'All Mentions' },
            { id: 'credentials', label: 'Credentials' },
            { id: 'data-leak', label: 'Data Leaks' },
            { id: 'threats', label: 'Active Threats' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`hig-button ${activeTab === tab.id ? 'hig-button-primary' : 'hig-button-secondary'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mentions List */}
      <div className="grid grid-cols-12 gap-4 px-4">
        <div className="col-span-12 lg:col-span-8">
          <div className="hig-card">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700/60">
              <h2 className="hig-headline text-gray-900 dark:text-gray-100">Dark Web Mentions</h2>
              <span className="hig-caption text-gray-600 dark:text-gray-400">{filteredMentions.length} total</span>
            </div>

            <div className="space-y-0">
              {filteredMentions.map((mention, idx) => {
                const severityColor = getSeverityColor(mention.severity)
                const statusColor = getStatusColor(mention.status)
                
                return (
                  <div key={mention.id}>
                    <div 
                      className={`flex items-center gap-4 p-4 cursor-pointer ${
                        idx !== filteredMentions.length - 1 ? 'border-b border-gray-200 dark:border-gray-700/60' : ''
                      } hover:bg-gray-50 dark:hover:bg-[#334155]/20`}
                      onClick={() => setSelectedMention(mention)}
                    >
                      {/* Severity Indicator */}
                      <div 
                        className="w-1 h-12 rounded-full flex-shrink-0"
                        style={{ 
                          backgroundColor: severityColor,
                          boxShadow: `0 0 8px ${severityColor}40`
                        }}
                      />
                      
                      {/* Mention Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="hig-body font-semibold text-gray-900 dark:text-gray-100 mb-1 line-clamp-2" title={mention.title}>
                          {mention.title}
                        </h3>
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <span 
                            className="hig-badge"
                            style={{
                              backgroundColor: `${severityColor}20`,
                              color: severityColor
                            }}
                          >
                            {mention.severity.toUpperCase()}
                          </span>
                          <span 
                            className="hig-badge"
                            style={{
                              backgroundColor: `${statusColor}20`,
                              color: statusColor
                            }}
                          >
                            {mention.status.replace('-', ' ').toUpperCase()}
                          </span>
                          <span 
                            className="hig-badge"
                            style={{
                              backgroundColor: '#AF52DE20',
                              color: '#AF52DE'
                            }}
                          >
                            {mention.category.replace('-', ' ').toUpperCase()}
                          </span>
                        </div>
                        <div className="hig-caption text-gray-600 dark:text-gray-400 mb-2 line-clamp-1">
                          {mention.description}
                        </div>
                        {(mention.indicators.emails || mention.indicators.credentials) && (
                          <div className="hig-caption text-[#FF3B30] font-medium">
                            {mention.indicators.credentials && `${mention.indicators.credentials} credentials exposed`}
                            {mention.indicators.credentials && mention.indicators.emails && ' • '}
                            {mention.indicators.emails && `${mention.indicators.emails.length} emails`}
                          </div>
                        )}
                        <div className="flex items-center gap-2 hig-caption text-gray-500 dark:text-gray-400 mt-2">
                          <span className="font-mono">{mention.id}</span>
                          <span>•</span>
                          <span>{mention.source}</span>
                          <span>•</span>
                          <span>{mention.discoveredAt}</span>
                        </div>
                      </div>
                      
                      {/* View Details Link */}
                      <div className="flex-shrink-0">
                        <span className="hig-caption text-[#AF52DE] hover:text-[#AF52DE] hig-link-hover">
                          View Details →
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Sidebar - Monitoring Sources */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          {/* Monitored Sources */}
          <div className="hig-card bg-gradient-to-br from-[#393A84] to-[#A655F7] p-6 text-white">
            <h2 className="hig-headline text-white mb-4 flex items-center gap-2">
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
                    <span className="hig-body font-medium text-white">{source.name}</span>
                    <span className="hig-body font-semibold text-white">{source.count}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-white/20">
                <div className="text-center">
                  <div className="hig-metric-value text-white" style={{ WebkitTextFillColor: 'white' }}>1,114</div>
                  <div className="hig-caption text-white" style={{ WebkitTextFillColor: 'white' }}>Total Sources</div>
                </div>
              </div>
          </div>

          {/* Threat Categories */}
          <div className="hig-card p-6">
            <h2 className="hig-headline text-gray-900 dark:text-gray-100 mb-4">Threat Categories</h2>
            <div className="space-y-3">
              {[
                { name: 'Credentials', count: darkWebMentions.filter(m => m.category === 'credentials').length, color: 'bg-[#393A84] dark:bg-[#393A84]', icon: '🔑' },
                { name: 'Data Leaks', count: darkWebMentions.filter(m => m.category === 'data-leak').length, color: 'bg-[#393A84] dark:bg-[#393A84]', icon: '💾' },
                { name: 'Exploits', count: darkWebMentions.filter(m => m.category === 'exploit').length, color: 'bg-[#FF3B30] dark:bg-[#FF3B30]', icon: '⚠️' },
                { name: 'Ransomware', count: darkWebMentions.filter(m => m.category === 'ransomware').length, color: 'bg-[#FF9500] dark:bg-[#FF9500]', icon: '🔒' },
                { name: 'Marketplace', count: darkWebMentions.filter(m => m.category === 'marketplace').length, color: 'bg-[#34C759] dark:bg-[#34C759]', icon: '🛒' }
              ].map((category, idx) => (
                <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-900/20 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900/30">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{category.icon}</span>
                      <span className="hig-body font-medium text-gray-700 dark:text-gray-300">{category.name}</span>
                    </div>
                    <span className="hig-body font-semibold text-gray-900 dark:text-gray-100">{category.count}</span>
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

      {/* Detail Modal */}
      {selectedMention && (
        <div className="hig-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="hig-modal p-0 max-w-4xl w-full flex flex-col max-h-[90vh]">
            {/* Fixed Header */}
            <div 
              className="sticky top-0 z-10 backdrop-blur-xl backdrop-saturate-150 bg-white/80 dark:bg-[#1E293B]/80 border-b border-gray-200 dark:border-gray-700/60 p-6 pb-4"
              style={{
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                backdropFilter: 'blur(20px) saturate(180%)'
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="hig-headline text-gray-900 dark:text-gray-100">Mention Details</h2>
                <button
                  onClick={() => setSelectedMention(null)}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                  <span className="sr-only">Close</span>
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  </svg>
                </button>
              </div>
              {/* Severity Indicator Bar */}
              <div 
                className="h-1 rounded-full" 
                style={{ backgroundColor: getSeverityColor(selectedMention.severity) }}
              />
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6">

              <div className="space-y-4 pb-4 border-b border-gray-200 dark:border-gray-700/60 mb-4">
                <div>
                  <div className="hig-caption text-gray-600 dark:text-gray-400 mb-1">Title</div>
                  <div className="hig-headline text-gray-900 dark:text-gray-100">{selectedMention.title}</div>
                </div>

                <div>
                  <div className="hig-caption text-gray-600 dark:text-gray-400 mb-1">Description</div>
                  <div className="hig-body text-gray-700 dark:text-gray-300 leading-relaxed">{selectedMention.description}</div>
                </div>

                <div className="flex items-center gap-3">
                  <div>
                    <div className="hig-caption text-gray-600 dark:text-gray-400 mb-1">Severity</div>
                    <span 
                      className="hig-badge"
                      style={{
                        backgroundColor: `${getSeverityColor(selectedMention.severity)}20`,
                        color: getSeverityColor(selectedMention.severity)
                      }}
                    >
                      {selectedMention.severity.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="hig-caption text-gray-600 dark:text-gray-400 mb-1">Status</div>
                    <span 
                      className="hig-badge"
                      style={{
                        backgroundColor: `${getStatusColor(selectedMention.status)}20`,
                        color: getStatusColor(selectedMention.status)
                      }}
                    >
                      {selectedMention.status.replace('-', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="hig-caption text-gray-600 dark:text-gray-400 mb-1">Category</div>
                    <span 
                      className="hig-badge"
                      style={{
                        backgroundColor: '#AF52DE20',
                        color: '#AF52DE'
                      }}
                    >
                      {selectedMention.category.replace('-', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              <div className="pb-4 border-b border-gray-200 dark:border-gray-700/60 mb-4">
                <h3 className="hig-headline mb-4">Source Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="hig-caption text-gray-600 dark:text-gray-400 mb-1">Source</div>
                    <div className="hig-body text-gray-900 dark:text-gray-100">{selectedMention.source}</div>
                  </div>
                  <div>
                    <div className="hig-caption text-gray-600 dark:text-gray-400 mb-1">Discovered</div>
                    <div className="hig-body text-gray-900 dark:text-gray-100">{selectedMention.discoveredAt}</div>
                  </div>
                  <div>
                    <div className="hig-caption text-gray-600 dark:text-gray-400 mb-1">Mention ID</div>
                    <div className="hig-body font-mono text-gray-900 dark:text-gray-100">{selectedMention.id}</div>
                  </div>
                  <div>
                    <div className="hig-caption text-gray-600 dark:text-gray-400 mb-1">URL</div>
                    <div className="hig-body font-mono text-gray-600 dark:text-gray-400">{selectedMention.url}</div>
                  </div>
                </div>
              </div>

              {selectedMention.indicators.emails && selectedMention.indicators.emails.length > 0 && (
                <div className="pb-4 border-b border-gray-200 dark:border-gray-700/60 mb-4">
                  <h3 className="hig-headline mb-4">Compromised Emails</h3>
                  <div className="space-y-2">
                    {selectedMention.indicators.emails.map((email, idx) => (
                      <div key={idx} className="hig-card bg-[#FF3B30]/10 dark:bg-[#FF3B30]/20 border border-[#FF3B30]/30 p-3">
                        <div className="hig-body font-mono text-[#FF3B30]">{email}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedMention.indicators.credentials && (
                <div className="pb-4 border-b border-gray-200 dark:border-gray-700/60 mb-4">
                  <h3 className="hig-headline mb-4">Exposed Credentials</h3>
                  <div className="hig-card bg-gray-50 dark:bg-[#334155]/30 p-4 text-center">
                    <div className="hig-metric-value text-4xl" style={{ color: '#FF3B30', WebkitTextFillColor: '#FF3B30' }}>
                      {selectedMention.indicators.credentials}
                    </div>
                    <div className="hig-caption text-gray-600 dark:text-gray-400 mt-1">credentials exposed</div>
                  </div>
                  <div className="hig-card bg-[#FF3B30]/10 dark:bg-[#FF3B30]/20 border border-[#FF3B30]/30 p-4 mt-4">
                    <div className="hig-body text-gray-900 dark:text-gray-100">
                      <strong>Action Required:</strong> These credentials should be immediately invalidated and all affected accounts should be forced to reset their passwords. Review authentication logs for any suspicious activity.
                    </div>
                  </div>
                </div>
              )}

              {selectedMention.indicators.domains && selectedMention.indicators.domains.length > 0 && (
                <div className="pb-4 border-b border-gray-200 dark:border-gray-700/60 mb-4">
                  <h3 className="hig-headline mb-4">Affected Domains</h3>
                  <div className="space-y-2">
                    {selectedMention.indicators.domains.map((domain, idx) => (
                      <div key={idx} className="hig-card bg-[#FF9500]/10 dark:bg-[#FF9500]/20 border border-[#FF9500]/30 p-3">
                        <div className="hig-body font-mono text-[#FF9500]">{domain}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedMention.indicators.ips && selectedMention.indicators.ips.length > 0 && (
                <div className="pb-4 border-b border-gray-200 dark:border-gray-700/60 mb-4">
                  <h3 className="hig-headline mb-4">Related IP Addresses</h3>
                  <div className="space-y-2">
                    {selectedMention.indicators.ips.map((ip, idx) => (
                      <div key={idx} className="hig-card bg-gray-50 dark:bg-[#334155]/30 p-3">
                        <div className="hig-body font-mono text-gray-900 dark:text-gray-100">{ip}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Fixed Footer */}
            <div 
              className="sticky bottom-0 z-10 backdrop-blur-xl backdrop-saturate-150 bg-white/80 dark:bg-[#1E293B]/80 border-t border-gray-200 dark:border-gray-700/60 p-6 pt-4"
              style={{
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                backdropFilter: 'blur(20px) saturate(180%)'
              }}
            >
              <div className="flex gap-3">
                <button className="hig-button hig-button-primary flex-1">
                  Mark as Investigating
                </button>
                <button className="hig-button hig-button-secondary flex-1">
                  Mark as Mitigated
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


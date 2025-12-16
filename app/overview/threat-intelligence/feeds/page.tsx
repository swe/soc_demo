'use client'
import { formatDate, formatDateTime } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { usePageTitle } from '@/app/page-title-context'

interface ThreatFeed {
  id: string
  name: string
  provider: string
  type: 'open-source' | 'commercial' | 'internal'
  status: 'active' | 'inactive' | 'error'
  indicators: number
  lastUpdate: string
  updateFrequency: string
  coverage: string[]
  reliability: number
}

export default function ThreatFeeds() {
  const { setPageTitle } = usePageTitle()
  const [selectedFeed, setSelectedFeed] = useState<ThreatFeed | null>(null)
  const [filterType, setFilterType] = useState<string>('all')

  useEffect(() => {
    setPageTitle('Threat Feeds')
  }, [setPageTitle])

  const threatFeeds: ThreatFeed[] = [
    {
      id: 'misp-1',
      name: 'MISP Threat Sharing',
      provider: 'MISP Project',
      type: 'open-source',
      status: 'active',
      indicators: 1247,
      lastUpdate: '2 minutes ago',
      updateFrequency: 'Real-time',
      coverage: ['Malware', 'Network', 'Email'],
      reliability: 95
    },
    {
      id: 'alienvault-1',
      name: 'AlienVault OTX',
      provider: 'AT&T Cybersecurity',
      type: 'open-source',
      status: 'active',
      indicators: 892,
      lastUpdate: '5 minutes ago',
      updateFrequency: 'Every 5 minutes',
      coverage: ['IPs', 'Domains', 'Hashes'],
      reliability: 88
    },
    {
      id: 'abuse-1',
      name: 'Abuse.ch URLhaus',
      provider: 'Abuse.ch',
      type: 'open-source',
      status: 'active',
      indicators: 456,
      lastUpdate: '10 minutes ago',
      updateFrequency: 'Every 15 minutes',
      coverage: ['URLs', 'Malware'],
      reliability: 92
    },
    {
      id: 'virustotal-1',
      name: 'VirusTotal Intelligence',
      provider: 'Google',
      type: 'commercial',
      status: 'active',
      indicators: 2341,
      lastUpdate: '1 minute ago',
      updateFrequency: 'Real-time',
      coverage: ['Hashes', 'Files', 'URLs', 'Domains'],
      reliability: 98
    },
    {
      id: 'crowdstrike-1',
      name: 'CrowdStrike Intel',
      provider: 'CrowdStrike',
      type: 'commercial',
      status: 'active',
      indicators: 1567,
      lastUpdate: '3 minutes ago',
      updateFrequency: 'Every 2 minutes',
      coverage: ['APT', 'Malware', 'Indicators'],
      reliability: 96
    },
    {
      id: 'internal-1',
      name: 'Internal Threat Feed',
      provider: 'Your Organization',
      type: 'internal',
      status: 'active',
      indicators: 234,
      lastUpdate: '30 minutes ago',
      updateFrequency: 'Hourly',
      coverage: ['Custom', 'Internal'],
      reliability: 100
    },
    {
      id: 'emerging-1',
      name: 'Emerging Threats',
      provider: 'Proofpoint',
      type: 'commercial',
      status: 'error',
      indicators: 0,
      lastUpdate: '2 hours ago',
      updateFrequency: 'Every hour',
      coverage: ['Network', 'IDS/IPS'],
      reliability: 0
    }
  ]

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      active: '#34C759',     // System green
      inactive: '#8E8E93',   // System gray
      error: '#FF3B30'       // System red
    }
    return colors[status] || '#8E8E93'
  }

  const getTypeColor = (type: string): string => {
    const colors: Record<string, string> = {
      'open-source': '#007AFF',  // System blue
      'commercial': '#AF52DE',    // System purple
      'internal': '#FF9500'       // System orange
    }
    return colors[type] || '#8E8E93'
  }

  const filteredFeeds = filterType === 'all' 
    ? threatFeeds 
    : threatFeeds.filter(f => f.type === filterType)

  const stats = {
    total: threatFeeds.length,
    active: threatFeeds.filter(f => f.status === 'active').length,
    totalIndicators: threatFeeds.reduce((sum, f) => sum + f.indicators, 0),
    avgReliability: Math.round(threatFeeds.reduce((sum, f) => sum + f.reliability, 0) / threatFeeds.length)
  }

  return (
    <div className="py-8 w-full max-w-7xl mx-auto">
      <div className="mb-6 px-4 hig-fade-in">
        <h1 className="hig-title-large text-gray-900 dark:text-gray-100 mb-2">Threat Intelligence Feeds</h1>
        <p className="hig-body text-gray-600 dark:text-gray-400">Manage and monitor threat intelligence data sources</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 px-4">
        <div className="hig-card bg-gray-50 dark:bg-[#334155]/30 p-4 text-center">
          <div className="hig-caption text-gray-600 dark:text-gray-400 mb-2">Total Feeds</div>
          <div className="hig-metric-value text-4xl text-gray-900 dark:text-gray-100">{stats.total}</div>
        </div>

        <div className="hig-card bg-gray-50 dark:bg-[#334155]/30 p-4 text-center">
          <div className="hig-caption text-gray-600 dark:text-gray-400 mb-2">Active Feeds</div>
          <div className="hig-metric-value text-4xl" style={{ color: '#34C759', WebkitTextFillColor: '#34C759' }}>
            {stats.active}
          </div>
        </div>

        <div className="hig-card bg-gray-50 dark:bg-[#334155]/30 p-4 text-center">
          <div className="hig-caption text-gray-600 dark:text-gray-400 mb-2">Total Indicators</div>
          <div className="hig-metric-value text-4xl" style={{ color: '#007AFF', WebkitTextFillColor: '#007AFF' }}>
            {stats.totalIndicators.toLocaleString()}
          </div>
        </div>

        <div className="hig-card bg-gray-50 dark:bg-[#334155]/30 p-4 text-center">
          <div className="hig-caption text-gray-600 dark:text-gray-400 mb-2">Avg Reliability</div>
          <div className="hig-metric-value text-4xl" style={{ color: '#AF52DE', WebkitTextFillColor: '#AF52DE' }}>
            {stats.avgReliability}%
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 px-4">
        <div className="flex flex-wrap gap-2">
          {['all', 'open-source', 'commercial', 'internal'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`hig-button ${filterType === type ? 'hig-button-primary' : 'hig-button-secondary'}`}
            >
              {type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Threat Feeds List */}
      <div className="px-4">
        <div className="hig-card">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700/60">
            <h2 className="hig-headline text-gray-900 dark:text-gray-100">Threat Intelligence Feeds</h2>
            <span className="hig-caption text-gray-600 dark:text-gray-400">{filteredFeeds.length} total</span>
          </div>

          <div className="space-y-0">
          {filteredFeeds.map((feed, idx) => {
            const statusColor = getStatusColor(feed.status)
            const typeColor = getTypeColor(feed.type)
            
            return (
              <div key={feed.id}>
                <div 
                  className={`flex items-center gap-4 p-4 cursor-pointer ${
                    idx !== filteredFeeds.length - 1 ? 'border-b border-gray-200 dark:border-gray-700/60' : ''
                  } hover:bg-gray-50 dark:hover:bg-[#334155]/20`}
                  onClick={() => setSelectedFeed(feed)}
                >
                  {/* Status Indicator */}
                  <div 
                    className="w-1 h-12 rounded-full flex-shrink-0"
                    style={{ 
                      backgroundColor: statusColor,
                      boxShadow: `0 0 8px ${statusColor}40`
                    }}
                  />
                  
                  {/* Feed Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="hig-body font-semibold text-gray-900 dark:text-gray-100 mb-1 line-clamp-2" title={feed.name}>
                      {feed.name}
                    </h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="hig-caption text-gray-600 dark:text-gray-400">{feed.provider}</span>
                      <span className="hig-caption text-gray-400">•</span>
                      <span 
                        className="hig-badge"
                        style={{
                          backgroundColor: `${typeColor}20`,
                          color: typeColor
                        }}
                      >
                        {feed.type.replace('-', ' ').toUpperCase()}
                      </span>
                      <span 
                        className="hig-badge"
                        style={{
                          backgroundColor: `${statusColor}20`,
                          color: statusColor
                        }}
                      >
                        {feed.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {feed.coverage.map((coverage, i) => (
                        <span 
                          key={i} 
                          className="hig-badge"
                          style={{
                            backgroundColor: 'rgba(142, 142, 147, 0.2)',
                            color: '#8E8E93'
                          }}
                        >
                          {coverage}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {/* Metrics */}
                  <div className="flex items-center gap-6 flex-shrink-0">
                    <div className="text-right">
                      <div className="hig-caption text-gray-600 dark:text-gray-400">Indicators</div>
                      <div className="hig-body text-gray-900 dark:text-gray-100 font-semibold mt-1">
                        {feed.indicators.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="hig-caption text-gray-600 dark:text-gray-400">Reliability</div>
                      <div className="hig-body font-semibold mt-1" style={{ color: feed.reliability >= 90 ? '#34C759' : feed.reliability >= 70 ? '#FF9500' : '#FF3B30', WebkitTextFillColor: feed.reliability >= 90 ? '#34C759' : feed.reliability >= 70 ? '#FF9500' : '#FF3B30' }}>
                        {feed.reliability}%
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="hig-caption text-gray-600 dark:text-gray-400">Last Update</div>
                      <div className="hig-caption text-gray-900 dark:text-gray-100 font-medium mt-1">
                        {feed.lastUpdate}
                      </div>
                    </div>
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

      {/* Feed Detail Modal */}
      {selectedFeed && (
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
                <h2 className="hig-headline text-gray-900 dark:text-gray-100">Feed Details</h2>
                <button
                  onClick={() => setSelectedFeed(null)}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                  <span className="sr-only">Close</span>
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  </svg>
                </button>
              </div>
              {/* Status Indicator Bar */}
              <div 
                className="h-1 rounded-full" 
                style={{ backgroundColor: getStatusColor(selectedFeed.status) }}
              />
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6">

              <div className="space-y-4 pb-4 border-b border-gray-200 dark:border-gray-700/60 mb-4">
                <div>
                  <div className="hig-caption text-gray-600 dark:text-gray-400 mb-1">Feed Name</div>
                  <div className="hig-headline text-gray-900 dark:text-gray-100">{selectedFeed.name}</div>
                </div>

                <div>
                  <div className="hig-caption text-gray-600 dark:text-gray-400 mb-1">Provider</div>
                  <div className="hig-body text-gray-900 dark:text-gray-100">{selectedFeed.provider}</div>
                </div>

                <div className="flex items-center gap-3">
                  <div>
                    <div className="hig-caption text-gray-600 dark:text-gray-400 mb-1">Type</div>
                    <span 
                      className="hig-badge"
                      style={{
                        backgroundColor: `${getTypeColor(selectedFeed.type)}20`,
                        color: getTypeColor(selectedFeed.type)
                      }}
                    >
                      {selectedFeed.type.replace('-', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="hig-caption text-gray-600 dark:text-gray-400 mb-1">Status</div>
                    <span 
                      className="hig-badge"
                      style={{
                        backgroundColor: `${getStatusColor(selectedFeed.status)}20`,
                        color: getStatusColor(selectedFeed.status)
                      }}
                    >
                      {selectedFeed.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Metric Cards */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="hig-card bg-gray-50 dark:bg-[#334155]/30 p-4 text-center">
                  <div className="hig-caption text-gray-600 dark:text-gray-400 mb-2">Total Indicators</div>
                  <div className="hig-metric-value text-3xl text-gray-900 dark:text-gray-100">
                    {selectedFeed.indicators.toLocaleString()}
                  </div>
                </div>
                <div className="hig-card bg-gray-50 dark:bg-[#334155]/30 p-4 text-center">
                  <div className="hig-caption text-gray-600 dark:text-gray-400 mb-2">Reliability</div>
                  <div className="hig-metric-value text-3xl" style={{ 
                    color: selectedFeed.reliability >= 90 ? '#34C759' : selectedFeed.reliability >= 70 ? '#FF9500' : '#FF3B30',
                    WebkitTextFillColor: selectedFeed.reliability >= 90 ? '#34C759' : selectedFeed.reliability >= 70 ? '#FF9500' : '#FF3B30'
                  }}>
                    {selectedFeed.reliability}%
                  </div>
                </div>
              </div>

              {/* Coverage */}
              <div className="pb-4 border-b border-gray-200 dark:border-gray-700/60 mb-4">
                <h3 className="hig-headline mb-4">Coverage</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedFeed.coverage.map((coverage, idx) => (
                    <span 
                      key={idx} 
                      className="hig-badge"
                      style={{
                        backgroundColor: 'rgba(142, 142, 147, 0.2)',
                        color: '#8E8E93'
                      }}
                    >
                      {coverage}
                    </span>
                  ))}
                </div>
              </div>

              {/* Update Info */}
              <div className="pb-4 border-b border-gray-200 dark:border-gray-700/60 mb-4">
                <h3 className="hig-headline mb-4">Update Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="hig-caption text-gray-600 dark:text-gray-400 mb-1">Update Frequency</div>
                    <div className="hig-body text-gray-900 dark:text-gray-100">{selectedFeed.updateFrequency}</div>
                  </div>
                  <div>
                    <div className="hig-caption text-gray-600 dark:text-gray-400 mb-1">Last Update</div>
                    <div className="hig-body text-gray-900 dark:text-gray-100">{selectedFeed.lastUpdate}</div>
                  </div>
                  <div>
                    <div className="hig-caption text-gray-600 dark:text-gray-400 mb-1">Feed ID</div>
                    <div className="hig-body font-mono text-gray-900 dark:text-gray-100">{selectedFeed.id}</div>
                  </div>
                  <div>
                    <div className="hig-caption text-gray-600 dark:text-gray-400 mb-1">Total Indicators</div>
                    <div className="hig-body font-semibold text-gray-900 dark:text-gray-100">{selectedFeed.indicators.toLocaleString()}</div>
                  </div>
                </div>
              </div>

              {/* Reliability Details */}
              <div className="pb-4 border-b border-gray-200 dark:border-gray-700/60 mb-4">
                <h3 className="hig-headline mb-4">Reliability Assessment</h3>
                <div className="hig-card bg-gray-50 dark:bg-[#334155]/30 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="hig-body text-gray-900 dark:text-gray-100">Reliability Score</div>
                    <div className="hig-body font-semibold" style={{ 
                      color: selectedFeed.reliability >= 90 ? '#34C759' : selectedFeed.reliability >= 70 ? '#FF9500' : '#FF3B30',
                      WebkitTextFillColor: selectedFeed.reliability >= 90 ? '#34C759' : selectedFeed.reliability >= 70 ? '#FF9500' : '#FF3B30'
                    }}>
                      {selectedFeed.reliability}%
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div 
                      className="h-3 rounded-full" 
                      style={{ 
                        width: `${selectedFeed.reliability}%`,
                        backgroundColor: selectedFeed.reliability >= 90 ? '#34C759' : selectedFeed.reliability >= 70 ? '#FF9500' : '#FF3B30'
                      }}
                    ></div>
                  </div>
                  <div className="hig-caption text-gray-600 dark:text-gray-400 mt-2">
                    {selectedFeed.reliability >= 90 
                      ? 'High reliability - Feed provides accurate and timely indicators' 
                      : selectedFeed.reliability >= 70 
                      ? 'Moderate reliability - Feed generally accurate but may have occasional false positives'
                      : 'Low reliability - Feed may contain inaccurate or outdated indicators'}
                  </div>
                </div>
              </div>

              {/* Coverage Details */}
              <div>
                <h3 className="hig-headline mb-4">Coverage Details</h3>
                <div className="hig-card bg-gray-50 dark:bg-[#334155]/30 p-4">
                  <div className="hig-body text-gray-700 dark:text-gray-300 mb-3">
                    This feed provides indicators for the following threat categories:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedFeed.coverage.map((coverage, idx) => (
                      <span 
                        key={idx} 
                        className="hig-badge"
                        style={{
                          backgroundColor: '#007AFF20',
                          color: '#007AFF'
                        }}
                      >
                        {coverage}
                      </span>
                    ))}
                  </div>
                  <div className="hig-caption text-gray-600 dark:text-gray-400 mt-3">
                    Coverage areas determine which types of threats and indicators this feed monitors and provides.
                  </div>
                </div>
              </div>
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
                  Configure
                </button>
                {selectedFeed.status === 'active' ? (
                  <button className="hig-button hig-button-secondary flex-1">
                    Disable Feed
                  </button>
                ) : (
                  <button className="hig-button hig-button-secondary flex-1">
                    Enable Feed
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


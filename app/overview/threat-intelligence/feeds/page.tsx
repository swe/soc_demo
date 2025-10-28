'use client'
import { formatDate, formatDateTime } from '../../../../lib/utils'


import { useEffect, useState } from 'react'
import { usePageTitle } from '@/app/page-title-context'
import { PageHeader, Card, Badge } from '@/components/ui/card'

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

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-emerald-600 dark:bg-emerald-700/20 text-green-700 dark:text-green-400',
      inactive: 'bg-gray-500/20 text-gray-700 dark:text-gray-400',
      error: 'bg-rose-600 dark:bg-rose-700/20 text-red-700 dark:text-red-400'
    }
    return colors[status as keyof typeof colors]
  }

  const getTypeColor = (type: string) => {
    const colors = {
      'open-source': 'bg-indigo-600 dark:bg-indigo-600/20 text-blue-700 dark:text-blue-400',
      'commercial': 'bg-indigo-500/20 text-purple-700 dark:text-purple-400',
      'internal': 'bg-orange-600 dark:bg-orange-700/20 text-orange-700 dark:text-orange-400'
    }
    return colors[type as keyof typeof colors]
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
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-7xl mx-auto">
      <PageHeader 
        title="Threat Intelligence Feeds" 
        description="Manage and monitor threat intelligence data sources" 
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-12 gap-4 mb-6">
        <div className="col-span-12 sm:col-span-6 lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Feeds</div>
              <div className="w-10 h-10 bg-indigo-600 dark:bg-indigo-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</div>
          </div>
        </div>

        <div className="col-span-12 sm:col-span-6 lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600 dark:text-gray-400">Active Feeds</div>
              <div className="w-10 h-10 bg-emerald-600 dark:bg-emerald-700/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-700 dark:text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-emerald-700 dark:text-emerald-400">{stats.active}</div>
          </div>
        </div>

        <div className="col-span-12 sm:col-span-6 lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Indicators</div>
              <div className="w-10 h-10 bg-indigo-600 dark:bg-indigo-600/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-indigo-700 dark:text-indigo-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11 4a1 1 0 10-2 0v4a1 1 0 102 0V7zm-3 1a1 1 0 10-2 0v3a1 1 0 102 0V8zM8 9a1 1 0 00-2 0v2a1 1 0 102 0V9z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.totalIndicators.toLocaleString()}</div>
          </div>
        </div>

        <div className="col-span-12 sm:col-span-6 lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600 dark:text-gray-400">Avg Reliability</div>
              <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-indigo-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.avgReliability}%</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {['all', 'open-source', 'commercial', 'internal'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                filterType === type
                  ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-sm'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              {type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Threat Feeds Grid */}
      <div className="grid grid-cols-12 gap-4">
        {filteredFeeds.map((feed) => (
          <div key={feed.id} className="col-span-12 lg:col-span-6">
            <div 
              onClick={() => setSelectedFeed(feed)}
              className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-1">{feed.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{feed.provider}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(feed.type)}`}>
                    {feed.type.replace('-', ' ').toUpperCase()}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(feed.status)}`}>
                    {feed.status.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-3">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Indicators</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{feed.indicators.toLocaleString()}</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-3">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Reliability</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{feed.reliability}%</div>
                </div>
              </div>

              <div className="mb-4">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Coverage</div>
                <div className="flex flex-wrap gap-2">
                  {feed.coverage.map((coverage, idx) => (
                    <span key={idx} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                      {coverage}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Last Update</div>
                  <div className="text-sm text-gray-800 dark:text-gray-100">{feed.lastUpdate}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Frequency</div>
                  <div className="text-sm text-gray-800 dark:text-gray-100">{feed.updateFrequency}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Feed Detail Panel */}
      {selectedFeed && (
        <>
          <div 
            className="fixed inset-0 bg-gray-900/50 z-40"
            onClick={() => setSelectedFeed(null)}
          />
          <div className="fixed inset-y-0 right-0 w-full md:w-2/3 lg:w-1/2 bg-white dark:bg-gray-800 shadow-xl z-50 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Feed Details</h2>
                <button
                  onClick={() => setSelectedFeed(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Feed Name</div>
                  <div className="text-lg font-semibold text-gray-800 dark:text-gray-100">{selectedFeed.name}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Provider</div>
                  <div className="text-gray-800 dark:text-gray-100">{selectedFeed.provider}</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Type</div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(selectedFeed.type)}`}>
                      {selectedFeed.type.replace('-', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Status</div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedFeed.status)}`}>
                      {selectedFeed.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Indicators</div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{selectedFeed.indicators.toLocaleString()}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Reliability Score</div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                        <div 
                          className={`${selectedFeed.reliability >= 90 ? 'bg-emerald-600 dark:bg-emerald-700' : selectedFeed.reliability >= 70 ? 'bg-amber-600 dark:bg-amber-700' : 'bg-rose-600 dark:bg-rose-700'} h-3 rounded-full`} 
                          style={{ width: `${selectedFeed.reliability}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-gray-900 dark:text-gray-100">{selectedFeed.reliability}%</span>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Coverage</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedFeed.coverage.map((coverage, idx) => (
                      <span key={idx} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                        {coverage}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Update Frequency</div>
                  <div className="text-gray-800 dark:text-gray-100">{selectedFeed.updateFrequency}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Last Update</div>
                  <div className="text-gray-800 dark:text-gray-100">{selectedFeed.lastUpdate}</div>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-2 gap-3">
                    <button className="btn bg-indigo-600 dark:bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-700 text-white">
                      Configure
                    </button>
                    {selectedFeed.status === 'active' ? (
                      <button className="btn bg-rose-600 dark:bg-rose-700 hover:bg-red-600 text-white">
                        Disable Feed
                      </button>
                    ) : (
                      <button className="btn bg-emerald-600 dark:bg-emerald-700 hover:bg-green-600 text-white">
                        Enable Feed
                      </button>
                    )}
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


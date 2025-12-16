'use client'

import { useEffect, useState } from 'react'
import { usePageTitle } from '@/app/page-title-context'

export default function IntegrationsPage() {
  const { setPageTitle } = usePageTitle()
  const [activeTab, setActiveTab] = useState('tab-a')

  useEffect(() => {
    setPageTitle('Integrations')
  }, [setPageTitle])

  return (
    <div className="py-8 w-full max-w-7xl mx-auto">
        {/* Integrations header */}
        <div className="mb-6 px-4 hig-fade-in">
          {/* Main title */}
          <h1 className="hig-title-large text-gray-900 dark:text-gray-100 mb-2">Integrations</h1>
          {/* Subheader */}
          <p className="hig-body text-gray-600 dark:text-gray-400">Manage your third-party integrations and connections</p>
        </div>

        {/* Status bar - sticky top line */}
        <div className="sticky top-16 z-40 before:absolute before:inset-0 before:backdrop-blur-xl before:bg-white/80 dark:before:bg-[#0F172A]/80 before:-z-10 border-b border-gray-200 dark:border-gray-700/60 mb-6">
          <div className="px-4 py-3 w-full">
            <div className="flex items-center justify-between hig-caption">
              <div className="flex items-center space-x-6">
                {/* Errors */}
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#FF3B30] rounded-full"></div>
                  <span className="hig-caption font-semibold text-gray-900 dark:text-gray-100">Errors: 3</span>
                </div>
                
                {/* Active integrations */}
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#34C759] rounded-full"></div>
                  <span className="hig-caption font-semibold text-gray-900 dark:text-gray-100">Active integrations: 8/12</span>
                </div>
                
                {/* Last sync date and time */}
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="hig-caption text-gray-600 dark:text-gray-400">Last sync: Dec 15, 2024 14:30</span>
                </div>
              </div>
              
              {/* Buttons */}
              <div className="flex items-center space-x-3">
                {/* Sync All button */}
                <button className="hig-button hig-button-secondary">
                  Sync All
                </button>
                
                {/* Add Integration button */}
                <button className="hig-button hig-button-primary">
                  Add Integration
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Integrations Grid */}
        <div className="grid grid-cols-12 gap-4 px-4">
          {[
            { name: 'Splunk SIEM', type: 'SIEM', status: 'connected', lastSync: '2 min ago', events: '45.2k/day', health: 100 },
            { name: 'CrowdStrike Falcon', type: 'EDR', status: 'connected', lastSync: '1 min ago', events: '23.8k/day', health: 98 },
            { name: 'Palo Alto Firewall', type: 'Network', status: 'connected', lastSync: '5 min ago', events: '89.3k/day', health: 100 },
            { name: 'Microsoft Defender', type: 'Endpoint', status: 'connected', lastSync: '3 min ago', events: '34.1k/day', health: 95 },
            { name: 'Proofpoint Email', type: 'Email Security', status: 'connected', lastSync: '10 min ago', events: '12.7k/day', health: 100 },
            { name: 'Okta SSO', type: 'Identity', status: 'connected', lastSync: '1 min ago', events: '8.9k/day', health: 100 },
            { name: 'Tenable Nessus', type: 'Vulnerability', status: 'error', lastSync: '2 hours ago', events: '0/day', health: 0 },
            { name: 'Carbon Black', type: 'EDR', status: 'connected', lastSync: '4 min ago', events: '19.2k/day', health: 97 },
            { name: 'Cisco ISE', type: 'NAC', status: 'connected', lastSync: '7 min ago', events: '5.6k/day', health: 92 },
            { name: 'FortiGate', type: 'Firewall', status: 'warning', lastSync: '45 min ago', events: '67.4k/day', health: 75 },
            { name: 'AWS CloudTrail', type: 'Cloud', status: 'connected', lastSync: '2 min ago', events: '156.7k/day', health: 100 },
            { name: 'Azure Sentinel', type: 'SIEM', status: 'connected', lastSync: '3 min ago', events: '98.3k/day', health: 99 }
          ].map((integration, idx) => (
            <div key={idx} className="col-span-12 lg:col-span-6">
              <div className="hig-card">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      integration.status === 'connected' ? 'bg-[#34C759]/20 dark:bg-[#34C759]/20' :
                      integration.status === 'warning' ? 'bg-[#FF9500]/20 dark:bg-[#FF9500]/20' :
                      'bg-[#FF3B30]/20 dark:bg-[#FF3B30]/20'
                    }`}>
                      <svg className={`w-6 h-6 ${
                        integration.status === 'connected' ? 'text-[#34C759] dark:text-[#34C759]' :
                        integration.status === 'warning' ? 'text-[#FF9500] dark:text-[#FF9500]' :
                        'text-[#FF3B30] dark:text-[#FF3B30]'
                      }`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="hig-body font-semibold text-gray-900 dark:text-gray-100">{integration.name}</h3>
                      <p className="hig-caption text-gray-600 dark:text-gray-400">{integration.type}</p>
                    </div>
                  </div>
                  <span 
                    className="hig-badge"
                    style={{
                      backgroundColor: integration.status === 'connected' ? '#34C75920' :
                                      integration.status === 'warning' ? '#FF950020' :
                                      '#FF3B3020',
                      color: integration.status === 'connected' ? '#34C759' :
                             integration.status === 'warning' ? '#FF9500' :
                             '#FF3B30'
                    }}
                  >
                    {integration.status.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="hig-card bg-gray-50 dark:bg-[#334155]/30 p-3 text-center">
                    <div className="hig-caption text-gray-600 dark:text-gray-400 mb-1">Events/Day</div>
                    <div className="hig-body font-semibold text-gray-900 dark:text-gray-100">{integration.events}</div>
                  </div>
                  <div className="hig-card bg-gray-50 dark:bg-[#334155]/30 p-3 text-center">
                    <div className="hig-caption text-gray-600 dark:text-gray-400 mb-1">Health</div>
                    <div 
                      className="hig-body font-semibold"
                      style={{
                        color: integration.health >= 95 ? '#34C759' :
                               integration.health >= 75 ? '#FF9500' :
                               '#FF3B30',
                        WebkitTextFillColor: integration.health >= 95 ? '#34C759' :
                                            integration.health >= 75 ? '#FF9500' :
                                            '#FF3B30'
                      }}
                    >
                      {integration.health}%
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700/60">
                  <span className="hig-caption text-gray-600 dark:text-gray-400">Last sync: {integration.lastSync}</span>
                  <button className="hig-caption hover:text-[#AF52DE] hig-link-hover">Configure →</button>
                </div>
              </div>
            </div>
          ))}
        </div>
    </div>
  )
}

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
    <div>
      {/* Content container */}
      <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">
        {/* Integrations header */}
        <div className="mb-6">
          {/* Main title */}
          <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold mb-2">Integrations</h1>
          {/* Subheader */}
          <p className="text-gray-600  dark:text-gray-400">Manage your third-party integrations and connections</p>
        </div>

        {/* Status bar - sticky top line */}
        <div className="sticky top-16 z-50 before:absolute before:inset-0 before:backdrop-blur-md before:bg-white/80 dark:before:bg-gray-800/80 before:-z-10 border-b border-gray-200 dark:border-gray-700/60 mb-6 -mx-4 sm:-mx-6 lg:-mx-8">
          <div className="px-4 sm:px-6 lg:px-8 py-3 w-full">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-6">
                {/* Errors */}
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-rose-600 dark:bg-rose-700 rounded-full"></div>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">Errors: 3</span>
                </div>
                
                {/* Active integrations */}
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-emerald-600 dark:bg-emerald-700 rounded-full"></div>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">Active integrations: 8/12</span>
                </div>
                
                {/* Last sync date and time */}
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-gray-500 dark:text-gray-400">Last sync: Dec 15, 2024 14:30</span>
                </div>
              </div>
              
              {/* Buttons */}
              <div className="flex items-center space-x-3">
                {/* Sync All button */}
                <button className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md text-sm font-medium transition-all duration-200 cursor-pointer">
                  Sync All
                </button>
                
                {/* Add Integration button */}
                <button className="px-4 py-2 bg-indigo-600 dark:bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-700 text-white rounded-md text-sm font-medium transition-all duration-200 cursor-pointer">
                  Add Integration
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Integrations Grid */}
        <div className="grid grid-cols-12 gap-4">
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
              <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      integration.status === 'connected' ? 'bg-emerald-600 dark:bg-emerald-700/20' :
                      integration.status === 'warning' ? 'bg-amber-600 dark:bg-amber-700/20' :
                      'bg-rose-600 dark:bg-rose-700/20'
                    }`}>
                      <svg className={`w-6 h-6 ${
                        integration.status === 'connected' ? 'text-emerald-700 dark:text-emerald-400' :
                        integration.status === 'warning' ? 'text-amber-700 dark:text-amber-400' :
                        'text-rose-700 dark:text-rose-400'
                      }`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100">{integration.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{integration.type}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    integration.status === 'connected' ? 'bg-emerald-600 dark:bg-emerald-700/20 text-green-700 dark:text-green-400' :
                    integration.status === 'warning' ? 'bg-amber-600 dark:bg-amber-700/20 text-yellow-700 dark:text-yellow-400' :
                    'bg-rose-600 dark:bg-rose-700/20 text-red-700 dark:text-red-400'
                  }`}>
                    {integration.status.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-3">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Events/Day</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-gray-100">{integration.events}</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-3">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Health</div>
                    <div className={`text-lg font-bold ${
                      integration.health >= 95 ? 'text-emerald-700 dark:text-emerald-400' :
                      integration.health >= 75 ? 'text-amber-700 dark:text-amber-400' :
                      'text-rose-700 dark:text-rose-400'
                    }`}>{integration.health}%</div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700 text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Last sync: {integration.lastSync}</span>
                  <button className="text-indigo-600 hover:text-indigo-700 dark:hover:text-indigo-500 font-medium">Configure</button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}

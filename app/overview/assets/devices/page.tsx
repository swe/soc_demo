'use client'

import { useEffect, useState } from 'react'
import { usePageTitle } from '@/app/page-title-context'

interface Device {
  id: string
  hostname: string
  ip: string
  type: 'endpoint' | 'server' | 'network' | 'iot'
  os: string
  status: 'online' | 'offline' | 'warning'
  riskScore: number
  lastSeen: string
  department: string
  owner: string
  vulnerabilities: number
}

export default function DevicesPage() {
  const { setPageTitle } = usePageTitle()
  const [activeTab, setActiveTab] = useState<string>('all')
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    setPageTitle('Devices')
  }, [setPageTitle])

  const devices: Device[] = [
    {
      id: 'DEV-001',
      hostname: 'WKS-FINANCE-01',
      ip: '192.168.1.45',
      type: 'endpoint',
      os: 'Windows 11 Pro',
      status: 'online',
      riskScore: 23,
      lastSeen: '2 minutes ago',
      department: 'Finance',
      owner: 'John Doe',
      vulnerabilities: 2
    },
    {
      id: 'DEV-002',
      hostname: 'SRV-WEB-PROD-01',
      ip: '10.0.1.15',
      type: 'server',
      os: 'Ubuntu 22.04 LTS',
      status: 'online',
      riskScore: 15,
      lastSeen: '1 minute ago',
      department: 'IT',
      owner: 'DevOps Team',
      vulnerabilities: 0
    },
    {
      id: 'DEV-003',
      hostname: 'WKS-HR-12',
      ip: '192.168.2.87',
      type: 'endpoint',
      os: 'macOS Sonoma',
      status: 'warning',
      riskScore: 67,
      lastSeen: '15 minutes ago',
      department: 'HR',
      owner: 'Jane Smith',
      vulnerabilities: 5
    },
    {
      id: 'DEV-004',
      hostname: 'NET-SWITCH-FL3',
      ip: '10.0.0.12',
      type: 'network',
      os: 'Cisco IOS 15.2',
      status: 'online',
      riskScore: 8,
      lastSeen: '30 seconds ago',
      department: 'IT',
      owner: 'Network Team',
      vulnerabilities: 0
    },
    {
      id: 'DEV-005',
      hostname: 'SRV-DB-MAIN',
      ip: '10.0.1.25',
      type: 'server',
      os: 'RHEL 8.7',
      status: 'online',
      riskScore: 42,
      lastSeen: '5 minutes ago',
      department: 'IT',
      owner: 'DBA Team',
      vulnerabilities: 3
    },
    {
      id: 'DEV-006',
      hostname: 'WKS-DEV-05',
      ip: '192.168.3.42',
      type: 'endpoint',
      os: 'Windows 11 Pro',
      status: 'offline',
      riskScore: 89,
      lastSeen: '2 hours ago',
      department: 'Engineering',
      owner: 'Mike Johnson',
      vulnerabilities: 8
    }
  ]

  const getStatusColor = (status: string) => {
    const colors = {
      online: 'bg-emerald-600 dark:bg-emerald-700/20 text-green-700 dark:text-green-400',
      offline: 'bg-gray-500/20 text-gray-700 dark:text-gray-400',
      warning: 'bg-amber-600 dark:bg-amber-700/20 text-yellow-700 dark:text-yellow-400'
    }
    return colors[status as keyof typeof colors]
  }

  const getRiskColor = (score: number) => {
    if (score >= 70) return 'text-rose-700 dark:text-rose-400'
    if (score >= 40) return 'text-amber-700 dark:text-amber-400'
    return 'text-emerald-700 dark:text-emerald-400'
  }

  const getTypeIcon = (type: string) => {
    const icons = {
      endpoint: '💻',
      server: '🖥️',
      network: '🌐',
      iot: '📱'
    }
    return icons[type as keyof typeof icons] || '💻'
  }

  const filteredDevices = devices.filter(device => {
    const matchesTab = activeTab === 'all' || device.type === activeTab
    const matchesSearch = device.hostname.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         device.ip.includes(searchQuery) ||
                         device.owner.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesTab && matchesSearch
  })

  const stats = {
    total: devices.length,
    online: devices.filter(d => d.status === 'online').length,
    atRisk: devices.filter(d => d.riskScore >= 70).length,
    vulnerabilities: devices.reduce((sum, d) => sum + d.vulnerabilities, 0)
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold mb-2">Device Management</h1>
        <p className="text-gray-600  dark:text-gray-400">Monitor and manage your device infrastructure</p>
      </div>

      {/* Sticky Status Bar */}
      <div className="sticky top-16 z-40 before:absolute before:inset-0 before:backdrop-blur-md before:bg-white/90 dark:before:bg-gray-800/90 before:-z-10 border-b border-gray-200 dark:border-gray-700/60 mb-6 -mx-4 sm:-mx-6 lg:-mx-8">
        <div className="px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-6">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
                </svg>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {devices.length} Total Devices
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-600 dark:bg-emerald-700 rounded-full"></div>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {devices.filter(d => d.status === 'online').length} Online
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-rose-600 dark:bg-rose-700 rounded-full animate-pulse"></div>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {devices.filter(d => d.riskScore >= 70).length} High Risk
                </span>
              </div>
              <div className="text-gray-500 dark:text-gray-400">
                {devices.reduce((sum, d) => sum + d.vulnerabilities, 0)} Total Vulnerabilities
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-1">
            <input 
              type="text"
              placeholder="Search devices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input w-full bg-white dark:bg-gray-800"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {['all', 'endpoint', 'server', 'network', 'iot'].map(type => (
            <button
              key={type}
              onClick={() => setActiveTab(type)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === type
                  ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-sm'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              {type === 'all' ? 'All Devices' : type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Devices Grid */}
      <div className="grid grid-cols-12 gap-4">
        {filteredDevices.map((device) => (
          <div key={device.id} className="col-span-12 lg:col-span-6 xl:col-span-4">
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6 hover:shadow-md transition-all group relative overflow-hidden">
              {/* Risk Indicator Bar */}
              <div 
                className="absolute top-0 left-0 right-0 h-1"
                style={{
                  background: device.riskScore >= 70 ? '#ef4444' :
                             device.riskScore >= 40 ? '#eab308' : '#22c55e'
                }}
              />

              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`text-4xl group-hover:scale-110 transition-transform`}>{getTypeIcon(device.type)}</div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-500 transition-all duration-200">
                      {device.hostname}
                    </h3>
                    <p className="text-xs font-mono text-gray-600 dark:text-gray-400">{device.ip}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {device.status === 'online' && (
                    <div className="w-2 h-2 bg-emerald-600 dark:bg-emerald-700 rounded-full animate-pulse" />
                  )}
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(device.status)}`}>
                    {device.status.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-3 text-center">
                  <div className={`text-xl font-bold ${getRiskColor(device.riskScore)}`}>{device.riskScore}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Risk</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-3 text-center">
                  <div className={`text-xl font-bold ${device.vulnerabilities > 0 ? 'text-rose-700 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                    {device.vulnerabilities}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Vulns</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-3 text-center">
                  <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{device.type}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Type</div>
                </div>
              </div>

              {/* Info */}
              <div className="space-y-1.5 text-xs mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">OS:</span>
                  <span className="text-gray-900 dark:text-gray-100 font-medium">{device.os}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Department:</span>
                  <span className="text-gray-900 dark:text-gray-100 font-medium">{device.department}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Owner:</span>
                  <span className="text-gray-900 dark:text-gray-100 font-medium">{device.owner}</span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedDevice(device)
                  }}
                  className="flex-1 btn-sm bg-indigo-600 dark:bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-700 text-white text-xs"
                >
                  Details
                </button>
                <button className="flex-1 btn-sm bg-indigo-600 dark:bg-indigo-600 hover:bg-indigo-600 dark:hover:bg-indigo-600 text-white text-xs">
                  Scan
                </button>
                {device.vulnerabilities > 0 && (
                  <button className="flex-1 btn-sm bg-orange-600 dark:bg-orange-600 hover:bg-orange-700 dark:hover:bg-orange-700 text-white text-xs">
                    Patch
                  </button>
                )}
              </div>

              {/* Last Seen */}
              <div className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3">
                Last seen: {device.lastSeen}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Device Detail Panel */}
      {selectedDevice && (
        <>
          <div 
            className="fixed inset-0 bg-gray-900/50 z-40"
            onClick={() => setSelectedDevice(null)}
          />
          <div className="fixed inset-y-0 right-0 w-full md:w-2/3 lg:w-1/2 bg-white dark:bg-gray-800 shadow-xl z-50 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Device Details</h2>
                <button
                  onClick={() => setSelectedDevice(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{getTypeIcon(selectedDevice.type)}</div>
                  <div>
                    <div className="text-lg font-semibold text-gray-800 dark:text-gray-100">{selectedDevice.hostname}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{selectedDevice.id}</div>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Status</div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedDevice.status)}`}>
                    {selectedDevice.status.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Risk Score</div>
                    <div className={`text-3xl font-bold ${getRiskColor(selectedDevice.riskScore)}`}>{selectedDevice.riskScore}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Vulnerabilities</div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{selectedDevice.vulnerabilities}</div>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">IP Address</div>
                  <div className="text-gray-800 dark:text-gray-100 font-mono">{selectedDevice.ip}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Operating System</div>
                  <div className="text-gray-800 dark:text-gray-100">{selectedDevice.os}</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Department</div>
                    <div className="text-gray-800 dark:text-gray-100">{selectedDevice.department}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Owner</div>
                    <div className="text-gray-800 dark:text-gray-100">{selectedDevice.owner}</div>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Last Seen</div>
                  <div className="text-gray-800 dark:text-gray-100">{selectedDevice.lastSeen}</div>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-2 gap-3">
                    <button className="btn bg-indigo-600 dark:bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-700 text-white">
                      View Details
                    </button>
                    <button className="btn bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600">
                      Run Scan
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

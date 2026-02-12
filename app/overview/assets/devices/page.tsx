'use client'

import { useEffect, useState } from 'react'
import { usePageTitle } from '@/app/page-title-context'
import Icon from '@/components/ui/icon'

interface Device {
  id: string
  hostname: string
  ip: string
  macAddress?: string
  type: 'endpoint' | 'server' | 'network' | 'iot'
  os: string
  status: 'online' | 'offline' | 'warning'
  riskScore: number
  lastSeen: string
  lastScan?: string
  department: string
  owner: string
  vulnerabilities: number
  activeThreats?: number
  complianceStatus?: 'compliant' | 'non-compliant' | 'warning'
  complianceIssues?: Array<{
    policy: string
    severity: 'critical' | 'high' | 'medium' | 'low'
    description: string
  }>
  threatDetails?: Array<{
    id: string
    type: string
    severity: 'critical' | 'high' | 'medium' | 'low'
    description: string
    detected: string
  }>
  networkSegment?: string
  agentVersion?: string
}

export default function DevicesPage() {
  const { setPageTitle } = usePageTitle()
  const [activeTab, setActiveTab] = useState<string>('all')
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    setPageTitle('Device Management')
  }, [setPageTitle])

  const devices: Device[] = [
    {
      id: 'DEV-001',
      hostname: 'WKS-FINANCE-01',
      ip: '192.168.1.45',
      macAddress: '00:1B:44:11:3A:B7',
      type: 'endpoint',
      os: 'Windows 11 Pro',
      status: 'online',
      riskScore: 23,
      lastSeen: '2 minutes ago',
      lastScan: '1 hour ago',
      department: 'Finance',
      owner: 'John Doe',
      vulnerabilities: 2,
      activeThreats: 0,
      complianceStatus: 'compliant',
      networkSegment: 'Finance-VLAN-10',
      agentVersion: '2.4.1'
    },
    {
      id: 'DEV-002',
      hostname: 'SRV-WEB-PROD-01',
      ip: '10.0.1.15',
      macAddress: '00:50:56:8A:2C:4F',
      type: 'server',
      os: 'Ubuntu 22.04 LTS',
      status: 'online',
      riskScore: 15,
      lastSeen: '1 minute ago',
      lastScan: '30 minutes ago',
      department: 'IT',
      owner: 'DevOps Team',
      vulnerabilities: 0,
      activeThreats: 0,
      complianceStatus: 'compliant',
      networkSegment: 'DMZ-Production',
      agentVersion: '2.4.2'
    },
    {
      id: 'DEV-003',
      hostname: 'WKS-HR-12',
      ip: '192.168.2.87',
      macAddress: 'A4:5E:60:3D:8E:9F',
      type: 'endpoint',
      os: 'macOS Sonoma',
      status: 'warning',
      riskScore: 67,
      lastSeen: '15 minutes ago',
      lastScan: '3 hours ago',
      department: 'HR',
      owner: 'Jane Smith',
      vulnerabilities: 5,
      activeThreats: 2,
      complianceStatus: 'warning',
      complianceIssues: [
        {
          policy: 'Endpoint Encryption Policy',
          severity: 'high',
          description: 'Full disk encryption not enabled'
        },
        {
          policy: 'Agent Version Policy',
          severity: 'medium',
          description: 'Agent version 2.3.8 is outdated, update to 2.4.1+ required'
        }
      ],
      threatDetails: [
        {
          id: 'THR-2024-0847',
          type: 'Suspicious Process',
          severity: 'high',
          description: 'Unusual process activity detected: /tmp/unknown_binary',
          detected: '2 hours ago'
        },
        {
          id: 'THR-2024-0848',
          type: 'Network Anomaly',
          severity: 'medium',
          description: 'Multiple failed connection attempts to external IPs',
          detected: '1 hour ago'
        }
      ],
      networkSegment: 'HR-VLAN-20',
      agentVersion: '2.3.8'
    },
    {
      id: 'DEV-004',
      hostname: 'NET-SWITCH-FL3',
      ip: '10.0.0.12',
      macAddress: '00:1C:58:29:4A:BC',
      type: 'network',
      os: 'Cisco IOS 15.2',
      status: 'online',
      riskScore: 8,
      lastSeen: '30 seconds ago',
      lastScan: '2 hours ago',
      department: 'IT',
      owner: 'Network Team',
      vulnerabilities: 0,
      activeThreats: 0,
      complianceStatus: 'compliant',
      networkSegment: 'Core-Network'
    },
    {
      id: 'DEV-005',
      hostname: 'SRV-DB-MAIN',
      ip: '10.0.1.25',
      macAddress: '00:0C:29:7B:1E:3D',
      type: 'server',
      os: 'RHEL 8.7',
      status: 'online',
      riskScore: 42,
      lastSeen: '5 minutes ago',
      lastScan: '45 minutes ago',
      department: 'IT',
      owner: 'DBA Team',
      vulnerabilities: 3,
      activeThreats: 1,
      complianceStatus: 'warning',
      complianceIssues: [
        {
          policy: 'Database Access Control',
          severity: 'high',
          description: 'Default database credentials detected in configuration files'
        },
        {
          policy: 'Patch Management',
          severity: 'medium',
          description: '3 security patches pending installation'
        }
      ],
      threatDetails: [
        {
          id: 'THR-2024-0849',
          type: 'SQL Injection Attempt',
          severity: 'critical',
          description: 'Multiple SQL injection attempts detected from 185.220.101.43',
          detected: '30 minutes ago'
        }
      ],
      networkSegment: 'Database-VLAN-30',
      agentVersion: '2.4.0'
    },
    {
      id: 'DEV-006',
      hostname: 'WKS-DEV-05',
      ip: '192.168.3.42',
      macAddress: 'B8:27:EB:12:34:56',
      type: 'endpoint',
      os: 'Windows 11 Pro',
      status: 'offline',
      riskScore: 89,
      lastSeen: '2 hours ago',
      lastScan: '1 day ago',
      department: 'Engineering',
      owner: 'Mike Johnson',
      vulnerabilities: 8,
      activeThreats: 3,
      complianceStatus: 'non-compliant',
      complianceIssues: [
        {
          policy: 'Agent Version Policy',
          severity: 'critical',
          description: 'Agent version 2.2.5 is severely outdated, update to 2.4.1+ required'
        },
        {
          policy: 'Endpoint Encryption Policy',
          severity: 'critical',
          description: 'BitLocker encryption not enabled'
        },
        {
          policy: 'Firewall Policy',
          severity: 'high',
          description: 'Windows Firewall is disabled'
        },
        {
          policy: 'Patch Management',
          severity: 'high',
          description: '8 critical security patches pending installation'
        }
      ],
      threatDetails: [
        {
          id: 'THR-2024-0850',
          type: 'Malware Detection',
          severity: 'critical',
          description: 'Trojan.Win32.Generic detected in Downloads folder',
          detected: '3 hours ago'
        },
        {
          id: 'THR-2024-0851',
          type: 'Ransomware Behavior',
          severity: 'critical',
          description: 'Suspicious file encryption activity detected',
          detected: '2 hours ago'
        },
        {
          id: 'THR-2024-0852',
          type: 'Command & Control',
          severity: 'high',
          description: 'Outbound connection to known C2 server: 45.142.212.61',
          detected: '1 hour ago'
        }
      ],
      networkSegment: 'Dev-VLAN-40',
      agentVersion: '2.2.5'
    }
  ]

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      online: '#059669',      // System green
      offline: '#6b7280',     // System gray
      warning: '#ea580c'      // System orange
    }
    return colors[status] || '#6b7280'
  }

  const getRiskColor = (score: number): string => {
    if (score >= 70) return '#e11d48'  // System red
    if (score >= 40) return '#ea580c'   // System orange
    return '#059669'                    // System green
  }

  const getTypeIcon = (type: string): string => {
    const icons: Record<string, string> = {
      endpoint: '💻',
      server: '🖥️',
      network: '🌐',
      iot: '📱'
    }
    return icons[type] || '💻'
  }

  const getComplianceColor = (status?: string): string => {
    const colors: Record<string, string> = {
      'compliant': '#059669',
      'non-compliant': '#e11d48',
      'warning': '#ea580c'
    }
    return colors[status || ''] || '#6b7280'
  }

  const getSeverityColor = (severity: string): string => {
    const colors: Record<string, string> = {
      'critical': '#e11d48',
      'high': '#ea580c',
      'medium': '#d97706',
      'low': '#4f46e5'
    }
    return colors[severity] || '#6b7280'
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
    <div className="py-4 w-full max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-6 px-4 hig-fade-in">
        <h1 className="hig-title-large text-gray-900 dark:text-gray-100 mb-2">
          Device Management
        </h1>
        <p className="hig-body text-gray-600 dark:text-gray-400">
          Monitor and manage your device infrastructure
        </p>
      </div>

      {/* Sticky Device Statistics Bar */}
      <div className="sticky top-16 z-40 before:absolute before:inset-0 before:backdrop-blur-xl before:bg-white/80 dark:before:bg-gray-950/80 before:-z-10 border-b border-gray-200 dark:border-gray-700/60 mb-3 -mx-4 sm:-mx-6 lg:-mx-8">
        <div className="px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-8 flex-wrap">
            <span className="hig-caption text-gray-600 dark:text-gray-400 font-medium">Devices:</span>
            <div className="flex items-center gap-2">
              <span className="hig-caption font-semibold text-gray-900 dark:text-gray-100">{stats.total}</span>
              <span className="hig-caption text-gray-600 dark:text-gray-400">Total</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#059669] rounded-full"></div>
              <span className="hig-caption font-semibold text-[#059669]">{stats.online}</span>
              <span className="hig-caption text-gray-600 dark:text-gray-400">Online</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#e11d48] rounded-full"></div>
              <span className="hig-caption font-semibold text-[#e11d48]">{stats.atRisk}</span>
              <span className="hig-caption text-gray-600 dark:text-gray-400">High Risk</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="hig-caption font-semibold text-gray-900 dark:text-gray-100">{stats.vulnerabilities}</span>
              <span className="hig-caption text-gray-600 dark:text-gray-400">Vulnerabilities</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 px-4">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-1">
            <input 
              type="text"
              placeholder="Search devices by hostname, IP, or owner..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="hig-input"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {['all', 'endpoint', 'server', 'network', 'iot'].map(type => (
            <button
              key={type}
              onClick={() => setActiveTab(type)}
              className={`hig-button ${
                activeTab === type
                  ? 'hig-button-primary'
                  : 'hig-button-secondary'
              }`}
            >
              {type === 'all' ? 'All Devices' : 
               type === 'iot' ? 'IoT' : 
               type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Devices Grid */}
      {filteredDevices.length === 0 ? (
        <div className="px-4">
          <div className="hig-card">
            <div className="hig-empty-state">
              <p className="hig-body text-gray-600 dark:text-gray-400">
                No devices found matching your search criteria.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 px-4">
          {filteredDevices.map((device, index) => (
            <div key={device.id} className="hig-card hig-stagger-item" style={{ animationDelay: `${index * 0.05}s` }}>
              {/* Risk Indicator Bar */}
              <div 
                className="absolute top-0 left-0 right-0 h-1 rounded-t-xl"
                style={{
                  backgroundColor: getRiskColor(device.riskScore),
                  boxShadow: `0 0 8px ${getRiskColor(device.riskScore)}40`
                }}
              />

              {/* Device Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{getTypeIcon(device.type)}</div>
                  <div>
                    <h3 className="hig-headline text-gray-900 dark:text-gray-100 mb-1">
                      {device.hostname}
                    </h3>
                    <p className="hig-caption font-mono text-gray-600 dark:text-gray-400">{device.ip}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span 
                    className="hig-badge"
                    style={{ 
                      backgroundColor: `${getStatusColor(device.status)}20`,
                      color: getStatusColor(device.status)
                    }}
                  >
                    {device.status.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 text-center">
                  <div 
                    className="hig-metric-value text-3xl"
                    style={{ color: getRiskColor(device.riskScore), WebkitTextFillColor: getRiskColor(device.riskScore) }}
                  >
                    {device.riskScore}
                  </div>
                  <div className="hig-caption text-gray-600 dark:text-gray-400 mt-1">Risk</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 text-center">
                  <div 
                    className="hig-metric-value text-3xl"
                    style={{ 
                      color: device.vulnerabilities > 0 ? '#e11d48' : '#059669',
                      WebkitTextFillColor: device.vulnerabilities > 0 ? '#e11d48' : '#059669'
                    }}
                  >
                    {device.vulnerabilities}
                  </div>
                  <div className="hig-caption text-gray-600 dark:text-gray-400 mt-1">Vulns</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 text-center">
                  <div className="hig-body text-gray-900 dark:text-gray-100 font-semibold truncate">
                    {device.type === 'iot' ? 'IoT' : device.type.charAt(0).toUpperCase() + device.type.slice(1)}
                  </div>
                  <div className="hig-caption text-gray-600 dark:text-gray-400 mt-1">Type</div>
                </div>
              </div>

              {/* Device Info */}
              <div className="space-y-2 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700/60">
                <div className="flex items-center justify-between">
                  <span className="hig-caption text-gray-600 dark:text-gray-400">OS:</span>
                  <span className="hig-body text-gray-900 dark:text-gray-100 font-medium">{device.os}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="hig-caption text-gray-600 dark:text-gray-400">Department:</span>
                  <span className="hig-body text-gray-900 dark:text-gray-100 font-medium">{device.department}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="hig-caption text-gray-600 dark:text-gray-400">Owner:</span>
                  <span className="hig-body text-gray-900 dark:text-gray-100 font-medium">{device.owner}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedDevice(device)
                  }}
                  className="flex-1 hig-button hig-button-primary"
                >
                  Details
                </button>
                <button className="flex-1 hig-button hig-button-secondary">
                  Scan
                </button>
                {device.vulnerabilities > 0 && (
                  <button 
                    className="flex-1 hig-button" 
                    style={{
                      backgroundColor: '#ea580c',
                      color: 'white'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#FF8500'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#ea580c'
                    }}
                  >
                    Patch
                  </button>
                )}
              </div>

              {/* Last Seen */}
              <div className="hig-caption text-gray-500 dark:text-gray-400 text-center mt-4">
                Last seen: {device.lastSeen}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Device Detail Modal */}
      {selectedDevice && (
        <div 
          className="hig-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedDevice(null)}
        >
          <div 
            className="hig-modal p-0 max-w-4xl w-full flex flex-col max-h-[90vh]" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header - Fixed */}
            <div 
              className="sticky top-0 z-10 backdrop-blur-xl backdrop-saturate-150 bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-700/60 p-6 pb-4"
              style={{
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                backdropFilter: 'blur(20px) saturate(180%)'
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-4">
                  <div className="text-5xl">{getTypeIcon(selectedDevice.type)}</div>
                  <div>
                    <h2 className="hig-headline text-gray-900 dark:text-gray-100 mb-1">
                      {selectedDevice.hostname}
                    </h2>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="hig-caption text-gray-600 dark:text-gray-400 font-mono">
                        {selectedDevice.id}
                      </span>
                      <span className="hig-caption text-gray-400">•</span>
                      <span 
                        className="hig-badge"
                        style={{ 
                          backgroundColor: `${getStatusColor(selectedDevice.status)}20`,
                          color: getStatusColor(selectedDevice.status)
                        }}
                      >
                        {selectedDevice.status.toUpperCase()}
                      </span>
                      <span className="hig-caption text-gray-400">•</span>
                      <span className="hig-caption text-gray-600 dark:text-gray-400">
                        Last seen: {selectedDevice.lastSeen}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedDevice(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <Icon name="close-outline" className="text-2xl" />
                </button>
              </div>
              {/* Risk Indicator Bar */}
              <div 
                className="h-1 rounded-full"
                style={{
                  backgroundColor: getRiskColor(selectedDevice.riskScore),
                  boxShadow: `0 0 8px ${getRiskColor(selectedDevice.riskScore)}40`
                }}
              />
            </div>

            {/* Device Info - Scrollable */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="hig-card bg-gray-50 dark:bg-gray-700/30 p-4 text-center">
                  <div className="hig-caption text-gray-600 dark:text-gray-400 mb-2">Risk Score</div>
                  <div className="hig-metric-value text-4xl text-gray-900 dark:text-gray-100">
                    {selectedDevice.riskScore}
                  </div>
                </div>
                <div className="hig-card bg-gray-50 dark:bg-gray-700/30 p-4 text-center">
                  <div className="hig-caption text-gray-600 dark:text-gray-400 mb-2">Vulnerabilities</div>
                  <div className="hig-metric-value text-4xl text-gray-900 dark:text-gray-100">
                    {selectedDevice.vulnerabilities}
                  </div>
                </div>
                {selectedDevice.activeThreats !== undefined && (
                  <div className="hig-card bg-gray-50 dark:bg-gray-700/30 p-4 text-center">
                    <div className="hig-caption text-gray-600 dark:text-gray-400 mb-2">Active Threats</div>
                    <div className="hig-metric-value text-4xl text-gray-900 dark:text-gray-100">
                      {selectedDevice.activeThreats}
                    </div>
                  </div>
                )}
                {selectedDevice.complianceStatus && (
                  <div className="hig-card bg-gray-50 dark:bg-gray-700/30 p-4 text-center">
                    <div className="hig-caption text-gray-600 dark:text-gray-400 mb-2">Compliance</div>
                    <div 
                      className="text-4xl font-semibold"
                      style={{ 
                        color: getComplianceColor(selectedDevice.complianceStatus),
                        WebkitTextFillColor: getComplianceColor(selectedDevice.complianceStatus)
                      }}
                    >
                      {selectedDevice.complianceStatus === 'compliant' ? '✓' : 
                       selectedDevice.complianceStatus === 'non-compliant' ? '✗' : '⚠'}
                    </div>
                  </div>
                )}
              </div>

              {/* Device Information */}
              <div className="space-y-4 pb-4 border-b border-gray-200 dark:border-gray-700/60">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block hig-caption text-gray-600 dark:text-gray-400 mb-1">
                      IP Address
                    </label>
                    <div className="hig-body text-gray-900 dark:text-gray-100 font-mono">
                      {selectedDevice.ip}
                    </div>
                  </div>

                  <div>
                    <label className="block hig-caption text-gray-600 dark:text-gray-400 mb-1">
                      Operating System
                    </label>
                    <div className="hig-body text-gray-900 dark:text-gray-100">
                      {selectedDevice.os}
                    </div>
                  </div>
                </div>

                {selectedDevice.macAddress && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block hig-caption text-gray-600 dark:text-gray-400 mb-1">
                        MAC Address
                      </label>
                      <div className="hig-body text-gray-900 dark:text-gray-100 font-mono">
                        {selectedDevice.macAddress}
                      </div>
                    </div>

                    {selectedDevice.networkSegment && (
                      <div>
                        <label className="block hig-caption text-gray-600 dark:text-gray-400 mb-1">
                          Network Segment
                        </label>
                        <div className="hig-body text-gray-900 dark:text-gray-100">
                          {selectedDevice.networkSegment}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block hig-caption text-gray-600 dark:text-gray-400 mb-1">
                      Department
                    </label>
                    <div className="hig-body text-gray-900 dark:text-gray-100">
                      {selectedDevice.department}
                    </div>
                  </div>
                  <div>
                    <label className="block hig-caption text-gray-600 dark:text-gray-400 mb-1">
                      Owner
                    </label>
                    <div className="hig-body text-gray-900 dark:text-gray-100">
                      {selectedDevice.owner}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {selectedDevice.lastScan && (
                    <div>
                      <label className="block hig-caption text-gray-600 dark:text-gray-400 mb-1">
                        Last Scan
                      </label>
                      <div className="hig-body text-gray-900 dark:text-gray-100">
                        {selectedDevice.lastScan}
                      </div>
                    </div>
                  )}
                  {selectedDevice.agentVersion && (
                    <div>
                      <label className="block hig-caption text-gray-600 dark:text-gray-400 mb-1">
                        Agent Version
                      </label>
                      <div className="hig-body text-gray-900 dark:text-gray-100 font-mono">
                        {selectedDevice.agentVersion}
                      </div>
                    </div>
                  )}
                </div>

              </div>

              {/* Compliance Issues */}
              {selectedDevice.complianceIssues && selectedDevice.complianceIssues.length > 0 && (
                <div className="pb-4 border-b border-gray-200 dark:border-gray-700/60">
                  <h3 className="hig-headline text-gray-900 dark:text-gray-100 mb-4">Compliance Issues</h3>
                  <div className="space-y-3">
                    {selectedDevice.complianceIssues.map((issue, index) => (
                      <div key={index} className="hig-card bg-gray-50 dark:bg-gray-700/30 p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: getSeverityColor(issue.severity) }}
                            />
                            <span className="hig-body font-semibold text-gray-900 dark:text-gray-100">
                              {issue.policy}
                            </span>
                          </div>
                          <span 
                            className="hig-badge"
                            style={{ 
                              backgroundColor: `${getSeverityColor(issue.severity)}20`,
                              color: getSeverityColor(issue.severity)
                            }}
                          >
                            {issue.severity.toUpperCase()}
                          </span>
                        </div>
                        <p className="hig-body text-gray-600 dark:text-gray-400">
                          {issue.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Active Threats */}
              {selectedDevice.threatDetails && selectedDevice.threatDetails.length > 0 && (
                <div className="pb-4 border-b border-gray-200 dark:border-gray-700/60">
                  <h3 className="hig-headline text-gray-900 dark:text-gray-100 mb-4">Active Threats</h3>
                  <div className="space-y-3">
                    {selectedDevice.threatDetails.map((threat) => (
                      <div key={threat.id} className="hig-card bg-gray-50 dark:bg-gray-700/30 p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: getSeverityColor(threat.severity) }}
                            />
                            <span className="hig-body font-semibold text-gray-900 dark:text-gray-100">
                              {threat.type}
                            </span>
                            <span className="hig-caption text-gray-500 dark:text-gray-400 font-mono">
                              {threat.id}
                            </span>
                          </div>
                          <span 
                            className="hig-badge"
                            style={{ 
                              backgroundColor: `${getSeverityColor(threat.severity)}20`,
                              color: getSeverityColor(threat.severity)
                            }}
                          >
                            {threat.severity.toUpperCase()}
                          </span>
                        </div>
                        <p className="hig-body text-gray-600 dark:text-gray-400 mb-2">
                          {threat.description}
                        </p>
                        <p className="hig-caption text-gray-500 dark:text-gray-400">
                          Detected: {threat.detected}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              </div>
            </div>

            {/* Modal Footer - Fixed */}
            <div 
              className="sticky bottom-0 z-10 backdrop-blur-xl backdrop-saturate-150 bg-white/80 dark:bg-gray-900/80 border-t border-gray-200 dark:border-gray-700/60 p-6 pt-4"
              style={{
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                backdropFilter: 'blur(20px) saturate(180%)'
              }}
            >
              <div className="flex items-center justify-end gap-3">
                <button className="hig-button hig-button-secondary">
                  Scan
                </button>
                {selectedDevice.vulnerabilities > 0 && (
                  <button 
                    className="hig-button"
                    style={{
                      backgroundColor: '#ea580c',
                      color: 'white'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#FF8500'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#ea580c'
                    }}
                  >
                    Patch
                  </button>
                )}
                <button className="hig-button hig-button-primary">
                  View Full Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

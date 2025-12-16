'use client'

import { useEffect, useState } from 'react'
import { usePageTitle } from '@/app/page-title-context'

interface Identity {
  id: string
  name: string
  email: string
  role: string
  department: string
  status: 'active' | 'inactive' | 'locked'
  riskScore: number
  lastLogin: string
  mfaEnabled: boolean
  permissions: string[]
  accessLevel: 'admin' | 'user' | 'guest'
  // SOC-specific fields
  activeSessions?: number
  accountCreated?: string
  passwordLastChanged?: string
  failedLoginAttempts?: number
  lastPasswordChange?: string
  relatedIncidents?: Array<{
    id: string
    severity: 'critical' | 'high' | 'medium' | 'low'
    title: string
    date: string
  }>
  recentActivity?: Array<{
    action: string
    timestamp: string
    location?: string
    ip?: string
  }>
  anomalousActivity?: boolean
}

export default function IdentitiesPage() {
  const { setPageTitle } = usePageTitle()
  const [activeTab, setActiveTab] = useState<string>('all')
  const [selectedIdentity, setSelectedIdentity] = useState<Identity | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    setPageTitle('Identities')
  }, [setPageTitle])

  const identities: Identity[] = [
    {
      id: 'USR-001',
      name: 'Peter Pan',
      email: 'peter.pan@neverlands.art',
      role: 'Security Analyst',
      department: 'Security Operations',
      status: 'active',
      riskScore: 15,
      lastLogin: '5 minutes ago',
      mfaEnabled: true,
      permissions: ['Read Alerts', 'Manage Incidents', 'View Reports'],
      accessLevel: 'user',
      activeSessions: 2,
      accountCreated: '2023-03-15',
      passwordLastChanged: '30 days ago',
      failedLoginAttempts: 0,
      relatedIncidents: [],
      recentActivity: [
        { action: 'Logged in', timestamp: '5 minutes ago', location: 'New York, US', ip: '192.168.1.45' },
        { action: 'Viewed dashboard', timestamp: '1 hour ago', location: 'New York, US', ip: '192.168.1.45' },
        { action: 'Accessed incident report', timestamp: '2 hours ago', location: 'New York, US', ip: '192.168.1.45' }
      ],
      anomalousActivity: false
    },
    {
      id: 'USR-002',
      name: 'Sarah Chen',
      email: 'sarah.chen@neverlands.art',
      role: 'SOC Manager',
      department: 'Security Operations',
      status: 'active',
      riskScore: 8,
      lastLogin: '2 hours ago',
      mfaEnabled: true,
      permissions: ['Full Access', 'User Management', 'System Configuration'],
      accessLevel: 'admin',
      activeSessions: 1,
      accountCreated: '2022-11-20',
      passwordLastChanged: '15 days ago',
      failedLoginAttempts: 0,
      relatedIncidents: [],
      recentActivity: [
        { action: 'Logged in', timestamp: '2 hours ago', location: 'San Francisco, US', ip: '10.0.2.15' },
        { action: 'Modified user permissions', timestamp: '3 hours ago', location: 'San Francisco, US', ip: '10.0.2.15' }
      ],
      anomalousActivity: false
    },
    {
      id: 'USR-003',
      name: 'Mike Johnson',
      email: 'mike.johnson@company.com',
      role: 'Developer',
      department: 'Engineering',
      status: 'inactive',
      riskScore: 42,
      lastLogin: '3 days ago',
      mfaEnabled: false,
      permissions: ['Read Alerts', 'View Reports'],
      accessLevel: 'user',
      activeSessions: 0,
      accountCreated: '2024-01-10',
      passwordLastChanged: '90 days ago',
      failedLoginAttempts: 3,
      relatedIncidents: [
        { id: 'INC-2024-0123', severity: 'medium', title: 'Suspicious login attempt', date: '3 days ago' }
      ],
      recentActivity: [
        { action: 'Failed login attempt', timestamp: '3 days ago', location: 'Unknown', ip: '45.123.67.89' },
        { action: 'Failed login attempt', timestamp: '4 days ago', location: 'Unknown', ip: '45.123.67.89' }
      ],
      anomalousActivity: true
    },
    {
      id: 'USR-004',
      name: 'Sarah Williams',
      email: 'sarah.williams@company.com',
      role: 'Admin',
      department: 'IT',
      status: 'active',
      riskScore: 12,
      lastLogin: '1 hour ago',
      mfaEnabled: true,
      permissions: ['Full Access', 'System Configuration'],
      accessLevel: 'admin',
      activeSessions: 3,
      accountCreated: '2023-06-05',
      passwordLastChanged: '7 days ago',
      failedLoginAttempts: 0,
      relatedIncidents: [],
      recentActivity: [
        { action: 'Logged in', timestamp: '1 hour ago', location: 'London, UK', ip: '172.16.0.42' },
        { action: 'System configuration changed', timestamp: '2 hours ago', location: 'London, UK', ip: '172.16.0.42' }
      ],
      anomalousActivity: false
    },
    {
      id: 'USR-005',
      name: 'Robert Brown',
      email: 'robert.brown@company.com',
      role: 'Contractor',
      department: 'External',
      status: 'locked',
      riskScore: 78,
      lastLogin: '1 week ago',
      mfaEnabled: false,
      permissions: ['Read Only'],
      accessLevel: 'guest',
      activeSessions: 0,
      accountCreated: '2024-02-01',
      passwordLastChanged: 'Never',
      failedLoginAttempts: 12,
      relatedIncidents: [
        { id: 'INC-2024-0189', severity: 'high', title: 'Multiple failed login attempts', date: '1 week ago' },
        { id: 'INC-2024-0190', severity: 'critical', title: 'Account locked due to security breach', date: '1 week ago' }
      ],
      recentActivity: [
        { action: 'Account locked', timestamp: '1 week ago', location: 'Unknown', ip: '203.0.113.45' },
        { action: 'Multiple failed login attempts', timestamp: '1 week ago', location: 'Unknown', ip: '203.0.113.45' }
      ],
      anomalousActivity: true
    }
  ]

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      active: '#34C759',      // System green
      inactive: '#FF9500',    // System orange
      locked: '#FF3B30'       // System red
    }
    return colors[status] || '#8E8E93'
  }

  const getRiskColor = (score: number): string => {
    if (score >= 70) return '#FF3B30'  // System red
    if (score >= 40) return '#FF9500'  // System orange
    return '#34C759'                   // System green
  }

  const getAccessLevelColor = (level: string): string => {
    const colors: Record<string, string> = {
      admin: '#AF52DE',    // System purple
      user: '#007AFF',     // System blue
      guest: '#8E8E93'     // System gray
    }
    return colors[level] || '#8E8E93'
  }

  const filteredIdentities = identities.filter(identity => {
    const matchesTab = activeTab === 'all' || identity.accessLevel === activeTab
    const matchesSearch = identity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         identity.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         identity.department.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesTab && matchesSearch
  })

  const stats = {
    total: identities.length,
    active: identities.filter(i => i.status === 'active').length,
    mfaEnabled: identities.filter(i => i.mfaEnabled).length,
    atRisk: identities.filter(i => i.riskScore >= 70).length
  }

  return (
    <div className="py-8 w-full max-w-7xl mx-auto">
      <div className="mb-6 px-4 hig-fade-in">
        <h1 className="hig-title-large text-gray-900 dark:text-gray-100 mb-2">Identity & Access Management</h1>
        <p className="hig-body text-gray-600 dark:text-gray-400">Manage and monitor user identities, access rights, and permissions</p>
      </div>

      {/* User Statistics Bar */}
      <div className="mb-6 pb-4 px-4 border-b border-gray-200 dark:border-gray-700/60">
        <div className="flex items-center gap-8 flex-wrap">
          <span className="hig-caption text-gray-600 dark:text-gray-400 font-medium">Users:</span>
          <div className="flex items-center gap-2">
            <span className="hig-body font-semibold text-gray-900 dark:text-gray-100">{stats.total}</span>
            <span className="hig-caption text-gray-600 dark:text-gray-400">Total</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#34C759] rounded-full"></div>
            <span className="hig-body font-semibold text-[#34C759]">{stats.active}</span>
            <span className="hig-caption text-gray-600 dark:text-gray-400">Active</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#007AFF] rounded-full"></div>
            <span className="hig-body font-semibold text-[#007AFF]">{stats.mfaEnabled}</span>
            <span className="hig-caption text-gray-600 dark:text-gray-400">MFA Enabled</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#FF3B30] rounded-full"></div>
            <span className="hig-body font-semibold text-[#FF3B30]">{stats.atRisk}</span>
            <span className="hig-caption text-gray-600 dark:text-gray-400">High Risk</span>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 px-4">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-1">
            <input 
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="hig-input w-full"
            />
          </div>
          <button className="hig-button hig-button-primary">
            + Add User
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {['all', 'admin', 'user', 'guest'].map(level => (
            <button
              key={level}
              onClick={() => setActiveTab(level)}
              className={`hig-button hig-button-secondary ${
                activeTab === level
                  ? 'bg-[#393A84] dark:bg-[#393A84] text-white'
                  : ''
              }`}
            >
              {level === 'all' ? 'All Users' : level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Identities List */}
      <div className="px-4">
        <div className="hig-card">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700/60 mb-0">
            <h2 className="hig-headline text-gray-900 dark:text-gray-100">Users & Access</h2>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700/60">
          {filteredIdentities.map((identity) => {
            const statusColor = getStatusColor(identity.status)
            const riskColor = getRiskColor(identity.riskScore)
            const accessColor = getAccessLevelColor(identity.accessLevel)
            
            return (
              <div
                key={identity.id}
                onClick={() => setSelectedIdentity(identity)}
                className="p-6 hover:bg-gray-50 dark:hover:bg-[#334155]/30 cursor-pointer"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 bg-[#007AFF]/20 dark:bg-[#007AFF]/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="hig-body font-semibold text-[#007AFF] dark:text-[#007AFF]">
                        {identity.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="hig-body font-semibold text-gray-900 dark:text-gray-100">{identity.name}</h3>
                        <span 
                          className="hig-badge"
                          style={{
                            backgroundColor: `${accessColor}20`,
                            color: accessColor
                          }}
                        >
                          {identity.accessLevel.toUpperCase()}
                        </span>
                        {identity.mfaEnabled && (
                          <span 
                            className="hig-badge"
                            style={{
                              backgroundColor: '#34C75920',
                              color: '#34C759'
                            }}
                          >
                            MFA
                          </span>
                        )}
                      </div>
                      <div className="hig-caption text-gray-600 dark:text-gray-400 mb-2">{identity.email}</div>
                      <div className="flex items-center gap-4 flex-wrap hig-caption text-gray-600 dark:text-gray-400">
                        <span>{identity.role} • {identity.department}</span>
                        <span>Last login: {identity.lastLogin}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-right">
                      <div className="hig-caption text-gray-600 dark:text-gray-400 mb-1">Risk Score</div>
                      <div 
                        className="hig-metric-value text-3xl"
                        style={{ 
                          color: riskColor,
                          WebkitTextFillColor: riskColor
                        }}
                      >
                        {identity.riskScore}
                      </div>
                    </div>
                    <span 
                      className="hig-badge"
                      style={{
                        backgroundColor: `${statusColor}20`,
                        color: statusColor
                      }}
                    >
                      {identity.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
          </div>
        </div>
      </div>

      {/* Identity Detail Modal */}
      {selectedIdentity && (
        <div 
          className="hig-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedIdentity(null)}
        >
          <div 
            className="hig-modal p-0 max-w-4xl w-full flex flex-col max-h-[90vh]" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header - Fixed */}
            <div 
              className="sticky top-0 z-10 backdrop-blur-xl backdrop-saturate-150 bg-white/80 dark:bg-[#1E293B]/80 border-b border-gray-200 dark:border-gray-700/60 p-6 pb-4"
              style={{
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                backdropFilter: 'blur(20px) saturate(180%)'
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-[#007AFF]/20 dark:bg-[#007AFF]/20 rounded-full flex items-center justify-center">
                    <span className="hig-body font-semibold text-[#007AFF] dark:text-[#007AFF]">
                      {selectedIdentity.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h2 className="hig-headline text-gray-900 dark:text-gray-100 mb-1">
                      {selectedIdentity.name}
                    </h2>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="hig-caption text-gray-600 dark:text-gray-400 font-mono">
                        {selectedIdentity.id}
                      </span>
                      <span className="hig-caption text-gray-400">•</span>
                      <span 
                        className="hig-badge"
                        style={{ 
                          backgroundColor: `${getStatusColor(selectedIdentity.status)}20`,
                          color: getStatusColor(selectedIdentity.status)
                        }}
                      >
                        {selectedIdentity.status.toUpperCase()}
                      </span>
                      <span className="hig-caption text-gray-400">•</span>
                      <span className="hig-caption text-gray-600 dark:text-gray-400">
                        Last login: {selectedIdentity.lastLogin}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedIdentity(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {/* Risk Indicator Bar */}
              <div 
                className="h-1 rounded-full"
                style={{
                  backgroundColor: getRiskColor(selectedIdentity.riskScore),
                  boxShadow: `0 0 8px ${getRiskColor(selectedIdentity.riskScore)}40`
                }}
              />
            </div>

            {/* User Info - Scrollable */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="hig-card bg-gray-50 dark:bg-[#334155]/30 p-4 text-center">
                    <div className="hig-caption text-gray-600 dark:text-gray-400 mb-2">Risk Score</div>
                    <div 
                      className="hig-metric-value text-4xl"
                      style={{ 
                        color: getRiskColor(selectedIdentity.riskScore),
                        WebkitTextFillColor: getRiskColor(selectedIdentity.riskScore)
                      }}
                    >
                      {selectedIdentity.riskScore}
                    </div>
                  </div>
                  <div className="hig-card bg-gray-50 dark:bg-[#334155]/30 p-4 text-center">
                    <div className="hig-caption text-gray-600 dark:text-gray-400 mb-2">Active Sessions</div>
                    <div className="hig-metric-value text-4xl text-gray-900 dark:text-gray-100">
                      {selectedIdentity.activeSessions ?? 0}
                    </div>
                  </div>
                  <div className="hig-card bg-gray-50 dark:bg-[#334155]/30 p-4 text-center">
                    <div className="hig-caption text-gray-600 dark:text-gray-400 mb-2">Failed Logins</div>
                    <div 
                      className="hig-metric-value text-4xl"
                      style={{ 
                        color: (selectedIdentity.failedLoginAttempts ?? 0) > 5 ? '#FF3B30' : (selectedIdentity.failedLoginAttempts ?? 0) > 0 ? '#FF9500' : '#34C759',
                        WebkitTextFillColor: (selectedIdentity.failedLoginAttempts ?? 0) > 5 ? '#FF3B30' : (selectedIdentity.failedLoginAttempts ?? 0) > 0 ? '#FF9500' : '#34C759'
                      }}
                    >
                      {selectedIdentity.failedLoginAttempts ?? 0}
                    </div>
                  </div>
                  <div className="hig-card bg-gray-50 dark:bg-[#334155]/30 p-4 text-center">
                    <div className="hig-caption text-gray-600 dark:text-gray-400 mb-2">Permissions</div>
                    <div className="hig-metric-value text-4xl text-gray-900 dark:text-gray-100">
                      {selectedIdentity.permissions.length}
                    </div>
                  </div>
                </div>

                {/* Anomalous Activity Alert */}
                {selectedIdentity.anomalousActivity && (
                  <div className="hig-card bg-[#FF3B30]/10 dark:bg-[#FF3B30]/20 border border-[#FF3B30]/30 p-4">
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-[#FF3B30] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <div className="hig-body font-semibold text-[#FF3B30] mb-1">Anomalous Activity Detected</div>
                        <div className="hig-caption text-gray-600 dark:text-gray-400">This account shows unusual patterns and requires review</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Account Information */}
                <div className="pb-4 border-b border-gray-200 dark:border-gray-700/60">
                  <h3 className="hig-headline mb-4">Account Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="hig-caption text-gray-600 dark:text-gray-400">Email:</span>
                      <span className="hig-body text-gray-900 dark:text-gray-100 font-medium">{selectedIdentity.email}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="hig-caption text-gray-600 dark:text-gray-400">Role:</span>
                      <span className="hig-body text-gray-900 dark:text-gray-100 font-medium">{selectedIdentity.role}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="hig-caption text-gray-600 dark:text-gray-400">Department:</span>
                      <span className="hig-body text-gray-900 dark:text-gray-100 font-medium">{selectedIdentity.department}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="hig-caption text-gray-600 dark:text-gray-400">Access Level:</span>
                      <span 
                        className="hig-badge"
                        style={{
                          backgroundColor: `${getAccessLevelColor(selectedIdentity.accessLevel)}20`,
                          color: getAccessLevelColor(selectedIdentity.accessLevel)
                        }}
                      >
                        {selectedIdentity.accessLevel.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="hig-caption text-gray-600 dark:text-gray-400">MFA Status:</span>
                      <span 
                        className="hig-badge"
                        style={{
                          backgroundColor: selectedIdentity.mfaEnabled ? '#34C75920' : '#FF3B3020',
                          color: selectedIdentity.mfaEnabled ? '#34C759' : '#FF3B30'
                        }}
                      >
                        {selectedIdentity.mfaEnabled ? 'ENABLED' : 'DISABLED'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="hig-caption text-gray-600 dark:text-gray-400">Account Created:</span>
                      <span className="hig-body text-gray-900 dark:text-gray-100 font-medium">{selectedIdentity.accountCreated || 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="hig-caption text-gray-600 dark:text-gray-400">Password Last Changed:</span>
                      <span className="hig-body text-gray-900 dark:text-gray-100 font-medium">{selectedIdentity.passwordLastChanged || 'Never'}</span>
                    </div>
                  </div>
                </div>

                {/* Related Incidents */}
                {selectedIdentity.relatedIncidents && selectedIdentity.relatedIncidents.length > 0 && (
                  <div className="pb-4 border-b border-gray-200 dark:border-gray-700/60">
                    <h3 className="hig-headline mb-4">Related Security Incidents</h3>
                    <div className="space-y-3">
                      {selectedIdentity.relatedIncidents.map((incident, idx) => {
                        const severityColors: Record<string, string> = {
                          critical: '#FF3B30',
                          high: '#FF9500',
                          medium: '#FFCC00',
                          low: '#007AFF'
                        }
                        const severityColor = severityColors[incident.severity] || '#8E8E93'
                        return (
                          <div key={idx} className="hig-card bg-gray-50 dark:bg-[#334155]/30 p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="hig-body font-semibold text-gray-900 dark:text-gray-100">{incident.title}</span>
                                  <span 
                                    className="hig-badge"
                                    style={{
                                      backgroundColor: `${severityColor}20`,
                                      color: severityColor
                                    }}
                                  >
                                    {incident.severity.toUpperCase()}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="hig-caption text-gray-600 dark:text-gray-400 font-mono">{incident.id}</span>
                                  <span className="hig-caption text-gray-400">•</span>
                                  <span className="hig-caption text-gray-600 dark:text-gray-400">{incident.date}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Recent Activity */}
                {selectedIdentity.recentActivity && selectedIdentity.recentActivity.length > 0 && (
                  <div className="pb-4 border-b border-gray-200 dark:border-gray-700/60">
                    <h3 className="hig-headline mb-4">Recent Activity</h3>
                    <div className="space-y-3">
                      {selectedIdentity.recentActivity.slice(0, 5).map((activity, idx) => (
                        <div key={idx} className="flex items-start gap-3 pb-3 border-b border-gray-200 dark:border-gray-700/60 last:border-0 last:pb-0">
                          <div className="w-2 h-2 rounded-full bg-[#007AFF] mt-2 flex-shrink-0"></div>
                          <div className="flex-1 min-w-0">
                            <div className="hig-body text-gray-900 dark:text-gray-100 font-medium mb-1">{activity.action}</div>
                            <div className="flex items-center gap-2 flex-wrap hig-caption text-gray-600 dark:text-gray-400">
                              <span>{activity.timestamp}</span>
                              {activity.location && (
                                <>
                                  <span>•</span>
                                  <span>{activity.location}</span>
                                </>
                              )}
                              {activity.ip && (
                                <>
                                  <span>•</span>
                                  <span className="font-mono">{activity.ip}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Permissions */}
                {selectedIdentity.permissions.length > 0 && (
                  <div>
                    <h3 className="hig-headline mb-4">Permissions</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedIdentity.permissions.map((permission, idx) => (
                        <span 
                          key={idx} 
                          className="hig-badge"
                          style={{
                            backgroundColor: 'rgba(142, 142, 147, 0.2)',
                            color: '#8E8E93'
                          }}
                        >
                          {permission}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
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
              <div className="grid grid-cols-2 gap-4">
                <button className="hig-button hig-button-primary">
                  Edit User
                </button>
                <button 
                  className="hig-button"
                  style={{
                    backgroundColor: '#FF3B30',
                    color: 'white',
                    transition: 'opacity 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '0.9'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1'
                  }}
                >
                  {selectedIdentity.status === 'locked' ? 'Unlock User' : 'Lock User'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

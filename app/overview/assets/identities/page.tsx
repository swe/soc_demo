'use client'

import { useEffect, useState } from 'react'
import { usePageTitle } from '@/app/page-title-context'
import { PageHeader, Card, Badge } from '@/components/ui/card'

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
      accessLevel: 'user'
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
      accessLevel: 'admin'
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
      accessLevel: 'user'
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
      accessLevel: 'admin'
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
      accessLevel: 'guest'
    }
  ]

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-emerald-600 dark:bg-emerald-700/20 text-green-700 dark:text-green-400',
      inactive: 'bg-amber-600 dark:bg-amber-700/20 text-yellow-700 dark:text-yellow-400',
      locked: 'bg-rose-600 dark:bg-rose-700/20 text-red-700 dark:text-red-400'
    }
    return colors[status as keyof typeof colors]
  }

  const getRiskColor = (score: number) => {
    if (score >= 70) return 'text-rose-700 dark:text-rose-400'
    if (score >= 40) return 'text-amber-700 dark:text-amber-400'
    return 'text-emerald-700 dark:text-emerald-400'
  }

  const getAccessLevelColor = (level: string) => {
    const colors = {
      admin: 'bg-indigo-500/20 text-purple-700 dark:text-purple-400',
      user: 'bg-indigo-600 dark:bg-indigo-600/20 text-blue-700 dark:text-blue-400',
      guest: 'bg-gray-500/20 text-gray-700 dark:text-gray-400'
    }
    return colors[level as keyof typeof colors]
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
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-7xl mx-auto">
      <PageHeader 
        title="Identity & Access Management" 
        description="Manage and monitor user identities, access rights, and permissions" 
      />

      {/* Sticky Status Bar */}
      <div className="sticky top-16 z-40 before:absolute before:inset-0 before:backdrop-blur-md before:bg-white/90 dark:before:bg-gray-800/90 before:-z-10 border-b border-gray-200 dark:border-gray-700/60 mb-6 -mx-4 sm:-mx-6 lg:-mx-8">
        <div className="px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-6">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {identities.length} Total Users
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-600 dark:bg-emerald-700 rounded-full"></div>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {identities.filter(i => i.status === 'active').length} Active
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-indigo-600 dark:bg-indigo-600 rounded-full"></div>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {identities.filter(i => i.mfaEnabled).length} MFA Enabled
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-rose-600 dark:bg-rose-700 rounded-full animate-pulse"></div>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {identities.filter(i => i.riskScore >= 70).length} High Risk
                </span>
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
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input w-full bg-white dark:bg-gray-800"
            />
          </div>
          <button className="btn bg-indigo-600 dark:bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-700 text-white">
            + Add User
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {['all', 'admin', 'user', 'guest'].map(level => (
            <button
              key={level}
              onClick={() => setActiveTab(level)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === level
                  ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-sm'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              {level === 'all' ? 'All Users' : level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Identities List */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Users & Access</h2>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredIdentities.map((identity) => (
            <div
              key={identity.id}
              onClick={() => setSelectedIdentity(identity)}
              className="p-6 hover:bg-gray-50 dark:hover:bg-gray-900/20 cursor-pointer transition-all duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 bg-indigo-600 dark:bg-indigo-500/20 rounded-full flex items-center justify-center">
                    <span className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">
                      {identity.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100">{identity.name}</h3>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getAccessLevelColor(identity.accessLevel)}`}>
                        {identity.accessLevel.toUpperCase()}
                      </span>
                      {identity.mfaEnabled && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-600 dark:bg-emerald-700/20 text-green-700 dark:text-green-400">
                          MFA
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">{identity.email}</div>
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      <span>{identity.role} • {identity.department}</span>
                      <span>Last login: {identity.lastLogin}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Risk Score</div>
                    <div className={`text-2xl font-bold ${getRiskColor(identity.riskScore)}`}>{identity.riskScore}</div>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(identity.status)}`}>
                    {identity.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Identity Detail Panel */}
      {selectedIdentity && (
        <>
          <div 
            className="fixed inset-0 bg-gray-900/50 z-40"
            onClick={() => setSelectedIdentity(null)}
          />
          <div className="fixed inset-y-0 right-0 w-full md:w-2/3 lg:w-1/2 bg-white dark:bg-gray-800 shadow-xl z-50 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">User Details</h2>
                <button
                  onClick={() => setSelectedIdentity(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-indigo-600 dark:bg-indigo-500/20 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400">
                      {selectedIdentity.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-gray-800 dark:text-gray-100">{selectedIdentity.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{selectedIdentity.id}</div>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Email</div>
                  <div className="text-gray-800 dark:text-gray-100">{selectedIdentity.email}</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Role</div>
                    <div className="text-gray-800 dark:text-gray-100">{selectedIdentity.role}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Department</div>
                    <div className="text-gray-800 dark:text-gray-100">{selectedIdentity.department}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Status</div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedIdentity.status)}`}>
                      {selectedIdentity.status.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Access Level</div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getAccessLevelColor(selectedIdentity.accessLevel)}`}>
                      {selectedIdentity.accessLevel.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Risk Score</div>
                  <div className={`text-3xl font-bold ${getRiskColor(selectedIdentity.riskScore)}`}>{selectedIdentity.riskScore}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Last Login</div>
                  <div className="text-gray-800 dark:text-gray-100">{selectedIdentity.lastLogin}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Multi-Factor Authentication</div>
                  <div className="flex items-center gap-2">
                    {selectedIdentity.mfaEnabled ? (
                      <>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-600 dark:bg-emerald-700/20 text-green-700 dark:text-green-400">
                          ENABLED
                        </span>
                        <svg className="w-5 h-5 text-emerald-700 dark:text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </>
                    ) : (
                      <>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-rose-600 dark:bg-rose-700/20 text-red-700 dark:text-red-400">
                          DISABLED
                        </span>
                        <svg className="w-5 h-5 text-rose-700 dark:text-rose-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Permissions</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedIdentity.permissions.map((permission, idx) => (
                      <span key={idx} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                        {permission}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-2 gap-3">
                    <button className="btn bg-indigo-600 dark:bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-700 text-white">
                      Edit User
                    </button>
                    <button className="btn bg-rose-600 dark:bg-rose-700 hover:bg-red-600 text-white">
                      {selectedIdentity.status === 'locked' ? 'Unlock User' : 'Lock User'}
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

'use client'

import { useEffect, useState } from 'react'
import { usePageTitle } from '@/app/page-title-context'
import { formatNumber } from '@/lib/utils'

interface CloudProvider {
  id: string
  name: string
  type: 'aws' | 'azure' | 'gcp' | 'oci' | 'alibaba'
  status: 'connected' | 'disconnected' | 'error' | 'pending'
  accounts: number
  regions: string[]
  lastSync: string
  resources: {
    total: number
    monitored: number
  }
  alerts: {
    critical: number
    high: number
    medium: number
    low: number
  }
  logo: string
  color: string
}

export default function CloudIntegrations() {
  const { setPageTitle } = usePageTitle()
  const [selectedProvider, setSelectedProvider] = useState<CloudProvider | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    setPageTitle('Cloud Integrations')
  }, [setPageTitle])

  const cloudProviders: CloudProvider[] = [
    {
      id: 'aws-1',
      name: 'AWS Production',
      type: 'aws',
      status: 'connected',
      accounts: 5,
      regions: ['us-east-1', 'eu-west-1', 'ap-southeast-1'],
      lastSync: '2 minutes ago',
      resources: { total: 1247, monitored: 1189 },
      alerts: { critical: 3, high: 12, medium: 45, low: 89 },
      logo: '☁️',
      color: 'bg-orange-600 dark:bg-orange-700'
    },
    {
      id: 'azure-1',
      name: 'Azure Enterprise',
      type: 'azure',
      status: 'connected',
      accounts: 3,
      regions: ['East US', 'West Europe', 'Southeast Asia'],
      lastSync: '5 minutes ago',
      resources: { total: 843, monitored: 821 },
      alerts: { critical: 1, high: 8, medium: 23, low: 67 },
      logo: '☁️',
      color: 'bg-indigo-600 dark:bg-indigo-500'
    },
    {
      id: 'gcp-1',
      name: 'Google Cloud',
      type: 'gcp',
      status: 'connected',
      accounts: 2,
      regions: ['us-central1', 'europe-west1'],
      lastSync: '8 minutes ago',
      resources: { total: 456, monitored: 445 },
      alerts: { critical: 0, high: 5, medium: 18, low: 34 },
      logo: '☁️',
      color: 'bg-[#e11d48] dark:bg-[#e11d48]'
    },
    {
      id: 'oci-1',
      name: 'Oracle Cloud',
      type: 'oci',
      status: 'disconnected',
      accounts: 1,
      regions: ['us-ashburn-1'],
      lastSync: '2 hours ago',
      resources: { total: 123, monitored: 0 },
      alerts: { critical: 0, high: 0, medium: 0, low: 0 },
      logo: '☁️',
      color: 'bg-red-600'
    },
  ]

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      connected: '#059669',
      disconnected: '#6b7280',
      error: '#e11d48',
      pending: '#ea580c'
    }
    return colors[status] || '#6b7280'
  }

  const getProviderIcon = (type: string) => {
    const iconPaths: Record<string, string> = {
      aws: '/logos/aws.svg',
      azure: '/logos/azure.svg',
      gcp: '/logos/googlecloud.svg',
      oci: '/logos/oracle.svg',
      alibaba: '/logos/aws.svg' // fallback
    }
    return (
      <img 
        src={iconPaths[type] || iconPaths.aws} 
        alt={type} 
        className="w-8 h-8 brightness-0 invert"
      />
    )
  }

  return (
    <div className="py-4 w-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="sm:flex sm:justify-between sm:items-center mb-3 px-4 hig-fade-in">
        <div className="mb-4 sm:mb-0">
          <h1 className="hig-title-large text-gray-900 dark:text-gray-100">Cloud Integrations</h1>
          <p className="hig-body text-gray-600 dark:text-gray-400">Manage and monitor your cloud provider connections</p>
        </div>
        <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
          <button 
            onClick={() => setShowAddModal(true)}
            className="hig-button hig-button-primary"
          >
            Add Integration
          </button>
        </div>
      </div>

      {/* Cloud Provider Cards */}
      <div className="grid grid-cols-12 gap-4 mb-3 px-4">
        {cloudProviders.map((provider) => (
          <div key={provider.id} className="col-span-12 lg:col-span-6">
            <div className="hig-card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className={`${provider.color} text-white p-3 rounded-lg`}>
                    {getProviderIcon(provider.type)}
                  </div>
                  <div>
                    <h3 className="hig-headline text-gray-900 dark:text-gray-100">{provider.name}</h3>
                    <p className="hig-caption text-gray-600 dark:text-gray-400 capitalize">{provider.type}</p>
                  </div>
                </div>
                <span 
                  className="hig-badge"
                  style={{
                    backgroundColor: `${getStatusColor(provider.status)}20`,
                    color: getStatusColor(provider.status)
                  }}
                >
                  {provider.status.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="hig-card bg-gray-50 dark:bg-gray-700/30 p-3 text-center">
                  <div className="hig-caption text-gray-600 dark:text-gray-400 mb-1">Accounts</div>
                  <div className="hig-metric-value text-3xl text-gray-900 dark:text-gray-100">{provider.accounts}</div>
                </div>
                <div className="hig-card bg-gray-50 dark:bg-gray-700/30 p-3 text-center">
                  <div className="hig-caption text-gray-600 dark:text-gray-400 mb-1">Resources</div>
                  <div className="hig-metric-value text-3xl text-gray-900 dark:text-gray-100">
                      {provider.resources.monitored}/{provider.resources.total}
                    </div>
                </div>
              </div>

              <div className="mb-4">
                <div className="hig-caption text-gray-600 dark:text-gray-400 mb-2">Active Regions</div>
                <div className="flex flex-wrap gap-2">
                  {provider.regions.map((region, idx) => (
                    <span key={idx} className="hig-badge bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                      {region}
                    </span>
                  ))}
                </div>
              </div>

              {provider.status === 'connected' && (
                <div className="mb-4">
                  <div className="hig-caption text-gray-600 dark:text-gray-400 mb-2">Active Alerts</div>
                  <div className="flex gap-2 flex-wrap">
                    {provider.alerts.critical > 0 && (
                      <span 
                        className="hig-badge"
                        style={{
                          backgroundColor: '#e11d4820',
                          color: '#e11d48'
                        }}
                      >
                        {provider.alerts.critical} Critical
                      </span>
                    )}
                    {provider.alerts.high > 0 && (
                      <span 
                        className="hig-badge"
                        style={{
                          backgroundColor: '#ea580c20',
                          color: '#ea580c'
                        }}
                      >
                        {provider.alerts.high} High
                      </span>
                    )}
                    {provider.alerts.medium > 0 && (
                      <span 
                        className="hig-badge"
                        style={{
                          backgroundColor: '#d9770620',
                          color: '#d97706'
                        }}
                      >
                        {provider.alerts.medium} Medium
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700/60">
                <span className="hig-caption text-gray-600 dark:text-gray-400">
                  Last sync: {provider.lastSync}
                </span>
                <div className="flex gap-2">
                  {provider.status === 'connected' ? (
                    <button className="hig-caption hig-link-hover">
                      Configure →
                    </button>
                  ) : (
                    <button className="hig-caption hig-link-hover">
                      Reconnect →
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Integration Statistics */}
      <div className="grid grid-cols-12 gap-4 px-4">
        <div className="col-span-12 lg:col-span-8">
          <div className="hig-card">
            <h2 className="hig-headline text-gray-900 dark:text-gray-100 mb-3 pb-4 border-b border-gray-200 dark:border-gray-700/60">Resource Distribution by Provider</h2>
            <div className="space-y-4">
              {cloudProviders.filter(p => p.status === 'connected').map((provider, idx) => {
                const percentage = (provider.resources.monitored / provider.resources.total) * 100
                return (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${provider.color}`}></div>
                      <span className="hig-body font-semibold text-gray-700 dark:text-gray-300">{provider.name}</span>
                    </div>
                    <span className="hig-body text-gray-600 dark:text-gray-400">
                      {provider.resources.monitored} / {provider.resources.total} resources
                    </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div className={`${provider.color} h-3 rounded-full`} style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4">
          <div className="hig-card">
            <h2 className="hig-headline text-gray-900 dark:text-gray-100 mb-3 pb-4 border-b border-gray-200 dark:border-gray-700/60">Quick Stats</h2>
            <div className="space-y-4">
              <div className="hig-card bg-gray-50 dark:bg-gray-700/30 p-4 text-center">
                <div className="hig-caption text-gray-600 dark:text-gray-400 mb-2">Total Providers</div>
                <div className="hig-metric-value text-3xl text-gray-900 dark:text-gray-100">
                  {cloudProviders.length}
                </div>
              </div>
              <div className="hig-card bg-gray-50 dark:bg-gray-700/30 p-4 text-center">
                <div className="hig-caption text-gray-600 dark:text-gray-400 mb-2">Active Connections</div>
                <div className="hig-metric-value text-3xl" style={{ color: '#059669', WebkitTextFillColor: '#059669' }}>
                  {cloudProviders.filter(p => p.status === 'connected').length}
                </div>
              </div>
              <div className="hig-card bg-gray-50 dark:bg-gray-700/30 p-4 text-center">
                <div className="hig-caption text-gray-600 dark:text-gray-400 mb-2">Total Resources</div>
                <div className="hig-metric-value text-3xl text-gray-900 dark:text-gray-100">
                  {formatNumber(cloudProviders.reduce((acc, p) => acc + p.resources.total, 0))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Integration Modal */}
      {showAddModal && (
        <>
          <div 
            className="hig-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setShowAddModal(false)}
          >
            <div 
              className="hig-modal p-0 max-w-4xl w-full flex flex-col max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Fixed Header */}
              <div 
                className="sticky top-0 z-10 backdrop-blur-xl backdrop-saturate-150 bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-700/60 p-6 pb-4"
                style={{
                  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                  backdropFilter: 'blur(20px) saturate(180%)'
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h2 className="hig-headline text-gray-900 dark:text-gray-100">Add Cloud Integration</h2>
                  <button 
                    onClick={() => setShowAddModal(false)} 
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto px-6 py-6">
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {['AWS', 'Azure', 'Google Cloud', 'Oracle Cloud', 'Alibaba Cloud'].map((provider, idx) => (
                    <button
                      key={idx}
                      className="hig-card p-4 text-center hover:bg-gray-50 dark:hover:bg-gray-700/30"
                    >
                      <div className="text-4xl mb-2">☁️</div>
                      <div className="hig-body font-semibold text-gray-900 dark:text-gray-100">{provider}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Fixed Footer */}
              <div 
                className="sticky bottom-0 z-10 backdrop-blur-xl backdrop-saturate-150 bg-white/80 dark:bg-gray-900/80 border-t border-gray-200 dark:border-gray-700/60 p-6 pt-4"
                style={{
                  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                  backdropFilter: 'blur(20px) saturate(180%)'
                }}
              >
                <button
                  onClick={() => setShowAddModal(false)}
                  className="hig-button hig-button-secondary w-full"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}


'use client'

import { useEffect, useState } from 'react'
import { usePageTitle } from '@/app/page-title-context'
import { PageHeader, Card, Badge } from '@/components/ui/card'

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
      color: 'bg-indigo-600 dark:bg-indigo-600'
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
      color: 'bg-rose-600 dark:bg-rose-700'
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

  const getStatusBadge = (status: string) => {
    const badges = {
      connected: 'bg-emerald-600 dark:bg-emerald-700/20 text-green-700 dark:text-green-400',
      disconnected: 'bg-gray-500/20 text-gray-700 dark:text-gray-400',
      error: 'bg-rose-600 dark:bg-rose-700/20 text-red-700 dark:text-red-400',
      pending: 'bg-amber-600 dark:bg-amber-700/20 text-yellow-700 dark:text-yellow-400'
    }
    return badges[status as keyof typeof badges]
  }

  const getProviderIcon = (type: string) => {
    const icons = {
      aws: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6.763 10.036c0 .296.032.535.088.71.064.176.144.368.256.576.04.063.056.127.056.183 0 .08-.048.16-.152.24l-.503.335a.383.383 0 0 1-.208.072c-.08 0-.16-.04-.239-.112a2.47 2.47 0 0 1-.287-.375 6.18 6.18 0 0 1-.248-.471c-.622.734-1.405 1.101-2.347 1.101-.67 0-1.205-.191-1.596-.574-.391-.384-.591-.896-.591-1.531 0-.678.239-1.226.726-1.644.487-.417 1.133-.626 1.955-.626.272 0 .551.024.846.064.296.04.6.104.918.176v-.583c0-.607-.127-1.031-.375-1.278-.255-.248-.686-.367-1.294-.367-.28 0-.568.031-.863.103-.295.072-.583.16-.862.272a2.287 2.287 0 0 1-.28.104.488.488 0 0 1-.127.023c-.112 0-.168-.08-.168-.247v-.391c0-.128.016-.224.056-.28a.597.597 0 0 1 .224-.167c.279-.144.614-.264 1.005-.36A5.84 5.84 0 0 1 5.16 4c.847 0 1.564.192 2.137.575.575.384.863.96.863 1.731v2.731zm-3.238 1.214c.263 0 .535-.048.822-.144.287-.096.543-.271.758-.51.128-.152.224-.32.272-.512.047-.191.08-.423.08-.694v-.335a6.66 6.66 0 0 0-.735-.136 6.02 6.02 0 0 0-.75-.048c-.535 0-.926.104-1.19.32-.263.215-.39.518-.39.917 0 .375.095.655.295.846.191.2.47.296.838.296zm6.41.862c-.144 0-.24-.024-.304-.08-.064-.048-.12-.16-.168-.311L7.586 5.55a1.398 1.398 0 0 1-.072-.32c0-.128.064-.2.191-.2h.783c.151 0 .255.025.31.08.065.048.113.16.16.312l1.342 5.284 1.245-5.284c.04-.16.088-.264.151-.312a.549.549 0 0 1 .32-.08h.638c.152 0 .256.025.32.08.063.048.12.16.151.312l1.261 5.348 1.381-5.348c.048-.16.104-.264.16-.312a.52.52 0 0 1 .311-.08h.743c.127 0 .2.065.2.2 0 .04-.009.08-.017.128a1.137 1.137 0 0 1-.056.2l-1.923 6.17c-.048.16-.104.263-.168.311a.51.51 0 0 1-.303.08h-.687c-.151 0-.255-.024-.32-.08-.063-.056-.119-.16-.15-.32l-1.238-5.148-1.23 5.14c-.04.16-.087.264-.15.32-.065.056-.177.08-.32.08zm10.256.215c-.415 0-.83-.048-1.229-.143-.399-.096-.71-.2-.918-.32-.128-.071-.215-.151-.247-.223a.563.563 0 0 1-.048-.224v-.407c0-.167.064-.247.183-.247.048 0 .096.008.144.024.048.016.12.048.2.08.271.12.566.215.878.279.319.064.63.096.95.096.502 0 .894-.088 1.165-.264a.86.86 0 0 0 .415-.758.777.777 0 0 0-.215-.559c-.144-.151-.415-.287-.807-.415l-1.157-.36c-.583-.183-1.014-.454-1.277-.798a1.797 1.797 0 0 1-.391-1.142c0-.331.072-.622.216-.878.143-.255.335-.479.574-.654.24-.184.51-.32.83-.415.32-.096.655-.136 1.006-.136.175 0 .359.008.535.032.183.024.35.056.518.088.16.04.312.08.455.127.144.048.256.096.336.144a.69.69 0 0 1 .24.2.43.43 0 0 1 .071.263v.375c0 .168-.064.256-.184.256a.83.83 0 0 1-.303-.096 3.78 3.78 0 0 0-1.532-.311c-.455 0-.815.071-1.062.223-.248.152-.367.383-.367.71 0 .224.08.416.24.567.159.152.454.304.877.44l1.134.358c.574.184.99.44 1.237.767.247.327.367.703.367 1.117 0 .343-.072.655-.207.926-.144.272-.344.51-.598.703-.256.192-.566.336-.942.431-.375.104-.774.152-1.197.152z"/>
        </svg>
      ),
      azure: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
          <path d="M22.379 23.343a1.62 1.62 0 0 0 1.536-2.14v.002L17.35 1.76A1.62 1.62 0 0 0 15.816.657H8.184A1.62 1.62 0 0 0 6.65 1.76L.086 21.204a1.62 1.62 0 0 0 1.536 2.139h4.741a1.62 1.62 0 0 0 1.535-1.103l.977-2.892 4.947 3.675c.28.208.618.32.966.32h7.591m-3.415-3.24h-5.419l3.018-8.93 2.401 8.93"/>
        </svg>
      ),
      gcp: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.19 2.38a9.344 9.344 0 0 0-9.234 6.893c.053-.02-.055.013 0 0-2.732 1.423-4.504 4.19-4.504 7.309 0 4.684 3.923 8.48 8.763 8.48h12.836C24.791 25.062 28 21.685 28 17.7a7.44 7.44 0 0 0-3.111-6.033v-.19c0-4.114-3.429-7.456-7.655-7.456-1.587 0-3.063.474-4.305 1.282a9.415 9.415 0 0 0-1.548-2.895l-.003-.007h.001c-.265-.348-.566-.673-.893-.97l-.028-.026a8.445 8.445 0 0 0-.624-.495 9.344 9.344 0 0 0-3.616-1.207 9.413 9.413 0 0 0-1.015-.054c-.37 0-.736.019-1.099.057h.05"/>
        </svg>
      ),
      oci: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.4 2.1c-3.7 0-6.7 3-6.7 6.7s3 6.7 6.7 6.7 6.7-3 6.7-6.7-3-6.7-6.7-6.7zm0 11.2c-2.5 0-4.5-2-4.5-4.5s2-4.5 4.5-4.5 4.5 2 4.5 4.5-2 4.5-4.5 4.5zM6.6 8.8c-3.7 0-6.7 3-6.7 6.7s3 6.7 6.7 6.7 6.7-3 6.7-6.7-3-6.7-6.7-6.7zm0 11.2c-2.5 0-4.5-2-4.5-4.5s2-4.5 4.5-4.5 4.5 2 4.5 4.5-2 4.5-4.5 4.5z"/>
        </svg>
      ),
      alibaba: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
        </svg>
      )
    }
    return icons[type as keyof typeof icons] || icons.aws
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="sm:flex sm:justify-between sm:items-center mb-6">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">Cloud Integrations</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage and monitor your cloud provider connections</p>
        </div>
        <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
          <button 
            onClick={() => setShowAddModal(true)}
            className="btn bg-indigo-600 dark:bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-700 text-white"
          >
            <svg className="w-4 h-4 fill-current opacity-50 shrink-0" viewBox="0 0 16 16">
              <path d="M15 7H9V1c0-.6-.4-1-1-1S7 .4 7 1v6H1c-.6 0-1 .4-1 1s.4 1 1 1h6v6c0 .6.4 1 1 1s1-.4 1-1V9h6c.6 0 1-.4 1-1s-.4-1-1-1z" />
            </svg>
            <span className="ml-2">Add Integration</span>
          </button>
        </div>
      </div>

      {/* Cloud Provider Cards */}
      <div className="grid grid-cols-12 gap-4 mb-6">
        {cloudProviders.map((provider) => (
          <div key={provider.id} className="col-span-12 lg:col-span-6">
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className={`${provider.color} text-white p-3 rounded-lg`}>
                    {getProviderIcon(provider.type)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{provider.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{provider.type}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(provider.status)}`}>
                  {provider.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-3">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Accounts</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{provider.accounts}</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-3">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Resources</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {provider.resources.monitored}/{provider.resources.total}
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Active Regions</div>
                <div className="flex flex-wrap gap-2">
                  {provider.regions.map((region, idx) => (
                    <span key={idx} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                      {region}
                    </span>
                  ))}
                </div>
              </div>

              {provider.status === 'connected' && (
                <div className="mb-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Active Alerts</div>
                  <div className="flex gap-2">
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-rose-600 dark:bg-rose-700/20 text-red-700 dark:text-red-400">
                      {provider.alerts.critical} Critical
                    </span>
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-orange-600 dark:bg-orange-700/20 text-orange-700 dark:text-orange-400">
                      {provider.alerts.high} High
                    </span>
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-amber-600 dark:bg-amber-700/20 text-yellow-700 dark:text-yellow-400">
                      {provider.alerts.medium} Medium
                    </span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Last sync: {provider.lastSync}
                </span>
                <div className="flex gap-2">
                  {provider.status === 'connected' ? (
                    <button className="text-sm text-indigo-600 hover:text-indigo-700 dark:hover:text-indigo-500 font-medium">
                      Configure
                    </button>
                  ) : (
                    <button className="text-sm text-indigo-600 hover:text-indigo-700 dark:hover:text-indigo-500 font-medium">
                      Reconnect
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Integration Statistics */}
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-8">
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Resource Distribution by Provider</h2>
            <div className="space-y-4">
              {cloudProviders.filter(p => p.status === 'connected').map((provider, idx) => {
                const percentage = (provider.resources.monitored / provider.resources.total) * 100
                return (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${provider.color}`}></div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{provider.name}</span>
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {provider.resources.monitored} / {provider.resources.total} resources
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div className={`${provider.color} h-3 rounded-full transition-all duration-200`} style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4">
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Quick Stats</h2>
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Providers</div>
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {cloudProviders.length}
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">Active Connections</div>
                <div className="text-3xl font-bold text-emerald-700 dark:text-emerald-400">
                  {cloudProviders.filter(p => p.status === 'connected').length}
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Resources</div>
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {cloudProviders.reduce((acc, p) => acc + p.resources.total, 0)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Integration Modal */}
      {showAddModal && (
        <>
          <div className="fixed inset-0 bg-gray-900/50 z-40" onClick={() => setShowAddModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Add Cloud Integration</h2>
                <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-500">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                {['AWS', 'Azure', 'Google Cloud', 'Oracle Cloud', 'Alibaba Cloud'].map((provider, idx) => (
                  <button
                    key={idx}
                    className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-indigo-600 dark:hover:border-indigo-600 transition-all duration-200 text-center"
                  >
                    <div className="text-4xl mb-2">☁️</div>
                    <div className="text-sm font-medium text-gray-800 dark:text-gray-100">{provider}</div>
                  </button>
                ))}
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="w-full btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white"
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


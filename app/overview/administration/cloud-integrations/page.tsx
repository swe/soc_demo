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
  resources: { total: number; monitored: number }
  alerts: { critical: number; high: number; medium: number; low: number }
  logo: string
  color: string
}

export default function CloudIntegrations() {
  const { setPageTitle } = usePageTitle()
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    setPageTitle('Cloud Integrations')
  }, [setPageTitle])

  const cloudProviders: CloudProvider[] = [
    {
      id: 'aws-1', name: 'AWS Production', type: 'aws', status: 'connected',
      accounts: 5, regions: ['us-east-1', 'eu-west-1', 'ap-southeast-1'], lastSync: '2 minutes ago',
      resources: { total: 1247, monitored: 1189 },
      alerts: { critical: 3, high: 12, medium: 45, low: 89 },
      logo: '☁️', color: 'bg-orange-600 dark:bg-orange-700'
    },
    {
      id: 'azure-1', name: 'Azure Enterprise', type: 'azure', status: 'connected',
      accounts: 3, regions: ['East US', 'West Europe', 'Southeast Asia'], lastSync: '5 minutes ago',
      resources: { total: 843, monitored: 821 },
      alerts: { critical: 1, high: 8, medium: 23, low: 67 },
      logo: '☁️', color: 'bg-indigo-600 dark:bg-indigo-500'
    },
    {
      id: 'gcp-1', name: 'Google Cloud', type: 'gcp', status: 'connected',
      accounts: 2, regions: ['us-central1', 'europe-west1'], lastSync: '8 minutes ago',
      resources: { total: 456, monitored: 445 },
      alerts: { critical: 0, high: 5, medium: 18, low: 34 },
      logo: '☁️', color: 'bg-[#e11d48] dark:bg-[#e11d48]'
    },
    {
      id: 'oci-1', name: 'Oracle Cloud', type: 'oci', status: 'disconnected',
      accounts: 1, regions: ['us-ashburn-1'], lastSync: '2 hours ago',
      resources: { total: 123, monitored: 0 },
      alerts: { critical: 0, high: 0, medium: 0, low: 0 },
      logo: '☁️', color: 'bg-red-600'
    },
  ]

  const getStatusColor = (status: string) => {
    const map: Record<string, string> = { connected: 'var(--soc-low)', disconnected: 'var(--soc-text-muted)', error: 'var(--soc-critical)', pending: 'var(--soc-high)' }
    return map[status] || 'var(--soc-text-muted)'
  }
  const getStatusBg = (status: string) => {
    const map: Record<string, string> = { connected: 'var(--soc-low-bg)', disconnected: 'var(--soc-border)', error: 'var(--soc-critical-bg)', pending: 'var(--soc-high-bg)' }
    return map[status] || 'var(--soc-border)'
  }

  const getProviderIcon = (type: string) => {
    const iconPaths: Record<string, string> = { aws: '/logos/aws.svg', azure: '/logos/azure.svg', gcp: '/logos/googlecloud.svg', oci: '/logos/oracle.svg', alibaba: '/logos/aws.svg' }
    return <img src={iconPaths[type] || iconPaths.aws} alt={type} className="w-8 h-8 brightness-0 invert" />
  }

  const connectedProviders = cloudProviders.filter(p => p.status === 'connected')
  const totalCritical = cloudProviders.reduce((s, p) => s + p.alerts.critical, 0)
  const totalMonitored = cloudProviders.reduce((s, p) => s + p.resources.monitored, 0)
  const totalResources = cloudProviders.reduce((s, p) => s + p.resources.total, 0)

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-6 hig-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="soc-label mb-1">ADMINISTRATION</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--soc-text)', lineHeight: 1.2 }}>Cloud Integrations</h1>
          <p style={{ color: 'var(--soc-text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Manage and monitor cloud provider connections</p>
        </div>
        <button className="soc-btn soc-btn-primary" onClick={() => setShowAddModal(true)}>Add Integration</button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'PROVIDERS', value: String(cloudProviders.length), sub: 'Configured' },
          { label: 'CONNECTED', value: String(connectedProviders.length), sub: 'Active connections', accent: true },
          { label: 'CRITICAL ALERTS', value: String(totalCritical), sub: 'Across all providers', err: totalCritical > 0 },
          { label: 'RESOURCES MONITORED', value: formatNumber(totalMonitored), sub: `of ${formatNumber(totalResources)} total` },
        ].map((kpi, i) => (
          <div key={i} className="soc-card" style={{ padding: '1.25rem' }}>
            <div className="soc-label mb-2">{kpi.label}</div>
            <div className="soc-metric-lg" style={kpi.err ? { color: 'var(--soc-critical)' } : kpi.accent ? { color: 'var(--soc-accent)' } : {}}>{kpi.value}</div>
            <div className="soc-metric-sm mt-1">{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Provider Cards */}
      <div className="grid grid-cols-12 gap-4 mb-4">
        {cloudProviders.map((provider) => (
          <div key={provider.id} className="col-span-12 lg:col-span-6">
            <div className="soc-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div className={`${provider.color} text-white p-2 rounded-lg`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '2.5rem', height: '2.5rem', borderRadius: '8px', flexShrink: 0 }}>
                    {getProviderIcon(provider.type)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--soc-text)', fontSize: '0.9375rem' }}>{provider.name}</div>
                    <div style={{ color: 'var(--soc-text-muted)', fontSize: '0.8125rem', textTransform: 'capitalize' }}>{provider.type}</div>
                  </div>
                </div>
                <span className="soc-badge" style={{ backgroundColor: getStatusBg(provider.status), color: getStatusColor(provider.status) }}>
                  {provider.status.toUpperCase()}
                </span>
              </div>

              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ background: 'var(--soc-raised)', border: '1px solid var(--soc-border)', borderRadius: '6px', padding: '0.75rem', textAlign: 'center' }}>
                  <div style={{ color: 'var(--soc-text-muted)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Accounts</div>
                  <div style={{ fontWeight: 700, fontSize: '1.5rem', color: 'var(--soc-text)' }}>{provider.accounts}</div>
                </div>
                <div style={{ background: 'var(--soc-raised)', border: '1px solid var(--soc-border)', borderRadius: '6px', padding: '0.75rem', textAlign: 'center' }}>
                  <div style={{ color: 'var(--soc-text-muted)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Resources</div>
                  <div style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--soc-text)' }}>{provider.resources.monitored}/{provider.resources.total}</div>
                </div>
              </div>

              {/* Regions */}
              <div style={{ marginBottom: '0.75rem' }}>
                <div style={{ color: 'var(--soc-text-muted)', fontSize: '0.75rem', marginBottom: '0.375rem' }}>Active Regions</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                  {provider.regions.map((region, idx) => (
                    <span key={idx} className="soc-badge" style={{ background: 'var(--soc-raised)', color: 'var(--soc-text-secondary)' }}>{region}</span>
                  ))}
                </div>
              </div>

              {/* Alerts */}
              {provider.status === 'connected' && (provider.alerts.critical > 0 || provider.alerts.high > 0 || provider.alerts.medium > 0) && (
                <div style={{ marginBottom: '0.75rem' }}>
                  <div style={{ color: 'var(--soc-text-muted)', fontSize: '0.75rem', marginBottom: '0.375rem' }}>Active Alerts</div>
                  <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                    {provider.alerts.critical > 0 && (
                      <span className="soc-badge" style={{ backgroundColor: 'var(--soc-critical-bg)', color: 'var(--soc-critical)' }}>{provider.alerts.critical} Critical</span>
                    )}
                    {provider.alerts.high > 0 && (
                      <span className="soc-badge" style={{ backgroundColor: 'var(--soc-high-bg)', color: 'var(--soc-high)' }}>{provider.alerts.high} High</span>
                    )}
                    {provider.alerts.medium > 0 && (
                      <span className="soc-badge" style={{ backgroundColor: 'var(--soc-medium-bg)', color: 'var(--soc-medium)' }}>{provider.alerts.medium} Medium</span>
                    )}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div style={{ borderTop: '1px solid var(--soc-border)', paddingTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--soc-text-muted)', fontSize: '0.8125rem' }}>Last sync: {provider.lastSync}</span>
                <button className="soc-link" style={{ fontSize: '0.8125rem' }}>
                  {provider.status === 'connected' ? 'Configure →' : 'Reconnect →'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Resource Distribution */}
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-8">
          <div className="soc-card" style={{ padding: '1.25rem' }}>
            <div style={{ borderBottom: '1px solid var(--soc-border)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
              <span style={{ fontWeight: 600, color: 'var(--soc-text)', fontSize: '0.9375rem' }}>Resource Distribution by Provider</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {connectedProviders.map((provider, idx) => {
                const pct = (provider.resources.monitored / provider.resources.total) * 100
                const colors = ['var(--soc-high)', 'var(--soc-accent)', 'var(--soc-low)', 'var(--soc-critical)']
                const c = colors[idx % colors.length]
                return (
                  <div key={idx}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                      <span style={{ fontWeight: 500, color: 'var(--soc-text-secondary)', fontSize: '0.875rem' }}>{provider.name}</span>
                      <span style={{ color: 'var(--soc-text-secondary)', fontSize: '0.875rem' }}>{provider.resources.monitored} / {provider.resources.total}</span>
                    </div>
                    <div className="soc-progress-track">
                      <div className="soc-progress-fill" style={{ width: `${pct}%`, backgroundColor: c }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4">
          <div className="soc-card" style={{ padding: '1.25rem' }}>
            <div style={{ borderBottom: '1px solid var(--soc-border)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
              <span style={{ fontWeight: 600, color: 'var(--soc-text)', fontSize: '0.9375rem' }}>Quick Stats</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { label: 'Total Providers', value: String(cloudProviders.length), color: 'var(--soc-text)' },
                { label: 'Active Connections', value: String(connectedProviders.length), color: 'var(--soc-low)' },
                { label: 'Total Resources', value: formatNumber(totalResources), color: 'var(--soc-text)' },
              ].map((s, i) => (
                <div key={i} style={{ background: 'var(--soc-raised)', border: '1px solid var(--soc-border)', borderRadius: '6px', padding: '1rem', textAlign: 'center' }}>
                  <div style={{ color: 'var(--soc-text-muted)', fontSize: '0.75rem', marginBottom: '0.375rem' }}>{s.label}</div>
                  <div style={{ fontWeight: 700, fontSize: '1.75rem', color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} onClick={() => setShowAddModal(false)}>
          <div className="w-full max-w-lg rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--soc-surface)', border: '1px solid var(--soc-border-mid)' }} onClick={(e) => e.stopPropagation()}>
            <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--soc-border)' }}>
              <h2 className="text-base font-bold" style={{ color: 'var(--soc-text)' }}>Add Cloud Integration</h2>
              <button onClick={() => setShowAddModal(false)} className="text-sm w-7 h-7 flex items-center justify-center rounded" style={{ color: 'var(--soc-text-muted)', backgroundColor: 'var(--soc-raised)' }}>✕</button>
            </div>
            <div className="px-5 py-4">
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {['AWS', 'Azure', 'Google Cloud', 'Oracle Cloud', 'Alibaba Cloud'].map((provider, idx) => (
                  <button key={idx} className="soc-card p-4 text-center cursor-pointer" style={{ cursor: 'pointer' }}>
                    <div className="text-3xl mb-2">☁️</div>
                    <div className="text-sm font-semibold" style={{ color: 'var(--soc-text)' }}>{provider}</div>
                  </button>
                ))}
              </div>
            </div>
            <div className="px-5 py-4 border-t" style={{ borderColor: 'var(--soc-border)' }}>
              <button onClick={() => setShowAddModal(false)} className="soc-btn soc-btn-secondary w-full">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

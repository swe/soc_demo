'use client'

import { useEffect, useState } from 'react'
import { usePageTitle } from '@/app/page-title-context'

export default function IntegrationsPage() {
  const { setPageTitle } = usePageTitle()
  const [activeTab, setActiveTab] = useState('tab-a')

  useEffect(() => {
    setPageTitle('Integrations')
  }, [setPageTitle])

  const integrations = [
    { name: 'Splunk SIEM', type: 'SIEM', status: 'connected', lastSync: '2 min ago', events: '45,231', eventsDay: '45.2k/day', health: 100 },
    { name: 'CrowdStrike Falcon', type: 'EDR', status: 'connected', lastSync: '1 min ago', events: '23,812', eventsDay: '23.8k/day', health: 98 },
    { name: 'Palo Alto Firewall', type: 'Network', status: 'connected', lastSync: '5 min ago', events: '89,344', eventsDay: '89.3k/day', health: 100 },
    { name: 'Microsoft Defender', type: 'Endpoint', status: 'connected', lastSync: '3 min ago', events: '34,109', eventsDay: '34.1k/day', health: 95 },
    { name: 'Proofpoint Email', type: 'Email Security', status: 'connected', lastSync: '10 min ago', events: '12,700', eventsDay: '12.7k/day', health: 100 },
    { name: 'Okta SSO', type: 'Identity', status: 'connected', lastSync: '1 min ago', events: '8,902', eventsDay: '8.9k/day', health: 100 },
    { name: 'Tenable Nessus', type: 'Vulnerability', status: 'error', lastSync: '2 hours ago', events: '—', eventsDay: '0/day', health: 0 },
    { name: 'Carbon Black', type: 'EDR', status: 'connected', lastSync: '4 min ago', events: '19,213', eventsDay: '19.2k/day', health: 97 },
    { name: 'Cisco ISE', type: 'NAC', status: 'connected', lastSync: '7 min ago', events: '5,624', eventsDay: '5.6k/day', health: 92 },
    { name: 'FortiGate', type: 'Firewall', status: 'warning', lastSync: '45 min ago', events: '67,421', eventsDay: '67.4k/day', health: 75 },
    { name: 'AWS CloudTrail', type: 'Cloud', status: 'connected', lastSync: '2 min ago', events: '156,742', eventsDay: '156.7k/day', health: 100 },
    { name: 'Azure Sentinel', type: 'SIEM', status: 'connected', lastSync: '3 min ago', events: '98,312', eventsDay: '98.3k/day', health: 99 },
  ]

  const throughputRows = [
    { name: 'AWS CloudTrail', type: 'Cloud', events: '156,742', alerts: 23, fp: '4.2%', health: 100 },
    { name: 'Azure Sentinel', type: 'SIEM', events: '98,312', alerts: 45, fp: '6.1%', health: 99 },
    { name: 'Splunk SIEM', type: 'SIEM', events: '45,231', alerts: 89, fp: '8.3%', health: 100 },
    { name: 'Palo Alto Firewall', type: 'Network', events: '89,344', alerts: 12, fp: '2.1%', health: 100 },
    { name: 'CrowdStrike Falcon', type: 'EDR', events: '23,812', alerts: 34, fp: '3.8%', health: 98 },
    { name: 'FortiGate', type: 'Firewall', events: '67,421', alerts: 8, fp: '11.2%', health: 75 },
    { name: 'Tenable Nessus', type: 'Vulnerability', events: '—', alerts: 0, fp: '—', health: 0 },
  ]

  const statusColor = (s: string) => s === 'connected' ? 'var(--soc-low)' : s === 'warning' ? 'var(--soc-high)' : 'var(--soc-critical)'
  const statusBg = (s: string) => s === 'connected' ? 'var(--soc-low-bg)' : s === 'warning' ? 'var(--soc-high-bg)' : 'var(--soc-critical-bg)'
  const healthColor = (h: number) => h >= 95 ? 'var(--soc-low)' : h >= 75 ? 'var(--soc-high)' : 'var(--soc-critical)'

  const activeCount = integrations.filter(i => i.status === 'connected').length
  const errorCount = integrations.filter(i => i.status === 'error').length
  const totalEvents = '561.2k'

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-6 soc-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <p className="soc-label mb-1">ADMINISTRATION</p>
          <h1 className="text-xl font-bold tracking-tight mb-1.5" style={{ color: 'var(--soc-text)' }}>Integrations</h1>
          <p className="text-sm" style={{ color: 'var(--soc-text-secondary)' }}>Manage third-party connections and data pipelines</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="soc-btn soc-btn-secondary">Sync All</button>
          <button className="soc-btn soc-btn-primary">Add Integration</button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'ACTIVE', value: `${activeCount}/${integrations.length}`, sub: 'Integrations connected' },
          { label: 'ERRORS', value: String(errorCount), sub: 'Require attention', accent: true, err: true },
          { label: 'TOTAL EVENTS/DAY', value: totalEvents, sub: 'Across all sources', accent: true },
          { label: 'LAST SYNC', value: '1 min ago', sub: 'Dec 15, 2024 14:30' },
        ].map((kpi, i) => (
          <div key={i} className="soc-card">
            <p className="soc-label mb-2">{kpi.label}</p>
            <p className="soc-metric-lg" style={kpi.err ? { color: 'var(--soc-critical)' } : kpi.accent ? { color: 'var(--soc-accent)' } : {}}>{kpi.value}</p>
            <p className="text-xs" style={{ color: 'var(--soc-text-muted)' }}>{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Integrations Table */}
      <div className="soc-card mb-4" style={{ padding: 0 }}>
        <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--soc-border)' }}>
          <p className="soc-label">ALL INTEGRATIONS</p>
          <span className="text-xs" style={{ color: 'var(--soc-text-muted)' }}>{integrations.length} total</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="soc-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Status</th>
                <th>Events/Day</th>
                <th>Health</th>
                <th>Last Sync</th>
                <th>Configure</th>
              </tr>
            </thead>
            <tbody>
              {integrations.map((intg, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 600, color: 'var(--soc-text)', fontSize: '0.875rem' }}>{intg.name}</td>
                  <td>
                    <span className="soc-badge" style={{ background: 'var(--soc-raised)', color: 'var(--soc-text-secondary)' }}>{intg.type}</span>
                  </td>
                  <td>
                    <span className="soc-badge" style={{ backgroundColor: statusBg(intg.status), color: statusColor(intg.status) }}>
                      {intg.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ color: 'var(--soc-text-secondary)', fontSize: '0.875rem', fontFamily: 'monospace' }}>{intg.eventsDay}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '80px' }}>
                      <div className="soc-progress-track" style={{ flex: 1 }}>
                        <div className="soc-progress-fill" style={{ width: `${intg.health}%`, backgroundColor: healthColor(intg.health) }} />
                      </div>
                      <span style={{ fontSize: '0.8125rem', color: healthColor(intg.health), fontWeight: 600, minWidth: '2rem' }}>{intg.health}%</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--soc-text-muted)', fontSize: '0.8125rem' }}>{intg.lastSync}</td>
                  <td>
                    <button className="soc-link" style={{ fontSize: '0.8125rem' }}>Configure →</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Throughput Summary */}
      <div className="soc-card" style={{ padding: 0 }}>
        <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--soc-border)' }}>
          <p className="soc-label">EVENT THROUGHPUT</p>
          <span className="text-xs" style={{ color: 'var(--soc-text-muted)' }}>Last 24 hours</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="soc-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Integration</th>
                <th>Type</th>
                <th style={{ textAlign: 'right' }}>Events (24h)</th>
                <th style={{ textAlign: 'right' }}>Alerts</th>
                <th style={{ textAlign: 'right' }}>False Positive Rate</th>
                <th>Health</th>
              </tr>
            </thead>
            <tbody>
              {throughputRows.map((row, i) => {
                const hc = healthColor(row.health)
                return (
                  <tr key={i}>
                    <td style={{ fontWeight: 600, color: 'var(--soc-text)', fontSize: '0.875rem' }}>{row.name}</td>
                    <td>
                      <span className="soc-badge" style={{ background: 'var(--soc-raised)', color: 'var(--soc-text-secondary)' }}>{row.type}</span>
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace', color: 'var(--soc-text)', fontSize: '0.875rem' }}>{row.events}</td>
                    <td style={{ textAlign: 'right', color: 'var(--soc-text)', fontSize: '0.875rem' }}>{row.alerts}</td>
                    <td style={{ textAlign: 'right', color: 'var(--soc-text-muted)', fontSize: '0.8125rem' }}>{row.fp}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '90px' }}>
                        <div className="soc-progress-track" style={{ flex: 1 }}>
                          <div className="soc-progress-fill" style={{ width: `${row.health}%`, backgroundColor: hc }} />
                        </div>
                        <span style={{ fontSize: '0.8125rem', color: hc, fontWeight: 600, minWidth: '2.25rem' }}>{row.health}%</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

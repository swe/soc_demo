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
  activeThreats?: number
  complianceStatus?: 'compliant' | 'non-compliant' | 'warning'
  agentVersion?: string
}

const DEVICES: Device[] = [
  { id: 'DEV-001', hostname: 'WKS-FINANCE-01',   ip: '192.168.1.45',  type: 'endpoint', os: 'Windows 11 Pro',    status: 'online',  riskScore: 23, lastSeen: '2m ago',  department: 'Finance',     owner: 'John Doe',      vulnerabilities: 2,  activeThreats: 0, complianceStatus: 'compliant',     agentVersion: '2.4.1' },
  { id: 'DEV-002', hostname: 'SRV-WEB-PROD-01',  ip: '10.0.1.15',     type: 'server',   os: 'Ubuntu 22.04 LTS', status: 'online',  riskScore: 15, lastSeen: '1m ago',  department: 'IT',          owner: 'DevOps Team',   vulnerabilities: 0,  activeThreats: 0, complianceStatus: 'compliant',     agentVersion: '2.4.2' },
  { id: 'DEV-003', hostname: 'WKS-HR-12',         ip: '192.168.2.87',  type: 'endpoint', os: 'macOS Sonoma',     status: 'warning', riskScore: 67, lastSeen: '15m ago', department: 'HR',          owner: 'Jane Smith',    vulnerabilities: 5,  activeThreats: 2, complianceStatus: 'warning',       agentVersion: '2.3.8' },
  { id: 'DEV-004', hostname: 'SRV-DB-PROD-01',   ip: '10.0.2.22',     type: 'server',   os: 'Red Hat Linux 8',  status: 'online',  riskScore: 31, lastSeen: '1m ago',  department: 'IT',          owner: 'DBA Team',      vulnerabilities: 3,  activeThreats: 0, complianceStatus: 'compliant',     agentVersion: '2.4.1' },
  { id: 'DEV-005', hostname: 'WKS-EXEC-CEO',     ip: '192.168.3.10',  type: 'endpoint', os: 'macOS Ventura',    status: 'online',  riskScore: 18, lastSeen: '30m ago', department: 'Executive',   owner: 'CEO',           vulnerabilities: 0,  activeThreats: 0, complianceStatus: 'compliant',     agentVersion: '2.4.2' },
  { id: 'DEV-006', hostname: 'FW-PERIMETER-01',  ip: '203.0.113.1',   type: 'network',  os: 'FortiOS 7.4',      status: 'online',  riskScore: 45, lastSeen: '5m ago',  department: 'IT',          owner: 'NetOps Team',   vulnerabilities: 1,  activeThreats: 0, complianceStatus: 'warning',       agentVersion: 'N/A' },
  { id: 'DEV-007', hostname: 'WKS-DEV-LAPTOP-07',ip: '192.168.4.77',  type: 'endpoint', os: 'Windows 10 Pro',   status: 'offline', riskScore: 52, lastSeen: '2d ago',  department: 'Engineering', owner: 'Dev Team',      vulnerabilities: 8,  activeThreats: 0, complianceStatus: 'non-compliant', agentVersion: '2.3.1' },
  { id: 'DEV-008', hostname: 'IOT-CAMERA-03',    ip: '192.168.10.33', type: 'iot',      os: 'Firmware 3.1.2',   status: 'online',  riskScore: 78, lastSeen: '10m ago', department: 'Facilities',  owner: 'Facilities Mgr',vulnerabilities: 4,  activeThreats: 1, complianceStatus: 'non-compliant', agentVersion: 'N/A' },
  { id: 'DEV-009', hostname: 'SRV-MAIL-01',      ip: '10.0.1.50',     type: 'server',   os: 'Windows Server 2022', status: 'online', riskScore: 22, lastSeen: '3m ago', department: 'IT',         owner: 'SysAdmin Team', vulnerabilities: 1,  activeThreats: 0, complianceStatus: 'compliant',     agentVersion: '2.4.2' },
  { id: 'DEV-010', hostname: 'WKS-FINANCE-08',   ip: '192.168.1.88',  type: 'endpoint', os: 'Windows 11 Pro',   status: 'warning', riskScore: 61, lastSeen: '45m ago', department: 'Finance',    owner: 'Alice Brown',   vulnerabilities: 3,  activeThreats: 1, complianceStatus: 'warning',       agentVersion: '2.4.0' },
]

const STATUS_CONFIG = {
  online:  { color: 'var(--soc-low)',      bg: 'var(--soc-low-bg)',      dot: 'var(--soc-low)' },
  offline: { color: 'var(--soc-text-muted)', bg: 'var(--soc-overlay)',  dot: 'var(--soc-text-muted)' },
  warning: { color: 'var(--soc-medium)',   bg: 'var(--soc-medium-bg)',   dot: 'var(--soc-medium)' },
}

const TYPE_LABELS: Record<string, string> = {
  endpoint: 'Endpoint',
  server:   'Server',
  network:  'Network',
  iot:      'IoT',
}

export default function DevicesPage() {
  const { setPageTitle } = usePageTitle()
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Device | null>(null)

  useEffect(() => { setPageTitle('Device Management') }, [setPageTitle])

  const filtered = DEVICES
    .filter(d => filterType === 'all' || d.type === filterType)
    .filter(d => filterStatus === 'all' || d.status === filterStatus)
    .filter(d => !search || d.hostname.toLowerCase().includes(search.toLowerCase()) || d.ip.includes(search) || d.owner.toLowerCase().includes(search.toLowerCase()))

  const counts = {
    total:   DEVICES.length,
    online:  DEVICES.filter(d => d.status === 'online').length,
    warning: DEVICES.filter(d => d.status === 'warning').length,
    offline: DEVICES.filter(d => d.status === 'offline').length,
    threats: DEVICES.reduce((s, d) => s + (d.activeThreats ?? 0), 0),
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-6">

      {/* Header */}
      <div className="flex items-start justify-between mb-5 hig-fade-in">
        <div>
          <p className="soc-label mb-1">ASSET MANAGEMENT</p>
          <h1 className="text-xl font-bold tracking-tight mb-1.5" style={{ color: 'var(--soc-text)' }}>
            Devices
          </h1>
          <p className="text-sm" style={{ color: 'var(--soc-text-secondary)' }}>
            <strong style={{ color: 'var(--soc-low)' }}>{counts.online}</strong> online ·{' '}
            <strong style={{ color: 'var(--soc-medium)' }}>{counts.warning}</strong> warning ·{' '}
            <strong style={{ color: 'var(--soc-text-muted)' }}>{counts.offline}</strong> offline ·{' '}
            {counts.threats > 0 && <><strong style={{ color: 'var(--soc-critical)' }}>{counts.threats}</strong> active threats</>}
          </p>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <button className="soc-btn soc-btn-secondary">Export</button>
          <button className="soc-btn soc-btn-primary">Add Device</button>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'TOTAL DEVICES', value: counts.total,   color: 'var(--soc-text)' },
          { label: 'ONLINE',        value: counts.online,  color: 'var(--soc-low)' },
          { label: 'AT RISK',       value: counts.warning, color: 'var(--soc-medium)' },
          { label: 'ACTIVE THREATS',value: counts.threats, color: counts.threats > 0 ? 'var(--soc-critical)' : 'var(--soc-low)' },
        ].map(({ label, value, color }) => (
          <div key={label} className="soc-card">
            <p className="soc-label mb-2">{label}</p>
            <p className="soc-metric-sm" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filters + search */}
      <div className="flex items-center gap-2 flex-wrap mb-4">
        <input
          className="soc-input text-xs"
          placeholder="Search hostname, IP, owner…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: '220px' }}
        />
        <div className="flex items-center gap-1">
          {['all', 'endpoint', 'server', 'network', 'iot'].map(f => (
            <button
              key={f}
              onClick={() => setFilterType(f)}
              className="soc-btn text-xs"
              style={filterType === f
                ? { backgroundColor: 'var(--soc-accent)', borderColor: 'var(--soc-accent)', color: '#fff' }
                : { borderColor: 'var(--soc-border-mid)', color: 'var(--soc-text-secondary)', background: 'transparent' }}
            >
              {f === 'all' ? 'All Types' : TYPE_LABELS[f]}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          {['all', 'online', 'warning', 'offline'].map(f => (
            <button
              key={f}
              onClick={() => setFilterStatus(f)}
              className="soc-btn text-xs"
              style={filterStatus === f
                ? { backgroundColor: 'var(--soc-accent)', borderColor: 'var(--soc-accent)', color: '#fff' }
                : { borderColor: 'var(--soc-border-mid)', color: 'var(--soc-text-secondary)', background: 'transparent' }}
            >
              {f === 'all' ? 'All Status' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <span className="text-xs" style={{ color: 'var(--soc-text-muted)' }}>{filtered.length} devices</span>
      </div>

      {/* Table */}
      <div className="soc-card p-0 overflow-hidden">
        <table className="soc-table">
          <thead>
            <tr>
              <th>Device</th>
              <th>Type</th>
              <th>OS</th>
              <th>Status</th>
              <th>Department</th>
              <th className="text-center">Vulns</th>
              <th className="text-center">Threats</th>
              <th className="text-right">Risk</th>
              <th>Last Seen</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((d) => {
              const sc = STATUS_CONFIG[d.status]
              return (
                <tr
                  key={d.id}
                  className="cursor-pointer"
                  onClick={() => setSelected(d)}
                >
                  <td>
                    <p className="text-sm font-medium font-mono" style={{ color: 'var(--soc-text)' }}>{d.hostname}</p>
                    <p className="text-xs" style={{ color: 'var(--soc-text-muted)' }}>{d.ip}</p>
                  </td>
                  <td>
                    <span className="soc-badge">{TYPE_LABELS[d.type]}</span>
                  </td>
                  <td>
                    <span className="text-xs" style={{ color: 'var(--soc-text-secondary)' }}>{d.os}</span>
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      <div className="soc-dot" style={{ backgroundColor: sc.dot }} />
                      <span className="text-xs" style={{ color: sc.color }}>{d.status}</span>
                    </div>
                  </td>
                  <td>
                    <span className="text-xs" style={{ color: 'var(--soc-text-secondary)' }}>{d.department}</span>
                  </td>
                  <td className="text-center">
                    <span
                      className="text-sm font-semibold tabular-nums"
                      style={{ color: d.vulnerabilities > 3 ? 'var(--soc-critical)' : d.vulnerabilities > 0 ? 'var(--soc-medium)' : 'var(--soc-low)' }}
                    >
                      {d.vulnerabilities}
                    </span>
                  </td>
                  <td className="text-center">
                    <span
                      className="text-sm font-semibold tabular-nums"
                      style={{ color: (d.activeThreats ?? 0) > 0 ? 'var(--soc-critical)' : 'var(--soc-text-muted)' }}
                    >
                      {d.activeThreats ?? 0}
                    </span>
                  </td>
                  <td className="text-right">
                    <span
                      className="text-sm font-bold tabular-nums"
                      style={{ color: d.riskScore >= 60 ? 'var(--soc-critical)' : d.riskScore >= 40 ? 'var(--soc-medium)' : 'var(--soc-low)' }}
                    >
                      {d.riskScore}
                    </span>
                  </td>
                  <td>
                    <span className="text-xs" style={{ color: 'var(--soc-text-muted)' }}>{d.lastSeen}</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Device detail modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full max-w-lg flex flex-col max-h-[85vh] rounded-xl overflow-hidden"
            style={{ backgroundColor: 'var(--soc-surface)', border: '1px solid var(--soc-border-mid)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b flex items-start justify-between" style={{ borderColor: 'var(--soc-border)' }}>
              <div>
                <p className="soc-label mb-1 font-mono">{selected.id}</p>
                <h2 className="text-base font-bold font-mono" style={{ color: 'var(--soc-text)' }}>{selected.hostname}</h2>
              </div>
              <button onClick={() => setSelected(null)} className="text-sm w-7 h-7 flex items-center justify-center rounded flex-shrink-0" style={{ color: 'var(--soc-text-muted)', backgroundColor: 'var(--soc-raised)' }}>✕</button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'IP ADDRESS',   value: selected.ip },
                  { label: 'OS',           value: selected.os },
                  { label: 'TYPE',         value: TYPE_LABELS[selected.type] },
                  { label: 'DEPARTMENT',   value: selected.department },
                  { label: 'OWNER',        value: selected.owner },
                  { label: 'AGENT',        value: selected.agentVersion ?? 'N/A' },
                ].map(({ label, value }) => (
                  <div key={label} className="p-3 rounded" style={{ backgroundColor: 'var(--soc-raised)' }}>
                    <p className="soc-label mb-1">{label}</p>
                    <p className="text-sm font-medium" style={{ color: 'var(--soc-text)' }}>{value}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'RISK SCORE',   value: selected.riskScore, color: selected.riskScore >= 60 ? 'var(--soc-critical)' : selected.riskScore >= 40 ? 'var(--soc-medium)' : 'var(--soc-low)' },
                  { label: 'VULNS',        value: selected.vulnerabilities, color: selected.vulnerabilities > 0 ? 'var(--soc-medium)' : 'var(--soc-low)' },
                  { label: 'THREATS',      value: selected.activeThreats ?? 0, color: (selected.activeThreats ?? 0) > 0 ? 'var(--soc-critical)' : 'var(--soc-low)' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="p-3 rounded text-center" style={{ backgroundColor: 'var(--soc-raised)' }}>
                    <p className="soc-label mb-1">{label}</p>
                    <p className="text-xl font-bold" style={{ color }}>{value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="px-5 py-4 flex gap-3 border-t" style={{ borderColor: 'var(--soc-border)' }}>
              <button className="soc-btn soc-btn-primary flex-1">Run Scan</button>
              <button onClick={() => setSelected(null)} className="soc-btn soc-btn-secondary flex-1">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

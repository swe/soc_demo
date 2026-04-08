'use client'

import { Fragment, useEffect, useMemo, useState } from 'react'
import { usePageTitle } from '@/app/page-title-context'
import {
  OverviewAlert,
  OverviewFilterMenu,
  OverviewKpiRow,
  OverviewModal,
  OverviewPageHeader,
  OverviewPageShell,
  OverviewPagination,
  OverviewRowsPerPageMenu,
  OverviewSection,
  OverviewStepModal,
  OverviewTableToolbar,
  OverviewToggle,
} from '@/components/overview/unified-ui'

type DeviceStatus = 'online' | 'offline' | 'warning' | 'isolated'
type DeviceType = 'endpoint' | 'server' | 'network' | 'iot'

interface Device {
  id: string
  hostname: string
  ip: string
  type: DeviceType
  os: string
  status: DeviceStatus
  riskScore: number
  lastSeen: string
  updatedDate: string
  department: string
  owner: string
  vulnerabilities: number
  activeThreats: number
  complianceStatus: 'compliant' | 'non-compliant' | 'warning'
  agentVersion: string
}

const DEVICES: Device[] = [
  { id: 'DEV-001', hostname: 'WKS-FINANCE-01', ip: '192.168.1.45', type: 'endpoint', os: 'Windows 11 Pro', status: 'online', riskScore: 23, lastSeen: '2m ago', updatedDate: '2026-04-08', department: 'Finance', owner: 'John Doe', vulnerabilities: 2, activeThreats: 0, complianceStatus: 'compliant', agentVersion: '2.4.1' },
  { id: 'DEV-002', hostname: 'SRV-WEB-PROD-01', ip: '10.0.1.15', type: 'server', os: 'Ubuntu 22.04 LTS', status: 'online', riskScore: 15, lastSeen: '1m ago', updatedDate: '2026-04-08', department: 'IT', owner: 'DevOps Team', vulnerabilities: 0, activeThreats: 0, complianceStatus: 'compliant', agentVersion: '2.4.2' },
  { id: 'DEV-003', hostname: 'WKS-HR-12', ip: '192.168.2.87', type: 'endpoint', os: 'macOS Sonoma', status: 'warning', riskScore: 67, lastSeen: '15m ago', updatedDate: '2026-04-08', department: 'HR', owner: 'Jane Smith', vulnerabilities: 5, activeThreats: 2, complianceStatus: 'warning', agentVersion: '2.3.8' },
  { id: 'DEV-004', hostname: 'SRV-DB-PROD-01', ip: '10.0.2.22', type: 'server', os: 'Red Hat Linux 8', status: 'online', riskScore: 31, lastSeen: '1m ago', updatedDate: '2026-04-08', department: 'IT', owner: 'DBA Team', vulnerabilities: 3, activeThreats: 0, complianceStatus: 'compliant', agentVersion: '2.4.1' },
  { id: 'DEV-005', hostname: 'WKS-EXEC-CEO', ip: '192.168.3.10', type: 'endpoint', os: 'macOS Ventura', status: 'online', riskScore: 18, lastSeen: '30m ago', updatedDate: '2026-04-07', department: 'Executive', owner: 'CEO', vulnerabilities: 0, activeThreats: 0, complianceStatus: 'compliant', agentVersion: '2.4.2' },
  { id: 'DEV-006', hostname: 'FW-PERIMETER-01', ip: '203.0.113.1', type: 'network', os: 'FortiOS 7.4', status: 'online', riskScore: 45, lastSeen: '5m ago', updatedDate: '2026-04-07', department: 'IT', owner: 'NetOps Team', vulnerabilities: 1, activeThreats: 0, complianceStatus: 'warning', agentVersion: 'N/A' },
  { id: 'DEV-007', hostname: 'WKS-DEV-LAPTOP-07', ip: '192.168.4.77', type: 'endpoint', os: 'Windows 10 Pro', status: 'offline', riskScore: 52, lastSeen: '2d ago', updatedDate: '2026-04-06', department: 'Engineering', owner: 'Dev Team', vulnerabilities: 8, activeThreats: 0, complianceStatus: 'non-compliant', agentVersion: '2.3.1' },
  { id: 'DEV-008', hostname: 'IOT-CAMERA-03', ip: '192.168.10.33', type: 'iot', os: 'Firmware 3.1.2', status: 'warning', riskScore: 78, lastSeen: '10m ago', updatedDate: '2026-04-08', department: 'Facilities', owner: 'Facilities Mgr', vulnerabilities: 4, activeThreats: 1, complianceStatus: 'non-compliant', agentVersion: 'N/A' },
  { id: 'DEV-009', hostname: 'SRV-MAIL-01', ip: '10.0.1.50', type: 'server', os: 'Windows Server 2022', status: 'online', riskScore: 22, lastSeen: '3m ago', updatedDate: '2026-04-08', department: 'IT', owner: 'SysAdmin Team', vulnerabilities: 1, activeThreats: 0, complianceStatus: 'compliant', agentVersion: '2.4.2' },
  { id: 'DEV-010', hostname: 'WKS-FINANCE-08', ip: '192.168.1.88', type: 'endpoint', os: 'Windows 11 Pro', status: 'warning', riskScore: 61, lastSeen: '45m ago', updatedDate: '2026-04-08', department: 'Finance', owner: 'Alice Brown', vulnerabilities: 3, activeThreats: 1, complianceStatus: 'warning', agentVersion: '2.4.0' },
]

const TYPE_LABELS: Record<DeviceType, string> = {
  endpoint: 'Endpoint',
  server: 'Server',
  network: 'Network',
  iot: 'IoT',
}

const STATUS_LABELS: Record<DeviceStatus, string> = {
  online: 'Online',
  warning: 'Warning',
  isolated: 'Isolated',
  offline: 'Offline',
}

const STATUS_BADGE: Record<DeviceStatus, { bg: string; text: string; bar: string }> = {
  online: { bg: 'var(--soc-low-bg)', text: 'var(--soc-low)', bar: 'var(--soc-low)' },
  warning: { bg: 'var(--soc-medium-bg)', text: 'var(--soc-medium)', bar: 'var(--soc-medium)' },
  isolated: { bg: 'var(--soc-high-bg)', text: 'var(--soc-high)', bar: 'var(--soc-high)' },
  offline: { bg: 'var(--soc-overlay)', text: 'var(--soc-text-muted)', bar: 'var(--soc-text-muted)' },
}

type PendingAction = { type: 'scan' | 'isolate' | 'reconnect'; deviceId: string }
type Flash = { tone: 'success' | 'attention'; title: string; description: string } | null

function getTodayIso() {
  return new Date().toISOString().slice(0, 10)
}

export default function DevicesPage() {
  const { setPageTitle } = usePageTitle()
  const [devices, setDevices] = useState<Device[]>(DEVICES)
  const [query, setQuery] = useState('')
  const [combinedFilters, setCombinedFilters] = useState<string[]>([
    'endpoint',
    'server',
    'network',
    'iot',
    'online',
    'warning',
    'isolated',
    'offline',
  ])
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [criticalOnly, setCriticalOnly] = useState(false)
  const [hideOffline, setHideOffline] = useState(false)
  const [expanded, setExpanded] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(5)

  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null)
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null)
  const [actionBusy, setActionBusy] = useState(false)
  const [flash, setFlash] = useState<Flash>(null)

  const [exportOpen, setExportOpen] = useState(false)
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'pdf'>('csv')
  const [exportFilteredOnly, setExportFilteredOnly] = useState(true)
  const [exportState, setExportState] = useState<'idle' | 'running' | 'done'>('idle')

  const [addOpen, setAddOpen] = useState(false)
  const [addStep, setAddStep] = useState(0)
  const [newDevice, setNewDevice] = useState({
    hostname: '',
    ip: '',
    type: 'endpoint' as DeviceType,
    os: '',
    department: '',
    owner: '',
    agentVersion: '2.4.2',
  })

  useEffect(() => {
    setPageTitle('Devices')
  }, [setPageTitle])

  useEffect(() => {
    const now = new Date()
    const from = new Date()
    from.setDate(now.getDate() - 30)
    setFromDate(from.toISOString().slice(0, 10))
    setToDate(now.toISOString().slice(0, 10))
  }, [])

  const counts = useMemo(() => {
    const total = devices.length
    const online = devices.filter((d) => d.status === 'online').length
    const warning = devices.filter((d) => d.status === 'warning').length
    const isolated = devices.filter((d) => d.status === 'isolated').length
    const offline = devices.filter((d) => d.status === 'offline').length
    const threats = devices.reduce((sum, d) => sum + d.activeThreats, 0)
    const highRisk = devices.filter((d) => d.riskScore >= 60).length
    return { total, online, warning, isolated, offline, threats, highRisk }
  }, [devices])

  const visible = useMemo(() => {
    const q = query.toLowerCase()
    const selectedTypes = combinedFilters.filter((id): id is DeviceType =>
      ['endpoint', 'server', 'network', 'iot'].includes(id),
    )
    const selectedStatuses = combinedFilters.filter((id): id is DeviceStatus =>
      ['online', 'warning', 'isolated', 'offline'].includes(id),
    )
    return devices
      .filter((d) => selectedTypes.length === 0 || selectedTypes.includes(d.type))
      .filter((d) => selectedStatuses.length === 0 || selectedStatuses.includes(d.status))
      .filter((d) => !hideOffline || d.status !== 'offline')
      .filter((d) => !criticalOnly || d.riskScore >= 60 || d.activeThreats > 0)
      .filter((d) => !fromDate || d.updatedDate >= fromDate)
      .filter((d) => !toDate || d.updatedDate <= toDate)
      .filter(
        (d) =>
          !q ||
          d.hostname.toLowerCase().includes(q) ||
          d.ip.includes(q) ||
          d.owner.toLowerCase().includes(q) ||
          d.department.toLowerCase().includes(q),
      )
  }, [devices, combinedFilters, hideOffline, criticalOnly, fromDate, toDate, query])

  const totalPages = Math.max(1, Math.ceil(visible.length / rowsPerPage))
  const pagedRows = visible.slice((page - 1) * rowsPerPage, page * rowsPerPage)
  const selectedDevice = selectedDeviceId ? devices.find((d) => d.id === selectedDeviceId) ?? null : null
  const pendingDevice = pendingAction ? devices.find((d) => d.id === pendingAction.deviceId) ?? null : null

  useEffect(() => {
    if (page > totalPages) setPage(1)
  }, [page, totalPages])

  const executeDeviceAction = async () => {
    if (!pendingAction || !pendingDevice) return
    setActionBusy(true)
    await new Promise((resolve) => setTimeout(resolve, 900))
    const today = getTodayIso()
    setDevices((prev) =>
      prev.map((device) => {
        if (device.id !== pendingAction.deviceId) return device
        if (pendingAction.type === 'scan') {
          return {
            ...device,
            lastSeen: 'just now',
            updatedDate: today,
            vulnerabilities: Math.max(0, device.vulnerabilities - 1),
          }
        }
        if (pendingAction.type === 'isolate') {
          return {
            ...device,
            status: 'isolated',
            lastSeen: 'just now',
            updatedDate: today,
            activeThreats: Math.max(1, device.activeThreats),
          }
        }
        return {
          ...device,
          status: 'online',
          activeThreats: 0,
          lastSeen: 'just now',
          updatedDate: today,
        }
      }),
    )

    setActionBusy(false)
    const actionTitle =
      pendingAction.type === 'scan'
        ? `Scan completed for ${pendingDevice.hostname}`
        : pendingAction.type === 'isolate'
          ? `${pendingDevice.hostname} isolated`
          : `${pendingDevice.hostname} returned to online`

    setFlash({
      tone: pendingAction.type === 'scan' ? 'success' : 'attention',
      title: actionTitle,
      description: 'Device inventory and posture metrics were updated with the new action result.',
    })
    setPendingAction(null)
  }

  const startExport = async () => {
    setExportState('running')
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setExportState('done')
  }

  const resetAddFlow = () => {
    setAddOpen(false)
    setAddStep(0)
    setNewDevice({
      hostname: '',
      ip: '',
      type: 'endpoint',
      os: '',
      department: '',
      owner: '',
      agentVersion: '2.4.2',
    })
  }

  const addDevice = () => {
    const nextNumber =
      Math.max(
        ...devices
          .map((d) => Number.parseInt(d.id.replace('DEV-', ''), 10))
          .filter((n) => Number.isFinite(n)),
      ) + 1
    const today = getTodayIso()
    setDevices((prev) => [
      {
        id: `DEV-${String(nextNumber).padStart(3, '0')}`,
        hostname: newDevice.hostname,
        ip: newDevice.ip,
        type: newDevice.type,
        os: newDevice.os,
        status: 'online',
        riskScore: 20,
        lastSeen: 'just now',
        updatedDate: today,
        department: newDevice.department,
        owner: newDevice.owner,
        vulnerabilities: 0,
        activeThreats: 0,
        complianceStatus: 'compliant',
        agentVersion: newDevice.agentVersion || '2.4.2',
      },
      ...prev,
    ])
    setFlash({
      tone: 'success',
      title: `Device ${newDevice.hostname} added`,
      description: 'The new asset is now part of device inventory and can be managed with standard actions.',
    })
    resetAddFlow()
  }

  const combinedFilterOptions = [
    { id: 'endpoint', label: 'Endpoint', section: 'Type' },
    { id: 'server', label: 'Server', section: 'Type' },
    { id: 'network', label: 'Network', section: 'Type' },
    { id: 'iot', label: 'IoT', section: 'Type' },
    { id: 'online', label: 'Online', section: 'Status' },
    { id: 'warning', label: 'Warning', section: 'Status' },
    { id: 'isolated', label: 'Isolated', section: 'Status' },
    { id: 'offline', label: 'Offline', section: 'Status' },
  ]

  return (
    <OverviewPageShell>
      <OverviewPageHeader
        section="ASSET MANAGEMENT"
        title="Devices"
        description="Unified inventory posture for endpoints, servers, network assets, and IoT devices."
        actions={[
          {
            id: 'export',
            label: 'Export',
            variant: 'secondary',
            onClick: () => {
              setExportOpen(true)
              setExportState('idle')
            },
          },
          { id: 'add-device', label: 'Register Device', variant: 'primary', onClick: () => setAddOpen(true) },
        ]}
      />

      {flash && (
        <div className="mb-4">
          <OverviewAlert tone={flash.tone} title={flash.title} description={flash.description} />
        </div>
      )}

      <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-2">
        <OverviewAlert
          tone={counts.highRisk > 0 ? 'critical' : 'success'}
          title={counts.highRisk > 0 ? `${counts.highRisk} high-risk devices need action` : 'No critical device posture issues'}
          description="High-risk means risk score >= 60 or active threat telemetry."
        />
        <OverviewAlert
          tone={counts.isolated > 0 ? 'attention' : 'info'}
          title={counts.isolated > 0 ? `${counts.isolated} devices currently isolated` : 'Containment channel clear'}
          description="Isolation and reconnect actions are available from row details and the device modal."
        />
      </div>

      <OverviewKpiRow
        columns={5}
        items={[
          { label: 'TOTAL DEVICES', value: counts.total, sub: 'Managed inventory' },
          { label: 'ONLINE', value: counts.online, sub: 'Healthy signal', tone: 'low' },
          { label: 'WARNING', value: counts.warning, sub: 'Needs review', tone: 'medium' },
          { label: 'ISOLATED', value: counts.isolated, sub: 'Containment', tone: 'high' },
          { label: 'ACTIVE THREATS', value: counts.threats, sub: 'Open telemetry', tone: counts.threats > 0 ? 'critical' : 'low' },
        ]}
      />

      <OverviewTableToolbar
        searchValue={query}
        onSearchChange={setQuery}
        searchPlaceholder="Search hostname, IP, owner, department..."
        end={
          <div className="flex w-full flex-wrap gap-2 sm:justify-end">
            <OverviewFilterMenu
              options={combinedFilterOptions}
              selected={combinedFilters}
              onApply={(next) => {
                setCombinedFilters(next)
                setPage(1)
              }}
            />
            <OverviewToggle
              label="Critical only"
              checked={criticalOnly}
              onChange={(next) => {
                setCriticalOnly(next)
                setPage(1)
              }}
            />
            <OverviewToggle
              label="Hide offline"
              checked={hideOffline}
              onChange={(next) => {
                setHideOffline(next)
                setPage(1)
              }}
            />
          </div>
        }
      />

      <OverviewSection
        title="DEVICE INVENTORY"
        right={
          <OverviewRowsPerPageMenu
            value={rowsPerPage}
            options={[5, 10]}
            onChange={(n) => {
              setRowsPerPage(n)
              setPage(1)
            }}
          />
        }
        flush
      >
        <table className="soc-table" style={{ tableLayout: 'fixed', width: '100%' }}>
          <thead>
            <tr>
              <th style={{ width: '6px', padding: 0 }} />
              <th style={{ width: '21%' }}>Device</th>
              <th style={{ width: '10%' }}>Type</th>
              <th style={{ width: '16%' }}>OS</th>
              <th style={{ width: '11%' }}>Status</th>
              <th className="text-center" style={{ width: '7%' }}>Vulns</th>
              <th className="text-center" style={{ width: '8%' }}>Threats</th>
              <th className="text-right" style={{ width: '8%' }}>Risk</th>
              <th style={{ width: '11%' }}>Owner</th>
              <th style={{ width: '10%' }}>Last Seen</th>
              <th style={{ width: '8%' }} />
            </tr>
          </thead>
          <tbody>
            {pagedRows.map((device) => {
              const status = STATUS_BADGE[device.status]
              const isExpanded = expanded.includes(device.id)
              return (
                <Fragment key={device.id}>
                  <tr
                    className="cursor-pointer"
                    onClick={() =>
                      setExpanded((prev) =>
                        prev.includes(device.id) ? prev.filter((id) => id !== device.id) : [...prev, device.id],
                      )
                    }
                  >
                    <td style={{ padding: 0 }}>
                      <div
                        style={{
                          width: '3px',
                          marginLeft: '1px',
                          height: '100%',
                          minHeight: '2.7rem',
                          backgroundColor: status.bar,
                          borderRadius: '0 2px 2px 0',
                        }}
                      />
                    </td>
                    <td>
                      <p className="text-sm font-medium font-mono" style={{ color: 'var(--soc-text)' }}>{device.hostname}</p>
                      <p className="text-xs" style={{ color: 'var(--soc-text-muted)' }}>{device.ip}</p>
                    </td>
                    <td><span className="soc-badge">{TYPE_LABELS[device.type]}</span></td>
                    <td><span className="text-xs" style={{ color: 'var(--soc-text-secondary)' }}>{device.os}</span></td>
                    <td>
                      <span className="soc-badge" style={{ backgroundColor: status.bg, color: status.text }}>
                        {STATUS_LABELS[device.status]}
                      </span>
                    </td>
                    <td className="text-center">
                      <span className="text-sm font-semibold tabular-nums" style={{ color: device.vulnerabilities > 3 ? 'var(--soc-critical)' : device.vulnerabilities > 0 ? 'var(--soc-medium)' : 'var(--soc-low)' }}>
                        {device.vulnerabilities}
                      </span>
                    </td>
                    <td className="text-center">
                      <span className="text-sm font-semibold tabular-nums" style={{ color: device.activeThreats > 0 ? 'var(--soc-critical)' : 'var(--soc-text-muted)' }}>
                        {device.activeThreats}
                      </span>
                    </td>
                    <td className="text-right">
                      <span className="text-sm font-bold tabular-nums" style={{ color: device.riskScore >= 60 ? 'var(--soc-critical)' : device.riskScore >= 40 ? 'var(--soc-medium)' : 'var(--soc-low)' }}>
                        {device.riskScore}
                      </span>
                    </td>
                    <td>
                      <span className="text-xs truncate block" style={{ color: 'var(--soc-text-secondary)' }}>{device.owner}</span>
                    </td>
                    <td>
                      <span className="text-xs" style={{ color: 'var(--soc-text-muted)' }}>{device.lastSeen}</span>
                    </td>
                    <td className="text-right">
                      <span className="text-xs font-semibold" style={{ color: 'var(--soc-accent)' }}>
                        {isExpanded ? 'Hide' : 'Open'}
                      </span>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr>
                      <td colSpan={11} style={{ padding: 0, backgroundColor: 'var(--soc-raised)', borderTop: '1px solid var(--soc-border)' }}>
                        <div className="space-y-3 px-4 py-3">
                          <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2 lg:grid-cols-4" style={{ color: 'var(--soc-text-secondary)' }}>
                            <p><span className="font-semibold" style={{ color: 'var(--soc-text)' }}>Department:</span> {device.department}</p>
                            <p><span className="font-semibold" style={{ color: 'var(--soc-text)' }}>Compliance:</span> {device.complianceStatus}</p>
                            <p><span className="font-semibold" style={{ color: 'var(--soc-text)' }}>Agent:</span> {device.agentVersion}</p>
                            <p><span className="font-semibold" style={{ color: 'var(--soc-text)' }}>Updated:</span> {device.updatedDate}</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              className="soc-btn soc-btn-secondary text-xs"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedDeviceId(device.id)
                              }}
                            >
                              View details
                            </button>
                            <button
                              type="button"
                              className="soc-btn soc-btn-secondary text-xs"
                              onClick={(e) => {
                                e.stopPropagation()
                                setPendingAction({ type: 'scan', deviceId: device.id })
                              }}
                            >
                              Run scan
                            </button>
                            <button
                              type="button"
                              className={`soc-btn text-xs ${device.status === 'isolated' ? 'soc-btn-primary' : 'soc-btn-secondary'}`}
                              onClick={(e) => {
                                e.stopPropagation()
                                setPendingAction({ type: device.status === 'isolated' ? 'reconnect' : 'isolate', deviceId: device.id })
                              }}
                            >
                              {device.status === 'isolated' ? 'Reconnect device' : 'Isolate device'}
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
          </tbody>
        </table>
        <OverviewPagination page={page} totalPages={totalPages} totalItems={visible.length} onPageChange={setPage} />
      </OverviewSection>

      <OverviewModal
        open={!!selectedDevice}
        title={selectedDevice?.hostname ?? ''}
        subtitle={selectedDevice?.id}
        onClose={() => setSelectedDeviceId(null)}
        maxWidth="max-w-2xl"
        footer={
          selectedDevice ? (
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                className="soc-btn soc-btn-secondary"
                onClick={() => setPendingAction({ type: 'scan', deviceId: selectedDevice.id })}
              >
                Run scan
              </button>
              <button
                type="button"
                className="soc-btn soc-btn-primary"
                onClick={() =>
                  setPendingAction({
                    type: selectedDevice.status === 'isolated' ? 'reconnect' : 'isolate',
                    deviceId: selectedDevice.id,
                  })
                }
              >
                {selectedDevice.status === 'isolated' ? 'Reconnect device' : 'Isolate device'}
              </button>
            </div>
          ) : null
        }
      >
        {selectedDevice && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <span className="soc-badge">{TYPE_LABELS[selectedDevice.type]}</span>
              <span className="soc-badge" style={{ backgroundColor: STATUS_BADGE[selectedDevice.status].bg, color: STATUS_BADGE[selectedDevice.status].text }}>
                {STATUS_LABELS[selectedDevice.status]}
              </span>
              <span className="soc-badge">Risk {selectedDevice.riskScore}</span>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                ['IP address', selectedDevice.ip],
                ['Operating system', selectedDevice.os],
                ['Department', selectedDevice.department],
                ['Owner', selectedDevice.owner],
                ['Agent version', selectedDevice.agentVersion],
                ['Last seen', selectedDevice.lastSeen],
                ['Vulnerabilities', String(selectedDevice.vulnerabilities)],
                ['Active threats', String(selectedDevice.activeThreats)],
              ].map(([label, value]) => (
                <div key={label} className="rounded-md border p-3" style={{ borderColor: 'var(--soc-border)', backgroundColor: 'var(--soc-raised)' }}>
                  <p className="soc-label mb-1">{label}</p>
                  <p className="text-sm font-medium" style={{ color: 'var(--soc-text)' }}>{value}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </OverviewModal>

      <OverviewModal
        open={!!pendingAction && !!pendingDevice}
        title={
          pendingAction?.type === 'scan'
            ? 'Run endpoint scan'
            : pendingAction?.type === 'isolate'
              ? 'Isolate device'
              : 'Reconnect device'
        }
        subtitle={pendingDevice?.hostname}
        onClose={() => (actionBusy ? undefined : setPendingAction(null))}
        maxWidth="max-w-lg"
        footer={
          <div className="flex gap-2 sm:justify-end">
            <button type="button" className="soc-btn soc-btn-secondary" disabled={actionBusy} onClick={() => setPendingAction(null)}>
              Cancel
            </button>
            <button type="button" className="soc-btn soc-btn-primary" disabled={actionBusy} onClick={() => void executeDeviceAction()}>
              {actionBusy ? 'Applying...' : 'Confirm action'}
            </button>
          </div>
        }
      >
        {pendingDevice && pendingAction && (
          <div className="space-y-3">
            <p className="text-sm" style={{ color: 'var(--soc-text-secondary)' }}>
              {pendingAction.type === 'scan' && 'This starts an immediate scan and refreshes exposure metrics when complete.'}
              {pendingAction.type === 'isolate' && 'This contains the device from network communication while preserving forensic visibility.'}
              {pendingAction.type === 'reconnect' && 'This restores network communication and clears containment mode.'}
            </p>
            <div className="rounded-md border p-3 text-xs" style={{ borderColor: 'var(--soc-border)', backgroundColor: 'var(--soc-raised)', color: 'var(--soc-text-secondary)' }}>
              <p><span className="font-semibold" style={{ color: 'var(--soc-text)' }}>Device:</span> {pendingDevice.hostname}</p>
              <p><span className="font-semibold" style={{ color: 'var(--soc-text)' }}>Current status:</span> {STATUS_LABELS[pendingDevice.status]}</p>
              <p><span className="font-semibold" style={{ color: 'var(--soc-text)' }}>Risk score:</span> {pendingDevice.riskScore}</p>
            </div>
          </div>
        )}
      </OverviewModal>

      <OverviewModal
        open={exportOpen}
        title="Export devices"
        subtitle="INVENTORY REPORT"
        onClose={() => setExportOpen(false)}
        maxWidth="max-w-xl"
        footer={
          <div className="flex gap-2 sm:justify-end">
            <button type="button" className="soc-btn soc-btn-secondary" onClick={() => setExportOpen(false)}>
              Close
            </button>
            <button
              type="button"
              className="soc-btn soc-btn-primary"
              onClick={() => void startExport()}
              disabled={exportState === 'running'}
            >
              {exportState === 'running' ? 'Preparing...' : exportState === 'done' ? 'Export again' : 'Start export'}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <p className="soc-label mb-2">FORMAT</p>
            <div className="flex flex-wrap gap-2">
              {(['csv', 'json', 'pdf'] as const).map((format) => (
                <button
                  key={format}
                  type="button"
                  className={`soc-btn text-xs ${exportFormat === format ? 'soc-btn-primary' : 'soc-btn-secondary'}`}
                  onClick={() => setExportFormat(format)}
                >
                  {format.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <OverviewToggle label="Export filtered results only" checked={exportFilteredOnly} onChange={setExportFilteredOnly} />
          <div className="rounded-md border p-3 text-xs" style={{ borderColor: 'var(--soc-border)', backgroundColor: 'var(--soc-raised)', color: 'var(--soc-text-secondary)' }}>
            Export scope: {exportFilteredOnly ? `${visible.length} visible devices` : `${devices.length} total devices`}
          </div>
          {exportState === 'done' && (
            <OverviewAlert tone="success" title="Export package ready" description={`Generated ${exportFormat.toUpperCase()} package for ${exportFilteredOnly ? 'filtered' : 'full'} inventory.`} />
          )}
        </div>
      </OverviewModal>

      <OverviewStepModal
        open={addOpen}
        subtitle="REGISTER DEVICE"
        currentStep={addStep}
        onStepChange={setAddStep}
        onClose={resetAddFlow}
        onFinish={addDevice}
        steps={[
          {
            id: 'identity',
            title: 'Step 1: Identity',
            canProceed: () => newDevice.hostname.trim().length > 2 && newDevice.ip.trim().length > 6,
            validationHint: 'Hostname and IP address are required.',
            content: (
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-xs font-medium" style={{ color: 'var(--soc-text-secondary)' }}>
                  Hostname
                  <input
                    className="soc-input mt-1 w-full text-sm"
                    value={newDevice.hostname}
                    onChange={(e) => setNewDevice((prev) => ({ ...prev, hostname: e.target.value }))}
                    placeholder="WKS-FINANCE-11"
                  />
                </label>
                <label className="text-xs font-medium" style={{ color: 'var(--soc-text-secondary)' }}>
                  IP address
                  <input
                    className="soc-input mt-1 w-full text-sm"
                    value={newDevice.ip}
                    onChange={(e) => setNewDevice((prev) => ({ ...prev, ip: e.target.value }))}
                    placeholder="192.168.1.115"
                  />
                </label>
                <label className="text-xs font-medium" style={{ color: 'var(--soc-text-secondary)' }}>
                  Device type
                  <select
                    className="soc-input mt-1 w-full text-sm"
                    value={newDevice.type}
                    onChange={(e) => setNewDevice((prev) => ({ ...prev, type: e.target.value as DeviceType }))}
                  >
                    <option value="endpoint">Endpoint</option>
                    <option value="server">Server</option>
                    <option value="network">Network</option>
                    <option value="iot">IoT</option>
                  </select>
                </label>
                <label className="text-xs font-medium" style={{ color: 'var(--soc-text-secondary)' }}>
                  Operating system
                  <input
                    className="soc-input mt-1 w-full text-sm"
                    value={newDevice.os}
                    onChange={(e) => setNewDevice((prev) => ({ ...prev, os: e.target.value }))}
                    placeholder="Windows 11 Pro"
                  />
                </label>
              </div>
            ),
          },
          {
            id: 'ownership',
            title: 'Step 2: Ownership',
            canProceed: () => newDevice.department.trim().length > 1 && newDevice.owner.trim().length > 1,
            validationHint: 'Department and owner are required.',
            content: (
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-xs font-medium" style={{ color: 'var(--soc-text-secondary)' }}>
                  Department
                  <input
                    className="soc-input mt-1 w-full text-sm"
                    value={newDevice.department}
                    onChange={(e) => setNewDevice((prev) => ({ ...prev, department: e.target.value }))}
                    placeholder="Finance"
                  />
                </label>
                <label className="text-xs font-medium" style={{ color: 'var(--soc-text-secondary)' }}>
                  Owner
                  <input
                    className="soc-input mt-1 w-full text-sm"
                    value={newDevice.owner}
                    onChange={(e) => setNewDevice((prev) => ({ ...prev, owner: e.target.value }))}
                    placeholder="Alice Brown"
                  />
                </label>
                <label className="text-xs font-medium" style={{ color: 'var(--soc-text-secondary)' }}>
                  Agent version
                  <input
                    className="soc-input mt-1 w-full text-sm"
                    value={newDevice.agentVersion}
                    onChange={(e) => setNewDevice((prev) => ({ ...prev, agentVersion: e.target.value }))}
                    placeholder="2.4.2"
                  />
                </label>
              </div>
            ),
          },
          {
            id: 'review',
            title: 'Step 3: Review',
            content: (
              <div className="space-y-3 rounded-md border p-4" style={{ borderColor: 'var(--soc-border)', backgroundColor: 'var(--soc-raised)' }}>
                {[
                  ['Hostname', newDevice.hostname || '—'],
                  ['IP address', newDevice.ip || '—'],
                  ['Type', TYPE_LABELS[newDevice.type]],
                  ['OS', newDevice.os || '—'],
                  ['Department', newDevice.department || '—'],
                  ['Owner', newDevice.owner || '—'],
                  ['Agent', newDevice.agentVersion || '—'],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between border-b pb-2 last:border-b-0 last:pb-0" style={{ borderColor: 'var(--soc-border)' }}>
                    <p className="soc-label">{label}</p>
                    <p className="text-sm font-medium" style={{ color: 'var(--soc-text)' }}>{value}</p>
                  </div>
                ))}
              </div>
            ),
          },
        ]}
      />
    </OverviewPageShell>
  )
}

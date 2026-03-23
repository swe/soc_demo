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
  accessLevel: 'admin' | 'user' | 'guest'
  activeSessions?: number
  failedLoginAttempts?: number
  anomalousActivity?: boolean
}

const IDENTITIES: Identity[] = [
  { id: 'USR-001', name: 'Peter Pan',       email: 'peter.pan@company.com',       role: 'Security Analyst',   department: 'Security Operations', status: 'active',   riskScore: 15, lastLogin: '5m ago',   mfaEnabled: true,  accessLevel: 'user',  activeSessions: 2, failedLoginAttempts: 0, anomalousActivity: false },
  { id: 'USR-002', name: 'Sarah Chen',       email: 'sarah.chen@company.com',       role: 'SOC Manager',        department: 'Security Operations', status: 'active',   riskScore: 8,  lastLogin: '2h ago',   mfaEnabled: true,  accessLevel: 'admin', activeSessions: 1, failedLoginAttempts: 0, anomalousActivity: false },
  { id: 'USR-003', name: 'Mike Johnson',     email: 'mike.johnson@company.com',     role: 'Developer',          department: 'Engineering',         status: 'inactive', riskScore: 42, lastLogin: '3d ago',   mfaEnabled: false, accessLevel: 'user',  activeSessions: 0, failedLoginAttempts: 3, anomalousActivity: true },
  { id: 'USR-004', name: 'Sarah Williams',   email: 'sarah.williams@company.com',   role: 'Admin',              department: 'IT',                  status: 'active',   riskScore: 12, lastLogin: '1h ago',   mfaEnabled: true,  accessLevel: 'admin', activeSessions: 1, failedLoginAttempts: 0, anomalousActivity: false },
  { id: 'USR-005', name: 'James Rodriguez', email: 'james.rodriguez@company.com',  role: 'Analyst II',         department: 'Security Operations', status: 'active',   riskScore: 20, lastLogin: '30m ago',  mfaEnabled: true,  accessLevel: 'user',  activeSessions: 2, failedLoginAttempts: 0, anomalousActivity: false },
  { id: 'USR-006', name: 'Emily Taylor',    email: 'emily.taylor@company.com',     role: 'Analyst II',         department: 'Security Operations', status: 'active',   riskScore: 18, lastLogin: '1h ago',   mfaEnabled: true,  accessLevel: 'user',  activeSessions: 1, failedLoginAttempts: 0, anomalousActivity: false },
  { id: 'USR-007', name: 'Alex Petrov',     email: 'alex.petrov@company.com',      role: 'Analyst I',          department: 'Security Operations', status: 'active',   riskScore: 25, lastLogin: '4h ago',   mfaEnabled: true,  accessLevel: 'user',  activeSessions: 1, failedLoginAttempts: 1, anomalousActivity: false },
  { id: 'USR-008', name: 'Chris Thompson',  email: 'chris.thompson@company.com',   role: 'Finance Manager',    department: 'Finance',             status: 'active',   riskScore: 35, lastLogin: '20m ago',  mfaEnabled: false, accessLevel: 'user',  activeSessions: 1, failedLoginAttempts: 0, anomalousActivity: false },
  { id: 'USR-009', name: 'Lisa Wong',       email: 'lisa.wong@company.com',        role: 'Cloud Architect',    department: 'Engineering',         status: 'active',   riskScore: 22, lastLogin: '3h ago',   mfaEnabled: true,  accessLevel: 'user',  activeSessions: 1, failedLoginAttempts: 0, anomalousActivity: false },
  { id: 'USR-010', name: 'David Kim',       email: 'david.kim@company.com',        role: 'HR Director',        department: 'HR',                  status: 'locked',   riskScore: 58, lastLogin: '5d ago',   mfaEnabled: false, accessLevel: 'user',  activeSessions: 0, failedLoginAttempts: 7, anomalousActivity: true },
]

const STATUS_CONFIG = {
  active:   { color: 'var(--soc-low)',      bg: 'var(--soc-low-bg)',      label: 'Active' },
  inactive: { color: 'var(--soc-text-muted)',bg: 'var(--soc-overlay)',    label: 'Inactive' },
  locked:   { color: 'var(--soc-critical)', bg: 'var(--soc-critical-bg)', label: 'Locked' },
}

const ACCESS_CONFIG = {
  admin: { color: 'var(--soc-accent)', label: 'Admin' },
  user:  { color: 'var(--soc-text-secondary)', label: 'User' },
  guest: { color: 'var(--soc-text-muted)', label: 'Guest' },
}

export default function IdentitiesPage() {
  const { setPageTitle } = usePageTitle()
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Identity | null>(null)

  useEffect(() => { setPageTitle('Identities') }, [setPageTitle])

  const filtered = IDENTITIES
    .filter(i => filter === 'all' || i.status === filter || (filter === 'risk' && i.riskScore >= 40) || (filter === 'no-mfa' && !i.mfaEnabled))
    .filter(i => !search || i.name.toLowerCase().includes(search.toLowerCase()) || i.email.toLowerCase().includes(search.toLowerCase()) || i.department.toLowerCase().includes(search.toLowerCase()))

  const counts = {
    total:    IDENTITIES.length,
    active:   IDENTITIES.filter(i => i.status === 'active').length,
    mfa:      IDENTITIES.filter(i => i.mfaEnabled).length,
    anomalous:IDENTITIES.filter(i => i.anomalousActivity).length,
    admins:   IDENTITIES.filter(i => i.accessLevel === 'admin').length,
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-6">

      {/* Header */}
      <div className="flex items-start justify-between mb-5 hig-fade-in">
        <div>
          <p className="soc-label mb-1">IDENTITY & ACCESS</p>
          <h1 className="text-xl font-bold tracking-tight mb-1.5" style={{ color: 'var(--soc-text)' }}>
            Identities
          </h1>
          <p className="text-sm" style={{ color: 'var(--soc-text-secondary)' }}>
            MFA coverage <strong style={{ color: Math.round((counts.mfa / counts.total) * 100) >= 80 ? 'var(--soc-low)' : 'var(--soc-medium)' }}>{Math.round((counts.mfa / counts.total) * 100)}%</strong> ·{' '}
            {counts.anomalous > 0 && <><strong style={{ color: 'var(--soc-critical)' }}>{counts.anomalous}</strong> anomalous activity</>}
          </p>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <button className="soc-btn soc-btn-secondary">Export</button>
          <button className="soc-btn soc-btn-primary">Add User</button>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-5">
        {[
          { label: 'TOTAL',      value: counts.total,    color: 'var(--soc-text)' },
          { label: 'ACTIVE',     value: counts.active,   color: 'var(--soc-low)' },
          { label: 'MFA ENABLED',value: `${Math.round((counts.mfa / counts.total) * 100)}%`, color: counts.mfa / counts.total >= 0.8 ? 'var(--soc-low)' : 'var(--soc-medium)' },
          { label: 'ADMINS',     value: counts.admins,   color: 'var(--soc-accent)' },
          { label: 'ANOMALOUS',  value: counts.anomalous, color: counts.anomalous > 0 ? 'var(--soc-critical)' : 'var(--soc-low)' },
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
          placeholder="Search name, email, department…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: '220px' }}
        />
        {['all', 'active', 'inactive', 'locked', 'no-mfa', 'risk'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="soc-btn text-xs"
            style={filter === f
              ? { backgroundColor: 'var(--soc-accent)', borderColor: 'var(--soc-accent)', color: '#fff' }
              : { borderColor: 'var(--soc-border-mid)', color: 'var(--soc-text-secondary)', background: 'transparent' }}
          >
            {f === 'all' ? 'All' : f === 'no-mfa' ? 'No MFA' : f === 'risk' ? 'High Risk' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
        <span className="text-xs" style={{ color: 'var(--soc-text-muted)' }}>{filtered.length} identities</span>
      </div>

      {/* Table */}
      <div className="soc-card p-0 overflow-hidden">
        <table className="soc-table">
          <thead>
            <tr>
              <th>Identity</th>
              <th>Role</th>
              <th>Department</th>
              <th>Access</th>
              <th className="text-center">MFA</th>
              <th className="text-center">Sessions</th>
              <th className="text-center">Failed</th>
              <th className="text-right">Risk</th>
              <th>Status</th>
              <th>Last Login</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((id) => {
              const sc = STATUS_CONFIG[id.status]
              const ac = ACCESS_CONFIG[id.accessLevel]
              return (
                <tr
                  key={id.id}
                  className="cursor-pointer"
                  onClick={() => setSelected(id)}
                >
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                        style={{ backgroundColor: 'var(--soc-accent-bg)', color: 'var(--soc-accent-text)' }}
                      >
                        {id.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-medium" style={{ color: 'var(--soc-text)' }}>{id.name}</p>
                          {id.anomalousActivity && <span className="soc-badge soc-badge-critical">!</span>}
                        </div>
                        <p className="text-xs" style={{ color: 'var(--soc-text-muted)' }}>{id.email}</p>
                      </div>
                    </div>
                  </td>
                  <td><span className="text-xs" style={{ color: 'var(--soc-text-secondary)' }}>{id.role}</span></td>
                  <td><span className="text-xs" style={{ color: 'var(--soc-text-secondary)' }}>{id.department}</span></td>
                  <td><span className="soc-badge" style={{ color: ac.color, border: `1px solid ${ac.color}44`, background: 'transparent' }}>{ac.label}</span></td>
                  <td className="text-center">
                    {id.mfaEnabled
                      ? <span style={{ color: 'var(--soc-low)', fontSize: '14px' }}>✓</span>
                      : <span style={{ color: 'var(--soc-critical)', fontSize: '14px' }}>✗</span>
                    }
                  </td>
                  <td className="text-center">
                    <span className="text-sm tabular-nums" style={{ color: 'var(--soc-text)' }}>{id.activeSessions ?? 0}</span>
                  </td>
                  <td className="text-center">
                    <span
                      className="text-sm tabular-nums font-semibold"
                      style={{ color: (id.failedLoginAttempts ?? 0) >= 3 ? 'var(--soc-critical)' : (id.failedLoginAttempts ?? 0) > 0 ? 'var(--soc-medium)' : 'var(--soc-text-muted)' }}
                    >
                      {id.failedLoginAttempts ?? 0}
                    </span>
                  </td>
                  <td className="text-right">
                    <span
                      className="text-sm font-bold tabular-nums"
                      style={{ color: id.riskScore >= 50 ? 'var(--soc-critical)' : id.riskScore >= 30 ? 'var(--soc-medium)' : 'var(--soc-low)' }}
                    >
                      {id.riskScore}
                    </span>
                  </td>
                  <td>
                    <span className="soc-badge" style={{ backgroundColor: sc.bg, color: sc.color }}>{sc.label}</span>
                  </td>
                  <td>
                    <span className="text-xs" style={{ color: 'var(--soc-text-muted)' }}>{id.lastLogin}</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Modal */}
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
            <div className="px-5 py-4 border-b flex items-center gap-3" style={{ borderColor: 'var(--soc-border)' }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold" style={{ backgroundColor: 'var(--soc-accent-bg)', color: 'var(--soc-accent-text)' }}>
                {selected.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div className="flex-1">
                <h2 className="text-base font-bold" style={{ color: 'var(--soc-text)' }}>{selected.name}</h2>
                <p className="text-xs" style={{ color: 'var(--soc-text-muted)' }}>{selected.email}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-sm w-7 h-7 flex items-center justify-center rounded" style={{ color: 'var(--soc-text-muted)', backgroundColor: 'var(--soc-raised)' }}>✕</button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              <div className="flex gap-2">
                <span className="soc-badge" style={{ backgroundColor: STATUS_CONFIG[selected.status].bg, color: STATUS_CONFIG[selected.status].color }}>{STATUS_CONFIG[selected.status].label}</span>
                <span className="soc-badge" style={{ color: ACCESS_CONFIG[selected.accessLevel].color, border: `1px solid ${ACCESS_CONFIG[selected.accessLevel].color}44`, background: 'transparent' }}>{ACCESS_CONFIG[selected.accessLevel].label}</span>
                {!selected.mfaEnabled && <span className="soc-badge soc-badge-high">MFA DISABLED</span>}
                {selected.anomalousActivity && <span className="soc-badge soc-badge-critical">ANOMALOUS</span>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'ROLE',         value: selected.role },
                  { label: 'DEPARTMENT',   value: selected.department },
                  { label: 'RISK SCORE',   value: String(selected.riskScore) },
                  { label: 'LAST LOGIN',   value: selected.lastLogin },
                  { label: 'SESSIONS',     value: String(selected.activeSessions ?? 0) },
                  { label: 'FAILED LOGINS',value: String(selected.failedLoginAttempts ?? 0) },
                ].map(({ label, value }) => (
                  <div key={label} className="p-3 rounded" style={{ backgroundColor: 'var(--soc-raised)' }}>
                    <p className="soc-label mb-1">{label}</p>
                    <p className="text-sm font-medium" style={{ color: 'var(--soc-text)' }}>{value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="px-5 py-4 flex gap-3 border-t" style={{ borderColor: 'var(--soc-border)' }}>
              <button className="soc-btn soc-btn-primary flex-1">Manage Access</button>
              <button onClick={() => setSelected(null)} className="soc-btn soc-btn-secondary flex-1">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

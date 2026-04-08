'use client'

import { useEffect, useState } from 'react'
import { usePageTitle } from '@/app/page-title-context'

export default function UserManagementPage() {
  const { setPageTitle } = usePageTitle()

  useEffect(() => {
    setPageTitle('User Management')
  }, [setPageTitle])

  const users = [
    { name: 'Peter Pan', email: 'peter.pan@neverlands.art', role: 'SOC Analyst L2', dept: 'Security', lastLogin: '2 min ago', status: 'active', mfa: true },
    { name: 'Sarah Chen', email: 'sarah.chen@neverlands.art', role: 'SOC Manager', dept: 'Security', lastLogin: '1 hour ago', status: 'active', mfa: true },
    { name: 'James Rodriguez', email: 'james.rodriguez@neverlands.art', role: 'Security Engineer', dept: 'Security', lastLogin: '3 hours ago', status: 'active', mfa: true },
    { name: 'Emily Taylor', email: 'emily.taylor@neverlands.art', role: 'Admin', dept: 'IT', lastLogin: 'Today, 09:14', status: 'active', mfa: true },
    { name: 'Michael Kim', email: 'michael.kim@neverlands.art', role: 'SOC Analyst L1', dept: 'Operations', lastLogin: '2 days ago', status: 'inactive', mfa: false },
    { name: 'Olivia Martinez', email: 'o.martinez@neverlands.art', role: 'Threat Hunter', dept: 'Security', lastLogin: '30 min ago', status: 'active', mfa: true },
    { name: 'Daniel Park', email: 'd.park@neverlands.art', role: 'Vulnerability Analyst', dept: 'Security', lastLogin: '1 day ago', status: 'active', mfa: true },
    { name: 'Aisha Johnson', email: 'a.johnson@neverlands.art', role: 'Incident Responder', dept: 'Security', lastLogin: 'Today, 11:47', status: 'active', mfa: true },
    { name: 'Tom Walsh', email: 't.walsh@neverlands.art', role: 'Compliance Officer', dept: 'Legal', lastLogin: 'Yesterday', status: 'active', mfa: true },
    { name: 'Nina Patel', email: 'n.patel@neverlands.art', role: 'Cloud Security', dept: 'Infrastructure', lastLogin: 'Today, 08:30', status: 'active', mfa: true },
    { name: 'Ryan Lee', email: 'r.lee@neverlands.art', role: 'SOC Analyst L1', dept: 'Security', lastLogin: '5 hours ago', status: 'active', mfa: false },
    { name: 'Zoe Brooks', email: 'z.brooks@neverlands.art', role: 'CISO', dept: 'Executive', lastLogin: 'Today, 07:55', status: 'active', mfa: true },
  ]

  const roleDistribution = [
    { role: 'SOC Analyst', count: 487, color: 'var(--soc-accent)' },
    { role: 'Security Engineer', count: 234, color: 'var(--soc-low)' },
    { role: 'Incident Responder', count: 156, color: 'var(--soc-critical)' },
    { role: 'Threat Hunter', count: 89, color: 'var(--soc-high)' },
    { role: 'Compliance', count: 67, color: 'var(--soc-medium)' },
    { role: 'Admin / Other', count: 214, color: 'var(--soc-text-muted)' },
  ]

  const mfaByDept = [
    { dept: 'Security', mfaRate: 100, users: 423 },
    { dept: 'IT', mfaRate: 98, users: 187 },
    { dept: 'Executive', mfaRate: 100, users: 24 },
    { dept: 'Operations', mfaRate: 89, users: 312 },
    { dept: 'Legal', mfaRate: 94, users: 67 },
    { dept: 'Infrastructure', mfaRate: 97, users: 234 },
  ]

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-6 soc-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <p className="soc-label mb-1">ADMINISTRATION</p>
          <h1 className="text-xl font-bold tracking-tight mb-1.5" style={{ color: 'var(--soc-text)' }}>User Management</h1>
          <p className="text-sm" style={{ color: 'var(--soc-text-secondary)' }}>Manage portal users, roles, and permissions</p>
        </div>
        <button className="soc-btn soc-btn-primary">Add User</button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'TOTAL USERS', value: '1,500', sub: 'Across all departments' },
          { label: 'ACTIVE', value: '1,247', sub: '83% of total', accent: true },
          { label: 'MFA COVERAGE', value: '95%', sub: '1,425 users protected', accent: true },
          { label: 'ADMINS', value: '18', sub: 'With elevated privileges' },
        ].map((kpi, i) => (
          <div key={i} className="soc-card">
            <p className="soc-label mb-2">{kpi.label}</p>
            <p className="soc-metric-lg" style={kpi.accent ? { color: 'var(--soc-accent)' } : {}}>{kpi.value}</p>
            <p className="text-xs" style={{ color: 'var(--soc-text-muted)' }}>{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="grid grid-cols-12 gap-4">
        {/* Users Table */}
        <div className="col-span-12 lg:col-span-8">
          <div className="soc-card" style={{ padding: 0 }}>
            <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--soc-border)' }}>
              <p className="soc-label">USERS</p>
              <span className="text-xs" style={{ color: 'var(--soc-text-muted)' }}>{users.length} shown</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="soc-table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Department</th>
                    <th>MFA</th>
                    <th>Status</th>
                    <th>Last Active</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, idx) => {
                    const initials = user.name.split(' ').map(n => n[0]).join('')
                    return (
                      <tr key={idx}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                            <div style={{
                              width: '2rem', height: '2rem', borderRadius: '50%',
                              background: 'var(--soc-accent-bg)', color: 'var(--soc-accent)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '0.75rem', fontWeight: 700, flexShrink: 0
                            }}>
                              {initials}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, color: 'var(--soc-text)', fontSize: '0.875rem' }}>{user.name}</div>
                              <div style={{ color: 'var(--soc-text-muted)', fontSize: '0.75rem', fontFamily: 'monospace' }}>{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ color: 'var(--soc-text-secondary)', fontSize: '0.875rem' }}>{user.role}</td>
                        <td style={{ color: 'var(--soc-text-secondary)', fontSize: '0.875rem' }}>{user.dept}</td>
                        <td>
                          {user.mfa ? (
                            <span style={{ color: 'var(--soc-low)', fontWeight: 700 }}>✓</span>
                          ) : (
                            <span style={{ color: 'var(--soc-critical)', fontWeight: 700 }}>✗</span>
                          )}
                        </td>
                        <td>
                          <span className="soc-badge" style={{
                            backgroundColor: user.status === 'active' ? 'var(--soc-low-bg)' : 'var(--soc-border)',
                            color: user.status === 'active' ? 'var(--soc-low)' : 'var(--soc-text-muted)'
                          }}>
                            {user.status.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ color: 'var(--soc-text-muted)', fontSize: '0.8125rem' }}>{user.lastLogin}</td>
                        <td>
                          <button className="soc-link" style={{ fontSize: '0.8125rem' }}>Edit</button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-span-12 lg:col-span-4" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Role Distribution */}
          <div className="soc-card">
            <p className="soc-label mb-3">ROLE DISTRIBUTION</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {roleDistribution.map((item, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ color: 'var(--soc-text-secondary)', fontSize: '0.875rem' }}>{item.role}</span>
                    <span style={{ color: 'var(--soc-text)', fontWeight: 600, fontSize: '0.875rem' }}>{item.count}</span>
                  </div>
                  <div className="soc-progress-track">
                    <div className="soc-progress-fill" style={{ width: `${(item.count / 1247) * 100}%`, backgroundColor: item.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* MFA Coverage */}
          <div className="soc-card">
            <p className="soc-label mb-3">MFA BY DEPARTMENT</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {mfaByDept.map((d, i) => {
                const color = d.mfaRate >= 99 ? 'var(--soc-low)' : d.mfaRate >= 90 ? 'var(--soc-medium)' : 'var(--soc-critical)'
                const bg = d.mfaRate >= 99 ? 'var(--soc-low-bg)' : d.mfaRate >= 90 ? 'var(--soc-medium-bg)' : 'var(--soc-critical-bg)'
                return (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.625rem 0.75rem', background: 'var(--soc-raised)', borderRadius: '6px',
                    border: '1px solid var(--soc-border)'
                  }}>
                    <div>
                      <div style={{ fontWeight: 500, color: 'var(--soc-text)', fontSize: '0.875rem' }}>{d.dept}</div>
                      <div style={{ color: 'var(--soc-text-muted)', fontSize: '0.75rem' }}>{d.users} users</div>
                    </div>
                    <span className="soc-badge" style={{ backgroundColor: bg, color }}>{d.mfaRate}%</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Active Sessions */}
          <div className="soc-card">
            <p className="soc-label mb-3">ACTIVE SESSIONS</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                { label: 'Total concurrent', value: '342' },
                { label: 'Peak today', value: '891' },
                { label: 'Avg session length', value: '2.4h' },
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: i < 2 ? '1px solid var(--soc-border)' : 'none' }}>
                  <span style={{ color: 'var(--soc-text-secondary)', fontSize: '0.875rem' }}>{s.label}</span>
                  <span style={{ fontWeight: 600, color: 'var(--soc-text)', fontSize: '0.875rem' }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

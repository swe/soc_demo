'use client'

import { useEffect, useState } from 'react'
import { usePageTitle } from '@/app/page-title-context'
import { useTheme } from '@/lib/theme'

export default function SettingsPage() {
  const { setPageTitle } = usePageTitle()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setPageTitle('Settings')
    setMounted(true)
  }, [setPageTitle])

  const [profile, setProfile] = useState({
    name: 'Peter Pan',
    email: 'peter.pan@neverlands.art',
    phone: '+1 (555) 123-4567',
    timezone: 'UTC',
    role: 'SOC Analyst L2',
    department: 'Security',
  })

  const [mfaEnabled, setMfaEnabled] = useState(true)
  const [notifications, setNotifications] = useState({
    criticalAlerts: true,
    highAlerts: true,
    weeklyDigest: true,
    incidentUpdates: true,
    policyChanges: false,
    loginAlerts: true,
  })
  const [socPrefs, setSocPrefs] = useState({
    defaultSeverity: 'high',
    autoAssign: true,
    playSound: false,
    compactMode: false,
  })

  const ToggleSwitch = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      style={{
        position: 'relative',
        display: 'inline-flex',
        height: '1.625rem',
        width: '2.75rem',
        alignItems: 'center',
        borderRadius: '9999px',
        flexShrink: 0,
        transition: 'background-color 0.2s',
        backgroundColor: checked ? 'var(--soc-accent)' : 'var(--soc-border-mid)',
        border: 'none',
        cursor: 'pointer',
      }}
      aria-checked={checked}
      role="switch"
    >
      <span style={{
        display: 'inline-block',
        width: '1.25rem',
        height: '1.25rem',
        borderRadius: '50%',
        backgroundColor: '#fff',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        transform: checked ? 'translateX(1.375rem)' : 'translateX(0.2rem)',
        transition: 'transform 0.2s',
      }} />
    </button>
  )

  const initials = profile.name.split(' ').map(n => n[0]).join('')

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-6 hig-fade-in">
      {/* Header */}
      <div className="mb-6">
        <div className="soc-label mb-1">ACCOUNT</div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--soc-text)', lineHeight: 1.2 }}>Profile &amp; Settings</h1>
        <p style={{ color: 'var(--soc-text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Manage your profile, security, and notification preferences</p>
      </div>

      {/* Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1.5rem', alignItems: 'start' }}>

        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Profile Card */}
          <div className="soc-card" style={{ padding: '1.5rem' }}>
            <div style={{ borderBottom: '1px solid var(--soc-border)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
              <span style={{ fontWeight: 600, color: 'var(--soc-text)', fontSize: '0.9375rem' }}>Profile</span>
            </div>

            {/* Avatar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{
                width: '4rem', height: '4rem', borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--soc-accent), #6366f1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, boxShadow: '0 2px 8px rgba(79,70,229,0.3)'
              }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>{initials}</span>
              </div>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--soc-text)', fontSize: '1rem' }}>{profile.name}</div>
                <div style={{ color: 'var(--soc-text-secondary)', fontSize: '0.8125rem', marginTop: '0.125rem' }}>{profile.role}</div>
                <div style={{ color: 'var(--soc-text-muted)', fontSize: '0.75rem' }}>{profile.department}</div>
              </div>
            </div>

            {/* Edit Form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--soc-text-secondary)', marginBottom: '0.375rem' }}>Full Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                  className="hig-input"
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--soc-text-secondary)', marginBottom: '0.375rem' }}>Email Address</label>
                <input
                  type="email"
                  value={profile.email}
                  readOnly
                  className="hig-input"
                  style={{ width: '100%', opacity: 0.6, cursor: 'not-allowed' }}
                />
                <p style={{ fontSize: '0.75rem', color: 'var(--soc-text-muted)', marginTop: '0.25rem' }}>Email cannot be changed</p>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--soc-text-secondary)', marginBottom: '0.375rem' }}>Phone Number</label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                  className="hig-input"
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--soc-text-secondary)', marginBottom: '0.375rem' }}>Timezone</label>
                <select
                  value={profile.timezone}
                  onChange={(e) => setProfile(prev => ({ ...prev, timezone: e.target.value }))}
                  className="hig-input"
                  style={{ width: '100%' }}
                >
                  <option value="UTC">UTC (GMT+0)</option>
                  <option value="EST">Eastern Time (GMT-5)</option>
                  <option value="CST">Central Time (GMT-6)</option>
                  <option value="MST">Mountain Time (GMT-7)</option>
                  <option value="PST">Pacific Time (GMT-8)</option>
                </select>
              </div>
            </div>

            {/* Save / Cancel */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--soc-border)' }}>
              <button className="soc-btn soc-btn-primary" style={{ flex: 1 }}>Save Changes</button>
              <button className="soc-btn soc-btn-secondary">Cancel</button>
            </div>
          </div>

          {/* Appearance */}
          <div className="soc-card" style={{ padding: '1.5rem' }}>
            <div style={{ borderBottom: '1px solid var(--soc-border)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
              <span style={{ fontWeight: 600, color: 'var(--soc-text)', fontSize: '0.9375rem' }}>Appearance</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
              {['light', 'dark', 'system'].map((t) => (
                <button
                  key={t}
                  onClick={() => mounted && setTheme(t)}
                  style={{
                    padding: '0.75rem 0.5rem',
                    borderRadius: '6px',
                    border: `2px solid ${theme === t ? 'var(--soc-accent)' : 'var(--soc-border)'}`,
                    background: theme === t ? 'var(--soc-accent-bg)' : 'var(--soc-raised)',
                    color: theme === t ? 'var(--soc-accent)' : 'var(--soc-text-secondary)',
                    fontWeight: 500,
                    fontSize: '0.8125rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Security */}
          <div className="soc-card" style={{ padding: '1.5rem' }}>
            <div style={{ borderBottom: '1px solid var(--soc-border)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
              <span style={{ fontWeight: 600, color: 'var(--soc-text)', fontSize: '0.9375rem' }}>Security</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem', background: 'var(--soc-raised)', borderRadius: '6px', border: '1px solid var(--soc-border)' }}>
              <div>
                <div style={{ fontWeight: 500, color: 'var(--soc-text)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Multi-Factor Authentication</div>
                <div style={{ color: 'var(--soc-text-muted)', fontSize: '0.8125rem' }}>
                  {mfaEnabled ? 'Additional security layer is active' : 'Enable for better account protection'}
                </div>
              </div>
              <ToggleSwitch checked={mfaEnabled} onChange={() => setMfaEnabled(!mfaEnabled)} />
            </div>
            {mfaEnabled && (
              <div style={{ marginTop: '0.75rem' }}>
                <button className="soc-btn soc-btn-secondary">View Backup Codes</button>
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="soc-card" style={{ padding: '1.5rem' }}>
            <div style={{ borderBottom: '1px solid var(--soc-border)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
              <span style={{ fontWeight: 600, color: 'var(--soc-text)', fontSize: '0.9375rem' }}>Notification Preferences</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {([
                { key: 'criticalAlerts', label: 'Critical Alerts', desc: 'Immediate notification for critical severity events' },
                { key: 'highAlerts', label: 'High Severity Alerts', desc: 'Notifications for high severity findings and incidents' },
                { key: 'weeklyDigest', label: 'Weekly Security Digest', desc: 'Summary of security posture and key events every Monday' },
                { key: 'incidentUpdates', label: 'Incident Status Updates', desc: 'Updates when assigned incidents change status' },
                { key: 'policyChanges', label: 'Policy Change Notifications', desc: 'Alerts when security policies are modified' },
                { key: 'loginAlerts', label: 'Login Alerts', desc: 'Notify on new device or unusual location logins' },
              ] as { key: keyof typeof notifications; label: string; desc: string }[]).map(({ key, label, desc }) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--soc-raised)', borderRadius: '6px', border: '1px solid var(--soc-border)' }}>
                  <div style={{ flex: 1, marginRight: '1rem' }}>
                    <div style={{ fontWeight: 500, color: 'var(--soc-text)', fontSize: '0.875rem' }}>{label}</div>
                    <div style={{ color: 'var(--soc-text-muted)', fontSize: '0.75rem', marginTop: '0.125rem' }}>{desc}</div>
                  </div>
                  <ToggleSwitch checked={notifications[key]} onChange={() => setNotifications(prev => ({ ...prev, [key]: !prev[key] }))} />
                </div>
              ))}
            </div>
          </div>

          {/* Active Sessions */}
          <div className="soc-card" style={{ padding: '1.5rem' }}>
            <div style={{ borderBottom: '1px solid var(--soc-border)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
              <span style={{ fontWeight: 600, color: 'var(--soc-text)', fontSize: '0.9375rem' }}>Active Sessions</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="soc-table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Device</th>
                    <th>Location</th>
                    <th>Browser</th>
                    <th>Last Active</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { device: 'MacBook Pro 16"', location: 'New York, US', browser: 'Chrome 122', lastActive: 'Now', current: true },
                    { device: 'iPhone 15 Pro', location: 'New York, US', browser: 'Safari Mobile', lastActive: '2 hours ago', current: false },
                    { device: 'Windows PC', location: 'London, UK', browser: 'Firefox 123', lastActive: 'Yesterday', current: false },
                  ].map((session, i) => (
                    <tr key={i}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div className="soc-dot" style={{ backgroundColor: session.current ? 'var(--soc-low)' : 'var(--soc-border-mid)' }} />
                          <span style={{ fontWeight: session.current ? 600 : 400, color: 'var(--soc-text)', fontSize: '0.875rem' }}>{session.device}</span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--soc-text-secondary)', fontSize: '0.8125rem' }}>{session.location}</td>
                      <td style={{ color: 'var(--soc-text-secondary)', fontSize: '0.8125rem' }}>{session.browser}</td>
                      <td style={{ color: 'var(--soc-text-muted)', fontSize: '0.8125rem' }}>{session.lastActive}</td>
                      <td>
                        {session.current ? (
                          <span className="soc-badge" style={{ backgroundColor: 'var(--soc-low-bg)', color: 'var(--soc-low)' }}>Current</span>
                        ) : (
                          <button style={{ fontSize: '0.8125rem', color: 'var(--soc-critical)', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer' }}>Revoke</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* SOC Preferences */}
          <div className="soc-card" style={{ padding: '1.5rem' }}>
            <div style={{ borderBottom: '1px solid var(--soc-border)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
              <span style={{ fontWeight: 600, color: 'var(--soc-text)', fontSize: '0.9375rem' }}>SOC Preferences</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--soc-text-secondary)', marginBottom: '0.375rem' }}>Default Alert Severity Filter</label>
                <select
                  value={socPrefs.defaultSeverity}
                  onChange={(e) => setSocPrefs(prev => ({ ...prev, defaultSeverity: e.target.value }))}
                  className="hig-input"
                  style={{ width: '100%' }}
                >
                  <option value="all">All Severities</option>
                  <option value="critical">Critical Only</option>
                  <option value="high">High &amp; Above</option>
                  <option value="medium">Medium &amp; Above</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                {([
                  { key: 'autoAssign', label: 'Auto-assign Incidents', desc: 'Assign automatically by rules' },
                  { key: 'playSound', label: 'Alert Sound', desc: 'Audio on critical alerts' },
                  { key: 'compactMode', label: 'Compact View', desc: 'Denser table layouts' },
                ] as { key: keyof typeof socPrefs; label: string; desc: string }[]).map(({ key, label, desc }) => (
                  <div key={key} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '0.875rem', background: 'var(--soc-raised)', borderRadius: '6px', border: '1px solid var(--soc-border)', gap: '0.75rem' }}>
                    <div>
                      <div style={{ fontWeight: 500, color: 'var(--soc-text)', fontSize: '0.8125rem', marginBottom: '0.25rem' }}>{label}</div>
                      <div style={{ color: 'var(--soc-text-muted)', fontSize: '0.75rem' }}>{desc}</div>
                    </div>
                    <ToggleSwitch
                      checked={typeof socPrefs[key] === 'boolean' ? socPrefs[key] as boolean : false}
                      onChange={() => setSocPrefs(prev => ({ ...prev, [key]: !prev[key as keyof typeof socPrefs] }))}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

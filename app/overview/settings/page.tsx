'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePageTitle } from '@/app/page-title-context'
import {
  OverviewAlert,
  OverviewFilterMenu,
  OverviewModal,
  OverviewNestedStatCard,
  OverviewPageHeader,
  OverviewPageShell,
  OverviewSection,
  OverviewStepModal,
  OverviewTableToolbar,
  OverviewToggle,
} from '@/components/overview/unified-ui'
import { useTheme } from '@/lib/theme'

type Profile = {
  name: string
  email: string
  phone: string
  timezone: string
  role: string
  department: string
}

type NotificationPreferences = {
  criticalAlerts: boolean
  highAlerts: boolean
  weeklyDigest: boolean
  incidentUpdates: boolean
  policyChanges: boolean
  loginAlerts: boolean
}

type SocPrefs = {
  defaultSeverity: 'all' | 'critical' | 'high' | 'medium'
  autoAssign: boolean
  playSound: boolean
  compactMode: boolean
}

type SessionRow = {
  id: string
  device: string
  location: string
  browser: string
  platform: 'desktop' | 'mobile'
  lastActive: string
  current: boolean
}

const DEFAULT_PROFILE: Profile = {
  name: 'Peter Pan',
  email: 'peter.pan@neverlands.art',
  phone: '+1 (555) 123-4567',
  timezone: 'UTC',
  role: 'SOC Analyst L2',
  department: 'Security',
}

const DEFAULT_NOTIFICATIONS: NotificationPreferences = {
  criticalAlerts: true,
  highAlerts: true,
  weeklyDigest: true,
  incidentUpdates: true,
  policyChanges: false,
  loginAlerts: true,
}

const DEFAULT_SOC_PREFS: SocPrefs = {
  defaultSeverity: 'high',
  autoAssign: true,
  playSound: false,
  compactMode: false,
}

const DEFAULT_SESSIONS: SessionRow[] = [
  { id: 'SES-0031', device: 'MacBook Pro 16"', location: 'New York, US', browser: 'Chrome 122', platform: 'desktop', lastActive: 'Now', current: true },
  { id: 'SES-0028', device: 'iPhone 15 Pro', location: 'New York, US', browser: 'Safari Mobile', platform: 'mobile', lastActive: '2 hours ago', current: false },
  { id: 'SES-0021', device: 'Windows PC', location: 'London, UK', browser: 'Firefox 123', platform: 'desktop', lastActive: 'Yesterday', current: false },
]

const SESSION_FILTER_OPTIONS = [
  { id: 'status-current', label: 'Current session', section: 'Session Type' },
  { id: 'status-other', label: 'Other sessions', section: 'Session Type' },
  { id: 'platform-desktop', label: 'Desktop', section: 'Platform' },
  { id: 'platform-mobile', label: 'Mobile', section: 'Platform' },
]

function CompactToggle({
  checked,
  onChange,
  ariaLabel,
}: {
  checked: boolean
  onChange: (next: boolean) => void
  ariaLabel: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      className={`inline-flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors ${
        checked ? 'justify-end bg-[color:var(--soc-accent)]' : 'justify-start bg-[color:var(--soc-border-mid)]'
      }`}
    >
      <span className="pointer-events-none block h-[18px] w-[18px] shrink-0 translate-y-px rounded-full bg-white shadow-sm transition-transform duration-200 ease-out" />
    </button>
  )
}

function generateBackupCodes() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 8 }).map(() =>
    Array.from({ length: 10 })
      .map(() => alphabet[Math.floor(Math.random() * alphabet.length)])
      .join(''),
  )
}

export default function SettingsPage() {
  const { setPageTitle } = usePageTitle()
  const { theme, setTheme } = useTheme()
  const activeTheme = theme ?? 'system'

  const [mounted, setMounted] = useState(false)
  const [savedProfile, setSavedProfile] = useState<Profile>(DEFAULT_PROFILE)
  const [profileDraft, setProfileDraft] = useState<Profile>(DEFAULT_PROFILE)
  const [mfaEnabled, setMfaEnabled] = useState(true)
  const [notifications, setNotifications] = useState<NotificationPreferences>(DEFAULT_NOTIFICATIONS)
  const [socPrefs, setSocPrefs] = useState<SocPrefs>(DEFAULT_SOC_PREFS)
  const [sessions, setSessions] = useState<SessionRow[]>(DEFAULT_SESSIONS)
  const [sessionQuery, setSessionQuery] = useState('')
  const [sessionFilters, setSessionFilters] = useState<string[]>(SESSION_FILTER_OPTIONS.map((opt) => opt.id))

  const [alert, setAlert] = useState<{ tone: 'critical' | 'attention'; title: string; description: string } | null>(null)
  const [showSaveConfirm, setShowSaveConfirm] = useState(false)
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false)
  const [showBackupCodes, setShowBackupCodes] = useState(false)
  const [backupCodes, setBackupCodes] = useState<string[]>(() => generateBackupCodes())
  const [revokeTarget, setRevokeTarget] = useState<SessionRow | null>(null)
  const [showRevokeOthersConfirm, setShowRevokeOthersConfirm] = useState(false)

  const [wizardOpen, setWizardOpen] = useState(false)
  const [wizardStep, setWizardStep] = useState(0)
  const [wizardChannel, setWizardChannel] = useState('')
  const [wizardSeverities, setWizardSeverities] = useState<string[]>(['critical'])
  const [wizardRequireAck, setWizardRequireAck] = useState(true)

  useEffect(() => {
    setPageTitle('Settings')
    setMounted(true)
  }, [setPageTitle])

  const profileDirty = useMemo(
    () =>
      profileDraft.name !== savedProfile.name ||
      profileDraft.phone !== savedProfile.phone ||
      profileDraft.timezone !== savedProfile.timezone,
    [profileDraft, savedProfile],
  )

  const visibleSessions = useMemo(() => {
    const query = sessionQuery.trim().toLowerCase()
    const allowCurrent = sessionFilters.includes('status-current')
    const allowOther = sessionFilters.includes('status-other')
    const allowDesktop = sessionFilters.includes('platform-desktop')
    const allowMobile = sessionFilters.includes('platform-mobile')

    return sessions
      .filter((session) => (session.current ? allowCurrent : allowOther))
      .filter((session) => (session.platform === 'desktop' ? allowDesktop : allowMobile))
      .filter((session) => {
        if (!query) return true
        return (
          session.device.toLowerCase().includes(query) ||
          session.location.toLowerCase().includes(query) ||
          session.browser.toLowerCase().includes(query) ||
          session.id.toLowerCase().includes(query)
        )
      })
  }, [sessionFilters, sessionQuery, sessions])

  const profileChanges = useMemo(() => {
    const changes: string[] = []
    if (profileDraft.name !== savedProfile.name) changes.push(`Name: ${savedProfile.name} -> ${profileDraft.name}`)
    if (profileDraft.phone !== savedProfile.phone) changes.push(`Phone: ${savedProfile.phone} -> ${profileDraft.phone}`)
    if (profileDraft.timezone !== savedProfile.timezone) changes.push(`Timezone: ${savedProfile.timezone} -> ${profileDraft.timezone}`)
    return changes
  }, [profileDraft, savedProfile])

  const initials = profileDraft.name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <OverviewPageShell>
      <OverviewPageHeader
        section="ACCOUNT SETTINGS"
        title="Profile & Settings"
        description="Manage account profile, access controls, SOC preferences, and session security from one unified panel."
        actions={[
          { id: 'wizard', label: 'Create Escalation Flow', variant: 'secondary', onClick: () => setWizardOpen(true) },
          { id: 'save', label: 'Save Profile', variant: 'primary', onClick: () => setShowSaveConfirm(true) },
        ]}
      />

      {alert && (
        <div className="mb-4">
          <OverviewAlert tone={alert.tone} title={alert.title} description={alert.description} />
        </div>
      )}

      <div className="soc-card mb-5">
        <div className="border-b px-4 py-3" style={{ borderColor: 'var(--soc-border)' }}>
          <p className="soc-label">SECURITY SNAPSHOT</p>
          <p className="mt-0.5 text-sm" style={{ color: 'var(--soc-text-secondary)' }}>
            Unified summary cards for identity posture, notifications, and SOC behavior defaults.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-4 lg:grid-cols-6">
          <OverviewNestedStatCard label="MFA" value={mfaEnabled ? 'ON' : 'OFF'} sub="Account" accentColor={mfaEnabled ? 'var(--soc-low)' : 'var(--soc-critical)'} />
          <OverviewNestedStatCard label="ALERTS" value={notifications.criticalAlerts ? 'P1 ON' : 'P1 OFF'} sub="Critical notifications" accentColor={notifications.criticalAlerts ? 'var(--soc-low)' : 'var(--soc-medium)'} />
          <OverviewNestedStatCard label="AUTO-ASSIGN" value={socPrefs.autoAssign ? 'ON' : 'OFF'} sub="Routing" accentColor={socPrefs.autoAssign ? 'var(--soc-accent)' : 'var(--soc-text-muted)'} />
          <OverviewNestedStatCard label="SOUND" value={socPrefs.playSound ? 'ON' : 'OFF'} sub="Critical alerts" accentColor="var(--soc-medium)" />
          <OverviewNestedStatCard label="VIEW" value={socPrefs.compactMode ? 'COMPACT' : 'DEFAULT'} sub="Tables" accentColor="var(--soc-text)" />
          <OverviewNestedStatCard label="THEME" value={activeTheme.toUpperCase()} sub="Interface" accentColor="var(--soc-text-muted)" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <OverviewSection title="PROFILE">
          <div className="px-4 py-4 space-y-4">
            <div className="flex items-center gap-3">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold"
                style={{
                  background: 'linear-gradient(135deg, var(--soc-accent), #6366f1)',
                  color: '#fff',
                }}
              >
                {initials || 'NA'}
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--soc-text)' }}>{profileDraft.name}</p>
                <p className="text-xs" style={{ color: 'var(--soc-text-secondary)' }}>{profileDraft.role}</p>
                <p className="text-xs" style={{ color: 'var(--soc-text-muted)' }}>{profileDraft.department}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--soc-text-secondary)' }}>Full Name</label>
                <input
                  type="text"
                  className="soc-input w-full"
                  value={profileDraft.name}
                  onChange={(e) => setProfileDraft((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--soc-text-secondary)' }}>Email Address</label>
                <input type="email" className="soc-input w-full opacity-60 cursor-not-allowed" value={profileDraft.email} readOnly />
                <p className="mt-1 text-xs" style={{ color: 'var(--soc-text-muted)' }}>Email cannot be changed.</p>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--soc-text-secondary)' }}>Phone Number</label>
                  <input
                    type="tel"
                    className="soc-input w-full"
                    value={profileDraft.phone}
                    onChange={(e) => setProfileDraft((prev) => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--soc-text-secondary)' }}>Timezone</label>
                  <select
                    value={profileDraft.timezone}
                    onChange={(e) => setProfileDraft((prev) => ({ ...prev, timezone: e.target.value }))}
                    className="soc-input w-full"
                  >
                    <option value="UTC">UTC (GMT+0)</option>
                    <option value="EST">Eastern Time (GMT-5)</option>
                    <option value="CST">Central Time (GMT-6)</option>
                    <option value="MST">Mountain Time (GMT-7)</option>
                    <option value="PST">Pacific Time (GMT-8)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 border-t pt-3" style={{ borderColor: 'var(--soc-border)' }}>
              <button type="button" className="soc-btn soc-btn-primary" onClick={() => setShowSaveConfirm(true)}>
                Save Changes
              </button>
              <button type="button" className="soc-btn soc-btn-secondary" disabled={!profileDirty} onClick={() => setShowDiscardConfirm(true)}>
                Discard Draft
              </button>
            </div>
          </div>
        </OverviewSection>

        <div className="space-y-4">
          <OverviewSection title="APPEARANCE & ACCESS">
            <div className="px-4 py-4 space-y-4">
              <div>
                <p className="soc-label mb-2">Theme</p>
                <div className="grid grid-cols-3 gap-2">
                  {(['light', 'dark', 'system'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        if (!mounted) return
                        setTheme(t)
                        setAlert({
                          tone: 'attention',
                          title: 'Theme updated',
                          description: `Interface switched to ${t} mode.`,
                        })
                      }}
                      className="rounded-md border px-2 py-2 text-xs font-medium transition-colors"
                      style={{
                        borderColor: activeTheme === t ? 'var(--soc-accent)' : 'var(--soc-border)',
                        backgroundColor: activeTheme === t ? 'var(--soc-accent-bg)' : 'var(--soc-raised)',
                        color: activeTheme === t ? 'var(--soc-accent-text)' : 'var(--soc-text-secondary)',
                      }}
                    >
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div
                className="flex flex-col gap-3 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between"
                style={{ borderColor: 'var(--soc-border)', backgroundColor: 'var(--soc-raised)' }}
              >
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--soc-text)' }}>Multi-Factor Authentication</p>
                  <p className="text-xs" style={{ color: 'var(--soc-text-muted)' }}>
                    {mfaEnabled ? 'Additional security layer is active.' : 'Enable MFA for stronger account protection.'}
                  </p>
                </div>
                <CompactToggle checked={mfaEnabled} onChange={setMfaEnabled} ariaLabel="Multi-Factor Authentication" />
              </div>

              {mfaEnabled && (
                <div className="flex justify-end">
                  <button type="button" className="soc-btn soc-btn-secondary" onClick={() => setShowBackupCodes(true)}>
                    View Backup Codes
                  </button>
                </div>
              )}
            </div>
          </OverviewSection>

          <OverviewSection title="SOC PREFERENCES">
            <div className="px-4 py-4 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--soc-text-secondary)' }}>
                  Default Alert Severity Filter
                </label>
                <select
                  value={socPrefs.defaultSeverity}
                  onChange={(e) => setSocPrefs((prev) => ({ ...prev, defaultSeverity: e.target.value as SocPrefs['defaultSeverity'] }))}
                  className="soc-input w-full"
                >
                  <option value="all">All Severities</option>
                  <option value="critical">Critical Only</option>
                  <option value="high">High &amp; Above</option>
                  <option value="medium">Medium &amp; Above</option>
                </select>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {([
                  { key: 'autoAssign', label: 'Auto-assign incidents' },
                  { key: 'playSound', label: 'Alert sound' },
                  { key: 'compactMode', label: 'Compact view' },
                ] as const).map(({ key, label }) => (
                  <div
                    key={key}
                    className="flex items-center justify-between gap-3 rounded-md border px-3 py-2.5"
                    style={{ borderColor: 'var(--soc-border)', backgroundColor: 'var(--soc-raised)' }}
                  >
                    <p className="text-sm font-medium" style={{ color: 'var(--soc-text)' }}>{label}</p>
                    <CompactToggle
                      checked={socPrefs[key]}
                      onChange={(next) => setSocPrefs((prev) => ({ ...prev, [key]: next }))}
                      ariaLabel={label}
                    />
                  </div>
                ))}
              </div>
            </div>
          </OverviewSection>
        </div>
      </div>

      <div className="mt-4">
        <OverviewSection title="NOTIFICATION PREFERENCES">
          <div className="px-4 py-4 grid grid-cols-1 gap-2 lg:grid-cols-2">
            {([
              { key: 'criticalAlerts', label: 'Critical Alerts', desc: 'Immediate notification for critical severity events.' },
              { key: 'highAlerts', label: 'High Severity Alerts', desc: 'Notifications for high severity findings and incidents.' },
              { key: 'weeklyDigest', label: 'Weekly Security Digest', desc: 'Weekly summary of posture and key events.' },
              { key: 'incidentUpdates', label: 'Incident Status Updates', desc: 'Updates when assigned incidents change state.' },
              { key: 'policyChanges', label: 'Policy Change Notifications', desc: 'Alerts when security policies are modified.' },
              { key: 'loginAlerts', label: 'Login Alerts', desc: 'Notify on new device or unusual location logins.' },
            ] as const).map(({ key, label, desc }) => (
              <div
                key={key}
                className="flex items-center justify-between gap-3 rounded-md border px-3 py-2.5"
                style={{ borderColor: 'var(--soc-border)', backgroundColor: 'var(--soc-raised)' }}
              >
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--soc-text)' }}>{label}</p>
                  <p className="text-xs" style={{ color: 'var(--soc-text-muted)' }}>{desc}</p>
                </div>
                <CompactToggle
                  checked={notifications[key]}
                  onChange={(next) => setNotifications((prev) => ({ ...prev, [key]: next }))}
                  ariaLabel={label}
                />
              </div>
            ))}
          </div>
        </OverviewSection>
      </div>

      <div className="mt-4">
        <OverviewTableToolbar
          searchValue={sessionQuery}
          onSearchChange={setSessionQuery}
          searchPlaceholder="Search device, location, browser, id..."
          end={(
            <div className="flex w-full gap-2 sm:justify-end">
              <OverviewFilterMenu
                options={SESSION_FILTER_OPTIONS}
                selected={sessionFilters}
                onApply={setSessionFilters}
              />
              <button
                type="button"
                className="soc-btn soc-btn-secondary text-xs"
                onClick={() => setShowRevokeOthersConfirm(true)}
                disabled={sessions.filter((s) => !s.current).length === 0}
              >
                Revoke Other Sessions
              </button>
            </div>
          )}
        />

        <OverviewSection title="ACTIVE SESSIONS">
          <table className="soc-table">
            <thead>
              <tr>
                <th>Session ID</th>
                <th>Device</th>
                <th>Location</th>
                <th>Browser</th>
                <th>Last Active</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {visibleSessions.map((session) => (
                <tr key={session.id}>
                  <td>
                    <span className="text-xs font-mono" style={{ color: 'var(--soc-text-muted)' }}>{session.id}</span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <span className="soc-dot" style={{ backgroundColor: session.current ? 'var(--soc-low)' : 'var(--soc-border-mid)' }} />
                      <span style={{ color: 'var(--soc-text)' }}>{session.device}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--soc-text-secondary)' }}>{session.location}</td>
                  <td style={{ color: 'var(--soc-text-secondary)' }}>{session.browser}</td>
                  <td style={{ color: 'var(--soc-text-muted)' }}>{session.lastActive}</td>
                  <td className="text-right">
                    {session.current ? (
                      <span className="soc-badge" style={{ backgroundColor: 'var(--soc-low-bg)', color: 'var(--soc-low)' }}>Current</span>
                    ) : (
                      <button type="button" className="soc-link text-xs font-medium" onClick={() => setRevokeTarget(session)}>
                        Revoke
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {visibleSessions.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-sm" style={{ color: 'var(--soc-text-muted)' }}>
                    No sessions match selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </OverviewSection>
      </div>

      <OverviewModal
        open={showSaveConfirm}
        title="Save profile changes"
        subtitle="PROFILE UPDATE"
        onClose={() => setShowSaveConfirm(false)}
        footer={(
          <div className="flex flex-wrap justify-end gap-2">
            <button type="button" className="soc-btn soc-btn-secondary" onClick={() => setShowSaveConfirm(false)}>
              Cancel
            </button>
            <button
              type="button"
              className="soc-btn soc-btn-primary"
              disabled={!profileDirty}
              onClick={() => {
                setSavedProfile(profileDraft)
                setShowSaveConfirm(false)
                setAlert({
                  tone: 'attention',
                  title: 'Profile updated',
                  description: 'Your profile changes were saved successfully.',
                })
              }}
            >
              Confirm Save
            </button>
          </div>
        )}
      >
        {profileDirty ? (
          <div className="space-y-2">
            <p className="text-sm" style={{ color: 'var(--soc-text-secondary)' }}>
              Review the pending changes before they are applied:
            </p>
            <ul className="list-disc pl-5 text-sm" style={{ color: 'var(--soc-text)' }}>
              {profileChanges.map((change) => (
                <li key={change}>{change}</li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-sm" style={{ color: 'var(--soc-text-secondary)' }}>
            No profile changes to save.
          </p>
        )}
      </OverviewModal>

      <OverviewModal
        open={showDiscardConfirm}
        title="Discard profile draft"
        subtitle="CONFIRM DISMISSAL"
        onClose={() => setShowDiscardConfirm(false)}
        footer={(
          <div className="flex flex-wrap justify-end gap-2">
            <button type="button" className="soc-btn soc-btn-secondary" onClick={() => setShowDiscardConfirm(false)}>
              Keep Editing
            </button>
            <button
              type="button"
              className="soc-btn soc-btn-primary"
              onClick={() => {
                setProfileDraft(savedProfile)
                setShowDiscardConfirm(false)
                setAlert({
                  tone: 'attention',
                  title: 'Draft discarded',
                  description: 'Profile form was reset to the last saved values.',
                })
              }}
            >
              Discard
            </button>
          </div>
        )}
      >
        <p className="text-sm" style={{ color: 'var(--soc-text-secondary)' }}>
          This action removes unsaved edits from the profile form.
        </p>
      </OverviewModal>

      <OverviewModal
        open={showBackupCodes}
        title="Recovery backup codes"
        subtitle="MFA RECOVERY"
        onClose={() => setShowBackupCodes(false)}
        footer={(
          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              className="soc-btn soc-btn-secondary"
              onClick={() => {
                setBackupCodes(generateBackupCodes())
                setAlert({
                  tone: 'attention',
                  title: 'Backup codes regenerated',
                  description: 'Old codes are no longer valid.',
                })
              }}
            >
              Regenerate
            </button>
            <button type="button" className="soc-btn soc-btn-primary" onClick={() => setShowBackupCodes(false)}>
              Done
            </button>
          </div>
        )}
      >
        <div className="space-y-3">
          <p className="text-sm" style={{ color: 'var(--soc-text-secondary)' }}>
            Store these codes in a secure location. Each code can be used once.
          </p>
          <div className="grid grid-cols-2 gap-2">
            {backupCodes.map((code) => (
              <div key={code} className="rounded-md border px-3 py-2 font-mono text-xs" style={{ borderColor: 'var(--soc-border)' }}>
                {code}
              </div>
            ))}
          </div>
        </div>
      </OverviewModal>

      <OverviewModal
        open={!!revokeTarget}
        title="Revoke session"
        subtitle="SESSION ACTION"
        onClose={() => setRevokeTarget(null)}
        footer={(
          <div className="flex flex-wrap justify-end gap-2">
            <button type="button" className="soc-btn soc-btn-secondary" onClick={() => setRevokeTarget(null)}>
              Cancel
            </button>
            <button
              type="button"
              className="soc-btn soc-btn-primary"
              onClick={() => {
                if (!revokeTarget) return
                setSessions((prev) => prev.filter((session) => session.id !== revokeTarget.id))
                setAlert({
                  tone: 'critical',
                  title: `Session revoked: ${revokeTarget.device}`,
                  description: `${revokeTarget.location} was signed out immediately.`,
                })
                setRevokeTarget(null)
              }}
            >
              Revoke Session
            </button>
          </div>
        )}
      >
        <p className="text-sm" style={{ color: 'var(--soc-text-secondary)' }}>
          This device will be signed out and must authenticate again.
        </p>
      </OverviewModal>

      <OverviewModal
        open={showRevokeOthersConfirm}
        title="Revoke all other sessions"
        subtitle="SESSION ACTION"
        onClose={() => setShowRevokeOthersConfirm(false)}
        footer={(
          <div className="flex flex-wrap justify-end gap-2">
            <button type="button" className="soc-btn soc-btn-secondary" onClick={() => setShowRevokeOthersConfirm(false)}>
              Cancel
            </button>
            <button
              type="button"
              className="soc-btn soc-btn-primary"
              onClick={() => {
                setSessions((prev) => prev.filter((session) => session.current))
                setShowRevokeOthersConfirm(false)
                setAlert({
                  tone: 'critical',
                  title: 'Other sessions revoked',
                  description: 'All non-current sessions were terminated.',
                })
              }}
            >
              Revoke All
            </button>
          </div>
        )}
      >
        <p className="text-sm" style={{ color: 'var(--soc-text-secondary)' }}>
          You will stay signed in on this device. All other active sessions will be terminated.
        </p>
      </OverviewModal>

      <OverviewStepModal
        open={wizardOpen}
        subtitle="ESCALATION FLOW"
        currentStep={wizardStep}
        onStepChange={setWizardStep}
        onClose={() => {
          setWizardOpen(false)
          setWizardStep(0)
        }}
        onFinish={() => {
          setWizardOpen(false)
          setWizardStep(0)
          setAlert({
            tone: 'attention',
            title: 'Escalation flow created',
            description: `Flow "${wizardChannel}" is now active for ${wizardSeverities.join(', ')} severity events.`,
          })
        }}
        steps={[
          {
            id: 'channel',
            title: 'Step 1: Select Channel',
            canProceed: () => wizardChannel.trim().length > 1,
            validationHint: 'Choose a channel name before continuing.',
            content: (
              <div className="space-y-3">
                <label className="block text-xs font-medium" style={{ color: 'var(--soc-text-secondary)' }}>
                  Channel name
                </label>
                <input
                  type="text"
                  className="soc-input w-full"
                  value={wizardChannel}
                  onChange={(e) => setWizardChannel(e.target.value)}
                  placeholder="Example: SOC-WarRoom-P1"
                />
              </div>
            ),
          },
          {
            id: 'severity',
            title: 'Step 2: Scope Severity',
            canProceed: () => wizardSeverities.length > 0,
            validationHint: 'Select at least one severity.',
            content: (
              <div className="space-y-2">
                {['critical', 'high', 'medium'].map((severity) => (
                  <label key={severity} className="flex items-center gap-2 rounded-md border px-3 py-2" style={{ borderColor: 'var(--soc-border)' }}>
                    <input
                      type="checkbox"
                      checked={wizardSeverities.includes(severity)}
                      onChange={() =>
                        setWizardSeverities((prev) =>
                          prev.includes(severity) ? prev.filter((s) => s !== severity) : [...prev, severity],
                        )
                      }
                    />
                    <span className="text-sm capitalize" style={{ color: 'var(--soc-text)' }}>{severity}</span>
                  </label>
                ))}
              </div>
            ),
          },
          {
            id: 'behavior',
            title: 'Step 3: Escalation Behavior',
            content: (
              <div className="space-y-3">
                <OverviewToggle checked={wizardRequireAck} onChange={setWizardRequireAck} label="Require acknowledgment within 10 minutes" />
                <div className="rounded-md border px-3 py-2.5" style={{ borderColor: 'var(--soc-border)' }}>
                  <p className="text-xs font-medium mb-1" style={{ color: 'var(--soc-text-secondary)' }}>Summary</p>
                  <p className="text-sm" style={{ color: 'var(--soc-text)' }}>
                    Channel: {wizardChannel || 'Not set'} | Severities: {wizardSeverities.join(', ') || 'None'} | Ack required: {wizardRequireAck ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>
            ),
          },
        ]}
      />
    </OverviewPageShell>
  )
}

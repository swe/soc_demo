'use client'

import { useEffect, useState } from 'react'
import { usePageTitle } from '@/app/page-title-context'
import { useTheme } from 'next-themes'

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
    timezone: 'UTC'
  })

  const [mfaEnabled, setMfaEnabled] = useState(true)

  return (
    <div className="py-8 w-full max-w-4xl mx-auto">
      <div className="mb-6 px-4 hig-fade-in">
        <h1 className="hig-title-large text-gray-900 dark:text-gray-100 mb-2">Settings</h1>
        <p className="hig-body text-gray-600 dark:text-gray-400">Manage your profile and preferences</p>
      </div>

      <div className="space-y-6 px-4">
        
        {/* Profile */}
        <div className="hig-card">
          <div className="border-b border-gray-200 dark:border-gray-700/60 pb-4 mb-6">
            <h2 className="hig-headline text-gray-900 dark:text-gray-100">Profile</h2>
          </div>
          
          <div className="flex items-center gap-6 mb-8">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-md">
              <span className="text-3xl font-semibold text-white">
                {profile.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div className="space-y-2">
              <button className="hig-button hig-button-primary">
                Upload Photo
              </button>
              <div>
                <button className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200">
                  Remove
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block hig-body font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
              <input 
                type="text" 
                value={profile.name}
                onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                className="hig-input w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
              <input 
                type="email" 
                value={profile.email}
                readOnly
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg outline-none text-gray-500 dark:text-gray-500 cursor-not-allowed"
              />
              <p className="hig-caption text-gray-500 dark:text-gray-400 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
              <input 
                type="tel" 
                value={profile.phone}
                onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                className="hig-input w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Timezone</label>
              <select 
                value={profile.timezone}
                onChange={(e) => setProfile(prev => ({ ...prev, timezone: e.target.value }))}
                className="hig-input w-full"
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

        {/* Theme */}
        <div className="hig-card">
          <div className="border-b border-gray-200 dark:border-gray-700/60 pb-4 mb-6">
            <h2 className="hig-headline text-gray-900 dark:text-gray-100">Appearance</h2>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            {['light', 'dark', 'system'].map((t) => (
              <button
                key={t}
                onClick={() => mounted && setTheme(t)}
                className={`px-6 py-4 rounded-lg border-2 hig-body font-medium ${
                  theme === t
                    ? 'border-[#393A84] bg-[#393A84]/10 dark:bg-[#393A84]/20 text-[#393A84] dark:text-[#393A84]'
                    : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-[#334155]/20'
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Security */}
        <div className="hig-card">
          <div className="border-b border-gray-200 dark:border-gray-700/60 pb-4 mb-6">
            <h2 className="hig-headline text-gray-900 dark:text-gray-100">Security</h2>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
            <div>
              <div className="hig-body font-medium text-gray-900 dark:text-gray-100 mb-1">Multi-Factor Authentication</div>
              <div className="hig-caption text-gray-600 dark:text-gray-400">
                {mfaEnabled ? 'Additional security layer is active' : 'Enable for better account protection'}
              </div>
            </div>
            <button 
              onClick={() => setMfaEnabled(!mfaEnabled)}
              className={`relative inline-flex h-7 w-12 items-center rounded-full ${
                mfaEnabled 
                  ? 'bg-[#393A84] dark:bg-[#393A84]' 
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                mfaEnabled ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
          
          {mfaEnabled && (
            <div className="mt-4">
              <button className="hig-button hig-button-secondary">
                View Backup Codes
              </button>
            </div>
          )}
        </div>

        {/* Actions */}
          <div className="flex justify-end gap-3 mt-8">
          <button className="hig-button hig-button-secondary">
            Cancel
          </button>
          <button className="hig-button hig-button-primary">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}

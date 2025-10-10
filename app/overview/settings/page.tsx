'use client'

import { useEffect, useState } from 'react'
import { usePageTitle } from '@/app/page-title-context'
import { useTheme } from 'next-themes'
import { PageHeader, Card } from '@/components/ui/card'

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
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-4xl mx-auto">
      <PageHeader 
        title="Settings" 
        description="Manage your profile and preferences" 
      />

      <div className="space-y-6">
        
        {/* Profile */}
        <Card>
          <div className="border-b border-gray-200 dark:border-gray-700/60 pb-4 mb-6">
            <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100 uppercase tracking-wide">Profile</h2>
          </div>
          
          <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center">
              <span className="text-2xl font-light text-gray-900 dark:text-gray-100">
                {profile.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div>
              <button className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline mb-1 block">
                Upload Photo
              </button>
              <button className="text-sm text-gray-500 dark:text-gray-400 hover:underline block">
                Remove
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">Name</label>
              <input 
                type="text" 
                value={profile.name}
                onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 bg-transparent border-b border-gray-200 dark:border-gray-700 focus:border-indigo-600 dark:focus:border-indigo-400 outline-none transition-colors text-gray-900 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">Email</label>
              <input 
                type="email" 
                value={profile.email}
                readOnly
                className="w-full px-3 py-2 bg-transparent border-b border-gray-200 dark:border-gray-700 outline-none text-gray-500 dark:text-gray-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">Phone</label>
              <input 
                type="tel" 
                value={profile.phone}
                onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3 py-2 bg-transparent border-b border-gray-200 dark:border-gray-700 focus:border-indigo-600 dark:focus:border-indigo-400 outline-none transition-colors text-gray-900 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">Timezone</label>
              <select 
                value={profile.timezone}
                onChange={(e) => setProfile(prev => ({ ...prev, timezone: e.target.value }))}
                className="w-full px-3 py-2 bg-transparent border-b border-gray-200 dark:border-gray-700 focus:border-indigo-600 dark:focus:border-indigo-400 outline-none transition-colors text-gray-900 dark:text-gray-100"
              >
                <option value="UTC">UTC (GMT+0)</option>
                <option value="EST">Eastern Time (GMT-5)</option>
                <option value="CST">Central Time (GMT-6)</option>
                <option value="MST">Mountain Time (GMT-7)</option>
                <option value="PST">Pacific Time (GMT-8)</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Theme */}
        <Card>
          <div className="border-b border-gray-200 dark:border-gray-700/60 pb-4 mb-6">
            <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100 uppercase tracking-wide">Appearance</h2>
          </div>
          
          <div className="flex gap-4">
            {['light', 'dark', 'system'].map((t) => (
              <button
                key={t}
                onClick={() => mounted && setTheme(t)}
                className={`flex-1 px-4 py-3 text-sm border transition-colors ${
                  theme === t
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </Card>

        {/* Security */}
        <Card>
          <div className="border-b border-gray-200 dark:border-gray-700/60 pb-4 mb-6">
            <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100 uppercase tracking-wide">Security</h2>
          </div>
          
          <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700/60">
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Multi-Factor Authentication</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {mfaEnabled ? 'Enabled' : 'Disabled'}
              </div>
            </div>
            <button 
              onClick={() => setMfaEnabled(!mfaEnabled)}
              className={`relative inline-flex h-6 w-11 items-center border transition-colors ${
                mfaEnabled 
                  ? 'bg-indigo-600 dark:bg-indigo-600 border-indigo-600 dark:border-indigo-600' 
                  : 'bg-gray-200 dark:bg-gray-700 border-gray-200 dark:border-gray-700'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform bg-white transition-transform ${
                mfaEnabled ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
          
          {mfaEnabled && (
            <div className="mt-4 pt-4">
              <button className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
                View Backup Codes
              </button>
            </div>
          )}
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-8">
          <button className="px-6 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
            Cancel
          </button>
          <button className="px-6 py-2 text-sm bg-indigo-600 dark:bg-indigo-600 text-white hover:bg-indigo-700 dark:hover:bg-indigo-700 transition-colors">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}

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
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold mb-2">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your profile and preferences</p>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-8">
        
        {/* Profile Picture */}
        <section className="mb-6 pb-8 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Profile Picture</h3>
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 bg-slate-100 dark:bg-slate-900/40 rounded-full flex items-center justify-center">
              <span className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                {profile.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div>
              <div className="flex gap-2 mb-2">
                <button className="btn-sm bg-indigo-600 hover:bg-slate-800 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white">
                  Upload Photo
                </button>
                <button className="btn-sm bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600">
                  Remove
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">JPG, PNG or GIF. Max size 2MB.</p>
            </div>
          </div>
        </section>

        {/* Personal Information */}
        <section className="mb-6 pb-8 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Personal Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
              <input 
                type="text" 
                value={profile.name}
                onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                className="form-input w-full bg-white dark:bg-gray-800"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
              <input 
                type="email" 
                value={profile.email}
                readOnly
                disabled
                className="form-input w-full bg-gray-100 dark:bg-gray-900 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Email address cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
              <input 
                type="tel" 
                value={profile.phone}
                onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                className="form-input w-full bg-white dark:bg-gray-800"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Required for SMS notifications</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Timezone</label>
              <select 
                value={profile.timezone}
                onChange={(e) => setProfile(prev => ({ ...prev, timezone: e.target.value }))}
                className="form-select w-full bg-white dark:bg-gray-800"
              >
                <option value="UTC">UTC (GMT+0)</option>
                <option value="EST">Eastern Time (GMT-5)</option>
                <option value="CST">Central Time (GMT-6)</option>
                <option value="MST">Mountain Time (GMT-7)</option>
                <option value="PST">Pacific Time (GMT-8)</option>
                <option value="CET">Central European Time (GMT+1)</option>
                <option value="EET">Eastern European Time (GMT+2)</option>
                <option value="MSK">Moscow Time (GMT+3)</option>
                <option value="JST">Japan Time (GMT+9)</option>
                <option value="AEST">Australian Eastern Time (GMT+10)</option>
              </select>
            </div>
          </div>
        </section>

        {/* Theme */}
        <section className="mb-6 pb-8 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Appearance</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Theme</label>
            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={() => mounted && setTheme('light')}
                className={`p-6 rounded-lg border-2 transition-all ${
                  theme === 'light'
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex flex-col items-center gap-3">
                  <svg className="w-8 h-8 text-gray-900 dark:text-gray-100" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-100">Light</span>
                </div>
              </button>

              <button
                onClick={() => mounted && setTheme('dark')}
                className={`p-6 rounded-lg border-2 transition-all ${
                  theme === 'dark'
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex flex-col items-center gap-3">
                  <svg className="w-8 h-8 text-gray-900 dark:text-gray-100" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-100">Dark</span>
                </div>
              </button>

              <button
                onClick={() => mounted && setTheme('system')}
                className={`p-6 rounded-lg border-2 transition-all ${
                  theme === 'system'
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex flex-col items-center gap-3">
                  <svg className="w-8 h-8 text-gray-900 dark:text-gray-100" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-100">System</span>
                </div>
              </button>
            </div>
          </div>
        </section>

        {/* Multi-Factor Authentication */}
        <section className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Security</h3>
          <div className="flex items-center justify-between p-5 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                mfaEnabled ? 'bg-emerald-100 dark:bg-emerald-900/40' : 'bg-gray-200 dark:bg-gray-700'
              }`}>
                <svg className={`w-6 h-6 ${mfaEnabled ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <div className="text-base font-semibold text-gray-800 dark:text-gray-100">Multi-Factor Authentication</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {mfaEnabled ? 'MFA is protecting your account' : 'Add an extra layer of security'}
                </div>
              </div>
            </div>
            <button 
              onClick={() => setMfaEnabled(!mfaEnabled)}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-200 ${
                mfaEnabled ? 'bg-emerald-600 dark:bg-emerald-600' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                mfaEnabled ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          {mfaEnabled && (
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-400 mb-3">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">MFA is enabled</span>
              </div>
              <button className="btn-sm bg-green-600 hover:bg-green-700 text-white">
                View Backup Codes
              </button>
            </div>
          )}
        </section>

        {/* Save Button */}
        <div className="flex gap-3">
          <button className="btn bg-indigo-600 hover:bg-slate-800 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white">
            Save Changes
          </button>
          <button className="btn bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600">
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

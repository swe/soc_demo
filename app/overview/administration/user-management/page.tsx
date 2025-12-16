'use client'

import { useEffect } from 'react'
import { usePageTitle } from '@/app/page-title-context'
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react'

export default function UserManagementPage() {
  const { setPageTitle } = usePageTitle()

  useEffect(() => {
    setPageTitle('User Management')
  }, [setPageTitle])

  const addUserOptions = [
    { id: 'sync-ad', label: 'Sync with AD' },
    { id: 'bulk-import', label: 'Bulk Import' },
    { id: 'manual-add', label: 'Manually Add' }
  ]

  const handleOptionClick = (optionId: string) => {
    console.log(`Selected option: ${optionId}`)
  }

  return (
    <div className="py-8 w-full max-w-7xl mx-auto">
      <div className="mb-6 px-4 hig-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="hig-title-large text-gray-900 dark:text-gray-100 mb-2">Users</h1>
            <p className="hig-body text-gray-600 dark:text-gray-400">Manage users and their permissions</p>
          </div>
          <div>
            <Menu as="div" className="relative">
              <MenuButton className="hig-button hig-button-primary">
                Add User
              </MenuButton>
            <MenuItems className="absolute right-0 mt-2 w-56 hig-card p-0 focus:outline-none">
              {addUserOptions.map((option) => (
                <MenuItem key={option.id}>
                  <button
                    className="w-full px-4 py-2.5 text-left hig-body text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#334155]/30"
                    onClick={() => handleOptionClick(option.id)}
                  >
                    {option.label}
                  </button>
                </MenuItem>
              ))}
            </MenuItems>
          </Menu>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-8 px-4">
        <div className="hig-metric-card hig-stagger-item">
          <div className="hig-caption mb-3">Active Users</div>
          <div className="hig-metric-value mb-2">1,247</div>
          <div className="hig-caption">83% of total</div>
        </div>
        <div className="hig-metric-card hig-stagger-item">
          <div className="hig-caption mb-3">Total Users</div>
          <div className="hig-metric-value mb-2">1,500</div>
          <div className="hig-caption">Across all departments</div>
        </div>
        <div className="hig-metric-card hig-stagger-item">
          <div className="hig-caption mb-3">MFA Enabled</div>
          <div className="hig-metric-value-accent mb-2">95%</div>
          <div className="hig-caption">1,425 users</div>
        </div>
      </div>

      <div className="px-4">
        <div className="hig-card p-0">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700/60 px-6 pt-6">
          <h2 className="hig-headline text-gray-900 dark:text-gray-100">Users</h2>
          <span className="hig-caption text-gray-600 dark:text-gray-400">5 total</span>
        </div>
        <div className="overflow-x-auto">
          <table className="hig-table w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700/60">
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">MFA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700/60">
              {[
                { name: 'Peter Pan', email: 'peter.pan@neverlands.art', role: 'SOC Analyst', dept: 'Security', status: 'active', mfa: true },
                { name: 'Sarah Chen', email: 'sarah.chen@neverlands.art', role: 'SOC Manager', dept: 'Security', status: 'active', mfa: true },
                { name: 'James Rodriguez', email: 'james.rodriguez@neverlands.art', role: 'Security Engineer', dept: 'Security', status: 'active', mfa: true },
                { name: 'Emily Taylor', email: 'emily.taylor@neverlands.art', role: 'Admin', dept: 'IT', status: 'active', mfa: true },
                { name: 'Michael Kim', email: 'michael.kim@neverlands.art', role: 'Analyst', dept: 'Operations', status: 'inactive', mfa: false }
              ].map((user, idx) => (
                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-[#334155]/20">
                  <td className="px-6 py-4">
                    <div className="hig-body font-semibold text-gray-900 dark:text-gray-100">{user.name}</div>
                    <div className="hig-caption text-gray-600 dark:text-gray-400 font-mono">{user.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="hig-body text-gray-700 dark:text-gray-300">{user.role}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="hig-body text-gray-700 dark:text-gray-300">{user.dept}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span 
                      className="hig-badge"
                      style={{
                        backgroundColor: user.status === 'active' ? '#34C75920' : '#8E8E9320',
                        color: user.status === 'active' ? '#34C759' : '#8E8E93'
                      }}
                    >
                      {user.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {user.mfa ? (
                      <span className="text-[#34C759]" style={{ WebkitTextFillColor: '#34C759' }}>✓</span>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-600">×</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      </div>
    </div>
  )
}

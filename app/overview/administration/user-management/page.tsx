'use client'

import { useEffect } from 'react'
import { usePageTitle } from '@/app/page-title-context'
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react'
import { PageHeader, Card } from '@/components/ui/card'

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
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-7xl mx-auto">
      <PageHeader 
        title="Users" 
        description="Manage users and their permissions"
        action={
          <Menu as="div" className="relative">
            <MenuButton className="px-4 py-2 text-sm border border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors">
              Add User
            </MenuButton>
            <MenuItems className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 focus:outline-none">
              {addUserOptions.map((option) => (
                <MenuItem key={option.id}>
                  <button
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900/20 transition-colors"
                    onClick={() => handleOptionClick(option.id)}
                  >
                    {option.label}
                  </button>
                </MenuItem>
              ))}
            </MenuItems>
          </Menu>
        }
      />

      <div className="grid grid-cols-3 gap-6 mb-8">
        <Card>
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Active Users</div>
          <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">1,247</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">83% of total</div>
        </Card>
        <Card>
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Total Users</div>
          <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">1,500</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Across all departments</div>
        </Card>
        <Card>
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">MFA Enabled</div>
          <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">95%</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">1,425 users</div>
        </Card>
      </div>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
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
                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-900/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-gray-100">{user.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{user.role}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{user.dept}</td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-emerald-600 dark:text-emerald-400">
                      {user.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {user.mfa ? (
                      <span className="text-emerald-600 dark:text-emerald-400">✓</span>
                    ) : (
                      <span className="text-gray-300 dark:text-gray-600">×</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

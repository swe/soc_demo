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
    {
      id: 'sync-ad',
      label: 'Sync with AD',
      description: 'Import users from Active Directory'
    },
    {
      id: 'bulk-import',
      label: 'Bulk Import',
      description: 'Import multiple users from CSV'
    },
    {
      id: 'manual-add',
      label: 'Manually Add',
      description: 'Add a single user manually'
    }
  ]

  const handleOptionClick = (optionId: string) => {
    console.log(`Selected option: ${optionId}`)
    // Menu closes automatically on item click
  }

  return (
    <div>
      {/* Content container */}
      <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">
        {/* User Management header */}
        <div className="mb-6">
          {/* Main title */}
          <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold mb-2">User Management</h1>
          {/* Subheader */}
          <p className="text-gray-600  dark:text-gray-400">Manage users and their permissions</p>
        </div>

        {/* Status bar - sticky top line */}
        <div className="sticky top-16 z-50 before:absolute before:inset-0 before:backdrop-blur-md before:bg-white/80 dark:before:bg-gray-800/80 before:-z-10 border-b border-gray-200 dark:border-gray-700/60 mb-6 -mx-4 sm:-mx-6 lg:-mx-8">
          <div className="px-4 sm:px-6 lg:px-8 py-3 w-full">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-6">
                {/* Active Users */}
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">Active users: 1,247</span>
                </div>
                
                {/* Total Users */}
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">Total users: 1,500</span>
                </div>
              </div>
              
              {/* Add User Dropdown */}
              <Menu as="div" className="relative inline-flex">
                {({ open }) => (
                  <>
                    <MenuButton 
                      className="px-4 py-2 bg-indigo-600 dark:bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-700 text-white rounded-md text-sm font-medium transition-all duration-200 cursor-pointer flex items-center"
                    >
                      Add User
                      <svg className="w-4 h-4 fill-current text-white shrink-0 ml-1" viewBox="0 0 16 16">
                        <path d="m1 6 7 7 7-7 2 1-9 8-9-8z" />
                      </svg>
                    </MenuButton>
                    <MenuItems 
                      transition
                      className="z-10 absolute top-full right-0 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 py-1.5 rounded-lg shadow-lg overflow-hidden mt-1 font-medium text-sm text-gray-600 dark:text-gray-300 focus:outline-none transition duration-100 ease-out data-[closed]:scale-95 data-[closed]:opacity-0"
                    >
                      {addUserOptions.map((option) => (
                        <MenuItem key={option.id}>
                          <button
                            className="flex items-center w-full py-3 px-4 cursor-pointer data-[focus]:bg-gray-50 dark:data-[focus]:bg-gray-700/20"
                            onClick={() => handleOptionClick(option.id)}
                          >
                            <div className="text-left">
                              <div className="font-medium text-gray-800 dark:text-gray-100">{option.label}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{option.description}</div>
                            </div>
                          </button>
                        </MenuItem>
                      ))}
                    </MenuItems>
                  </>
                )}
              </Menu>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl mb-6">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">All Users</h2>
              <input 
                type="text"
                placeholder="Search users..."
                className="form-input bg-white dark:bg-gray-800 w-64"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20">
                <tr>
                  <th className="px-4 py-3 text-left">User</th>
                  <th className="px-4 py-3 text-left">Role</th>
                  <th className="px-4 py-3 text-left">Department</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Last Login</th>
                  <th className="px-4 py-3 text-left">MFA</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-200 dark:divide-gray-700">
                {[
                  { name: 'Peter Pan', email: 'peter.pan@neverlands.art', role: 'SOC Analyst', dept: 'Security', status: 'active', lastLogin: '2 min ago', mfa: true },
                  { name: 'Sarah Chen', email: 'sarah.chen@neverlands.art', role: 'SOC Manager', dept: 'Security', status: 'active', lastLogin: '1 hour ago', mfa: true },
                  { name: 'James Rodriguez', email: 'james.rodriguez@neverlands.art', role: 'Security Engineer', dept: 'Security', status: 'active', lastLogin: '30 min ago', mfa: true },
                  { name: 'Emily Taylor', email: 'emily.taylor@neverlands.art', role: 'Admin', dept: 'IT', status: 'active', lastLogin: '15 min ago', mfa: true },
                  { name: 'Michael Kim', email: 'michael.kim@neverlands.art', role: 'Analyst', dept: 'Operations', status: 'inactive', lastLogin: '3 days ago', mfa: false }
                ].map((user, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-900/20">
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium text-gray-800 dark:text-gray-100">{user.name}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-gray-700 dark:text-gray-300">{user.role}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-gray-700 dark:text-gray-300">{user.dept}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        user.status === 'active' 
                          ? 'bg-emerald-600 dark:bg-emerald-700/20 text-green-700 dark:text-green-400' 
                          : 'bg-gray-500/20 text-gray-700 dark:text-gray-400'
                      }`}>
                        {user.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-gray-600 dark:text-gray-400">{user.lastLogin}</span>
                    </td>
                    <td className="px-4 py-3">
                      {user.mfa ? (
                        <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button className="text-indigo-600 hover:text-indigo-700 dark:hover:text-indigo-500">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 lg:col-span-4">
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">User Distribution</h3>
              <div className="space-y-3">
                {[
                  { role: 'SOC Analysts', count: 45, color: 'bg-indigo-600 dark:bg-indigo-500' },
                  { role: 'Security Engineers', count: 23, color: 'bg-indigo-600 dark:bg-indigo-600' },
                  { role: 'Managers', count: 12, color: 'bg-indigo-500' },
                  { role: 'Administrators', count: 8, color: 'bg-orange-600 dark:bg-orange-700' },
                  { role: 'Others', count: 34, color: 'bg-gray-500' }
                ].map((item, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-700 dark:text-gray-300">{item.role}</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{item.count}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className={`${item.color} h-2 rounded-full`} style={{ width: `${(item.count / 122) * 100}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4">
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {[
                  { user: 'John Doe', action: 'logged in', time: '2 min ago' },
                  { user: 'Jane Smith', action: 'updated profile', time: '15 min ago' },
                  { user: 'Mike Johnson', action: 'changed password', time: '1 hour ago' },
                  { user: 'Sarah Williams', action: 'enabled MFA', time: '2 hours ago' }
                ].map((activity, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
                    <div className="w-8 h-8 bg-indigo-600 dark:bg-indigo-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                        {activity.user.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-gray-800 dark:text-gray-100">{activity.user} <span className="text-gray-600 dark:text-gray-400">{activity.action}</span></div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4">
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Security Stats</h3>
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">MFA Enabled</div>
                  <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">95%</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Password Policy Compliance</div>
                  <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">98%</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Inactive Accounts</div>
                  <div className="text-2xl font-bold text-orange-700 dark:text-orange-400">23</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

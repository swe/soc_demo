'use client'

import { useEffect, useState } from 'react'
import { usePageTitle } from '@/app/page-title-context'
import { Menu, MenuButton, MenuItems, MenuItem, Transition } from '@headlessui/react'

export default function UserManagementPage() {
  const { setPageTitle } = usePageTitle()
  const [isOpen, setIsOpen] = useState(false)

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
    setIsOpen(false)
  }

  return (
    <div>
      {/* Content container */}
      <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">
        {/* User Management header */}
        <div className="mb-8">
          {/* Main title */}
          <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold mb-2">User Management</h1>
          {/* Subheader */}
          <p className="text-gray-600 dark:text-gray-400 text-lg">Manage users and their permissions</p>
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
                      className="px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white rounded-md text-sm font-medium transition-colors cursor-pointer flex items-center"
                      onClick={() => setIsOpen(!isOpen)}
                    >
                      Add User
                      <svg className="w-4 h-4 fill-current text-white shrink-0 ml-1" viewBox="0 0 16 16">
                        <path d="m1 6 7 7 7-7 2 1-9 8-9-8z" />
                      </svg>
                    </MenuButton>
                    <Transition
                      as="div"
                      className="z-10 absolute top-full right-0 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 py-1.5 rounded-lg shadow-lg overflow-hidden mt-1"
                      enter="transition ease-out duration-100 transform"
                      enterFrom="opacity-0 -translate-y-2"
                      enterTo="opacity-100 translate-y-0"
                      leave="transition ease-out duration-100"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                    >
                      <MenuItems className="font-medium text-sm text-gray-600 dark:text-gray-300 focus:outline-hidden">
                        {addUserOptions.map((option) => (
                          <MenuItem key={option.id}>
                            {({ active }) => (
                              <button
                                className={`flex items-center w-full py-3 px-4 cursor-pointer ${active ? 'bg-gray-50 dark:bg-gray-700/20' : ''}`}
                                onClick={() => handleOptionClick(option.id)}
                              >
                                <div className="text-left">
                                  <div className="font-medium text-gray-800 dark:text-gray-100">{option.label}</div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">{option.description}</div>
                                </div>
                              </button>
                            )}
                          </MenuItem>
                        ))}
                      </MenuItems>
                    </Transition>
                  </>
                )}
              </Menu>
            </div>
          </div>
        </div>

        {/* Tile Layout */}
        <div className="grid grid-cols-12 gap-6">
          
          {/* First Row: Two tiles, 1/2 width each */}
          <div className="col-span-12 lg:col-span-6 bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
            <div className="h-48 flex items-center justify-center">
              <span className="text-gray-400 dark:text-gray-500">Tile 1</span>
            </div>
          </div>
          
          <div className="col-span-12 lg:col-span-6 bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
            <div className="h-48 flex items-center justify-center">
              <span className="text-gray-400 dark:text-gray-500">Tile 2</span>
            </div>
          </div>

          {/* Second Row: Three tiles, 1/3 width each */}
          <div className="col-span-12 lg:col-span-4 bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
            <div className="h-48 flex items-center justify-center">
              <span className="text-gray-400 dark:text-gray-500">Tile 3</span>
            </div>
          </div>
          
          <div className="col-span-12 lg:col-span-4 bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
            <div className="h-48 flex items-center justify-center">
              <span className="text-gray-400 dark:text-gray-500">Tile 4</span>
            </div>
          </div>
          
          <div className="col-span-12 lg:col-span-4 bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
            <div className="h-48 flex items-center justify-center">
              <span className="text-gray-400 dark:text-gray-500">Tile 5</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

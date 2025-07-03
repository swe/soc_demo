'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, MenuButton, MenuItems, MenuItem, Transition } from '@headlessui/react'

export default function HeaderNavigation() {
  const pathname = usePathname()

  const tabs = [
    {
      name: 'Overview',
      href: '/dashboard',
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
        </svg>
      )
    },
    {
      name: 'Security Alerts',
      href: '/alerts',
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      name: 'Threat Map',
      href: '/map',
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
        </svg>
      )
    }
  ]

  // Get current active tab
  const activeTab = tabs.find(tab => tab.href === pathname) || tabs[0]

  return (
    <Menu as="div" className="relative inline-flex">
      <MenuButton className="inline-flex justify-center items-center group cursor-pointer">
        <div className="flex items-center truncate">
          <div className="p-1.5 rounded-md bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 mr-2">
            {activeTab.icon}
          </div>
          <span className="truncate text-sm font-medium text-gray-600 dark:text-gray-100 group-hover:text-gray-800 dark:group-hover:text-white">
            {activeTab.name}
          </span>
          <svg className="w-3 h-3 shrink-0 ml-1 fill-current text-gray-400 dark:text-gray-500" viewBox="0 0 12 12">
            <path d="M5.9 11.4L.5 6l1.4-1.4 4 4 4-4L11.3 6z" />
          </svg>
        </div>
      </MenuButton>
      <Transition
        as="div"
        className="origin-top-left z-10 absolute top-full min-w-[11rem] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 py-1.5 rounded-lg shadow-lg overflow-hidden mt-1 left-0"
        enter="transition ease-out duration-200 transform"
        enterFrom="opacity-0 -translate-y-2"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-out duration-200"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <MenuItems as="ul" className="focus:outline-hidden">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href
            return (
              <MenuItem as="li" key={tab.href}>
                {({ close }) => (
                  <Link 
                    className={`font-medium text-sm flex items-center py-1 px-3 transition-colors duration-200 ${
                      isActive 
                        ? 'text-violet-500 bg-violet-50 dark:bg-violet-900/20' 
                        : 'text-gray-600 dark:text-gray-300 hover:text-violet-500 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`} 
                    href={tab.href}
                    onClick={close}
                  >
                    <div className="mr-2 p-1 rounded">
                      {tab.icon}
                    </div>
                    {tab.name}
                  </Link>
                )}
              </MenuItem>
            )
          })}
        </MenuItems>
      </Transition>
    </Menu>
  )
} 
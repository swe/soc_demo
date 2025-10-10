'use client'

import Link from 'next/link'
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react'

export default function DropdownProfile({ align }: {
  align?: 'left' | 'right'
}) {
  return (
    <Menu as="div" className="relative inline-flex">
      <MenuButton className="inline-flex justify-center items-center group">
        <div className="flex items-center truncate">
          <span className="truncate text-sm font-medium text-gray-600 dark:text-gray-100 group-hover:text-gray-800 dark:group-hover:text-white">Peter Pan</span>
          <svg className="w-3 h-3 shrink-0 ml-1 fill-current text-gray-400 dark:text-gray-500" viewBox="0 0 12 12">
            <path d="M5.9 11.4L.5 6l1.4-1.4 4 4 4-4L11.3 6z" />
          </svg>
        </div>
      </MenuButton>
      <MenuItems 
        transition
        className={`origin-top-right z-10 absolute top-full min-w-[11rem] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 py-1.5 rounded-xl shadow-lg overflow-hidden mt-1 focus:outline-none transition duration-200 ease-out data-[closed]:scale-95 data-[closed]:opacity-0 ${align === 'right' ? 'right-0' : 'left-0'}`}
      >
        <div className="pt-0.5 pb-2 px-3 mb-1 border-b border-gray-200 dark:border-gray-700/60">
          <div className="font-medium text-gray-800 dark:text-gray-100">Peter Pan</div>
          <div className="font-medium text-xs text-gray-500 dark:text-gray-400">Neverlands LLC.</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 italic">peter.pan@neverlands.art</div>
        </div>
        <MenuItem>
          <Link className="font-medium text-sm flex items-center py-1 px-3 text-indigo-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 data-[focus]:bg-gray-50 dark:data-[focus]:bg-gray-700/50" href="/settings/account">
            Settings
          </Link>
        </MenuItem>
        <MenuItem>
          <Link className="font-medium text-sm flex items-center py-1 px-3 text-indigo-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 data-[focus]:bg-gray-50 dark:data-[focus]:bg-gray-700/50" href="#0">
            Support
          </Link>
        </MenuItem>
      </MenuItems>
    </Menu>
  )
}
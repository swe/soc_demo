'use client'

import { useEffect } from 'react'
import { usePageTitle } from '@/app/page-title-context'
import { Menu, MenuButton, MenuItems, MenuItem, Transition } from '@headlessui/react'

export default function Procedures() {
  const { setPageTitle } = usePageTitle()

  useEffect(() => {
    setPageTitle('Procedures')
  }, [setPageTitle])

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold mb-2">Procedures</h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">Manage and organize your operational procedures</p>
      </div>

      {/* Sticky top bar with quick actions */}
      <div className="sticky top-16 z-50 before:absolute before:inset-0 before:backdrop-blur-md before:bg-white/80 dark:before:bg-gray-800/80 before:-z-10 border-b border-gray-200 dark:border-gray-700/60 mb-6 -mx-4 sm:-mx-6 lg:-mx-8">
        <div className="px-4 sm:px-6 lg:px-8 py-3 w-full">
        <div className="flex items-center justify-between">
          {/* Left side - Procedures count */}
          <div className="flex items-center">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Procedures: <span className="text-gray-800 dark:text-gray-100 font-semibold">12 Active</span> out of <span className="text-gray-800 dark:text-gray-100 font-semibold">18</span>
            </span>
          </div>
          
          {/* Right side - New Procedure Dropdown */}
          <div className="flex items-center">
            <Menu as="div" className="relative inline-flex">
              <MenuButton className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                New Procedure
                <svg className="w-3 h-3 ml-2 fill-current text-gray-300 dark:text-gray-600" viewBox="0 0 12 12">
                  <path d="M5.9 11.4L.5 6l1.4-1.4 4 4 4-4L11.3 6z" />
                </svg>
              </MenuButton>
              <Transition
                as="div"
                className="origin-top-right z-10 absolute top-full right-0 min-w-[12rem] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 py-1.5 rounded-lg shadow-lg overflow-hidden mt-1"
                enter="transition ease-out duration-200 transform"
                enterFrom="opacity-0 -translate-y-2"
                enterTo="opacity-100 translate-y-0"
                leave="transition ease-out duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <MenuItems as="ul" className="focus:outline-hidden">
                  <MenuItem as="li">
                    {({ active }) => (
                      <button className={`w-full font-medium text-sm flex py-1.5 px-3 ${active ? 'text-gray-800 dark:text-gray-200' : 'text-gray-600 dark:text-gray-300'}`}>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Create from Template
                      </button>
                    )}
                  </MenuItem>
                  <MenuItem as="li">
                    {({ active }) => (
                      <button className={`w-full font-medium text-sm flex py-1.5 px-3 ${active ? 'text-gray-800 dark:text-gray-200' : 'text-gray-600 dark:text-gray-300'}`}>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Build Custom
                      </button>
                    )}
                  </MenuItem>
                </MenuItems>
              </Transition>
            </Menu>
          </div>
        </div>
        </div>
      </div>

      {/* Grid Layout */}
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

        {/* Second Row: One tile, full width */}
        <div className="col-span-12 bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
          <div className="h-48 flex items-center justify-center">
            <span className="text-gray-400 dark:text-gray-500">Tile 3</span>
          </div>
        </div>

      </div>
    </div>
  )
}

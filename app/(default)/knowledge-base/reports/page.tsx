'use client'

import { useEffect, useState } from 'react'
import { usePageTitle } from '@/app/page-title-context'
import { Menu, MenuButton, MenuItems, MenuItem, Transition } from '@headlessui/react'

export default function Reports() {
  const { setPageTitle } = usePageTitle()

  useEffect(() => {
    setPageTitle('Reports')
  }, [setPageTitle])

  const reportOptions = [
    {
      id: 0,
      value: 'Executive Summary'
    },
    {
      id: 1,
      value: 'Daily Metrics'
    },
    {
      id: 2,
      value: 'Custom'
    }
  ]

  const [selectedReport, setSelectedReport] = useState<number>(0)

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold mb-2">Reports</h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">Generate and manage your knowledge base reports</p>
      </div>

      {/* Sticky top bar with quick actions */}
      <div className="sticky top-16 z-50 before:absolute before:inset-0 before:backdrop-blur-md before:bg-white/80 dark:before:bg-gray-800/80 before:-z-10 border-b border-gray-200 dark:border-gray-700/60 mb-6 -mx-4 sm:-mx-6 lg:-mx-8">
        <div className="px-4 sm:px-6 lg:px-8 py-3 w-full">
        <div className="flex items-center justify-between">
          {/* Left side - Reports Generated Today */}
          <div className="flex items-center">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Reports Generated: <span className="text-gray-800 dark:text-gray-100 font-semibold">12 Today</span>
            </span>
          </div>
          
          {/* Right side - Generate Report Dropdown */}
          <div className="flex items-center">
            <Menu as="div" className="relative inline-flex">
              {({ open }) => (
                <>
                  <MenuButton className="btn justify-between min-w-[11rem] bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white" aria-label="Generate Report">
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>Generate Report</span>
                    </span>
                    <svg className="shrink-0 ml-1 fill-current text-gray-400 dark:text-gray-500" width="11" height="7" viewBox="0 0 11 7">
                      <path d="M5.4 6.8L0 1.4 1.4 0l4 4 4-4 1.4 1.4z" />
                    </svg>
                  </MenuButton>
                  <Transition
                    as="div"
                    className="z-10 absolute top-full right-0 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 py-1.5 rounded-lg shadow-lg overflow-hidden mt-1"
                    enter="transition ease-out duration-100 transform"
                    enterFrom="opacity-0 -translate-y-2"
                    enterTo="opacity-100 translate-y-0"
                    leave="transition ease-out duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <MenuItems className="font-medium text-sm text-gray-600 dark:text-gray-300 divide-y divide-gray-200 dark:divide-gray-700/60 focus:outline-hidden">
                      {reportOptions.map((option, optionIndex) => (
                        <MenuItem key={optionIndex}>
                          {({ active }) => (
                            <button
                              className={`flex items-center justify-between w-full py-2 px-3 cursor-pointer ${active ? 'bg-gray-50 dark:bg-gray-700/20' : ''} ${option.id === selectedReport && 'text-violet-500'}`}
                              onClick={() => { setSelectedReport(option.id) }}
                            >
                              <span>{option.value}</span>
                              <svg className={`shrink-0 mr-2 fill-current text-violet-500 ${option.id !== selectedReport && 'invisible'}`} width="12" height="9" viewBox="0 0 12 9">
                                <path d="M10.28.28L3.989 6.575 1.695 4.28A1 1 0 00.28 5.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28.28z" />
                              </svg>
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

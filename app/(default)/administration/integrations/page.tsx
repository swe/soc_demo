'use client'

import { useEffect, useState } from 'react'
import { usePageTitle } from '@/app/page-title-context'

export default function IntegrationsPage() {
  const { setPageTitle } = usePageTitle()
  const [activeTab, setActiveTab] = useState('tab-a')

  useEffect(() => {
    setPageTitle('Integrations')
  }, [setPageTitle])

  return (
    <div>
      {/* Content container */}
      <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">
        {/* Integrations header */}
        <div className="mb-8">
          {/* Main title */}
          <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold mb-2">Integrations</h1>
          {/* Subheader */}
          <p className="text-gray-600 dark:text-gray-400 text-lg">Manage your third-party integrations and connections</p>
        </div>

        {/* Status bar - sticky top line */}
        <div className="sticky top-16 z-50 before:absolute before:inset-0 before:backdrop-blur-md before:bg-white/80 dark:before:bg-gray-800/80 before:-z-10 border-b border-gray-200 dark:border-gray-700/60 mb-6 -mx-4 sm:-mx-6 lg:-mx-8">
          <div className="px-4 sm:px-6 lg:px-8 py-3 w-full">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-6">
                {/* Errors */}
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">Errors: 3</span>
                </div>
                
                {/* Active integrations */}
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">Active integrations: 8/12</span>
                </div>
                
                {/* Last sync date and time */}
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-gray-500 dark:text-gray-400">Last sync: Dec 15, 2024 14:30</span>
                </div>
              </div>
              
              {/* Buttons */}
              <div className="flex items-center space-x-3">
                {/* Sync All button */}
                <button className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md text-sm font-medium transition-colors cursor-pointer">
                  Sync All
                </button>
                
                {/* Add Integration button */}
                <button className="px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white rounded-md text-sm font-medium transition-colors cursor-pointer">
                  Add Integration
                </button>
              </div>
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

          {/* Second Row: One tile, full width */}
          <div className="col-span-12 bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
            <div className="h-48 flex items-center justify-center">
              <span className="text-gray-400 dark:text-gray-500">Tile 3</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}

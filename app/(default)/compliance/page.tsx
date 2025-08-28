'use client'

import { useEffect, useState } from 'react'
import { usePageTitle } from '@/app/page-title-context'

export default function CompliancePage() {
  const { setPageTitle } = usePageTitle()
  const [activeTab, setActiveTab] = useState('tab-a')

  useEffect(() => {
    setPageTitle('Compliance')
  }, [setPageTitle])

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">
      {/* Compliance header */}
      <div className="mb-8">
        {/* Main title */}
        <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold mb-2">Compliance</h1>
        {/* Subheader */}
        <p className="text-gray-600 dark:text-gray-400 text-lg">Monitor and manage compliance requirements</p>
      </div>

      {/* Tile Layout */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* First Row: Two tiles, 1/2 width each */}
        <div className="col-span-12 lg:col-span-6 bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
          <div className="h-32 flex items-center justify-center">
            <span className="text-gray-400 dark:text-gray-500">Tile 1 (1/2 width)</span>
          </div>
        </div>
        
        <div className="col-span-12 lg:col-span-6 bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
          <div className="h-32 flex items-center justify-center">
            <span className="text-gray-400 dark:text-gray-500">Tile 2 (1/2 width)</span>
          </div>
        </div>

        {/* Full width line with four tabs */}
        <div className="col-span-12 bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
          <div className="border-b border-gray-200 dark:border-gray-700/60 mb-4">
            <ul className="text-sm font-medium flex flex-nowrap overflow-x-scroll no-scrollbar">
              <li className="pb-3 mr-6 last:mr-0">
                <button 
                  className={`whitespace-nowrap ${activeTab === 'tab-a' ? 'text-violet-500' : 'text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                  onClick={() => setActiveTab('tab-a')}
                >
                  Tab A
                </button>
              </li>
              <li className="pb-3 mr-6 last:mr-0">
                <button 
                  className={`whitespace-nowrap ${activeTab === 'tab-b' ? 'text-violet-500' : 'text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                  onClick={() => setActiveTab('tab-b')}
                >
                  Tab B
                </button>
              </li>
              <li className="pb-3 mr-6 last:mr-0">
                <button 
                  className={`whitespace-nowrap ${activeTab === 'tab-c' ? 'text-violet-500' : 'text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                  onClick={() => setActiveTab('tab-c')}
                >
                  Tab C
                </button>
              </li>
              <li className="pb-3 mr-6 last:mr-0">
                <button 
                  className={`whitespace-nowrap ${activeTab === 'tab-d' ? 'text-violet-500' : 'text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                  onClick={() => setActiveTab('tab-d')}
                >
                  Tab D
                </button>
              </li>
            </ul>
          </div>
          
          {/* Tab Content */}
          {activeTab === 'tab-a' && (
            <div className="h-48 flex items-center justify-center">
              <span className="text-gray-400 dark:text-gray-500">Tab A Content (Full Width)</span>
            </div>
          )}
          
          {activeTab === 'tab-b' && (
            <div className="h-48 flex items-center justify-center">
              <span className="text-gray-400 dark:text-gray-500">Tab B Content (Full Width)</span>
            </div>
          )}
          
          {activeTab === 'tab-c' && (
            <div className="h-48 flex items-center justify-center">
              <span className="text-gray-400 dark:text-gray-500">Tab C Content (Full Width)</span>
            </div>
          )}
          
          {activeTab === 'tab-d' && (
            <div className="h-48 flex items-center justify-center">
              <span className="text-gray-400 dark:text-gray-500">Tab D Content (Full Width)</span>
            </div>
          )}
        </div>

        {/* Third Row: Two tiles, 3/5 and 2/5 width */}
        <div className="col-span-12 lg:col-span-7 bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
          <div className="h-32 flex items-center justify-center">
            <span className="text-gray-400 dark:text-gray-500">Tile 3 (3/5 width)</span>
          </div>
        </div>
        
        <div className="col-span-12 lg:col-span-5 bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
          <div className="h-32 flex items-center justify-center">
            <span className="text-gray-400 dark:text-gray-500">Tile 4 (2/5 width)</span>
          </div>
        </div>

      </div>
    </div>
  )
}

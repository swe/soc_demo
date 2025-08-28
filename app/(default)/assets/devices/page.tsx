'use client'

import { useEffect, useState } from 'react'
import { usePageTitle } from '@/app/page-title-context'

export default function DevicesPage() {
  const { setPageTitle } = usePageTitle()
  const [activeTab, setActiveTab] = useState('tab-a')

  useEffect(() => {
    setPageTitle('Devices')
  }, [setPageTitle])

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">
      {/* Devices header */}
      <div className="mb-8">
        {/* Main title */}
        <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold mb-2">Devices</h1>
        {/* Subheader */}
        <p className="text-gray-600 dark:text-gray-400 text-lg">Monitor and manage your device infrastructure</p>
      </div>

      {/* Tile Layout */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* First Row: 4 tiles, 1/4 width each */}
        <div className="col-span-12 sm:col-span-6 xl:col-span-3 bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
          <div className="h-32 flex items-center justify-center">
            <span className="text-gray-400 dark:text-gray-500">Tile 1 (1/4 width)</span>
          </div>
        </div>
        
        <div className="col-span-12 sm:col-span-6 xl:col-span-3 bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
          <div className="h-32 flex items-center justify-center">
            <span className="text-gray-400 dark:text-gray-500">Tile 2 (1/4 width)</span>
          </div>
        </div>
        
        <div className="col-span-12 sm:col-span-6 xl:col-span-3 bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
          <div className="h-32 flex items-center justify-center">
            <span className="text-gray-400 dark:text-gray-500">Tile 3 (1/4 width)</span>
          </div>
        </div>
        
        <div className="col-span-12 sm:col-span-6 xl:col-span-3 bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
          <div className="h-32 flex items-center justify-center">
            <span className="text-gray-400 dark:text-gray-500">Tile 4 (1/4 width)</span>
          </div>
        </div>

        {/* Second Row: 3 tiles, 1/3 width each */}
        <div className="col-span-12 sm:col-span-6 xl:col-span-4 bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
          <div className="h-32 flex items-center justify-center">
            <span className="text-gray-400 dark:text-gray-500">Tile 5 (1/3 width)</span>
          </div>
        </div>
        
        <div className="col-span-12 sm:col-span-6 xl:col-span-4 bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
          <div className="h-32 flex items-center justify-center">
            <span className="text-gray-400 dark:text-gray-500">Tile 6 (1/3 width)</span>
          </div>
        </div>
        
        <div className="col-span-12 sm:col-span-6 xl:col-span-4 bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
          <div className="h-32 flex items-center justify-center">
            <span className="text-gray-400 dark:text-gray-500">Tile 7 (1/3 width)</span>
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
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-full lg:col-span-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="h-24 flex items-center justify-center">
                  <span className="text-gray-400 dark:text-gray-500">Inner Tile 1 (Full width)</span>
                </div>
              </div>
              <div className="col-span-full lg:col-span-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="h-24 flex items-center justify-center">
                  <span className="text-gray-400 dark:text-gray-500">Inner Tile 2 (Full width)</span>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'tab-b' && (
            <div className="h-32 flex items-center justify-center">
              <span className="text-gray-400 dark:text-gray-500">Tab B Content (Full width)</span>
            </div>
          )}
          
          {activeTab === 'tab-c' && (
            <div className="h-32 flex items-center justify-center">
              <span className="text-gray-400 dark:text-gray-500">Tab C Content (Full width)</span>
            </div>
          )}
          
          {activeTab === 'tab-d' && (
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 sm:col-span-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="h-20 flex items-center justify-center">
                  <span className="text-gray-400 dark:text-gray-500">Inner Tile 1 (1/2 width)</span>
                </div>
              </div>
              <div className="col-span-12 sm:col-span-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="h-20 flex items-center justify-center">
                  <span className="text-gray-400 dark:text-gray-500">Inner Tile 2 (1/2 width)</span>
                </div>
              </div>
              <div className="col-span-12 sm:col-span-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="h-20 flex items-center justify-center">
                  <span className="text-gray-400 dark:text-gray-500">Inner Tile 3 (1/2 width)</span>
                </div>
              </div>
              <div className="col-span-12 sm:col-span-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="h-20 flex items-center justify-center">
                  <span className="text-gray-400 dark:text-gray-500">Inner Tile 4 (1/2 width)</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Fourth Row: 1/2 width + 1/4 width + 1/4 width */}
        <div className="col-span-12 lg:col-span-6 bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
          <div className="h-32 flex items-center justify-center">
            <span className="text-gray-400 dark:text-gray-500">Tile 8 (1/2 width)</span>
          </div>
        </div>
        
        <div className="col-span-12 sm:col-span-6 lg:col-span-3 bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
          <div className="h-32 flex items-center justify-center">
            <span className="text-gray-400 dark:text-gray-500">Tile 9 (1/4 width)</span>
          </div>
        </div>
        
        <div className="col-span-12 sm:col-span-6 lg:col-span-3 bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
          <div className="h-32 flex items-center justify-center">
            <span className="text-gray-400 dark:text-gray-500">Tile 10 (1/4 width)</span>
          </div>
        </div>

      </div>
    </div>
  )
}

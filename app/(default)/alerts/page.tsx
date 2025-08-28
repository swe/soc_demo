'use client'

import { useEffect } from 'react'
import { usePageTitle } from '@/app/page-title-context'

export default function AlertsPage() {
  const { setPageTitle } = usePageTitle()

  useEffect(() => {
    setPageTitle('Alerts')
  }, [setPageTitle])

  return (
    <div>
      {/* Content container */}
      <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">
        {/* Alerts header */}
        <div className="mb-8">
          {/* Main title */}
          <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold mb-2">Alerts</h1>
          {/* Subheader */}
          <p className="text-gray-600 dark:text-gray-400 text-lg">Monitor your cybersecurity alerts and incident response</p>
        </div>

        {/* Status bar - sticky top line */}
        <div className="sticky top-16 z-50 before:absolute before:inset-0 before:backdrop-blur-md before:bg-white/80 dark:before:bg-gray-800/80 before:-z-10 border-b border-gray-200 dark:border-gray-700/60 mb-6 -mx-4 sm:-mx-6 lg:-mx-8">
          <div className="px-4 sm:px-6 lg:px-8 py-3 w-full">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-6">
                {/* Pulsing blue icon */}
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">X</span>
                </div>
                
                {/* Clock icon and time */}
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-gray-500 dark:text-gray-400">xx:xx</span>
                </div>
                
                {/* Stats icon and Alerts/Hour */}
                <div className="flex items-center space-x-1 mr-1">
                  <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span className="text-gray-500 dark:text-gray-400">Alerts/Hour</span>
                </div>
                
                {/* Letter X */}
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-gray-900 dark:text-gray-100">X</span>
                </div>
                
                {/* Gray circle and System */}
                <div className="flex items-center space-x-1 mr-1">
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  <span className="text-gray-500 dark:text-gray-400">System is</span>
                </div>
                
                {/* Gray text X */}
                <div className="flex items-center space-x-2">
                  <span className="text-gray-500 dark:text-gray-400">X</span>
                </div>
              </div>
              
              {/* Refresh button */}
              <button className="px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white rounded-md text-sm font-medium transition-colors cursor-pointer">
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Tile Layout */}
        <div className="grid grid-cols-12 gap-6">
          {/* First Row: 2/3 width tile with 6 tiles inside, 1/3 width tile */}
          <div className="col-span-12 lg:col-span-8 bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
            <div className="grid grid-cols-3 gap-4">
              {/* 6 tiles in two rows */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 h-20 flex items-center justify-center">
                <span className="text-gray-400 dark:text-gray-500 text-sm">Tile 1</span>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 h-20 flex items-center justify-center">
                <span className="text-gray-400 dark:text-gray-500 text-sm">Tile 2</span>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 h-20 flex items-center justify-center">
                <span className="text-gray-400 dark:text-gray-500 text-sm">Tile 3</span>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 h-20 flex items-center justify-center">
                <span className="text-gray-400 dark:text-gray-500 text-sm">Tile 4</span>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 h-20 flex items-center justify-center">
                <span className="text-gray-400 dark:text-gray-500 text-sm">Tile 5</span>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 h-20 flex items-center justify-center">
                <span className="text-gray-400 dark:text-gray-500 text-sm">Tile 6</span>
              </div>
            </div>
          </div>
          
          <div className="col-span-12 lg:col-span-4 bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
            <div className="h-48 flex items-center justify-center">
              <span className="text-gray-400 dark:text-gray-500">Tile 7</span>
            </div>
          </div>

          {/* Second Row: 2/3 width tile, 1/3 width tile */}
          <div className="col-span-12 lg:col-span-8 bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
            <div className="h-48 flex items-center justify-center">
              <span className="text-gray-400 dark:text-gray-500">Tile 8</span>
            </div>
          </div>
          
          <div className="col-span-12 lg:col-span-4 bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
            <div className="h-48 flex items-center justify-center">
              <span className="text-gray-400 dark:text-gray-500">Tile 9</span>
            </div>
          </div>

          {/* Third Row: 1/2 width tile, 1/2 width tile */}
          <div className="col-span-12 lg:col-span-6 bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
            <div className="h-48 flex items-center justify-center">
              <span className="text-gray-400 dark:text-gray-500">Tile 10</span>
            </div>
          </div>
          
          <div className="col-span-12 lg:col-span-6 bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
            <div className="h-48 flex items-center justify-center">
              <span className="text-gray-400 dark:text-gray-500">Tile 11</span>
            </div>
          </div>

          {/* Fourth Row: 1/2 width tile, 1/4 width tile, 1/4 width tile */}
          <div className="col-span-12 lg:col-span-6 bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
            <div className="h-48 flex items-center justify-center">
              <span className="text-gray-400 dark:text-gray-500">Tile 12</span>
            </div>
          </div>
          
          <div className="col-span-12 lg:col-span-3 bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
            <div className="h-48 flex items-center justify-center">
              <span className="text-gray-400 dark:text-gray-500">Tile 13</span>
            </div>
          </div>
          
          <div className="col-span-12 lg:col-span-3 bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
            <div className="h-48 flex items-center justify-center">
              <span className="text-gray-400 dark:text-gray-500">Tile 14</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

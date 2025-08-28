'use client'

import { useEffect } from 'react'
import { usePageTitle } from '@/app/page-title-context'

export default function Overview() {
  const { setPageTitle } = usePageTitle()

  useEffect(() => {
    setPageTitle('Overview')
  }, [setPageTitle])
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">
      {/* Overview header */}
      <div className="mb-8">
        {/* Main title */}
        <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold mb-2">Overview</h1>
        {/* Subheader */}
        <p className="text-gray-600 dark:text-gray-400 text-lg">Monitor your cybersecurity posture and IT health</p>
      </div>

      {/* New Tile Layout */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* First Row: Three tiles similar width */}
        <div className="col-span-12 sm:col-span-4 bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
          <div className="h-32 flex items-center justify-center">
            <span className="text-gray-400 dark:text-gray-500">Tile 1</span>
          </div>
        </div>
        
        <div className="col-span-12 sm:col-span-4 bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
          <div className="h-32 flex items-center justify-center">
            <span className="text-gray-400 dark:text-gray-500">Tile 2</span>
          </div>
        </div>
        
        <div className="col-span-12 sm:col-span-4 bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
          <div className="h-32 flex items-center justify-center">
            <span className="text-gray-400 dark:text-gray-500">Tile 3</span>
          </div>
        </div>

        {/* Second Row: Two tiles, left is 2/3, right is 1/3 */}
        <div className="col-span-12 lg:col-span-8 bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
          <div className="h-48 flex items-center justify-center">
            <span className="text-gray-400 dark:text-gray-500">Tile 4 (2/3 width)</span>
          </div>
        </div>
        
        <div className="col-span-12 lg:col-span-4 bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
          <div className="h-48 flex items-center justify-center">
            <span className="text-gray-400 dark:text-gray-500">Tile 5 (1/3 width)</span>
          </div>
        </div>

        {/* Third Row: Two tiles, similar width */}
        <div className="col-span-12 lg:col-span-6 bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
          <div className="h-32 flex items-center justify-center">
            <span className="text-gray-400 dark:text-gray-500">Tile 6</span>
          </div>
        </div>
        
        <div className="col-span-12 lg:col-span-6 bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
          <div className="h-32 flex items-center justify-center">
            <span className="text-gray-400 dark:text-gray-500">Tile 7</span>
          </div>
        </div>

        {/* Fourth Row: Four tiles, similar width */}
        <div className="col-span-12 sm:col-span-6 lg:col-span-3 bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
          <div className="h-24 flex items-center justify-center">
            <span className="text-gray-400 dark:text-gray-500">Tile 8</span>
          </div>
        </div>
        
        <div className="col-span-12 sm:col-span-6 lg:col-span-3 bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
          <div className="h-24 flex items-center justify-center">
            <span className="text-gray-400 dark:text-gray-500">Tile 9</span>
          </div>
        </div>
        
        <div className="col-span-12 sm:col-span-6 lg:col-span-3 bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
          <div className="h-24 flex items-center justify-center">
            <span className="text-gray-400 dark:text-gray-500">Tile 10</span>
          </div>
        </div>
        
        <div className="col-span-12 sm:col-span-6 lg:col-span-3 bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
          <div className="h-24 flex items-center justify-center">
            <span className="text-gray-400 dark:text-gray-500">Tile 11</span>
          </div>
        </div>

      </div>
    </div>
  )
}

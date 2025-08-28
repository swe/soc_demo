'use client'

import { useEffect } from 'react'
import { usePageTitle } from '@/app/page-title-context'

export default function Documentation() {
  const { setPageTitle } = usePageTitle()

  useEffect(() => {
    setPageTitle('Documentation')
  }, [setPageTitle])

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold mb-2">Documentation</h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">Manage and organize your knowledge base documents</p>
      </div>

      {/* Sticky top bar with quick actions */}
      <div className="sticky top-16 z-50 before:absolute before:inset-0 before:backdrop-blur-md before:bg-white/80 dark:before:bg-gray-800/80 before:-z-10 border-b border-gray-200 dark:border-gray-700/60 mb-6 -mx-4 sm:-mx-6 lg:-mx-8">
        <div className="px-4 sm:px-6 lg:px-8 py-3 w-full">
        <div className="flex items-center justify-between">
          {/* Left side - Total Documents */}
          <div className="flex items-center">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Documents: <span className="text-gray-800 dark:text-gray-100 font-semibold">24</span>
            </span>
          </div>
          
          {/* Right side - Upload File Button */}
          <div className="flex items-center">
            <button className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Upload File
            </button>
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

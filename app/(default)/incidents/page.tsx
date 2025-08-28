'use client'

import { useEffect } from 'react'
import { usePageTitle } from '@/app/page-title-context'

export default function IncidentsPage() {
  const { setPageTitle } = usePageTitle()

  useEffect(() => {
    setPageTitle('Incidents')
  }, [setPageTitle])

  return (
    <div>
      {/* Content container */}
      <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">
        {/* Incidents header */}
        <div className="mb-8">
          {/* Main title */}
          <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold mb-2">Incidents</h1>
          {/* Subheader */}
          <p className="text-gray-600 dark:text-gray-400 text-lg">Monitor and manage security incidents and response activities</p>
        </div>



        {/* Tile Layout */}
        <div className="grid grid-cols-12 gap-6">
          {/* First Row: 2/3 width tile with 3 tiles in column, 2 tiles stacked (1/3 width) */}
          <div className="col-span-12 lg:col-span-8 bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
            <div className="grid grid-cols-1 gap-4">
              {/* 3 tiles in column */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 h-20 flex items-center justify-center">
                <span className="text-gray-400 dark:text-gray-500 text-sm">Tile 1</span>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 h-20 flex items-center justify-center">
                <span className="text-gray-400 dark:text-gray-500 text-sm">Tile 2</span>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 h-20 flex items-center justify-center">
                <span className="text-gray-400 dark:text-gray-500 text-sm">Tile 3</span>
              </div>
            </div>
          </div>
          
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
              <div className="h-32 flex items-center justify-center">
                <span className="text-gray-400 dark:text-gray-500 text-sm">Tile 4</span>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
              <div className="h-32 flex items-center justify-center">
                <span className="text-gray-400 dark:text-gray-500 text-sm">Tile 5</span>
              </div>
            </div>
          </div>

          {/* Second Row: 1/2 width tile, 1/2 width tile */}
          <div className="col-span-12 lg:col-span-6 bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
            <div className="h-32 flex items-center justify-center">
              <span className="text-gray-400 dark:text-gray-500">Tile 6 (1/2 width)</span>
            </div>
          </div>
          
          <div className="col-span-12 lg:col-span-6 bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
            <div className="h-32 flex items-center justify-center">
              <span className="text-gray-400 dark:text-gray-500">Tile 7 (1/2 width)</span>
            </div>
          </div>

          {/* Third Row: 1/4 width tile, 1/4 width tile, 1/4 width tile, 1/4 width tile */}
          <div className="col-span-12 lg:col-span-3 bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
            <div className="h-32 flex items-center justify-center">
              <span className="text-gray-400 dark:text-gray-500">Tile 8 (1/4 width)</span>
            </div>
          </div>
          
          <div className="col-span-12 lg:col-span-3 bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
            <div className="h-32 flex items-center justify-center">
              <span className="text-gray-400 dark:text-gray-500">Tile 9 (1/4 width)</span>
            </div>
          </div>
          
          <div className="col-span-12 lg:col-span-3 bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
            <div className="h-32 flex items-center justify-center">
              <span className="text-gray-400 dark:text-gray-500">Tile 10 (1/4 width)</span>
            </div>
          </div>
          
          <div className="col-span-12 lg:col-span-3 bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
            <div className="h-32 flex items-center justify-center">
              <span className="text-gray-400 dark:text-gray-500">Tile 11 (1/4 width)</span>
            </div>
          </div>

          {/* Fourth Row: 1/2 width tile, 1/4 width tile, 1/4 width tile */}
          <div className="col-span-12 lg:col-span-6 bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
            <div className="h-32 flex items-center justify-center">
              <span className="text-gray-400 dark:text-gray-500">Tile 12 (1/2 width)</span>
            </div>
          </div>
          
          <div className="col-span-12 lg:col-span-3 bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
            <div className="h-32 flex items-center justify-center">
              <span className="text-gray-400 dark:text-gray-500">Tile 13 (1/4 width)</span>
            </div>
          </div>
          
          <div className="col-span-12 lg:col-span-3 bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
            <div className="h-32 flex items-center justify-center">
              <span className="text-gray-400 dark:text-gray-500">Tile 14 (1/4 width)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

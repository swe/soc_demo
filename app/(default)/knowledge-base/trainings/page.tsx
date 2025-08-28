'use client'

import { useEffect } from 'react'
import { usePageTitle } from '@/app/page-title-context'

export default function Trainings() {
  const { setPageTitle } = usePageTitle()

  useEffect(() => {
    setPageTitle('Trainings')
  }, [setPageTitle])

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold mb-2">Trainings</h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">Access and manage your training materials and courses</p>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* First Row: Two tiles, 1/2 width each */}
        <div className="col-span-12 lg:col-span-6 bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
          <div className="h-48 flex items-center justify-center">
            <span className="text-gray-400 dark:text-gray-500">Training Tile 1 (1/2 width)</span>
          </div>
        </div>
        
        <div className="col-span-12 lg:col-span-6 bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
          <div className="h-48 flex items-center justify-center">
            <span className="text-gray-400 dark:text-gray-500">Training Tile 2 (1/2 width)</span>
          </div>
        </div>

        {/* Second Row: One tile 3/5 width, one tile 2/5 width */}
        <div className="col-span-12 lg:col-span-7 bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
          <div className="h-48 flex items-center justify-center">
            <span className="text-gray-400 dark:text-gray-500">Training Tile 3 (3/5 width)</span>
          </div>
        </div>
        
        <div className="col-span-12 lg:col-span-5 bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
          <div className="h-48 flex items-center justify-center">
            <span className="text-gray-400 dark:text-gray-500">Training Tile 4 (2/5 width)</span>
          </div>
        </div>

      </div>
    </div>
  )
}

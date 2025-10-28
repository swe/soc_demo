'use client'

// import { useState } from 'react'
import { useAppProvider } from '@/app/app-provider'
import { usePageTitle } from '@/app/page-title-context'
import { useScroll } from '@/components/utils/use-scroll'

// import SearchModal from '@/components/search-modal'
import ThemeToggle from '@/components/theme-toggle'
import DropdownProfile from '@/components/dropdown-profile'

export default function Header({
  variant = 'default',
}: {
  variant?: 'default' | 'v2' | 'v3'
}) {

  const { sidebarOpen, setSidebarOpen } = useAppProvider()
  const { pageTitle } = usePageTitle()
  const isScrolled = useScroll(100)
  // const [searchModalOpen, setSearchModalOpen] = useState<boolean>(false)

  return (
    <header className={`sticky top-0 z-40 before:absolute before:inset-0 before:backdrop-blur-md before:bg-white/90 dark:before:bg-gray-800/90 before:-z-10 border-b border-gray-200 dark:border-gray-700`}>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Header: Left side */}
          <div className="flex items-center">

            {/* Hamburger button */}
            <button
              className="text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 lg:hidden cursor-pointer"
              aria-controls="sidebar"
              aria-expanded={sidebarOpen}
              onClick={() => { setSidebarOpen(!sidebarOpen) }}
            >
              <span className="sr-only">Open sidebar</span>
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <rect x="4" y="5" width="16" height="2" />
                <rect x="4" y="11" width="16" height="2" />
                <rect x="4" y="17" width="16" height="2" />
              </svg>
            </button>

            {/* Page Title - shown when scrolled */}
            {isScrolled && pageTitle && (
              <div className="ml-2 lg:ml-0 flex items-center gap-3">
                <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100 truncate max-w-xs lg:max-w-md">
                  {pageTitle}
                </h1>
                {/* Live indicator - only show on Overview page */}
                {pageTitle === 'Security Operations Center' && (
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">Live</span>
                  </div>
                )}
              </div>
            )}
            


          </div>

          {/* Header: Right side */}
          <div className="flex items-center space-x-3">
            {/* <div>
              <button
                className={`w-8 h-8 flex items-center justify-center hover:bg-gray-100 lg:hover:bg-gray-200 dark:hover:bg-gray-700/50 dark:lg:hover:bg-gray-800 rounded-full ml-3 cursor-pointer ${searchModalOpen && 'bg-gray-200 dark:bg-gray-800'}`}
                onClick={() => { setSearchModalOpen(true) }}
              >
                <span className="sr-only">Search</span>
                <ion-icon name="search-outline" class="text-lg text-gray-500 dark:text-gray-400"></ion-icon>
              </button>
              <SearchModal isOpen={searchModalOpen} setIsOpen={setSearchModalOpen} />
            </div> */}
            <ThemeToggle />
            {/*  Divider */}
            <hr className="w-px h-6 bg-gray-200 dark:bg-gray-700/60 border-none" />
            <DropdownProfile align="right" />

          </div>

        </div>
      </div>
    </header>
  )
}

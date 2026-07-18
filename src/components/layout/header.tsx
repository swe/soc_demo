'use client'

import { useAppProvider } from '@/app/app-provider'
import { usePageTitle } from '@/app/page-title-context'
import DropdownOrg from '@/components/dropdown-org'
import DropdownProfile from '@/components/dropdown-profile'
import Icon from '@/components/ui/icon'
import { useScroll } from '@/components/utils/use-scroll'

/**
 * Product header — quiet chrome that supports the page rather than competing
 * with it. Sits on the page canvas with a hairline border; org switcher and
 * profile only. Dark theme only in M3 (no theme toggle).
 */
export function ProductHeader() {
  const { sidebarOpen, setSidebarOpen } = useAppProvider()
  const { pageTitle } = usePageTitle()
  const isScrolled = useScroll(80)

  return (
    <header className="sticky top-0 z-[var(--z-sticky)] border-b border-[color:var(--soc-border)] bg-[color:var(--soc-bg)]">
      <div className="flex h-12 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            className="lg:hidden text-[color:var(--soc-text-muted)] hover:text-[color:var(--soc-text)]"
            aria-controls="sidebar"
            aria-expanded={sidebarOpen}
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <span className="sr-only">Open sidebar</span>
            <Icon name="menu-outline" className="w-5 h-5" />
          </button>
          {isScrolled && pageTitle ? (
            <p className="text-[13px] font-medium text-[color:var(--soc-text-secondary)] truncate hidden sm:block">
              {pageTitle}
            </p>
          ) : null}
        </div>

        <div className="flex items-center gap-2.5">
          <DropdownOrg />
          <div className="w-px h-4 bg-[color:var(--soc-border-mid)]" aria-hidden />
          <DropdownProfile align="right" />
        </div>
      </div>
    </header>
  )
}

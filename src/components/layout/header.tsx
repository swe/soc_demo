'use client'

import { useAppProvider } from '@/app/app-provider'
import { usePageTitle } from '@/app/page-title-context'
import Icon from '@/components/ui/icon'
import { useScroll } from '@/components/utils/use-scroll'

import { OrgMenu } from './org-menu'
import { ProfileMenu } from './profile-menu'
import { ThemeToggle } from './theme-toggle'

/**
 * Product header — quiet chrome that supports the page rather than competing
 * with it. Sits on the page canvas with a hairline border. All colors come
 * from semantic tokens so the header is readable in both themes; stacking is
 * governed by the shared z-scale (--z-header).
 */
export function ProductHeader() {
  const { sidebarOpen, setSidebarOpen } = useAppProvider()
  const { pageTitle } = usePageTitle()
  const isScrolled = useScroll(80)

  return (
    <header className="sticky top-0 z-[var(--z-header)] border-b border-[color:var(--soc-border)] bg-[color:var(--soc-bg)]">
      <div className="flex h-12 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            className="lg:hidden inline-flex h-7 w-7 items-center justify-center rounded-[var(--radius-md)]
              text-[color:var(--soc-text-muted)] transition-colors duration-[var(--duration-fast)]
              hover:bg-[color:var(--soc-hover)] hover:text-[color:var(--soc-text)]"
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

        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <div className="w-px h-4 mx-1 bg-[color:var(--soc-border-mid)]" aria-hidden />
          <OrgMenu />
          <ProfileMenu />
        </div>
      </div>
    </header>
  )
}

import type { ReactNode } from 'react'

import { ProductHeader } from './header'
import { ProductSidebar } from './sidebar'

/**
 * M3 application chrome: sidebar + header + main.
 *
 * Surface zoning: the outer shell sits on --soc-shell, the sidebar on its own
 * --soc-sidebar surface, and the page canvas on the lighter --soc-bg — so
 * navigation, chrome, and content read as distinct areas without shadows.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="overview-dashboard product-shell dark">
      <a href="#main-content" className="soc-skip-link">
        Skip to main content
      </a>
      <div className="flex h-[100dvh] overflow-hidden bg-[color:var(--soc-shell)]">
        <ProductSidebar />
        <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden bg-[color:var(--soc-bg)]">
          <ProductHeader />
          <main id="main-content" className="grow [&>*:first-child]:scroll-mt-16">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}

import type { ReactNode } from 'react'

import { ProductHeader } from './header'
import { ProductSidebar } from './sidebar'

/**
 * M3 application chrome: sidebar + header + main.
 *
 * Surface zoning: the outer shell sits on --soc-shell, the sidebar on its own
 * --soc-sidebar surface, and the page canvas on --soc-bg — so navigation,
 * chrome, and content read as distinct areas without shadows.
 *
 * Theme is resolved from the html element (ThemeProvider + blocking init
 * script); the shell never forces a theme class of its own.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="overview-dashboard product-shell">
      <a href="#main-content" className="soc-skip-link">
        Skip to main content
      </a>
      <div className="flex h-[100dvh] overflow-hidden bg-[color:var(--soc-shell)]">
        <ProductSidebar />
        <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden bg-[color:var(--soc-bg)]">
          <ProductHeader />
          {/* tabIndex={-1}: skip-link target must be programmatically focusable */}
          <main id="main-content" tabIndex={-1} className="grow outline-none [&>*:first-child]:scroll-mt-16">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}

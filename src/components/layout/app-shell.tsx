import type { ReactNode } from 'react'

import { ProductHeader } from './header'
import { ProductSidebar } from './sidebar'

/**
 * M3 application chrome: sidebar + header + main.
 * Forces the product token surface (dark operational theme).
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="overview-dashboard product-shell dark">
      <a href="#main-content" className="soc-skip-link">
        Skip to main content
      </a>
      <div className="flex h-[100dvh] overflow-hidden bg-[color:var(--soc-bg)]">
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

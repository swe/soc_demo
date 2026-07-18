import type { ReactNode } from 'react'

/** Content width container for operational pages. */
export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-6 soc-fade-in">{children}</div>
  )
}

import type { ReactNode } from 'react'

import { PageHeader } from './page-header'
import { PageShell } from './page-shell'

/**
 * Shared restrained unavailable state for M4 capabilities that remain
 * reachable by URL but are removed from primary navigation. Flat bordered
 * panel on the page canvas — no fake data, no drama.
 */
export function UnavailableCapability({
  title = 'Capability unavailable',
  section = 'PRODUCT',
}: {
  title?: string
  section?: string
}) {
  return (
    <PageShell>
      <PageHeader
        section={section}
        title={title}
        description="This capability is not available in the current product version."
      />
      <div className="soc-panel px-6 py-8 max-w-2xl" role="status">
        <p className="text-[13px] text-[color:var(--soc-text-secondary)] leading-relaxed">
          The page you opened is reserved for a future release. Primary navigation only
          lists surfaces that are functional today. Return to Overview, Alerts,
          Investigations, or Incidents to continue operational work.
        </p>
      </div>
    </PageShell>
  )
}

/** Thin page body for M4 stub routes — no fake data. */
export function UnavailablePage({
  title,
  section = 'UNAVAILABLE',
}: {
  title: string
  section?: string
}): ReactNode {
  return <UnavailableCapability title={title} section={section} />
}

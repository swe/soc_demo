import { PageHeader, PageShell } from '@/src/components/layout'

/**
 * Checkpoint 1 placeholder — Investigations list/detail land in Checkpoint 4.
 * Nav entry is intentional; no fake data.
 */
export default function InvestigationsPlaceholderPage() {
  return (
    <PageShell>
      <PageHeader
        section="OPERATIONS"
        title="Investigations"
        description="Investigate linked alerts, record findings, and promote to incidents."
      />
      <div className="soc-panel px-6 py-8 max-w-2xl" role="status">
        <p className="text-[13px] font-medium text-[color:var(--soc-text)] mb-1.5">
          The investigations workspace arrives in Checkpoint 4
        </p>
        <p className="text-[13px] text-[color:var(--soc-text-secondary)] leading-relaxed">
          The investigation API is already live — analysts can create investigations from
          the Alerts queue and promote them to incidents. The dedicated list and detail
          experience ships next.
        </p>
      </div>
    </PageShell>
  )
}

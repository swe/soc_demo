import { PageHeader, PageShell } from '@/src/components/layout'

/**
 * Checkpoint 1 placeholder — Investigations list/detail land in Checkpoint 4.
 * Nav entry is intentional; no fake data.
 */
export default function InvestigationsPlaceholderPage() {
  return (
    <PageShell>
      <PageHeader
        section="RESPONSE"
        title="Investigations"
        description="Investigate linked alerts, record findings, and promote to incidents."
      />
      <div
        className="rounded-[var(--radius-lg)] border border-[color:var(--soc-border)] bg-[color:var(--soc-surface)] px-6 py-10"
        role="status"
      >
        <p className="text-sm font-medium text-[color:var(--soc-text)] mb-2">
          Investigations workspace arrives in Checkpoint 4
        </p>
        <p className="text-sm text-[color:var(--soc-text-secondary)] max-w-xl leading-relaxed">
          The investigation API is already live (create from an alert, promote to incident).
          The dedicated list and detail experience ships next. Until then, continue creating
          investigations from the Alerts queue.
        </p>
      </div>
    </PageShell>
  )
}

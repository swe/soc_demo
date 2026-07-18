import { PageHeader, PageShell } from '@/src/components/layout'

/**
 * Placeholder route — the dedicated investigations workspace ships in a later
 * M3 checkpoint. Nav entry is intentional; no fake data, no internal jargon.
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
          A dedicated investigations workspace is coming soon
        </p>
        <p className="text-[13px] text-[color:var(--soc-text-secondary)] leading-relaxed">
          Investigations are fully operational today from the Alerts queue: open an
          alert, start an investigation, and promote it to an incident when the
          findings warrant a response. This page will add a dedicated list and
          detail experience for those investigations.
        </p>
      </div>
    </PageShell>
  )
}

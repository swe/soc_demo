import { LegalPage } from "@/components/layout/legal-page";

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy policy"
      lead="Heimdall processes security telemetry and operator account data to deliver the SOC console. Contact your organization administrator for retention, access, and data-subject requests."
    >
      <p>
        Operational logs, alerts, and incident records are retained according to
        your tenant&apos;s retention policy. Authentication and audit events are
        kept for accountability. We do not sell personal data.
      </p>
    </LegalPage>
  );
}

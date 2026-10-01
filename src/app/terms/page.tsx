import { LegalPage } from "@/components/layout/legal-page";

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of service"
      lead="Access to Heimdall is provided under your organization's agreement with Svalbard Security. Use is limited to authorized security operations personnel."
    >
      <p>
        You are responsible for safeguarding credentials, following change
        control for containment actions, and complying with applicable law and
        internal policy when using the console.
      </p>
    </LegalPage>
  );
}

import { LegalPage } from "@/components/layout/legal-page";

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of service"
      lead="This public Heimdall console is a product demo. Production access is provided under your organization's agreement with Svalbard Security."
    >
      <p>
        Demo data is illustrative and not live customer telemetry. Production use
        is limited to authorized security operations personnel under contract.
        Full terms for paid engagements are in your Svalbard agreement — see{" "}
        <a href="https://svalbard.ca/terms" className="underline underline-offset-2">
          svalbard.ca/terms
        </a>
        .
      </p>
    </LegalPage>
  );
}

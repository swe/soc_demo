import { LegalPage } from "@/components/layout/legal-page";

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy policy"
      lead="This demo console uses sample data and local browser session state. Production Heimdall engagements are covered by Svalbard's privacy policy and contract documents."
    >
      <p>
        The public demo does not ingest live customer telemetry. Production retention,
        access and data-subject requests are handled under your Svalbard agreement.
        See{" "}
        <a href="https://svalbard.ca/privacy" className="underline underline-offset-2">
          svalbard.ca/privacy
        </a>
        .
      </p>
    </LegalPage>
  );
}

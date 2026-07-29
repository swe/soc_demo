import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-prose space-y-4 p-8">
      <h1 className="text-2xl font-semibold">Privacy Policy</h1>
      <p className="text-muted-foreground text-sm">
        Heimdall processes security telemetry and operator account data to
        deliver the SOC console. Contact your organization administrator for
        retention, access, and data-subject requests.
      </p>
      <p className="text-sm leading-relaxed">
        Operational logs, alerts, and incident records are retained according to
        your tenant&apos;s retention policy. Authentication and audit events are
        kept for accountability. We do not sell personal data.
      </p>
      <p>
        <Link
          href="/login"
          className="text-primary underline underline-offset-4"
        >
          Back to login
        </Link>
      </p>
    </div>
  );
}

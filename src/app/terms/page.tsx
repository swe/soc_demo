import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-prose space-y-4 p-8">
      <h1 className="text-2xl font-semibold">Terms of Service</h1>
      <p className="text-muted-foreground text-sm">
        Access to Heimdall is provided under your organization&apos;s agreement
        with Svalbard Security. Use is limited to authorized security operations
        personnel.
      </p>
      <p className="text-sm leading-relaxed">
        You are responsible for safeguarding credentials, following change
        control for containment actions, and complying with applicable law and
        internal policy when using the console.
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

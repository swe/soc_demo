import { ChevronLeft } from "lucide-react";
import Link from "next/link";

import { Logo } from "@/components/logo";
import { site } from "@/data/site";

export function LegalPage({
  title,
  lead,
  children,
}: {
  title: string;
  lead: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-canvas px-gutter min-h-svh py-8 sm:py-12">
      <div className="mx-auto flex max-w-prose flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/login"
            className="text-primary text-callout -ml-2 inline-flex min-h-11 items-center gap-1 rounded-md px-2 font-medium hover:underline"
          >
            <ChevronLeft className="size-4" aria-hidden />
            Back to sign in
          </Link>
          <div className="flex items-center gap-2">
            <Logo width={20} height={20} />
            <span className="text-callout font-semibold">{site.title}</span>
          </div>
        </div>
        <main className="bg-card shadow-card rounded-2xl border p-6 sm:p-8">
          <h1 className="text-title-1 font-semibold tracking-tight">{title}</h1>
          <p className="text-muted-foreground text-body mt-3">{lead}</p>
          <div className="text-body mt-4 space-y-4 leading-relaxed">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

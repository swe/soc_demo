import Link from "next/link";

import { Logo } from "@/components/logo";
import { site } from "@/data/site";

interface Props {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: Props) {
  return (
    <div className="bg-canvas px-gutter flex min-h-svh flex-col items-center justify-center py-12">
      <main className="flex w-full max-w-[400px] flex-col gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex items-center gap-2">
            <Logo width={28} height={28} />
            <p className="text-title-3 font-semibold tracking-tight">
              {site.title}
            </p>
          </div>
          <p className="text-muted-foreground text-callout max-w-xs text-balance">
            {site.tagline}
          </p>
        </div>
        {children}
      </main>
      <nav
        aria-label="Legal"
        className="text-muted-foreground text-footnote mt-8 flex gap-4"
      >
        <Link href="/privacy" className="hover:text-foreground py-2">
          Privacy
        </Link>
        <Link href="/terms" className="hover:text-foreground py-2">
          Terms
        </Link>
      </nav>
    </div>
  );
}

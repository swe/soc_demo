"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuthSession } from "@/components/auth/auth-session";

/** Gate admin surfaces behind an explicit sign-in. */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { session, hydrated } = useAuthSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!hydrated) return;
    if (!session) {
      const next = encodeURIComponent(pathname || "/overview");
      router.replace(`/login?next=${next}`);
    }
  }, [hydrated, session, router, pathname]);

  if (!hydrated) {
    return (
      <div className="text-muted-foreground flex flex-1 items-center justify-center p-8 text-sm">
        Loading session…
      </div>
    );
  }

  if (!session) {
    return (
      <div className="text-muted-foreground flex flex-1 items-center justify-center p-8 text-sm">
        Redirecting to login…
      </div>
    );
  }

  return children;
}

import { Suspense } from "react";

import { ModulePageSkeleton } from "@/components/soc/module-page-skeleton";
import { DarkWebCenter } from "@/components/threat-intelligence/dark-web-center";
import { DarkWebSessionProvider } from "@/components/threat-intelligence/dark-web-session";

export default function DarkWebPage() {
  return (
    <DarkWebSessionProvider>
      <Suspense fallback={<ModulePageSkeleton />}>
        <DarkWebCenter />
      </Suspense>
    </DarkWebSessionProvider>
  );
}

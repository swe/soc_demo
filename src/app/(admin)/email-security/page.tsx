import { Suspense } from "react";

import { PhishingCenter } from "@/components/phishing/phishing-center";
import { ModulePageSkeleton } from "@/components/soc/module-page-skeleton";

export default function EmailSecurityPage() {
  return (
    <Suspense fallback={<ModulePageSkeleton />}>
      <PhishingCenter />
    </Suspense>
  );
}

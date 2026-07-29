import { Suspense } from "react";
import { ModulePageSkeleton } from "@/components/soc/module-page-skeleton";

import { PhishingCenter } from "@/components/phishing/phishing-center";

export default function EmailSecurityPage() {
  return (
    <Suspense fallback={<ModulePageSkeleton />}>
      <PhishingCenter />
    </Suspense>
  );
}

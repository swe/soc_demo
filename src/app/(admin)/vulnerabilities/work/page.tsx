import { Suspense } from "react";
import { ModulePageSkeleton } from "@/components/soc/module-page-skeleton";

import { WorkCenter } from "@/components/vulnerabilities/work-center";

export default function VulnerabilitiesWorkPage() {
  return (
    <Suspense fallback={<ModulePageSkeleton />}>
      <WorkCenter />
    </Suspense>
  );
}

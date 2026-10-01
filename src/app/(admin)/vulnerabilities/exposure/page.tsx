import { Suspense } from "react";

import { ModulePageSkeleton } from "@/components/soc/module-page-skeleton";
import { ExposureCenter } from "@/components/vulnerabilities/exposure-center";

export default function VulnerabilitiesExposurePage() {
  return (
    <Suspense fallback={<ModulePageSkeleton />}>
      <ExposureCenter />
    </Suspense>
  );
}

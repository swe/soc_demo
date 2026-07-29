import { Suspense } from "react";
import { ModulePageSkeleton } from "@/components/soc/module-page-skeleton";

import { VulnerabilitiesCenter } from "@/components/vulnerabilities/vulnerabilities-center";

export default function VulnerabilitiesFindingsPage() {
  return (
    <Suspense fallback={<ModulePageSkeleton />}>
      <VulnerabilitiesCenter view="findings" />
    </Suspense>
  );
}

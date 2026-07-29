import { Suspense } from "react";

import { VulnerabilitiesCenter } from "@/components/vulnerabilities/vulnerabilities-center";

export default function VulnerabilitiesPage() {
  return (
    <Suspense fallback={null}>
      <VulnerabilitiesCenter view="overview" />
    </Suspense>
  );
}

import { Suspense } from "react";

import { VulnerabilitiesCenter } from "@/components/vulnerabilities/vulnerabilities-center";

export default function VulnerabilitiesFindingsPage() {
  return (
    <Suspense fallback={null}>
      <VulnerabilitiesCenter view="findings" />
    </Suspense>
  );
}

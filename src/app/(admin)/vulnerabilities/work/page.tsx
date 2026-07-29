import { Suspense } from "react";

import { WorkCenter } from "@/components/vulnerabilities/work-center";

export default function VulnerabilitiesWorkPage() {
  return (
    <Suspense fallback={null}>
      <WorkCenter />
    </Suspense>
  );
}

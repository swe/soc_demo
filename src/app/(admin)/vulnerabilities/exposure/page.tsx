import { Suspense } from "react";

import { ExposureCenter } from "@/components/vulnerabilities/exposure-center";

export default function VulnerabilitiesExposurePage() {
  return (
    <Suspense fallback={null}>
      <ExposureCenter />
    </Suspense>
  );
}

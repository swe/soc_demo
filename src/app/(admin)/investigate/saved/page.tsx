import { Suspense } from "react";
import { ModulePageSkeleton } from "@/components/soc/module-page-skeleton";

import { InvestigateCenter } from "@/components/investigate/investigate-center";

export default function InvestigateSavedPage() {
  return (
    <Suspense fallback={<ModulePageSkeleton />}>
      <InvestigateCenter savedFocus />
    </Suspense>
  );
}

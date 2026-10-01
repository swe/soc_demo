import { Suspense } from "react";

import { InvestigateCenter } from "@/components/investigate/investigate-center";
import { ModulePageSkeleton } from "@/components/soc/module-page-skeleton";

export default function InvestigateSavedPage() {
  return (
    <Suspense fallback={<ModulePageSkeleton />}>
      <InvestigateCenter savedFocus />
    </Suspense>
  );
}

import { Suspense } from "react";

import { IncidentsCenter } from "@/components/incidents/incidents-center";
import { ModulePageSkeleton } from "@/components/soc/module-page-skeleton";

export default function IncidentsOverviewPage() {
  return (
    <Suspense fallback={<ModulePageSkeleton />}>
      <IncidentsCenter view="overview" />
    </Suspense>
  );
}

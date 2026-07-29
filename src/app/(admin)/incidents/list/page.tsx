import { Suspense } from "react";
import { ModulePageSkeleton } from "@/components/soc/module-page-skeleton";

import { IncidentsCenter } from "@/components/incidents/incidents-center";

export default function IncidentsListPage() {
  return (
    <Suspense fallback={<ModulePageSkeleton />}>
      <IncidentsCenter view="list" />
    </Suspense>
  );
}

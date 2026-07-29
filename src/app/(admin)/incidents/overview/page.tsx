import { Suspense } from "react";

import { IncidentsCenter } from "@/components/incidents/incidents-center";

export default function IncidentsOverviewPage() {
  return (
    <Suspense fallback={null}>
      <IncidentsCenter view="overview" />
    </Suspense>
  );
}

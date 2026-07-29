import { Suspense } from "react";

import { IncidentsCenter } from "@/components/incidents/incidents-center";

export default function IncidentsListPage() {
  return (
    <Suspense fallback={null}>
      <IncidentsCenter view="list" />
    </Suspense>
  );
}

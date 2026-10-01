import { Suspense } from "react";

import { AlertsCenter } from "@/components/alerts/alerts-center";
import { ModulePageSkeleton } from "@/components/soc/module-page-skeleton";

export default function AlertsAssignedPage() {
  return (
    <Suspense fallback={<ModulePageSkeleton />}>
      <AlertsCenter view="assigned" />
    </Suspense>
  );
}

import { Suspense } from "react";
import { ModulePageSkeleton } from "@/components/soc/module-page-skeleton";

import { AlertsCenter } from "@/components/alerts/alerts-center";

export default function AlertsListPage() {
  return (
    <Suspense fallback={<ModulePageSkeleton />}>
      <AlertsCenter view="list" />
    </Suspense>
  );
}

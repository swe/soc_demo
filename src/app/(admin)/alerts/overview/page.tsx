import { Suspense } from "react";

import { AlertsCenter } from "@/components/alerts/alerts-center";
import { ModulePageSkeleton } from "@/components/soc/module-page-skeleton";

export default function AlertsOverviewPage() {
  return (
    <Suspense fallback={<ModulePageSkeleton />}>
      <AlertsCenter view="overview" />
    </Suspense>
  );
}

import { Suspense } from "react";

import { AlertsCenter } from "@/components/alerts/alerts-center";

export default function AlertsOverviewPage() {
  return (
    <Suspense fallback={null}>
      <AlertsCenter view="overview" />
    </Suspense>
  );
}

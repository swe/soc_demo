import { Suspense } from "react";

import { AlertsCenter } from "@/components/alerts/alerts-center";

export default function AlertsListPage() {
  return (
    <Suspense fallback={null}>
      <AlertsCenter view="list" />
    </Suspense>
  );
}

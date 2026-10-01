import { Suspense } from "react";

import { PlaybookBuilder } from "@/components/automation/playbook-builder";
import { ModulePageSkeleton } from "@/components/soc/module-page-skeleton";

export default function AutomationBuilderPage() {
  return (
    <Suspense fallback={<ModulePageSkeleton />}>
      <PlaybookBuilder />
    </Suspense>
  );
}

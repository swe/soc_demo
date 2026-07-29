import { Suspense } from "react";
import { ModulePageSkeleton } from "@/components/soc/module-page-skeleton";

import { PlaybookBuilder } from "@/components/automation/playbook-builder";

export default function AutomationBuilderPage() {
  return (
    <Suspense fallback={<ModulePageSkeleton />}>
      <PlaybookBuilder />
    </Suspense>
  );
}

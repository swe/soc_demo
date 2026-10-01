import { Suspense } from "react";

import { PlaybooksCenter } from "@/components/automation/playbooks-center";
import { ModulePageSkeleton } from "@/components/soc/module-page-skeleton";

export default function AutomationPlaybooksPage() {
  return (
    <Suspense fallback={<ModulePageSkeleton />}>
      <PlaybooksCenter />
    </Suspense>
  );
}

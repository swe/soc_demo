import { Suspense } from "react";
import { ModulePageSkeleton } from "@/components/soc/module-page-skeleton";

import { PlaybooksCenter } from "@/components/automation/playbooks-center";

export default function AutomationPlaybooksPage() {
  return (
    <Suspense fallback={<ModulePageSkeleton />}>
      <PlaybooksCenter />
    </Suspense>
  );
}

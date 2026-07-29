import { Suspense } from "react";
import { ModulePageSkeleton } from "@/components/soc/module-page-skeleton";

import { InvestigateCenter } from "@/components/investigate/investigate-center";

export default async function InvestigatePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  return (
    <Suspense fallback={<ModulePageSkeleton />}>
      <InvestigateCenter initialQuery={params.q ?? null} />
    </Suspense>
  );
}

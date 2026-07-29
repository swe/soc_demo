import { Suspense } from "react";
import { ModulePageSkeleton } from "@/components/soc/module-page-skeleton";

import { IndicatorsCenter } from "@/components/threats/indicators-center";

export default async function ThreatIntelligenceIndicatorsPage({
  searchParams,
}: {
  searchParams: Promise<{ indicator?: string }>;
}) {
  const params = await searchParams;
  return (
    <Suspense fallback={<ModulePageSkeleton />}>
      <IndicatorsCenter initialIndicatorId={params.indicator ?? null} />
    </Suspense>
  );
}

import { Suspense } from "react";

import { IndicatorsCenter } from "@/components/threats/indicators-center";

export default async function ThreatIntelligenceIndicatorsPage({
  searchParams,
}: {
  searchParams: Promise<{ indicator?: string }>;
}) {
  const params = await searchParams;
  return (
    <Suspense fallback={null}>
      <IndicatorsCenter initialIndicatorId={params.indicator ?? null} />
    </Suspense>
  );
}

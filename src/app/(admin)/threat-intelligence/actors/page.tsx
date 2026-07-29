import { Suspense } from "react";
import { ModulePageSkeleton } from "@/components/soc/module-page-skeleton";

import { ActorsCenter } from "@/components/threats/actors-center";

export default async function ThreatIntelligenceActorsPage({
  searchParams,
}: {
  searchParams: Promise<{ actor?: string }>;
}) {
  const params = await searchParams;
  return (
    <Suspense fallback={<ModulePageSkeleton />}>
      <ActorsCenter initialActorId={params.actor ?? null} />
    </Suspense>
  );
}

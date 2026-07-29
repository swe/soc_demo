import { Suspense } from "react";

import { ActorsCenter } from "@/components/threats/actors-center";

export default async function ThreatIntelligenceActorsPage({
  searchParams,
}: {
  searchParams: Promise<{ actor?: string }>;
}) {
  const params = await searchParams;
  return (
    <Suspense fallback={null}>
      <ActorsCenter initialActorId={params.actor ?? null} />
    </Suspense>
  );
}

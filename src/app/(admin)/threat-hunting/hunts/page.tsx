import { Suspense } from "react";
import { ModulePageSkeleton } from "@/components/soc/module-page-skeleton";

import { HuntLibraryCenter } from "@/components/threats/hunt-library-center";

export default async function HuntLibraryPage({
  searchParams,
}: {
  searchParams: Promise<{
    hunt?: string;
    indicator?: string;
    actor?: string;
  }>;
}) {
  const params = await searchParams;
  return (
    <Suspense fallback={<ModulePageSkeleton />}>
      <HuntLibraryCenter
        initialHuntId={params.hunt ?? null}
        filterIndicatorId={params.indicator ?? null}
        filterActorId={params.actor ?? null}
      />
    </Suspense>
  );
}

import { Suspense } from "react";

import { AssetsIdentityList } from "@/components/assets/identity-list";
import { ModulePageSkeleton } from "@/components/soc/module-page-skeleton";

export default function AssetsIdentitiesPage() {
  return (
    <Suspense fallback={<ModulePageSkeleton />}>
      <AssetsIdentityList />
    </Suspense>
  );
}

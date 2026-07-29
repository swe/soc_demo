import { Suspense } from "react";
import { ModulePageSkeleton } from "@/components/soc/module-page-skeleton";

import { AssetsIdentityList } from "@/components/assets/identity-list";

export default function AssetsIdentitiesPage() {
  return (
    <Suspense fallback={<ModulePageSkeleton />}>
      <AssetsIdentityList />
    </Suspense>
  );
}

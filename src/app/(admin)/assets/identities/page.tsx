import { Suspense } from "react";

import { AssetsIdentityList } from "@/components/assets/identity-list";

export default function AssetsIdentitiesPage() {
  return (
    <Suspense fallback={null}>
      <AssetsIdentityList />
    </Suspense>
  );
}

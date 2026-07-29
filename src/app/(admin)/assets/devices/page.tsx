import { Suspense } from "react";
import { ModulePageSkeleton } from "@/components/soc/module-page-skeleton";

import { AssetsDeviceList } from "@/components/assets/device-list";

export default function AssetsDevicesPage() {
  return (
    <Suspense fallback={<ModulePageSkeleton />}>
      <AssetsDeviceList />
    </Suspense>
  );
}

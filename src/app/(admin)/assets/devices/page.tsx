import { Suspense } from "react";

import { AssetsDeviceList } from "@/components/assets/device-list";
import { ModulePageSkeleton } from "@/components/soc/module-page-skeleton";

export default function AssetsDevicesPage() {
  return (
    <Suspense fallback={<ModulePageSkeleton />}>
      <AssetsDeviceList />
    </Suspense>
  );
}

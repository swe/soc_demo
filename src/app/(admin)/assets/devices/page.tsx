import { Suspense } from "react";

import { AssetsDeviceList } from "@/components/assets/device-list";

export default function AssetsDevicesPage() {
  return (
    <Suspense fallback={null}>
      <AssetsDeviceList />
    </Suspense>
  );
}

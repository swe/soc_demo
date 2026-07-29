import { Suspense } from "react";

import { DarkWebCenter } from "@/components/threat-intelligence/dark-web-center";
import { DarkWebSessionProvider } from "@/components/threat-intelligence/dark-web-session";

export default function DarkWebPage() {
  return (
    <DarkWebSessionProvider>
      <Suspense fallback={null}>
        <DarkWebCenter />
      </Suspense>
    </DarkWebSessionProvider>
  );
}

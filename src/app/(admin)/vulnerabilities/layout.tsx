"use client";

import { VulnPersonaProvider } from "@/components/vulnerabilities/vulnerabilities-persona";
import { VulnSessionProvider } from "@/components/vulnerabilities/vulnerabilities-session";

interface Props {
  children: React.ReactNode;
}

export default function VulnerabilitiesLayout({ children }: Props) {
  return (
    <div data-layout="fixed" className="flex h-full flex-col overflow-hidden">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <VulnSessionProvider>
          <VulnPersonaProvider>{children}</VulnPersonaProvider>
        </VulnSessionProvider>
      </div>
    </div>
  );
}

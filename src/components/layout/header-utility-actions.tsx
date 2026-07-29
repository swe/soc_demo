"use client";

import { HeaderNotifications } from "@/components/layout/header-notifications";
import { cn } from "@/lib/utils";

export function HeaderUtilityActions({ className }: { className?: string }) {
  return (
    <div className={cn("flex shrink-0 items-center gap-2", className)}>
      <HeaderNotifications />
    </div>
  );
}

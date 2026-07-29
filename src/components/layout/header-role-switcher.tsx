"use client";

import { usePathname, useRouter } from "next/navigation";

import { useSocRole } from "@/components/auth/soc-role-provider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  canAccessPath,
  getHomePath,
  socJobRoles,
  socJobRoleLabels,
  type SocJobRole,
} from "@/lib/soc-roles";
import { cn } from "@/lib/utils";

export function HeaderRoleSwitcher({ className }: { className?: string }) {
  const { effectiveRole, hydrated, setViewAsRole } = useSocRole();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <Select
      value={effectiveRole}
      onValueChange={(value) => {
        const next = value as SocJobRole;
        setViewAsRole(next);
        if (!canAccessPath(next, pathname)) {
          router.replace(getHomePath(next));
        }
      }}
      disabled={!hydrated}
    >
      <SelectTrigger
        className={cn(
          "border-border bg-background h-9 w-[min(100%,11rem)] shrink-0 text-sm sm:w-[15rem]",
          !hydrated && "opacity-60",
          className,
        )}
        aria-label="View as job role"
      >
        <SelectValue placeholder="View as…" />
      </SelectTrigger>
      <SelectContent align="end" className="min-w-[15rem]">
        {socJobRoles.map((role) => (
          <SelectItem key={role} value={role}>
            {socJobRoleLabels[role]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

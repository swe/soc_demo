"use client";

import {
  CircleCheck,
  CircleDashed,
  type LucideIcon,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Siren,
} from "lucide-react";

import {
  RiskScoreBadge,
  SeverityBadge,
} from "@/components/alerts/alerts-primitives";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import {
  getIncidentAssignee,
  type IncidentStatus,
  incidentStatusLabels,
} from "./incidents-data";

export { RiskScoreBadge,SeverityBadge };

export const mutedControlClassName =
  "border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground";

export const tabTriggerClassName =
  "data-[state=active]:border-foreground shrink-0 gap-2 rounded-none border-b-2 border-transparent px-0 pb-3 text-sm shadow-none data-[state=active]:bg-transparent data-[state=active]:shadow-none sm:pb-4";

export const percentFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
});

const statusDetails: Record<
  IncidentStatus,
  { className: string; icon: LucideIcon }
> = {
  new: {
    className: "text-blue-600 dark:text-blue-400",
    icon: Siren,
  },
  investigating: {
    className: "text-violet-600 dark:text-violet-400",
    icon: CircleDashed,
  },
  contained: {
    className: "text-amber-600 dark:text-amber-400",
    icon: Shield,
  },
  eradicated: {
    className: "text-orange-600 dark:text-orange-400",
    icon: ShieldAlert,
  },
  resolved: {
    className: "text-emerald-600 dark:text-emerald-400",
    icon: CircleCheck,
  },
  closed: {
    className: "text-emerald-700 dark:text-emerald-500",
    icon: ShieldCheck,
  },
};

export function IncidentStatusBadge({ status }: { status: IncidentStatus }) {
  const detail = statusDetails[status];
  const Icon = detail.icon;

  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1 rounded-full font-medium",
        "border-border/70 bg-background",
        detail.className,
      )}
    >
      <Icon className="size-3" />
      {incidentStatusLabels[status]}
    </Badge>
  );
}

export function PriorityBadge({ priority }: { priority: string }) {
  const tone =
    priority === "P1"
      ? "border-destructive/30 bg-destructive/10 text-destructive dark:text-red-400"
      : priority === "P2"
        ? "border-orange-500/30 bg-orange-500/10 text-orange-700 dark:text-orange-400"
        : priority === "P3"
          ? "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400"
          : "border-border bg-muted text-muted-foreground";

  return (
    <Badge
      variant="outline"
      className={cn(
        "min-w-8 justify-center rounded-md px-1.5 py-0 font-mono text-xs font-semibold tabular-nums",
        tone,
      )}
    >
      {priority}
    </Badge>
  );
}

export function SlaBadge({
  state,
  label,
}: {
  state: "ok" | "at-risk" | "breached";
  label: string;
}) {
  const tone =
    state === "breached"
      ? "border-destructive/30 bg-destructive/10 text-destructive dark:text-red-400"
      : state === "at-risk"
        ? "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400"
        : "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400";

  return (
    <Badge
      variant="outline"
      className={cn("rounded-full font-medium whitespace-nowrap", tone)}
    >
      {label}
    </Badge>
  );
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function AssigneeCell({ assigneeId }: { assigneeId: string | null }) {
  const user = getIncidentAssignee(assigneeId);

  if (!user) {
    return (
      <span className="text-muted-foreground text-sm whitespace-nowrap">
        Unassigned
      </span>
    );
  }

  return (
    <div className="flex min-w-0 items-center gap-2">
      <Avatar className="size-6">
        <AvatarImage src={user.avatar} alt={user.name} />
        <AvatarFallback className="text-[10px]">
          {getInitials(user.name)}
        </AvatarFallback>
      </Avatar>
      <span className="truncate text-sm">{user.name}</span>
    </div>
  );
}

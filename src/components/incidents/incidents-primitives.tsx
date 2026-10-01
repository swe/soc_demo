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

export { RiskScoreBadge, SeverityBadge };

export const percentFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
});

const statusDetails: Record<
  IncidentStatus,
  { className: string; icon: LucideIcon }
> = {
  new: { className: "text-info-text", icon: Siren },
  investigating: {
    className: "text-violet-700 dark:text-violet-300",
    icon: CircleDashed,
  },
  contained: { className: "text-warning-text", icon: Shield },
  eradicated: { className: "text-severity-high-text", icon: ShieldAlert },
  resolved: { className: "text-success-text", icon: CircleCheck },
  closed: { className: "text-success-text", icon: ShieldCheck },
};

export function IncidentStatusBadge({ status }: { status: IncidentStatus }) {
  const detail = statusDetails[status];
  const Icon = detail.icon;

  return (
    <Badge
      variant="outline"
      className={cn("border-border/70 bg-card", detail.className)}
    >
      <Icon className="size-3" />
      {incidentStatusLabels[status]}
    </Badge>
  );
}

const priorityVariant = {
  P1: "critical",
  P2: "high",
  P3: "medium",
} as const;

export function PriorityBadge({ priority }: { priority: string }) {
  return (
    <Badge
      variant={
        priorityVariant[priority as keyof typeof priorityVariant] ?? "muted"
      }
      className="min-w-8 justify-center rounded-md px-1.5 font-mono font-semibold"
    >
      {priority}
    </Badge>
  );
}

const slaVariant = {
  breached: "critical",
  "at-risk": "warning",
  ok: "success",
} as const;

export function SlaBadge({
  state,
  label,
}: {
  state: "ok" | "at-risk" | "breached";
  label: string;
}) {
  return <Badge variant={slaVariant[state]}>{label}</Badge>;
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
        <AvatarFallback className="text-xs">
          {getInitials(user.name)}
        </AvatarFallback>
      </Avatar>
      <span className="truncate text-sm">{user.name}</span>
    </div>
  );
}

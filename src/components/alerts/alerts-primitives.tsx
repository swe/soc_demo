"use client";

import {
  CircleDashed,
  CircleSlash,
  type LucideIcon,
  Radar,
  ShieldAlert,
  ShieldCheck,
  Siren,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import {
  type AlertSeverity,
  alertSeverityLabels,
  type AlertStatus,
  alertStatusLabels,
  getAlertAssignee,
} from "./alerts-data";

export const mutedControlClassName =
  "border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground";

export const tabTriggerClassName =
  "data-[state=active]:border-foreground shrink-0 gap-2 rounded-none border-b-2 border-transparent px-0 pb-3 text-sm shadow-none data-[state=active]:bg-transparent data-[state=active]:shadow-none sm:pb-4";

export const percentFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
});

const severityTones: Record<AlertSeverity, string> = {
  critical:
    "border-destructive/30 bg-destructive/10 text-destructive dark:text-red-400",
  high: "border-orange-500/30 bg-orange-500/10 text-orange-700 dark:text-orange-400",
  medium:
    "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  low: "border-border bg-muted text-muted-foreground",
};

export function SeverityBadge({ severity }: { severity: AlertSeverity }) {
  return (
    <Badge
      variant="outline"
      className={cn("rounded-full font-medium", severityTones[severity])}
    >
      {alertSeverityLabels[severity]}
    </Badge>
  );
}

const statusDetails: Record<
  AlertStatus,
  { className: string; icon: LucideIcon }
> = {
  new: {
    className: "text-blue-600 dark:text-blue-400",
    icon: Siren,
  },
  triaging: {
    className: "text-amber-600 dark:text-amber-400",
    icon: Radar,
  },
  investigating: {
    className: "text-violet-600 dark:text-violet-400",
    icon: CircleDashed,
  },
  escalated: {
    className: "text-destructive dark:text-red-400",
    icon: ShieldAlert,
  },
  closed: {
    className: "text-emerald-600 dark:text-emerald-400",
    icon: ShieldCheck,
  },
  "false-positive": {
    className: "text-zinc-500",
    icon: CircleSlash,
  },
};

export function StatusBadge({ status }: { status: AlertStatus }) {
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
      {alertStatusLabels[status]}
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
  const user = getAlertAssignee(assigneeId);

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

export function SourceCategoryChip({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "border-border/70 bg-muted/40 text-muted-foreground inline-flex whitespace-nowrap rounded-md border px-1.5 py-0.5 text-[11px] font-medium",
        className,
      )}
    >
      {label}
    </span>
  );
}

export function RiskScoreBadge({ score }: { score: number }) {
  const tone =
    score >= 80
      ? "border-destructive/30 bg-destructive/10 text-destructive dark:text-red-400"
      : score >= 55
        ? "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400"
        : "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400";

  return (
    <Badge
      variant="outline"
      className={cn(
        "min-w-8 justify-center rounded-md px-1.5 py-0 font-mono text-xs font-semibold tabular-nums",
        tone,
      )}
    >
      {score}
    </Badge>
  );
}

export function ConfidenceCell({ value }: { value: number }) {
  return (
    <div className="flex min-w-[72px] flex-col gap-1">
      <span className="text-xs font-medium tabular-nums">{value}%</span>
      <div className="bg-muted h-1 overflow-hidden rounded-full">
        <div
          className="bg-foreground/70 h-full rounded-full"
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
}

export function SheetDetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="min-w-0 text-right font-medium">{children}</span>
    </div>
  );
}

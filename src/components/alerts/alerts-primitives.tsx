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
  type AlertSourceCategory,
  type AlertStatus,
  alertStatusLabels,
  getAlertAssignee,
} from "./alerts-data";

export const percentFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
});

export function SeverityBadge({ severity }: { severity: AlertSeverity }) {
  return <Badge variant={severity}>{alertSeverityLabels[severity]}</Badge>;
}

const statusDetails: Record<
  AlertStatus,
  { className: string; icon: LucideIcon }
> = {
  new: {
    className: "text-info-text",
    icon: Siren,
  },
  triaging: {
    className: "text-warning-text",
    icon: Radar,
  },
  investigating: {
    className: "text-violet-600 dark:text-violet-400",
    icon: CircleDashed,
  },
  escalated: {
    className: "text-destructive-text",
    icon: ShieldAlert,
  },
  closed: {
    className: "text-success-text",
    icon: ShieldCheck,
  },
  "false-positive": {
    className: "text-muted-foreground",
    icon: CircleSlash,
  },
};

export function StatusBadge({ status }: { status: AlertStatus }) {
  const detail = statusDetails[status];
  const Icon = detail.icon;

  return (
    <Badge
      variant="outline"
      className={cn("border-border/70 bg-card", detail.className)}
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
        <AvatarFallback className="text-xs">
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
        "border-border/70 bg-muted/40 text-muted-foreground inline-flex whitespace-nowrap rounded-md border px-1.5 py-0.5 text-xs font-medium",
        className,
      )}
    >
      {label}
    </span>
  );
}

const sourceBadgeTone: Record<string, string> = {
  siem: "border-transparent bg-info/10 text-info-text",
  endpoint: "border-transparent bg-severity-high/10 text-severity-high-text",
  identity:
    "border-transparent bg-violet-500/10 text-violet-800 dark:text-violet-300",
  network: "border-transparent bg-cyan-500/10 text-cyan-800 dark:text-cyan-300",
  cloud: "border-transparent bg-teal-500/10 text-teal-800 dark:text-teal-300",
};

function shortAlertSourceName(sourceName: string): string {
  const map: Record<string, string> = {
    "Splunk Enterprise": "Splunk",
    "Okta Workforce": "Okta",
    "AWS Production": "AWS",
    "PAN-OS Edge Firewalls": "PAN-OS",
    "Cloudflare Enterprise": "Cloudflare",
    "Heimdall Live Pulse": "Heimdall",
    "Microsoft Sentinel": "Sentinel",
    "Microsoft Defender": "Defender",
  };
  if (map[sourceName]) return map[sourceName];
  return sourceName.split(/\s+/)[0] || sourceName;
}

/** High-visibility source badge for alert list / detail. */
export function SourceBadge({
  sourceName,
  sourceCategory,
  className,
}: {
  sourceName: string;
  sourceCategory?: AlertSourceCategory;
  className?: string;
}) {
  const tone =
    (sourceCategory && sourceBadgeTone[sourceCategory]) ||
    "border-transparent bg-muted text-foreground";

  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-md px-1.5 font-semibold tracking-tight",
        tone,
        className,
      )}
      title={sourceName}
    >
      {shortAlertSourceName(sourceName)}
    </Badge>
  );
}

export function RiskScoreBadge({ score }: { score: number }) {
  const variant =
    score >= 80 ? "critical" : score >= 55 ? "warning" : "success";

  return (
    <Badge
      variant={variant}
      className="min-w-8 justify-center rounded-md px-1.5 font-mono font-semibold"
      aria-label={`Risk score ${score}`}
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

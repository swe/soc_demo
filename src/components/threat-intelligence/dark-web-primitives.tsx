"use client";

import {
  CircleCheck,
  CircleDashed,
  CircleSlash,
  EyeOff,
  KeyRound,
  type LucideIcon,
  MessageSquareWarning,
  Skull,
  Siren,
  ShieldAlert,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import {
  type ExposureSeverity,
  exposureSeverityLabels,
  type ExposureStatus,
  exposureStatusLabels,
  type ExposureType,
  exposureTypeLabels,
} from "./dark-web-data";

export const mutedControlClassName =
  "border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground";

export const tabTriggerClassName =
  "data-[state=active]:border-foreground shrink-0 gap-2 rounded-none border-b-2 border-transparent px-0 pb-3 text-sm shadow-none data-[state=active]:bg-transparent data-[state=active]:shadow-none sm:pb-4";

export const percentFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
});

const severityTones: Record<ExposureSeverity, string> = {
  critical:
    "border-destructive/30 bg-destructive/10 text-destructive dark:text-red-400",
  high: "border-orange-500/30 bg-orange-500/10 text-orange-700 dark:text-orange-400",
  medium:
    "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  low: "border-border bg-muted text-muted-foreground",
};

export function SeverityBadge({ severity }: { severity: ExposureSeverity }) {
  return (
    <Badge
      variant="outline"
      className={cn("rounded-full font-medium", severityTones[severity])}
    >
      {exposureSeverityLabels[severity]}
    </Badge>
  );
}

const typeDetails: Record<
  ExposureType,
  { className: string; icon: LucideIcon }
> = {
  credential: {
    className: "text-sky-700 dark:text-sky-400",
    icon: KeyRound,
  },
  stealer: {
    className: "text-violet-700 dark:text-violet-400",
    icon: EyeOff,
  },
  mention: {
    className: "text-amber-700 dark:text-amber-400",
    icon: MessageSquareWarning,
  },
  ransomware: {
    className: "text-rose-700 dark:text-rose-400",
    icon: Skull,
  },
};

export function ExposureTypeBadge({ type }: { type: ExposureType }) {
  const detail = typeDetails[type];
  const Icon = detail.icon;

  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1 whitespace-nowrap rounded-full font-medium",
        "border-border/70 bg-background",
        detail.className,
      )}
    >
      <Icon className="size-3 shrink-0" />
      {exposureTypeLabels[type]}
    </Badge>
  );
}

const statusDetails: Record<
  ExposureStatus,
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
  remediated: {
    className: "text-emerald-600 dark:text-emerald-400",
    icon: CircleCheck,
  },
  false_positive: {
    className: "text-zinc-500",
    icon: CircleSlash,
  },
  accepted_risk: {
    className: "text-amber-600 dark:text-amber-400",
    icon: ShieldAlert,
  },
};

export function ExposureStatusBadge({ status }: { status: ExposureStatus }) {
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
      {exposureStatusLabels[status]}
    </Badge>
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
      <span className="min-w-0 text-right font-medium break-words">
        {children}
      </span>
    </div>
  );
}

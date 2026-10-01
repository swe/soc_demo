"use client";

import {
  CircleCheck,
  CircleDashed,
  CircleSlash,
  EyeOff,
  KeyRound,
  type LucideIcon,
  MessageSquareWarning,
  ShieldAlert,
  Siren,
  Skull,
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

export const percentFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
});

export function SeverityBadge({ severity }: { severity: ExposureSeverity }) {
  return <Badge variant={severity}>{exposureSeverityLabels[severity]}</Badge>;
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
        "gap-1 whitespace-nowrap",
        "border-border/70 bg-card",
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
    className: "text-info-text",
    icon: Siren,
  },
  investigating: {
    className: "text-violet-700 dark:text-violet-300",
    icon: CircleDashed,
  },
  remediated: {
    className: "text-success-text",
    icon: CircleCheck,
  },
  false_positive: {
    className: "text-muted-foreground",
    icon: CircleSlash,
  },
  accepted_risk: {
    className: "text-warning-text",
    icon: ShieldAlert,
  },
};

export function ExposureStatusBadge({ status }: { status: ExposureStatus }) {
  const detail = statusDetails[status];
  const Icon = detail.icon;

  return (
    <Badge
      variant="outline"
      className={cn("border-border/70 bg-card", detail.className)}
    >
      <Icon className="size-3" />
      {exposureStatusLabels[status]}
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

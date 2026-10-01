"use client";

import {
  AlertTriangle,
  Bot,
  CircleDashed,
  CircleSlash,
  FileWarning,
  Hand,
  type LucideIcon,
  ShieldAlert,
  ShieldCheck,
  UserRoundCog,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import {
  type ComplianceControl,
  type ControlAutomation,
  controlAutomationLabels,
  type ControlStatus,
  controlStatusColors,
  controlStatusLabels,
  coveragePercent,
  type CoverageProbe,
  type EvidenceStatus,
  evidenceStatusLabels,
  type FindingSeverity,
  findingSeverityLabels,
  frameworkAccent,
  frameworkById,
  type FrameworkId,
  type FrameworkStatus,
  frameworkStatusLabels,
  getInitials,
  getUser,
} from "./compliance-data";

export const percentFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
});

/* -------------------------------------------------------------------------- */
/*                                   Badges                                   */
/* -------------------------------------------------------------------------- */

const controlStatusDetails: Record<
  ControlStatus,
  { className: string; icon: LucideIcon }
> = {
  pass: { className: "text-success-text", icon: ShieldCheck },
  attention: {
    className: "text-warning-text",
    icon: ShieldAlert,
  },
  fail: {
    className: "text-destructive-text",
    icon: AlertTriangle,
  },
  pending: {
    className: "text-info-text",
    icon: CircleDashed,
  },
  "not-applicable": { className: "text-muted-foreground", icon: CircleSlash },
};

export function ControlStatusCell({ status }: { status: ControlStatus }) {
  const detail = controlStatusDetails[status];
  const Icon = detail.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-medium",
        detail.className,
      )}
    >
      <span
        className="size-1.5 rounded-full"
        style={{ backgroundColor: controlStatusColors[status] }}
      />
      <Icon className="size-3.5" />
      {controlStatusLabels[status]}
    </span>
  );
}

const automationIcons: Record<ControlAutomation, LucideIcon> = {
  automated: Bot,
  hybrid: UserRoundCog,
  manual: Hand,
};

export function AutomationBadge({
  automation,
}: {
  automation: ControlAutomation;
}) {
  const Icon = automationIcons[automation];

  return (
    <Badge variant="secondary" className="gap-1 rounded-full font-medium">
      <Icon className="size-3" />
      {controlAutomationLabels[automation]}
    </Badge>
  );
}

const evidenceTones: Record<EvidenceStatus, string> = {
  current: "border-success/30 bg-success/10 text-success-text",
  expiring: "border-warning/30 bg-warning/10 text-warning-text",
  expired: "border-destructive/30 bg-destructive/10 text-destructive-text",
  missing: "border-border bg-muted text-muted-foreground",
};

export function EvidenceBadge({
  status,
  label,
}: {
  status: EvidenceStatus;
  label?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn("gap-1 rounded-full font-medium", evidenceTones[status])}
    >
      {status === "missing" ? <FileWarning className="size-3" /> : null}
      {label ?? evidenceStatusLabels[status]}
    </Badge>
  );
}

const severityTones: Record<FindingSeverity, string> = {
  critical:
    "border-severity-critical/30 bg-severity-critical/10 text-severity-critical-text",
  high: "border-severity-high/30 bg-severity-high/10 text-severity-high-text",
  medium:
    "border-severity-medium/30 bg-severity-medium/10 text-severity-medium-text",
  low: "border-border bg-muted text-muted-foreground",
};

export function SeverityBadge({ severity }: { severity: FindingSeverity }) {
  return (
    <Badge
      variant="outline"
      className={cn("rounded-full font-medium", severityTones[severity])}
    >
      {findingSeverityLabels[severity]}
    </Badge>
  );
}

export function RiskBadge({ score }: { score: number }) {
  const tone =
    score >= 70
      ? "border-destructive/30 bg-destructive/10 text-destructive-text"
      : score >= 40
        ? "border-warning/30 bg-warning/10 text-warning-text"
        : "border-success/30 bg-success/10 text-success-text";

  return (
    <Badge variant="outline" className={cn("rounded-full tabular-nums", tone)}>
      {score}
    </Badge>
  );
}

const frameworkStatusTones: Record<FrameworkStatus, string> = {
  certified: "border-success/30 bg-success/10 text-success-text",
  "in-audit": "border-info/30 bg-info/10 text-info-text",
  remediation: "border-destructive/30 bg-destructive/10 text-destructive-text",
  monitoring: "border-border bg-muted text-muted-foreground",
  "gap-analysis": "border-warning/30 bg-warning/10 text-warning-text",
};

const frameworkStatusDots: Record<FrameworkStatus, string> = {
  certified: "bg-success",
  "in-audit": "bg-info",
  remediation: "bg-destructive",
  monitoring: "bg-muted-foreground/50",
  "gap-analysis": "bg-warning",
};

export function FrameworkStatusBadge({ status }: { status: FrameworkStatus }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5 rounded-full font-medium",
        frameworkStatusTones[status],
      )}
    >
      <span
        className={cn("size-1.5 rounded-full", frameworkStatusDots[status])}
      />
      {frameworkStatusLabels[status]}
    </Badge>
  );
}

/** Compact framework chips used inside dense table rows. */
export function FrameworkChips({
  frameworks,
  max = 3,
}: {
  frameworks: FrameworkId[];
  max?: number;
}) {
  const visible = frameworks.slice(0, max);
  const overflow = frameworks.slice(max);

  return (
    <div className="flex flex-wrap items-center gap-1">
      {visible.map((id) => {
        const framework = frameworkById.get(id);
        if (!framework) return null;

        return (
          <span
            key={id}
            className="border-border/70 bg-background inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-xs font-medium whitespace-nowrap"
          >
            <span
              className="size-1.5 rounded-full"
              style={{ backgroundColor: frameworkAccent[id] }}
            />
            {framework.shortName}
          </span>
        );
      })}
      {overflow.length > 0 ? (
        <TooltipProvider>
          <Tooltip delayDuration={200}>
            <TooltipTrigger asChild>
              <span className="bg-muted text-muted-foreground rounded-md px-1.5 py-0.5 text-xs font-medium">
                +{overflow.length}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              {overflow
                .map((id) => frameworkById.get(id)?.shortName ?? id)
                .join(", ")}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   People                                   */
/* -------------------------------------------------------------------------- */

export function OwnerCell({ userId }: { userId: string }) {
  const user = getUser(userId);

  if (!user) {
    return <span className="text-muted-foreground text-sm">Unassigned</span>;
  }

  return (
    <div className="flex min-w-0 items-center gap-2">
      <Avatar className="size-7">
        <AvatarImage src={user.avatar} alt={user.name} />
        <AvatarFallback className="text-xs">
          {getInitials(user.name)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{user.name}</p>
        <p className="text-muted-foreground truncate text-xs">{user.title}</p>
      </div>
    </div>
  );
}

export function AvatarStack({
  userIds,
  max = 4,
  className,
}: {
  userIds: string[];
  max?: number;
  className?: string;
}) {
  const visible = userIds.slice(0, max);
  const overflow = userIds.length - visible.length;

  return (
    <div className={cn("flex -space-x-2", className)}>
      {visible.map((id) => {
        const user = getUser(id);
        if (!user) return null;

        return (
          <Avatar key={id} className="border-background size-7 border-2">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="text-xs">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
        );
      })}
      {overflow > 0 ? (
        <span className="border-background bg-muted text-muted-foreground grid size-7 place-items-center rounded-full border-2 text-xs font-medium">
          +{overflow}
        </span>
      ) : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  Progress                                  */
/* -------------------------------------------------------------------------- */

export function toneForPercent(percent: number) {
  if (percent >= 90) return "bg-success";
  if (percent >= 70) return "bg-warning";
  return "bg-destructive";
}

export function percentTextClass(percent: number) {
  if (percent >= 90) return "text-success-text";
  if (percent >= 70) return "text-warning-text";
  return "text-destructive-text";
}

export function ProgressTrack({
  percent,
  className,
  barClassName,
}: {
  percent: number;
  className?: string;
  barClassName?: string;
}) {
  return (
    <div
      className={cn("bg-muted h-1.5 overflow-hidden rounded-full", className)}
    >
      <div
        className={cn(
          "h-full rounded-full transition-[width]",
          barClassName ?? toneForPercent(percent),
        )}
        style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
      />
    </div>
  );
}

/** Renders a live coverage probe as "27/31 · 87%" plus a bar. */
export function CoverageMeter({
  probe,
  showLabel = true,
}: {
  probe: CoverageProbe;
  showLabel?: boolean;
}) {
  const percent = coveragePercent(probe);

  return (
    <div className="min-w-0 space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-medium tabular-nums">
          {probe.covered}/{probe.total}
        </span>
        <span
          className={cn(
            "text-xs font-medium tabular-nums",
            percentTextClass(percent),
          )}
        >
          {percent}%
        </span>
      </div>
      <ProgressTrack percent={percent} />
      {showLabel ? (
        <p className="text-muted-foreground truncate text-xs">{probe.label}</p>
      ) : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                Empty state                                 */
/* -------------------------------------------------------------------------- */

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="bg-card rounded-lg border border-dashed p-10 text-center">
      <div className="mx-auto flex max-w-sm flex-col items-center gap-3">
        <div className="bg-muted flex size-10 items-center justify-center rounded-full">
          <Icon className="size-4" />
        </div>
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-muted-foreground mt-1 text-sm">{description}</p>
        </div>
        {action}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                             Section scaffolding                            */
/* -------------------------------------------------------------------------- */

export { Panel, PanelHeading } from "@/components/soc/panel";

export function controlSearchIndex(control: ComplianceControl) {
  const owner = getUser(control.ownerId);

  return [
    control.code,
    control.title,
    control.description,
    owner?.name ?? "",
    ...control.frameworks.map((id) => frameworkById.get(id)?.shortName ?? id),
  ]
    .join(" ")
    .toLowerCase();
}

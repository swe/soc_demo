"use client";

import {
  Archive,
  BookOpen,
  CheckCircle2,
  CircleDashed,
  Clock3,
  FileWarning,
  type LucideIcon,
  PencilLine,
} from "lucide-react";
import Link from "next/link";

import { StatsStrip } from "@/components/soc/stats-strip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import {
  getKbInitials,
  getKbUser,
  type KbDocCategory,
  kbDocCategoryColors,
  kbDocCategoryLabels,
  type KbDocStatus,
  kbDocStatusLabels,
  type KbProcedureSeverity,
  kbProcedureSeverityLabels,
  type KbProcedureStatus,
  kbProcedureStatusLabels,
  type KbRelatedLink,
  type KbReportStatus,
  kbReportStatusLabels,
  type KbStat,
  type KbTrainingLevel,
  kbTrainingLevelLabels,
  type KbTrainingStatus,
  kbTrainingStatusLabels,
} from "./knowledge-base-data";

export const percentFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
});

/* -------------------------------------------------------------------------- */
/*                                 Stats strip                                */
/* -------------------------------------------------------------------------- */

export function KbStatsStrip({ stats }: { stats: KbStat[] }) {
  return (
    <StatsStrip
      stats={stats.map((stat) => ({
        key: stat.title,
        title: stat.title,
        value: stat.value,
        context: stat.context,
        delta: stat.delta,
        preferLower: stat.preferLower,
      }))}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*                                   Badges                                   */
/* -------------------------------------------------------------------------- */

const docStatusDetails: Record<
  KbDocStatus,
  { className: string; icon: LucideIcon }
> = {
  published: {
    className: "text-success-text",
    icon: CheckCircle2,
  },
  draft: {
    className: "text-info-text",
    icon: PencilLine,
  },
  review: {
    className: "text-warning-text",
    icon: CircleDashed,
  },
  archived: {
    className: "text-muted-foreground",
    icon: Archive,
  },
};

export function DocStatusBadge({ status }: { status: KbDocStatus }) {
  const detail = docStatusDetails[status];
  const Icon = detail.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-medium",
        detail.className,
      )}
    >
      <Icon className="size-3.5" />
      {kbDocStatusLabels[status]}
    </span>
  );
}

export function DocCategoryBadge({ category }: { category: KbDocCategory }) {
  return (
    <Badge variant="outline" className="gap-1.5 rounded-full font-medium">
      <span
        className="size-1.5 rounded-full"
        style={{ backgroundColor: kbDocCategoryColors[category] }}
      />
      {kbDocCategoryLabels[category]}
    </Badge>
  );
}

const severityTones: Record<KbProcedureSeverity, string> = {
  critical:
    "border-severity-critical/30 bg-severity-critical/10 text-severity-critical-text",
  high: "border-severity-high/30 bg-severity-high/10 text-severity-high-text",
  medium:
    "border-severity-medium/30 bg-severity-medium/10 text-severity-medium-text",
  low: "border-border bg-muted text-muted-foreground",
};

export function ProcedureSeverityBadge({
  severity,
}: {
  severity: KbProcedureSeverity;
}) {
  return (
    <Badge
      variant="outline"
      className={cn("rounded-full font-medium", severityTones[severity])}
    >
      {kbProcedureSeverityLabels[severity]}
    </Badge>
  );
}

const procedureStatusTones: Record<KbProcedureStatus, string> = {
  approved: "border-success/30 bg-success/10 text-success-text",
  draft: "border-info/30 bg-info/10 text-info-text",
  "in-review": "border-warning/30 bg-warning/10 text-warning-text",
  deprecated: "border-border bg-muted text-muted-foreground",
};

export function ProcedureStatusBadge({
  status,
}: {
  status: KbProcedureStatus;
}) {
  return (
    <Badge
      variant="outline"
      className={cn("rounded-full font-medium", procedureStatusTones[status])}
    >
      {kbProcedureStatusLabels[status]}
    </Badge>
  );
}

const reportStatusTones: Record<KbReportStatus, string> = {
  ready: "border-success/30 bg-success/10 text-success-text",
  generating: "border-info/30 bg-info/10 text-info-text",
  scheduled:
    "border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-400",
  archived: "border-border bg-muted text-muted-foreground",
};

export function ReportStatusBadge({ status }: { status: KbReportStatus }) {
  return (
    <Badge
      variant="outline"
      className={cn("rounded-full font-medium", reportStatusTones[status])}
    >
      {kbReportStatusLabels[status]}
    </Badge>
  );
}

const trainingStatusTones: Record<KbTrainingStatus, string> = {
  open: "border-info/30 bg-info/10 text-info-text",
  "in-progress": "border-warning/30 bg-warning/10 text-warning-text",
  completed: "border-success/30 bg-success/10 text-success-text",
  overdue: "border-destructive/30 bg-destructive/10 text-destructive-text",
};

export function TrainingStatusBadge({ status }: { status: KbTrainingStatus }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1 rounded-full font-medium",
        trainingStatusTones[status],
      )}
    >
      {status === "overdue" ? <FileWarning className="size-3" /> : null}
      {status === "in-progress" ? <Clock3 className="size-3" /> : null}
      {kbTrainingStatusLabels[status]}
    </Badge>
  );
}

export function TrainingLevelBadge({ level }: { level: KbTrainingLevel }) {
  return (
    <Badge variant="secondary" className="rounded-full font-medium">
      {kbTrainingLevelLabels[level]}
    </Badge>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   People                                   */
/* -------------------------------------------------------------------------- */

export function OwnerCell({ userId, href }: { userId: string; href?: string }) {
  const user = getKbUser(userId);

  if (!user) {
    return <span className="text-muted-foreground text-sm">Unassigned</span>;
  }

  const content = (
    <div className="flex min-w-0 items-center gap-2">
      <Avatar className="size-7">
        <AvatarImage src={user.avatar} alt={user.name} />
        <AvatarFallback className="text-xs">
          {getKbInitials(user.name)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{user.name}</p>
        <p className="text-muted-foreground truncate text-xs">{user.title}</p>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="hover:bg-muted/50 -mx-1 block min-w-0 cursor-pointer rounded-md px-1 py-0.5 transition-colors"
        onClick={(event) => event.stopPropagation()}
      >
        {content}
      </Link>
    );
  }

  return content;
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

/* -------------------------------------------------------------------------- */
/*                              Related links                                 */
/* -------------------------------------------------------------------------- */

export function RelatedLinks({
  links,
  className,
}: {
  links: KbRelatedLink[];
  className?: string;
}) {
  if (links.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {links.map((link) => (
        <Link
          key={`${link.href}-${link.label}`}
          href={link.href}
          onClick={(event) => event.stopPropagation()}
          className="border-border/70 bg-background text-muted-foreground hover:text-foreground inline-flex cursor-pointer items-center whitespace-nowrap rounded-md border px-1.5 py-0.5 text-xs font-medium transition-colors"
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                Empty state                                 */
/* -------------------------------------------------------------------------- */

export function EmptyState({
  icon: Icon = BookOpen,
  title,
  description,
  action,
}: {
  icon?: LucideIcon;
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

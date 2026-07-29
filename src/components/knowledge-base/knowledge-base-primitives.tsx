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

export const mutedControlClassName =
  "border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground";

export const tabTriggerClassName =
  "data-[state=active]:border-foreground shrink-0 gap-2 rounded-none border-b-2 border-transparent px-0 pb-3 text-sm shadow-none data-[state=active]:bg-transparent data-[state=active]:shadow-none sm:pb-4";

export const percentFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
});

/* -------------------------------------------------------------------------- */
/*                                 Stats strip                                */
/* -------------------------------------------------------------------------- */

export function KbStatsStrip({ stats }: { stats: KbStat[] }) {
  return (
    <section className="border-border/70 border-b border-dashed pb-4">
      <div
        className={cn(
          "grid gap-3 sm:grid-cols-2 sm:gap-4",
          stats.length >= 4
            ? "lg:grid-cols-4 xl:gap-0"
            : "lg:grid-cols-3 xl:gap-0",
        )}
      >
        {stats.map((stat, index) => {
          const isIncrease = stat.delta >= 0;
          const isHealthy = stat.preferLower ? !isIncrease : isIncrease;
          const deltaLabel = `${isIncrease ? "+" : ""}${percentFormatter.format(
            stat.delta,
          )}%`;

          return (
            <section
              key={stat.title}
              className={cn(
                "space-y-2 py-2 sm:py-1",
                index > 0 && "xl:border-border/70 xl:border-l",
                index === 0 && "xl:pr-6",
                index > 0 && index < stats.length - 1 && "xl:px-6",
                index === stats.length - 1 && "xl:pl-6",
              )}
            >
              <p className="text-muted-foreground text-sm">{stat.title}</p>
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <p className="text-3xl leading-none font-semibold tracking-tight tabular-nums">
                    {stat.value}
                  </p>
                  <span
                    className={cn(
                      "text-sm",
                      isHealthy ? "text-emerald-600" : "text-rose-600",
                    )}
                  >
                    {deltaLabel}
                  </span>
                </div>
                <span className="text-muted-foreground block text-sm">
                  {stat.context}
                </span>
              </div>
            </section>
          );
        })}
      </div>
    </section>
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
    className: "text-emerald-600 dark:text-emerald-400",
    icon: CheckCircle2,
  },
  draft: {
    className: "text-blue-600 dark:text-blue-400",
    icon: PencilLine,
  },
  review: {
    className: "text-amber-600 dark:text-amber-400",
    icon: CircleDashed,
  },
  archived: {
    className: "text-zinc-500",
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
    "border-destructive/30 bg-destructive/10 text-destructive dark:text-red-400",
  high: "border-orange-500/30 bg-orange-500/10 text-orange-700 dark:text-orange-400",
  medium:
    "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
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
  approved:
    "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  draft: "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400",
  "in-review":
    "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
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
      className={cn(
        "rounded-full font-medium",
        procedureStatusTones[status],
      )}
    >
      {kbProcedureStatusLabels[status]}
    </Badge>
  );
}

const reportStatusTones: Record<KbReportStatus, string> = {
  ready:
    "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  generating:
    "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400",
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
  open: "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400",
  "in-progress":
    "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  completed:
    "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  overdue:
    "border-destructive/30 bg-destructive/10 text-destructive dark:text-red-400",
};

export function TrainingStatusBadge({
  status,
}: {
  status: KbTrainingStatus;
}) {
  return (
    <Badge
      variant="outline"
      className={cn("gap-1 rounded-full font-medium", trainingStatusTones[status])}
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

export function OwnerCell({
  userId,
  href,
}: {
  userId: string;
  href?: string;
}) {
  const user = getKbUser(userId);

  if (!user) {
    return <span className="text-muted-foreground text-sm">Unassigned</span>;
  }

  const content = (
    <div className="flex min-w-0 items-center gap-2">
      <Avatar className="size-7">
        <AvatarImage src={user.avatar} alt={user.name} />
        <AvatarFallback className="text-[11px]">
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
        className="hover:bg-muted/50 -mx-1 block cursor-pointer rounded-md px-1 py-0.5 transition-colors"
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
  if (percent >= 90) return "bg-emerald-500";
  if (percent >= 70) return "bg-amber-500";
  return "bg-destructive";
}

export function percentTextClass(percent: number) {
  if (percent >= 90) return "text-emerald-600 dark:text-emerald-400";
  if (percent >= 70) return "text-amber-600 dark:text-amber-400";
  return "text-destructive dark:text-red-400";
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
          className="border-border/70 bg-background text-muted-foreground hover:text-foreground inline-flex cursor-pointer items-center whitespace-nowrap rounded-md border px-1.5 py-0.5 text-[11px] font-medium transition-colors"
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

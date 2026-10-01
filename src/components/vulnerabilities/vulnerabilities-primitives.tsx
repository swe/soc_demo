"use client";

import { Panel, PanelHeading } from "@/components/soc/panel";
import { StatsStrip } from "@/components/soc/stats-strip";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import {
  formatCompact,
  type RecommendationStatus,
  recommendationStatusLabels,
  type RemediationStatus,
  remediationStatusLabels,
  type VulnSeverity,
  vulnSeverityLabels,
  type VulnStat,
  type VulnThreatType,
  type VulnUpdateStatus,
  vulnUpdateStatusLabels,
} from "./vulnerabilities-data";

export { Panel, PanelHeading };

export const mutedControlClassName =
  "border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground";

export const tabTriggerClassName =
  "data-[state=active]:border-foreground shrink-0 gap-2 rounded-none border-b-2 border-transparent px-0 pb-3 text-sm shadow-none data-[state=active]:bg-transparent data-[state=active]:shadow-none sm:pb-4";

export const percentFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
});

const severityTones: Record<VulnSeverity, string> = {
  critical:
    "border-destructive/30 bg-destructive/10 text-destructive dark:text-red-400",
  high: "border-orange-500/30 bg-orange-500/10 text-orange-700 dark:text-orange-400",
  medium:
    "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  low: "border-border bg-muted text-muted-foreground",
};

export function SeverityBadge({ severity }: { severity: VulnSeverity }) {
  return (
    <Badge
      variant="outline"
      className={cn("rounded-full font-medium", severityTones[severity])}
    >
      {vulnSeverityLabels[severity]}
    </Badge>
  );
}

/** One badge per threat type — no cryptic "+N" overflow. */
export function ThreatBadge({ threats }: { threats: VulnThreatType[] }) {
  if (threats.length === 0) {
    return <span className="text-muted-foreground text-xs">—</span>;
  }

  const labels: Record<VulnThreatType, string> = {
    "exploit-public": "Public exploit",
    "exploit-verified": "Verified exploit",
    "exploit-kit": "Exploit kit",
    "active-threat": "Active threat",
    ransomware: "Ransomware",
  };

  return (
    <div className="flex flex-wrap gap-1">
      {threats.map((t) => (
        <Badge
          key={t}
          variant="outline"
          className="border-destructive/30 bg-destructive/10 text-destructive rounded-full font-medium dark:text-red-400"
        >
          {labels[t]}
        </Badge>
      ))}
    </div>
  );
}

/** Tag chips — show every tag, no "+N". */
export function TagList({ tags }: { tags: string[] }) {
  if (tags.length === 0) {
    return <span className="text-muted-foreground text-xs">—</span>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {tags.map((tag) => (
        <Badge
          key={tag}
          variant="outline"
          className="rounded-full text-xs font-medium"
        >
          {tag}
        </Badge>
      ))}
    </div>
  );
}

/** Numeric SOC priority badge — same language as alerts RiskScoreBadge. */
export function PriorityBadge({ score }: { score: number }) {
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

export function ExposedDevicesBar({
  exposed,
  total,
  className,
}: {
  exposed: number;
  total: number;
  className?: string;
}) {
  const pct = total > 0 ? Math.min(100, (exposed / total) * 100) : 0;
  return (
    <div className={cn("flex min-w-[110px] flex-col gap-1", className)}>
      <span className="text-xs font-medium tabular-nums">
        {formatCompact(exposed)} / {formatCompact(total)}
      </span>
      <div className="bg-muted h-1 overflow-hidden rounded-full">
        <div
          className="bg-foreground/70 h-full rounded-full"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function UpdateStatusBreakdown({
  available,
  scheduled,
  notAvailable,
  wontFix,
  className,
}: {
  available: number;
  scheduled: number;
  notAvailable: number;
  wontFix: number;
  className?: string;
}) {
  const rows = [
    { label: "Available", value: available },
    { label: "Scheduled", value: scheduled },
    { label: "Not available", value: notAvailable },
    { label: "Won't fix", value: wontFix },
  ];
  const total = available + scheduled + notAvailable + wontFix || 1;

  return (
    <div className={cn("space-y-2.5", className)}>
      {rows.map((row) => (
        <div key={row.label} className="space-y-1">
          <div className="flex items-center justify-between gap-2 text-sm">
            <span className="text-muted-foreground">{row.label}</span>
            <span className="font-medium tabular-nums">
              {formatCompact(row.value)}
            </span>
          </div>
          <div className="bg-muted h-1 overflow-hidden rounded-full">
            <div
              className="bg-foreground/70 h-full rounded-full"
              style={{ width: `${(row.value / total) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function VulnStatsStrip({
  stats,
}: {
  stats: VulnStat[];
  /** @deprecated Columns are derived from `stats.length`. */
  columns?: 4 | 5 | 6;
}) {
  return <StatsStrip stats={stats} />;
}

export function RecommendationStatusBadge({
  status,
}: {
  status: RecommendationStatus;
}) {
  const tones: Record<RecommendationStatus, string> = {
    active: "text-blue-600 dark:text-blue-400",
    "in-progress": "text-amber-600 dark:text-amber-400",
    completed: "text-emerald-600 dark:text-emerald-400",
    exception: "text-zinc-500",
    deferred: "text-violet-600 dark:text-violet-400",
  };
  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1 rounded-full font-medium border-border/70 bg-background",
        tones[status],
      )}
    >
      {recommendationStatusLabels[status]}
    </Badge>
  );
}

export function RemediationStatusBadge({
  status,
}: {
  status: RemediationStatus;
}) {
  const tones: Record<RemediationStatus, string> = {
    pending: "text-blue-600 dark:text-blue-400",
    in_progress: "text-amber-600 dark:text-amber-400",
    completed: "text-emerald-600 dark:text-emerald-400",
    failed: "text-destructive dark:text-red-400",
    exception: "text-zinc-500",
  };
  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1 rounded-full font-medium border-border/70 bg-background",
        tones[status],
      )}
    >
      {remediationStatusLabels[status]}
    </Badge>
  );
}

export function UpdateStatusBadge({ status }: { status: VulnUpdateStatus }) {
  return (
    <Badge variant="outline" className="rounded-full font-medium">
      {vulnUpdateStatusLabels[status]}
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
      <div className="min-w-0 text-right font-medium">{children}</div>
    </div>
  );
}

export function SegmentedControl<T extends string>({
  value,
  options,
  labels,
  onChange,
}: {
  value: T;
  options: readonly T[];
  labels: Record<T, string>;
  onChange: (value: T) => void;
}) {
  return (
    <div className="bg-muted/60 inline-flex rounded-md border p-0.5">
      {options.map((option) => {
        const active = value === option;
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={cn(
              "rounded-sm px-2.5 py-1 text-xs font-medium transition-colors",
              active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {labels[option]}
          </button>
        );
      })}
    </div>
  );
}

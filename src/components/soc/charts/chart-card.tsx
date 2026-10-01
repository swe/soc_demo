"use client";

import { BarChart3 } from "lucide-react";

import { Panel, PanelHeading } from "@/components/soc/panel";
import { EmptyState, ErrorState } from "@/components/soc/state";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export type ChartCardStatus = "ready" | "loading" | "empty" | "error";

const bodyHeight = {
  sm: "h-40",
  md: "h-56",
  lg: "h-72",
} as const;

/** Headline figure shown opposite a chart title (e.g. the latest day's total). */
export function ChartMetric({
  value,
  label,
}: {
  value: React.ReactNode;
  label: React.ReactNode;
}) {
  return (
    <div className="text-right">
      <p className="text-title-2 tabular-nums">{value}</p>
      <p className="text-muted-foreground text-xs">{label}</p>
    </div>
  );
}

/**
 * Panel with a fixed-height chart body so every state (loading, empty, error)
 * occupies the same space and the grid never jumps.
 */
export function ChartCard({
  title,
  description,
  metric,
  action,
  status = "ready",
  size = "md",
  emptyTitle = "No data for this range",
  emptyDescription,
  onRetry,
  footer,
  className,
  bodyClassName,
  children,
}: {
  title: string;
  description?: React.ReactNode;
  metric?: { value: React.ReactNode; label: React.ReactNode };
  action?: React.ReactNode;
  status?: ChartCardStatus;
  size?: keyof typeof bodyHeight;
  emptyTitle?: string;
  emptyDescription?: React.ReactNode;
  onRetry?: () => void;
  footer?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}) {
  const heading =
    metric || action ? (
      <>
        {action}
        {metric ? <ChartMetric value={metric.value} label={metric.label} /> : null}
      </>
    ) : undefined;

  return (
    <Panel className={cn("flex flex-col", className)}>
      <PanelHeading title={title} description={description} action={heading} />
      <div
        aria-busy={status === "loading" || undefined}
        className={cn("relative min-w-0", bodyHeight[size], bodyClassName)}
      >
        {status === "loading" ? (
          <div role="status" className="flex h-full items-end gap-2 pt-6">
            <span className="sr-only">Loading {title}</span>
            {[45, 70, 55, 85, 60, 75, 50].map((height, index) => (
              <Skeleton
                key={index}
                className="flex-1 rounded-sm"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
        ) : status === "empty" ? (
          <EmptyState
            icon={BarChart3}
            title={emptyTitle}
            description={emptyDescription}
            className="h-full gap-3 p-2 md:p-2"
          />
        ) : status === "error" ? (
          <ErrorState onRetry={onRetry} className="h-full gap-3 p-2 md:p-2" />
        ) : (
          children
        )}
      </div>
      {footer ? <div className="border-separator mt-4 border-t pt-3">{footer}</div> : null}
    </Panel>
  );
}

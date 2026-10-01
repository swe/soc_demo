"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import {
  type AssetCriticality,
  assetCriticalityLabels,
  type AssetEnvironment,
  assetEnvironmentLabels,
} from "./attack-surface-data";

export const mutedControlClassName =
  "border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground";

const criticalityTones: Record<AssetCriticality, string> = {
  critical:
    "border-destructive/30 bg-destructive/10 text-destructive dark:text-red-400",
  high: "border-orange-500/30 bg-orange-500/10 text-orange-700 dark:text-orange-400",
  medium:
    "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  low: "border-border bg-muted text-muted-foreground",
};

export function CriticalityBadge({
  criticality,
}: {
  criticality: AssetCriticality;
}) {
  return (
    <Badge
      variant="outline"
      className={cn("rounded-full font-medium", criticalityTones[criticality])}
    >
      {assetCriticalityLabels[criticality]}
    </Badge>
  );
}

export function EnvironmentBadge({
  environment,
}: {
  environment: AssetEnvironment;
}) {
  return (
    <Badge variant="outline" className="rounded-full font-normal">
      {assetEnvironmentLabels[environment]}
    </Badge>
  );
}

export function ExposureScoreBadge({ score }: { score: number }) {
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

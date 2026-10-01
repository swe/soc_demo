"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import {
  type AssetCriticality,
  assetCriticalityLabels,
  type AssetEnvironment,
  assetEnvironmentLabels,
} from "./attack-surface-data";

const criticalityTones: Record<AssetCriticality, string> = {
  critical: "border-destructive/30 bg-destructive/10 text-destructive-text",
  high: "border-severity-high/30 bg-severity-high/10 text-severity-high-text",
  medium: "border-warning/30 bg-warning/10 text-warning-text",
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
      ? "border-destructive/30 bg-destructive/10 text-destructive-text"
      : score >= 55
        ? "border-warning/30 bg-warning/10 text-warning-text"
        : "border-success/30 bg-success/10 text-success-text";

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

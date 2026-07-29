"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import {
  getIngestHealthSummary,
  sourceFamilyLabels,
  type SourceHealth,
  type TelemetrySource,
  telemetrySources,
} from "@/lib/source-registry";
import { cn } from "@/lib/utils";

function healthTone(health: SourceHealth) {
  switch (health) {
    case "healthy":
      return "bg-emerald-500";
    case "degraded":
      return "bg-amber-500";
    case "failed":
      return "bg-red-500";
    case "paused":
      return "bg-muted-foreground/40";
  }
}

function formatEps(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

function Spark({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);
  return (
    <div className="flex h-5 items-end gap-px">
      {values.map((v, i) => (
        <span
          key={i}
          className="bg-foreground/25 w-1 rounded-sm"
          style={{ height: `${Math.max(12, (v / max) * 100)}%` }}
        />
      ))}
    </div>
  );
}

function SourceChip({
  source,
  ageBump,
}: {
  source: TelemetrySource;
  ageBump: number;
}) {
  const age = source.lastEventMinutesAgo + ageBump;
  const ageLabel =
    source.health === "paused"
      ? "paused"
      : age <= 0
        ? "live"
        : age < 60
          ? `${age}m ago`
          : `${Math.floor(age / 60)}h ago`;

  return (
    <Link
      href={`/administration/integrations?source=${source.id}`}
      className={cn(
        "border-border/70 bg-background hover:bg-muted/50 flex min-w-[148px] flex-col gap-1.5 rounded-lg border px-3 py-2 transition-colors",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span
            className={cn("size-1.5 shrink-0 rounded-full", healthTone(source.health))}
          />
          <span className="text-xs font-medium">{source.shortName}</span>
        </div>
        <span className="text-muted-foreground text-[10px] tabular-nums">
          {ageLabel}
        </span>
      </div>
      <div className="flex items-end justify-between gap-2">
        <div>
          <p className="text-[10px] text-muted-foreground">
            {sourceFamilyLabels[source.family]}
          </p>
          <p className="text-xs font-medium tabular-nums">
            {formatEps(source.eps)} EPS
          </p>
        </div>
        <Spark values={source.volumeSpark} />
      </div>
    </Link>
  );
}

export function IngestHealthStrip({
  className,
  compact,
}: {
  className?: string;
  compact?: boolean;
}) {
  const summary = getIngestHealthSummary();
  const [ageBump, setAgeBump] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setAgeBump((n) => n + 1), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const crossSource = telemetrySources.filter(
    (s) => s.family === "siem" || s.family === "edr" || s.family === "idp",
  ).length;

  return (
    <section
      className={cn(
        "bg-card overflow-hidden rounded-xl border",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b px-3 py-2.5 sm:px-4">
        <div className="min-w-0">
          <h3 className="text-sm font-medium leading-tight">
            Unified ingest
          </h3>
          {!compact ? (
            <p className="text-muted-foreground mt-0.5 text-xs">
              Splunk, Sentinel, Defender, and more — normalized into one queue
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="secondary" className="tabular-nums">
            {formatEps(summary.totalEps)} EPS
          </Badge>
          <Badge variant="outline" className="tabular-nums">
            {summary.healthy}/{summary.connected} healthy
          </Badge>
          <Badge variant="outline" className="tabular-nums">
            {crossSource} core sources
          </Badge>
          {summary.degraded > 0 ? (
            <Badge
              variant="outline"
              className="border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-200"
            >
              {summary.degraded} degraded
            </Badge>
          ) : null}
        </div>
      </div>
      <div className="flex gap-2 overflow-x-auto px-3 py-3 sm:px-4">
        {telemetrySources.map((source) => (
          <SourceChip key={source.id} source={source} ageBump={ageBump} />
        ))}
      </div>
    </section>
  );
}

/** Cross-source attention cases for Overview. */
export const crossSourceAttention = [
  {
    id: "xsrc-1",
    title: "Impossible travel + endpoint ransomware precursor",
    meta: "Okta · Defender · Sentinel",
    subtitle: "Correlated across 3 sources · P1 candidate",
    href: "/incidents",
    tone: "critical" as const,
  },
  {
    id: "xsrc-2",
    title: "Privileged role assumption from new ASN",
    meta: "AWS · Splunk · Chronicle",
    subtitle: "CloudTrail + SIEM correlation · investigating",
    href: "/investigate?q=cloud.role_assumption",
    tone: "high" as const,
  },
  {
    id: "xsrc-3",
    title: "Beaconing host matched dark-web IOC",
    meta: "PAN · Falcon · TI feeds",
    subtitle: "Network + EDR + intel · 2 sources confirmed",
    href: "/alerts/list",
    tone: "high" as const,
  },
];

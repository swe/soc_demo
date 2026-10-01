"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Panel, PanelHeading } from "@/components/soc/panel";
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
      return "bg-success";
    case "degraded":
      return "bg-warning";
    case "failed":
      return "bg-destructive";
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
          className="bg-primary/35 w-1 rounded-sm"
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
      className="bg-muted/50 pressable hover:bg-accent flex min-w-40 shrink-0 snap-start flex-col gap-2 rounded-lg px-3 py-2.5"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <span
            className={cn("size-2 shrink-0 rounded-full", healthTone(source.health))}
          />
          <span className="truncate text-sm font-medium">{source.shortName}</span>
        </div>
        <span className="text-muted-foreground text-xs tabular-nums">
          {ageLabel}
        </span>
      </div>
      <div className="flex items-end justify-between gap-2">
        <div>
          <p className="text-xs text-muted-foreground">
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
    <Panel className={className}>
      <PanelHeading
        title="Unified ingest"
        description={
          compact
            ? undefined
            : "Splunk, Sentinel, Defender, and more — normalized into one queue"
        }
        action={
          <>
            <Badge variant="muted">{formatEps(summary.totalEps)} EPS</Badge>
            <Badge variant="success">
              {summary.healthy}/{summary.connected} healthy
            </Badge>
            <Badge variant="muted">{crossSource} core sources</Badge>
            {summary.degraded > 0 ? (
              <Badge variant="warning">{summary.degraded} degraded</Badge>
            ) : null}
          </>
        }
      />
      <div className="relative -mx-4 flex snap-x scroll-px-4 gap-2 overflow-x-auto px-4 pb-1 sm:-mx-5 sm:scroll-px-5 sm:px-5">
        {telemetrySources.map((source) => (
          <SourceChip key={source.id} source={source} ageBump={ageBump} />
        ))}
      </div>
    </Panel>
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

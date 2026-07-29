"use client";

import { ArrowUpRight, Ban, Siren } from "lucide-react";
import Link from "next/link";
import { useSyncExternalStore } from "react";

import { injectUebaAlert } from "@/components/alerts/alerts-session";
import type { AssetIdentity } from "@/components/assets/identities-data";
import {
  getIdentityBehavior,
  getSuppressedAnomalyIds,
  getVisibleAnomalies,
  subscribeUebaSuppress,
  suppressUebaAnomaly,
  type UebaAnomaly,
  uebaAnomalyLabels,
} from "@/components/assets/ueba-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

function severityTone(severity: UebaAnomaly["severity"]) {
  switch (severity) {
    case "critical":
      return "border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-300";
    case "high":
      return "border-orange-500/40 bg-orange-500/10 text-orange-700 dark:text-orange-300";
    case "medium":
      return "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300";
    default:
      return "border-blue-500/40 bg-blue-500/10 text-blue-700 dark:text-blue-300";
  }
}

function RiskSparkline({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);
  return (
    <div className="flex h-8 items-end gap-px" aria-hidden="true">
      {values.map((v, i) => (
        <span
          key={i}
          className={cn(
            "w-1.5 rounded-sm",
            i >= values.length - 2 ? "bg-destructive/70" : "bg-foreground/25",
          )}
          style={{ height: `${Math.max(14, (v / max) * 100)}%` }}
        />
      ))}
    </div>
  );
}

function getSuppressSnapshot() {
  return getSuppressedAnomalyIds().size;
}

export function IdentityBehaviorPanel({
  identity,
}: {
  identity: AssetIdentity;
}) {
  useSyncExternalStore(subscribeUebaSuppress, getSuppressSnapshot, () => 0);

  const behavior = getIdentityBehavior(identity.id);

  if (!behavior) {
    return (
      <p className="text-muted-foreground text-sm">
        No UEBA profile available for this identity.
      </p>
    );
  }

  const anomalies = getVisibleAnomalies(behavior);

  const promote = (anomaly: UebaAnomaly) => {
    const alert = injectUebaAlert(identity, anomaly);
    toast({
      title: "Anomaly promoted to alert",
      description: (
        <span className="inline-flex flex-col gap-1">
          <span>{alert.title}</span>
          <Link
            href={`/alerts/${alert.id}`}
            className="text-primary inline-flex items-center gap-1 underline-offset-2 hover:underline"
          >
            Open {alert.id}
            <ArrowUpRight className="size-3" />
          </Link>
        </span>
      ),
    });
  };

  const suppress = (anomaly: UebaAnomaly) => {
    const ok = suppressUebaAnomaly(anomaly.id, identity.id);
    if (!ok) return;
    toast({
      title: "Anomaly suppressed",
      description: `${anomaly.id} hidden for this session.`,
    });
  };

  return (
    <div className="space-y-4">
      <section className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            Risk trend · 14d
          </h3>
          <span className="font-mono text-xs tabular-nums">
            now {identity.riskScore}
          </span>
        </div>
        {behavior.riskSpark.length > 0 ? (
          <RiskSparkline values={behavior.riskSpark} />
        ) : null}
        {behavior.riskTimeline.length > 0 ? (
          <ul className="space-y-1.5 pt-1">
            {behavior.riskTimeline.map((point) => (
              <li
                key={`${point.label}-${point.dayOffset}`}
                className="flex items-baseline justify-between gap-2 text-xs"
              >
                <span className="text-muted-foreground">{point.label}</span>
                <span className="flex min-w-0 items-baseline gap-2">
                  {point.note ? (
                    <span className="text-muted-foreground truncate">
                      {point.note}
                    </span>
                  ) : null}
                  <span className="font-mono tabular-nums">{point.score}</span>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground text-xs">
            No risk timeline points for this identity.
          </p>
        )}
      </section>

      <section className="space-y-2 text-sm">
        <h3 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
          Baseline
        </h3>
        <div className="flex justify-between gap-3">
          <span className="text-muted-foreground">Peer group</span>
          <span className="text-right font-medium">{behavior.peerGroup}</span>
        </div>
        <p className="text-muted-foreground text-xs leading-relaxed">
          {behavior.peerBaselineLabel}
        </p>
        <div className="flex flex-col gap-1.5">
          <span className="text-muted-foreground">Typical locations</span>
          <div className="flex flex-wrap gap-1.5">
            {behavior.typicalLocations.map((loc) => (
              <Badge
                key={loc}
                variant="secondary"
                className="rounded-full font-normal"
              >
                {loc}
              </Badge>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-muted-foreground">Baseline privileges</span>
          <div className="flex flex-wrap gap-1.5">
            {behavior.baselinePrivileges.map((priv) => (
              <Badge
                key={priv}
                variant="outline"
                className="rounded-full font-normal"
              >
                {priv}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            Anomalies
          </h3>
          <Badge variant="secondary" className="tabular-nums">
            {anomalies.length}
          </Badge>
        </div>
        {anomalies.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No behavioral anomalies in the current window.
          </p>
        ) : (
          <ul className="space-y-2.5">
            {anomalies.map((anomaly) => (
              <li
                key={anomaly.id}
                className="space-y-2 rounded-lg border p-3"
              >
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge
                    variant="outline"
                    className={cn("capitalize", severityTone(anomaly.severity))}
                  >
                    {anomaly.severity}
                  </Badge>
                  <Badge variant="secondary" className="rounded-full font-normal">
                    {uebaAnomalyLabels[anomaly.kind]}
                  </Badge>
                  <span className="text-muted-foreground ml-auto text-[10px]">
                    {anomaly.detectedAtLabel}
                  </span>
                </div>
                <p className="text-sm font-medium leading-snug">
                  {anomaly.title}
                </p>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  {anomaly.summary}
                </p>
                <p className="text-muted-foreground border-border/60 rounded-md border border-dashed px-2 py-1.5 text-[11px] leading-relaxed">
                  Peer baseline · {anomaly.peerBaselineLabel}
                </p>
                <div className="flex flex-wrap items-center gap-1.5">
                  {anomaly.sourceTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="rounded-full text-[10px] font-normal"
                    >
                      {tag}
                    </Badge>
                  ))}
                  <span className="text-muted-foreground ml-auto font-mono text-[10px]">
                    +{anomaly.riskDelta} risk
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 gap-1.5 text-xs"
                    onClick={() => promote(anomaly)}
                  >
                    <Siren className="size-3.5" />
                    Promote to alert
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-muted-foreground h-7 gap-1.5 text-xs"
                    onClick={() => suppress(anomaly)}
                  >
                    <Ban className="size-3.5" />
                    Suppress
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

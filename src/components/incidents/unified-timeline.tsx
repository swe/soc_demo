"use client";

import { useMemo } from "react";

import type { SocAlert } from "@/components/alerts/alerts-data";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import type { SocIncident } from "./incidents-data";
import {
  buildUnifiedTimeline,
  shortSourceName,
  type UnifiedTimelineKind,
  unifiedTimelineKindLabels,
} from "./unified-timeline-data";

const kindTone: Record<UnifiedTimelineKind, string> = {
  alert:
    "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400",
  identity:
    "border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-400",
  device:
    "border-orange-500/30 bg-orange-500/10 text-orange-700 dark:text-orange-400",
  cloud:
    "border-cyan-500/30 bg-cyan-500/10 text-cyan-700 dark:text-cyan-400",
  playbook:
    "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  note: "border-border bg-muted text-muted-foreground",
};

function formatTimelineStamp(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function UnifiedTimeline({
  incident,
  alerts,
}: {
  incident: SocIncident;
  alerts: SocAlert[];
}) {
  const entries = useMemo(
    () => buildUnifiedTimeline(incident, alerts),
    [incident, alerts],
  );

  return (
    <section className="bg-card rounded-lg border p-4">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold tracking-tight">
            Unified timeline
          </h2>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Merged alerts, identity, device, cloud, and playbook activity for
            this case.
          </p>
        </div>
        <Badge variant="secondary" className="rounded-full font-normal">
          {entries.length} events
        </Badge>
      </div>

      {entries.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No correlated events for this case yet.
        </p>
      ) : (
        <ol className="relative space-y-0">
          {entries.map((entry, index) => (
            <li
              key={entry.id}
              className="relative flex gap-3 pb-4 last:pb-0"
            >
              <div className="flex w-[7.5rem] shrink-0 flex-col pt-0.5 sm:w-32">
                <span className="text-muted-foreground font-mono text-xs tabular-nums">
                  {formatTimelineStamp(entry.at)}
                </span>
              </div>
              <div className="relative flex w-4 shrink-0 justify-center">
                <div
                  className={cn(
                    "bg-border absolute top-2 bottom-0 w-px",
                    index === entries.length - 1 && "hidden",
                  )}
                />
                <div className="bg-foreground/70 relative z-10 mt-1.5 size-2 rounded-full" />
              </div>
              <div className="min-w-0 flex-1 space-y-1.5 pb-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge
                    variant="outline"
                    className="rounded-md px-1.5 py-0 text-xs font-semibold"
                  >
                    {shortSourceName(entry.sourceName)}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={cn(
                      "rounded-full px-1.5 py-0 text-xs font-medium",
                      kindTone[entry.kind],
                    )}
                  >
                    {unifiedTimelineKindLabels[entry.kind]}
                  </Badge>
                </div>
                <p className="text-sm leading-snug font-medium">{entry.title}</p>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  {entry.detail}
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

"use client";

import { ExternalLink, Pause, Play, Rss, ShieldPlus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { ModuleShell } from "@/components/soc/module-shell";
import { type SocStat, StatsStrip } from "@/components/soc/stats-strip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatRelativeAge, nextAgeTick } from "@/lib/relative-time";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

import { StixTaxiiPanel } from "./stix-taxii-panel";
import { useThreatSession } from "./threat-session";
import { indicatorTypeLabels } from "./threat-shared-data";
import { FeedStatusBadge } from "./threat-shared-primitives";

function feedAgeTone(status: string, ageLabel: string) {
  if (status === "paused") return "text-muted-foreground";
  const stale =
    ageLabel.includes("d ago") ||
    (ageLabel.includes("h ago") && !ageLabel.startsWith("1h"));
  if (status === "degraded" || stale) {
    return "text-warning-text";
  }
  return "text-success-text";
}

export function FeedsCenter() {
  const { feeds, indicators, toggleFeedPause, pushFeedIocsToDetection } =
    useThreatSession();
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setTick(nextAgeTick()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const healthy = feeds.filter((feed) => feed.status === "healthy").length;
  const degraded = feeds.filter((feed) => feed.status === "degraded").length;
  const paused = feeds.filter((feed) => feed.status === "paused").length;
  const totalIndicators = feeds.reduce(
    (sum, feed) => sum + feed.indicatorCount,
    0,
  );

  return (
    <ModuleShell>
      <StatsStrip
        stats={
          [
            {
              key: "healthy",
              title: "Healthy feeds",
              value: String(healthy),
              context: "Ingesting normally",
            },
            {
              key: "attention",
              title: "Degraded / paused",
              value: String(degraded + paused),
              context: "Needs attention",
            },
            {
              key: "indicators",
              title: "Indicators ingested",
              value: totalIndicators.toLocaleString(),
              context: "Across all feeds",
            },
          ] satisfies SocStat[]
        }
      />

      <StixTaxiiPanel />

      <div className="grid gap-3">
        {feeds.map((feed) => {
          const linked = indicators.filter((item) =>
            item.feedIds.includes(feed.id),
          );
          const isPaused = feed.status === "paused";
          const ageLabel = formatRelativeAge(feed.lastIngestAt);
          return (
            <article key={feed.id} className="bg-card rounded-lg border p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="bg-muted flex size-10 shrink-0 items-center justify-center rounded-lg border">
                    <Rss className="text-muted-foreground size-4" />
                  </span>
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-medium">{feed.name}</h2>
                      <FeedStatusBadge status={feed.status} />
                      <Badge
                        variant="outline"
                        className={cn(
                          "rounded-full font-normal",
                          feedAgeTone(feed.status, ageLabel),
                        )}
                      >
                        Ingest {ageLabel}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {feed.provider} · Seed label {feed.lastIngestLabel}
                    </p>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {feed.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {feed.types.map((type) => (
                        <Badge
                          key={type}
                          variant="secondary"
                          className="rounded-full font-normal"
                        >
                          {indicatorTypeLabels[type]}
                        </Badge>
                      ))}
                      <Badge
                        variant="outline"
                        className="rounded-full font-normal"
                      >
                        {feed.indicatorCount.toLocaleString()} total
                      </Badge>
                      {linked.length > 0 ? (
                        <Badge
                          variant="outline"
                          className="rounded-full font-normal"
                        >
                          {linked.length} in catalog
                        </Badge>
                      ) : null}
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const next = toggleFeedPause(feed.id);
                      if (!next) return;
                      toast({
                        title: isPaused ? "Feed resumed" : "Feed paused",
                        description: `${feed.name} is now ${next.status}.`,
                      });
                    }}
                  >
                    {isPaused ? (
                      <Play className="size-3.5" />
                    ) : (
                      <Pause className="size-3.5" />
                    )}
                    {isPaused ? "Resume" : "Pause"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const result = pushFeedIocsToDetection(feed.id);
                      if (!result) {
                        toast({
                          title: "Push failed",
                          description:
                            "Feed could not be linked to a detection.",
                          variant: "destructive",
                        });
                        return;
                      }
                      toast({
                        title: "IOCs pushed to detection",
                        description: `${result.detection.id} created · ${result.indicators.length} indicator${result.indicators.length === 1 ? "" : "s"} marked under review.`,
                      });
                    }}
                  >
                    <ShieldPlus className="size-3.5" />
                    Push IOC to detection
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/threat-intelligence">
                      Open indicators
                      <ExternalLink className="ml-1.5 size-3" />
                    </Link>
                  </Button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline" size="sm">
          <Link href="/administration/integrations">Integrations health</Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href="/threat-intelligence/dark-web">Dark web source</Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href="/threat-hunting/detections">Detection catalog</Link>
        </Button>
      </div>
    </ModuleShell>
  );
}

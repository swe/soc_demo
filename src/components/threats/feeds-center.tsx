"use client";

import Link from "next/link";
import { ExternalLink, Pause, Play, Rss, ShieldPlus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

import {
  indicatorTypeLabels,
} from "./threat-shared-data";
import { useThreatSession } from "./threat-session";
import {
  FeedStatusBadge,
  mutedControlClassName,
} from "./threat-shared-primitives";

export function FeedsCenter() {
  const { feeds, indicators, toggleFeedPause, pushFeedIocsToDetection } =
    useThreatSession();
  const healthy = feeds.filter((feed) => feed.status === "healthy").length;
  const degraded = feeds.filter((feed) => feed.status === "degraded").length;
  const paused = feeds.filter((feed) => feed.status === "paused").length;
  const totalIndicators = feeds.reduce(
    (sum, feed) => sum + feed.indicatorCount,
    0,
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto p-4 md:p-6">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight">Threat Feeds</h1>
        <p className="text-muted-foreground text-sm">
          External and internal feed sources that populate the Indicators store.
        </p>
      </div>

      <section className="border-border/70 border-b border-dashed pb-4">
        <div className="grid gap-3 sm:grid-cols-3 xl:gap-0">
          {[
            {
              title: "Healthy feeds",
              value: String(healthy),
              context: "Ingesting normally",
            },
            {
              title: "Degraded / paused",
              value: String(degraded + paused),
              context: "Needs attention",
            },
            {
              title: "Indicators ingested",
              value: totalIndicators.toLocaleString(),
              context: "Across all feeds",
            },
          ].map((stat, index) => (
            <section
              key={stat.title}
              className={cn(
                "space-y-2 py-2 sm:py-1",
                index > 0 && "sm:border-border/70 sm:border-l sm:pl-6",
                index === 0 && "sm:pr-6",
              )}
            >
              <p className="text-muted-foreground text-sm">{stat.title}</p>
              <p className="text-3xl leading-none font-semibold tracking-tight tabular-nums">
                {stat.value}
              </p>
              <span className="text-muted-foreground block text-sm">
                {stat.context}
              </span>
            </section>
          ))}
        </div>
      </section>

      <div className="grid gap-3">
        {feeds.map((feed) => {
          const linked = indicators.filter((item) =>
            item.feedIds.includes(feed.id),
          );
          const isPaused = feed.status === "paused";
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
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {feed.provider} · Last ingest {feed.lastIngestLabel}
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
                          {linked.length} in demo catalog
                        </Badge>
                      ) : null}
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className={mutedControlClassName}
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
                    className={mutedControlClassName}
                    onClick={() => {
                      const result = pushFeedIocsToDetection(feed.id);
                      if (!result) {
                        toast({
                          title: "Push failed",
                          description: "Feed could not be linked to a detection.",
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
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className={mutedControlClassName}
                  >
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
        <Button
          asChild
          variant="outline"
          size="sm"
          className={mutedControlClassName}
        >
          <Link href="/administration/integrations">Integrations health</Link>
        </Button>
        <Button
          asChild
          variant="outline"
          size="sm"
          className={mutedControlClassName}
        >
          <Link href="/threat-intelligence/dark-web">Dark web source</Link>
        </Button>
        <Button
          asChild
          variant="outline"
          size="sm"
          className={mutedControlClassName}
        >
          <Link href="/threat-hunting/detections">Detection catalog</Link>
        </Button>
      </div>
    </div>
  );
}

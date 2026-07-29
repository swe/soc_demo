"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

import { Badge } from "@/components/ui/badge";

import type { SocAlert } from "./alerts-data";
import { alertSourceCategoryLabels } from "./alerts-data";
import { SourceBadge } from "./alerts-primitives";
import { getRelatedAcrossSources } from "./related-across-sources";

export function RelatedAcrossSourcesPanel({ alert }: { alert: SocAlert }) {
  const related = useMemo(() => getRelatedAcrossSources(alert), [alert]);

  return (
    <section className="bg-card rounded-lg border p-4">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            Related across sources
          </h2>
          <p className="text-muted-foreground mt-1 text-xs">
            Mock correlated signals from other telemetry platforms.
          </p>
        </div>
        <Badge variant="secondary" className="rounded-full font-normal">
          {related.length}
        </Badge>
      </div>
      <ul className="divide-border/70 divide-y">
        {related.map((event) => (
          <li key={event.id} className="py-3 first:pt-0 last:pb-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <SourceBadge
                sourceName={event.sourceName}
                sourceCategory={event.sourceCategory}
              />
              <span className="text-muted-foreground text-[11px]">
                {alertSourceCategoryLabels[event.sourceCategory]}
              </span>
              <span className="text-muted-foreground font-mono text-[11px] tabular-nums">
                · {event.ageLabel}
              </span>
            </div>
            <p className="mt-1.5 text-sm font-medium">{event.title}</p>
            <p className="text-muted-foreground mt-0.5 text-xs leading-relaxed">
              {event.detail}
            </p>
            <Link
              href={`/investigate?q=${encodeURIComponent(event.investigateQuery)}`}
              className="text-foreground mt-2 inline-flex items-center gap-1 text-xs font-medium hover:underline"
            >
              Investigate
              <ArrowUpRight className="size-3" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

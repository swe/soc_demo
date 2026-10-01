"use client";

import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

export type SocStat = {
  key: string;
  title: string;
  value: string;
  context: string;
  delta?: number;
  preferLower?: boolean;
  href?: string;
  /** Hide the delta chip (e.g. watchlist counts with no trend). */
  hideDelta?: boolean;
};

const percentFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
});

/**
 * Columns derived from `stats.length` so a strip never hollows a row.
 * Phones show two compact tiles per row; tablets 2–3; desktop one row.
 */
const responsiveColClass: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-2 md:grid-cols-3 [&>*:last-child:nth-child(odd)]:max-md:col-span-2",
  4: "grid-cols-2 xl:grid-cols-4",
  5: "grid-cols-2 md:grid-cols-3 xl:grid-cols-5 [&>*:last-child:nth-child(odd)]:max-md:col-span-2",
  6: "grid-cols-2 md:grid-cols-3 xl:grid-cols-6",
};

function columnsFor(count: number): string {
  const clamped = Math.min(6, Math.max(1, count));
  return responsiveColClass[clamped] ?? "grid-cols-2 xl:grid-cols-4";
}

export function StatsStrip({
  stats,
  className,
}: {
  stats: readonly SocStat[];
  className?: string;
}) {
  return (
    <section
      aria-label="Key metrics"
      className={cn("grid gap-3 md:gap-4", columnsFor(stats.length), className)}
    >
      {stats.map((stat) => {
        const hasDelta = typeof stat.delta === "number" && !stat.hideDelta;
        const isIncrease = (stat.delta ?? 0) >= 0;
        const isHealthy = stat.preferLower ? !isIncrease : isIncrease;
        const deltaLabel = hasDelta
          ? `${isIncrease ? "+" : ""}${percentFormatter.format(stat.delta!)}%`
          : null;
        const DeltaIcon = isIncrease ? ArrowUpRight : ArrowDownRight;

        const body = (
          <>
            <p className="text-muted-foreground text-callout truncate font-medium">
              {stat.title}
            </p>
            <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <p className="text-metric tabular-nums">{stat.value}</p>
              {deltaLabel ? (
                <span
                  className={cn(
                    "inline-flex items-center gap-0.5 text-xs font-medium tabular-nums",
                    isHealthy ? "text-success-text" : "text-destructive-text",
                  )}
                >
                  <DeltaIcon className="size-3.5" aria-hidden />
                  {deltaLabel}
                </span>
              ) : null}
            </div>
            <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">
              {stat.context}
            </p>
          </>
        );

        const tileClassName =
          "bg-card text-card-foreground shadow-card block min-w-0 rounded-xl border p-3.5 sm:p-4";

        return stat.href ? (
          <Link
            key={stat.key}
            href={stat.href}
            className={cn(
              tileClassName,
              "pressable hover:border-ring/40 focus-visible:ring-ring/35 transition-[border-color,box-shadow,scale] outline-none hover:shadow-raised focus-visible:ring-[3px]",
            )}
          >
            {body}
          </Link>
        ) : (
          <div key={stat.key} className={tileClassName}>
            {body}
          </div>
        );
      })}
    </section>
  );
}

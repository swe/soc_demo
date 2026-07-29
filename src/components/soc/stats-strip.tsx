"use client";

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

/** Columns derived from `stats.length` so a strip never hollows a row. */
const responsiveColClass: Record<number, string> = {
  1: "sm:grid-cols-1 lg:grid-cols-1 xl:grid-cols-1",
  2: "sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2",
  3: "sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4",
  5: "sm:grid-cols-2 lg:grid-cols-5 xl:grid-cols-5",
  6: "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6",
};

function columnsFor(count: number): string {
  const clamped = Math.min(6, Math.max(1, count));
  return responsiveColClass[clamped] ?? "sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4";
}

export function StatsStrip({
  stats,
  className,
}: {
  stats: readonly SocStat[];
  className?: string;
}) {
  const count = stats.length;

  return (
    <section
      className={cn("border-border/70 border-b border-dashed pb-4", className)}
    >
      <div
        className={cn(
          "grid items-start gap-3 sm:gap-4 xl:gap-0",
          columnsFor(count),
        )}
      >
        {stats.map((stat, index) => {
          const hasDelta = typeof stat.delta === "number" && !stat.hideDelta;
          const isIncrease = (stat.delta ?? 0) >= 0;
          const isHealthy = stat.preferLower ? !isIncrease : isIncrease;
          const deltaLabel = hasDelta
            ? `${isIncrease ? "+" : ""}${percentFormatter.format(stat.delta!)}%`
            : null;

          const body = (
            <>
              <p className="text-muted-foreground text-sm">{stat.title}</p>
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <p className="text-3xl leading-none font-semibold tracking-tight tabular-nums">
                    {stat.value}
                  </p>
                  {deltaLabel ? (
                    <span
                      className={cn(
                        "text-sm",
                        isHealthy ? "text-emerald-600" : "text-rose-600",
                      )}
                    >
                      {deltaLabel}
                    </span>
                  ) : null}
                </div>
                <span className="text-muted-foreground block text-sm">
                  {stat.context}
                </span>
              </div>
            </>
          );

          return (
            <section
              key={stat.key}
              className={cn(
                "space-y-2 py-2 sm:py-1",
                index > 0 && "xl:border-border/70 xl:border-l",
                index === 0 && "xl:pr-6",
                index > 0 && index < count - 1 && "xl:px-6",
                index === count - 1 && "xl:pl-6",
                stat.href && "hover:bg-muted/40 rounded-md transition-colors",
              )}
            >
              {stat.href ? (
                <Link
                  href={stat.href}
                  className="block space-y-2 focus:outline-none"
                >
                  {body}
                </Link>
              ) : (
                body
              )}
            </section>
          );
        })}
      </div>
    </section>
  );
}

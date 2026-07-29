"use client";

import { ArrowRight, UserRound } from "lucide-react";
import Link from "next/link";

import {
  getTopRiskyIdentities,
  getUebaOverviewStats,
  uebaAnomalyLabels,
} from "@/components/assets/ueba-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function MiniSpark({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);
  return (
    <div className="flex h-5 items-end gap-px" aria-hidden="true">
      {values.slice(-8).map((v, i) => (
        <span
          key={i}
          className="bg-foreground/30 w-1 rounded-sm"
          style={{ height: `${Math.max(12, (v / max) * 100)}%` }}
        />
      ))}
    </div>
  );
}

export function IdentityRiskWidget({ className }: { className?: string }) {
  const top = getTopRiskyIdentities(5);
  const stats = getUebaOverviewStats();

  return (
    <section className={cn("bg-card rounded-xl border", className)}>
      <div className="flex items-center justify-between gap-2 border-b px-3 py-2.5 sm:px-4">
        <div>
          <h3 className="text-sm leading-tight font-medium">Identity risk · UEBA</h3>
          <p className="text-muted-foreground text-xs">
            {stats.openAnomalies} anomalies · {stats.criticalOrHigh} critical/high ·{" "}
            {stats.identitiesWithAnomalies} identities
          </p>
        </div>
        <Button size="sm" variant="ghost" className="h-8 gap-1 text-xs" asChild>
          <Link href="/assets/identities">
            Identities
            <ArrowRight className="size-3.5" />
          </Link>
        </Button>
      </div>
      <ul className="divide-border divide-y">
        {top.map(({ identity, behavior, score }) => {
          const topAnomaly = behavior.anomalies[0];
          return (
            <li key={identity.id}>
              <Link
                href={`/assets/identities?q=${encodeURIComponent(identity.displayName)}`}
                className="hover:bg-muted/40 flex items-start gap-3 px-3 py-2.5 transition-colors sm:px-4"
              >
                <div className="bg-muted mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md border">
                  <UserRound className="text-muted-foreground size-3.5" />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-medium">
                      {identity.displayName}
                    </p>
                    <Badge
                      variant="outline"
                      className="rounded-full font-mono text-[10px] tabular-nums"
                    >
                      {score}
                    </Badge>
                    {identity.privileged ? (
                      <Badge
                        variant="secondary"
                        className="rounded-full text-[10px] font-normal"
                      >
                        privileged
                      </Badge>
                    ) : null}
                  </div>
                  <p className="text-muted-foreground truncate text-xs">
                    {topAnomaly
                      ? uebaAnomalyLabels[topAnomaly.kind]
                      : identity.notes || identity.principal}
                  </p>
                </div>
                <MiniSpark values={behavior.riskSpark} />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

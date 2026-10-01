"use client";

import { UserRound } from "lucide-react";
import Link from "next/link";

import {
  getTopRiskyIdentities,
  getUebaOverviewStats,
  uebaAnomalyLabels,
} from "@/components/assets/ueba-data";
import { Panel, PanelHeading, PanelLink } from "@/components/soc/panel";
import { Badge } from "@/components/ui/badge";

function MiniSpark({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);
  return (
    <div className="flex h-5 items-end gap-px" aria-hidden="true">
      {values.slice(-8).map((v, i) => (
        <span
          key={i}
          className="bg-primary/35 w-1 rounded-sm"
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
    <Panel className={className}>
      <PanelHeading
        title="Identity risk · UEBA"
        description={`${stats.openAnomalies} anomalies · ${stats.criticalOrHigh} critical/high · ${stats.identitiesWithAnomalies} identities`}
        action={<PanelLink href="/assets/identities">Identities</PanelLink>}
      />
      <ul className="divide-separator -mx-2 divide-y">
        {top.map(({ identity, behavior, score }) => {
          const topAnomaly = behavior.anomalies[0];
          return (
            <li key={identity.id}>
              <Link
                href={`/assets/identities?q=${encodeURIComponent(identity.displayName)}`}
                className="pressable hover:bg-accent/60 flex items-center gap-3 rounded-md px-2 py-2.5"
              >
                <div className="bg-muted flex size-8 shrink-0 items-center justify-center rounded-full">
                  <UserRound className="text-muted-foreground size-4" aria-hidden />
                </div>
                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex min-w-0 items-center gap-2">
                    <p className="truncate text-sm font-medium">
                      {identity.displayName}
                    </p>
                    <Badge variant="muted">{score}</Badge>
                    {identity.privileged ? (
                      <Badge variant="warning">privileged</Badge>
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
    </Panel>
  );
}

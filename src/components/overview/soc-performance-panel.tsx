"use client";

import { Info } from "lucide-react";
import { useMemo, useSyncExternalStore } from "react";

import {
  getAlertSessionSnapshot,
  subscribeAlertsSession,
} from "@/components/alerts/alerts-session";
import {
  getIncidentSessionSnapshot,
  subscribeIncidentsSession,
} from "@/components/incidents/incidents-session";
import {
  getPlaybookSnapshot,
  subscribePlaybooks,
} from "@/components/playbooks/playbooks-session";
import { Panel, PanelGrid, PanelHeading } from "@/components/soc/panel";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { computeSocPerformanceSnapshot } from "@/lib/soc-metrics";
import { cn } from "@/lib/utils";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const COST_METHODOLOGY =
  "Estimated from playbook run counts × severity-weighted analyst hours ($185/h) plus modeled breach-avoidance per run. Not an accounting figure.";

export function SocPerformancePanel() {
  const alertsSnap = useSyncExternalStore(
    subscribeAlertsSession,
    getAlertSessionSnapshot,
    getAlertSessionSnapshot,
  );
  const incidentsSnap = useSyncExternalStore(
    subscribeIncidentsSession,
    getIncidentSessionSnapshot,
    getIncidentSessionSnapshot,
  );
  const playbooksSnap = useSyncExternalStore(
    subscribePlaybooks,
    getPlaybookSnapshot,
    getPlaybookSnapshot,
  );

  const snapshot = useMemo(
    () =>
      computeSocPerformanceSnapshot(
        Array.from(alertsSnap.values()),
        Array.from(incidentsSnap.values()),
        Array.from(playbooksSnap.values()),
      ),
    [alertsSnap, incidentsSnap, playbooksSnap],
  );

  const metrics = [
    {
      key: "mtta",
      title: "MTTA",
      value: snapshot.mttaLabel,
      context: `n=${snapshot.mttaSample} triaged alerts`,
    },
    {
      key: "mttc",
      title: "MTTC",
      value: snapshot.mttcLabel,
      context: `n=${snapshot.mttcSample} contained cases`,
    },
    {
      key: "fp",
      title: "False-positive rate",
      value: `${(snapshot.falsePositiveRate * 100).toFixed(1)}%`,
      context: `${snapshot.falsePositiveCount}/${snapshot.closedAlertCount || "—"} closed`,
    },
    {
      key: "hours",
      title: "Playbook hours saved",
      value: `${snapshot.playbookHoursSaved.toFixed(0)}h`,
      context: "from run counts × severity weights",
    },
  ] as const;

  return (
    <Panel>
      <TooltipProvider>
      <PanelHeading
        title="SOC performance"
        description={
          <span className="inline-flex items-center gap-1.5">
            Estimated cost avoided{" "}
            {money.format(snapshot.playbookCostAvoidedUsd)}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground inline-flex"
                  aria-label="How estimated cost avoided is calculated"
                >
                  <Info className="size-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs text-xs leading-relaxed">
                {COST_METHODOLOGY}
              </TooltipContent>
            </Tooltip>
          </span>
        }
      />

      <div className="border-border/70 mb-4 grid gap-3 border-b border-dashed pb-4 sm:grid-cols-2 sm:gap-0 lg:grid-cols-4">
        {metrics.map((metric, index) => (
          <div
            key={metric.key}
            className={cn(
              "space-y-1 py-1",
              index > 0 && "sm:border-border/70 sm:border-l sm:pl-4 lg:pl-6",
              index < metrics.length - 1 && "sm:pr-4 lg:pr-6",
            )}
          >
            <p className="text-muted-foreground text-xs">{metric.title}</p>
            <p className="text-lg font-semibold tabular-nums">{metric.value}</p>
            <p className="text-muted-foreground text-[11px]">{metric.context}</p>
          </div>
        ))}
      </div>

      <PanelGrid columns={2}>
        <div>
          <p className="text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase">
            By team
          </p>
          <div className="overflow-hidden rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Team</TableHead>
                  <TableHead>MTTA</TableHead>
                  <TableHead>MTTC</TableHead>
                  <TableHead className="text-right">FP%</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {snapshot.byTeam.map((team) => (
                  <TableRow key={team.teamId}>
                    <TableCell>
                      <p className="font-medium">{team.teamName}</p>
                      <p className="text-muted-foreground text-xs">
                        {team.alertCount} alerts · {team.incidentCount}{" "}
                        incidents
                      </p>
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {team.mttaLabel}
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {team.mttcLabel}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {(team.falsePositiveRate * 100).toFixed(0)}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div>
          <p className="text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase">
            Estimated cost avoided
          </p>
          <ul className="space-y-2">
            {snapshot.playbookRoi.length === 0 ? (
              <li className="text-muted-foreground rounded-md border px-3 py-2 text-sm">
                No playbook runs recorded yet.
              </li>
            ) : (
              snapshot.playbookRoi.map((pb) => (
                <li
                  key={pb.playbookId}
                  className="flex items-start justify-between gap-3 rounded-md border px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{pb.name}</p>
                    <p className="text-muted-foreground text-xs">
                      {pb.code} · {pb.runs} runs · {pb.hoursSaved}h saved ·{" "}
                      {(pb.containmentSuccessRate * 100).toFixed(0)}% success
                    </p>
                  </div>
                  <Badge variant="secondary" className="shrink-0 tabular-nums">
                    {money.format(pb.estimatedCostAvoidedUsd)}
                  </Badge>
                </li>
              ))
            )}
          </ul>
          <p className="text-muted-foreground mt-2 text-[11px] leading-relaxed">
            Model estimate from run counts and severity weights — not an
            accounting export.
          </p>
        </div>
      </PanelGrid>
      </TooltipProvider>
    </Panel>
  );
}

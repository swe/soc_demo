"use client";

import Link from "next/link";
import { useMemo } from "react";

import { ChartCard } from "@/components/soc/charts/chart-card";
import {
  formatCompact as formatChartValue,
  severityChartConfig,
} from "@/components/soc/charts/chart-palette";
import { TrendAreaChart } from "@/components/soc/charts/trend-area-chart";
import { PanelGrid, PanelLink } from "@/components/soc/panel";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  buildWorkQueue,
  formatCompact,
  getBacklogAgingSummary,
  getDecisionOverviewStats,
  getDeviceExposureRollup,
  getRiskNarrativeItems,
  getVulnerabilitiesOverTime,
  vulnerabilities,
  vulnEvents,
} from "./vulnerabilities-data";
import {
  getOverviewPanelOrder,
  type OverviewPanelId,
  useVulnPersona,
} from "./vulnerabilities-persona";
import {
  Panel,
  PanelHeading,
  PriorityBadge,
  VulnStatsStrip,
} from "./vulnerabilities-primitives";
import { useVulnSession } from "./vulnerabilities-session";
import {
  buildExposureHref,
  buildFindingsHref,
  buildWorkHref,
} from "./vulnerabilities-url";

const findingsSeries = [
  { key: "low" },
  { key: "medium" },
  { key: "high" },
  { key: "critical" },
] as const;

function FindingsOverTimeCard() {
  const data = useMemo(() => getVulnerabilitiesOverTime("endpoint", 14), []);
  const latest = data[data.length - 1];
  const latestTotal = latest
    ? latest.critical + latest.high + latest.medium + latest.low
    : 0;

  return (
    <ChartCard
      title="Findings over time"
      description="Endpoint estate · stacked daily totals by severity"
      metric={{ value: formatChartValue(latestTotal), label: "latest day" }}
      size="lg"
      status={data.length ? "ready" : "empty"}
    >
      <TrendAreaChart
        data={data}
        xKey="day"
        series={findingsSeries}
        config={severityChartConfig}
      />
    </ChartCard>
  );
}

function RiskNarrativePanel({
  aging,
}: {
  aging: { overdue: number; open: number; oldestDays: number };
}) {
  const items = useMemo(() => getRiskNarrativeItems(3), []);

  return (
    <Panel>
      <PanelHeading
        title="Risk narrative"
        description="Board-attention items · backlog aging"
      />
      <ul className="divide-separator divide-y">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-start justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
          >
            <div className="min-w-0">
              <Link
                href={buildFindingsHref({}, item.id)}
                className="text-primary font-mono text-sm font-medium hover:underline"
              >
                {item.cve}
              </Link>
              <p className="text-muted-foreground mt-0.5 line-clamp-1 text-xs">
                {item.title}
              </p>
              <p className="text-muted-foreground mt-1 text-xs capitalize">
                {item.reason}
              </p>
            </div>
            <PriorityBadge score={item.socPriority} />
          </li>
        ))}
      </ul>
      <p className="text-muted-foreground border-separator mt-4 border-t pt-3 text-xs leading-relaxed">
        Backlog:{" "}
        <Link
          href={buildWorkHref({
            kind: "remediation",
            statuses: ["pending", "in_progress"],
          })}
          className="text-foreground font-medium hover:underline"
        >
          {aging.overdue} overdue
        </Link>{" "}
        of {aging.open} open remediations
        {aging.oldestDays > 0
          ? ` · oldest open item ${aging.oldestDays}d`
          : ""}
        .
      </p>
    </Panel>
  );
}

export function VulnerabilitiesOverview() {
  const { persona } = useVulnPersona();
  const { remediations } = useVulnSession();
  const order = getOverviewPanelOrder(persona);

  const decisionStats = useMemo(
    () => getDecisionOverviewStats(remediations),
    [remediations],
  );
  const aging = useMemo(
    () => getBacklogAgingSummary(remediations),
    [remediations],
  );

  const topPriority = useMemo(
    () =>
      [...vulnerabilities]
        .sort((a, b) => b.socPriority - a.socPriority)
        .slice(0, 5),
    [],
  );

  const exploitation = useMemo(
    () =>
      vulnerabilities
        .filter((v) => v.linkedAlertIds.length > 0)
        .sort((a, b) => b.socPriority - a.socPriority)
        .slice(0, 5),
    [],
  );

  const blastRadius = useMemo(
    () => getDeviceExposureRollup().slice(0, 5),
    [],
  );

  const workItems = useMemo(
    () => buildWorkQueue(remediations).slice(0, 5),
    [remediations],
  );

  const recentEvents = useMemo(() => vulnEvents.slice(0, 6), []);

  const panels: Record<OverviewPanelId, React.ReactNode> = {
    narrative: <RiskNarrativePanel key="narrative" aging={aging} />,
    chart: <FindingsOverTimeCard key="chart" />,
    topPriority: (
      <Panel key="topPriority">
        <PanelHeading
          title="Top priority findings"
          description="Highest SOC priority open CVEs"
          action={
            <PanelLink href={buildFindingsHref({ sort: "priority-desc" })}>
              View all
            </PanelLink>
          }
        />
        <div className="overflow-hidden rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-14">Priority</TableHead>
                <TableHead>CVE</TableHead>
                <TableHead>Title</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topPriority.map((v) => (
                <TableRow key={v.id}>
                  <TableCell>
                    <PriorityBadge score={v.socPriority} />
                  </TableCell>
                  <TableCell>
                    <Link
                      href={buildFindingsHref({}, v.id)}
                      className="text-primary font-mono text-xs hover:underline"
                    >
                      {v.cve}
                    </Link>
                  </TableCell>
                  <TableCell className="max-w-[160px]">
                    <span className="line-clamp-1 text-xs">{v.title}</span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Panel>
    ),
    exploitation: (
      <Panel key="exploitation">
        <PanelHeading
          title="Exploitation activity"
          description="Findings with linked detection alerts"
          action={
            <PanelLink href={buildFindingsHref({ withAlertsOnly: true })}>
              View all
            </PanelLink>
          }
        />
        <ul className="divide-separator divide-y">
          {exploitation.map((v) => (
            <li key={v.id} className="space-y-1.5 py-2.5 first:pt-0 last:pb-0">
              <div className="flex items-start justify-between gap-2">
                <Link
                  href={buildFindingsHref({}, v.id)}
                  className="text-primary truncate text-sm font-medium hover:underline"
                >
                  {v.cve}
                </Link>
                <PriorityBadge score={v.socPriority} />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {v.linkedAlertIds.slice(0, 4).map((id) => (
                  <Link
                    key={id}
                    href={`/alerts/${id}`}
                    className="text-muted-foreground hover:text-foreground font-mono text-xs"
                  >
                    {id}
                  </Link>
                ))}
              </div>
            </li>
          ))}
          {exploitation.length === 0 ? (
            <li className="text-muted-foreground py-4 text-sm">
              No linked alerts on open findings.
            </li>
          ) : null}
        </ul>
      </Panel>
    ),
    blastRadius: (
      <Panel key="blastRadius">
        <PanelHeading
          title="Asset blast radius"
          description="Devices with the most high-priority findings"
          action={
            <PanelLink
              href={buildExposureHref(
                persona === "ciso"
                  ? { internetFacingOnly: true, highCriticalityOnly: true }
                  : {},
              )}
            >
              Exposure
            </PanelLink>
          }
        />
        <ul className="divide-separator divide-y">
          {blastRadius.map((d) => (
            <li
              key={d.deviceId}
              className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
            >
              <div className="min-w-0">
                <Link
                  href={buildExposureHref({}, d.deviceId)}
                  className="hover:text-primary truncate text-sm font-medium"
                >
                  {d.hostname}
                </Link>
                <p className="text-muted-foreground truncate text-xs">
                  {d.platform} · {formatCompact(d.vulnerabilityCount)} findings
                  {d.internetFacing ? " · internet-facing" : ""}
                </p>
              </div>
              <PriorityBadge score={d.maxPriority} />
            </li>
          ))}
        </ul>
      </Panel>
    ),
    openWork: (
      <Panel key="openWork">
        <PanelHeading
          title="Open work items"
          description="Remediation and mitigation queue"
          action={
            <PanelLink href={buildWorkHref()}>Work queue</PanelLink>
          }
        />
        <ul className="divide-separator divide-y">
          {workItems.map((item) => (
            <li
              key={item.id}
              className="flex items-start justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
            >
              <div className="min-w-0">
                <Link
                  href={buildWorkHref({}, item.id)}
                  className="hover:text-primary line-clamp-2 text-sm font-medium"
                >
                  {item.title}
                </Link>
                <p className="text-muted-foreground mt-0.5 text-xs capitalize">
                  {item.kind} · {item.status.replace(/_/g, " ")}
                  {item.ticketRef ? ` · ${item.ticketRef}` : ""}
                </p>
              </div>
              <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
                {item.impactScore.toFixed(1)}
              </span>
            </li>
          ))}
        </ul>
      </Panel>
    ),
    compliance: (
      <Panel key="compliance">
        <PanelHeading
          title="Compliance"
          description="Optional control evidence"
        />
        <p className="text-muted-foreground text-sm leading-relaxed">
          Patch SLAs and exception evidence live in compliance when GRC needs
          them — not a daily SOC surface.
        </p>
        <div className="mt-4">
          <PanelLink href="/compliance">Open compliance</PanelLink>
        </div>
      </Panel>
    ),
    activity: (
      <Panel key="activity">
        <PanelHeading
          title="Recent activity"
          description="Vulnerability events across the estate"
        />
        <ul className="divide-separator divide-y">
          {recentEvents.map((event) => (
            <li
              key={event.id}
              className="flex items-start justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium">{event.summary}</p>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  {event.dateLabel} · {event.type.replace(/-/g, " ")}
                  {event.relatedCveIds.length > 0
                    ? ` · ${event.relatedCveIds.slice(0, 2).join(", ")}`
                    : ""}
                </p>
              </div>
              <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
                {formatCompact(event.impactedDevices)}
              </span>
            </li>
          ))}
        </ul>
      </Panel>
    ),
  };

  const firstRow = order.slice(0, 3);
  const secondRow = order.slice(3, 6);
  const thirdRow = order.slice(6);

  return (
    <div className="flex flex-col gap-4">
      <VulnStatsStrip stats={decisionStats} />

      {firstRow.length > 0 ? (
        <PanelGrid columns={firstRow.length as 1 | 2 | 3}>
          {firstRow.map((id) => panels[id])}
        </PanelGrid>
      ) : null}

      {secondRow.length > 0 ? (
        <PanelGrid columns={secondRow.length as 1 | 2 | 3}>
          {secondRow.map((id) => panels[id])}
        </PanelGrid>
      ) : null}

      {thirdRow.length > 0 ? (
        <PanelGrid columns={thirdRow.length as 1 | 2 | 3}>
          {thirdRow.map((id) => panels[id])}
        </PanelGrid>
      ) : null}
    </div>
  );
}

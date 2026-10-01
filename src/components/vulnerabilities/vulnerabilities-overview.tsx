"use client";

import Link from "next/link";
import { useId, useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";

import { PanelGrid } from "@/components/soc/panel";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
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

const compactNumber = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const severityChartConfig = {
  critical: {
    label: "Critical",
    color: "#dc2626",
  },
  high: {
    label: "High",
    color: "#ea580c",
  },
  medium: {
    label: "Medium",
    color: "#d97706",
  },
  low: {
    label: "Low",
    color: "#2563eb",
  },
} satisfies ChartConfig;

function FindingsOverTimeCard() {
  const data = useMemo(() => getVulnerabilitiesOverTime("endpoint", 14), []);
  const latest = data[data.length - 1];
  const latestTotal = latest
    ? latest.critical + latest.high + latest.medium + latest.low
    : 0;
  const gradientId = useId().replace(/:/g, "");

  return (
    <Panel className="flex min-h-0 flex-col">
      <PanelHeading
        title="Findings over time"
        description="Endpoint estate · stacked daily totals by severity"
        action={
          <div className="text-right">
            <p className="text-2xl leading-none font-semibold tabular-nums">
              {compactNumber.format(latestTotal)}
            </p>
            <p className="text-muted-foreground mt-1 text-xs">
              latest day
            </p>
          </div>
        }
      />
      <ChartContainer
        config={severityChartConfig}
        className="aspect-auto h-[220px] min-h-[220px] w-full"
      >
        <AreaChart
          accessibilityLayer
          data={data}
          margin={{ top: 8, right: 8, left: 4, bottom: 0 }}
        >
          <defs>
            {(["low", "medium", "high", "critical"] as const).map((key) => (
              <linearGradient
                key={key}
                id={`${gradientId}-sev-${key}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor={`var(--color-${key})`}
                  stopOpacity={0.55}
                />
                <stop
                  offset="100%"
                  stopColor={`var(--color-${key})`}
                  stopOpacity={0.12}
                />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="day"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={24}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={40}
            tickFormatter={(v) => compactNumber.format(Number(v))}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Area
            type="monotone"
            dataKey="low"
            stackId="sev"
            stroke="var(--color-low)"
            fill={`url(#${gradientId}-sev-low)`}
            strokeWidth={1.5}
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="medium"
            stackId="sev"
            stroke="var(--color-medium)"
            fill={`url(#${gradientId}-sev-medium)`}
            strokeWidth={1.5}
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="high"
            stackId="sev"
            stroke="var(--color-high)"
            fill={`url(#${gradientId}-sev-high)`}
            strokeWidth={1.5}
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="critical"
            stackId="sev"
            stroke="var(--color-critical)"
            fill={`url(#${gradientId}-sev-critical)`}
            strokeWidth={1.5}
            isAnimationActive={false}
          />
        </AreaChart>
      </ChartContainer>
    </Panel>
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
      <ul className="divide-border/60 divide-y">
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
      <p className="text-muted-foreground mt-4 border-t pt-3 text-xs leading-relaxed">
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
            <Link
              href={buildFindingsHref({ sort: "priority-desc" })}
              className="text-muted-foreground hover:text-foreground text-xs"
            >
              View all
            </Link>
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
            <Link
              href={buildFindingsHref({ withAlertsOnly: true })}
              className="text-muted-foreground hover:text-foreground text-xs"
            >
              View all
            </Link>
          }
        />
        <ul className="divide-border/60 divide-y">
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
            <Link
              href={buildExposureHref(
                persona === "ciso"
                  ? { internetFacingOnly: true, highCriticalityOnly: true }
                  : {},
              )}
              className="text-muted-foreground hover:text-foreground text-xs"
            >
              Exposure
            </Link>
          }
        />
        <ul className="divide-border/60 divide-y">
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
            <Link
              href={buildWorkHref()}
              className="text-muted-foreground hover:text-foreground text-xs"
            >
              Work queue
            </Link>
          }
        />
        <ul className="divide-border/60 divide-y">
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
        <Link
          href="/compliance"
          className="text-primary mt-4 inline-flex text-sm font-medium hover:underline"
        >
          Open compliance
        </Link>
      </Panel>
    ),
    activity: (
      <Panel key="activity">
        <PanelHeading
          title="Recent activity"
          description="Vulnerability events across the estate"
        />
        <ul className="divide-border/60 divide-y">
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

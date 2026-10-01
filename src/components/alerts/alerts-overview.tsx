"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";

import { OverviewSplit, Panel, PanelHeading } from "@/components/soc/panel";
import { SegmentedControl } from "@/components/soc/segmented-control";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

import {
  type AlertsOverviewRange,
  alertsOverviewRangeLabels,
  alertsOverviewRanges,
  currentAnalystId,
  filterAlertsByOverviewRange,
  getAlertsBySource,
  getAlertsOverTime,
  getAnalystWorkload,
  getSeverityBreakdown,
  getStatusBreakdown,
  getTriageFocusAlerts,
  openAlertStatuses,
  type SocAlert,
} from "./alerts-data";
import { SeverityBadge, StatusBadge } from "./alerts-primitives";
import { type OverviewFilterTarget } from "./alerts-url";

const compactNumber = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const severityChartConfig = {
  critical: {
    label: "Critical",
    theme: { light: "#dc2626", dark: "#f87171" },
  },
  high: {
    label: "High",
    theme: { light: "#ea580c", dark: "#fb923c" },
  },
  medium: {
    label: "Medium",
    theme: { light: "#d97706", dark: "#fbbf24" },
  },
  low: {
    label: "Low",
    theme: { light: "#2563eb", dark: "#60a5fa" },
  },
} satisfies ChartConfig;

const severityDonutConfig = {
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

const sourceChartConfig = {
  count: {
    label: "Alerts",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

const statusChartConfig = {
  count: {
    label: "Alerts",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

const severityBarColors: Record<string, string> = {
  critical: "#dc2626",
  high: "#ea580c",
  medium: "#d97706",
  low: "#2563eb",
};

function OverviewRangeControl({
  value,
  onChange,
}: {
  value: AlertsOverviewRange;
  onChange: (range: AlertsOverviewRange) => void;
}) {
  return (
    <SegmentedControl
      aria-label="Time range"
      value={value}
      onChange={onChange}
      options={alertsOverviewRanges.map((range) => ({
        value: range,
        label: alertsOverviewRangeLabels[range],
      }))}
    />
  );
}

function AlertsOverTimeCard({ range }: { range: AlertsOverviewRange }) {
  const data = useMemo(() => getAlertsOverTime(range), [range]);
  const latest = data[data.length - 1];
  const latestTotal = latest
    ? latest.critical + latest.high + latest.medium + latest.low
    : 0;
  const xInterval = range === "30d" ? 3 : range === "14d" ? 1 : 0;

  return (
    <Panel>
      <PanelHeading
        title="Alerts over time"
        action={
          <div className="text-right">
            <p className="text-2xl leading-none font-semibold tabular-nums">
              {latestTotal}
            </p>
            <p className="text-muted-foreground mt-1 text-xs">
              latest day
            </p>
          </div>
        }
      />
      <ChartContainer
        config={severityChartConfig}
        className="[aspect-ratio:auto] h-[220px] w-full"
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
                id={`alert-sev-${key}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor={`var(--color-${key})`}
                  stopOpacity={0.4}
                />
                <stop
                  offset="100%"
                  stopColor={`var(--color-${key})`}
                  stopOpacity={0.05}
                />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10 }}
            dy={8}
            interval={xInterval}
            minTickGap={8}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10 }}
            width={40}
            allowDecimals={false}
            tickFormatter={(value) => compactNumber.format(Number(value))}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                indicator="dot"
                labelFormatter={(label, payload) => {
                  const point = payload?.[0]?.payload as
                    | {
                        critical?: number;
                        high?: number;
                        medium?: number;
                        low?: number;
                      }
                    | undefined;
                  const total = point
                    ? (point.critical ?? 0) +
                      (point.high ?? 0) +
                      (point.medium ?? 0) +
                      (point.low ?? 0)
                    : 0;
                  return (
                    <div className="flex flex-col gap-0.5">
                      <span>{label}</span>
                      <span className="text-muted-foreground font-normal">
                        Total {compactNumber.format(total)}
                      </span>
                    </div>
                  );
                }}
              />
            }
          />
          <ChartLegend content={<ChartLegendContent />} />
          <Area
            type="monotone"
            dataKey="low"
            stackId="sev"
            stroke="var(--color-low)"
            fill="url(#alert-sev-low)"
            strokeWidth={1.5}
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="medium"
            stackId="sev"
            stroke="var(--color-medium)"
            fill="url(#alert-sev-medium)"
            strokeWidth={1.5}
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="high"
            stackId="sev"
            stroke="var(--color-high)"
            fill="url(#alert-sev-high)"
            strokeWidth={1.5}
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="critical"
            stackId="sev"
            stroke="var(--color-critical)"
            fill="url(#alert-sev-critical)"
            strokeWidth={1.5}
            isAnimationActive={false}
          />
        </AreaChart>
      </ChartContainer>
    </Panel>
  );
}

function SeverityDistributionCard({
  alerts,
  onFilter,
}: {
  alerts: Iterable<SocAlert>;
  onFilter: (target: OverviewFilterTarget) => void;
}) {
  const data = getSeverityBreakdown(alerts).map((item) => ({
    ...item,
    fill: severityBarColors[item.severity],
  }));
  const total = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <Panel>
      <PanelHeading title="Severity distribution" />
      <div className="flex h-[220px] items-center gap-4">
        <div className="relative mx-auto aspect-square h-full max-h-[200px] min-h-0 flex-1">
          <ChartContainer
            config={severityDonutConfig}
            className="aspect-square h-full w-full"
          >
            <PieChart>
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    nameKey="severity"
                    formatter={(value) => (
                      <span className="font-mono tabular-nums">
                        {compactNumber.format(Number(value))}
                      </span>
                    )}
                  />
                }
              />
              <Pie
                data={data}
                dataKey="count"
                nameKey="label"
                innerRadius="62%"
                outerRadius="88%"
                paddingAngle={2}
                strokeWidth={0}
                isAnimationActive={false}
              >
                {data.map((entry) => (
                  <Cell
                    key={entry.severity}
                    fill={entry.fill}
                    className="cursor-pointer outline-none"
                    onClick={() =>
                      onFilter({ type: "severity", severity: entry.severity })
                    }
                  />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-semibold tabular-nums">
              {compactNumber.format(total)}
            </span>
            <span className="text-muted-foreground text-xs">alerts</span>
          </div>
        </div>
        <ul className="flex w-[108px] shrink-0 flex-col gap-2.5">
          {data.map((item) => (
            <li key={item.severity}>
              <button
                type="button"
                onClick={() =>
                  onFilter({ type: "severity", severity: item.severity })
                }
                className="hover:bg-accent/50 flex w-full items-center gap-2 rounded-md px-1 py-0.5 text-left transition-colors"
              >
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: item.fill }}
                />
                <span className="min-w-0 flex-1 truncate text-xs">
                  {item.label}
                </span>
                <span className="text-muted-foreground text-xs tabular-nums">
                  {compactNumber.format(item.count)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </Panel>
  );
}

function TopSourcesCard({
  alerts,
  onFilter,
}: {
  alerts: Iterable<SocAlert>;
  onFilter: (target: OverviewFilterTarget) => void;
}) {
  const data = getAlertsBySource(alerts)
    .slice(0, 6)
    .map((item) => ({
      name: item.sourceName
        .replace(" Enterprise", "")
        .replace(" Workforce", ""),
      sourceId: item.sourceId,
      count: item.count,
    }));

  return (
    <Panel>
      <PanelHeading title="Top sources" />
      <ChartContainer
        config={sourceChartConfig}
        className="[aspect-ratio:auto] h-[220px] w-full"
      >
        <BarChart
          accessibilityLayer
          data={data}
          margin={{ top: 8, right: 8, left: 4, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10 }}
            interval={0}
            angle={-18}
            textAnchor="end"
            height={48}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10 }}
            width={40}
            allowDecimals={false}
            tickFormatter={(value) => compactNumber.format(Number(value))}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar
            dataKey="count"
            fill="var(--color-count)"
            radius={[4, 4, 0, 0]}
            isAnimationActive={false}
            cursor="pointer"
          >
            {data.map((entry) => (
              <Cell
                key={entry.sourceId}
                className="cursor-pointer"
                onClick={() =>
                  onFilter({ type: "sourceId", sourceId: entry.sourceId })
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
    </Panel>
  );
}

function StatusBreakdownCard({
  alerts,
  onFilter,
}: {
  alerts: Iterable<SocAlert>;
  onFilter: (target: OverviewFilterTarget) => void;
}) {
  const data = getStatusBreakdown(alerts).map((item) => ({
    name: item.label,
    status: item.status,
    count: item.count,
  }));

  return (
    <Panel>
      <PanelHeading title="Status breakdown" />
      <ChartContainer
        config={statusChartConfig}
        className="[aspect-ratio:auto] h-[220px] w-full"
      >
        <BarChart
          accessibilityLayer
          data={data}
          margin={{ top: 8, right: 8, left: 4, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10 }}
            interval={0}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10 }}
            width={40}
            allowDecimals={false}
            tickFormatter={(value) => compactNumber.format(Number(value))}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar
            dataKey="count"
            fill="var(--color-count)"
            radius={[4, 4, 0, 0]}
            isAnimationActive={false}
            cursor="pointer"
          >
            {data.map((entry) => (
              <Cell
                key={entry.status}
                className="cursor-pointer"
                onClick={() =>
                  onFilter({ type: "status", status: entry.status })
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
    </Panel>
  );
}

function TriageFocusCard({
  alerts,
  onFilter,
}: {
  alerts: Iterable<SocAlert>;
  onFilter: (target: OverviewFilterTarget) => void;
}) {
  const focusAlerts = useMemo(
    () => getTriageFocusAlerts(alerts, 6),
    [alerts],
  );

  const { unassignedOpen, criticalHighOpen, mineOpen } = useMemo(() => {
    let unassigned = 0;
    let criticalHigh = 0;
    let mine = 0;
    for (const alert of alerts) {
      if (!openAlertStatuses.includes(alert.status)) continue;
      if (alert.assigneeId === null) unassigned += 1;
      if (alert.severity === "critical" || alert.severity === "high") {
        criticalHigh += 1;
      }
      if (alert.assigneeId === currentAnalystId) mine += 1;
    }
    return {
      unassignedOpen: unassigned,
      criticalHighOpen: criticalHigh,
      mineOpen: mine,
    };
  }, [alerts]);

  return (
    <Panel>
      <PanelHeading title="Triage focus" />

      <div className="mb-4 grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => onFilter({ type: "critical-high-open" })}
          className="border-border hover:bg-accent rounded-md border px-2.5 py-2 text-left transition-colors"
        >
          <p className="text-muted-foreground text-xs">Crit / high</p>
          <p className="mt-1 text-lg leading-none font-semibold tabular-nums">
            {criticalHighOpen}
          </p>
        </button>
        <button
          type="button"
          onClick={() => onFilter({ type: "assigned", scope: "unassigned" })}
          className="border-border hover:bg-accent rounded-md border px-2.5 py-2 text-left transition-colors"
        >
          <p className="text-muted-foreground text-xs">Unassigned</p>
          <p className="text-destructive mt-1 text-lg leading-none font-semibold tabular-nums">
            {unassignedOpen}
          </p>
        </button>
        <button
          type="button"
          onClick={() => onFilter({ type: "assigned", scope: "mine" })}
          className="border-border hover:bg-accent rounded-md border px-2.5 py-2 text-left transition-colors"
        >
          <p className="text-muted-foreground text-xs">Mine open</p>
          <p className="mt-1 text-lg leading-none font-semibold tabular-nums">
            {mineOpen}
          </p>
        </button>
      </div>

      {focusAlerts.length === 0 ? (
        <p className="text-muted-foreground py-6 text-center text-sm">
          No open alerts
        </p>
      ) : (
        <ul className="divide-border/70 divide-y">
          {focusAlerts.map((alert) => (
            <li key={alert.id}>
              <Link
                href={`/alerts/${alert.id}`}
                className="hover:bg-accent/40 -mx-1 flex items-start gap-2.5 rounded-md px-1 py-2.5 transition-colors"
              >
                <SeverityBadge severity={alert.severity} />
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="truncate text-sm font-medium">{alert.title}</p>
                  <p className="text-muted-foreground truncate text-xs">
                    <span className="font-mono">{alert.id}</span>
                    <span className="mx-1.5">·</span>
                    <span className="tabular-nums">{alert.ageLabel}</span>
                    <span className="mx-1.5">·</span>
                    <span>
                      {alert.assigneeId === null
                        ? "Unassigned"
                        : alert.sourceName}
                    </span>
                  </p>
                </div>
                <StatusBadge status={alert.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-3 flex flex-wrap gap-2 border-t pt-3">
        <button
          type="button"
          onClick={() => onFilter({ type: "assigned", scope: "unassigned" })}
          className="text-muted-foreground hover:text-foreground text-xs font-medium underline-offset-2 hover:underline"
        >
          Unassigned queue
        </button>
        <span className="text-muted-foreground/50">·</span>
        <button
          type="button"
          onClick={() => onFilter({ type: "assigned", scope: "mine" })}
          className="text-muted-foreground hover:text-foreground text-xs font-medium underline-offset-2 hover:underline"
        >
          My alerts
        </button>
        <span className="text-muted-foreground/50">·</span>
        <button
          type="button"
          onClick={() => onFilter({ type: "open" })}
          className="text-muted-foreground hover:text-foreground text-xs font-medium underline-offset-2 hover:underline"
        >
          All open
        </button>
      </div>
    </Panel>
  );
}

function AnalystLoadCard({
  alerts,
  onFilter,
}: {
  alerts: Iterable<SocAlert>;
  onFilter: (target: OverviewFilterTarget) => void;
}) {
  const data = getAnalystWorkload(alerts).slice(0, 8);

  return (
    <Panel>
      <PanelHeading title="Analyst load" />
      {data.length === 0 ? (
        <p className="text-muted-foreground py-6 text-center text-sm">
          No open alerts
        </p>
      ) : (
        <ul className="space-y-2.5">
          {data.map((row) => {
            const max = data[0]?.count ?? 1;
            const width = Math.max(8, Math.round((row.count / max) * 100));
            const scope =
              row.assigneeId === "unassigned"
                ? ("unassigned" as const)
                : row.assigneeId === currentAnalystId
                  ? ("mine" as const)
                  : row.assigneeId;
            return (
              <li key={row.assigneeId}>
                <button
                  type="button"
                  onClick={() => onFilter({ type: "assigned", scope })}
                  className="hover:bg-accent/50 w-full space-y-1 rounded-md px-1 py-0.5 text-left transition-colors"
                >
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="truncate font-medium">{row.name}</span>
                    <span className="text-muted-foreground tabular-nums">
                      {row.count}
                    </span>
                  </div>
                  <div className="bg-muted h-1.5 overflow-hidden rounded-full">
                    <div
                      className="bg-foreground/70 h-full rounded-full"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}

export function AlertsOverview({
  alerts,
  onFilter,
}: {
  alerts: Iterable<SocAlert>;
  onFilter: (target: OverviewFilterTarget) => void;
}) {
  const [range, setRange] = useState<AlertsOverviewRange>("7d");
  const rangedAlerts = useMemo(
    () => filterAlertsByOverviewRange(alerts, range),
    [alerts, range],
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end">
        <OverviewRangeControl value={range} onChange={setRange} />
      </div>
      <OverviewSplit
        primary={<AlertsOverTimeCard range={range} />}
        secondary={
          <SeverityDistributionCard
            alerts={rangedAlerts}
            onFilter={onFilter}
          />
        }
      />
      <OverviewSplit
        wide="secondary"
        primary={
          <TopSourcesCard alerts={rangedAlerts} onFilter={onFilter} />
        }
        secondary={
          <StatusBreakdownCard alerts={rangedAlerts} onFilter={onFilter} />
        }
      />
      <OverviewSplit
        primary={
          <TriageFocusCard alerts={rangedAlerts} onFilter={onFilter} />
        }
        secondary={
          <AnalystLoadCard alerts={rangedAlerts} onFilter={onFilter} />
        }
      />
    </div>
  );
}

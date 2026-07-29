"use client";

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

import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";

import {
  type AlertsOverviewRange,
  alertsOverviewRangeLabels,
  alertsOverviewRanges,
  filterAlertsByOverviewRange,
  getAlertsBySource,
  getAlertsOverTime,
  getSeverityBreakdown,
  getStatusBreakdown,
  type SocAlert,
} from "./alerts-data";
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

function Panel({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn("bg-card rounded-lg border p-4", className)}>
      {children}
    </section>
  );
}

function PanelHeading({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-sm font-semibold">{title}</h2>
        {description ? (
          <p className="text-muted-foreground mt-1 text-xs">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

function OverviewRangeControl({
  value,
  onChange,
}: {
  value: AlertsOverviewRange;
  onChange: (range: AlertsOverviewRange) => void;
}) {
  return (
    <div className="bg-muted/60 inline-flex rounded-md border p-0.5">
      {alertsOverviewRanges.map((range) => {
        const active = value === range;
        return (
          <button
            key={range}
            type="button"
            onClick={() => onChange(range)}
            className={cn(
              "rounded-sm px-2.5 py-1 text-xs font-medium transition-colors",
              active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {alertsOverviewRangeLabels[range]}
          </button>
        );
      })}
    </div>
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
    <Panel className="flex flex-col xl:col-span-2">
      <PanelHeading
        title="Alerts over time"
        description="Stacked daily totals by severity · top edge is the day total"
        action={
          <div className="text-right">
            <p className="text-2xl leading-none font-semibold tabular-nums">
              {latestTotal}
            </p>
            <p className="text-muted-foreground mt-1 text-[11px]">
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
                    | { critical?: number; high?: number; medium?: number; low?: number }
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
          {/* Low at the bottom, critical on top — top edge = daily total. */}
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
      <PanelHeading
        title="Severity distribution"
        description="Tap a slice to open matching alerts"
      />
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
            <span className="text-muted-foreground text-[11px]">alerts</span>
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
      <PanelHeading
        title="Top sources"
        description="Tap a source to open its alerts"
      />
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
    <Panel className="xl:col-span-2">
      <PanelHeading
        title="Status breakdown"
        description="Tap a status to open matching alerts"
      />
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
      <div className="flex items-center justify-between gap-3">
        <p className="text-muted-foreground text-xs">
          Charts reflect the selected lookback window
        </p>
        <OverviewRangeControl value={range} onChange={setRange} />
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        <AlertsOverTimeCard range={range} />
        <SeverityDistributionCard alerts={rangedAlerts} onFilter={onFilter} />
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        <TopSourcesCard alerts={rangedAlerts} onFilter={onFilter} />
        <StatusBreakdownCard alerts={rangedAlerts} onFilter={onFilter} />
      </div>
    </div>
  );
}

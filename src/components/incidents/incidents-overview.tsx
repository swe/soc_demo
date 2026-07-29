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
  type IncidentsOverviewRange,
  incidentsOverviewRangeLabels,
  incidentsOverviewRanges,
  filterIncidentsByOverviewRange,
  getAgingBreakdown,
  getCasesOpenedOverTime,
  getContainmentFocusCases,
  getIncidentSlaRemainingLabel,
  getIncidentSlaState,
  getPriorityBreakdown,
  getResponderWorkload,
  getStatusBreakdown,
  openIncidentStatuses,
  type SocIncident,
} from "./incidents-data";
import { type OverviewFilterTarget } from "./incidents-url";
import { PriorityBadge, SlaBadge } from "./incidents-primitives";
import Link from "next/link";

const compactNumber = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const priorityChartConfig = {
  p1: {
    label: "P1",
    theme: { light: "#dc2626", dark: "#f87171" },
  },
  p2: {
    label: "P2",
    theme: { light: "#ea580c", dark: "#fb923c" },
  },
  p3: {
    label: "P3",
    theme: { light: "#d97706", dark: "#fbbf24" },
  },
  p4: {
    label: "P4",
    theme: { light: "#2563eb", dark: "#60a5fa" },
  },
} satisfies ChartConfig;

const priorityDonutConfig = {
  P1: { label: "P1", color: "#dc2626" },
  P2: { label: "P2", color: "#ea580c" },
  P3: { label: "P3", color: "#d97706" },
  P4: { label: "P4", color: "#2563eb" },
} satisfies ChartConfig;

const agingChartConfig = {
  count: {
    label: "Open cases",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

const phaseChartConfig = {
  count: {
    label: "Cases",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

const priorityColors: Record<string, string> = {
  P1: "#dc2626",
  P2: "#ea580c",
  P3: "#d97706",
  P4: "#2563eb",
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
  value: IncidentsOverviewRange;
  onChange: (range: IncidentsOverviewRange) => void;
}) {
  return (
    <div className="bg-muted/60 inline-flex rounded-md border p-0.5">
      {incidentsOverviewRanges.map((range) => {
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
            {incidentsOverviewRangeLabels[range]}
          </button>
        );
      })}
    </div>
  );
}

function CasesOpenedCard({
  incidents,
  range,
}: {
  incidents: Iterable<SocIncident>;
  range: IncidentsOverviewRange;
}) {
  const data = useMemo(
    () => getCasesOpenedOverTime(incidents, range),
    [incidents, range],
  );
  const latest = data[data.length - 1];
  const latestTotal = latest
    ? latest.p1 + latest.p2 + latest.p3 + latest.p4
    : 0;
  const xInterval = range === "30d" ? 3 : range === "14d" ? 1 : 0;
  const rangeLabel = incidentsOverviewRangeLabels[range];

  return (
    <Panel className="flex flex-col xl:col-span-2">
      <PanelHeading
        title="Cases opened"
        description={`Daily openings by priority · last ${rangeLabel}`}
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
        config={priorityChartConfig}
        className="[aspect-ratio:auto] h-[220px] w-full"
      >
        <AreaChart
          accessibilityLayer
          data={data}
          margin={{ top: 8, right: 8, left: 4, bottom: 0 }}
        >
          <defs>
            {(["p4", "p3", "p2", "p1"] as const).map((key) => (
              <linearGradient
                key={key}
                id={`incident-pri-${key}`}
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
                    | { p1?: number; p2?: number; p3?: number; p4?: number }
                    | undefined;
                  const total = point
                    ? (point.p1 ?? 0) +
                      (point.p2 ?? 0) +
                      (point.p3 ?? 0) +
                      (point.p4 ?? 0)
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
            dataKey="p4"
            stackId="pri"
            stroke="var(--color-p4)"
            fill="url(#incident-pri-p4)"
            strokeWidth={1.5}
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="p3"
            stackId="pri"
            stroke="var(--color-p3)"
            fill="url(#incident-pri-p3)"
            strokeWidth={1.5}
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="p2"
            stackId="pri"
            stroke="var(--color-p2)"
            fill="url(#incident-pri-p2)"
            strokeWidth={1.5}
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="p1"
            stackId="pri"
            stroke="var(--color-p1)"
            fill="url(#incident-pri-p1)"
            strokeWidth={1.5}
            isAnimationActive={false}
          />
        </AreaChart>
      </ChartContainer>
    </Panel>
  );
}

function PriorityDistributionCard({
  incidents,
  range,
  onFilter,
}: {
  incidents: Iterable<SocIncident>;
  range: IncidentsOverviewRange;
  onFilter: (target: OverviewFilterTarget) => void;
}) {
  const data = getPriorityBreakdown(incidents).map((item) => ({
    ...item,
    fill: priorityColors[item.priority],
  }));
  const total = data.reduce((sum, item) => sum + item.count, 0);
  const rangeLabel = incidentsOverviewRangeLabels[range];

  return (
    <Panel>
      <PanelHeading
        title="Priority mix"
        description={`Cases opened in last ${rangeLabel} · tap to filter`}
      />
      <div className="flex h-[220px] items-center gap-4">
        <div className="relative mx-auto aspect-square h-full max-h-[200px] min-h-0 flex-1">
          <ChartContainer
            config={priorityDonutConfig}
            className="aspect-square h-full w-full"
          >
            <PieChart>
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    nameKey="priority"
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
                    key={entry.priority}
                    fill={entry.fill}
                    className="cursor-pointer outline-none"
                    onClick={() =>
                      onFilter({ type: "priority", priority: entry.priority })
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
            <span className="text-muted-foreground text-[11px]">cases</span>
          </div>
        </div>
        <ul className="flex w-[108px] shrink-0 flex-col gap-2.5">
          {data.map((item) => (
            <li key={item.priority}>
              <button
                type="button"
                onClick={() =>
                  onFilter({ type: "priority", priority: item.priority })
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

function AgingQueueCard({
  incidents,
  range,
}: {
  incidents: Iterable<SocIncident>;
  range: IncidentsOverviewRange;
}) {
  const data = getAgingBreakdown(incidents);
  const rangeLabel = incidentsOverviewRangeLabels[range];

  return (
    <Panel>
      <PanelHeading
        title="Open case age"
        description={`Active cases from last ${rangeLabel}`}
      />
      <ChartContainer
        config={agingChartConfig}
        className="[aspect-ratio:auto] h-[220px] w-full"
      >
        <BarChart
          accessibilityLayer
          data={data}
          margin={{ top: 8, right: 8, left: 4, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="label"
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
          />
        </BarChart>
      </ChartContainer>
    </Panel>
  );
}

function ResponsePhaseCard({
  incidents,
  range,
  onFilter,
}: {
  incidents: Iterable<SocIncident>;
  range: IncidentsOverviewRange;
  onFilter: (target: OverviewFilterTarget) => void;
}) {
  const data = getStatusBreakdown(incidents).map((item) => ({
    name: item.label,
    status: item.status,
    count: item.count,
  }));
  const rangeLabel = incidentsOverviewRangeLabels[range];

  return (
    <Panel className="xl:col-span-2">
      <PanelHeading
        title="Response phases"
        description={`Lifecycle mix · last ${rangeLabel} · tap a phase to filter`}
      />
      <ChartContainer
        config={phaseChartConfig}
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

function ResponderLoadCard({
  incidents,
  range,
}: {
  incidents: Iterable<SocIncident>;
  range: IncidentsOverviewRange;
}) {
  const data = getResponderWorkload(incidents).slice(0, 6);
  const rangeLabel = incidentsOverviewRangeLabels[range];

  return (
    <Panel>
      <PanelHeading
        title="Responder load"
        description={`Open cases by owner · last ${rangeLabel}`}
      />
      {data.length === 0 ? (
        <p className="text-muted-foreground py-12 text-center text-sm">
          No open cases in this window
        </p>
      ) : (
        <ul className="space-y-2.5">
          {data.map((row) => {
            const max = data[0]?.count ?? 1;
            const width = Math.max(8, Math.round((row.count / max) * 100));
            return (
              <li key={row.assigneeId} className="space-y-1">
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
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}

function ContainmentFocusCard({
  incidents,
  range,
  onFilter,
}: {
  incidents: Iterable<SocIncident>;
  range: IncidentsOverviewRange;
  onFilter: (target: OverviewFilterTarget) => void;
}) {
  const rangeLabel = incidentsOverviewRangeLabels[range];
  const focusCases = useMemo(
    () => getContainmentFocusCases(incidents, 5),
    [incidents],
  );

  const { breached, atRisk, p1Open } = useMemo(() => {
    let breachedCount = 0;
    let atRiskCount = 0;
    let p1 = 0;
    for (const incident of incidents) {
      if (!openIncidentStatuses.includes(incident.status)) continue;
      const sla = getIncidentSlaState(incident);
      if (sla === "breached") breachedCount += 1;
      if (sla === "at-risk") atRiskCount += 1;
      if (incident.priority === "P1") p1 += 1;
    }
    return { breached: breachedCount, atRisk: atRiskCount, p1Open: p1 };
  }, [incidents]);

  return (
    <Panel className="xl:col-span-2 flex flex-col">
      <PanelHeading
        title="Containment focus"
        description={`Highest-urgency queue · last ${rangeLabel}`}
      />

      <div className="mb-4 grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => onFilter({ type: "p1p2" })}
          className="border-border hover:bg-accent rounded-md border px-2.5 py-2 text-left transition-colors"
        >
          <p className="text-muted-foreground text-[11px]">P1 open</p>
          <p className="text-lg font-semibold tabular-nums leading-none mt-1">
            {p1Open}
          </p>
        </button>
        <button
          type="button"
          onClick={() => onFilter({ type: "p1p2" })}
          className="border-border hover:bg-accent rounded-md border px-2.5 py-2 text-left transition-colors"
        >
          <p className="text-muted-foreground text-[11px]">SLA at risk</p>
          <p className="text-lg font-semibold tabular-nums leading-none mt-1 text-amber-700 dark:text-amber-400">
            {atRisk}
          </p>
        </button>
        <button
          type="button"
          onClick={() => onFilter({ type: "p1p2" })}
          className="border-border hover:bg-accent rounded-md border px-2.5 py-2 text-left transition-colors"
        >
          <p className="text-muted-foreground text-[11px]">SLA breached</p>
          <p className="text-lg font-semibold tabular-nums leading-none mt-1 text-destructive">
            {breached}
          </p>
        </button>
      </div>

      {focusCases.length === 0 ? (
        <p className="text-muted-foreground flex flex-1 items-center justify-center py-8 text-center text-sm">
          No P1 or SLA-risk cases in this window
        </p>
      ) : (
        <ul className="divide-border/70 divide-y">
          {focusCases.map((incident) => {
            const sla = getIncidentSlaState(incident);
            return (
              <li key={incident.id}>
                <Link
                  href={`/incidents/${incident.id}`}
                  className="hover:bg-accent/40 -mx-1 flex items-start gap-2.5 rounded-md px-1 py-2.5 transition-colors"
                >
                  <PriorityBadge priority={incident.priority} />
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="truncate text-sm font-medium">
                      {incident.title}
                    </p>
                    <p className="text-muted-foreground truncate text-xs">
                      <span className="font-mono">{incident.id}</span>
                      <span className="mx-1.5">·</span>
                      <span className="tabular-nums">{incident.ageLabel}</span>
                      <span className="mx-1.5">·</span>
                      <span>
                        {incident.alertIds.length} alert
                        {incident.alertIds.length === 1 ? "" : "s"}
                      </span>
                    </p>
                  </div>
                  <SlaBadge
                    state={sla}
                    label={getIncidentSlaRemainingLabel(incident)}
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-3 flex flex-wrap gap-2 border-t pt-3">
        <button
          type="button"
          onClick={() => onFilter({ type: "p1p2" })}
          className="text-muted-foreground hover:text-foreground text-xs font-medium underline-offset-2 hover:underline"
        >
          Open P1 & P2 queue
        </button>
        <span className="text-muted-foreground/50">·</span>
        <button
          type="button"
          onClick={() =>
            onFilter({ type: "status", status: "investigating" })
          }
          className="text-muted-foreground hover:text-foreground text-xs font-medium underline-offset-2 hover:underline"
        >
          Investigating
        </button>
        <span className="text-muted-foreground/50">·</span>
        <button
          type="button"
          onClick={() => onFilter({ type: "status", status: "contained" })}
          className="text-muted-foreground hover:text-foreground text-xs font-medium underline-offset-2 hover:underline"
        >
          Contained
        </button>
      </div>
    </Panel>
  );
}

export function IncidentsOverview({
  incidents,
  onFilter,
}: {
  incidents: Iterable<SocIncident>;
  onFilter: (target: OverviewFilterTarget) => void;
}) {
  const [range, setRange] = useState<IncidentsOverviewRange>("7d");
  const rangedIncidents = useMemo(
    () => filterIncidentsByOverviewRange(incidents, range),
    [incidents, range],
  );
  const rangeLabel = incidentsOverviewRangeLabels[range];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-muted-foreground text-xs">
          All panels below use the <span className="text-foreground font-medium">{rangeLabel}</span> lookback
        </p>
        <OverviewRangeControl value={range} onChange={setRange} />
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        <CasesOpenedCard incidents={rangedIncidents} range={range} />
        <PriorityDistributionCard
          incidents={rangedIncidents}
          range={range}
          onFilter={onFilter}
        />
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        <AgingQueueCard incidents={rangedIncidents} range={range} />
        <ResponsePhaseCard
          incidents={rangedIncidents}
          range={range}
          onFilter={onFilter}
        />
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        <ResponderLoadCard incidents={rangedIncidents} range={range} />
        <ContainmentFocusCard
          incidents={rangedIncidents}
          range={range}
          onFilter={onFilter}
        />
      </div>
    </div>
  );
}

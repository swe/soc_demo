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
  type DarkWebExposure,
  type DarkWebOverviewRange,
  darkWebOverviewRangeLabels,
  darkWebOverviewRanges,
  filterExposuresByOverviewRange,
  getExposuresOverTime,
  getRecentCritical,
  getSeverityBreakdown,
  getTopAffectedDomains,
  getTypeBreakdown,
} from "./dark-web-data";
import {
  SeverityBadge,
} from "./dark-web-primitives";
import { type OverviewFilterTarget } from "./dark-web-url";

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
  critical: { label: "Critical", color: "#dc2626" },
  high: { label: "High", color: "#ea580c" },
  medium: { label: "Medium", color: "#d97706" },
  low: { label: "Low", color: "#2563eb" },
} satisfies ChartConfig;

const typeChartConfig = {
  count: { label: "Exposures", color: "var(--primary)" },
} satisfies ChartConfig;

const typeBarColors: Record<string, string> = {
  credential: "#0284c7",
  stealer: "#7c3aed",
  mention: "#d97706",
  ransomware: "#e11d48",
};

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
  value: DarkWebOverviewRange;
  onChange: (range: DarkWebOverviewRange) => void;
}) {
  return (
    <div className="bg-muted/60 inline-flex rounded-md border p-0.5">
      {darkWebOverviewRanges.map((range) => {
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
            {darkWebOverviewRangeLabels[range]}
          </button>
        );
      })}
    </div>
  );
}

function ExposuresOverTimeCard({ range }: { range: DarkWebOverviewRange }) {
  const data = useMemo(() => getExposuresOverTime(range), [range]);
  const latest = data[data.length - 1];
  const latestTotal = latest
    ? latest.critical + latest.high + latest.medium + latest.low
    : 0;
  const xInterval = range === "30d" ? 3 : range === "14d" ? 1 : 0;

  return (
    <Panel className="lg:col-span-2">
      <PanelHeading
        title="Exposures over time"
        description={`${compactNumber.format(latestTotal)} in the latest day · stacked by severity`}
      />
      <ChartContainer config={severityChartConfig} className="h-[220px] w-full">
        <AreaChart data={data} margin={{ left: 0, right: 8, top: 8 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="day"
            tickLine={false}
            axisLine={false}
            interval={xInterval}
            tickMargin={8}
            fontSize={11}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={28}
            allowDecimals={false}
            fontSize={11}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Area
            type="monotone"
            dataKey="critical"
            stackId="a"
            stroke="var(--color-critical)"
            fill="var(--color-critical)"
            fillOpacity={0.7}
          />
          <Area
            type="monotone"
            dataKey="high"
            stackId="a"
            stroke="var(--color-high)"
            fill="var(--color-high)"
            fillOpacity={0.7}
          />
          <Area
            type="monotone"
            dataKey="medium"
            stackId="a"
            stroke="var(--color-medium)"
            fill="var(--color-medium)"
            fillOpacity={0.7}
          />
          <Area
            type="monotone"
            dataKey="low"
            stackId="a"
            stroke="var(--color-low)"
            fill="var(--color-low)"
            fillOpacity={0.7}
          />
        </AreaChart>
      </ChartContainer>
    </Panel>
  );
}

function TypeBreakdownCard({
  exposures,
  onFilter,
}: {
  exposures: DarkWebExposure[];
  onFilter: (target: OverviewFilterTarget) => void;
}) {
  const data = useMemo(() => getTypeBreakdown(exposures), [exposures]);

  return (
    <Panel>
      <PanelHeading
        title="By type"
        description="Click a bar to open matching exposures"
      />
      <ChartContainer config={typeChartConfig} className="h-[220px] w-full">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ left: 4, right: 12, top: 4, bottom: 4 }}
        >
          <CartesianGrid horizontal={false} strokeDasharray="3 3" />
          <XAxis type="number" allowDecimals={false} hide />
          <YAxis
            type="category"
            dataKey="label"
            width={88}
            tickLine={false}
            axisLine={false}
            fontSize={11}
          />
          <ChartTooltip content={<ChartTooltipContent hideLabel />} />
          <Bar
            dataKey="count"
            radius={4}
            cursor="pointer"
            onClick={(entry) => {
              const type = (entry as { type?: string }).type;
              if (
                type === "credential" ||
                type === "stealer" ||
                type === "mention" ||
                type === "ransomware"
              ) {
                onFilter({ type: "exposureType", exposureType: type });
              }
            }}
          >
            {data.map((row) => (
              <Cell
                key={row.type}
                fill={typeBarColors[row.type] ?? "var(--primary)"}
              />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
    </Panel>
  );
}

function SeverityDonutCard({
  exposures,
  onFilter,
}: {
  exposures: DarkWebExposure[];
  onFilter: (target: OverviewFilterTarget) => void;
}) {
  const data = useMemo(() => getSeverityBreakdown(exposures), [exposures]);
  const total = data.reduce((sum, row) => sum + row.count, 0);

  return (
    <Panel>
      <PanelHeading
        title="Severity"
        description={`${total} exposures in range`}
      />
      <ChartContainer
        config={severityDonutConfig}
        className="mx-auto h-[200px] w-full max-w-[240px]"
      >
        <PieChart>
          <ChartTooltip content={<ChartTooltipContent hideLabel />} />
          <Pie
            data={data}
            dataKey="count"
            nameKey="severity"
            innerRadius={48}
            outerRadius={72}
            strokeWidth={2}
            cursor="pointer"
            onClick={(_, index) => {
              const row = data[index];
              if (row) {
                onFilter({ type: "severity", severity: row.severity });
              }
            }}
          >
            {data.map((row) => (
              <Cell
                key={row.severity}
                fill={severityBarColors[row.severity]}
              />
            ))}
          </Pie>
          <ChartLegend content={<ChartLegendContent nameKey="severity" />} />
        </PieChart>
      </ChartContainer>
    </Panel>
  );
}

function TopDomainsCard({
  exposures,
  onFilter,
}: {
  exposures: DarkWebExposure[];
  onFilter: (target: OverviewFilterTarget) => void;
}) {
  const data = useMemo(() => getTopAffectedDomains(exposures), [exposures]);

  return (
    <Panel>
      <PanelHeading
        title="Top affected domains"
        description="Most frequent watchlist matches"
      />
      <ul className="space-y-2">
        {data.map((row) => (
          <li key={row.domain}>
            <button
              type="button"
              onClick={() => onFilter({ type: "domain", domain: row.domain })}
              className="hover:bg-muted/60 flex w-full items-center justify-between gap-3 rounded-md border px-3 py-2 text-left text-sm transition-colors"
            >
              <span className="truncate font-medium">{row.domain}</span>
              <span className="text-muted-foreground tabular-nums">
                {row.count}
              </span>
            </button>
          </li>
        ))}
        {data.length === 0 ? (
          <li className="text-muted-foreground text-sm">No domain matches.</li>
        ) : null}
      </ul>
    </Panel>
  );
}

function RecentCriticalCard({
  exposures,
  onFilter,
  onOpenExposure,
}: {
  exposures: DarkWebExposure[];
  onFilter: (target: OverviewFilterTarget) => void;
  onOpenExposure: (id: string) => void;
}) {
  const items = useMemo(() => getRecentCritical(exposures), [exposures]);

  return (
    <Panel>
      <PanelHeading
        title="Recent critical"
        description="Open critical exposures"
        action={
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground text-xs font-medium"
            onClick={() => onFilter({ type: "openCritical" })}
          >
            View all
          </button>
        }
      />
      <ul className="divide-border/70 divide-y">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => onOpenExposure(item.id)}
              className="hover:bg-muted/40 flex w-full items-start gap-3 py-2.5 text-left transition-colors"
            >
              <div className="min-w-0 flex-1 space-y-1">
                <p className="truncate text-sm font-medium">{item.title}</p>
                <p className="text-muted-foreground truncate text-xs">
                  {item.principal ?? item.domain ?? item.source} ·{" "}
                  {item.firstSeenLabel}
                </p>
              </div>
              <SeverityBadge severity={item.severity} />
            </button>
          </li>
        ))}
        {items.length === 0 ? (
          <li className="text-muted-foreground py-6 text-center text-sm">
            No open critical exposures.
          </li>
        ) : null}
      </ul>
    </Panel>
  );
}

export function DarkWebOverview({
  exposures,
  onFilter,
  onOpenExposure,
}: {
  exposures: DarkWebExposure[];
  onFilter: (target: OverviewFilterTarget) => void;
  onOpenExposure: (id: string) => void;
}) {
  const [range, setRange] = useState<DarkWebOverviewRange>("14d");
  const ranged = useMemo(
    () => filterExposuresByOverviewRange(exposures, range),
    [exposures, range],
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-muted-foreground text-sm">
          Posture across watchlist-matched dark web findings
        </p>
        <OverviewRangeControl value={range} onChange={setRange} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <ExposuresOverTimeCard range={range} />
        <TypeBreakdownCard exposures={ranged} onFilter={onFilter} />
        <SeverityDonutCard exposures={ranged} onFilter={onFilter} />
        <TopDomainsCard exposures={ranged} onFilter={onFilter} />
        <RecentCriticalCard
          exposures={exposures}
          onFilter={onFilter}
          onOpenExposure={onOpenExposure}
        />
      </div>
    </div>
  );
}

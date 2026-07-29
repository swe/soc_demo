"use client";

import {
  AlertTriangle,
  CheckCircle2,
  CirclePause,
  Clock3,
  KeyRound,
  Link2,
  XCircle,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
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
  type ConnectorActivity,
  connectorActivity,
  getAverageCoverage,
  getAverageLatency,
  getCategoryCoverage,
  getHealthBreakdown,
  getIntegrationStats,
  getTopSourcesByVolume,
  ingestionVolumeTrend,
  type Integration,
  vendorMeta,
} from "./integrations-data";

const compactNumber = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const volumeChartConfig = {
  cloud: {
    label: "Cloud",
    theme: { light: "#f59e0b", dark: "#fbbf24" },
  },
  siem: {
    label: "SIEM",
    theme: { light: "#6366f1", dark: "#818cf8" },
  },
  identity: {
    label: "Identity",
    theme: { light: "#0ea5e9", dark: "#38bdf8" },
  },
  network: {
    label: "Network",
    theme: { light: "#10b981", dark: "#34d399" },
  },
  other: {
    label: "Other",
    theme: { light: "#a1a1aa", dark: "#71717a" },
  },
} satisfies ChartConfig;

const coverageChartConfig = {
  connected: {
    label: "Connected",
    color: "var(--primary)",
  },
  available: {
    label: "Available",
    theme: { light: "#d4d4d8", dark: "#3f3f46" },
  },
} satisfies ChartConfig;

const topSourcesChartConfig = {
  events: {
    label: "Events / day",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

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

function OverviewKpis({ integrations }: { integrations: Integration[] }) {
  const stats = getIntegrationStats(integrations);
  const latency = getAverageLatency(integrations);
  const coverage = getAverageCoverage(integrations);
  const failed = integrations.filter(
    (item) => item.status === "error" || item.health === "failed",
  ).length;

  const items = [
    {
      label: "Events / 24h",
      value: compactNumber.format(stats.eventsPerDay),
      detail: `${stats.connected} active pipelines`,
    },
    {
      label: "Avg latency",
      value: latency ? `${latency} ms` : "—",
      detail: "connector round-trip",
    },
    {
      label: "Coverage",
      value: `${coverage}%`,
      detail: "expected stream fill",
    },
    {
      label: "Failed syncs",
      value: failed.toString(),
      detail: failed ? "needs remediation" : "none open",
    },
  ];

  return (
    <div className="grid overflow-hidden rounded-lg border sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item, index) => (
        <div
          key={item.label}
          className={cn(
            "min-w-0 px-4 py-3",
            index > 0 && "border-t sm:border-t-0 sm:border-l",
            index === 2 && "sm:border-l-0 xl:border-l",
            index >= 2 && "sm:border-t xl:border-t-0",
          )}
        >
          <p className="text-muted-foreground text-xs">{item.label}</p>
          <p className="mt-1 text-xl font-semibold tabular-nums">
            {item.value}
          </p>
          <p className="text-muted-foreground mt-0.5 truncate text-xs">
            {item.detail}
          </p>
        </div>
      ))}
    </div>
  );
}

function IngestionVolumeCard() {
  const latest = ingestionVolumeTrend[ingestionVolumeTrend.length - 1];
  const currentK =
    (latest?.cloud ?? 0) +
    (latest?.siem ?? 0) +
    (latest?.identity ?? 0) +
    (latest?.network ?? 0) +
    (latest?.other ?? 0);

  return (
    <Panel className="flex flex-col xl:col-span-2">
      <PanelHeading
        title="Ingestion volume"
        description="Events / hour by category · last 24 hours"
        action={
          <div className="text-right">
            <p className="text-2xl leading-none font-semibold tabular-nums">
              {compactNumber.format(currentK * 1000)}
            </p>
            <p className="text-muted-foreground mt-1 text-[11px]">
              current hour
            </p>
          </div>
        }
      />
      <ChartContainer
        config={volumeChartConfig}
        className="[aspect-ratio:auto] h-[220px] w-full"
      >
        <AreaChart
          accessibilityLayer
          data={ingestionVolumeTrend}
          margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
        >
          <defs>
            {(["cloud", "siem", "identity", "network", "other"] as const).map(
              (key) => (
                <linearGradient
                  key={key}
                  id={`ingest-${key}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor={`var(--color-${key})`}
                    stopOpacity={0.35}
                  />
                  <stop
                    offset="100%"
                    stopColor={`var(--color-${key})`}
                    stopOpacity={0.04}
                  />
                </linearGradient>
              ),
            )}
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="hour"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10 }}
            dy={8}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10 }}
            width={40}
            tickFormatter={(value) => `${value}k`}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                indicator="dot"
                formatter={(value, name) => (
                  <div className="flex w-full items-center justify-between gap-6">
                    <span className="text-muted-foreground capitalize">
                      {String(name)}
                    </span>
                    <span className="font-mono tabular-nums">
                      {compactNumber.format(Number(value) * 1000)}
                    </span>
                  </div>
                )}
              />
            }
          />
          <ChartLegend content={<ChartLegendContent />} />
          <Area
            type="monotone"
            dataKey="cloud"
            stackId="ingest"
            stroke="var(--color-cloud)"
            fill="url(#ingest-cloud)"
            strokeWidth={1.5}
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="siem"
            stackId="ingest"
            stroke="var(--color-siem)"
            fill="url(#ingest-siem)"
            strokeWidth={1.5}
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="identity"
            stackId="ingest"
            stroke="var(--color-identity)"
            fill="url(#ingest-identity)"
            strokeWidth={1.5}
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="network"
            stackId="ingest"
            stroke="var(--color-network)"
            fill="url(#ingest-network)"
            strokeWidth={1.5}
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="other"
            stackId="ingest"
            stroke="var(--color-other)"
            fill="url(#ingest-other)"
            strokeWidth={1.5}
            isAnimationActive={false}
          />
        </AreaChart>
      </ChartContainer>
    </Panel>
  );
}

function HealthMixCard({
  integrations,
  onSelectFailed,
}: {
  integrations: Integration[];
  onSelectFailed: () => void;
}) {
  const breakdown = getHealthBreakdown(integrations);
  const total = integrations.length || 1;
  const active = breakdown.filter((item) => item.value > 0);

  return (
    <Panel>
      <PanelHeading
        title="Connection health"
        description="Live status across the catalog"
      />
      <div className="flex h-3 overflow-hidden rounded-full">
        {active.map((segment) => (
          <button
            key={segment.key}
            type="button"
            title={`${segment.label}: ${segment.value}`}
            className="h-full transition-opacity hover:opacity-80"
            style={{
              width: `${(segment.value / total) * 100}%`,
              backgroundColor: segment.color,
            }}
            onClick={() => {
              if (segment.key === "failed" || segment.key === "degraded") {
                onSelectFailed();
              }
            }}
          />
        ))}
      </div>
      <ul className="mt-4 space-y-2.5">
        {breakdown.map((segment) => (
          <li
            key={segment.key}
            className="flex items-center justify-between text-sm"
          >
            <span className="flex items-center gap-2">
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: segment.color }}
              />
              {segment.label}
            </span>
            <span className="font-mono text-xs tabular-nums">
              {segment.value}
              <span className="text-muted-foreground ml-1.5">
                ({Math.round((segment.value / total) * 100)}%)
              </span>
            </span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

function CategoryCoverageCard({
  integrations,
}: {
  integrations: Integration[];
}) {
  const coverage = getCategoryCoverage(integrations).filter(
    (item) => item.total > 0,
  );

  return (
    <Panel className="flex flex-col">
      <PanelHeading
        title="Coverage by category"
        description="Connected vs catalog remaining"
      />
      <ChartContainer
        config={coverageChartConfig}
        className="[aspect-ratio:auto] h-[220px] w-full"
      >
        <BarChart
          accessibilityLayer
          data={coverage}
          margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="shortLabel"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10 }}
            interval={0}
            angle={-20}
            textAnchor="end"
            height={48}
          />
          <YAxis
            allowDecimals={false}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10 }}
            width={28}
          />
          <ChartTooltip content={<ChartTooltipContent indicator="dashed" />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar
            dataKey="connected"
            stackId="coverage"
            fill="var(--color-connected)"
            radius={[0, 0, 0, 0]}
            isAnimationActive={false}
          />
          <Bar
            dataKey="available"
            stackId="coverage"
            fill="var(--color-available)"
            radius={[4, 4, 0, 0]}
            isAnimationActive={false}
          />
        </BarChart>
      </ChartContainer>
    </Panel>
  );
}

function TopSourcesCard({
  integrations,
  onSelect,
}: {
  integrations: Integration[];
  onSelect: (integration: Integration) => void;
}) {
  const top = getTopSourcesByVolume(integrations);
  const chartData = top.map((item) => ({
    id: item.id,
    name: item.name.replace(" Enterprise", "").replace(" Production", ""),
    events: item.eventsPerDay ?? 0,
    fill:
      item.health === "failed" || item.status === "error"
        ? "#dc2626"
        : item.health === "degraded"
          ? "#d97706"
          : "var(--color-events)",
  }));

  return (
    <Panel className="flex flex-col xl:col-span-2">
      <PanelHeading
        title="Top sources by volume"
        description="Highest telemetry producers in the last 24 hours"
      />
      <ChartContainer
        config={topSourcesChartConfig}
        className="[aspect-ratio:auto] h-[220px] w-full"
      >
        <BarChart
          accessibilityLayer
          data={chartData}
          layout="vertical"
          margin={{ top: 4, right: 16, left: 8, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis
            type="number"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10 }}
            tickFormatter={(value) => compactNumber.format(value)}
          />
          <YAxis
            type="category"
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11 }}
            width={108}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                indicator="line"
                formatter={(value) => (
                  <span className="font-mono tabular-nums">
                    {compactNumber.format(Number(value))} events / day
                  </span>
                )}
              />
            }
          />
          <Bar
            dataKey="events"
            radius={[0, 4, 4, 0]}
            isAnimationActive={false}
            cursor="pointer"
            onClick={(entry) => {
              const match = integrations.find(
                (item) => item.id === (entry as { id?: string }).id,
              );
              if (match) onSelect(match);
            }}
          >
            {chartData.map((entry) => (
              <Cell key={entry.id} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
      <div className="mt-2 flex flex-wrap gap-2">
        {top.slice(0, 4).map((item) => {
          const Icon = vendorMeta[item.vendorKey].icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item)}
              className="hover:bg-accent inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs transition-colors"
            >
              <Icon
                className="size-3"
                style={{
                  color:
                    vendorMeta[item.vendorKey].color === "currentColor"
                      ? undefined
                      : vendorMeta[item.vendorKey].color,
                }}
              />
              {item.name}
            </button>
          );
        })}
      </div>
    </Panel>
  );
}

function activityIcon(kind: ConnectorActivity["kind"]) {
  switch (kind) {
    case "error":
      return XCircle;
    case "credential":
      return KeyRound;
    case "connect":
      return Link2;
    case "pause":
      return CirclePause;
    default:
      return CheckCircle2;
  }
}

function activityTone(kind: ConnectorActivity["kind"]) {
  switch (kind) {
    case "error":
      return "text-destructive dark:text-red-400";
    case "pause":
      return "text-muted-foreground";
    case "credential":
      return "text-blue-600 dark:text-blue-400";
    case "connect":
      return "text-blue-600 dark:text-blue-400";
    default:
      return "text-green-600 dark:text-green-400";
  }
}

function ActivityFeed({
  integrations,
  onSelect,
}: {
  integrations: Integration[];
  onSelect: (integration: Integration) => void;
}) {
  return (
    <Panel className="flex flex-col">
      <PanelHeading
        title="Connector activity"
        description="Recent sync, credential, and health events"
      />
      <ul className="space-y-0 divide-y">
        {connectorActivity.map((event) => {
          const Icon = activityIcon(event.kind);
          const integration = integrations.find(
            (item) => item.id === event.integrationId,
          );
          return (
            <li key={event.id}>
              <button
                type="button"
                className="hover:bg-muted/40 flex w-full items-start gap-3 px-1 py-3 text-left transition-colors"
                onClick={() => {
                  if (integration) onSelect(integration);
                }}
                disabled={!integration}
              >
                <span
                  className={cn(
                    "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md border",
                    activityTone(event.kind),
                  )}
                >
                  <Icon className="size-3.5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-start justify-between gap-2">
                    <span className="text-sm font-medium">{event.title}</span>
                    <span className="text-muted-foreground shrink-0 text-[11px]">
                      {event.time}
                    </span>
                  </span>
                  <span className="text-muted-foreground mt-0.5 block text-xs leading-5">
                    {event.detail}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}

function AttentionPanel({
  integrations,
  onSelect,
}: {
  integrations: Integration[];
  onSelect: (integration: Integration) => void;
}) {
  const issues = integrations.filter(
    (item) =>
      item.status === "error" ||
      item.health === "degraded" ||
      item.health === "failed" ||
      item.status === "pending",
  );

  return (
    <Panel>
      <PanelHeading
        title="Needs attention"
        description="Failures, SLA drift, and validating connectors"
        action={
          <span className="bg-muted rounded-md px-1.5 py-0.5 font-mono text-xs tabular-nums">
            {issues.length}
          </span>
        }
      />
      {issues.length === 0 ? (
        <div className="text-muted-foreground flex min-h-28 items-center gap-2 text-sm">
          <CheckCircle2 className="size-4 text-green-600 dark:text-green-400" />
          All connected sources are within SLA.
        </div>
      ) : (
        <ul className="space-y-2">
          {issues.map((item) => {
            const Icon = vendorMeta[item.vendorKey].icon;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onSelect(item)}
                  className="hover:bg-muted/40 flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors"
                >
                  <div
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-md border",
                      vendorMeta[item.vendorKey].background,
                    )}
                  >
                    <Icon
                      className="size-4"
                      style={{
                        color:
                          vendorMeta[item.vendorKey].color === "currentColor"
                            ? undefined
                            : vendorMeta[item.vendorKey].color,
                      }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-sm font-medium">
                        {item.name}
                      </p>
                      {item.status === "error" || item.health === "failed" ? (
                        <XCircle className="size-3.5 shrink-0 text-destructive" />
                      ) : item.status === "pending" ? (
                        <Clock3 className="size-3.5 shrink-0 text-blue-600 dark:text-blue-400" />
                      ) : (
                        <AlertTriangle className="size-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
                      )}
                    </div>
                    <p className="text-muted-foreground mt-0.5 line-clamp-2 text-xs leading-5">
                      {item.errorMessage ??
                        (item.status === "pending"
                          ? "Access validation in progress."
                          : "Review connector health.")}
                    </p>
                    <div className="text-muted-foreground mt-2 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[11px] tabular-nums">
                      {item.latencyMs !== undefined ? (
                        <span>latency {item.latencyMs}ms</span>
                      ) : null}
                      {item.errorRate !== undefined ? (
                        <span>errors {item.errorRate}%</span>
                      ) : null}
                      {item.coveragePercent !== undefined ? (
                        <span>coverage {item.coveragePercent}%</span>
                      ) : null}
                    </div>
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

export function IntegrationsOverview({
  integrations,
  onSelectIntegration,
  onShowAttention,
}: {
  integrations: Integration[];
  onSelectIntegration: (integration: Integration) => void;
  onShowAttention: () => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <OverviewKpis integrations={integrations} />

      <div className="grid gap-4 xl:grid-cols-3">
        <IngestionVolumeCard />
        <HealthMixCard
          integrations={integrations}
          onSelectFailed={onShowAttention}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <CategoryCoverageCard integrations={integrations} />
        <TopSourcesCard
          integrations={integrations}
          onSelect={onSelectIntegration}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <AttentionPanel
          integrations={integrations}
          onSelect={onSelectIntegration}
        />
        <ActivityFeed
          integrations={integrations}
          onSelect={onSelectIntegration}
        />
      </div>
    </div>
  );
}

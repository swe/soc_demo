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
import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { CategoryBarChart } from "@/components/soc/charts/category-bar-chart";
import { ChartCard } from "@/components/soc/charts/chart-card";
import {
  chartMargin,
  compactNumber,
  gridProps,
  xAxisProps,
  yAxisProps,
} from "@/components/soc/charts/chart-palette";
import { DonutBreakdown } from "@/components/soc/charts/donut-breakdown";
import { TrendAreaChart } from "@/components/soc/charts/trend-area-chart";
import {
  OverviewSplit,
  Panel,
  PanelGrid,
  PanelHeading,
} from "@/components/soc/panel";
import { type SocStat,StatsStrip } from "@/components/soc/stats-strip";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  fieldMappingPreviews,
  getTelemetrySource,
  ingestPipelineStages,
} from "@/lib/source-registry";
import { cn } from "@/lib/utils";

import {
  type ConnectorActivity,
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
import { useIntegrationsSession } from "./integrations-session";

function IngestPipelinePanel() {
  return (
    <Panel>
      <PanelHeading title="Normalization pipeline" />
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {ingestPipelineStages.map((stage, index) => (
          <div
            key={stage.id}
            className="relative rounded-lg border px-3 py-2.5"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium">
                {index + 1}. {stage.label}
              </p>
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  stage.status === "healthy" ? "bg-success" : "bg-warning",
                )}
              />
            </div>
            <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
              {stage.description}
            </p>
            <p className="mt-2 text-xs font-medium tabular-nums">
              {stage.throughputLabel}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-4 overflow-hidden rounded-lg border">
        <div className="bg-muted/40 border-b px-3 py-2">
          <p className="text-xs font-medium">Field mapping preview</p>
          <p className="text-muted-foreground text-xs">
            Vendor fields → Heimdall common schema
          </p>
        </div>
        <ul className="divide-border divide-y">
          {fieldMappingPreviews.map((row) => {
            const source = getTelemetrySource(row.sourceId);
            return (
              <li
                key={`${row.sourceId}-${row.sourceField}`}
                className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,1fr)] gap-2 px-3 py-2 text-xs"
              >
                <span className="text-muted-foreground truncate">
                  {source?.shortName ?? row.sourceId}
                </span>
                <code className="truncate font-mono text-xs">
                  {row.sourceField}
                </code>
                <code className="text-foreground truncate font-mono text-xs">
                  → {row.heimdallField}
                </code>
                <span className="text-muted-foreground truncate">
                  {row.sample}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </Panel>
  );
}

/** Source categories, not statuses — each keeps its own hue. */
const volumeChartConfig = {
  cloud: { label: "Cloud", theme: { light: "#f59e0b", dark: "#fbbf24" } },
  siem: { label: "SIEM", theme: { light: "#6366f1", dark: "#818cf8" } },
  identity: { label: "Identity", theme: { light: "#0ea5e9", dark: "#38bdf8" } },
  network: { label: "Network", theme: { light: "#10b981", dark: "#34d399" } },
  other: { label: "Other", color: "var(--muted-foreground)" },
} satisfies ChartConfig;

const volumeSeries = [
  { key: "cloud" },
  { key: "siem" },
  { key: "identity" },
  { key: "network" },
  { key: "other" },
] as const;

const coverageChartConfig = {
  connected: { label: "Connected", color: "var(--primary)" },
  available: {
    label: "Available",
    color: "color-mix(in oklch, var(--muted-foreground) 30%, transparent)",
  },
} satisfies ChartConfig;

function OverviewKpis({ integrations }: { integrations: Integration[] }) {
  const stats = getIntegrationStats(integrations);
  const latency = getAverageLatency(integrations);
  const coverage = getAverageCoverage(integrations);
  const failed = integrations.filter(
    (item) => item.status === "error" || item.health === "failed",
  ).length;

  const items: SocStat[] = [
    {
      key: "events",
      title: "Events / 24h",
      value: compactNumber.format(stats.eventsPerDay),
      context: `${stats.connected} active pipelines`,
    },
    {
      key: "latency",
      title: "Avg latency",
      value: latency ? `${latency} ms` : "—",
      context: "connector round-trip",
    },
    {
      key: "coverage",
      title: "Coverage",
      value: `${coverage}%`,
      context: "expected stream fill",
    },
    {
      key: "failed",
      title: "Failed syncs",
      value: failed.toString(),
      context: failed ? "needs remediation" : "none open",
    },
  ];

  return <StatsStrip stats={items} />;
}

function IngestionVolumeCard() {
  // The trend is stored in thousands of events; chart in whole events.
  const data = useMemo(
    () =>
      ingestionVolumeTrend.map((point) => ({
        hour: point.hour,
        cloud: point.cloud * 1000,
        siem: point.siem * 1000,
        identity: point.identity * 1000,
        network: point.network * 1000,
        other: point.other * 1000,
      })),
    [],
  );
  const latest = data[data.length - 1];
  const current = latest
    ? latest.cloud + latest.siem + latest.identity + latest.network + latest.other
    : 0;

  return (
    <ChartCard
      title="Ingestion volume"
      description="Events per hour by source category"
      metric={{ value: compactNumber.format(current), label: "current hour" }}
      size="lg"
      status={data.length ? "ready" : "empty"}
    >
      <TrendAreaChart
        data={data}
        xKey="hour"
        series={volumeSeries}
        config={volumeChartConfig}
      />
    </ChartCard>
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

  return (
    <ChartCard
      title="Connection health"
      description="Degraded and failed open the attention queue"
      size="lg"
      status={integrations.length ? "ready" : "empty"}
    >
      <DonutBreakdown
        items={breakdown.filter((segment) => segment.value > 0)}
        totalLabel="sources"
        onSelect={(key) => {
          if (key === "failed" || key === "degraded") onSelectFailed();
        }}
      />
    </ChartCard>
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
    <ChartCard
      title="Coverage by category"
      description="Connected versus available connectors"
      size="lg"
      status={coverage.length ? "ready" : "empty"}
    >
      <ChartContainer
        config={coverageChartConfig}
        className="aspect-auto h-full w-full"
      >
        <BarChart accessibilityLayer data={coverage} margin={chartMargin}>
          <CartesianGrid {...gridProps} />
          <XAxis
            dataKey="shortLabel"
            {...xAxisProps}
            minTickGap={4}
            interval="preserveStartEnd"
          />
          <YAxis {...yAxisProps} />
          <ChartTooltip
            cursor={{ fill: "var(--muted)", opacity: 0.6 }}
            content={<ChartTooltipContent />}
          />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar
            dataKey="connected"
            stackId="coverage"
            fill="var(--color-connected)"
            maxBarSize={40}
            isAnimationActive={false}
          />
          <Bar
            dataKey="available"
            stackId="coverage"
            fill="var(--color-available)"
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
            isAnimationActive={false}
          />
        </BarChart>
      </ChartContainer>
    </ChartCard>
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
        ? "var(--destructive)"
        : item.health === "degraded"
          ? "var(--warning)"
          : "var(--primary)",
  }));

  return (
    <ChartCard
      title="Top sources by volume"
      description="Events per day · warning and failed sources tinted"
      size="lg"
      status={chartData.length ? "ready" : "empty"}
      footer={
        <div className="flex flex-wrap gap-2">
          {top.slice(0, 4).map((item) => {
            const Icon = vendorMeta[item.vendorKey].icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect(item)}
                className="pressable hover:bg-accent pointer-coarse:min-h-11 inline-flex min-h-8 items-center gap-1.5 rounded-md border px-2.5 text-xs"
              >
                <Icon
                  className="size-3.5"
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
      }
    >
      <CategoryBarChart
        data={chartData}
        categoryKey="name"
        valueKey="events"
        label="Events / day"
        orientation="horizontal"
        categoryWidth={112}
        colorFor={(row) => row.fill}
        onSelect={(row) => {
          const match = integrations.find((item) => item.id === row.id);
          if (match) onSelect(match);
        }}
      />
    </ChartCard>
  );
}

function activityIcon(kind: ConnectorActivity["kind"]) {
  switch (kind) {
    case "error":
      return XCircle;
    case "health":
      return AlertTriangle;
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
      return "text-destructive-text";
    case "health":
      return "text-warning-text";
    case "pause":
      return "text-muted-foreground";
    case "credential":
    case "connect":
      return "text-info-text";
    default:
      return "text-success-text";
  }
}

function ActivityFeed({
  integrations,
  activity,
  onSelect,
}: {
  integrations: Integration[];
  activity: ConnectorActivity[];
  onSelect: (integration: Integration) => void;
}) {
  return (
    <Panel className="flex flex-col">
      <PanelHeading title="Connector activity" />
      <ul className="divide-separator -mx-2 divide-y">
        {activity.slice(0, 8).map((event) => {
          const Icon = activityIcon(event.kind);
          const integration = integrations.find(
            (item) => item.id === event.integrationId,
          );
          return (
            <li key={event.id}>
              <button
                type="button"
                className="pressable hover:bg-accent/60 flex w-full items-start gap-3 rounded-md px-2 py-3 text-left disabled:pointer-events-none"
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
                    <span className="text-muted-foreground shrink-0 text-xs">
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
        action={
          <span className="bg-muted rounded-md px-1.5 py-0.5 font-mono text-xs tabular-nums">
            {issues.length}
          </span>
        }
      />
      {issues.length === 0 ? (
        <div className="text-muted-foreground flex min-h-28 items-center gap-2 text-sm">
          <CheckCircle2 className="text-success-text size-4" />
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
                  className="pressable hover:bg-accent/60 flex w-full items-start gap-3 rounded-lg border p-3 text-left"
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
                        <Clock3 className="text-info-text size-3.5 shrink-0" />
                      ) : (
                        <AlertTriangle className="text-warning-text size-3.5 shrink-0" />
                      )}
                    </div>
                    <p className="text-muted-foreground mt-0.5 line-clamp-2 text-xs leading-5">
                      {item.degradedReason?.summary ??
                        item.errorMessage ??
                        (item.status === "pending"
                          ? "Access validation in progress."
                          : "Review connector health.")}
                    </p>
                    {item.degradedReason ? (
                      <p className="text-muted-foreground mt-1 line-clamp-2 text-xs leading-4">
                        {item.degradedReason.detail}
                      </p>
                    ) : null}
                    <div className="text-muted-foreground mt-2 flex flex-wrap gap-x-3 gap-y-1 font-mono text-xs tabular-nums">
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
  const { activity } = useIntegrationsSession();

  return (
    <div className="flex flex-col gap-4">
      <OverviewKpis integrations={integrations} />

      <IngestPipelinePanel />

      <OverviewSplit
        primary={<IngestionVolumeCard />}
        secondary={
          <HealthMixCard
            integrations={integrations}
            onSelectFailed={onShowAttention}
          />
        }
      />

      <OverviewSplit
        primary={<CategoryCoverageCard integrations={integrations} />}
        secondary={
          <TopSourcesCard
            integrations={integrations}
            onSelect={onSelectIntegration}
          />
        }
      />

      <PanelGrid columns={2}>
        <AttentionPanel
          integrations={integrations}
          onSelect={onSelectIntegration}
        />
        <ActivityFeed
          integrations={integrations}
          activity={activity}
          onSelect={onSelectIntegration}
        />
      </PanelGrid>
    </div>
  );
}

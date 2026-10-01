"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { CategoryBarChart } from "@/components/soc/charts/category-bar-chart";
import { ChartCard } from "@/components/soc/charts/chart-card";
import {
  formatCompact,
  severityChartConfig,
  severityColor,
  type SeverityKey,
} from "@/components/soc/charts/chart-palette";
import { DonutBreakdown } from "@/components/soc/charts/donut-breakdown";
import { MetricTiles } from "@/components/soc/charts/metric-tiles";
import { RankedBarList } from "@/components/soc/charts/ranked-bar-list";
import { TrendAreaChart } from "@/components/soc/charts/trend-area-chart";
import { OverviewSplit, Panel, PanelHeading, PanelLink } from "@/components/soc/panel";
import { SegmentedControl } from "@/components/soc/segmented-control";

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

const severityStack = ["low", "medium", "high", "critical"].map((key) => ({ key }));

function AlertsOverTimeCard({ range }: { range: AlertsOverviewRange }) {
  const data = useMemo(() => getAlertsOverTime(range), [range]);
  const latest = data[data.length - 1];
  const latestTotal = latest
    ? latest.critical + latest.high + latest.medium + latest.low
    : 0;

  return (
    <ChartCard
      title="Alerts over time"
      description="Daily volume by severity"
      metric={{ value: formatCompact(latestTotal), label: "latest day" }}
      status={data.length === 0 ? "empty" : "ready"}
      size="lg"
    >
      <TrendAreaChart
        data={data}
        xKey="day"
        series={severityStack}
        config={severityChartConfig}
      />
    </ChartCard>
  );
}

function SeverityDistributionCard({
  alerts,
  onFilter,
}: {
  alerts: Iterable<SocAlert>;
  onFilter: (target: OverviewFilterTarget) => void;
}) {
  const items = getSeverityBreakdown(alerts).map((item) => ({
    key: item.severity,
    label: item.label,
    value: item.count,
    color: severityColor[item.severity as SeverityKey],
  }));
  const total = items.reduce((sum, item) => sum + item.value, 0);

  return (
    <ChartCard
      title="Severity distribution"
      status={total === 0 ? "empty" : "ready"}
      size="lg"
    >
      <DonutBreakdown
        items={items}
        totalLabel="alerts"
        onSelect={(severity) =>
          onFilter({ type: "severity", severity: severity as SocAlert["severity"] })
        }
      />
    </ChartCard>
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
      name: item.sourceName.replace(" Enterprise", "").replace(" Workforce", ""),
      sourceId: item.sourceId,
      count: item.count,
    }));

  return (
    <ChartCard
      title="Top sources"
      description="Alert volume by detection source"
      status={data.length === 0 ? "empty" : "ready"}
    >
      <CategoryBarChart
        data={data}
        categoryKey="name"
        label="Alerts"
        orientation="horizontal"
        categoryWidth={128}
        onSelect={(row) => onFilter({ type: "sourceId", sourceId: row.sourceId })}
      />
    </ChartCard>
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
    <ChartCard
      title="Status breakdown"
      status={data.every((row) => row.count === 0) ? "empty" : "ready"}
    >
      <CategoryBarChart
        data={data}
        categoryKey="name"
        label="Alerts"
        onSelect={(row) => onFilter({ type: "status", status: row.status })}
      />
    </ChartCard>
  );
}

function TriageFocusCard({
  alerts,
  onFilter,
}: {
  alerts: Iterable<SocAlert>;
  onFilter: (target: OverviewFilterTarget) => void;
}) {
  const focusAlerts = useMemo(() => getTriageFocusAlerts(alerts, 6), [alerts]);

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
    <Panel className="flex flex-col">
      <PanelHeading
        title="Triage focus"
        description="Open alerts that need an owner or fast action"
        action={<PanelLink onClick={() => onFilter({ type: "open" })}>All open</PanelLink>}
      />

      <MetricTiles
        className="mb-3"
        tiles={[
          {
            key: "critical-high",
            label: "Critical / high",
            value: criticalHighOpen,
            onSelect: () => onFilter({ type: "critical-high-open" }),
          },
          {
            key: "unassigned",
            label: "Unassigned",
            value: unassignedOpen,
            tone: unassignedOpen > 0 ? "critical" : "default",
            onSelect: () => onFilter({ type: "assigned", scope: "unassigned" }),
          },
          {
            key: "mine",
            label: "Mine open",
            value: mineOpen,
            onSelect: () => onFilter({ type: "assigned", scope: "mine" }),
          },
        ]}
      />

      {focusAlerts.length === 0 ? (
        <p className="text-muted-foreground py-8 text-center text-sm">No open alerts</p>
      ) : (
        <ul className="divide-separator -mx-2 divide-y">
          {focusAlerts.map((alert) => (
            <li key={alert.id}>
              <Link
                href={`/alerts/${alert.id}`}
                className="hover:bg-accent/50 flex items-start gap-3 rounded-md px-2 py-2.5 transition-colors"
              >
                <SeverityBadge severity={alert.severity} />
                <div className="min-w-0 flex-1 space-y-0.5">
                  <p className="truncate text-sm font-medium">{alert.title}</p>
                  <p className="text-muted-foreground truncate text-xs">
                    <span className="font-mono">{alert.id}</span>
                    <span className="mx-1.5">·</span>
                    <span className="tabular-nums">{alert.ageLabel}</span>
                    <span className="mx-1.5">·</span>
                    <span>
                      {alert.assigneeId === null ? "Unassigned" : alert.sourceName}
                    </span>
                  </p>
                </div>
                <StatusBadge status={alert.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}
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
      <PanelHeading title="Analyst load" description="Open alerts per owner" />
      <RankedBarList
        items={data.map((row) => ({
          key: row.assigneeId,
          label: row.name,
          value: row.count,
          color: row.assigneeId === "unassigned" ? "var(--muted-foreground)" : undefined,
        }))}
        emptyLabel="No open alerts"
        onSelect={(assigneeId) => {
          const scope =
            assigneeId === "unassigned"
              ? ("unassigned" as const)
              : assigneeId === currentAnalystId
                ? ("mine" as const)
                : assigneeId;
          onFilter({ type: "assigned", scope });
        }}
      />
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
        <SegmentedControl
          aria-label="Time range"
          value={range}
          onChange={setRange}
          options={alertsOverviewRanges.map((value) => ({
            value,
            label: alertsOverviewRangeLabels[value],
          }))}
        />
      </div>
      <OverviewSplit
        primary={<AlertsOverTimeCard range={range} />}
        secondary={<SeverityDistributionCard alerts={rangedAlerts} onFilter={onFilter} />}
      />
      <OverviewSplit
        wide="secondary"
        primary={<TopSourcesCard alerts={rangedAlerts} onFilter={onFilter} />}
        secondary={<StatusBreakdownCard alerts={rangedAlerts} onFilter={onFilter} />}
      />
      <OverviewSplit
        primary={<TriageFocusCard alerts={rangedAlerts} onFilter={onFilter} />}
        secondary={<AnalystLoadCard alerts={rangedAlerts} onFilter={onFilter} />}
      />
    </div>
  );
}

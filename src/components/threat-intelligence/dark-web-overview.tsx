"use client";

import { useMemo, useState } from "react";

import { CategoryBarChart } from "@/components/soc/charts/category-bar-chart";
import { ChartCard } from "@/components/soc/charts/chart-card";
import {
  severityChartConfig,
  severityColor,
} from "@/components/soc/charts/chart-palette";
import { DonutBreakdown } from "@/components/soc/charts/donut-breakdown";
import { RankedBarList } from "@/components/soc/charts/ranked-bar-list";
import { TrendAreaChart } from "@/components/soc/charts/trend-area-chart";
import {
  OverviewSplit,
  Panel,
  PanelGrid,
  PanelHeading,
  PanelLink,
} from "@/components/soc/panel";
import { SegmentedControl } from "@/components/soc/segmented-control";

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
import { SeverityBadge } from "./dark-web-primitives";
import { type OverviewFilterTarget } from "./dark-web-url";
import { EasmCorrelationPanel } from "./easm-correlation-panel";

/** Exposure categories, not severities — so they sit outside the severity ramp. */
const typeColors: Record<string, string> = {
  credential: "#0284c7",
  stealer: "#7c3aed",
  mention: "#d97706",
  ransomware: "#e11d48",
};

const exposureSeries = [
  { key: "low" },
  { key: "medium" },
  { key: "high" },
  { key: "critical" },
] as const;

function ExposuresOverTimeCard({ range }: { range: DarkWebOverviewRange }) {
  const data = useMemo(() => getExposuresOverTime(range), [range]);
  const latest = data[data.length - 1];
  const latestTotal = latest
    ? latest.critical + latest.high + latest.medium + latest.low
    : 0;

  return (
    <ChartCard
      title="Exposures over time"
      description="New exposures per day by severity"
      metric={{ value: latestTotal, label: "latest day" }}
      size="lg"
      status={data.length ? "ready" : "empty"}
    >
      <TrendAreaChart
        data={data}
        xKey="day"
        series={exposureSeries}
        config={severityChartConfig}
      />
    </ChartCard>
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
  const total = data.reduce((sum, row) => sum + row.count, 0);

  return (
    <ChartCard
      title="By type"
      description="Exposure categories in range"
      size="lg"
      status={total ? "ready" : "empty"}
    >
      <CategoryBarChart
        data={data}
        categoryKey="label"
        label="Exposures"
        orientation="horizontal"
        colorFor={(row) => typeColors[row.type] ?? "var(--primary)"}
        onSelect={(row) =>
          onFilter({ type: "exposureType", exposureType: row.type })
        }
      />
    </ChartCard>
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
  const items = data.map((row) => ({
    key: row.severity,
    label: row.label,
    value: row.count,
    color: severityColor[row.severity],
  }));
  const total = items.reduce((sum, item) => sum + item.value, 0);

  return (
    <ChartCard
      title="Severity"
      description="Share of exposures in range"
      status={total ? "ready" : "empty"}
    >
      <DonutBreakdown
        items={items}
        totalLabel="exposures"
        onSelect={(key) => {
          const row = data.find((entry) => entry.severity === key);
          if (row) onFilter({ type: "severity", severity: row.severity });
        }}
      />
    </ChartCard>
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
        description="Most exposed corporate domains"
      />
      <RankedBarList
        items={data.map((row) => ({
          key: row.domain,
          label: row.domain,
          value: row.count,
        }))}
        emptyLabel="No domain matches."
        onSelect={(domain) => onFilter({ type: "domain", domain })}
      />
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
          <PanelLink onClick={() => onFilter({ type: "openCritical" })}>
            View all
          </PanelLink>
        }
      />
      <ul className="divide-separator -mx-2 divide-y">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => onOpenExposure(item.id)}
              className="pressable hover:bg-accent/60 flex w-full items-start gap-3 rounded-md px-2 py-2.5 text-left"
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
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end">
        <SegmentedControl
          aria-label="Time range"
          value={range}
          onChange={setRange}
          options={darkWebOverviewRanges.map((value) => ({
            value,
            label: darkWebOverviewRangeLabels[value],
          }))}
        />
      </div>

      <OverviewSplit
        primary={<ExposuresOverTimeCard range={range} />}
        secondary={<TypeBreakdownCard exposures={ranged} onFilter={onFilter} />}
      />
      <PanelGrid columns={3}>
        <SeverityDonutCard exposures={ranged} onFilter={onFilter} />
        <TopDomainsCard exposures={ranged} onFilter={onFilter} />
        <RecentCriticalCard
          exposures={exposures}
          onFilter={onFilter}
          onOpenExposure={onOpenExposure}
        />
      </PanelGrid>

      <EasmCorrelationPanel
        exposureTitle="Dark web exposure correlation"
        tags={["credential", "leak", "domain"]}
      />
    </div>
  );
}

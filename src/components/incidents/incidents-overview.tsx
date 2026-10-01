"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { CategoryBarChart } from "@/components/soc/charts/category-bar-chart";
import { ChartCard } from "@/components/soc/charts/chart-card";
import {
  formatCompact,
  priorityChartConfig,
  priorityColor,
} from "@/components/soc/charts/chart-palette";
import { DonutBreakdown } from "@/components/soc/charts/donut-breakdown";
import { MetricTiles } from "@/components/soc/charts/metric-tiles";
import { RankedBarList } from "@/components/soc/charts/ranked-bar-list";
import { TrendAreaChart } from "@/components/soc/charts/trend-area-chart";
import { OverviewSplit, Panel, PanelHeading, PanelLink } from "@/components/soc/panel";
import { SegmentedControl } from "@/components/soc/segmented-control";

import {
  currentAnalystId,
  filterIncidentsByOverviewRange,
  getAgingBreakdown,
  getCasesOpenedOverTime,
  getContainmentFocusCases,
  getIncidentSlaRemainingLabel,
  getIncidentSlaState,
  getPriorityBreakdown,
  getResponderWorkload,
  getStatusBreakdown,
  type IncidentsOverviewRange,
  incidentsOverviewRangeLabels,
  incidentsOverviewRanges,
  openIncidentStatuses,
  type SocIncident,
} from "./incidents-data";
import { PriorityBadge, SlaBadge } from "./incidents-primitives";
import { type OverviewFilterTarget } from "./incidents-url";

const priorityStack = ["p4", "p3", "p2", "p1"].map((key) => ({ key }));

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
  const latestTotal = latest ? latest.p1 + latest.p2 + latest.p3 + latest.p4 : 0;

  return (
    <ChartCard
      title="Cases opened"
      description="Daily new cases by priority"
      metric={{ value: formatCompact(latestTotal), label: "latest day" }}
      status={data.length === 0 ? "empty" : "ready"}
      size="lg"
    >
      <TrendAreaChart
        data={data}
        xKey="day"
        series={priorityStack}
        config={priorityChartConfig}
      />
    </ChartCard>
  );
}

function PriorityDistributionCard({
  incidents,
  onFilter,
}: {
  incidents: Iterable<SocIncident>;
  onFilter: (target: OverviewFilterTarget) => void;
}) {
  const items = getPriorityBreakdown(incidents).map((item) => ({
    key: item.priority,
    label: item.label,
    value: item.count,
    color: priorityColor[item.priority],
  }));
  const total = items.reduce((sum, item) => sum + item.value, 0);

  return (
    <ChartCard title="Priority mix" status={total === 0 ? "empty" : "ready"} size="lg">
      <DonutBreakdown
        items={items}
        totalLabel="cases"
        onSelect={(priority) =>
          onFilter({ type: "priority", priority: priority as SocIncident["priority"] })
        }
      />
    </ChartCard>
  );
}

function AgingQueueCard({ incidents }: { incidents: Iterable<SocIncident> }) {
  const data = getAgingBreakdown(incidents);

  return (
    <ChartCard
      title="Open case age"
      description="How long open cases have been waiting"
      status={data.every((row) => row.count === 0) ? "empty" : "ready"}
    >
      <CategoryBarChart data={data} categoryKey="label" label="Open cases" />
    </ChartCard>
  );
}

function ResponsePhaseCard({
  incidents,
  onFilter,
}: {
  incidents: Iterable<SocIncident>;
  onFilter: (target: OverviewFilterTarget) => void;
}) {
  const data = getStatusBreakdown(incidents).map((item) => ({
    name: item.label,
    status: item.status,
    count: item.count,
  }));

  return (
    <ChartCard
      title="Response phases"
      status={data.every((row) => row.count === 0) ? "empty" : "ready"}
    >
      <CategoryBarChart
        data={data}
        categoryKey="name"
        label="Cases"
        orientation="horizontal"
        categoryWidth={104}
        onSelect={(row) => onFilter({ type: "status", status: row.status })}
      />
    </ChartCard>
  );
}

function ResponderLoadCard({
  incidents,
  onFilter,
}: {
  incidents: Iterable<SocIncident>;
  onFilter: (target: OverviewFilterTarget) => void;
}) {
  const data = getResponderWorkload(incidents).slice(0, 8);

  return (
    <Panel>
      <PanelHeading title="Responder load" description="Open cases per owner" />
      <RankedBarList
        items={data.map((row) => ({
          key: row.assigneeId,
          label: row.name,
          value: row.count,
          color: row.assigneeId === "unassigned" ? "var(--muted-foreground)" : undefined,
        }))}
        emptyLabel="No open cases"
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

function ContainmentFocusCard({
  incidents,
  onFilter,
}: {
  incidents: Iterable<SocIncident>;
  onFilter: (target: OverviewFilterTarget) => void;
}) {
  const focusCases = useMemo(() => getContainmentFocusCases(incidents, 5), [incidents]);

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
    <Panel className="flex flex-col">
      <PanelHeading
        title="Containment focus"
        description="P1 cases and SLA pressure"
        action={<PanelLink onClick={() => onFilter({ type: "p1p2" })}>P1 & P2</PanelLink>}
      />

      <MetricTiles
        className="mb-3"
        tiles={[
          {
            key: "p1",
            label: "P1 open",
            value: p1Open,
            onSelect: () => onFilter({ type: "priority", priority: "P1" }),
          },
          {
            key: "at-risk",
            label: "SLA at risk",
            value: atRisk,
            tone: atRisk > 0 ? "warning" : "default",
            onSelect: () => onFilter({ type: "p1p2" }),
          },
          {
            key: "breached",
            label: "SLA breached",
            value: breached,
            tone: breached > 0 ? "critical" : "default",
            onSelect: () => onFilter({ type: "p1p2" }),
          },
        ]}
      />

      {focusCases.length === 0 ? (
        <p className="text-muted-foreground py-8 text-center text-sm">
          No P1 or SLA-risk cases
        </p>
      ) : (
        <ul className="divide-separator -mx-2 divide-y">
          {focusCases.map((incident) => {
            const sla = getIncidentSlaState(incident);
            const alertCount = incident.alertIds.length;
            return (
              <li key={incident.id}>
                <Link
                  href={`/incidents/${incident.id}`}
                  className="hover:bg-accent/50 flex items-start gap-3 rounded-md px-2 py-2.5 transition-colors"
                >
                  <PriorityBadge priority={incident.priority} />
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <p className="truncate text-sm font-medium">{incident.title}</p>
                    <p className="text-muted-foreground truncate text-xs">
                      <span className="font-mono">{incident.id}</span>
                      <span className="mx-1.5">·</span>
                      <span className="tabular-nums">{incident.ageLabel}</span>
                      <span className="mx-1.5">·</span>
                      <span>
                        {alertCount} alert{alertCount === 1 ? "" : "s"}
                      </span>
                    </p>
                  </div>
                  <SlaBadge state={sla} label={getIncidentSlaRemainingLabel(incident)} />
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <div className="border-separator mt-auto flex flex-wrap gap-x-5 border-t pt-3">
        <PanelLink onClick={() => onFilter({ type: "assigned", scope: "unassigned" })}>
          Unassigned queue
        </PanelLink>
        <PanelLink onClick={() => onFilter({ type: "assigned", scope: "mine" })}>
          My cases
        </PanelLink>
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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end">
        <SegmentedControl
          aria-label="Time range"
          value={range}
          onChange={setRange}
          options={incidentsOverviewRanges.map((value) => ({
            value,
            label: incidentsOverviewRangeLabels[value],
          }))}
        />
      </div>
      <OverviewSplit
        primary={<CasesOpenedCard incidents={rangedIncidents} range={range} />}
        secondary={
          <PriorityDistributionCard incidents={rangedIncidents} onFilter={onFilter} />
        }
      />
      <OverviewSplit
        primary={<AgingQueueCard incidents={rangedIncidents} />}
        secondary={<ResponsePhaseCard incidents={rangedIncidents} onFilter={onFilter} />}
      />
      <OverviewSplit
        primary={<ContainmentFocusCard incidents={rangedIncidents} onFilter={onFilter} />}
        secondary={<ResponderLoadCard incidents={rangedIncidents} onFilter={onFilter} />}
      />
    </div>
  );
}

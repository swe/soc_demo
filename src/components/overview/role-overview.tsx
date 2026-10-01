"use client";

import { ArrowDownRight, ArrowUpRight, ChevronRight } from "lucide-react";
import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import { Area, AreaChart } from "recharts";

import { getAlertsOverTime } from "@/components/alerts/alerts-data";
import {
  getAlertSessionSnapshot,
  injectPulseCriticalAlert,
  subscribeAlertsSession,
} from "@/components/alerts/alerts-session";
import {
  formatAuditTime,
  getAuditLogEntries,
  subscribeAuditLog,
} from "@/components/audit/audit-log-data";
import { useSocRole } from "@/components/auth/soc-role-provider";
import {
  complianceScoreTarget,
  complianceScoreTrend,
} from "@/components/compliance/compliance-data";
import { getIncidentsOverTime } from "@/components/incidents/incidents-data";
import {
  getIncidentSessionSnapshot,
  subscribeIncidentsSession,
} from "@/components/incidents/incidents-session";
import { downloadExecutiveBoardPack } from "@/components/overview/executive-board-pack";
import { IdentityRiskWidget } from "@/components/overview/identity-risk-widget";
import {
  crossSourceAttention,
  IngestHealthStrip,
} from "@/components/overview/ingest-health-strip";
import {
  buildRoleOverview,
  type OverviewBreakdown,
  type OverviewKpi,
  type OverviewQueueItem,
} from "@/components/overview/overview-data";
import { PagerDutyOnCallPanel } from "@/components/overview/pagerduty-on-call-panel";
import { SocPerformancePanel } from "@/components/overview/soc-performance-panel";
import { UnifiedRiskQueue } from "@/components/overview/unified-risk-queue";
import { ChartCard } from "@/components/soc/charts/chart-card";
import {
  priorityChartConfig,
  severityChartConfig,
} from "@/components/soc/charts/chart-palette";
import { DonutBreakdown } from "@/components/soc/charts/donut-breakdown";
import { TrendAreaChart } from "@/components/soc/charts/trend-area-chart";
import { ModuleShell } from "@/components/soc/module-shell";
import { PageHeader } from "@/components/soc/page-header";
import {
  OverviewSplit,
  Panel,
  PanelGrid,
  PanelHeading,
  PanelLink,
} from "@/components/soc/panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type ChartConfig, ChartContainer } from "@/components/ui/chart";
import { socJobRoleLabels } from "@/lib/soc-roles";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

const percentFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
});

function Sparkline({ data, healthy }: { data: number[]; healthy: boolean }) {
  const config = {
    v: {
      label: "",
      color: healthy ? "var(--primary)" : "var(--destructive)",
    },
  } satisfies ChartConfig;
  const chartData = data.map((v, i) => ({ i, v }));

  return (
    <ChartContainer config={config} className="aspect-auto h-8 w-full">
      <AreaChart data={chartData} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
        <Area
          dataKey="v"
          type="monotone"
          stroke="var(--color-v)"
          strokeWidth={1.5}
          fill="var(--color-v)"
          fillOpacity={0.12}
          dot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ChartContainer>
  );
}

function KpiTile({ kpi }: { kpi: OverviewKpi }) {
  const hasDelta = typeof kpi.delta === "number";
  const isIncrease = (kpi.delta ?? 0) >= 0;
  const healthy = hasDelta
    ? kpi.preferLower
      ? !isIncrease
      : isIncrease
    : !kpi.preferLower;
  const DeltaIcon = isIncrease ? ArrowUpRight : ArrowDownRight;

  return (
    <div className="bg-card text-card-foreground shadow-card flex min-w-0 flex-col rounded-xl border p-3.5 sm:p-4">
      <p className="text-muted-foreground text-callout truncate font-medium">
        {kpi.title}
      </p>
      <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <p className="text-metric tabular-nums">{kpi.value}</p>
        {hasDelta ? (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 text-xs font-medium tabular-nums",
              healthy ? "text-success-text" : "text-destructive-text",
            )}
          >
            <DeltaIcon className="size-3.5" aria-hidden />
            {isIncrease ? "+" : ""}
            {percentFormatter.format(kpi.delta!)}%
          </span>
        ) : null}
      </div>
      <p className="text-muted-foreground mt-1 truncate text-xs">{kpi.context}</p>
      <div className="mt-auto pt-3" aria-hidden>
        <Sparkline data={kpi.spark} healthy={healthy} />
      </div>
    </div>
  );
}

const complianceChartConfig = {
  score: { label: "Score", color: "var(--primary)" },
  target: { label: "Target", color: "var(--muted-foreground)" },
} satisfies ChartConfig;

const alertSeries = [
  { key: "low" },
  { key: "medium" },
  { key: "high" },
  { key: "critical" },
] as const;

const incidentSeries = [
  { key: "p4" },
  { key: "p3" },
  { key: "p2" },
  { key: "p1" },
] as const;

const complianceSeries = [
  { key: "score" },
  { key: "target", dashed: true },
] as const;

const complianceDomain: [number, number] = [
  Math.max(0, complianceScoreTarget - 30),
  Math.min(100, complianceScoreTarget + 15),
];

const formatPercent = (value: unknown) => `${value}%`;

function TrendChart({
  kind,
  title,
}: {
  kind: "alerts" | "incidents" | "compliance";
  title: string;
}) {
  const alertData = useMemo(() => getAlertsOverTime("14d"), []);
  const incidentData = useMemo(() => getIncidentsOverTime("14d"), []);

  if (kind === "compliance") {
    const latestScore =
      complianceScoreTrend[complianceScoreTrend.length - 1]?.score ?? 0;
    return (
      <ChartCard
        title={title}
        description={`Monthly score against the ${complianceScoreTarget}% target`}
        metric={{ value: `${latestScore}%`, label: "latest month" }}
      >
        <TrendAreaChart
          data={complianceScoreTrend}
          xKey="month"
          series={complianceSeries}
          config={complianceChartConfig}
          stacked={false}
          yDomain={complianceDomain}
          yTickFormatter={formatPercent}
        />
      </ChartCard>
    );
  }

  if (kind === "incidents") {
    const latest = incidentData[incidentData.length - 1];
    const latestTotal = latest ? latest.p1 + latest.p2 + latest.p3 + latest.p4 : 0;
    return (
      <ChartCard
        title={title}
        description="Last 14 days by priority"
        metric={{ value: latestTotal, label: "latest day" }}
      >
        <TrendAreaChart
          data={incidentData}
          xKey="day"
          series={incidentSeries}
          config={priorityChartConfig}
        />
      </ChartCard>
    );
  }

  const latest = alertData[alertData.length - 1];
  const latestTotal = latest
    ? latest.critical + latest.high + latest.medium + latest.low
    : 0;
  return (
    <ChartCard
      title={title}
      description="Last 14 days by severity"
      metric={{ value: latestTotal, label: "latest day" }}
    >
      <TrendAreaChart
        data={alertData}
        xKey="day"
        series={alertSeries}
        config={severityChartConfig}
      />
    </ChartCard>
  );
}

function capitalize(label: string) {
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function BreakdownPanel({ breakdown }: { breakdown: OverviewBreakdown }) {
  const total = breakdown.items.reduce((sum, item) => sum + item.value, 0);

  return (
    <ChartCard
      title={breakdown.title}
      size="sm"
      status={total ? "ready" : "empty"}
      emptyTitle="Nothing to break down"
    >
      <DonutBreakdown
        items={breakdown.items.map((item) => ({
          ...item,
          label: capitalize(item.label),
        }))}
        totalLabel="total"
      />
    </ChartCard>
  );
}

const toneVariant = {
  critical: "critical",
  high: "high",
  medium: "medium",
  low: "muted",
  neutral: "muted",
} as const satisfies Record<NonNullable<OverviewQueueItem["tone"]>, string>;

function AttentionItem({ item }: { item: OverviewQueueItem }) {
  return (
    <Link
      href={item.href}
      className="pressable hover:bg-accent/60 flex min-h-11 items-center gap-3 rounded-md px-2 py-2"
    >
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          <p className="truncate text-sm font-medium">{item.title}</p>
          {item.tone ? (
            <Badge variant={toneVariant[item.tone]} className="capitalize">
              {item.tone}
            </Badge>
          ) : null}
        </div>
        <p className="text-muted-foreground truncate text-xs">
          {item.meta}
          {item.subtitle ? ` · ${item.subtitle}` : ""}
        </p>
      </div>
      <ChevronRight
        className="text-muted-foreground/70 size-4 shrink-0"
        aria-hidden
      />
    </Link>
  );
}

function AttentionList({
  items,
  emptyLabel,
  className,
}: {
  items: readonly OverviewQueueItem[];
  emptyLabel?: string;
  className?: string;
}) {
  return (
    <ul className={cn("divide-separator -mx-2 divide-y", className)}>
      {items.length === 0 ? (
        <li className="text-muted-foreground py-6 text-center text-sm">
          {emptyLabel}
        </li>
      ) : (
        items.map((item) => (
          <li key={item.id}>
            <AttentionItem item={item} />
          </li>
        ))
      )}
    </ul>
  );
}

export function RoleOverview() {
  const { effectiveRole, hydrated } = useSocRole();
  const alertStore = useSyncExternalStore(
    subscribeAlertsSession,
    getAlertSessionSnapshot,
    getAlertSessionSnapshot,
  );
  const incidentStore = useSyncExternalStore(
    subscribeIncidentsSession,
    getIncidentSessionSnapshot,
    getIncidentSessionSnapshot,
  );
  const model = useMemo(
    () =>
      buildRoleOverview(effectiveRole, {
        alerts: Array.from(alertStore.values()),
        incidents: Array.from(incidentStore.values()),
      }),
    [effectiveRole, alertStore, incidentStore],
  );
  const roleLabel = socJobRoleLabels[effectiveRole];
  const [tick, setTick] = useState(0);
  const [pulseAlertIds, setPulseAlertIds] = useState<string[]>([]);
  const auditEntries = useSyncExternalStore(
    subscribeAuditLog,
    getAuditLogEntries,
    getAuditLogEntries,
  );

  useEffect(() => {
    setPulseAlertIds([]);
    setTick(0);
  }, [effectiveRole]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setTick((current) => current + 1);
      setPulseAlertIds((current) => {
        if (current.length >= 3) return current;
        if (Math.random() > 0.45) return current;
        const alert = injectPulseCriticalAlert();
        return [alert.id, ...current].slice(0, 3);
      });
    }, 35_000);
    return () => window.clearInterval(id);
  }, [effectiveRole]);

  const pulseItems = useMemo((): OverviewQueueItem[] => {
    return pulseAlertIds
      .map((id) => alertStore.get(id))
      .filter((alert): alert is NonNullable<typeof alert> => Boolean(alert))
      .map((alert) => ({
        id: alert.id,
        title: alert.title,
        meta: "Live pulse · just now",
        subtitle: "Ingested into alert session",
        href: `/alerts/${alert.id}`,
        tone: "critical" as const,
      }));
  }, [pulseAlertIds, alertStore]);

  const queue = useMemo(
    () => [...pulseItems, ...model.queue].slice(0, 12),
    [pulseItems, model.queue],
  );

  const slaBurnLabel =
    tick === 0 ? "SLA clocks live" : `SLA clocks aged ×${tick}`;

  const isAnalyst =
    effectiveRole === "analyst_t1" ||
    effectiveRole === "analyst_t2" ||
    effectiveRole === "analyst_t3";
  const isLeadership = effectiveRole === "ciso" || effectiveRole === "c_level";
  const showOperations =
    effectiveRole === "ciso" || effectiveRole === "soc_manager" || isAnalyst;

  return (
    <ModuleShell>
      <PageHeader
        eyebrow={hydrated ? roleLabel : "…"}
        title={model.headline}
        description={
          <>
            {model.subhead}
            <span className="text-muted-foreground/80 mt-1 block text-xs">
              {slaBurnLabel}
            </span>
          </>
        }
        actions={
          <>
            {pulseItems.length > 0 ? (
              <Badge variant="critical">{pulseItems.length} live critical</Badge>
            ) : null}
            {hydrated && effectiveRole === "c_level" ? (
              <Button
                onClick={() => {
                  const filename = downloadExecutiveBoardPack();
                  toast({
                    title: "Board pack downloaded",
                    description: filename,
                  });
                }}
              >
                Download board pack
              </Button>
            ) : null}
          </>
        }
      />

      <section
        aria-label="Key metrics"
        className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4"
      >
        {model.kpis.map((kpi) => (
          <KpiTile key={kpi.key} kpi={kpi} />
        ))}
      </section>

      {(isLeadership ||
        effectiveRole === "soc_manager" ||
        effectiveRole === "analyst_t2" ||
        effectiveRole === "analyst_t3") && <IngestHealthStrip />}

      {isLeadership && <UnifiedRiskQueue />}

      {(isLeadership || effectiveRole === "soc_manager") && (
        <SocPerformancePanel />
      )}

      {showOperations && <PagerDutyOnCallPanel />}

      {showOperations && <IdentityRiskWidget />}

      {showOperations && (
        <Panel>
          <PanelHeading
            title="Cross-source attention"
            description="Cases correlated across Splunk, Sentinel, Defender, Okta, and more"
            action={
              <Badge variant="muted">{crossSourceAttention.length}</Badge>
            }
          />
          <AttentionList items={crossSourceAttention} />
        </Panel>
      )}

      <OverviewSplit
        primary={<TrendChart kind={model.chartKind} title={model.chartTitle} />}
        secondary={<BreakdownPanel breakdown={model.primaryBreakdown} />}
      />

      <PanelGrid columns={3}>
        <Panel className="flex flex-col">
          <PanelHeading
            title={model.queueTitle}
            action={<Badge variant="muted">{queue.length}</Badge>}
          />
          <AttentionList
            items={queue}
            emptyLabel="Nothing in this queue right now."
            className="max-h-[360px] overflow-y-auto"
          />
        </Panel>

        <Panel>
          <PanelHeading title="Insights" />
          <ul className="divide-separator divide-y">
            {model.insights.map((insight) => (
              <li key={insight.title} className="space-y-1 py-3 first:pt-0 last:pb-0">
                <p className="text-sm font-medium">{insight.title}</p>
                <p className="text-muted-foreground text-callout">
                  {insight.body}
                </p>
                {insight.href ? (
                  <PanelLink href={insight.href}>Open</PanelLink>
                ) : null}
              </li>
            ))}
          </ul>
        </Panel>

        <div className="flex min-w-0 flex-col gap-4 md:col-span-2 md:grid md:grid-cols-2 xl:col-span-1 xl:flex">
          <BreakdownPanel breakdown={model.secondaryBreakdown} />
          <Panel>
            <PanelHeading title="Shortcuts" />
            <ul className="divide-separator -mx-2 divide-y">
              {model.shortcuts.map((shortcut) => (
                <li key={shortcut.href}>
                  <Link
                    href={shortcut.href}
                    className="pressable hover:bg-accent/60 flex min-h-11 items-center justify-between gap-2 rounded-md px-2 text-sm font-medium"
                  >
                    <span className="truncate">{shortcut.label}</span>
                    <ChevronRight
                      className="text-muted-foreground/70 size-4 shrink-0"
                      aria-hidden
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </PanelGrid>

      {hydrated &&
      (effectiveRole === "soc_manager" || effectiveRole === "ciso") ? (
        <Panel>
          <PanelHeading
            title="Recent activity"
            action={<PanelLink href="/administration/audit">Audit log</PanelLink>}
          />
          <ul className="divide-separator divide-y">
            {auditEntries.slice(0, 5).map((entry) => (
              <li
                key={entry.id}
                className="flex items-start justify-between gap-3 py-2.5 text-sm first:pt-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{entry.detail}</p>
                  <p className="text-muted-foreground truncate text-xs">
                    {entry.actorName} · {entry.action}
                  </p>
                </div>
                <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
                  {formatAuditTime(entry.at)}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      ) : null}
    </ModuleShell>
  );
}

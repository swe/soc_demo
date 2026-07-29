"use client";

import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  ClipboardCheck,
  Crosshair,
  Radar,
  Shield,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";

import { useSocRole } from "@/components/auth/soc-role-provider";
import {
  buildRoleOverview,
  type OverviewBreakdown,
  type OverviewKpi,
  type OverviewQueueItem,
} from "@/components/overview/overview-data";
import { downloadExecutiveBoardPack } from "@/components/overview/executive-board-pack";
import {
  getAlertSessionSnapshot,
  injectPulseCriticalAlert,
  subscribeAlertsSession,
} from "@/components/alerts/alerts-session";
import {
  getIncidentSessionSnapshot,
  subscribeIncidentsSession,
} from "@/components/incidents/incidents-session";
import { getAlertsOverTime } from "@/components/alerts/alerts-data";
import {
  complianceScoreTarget,
  complianceScoreTrend,
} from "@/components/compliance/compliance-data";
import { getIncidentsOverTime } from "@/components/incidents/incidents-data";
import {
  formatAuditTime,
  getAuditLogEntries,
  subscribeAuditLog,
} from "@/components/audit/audit-log-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/lib/toast";
import { socJobRoleLabels } from "@/lib/soc-roles";
import { cn } from "@/lib/utils";

const compactNumber = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const kpiIcons: Record<string, LucideIcon> = {
  score: Shield,
  p1: AlertTriangle,
  mtta: Activity,
  mttc: Crosshair,
  findings: ClipboardCheck,
  exploitable: AlertTriangle,
  "mfa-risk": Shield,
  "open-alerts": Radar,
  active: Activity,
  sla: AlertTriangle,
  online: Activity,
  new: Radar,
  critical: AlertTriangle,
  escalated: AlertTriangle,
  investigating: Crosshair,
  incidents: Activity,
  "linked-vulns": AlertTriangle,
  "with-alerts": Radar,
  linked: Crosshair,
  passing: ClipboardCheck,
  milestone: ClipboardCheck,
};

function Delta({
  value,
  preferLower,
}: {
  value: number;
  preferLower?: boolean;
}) {
  const positive = preferLower ? value < 0 : value > 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-medium",
        positive
          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          : "bg-red-500/10 text-red-600 dark:text-red-400",
      )}
    >
      {value < 0 ? (
        <ArrowDownRight className="size-3" aria-hidden="true" />
      ) : (
        <ArrowUpRight className="size-3" aria-hidden="true" />
      )}
      {Math.abs(value).toFixed(1)}%
    </span>
  );
}

function Sparkline({
  data,
  positive,
  gradientId,
}: {
  data: number[];
  positive: boolean;
  gradientId: string;
}) {
  const config = {
    v: {
      label: "",
      color: positive ? "var(--primary)" : "var(--destructive)",
    },
  } satisfies ChartConfig;

  const chartData = data.map((v, i) => ({ i, v }));

  return (
    <ChartContainer config={config} className="h-8 w-full">
      <AreaChart
        data={chartData}
        margin={{ top: 1, right: 0, bottom: 0, left: 0 }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-v)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="var(--color-v)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          dataKey="v"
          type="monotone"
          stroke="var(--color-v)"
          strokeWidth={1.5}
          fill={`url(#${gradientId})`}
          dot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ChartContainer>
  );
}

function KpiCard({ kpi, index }: { kpi: OverviewKpi; index: number }) {
  const Icon = kpiIcons[kpi.key] ?? Activity;
  const sparkPositive =
    typeof kpi.delta === "number"
      ? kpi.preferLower
        ? kpi.delta < 0
        : kpi.delta > 0
      : !kpi.preferLower;

  return (
    <div className="bg-card flex flex-col gap-2 rounded-xl border p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <div className="bg-muted text-muted-foreground flex size-7 shrink-0 items-center justify-center rounded-lg">
            <Icon className="size-3.5" aria-hidden="true" />
          </div>
          <p className="text-muted-foreground truncate text-xs font-medium">
            {kpi.title}
          </p>
        </div>
        {typeof kpi.delta === "number" ? (
          <Delta value={kpi.delta} preferLower={kpi.preferLower} />
        ) : null}
      </div>
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-xl font-semibold tracking-tight tabular-nums">
          {kpi.value}
        </p>
        <p className="text-muted-foreground truncate text-[11px]">
          {kpi.context}
        </p>
      </div>
      <Sparkline
        data={kpi.spark}
        positive={sparkPositive}
        gradientId={`overview-spark-${kpi.key}-${index}`}
      />
    </div>
  );
}

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

const incidentChartConfig = {
  p1: { label: "P1", theme: { light: "#dc2626", dark: "#f87171" } },
  p2: { label: "P2", theme: { light: "#ea580c", dark: "#fb923c" } },
  p3: { label: "P3", theme: { light: "#d97706", dark: "#fbbf24" } },
  p4: { label: "P4", theme: { light: "#2563eb", dark: "#60a5fa" } },
} satisfies ChartConfig;

const complianceChartConfig = {
  score: { label: "Score", color: "var(--primary)" },
  target: { label: "Target", color: "var(--muted-foreground)" },
} satisfies ChartConfig;

function TrendChart({
  kind,
  title,
}: {
  kind: "alerts" | "incidents" | "compliance";
  title: string;
}) {
  const alertData = useMemo(() => getAlertsOverTime("14d"), []);
  const incidentData = useMemo(() => getIncidentsOverTime("14d"), []);
  const latestAlert = alertData[alertData.length - 1];
  const latestAlertTotal = latestAlert
    ? latestAlert.critical +
      latestAlert.high +
      latestAlert.medium +
      latestAlert.low
    : 0;
  const latestIncident = incidentData[incidentData.length - 1];
  const latestIncidentTotal = latestIncident
    ? latestIncident.p1 +
      latestIncident.p2 +
      latestIncident.p3 +
      latestIncident.p4
    : 0;
  const latestScore =
    complianceScoreTrend[complianceScoreTrend.length - 1]?.score ?? 0;

  return (
    <section className="bg-card flex flex-col rounded-xl border">
      <div className="flex items-center justify-between gap-3 border-b px-3 py-2.5 sm:px-4">
        <h3 className="text-sm font-medium leading-tight">{title}</h3>
        <div className="shrink-0 text-right">
          <p className="text-lg leading-none font-semibold tabular-nums">
            {kind === "compliance"
              ? `${latestScore}%`
              : kind === "alerts"
                ? latestAlertTotal
                : latestIncidentTotal}
          </p>
          <p className="text-muted-foreground mt-0.5 text-[10px]">
            {kind === "compliance" ? "latest month" : "latest day"}
          </p>
        </div>
      </div>

      <div className="px-2 pb-2 pt-1 sm:px-3">
        {kind === "alerts" ? (
          <ChartContainer
            config={severityChartConfig}
            className="[aspect-ratio:auto] h-[180px] w-full"
          >
            <AreaChart
              accessibilityLayer
              data={alertData}
              margin={{ top: 8, right: 8, left: 4, bottom: 0 }}
            >
              <defs>
                {(["low", "medium", "high", "critical"] as const).map((key) => (
                  <linearGradient
                    key={key}
                    id={`ov-alert-${key}`}
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
                interval={1}
                minTickGap={8}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10 }}
                width={36}
                allowDecimals={false}
                tickFormatter={(value) => compactNumber.format(Number(value))}
              />
              <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Area
                type="monotone"
                dataKey="low"
                stackId="sev"
                stroke="var(--color-low)"
                fill="url(#ov-alert-low)"
                strokeWidth={1.5}
              />
              <Area
                type="monotone"
                dataKey="medium"
                stackId="sev"
                stroke="var(--color-medium)"
                fill="url(#ov-alert-medium)"
                strokeWidth={1.5}
              />
              <Area
                type="monotone"
                dataKey="high"
                stackId="sev"
                stroke="var(--color-high)"
                fill="url(#ov-alert-high)"
                strokeWidth={1.5}
              />
              <Area
                type="monotone"
                dataKey="critical"
                stackId="sev"
                stroke="var(--color-critical)"
                fill="url(#ov-alert-critical)"
                strokeWidth={1.5}
              />
            </AreaChart>
          </ChartContainer>
        ) : null}

        {kind === "incidents" ? (
          <ChartContainer
            config={incidentChartConfig}
            className="[aspect-ratio:auto] h-[180px] w-full"
          >
            <AreaChart
              accessibilityLayer
              data={incidentData}
              margin={{ top: 8, right: 8, left: 4, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10 }}
                dy={8}
                interval={1}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10 }}
                width={36}
                allowDecimals={false}
              />
              <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Area
                type="monotone"
                dataKey="p4"
                stackId="pri"
                stroke="var(--color-p4)"
                fill="var(--color-p4)"
                fillOpacity={0.25}
                strokeWidth={1.5}
              />
              <Area
                type="monotone"
                dataKey="p3"
                stackId="pri"
                stroke="var(--color-p3)"
                fill="var(--color-p3)"
                fillOpacity={0.3}
                strokeWidth={1.5}
              />
              <Area
                type="monotone"
                dataKey="p2"
                stackId="pri"
                stroke="var(--color-p2)"
                fill="var(--color-p2)"
                fillOpacity={0.35}
                strokeWidth={1.5}
              />
              <Area
                type="monotone"
                dataKey="p1"
                stackId="pri"
                stroke="var(--color-p1)"
                fill="var(--color-p1)"
                fillOpacity={0.4}
                strokeWidth={1.5}
              />
            </AreaChart>
          </ChartContainer>
        ) : null}

        {kind === "compliance" ? (
          <ChartContainer
            config={complianceChartConfig}
            className="[aspect-ratio:auto] h-[180px] w-full"
          >
            <AreaChart
              accessibilityLayer
              data={complianceScoreTrend}
              margin={{ top: 8, right: 8, left: 4, bottom: 0 }}
            >
              <defs>
                <linearGradient id="ov-compliance-score" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="var(--color-score)"
                    stopOpacity={0.35}
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--color-score)"
                    stopOpacity={0.02}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10 }}
                dy={8}
              />
              <YAxis
                domain={[
                  Math.max(0, complianceScoreTarget - 30),
                  Math.min(100, complianceScoreTarget + 15),
                ]}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10 }}
                width={36}
              />
              <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Area
                type="monotone"
                dataKey="target"
                stroke="var(--color-target)"
                strokeDasharray="4 4"
                fill="transparent"
                strokeWidth={1.5}
                dot={false}
              />
              <Area
                type="monotone"
                dataKey="score"
                stroke="var(--color-score)"
                fill="url(#ov-compliance-score)"
                strokeWidth={2}
                dot={false}
              />
            </AreaChart>
          </ChartContainer>
        ) : null}
      </div>
    </section>
  );
}

function BreakdownPanel({ breakdown }: { breakdown: OverviewBreakdown }) {
  const total = breakdown.items.reduce((sum, item) => sum + item.value, 0) || 1;
  const pieData = breakdown.items.map((item) => ({
    ...item,
    fill: item.color,
  }));

  return (
    <section className="bg-card flex flex-col rounded-xl border">
      <div className="flex items-center justify-between gap-2 border-b px-3 py-2.5 sm:px-4">
        <h3 className="text-sm font-medium leading-tight">{breakdown.title}</h3>
        <p className="text-muted-foreground shrink-0 text-[11px] tabular-nums">
          {compactNumber.format(total)} total
        </p>
      </div>
      <div className="flex items-center gap-3 p-3">
        <ChartContainer
          config={Object.fromEntries(
            breakdown.items.map((item) => [
              item.key,
              { label: item.label, color: item.color },
            ]),
          )}
          className="aspect-square h-[108px] w-[108px] shrink-0"
        >
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="label"
              innerRadius={28}
              outerRadius={48}
              strokeWidth={1}
            >
              {pieData.map((entry) => (
                <Cell key={entry.key} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
        <ul className="flex min-w-0 flex-1 flex-col gap-1.5">
          {breakdown.items.map((item) => {
            const pct = Math.round((item.value / total) * 100);
            return (
              <li key={item.key} className="min-w-0">
                <div className="mb-0.5 flex items-center justify-between gap-2 text-[11px]">
                  <span className="text-muted-foreground flex min-w-0 items-center gap-1.5 truncate capitalize">
                    <span
                      className="size-1.5 shrink-0 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    {item.label}
                  </span>
                  <span className="text-foreground shrink-0 font-medium tabular-nums">
                    {compactNumber.format(item.value)}
                    <span className="text-muted-foreground ml-1 font-normal">
                      {pct}%
                    </span>
                  </span>
                </div>
                <div className="bg-muted h-1 overflow-hidden rounded-full">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

const toneClass: Record<
  NonNullable<OverviewQueueItem["tone"]>,
  string
> = {
  critical:
    "border-destructive/30 bg-destructive/10 text-destructive dark:text-red-400",
  high: "border-orange-500/30 bg-orange-500/10 text-orange-700 dark:text-orange-400",
  medium:
    "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  low: "border-border bg-muted text-muted-foreground",
  neutral: "border-border bg-muted text-muted-foreground",
};

function AttentionItem({ item }: { item: OverviewQueueItem }) {
  return (
    <Link
      href={item.href}
      className="hover:bg-muted/50 flex items-center gap-2 border-b px-3 py-2 last:border-b-0 transition-colors"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium">{item.title}</p>
          {item.tone ? (
            <Badge
              variant="outline"
              className={cn(
                "h-5 shrink-0 rounded-full px-1.5 text-[10px] font-medium capitalize",
                toneClass[item.tone],
              )}
            >
              {item.tone}
            </Badge>
          ) : null}
        </div>
        <p className="text-muted-foreground truncate text-[11px]">
          {item.meta}
          {item.subtitle ? ` · ${item.subtitle}` : ""}
        </p>
      </div>
      <ArrowRight
        className="text-muted-foreground size-3.5 shrink-0"
        aria-hidden="true"
      />
    </Link>
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
    tick === 0
      ? "SLA clocks live"
      : `SLA clocks aged ×${tick} (demo pulse)`;

  return (
    <main
      id="main-content"
      className="flex min-h-0 flex-1 flex-col overflow-hidden"
    >
      <ScrollArea className="h-full">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 p-3 sm:gap-4 sm:p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
                {hydrated ? roleLabel : "…"}
              </p>
              <h2 className="text-lg font-semibold tracking-tight sm:text-xl">
                {model.headline}
              </h2>
              <p className="text-muted-foreground mt-1 text-xs">{slaBurnLabel}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {pulseItems.length > 0 ? (
                <Badge
                  variant="outline"
                  className="border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-300"
                >
                  {pulseItems.length} live critical
                </Badge>
              ) : null}
              {hydrated && effectiveRole === "c_level" ? (
                <Button
                  size="sm"
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
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4 sm:gap-3">
            {model.kpis.map((kpi, index) => (
              <KpiCard key={kpi.key} kpi={kpi} index={index} />
            ))}
          </div>

          <div className="grid items-start gap-2 xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] sm:gap-3">
            <TrendChart kind={model.chartKind} title={model.chartTitle} />
            <BreakdownPanel breakdown={model.primaryBreakdown} />
          </div>

          <div className="grid items-start gap-2 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)_minmax(0,0.85fr)] sm:gap-3">
            <section className="bg-card rounded-xl border">
              <div className="flex items-center justify-between gap-2 border-b px-3 py-2.5 sm:px-4">
                <h3 className="text-sm font-medium leading-tight">
                  {model.queueTitle}
                </h3>
                <Badge variant="secondary" className="tabular-nums">
                  {queue.length}
                </Badge>
              </div>
              <ul className="divide-border max-h-[320px] divide-y overflow-y-auto">
                {queue.length === 0 ? (
                  <li className="text-muted-foreground px-3 py-6 text-center text-sm">
                    Nothing in this queue right now.
                  </li>
                ) : (
                  queue.map((item) => (
                    <li key={item.id}>
                      <AttentionItem item={item} />
                    </li>
                  ))
                )}
              </ul>
            </section>

            <section className="bg-card rounded-xl border">
              <div className="border-b px-3 py-2.5 sm:px-4">
                <h3 className="text-sm font-medium leading-tight">Insights</h3>
              </div>
              <ul className="divide-border divide-y">
                {model.insights.map((insight) => (
                  <li key={insight.title} className="space-y-1 px-3 py-2.5">
                    <p className="text-sm font-medium">{insight.title}</p>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      {insight.body}
                    </p>
                    {insight.href ? (
                      <Link
                        href={insight.href}
                        className="text-primary text-xs font-medium hover:underline"
                      >
                        Open
                      </Link>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>

            <div className="flex flex-col gap-2 sm:gap-3">
              <BreakdownPanel breakdown={model.secondaryBreakdown} />
              <section className="bg-card rounded-xl border">
                <div className="border-b px-3 py-2.5 sm:px-4">
                  <h3 className="text-sm font-medium leading-tight">
                    Shortcuts
                  </h3>
                </div>
                <ul className="divide-border divide-y">
                  {model.shortcuts.map((shortcut) => (
                    <li key={shortcut.href}>
                      <Button
                        variant="ghost"
                        className="h-9 w-full justify-between gap-2 rounded-none px-3 text-left font-normal"
                        asChild
                      >
                        <Link href={shortcut.href}>
                          <span className="truncate text-sm font-medium">
                            {shortcut.label}
                          </span>
                          <ArrowRight
                            className="text-muted-foreground size-3.5 shrink-0"
                            aria-hidden="true"
                          />
                        </Link>
                      </Button>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </div>

          {hydrated &&
          (effectiveRole === "soc_manager" || effectiveRole === "ciso") ? (
            <section className="bg-card rounded-xl border">
              <div className="flex items-center justify-between border-b px-3 py-2.5 sm:px-4">
                <h3 className="text-sm font-medium leading-tight">
                  Recent activity
                </h3>
                <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
                  <Link href="/administration/audit">Audit log</Link>
                </Button>
              </div>
              <ul className="divide-border divide-y">
                {auditEntries.slice(0, 5).map((entry) => (
                  <li
                    key={entry.id}
                    className="flex items-start justify-between gap-3 px-3 py-2 text-sm"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">{entry.detail}</p>
                      <p className="text-muted-foreground truncate text-xs">
                        {entry.actorName} · {entry.action}
                      </p>
                    </div>
                    <span className="text-muted-foreground shrink-0 text-xs">
                      {formatAuditTime(entry.at)}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </ScrollArea>
    </main>
  );
}

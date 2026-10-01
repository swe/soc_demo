"use client";

import {
  ArrowUpRight,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  FileSearch,
  FileStack,
  Gavel,
  ScrollText,
  Wrench,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { ChartCard } from "@/components/soc/charts/chart-card";
import {
  chartMargin,
  gridProps,
  xAxisProps,
  yAxisProps,
} from "@/components/soc/charts/chart-palette";
import { TrendAreaChart } from "@/components/soc/charts/trend-area-chart";
import {
  OverviewSplit,
  Panel,
  PanelHeading,
  PanelLink,
} from "@/components/soc/panel";
import { Button } from "@/components/ui/button";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import {
  type AuditEngagement,
  auditEngagements,
  type AuditPhase,
  auditPhaseLabels,
  auditPhaseOrder,
  type ComplianceControl,
  complianceEvidence,
  complianceFrameworks,
  complianceScoreTarget,
  complianceScoreTrend,
  complianceTimeline,
  controlCategoryLabels,
  type ControlStatus,
  controlStatusColors,
  controlStatusLabels,
  evidenceFreshnessTrend,
  frameworkAccent,
  getControlStatusBreakdown,
  getFrameworkDomainMatrix,
  getFrameworkRollup,
  getOverallScore,
  getUser,
} from "./compliance-data";
import {
  AvatarStack,
  ControlStatusCell,
  EvidenceBadge,
  FrameworkStatusBadge,
  percentTextClass,
  ProgressTrack,
  RiskBadge,
} from "./compliance-primitives";
import { useComplianceSession } from "./compliance-session";

const scoreChartConfig = {
  score: { label: "Compliance score", color: "var(--primary)" },
  target: { label: "Target", color: "var(--muted-foreground)" },
} satisfies ChartConfig;

const scoreSeries = [{ key: "score" }, { key: "target", dashed: true }] as const;

const evidenceChartConfig = {
  collected: { label: "Collected", color: "var(--primary)" },
  expired: {
    label: "Expired",
    color: "color-mix(in oklch, var(--destructive) 55%, transparent)",
  },
} satisfies ChartConfig;

const formatPercent = (value: unknown) => `${value}%`;

function ScoreTrendCard({ controls }: { controls: ComplianceControl[] }) {
  const score = getOverallScore(controls);
  const lowest = Math.min(...complianceScoreTrend.map((point) => point.score));
  const axisFloor = Math.max(0, Math.floor((lowest - 5) / 10) * 10);

  return (
    <ChartCard
      title="Score trend"
      description={`Target ${complianceScoreTarget}% by Q4`}
      metric={{ value: `${score}%`, label: "current" }}
    >
      <TrendAreaChart
        data={complianceScoreTrend}
        xKey="month"
        series={scoreSeries}
        config={scoreChartConfig}
        stacked={false}
        yDomain={[axisFloor, 100]}
        yTickFormatter={formatPercent}
      />
    </ChartCard>
  );
}

function ControlDistributionCard({
  onSelectStatus,
  controls,
}: {
  onSelectStatus: (status: ControlStatus) => void;
  controls: ComplianceControl[];
}) {
  const breakdown = getControlStatusBreakdown(controls);
  const total = controls.length;
  const order: ControlStatus[] = [
    "pass",
    "attention",
    "fail",
    "pending",
    "not-applicable",
  ];
  const segments = order.filter((status) => breakdown[status] > 0);

  return (
    <Panel>
      <PanelHeading
        title="Control status"
        description={`${total} monitored controls`}
      />
      <div className="bg-muted flex h-2 w-full overflow-hidden rounded-full">
        {segments.map((status) => (
          <span
            key={status}
            className="h-full"
            style={{
              width: `${(breakdown[status] / total) * 100}%`,
              backgroundColor: controlStatusColors[status],
            }}
          />
        ))}
      </div>
      <ul className="mt-4 space-y-1">
        {order
          .filter((status) => breakdown[status] > 0)
          .map((status) => (
            <li key={status}>
              <button
                type="button"
                onClick={() => onSelectStatus(status)}
                className="hover:bg-accent flex w-full items-center justify-between gap-3 rounded-md px-2 py-1.5 text-left transition-colors"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span
                    className="size-2 shrink-0 rounded-full"
                    style={{ backgroundColor: controlStatusColors[status] }}
                  />
                  <span className="truncate text-sm">
                    {controlStatusLabels[status]}
                  </span>
                </span>
                <span className="text-sm font-medium tabular-nums">
                  {breakdown[status]}
                </span>
              </button>
            </li>
          ))}
      </ul>
    </Panel>
  );
}

/* -------------------------------------------------------------------------- */
/*                        Framework × domain coverage                         */
/* -------------------------------------------------------------------------- */

function matrixCellClass(
  readiness: number | null,
  worst: ControlStatus | null,
) {
  if (readiness === null) return "bg-muted/40 text-muted-foreground/40";
  if (worst === "fail") return "bg-destructive/15 text-destructive-text";
  if (worst === "pending") return "bg-info/15 text-info-text";
  if (readiness >= 90) return "bg-success/15 text-success-text";
  if (readiness >= 70) return "bg-warning/15 text-warning-text";
  return "bg-severity-high/15 text-severity-high-text";
}

const domainShortLabels: Record<string, string> = {
  access: "Access",
  endpoint: "Endpoint",
  network: "Network",
  data: "Data",
  logging: "Logging",
  vulnerability: "Vuln",
  incident: "Incident",
  vendor: "Vendor",
  resilience: "Resilience",
  governance: "Governance",
};

function CoverageMatrixCard({
  onOpenControls,
  controls,
}: {
  onOpenControls: () => void;
  controls: ComplianceControl[];
}) {
  const rows = getFrameworkDomainMatrix(controls);
  const domains = rows[0]?.cells.map((cell) => cell.domain) ?? [];

  return (
    <Panel>
      <PanelHeading
        title="Coverage matrix"
        description="Control-domain readiness for each framework, computed from the live control set."
        action={
          <PanelLink onClick={onOpenControls}>Open controls</PanelLink>
        }
      />
      <div className="overflow-x-auto">
        <table className="w-full table-fixed border-separate border-spacing-1">
          <colgroup>
            <col className="w-[7.5rem]" />
            {domains.map((domain) => (
              <col key={domain} />
            ))}
          </colgroup>
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-card" />
              {domains.map((domain) => (
                <th
                  key={domain}
                  className="text-muted-foreground px-0.5 pb-1 text-center align-bottom text-xs font-medium"
                >
                  <span className="mx-auto block truncate leading-tight">
                    {domainShortLabels[domain]}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(({ framework, cells, readiness }) => (
              <tr key={framework.id}>
                <td className="sticky left-0 z-10 bg-card pr-2">
                  <div className="flex min-w-0 items-center gap-1.5">
                    <span
                      className="size-2 shrink-0 rounded-full"
                      style={{ backgroundColor: frameworkAccent[framework.id] }}
                    />
                    <span className="truncate text-xs font-medium">
                      {framework.shortName}
                    </span>
                    <span
                      className={cn(
                        "ml-auto shrink-0 text-xs font-medium tabular-nums",
                        percentTextClass(readiness),
                      )}
                    >
                      {readiness}%
                    </span>
                  </div>
                </td>
                {cells.map((cell) => (
                  <td key={cell.domain} className="p-0">
                    {cell.readiness === null ? (
                      <div className="grid h-9 w-full place-items-center rounded-md bg-muted/40">
                        <span className="text-muted-foreground/40 text-xs">
                          —
                        </span>
                      </div>
                    ) : (
                      <TooltipProvider>
                        <Tooltip delayDuration={150}>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              onClick={onOpenControls}
                              className={cn(
                                "grid h-9 w-full place-items-center rounded-md text-xs font-semibold tabular-nums transition-transform hover:scale-[1.06]",
                                matrixCellClass(cell.readiness, cell.worst),
                              )}
                            >
                              {cell.readiness}
                            </button>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p className="font-medium text-primary-foreground">
                              {framework.shortName} ·{" "}
                              {controlCategoryLabels[cell.domain]}
                            </p>
                            <p className="text-primary-foreground/80 text-xs">
                              {cell.applicable} control
                              {cell.applicable === 1 ? "" : "s"} ·{" "}
                              {cell.readiness}% ready
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="text-muted-foreground mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-success/40" />≥ 90%
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-warning/40" />
          70–89%
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-severity-high/40" />
          &lt; 70%
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-destructive/40" />
          Has failing
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-info/40" />
          Not tested
        </span>
      </div>
    </Panel>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Audit lifecycle                               */
/* -------------------------------------------------------------------------- */

const phaseIcons: Record<AuditPhase, typeof Gavel> = {
  scoping: FileSearch,
  readiness: ClipboardCheck,
  fieldwork: ScrollText,
  remediation: Wrench,
  report: Gavel,
};

export function AuditLifecycleStepper({ audit }: { audit: AuditEngagement }) {
  const currentIndex = auditPhaseOrder.indexOf(audit.phase);

  return (
    <div className="grid gap-3 sm:grid-cols-5">
      {auditPhaseOrder.map((phase, index) => {
        const Icon = phaseIcons[phase];
        const isComplete = index < currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <div key={phase} className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full border",
                  isComplete &&
                    "border-foreground bg-foreground text-background",
                  isCurrent && "border-foreground text-foreground",
                  !isComplete &&
                    !isCurrent &&
                    "border-border text-muted-foreground",
                )}
              >
                {isComplete ? (
                  <CheckCircle2 className="size-3.5" />
                ) : (
                  <Icon className="size-3" />
                )}
              </span>
              <span
                className={cn(
                  "truncate text-xs font-medium",
                  isComplete || isCurrent
                    ? "text-foreground"
                    : "text-muted-foreground",
                )}
              >
                {auditPhaseLabels[phase]}
              </span>
            </div>
            <div className="bg-border/70 h-1.5 rounded-full">
              <div
                className={cn(
                  "bg-foreground h-full rounded-full transition-[width]",
                  isComplete && "w-full",
                  !isComplete && !isCurrent && "w-0",
                )}
                style={
                  isCurrent ? { width: `${audit.phaseProgress}%` } : undefined
                }
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ActiveAuditCard() {
  const audit = auditEngagements.find((entry) => entry.active);
  if (!audit) return null;

  const lead = getUser(audit.leadId);
  const requestProgress = Math.round(
    ((audit.requestsTotal - audit.requestsOpen) / audit.requestsTotal) * 100,
  );

  return (
    <Panel>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="bg-muted flex size-10 shrink-0 items-center justify-center rounded-lg border">
            <Gavel className="text-muted-foreground size-4" />
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold">{audit.name}</h2>
            <p className="text-muted-foreground mt-1 text-xs">
              {audit.auditor} · {audit.windowLabel}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="border-border/70 bg-background rounded-md border px-2 py-1 text-xs font-medium">
            {audit.daysRemaining}d to report
          </span>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs shadow-none"
          >
            Request list
            <ArrowUpRight className="size-3.5" />
          </Button>
        </div>
      </div>

      <AuditLifecycleStepper audit={audit} />

      <div className="border-separator mt-4 grid gap-4 border-t pt-4 sm:grid-cols-3">
        <div>
          <p className="text-muted-foreground text-xs">Auditor requests</p>
          <p className="mt-1 text-sm font-medium tabular-nums">
            {audit.requestsTotal - audit.requestsOpen}/{audit.requestsTotal}{" "}
            answered
          </p>
          <ProgressTrack className="mt-2" percent={requestProgress} />
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Open findings</p>
          <p className="mt-1 text-sm font-medium tabular-nums">
            {audit.openFindings}
          </p>
          <p className="text-muted-foreground mt-2 text-xs">
            {audit.reportDueLabel}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Engagement lead</p>
          <p className="mt-1 truncate text-sm font-medium">
            {lead?.name ?? "Unassigned"}
          </p>
          <p className="text-muted-foreground mt-2 truncate text-xs">
            {lead?.title}
          </p>
        </div>
      </div>
    </Panel>
  );
}

function FrameworkReadinessCard({
  onOpenFrameworks,
  controls,
}: {
  onOpenFrameworks: () => void;
  controls: ComplianceControl[];
}) {
  const rows = complianceFrameworks
    .map((framework) => ({
      framework,
      rollup: getFrameworkRollup(framework.id, controls),
    }))
    .sort((a, b) => a.rollup.readiness - b.rollup.readiness);

  return (
    <Panel>
      <PanelHeading
        title="Framework readiness"
        action={
          <PanelLink onClick={onOpenFrameworks}>View all</PanelLink>
        }
      />
      <ul className="divide-separator divide-y">
        {rows.map(({ framework, rollup }) => (
          <li
            key={framework.id}
            className="grid gap-2 py-3 first:pt-0 last:pb-0 sm:grid-cols-[minmax(0,1fr)_140px_auto] sm:items-center sm:gap-4"
          >
            <div className="flex min-w-0 items-center gap-2.5">
              <span
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: frameworkAccent[framework.id] }}
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {framework.shortName}
                </p>
                <p className="text-muted-foreground truncate text-xs">
                  {rollup.passing}/{rollup.total} passing · {rollup.failing}{" "}
                  failing
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ProgressTrack className="flex-1" percent={rollup.readiness} />
              <span
                className={cn(
                  "w-9 text-right text-xs font-medium tabular-nums",
                  percentTextClass(rollup.readiness),
                )}
              >
                {rollup.readiness}%
              </span>
            </div>
            <div className="sm:justify-self-end">
              <FrameworkStatusBadge status={framework.status} />
            </div>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

function EvidenceTrendCard() {
  return (
    <ChartCard
      title="Evidence freshness"
      description="Artifacts collected versus lapsed each month."
    >
      <ChartContainer
        config={evidenceChartConfig}
        className="aspect-auto h-full w-full"
      >
        <BarChart
          accessibilityLayer
          data={evidenceFreshnessTrend}
          margin={chartMargin}
        >
          <CartesianGrid {...gridProps} />
          <XAxis dataKey="month" {...xAxisProps} />
          <YAxis {...yAxisProps} />
          <ChartTooltip
            cursor={{ fill: "var(--muted)", opacity: 0.6 }}
            content={<ChartTooltipContent />}
          />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar
            dataKey="collected"
            fill="var(--color-collected)"
            radius={[4, 4, 0, 0]}
            maxBarSize={24}
            isAnimationActive={false}
          />
          <Bar
            dataKey="expired"
            fill="var(--color-expired)"
            radius={[4, 4, 0, 0]}
            maxBarSize={24}
            isAnimationActive={false}
          />
        </BarChart>
      </ChartContainer>
    </ChartCard>
  );
}

/* -------------------------------------------------------------------------- */
/*                                 Right rail                                 */
/* -------------------------------------------------------------------------- */

function UpcomingDeadlinesCard() {
  const deadlines = complianceFrameworks
    .slice()
    .sort((a, b) => a.daysToMilestone - b.daysToMilestone)
    .slice(0, 5);

  return (
    <Panel>
      <PanelHeading title="Upcoming milestones" />
      <ul className="space-y-3">
        {deadlines.map((framework) => (
          <li key={framework.id} className="flex items-start gap-3">
            <CalendarClock
              className={cn(
                "mt-0.5 size-4 shrink-0",
                framework.daysToMilestone <= 14
                  ? "text-destructive"
                  : framework.daysToMilestone <= 45
                    ? "text-warning-text"
                    : "text-muted-foreground",
              )}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {framework.nextMilestone}
              </p>
              <p className="text-muted-foreground truncate text-xs">
                {framework.shortName} · {framework.nextMilestoneDate}
              </p>
            </div>
            <span
              className={cn(
                "shrink-0 text-xs font-medium tabular-nums",
                framework.daysToMilestone <= 14
                  ? "text-destructive"
                  : "text-muted-foreground",
              )}
            >
              {framework.daysToMilestone}d
            </span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

function EvidenceAtRiskCard({
  onOpenEvidence,
}: {
  onOpenEvidence: () => void;
}) {
  const atRisk = complianceEvidence
    .filter((item) => item.status !== "current")
    .sort((a, b) => a.daysToExpiry - b.daysToExpiry)
    .slice(0, 5);

  return (
    <Panel>
      <PanelHeading
        title="Evidence at risk"
        action={
          <PanelLink onClick={onOpenEvidence}>Open</PanelLink>
        }
      />
      <ul className="space-y-3">
        {atRisk.map((item) => (
          <li key={item.id} className="flex items-start gap-3">
            <FileStack className="text-muted-foreground mt-0.5 size-4 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{item.name}</p>
              <p className="text-muted-foreground truncate text-xs">
                {item.controlCode} · {item.expiresLabel}
              </p>
            </div>
            <EvidenceBadge status={item.status} />
          </li>
        ))}
      </ul>
    </Panel>
  );
}

function TopRisksCard({
  onOpenControls,
  controls,
}: {
  onOpenControls: () => void;
  controls: ComplianceControl[];
}) {
  const risky = controls
    .slice()
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 5);

  return (
    <Panel>
      <PanelHeading
        title="Highest-risk controls"
        action={
          <PanelLink onClick={onOpenControls}>Open</PanelLink>
        }
      />
      <ul className="space-y-3">
        {risky.map((control) => (
          <li key={control.id} className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                <span className="text-muted-foreground font-mono text-xs">
                  {control.code}
                </span>{" "}
                {control.title}
              </p>
              <div className="mt-1">
                <ControlStatusCell status={control.status} />
              </div>
            </div>
            <RiskBadge score={control.riskScore} />
          </li>
        ))}
      </ul>
    </Panel>
  );
}

export function ComplianceActivityTimeline({ limit }: { limit?: number }) {
  const events = limit
    ? complianceTimeline.slice(0, limit)
    : complianceTimeline;

  return (
    <div className="flex flex-col gap-5">
      {events.map((event, index) => (
        <div key={event.id} className="relative pl-6">
          <span
            className={cn(
              "absolute top-1.5 left-0 size-2.5 rounded-full",
              event.tone === "negative"
                ? "bg-destructive"
                : event.tone === "warning"
                  ? "bg-warning"
                  : event.tone === "positive"
                    ? "bg-success"
                    : "bg-muted-foreground/40",
            )}
          />
          {index < events.length - 1 ? (
            <span className="bg-border absolute top-5 bottom-[-1.25rem] left-[5px] w-px" />
          ) : null}
          <p className="text-sm">
            <span className="font-medium">{event.actor}</span>{" "}
            <span className="text-muted-foreground">{event.action}</span>
          </p>
          <p className="text-muted-foreground mt-0.5 text-xs">{event.detail}</p>
          <p className="text-muted-foreground mt-1 text-xs">
            {event.timeLabel}
          </p>
        </div>
      ))}
    </div>
  );
}

function ActivityCard() {
  return (
    <Panel>
      <PanelHeading
        title="Compliance activity"
        action={
          <PanelLink href="/knowledge-base/reports">Audit log</PanelLink>
        }
      />
      <ComplianceActivityTimeline limit={7} />
    </Panel>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  Overview                                  */
/* -------------------------------------------------------------------------- */

export function ComplianceOverview({
  onOpenControls,
  onOpenEvidence,
  onOpenFrameworks,
  onSelectStatus,
}: {
  onOpenControls: () => void;
  onOpenEvidence: () => void;
  onOpenFrameworks: () => void;
  onSelectStatus: (status: ControlStatus) => void;
}) {
  const { controls } = useComplianceSession();
  const owners = Array.from(
    new Set(complianceFrameworks.map((framework) => framework.ownerId)),
  );

  return (
    <div className="flex flex-col gap-4">
      <ActiveAuditCard />

      <OverviewSplit
        primary={<ScoreTrendCard controls={controls} />}
        secondary={
          <ControlDistributionCard
            controls={controls}
            onSelectStatus={onSelectStatus}
          />
        }
      />

      <CoverageMatrixCard
        controls={controls}
        onOpenControls={onOpenControls}
      />

      <OverviewSplit
        primary={
          <FrameworkReadinessCard
            controls={controls}
            onOpenFrameworks={onOpenFrameworks}
          />
        }
        secondary={<EvidenceTrendCard />}
      />

      <OverviewSplit
        wide="secondary"
        primary={
          <Panel>
            <PanelHeading
              title="Compliance owners"
              description={`${owners.length} framework owners`}
            />
            <AvatarStack userIds={owners} max={5} />
          </Panel>
        }
        secondary={
          <div className="flex min-w-0 flex-col gap-4">
            <UpcomingDeadlinesCard />
            <EvidenceAtRiskCard onOpenEvidence={onOpenEvidence} />
          </div>
        }
      />

      <OverviewSplit
        primary={<TopRisksCard controls={controls} onOpenControls={onOpenControls} />}
        secondary={<ActivityCard />}
      />
    </div>
  );
}

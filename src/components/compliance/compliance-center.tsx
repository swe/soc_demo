"use client";

import {
  ArrowUpRight,
  BadgeCheck,
  CheckIcon,
  ChevronRight,
  ClipboardList,
  Download,
  Ellipsis,
  ExternalLink,
  FileStack,
  FileWarning,
  Gavel,
  ListFilter,
  Radar,
  RefreshCw,
  Scale,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useDeferredValue, useEffect, useMemo, useState } from "react";

import { getSessionCloudFindings } from "@/components/cloud-posture/cloud-posture-session";
import { GrcAuditorPacksPanel } from "@/components/compliance/grc-auditor-packs-panel";
import { ListPagination, paginateItems } from "@/components/list-pagination";
import {
  ModuleTabsList,
  ModuleTabsTrigger,
  TabCount,
} from "@/components/soc/module-tabs";
import { type SocStat, StatsStrip } from "@/components/soc/stats-strip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { vulnerabilities } from "@/components/vulnerabilities/vulnerabilities-data";
import { complianceApi } from "@/lib/mock-api/compliance";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

import {
  type AttentionKey,
  auditEngagements,
  complianceAttentionFilters,
  type ComplianceCollector,
  type ComplianceControl,
  type ComplianceEvidence,
  type ComplianceFinding,
  type ComplianceFramework,
  complianceFrameworks,
  type ControlCategory,
  controlCategoryLabels,
  type ControlStatus,
  controlStatusLabels,
  findingStatusLabels,
  frameworkAccent,
  type FrameworkId,
  getComplianceStats,
  getCoverage,
  getFrameworkRollup,
  getUser,
} from "./compliance-data";
import {
  AuditLifecycleStepper,
  ComplianceOverview,
} from "./compliance-overview";
import {
  AutomationBadge,
  AvatarStack,
  controlSearchIndex,
  ControlStatusCell,
  CoverageMeter,
  EmptyState,
  EvidenceBadge,
  FrameworkChips,
  FrameworkStatusBadge,
  OwnerCell,
  Panel,
  PanelHeading,
  percentTextClass,
  ProgressTrack,
  RiskBadge,
  SeverityBadge,
} from "./compliance-primitives";
import { useComplianceSession } from "./compliance-session";

type ComplianceTab =
  | "overview"
  | "frameworks"
  | "controls"
  | "evidence"
  | "findings"
  | "audits";

type ControlSort =
  | "code-asc"
  | "risk-desc"
  | "risk-asc"
  | "checked-desc"
  | "checked-asc"
  | "status-severity";

type FilterPanel = "status" | "category" | "sort";

const sortLabels: Record<ControlSort, string> = {
  "code-asc": "Control ID",
  "risk-desc": "Risk · high to low",
  "risk-asc": "Risk · low to high",
  "checked-desc": "Last tested · newest",
  "checked-asc": "Last tested · oldest",
  "status-severity": "Status · failing first",
};

const statusWeight: Record<ControlStatus, number> = {
  fail: 0,
  attention: 1,
  pending: 2,
  pass: 3,
  "not-applicable": 4,
};

/* -------------------------------------------------------------------------- */
/*                                Stats strip                                 */
/* -------------------------------------------------------------------------- */

function ComplianceStatsStrip({
  controls,
  findings,
}: {
  controls: ComplianceControl[];
  findings: ComplianceFinding[];
}) {
  const stats: SocStat[] = getComplianceStats(controls, findings).map(
    (stat) => ({
      key: stat.title,
      title: stat.title,
      value: stat.value,
      context: stat.context,
      delta: stat.delta,
      preferLower: stat.preferLower,
    }),
  );

  return <StatsStrip stats={stats} />;
}

/* -------------------------------------------------------------------------- */
/*                             Needs attention strip                          */
/* -------------------------------------------------------------------------- */

function AttentionStrip({
  active,
  onSelect,
  controls,
}: {
  active: AttentionKey | null;
  onSelect: (key: AttentionKey) => void;
  controls: ComplianceControl[];
}) {
  const entries = Object.entries(complianceAttentionFilters) as [
    AttentionKey,
    (typeof complianceAttentionFilters)[AttentionKey],
  ][];

  return (
    <section
      aria-label="Needs attention"
      className="flex flex-wrap items-center gap-2"
    >
      <span className="text-muted-foreground mr-1 inline-flex items-center gap-1.5 text-xs font-medium tracking-wide uppercase">
        <ShieldAlert className="size-3.5" />
        Needs attention
      </span>
      {entries.map(([key, detail]) => {
        const count = controls.filter(detail.matches).length;
        const isActive = active === key;

        return (
          <TooltipProvider key={key}>
            <Tooltip delayDuration={200}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => onSelect(key)}
                  aria-pressed={isActive}
                  className={cn(
                    "flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors",
                    isActive
                      ? "border-foreground/40 bg-foreground text-background"
                      : "border-border bg-background hover:bg-accent hover:text-accent-foreground",
                  )}
                >
                  {detail.label}
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-xs font-semibold tabular-nums",
                      isActive
                        ? "bg-background/20 text-background"
                        : count > 0
                          ? "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                          : "bg-muted text-muted-foreground",
                    )}
                  >
                    {count}
                  </span>
                </button>
              </TooltipTrigger>
              <TooltipContent>{detail.description}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      })}
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                               Filter control                               */
/* -------------------------------------------------------------------------- */

function FilterPanelHeader({
  title,
  onBack,
}: {
  title: string;
  onBack: () => void;
}) {
  return (
    <div className="flex items-center border-b p-2">
      <Button
        variant="ghost"
        size="sm"
        className="h-7 gap-1 px-2 text-xs"
        onClick={onBack}
      >
        <ChevronRight className="size-3.5 rotate-180" />
        {title}
      </Button>
    </div>
  );
}

function ControlFilterControl({
  statusFilters,
  categoryFilters,
  sort,
  activeFilterCount,
  onToggleStatus,
  onToggleCategory,
  onSetSort,
  onClearFilters,
}: {
  statusFilters: ControlStatus[];
  categoryFilters: ControlCategory[];
  sort: ControlSort;
  activeFilterCount: number;
  onToggleStatus: (status: ControlStatus) => void;
  onToggleCategory: (category: ControlCategory) => void;
  onSetSort: (sort: ControlSort) => void;
  onClearFilters: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [panel, setPanel] = useState<FilterPanel | null>(null);
  const closePanel = () => setPanel(null);

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setPanel(null);
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="relative h-9 gap-1.5 px-2.5"
        >
          <ListFilter className="size-3.5" />
          Filter
          {activeFilterCount > 0 ? (
            <span className="bg-primary text-primary-foreground absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full text-xs font-semibold">
              {activeFilterCount}
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-60 p-0" align="end">
        {panel === null ? (
          <Command>
            <CommandList>
              <CommandGroup>
                <CommandItem
                  onSelect={() => setPanel("status")}
                  className="flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="size-4 text-zinc-500" />
                    Control status
                  </span>
                  <div className="flex items-center">
                    {statusFilters.length > 0 ? (
                      <span className="mr-1 text-xs text-zinc-500">
                        {statusFilters.length}
                      </span>
                    ) : null}
                    <ChevronRight className="size-4" />
                  </div>
                </CommandItem>
                <CommandItem
                  onSelect={() => setPanel("category")}
                  className="flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <ClipboardList className="size-4 text-zinc-500" />
                    Domain
                  </span>
                  <div className="flex items-center">
                    {categoryFilters.length > 0 ? (
                      <span className="mr-1 text-xs text-zinc-500">
                        {categoryFilters.length}
                      </span>
                    ) : null}
                    <ChevronRight className="size-4" />
                  </div>
                </CommandItem>
                <CommandItem
                  onSelect={() => setPanel("sort")}
                  className="flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <ListFilter className="size-4 text-zinc-500" />
                    Sort by
                  </span>
                  <ChevronRight className="size-4" />
                </CommandItem>
              </CommandGroup>
              {activeFilterCount > 0 ? (
                <>
                  <CommandSeparator />
                  <CommandGroup>
                    <CommandItem onSelect={onClearFilters}>
                      Clear all filters
                    </CommandItem>
                  </CommandGroup>
                </>
              ) : null}
            </CommandList>
          </Command>
        ) : panel === "status" ? (
          <Command>
            <FilterPanelHeader title="Control status" onBack={closePanel} />
            <CommandList>
              <CommandGroup>
                {(Object.keys(controlStatusLabels) as ControlStatus[]).map(
                  (status) => (
                    <CommandItem
                      key={status}
                      onSelect={() => onToggleStatus(status)}
                      className="flex items-center justify-between"
                    >
                      {controlStatusLabels[status]}
                      {statusFilters.includes(status) ? (
                        <CheckIcon className="size-4" />
                      ) : null}
                    </CommandItem>
                  ),
                )}
              </CommandGroup>
            </CommandList>
          </Command>
        ) : panel === "category" ? (
          <Command>
            <FilterPanelHeader title="Domain" onBack={closePanel} />
            <CommandList>
              <CommandGroup>
                {(Object.keys(controlCategoryLabels) as ControlCategory[]).map(
                  (category) => (
                    <CommandItem
                      key={category}
                      onSelect={() => onToggleCategory(category)}
                      className="flex items-center justify-between"
                    >
                      {controlCategoryLabels[category]}
                      {categoryFilters.includes(category) ? (
                        <CheckIcon className="size-4" />
                      ) : null}
                    </CommandItem>
                  ),
                )}
              </CommandGroup>
            </CommandList>
          </Command>
        ) : (
          <Command>
            <FilterPanelHeader title="Sort by" onBack={closePanel} />
            <CommandList>
              <CommandGroup heading="Control">
                {(["code-asc", "status-severity"] as const).map((option) => (
                  <CommandItem
                    key={option}
                    onSelect={() => onSetSort(option)}
                    className="flex items-center justify-between"
                  >
                    {sortLabels[option]}
                    {sort === option ? <CheckIcon className="size-4" /> : null}
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Testing">
                {(["checked-desc", "checked-asc"] as const).map((option) => (
                  <CommandItem
                    key={option}
                    onSelect={() => onSetSort(option)}
                    className="flex items-center justify-between"
                  >
                    {sortLabels[option]}
                    {sort === option ? <CheckIcon className="size-4" /> : null}
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Risk">
                {(["risk-desc", "risk-asc"] as const).map((option) => (
                  <CommandItem
                    key={option}
                    onSelect={() => onSetSort(option)}
                    className="flex items-center justify-between"
                  >
                    {sortLabels[option]}
                    {sort === option ? <CheckIcon className="size-4" /> : null}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        )}
      </PopoverContent>
    </Popover>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Framework cards                               */
/* -------------------------------------------------------------------------- */

function FrameworkCard({
  framework,
  controls,
  onViewControls,
  onExportEvidence,
}: {
  framework: ComplianceFramework;
  controls: ComplianceControl[];
  onViewControls: (id: FrameworkId) => void;
  onExportEvidence: (id: FrameworkId) => void;
}) {
  const rollup = getFrameworkRollup(framework.id, controls);
  const owner = getUser(framework.ownerId);

  return (
    <article className="bg-card flex flex-col rounded-lg border p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="bg-muted relative flex size-9 shrink-0 items-center justify-center rounded-md border">
            <span
              className="absolute top-1.5 left-1.5 size-1.5 rounded-full"
              style={{ backgroundColor: frameworkAccent[framework.id] }}
            />
            <Scale className="text-muted-foreground size-4" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold">{framework.name}</h3>
            <p className="text-muted-foreground mt-0.5 truncate text-xs">
              {framework.auditor} · {framework.auditWindow}
            </p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground size-8 shrink-0"
            >
              <Ellipsis className="size-4" />
              <span className="sr-only">Framework actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuItem onSelect={() => onViewControls(framework.id)}>
              <ClipboardList className="size-4" />
              View mapped controls
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onExportEvidence(framework.id)}>
              <Download className="size-4" />
              Export evidence pack
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() =>
                toast({
                  title: "Assessment scheduled",
                  description: `${framework.nextMilestone} confirmed for ${framework.nextMilestoneDate}.`,
                })
              }
            >
              <Gavel className="size-4" />
              Schedule assessment
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-3">
        <FrameworkStatusBadge status={framework.status} />
      </div>

      <div className="mt-4 space-y-1.5">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-muted-foreground text-xs">Readiness</span>
          <span
            className={cn(
              "text-sm font-medium tabular-nums",
              percentTextClass(rollup.readiness),
            )}
          >
            {rollup.readiness}%
          </span>
        </div>
        <ProgressTrack percent={rollup.readiness} />
        <p className="text-muted-foreground text-xs">
          {rollup.passing}/{rollup.total} passing · {rollup.failing} failing
          {rollup.openFindings > 0 ? ` · ${rollup.openFindings} findings` : ""}
        </p>
      </div>

      <div className="border-border/60 mt-4 flex items-center justify-between gap-3 border-t pt-4">
        <div className="flex min-w-0 items-center gap-2">
          <AvatarStack userIds={[framework.ownerId]} max={1} />
          <div className="min-w-0">
            <p className="truncate text-xs font-medium">{owner?.name}</p>
            <p className="text-muted-foreground truncate text-xs">
              Next · {framework.nextMilestoneDate}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 text-xs"
          onClick={() => onViewControls(framework.id)}
        >
          Controls
          <ArrowUpRight className="size-3.5" />
        </Button>
      </div>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/*                             Control detail sheet                           */
/* -------------------------------------------------------------------------- */

function SheetDetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="min-w-0 text-right font-medium">{children}</span>
    </div>
  );
}

function ControlDetailSheet({
  control,
  findings,
  evidenceItems,
  onOpenChange,
  onRetest,
}: {
  control: ComplianceControl | null;
  findings: ComplianceFinding[];
  evidenceItems: ComplianceEvidence[];
  onOpenChange: (open: boolean) => void;
  onRetest: (control: ComplianceControl) => void;
}) {
  const probe = control?.coverage ? getCoverage(control.coverage) : null;
  const evidence = control
    ? evidenceItems.filter((item) => item.controlCode === control.code)
    : [];
  const linkedFindings = control
    ? findings.filter((item) => item.controlCode === control.code)
    : [];
  const linkedCloud = control
    ? getSessionCloudFindings().filter((f) =>
        f.complianceControlIds?.includes(control.code),
      )
    : [];
  const linkedVulns = control
    ? vulnerabilities.filter((v) =>
        v.complianceControlIds?.includes(control.code),
      )
    : [];

  return (
    <Sheet open={control !== null} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 overflow-y-auto sm:max-w-md">
        {control ? (
          <>
            <SheetHeader className="space-y-3 pb-4">
              <div className="min-w-0">
                <SheetTitle className="text-base">{control.title}</SheetTitle>
                <SheetDescription className="font-mono text-xs">
                  {control.code} · {controlCategoryLabels[control.category]}
                </SheetDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <ControlStatusCell status={control.status} />
                <AutomationBadge automation={control.automation} />
                <RiskBadge score={control.riskScore} />
                <EvidenceBadge status={control.evidenceStatus} />
              </div>
            </SheetHeader>

            <p className="text-muted-foreground mb-4 text-sm">
              {control.description}
            </p>

            {probe ? (
              <div className="bg-muted/40 mb-4 rounded-lg border p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-xs font-medium tracking-wide uppercase">
                    Live coverage
                  </p>
                  <Link
                    href={probe.href}
                    className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs"
                  >
                    {probe.source}
                    <ExternalLink className="size-3" />
                  </Link>
                </div>
                <CoverageMeter probe={probe} />
                {probe.gaps.length > 0 ? (
                  <div className="mt-3">
                    <p className="text-muted-foreground mb-1.5 text-xs">
                      Not covered
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {probe.gaps.map((gap) => (
                        <span
                          key={gap}
                          className="border-border/70 bg-background truncate rounded-md border px-1.5 py-0.5 font-mono text-xs"
                        >
                          {gap}
                        </span>
                      ))}
                      {probe.total - probe.covered > probe.gaps.length ? (
                        <span className="text-muted-foreground px-1 py-0.5 text-xs">
                          +{probe.total - probe.covered - probe.gaps.length}{" "}
                          more
                        </span>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="space-y-3 pb-4">
              <SheetDetailRow label="Owner">
                {getUser(control.ownerId)?.name ?? "Unassigned"}
              </SheetDetailRow>
              <SheetDetailRow label="Frameworks">
                <FrameworkChips frameworks={control.frameworks} max={6} />
              </SheetDetailRow>
              <SheetDetailRow label="Last tested">
                {control.lastCheckedLabel}
              </SheetDetailRow>
              <SheetDetailRow label="Next review">
                {control.nextReviewLabel}
              </SheetDetailRow>
              <SheetDetailRow label="Testing">
                {control.automation === "automated"
                  ? "Continuous automated check"
                  : control.automation === "hybrid"
                    ? "Automated signal with manual sign-off"
                    : "Manual attestation"}
              </SheetDetailRow>
            </div>

            <div className="border-t py-4">
              <p className="mb-3 text-xs font-medium tracking-wide uppercase">
                Evidence ({evidence.length})
              </p>
              {evidence.length > 0 ? (
                <ul className="space-y-2">
                  {evidence.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-start justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {item.name}
                        </p>
                        <p className="text-muted-foreground truncate text-xs">
                          {item.kind} · {item.collectedLabel}
                        </p>
                      </div>
                      <EvidenceBadge status={item.status} />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground text-sm">
                  No artifacts collected for this control yet.
                </p>
              )}
            </div>

            <div className="border-t py-4">
              <p className="mb-3 text-xs font-medium tracking-wide uppercase">
                Findings ({linkedFindings.length})
              </p>
              {linkedFindings.length > 0 ? (
                <ul className="space-y-2">
                  {linkedFindings.map((finding) => (
                    <li
                      key={finding.id}
                      className="flex items-start justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {finding.title}
                        </p>
                        <p className="text-muted-foreground truncate text-xs">
                          {findingStatusLabels[finding.status]} · due{" "}
                          {finding.dueLabel}
                        </p>
                      </div>
                      <SeverityBadge severity={finding.severity} />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground text-sm">
                  No open findings against this control.
                </p>
              )}
            </div>

            <div className="border-t py-4">
              <p className="mb-3 text-xs font-medium tracking-wide uppercase">
                Cloud posture ({linkedCloud.length})
              </p>
              {linkedCloud.length > 0 ? (
                <ul className="space-y-2">
                  {linkedCloud.slice(0, 6).map((finding) => (
                    <li key={finding.id}>
                      <Link
                        href={`/cloud-posture?q=${encodeURIComponent(finding.id)}`}
                        className="hover:text-primary block min-w-0"
                      >
                        <p className="truncate text-sm font-medium">
                          {finding.title}
                        </p>
                        <p className="text-muted-foreground truncate text-xs">
                          {finding.id} · {finding.provider.toUpperCase()}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground text-sm">
                  No CSPM findings mapped to this control.
                </p>
              )}
            </div>

            <div className="border-t py-4">
              <p className="mb-3 text-xs font-medium tracking-wide uppercase">
                Vulnerabilities ({linkedVulns.length})
              </p>
              {linkedVulns.length > 0 ? (
                <ul className="space-y-2">
                  {linkedVulns.slice(0, 6).map((vuln) => (
                    <li key={vuln.id}>
                      <Link
                        href={`/vulnerabilities/findings?q=${encodeURIComponent(vuln.cve)}`}
                        className="hover:text-primary block min-w-0"
                      >
                        <p className="truncate text-sm font-medium">
                          {vuln.cve} · {vuln.title}
                        </p>
                        <p className="text-muted-foreground truncate text-xs">
                          Priority {vuln.socPriority}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground text-sm">
                  No CVE findings mapped to this control.
                </p>
              )}
            </div>

            <div className="mt-auto flex flex-wrap gap-2 border-t pt-4">
              <Button
                size="sm"
                className="h-8 gap-1.5"
                onClick={() => onRetest(control)}
              >
                <RefreshCw className="size-3.5" />
                Re-test now
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5"
                onClick={() =>
                  toast({
                    title: "Evidence request sent",
                    description: `${getUser(control.ownerId)?.name ?? "The owner"} was asked to attach fresh evidence.`,
                  })
                }
              >
                <Upload className="size-3.5" />
                Request evidence
              </Button>
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

/* -------------------------------------------------------------------------- */
/*                               Controls table                               */
/* -------------------------------------------------------------------------- */

function ControlsTable({
  controls,
  selectedIds,
  onToggleControl,
  onToggleAll,
  onClearSelection,
  onBulkRetest,
  onBulkRequestEvidence,
  onBulkExport,
  onView,
  footer,
}: {
  controls: ComplianceControl[];
  selectedIds: string[];
  onToggleControl: (id: string) => void;
  onToggleAll: () => void;
  onClearSelection: () => void;
  onBulkRetest: () => void;
  onBulkRequestEvidence: () => void;
  onBulkExport: () => void;
  onView: (control: ComplianceControl) => void;
  footer?: React.ReactNode;
}) {
  const selectedVisibleCount = controls.filter((control) =>
    selectedIds.includes(control.id),
  ).length;
  const allSelected =
    controls.length > 0 && selectedVisibleCount === controls.length;
  const partiallySelected =
    selectedVisibleCount > 0 && selectedVisibleCount < controls.length;
  const hasSelection = selectedVisibleCount > 0;

  return (
    <div className="bg-card shadow-card overflow-hidden rounded-xl border">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            {hasSelection ? (
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-12 px-4">
                  <Checkbox
                    aria-label="Select all visible controls"
                    checked={
                      allSelected
                        ? true
                        : partiallySelected
                          ? "indeterminate"
                          : false
                    }
                    onCheckedChange={onToggleAll}
                  />
                </TableHead>
                <TableHead colSpan={8}>
                  <div className="flex flex-wrap items-center gap-2 py-0.5">
                    <span className="text-foreground text-sm font-medium">
                      {selectedVisibleCount} selected
                    </span>
                    <div className="ml-auto flex flex-wrap items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8"
                        onClick={onBulkRetest}
                      >
                        <RefreshCw className="size-3.5" />
                        Re-test
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8"
                        onClick={onBulkRequestEvidence}
                      >
                        <Upload className="size-3.5" />
                        Request evidence
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8"
                        onClick={onBulkExport}
                      >
                        <Download className="size-3.5" />
                        Export
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8"
                        onClick={onClearSelection}
                      >
                        Clear
                      </Button>
                    </div>
                  </div>
                </TableHead>
              </TableRow>
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-12 px-4">
                  <Checkbox
                    aria-label="Select all visible controls"
                    checked={
                      allSelected
                        ? true
                        : partiallySelected
                          ? "indeterminate"
                          : false
                    }
                    onCheckedChange={onToggleAll}
                  />
                </TableHead>
                <TableHead className="min-w-[280px]">Control</TableHead>
                <TableHead className="min-w-[150px]">Frameworks</TableHead>
                <TableHead className="min-w-[130px]">Status</TableHead>
                <TableHead className="min-w-[150px]">Coverage</TableHead>
                <TableHead className="min-w-[170px]">Owner</TableHead>
                <TableHead className="min-w-[110px]">Evidence</TableHead>
                <TableHead className="min-w-[120px]">Last tested</TableHead>
                <TableHead className="w-16 text-right">Risk</TableHead>
              </TableRow>
            )}
          </TableHeader>
          <TableBody>
            {controls.map((control) => {
              const probe = control.coverage
                ? getCoverage(control.coverage)
                : null;
              const isSelected = selectedIds.includes(control.id);

              return (
                <TableRow
                  key={control.id}
                  data-state={isSelected ? "selected" : undefined}
                  className="cursor-pointer"
                  onClick={() => onView(control)}
                >
                  <TableCell
                    className="px-4"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <Checkbox
                      aria-label={`Select ${control.code}`}
                      checked={isSelected}
                      onCheckedChange={() => onToggleControl(control.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground font-mono text-xs">
                          {control.code}
                        </span>
                        <Badge
                          variant="secondary"
                          className="rounded-full text-xs font-medium"
                        >
                          {controlCategoryLabels[control.category]}
                        </Badge>
                      </div>
                      <p className="mt-1 truncate text-sm font-medium">
                        {control.title}
                      </p>
                      <div className="mt-1.5">
                        <AutomationBadge automation={control.automation} />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <FrameworkChips frameworks={control.frameworks} />
                  </TableCell>
                  <TableCell>
                    <ControlStatusCell status={control.status} />
                    {control.openFindings > 0 ? (
                      <p className="text-muted-foreground mt-1 text-xs">
                        {control.openFindings} open finding
                        {control.openFindings === 1 ? "" : "s"}
                      </p>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    {probe ? (
                      <CoverageMeter probe={probe} showLabel={false} />
                    ) : (
                      <span className="text-muted-foreground text-xs">
                        Attestation only
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <OwnerCell userId={control.ownerId} />
                  </TableCell>
                  <TableCell>
                    <EvidenceBadge status={control.evidenceStatus} />
                    <p className="text-muted-foreground mt-1 text-xs">
                      {control.evidenceCount} artifact
                      {control.evidenceCount === 1 ? "" : "s"}
                    </p>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{control.lastCheckedLabel}</span>
                    <p className="text-muted-foreground mt-1 text-xs">
                      Next: {control.nextReviewLabel}
                    </p>
                  </TableCell>
                  <TableCell className="text-right">
                    <RiskBadge score={control.riskScore} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      {footer ? <div className="border-t px-4 py-3">{footer}</div> : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                               Evidence table                               */
/* -------------------------------------------------------------------------- */

function EvidenceTable({
  frameworkFilter,
  query,
  evidence,
}: {
  frameworkFilter: FrameworkId | "all";
  query: string;
  evidence: ComplianceEvidence[];
}) {
  const rows = evidence.filter((item) => {
    const matchesFramework =
      frameworkFilter === "all" || item.frameworks.includes(frameworkFilter);
    const matchesQuery =
      !query ||
      `${item.name} ${item.kind} ${item.controlCode}`
        .toLowerCase()
        .includes(query);
    return matchesFramework && matchesQuery;
  });

  if (rows.length === 0) {
    return (
      <EmptyState
        icon={FileStack}
        title="No evidence matches the current scope"
        description="Change the framework scope or clear the search to see collected artifacts."
      />
    );
  }

  return (
    <div className="bg-card shadow-card overflow-hidden rounded-xl border">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="min-w-[260px] px-4">Artifact</TableHead>
              <TableHead className="min-w-[110px]">Control</TableHead>
              <TableHead className="min-w-[150px]">Frameworks</TableHead>
              <TableHead className="min-w-[170px]">Owner</TableHead>
              <TableHead className="min-w-[110px]">Status</TableHead>
              <TableHead className="min-w-[130px]">Collected</TableHead>
              <TableHead className="min-w-[140px]">Expires</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="px-4">
                  <div className="flex min-w-0 items-start gap-2.5">
                    <div className="bg-muted flex size-8 shrink-0 items-center justify-center rounded-md border">
                      <FileStack className="text-muted-foreground size-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {item.name}
                      </p>
                      <p className="text-muted-foreground truncate text-xs">
                        {item.kind}
                        {item.automated ? " · auto-collected" : ""}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-muted-foreground font-mono text-xs">
                    {item.controlCode}
                  </span>
                </TableCell>
                <TableCell>
                  <FrameworkChips frameworks={item.frameworks} />
                </TableCell>
                <TableCell>
                  <OwnerCell userId={item.ownerId} />
                </TableCell>
                <TableCell>
                  <EvidenceBadge status={item.status} />
                </TableCell>
                <TableCell className="text-sm">{item.collectedLabel}</TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "text-sm",
                      item.daysToExpiry < 0
                        ? "text-destructive font-medium"
                        : item.daysToExpiry <= 30
                          ? "text-amber-600 dark:text-amber-400"
                          : "",
                    )}
                  >
                    {item.expiresLabel}
                  </span>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground size-8"
                      >
                        <Ellipsis className="size-4" />
                        <span className="sr-only">Evidence actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem
                        onSelect={() =>
                          toast({
                            title: "Collection started",
                            description: `${item.name} is being refreshed.`,
                          })
                        }
                      >
                        <RefreshCw className="size-4" />
                        Refresh artifact
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() =>
                          toast({
                            title: "Download ready",
                            description: `${item.name} exported to the auditor packet.`,
                          })
                        }
                      >
                        <Download className="size-4" />
                        Download
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                               Findings table                               */
/* -------------------------------------------------------------------------- */

function FindingsTable({
  frameworkFilter,
  query,
  findings,
  onStatusChange,
}: {
  frameworkFilter: FrameworkId | "all";
  query: string;
  findings: ComplianceFinding[];
  onStatusChange: (
    finding: ComplianceFinding,
    status: ComplianceFinding["status"],
  ) => void;
}) {
  const rows = findings
    .filter((finding) => {
      const matchesFramework =
        frameworkFilter === "all" ||
        finding.frameworks.includes(frameworkFilter);
      const matchesQuery =
        !query ||
        `${finding.title} ${finding.detail} ${finding.controlCode}`
          .toLowerCase()
          .includes(query);
      return matchesFramework && matchesQuery;
    })
    .sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });

  if (rows.length === 0) {
    return (
      <EmptyState
        icon={BadgeCheck}
        title="No findings in this scope"
        description="Nothing is currently awaiting remediation for the selected framework."
      />
    );
  }

  return (
    <div className="bg-card shadow-card overflow-hidden rounded-xl border">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="min-w-[320px] px-4">Finding</TableHead>
              <TableHead className="min-w-[100px]">Severity</TableHead>
              <TableHead className="min-w-[130px]">Status</TableHead>
              <TableHead className="min-w-[110px]">Control</TableHead>
              <TableHead className="min-w-[150px]">Frameworks</TableHead>
              <TableHead className="min-w-[170px]">Owner</TableHead>
              <TableHead className="min-w-[80px]">Age</TableHead>
              <TableHead className="min-w-[130px]">Due</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((finding) => (
              <TableRow key={finding.id}>
                <TableCell className="px-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {finding.title}
                    </p>
                    <p className="text-muted-foreground mt-1 line-clamp-1 text-xs">
                      {finding.detail}
                    </p>
                    <p className="text-muted-foreground mt-1 text-xs">
                      {finding.source}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <SeverityBadge severity={finding.severity} />
                </TableCell>
                <TableCell>
                  <Select
                    value={finding.status}
                    onValueChange={(value) =>
                      onStatusChange(
                        finding,
                        value as ComplianceFinding["status"],
                      )
                    }
                  >
                    <SelectTrigger className="h-8 w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(
                        [
                          "open",
                          "in-progress",
                          "awaiting-review",
                          "remediated",
                          "accepted",
                        ] as const
                      ).map((status) => (
                        <SelectItem key={status} value={status}>
                          {findingStatusLabels[status]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <span className="text-muted-foreground font-mono text-xs">
                    {finding.controlCode}
                  </span>
                </TableCell>
                <TableCell>
                  <FrameworkChips frameworks={finding.frameworks} />
                </TableCell>
                <TableCell>
                  <OwnerCell userId={finding.ownerId} />
                </TableCell>
                <TableCell>
                  <span className="text-sm tabular-nums">
                    {finding.ageDays}d
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "text-sm",
                      finding.overdue ? "text-destructive font-medium" : "",
                    )}
                  >
                    {finding.dueLabel}
                  </span>
                  {finding.overdue ? (
                    <p className="text-destructive mt-0.5 text-xs">Overdue</p>
                  ) : null}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                 Audits tab                                 */
/* -------------------------------------------------------------------------- */

function AuditsPanel({
  frameworkFilter,
}: {
  frameworkFilter: FrameworkId | "all";
}) {
  const audits = auditEngagements.filter(
    (audit) =>
      frameworkFilter === "all" || audit.frameworkId === frameworkFilter,
  );
  const active = audits.filter((audit) => audit.active);
  const completed = audits.filter((audit) => !audit.active);

  if (audits.length === 0) {
    return (
      <EmptyState
        icon={Gavel}
        title="No audits for this framework"
        description="Switch the framework scope to see engagements from other programs."
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {active.map((audit) => {
        const lead = getUser(audit.leadId);
        const answered = audit.requestsTotal - audit.requestsOpen;

        return (
          <Panel key={audit.id}>
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-3">
                <div className="bg-muted flex size-10 shrink-0 items-center justify-center rounded-lg border">
                  <Gavel className="text-muted-foreground size-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-semibold">
                    {audit.name}
                  </h3>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {audit.type} · {audit.auditor} · {audit.windowLabel}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="rounded-md">
                  {audit.daysRemaining}d remaining
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 text-xs"
                  onClick={() =>
                    toast({
                      title: "Status shared",
                      description: `${audit.auditor} received the latest readiness summary.`,
                    })
                  }
                >
                  Share status
                </Button>
              </div>
            </div>

            <AuditLifecycleStepper audit={audit} />

            <div className="border-border/60 mt-4 grid gap-4 border-t pt-4 sm:grid-cols-4">
              <div>
                <p className="text-muted-foreground text-xs">
                  Requests answered
                </p>
                <p className="mt-1 text-sm font-medium tabular-nums">
                  {answered}/{audit.requestsTotal}
                </p>
                <ProgressTrack
                  className="mt-2"
                  percent={Math.round((answered / audit.requestsTotal) * 100)}
                />
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Open requests</p>
                <p className="mt-1 text-sm font-medium tabular-nums">
                  {audit.requestsOpen}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Open findings</p>
                <p className="mt-1 text-sm font-medium tabular-nums">
                  {audit.openFindings}
                </p>
              </div>
              <div className="min-w-0">
                <p className="text-muted-foreground text-xs">Lead</p>
                <p className="mt-1 truncate text-sm font-medium">
                  {lead?.name}
                </p>
                <p className="text-muted-foreground mt-0.5 truncate text-xs">
                  {audit.reportDueLabel}
                </p>
              </div>
            </div>
          </Panel>
        );
      })}

      {completed.length > 0 ? (
        <Panel>
          <PanelHeading
            title="Completed engagements"
            description="Historical assessments retained for auditor reference."
          />
          <ul className="divide-border/60 divide-y">
            {completed.map((audit) => (
              <li
                key={audit.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{audit.name}</p>
                  <p className="text-muted-foreground truncate text-xs">
                    {audit.auditor} · {audit.windowLabel}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground text-xs">
                    {audit.reportDueLabel}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5 text-xs"
                    onClick={() =>
                      toast({
                        title: "Report download ready",
                        description: `${audit.name} report prepared.`,
                      })
                    }
                  >
                    <Download className="size-3.5" />
                    Report
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      ) : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                Main surface                                */
/* -------------------------------------------------------------------------- */

export function ComplianceCenter() {
  const {
    controls: complianceControls,
    findings: complianceFindings,
    evidence: complianceEvidence,
    collectors,
    exportEvidencePack,
    exportSelectedControls,
    patchControlStatus,
    patchFindingStatus,
    retestControls,
    requestEvidenceForControls,
  } = useComplianceSession();
  const [ccmBusy, setCcmBusy] = useState(false);
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<ComplianceTab>("overview");
  const [searchQuery, setSearchQuery] = useState(
    () => searchParams.get("q") ?? "",
  );
  const [frameworkFilter, setFrameworkFilter] = useState<FrameworkId | "all">(
    "all",
  );
  const [statusFilters, setStatusFilters] = useState<ControlStatus[]>([]);
  const [categoryFilters, setCategoryFilters] = useState<ControlCategory[]>([]);
  const [sort, setSort] = useState<ControlSort>("status-severity");
  const [attentionKey, setAttentionKey] = useState<AttentionKey | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [selectedControl, setSelectedControl] =
    useState<ComplianceControl | null>(null);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q != null && q !== "") {
      setSearchQuery(q);
      setActiveTab("controls");
    }
  }, [searchParams]);

  const deferredSearchQuery = useDeferredValue(searchQuery);
  const normalizedQuery = deferredSearchQuery.trim().toLowerCase();

  const scopedFrameworks = useMemo(
    () =>
      complianceFrameworks.filter((framework) => {
        const matchesScope =
          frameworkFilter === "all" || framework.id === frameworkFilter;
        const matchesQuery =
          !normalizedQuery ||
          `${framework.name} ${framework.shortName} ${framework.auditor} ${framework.scope}`
            .toLowerCase()
            .includes(normalizedQuery);
        return matchesScope && matchesQuery;
      }),
    [frameworkFilter, normalizedQuery],
  );

  const visibleControls = useMemo(() => {
    const attention = attentionKey
      ? complianceAttentionFilters[attentionKey]
      : null;

    return complianceControls
      .filter((control) => {
        const matchesFramework =
          frameworkFilter === "all" ||
          control.frameworks.includes(frameworkFilter);
        const matchesStatus =
          statusFilters.length === 0 || statusFilters.includes(control.status);
        const matchesCategory =
          categoryFilters.length === 0 ||
          categoryFilters.includes(control.category);
        const matchesAttention = !attention || attention.matches(control);
        const matchesSearch =
          !normalizedQuery ||
          controlSearchIndex(control).includes(normalizedQuery);

        return (
          matchesFramework &&
          matchesStatus &&
          matchesCategory &&
          matchesAttention &&
          matchesSearch
        );
      })
      .sort((a, b) => {
        switch (sort) {
          case "risk-desc":
            return b.riskScore - a.riskScore;
          case "risk-asc":
            return a.riskScore - b.riskScore;
          case "checked-desc":
            return b.lastCheckedValue - a.lastCheckedValue;
          case "checked-asc":
            return a.lastCheckedValue - b.lastCheckedValue;
          case "status-severity":
            return (
              statusWeight[a.status] - statusWeight[b.status] ||
              b.riskScore - a.riskScore
            );
          default:
            return a.code.localeCompare(b.code);
        }
      });
  }, [
    attentionKey,
    categoryFilters,
    complianceControls,
    frameworkFilter,
    normalizedQuery,
    sort,
    statusFilters,
  ]);

  useEffect(() => {
    setPage(1);
  }, [
    attentionKey,
    categoryFilters,
    frameworkFilter,
    normalizedQuery,
    pageSize,
    sort,
    statusFilters,
  ]);

  const pagedControls = useMemo(
    () => paginateItems(visibleControls, page, pageSize),
    [page, pageSize, visibleControls],
  );

  const activeFilterCount =
    statusFilters.length +
    categoryFilters.length +
    (sort === "status-severity" ? 0 : 1) +
    (attentionKey ? 1 : 0);

  const resetFilters = () => {
    setStatusFilters([]);
    setCategoryFilters([]);
    setSort("status-severity");
    setSearchQuery("");
    setAttentionKey(null);
  };

  const toggleStatusFilter = (status: ControlStatus) => {
    setStatusFilters((current) =>
      current.includes(status)
        ? current.filter((entry) => entry !== status)
        : [...current, status],
    );
  };

  const toggleCategoryFilter = (category: ControlCategory) => {
    setCategoryFilters((current) =>
      current.includes(category)
        ? current.filter((entry) => entry !== category)
        : [...current, category],
    );
  };

  const toggleSelection = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((entry) => entry !== id)
        : [...current, id],
    );
  };

  const toggleAllSelection = () => {
    const visibleIds = pagedControls.map((control) => control.id);
    setSelectedIds((current) => {
      const allSelected = visibleIds.every((id) => current.includes(id));
      if (allSelected) {
        return current.filter((id) => !visibleIds.includes(id));
      }
      return Array.from(new Set([...current, ...visibleIds]));
    });
  };

  const openControlsFiltered = (framework?: FrameworkId) => {
    if (framework) setFrameworkFilter(framework);
    setActiveTab("controls");
  };

  const tabCounts = {
    frameworks: complianceFrameworks.length,
    controls: complianceControls.length,
    evidence: complianceEvidence.length,
    findings: complianceFindings.filter(
      (finding) =>
        finding.status !== "remediated" && finding.status !== "accepted",
    ).length,
    audits: auditEngagements.filter((audit) => audit.active).length,
  };

  return (
    <main
      id="main-content"
      className="bg-background flex min-h-0 flex-1 flex-col overflow-hidden"
    >
      <div className="bg-background shrink-0 border-b">
        <div className="flex flex-col gap-2 px-4 py-3 sm:px-6 lg:min-h-14 lg:flex-row lg:items-center lg:justify-between lg:gap-4 lg:py-2">
          <div className="min-w-0 flex-1">
            <InputGroup className="h-9 w-full lg:max-w-sm">
              <InputGroupAddon>
                <Search />
              </InputGroupAddon>
              <InputGroupInput
                value={searchQuery}
                placeholder="Search controls, evidence, findings..."
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </InputGroup>
          </div>

          <div className="flex min-w-0 flex-wrap items-center gap-2 lg:justify-end">
            <Select
              value={frameworkFilter}
              onValueChange={(value) =>
                setFrameworkFilter(value as FrameworkId | "all")
              }
            >
              <SelectTrigger className="h-9 w-[190px]">
                <SelectValue placeholder="Framework scope" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All frameworks</SelectItem>
                {complianceFrameworks.map((framework) => (
                  <SelectItem key={framework.id} value={framework.id}>
                    {framework.shortName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <ControlFilterControl
              statusFilters={statusFilters}
              categoryFilters={categoryFilters}
              sort={sort}
              activeFilterCount={activeFilterCount}
              onToggleStatus={toggleStatusFilter}
              onToggleCategory={toggleCategoryFilter}
              onSetSort={setSort}
              onClearFilters={resetFilters}
            />

            <Button
              size="sm"
              className="h-9 gap-1.5"
              onClick={() => {
                const result = exportEvidencePack(frameworkFilter);
                toast({
                  title: "Evidence pack downloaded",
                  description: `${result.controls} controls · ${result.evidence} evidence · ${result.findings} findings`,
                });
              }}
            >
              <Download className="size-3.5" />
              <span className="hidden sm:inline">Export evidence pack</span>
              <span className="sm:hidden">Export</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
        <div className="mx-auto flex w-full flex-col gap-4">
          <ComplianceStatsStrip
            controls={complianceControls}
            findings={complianceFindings}
          />

          <GrcAuditorPacksPanel />

          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as ComplianceTab)}
            className="flex flex-col gap-4"
          >
            <ModuleTabsList>
              <ModuleTabsTrigger value="overview">Overview</ModuleTabsTrigger>
              <ModuleTabsTrigger value="frameworks">
                Frameworks
                <TabCount>{tabCounts.frameworks}</TabCount>
              </ModuleTabsTrigger>
              <ModuleTabsTrigger value="controls">
                Controls
                <TabCount>{tabCounts.controls}</TabCount>
              </ModuleTabsTrigger>
              <ModuleTabsTrigger value="evidence">
                Evidence
                <TabCount>{tabCounts.evidence}</TabCount>
              </ModuleTabsTrigger>
              <ModuleTabsTrigger value="findings">
                Findings
                <TabCount>{tabCounts.findings}</TabCount>
              </ModuleTabsTrigger>
              <ModuleTabsTrigger value="audits">
                Audits
                <TabCount>{tabCounts.audits}</TabCount>
              </ModuleTabsTrigger>
            </ModuleTabsList>

            <TabsContent value="overview" className="mt-0">
              <ComplianceOverview
                onOpenControls={() => setActiveTab("controls")}
                onOpenEvidence={() => setActiveTab("evidence")}
                onOpenFrameworks={() => setActiveTab("frameworks")}
                onSelectStatus={(status) => {
                  setStatusFilters([status]);
                  setActiveTab("controls");
                }}
              />
            </TabsContent>

            <TabsContent value="frameworks" className="mt-0">
              {scopedFrameworks.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {scopedFrameworks.map((framework) => (
                    <FrameworkCard
                      key={framework.id}
                      framework={framework}
                      controls={complianceControls}
                      onViewControls={openControlsFiltered}
                      onExportEvidence={(id) => {
                        const result = exportEvidencePack(id);
                        toast({
                          title: "Evidence pack downloaded",
                          description: `${result.controls} controls · ${result.evidence} evidence · ${result.findings} findings`,
                        });
                      }}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Scale}
                  title="No frameworks match the current scope"
                  description="Clear the search or widen the framework selector."
                  action={
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8"
                      onClick={resetFilters}
                    >
                      Reset filters
                    </Button>
                  }
                />
              )}
            </TabsContent>

            <TabsContent value="controls" className="mt-0">
              <div className="flex flex-col gap-4">
                <AttentionStrip
                  active={attentionKey}
                  controls={complianceControls}
                  onSelect={(key) =>
                    setAttentionKey((current) => (current === key ? null : key))
                  }
                />

                {visibleControls.length > 0 ? (
                  <ControlsTable
                    controls={pagedControls}
                    selectedIds={selectedIds}
                    onToggleControl={toggleSelection}
                    onToggleAll={toggleAllSelection}
                    onClearSelection={() => setSelectedIds([])}
                    onBulkRetest={() => {
                      const count = retestControls(selectedIds);
                      toast({
                        title: "Re-test queued",
                        description: `${count} control${count === 1 ? "" : "s"} marked pending.`,
                      });
                      setSelectedIds([]);
                    }}
                    onBulkRequestEvidence={() => {
                      const count = requestEvidenceForControls(selectedIds);
                      toast({
                        title: "Evidence requested",
                        description: `Owners notified for ${count} control${count === 1 ? "" : "s"}.`,
                      });
                      setSelectedIds([]);
                    }}
                    onBulkExport={() => {
                      const count = exportSelectedControls(selectedIds);
                      toast({
                        title: "Export downloaded",
                        description: `${count} control${count === 1 ? "" : "s"} written to CSV.`,
                      });
                    }}
                    onView={setSelectedControl}
                    footer={
                      <ListPagination
                        page={page}
                        pageSize={pageSize}
                        total={visibleControls.length}
                        onPageChange={setPage}
                        onPageSizeChange={setPageSize}
                      />
                    }
                  />
                ) : (
                  <EmptyState
                    icon={attentionKey ? ShieldAlert : Radar}
                    title="No controls match the current filters"
                    description="Adjust the framework scope, search, or attention filters to bring controls back into view."
                    action={
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8"
                        onClick={resetFilters}
                      >
                        Reset filters
                      </Button>
                    }
                  />
                )}
              </div>
            </TabsContent>

            <TabsContent value="evidence" className="mt-0">
              <div className="flex flex-col gap-4">
                <div className="border-border/70 flex flex-wrap items-center gap-2 rounded-lg border border-dashed px-3 py-2.5">
                  <Sparkles className="text-muted-foreground size-3.5" />
                  <p className="text-muted-foreground text-xs">
                    Continuous control monitoring · {collectors.length}{" "}
                    collectors ·{" "}
                    {complianceEvidence.filter((item) => item.automated).length}{" "}
                    of {complianceEvidence.length} artifacts automated.
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-auto h-7 gap-1.5 px-2 text-xs"
                    disabled={ccmBusy}
                    onClick={() => {
                      void (async () => {
                        setCcmBusy(true);
                        try {
                          const { receipt, result } =
                            await complianceApi.runCollectors();
                          toast({
                            title: "CCM collectors finished",
                            description: `${receipt.message} · ${receipt.id}`,
                          });
                          // Keep TS happy if result unused visually
                          void result;
                        } finally {
                          setCcmBusy(false);
                        }
                      })();
                    }}
                  >
                    <RefreshCw
                      className={cn("size-3.5", ccmBusy && "animate-spin")}
                    />
                    {ccmBusy ? "Running…" : "Run collectors"}
                  </Button>
                </div>
                {collectors.length > 0 ? (
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {collectors.map((collector: ComplianceCollector) => (
                      <div
                        key={collector.id}
                        className="border-border/70 rounded-lg border px-3 py-2.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium">
                            {collector.name}
                          </p>
                          <Badge
                            variant="outline"
                            className="rounded-full text-xs capitalize"
                          >
                            {collector.status}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mt-1 text-xs">
                          {collector.sourceId} · {collector.schedule}
                        </p>
                        <p className="text-muted-foreground mt-1 text-xs">
                          controlId={collector.controlId} · Last run{" "}
                          {collector.lastRunLabel} ·{" "}
                          {collector.controlCodes.join(", ")}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : null}
                <EvidenceTable
                  frameworkFilter={frameworkFilter}
                  query={normalizedQuery}
                  evidence={complianceEvidence}
                />
              </div>
            </TabsContent>

            <TabsContent value="findings" className="mt-0">
              <div className="flex flex-col gap-4">
                <div className="border-border/70 flex flex-wrap items-center gap-2 rounded-lg border border-dashed px-3 py-2.5">
                  <FileWarning className="text-muted-foreground size-3.5" />
                  <p className="text-muted-foreground text-xs">
                    {complianceFindings.filter((f) => f.overdue).length}{" "}
                    findings are past their remediation due date and will be
                    reported as exceptions.
                  </p>
                </div>
                <FindingsTable
                  frameworkFilter={frameworkFilter}
                  query={normalizedQuery}
                  findings={complianceFindings}
                  onStatusChange={(finding, status) => {
                    patchFindingStatus(finding.id, status);
                    toast({
                      title: "Finding updated",
                      description: `${finding.title} → ${findingStatusLabels[status]}.`,
                    });
                  }}
                />
              </div>
            </TabsContent>

            <TabsContent value="audits" className="mt-0">
              <AuditsPanel frameworkFilter={frameworkFilter} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <ControlDetailSheet
        control={
          selectedControl
            ? (complianceControls.find((c) => c.id === selectedControl.id) ??
              selectedControl)
            : null
        }
        findings={complianceFindings}
        evidenceItems={complianceEvidence}
        onRetest={(control) => {
          patchControlStatus(control.id, "pending");
          setSelectedControl((current) =>
            current?.id === control.id
              ? { ...current, status: "pending" }
              : current,
          );
          toast({
            title: "Test queued",
            description: `${control.code} marked pending for the next collection cycle.`,
          });
        }}
        onOpenChange={(open) => {
          if (!open) setSelectedControl(null);
        }}
      />
    </main>
  );
}

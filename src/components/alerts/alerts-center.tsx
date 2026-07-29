"use client";

import {
  CheckIcon,
  ChevronRight,
  Download,
  ListFilter,
  Radar,
  Search,
  ShieldAlert,
  Siren,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/lib/toast";
import { downloadCsv } from "@/lib/download-csv";
import { cn } from "@/lib/utils";
import { appendAuditLog } from "@/components/audit/audit-log-data";
import { currentProfile } from "@/components/profile/profile-data";

import {
  alertSeverities,
  type AlertSeverity,
  alertSeverityLabels,
  type AlertSort,
  alertSortLabels,
  alertSourceOptions,
  type AlertStatus,
  alertStatuses,
  alertStatusLabels,
  currentAnalystId,
  getAlertStats,
  type SocAlert,
} from "./alerts-data";
import { AlertsOverview } from "./alerts-overview";
import {
  mutedControlClassName,
  percentFormatter,
  tabTriggerClassName,
} from "./alerts-primitives";
import { queryAlerts } from "./alerts-query";
import { useAlertsSession } from "./alerts-session";
import { AlertsTable } from "./alerts-table";
import {
  buildAlertsListHref,
  overviewFilterToHref,
  parseAlertsListSearchParams,
} from "./alerts-url";
import { createIncidentFromAlerts } from "@/components/incidents/incidents-session";

type FilterPanel = "severity" | "status" | "source" | "sort";

function AlertsStatsStrip({ alerts }: { alerts: Iterable<SocAlert> }) {
  const stats = getAlertStats(alerts);

  return (
    <section className="border-border/70 border-b border-dashed pb-4">
      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-5 xl:gap-0">
        {stats.map((stat, index) => {
          const isIncrease = stat.delta >= 0;
          const isHealthy = stat.preferLower ? !isIncrease : isIncrease;
          const deltaLabel = `${isIncrease ? "+" : ""}${percentFormatter.format(
            stat.delta,
          )}%`;

          return (
            <section
              key={stat.key}
              className={cn(
                "space-y-2 py-2 sm:py-1",
                index > 0 && "xl:border-border/70 xl:border-l",
                index === 0 && "xl:pr-6",
                index > 0 && index < stats.length - 1 && "xl:px-6",
                index === stats.length - 1 && "xl:pl-6",
              )}
            >
              <p className="text-muted-foreground text-sm">{stat.title}</p>
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <p className="text-3xl leading-none font-semibold tracking-tight tabular-nums">
                    {stat.value}
                  </p>
                  <span
                    className={cn(
                      "text-sm",
                      isHealthy ? "text-emerald-600" : "text-rose-600",
                    )}
                  >
                    {deltaLabel}
                  </span>
                </div>
                <span className="text-muted-foreground block text-sm">
                  {stat.context}
                </span>
              </div>
            </section>
          );
        })}
      </div>
    </section>
  );
}

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

function AlertFilterControl({
  severityFilters,
  statusFilters,
  sourceIdFilters,
  sort,
  activeFilterCount,
  onToggleSeverity,
  onToggleStatus,
  onToggleSourceId,
  onSetSort,
  onClearFilters,
}: {
  severityFilters: AlertSeverity[];
  statusFilters: AlertStatus[];
  sourceIdFilters: string[];
  sort: AlertSort;
  activeFilterCount: number;
  onToggleSeverity: (severity: AlertSeverity) => void;
  onToggleStatus: (status: AlertStatus) => void;
  onToggleSourceId: (sourceId: string) => void;
  onSetSort: (sort: AlertSort) => void;
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
          className={cn("relative h-9 gap-1.5 px-2.5", mutedControlClassName)}
        >
          <ListFilter className="size-3.5" />
          Filter
          {activeFilterCount > 0 ? (
            <span className="bg-primary text-primary-foreground absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full text-[10px] font-semibold">
              {activeFilterCount}
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="end">
        {panel === null ? (
          <Command>
            <CommandList>
              <CommandGroup>
                <CommandItem
                  onSelect={() => setPanel("severity")}
                  className="flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <ShieldAlert className="size-4 text-zinc-500" />
                    Severity
                  </span>
                  <div className="flex items-center">
                    {severityFilters.length > 0 ? (
                      <span className="mr-1 text-xs text-zinc-500">
                        {severityFilters.length}
                      </span>
                    ) : null}
                    <ChevronRight className="size-4" />
                  </div>
                </CommandItem>
                <CommandItem
                  onSelect={() => setPanel("status")}
                  className="flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <Radar className="size-4 text-zinc-500" />
                    Status
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
                  onSelect={() => setPanel("source")}
                  className="flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <Siren className="size-4 text-zinc-500" />
                    Source
                  </span>
                  <div className="flex items-center">
                    {sourceIdFilters.length > 0 ? (
                      <span className="mr-1 text-xs text-zinc-500">
                        {sourceIdFilters.length}
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
                    Sort
                  </span>
                  <ChevronRight className="size-4" />
                </CommandItem>
              </CommandGroup>
              {activeFilterCount > 0 ? (
                <>
                  <CommandSeparator />
                  <CommandGroup>
                    <CommandItem
                      onSelect={() => {
                        onClearFilters();
                        setOpen(false);
                      }}
                      className="text-destructive"
                    >
                      Clear filters
                    </CommandItem>
                  </CommandGroup>
                </>
              ) : null}
            </CommandList>
          </Command>
        ) : null}

        {panel === "severity" ? (
          <div>
            <FilterPanelHeader title="Severity" onBack={closePanel} />
            <Command>
              <CommandList>
                <CommandGroup>
                  {alertSeverities.map((severity) => {
                    const checked = severityFilters.includes(severity);
                    return (
                      <CommandItem
                        key={severity}
                        onSelect={() => onToggleSeverity(severity)}
                        className="justify-between"
                      >
                        {alertSeverityLabels[severity]}
                        {checked ? <CheckIcon className="size-4" /> : null}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </div>
        ) : null}

        {panel === "status" ? (
          <div>
            <FilterPanelHeader title="Status" onBack={closePanel} />
            <Command>
              <CommandList>
                <CommandGroup>
                  {alertStatuses.map((status) => {
                    const checked = statusFilters.includes(status);
                    return (
                      <CommandItem
                        key={status}
                        onSelect={() => onToggleStatus(status)}
                        className="justify-between"
                      >
                        {alertStatusLabels[status]}
                        {checked ? <CheckIcon className="size-4" /> : null}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </div>
        ) : null}

        {panel === "source" ? (
          <div>
            <FilterPanelHeader title="Source" onBack={closePanel} />
            <Command>
              <CommandList>
                <CommandGroup>
                  {alertSourceOptions.map((source) => {
                    const checked = sourceIdFilters.includes(source.sourceId);
                    return (
                      <CommandItem
                        key={source.sourceId}
                        onSelect={() => onToggleSourceId(source.sourceId)}
                        className="justify-between"
                      >
                        {source.sourceName}
                        {checked ? <CheckIcon className="size-4" /> : null}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </div>
        ) : null}

        {panel === "sort" ? (
          <div>
            <FilterPanelHeader title="Sort" onBack={closePanel} />
            <Command>
              <CommandList>
                <CommandGroup>
                  {(Object.keys(alertSortLabels) as AlertSort[]).map(
                    (option) => (
                      <CommandItem
                        key={option}
                        onSelect={() => {
                          onSetSort(option);
                          closePanel();
                        }}
                        className="justify-between"
                      >
                        {alertSortLabels[option]}
                        {sort === option ? (
                          <CheckIcon className="size-4" />
                        ) : null}
                      </CommandItem>
                    ),
                  )}
                </CommandGroup>
              </CommandList>
            </Command>
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}

export type AlertsView = "overview" | "list";

export function AlertsCenter({ view }: { view: AlertsView }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { alerts: alertList, getAlert, patchAlerts } = useAlertsSession();

  const urlFilters = useMemo(
    () => parseAlertsListSearchParams(searchParams),
    [searchParams],
  );

  const [searchQuery, setSearchQuery] = useState(urlFilters.search);
  const [severityFilters, setSeverityFilters] = useState<AlertSeverity[]>(
    urlFilters.severities,
  );
  const [statusFilters, setStatusFilters] = useState<AlertStatus[]>(
    urlFilters.statuses,
  );
  const [sourceIdFilters, setSourceIdFilters] = useState<string[]>(
    urlFilters.sourceIds,
  );
  const [sort, setSort] = useState<AlertSort>(urlFilters.sort);
  const [criticalHighOnly, setCriticalHighOnly] = useState(
    urlFilters.criticalHighOnly,
  );
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const skipNextUrlSync = useRef(false);

  const deferredSearchQuery = useDeferredValue(searchQuery);

  // Hydrate filters when navigating from overview (or shared links).
  useEffect(() => {
    if (view !== "list") return;
    skipNextUrlSync.current = true;
    setSearchQuery(urlFilters.search);
    setSeverityFilters(urlFilters.severities);
    setStatusFilters(urlFilters.statuses);
    setSourceIdFilters(urlFilters.sourceIds);
    setSort(urlFilters.sort);
    setCriticalHighOnly(urlFilters.criticalHighOnly);
  }, [urlFilters, view]);

  const queryResult = useMemo(
    () =>
      queryAlerts(alertList, {
        page,
        pageSize,
        search: deferredSearchQuery,
        severities: severityFilters,
        statuses: statusFilters,
        sourceIds: sourceIdFilters,
        criticalHighOnly,
        sort,
      }),
    [
      alertList,
      page,
      pageSize,
      deferredSearchQuery,
      severityFilters,
      statusFilters,
      sourceIdFilters,
      criticalHighOnly,
      sort,
    ],
  );

  useEffect(() => {
    setPage(1);
    setSelectedIds(new Set());
  }, [
    criticalHighOnly,
    deferredSearchQuery,
    pageSize,
    severityFilters,
    sort,
    sourceIdFilters,
    statusFilters,
  ]);

  useEffect(() => {
    if (queryResult.page !== page) {
      setPage(queryResult.page);
    }
  }, [page, queryResult.page]);

  // Keep list URL in sync with active filters so overview drill-downs and
  // in-page filter changes share the same query-param contract.
  useEffect(() => {
    if (view !== "list") return;
    if (skipNextUrlSync.current) {
      skipNextUrlSync.current = false;
      return;
    }

    const nextHref = buildAlertsListHref({
      search: deferredSearchQuery,
      severities: severityFilters,
      statuses: statusFilters,
      sourceIds: sourceIdFilters,
      criticalHighOnly,
      sort,
    });
    const currentHref = buildAlertsListHref(
      parseAlertsListSearchParams(searchParams),
    );
    if (nextHref !== currentHref) {
      router.replace(nextHref, { scroll: false });
    }
  }, [
    view,
    deferredSearchQuery,
    severityFilters,
    statusFilters,
    sourceIdFilters,
    criticalHighOnly,
    sort,
    router,
    searchParams,
  ]);

  const activeFilterCount =
    severityFilters.length +
    statusFilters.length +
    sourceIdFilters.length +
    (sort === "newest" ? 0 : 1) +
    (criticalHighOnly ? 1 : 0);

  const resetFilters = () => {
    setSeverityFilters([]);
    setStatusFilters([]);
    setSourceIdFilters([]);
    setSort("newest");
    setCriticalHighOnly(false);
    setSearchQuery("");
  };

  const openOverviewFilter = (target: Parameters<typeof overviewFilterToHref>[0]) => {
    router.push(overviewFilterToHref(target));
  };

  const toggleSeverityFilter = (severity: AlertSeverity) => {
    setSeverityFilters((current) =>
      current.includes(severity)
        ? current.filter((item) => item !== severity)
        : [...current, severity],
    );
  };

  const toggleStatusFilter = (status: AlertStatus) => {
    setStatusFilters((current) =>
      current.includes(status)
        ? current.filter((item) => item !== status)
        : [...current, status],
    );
  };

  const toggleSourceIdFilter = (sourceId: string) => {
    setSourceIdFilters((current) =>
      current.includes(sourceId)
        ? current.filter((item) => item !== sourceId)
        : [...current, sourceId],
    );
  };

  const toggleSelectAllPage = () => {
    setSelectedIds((current) => {
      const next = new Set(current);
      const allSelected = queryResult.items.every((alert) =>
        next.has(alert.id),
      );
      if (allSelected) {
        for (const alert of queryResult.items) next.delete(alert.id);
      } else {
        for (const alert of queryResult.items) next.add(alert.id);
      }
      return next;
    });
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleEscalate = (id: string) => {
    const current = getAlert(id);
    if (!current) return;
    const incident = createIncidentFromAlerts([current], {
      assigneeId: current.assigneeId ?? currentAnalystId,
    });
    patchAlerts([id], {
      status: "escalated",
      assigneeId: current.assigneeId ?? currentAnalystId,
    });
    toast({
      title: "Escalated to incident",
      description: `${id} linked to ${incident.id}`,
    });
    router.push(`/incidents/${incident.id}`);
  };

  const bulkEscalate = () => {
    if (selectedIds.size === 0) return;
    const alerts = Array.from(selectedIds)
      .map((id) => getAlert(id))
      .filter((alert): alert is SocAlert => Boolean(alert));
    if (alerts.length === 0) return;
    const incident = createIncidentFromAlerts(alerts);
    patchAlerts(selectedIds, { status: "escalated" });
    toast({
      title: "Bulk escalate",
      description: `${alerts.length} alerts linked to ${incident.id}`,
    });
    setSelectedIds(new Set());
    router.push(`/incidents/${incident.id}`);
  };

  const bulkAssign = (assigneeId: string | null) => {
    if (selectedIds.size === 0) return;
    patchAlerts(selectedIds, { assigneeId });
    toast({
      title: "Assignee updated",
      description: `${selectedIds.size} alerts reassigned.`,
    });
    setSelectedIds(new Set());
  };

  const bulkSetStatus = (status: AlertStatus) => {
    if (selectedIds.size === 0) return;
    patchAlerts(selectedIds, { status });
    toast({
      title: "Status updated",
      description: `${selectedIds.size} alerts → ${alertStatusLabels[status]}.`,
    });
    setSelectedIds(new Set());
  };

  return (
    <main
      id="main-content"
      className="bg-background flex min-h-0 flex-1 flex-col overflow-hidden"
    >
      {view === "list" ? (
        <div className="border-b">
          <div className="flex flex-col gap-2 px-4 py-3 sm:px-6 lg:min-h-14 lg:flex-row lg:items-center lg:justify-between lg:gap-4 lg:py-2">
            <div className="min-w-0 flex-1">
              <InputGroup className="h-9 w-full lg:max-w-sm">
                <InputGroupAddon>
                  <Search />
                </InputGroupAddon>
                <InputGroupInput
                  value={searchQuery}
                  placeholder="Search alerts, rules, entities, sources…"
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
              </InputGroup>
            </div>

            <div className="flex min-w-0 flex-wrap items-center gap-2 lg:justify-end">
              <label className="border-border bg-background hover:bg-accent flex h-9 cursor-pointer items-center gap-2 rounded-md border px-2.5 text-sm">
                <Switch
                  id="critical-high"
                  checked={criticalHighOnly}
                  onCheckedChange={setCriticalHighOnly}
                />
                <span>Critical & high</span>
              </label>

              <AlertFilterControl
                severityFilters={severityFilters}
                statusFilters={statusFilters}
                sourceIdFilters={sourceIdFilters}
                sort={sort}
                activeFilterCount={activeFilterCount}
                onToggleSeverity={toggleSeverityFilter}
                onToggleStatus={toggleStatusFilter}
                onToggleSourceId={toggleSourceIdFilter}
                onSetSort={setSort}
                onClearFilters={resetFilters}
              />

              <Button
                size="sm"
                className="h-9 gap-1.5"
                onClick={() => {
                  const exportResult = queryAlerts(alertList, {
                    page: 1,
                    pageSize: Math.max(queryResult.total, 1),
                    search: deferredSearchQuery,
                    severities: severityFilters,
                    statuses: statusFilters,
                    sourceIds: sourceIdFilters,
                    criticalHighOnly,
                    sort,
                  });
                  downloadCsv({
                    filename: `heimdall-alerts-${new Date().toISOString().slice(0, 10)}.csv`,
                    headers: [
                      "id",
                      "title",
                      "severity",
                      "status",
                      "source",
                      "rule",
                      "mitre_technique",
                      "entity",
                      "assignee",
                      "created_at",
                      "risk_score",
                      "notes",
                    ],
                    rows: exportResult.items.map((alert) => [
                      alert.id,
                      alert.title,
                      alert.severity,
                      alert.status,
                      alert.sourceName,
                      alert.ruleName,
                      alert.mitreTechnique ?? "",
                      alert.entityName,
                      alert.assigneeId ?? "",
                      alert.createdAt,
                      alert.riskScore,
                      alert.notes ?? "",
                    ]),
                  });
                  appendAuditLog({
                    actorId: currentProfile.id,
                    actorName: currentProfile.name,
                    action: "export.alerts_csv",
                    targetType: "export",
                    targetId: "alerts",
                    detail: `Downloaded ${exportResult.total} alerts`,
                  });
                  toast({
                    title: "Export downloaded",
                    description: `${exportResult.total.toLocaleString("en-US")} alerts saved as CSV.`,
                  });
                }}
              >
                <Download className="size-3.5" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
        <div className="mx-auto flex w-full flex-col gap-4">
          <AlertsStatsStrip alerts={alertList} />

          <Tabs
            value={view}
            onValueChange={(value) =>
              router.push(
                value === "overview" ? "/alerts/overview" : "/alerts/list",
              )
            }
            className="flex flex-col gap-4"
          >
            <div className="overflow-x-auto border-b">
              <TabsList className="inline-flex h-auto min-w-max justify-start gap-7 rounded-none bg-transparent p-0 sm:gap-8">
                <TabsTrigger value="overview" className={tabTriggerClassName}>
                  Overview
                </TabsTrigger>
                <TabsTrigger value="list" className={tabTriggerClassName}>
                  All Alerts
                  <span className="bg-muted text-muted-foreground rounded-md px-1.5 py-0.5 text-xs">
                    {queryResult.openCount.toLocaleString("en-US")}
                  </span>
                </TabsTrigger>
              </TabsList>
            </div>

            {view === "overview" ? (
              <AlertsOverview
                alerts={alertList}
                onFilter={openOverviewFilter}
              />
            ) : (
              <AlertsTable
                items={queryResult.items}
                total={queryResult.total}
                page={queryResult.page}
                pageSize={pageSize}
                sort={sort}
                selectedIds={selectedIds}
                activeFilterCount={activeFilterCount}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
                onSortChange={setSort}
                onToggleSelectAllPage={toggleSelectAllPage}
                onToggleSelect={toggleSelect}
                onClearSelection={() => setSelectedIds(new Set())}
                onBulkAssignToMe={() => bulkAssign(currentAnalystId)}
                onBulkEscalate={bulkEscalate}
                onBulkClose={() => bulkSetStatus("closed")}
                onBulkFalsePositive={() => bulkSetStatus("false-positive")}
                onAssignToMe={(id) => {
                  const alert = getAlert(id);
                  if (!alert) return;
                  patchAlerts([id], {
                    assigneeId: currentAnalystId,
                    status:
                      alert.status === "new" ? "triaging" : alert.status,
                  });
                  toast({ title: "Assigned to you", description: id });
                }}
                onEscalate={handleEscalate}
                onMarkFalsePositive={(id) => {
                  patchAlerts([id], { status: "false-positive" });
                  toast({
                    title: "Marked false positive",
                    description: id,
                  });
                }}
                onClose={(id) => {
                  patchAlerts([id], { status: "closed" });
                  toast({ title: "Alert closed", description: id });
                }}
                onClearFilters={resetFilters}
              />
            )}
          </Tabs>
        </div>
      </div>
    </main>
  );
}

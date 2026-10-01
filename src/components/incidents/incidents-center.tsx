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

import { appendAuditLog } from "@/components/audit/audit-log-data";
import { currentProfile } from "@/components/profile/profile-data";
import { StatsStrip } from "@/components/soc/stats-strip";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { downloadCsv } from "@/lib/download-csv";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

import {
  currentAnalystId,
  getIncidentAssignees,
  incidentPriorities,
  type IncidentPriority,
  incidentPriorityLabels,
  type IncidentSort,
  incidentSortLabels,
  incidentSourceOptions,
  type IncidentStatus,
  incidentStatuses,
  incidentStatusLabels,
  openIncidentStatuses,
  type SocIncident,
} from "./incidents-data";
import { IncidentsOverview } from "./incidents-overview";
import {
  mutedControlClassName,
  tabTriggerClassName,
} from "./incidents-primitives";
import { queryIncidents } from "./incidents-query";
import { useIncidentsSession } from "./incidents-session";
import { IncidentsTable } from "./incidents-table";
import {
  type AssignedScope,
  assignedScopeToAssigneeIds,
  buildIncidentsAssignedHref,
  buildIncidentsListHref,
  getIncidentStatsWithHrefs,
  overviewFilterToHref,
  parseAssignedScope,
  parseIncidentsListSearchParams,
} from "./incidents-url";

type FilterPanel = "priority" | "phase" | "source" | "sort";

function IncidentsStatsStrip({
  incidents,
}: {
  incidents: Iterable<SocIncident>;
}) {
  return <StatsStrip stats={getIncidentStatsWithHrefs(incidents)} />;
}

function AssignedScopeControl({
  scope,
  onScopeChange,
}: {
  scope: AssignedScope;
  onScopeChange: (scope: AssignedScope) => void;
}) {
  const assignees = useMemo(() => getIncidentAssignees(), []);
  const isAnalystScope = scope !== "mine" && scope !== "unassigned";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="bg-muted/60 inline-flex rounded-md border p-0.5">
        {(
          [
            { value: "mine" as const, label: "Mine" },
            { value: "unassigned" as const, label: "Unassigned" },
          ] as const
        ).map((option) => {
          const active = scope === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onScopeChange(option.value)}
              className={
                active
                  ? "bg-background text-foreground rounded-sm px-2.5 py-1 text-xs font-medium shadow-sm"
                  : "text-muted-foreground hover:text-foreground rounded-sm px-2.5 py-1 text-xs font-medium"
              }
            >
              {option.label}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => {
            if (!isAnalystScope) {
              onScopeChange(assignees[0]?.id ?? currentAnalystId);
            }
          }}
          className={
            isAnalystScope
              ? "bg-background text-foreground rounded-sm px-2.5 py-1 text-xs font-medium shadow-sm"
              : "text-muted-foreground hover:text-foreground rounded-sm px-2.5 py-1 text-xs font-medium"
          }
        >
          By analyst
        </button>
      </div>
      {isAnalystScope ? (
        <Select value={scope} onValueChange={(value) => onScopeChange(value)}>
          <SelectTrigger className={cn("h-8 w-[180px]", mutedControlClassName)}>
            <SelectValue placeholder="Select analyst" />
          </SelectTrigger>
          <SelectContent>
            {assignees.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : null}
    </div>
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

function IncidentFilterControl({
  priorityFilters,
  statusFilters,
  sourceIdFilters,
  sort,
  activeFilterCount,
  onTogglePriority,
  onToggleStatus,
  onToggleSourceId,
  onSetSort,
  onClearFilters,
}: {
  priorityFilters: IncidentPriority[];
  statusFilters: IncidentStatus[];
  sourceIdFilters: string[];
  sort: IncidentSort;
  activeFilterCount: number;
  onTogglePriority: (priority: IncidentPriority) => void;
  onToggleStatus: (status: IncidentStatus) => void;
  onToggleSourceId: (sourceId: string) => void;
  onSetSort: (sort: IncidentSort) => void;
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
                  onSelect={() => setPanel("priority")}
                  className="flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <ShieldAlert className="size-4 text-zinc-500" />
                    Priority
                  </span>
                  <div className="flex items-center">
                    {priorityFilters.length > 0 ? (
                      <span className="mr-1 text-xs text-zinc-500">
                        {priorityFilters.length}
                      </span>
                    ) : null}
                    <ChevronRight className="size-4" />
                  </div>
                </CommandItem>
                <CommandItem
                  onSelect={() => setPanel("phase")}
                  className="flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <Radar className="size-4 text-zinc-500" />
                    Response phase
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

        {panel === "priority" ? (
          <div>
            <FilterPanelHeader title="Priority" onBack={closePanel} />
            <Command>
              <CommandList>
                <CommandGroup>
                  {incidentPriorities.map((priority) => {
                    const checked = priorityFilters.includes(priority);
                    return (
                      <CommandItem
                        key={priority}
                        onSelect={() => onTogglePriority(priority)}
                        className="justify-between"
                      >
                        {incidentPriorityLabels[priority]}
                        {checked ? <CheckIcon className="size-4" /> : null}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </div>
        ) : null}

        {panel === "phase" ? (
          <div>
            <FilterPanelHeader title="Response phase" onBack={closePanel} />
            <Command>
              <CommandList>
                <CommandGroup>
                  {incidentStatuses.map((status) => {
                    const checked = statusFilters.includes(status);
                    return (
                      <CommandItem
                        key={status}
                        onSelect={() => onToggleStatus(status)}
                        className="justify-between"
                      >
                        {incidentStatusLabels[status]}
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
                  {incidentSourceOptions.map((source) => {
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
                  {(Object.keys(incidentSortLabels) as IncidentSort[]).map(
                    (option) => (
                      <CommandItem
                        key={option}
                        onSelect={() => {
                          onSetSort(option);
                          closePanel();
                        }}
                        className="justify-between"
                      >
                        {incidentSortLabels[option]}
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

export type IncidentsView = "overview" | "list" | "assigned";

export function IncidentsCenter({ view }: { view: IncidentsView }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { incidents: incidentList, getIncident, patchIncidents } =
    useIncidentsSession();

  const urlFilters = useMemo(
    () => parseIncidentsListSearchParams(searchParams),
    [searchParams],
  );
  const urlScope = useMemo(
    () => parseAssignedScope(searchParams),
    [searchParams],
  );

  const [searchQuery, setSearchQuery] = useState(urlFilters.search);
  const [priorityFilters, setPriorityFilters] = useState<IncidentPriority[]>(
    urlFilters.priorities,
  );
  const [statusFilters, setStatusFilters] = useState<IncidentStatus[]>(
    urlFilters.statuses,
  );
  const [sourceIdFilters, setSourceIdFilters] = useState<string[]>(
    urlFilters.sourceIds,
  );
  const [sort, setSort] = useState<IncidentSort>(urlFilters.sort);
  const [p1P2Only, setP1P2Only] = useState(urlFilters.p1P2Only);
  const [assignedScope, setAssignedScope] =
    useState<AssignedScope>(urlScope);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const skipNextUrlSync = useRef(false);

  const deferredSearchQuery = useDeferredValue(searchQuery);
  const showFilterBar = view === "list" || view === "assigned";
  const assigneeIds = useMemo(
    () =>
      view === "assigned"
        ? assignedScopeToAssigneeIds(assignedScope)
        : undefined,
    [view, assignedScope],
  );

  useEffect(() => {
    if (!showFilterBar) return;
    skipNextUrlSync.current = true;
    setSearchQuery(urlFilters.search);
    setPriorityFilters(urlFilters.priorities);
    setStatusFilters(urlFilters.statuses);
    setSourceIdFilters(urlFilters.sourceIds);
    setSort(urlFilters.sort);
    setP1P2Only(urlFilters.p1P2Only);
    if (view === "assigned") setAssignedScope(urlScope);
  }, [urlFilters, urlScope, view, showFilterBar]);

  const queryResult = useMemo(
    () =>
      queryIncidents(incidentList, {
        page,
        pageSize,
        search: deferredSearchQuery,
        priorities: priorityFilters,
        statuses: statusFilters,
        sourceIds: sourceIdFilters,
        assigneeIds,
        p1P2Only,
        sort,
      }),
    [
      incidentList,
      page,
      pageSize,
      deferredSearchQuery,
      priorityFilters,
      statusFilters,
      sourceIdFilters,
      assigneeIds,
      p1P2Only,
      sort,
    ],
  );

  const mineOpenCount = useMemo(() => {
    let count = 0;
    for (const incident of incidentList) {
      if (
        incident.assigneeId === currentAnalystId &&
        openIncidentStatuses.includes(incident.status)
      ) {
        count += 1;
      }
    }
    return count;
  }, [incidentList]);

  const allOpenCount = useMemo(() => {
    let count = 0;
    for (const incident of incidentList) {
      if (openIncidentStatuses.includes(incident.status)) count += 1;
    }
    return count;
  }, [incidentList]);

  useEffect(() => {
    setPage(1);
    setSelectedIds(new Set());
  }, [
    assignedScope,
    p1P2Only,
    deferredSearchQuery,
    pageSize,
    priorityFilters,
    sort,
    sourceIdFilters,
    statusFilters,
    view,
  ]);

  useEffect(() => {
    if (queryResult.page !== page) {
      setPage(queryResult.page);
    }
  }, [page, queryResult.page]);

  useEffect(() => {
    if (!showFilterBar) return;
    if (skipNextUrlSync.current) {
      skipNextUrlSync.current = false;
      return;
    }

    const filterPayload = {
      search: deferredSearchQuery,
      priorities: priorityFilters,
      statuses: statusFilters,
      sourceIds: sourceIdFilters,
      p1P2Only,
      sort,
    };
    const nextHref =
      view === "assigned"
        ? buildIncidentsAssignedHref({
            scope: assignedScope,
            filters: filterPayload,
          })
        : buildIncidentsListHref(filterPayload);
    const currentHref =
      view === "assigned"
        ? buildIncidentsAssignedHref({
            scope: parseAssignedScope(searchParams),
            filters: parseIncidentsListSearchParams(searchParams),
          })
        : buildIncidentsListHref(parseIncidentsListSearchParams(searchParams));
    if (nextHref !== currentHref) {
      router.replace(nextHref, { scroll: false });
    }
  }, [
    view,
    showFilterBar,
    deferredSearchQuery,
    priorityFilters,
    statusFilters,
    sourceIdFilters,
    p1P2Only,
    sort,
    assignedScope,
    router,
    searchParams,
  ]);

  const activeFilterCount =
    priorityFilters.length +
    statusFilters.length +
    sourceIdFilters.length +
    (sort === "newest" ? 0 : 1) +
    (p1P2Only ? 1 : 0);

  const resetFilters = () => {
    setPriorityFilters([]);
    setStatusFilters([]);
    setSourceIdFilters([]);
    setSort("newest");
    setP1P2Only(false);
    setSearchQuery("");
  };

  const openOverviewFilter = (
    target: Parameters<typeof overviewFilterToHref>[0],
  ) => {
    router.push(overviewFilterToHref(target));
  };

  const changeAssignedScope = (scope: AssignedScope) => {
    setAssignedScope(scope);
  };

  const togglePriorityFilter = (priority: IncidentPriority) => {
    setPriorityFilters((current) =>
      current.includes(priority)
        ? current.filter((item) => item !== priority)
        : [...current, priority],
    );
  };

  const toggleStatusFilter = (status: IncidentStatus) => {
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
      const allSelected = queryResult.items.every((incident) =>
        next.has(incident.id),
      );
      if (allSelected) {
        for (const incident of queryResult.items) next.delete(incident.id);
      } else {
        for (const incident of queryResult.items) next.add(incident.id);
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

  const bulkAssign = (assigneeId: string | null) => {
    if (selectedIds.size === 0) return;
    patchIncidents(selectedIds, { assigneeId });
    toast({
      title: "Assignee updated",
      description: `${selectedIds.size} incidents reassigned.`,
    });
    setSelectedIds(new Set());
  };

  const bulkSetStatus = (status: IncidentStatus) => {
    if (selectedIds.size === 0) return;
    patchIncidents(selectedIds, { status });
    toast({
      title: "Status updated",
      description: `${selectedIds.size} incidents → ${incidentStatusLabels[status]}.`,
    });
    setSelectedIds(new Set());
  };

  return (
    <main
      id="main-content"
      className="bg-background flex min-h-0 flex-1 flex-col overflow-hidden"
    >
      {showFilterBar ? (
        <div className="bg-background shrink-0 border-b">
          <div className="flex flex-col gap-2 px-4 py-3 sm:px-6 lg:min-h-14 lg:flex-row lg:items-center lg:justify-between lg:gap-4 lg:py-2">
            <div className="min-w-0 flex-1">
              <InputGroup className="h-9 w-full lg:max-w-sm">
                <InputGroupAddon>
                  <Search />
                </InputGroupAddon>
                <InputGroupInput
                  value={searchQuery}
                  placeholder="Search cases, responders, entities, linked alerts…"
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
              </InputGroup>
            </div>

            <div className="flex min-w-0 flex-wrap items-center gap-2 lg:justify-end">
              <label className="border-border bg-background hover:bg-accent flex h-9 cursor-pointer items-center gap-2 rounded-md border px-2.5 text-sm">
                <Switch
                  id="p1-p2-incidents"
                  checked={p1P2Only}
                  onCheckedChange={setP1P2Only}
                />
                <span>P1 & P2</span>
              </label>

              <IncidentFilterControl
                priorityFilters={priorityFilters}
                statusFilters={statusFilters}
                sourceIdFilters={sourceIdFilters}
                sort={sort}
                activeFilterCount={activeFilterCount}
                onTogglePriority={togglePriorityFilter}
                onToggleStatus={toggleStatusFilter}
                onToggleSourceId={toggleSourceIdFilter}
                onSetSort={setSort}
                onClearFilters={resetFilters}
              />

              <Button
                size="sm"
                className="h-9 gap-1.5"
                onClick={() => {
                  const exportResult = queryIncidents(incidentList, {
                    page: 1,
                    pageSize: Math.max(queryResult.total, 1),
                    search: deferredSearchQuery,
                    priorities: priorityFilters,
                    statuses: statusFilters,
                    sourceIds: sourceIdFilters,
                    assigneeIds,
                    p1P2Only,
                    sort,
                  });
                  downloadCsv({
                    filename: `heimdall-incidents-${new Date().toISOString().slice(0, 10)}.csv`,
                    headers: [
                      "id",
                      "title",
                      "severity",
                      "priority",
                      "status",
                      "source",
                      "entity",
                      "assignee",
                      "owner",
                      "created_at",
                      "risk_score",
                      "mitre_technique",
                    ],
                    rows: exportResult.items.map((incident) => [
                      incident.id,
                      incident.title,
                      incident.severity,
                      incident.priority,
                      incident.status,
                      incident.primarySourceName,
                      incident.entityName,
                      incident.assigneeId ?? "",
                      incident.ownerId ?? "",
                      incident.createdAt,
                      incident.riskScore,
                      incident.mitreTechnique ?? "",
                    ]),
                  });
                  appendAuditLog({
                    actorId: currentProfile.id,
                    actorName: currentProfile.name,
                    action: "export.incidents_csv",
                    targetType: "export",
                    targetId: "incidents",
                    detail: `Downloaded ${exportResult.total} incidents`,
                  });
                  toast({
                    title: "Export downloaded",
                    description: `${exportResult.total.toLocaleString("en-US")} incidents saved as CSV.`,
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
          {view === "overview" ? (
            <IncidentsStatsStrip incidents={incidentList} />
          ) : null}

          <Tabs
            value={view}
            onValueChange={(value) => {
              if (value === "overview") router.push("/incidents/overview");
              else if (value === "assigned") {
                router.push(buildIncidentsAssignedHref({ scope: "mine" }));
              } else router.push("/incidents/list");
            }}
            className="flex flex-col gap-4"
          >
            <div className="overflow-x-auto border-b">
              <TabsList className="inline-flex h-auto min-w-max justify-start gap-7 rounded-none bg-transparent p-0 sm:gap-8">
                <TabsTrigger value="overview" className={tabTriggerClassName}>
                  Overview
                </TabsTrigger>
                <TabsTrigger value="assigned" className={tabTriggerClassName}>
                  Assigned
                  <span className="bg-muted text-muted-foreground rounded-md px-1.5 py-0.5 text-xs">
                    {mineOpenCount.toLocaleString("en-US")}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="list" className={tabTriggerClassName}>
                  Active cases
                  <span className="bg-muted text-muted-foreground rounded-md px-1.5 py-0.5 text-xs">
                    {allOpenCount.toLocaleString("en-US")}
                  </span>
                </TabsTrigger>
              </TabsList>
            </div>

            {view === "overview" ? (
              <IncidentsOverview
                incidents={incidentList}
                onFilter={openOverviewFilter}
              />
            ) : (
              <div className="flex flex-col gap-3">
                {view === "assigned" ? (
                  <AssignedScopeControl
                    scope={assignedScope}
                    onScopeChange={changeAssignedScope}
                  />
                ) : null}
                <IncidentsTable
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
                  onBulkContain={() => bulkSetStatus("contained")}
                  onBulkResolve={() => bulkSetStatus("resolved")}
                  onBulkClose={() => bulkSetStatus("closed")}
                  onAssignToMe={(id) => {
                    const incident = getIncident(id);
                    if (!incident) return;
                    patchIncidents([id], {
                      assigneeId: currentAnalystId,
                      status:
                        incident.status === "new"
                          ? "investigating"
                          : incident.status,
                    });
                    toast({ title: "Assigned to you", description: id });
                  }}
                  onContain={(id) => {
                    patchIncidents([id], { status: "contained" });
                    toast({ title: "Marked contained", description: id });
                  }}
                  onResolve={(id) => {
                    patchIncidents([id], { status: "resolved" });
                    toast({ title: "Incident resolved", description: id });
                  }}
                  onClose={(id) => {
                    patchIncidents([id], { status: "closed" });
                    toast({ title: "Incident closed", description: id });
                  }}
                  onClearFilters={resetFilters}
                />
              </div>
            )}
          </Tabs>
        </div>
      </div>
    </main>
  );
}

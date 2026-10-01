"use client";

import { Download, Radar, Search, ShieldAlert, Siren } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";

import { appendAuditLog } from "@/components/audit/audit-log-data";
import { currentProfile } from "@/components/profile/profile-data";
import { type FilterFacet, FilterMenu } from "@/components/soc/filter-menu";
import {
  ModuleShell,
  ModuleToolbarActions,
  ModuleToolbarSearch,
} from "@/components/soc/module-shell";
import {
  ModuleTabsList,
  ModuleTabsTrigger,
  TabCount,
} from "@/components/soc/module-tabs";
import { SegmentedControl } from "@/components/soc/segmented-control";
import { StatsStrip } from "@/components/soc/stats-strip";
import { ToolbarToggle } from "@/components/soc/toolbar-toggle";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs } from "@/components/ui/tabs";
import { downloadCsv } from "@/lib/download-csv";
import { toast } from "@/lib/toast";

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

function IncidentsStatsStrip({
  incidents,
}: {
  incidents: Iterable<SocIncident>;
}) {
  return <StatsStrip stats={getIncidentStatsWithHrefs(incidents)} />;
}

type ScopeMode = "mine" | "unassigned" | "analyst";

function AssignedScopeControl({
  scope,
  onScopeChange,
}: {
  scope: AssignedScope;
  onScopeChange: (scope: AssignedScope) => void;
}) {
  const assignees = useMemo(() => getIncidentAssignees(), []);
  const mode: ScopeMode =
    scope === "mine"
      ? "mine"
      : scope === "unassigned"
        ? "unassigned"
        : "analyst";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <SegmentedControl<ScopeMode>
        aria-label="Assignment scope"
        value={mode}
        onChange={(next) => {
          if (next === "analyst") {
            if (mode !== "analyst") {
              onScopeChange(assignees[0]?.id ?? currentAnalystId);
            }
          } else onScopeChange(next);
        }}
        options={[
          { value: "mine", label: "Mine" },
          { value: "unassigned", label: "Unassigned" },
          { value: "analyst", label: "By analyst" },
        ]}
      />
      {mode === "analyst" ? (
        <Select value={scope} onValueChange={(value) => onScopeChange(value)}>
          <SelectTrigger className="h-8 w-[180px]" aria-label="Analyst">
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
  onTogglePriority: (severity: IncidentPriority) => void;
  onToggleStatus: (status: IncidentStatus) => void;
  onToggleSourceId: (sourceId: string) => void;
  onSetSort: (sort: IncidentSort) => void;
  onClearFilters: () => void;
}) {
  const facets: FilterFacet[] = [
    {
      id: "priority",
      label: "Priority",
      icon: ShieldAlert,
      options: incidentPriorities.map((value) => ({
        value,
        label: incidentPriorityLabels[value],
      })),
      selected: priorityFilters,
      onToggle: (value) => onTogglePriority(value as IncidentPriority),
    },
    {
      id: "phase",
      label: "Response phase",
      icon: Radar,
      options: incidentStatuses.map((value) => ({
        value,
        label: incidentStatusLabels[value],
      })),
      selected: statusFilters,
      onToggle: (value) => onToggleStatus(value as IncidentStatus),
    },
    {
      id: "source",
      label: "Source",
      icon: Siren,
      options: incidentSourceOptions.map((source) => ({
        value: source.sourceId,
        label: source.sourceName,
      })),
      selected: sourceIdFilters,
      onToggle: onToggleSourceId,
    },
    {
      id: "sort",
      label: "Sort",
      single: true,
      hideCount: true,
      options: (Object.keys(incidentSortLabels) as IncidentSort[]).map(
        (value) => ({
          value,
          label: incidentSortLabels[value],
        }),
      ),
      selected: [sort],
      onToggle: (value) => onSetSort(value as IncidentSort),
    },
  ];

  return (
    <FilterMenu
      facets={facets}
      activeCount={activeFilterCount}
      onClear={onClearFilters}
    />
  );
}

export type IncidentsView = "overview" | "list" | "assigned";

export function IncidentsCenter({ view }: { view: IncidentsView }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    incidents: incidentList,
    getIncident,
    patchIncidents,
  } = useIncidentsSession();

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
  const [assignedScope, setAssignedScope] = useState<AssignedScope>(urlScope);
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
    <ModuleShell
      toolbar={
        showFilterBar ? (
          <>
            <ModuleToolbarSearch>
              <InputGroup className="h-9 w-full">
                <InputGroupAddon>
                  <Search />
                </InputGroupAddon>
                <InputGroupInput
                  value={searchQuery}
                  placeholder="Search cases, responders, entities, linked alerts…"
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
              </InputGroup>
            </ModuleToolbarSearch>
            <ModuleToolbarActions>
              <ToolbarToggle
                id="p1-p2-incidents"
                checked={p1P2Only}
                onCheckedChange={setP1P2Only}
                label="P1 & P2"
              />

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
                aria-label="Export incidents as CSV"
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
            </ModuleToolbarActions>
          </>
        ) : undefined
      }
    >
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
        <ModuleTabsList>
          <ModuleTabsTrigger value="overview">Overview</ModuleTabsTrigger>
          <ModuleTabsTrigger value="assigned">
            Assigned
            <TabCount>{mineOpenCount.toLocaleString("en-US")}</TabCount>
          </ModuleTabsTrigger>
          <ModuleTabsTrigger value="list">
            Active cases
            <TabCount>{allOpenCount.toLocaleString("en-US")}</TabCount>
          </ModuleTabsTrigger>
        </ModuleTabsList>

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
    </ModuleShell>
  );
}

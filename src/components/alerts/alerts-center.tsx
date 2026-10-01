"use client";

import { Download, Radar, Search, ShieldAlert, Siren } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";

import { appendAuditLog } from "@/components/audit/audit-log-data";
import { createIncidentFromAlerts } from "@/components/incidents/incidents-session";
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
  getAlertAssignees,
  openAlertStatuses,
  type SocAlert,
} from "./alerts-data";
import { AlertsOverview } from "./alerts-overview";
import { queryAlerts } from "./alerts-query";
import { useAlertsSession } from "./alerts-session";
import { AlertsTable } from "./alerts-table";
import {
  type AssignedScope,
  assignedScopeToAssigneeIds,
  buildAlertsAssignedHref,
  buildAlertsListHref,
  getAlertStatsWithHrefs,
  overviewFilterToHref,
  parseAlertsListSearchParams,
  parseAssignedScope,
} from "./alerts-url";

function AlertsStatsStrip({ alerts }: { alerts: Iterable<SocAlert> }) {
  return <StatsStrip stats={getAlertStatsWithHrefs(alerts)} />;
}

type ScopeMode = "mine" | "unassigned" | "analyst";

function AssignedScopeControl({
  scope,
  onScopeChange,
}: {
  scope: AssignedScope;
  onScopeChange: (scope: AssignedScope) => void;
}) {
  const assignees = useMemo(() => getAlertAssignees(), []);
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
  const facets: FilterFacet[] = [
    {
      id: "severity",
      label: "Severity",
      icon: ShieldAlert,
      options: alertSeverities.map((value) => ({
        value,
        label: alertSeverityLabels[value],
      })),
      selected: severityFilters,
      onToggle: (value) => onToggleSeverity(value as AlertSeverity),
    },
    {
      id: "status",
      label: "Status",
      icon: Radar,
      options: alertStatuses.map((value) => ({
        value,
        label: alertStatusLabels[value],
      })),
      selected: statusFilters,
      onToggle: (value) => onToggleStatus(value as AlertStatus),
    },
    {
      id: "source",
      label: "Source",
      icon: Siren,
      options: alertSourceOptions.map((source) => ({
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
      options: (Object.keys(alertSortLabels) as AlertSort[]).map((value) => ({
        value,
        label: alertSortLabels[value],
      })),
      selected: [sort],
      onToggle: (value) => onSetSort(value as AlertSort),
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

export type AlertsView = "overview" | "list" | "assigned";

export function AlertsCenter({ view }: { view: AlertsView }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { alerts: alertList, getAlert, patchAlerts } = useAlertsSession();

  const urlFilters = useMemo(
    () => parseAlertsListSearchParams(searchParams),
    [searchParams],
  );
  const urlScope = useMemo(
    () => parseAssignedScope(searchParams),
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

  // Hydrate filters when navigating from overview (or shared links).
  useEffect(() => {
    if (!showFilterBar) return;
    skipNextUrlSync.current = true;
    setSearchQuery(urlFilters.search);
    setSeverityFilters(urlFilters.severities);
    setStatusFilters(urlFilters.statuses);
    setSourceIdFilters(urlFilters.sourceIds);
    setSort(urlFilters.sort);
    setCriticalHighOnly(urlFilters.criticalHighOnly);
    if (view === "assigned") setAssignedScope(urlScope);
  }, [urlFilters, urlScope, view, showFilterBar]);

  const queryResult = useMemo(
    () =>
      queryAlerts(alertList, {
        page,
        pageSize,
        search: deferredSearchQuery,
        severities: severityFilters,
        statuses: statusFilters,
        sourceIds: sourceIdFilters,
        assigneeIds,
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
      assigneeIds,
      criticalHighOnly,
      sort,
    ],
  );

  const mineOpenCount = useMemo(() => {
    let count = 0;
    for (const alert of alertList) {
      if (
        alert.assigneeId === currentAnalystId &&
        openAlertStatuses.includes(alert.status)
      ) {
        count += 1;
      }
    }
    return count;
  }, [alertList]);

  const allOpenCount = useMemo(() => {
    let count = 0;
    for (const alert of alertList) {
      if (openAlertStatuses.includes(alert.status)) count += 1;
    }
    return count;
  }, [alertList]);

  useEffect(() => {
    setPage(1);
    setSelectedIds(new Set());
  }, [
    assignedScope,
    criticalHighOnly,
    deferredSearchQuery,
    pageSize,
    severityFilters,
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

  // Keep list/assigned URL in sync with active filters.
  useEffect(() => {
    if (!showFilterBar) return;
    if (skipNextUrlSync.current) {
      skipNextUrlSync.current = false;
      return;
    }

    const filterPayload = {
      search: deferredSearchQuery,
      severities: severityFilters,
      statuses: statusFilters,
      sourceIds: sourceIdFilters,
      criticalHighOnly,
      sort,
    };
    const nextHref =
      view === "assigned"
        ? buildAlertsAssignedHref({
            scope: assignedScope,
            filters: filterPayload,
          })
        : buildAlertsListHref(filterPayload);
    const currentHref =
      view === "assigned"
        ? buildAlertsAssignedHref({
            scope: parseAssignedScope(searchParams),
            filters: parseAlertsListSearchParams(searchParams),
          })
        : buildAlertsListHref(parseAlertsListSearchParams(searchParams));
    if (nextHref !== currentHref) {
      router.replace(nextHref, { scroll: false });
    }
  }, [
    view,
    showFilterBar,
    deferredSearchQuery,
    severityFilters,
    statusFilters,
    sourceIdFilters,
    criticalHighOnly,
    sort,
    assignedScope,
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

  const openOverviewFilter = (
    target: Parameters<typeof overviewFilterToHref>[0],
  ) => {
    router.push(overviewFilterToHref(target));
  };

  const changeAssignedScope = (scope: AssignedScope) => {
    setAssignedScope(scope);
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
                  placeholder="Search alerts, rules, entities, sources…"
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
              </InputGroup>
            </ModuleToolbarSearch>
            <ModuleToolbarActions>
              <ToolbarToggle
                id="critical-high"
                checked={criticalHighOnly}
                onCheckedChange={setCriticalHighOnly}
                label="Critical & high"
              />

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
                aria-label="Export alerts as CSV"
                onClick={() => {
                  const exportResult = queryAlerts(alertList, {
                    page: 1,
                    pageSize: Math.max(queryResult.total, 1),
                    search: deferredSearchQuery,
                    severities: severityFilters,
                    statuses: statusFilters,
                    sourceIds: sourceIdFilters,
                    assigneeIds,
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
            </ModuleToolbarActions>
          </>
        ) : undefined
      }
    >
      {view === "overview" ? <AlertsStatsStrip alerts={alertList} /> : null}

      <Tabs
        value={view}
        onValueChange={(value) => {
          if (value === "overview") router.push("/alerts/overview");
          else if (value === "assigned") {
            router.push(buildAlertsAssignedHref({ scope: "mine" }));
          } else router.push("/alerts/list");
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
            All Alerts
            <TabCount>{allOpenCount.toLocaleString("en-US")}</TabCount>
          </ModuleTabsTrigger>
        </ModuleTabsList>

        {view === "overview" ? (
          <AlertsOverview alerts={alertList} onFilter={openOverviewFilter} />
        ) : (
          <div className="flex flex-col gap-3">
            {view === "assigned" ? (
              <AssignedScopeControl
                scope={assignedScope}
                onScopeChange={changeAssignedScope}
              />
            ) : null}
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
                  status: alert.status === "new" ? "triaging" : alert.status,
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
          </div>
        )}
      </Tabs>
    </ModuleShell>
  );
}

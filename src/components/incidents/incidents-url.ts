import {
  type AlertSourceCategory,
  currentAnalystId,
  getIncidentStats,
  incidentPriorities,
  type IncidentPriority,
  incidentSeverities,
  type IncidentSeverity,
  type IncidentSort,
  incidentSourceCategories,
  type IncidentStat,
  type IncidentStatus,
  incidentStatuses,
  openIncidentStatuses,
  type SocIncident,
} from "./incidents-data";

export type IncidentsListFilters = {
  search: string;
  severities: IncidentSeverity[];
  priorities: IncidentPriority[];
  statuses: IncidentStatus[];
  sourceCategories: AlertSourceCategory[];
  sourceIds: string[];
  p1P2Only: boolean;
  sort: IncidentSort;
};

export const defaultIncidentsListFilters: IncidentsListFilters = {
  search: "",
  severities: [],
  priorities: [],
  statuses: [],
  sourceCategories: [],
  sourceIds: [],
  p1P2Only: false,
  sort: "newest",
};

/** Assigned-tab ownership scope. Analyst ids are opaque strings. */
export type AssignedScope = "mine" | "unassigned" | (string & {});

export const defaultAssignedScope: AssignedScope = "mine";

function parseList<T extends string>(
  value: string | null,
  allowed: readonly T[],
): T[] {
  if (!value) return [];
  const allowedSet = new Set<string>(allowed);
  return value
    .split(",")
    .map((part) => part.trim())
    .filter((part): part is T => allowedSet.has(part));
}

function parseSort(sortParam: string | null): IncidentSort {
  return sortParam === "severity-desc" ||
    sortParam === "severity-asc" ||
    sortParam === "risk-desc" ||
    sortParam === "risk-asc" ||
    sortParam === "age-desc" ||
    sortParam === "age-asc" ||
    sortParam === "newest"
    ? sortParam
    : "newest";
}

export function parseIncidentsListSearchParams(
  params: URLSearchParams,
): IncidentsListFilters {
  return {
    search: params.get("q")?.trim() ?? "",
    severities: parseList(params.get("severity"), incidentSeverities),
    priorities: parseList(params.get("priority"), incidentPriorities),
    statuses: parseList(params.get("status"), incidentStatuses),
    sourceCategories: parseList(
      params.get("source"),
      incidentSourceCategories,
    ),
    sourceIds: (params.get("sourceId") ?? "")
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean),
    p1P2Only:
      params.get("p1p2") === "1" || params.get("criticalHigh") === "1",
    sort: parseSort(params.get("sort")),
  };
}

export function parseAssignedScope(params: URLSearchParams): AssignedScope {
  const scope = params.get("scope")?.trim();
  if (!scope || scope === "mine") return "mine";
  if (scope === "unassigned") return "unassigned";
  return scope;
}

/** Resolve an Assigned scope to the query `assigneeIds` filter. */
export function assignedScopeToAssigneeIds(
  scope: AssignedScope,
): Array<string | null> {
  if (scope === "mine") return [currentAnalystId];
  if (scope === "unassigned") return [null];
  return [scope];
}

function appendListFilterParams(
  params: URLSearchParams,
  filters: IncidentsListFilters,
) {
  if (filters.search.trim()) params.set("q", filters.search.trim());
  if (filters.priorities.length > 0) {
    params.set("priority", filters.priorities.join(","));
  }
  if (filters.severities.length > 0) {
    params.set("severity", filters.severities.join(","));
  }
  if (filters.statuses.length > 0) {
    params.set("status", filters.statuses.join(","));
  }
  if (filters.sourceCategories.length > 0) {
    params.set("source", filters.sourceCategories.join(","));
  }
  if (filters.sourceIds.length > 0) {
    params.set("sourceId", filters.sourceIds.join(","));
  }
  if (filters.p1P2Only) params.set("p1p2", "1");
  if (filters.sort !== "newest") params.set("sort", filters.sort);
}

export function buildIncidentsListHref(
  filters: Partial<IncidentsListFilters> = {},
): string {
  const merged: IncidentsListFilters = {
    ...defaultIncidentsListFilters,
    ...filters,
  };
  const params = new URLSearchParams();
  appendListFilterParams(params, merged);

  const query = params.toString();
  return query ? `/incidents/list?${query}` : "/incidents/list";
}

export function buildIncidentsAssignedHref({
  scope = defaultAssignedScope,
  filters = {},
}: {
  scope?: AssignedScope;
  filters?: Partial<IncidentsListFilters>;
} = {}): string {
  const merged: IncidentsListFilters = {
    ...defaultIncidentsListFilters,
    ...filters,
  };
  const params = new URLSearchParams();
  if (scope !== "mine") params.set("scope", scope);
  appendListFilterParams(params, merged);

  const query = params.toString();
  return query ? `/incidents/assigned?${query}` : "/incidents/assigned";
}

export type OverviewFilterTarget =
  | { type: "priority"; priority: IncidentPriority }
  | { type: "severity"; severity: IncidentSeverity }
  | { type: "status"; status: IncidentStatus }
  | { type: "sourceId"; sourceId: string }
  | { type: "p1p2" }
  | { type: "assigned"; scope: AssignedScope }
  | { type: "open" };

export function overviewFilterToHref(target: OverviewFilterTarget): string {
  switch (target.type) {
    case "priority":
      return buildIncidentsListHref({ priorities: [target.priority] });
    case "severity":
      return buildIncidentsListHref({ severities: [target.severity] });
    case "status":
      return buildIncidentsListHref({ statuses: [target.status] });
    case "sourceId":
      return buildIncidentsListHref({ sourceIds: [target.sourceId] });
    case "p1p2":
      return buildIncidentsListHref({
        p1P2Only: true,
        statuses: [...openIncidentStatuses],
      });
    case "assigned":
      return buildIncidentsAssignedHref({ scope: target.scope });
    case "open":
      return buildIncidentsListHref({ statuses: [...openIncidentStatuses] });
  }
}

/** Attach drill-down hrefs to overview KPI tiles. */
export function getIncidentStatsWithHrefs(
  incidents: Iterable<SocIncident>,
): IncidentStat[] {
  return getIncidentStats(incidents).map((stat) => {
    switch (stat.key) {
      case "active":
        return {
          ...stat,
          href: buildIncidentsListHref({
            statuses: [...openIncidentStatuses],
          }),
        };
      case "p1-open":
        return {
          ...stat,
          href: buildIncidentsListHref({
            priorities: ["P1"],
            statuses: [...openIncidentStatuses],
          }),
        };
      case "unassigned-open":
        return {
          ...stat,
          href: buildIncidentsAssignedHref({ scope: "unassigned" }),
        };
      case "sla-risk":
        return {
          ...stat,
          href: buildIncidentsListHref({
            p1P2Only: true,
            statuses: [...openIncidentStatuses],
          }),
        };
      case "contained":
        return {
          ...stat,
          href: buildIncidentsListHref({ statuses: ["contained"] }),
        };
      default:
        return stat;
    }
  });
}

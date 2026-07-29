import {
  type IncidentPriority,
  incidentPriorities,
  type IncidentSeverity,
  incidentSeverities,
  type IncidentSort,
  type IncidentStatus,
  incidentStatuses,
  type AlertSourceCategory,
  incidentSourceCategories,
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

export function parseIncidentsListSearchParams(
  params: URLSearchParams,
): IncidentsListFilters {
  const sortParam = params.get("sort");
  const sort: IncidentSort =
    sortParam === "severity-desc" ||
    sortParam === "severity-asc" ||
    sortParam === "risk-desc" ||
    sortParam === "risk-asc" ||
    sortParam === "age-desc" ||
    sortParam === "age-asc" ||
    sortParam === "newest"
      ? sortParam
      : "newest";

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
    sort,
  };
}

export function buildIncidentsListHref(
  filters: Partial<IncidentsListFilters> = {},
): string {
  const merged: IncidentsListFilters = {
    ...defaultIncidentsListFilters,
    ...filters,
  };
  const params = new URLSearchParams();

  if (merged.search.trim()) params.set("q", merged.search.trim());
  if (merged.priorities.length > 0) {
    params.set("priority", merged.priorities.join(","));
  }
  if (merged.severities.length > 0) {
    params.set("severity", merged.severities.join(","));
  }
  if (merged.statuses.length > 0) {
    params.set("status", merged.statuses.join(","));
  }
  if (merged.sourceCategories.length > 0) {
    params.set("source", merged.sourceCategories.join(","));
  }
  if (merged.sourceIds.length > 0) {
    params.set("sourceId", merged.sourceIds.join(","));
  }
  if (merged.p1P2Only) params.set("p1p2", "1");
  if (merged.sort !== "newest") params.set("sort", merged.sort);

  const query = params.toString();
  return query ? `/incidents/list?${query}` : "/incidents/list";
}

export type OverviewFilterTarget =
  | { type: "priority"; priority: IncidentPriority }
  | { type: "severity"; severity: IncidentSeverity }
  | { type: "status"; status: IncidentStatus }
  | { type: "sourceId"; sourceId: string }
  | { type: "p1p2" };

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
      return buildIncidentsListHref({ p1P2Only: true });
  }
}

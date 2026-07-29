import {
  type AlertStat,
  alertSeverities,
  type AlertSeverity,
  type AlertSort,
  alertSourceCategories,
  type AlertSourceCategory,
  type AlertStatus,
  alertStatuses,
  currentAnalystId,
  getAlertStats,
  openAlertStatuses,
  type SocAlert,
} from "./alerts-data";

export type AlertsListFilters = {
  search: string;
  severities: AlertSeverity[];
  statuses: AlertStatus[];
  sourceCategories: AlertSourceCategory[];
  sourceIds: string[];
  criticalHighOnly: boolean;
  sort: AlertSort;
};

export const defaultAlertsListFilters: AlertsListFilters = {
  search: "",
  severities: [],
  statuses: [],
  sourceCategories: [],
  sourceIds: [],
  criticalHighOnly: false,
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

function parseSort(sortParam: string | null): AlertSort {
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

export function parseAlertsListSearchParams(
  params: URLSearchParams,
): AlertsListFilters {
  return {
    search: params.get("q")?.trim() ?? "",
    severities: parseList(params.get("severity"), alertSeverities),
    statuses: parseList(params.get("status"), alertStatuses),
    sourceCategories: parseList(params.get("source"), alertSourceCategories),
    sourceIds: (params.get("sourceId") ?? "")
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean),
    criticalHighOnly: params.get("criticalHigh") === "1",
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
  filters: AlertsListFilters,
) {
  if (filters.search.trim()) params.set("q", filters.search.trim());
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
  if (filters.criticalHighOnly) params.set("criticalHigh", "1");
  if (filters.sort !== "newest") params.set("sort", filters.sort);
}

export function buildAlertsListHref(
  filters: Partial<AlertsListFilters> = {},
): string {
  const merged: AlertsListFilters = {
    ...defaultAlertsListFilters,
    ...filters,
  };
  const params = new URLSearchParams();
  appendListFilterParams(params, merged);

  const query = params.toString();
  return query ? `/alerts/list?${query}` : "/alerts/list";
}

export function buildAlertsAssignedHref({
  scope = defaultAssignedScope,
  filters = {},
}: {
  scope?: AssignedScope;
  filters?: Partial<AlertsListFilters>;
} = {}): string {
  const merged: AlertsListFilters = {
    ...defaultAlertsListFilters,
    ...filters,
  };
  const params = new URLSearchParams();
  if (scope !== "mine") params.set("scope", scope);
  appendListFilterParams(params, merged);

  const query = params.toString();
  return query ? `/alerts/assigned?${query}` : "/alerts/assigned";
}

export type OverviewFilterTarget =
  | { type: "severity"; severity: AlertSeverity }
  | { type: "status"; status: AlertStatus }
  | { type: "sourceId"; sourceId: string }
  | { type: "assigned"; scope: AssignedScope }
  | { type: "open" }
  | { type: "critical-open" }
  | { type: "critical-high-open" };

export function overviewFilterToHref(target: OverviewFilterTarget): string {
  switch (target.type) {
    case "severity":
      return buildAlertsListHref({ severities: [target.severity] });
    case "status":
      return buildAlertsListHref({ statuses: [target.status] });
    case "sourceId":
      return buildAlertsListHref({ sourceIds: [target.sourceId] });
    case "assigned":
      return buildAlertsAssignedHref({ scope: target.scope });
    case "open":
      return buildAlertsListHref({ statuses: [...openAlertStatuses] });
    case "critical-open":
      return buildAlertsListHref({
        severities: ["critical"],
        statuses: [...openAlertStatuses],
      });
    case "critical-high-open":
      return buildAlertsListHref({
        criticalHighOnly: true,
        statuses: [...openAlertStatuses],
      });
  }
}

/** Attach drill-down hrefs to overview KPI tiles. */
export function getAlertStatsWithHrefs(
  alerts: Iterable<SocAlert>,
): AlertStat[] {
  return getAlertStats(alerts).map((stat) => {
    switch (stat.key) {
      case "open":
        return {
          ...stat,
          href: buildAlertsListHref({ statuses: [...openAlertStatuses] }),
        };
      case "critical-open":
        return {
          ...stat,
          href: buildAlertsListHref({
            severities: ["critical"],
            statuses: [...openAlertStatuses],
          }),
        };
      case "unassigned-open":
        return {
          ...stat,
          href: buildAlertsAssignedHref({ scope: "unassigned" }),
        };
      case "escalated":
        return {
          ...stat,
          href: buildAlertsListHref({ statuses: ["escalated"] }),
        };
      case "false-positive":
        return {
          ...stat,
          href: buildAlertsListHref({ statuses: ["false-positive"] }),
        };
      default:
        return stat;
    }
  });
}

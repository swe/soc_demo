import {
  type AlertSeverity,
  alertSeverities,
  type AlertSort,
  type AlertSourceCategory,
  alertSourceCategories,
  type AlertStatus,
  alertStatuses,
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

export function parseAlertsListSearchParams(
  params: URLSearchParams,
): AlertsListFilters {
  const sortParam = params.get("sort");
  const sort: AlertSort =
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
    severities: parseList(params.get("severity"), alertSeverities),
    statuses: parseList(params.get("status"), alertStatuses),
    sourceCategories: parseList(params.get("source"), alertSourceCategories),
    sourceIds: (params.get("sourceId") ?? "")
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean),
    criticalHighOnly: params.get("criticalHigh") === "1",
    sort,
  };
}

export function buildAlertsListHref(
  filters: Partial<AlertsListFilters> = {},
): string {
  const merged: AlertsListFilters = {
    ...defaultAlertsListFilters,
    ...filters,
  };
  const params = new URLSearchParams();

  if (merged.search.trim()) params.set("q", merged.search.trim());
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
  if (merged.criticalHighOnly) params.set("criticalHigh", "1");
  if (merged.sort !== "newest") params.set("sort", merged.sort);

  const query = params.toString();
  return query ? `/alerts/list?${query}` : "/alerts/list";
}

export type OverviewFilterTarget =
  | { type: "severity"; severity: AlertSeverity }
  | { type: "status"; status: AlertStatus }
  | { type: "sourceId"; sourceId: string };

export function overviewFilterToHref(target: OverviewFilterTarget): string {
  switch (target.type) {
    case "severity":
      return buildAlertsListHref({ severities: [target.severity] });
    case "status":
      return buildAlertsListHref({ statuses: [target.status] });
    case "sourceId":
      return buildAlertsListHref({ sourceIds: [target.sourceId] });
  }
}

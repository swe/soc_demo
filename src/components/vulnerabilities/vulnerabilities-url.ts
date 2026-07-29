import {
  type FindingSort,
  findingSortLabels,
  type VulnScope,
  type VulnSeverity,
  vulnSeverities,
} from "./vulnerabilities-data";

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

const findingSorts = Object.keys(findingSortLabels) as FindingSort[];

export type FindingsListFilters = {
  search: string;
  severities: VulnSeverity[];
  exploitableOnly: boolean;
  zeroDayOnly: boolean;
  withAlertsOnly: boolean;
  withIncidentsOnly: boolean;
  scope: VulnScope | "all";
  sort: FindingSort;
};

export const defaultFindingsFilters: FindingsListFilters = {
  search: "",
  severities: [],
  exploitableOnly: false,
  zeroDayOnly: false,
  withAlertsOnly: false,
  withIncidentsOnly: false,
  scope: "all",
  sort: "priority-desc",
};

export function parseFindingsSearchParams(
  params: URLSearchParams,
): FindingsListFilters {
  const sortParam = params.get("sort");
  const sort: FindingSort = findingSorts.includes(sortParam as FindingSort)
    ? (sortParam as FindingSort)
    : "priority-desc";
  const scopeParam = params.get("scope");
  const scope: VulnScope | "all" =
    scopeParam === "endpoint" || scopeParam === "cloud" ? scopeParam : "all";

  return {
    search: params.get("q")?.trim() ?? "",
    severities: parseList(params.get("severity"), vulnSeverities),
    exploitableOnly: params.get("exploitable") === "1",
    zeroDayOnly: params.get("zeroDay") === "1",
    withAlertsOnly: params.get("alerts") === "1",
    withIncidentsOnly: params.get("incidents") === "1",
    scope,
    sort,
  };
}

export function buildFindingsHref(
  filters: Partial<FindingsListFilters> = {},
  findingId?: string,
): string {
  const merged: FindingsListFilters = {
    ...defaultFindingsFilters,
    ...filters,
  };
  const params = new URLSearchParams();
  if (merged.search.trim()) params.set("q", merged.search.trim());
  if (merged.severities.length) {
    params.set("severity", merged.severities.join(","));
  }
  if (merged.exploitableOnly) params.set("exploitable", "1");
  if (merged.zeroDayOnly) params.set("zeroDay", "1");
  if (merged.withAlertsOnly) params.set("alerts", "1");
  if (merged.withIncidentsOnly) params.set("incidents", "1");
  if (merged.scope !== "all") params.set("scope", merged.scope);
  if (merged.sort !== "priority-desc") params.set("sort", merged.sort);
  if (findingId) params.set("id", findingId);

  const query = params.toString();
  return query
    ? `/vulnerabilities/findings?${query}`
    : "/vulnerabilities/findings";
}

export type WorkListFilters = {
  search: string;
  statuses: string[];
  kind: "all" | "remediation" | "recommendation";
  mineOnly: boolean;
};

export const defaultWorkFilters: WorkListFilters = {
  search: "",
  statuses: [],
  kind: "all",
  mineOnly: false,
};

export function parseWorkSearchParams(params: URLSearchParams): WorkListFilters {
  const kindParam = params.get("kind");
  const kind: WorkListFilters["kind"] =
    kindParam === "remediation" || kindParam === "recommendation"
      ? kindParam
      : "all";

  return {
    search: params.get("q")?.trim() ?? "",
    statuses: (params.get("status") ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    kind,
    mineOnly: params.get("mine") === "1",
  };
}

export function buildWorkHref(
  filters: Partial<WorkListFilters> = {},
  itemId?: string,
): string {
  const merged = { ...defaultWorkFilters, ...filters };
  const params = new URLSearchParams();
  if (merged.search.trim()) params.set("q", merged.search.trim());
  if (merged.statuses.length) params.set("status", merged.statuses.join(","));
  if (merged.kind !== "all") params.set("kind", merged.kind);
  if (merged.mineOnly) params.set("mine", "1");
  if (itemId) params.set("item", itemId);
  const query = params.toString();
  return query ? `/vulnerabilities/work?${query}` : "/vulnerabilities/work";
}

export type ExposureListFilters = {
  search: string;
  internetFacingOnly: boolean;
  highCriticalityOnly: boolean;
};

export const defaultExposureFilters: ExposureListFilters = {
  search: "",
  internetFacingOnly: false,
  highCriticalityOnly: false,
};

export function parseExposureSearchParams(
  params: URLSearchParams,
): ExposureListFilters {
  return {
    search: params.get("q")?.trim() ?? "",
    internetFacingOnly: params.get("internet") === "1",
    highCriticalityOnly: params.get("critical") === "1",
  };
}

export function buildExposureHref(
  filtersOrDeviceId?: Partial<ExposureListFilters> | string,
  deviceId?: string,
): string {
  if (typeof filtersOrDeviceId === "string") {
    return filtersOrDeviceId
      ? `/vulnerabilities/exposure?id=${encodeURIComponent(filtersOrDeviceId)}`
      : "/vulnerabilities/exposure";
  }

  const merged = { ...defaultExposureFilters, ...filtersOrDeviceId };
  const params = new URLSearchParams();
  if (merged.search.trim()) params.set("q", merged.search.trim());
  if (merged.internetFacingOnly) params.set("internet", "1");
  if (merged.highCriticalityOnly) params.set("critical", "1");
  if (deviceId) params.set("id", deviceId);
  const query = params.toString();
  return query
    ? `/vulnerabilities/exposure?${query}`
    : "/vulnerabilities/exposure";
}

export function buildOverviewHref() {
  return "/vulnerabilities";
}

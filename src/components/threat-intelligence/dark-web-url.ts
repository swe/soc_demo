import {
  exposureSeverities,
  type ExposureSeverity,
  type ExposureSort,
  type ExposureStatus,
  exposureStatuses,
  type ExposureType,
  exposureTypes,
} from "./dark-web-data";

export type DarkWebTab = "overview" | "exposures" | "breaches" | "watchlist";

export type DarkWebListFilters = {
  tab: DarkWebTab;
  search: string;
  types: ExposureType[];
  severities: ExposureSeverity[];
  statuses: ExposureStatus[];
  sources: string[];
  domains: string[];
  privilegedOnly: boolean;
  openOnly: boolean;
  sort: ExposureSort;
  exposureId: string | null;
  breachId: string | null;
};

export const defaultDarkWebListFilters: DarkWebListFilters = {
  tab: "exposures",
  search: "",
  types: [],
  severities: [],
  statuses: [],
  sources: [],
  domains: [],
  privilegedOnly: false,
  openOnly: false,
  sort: "newest",
  exposureId: null,
  breachId: null,
};

const tabs = [
  "overview",
  "exposures",
  "breaches",
  "watchlist",
] as const satisfies readonly DarkWebTab[];

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

function parseStringList(value: string | null): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function parseDarkWebSearchParams(
  params: URLSearchParams,
): DarkWebListFilters {
  const tabParam = params.get("tab");
  const tab: DarkWebTab =
    tabParam && (tabs as readonly string[]).includes(tabParam)
      ? (tabParam as DarkWebTab)
      : "exposures";

  const sortParam = params.get("sort");
  const sort: ExposureSort =
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
    tab,
    search: params.get("q")?.trim() ?? "",
    types: parseList(params.get("type"), exposureTypes),
    severities: parseList(params.get("severity"), exposureSeverities),
    statuses: parseList(params.get("status"), exposureStatuses),
    sources: parseStringList(params.get("source")),
    domains: parseStringList(params.get("domain")),
    privilegedOnly: params.get("privileged") === "1",
    openOnly: params.get("open") === "1",
    sort,
    exposureId: params.get("exposure")?.trim() || null,
    breachId: params.get("breach")?.trim() || null,
  };
}

export function buildDarkWebHref(
  filters: Partial<DarkWebListFilters> = {},
): string {
  const merged: DarkWebListFilters = {
    ...defaultDarkWebListFilters,
    ...filters,
  };
  const params = new URLSearchParams();

  if (merged.tab !== "exposures") params.set("tab", merged.tab);
  if (merged.search.trim()) params.set("q", merged.search.trim());
  if (merged.types.length > 0) params.set("type", merged.types.join(","));
  if (merged.severities.length > 0) {
    params.set("severity", merged.severities.join(","));
  }
  if (merged.statuses.length > 0) {
    params.set("status", merged.statuses.join(","));
  }
  if (merged.sources.length > 0) {
    params.set("source", merged.sources.join(","));
  }
  if (merged.domains.length > 0) {
    params.set("domain", merged.domains.join(","));
  }
  if (merged.privilegedOnly) params.set("privileged", "1");
  if (merged.openOnly) params.set("open", "1");
  if (merged.sort !== "newest") params.set("sort", merged.sort);
  if (merged.exposureId) params.set("exposure", merged.exposureId);
  if (merged.breachId) params.set("breach", merged.breachId);

  const query = params.toString();
  return query
    ? `/threat-intelligence/dark-web?${query}`
    : "/threat-intelligence/dark-web";
}

export type OverviewFilterTarget =
  | { type: "severity"; severity: ExposureSeverity }
  | { type: "exposureType"; exposureType: ExposureType }
  | { type: "domain"; domain: string }
  | { type: "openCritical" };

export function overviewFilterToHref(target: OverviewFilterTarget): string {
  switch (target.type) {
    case "severity":
      return buildDarkWebHref({
        tab: "exposures",
        severities: [target.severity],
        openOnly: true,
      });
    case "exposureType":
      return buildDarkWebHref({
        tab: "exposures",
        types: [target.exposureType],
      });
    case "domain":
      return buildDarkWebHref({
        tab: "exposures",
        domains: [target.domain],
      });
    case "openCritical":
      return buildDarkWebHref({
        tab: "exposures",
        severities: ["critical"],
        openOnly: true,
      });
  }
}

import {
  type DarkWebExposure,
  exposureSearchIndex,
  type ExposureSeverity,
  type ExposureSort,
  type ExposureStatus,
  type ExposureType,
  openExposureStatuses,
  severityWeight,
} from "./dark-web-data";

export type ExposureQueryParams = {
  page: number;
  pageSize: number;
  search?: string;
  types?: ExposureType[];
  severities?: ExposureSeverity[];
  statuses?: ExposureStatus[];
  sources?: string[];
  domains?: string[];
  privilegedOnly?: boolean;
  openOnly?: boolean;
  sort?: ExposureSort;
};

export type ExposureQueryResult = {
  items: DarkWebExposure[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
  openCount: number;
};

export type ExposureStore = Map<string, DarkWebExposure>;

const searchIndexCache = new WeakMap<DarkWebExposure, string>();

function getCachedSearchIndex(exposure: DarkWebExposure) {
  const cached = searchIndexCache.get(exposure);
  if (cached) return cached;
  const value = exposureSearchIndex(exposure);
  searchIndexCache.set(exposure, value);
  return value;
}

export function createExposureStore(
  exposures: DarkWebExposure[],
): ExposureStore {
  const store = new Map<string, DarkWebExposure>();
  for (const exposure of exposures) {
    store.set(exposure.id, exposure);
  }
  return store;
}

export function exposureStoreToList(store: ExposureStore): DarkWebExposure[] {
  return Array.from(store.values());
}

export function getExposureFromStore(store: ExposureStore, id: string) {
  return store.get(id) ?? null;
}

export function patchExposureStore(
  store: ExposureStore,
  ids: Iterable<string>,
  patch: Partial<Pick<DarkWebExposure, "status">>,
): ExposureStore {
  const idList = Array.from(ids);
  if (idList.length === 0) return store;

  const next = new Map(store);
  for (const id of idList) {
    const current = next.get(id);
    if (!current) continue;
    const status = patch.status ?? current.status;
    const activity =
      patch.status && patch.status !== current.status
        ? [
            {
              at: "just now",
              label: `Status → ${patch.status.replaceAll("_", " ")}`,
            },
            ...current.activity,
          ]
        : current.activity;
    next.set(id, { ...current, ...patch, status, activity });
  }
  return next;
}

function matchesQuery(exposure: DarkWebExposure, params: ExposureQueryParams) {
  const {
    search = "",
    types = [],
    severities = [],
    statuses = [],
    sources = [],
    domains = [],
    privilegedOnly = false,
    openOnly = false,
  } = params;

  if (types.length > 0 && !types.includes(exposure.type)) return false;
  if (severities.length > 0 && !severities.includes(exposure.severity)) {
    return false;
  }
  if (statuses.length > 0 && !statuses.includes(exposure.status)) return false;
  if (sources.length > 0 && !sources.includes(exposure.source)) return false;
  if (domains.length > 0) {
    const domain = exposure.domain ?? "";
    if (!domains.includes(domain)) return false;
  }
  if (privilegedOnly && !exposure.privileged) return false;
  if (openOnly && !openExposureStatuses.includes(exposure.status)) return false;

  const normalized = search.trim().toLowerCase();
  if (normalized && !getCachedSearchIndex(exposure).includes(normalized)) {
    return false;
  }

  return true;
}

function compareExposures(
  a: DarkWebExposure,
  b: DarkWebExposure,
  sort: ExposureSort,
) {
  switch (sort) {
    case "severity-desc":
      return (
        severityWeight[a.severity] - severityWeight[b.severity] ||
        b.riskScore - a.riskScore ||
        a.ageMinutes - b.ageMinutes
      );
    case "severity-asc":
      return (
        severityWeight[b.severity] - severityWeight[a.severity] ||
        a.riskScore - b.riskScore ||
        a.ageMinutes - b.ageMinutes
      );
    case "risk-desc":
      return (
        b.riskScore - a.riskScore ||
        severityWeight[a.severity] - severityWeight[b.severity] ||
        a.ageMinutes - b.ageMinutes
      );
    case "risk-asc":
      return (
        a.riskScore - b.riskScore ||
        severityWeight[b.severity] - severityWeight[a.severity] ||
        a.ageMinutes - b.ageMinutes
      );
    case "age-desc":
      return b.ageMinutes - a.ageMinutes;
    case "age-asc":
      return a.ageMinutes - b.ageMinutes;
    case "newest":
    default:
      return a.ageMinutes - b.ageMinutes;
  }
}

export function queryExposures(
  exposures: Iterable<DarkWebExposure>,
  params: ExposureQueryParams,
): ExposureQueryResult {
  const sort = params.sort ?? "newest";
  const page = Math.max(1, params.page);
  const pageSize = Math.max(1, params.pageSize);

  const matched: DarkWebExposure[] = [];
  let openCount = 0;

  for (const exposure of exposures) {
    if (!matchesQuery(exposure, params)) continue;
    matched.push(exposure);
    if (openExposureStatuses.includes(exposure.status)) openCount += 1;
  }

  matched.sort((a, b) => compareExposures(a, b, sort));

  const total = matched.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, pageCount);
  const start = (safePage - 1) * pageSize;

  return {
    items: matched.slice(start, start + pageSize),
    total,
    page: safePage,
    pageSize,
    pageCount,
    openCount,
  };
}

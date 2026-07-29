import {
  type IncidentPriority,
  type IncidentSeverity,
  type IncidentSort,
  type IncidentStatus,
  type AlertSourceCategory,
  incidentSearchIndex,
  openIncidentStatuses,
  priorityWeight,
  severityWeight,
  type SocIncident,
} from "./incidents-data";

export type { AlertSourceCategory };

/** Query shape mirrors a future server/API contract. */
export type IncidentQueryParams = {
  page: number;
  pageSize: number;
  search?: string;
  severities?: IncidentSeverity[];
  priorities?: IncidentPriority[];
  statuses?: IncidentStatus[];
  sourceCategories?: AlertSourceCategory[];
  sourceIds?: string[];
  p1P2Only?: boolean;
  criticalHighOnly?: boolean;
  sort?: IncidentSort;
};

export type IncidentQueryResult = {
  items: SocIncident[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
  openCount: number;
};

export type IncidentStore = Map<string, SocIncident>;

const searchIndexCache = new WeakMap<SocIncident, string>();

function getCachedSearchIndex(incident: SocIncident) {
  const cached = searchIndexCache.get(incident);
  if (cached) return cached;
  const value = incidentSearchIndex(incident);
  searchIndexCache.set(incident, value);
  return value;
}

export function createIncidentStore(incidents: SocIncident[]): IncidentStore {
  const store = new Map<string, SocIncident>();
  for (const incident of incidents) {
    store.set(incident.id, incident);
  }
  return store;
}

export function incidentStoreToList(store: IncidentStore): SocIncident[] {
  return Array.from(store.values());
}

export function getIncidentFromStore(store: IncidentStore, id: string) {
  return store.get(id) ?? null;
}

export function patchIncidentStore(
  store: IncidentStore,
  ids: Iterable<string>,
  patch: Partial<
    Pick<
      SocIncident,
      | "status"
      | "assigneeId"
      | "ownerId"
      | "notes"
      | "timeline"
      | "warRoomMessages"
    >
  >,
): IncidentStore {
  const idList = Array.from(ids);
  if (idList.length === 0) return store;

  const now = new Date().toISOString();
  const next = new Map(store);
  for (const id of idList) {
    const current = next.get(id);
    if (!current) continue;
    next.set(id, { ...current, ...patch, updatedAt: now });
  }
  return next;
}

export function upsertIncidentStore(
  store: IncidentStore,
  incident: SocIncident,
): IncidentStore {
  const next = new Map(store);
  next.set(incident.id, incident);
  return next;
}

function matchesQuery(incident: SocIncident, params: IncidentQueryParams) {
  const {
    search = "",
    severities = [],
    priorities = [],
    statuses = [],
    sourceCategories = [],
    sourceIds = [],
    p1P2Only = false,
    criticalHighOnly = false,
  } = params;

  if (severities.length > 0 && !severities.includes(incident.severity)) {
    return false;
  }
  if (priorities.length > 0 && !priorities.includes(incident.priority)) {
    return false;
  }
  if (statuses.length > 0 && !statuses.includes(incident.status)) {
    return false;
  }
  if (
    sourceCategories.length > 0 &&
    !sourceCategories.includes(incident.primarySourceCategory)
  ) {
    return false;
  }
  if (
    sourceIds.length > 0 &&
    !sourceIds.some((id) => incident.sourceIds.includes(id))
  ) {
    return false;
  }
  if (p1P2Only || criticalHighOnly) {
    if (incident.priority !== "P1" && incident.priority !== "P2") {
      return false;
    }
  }

  const normalized = search.trim().toLowerCase();
  if (normalized && !getCachedSearchIndex(incident).includes(normalized)) {
    return false;
  }

  return true;
}

function compareIncidents(a: SocIncident, b: SocIncident, sort: IncidentSort) {
  switch (sort) {
    case "severity-desc":
      return (
        priorityWeight[a.priority] - priorityWeight[b.priority] ||
        severityWeight[a.severity] - severityWeight[b.severity] ||
        b.riskScore - a.riskScore ||
        a.ageMinutes - b.ageMinutes
      );
    case "severity-asc":
      return (
        priorityWeight[b.priority] - priorityWeight[a.priority] ||
        severityWeight[b.severity] - severityWeight[a.severity] ||
        a.riskScore - b.riskScore ||
        a.ageMinutes - b.ageMinutes
      );
    case "risk-desc":
      return (
        b.riskScore - a.riskScore ||
        priorityWeight[a.priority] - priorityWeight[b.priority] ||
        a.ageMinutes - b.ageMinutes
      );
    case "risk-asc":
      return (
        a.riskScore - b.riskScore ||
        priorityWeight[b.priority] - priorityWeight[a.priority] ||
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

/**
 * Filter → sort → page. Swap the body for a network call later; keep the
 * params/result types stable for the UI.
 */
export function queryIncidents(
  incidents: Iterable<SocIncident>,
  params: IncidentQueryParams,
): IncidentQueryResult {
  const sort = params.sort ?? "newest";
  const page = Math.max(1, params.page);
  const pageSize = Math.max(1, params.pageSize);

  const matched: SocIncident[] = [];
  let openCount = 0;

  for (const incident of incidents) {
    if (!matchesQuery(incident, params)) continue;
    matched.push(incident);
    if (openIncidentStatuses.includes(incident.status)) openCount += 1;
  }

  matched.sort((a, b) => compareIncidents(a, b, sort));

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

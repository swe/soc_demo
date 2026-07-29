import {
  alertSearchIndex,
  type AlertSeverity,
  type AlertSort,
  type AlertSourceCategory,
  type AlertStatus,
  openAlertStatuses,
  severityWeight,
  type SocAlert,
} from "./alerts-data";

/** Query shape mirrors a future server/API contract. */
export type AlertQueryParams = {
  page: number;
  pageSize: number;
  search?: string;
  severities?: AlertSeverity[];
  statuses?: AlertStatus[];
  sourceCategories?: AlertSourceCategory[];
  sourceIds?: string[];
  criticalHighOnly?: boolean;
  sort?: AlertSort;
};

export type AlertQueryResult = {
  items: SocAlert[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
  openCount: number;
};

export type AlertStore = Map<string, SocAlert>;

const searchIndexCache = new WeakMap<SocAlert, string>();

function getCachedSearchIndex(alert: SocAlert) {
  const cached = searchIndexCache.get(alert);
  if (cached) return cached;
  const value = alertSearchIndex(alert);
  searchIndexCache.set(alert, value);
  return value;
}

export function createAlertStore(alerts: SocAlert[]): AlertStore {
  const store = new Map<string, SocAlert>();
  for (const alert of alerts) {
    store.set(alert.id, alert);
  }
  return store;
}

export function alertStoreToList(store: AlertStore): SocAlert[] {
  return Array.from(store.values());
}

export function getAlertFromStore(store: AlertStore, id: string) {
  return store.get(id) ?? null;
}

export function patchAlertStore(
  store: AlertStore,
  ids: Iterable<string>,
  patch: Partial<Pick<SocAlert, "status" | "assigneeId" | "notes">>,
): AlertStore {
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

function matchesQuery(alert: SocAlert, params: AlertQueryParams) {
  const {
    search = "",
    severities = [],
    statuses = [],
    sourceCategories = [],
    sourceIds = [],
    criticalHighOnly = false,
  } = params;

  if (severities.length > 0 && !severities.includes(alert.severity)) {
    return false;
  }
  if (statuses.length > 0 && !statuses.includes(alert.status)) {
    return false;
  }
  if (
    sourceCategories.length > 0 &&
    !sourceCategories.includes(alert.sourceCategory)
  ) {
    return false;
  }
  if (sourceIds.length > 0 && !sourceIds.includes(alert.sourceId)) {
    return false;
  }
  if (
    criticalHighOnly &&
    alert.severity !== "critical" &&
    alert.severity !== "high"
  ) {
    return false;
  }

  const normalized = search.trim().toLowerCase();
  if (normalized && !getCachedSearchIndex(alert).includes(normalized)) {
    return false;
  }

  return true;
}

function compareAlerts(a: SocAlert, b: SocAlert, sort: AlertSort) {
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

/**
 * Filter → sort → page. Swap the body for a network call later; keep the
 * params/result types stable for the UI.
 */
export function queryAlerts(
  alerts: Iterable<SocAlert>,
  params: AlertQueryParams,
): AlertQueryResult {
  const sort = params.sort ?? "newest";
  const page = Math.max(1, params.page);
  const pageSize = Math.max(1, params.pageSize);

  const matched: SocAlert[] = [];
  let openCount = 0;

  for (const alert of alerts) {
    if (!matchesQuery(alert, params)) continue;
    matched.push(alert);
    if (openAlertStatuses.includes(alert.status)) openCount += 1;
  }

  matched.sort((a, b) => compareAlerts(a, b, sort));

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

/** Single-pass aggregates for stats strip + overview charts. */
export type AlertAggregates = {
  total: number;
  openCount: number;
  criticalOpen: number;
  escalated: number;
  falsePositive: number;
  bySeverity: Record<AlertSeverity, number>;
  byStatus: Record<AlertStatus, number>;
  bySource: Map<string, { sourceId: string; sourceName: string; count: number }>;
};

export function aggregateAlerts(alerts: Iterable<SocAlert>): AlertAggregates {
  const bySeverity: Record<AlertSeverity, number> = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
  };
  const byStatus: Record<AlertStatus, number> = {
    new: 0,
    triaging: 0,
    investigating: 0,
    escalated: 0,
    closed: 0,
    "false-positive": 0,
  };
  const bySource = new Map<
    string,
    { sourceId: string; sourceName: string; count: number }
  >();

  let total = 0;
  let openCount = 0;
  let criticalOpen = 0;
  let escalated = 0;
  let falsePositive = 0;

  for (const alert of alerts) {
    total += 1;
    bySeverity[alert.severity] += 1;
    byStatus[alert.status] += 1;

    if (openAlertStatuses.includes(alert.status)) {
      openCount += 1;
      if (alert.severity === "critical") criticalOpen += 1;
    }
    if (alert.status === "escalated") escalated += 1;
    if (alert.status === "false-positive") falsePositive += 1;

    const existing = bySource.get(alert.sourceId);
    if (existing) {
      existing.count += 1;
    } else {
      bySource.set(alert.sourceId, {
        sourceId: alert.sourceId,
        sourceName: alert.sourceName,
        count: 1,
      });
    }
  }

  return {
    total,
    openCount,
    criticalOpen,
    escalated,
    falsePositive,
    bySeverity,
    byStatus,
    bySource,
  };
}

import {
  type FindingSort,
  type InventorySort,
  type Recommendation,
  recommendationSearchIndex,
  type RecommendationSort,
  type RecommendationStatus,
  type Remediation,
  remediationSearchIndex,
  type RemediationSort,
  type RemediationStatus,
  type SoftwareCategory,
  type SoftwareInventoryItem,
  softwareSearchIndex,
  type Vulnerability,
  vulnerabilitySearchIndex,
  type VulnSeverity,
  vulnSeverityWeight,
  type VulnUpdateStatus,
  type WeaknessSort,
} from "./vulnerabilities-data";

export type WeaknessQueryParams = {
  page: number;
  pageSize: number;
  search?: string;
  severities?: VulnSeverity[];
  exploitableOnly?: boolean;
  zeroDayOnly?: boolean;
  updateStatuses?: VulnUpdateStatus[];
  tags?: string[];
  scope?: "endpoint" | "cloud" | "all";
  sort?: WeaknessSort | FindingSort;
  withAlertsOnly?: boolean;
  withIncidentsOnly?: boolean;
};

export type RecommendationQueryParams = {
  page: number;
  pageSize: number;
  search?: string;
  statuses?: RecommendationStatus[];
  osPlatforms?: string[];
  scope?: "endpoint" | "cloud" | "all";
  sort?: RecommendationSort;
};

export type RemediationQueryParams = {
  page: number;
  pageSize: number;
  search?: string;
  statuses?: RemediationStatus[];
  sort?: RemediationSort;
};

export type InventoryQueryParams = {
  page: number;
  pageSize: number;
  search?: string;
  category?: SoftwareCategory | "all";
  withWeaknessesOnly?: boolean;
  sort?: InventorySort;
};

export type PagedResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

function pageSlice<T>(items: T[], page: number, pageSize: number): PagedResult<T> {
  const total = items.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(page, 1), pageCount);
  const start = (safePage - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    total,
    page: safePage,
    pageSize,
    pageCount,
  };
}

export function queryWeaknesses(
  catalog: Vulnerability[],
  params: WeaknessQueryParams,
): PagedResult<Vulnerability> {
  const {
    search = "",
    severities = [],
    exploitableOnly = false,
    zeroDayOnly = false,
    updateStatuses = [],
    tags = [],
    scope = "all",
    sort = "priority-desc",
    withAlertsOnly = false,
    withIncidentsOnly = false,
  } = params;

  const q = search.trim().toLowerCase();
  let items = catalog.filter((v) => {
    if (scope !== "all" && v.scope !== scope) return false;
    if (severities.length > 0 && !severities.includes(v.severity)) return false;
    if (exploitableOnly && !v.exploitable) return false;
    if (zeroDayOnly && !v.zeroDay) return false;
    if (withAlertsOnly && v.linkedAlertIds.length === 0) return false;
    if (withIncidentsOnly && v.linkedIncidentIds.length === 0) return false;
    if (
      updateStatuses.length > 0 &&
      !updateStatuses.includes(v.updateStatus)
    ) {
      return false;
    }
    if (tags.length > 0 && !tags.every((t) => v.tags.includes(t))) return false;
    if (q && !vulnerabilitySearchIndex(v).includes(q)) return false;
    return true;
  });

  items = [...items].sort((a, b) => {
    switch (sort) {
      case "priority-desc":
        return b.socPriority - a.socPriority;
      case "cvss-desc":
        return b.cvss - a.cvss;
      case "exposed-desc":
        return b.exposedDeviceCount - a.exposedDeviceCount;
      case "newest":
        return b.publishedAt.localeCompare(a.publishedAt);
      case "oldest":
        return a.publishedAt.localeCompare(b.publishedAt);
      case "severity-desc":
      default: {
        const sw =
          vulnSeverityWeight[b.severity] - vulnSeverityWeight[a.severity];
        if (sw !== 0) return sw;
        return b.socPriority - a.socPriority;
      }
    }
  });

  return pageSlice(items, params.page, params.pageSize);
}

export function queryRecommendations(
  catalog: Recommendation[],
  params: RecommendationQueryParams,
): PagedResult<Recommendation> {
  const {
    search = "",
    statuses = [],
    osPlatforms = [],
    scope = "all",
    sort = "impact-desc",
  } = params;
  const q = search.trim().toLowerCase();

  let items = catalog.filter((r) => {
    if (scope !== "all" && r.scope !== scope) return false;
    if (statuses.length > 0 && !statuses.includes(r.status)) return false;
    if (osPlatforms.length > 0 && !osPlatforms.includes(r.osPlatform)) {
      return false;
    }
    if (q && !recommendationSearchIndex(r).includes(q)) return false;
    return true;
  });

  items = [...items].sort((a, b) => {
    switch (sort) {
      case "exposed-desc":
        return b.exposedDevices - a.exposedDevices;
      case "weaknesses-desc":
        return b.weaknessCount - a.weaknessCount;
      case "newest":
        return b.id.localeCompare(a.id);
      case "impact-desc":
      default:
        return b.impactScore - a.impactScore;
    }
  });

  return pageSlice(items, params.page, params.pageSize);
}

export type RemediationStore = Map<string, Remediation>;

export function createRemediationStore(
  items: Remediation[],
): RemediationStore {
  return new Map(items.map((r) => [r.id, r]));
}

export function patchRemediationStore(
  store: RemediationStore,
  id: string,
  patch: Partial<Pick<Remediation, "status" | "ownerId" | "devicesRemaining" | "completedAt">> & {
    timelineEvent?: Remediation["timeline"][number];
  },
): RemediationStore {
  const current = store.get(id);
  if (!current) return store;
  const next = new Map(store);
  const { timelineEvent, ...rest } = patch;
  const updated: Remediation = {
    ...current,
    ...rest,
    timeline: timelineEvent
      ? [...current.timeline, timelineEvent]
      : current.timeline,
  };
  next.set(id, updated);
  return next;
}

export function queryRemediations(
  catalog: Remediation[],
  params: RemediationQueryParams,
): PagedResult<Remediation> {
  const { search = "", statuses = [], sort = "newest" } = params;
  const q = search.trim().toLowerCase();

  let items = catalog.filter((r) => {
    if (statuses.length > 0 && !statuses.includes(r.status)) return false;
    if (q && !remediationSearchIndex(r).includes(q)) return false;
    return true;
  });

  const statusOrder: Record<RemediationStatus, number> = {
    in_progress: 0,
    pending: 1,
    failed: 2,
    exception: 3,
    completed: 4,
  };

  items = [...items].sort((a, b) => {
    switch (sort) {
      case "due-asc":
        return a.dueAt.localeCompare(b.dueAt);
      case "remaining-desc":
        return b.devicesRemaining - a.devicesRemaining;
      case "status":
        return statusOrder[a.status] - statusOrder[b.status];
      case "newest":
      default:
        return b.createdAt.localeCompare(a.createdAt);
    }
  });

  return pageSlice(items, params.page, params.pageSize);
}

export function queryInventory(
  catalog: SoftwareInventoryItem[],
  params: InventoryQueryParams,
): PagedResult<SoftwareInventoryItem> {
  const {
    search = "",
    category = "all",
    withWeaknessesOnly = false,
    sort = "weaknesses-desc",
  } = params;
  const q = search.trim().toLowerCase();

  let items = catalog.filter((s) => {
    if (category !== "all" && s.category !== category) return false;
    if (withWeaknessesOnly && s.weaknessCount === 0) return false;
    if (q && !softwareSearchIndex(s).includes(q)) return false;
    return true;
  });

  items = [...items].sort((a, b) => {
    switch (sort) {
      case "exposed-desc":
        return b.exposedDevices - a.exposedDevices;
      case "name-asc":
        return a.name.localeCompare(b.name);
      case "newest":
        return a.lastSeenLabel.localeCompare(b.lastSeenLabel);
      case "weaknesses-desc":
      default:
        return b.weaknessCount - a.weaknessCount;
    }
  });

  return pageSlice(items, params.page, params.pageSize);
}

import { administrationUsers } from "@/components/administration/users-data";
import {
  type AlertEntityType,
  type AlertEnvironment,
  type AlertSeverity,
  type AlertSourceCategory,
  alertEntityTypeLabels,
  alertEnvironmentLabels,
  alertSeverities,
  alertSeverityLabels,
  alertSourceCategories,
  alertSourceCategoryLabels,
  getLinkedDevice,
  getLinkedIdentity,
  severityWeight,
  socAlerts,
  type SocAlert,
} from "@/components/alerts/alerts-data";

export type { AlertSourceCategory, AlertEntityType, AlertEnvironment };

export type IncidentSeverity = AlertSeverity;

export type IncidentStatus =
  | "new"
  | "investigating"
  | "contained"
  | "eradicated"
  | "resolved"
  | "closed";

export type IncidentPriority = "P1" | "P2" | "P3" | "P4";

export type IncidentSort =
  | "newest"
  | "severity-desc"
  | "severity-asc"
  | "risk-desc"
  | "risk-asc"
  | "age-desc"
  | "age-asc";

export type IncidentsOverviewRange = "7d" | "14d" | "30d";

export type WarRoomMessage = {
  id: string;
  at: string;
  authorId: string;
  authorName: string;
  body: string;
  mentionIds: string[];
  kind: "message" | "system" | "handoff";
};

export type SocIncident = {
  id: string;
  title: string;
  summary: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  priority: IncidentPriority;
  alertIds: string[];
  sourceIds: string[];
  primarySourceId: string;
  primarySourceName: string;
  primarySourceCategory: AlertSourceCategory;
  entityType: AlertEntityType;
  entityName: string;
  deviceId: string | null;
  identityId: string | null;
  assigneeId: string | null;
  ownerId: string | null;
  createdAt: string;
  updatedAt: string;
  ageLabel: string;
  ageMinutes: number;
  riskScore: number;
  environment: AlertEnvironment;
  tags: string[];
  mitreTactic?: string;
  mitreTechnique?: string;
  timeline: { at: string; label: string }[];
  notes: string;
  warRoomMessages: WarRoomMessage[];
  /** True when created via alert escalate (may still grow to multi-alert). */
  escalatedFromAlerts: boolean;
};

export type IncidentStat = {
  key: "active" | "p1-open" | "mttc" | "sla-risk" | "contained";
  title: string;
  value: string;
  context: string;
  delta: number;
  preferLower?: boolean;
};

export type IncidentSlaState = "ok" | "at-risk" | "breached";

export type IncidentsOverTimePoint = {
  day: string;
  date: string;
  p1: number;
  p2: number;
  p3: number;
  p4: number;
};

export type IncidentAgingBucket = {
  key: "lt4h" | "4to24h" | "1to3d" | "gt3d";
  label: string;
  count: number;
};

export const INCIDENT_CATALOG_SIZE = 380;

export const incidentsOverviewRanges: IncidentsOverviewRange[] = [
  "7d",
  "14d",
  "30d",
];

export const incidentsOverviewRangeLabels: Record<
  IncidentsOverviewRange,
  string
> = {
  "7d": "7d",
  "14d": "14d",
  "30d": "30d",
};

export const incidentsOverviewRangeDays: Record<
  IncidentsOverviewRange,
  number
> = {
  "7d": 7,
  "14d": 14,
  "30d": 30,
};

export const incidentSeverityLabels = alertSeverityLabels;
export const incidentSeverities = alertSeverities;

export const incidentStatusLabels: Record<IncidentStatus, string> = {
  new: "New",
  investigating: "Investigating",
  contained: "Contained",
  eradicated: "Eradicated",
  resolved: "Resolved",
  closed: "Closed",
};

export const incidentStatuses: IncidentStatus[] = [
  "new",
  "investigating",
  "contained",
  "eradicated",
  "resolved",
  "closed",
];

export const openIncidentStatuses: IncidentStatus[] = [
  "new",
  "investigating",
  "contained",
  "eradicated",
];

export const closedIncidentStatuses: IncidentStatus[] = [
  "resolved",
  "closed",
];

export const incidentPriorities: IncidentPriority[] = ["P1", "P2", "P3", "P4"];

export const incidentPriorityLabels: Record<IncidentPriority, string> = {
  P1: "P1 · Critical",
  P2: "P2 · High",
  P3: "P3 · Medium",
  P4: "P4 · Low",
};

export const priorityWeight: Record<IncidentPriority, number> = {
  P1: 0,
  P2: 1,
  P3: 2,
  P4: 3,
};

/** Containment SLA targets by priority (minutes). */
export const prioritySlaMinutes: Record<IncidentPriority, number> = {
  P1: 60,
  P2: 4 * 60,
  P3: 24 * 60,
  P4: 72 * 60,
};

export const incidentSortLabels: Record<IncidentSort, string> = {
  newest: "Newest first",
  "severity-desc": "Priority · P1 first",
  "severity-asc": "Priority · P4 first",
  "risk-desc": "Impact · high to low",
  "risk-asc": "Impact · low to high",
  "age-desc": "Age · oldest first",
  "age-asc": "Age · newest first",
};

export function getIncidentSlaState(incident: SocIncident): IncidentSlaState {
  if (closedIncidentStatuses.includes(incident.status)) return "ok";
  if (
    incident.status === "contained" ||
    incident.status === "eradicated"
  ) {
    return "ok";
  }
  const target = prioritySlaMinutes[incident.priority];
  if (incident.ageMinutes >= target) return "breached";
  if (incident.ageMinutes >= target * 0.75) return "at-risk";
  return "ok";
}

export function getIncidentSlaRemainingLabel(incident: SocIncident): string {
  if (closedIncidentStatuses.includes(incident.status)) return "Closed";
  if (
    incident.status === "contained" ||
    incident.status === "eradicated"
  ) {
    return "Contained";
  }
  const remaining = prioritySlaMinutes[incident.priority] - incident.ageMinutes;
  if (remaining <= 0) return "SLA breached";
  return `${formatAgeLabel(remaining)} to contain`;
}

export const incidentSourceCategories = alertSourceCategories;
export const incidentSourceCategoryLabels = alertSourceCategoryLabels;
export const incidentEntityTypeLabels = alertEntityTypeLabels;
export const incidentEnvironmentLabels = alertEnvironmentLabels;

export { severityWeight };

/** Default “assign to me” analyst for triage actions. */
export const currentAnalystId = "ava-reed";

export function severityToPriority(
  severity: IncidentSeverity,
): IncidentPriority {
  switch (severity) {
    case "critical":
      return "P1";
    case "high":
      return "P2";
    case "medium":
      return "P3";
    case "low":
      return "P4";
  }
}

export function maxSeverity(
  severities: IncidentSeverity[],
): IncidentSeverity {
  if (severities.length === 0) return "medium";
  return [...severities].sort(
    (a, b) => severityWeight[a] - severityWeight[b],
  )[0]!;
}

export function getIncidentAssignee(assigneeId: string | null) {
  if (!assigneeId) return null;
  return administrationUsers.find((user) => user.id === assigneeId) ?? null;
}

export function getIncidentAssignees() {
  return administrationUsers.filter(
    (user) =>
      user.role === "Analyst" ||
      user.role === "Responder" ||
      user.role === "Admin" ||
      user.role === "Owner",
  );
}

export function formatAgeLabel(ageMinutes: number) {
  if (ageMinutes < 60) return `${ageMinutes}m`;
  if (ageMinutes < 60 * 24) return `${Math.round(ageMinutes / 60)}h`;
  return `${Math.round(ageMinutes / (60 * 24))}d`;
}

export function incidentSearchIndex(incident: SocIncident) {
  const device = incident.deviceId
    ? getLinkedDevice(incident.deviceId)
    : null;
  const identity = incident.identityId
    ? getLinkedIdentity(incident.identityId)
    : null;
  const assignee = getIncidentAssignee(incident.assigneeId);

  return [
    incident.id,
    incident.title,
    incident.summary,
    incident.primarySourceName,
    incident.entityName,
    incident.mitreTactic ?? "",
    incident.mitreTechnique ?? "",
    incident.environment,
    incident.tags.join(" "),
    incident.alertIds.join(" "),
    incident.sourceIds.join(" "),
    incident.priority,
    incident.notes,
    assignee?.name ?? "",
    device?.name ?? "",
    device?.hostname ?? "",
    identity?.displayName ?? "",
    identity?.principal ?? "",
    incidentSeverityLabels[incident.severity],
    incidentStatusLabels[incident.status],
  ]
    .join(" ")
    .toLowerCase();
}

function buildTimeline(
  createdAt: string,
  status: IncidentStatus,
  escalated: boolean,
): { at: string; label: string }[] {
  const created = new Date(createdAt);
  const steps: { at: string; label: string }[] = [
    {
      at: created.toISOString(),
      label: escalated
        ? "Incident opened from alert escalation"
        : "Incident case opened",
    },
  ];

  const addHours = (hours: number, label: string) => {
    const at = new Date(created.getTime() + hours * 3_600_000).toISOString();
    steps.push({ at, label });
  };

  if (status !== "new") addHours(1, "Investigation started");
  if (
    status === "contained" ||
    status === "eradicated" ||
    status === "resolved" ||
    status === "closed"
  ) {
    addHours(4, "Containment actions applied");
  }
  if (status === "eradicated" || status === "resolved" || status === "closed") {
    addHours(8, "Threat eradicated from environment");
  }
  if (status === "resolved" || status === "closed") {
    addHours(12, "Incident resolved");
  }
  if (status === "closed") {
    addHours(18, "Incident closed after review");
  }

  return steps;
}

export function incidentFromAlerts(
  alerts: SocAlert[],
  overrides: Partial<SocIncident> & { id: string },
): SocIncident {
  if (alerts.length === 0) {
    throw new Error("incidentFromAlerts requires at least one alert");
  }

  const primary = alerts[0]!;
  const severity = maxSeverity(alerts.map((a) => a.severity));
  const sourceIds = Array.from(new Set(alerts.map((a) => a.sourceId)));
  const ageMinutes = Math.min(...alerts.map((a) => a.ageMinutes));
  const riskScore = Math.min(
    99,
    Math.max(...alerts.map((a) => a.riskScore), 40) +
      Math.min(15, (alerts.length - 1) * 5),
  );
  const status = overrides.status ?? "new";
  const escalatedFromAlerts = overrides.escalatedFromAlerts ?? true;
  const createdAt = overrides.createdAt ?? primary.createdAt;
  const tags = Array.from(
    new Set([
      ...alerts.flatMap((a) => a.tags),
      alerts.length > 1 ? "multi-alert" : "escalation",
    ]),
  );

  return {
    id: overrides.id,
    title: overrides.title ?? primary.title,
    summary:
      overrides.summary ??
      (alerts.length > 1
        ? `IR case correlating ${alerts.length} alerts across ${sourceIds.length} sources. ${primary.summary}`
        : primary.summary),
    severity: overrides.severity ?? severity,
    status,
    priority: overrides.priority ?? severityToPriority(severity),
    alertIds: overrides.alertIds ?? alerts.map((a) => a.id),
    sourceIds: overrides.sourceIds ?? sourceIds,
    primarySourceId: overrides.primarySourceId ?? primary.sourceId,
    primarySourceName: overrides.primarySourceName ?? primary.sourceName,
    primarySourceCategory:
      overrides.primarySourceCategory ?? primary.sourceCategory,
    entityType: overrides.entityType ?? primary.entityType,
    entityName: overrides.entityName ?? primary.entityName,
    deviceId: overrides.deviceId ?? primary.deviceId,
    identityId: overrides.identityId ?? primary.identityId,
    assigneeId:
      overrides.assigneeId !== undefined
        ? overrides.assigneeId
        : (primary.assigneeId ?? currentAnalystId),
    ownerId: overrides.ownerId ?? primary.assigneeId,
    createdAt,
    updatedAt: overrides.updatedAt ?? primary.updatedAt,
    ageLabel: overrides.ageLabel ?? formatAgeLabel(ageMinutes),
    ageMinutes: overrides.ageMinutes ?? ageMinutes,
    riskScore: overrides.riskScore ?? riskScore,
    environment: overrides.environment ?? primary.environment,
    tags: overrides.tags ?? tags,
    mitreTactic: overrides.mitreTactic ?? primary.mitreTactic,
    mitreTechnique: overrides.mitreTechnique ?? primary.mitreTechnique,
    timeline:
      overrides.timeline ??
      buildTimeline(createdAt, status, escalatedFromAlerts),
    notes: overrides.notes ?? "",
    warRoomMessages: overrides.warRoomMessages ?? [
      {
        id: `wrm-${overrides.id}-0`,
        at: createdAt,
        authorId: "system",
        authorName: "Heimdall",
        body: escalatedFromAlerts
          ? "War room opened from alert escalation."
          : "War room opened for this case.",
        mentionIds: [],
        kind: "system",
      },
    ],
    escalatedFromAlerts,
  };
}

const caseTitles = [
  "Suspected ransomware staging across finance endpoints",
  "Credential stuffing campaign against workforce IdP",
  "Cloud privilege escalation via shadow admin path",
  "Multi-source C2 beaconing investigation",
  "Data exfiltration via atypical SaaS OAuth apps",
  "Lateral movement from jump host to domain controllers",
  "Business email compromise targeting executives",
  "Crypto-mining cluster in production VPC",
];

function pickStatus(index: number): IncidentStatus {
  /** Realistic IR funnel — most cases resolve; few stay brand-new. */
  const weights: Array<[IncidentStatus, number]> = [
    ["closed", 28],
    ["resolved", 22],
    ["investigating", 18],
    ["contained", 12],
    ["eradicated", 10],
    ["new", 10],
  ];
  const total = weights.reduce((sum, [, w]) => sum + w, 0);
  let cursor = ((index * 1103515245 + 12345) >>> 0) % total;
  for (const [status, weight] of weights) {
    if (cursor < weight) return status;
    cursor -= weight;
  }
  return "investigating";
}

function buildIncidentCatalog(size = INCIDENT_CATALOG_SIZE): SocIncident[] {
  const byId = new Map(socAlerts.map((alert) => [alert.id, alert]));
  const escalated = socAlerts.filter((a) => a.status === "escalated");
  const openish = socAlerts.filter(
    (a) =>
      a.status === "investigating" ||
      a.status === "triaging" ||
      a.status === "escalated",
  );
  const pool = openish.length > 0 ? openish : socAlerts;
  const incidents: SocIncident[] = [];
  let nextNum = 2400;
  /** Seed catalog spans 45 days of IR history. */
  const catalogSpanMinutes = 60 * 24 * 45;

  const ageForIndex = (index: number, total: number) => {
    if (total <= 1) return 45;
    return Math.round((index / (total - 1)) * (catalogSpanMinutes - 45)) + 30;
  };

  // 1:1 escalations from known escalated alerts
  const escalatedSlice = escalated.slice(0, Math.min(80, escalated.length));
  for (const [index, alert] of escalatedSlice.entries()) {
    const ageMinutes = ageForIndex(index, size);
    const created = new Date(
      Date.UTC(2026, 6, 27, 19, 0) - ageMinutes * 60_000,
    );
    incidents.push(
      incidentFromAlerts([alert], {
        id: `INC-${nextNum}`,
        status: pickStatus(nextNum),
        escalatedFromAlerts: true,
        createdAt: created.toISOString(),
        updatedAt: created.toISOString(),
        ageMinutes,
        ageLabel: formatAgeLabel(ageMinutes),
      }),
    );
    nextNum += 1;
  }

  // Multi-alert cases spanning sources
  for (let i = 0; i < 110 && incidents.length < size; i += 1) {
    const a = pool[i % pool.length]!;
    const b = pool[(i * 7 + 3) % pool.length]!;
    const c = pool[(i * 13 + 11) % pool.length]!;
    const linked = Array.from(
      new Map(
        [a, b, i % 3 === 0 ? c : null]
          .filter((x): x is SocAlert => Boolean(x))
          .map((alert) => [alert.id, alert]),
      ).values(),
    );
    const status = pickStatus(i + 40);
    const ageMinutes = ageForIndex(incidents.length, size);
    const created = new Date(
      Date.UTC(2026, 6, 27, 19, 0) - ageMinutes * 60_000,
    );
    incidents.push(
      incidentFromAlerts(linked, {
        id: `INC-${nextNum}`,
        title: caseTitles[i % caseTitles.length]!,
        status,
        escalatedFromAlerts: false,
        createdAt: created.toISOString(),
        updatedAt: created.toISOString(),
        ageMinutes,
        ageLabel: formatAgeLabel(ageMinutes),
      }),
    );
    nextNum += 1;
  }

  // Fill remaining with single-alert synthetic cases
  let cursor = 0;
  while (incidents.length < size) {
    const alert = pool[cursor % pool.length]!;
    const related = byId.get(alert.id) ?? alert;
    const status = pickStatus(cursor + 80);
    const ageMinutes = ageForIndex(incidents.length, size);
    const created = new Date(
      Date.UTC(2026, 6, 27, 19, 0) - ageMinutes * 60_000,
    );
    incidents.push(
      incidentFromAlerts([related], {
        id: `INC-${nextNum}`,
        title: `${related.title} · IR case`,
        status,
        escalatedFromAlerts: cursor % 2 === 0,
        createdAt: created.toISOString(),
        updatedAt: created.toISOString(),
        ageMinutes,
        ageLabel: formatAgeLabel(ageMinutes),
        assigneeId:
          cursor % 5 === 0
            ? null
            : (getIncidentAssignees()[cursor % getIncidentAssignees().length]
                ?.id ?? currentAnalystId),
      }),
    );
    nextNum += 1;
    cursor += 1;
  }

  return incidents
    .slice(0, size)
    .sort((a, b) => a.ageMinutes - b.ageMinutes);
}

export const socIncidents: SocIncident[] = buildIncidentCatalog();

let incidentIdCounter = Math.max(
  ...socIncidents.map((incident) => {
    const match = /^INC-(\d+)$/.exec(incident.id);
    return match ? Number(match[1]) : 2400;
  }),
  2400,
);

/** Sequential INC ids shared by catalog seed + escalate actions. */
export function nextIncidentId() {
  incidentIdCounter += 1;
  return `INC-${incidentIdCounter}`;
}

export function getIncidentById(
  id: string,
  incidents: Iterable<SocIncident> = socIncidents,
) {
  for (const incident of incidents) {
    if (incident.id === id) return incident;
  }
  return null;
}

export function getIncidentStats(
  incidents: Iterable<SocIncident> = socIncidents,
): IncidentStat[] {
  let active = 0;
  let p1Open = 0;
  let slaRisk = 0;
  let contained = 0;

  for (const incident of incidents) {
    if (openIncidentStatuses.includes(incident.status)) {
      active += 1;
      if (incident.priority === "P1") p1Open += 1;
      const sla = getIncidentSlaState(incident);
      if (sla === "at-risk" || sla === "breached") slaRisk += 1;
    }
    if (incident.status === "contained" || incident.status === "eradicated") {
      contained += 1;
    }
  }

  return [
    {
      key: "active",
      title: "Active cases",
      value: active.toLocaleString("en-US"),
      context: "in response lifecycle",
      delta: 5.2,
      preferLower: true,
    },
    {
      key: "p1-open",
      title: "P1 open",
      value: p1Open.toLocaleString("en-US"),
      context: "need immediate containment",
      delta: 9.1,
      preferLower: true,
    },
    {
      key: "mttc",
      title: "MTTC",
      value: "3.4h",
      context: "mean time to contain",
      delta: -4.6,
      preferLower: true,
    },
    {
      key: "sla-risk",
      title: "SLA at risk",
      value: slaRisk.toLocaleString("en-US"),
      context: "approaching or breached",
      delta: 11.4,
      preferLower: true,
    },
    {
      key: "contained",
      title: "Contained",
      value: contained.toLocaleString("en-US"),
      context: "awaiting eradicate / close",
      delta: 3.2,
    },
  ];
}

export function getPriorityBreakdown(
  incidents: Iterable<SocIncident> = socIncidents,
) {
  const counts: Record<IncidentPriority, number> = {
    P1: 0,
    P2: 0,
    P3: 0,
    P4: 0,
  };
  for (const incident of incidents) counts[incident.priority] += 1;
  return incidentPriorities.map((priority) => ({
    priority,
    label: priority,
    count: counts[priority],
  }));
}

export function getSeverityBreakdown(
  incidents: Iterable<SocIncident> = socIncidents,
) {
  const counts: Record<IncidentSeverity, number> = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
  };
  for (const incident of incidents) counts[incident.severity] += 1;
  return incidentSeverities.map((severity) => ({
    severity,
    label: incidentSeverityLabels[severity],
    count: counts[severity],
  }));
}

export function getAgingBreakdown(
  incidents: Iterable<SocIncident> = socIncidents,
): IncidentAgingBucket[] {
  const buckets: Record<IncidentAgingBucket["key"], number> = {
    lt4h: 0,
    "4to24h": 0,
    "1to3d": 0,
    gt3d: 0,
  };

  for (const incident of incidents) {
    if (!openIncidentStatuses.includes(incident.status)) continue;
    const age = incident.ageMinutes;
    if (age < 4 * 60) buckets.lt4h += 1;
    else if (age < 24 * 60) buckets["4to24h"] += 1;
    else if (age < 3 * 24 * 60) buckets["1to3d"] += 1;
    else buckets.gt3d += 1;
  }

  return [
    { key: "lt4h", label: "< 4h", count: buckets.lt4h },
    { key: "4to24h", label: "4–24h", count: buckets["4to24h"] },
    { key: "1to3d", label: "1–3d", count: buckets["1to3d"] },
    { key: "gt3d", label: "> 3d", count: buckets.gt3d },
  ];
}

export function getResponderWorkload(
  incidents: Iterable<SocIncident> = socIncidents,
) {
  const counts = new Map<string, { assigneeId: string; name: string; count: number }>();

  for (const incident of incidents) {
    if (!openIncidentStatuses.includes(incident.status)) continue;
    const id = incident.assigneeId ?? "unassigned";
    const name =
      id === "unassigned"
        ? "Unassigned"
        : (getIncidentAssignee(id)?.name ?? id);
    const existing = counts.get(id);
    if (existing) existing.count += 1;
    else counts.set(id, { assigneeId: id, name, count: 1 });
  }

  return Array.from(counts.values()).sort((a, b) => b.count - a.count);
}

export function getStatusBreakdown(
  incidents: Iterable<SocIncident> = socIncidents,
) {
  const counts: Record<IncidentStatus, number> = {
    new: 0,
    investigating: 0,
    contained: 0,
    eradicated: 0,
    resolved: 0,
    closed: 0,
  };
  for (const incident of incidents) counts[incident.status] += 1;
  return incidentStatuses.map((status) => ({
    status,
    label: incidentStatusLabels[status],
    count: counts[status],
  }));
}

export function getIncidentsBySource(
  incidents: Iterable<SocIncident> = socIncidents,
) {
  const counts = new Map<
    string,
    { sourceId: string; sourceName: string; count: number }
  >();

  for (const incident of incidents) {
    const existing = counts.get(incident.primarySourceId);
    if (existing) {
      existing.count += 1;
    } else {
      counts.set(incident.primarySourceId, {
        sourceId: incident.primarySourceId,
        sourceName: incident.primarySourceName,
        count: 1,
      });
    }
  }

  return Array.from(counts.values()).sort((a, b) => b.count - a.count);
}

export const incidentSourceOptions = getIncidentsBySource(socIncidents).map(
  ({ sourceId, sourceName }) => ({ sourceId, sourceName }),
);

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Bucket catalog cases into daily openings by priority for the lookback window. */
export function getCasesOpenedOverTime(
  incidents: Iterable<SocIncident>,
  range: IncidentsOverviewRange = "7d",
): IncidentsOverTimePoint[] {
  const days = incidentsOverviewRangeDays[range];
  const end = Date.UTC(2026, 6, 27);
  const points: IncidentsOverTimePoint[] = [];
  const byDate = new Map<string, IncidentsOverTimePoint>();

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date(end - offset * 86_400_000);
    const iso = date.toISOString().slice(0, 10);
    const day =
      days <= 7
        ? weekdayLabels[date.getUTCDay()]!
        : `${date.getUTCMonth() + 1}/${date.getUTCDate()}`;
    const point: IncidentsOverTimePoint = {
      day,
      date: iso,
      p1: 0,
      p2: 0,
      p3: 0,
      p4: 0,
    };
    byDate.set(iso, point);
    points.push(point);
  }

  const maxAge = days * 24 * 60;
  for (const incident of incidents) {
    if (incident.ageMinutes > maxAge) continue;
    const dayOffset = Math.min(
      days - 1,
      Math.floor(incident.ageMinutes / (24 * 60)),
    );
    const date = new Date(end - dayOffset * 86_400_000);
    const iso = date.toISOString().slice(0, 10);
    const point = byDate.get(iso);
    if (!point) continue;
    if (incident.priority === "P1") point.p1 += 1;
    else if (incident.priority === "P2") point.p2 += 1;
    else if (incident.priority === "P3") point.p3 += 1;
    else point.p4 += 1;
  }

  return points;
}

/** @deprecated Prefer getCasesOpenedOverTime(incidents, range) so charts share one dataset. */
export function getIncidentsOverTime(
  range: IncidentsOverviewRange = "7d",
): IncidentsOverTimePoint[] {
  return getCasesOpenedOverTime(socIncidents, range);
}

export function getContainmentFocusCases(
  incidents: Iterable<SocIncident>,
  limit = 6,
): SocIncident[] {
  const slaRank: Record<IncidentSlaState, number> = {
    breached: 0,
    "at-risk": 1,
    ok: 2,
  };

  return Array.from(incidents)
    .filter((incident) => openIncidentStatuses.includes(incident.status))
    .filter((incident) => {
      const sla = getIncidentSlaState(incident);
      return (
        incident.priority === "P1" ||
        sla === "at-risk" ||
        sla === "breached"
      );
    })
    .sort(
      (a, b) =>
        slaRank[getIncidentSlaState(a)] - slaRank[getIncidentSlaState(b)] ||
        priorityWeight[a.priority] - priorityWeight[b.priority] ||
        b.ageMinutes - a.ageMinutes,
    )
    .slice(0, limit);
}

export function filterIncidentsByOverviewRange(
  incidents: Iterable<SocIncident>,
  range: IncidentsOverviewRange,
): SocIncident[] {
  const maxAgeMinutes = incidentsOverviewRangeDays[range] * 24 * 60;
  return Array.from(incidents).filter(
    (incident) => incident.ageMinutes <= maxAgeMinutes,
  );
}

export { getLinkedDevice, getLinkedIdentity };

import { administrationUsers } from "@/components/administration/users-data";
import { assetDevices } from "@/components/assets/devices-data";
import { assetIdentities } from "@/components/assets/identities-data";

export type AlertSeverity = "critical" | "high" | "medium" | "low";

export type AlertStatus =
  | "new"
  | "triaging"
  | "investigating"
  | "escalated"
  | "closed"
  | "false-positive";

export type AlertSourceCategory =
  | "siem"
  | "endpoint"
  | "identity"
  | "network"
  | "cloud";

export type AlertEntityType = "host" | "user" | "ip" | "cloud" | "other";

export type AlertEnvironment = "prod" | "staging" | "corp" | "cloud";

export type SocAlert = {
  id: string;
  title: string;
  summary: string;
  severity: AlertSeverity;
  status: AlertStatus;
  sourceId: string;
  sourceName: string;
  sourceCategory: AlertSourceCategory;
  ruleName: string;
  mitreTactic?: string;
  mitreTechnique?: string;
  entityType: AlertEntityType;
  entityName: string;
  /** Linked device from the assets inventory, when known. */
  deviceId: string | null;
  /** Linked identity from the assets inventory, when known. */
  identityId: string | null;
  assigneeId: string | null;
  createdAt: string;
  updatedAt: string;
  ageLabel: string;
  /** Minutes since created — used for sorting. */
  ageMinutes: number;
  eventCount: number;
  confidence: number;
  environment: AlertEnvironment;
  tags: string[];
  recommendedAction: string;
  relatedEntities: string[];
  firstSeenLabel: string;
  lastSeenLabel: string;
  riskScore: number;
  notes?: string;
};

/** Seed rows may omit enrichment fields — filled by `normalizeAlert`. */
type AlertSeed = Omit<
  SocAlert,
  | "confidence"
  | "environment"
  | "tags"
  | "recommendedAction"
  | "relatedEntities"
  | "firstSeenLabel"
  | "lastSeenLabel"
  | "riskScore"
  | "mitreTechnique"
  | "deviceId"
  | "identityId"
> &
  Partial<
    Pick<
      SocAlert,
      | "confidence"
      | "environment"
      | "tags"
      | "recommendedAction"
      | "relatedEntities"
      | "firstSeenLabel"
      | "lastSeenLabel"
      | "riskScore"
      | "mitreTechnique"
      | "deviceId"
      | "identityId"
    >
  >;

export type AlertStat = {
  key: "open" | "critical-open" | "mtta" | "escalated" | "false-positive";
  title: string;
  value: string;
  context: string;
  delta: number;
  preferLower?: boolean;
};

export type AlertsOverTimePoint = {
  day: string;
  date: string;
  critical: number;
  high: number;
  medium: number;
  low: number;
};

export type AlertsOverviewRange = "7d" | "14d" | "30d";

export const alertsOverviewRanges: AlertsOverviewRange[] = ["7d", "14d", "30d"];

export const alertsOverviewRangeDays: Record<AlertsOverviewRange, number> = {
  "7d": 7,
  "14d": 14,
  "30d": 30,
};

export const alertsOverviewRangeLabels: Record<AlertsOverviewRange, string> = {
  "7d": "7d",
  "14d": "14d",
  "30d": "30d",
};

export type AlertSort =
  | "newest"
  | "severity-desc"
  | "severity-asc"
  | "risk-desc"
  | "risk-asc"
  | "age-desc"
  | "age-asc";

export const alertSeverityLabels: Record<AlertSeverity, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

export const alertStatusLabels: Record<AlertStatus, string> = {
  new: "New",
  triaging: "Triaging",
  investigating: "Investigating",
  escalated: "Escalated",
  closed: "Closed",
  "false-positive": "False positive",
};

export const alertSourceCategoryLabels: Record<AlertSourceCategory, string> = {
  siem: "SIEM",
  endpoint: "Endpoint",
  identity: "Identity",
  network: "Network",
  cloud: "Cloud",
};

export const alertEntityTypeLabels: Record<AlertEntityType, string> = {
  host: "Host",
  user: "User",
  ip: "IP",
  cloud: "Cloud resource",
  other: "Other",
};

export const alertEnvironmentLabels: Record<AlertEnvironment, string> = {
  prod: "Production",
  staging: "Staging",
  corp: "Corporate",
  cloud: "Cloud",
};

export const alertSortLabels: Record<AlertSort, string> = {
  newest: "Newest first",
  "severity-desc": "Severity · high to low",
  "severity-asc": "Severity · low to high",
  "risk-desc": "Risk · high to low",
  "risk-asc": "Risk · low to high",
  "age-desc": "Age · oldest first",
  "age-asc": "Age · newest first",
};

export const alertSeverities: AlertSeverity[] = [
  "critical",
  "high",
  "medium",
  "low",
];

export const alertStatuses: AlertStatus[] = [
  "new",
  "triaging",
  "investigating",
  "escalated",
  "closed",
  "false-positive",
];

export const alertSourceCategories: AlertSourceCategory[] = [
  "siem",
  "endpoint",
  "identity",
  "network",
  "cloud",
];

export const openAlertStatuses: AlertStatus[] = [
  "new",
  "triaging",
  "investigating",
  "escalated",
];

export const severityWeight: Record<AlertSeverity, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

/** Default “assign to me” analyst for triage actions. */
export const currentAnalystId = "ava-reed";

export function getAlertAssignee(assigneeId: string | null) {
  if (!assigneeId) return null;
  return administrationUsers.find((user) => user.id === assigneeId) ?? null;
}

export function getAlertAssignees() {
  return administrationUsers.filter(
    (user) =>
      user.role === "Analyst" ||
      user.role === "Responder" ||
      user.role === "Admin" ||
      user.role === "Owner",
  );
}

export function alertSearchIndex(alert: SocAlert) {
  const device = alert.deviceId
    ? assetDevices.find((item) => item.id === alert.deviceId)
    : null;
  const identity = alert.identityId
    ? assetIdentities.find((item) => item.id === alert.identityId)
    : null;

  return [
    alert.id,
    alert.title,
    alert.summary,
    alert.ruleName,
    alert.sourceName,
    alert.entityName,
    alert.mitreTactic ?? "",
    alert.mitreTechnique ?? "",
    alert.environment,
    alert.tags.join(" "),
    alert.relatedEntities.join(" "),
    alert.recommendedAction,
    alert.deviceId ?? "",
    alert.identityId ?? "",
    device?.name ?? "",
    device?.hostname ?? "",
    identity?.displayName ?? "",
    identity?.principal ?? "",
    alertSeverityLabels[alert.severity],
    alertStatusLabels[alert.status],
  ]
    .join(" ")
    .toLowerCase();
}

const environments: AlertEnvironment[] = ["prod", "staging", "corp", "cloud"];

const techniqueByTactic: Record<string, string> = {
  Execution: "T1059.001",
  "Initial Access": "T1078",
  Impact: "T1496",
  "Command and Control": "T1071.001",
  "Privilege Escalation": "T1098",
  "Credential Access": "T1110",
  Exfiltration: "T1048",
  "Lateral Movement": "T1021.002",
  Persistence: "T1053.005",
  "Defense Evasion": "T1218",
  Discovery: "T1046",
};

function defaultRecommendedAction(alert: AlertSeed): string {
  if (alert.severity === "critical") {
    return "Contain the entity, preserve forensics, and escalate if confirmed malicious.";
  }
  if (alert.severity === "high") {
    return "Validate the detection, check related activity, and assign an owner within SLA.";
  }
  if (alert.status === "false-positive") {
    return "Tune the detection rule or add an exception with Detection Engineering.";
  }
  return "Review context, corroborate with adjacent telemetry, and update status.";
}

function defaultTags(alert: AlertSeed): string[] {
  const tags: string[] = [alert.sourceCategory, alert.entityType];
  if (alert.severity === "critical" || alert.severity === "high") {
    tags.push("priority");
  }
  if (alert.mitreTactic) {
    tags.push(alert.mitreTactic.toLowerCase().replace(/\s+/g, "-"));
  }
  return Array.from(new Set(tags));
}

function defaultRelatedEntities(alert: AlertSeed, index: number): string[] {
  const extras = [
    `user:svc-watcher-${(index % 9) + 1}`,
    `host:jump-${(index % 12) + 1}`,
    `ip:10.${(index % 40) + 10}.${(index % 200) + 1}.4`,
  ];
  return [alert.entityName, extras[index % extras.length]!].filter(
    (value, i, all) => all.indexOf(value) === i,
  );
}

function defaultDeviceId(alert: AlertSeed, index: number): string | null {
  if (alert.deviceId !== undefined) return alert.deviceId;
  if (alert.entityType === "user" || alert.entityType === "other") {
    return index % 3 === 0
      ? (assetDevices[index % assetDevices.length]?.id ?? null)
      : null;
  }
  return assetDevices[index % assetDevices.length]?.id ?? null;
}

function defaultIdentityId(alert: AlertSeed, index: number): string | null {
  if (alert.identityId !== undefined) return alert.identityId;
  if (alert.entityType === "host" || alert.entityType === "ip") {
    return index % 2 === 0
      ? (assetIdentities[index % assetIdentities.length]?.id ?? null)
      : null;
  }
  return assetIdentities[index % assetIdentities.length]?.id ?? null;
}

export function getLinkedDevice(deviceId: string | null) {
  if (!deviceId) return null;
  return assetDevices.find((device) => device.id === deviceId) ?? null;
}

export function getLinkedIdentity(identityId: string | null) {
  if (!identityId) return null;
  return assetIdentities.find((identity) => identity.id === identityId) ?? null;
}

export function normalizeAlert(alert: AlertSeed, index = 0): SocAlert {
  const confidence =
    alert.confidence ??
    (alert.severity === "critical"
      ? 88
      : alert.severity === "high"
        ? 76
        : alert.severity === "medium"
          ? 62
          : 48) +
      (index % 11);
  const riskScore =
    alert.riskScore ??
    Math.min(
      99,
      (alert.severity === "critical"
        ? 86
        : alert.severity === "high"
          ? 68
          : alert.severity === "medium"
            ? 44
            : 22) +
        (index % 13),
    );

  const deviceId = defaultDeviceId(alert, index);
  const identityId = defaultIdentityId(alert, index);
  const device = getLinkedDevice(deviceId);
  const identity = getLinkedIdentity(identityId);

  let entityName = alert.entityName;
  if (alert.entityType === "host" && device) {
    entityName = device.hostname;
  } else if (alert.entityType === "user" && identity) {
    entityName = identity.principal;
  }

  return {
    ...alert,
    entityName,
    deviceId,
    identityId,
    mitreTechnique:
      alert.mitreTechnique ??
      (alert.mitreTactic
        ? techniqueByTactic[alert.mitreTactic]
        : undefined) ??
      (alert.ruleName.match(/T\d{4}(?:\.\d{3})?/)?.[0] ?? undefined),
    confidence: Math.min(99, confidence),
    environment:
      alert.environment ??
      environments[index % environments.length] ??
      "prod",
    tags: alert.tags ?? defaultTags(alert),
    recommendedAction:
      alert.recommendedAction ?? defaultRecommendedAction(alert),
    relatedEntities:
      alert.relatedEntities ?? defaultRelatedEntities(alert, index),
    firstSeenLabel: alert.firstSeenLabel ?? alert.ageLabel,
    lastSeenLabel:
      alert.lastSeenLabel ??
      (alert.ageMinutes < 30 ? "moments ago" : alert.ageLabel),
    riskScore,
  };
}

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

function buildAlertsOverTime(days = 30): AlertsOverTimePoint[] {
  // Fixed "today" keeps mock charts stable across reloads.
  const today = new Date(Date.UTC(2026, 6, 27));
  const points: AlertsOverTimePoint[] = [];

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date(today);
    date.setUTCDate(today.getUTCDate() - offset);
    const weekday = date.getUTCDay();
    const isWeekend = weekday === 0 || weekday === 6;
    const wave = 1 + Math.sin(offset / 2.4) * 0.18 + Math.cos(offset / 5.1) * 0.08;
    const weekendFactor = isWeekend ? 0.48 : 1;
    const scale = wave * weekendFactor;

    const critical = Math.round((38 + ((offset * 7) % 29)) * scale);
    const high = Math.round((105 + ((offset * 11) % 48)) * scale);
    const medium = Math.round((160 + ((offset * 13) % 62)) * scale);
    const low = Math.round((78 + ((offset * 5) % 36)) * scale);

    const iso = date.toISOString().slice(0, 10);
    points.push({
      date: iso,
      day:
        days <= 7
          ? weekdayLabels[weekday]
          : `${date.getUTCMonth() + 1}/${date.getUTCDate()}`,
      critical,
      high,
      medium,
      low,
    });
  }

  return points;
}

/** Full 30-day series; slice with `getAlertsOverTime`. */
export const alertsOverTime: AlertsOverTimePoint[] = buildAlertsOverTime(30);

export function getAlertsOverTime(
  range: AlertsOverviewRange = "7d",
): AlertsOverTimePoint[] {
  const days = alertsOverviewRangeDays[range];
  const slice = alertsOverTime.slice(-days);
  if (days > 7) return slice;

  return slice.map((point) => {
    const date = new Date(`${point.date}T00:00:00.000Z`);
    return {
      ...point,
      day: weekdayLabels[date.getUTCDay()],
    };
  });
}

export function filterAlertsByOverviewRange(
  alerts: Iterable<SocAlert>,
  range: AlertsOverviewRange,
): SocAlert[] {
  const maxAgeMinutes = alertsOverviewRangeDays[range] * 24 * 60;
  return Array.from(alerts).filter((alert) => alert.ageMinutes <= maxAgeMinutes);
}

/** Hand-authored alerts used as the head of the catalog + generation templates. */
const seedAlerts: AlertSeed[] = [
  {
    id: "ALT-2148",
    title: "Suspicious PowerShell download cradle",
    summary:
      "Encoded PowerShell invoked a remote IEX cradle from a workstation that rarely runs scripting hosts. Payload contacted an uncategorized external IP.",
    severity: "critical",
    status: "new",
    sourceId: "int-splunk-core",
    sourceName: "Splunk Enterprise",
    sourceCategory: "siem",
    ruleName: "T1059.001 · PowerShell Download Cradle",
    mitreTactic: "Execution",
    entityType: "host",
    entityName: "wks-finance-17",
    assigneeId: null,
    createdAt: "2026-07-27T18:42:00Z",
    updatedAt: "2026-07-27T18:42:00Z",
    ageLabel: "18m",
    ageMinutes: 18,
    eventCount: 6,
  },
  {
    id: "ALT-2147",
    title: "Impossible travel after MFA push",
    summary:
      "Okta session for finance analyst authenticated from Austin, then from Singapore within 34 minutes. Both attempts passed MFA push.",
    severity: "critical",
    status: "triaging",
    sourceId: "int-okta-workforce",
    sourceName: "Okta Workforce",
    sourceCategory: "identity",
    ruleName: "Impossible Travel · MFA Success",
    mitreTactic: "Initial Access",
    entityType: "user",
    entityName: "peter.pan@svalbard.ca",
    assigneeId: "owen-lee",
    createdAt: "2026-07-27T18:21:00Z",
    updatedAt: "2026-07-27T18:35:00Z",
    ageLabel: "39m",
    ageMinutes: 39,
    eventCount: 4,
  },
  {
    id: "ALT-2146",
    title: "GuardDuty crypto-mining finding",
    summary:
      "AWS GuardDuty reported Bitcoin-related DNS queries from an EC2 instance in prod that is not on the approved mining exception list.",
    severity: "high",
    status: "investigating",
    sourceId: "int-aws-prod",
    sourceName: "AWS Production",
    sourceCategory: "cloud",
    ruleName: "GuardDuty · CryptoCurrency:EC2/BitcoinTool",
    mitreTactic: "Impact",
    entityType: "cloud",
    entityName: "i-0a91f4c2e8b11d003",
    assigneeId: "ava-reed",
    createdAt: "2026-07-27T17:55:00Z",
    updatedAt: "2026-07-27T18:10:00Z",
    ageLabel: "1h",
    ageMinutes: 65,
    eventCount: 28,
  },
  {
    id: "ALT-2145",
    title: "Outbound C2-like beaconing",
    summary:
      "PAN-OS threat logs show periodic HTTPS callbacks to a low-reputation domain with JA3 matching Cobalt Strike defaults.",
    severity: "critical",
    status: "escalated",
    sourceId: "int-palo-edge",
    sourceName: "PAN-OS Edge Firewalls",
    sourceCategory: "network",
    ruleName: "Threat · Suspected C2 Beacon",
    mitreTactic: "Command and Control",
    entityType: "ip",
    entityName: "10.24.18.91",
    assigneeId: "maya-rao",
    createdAt: "2026-07-27T16:40:00Z",
    updatedAt: "2026-07-27T17:50:00Z",
    ageLabel: "2h",
    ageMinutes: 140,
    eventCount: 142,
  },
  {
    id: "ALT-2144",
    title: "WAF SQLi block surge on /api/search",
    summary:
      "Cloudflare WAF blocked 1.2k SQL injection attempts against the customer search API from a single ASN in under 10 minutes.",
    severity: "high",
    status: "triaging",
    sourceId: "int-cloudflare",
    sourceName: "Cloudflare Enterprise",
    sourceCategory: "network",
    ruleName: "WAF · SQLi Anomaly Spike",
    mitreTactic: "Initial Access",
    entityType: "ip",
    entityName: "185.220.101.44",
    assigneeId: "chloe-park",
    createdAt: "2026-07-27T17:12:00Z",
    updatedAt: "2026-07-27T17:40:00Z",
    ageLabel: "1h",
    ageMinutes: 108,
    eventCount: 1240,
  },
  {
    id: "ALT-2143",
    title: "Privileged role assignment outside change window",
    summary:
      "IAM AttachUserPolicy granted AdministratorAccess to a break-glass role outside the approved maintenance window.",
    severity: "critical",
    status: "new",
    sourceId: "int-aws-prod",
    sourceName: "AWS Production",
    sourceCategory: "cloud",
    ruleName: "CloudTrail · Privileged Policy Attach",
    mitreTactic: "Privilege Escalation",
    entityType: "user",
    entityName: "arn:aws:iam::8821:user/svc-deploy",
    assigneeId: null,
    createdAt: "2026-07-27T18:50:00Z",
    updatedAt: "2026-07-27T18:50:00Z",
    ageLabel: "10m",
    ageMinutes: 10,
    eventCount: 2,
  },
  {
    id: "ALT-2142",
    title: "Ransomware note file creation pattern",
    summary:
      "Endpoint telemetry correlated mass file renames and a README_RESTORE.txt drop across three file shares from the same host.",
    severity: "critical",
    status: "investigating",
    sourceId: "int-splunk-core",
    sourceName: "Splunk Enterprise",
    sourceCategory: "siem",
    ruleName: "Endpoint · Ransomware Behavior Cluster",
    mitreTactic: "Impact",
    entityType: "host",
    entityName: "fs-corp-03",
    assigneeId: "maya-rao",
    createdAt: "2026-07-27T15:05:00Z",
    updatedAt: "2026-07-27T18:00:00Z",
    ageLabel: "4h",
    ageMinutes: 235,
    eventCount: 87,
  },
  {
    id: "ALT-2141",
    title: "Okta MFA fatigue sequence",
    summary:
      "User received 19 MFA push challenges in 8 minutes; the 18th was denied and the 19th accepted from a new device.",
    severity: "high",
    status: "new",
    sourceId: "int-okta-workforce",
    sourceName: "Okta Workforce",
    sourceCategory: "identity",
    ruleName: "MFA Fatigue · Push Bombing",
    mitreTactic: "Credential Access",
    entityType: "user",
    entityName: "wendy.darling@svalbard.ca",
    assigneeId: null,
    createdAt: "2026-07-27T18:33:00Z",
    updatedAt: "2026-07-27T18:33:00Z",
    ageLabel: "27m",
    ageMinutes: 27,
    eventCount: 19,
  },
  {
    id: "ALT-2140",
    title: "DNS tunneling volume anomaly",
    summary:
      "Internal host generated unusually long subdomain queries to a newly registered domain. Entropy score exceeds tunneling threshold.",
    severity: "high",
    status: "triaging",
    sourceId: "int-cloudflare",
    sourceName: "Cloudflare Enterprise",
    sourceCategory: "network",
    ruleName: "Gateway · DNS Tunneling Score",
    mitreTactic: "Exfiltration",
    entityType: "host",
    entityName: "lab-gpu-02",
    assigneeId: "kabir-sethi",
    createdAt: "2026-07-27T16:20:00Z",
    updatedAt: "2026-07-27T17:05:00Z",
    ageLabel: "3h",
    ageMinutes: 160,
    eventCount: 540,
  },
  {
    id: "ALT-2139",
    title: "Lateral movement via SMB admin share",
    summary:
      "Successful admin$ access from a Tier-1 workstation to three servers never accessed by that host in the last 90 days.",
    severity: "high",
    status: "investigating",
    sourceId: "int-splunk-core",
    sourceName: "Splunk Enterprise",
    sourceCategory: "siem",
    ruleName: "Lateral Movement · Admin Share Burst",
    mitreTactic: "Lateral Movement",
    entityType: "host",
    entityName: "wks-helpdesk-04",
    assigneeId: "ava-reed",
    createdAt: "2026-07-27T14:48:00Z",
    updatedAt: "2026-07-27T16:30:00Z",
    ageLabel: "5h",
    ageMinutes: 252,
    eventCount: 11,
  },
  {
    id: "ALT-2138",
    title: "Security Hub critical finding unacknowledged",
    summary:
      "Security Hub imported a critical IAM finding that has been open beyond SLA with no owner acknowledgment.",
    severity: "medium",
    status: "new",
    sourceId: "int-aws-prod",
    sourceName: "AWS Production",
    sourceCategory: "cloud",
    ruleName: "Security Hub · Critical Unacked",
    mitreTactic: "Persistence",
    entityType: "cloud",
    entityName: "aws-account-8821",
    assigneeId: null,
    createdAt: "2026-07-27T12:10:00Z",
    updatedAt: "2026-07-27T12:10:00Z",
    ageLabel: "7h",
    ageMinutes: 410,
    eventCount: 1,
  },
  {
    id: "ALT-2137",
    title: "Brute-force SSH against bastion",
    summary:
      "Perimeter firewall saw 4.8k failed SSH attempts targeting the prod bastion from rotating Tor exit nodes.",
    severity: "medium",
    status: "closed",
    sourceId: "int-palo-edge",
    sourceName: "PAN-OS Edge Firewalls",
    sourceCategory: "network",
    ruleName: "Threat · SSH Brute Force",
    mitreTactic: "Credential Access",
    entityType: "ip",
    entityName: "198.51.100.23",
    assigneeId: "owen-lee",
    createdAt: "2026-07-26T22:15:00Z",
    updatedAt: "2026-07-27T01:20:00Z",
    ageLabel: "1d",
    ageMinutes: 1365,
    eventCount: 4821,
  },
  {
    id: "ALT-2136",
    title: "Service account interactive login",
    summary:
      "Okta reported an interactive SSO login for a machine account that should only use API tokens.",
    severity: "high",
    status: "false-positive",
    sourceId: "int-okta-workforce",
    sourceName: "Okta Workforce",
    sourceCategory: "identity",
    ruleName: "Service Account · Interactive Login",
    mitreTactic: "Defense Evasion",
    entityType: "user",
    entityName: "svc-ci-runner",
    assigneeId: "ben-lewis",
    createdAt: "2026-07-26T19:40:00Z",
    updatedAt: "2026-07-27T09:15:00Z",
    ageLabel: "1d",
    ageMinutes: 1520,
    eventCount: 1,
  },
  {
    id: "ALT-2135",
    title: "Suspicious lsass memory access",
    summary:
      "EDR-forwarded Sysmon event shows non-system process opening lsass.exe with PROCESS_VM_READ.",
    severity: "critical",
    status: "triaging",
    sourceId: "int-splunk-core",
    sourceName: "Splunk Enterprise",
    sourceCategory: "endpoint",
    ruleName: "Credential Dump · LSASS Access",
    mitreTactic: "Credential Access",
    entityType: "host",
    entityName: "wks-eng-112",
    assigneeId: "kabir-sethi",
    createdAt: "2026-07-27T18:05:00Z",
    updatedAt: "2026-07-27T18:22:00Z",
    ageLabel: "55m",
    ageMinutes: 55,
    eventCount: 3,
  },
  {
    id: "ALT-2134",
    title: "S3 public ACL change on backup bucket",
    summary:
      "PutBucketAcl made corporate-backups readable by AllUsers. Change originated from an unfamiliar access key.",
    severity: "critical",
    status: "escalated",
    sourceId: "int-aws-prod",
    sourceName: "AWS Production",
    sourceCategory: "cloud",
    ruleName: "CloudTrail · Public Bucket ACL",
    mitreTactic: "Exfiltration",
    entityType: "cloud",
    entityName: "s3://acme-corp-backups",
    assigneeId: "riya-sharma",
    createdAt: "2026-07-27T11:30:00Z",
    updatedAt: "2026-07-27T13:00:00Z",
    ageLabel: "8h",
    ageMinutes: 450,
    eventCount: 2,
  },
  {
    id: "ALT-2133",
    title: "Phishing domain resolved by 40 endpoints",
    summary:
      "Gateway DNS blocked a lookalike domain matching the company brand after 40 unique clients attempted resolution.",
    severity: "medium",
    status: "investigating",
    sourceId: "int-cloudflare",
    sourceName: "Cloudflare Enterprise",
    sourceCategory: "network",
    ruleName: "Gateway · Brand Impersonation DNS",
    mitreTactic: "Initial Access",
    entityType: "other",
    entityName: "acme-sso-login[.]com",
    assigneeId: "chloe-park",
    createdAt: "2026-07-27T13:55:00Z",
    updatedAt: "2026-07-27T15:40:00Z",
    ageLabel: "6h",
    ageMinutes: 365,
    eventCount: 40,
  },
  {
    id: "ALT-2132",
    title: "Anomalous AWS console login from new ASN",
    summary:
      "Root-adjacent IAM user signed into the console from an ASN never seen for this account, without a matching travel ticket.",
    severity: "high",
    status: "new",
    sourceId: "int-aws-prod",
    sourceName: "AWS Production",
    sourceCategory: "cloud",
    ruleName: "CloudTrail · Console Login Novel ASN",
    mitreTactic: "Initial Access",
    entityType: "user",
    entityName: "ops-oncall",
    assigneeId: null,
    createdAt: "2026-07-27T18:48:00Z",
    updatedAt: "2026-07-27T18:48:00Z",
    ageLabel: "12m",
    ageMinutes: 12,
    eventCount: 1,
  },
  {
    id: "ALT-2131",
    title: "Cleartext credentials in Splunk notable",
    summary:
      "Password-spray detection surfaced a notable containing a cleartext password in the raw event payload.",
    severity: "medium",
    status: "triaging",
    sourceId: "int-splunk-core",
    sourceName: "Splunk Enterprise",
    sourceCategory: "siem",
    ruleName: "Identity · Password Spray",
    mitreTactic: "Credential Access",
    entityType: "user",
    entityName: "contractor.temp01",
    assigneeId: "owen-lee",
    createdAt: "2026-07-27T10:20:00Z",
    updatedAt: "2026-07-27T11:05:00Z",
    ageLabel: "9h",
    ageMinutes: 520,
    eventCount: 63,
  },
  {
    id: "ALT-2130",
    title: "Tor exit node talking to internal VPN",
    summary:
      "Firewall threat log matched known Tor exit communicating with the corporate VPN concentrator on non-standard ports.",
    severity: "medium",
    status: "closed",
    sourceId: "int-palo-edge",
    sourceName: "PAN-OS Edge Firewalls",
    sourceCategory: "network",
    ruleName: "Threat · Tor to VPN",
    mitreTactic: "Command and Control",
    entityType: "ip",
    entityName: "171.25.193.25",
    assigneeId: "ava-reed",
    createdAt: "2026-07-25T16:00:00Z",
    updatedAt: "2026-07-26T10:30:00Z",
    ageLabel: "2d",
    ageMinutes: 2880,
    eventCount: 9,
  },
  {
    id: "ALT-2129",
    title: "Okta app assignment to terminated user",
    summary:
      "Lifecycle automation failed; a terminated contractor retained Salesforce access for 11 hours after HR offboarding.",
    severity: "high",
    status: "closed",
    sourceId: "int-okta-workforce",
    sourceName: "Okta Workforce",
    sourceCategory: "identity",
    ruleName: "Lifecycle · Orphan App Assignment",
    mitreTactic: "Persistence",
    entityType: "user",
    entityName: "tootles+c@svalbard.ca",
    assigneeId: "ben-lewis",
    createdAt: "2026-07-26T08:00:00Z",
    updatedAt: "2026-07-26T20:00:00Z",
    ageLabel: "1d",
    ageMinutes: 1740,
    eventCount: 3,
  },
  {
    id: "ALT-2128",
    title: "Scheduled task created by unsigned binary",
    summary:
      "A new scheduled task pointing to %TEMP%\\upd.exe was created by an unsigned parent process.",
    severity: "high",
    status: "new",
    sourceId: "int-splunk-core",
    sourceName: "Splunk Enterprise",
    sourceCategory: "endpoint",
    ruleName: "Persistence · Suspicious Scheduled Task",
    mitreTactic: "Persistence",
    entityType: "host",
    entityName: "wks-sales-88",
    assigneeId: null,
    createdAt: "2026-07-27T18:15:00Z",
    updatedAt: "2026-07-27T18:15:00Z",
    ageLabel: "45m",
    ageMinutes: 45,
    eventCount: 2,
  },
  {
    id: "ALT-2127",
    title: "Unusual egress to paste site",
    summary:
      "Developer workstation uploaded large payloads to a paste site during off-hours. DLP policy fired but did not block.",
    severity: "medium",
    status: "triaging",
    sourceId: "int-cloudflare",
    sourceName: "Cloudflare Enterprise",
    sourceCategory: "network",
    ruleName: "Gateway · Sensitive Egress Pastebin",
    mitreTactic: "Exfiltration",
    entityType: "host",
    entityName: "wks-dev-221",
    assigneeId: "chloe-park",
    createdAt: "2026-07-27T07:30:00Z",
    updatedAt: "2026-07-27T09:00:00Z",
    ageLabel: "12h",
    ageMinutes: 690,
    eventCount: 7,
  },
  {
    id: "ALT-2126",
    title: "KMS key policy widened to account root",
    summary:
      "PutKeyPolicy attached a statement granting kms:* to the account root principal on a customer-managed CMK used for PII.",
    severity: "high",
    status: "investigating",
    sourceId: "int-aws-prod",
    sourceName: "AWS Production",
    sourceCategory: "cloud",
    ruleName: "CloudTrail · KMS Policy Expansion",
    mitreTactic: "Privilege Escalation",
    entityType: "cloud",
    entityName: "arn:aws:kms:us-east-1:8821:key/a1b2",
    assigneeId: "victor-hale",
    createdAt: "2026-07-27T09:45:00Z",
    updatedAt: "2026-07-27T14:20:00Z",
    ageLabel: "10h",
    ageMinutes: 555,
    eventCount: 1,
  },
  {
    id: "ALT-2125",
    title: "Multiple failed VPN authentications",
    summary:
      "Same username failed GlobalProtect auth 47 times from distinct residential IPs before a success.",
    severity: "medium",
    status: "new",
    sourceId: "int-palo-edge",
    sourceName: "PAN-OS Edge Firewalls",
    sourceCategory: "network",
    ruleName: "VPN · Auth Failure Burst",
    mitreTactic: "Credential Access",
    entityType: "user",
    entityName: "n.patel",
    assigneeId: null,
    createdAt: "2026-07-27T17:40:00Z",
    updatedAt: "2026-07-27T17:40:00Z",
    ageLabel: "1h",
    ageMinutes: 80,
    eventCount: 48,
  },
  {
    id: "ALT-2124",
    title: "Okta admin API token created",
    summary:
      "A new API token with org-wide admin scopes was minted by an admin who is currently on PTO.",
    severity: "critical",
    status: "investigating",
    sourceId: "int-okta-workforce",
    sourceName: "Okta Workforce",
    sourceCategory: "identity",
    ruleName: "Admin · API Token Created",
    mitreTactic: "Persistence",
    entityType: "user",
    entityName: "wendy.darling@svalbard.ca",
    assigneeId: "maya-rao",
    createdAt: "2026-07-27T16:55:00Z",
    updatedAt: "2026-07-27T18:05:00Z",
    ageLabel: "2h",
    ageMinutes: 125,
    eventCount: 1,
  },
  {
    id: "ALT-2123",
    title: "Living-off-the-land binary abuse",
    summary:
      "certutil.exe downloaded a binary from an external HTTP endpoint and wrote it to ProgramData.",
    severity: "high",
    status: "new",
    sourceId: "int-splunk-core",
    sourceName: "Splunk Enterprise",
    sourceCategory: "endpoint",
    ruleName: "LOLBin · Certutil Download",
    mitreTactic: "Defense Evasion",
    entityType: "host",
    entityName: "wks-hr-09",
    assigneeId: null,
    createdAt: "2026-07-27T18:28:00Z",
    updatedAt: "2026-07-27T18:28:00Z",
    ageLabel: "32m",
    ageMinutes: 32,
    eventCount: 2,
  },
  {
    id: "ALT-2122",
    title: "Security Hub medium findings backlog",
    summary:
      "Aggregate of 64 medium Security Hub findings aged past 14 days without remediation owners.",
    severity: "low",
    status: "new",
    sourceId: "int-aws-prod",
    sourceName: "AWS Production",
    sourceCategory: "cloud",
    ruleName: "Security Hub · Aging Medium Backlog",
    entityType: "cloud",
    entityName: "aws-org-prod",
    assigneeId: null,
    createdAt: "2026-07-27T06:00:00Z",
    updatedAt: "2026-07-27T06:00:00Z",
    ageLabel: "13h",
    ageMinutes: 780,
    eventCount: 64,
  },
  {
    id: "ALT-2121",
    title: "Geographically anomalous SSO app launch",
    summary:
      "Okta recorded an AWS Federated Console app launch from Lagos for a user whose home region is US-West.",
    severity: "medium",
    status: "false-positive",
    sourceId: "int-okta-workforce",
    sourceName: "Okta Workforce",
    sourceCategory: "identity",
    ruleName: "SSO · Geo Anomaly App Launch",
    mitreTactic: "Initial Access",
    entityType: "user",
    entityName: "travel.desk@svalbard.ca",
    assigneeId: "owen-lee",
    createdAt: "2026-07-25T20:10:00Z",
    updatedAt: "2026-07-26T08:45:00Z",
    ageLabel: "2d",
    ageMinutes: 2690,
    eventCount: 1,
  },
  {
    id: "ALT-2120",
    title: "Malware URL category allowed by policy exception",
    summary:
      "A temporary policy exception allowed a malware-categorized URL through for a contractor group and has not been rolled back.",
    severity: "medium",
    status: "triaging",
    sourceId: "int-palo-edge",
    sourceName: "PAN-OS Edge Firewalls",
    sourceCategory: "network",
    ruleName: "URL · Malware Category Exception",
    mitreTactic: "Defense Evasion",
    entityType: "other",
    entityName: "policy-exc-4421",
    assigneeId: "victor-hale",
    createdAt: "2026-07-27T08:20:00Z",
    updatedAt: "2026-07-27T12:00:00Z",
    ageLabel: "11h",
    ageMinutes: 640,
    eventCount: 15,
  },
  {
    id: "ALT-2119",
    title: "Shadow admin created in Entra-synced group",
    summary:
      "Okta group push modified an Azure AD group that grants subscription Owner, adding an unexpected member.",
    severity: "critical",
    status: "escalated",
    sourceId: "int-okta-workforce",
    sourceName: "Okta Workforce",
    sourceCategory: "identity",
    ruleName: "Identity · Shadow Admin Group Push",
    mitreTactic: "Privilege Escalation",
    entityType: "user",
    entityName: "ext.vendor.ops",
    assigneeId: "riya-sharma",
    createdAt: "2026-07-27T15:30:00Z",
    updatedAt: "2026-07-27T17:10:00Z",
    ageLabel: "4h",
    ageMinutes: 210,
    eventCount: 2,
  },
  {
    id: "ALT-2118",
    title: "Excessive failed S3 GetObject from single role",
    summary:
      "An application role generated 12k AccessDenied GetObject calls against a secrets bucket — possible key sprawl or probing.",
    severity: "low",
    status: "closed",
    sourceId: "int-aws-prod",
    sourceName: "AWS Production",
    sourceCategory: "cloud",
    ruleName: "CloudTrail · S3 AccessDenied Spike",
    mitreTactic: "Discovery",
    entityType: "cloud",
    entityName: "role/app-payments-reader",
    assigneeId: "kabir-sethi",
    createdAt: "2026-07-24T14:00:00Z",
    updatedAt: "2026-07-25T11:00:00Z",
    ageLabel: "3d",
    ageMinutes: 4320,
    eventCount: 12041,
  },
  {
    id: "ALT-2117",
    title: "Macro-enabled document spawned cmd",
    summary:
      "Office process created cmd.exe which immediately launched powershell with -enc. Attachment was delivered via email gateway.",
    severity: "high",
    status: "investigating",
    sourceId: "int-splunk-core",
    sourceName: "Splunk Enterprise",
    sourceCategory: "endpoint",
    ruleName: "Phishing · Macro to Shell",
    mitreTactic: "Execution",
    entityType: "host",
    entityName: "wks-acct-33",
    assigneeId: "ava-reed",
    createdAt: "2026-07-27T13:10:00Z",
    updatedAt: "2026-07-27T16:00:00Z",
    ageLabel: "6h",
    ageMinutes: 410,
    eventCount: 5,
  },
  {
    id: "ALT-2116",
    title: "WAF bypass attempt via path normalization",
    summary:
      "Repeated requests used encoded path traversal sequences targeting /admin after normal application paths.",
    severity: "medium",
    status: "new",
    sourceId: "int-cloudflare",
    sourceName: "Cloudflare Enterprise",
    sourceCategory: "network",
    ruleName: "WAF · Path Normalization Bypass",
    mitreTactic: "Initial Access",
    entityType: "ip",
    entityName: "45.33.32.156",
    assigneeId: null,
    createdAt: "2026-07-27T17:00:00Z",
    updatedAt: "2026-07-27T17:00:00Z",
    ageLabel: "2h",
    ageMinutes: 120,
    eventCount: 88,
  },
  {
    id: "ALT-2115",
    title: "Disabled user reactivated without ticket",
    summary:
      "Okta user lifecycle event re-enabled a previously disabled account with no linked ServiceNow change request.",
    severity: "high",
    status: "triaging",
    sourceId: "int-okta-workforce",
    sourceName: "Okta Workforce",
    sourceCategory: "identity",
    ruleName: "Lifecycle · Unticketed Reactivation",
    mitreTactic: "Persistence",
    entityType: "user",
    entityName: "former.intern07",
    assigneeId: "owen-lee",
    createdAt: "2026-07-27T11:15:00Z",
    updatedAt: "2026-07-27T12:45:00Z",
    ageLabel: "8h",
    ageMinutes: 465,
    eventCount: 1,
  },
  {
    id: "ALT-2114",
    title: "Port scan from compromised printer VLAN",
    summary:
      "Host on the printer VLAN scanned RFC1918 ranges for open SMB and RDP. Device firmware is outdated.",
    severity: "medium",
    status: "investigating",
    sourceId: "int-palo-edge",
    sourceName: "PAN-OS Edge Firewalls",
    sourceCategory: "network",
    ruleName: "Threat · Internal Port Scan",
    mitreTactic: "Discovery",
    entityType: "ip",
    entityName: "10.88.12.44",
    assigneeId: "chloe-park",
    createdAt: "2026-07-27T05:40:00Z",
    updatedAt: "2026-07-27T10:00:00Z",
    ageLabel: "14h",
    ageMinutes: 800,
    eventCount: 3200,
  },
  {
    id: "ALT-2113",
    title: "Suspicious AWS STS GetSessionToken",
    summary:
      "Long-lived IAM user called GetSessionToken then assumed a high-privilege role from a previously unseen IP.",
    severity: "high",
    status: "new",
    sourceId: "int-aws-prod",
    sourceName: "AWS Production",
    sourceCategory: "cloud",
    ruleName: "CloudTrail · STS Session then AssumeRole",
    mitreTactic: "Privilege Escalation",
    entityType: "user",
    entityName: "ci-legacy-key",
    assigneeId: null,
    createdAt: "2026-07-27T18:00:00Z",
    updatedAt: "2026-07-27T18:00:00Z",
    ageLabel: "1h",
    ageMinutes: 60,
    eventCount: 3,
  },
  {
    id: "ALT-2112",
    title: "Splunk notable: rare process parent chain",
    summary:
      "Risk-based alerting scored a rare parent/child chain involving mshta → powershell → rundll32 on a VIP laptop.",
    severity: "high",
    status: "triaging",
    sourceId: "int-splunk-core",
    sourceName: "Splunk Enterprise",
    sourceCategory: "siem",
    ruleName: "RBA · Rare Process Chain",
    mitreTactic: "Execution",
    entityType: "host",
    entityName: "lt-exec-02",
    assigneeId: "kabir-sethi",
    createdAt: "2026-07-27T14:00:00Z",
    updatedAt: "2026-07-27T15:20:00Z",
    ageLabel: "5h",
    ageMinutes: 300,
    eventCount: 4,
  },
  {
    id: "ALT-2111",
    title: "Dormant admin account authenticated",
    summary:
      "An admin account inactive for 190 days successfully authenticated via Okta and launched three privileged apps.",
    severity: "critical",
    status: "new",
    sourceId: "int-okta-workforce",
    sourceName: "Okta Workforce",
    sourceCategory: "identity",
    ruleName: "Dormant Privileged Account Use",
    mitreTactic: "Initial Access",
    entityType: "user",
    entityName: "legacy.admin",
    assigneeId: null,
    createdAt: "2026-07-27T18:55:00Z",
    updatedAt: "2026-07-27T18:55:00Z",
    ageLabel: "5m",
    ageMinutes: 5,
    eventCount: 4,
  },
  {
    id: "ALT-2110",
    title: "Cloudflare Access bypass token replay",
    summary:
      "Same Access JWT presented from two continents within two minutes for a production admin application.",
    severity: "critical",
    status: "triaging",
    sourceId: "int-cloudflare",
    sourceName: "Cloudflare Enterprise",
    sourceCategory: "network",
    ruleName: "Access · Token Geo Replay",
    mitreTactic: "Credential Access",
    entityType: "user",
    entityName: "sre.oncall",
    assigneeId: "maya-rao",
    createdAt: "2026-07-27T17:25:00Z",
    updatedAt: "2026-07-27T17:55:00Z",
    ageLabel: "1h",
    ageMinutes: 95,
    eventCount: 2,
  },
  {
    id: "ALT-2109",
    title: "Unsigned driver load attempt",
    summary:
      "Endpoint telemetry blocked an unsigned kernel driver load; hash is unknown to threat intel.",
    severity: "high",
    status: "closed",
    sourceId: "int-splunk-core",
    sourceName: "Splunk Enterprise",
    sourceCategory: "endpoint",
    ruleName: "Endpoint · Unsigned Driver Load",
    mitreTactic: "Persistence",
    entityType: "host",
    entityName: "wks-sec-lab-01",
    assigneeId: "ben-lewis",
    createdAt: "2026-07-26T11:00:00Z",
    updatedAt: "2026-07-26T18:30:00Z",
    ageLabel: "1d",
    ageMinutes: 1920,
    eventCount: 1,
  },
  {
    id: "ALT-2108",
    title: "Excessive CloudTrail Delete* API calls",
    summary:
      "A single principal issued DeleteTrail, DeleteLogGroup, and DeleteBucket calls in rapid succession.",
    severity: "critical",
    status: "investigating",
    sourceId: "int-aws-prod",
    sourceName: "AWS Production",
    sourceCategory: "cloud",
    ruleName: "CloudTrail · Destructive API Burst",
    mitreTactic: "Defense Evasion",
    entityType: "user",
    entityName: "role/breakglass-ops",
    assigneeId: "riya-sharma",
    createdAt: "2026-07-27T12:40:00Z",
    updatedAt: "2026-07-27T15:00:00Z",
    ageLabel: "7h",
    ageMinutes: 380,
    eventCount: 17,
  },
  {
    id: "ALT-2107",
    title: "Spam campaign targeting exec aliases",
    summary:
      "Email gateway forwarded spikes of credential-harvest messages to C-suite distribution lists; 12 clicks recorded.",
    severity: "medium",
    status: "escalated",
    sourceId: "int-splunk-core",
    sourceName: "Splunk Enterprise",
    sourceCategory: "siem",
    ruleName: "Email · Exec Phishing Cluster",
    mitreTactic: "Initial Access",
    entityType: "other",
    entityName: "dist-executives",
    assigneeId: "chloe-park",
    createdAt: "2026-07-27T09:00:00Z",
    updatedAt: "2026-07-27T11:30:00Z",
    ageLabel: "10h",
    ageMinutes: 600,
    eventCount: 312,
  },
  {
    id: "ALT-2106",
    title: "Weak TLS cipher negotiated to partner API",
    summary:
      "Outbound connection to a partner API negotiated TLS 1.0. Informational for compliance tracking.",
    severity: "low",
    status: "false-positive",
    sourceId: "int-palo-edge",
    sourceName: "PAN-OS Edge Firewalls",
    sourceCategory: "network",
    ruleName: "SSL · Weak Cipher",
    entityType: "ip",
    entityName: "203.0.113.88",
    assigneeId: "victor-hale",
    createdAt: "2026-07-23T10:00:00Z",
    updatedAt: "2026-07-24T09:00:00Z",
    ageLabel: "4d",
    ageMinutes: 5760,
    eventCount: 24,
  },
  {
    id: "ALT-2105",
    title: "Okta password reset from unmanaged device",
    summary:
      "Password reset completed from a device that fails device assurance and is not in MDM.",
    severity: "medium",
    status: "new",
    sourceId: "int-okta-workforce",
    sourceName: "Okta Workforce",
    sourceCategory: "identity",
    ruleName: "Identity · Reset from Unmanaged Device",
    mitreTactic: "Credential Access",
    entityType: "user",
    entityName: "tiger.lily@svalbard.ca",
    assigneeId: null,
    createdAt: "2026-07-27T16:10:00Z",
    updatedAt: "2026-07-27T16:10:00Z",
    ageLabel: "3h",
    ageMinutes: 170,
    eventCount: 1,
  },
  {
    id: "ALT-2104",
    title: "Container escape attempt indicators",
    summary:
      "Workload logs show mount of host /var/run/docker.sock from a non-privileged namespace followed by docker ps.",
    severity: "high",
    status: "investigating",
    sourceId: "int-aws-prod",
    sourceName: "AWS Production",
    sourceCategory: "cloud",
    ruleName: "Runtime · Docker Socket Mount",
    mitreTactic: "Privilege Escalation",
    entityType: "cloud",
    entityName: "eks/prod/payments-api",
    assigneeId: "kabir-sethi",
    createdAt: "2026-07-27T10:50:00Z",
    updatedAt: "2026-07-27T13:40:00Z",
    ageLabel: "9h",
    ageMinutes: 490,
    eventCount: 6,
  },
  {
    id: "ALT-2103",
    title: "Repeated blocked exploit kit download",
    summary:
      "Same host repeatedly attempted to fetch an exploit-kit URL that Cloudflare Gateway blocked five times.",
    severity: "low",
    status: "closed",
    sourceId: "int-cloudflare",
    sourceName: "Cloudflare Enterprise",
    sourceCategory: "network",
    ruleName: "Gateway · Exploit Kit Block Repeat",
    mitreTactic: "Execution",
    entityType: "host",
    entityName: "wks-guest-wifi-12",
    assigneeId: "owen-lee",
    createdAt: "2026-07-25T13:00:00Z",
    updatedAt: "2026-07-25T18:00:00Z",
    ageLabel: "2d",
    ageMinutes: 2880,
    eventCount: 5,
  },
  {
    id: "ALT-2102",
    title: "Unusual after-hours domain admin login",
    summary:
      "Domain admin authenticated to a DC at 03:14 local with no matching change ticket or on-call rotation.",
    severity: "high",
    status: "escalated",
    sourceId: "int-splunk-core",
    sourceName: "Splunk Enterprise",
    sourceCategory: "siem",
    ruleName: "Identity · After-hours Domain Admin",
    mitreTactic: "Privilege Escalation",
    entityType: "user",
    entityName: "da-breakglass",
    assigneeId: "maya-rao",
    createdAt: "2026-07-27T10:14:00Z",
    updatedAt: "2026-07-27T12:00:00Z",
    ageLabel: "9h",
    ageMinutes: 526,
    eventCount: 1,
  },
  {
    id: "ALT-2101",
    title: "Informational: new detection rule noisy",
    summary:
      "Detection engineering flagged a newly deployed rule producing elevated FP volume; tracking for tuning.",
    severity: "low",
    status: "triaging",
    sourceId: "int-splunk-core",
    sourceName: "Splunk Enterprise",
    sourceCategory: "siem",
    ruleName: "Meta · Noisy Detection",
    entityType: "other",
    entityName: "rule:net-dns-rare-tld",
    assigneeId: "ben-lewis",
    createdAt: "2026-07-27T04:00:00Z",
    updatedAt: "2026-07-27T08:00:00Z",
    ageLabel: "15h",
    ageMinutes: 900,
    eventCount: 220,
  },
  {
    id: "ALT-2100",
    title: "API key committed to public gist mirror",
    summary:
      "Threat intel matched an AWS access key prefix attributed to this org appearing in a mirrored public gist.",
    severity: "critical",
    status: "escalated",
    sourceId: "int-aws-prod",
    sourceName: "AWS Production",
    sourceCategory: "cloud",
    ruleName: "Intel · Exposed Cloud Key",
    mitreTactic: "Credential Access",
    entityType: "other",
    entityName: "AKIA****7F2Q",
    assigneeId: "riya-sharma",
    createdAt: "2026-07-27T08:30:00Z",
    updatedAt: "2026-07-27T09:45:00Z",
    ageLabel: "11h",
    ageMinutes: 630,
    eventCount: 1,
  },
];

/** Target mock catalog size — large enough to exercise pagination + virtualization. */
export const ALERT_CATALOG_SIZE = 1500;

/**
 * Weighted assignee pool — realistic SOC load:
 * many unassigned/new, heavy Tier 1, lighter leadership.
 */
const assigneePool: Array<string | null> = [
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  "owen-lee",
  "owen-lee",
  "owen-lee",
  "owen-lee",
  "harper-singh",
  "harper-singh",
  "harper-singh",
  "ava-reed",
  "ava-reed",
  "ava-reed",
  "maya-rao",
  "maya-rao",
  "chloe-park",
  "chloe-park",
  "kabir-sethi",
  "leo-park",
  "ethan-cole",
  "jules-hart",
  "ben-lewis",
  "tia-west",
  "riya-sharma",
  "victor-hale",
];

/** Realistic severity mix (~SOC inflow): mostly low/medium, few critical. */
const severityWeights: Array<[AlertSeverity, number]> = [
  ["low", 42],
  ["medium", 33],
  ["high", 18],
  ["critical", 7],
];

/** Realistic status mix: majority closed/FP, smaller open queue. */
const statusWeights: Array<[AlertStatus, number]> = [
  ["closed", 34],
  ["false-positive", 22],
  ["new", 16],
  ["triaging", 12],
  ["investigating", 10],
  ["escalated", 6],
];

function pickWeighted<T>(weights: Array<[T, number]>, salt: number): T {
  const total = weights.reduce((sum, [, w]) => sum + w, 0);
  let cursor = ((salt * 2654435761) >>> 0) % total;
  for (const [value, weight] of weights) {
    if (cursor < weight) return value;
    cursor -= weight;
  }
  return weights[0]![0];
}

function formatAgeLabel(ageMinutes: number) {
  if (ageMinutes < 60) return `${ageMinutes}m`;
  if (ageMinutes < 60 * 24) return `${Math.round(ageMinutes / 60)}h`;
  return `${Math.round(ageMinutes / (60 * 24))}d`;
}

function buildGeneratedAlerts(templates: SocAlert[], count: number): SocAlert[] {
  if (count <= 0) return [];

  const generated: SocAlert[] = [];
  let nextId = 2099;

  for (let index = 0; index < count; index += 1) {
    const template = templates[index % templates.length]!;
    // Cluster ages: many recent + long tail (not uniform across 30d)
    const ageBucket = index % 10;
    const ageMinutes =
      ageBucket < 4
        ? 5 + ((index * 13) % (60 * 8))
        : ageBucket < 7
          ? 60 * 8 + ((index * 17) % (60 * 48))
          : 60 * 48 + ((index * 19) % (60 * 24 * 25));
    const severity = pickWeighted(severityWeights, index * 3 + 7);
    const status = pickWeighted(statusWeights, index * 5 + 11);
    // New alerts tend to be unassigned; closed more often have an owner
    let assigneeId = assigneePool[index % assigneePool.length] ?? null;
    if (status === "new" && index % 3 !== 0) assigneeId = null;
    if (
      (status === "closed" || status === "false-positive") &&
      assigneeId === null
    ) {
      assigneeId = assigneePool[(index * 7) % assigneePool.length] ?? "owen-lee";
    }
    const created = new Date(Date.UTC(2026, 6, 27, 19, 0) - ageMinutes * 60_000);

    generated.push(
      normalizeAlert(
        {
          ...template,
          id: `ALT-${nextId}`,
          title: `${template.title} · sample ${index + 1}`,
          summary: `${template.summary} (synthetic row ${index + 1} for scale testing.)`,
          severity,
          status,
          entityName: `${template.entityName}-${(index % 97) + 1}`,
          assigneeId,
          createdAt: created.toISOString(),
          updatedAt: created.toISOString(),
          ageLabel: formatAgeLabel(ageMinutes),
          ageMinutes,
          eventCount:
            severity === "critical"
              ? 40 + ((index * 11) % 360)
              : severity === "high"
                ? 12 + ((index * 7) % 120)
                : 1 + ((index * 3) % 40),
          tags: undefined,
          relatedEntities: undefined,
          confidence: undefined,
          riskScore: undefined,
        },
        index + templates.length,
      ),
    );
    nextId -= 1;
  }

  return generated;
}

export function buildAlertCatalog(
  seeds: AlertSeed[] = seedAlerts,
  size = ALERT_CATALOG_SIZE,
): SocAlert[] {
  const normalizedSeeds = seeds.map((seed, index) =>
    normalizeAlert(seed, index),
  );
  if (normalizedSeeds.length >= size) return normalizedSeeds.slice(0, size);
  return [
    ...normalizedSeeds,
    ...buildGeneratedAlerts(normalizedSeeds, size - normalizedSeeds.length),
  ];
}

export const socAlerts: SocAlert[] = buildAlertCatalog();

export function getAlertById(
  id: string,
  alerts: Iterable<SocAlert> = socAlerts,
) {
  for (const alert of alerts) {
    if (alert.id === id) return alert;
  }
  return null;
}

export function getAlertStats(alerts: Iterable<SocAlert> = socAlerts): AlertStat[] {
  const {
    total,
    openCount,
    criticalOpen,
    escalated,
    falsePositive,
  } = aggregateAlertsForStats(alerts);
  const fpRate =
    total === 0 ? 0 : Math.round((falsePositive / total) * 1000) / 10;

  return [
    {
      key: "open",
      title: "Open alerts",
      value: openCount.toLocaleString("en-US"),
      context: "new → escalated",
      delta: 8.4,
      preferLower: true,
    },
    {
      key: "critical-open",
      title: "Critical open",
      value: criticalOpen.toLocaleString("en-US"),
      context: "needs immediate triage",
      delta: 12.5,
      preferLower: true,
    },
    {
      key: "mtta",
      title: "MTTA",
      value: "14m",
      context: "mean time to acknowledge",
      delta: -6.2,
      preferLower: true,
    },
    {
      key: "escalated",
      title: "Escalated",
      value: escalated.toLocaleString("en-US"),
      context: "active incident track",
      delta: 4.1,
      preferLower: true,
    },
    {
      key: "false-positive",
      title: "False-positive rate",
      value: `${fpRate}%`,
      context: "of catalog marked FP",
      delta: -1.8,
      preferLower: true,
    },
  ];
}

function aggregateAlertsForStats(alerts: Iterable<SocAlert>) {
  let total = 0;
  let openCount = 0;
  let criticalOpen = 0;
  let escalated = 0;
  let falsePositive = 0;

  for (const alert of alerts) {
    total += 1;
    if (openAlertStatuses.includes(alert.status)) {
      openCount += 1;
      if (alert.severity === "critical") criticalOpen += 1;
    }
    if (alert.status === "escalated") escalated += 1;
    if (alert.status === "false-positive") falsePositive += 1;
  }

  return { total, openCount, criticalOpen, escalated, falsePositive };
}

export function getSeverityBreakdown(alerts: Iterable<SocAlert> = socAlerts) {
  const counts: Record<AlertSeverity, number> = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
  };
  for (const alert of alerts) counts[alert.severity] += 1;
  return alertSeverities.map((severity) => ({
    severity,
    label: alertSeverityLabels[severity],
    count: counts[severity],
  }));
}

export function getStatusBreakdown(alerts: Iterable<SocAlert> = socAlerts) {
  const counts: Record<AlertStatus, number> = {
    new: 0,
    triaging: 0,
    investigating: 0,
    escalated: 0,
    closed: 0,
    "false-positive": 0,
  };
  for (const alert of alerts) counts[alert.status] += 1;
  return alertStatuses.map((status) => ({
    status,
    label: alertStatusLabels[status],
    count: counts[status],
  }));
}

export function getAlertsBySource(alerts: Iterable<SocAlert> = socAlerts) {
  const counts = new Map<
    string,
    { sourceId: string; sourceName: string; count: number }
  >();

  for (const alert of alerts) {
    const existing = counts.get(alert.sourceId);
    if (existing) {
      existing.count += 1;
    } else {
      counts.set(alert.sourceId, {
        sourceId: alert.sourceId,
        sourceName: alert.sourceName,
        count: 1,
      });
    }
  }

  return Array.from(counts.values()).sort((a, b) => b.count - a.count);
}

export const alertSourceOptions = getAlertsBySource(socAlerts).map(
  ({ sourceId, sourceName }) => ({ sourceId, sourceName }),
);

export function getSourceCategoryBreakdown(
  alerts: Iterable<SocAlert> = socAlerts,
) {
  const counts: Record<AlertSourceCategory, number> = {
    siem: 0,
    endpoint: 0,
    identity: 0,
    network: 0,
    cloud: 0,
  };
  for (const alert of alerts) counts[alert.sourceCategory] += 1;
  return alertSourceCategories.map((category) => ({
    category,
    label: alertSourceCategoryLabels[category],
    count: counts[category],
  }));
}

/** Prefer `@/components/incidents/incidents-data` `nextIncidentId` for new code. */
export function nextIncidentId() {
  const n = 1000 + Math.floor(Math.random() * 9000);
  return `INC-${n}`;
}

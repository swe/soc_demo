import {
  type AdministrationUser,
  administrationUsers,
} from "@/components/administration/users-data";

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

export type KbDocCategory =
  | "architecture"
  | "detection"
  | "response"
  | "integrations"
  | "policy"
  | "operations";

export type KbDocStatus = "published" | "draft" | "review" | "archived";

export type KbProcedureSeverity = "critical" | "high" | "medium" | "low";

export type KbProcedureStatus =
  | "approved"
  | "draft"
  | "in-review"
  | "deprecated";

export type KbReportKind =
  | "incident"
  | "audit"
  | "compliance"
  | "threat"
  | "sla"
  | "executive";

export type KbReportStatus =
  | "ready"
  | "generating"
  | "scheduled"
  | "archived";

export type KbTrainingLevel = "foundation" | "intermediate" | "advanced";

export type KbTrainingStatus =
  | "open"
  | "in-progress"
  | "completed"
  | "overdue";

export type KbRelatedLink = {
  label: string;
  href: string;
};

export type KbDocument = {
  id: string;
  code: string;
  title: string;
  summary: string;
  category: KbDocCategory;
  status: KbDocStatus;
  ownerId: string;
  updatedAt: string;
  updatedLabel: string;
  readMinutes: number;
  tags: string[];
  related: KbRelatedLink[];
};

export type KbProcedure = {
  id: string;
  code: string;
  title: string;
  summary: string;
  severity: KbProcedureSeverity;
  status: KbProcedureStatus;
  ownerId: string;
  steps: number;
  lastRunLabel: string;
  runCount: number;
  mitreTactic?: string;
  linkedIncidentIds: string[];
  linkedAlertIds: string[];
  related: KbRelatedLink[];
  updatedAt: string;
};

export type KbReport = {
  id: string;
  code: string;
  title: string;
  summary: string;
  kind: KbReportKind;
  status: KbReportStatus;
  ownerId: string;
  periodLabel: string;
  generatedLabel: string;
  sizeLabel: string;
  related: KbRelatedLink[];
  updatedAt: string;
};

export type KbTraining = {
  id: string;
  code: string;
  title: string;
  summary: string;
  level: KbTrainingLevel;
  status: KbTrainingStatus;
  ownerId: string;
  durationMinutes: number;
  enrolled: number;
  completed: number;
  dueLabel: string;
  tags: string[];
  related: KbRelatedLink[];
  updatedAt: string;
  /** LMS connector id when synced from an external learning platform. */
  lmsProviderId?: string;
  /** External course id in the LMS. */
  lmsExternalId?: string;
  lastLmsSyncAt?: string | null;
};

export type KbStat = {
  title: string;
  value: string;
  context: string;
  delta: number;
  preferLower?: boolean;
};

/* -------------------------------------------------------------------------- */
/*                                  Labels                                    */
/* -------------------------------------------------------------------------- */

export const kbDocCategoryLabels: Record<KbDocCategory, string> = {
  architecture: "Architecture",
  detection: "Detection",
  response: "Response",
  integrations: "Integrations",
  policy: "Policy",
  operations: "Operations",
};

export const kbDocStatusLabels: Record<KbDocStatus, string> = {
  published: "Published",
  draft: "Draft",
  review: "In review",
  archived: "Archived",
};

export const kbProcedureSeverityLabels: Record<KbProcedureSeverity, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

export const kbProcedureStatusLabels: Record<KbProcedureStatus, string> = {
  approved: "Approved",
  draft: "Draft",
  "in-review": "In review",
  deprecated: "Deprecated",
};

export const kbReportKindLabels: Record<KbReportKind, string> = {
  incident: "Incident",
  audit: "Audit log",
  compliance: "Compliance",
  threat: "Threat",
  sla: "SLA",
  executive: "Executive",
};

export const kbReportStatusLabels: Record<KbReportStatus, string> = {
  ready: "Ready",
  generating: "Generating",
  scheduled: "Scheduled",
  archived: "Archived",
};

export const kbTrainingLevelLabels: Record<KbTrainingLevel, string> = {
  foundation: "Foundation",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export const kbTrainingStatusLabels: Record<KbTrainingStatus, string> = {
  open: "Open",
  "in-progress": "In progress",
  completed: "Completed",
  overdue: "Overdue",
};

export const kbDocCategoryColors: Record<KbDocCategory, string> = {
  architecture: "#6366f1",
  detection: "#0ea5e9",
  response: "#ef4444",
  integrations: "#8b5cf6",
  policy: "#14b8a6",
  operations: "#f59e0b",
};

/* -------------------------------------------------------------------------- */
/*                                   People                                   */
/* -------------------------------------------------------------------------- */

export const kbUserById = new Map(
  administrationUsers.map((user) => [user.id, user]),
);

export function getKbUser(id: string): AdministrationUser | undefined {
  return kbUserById.get(id);
}

export function getKbInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/* -------------------------------------------------------------------------- */
/*                                 Documents                                  */
/* -------------------------------------------------------------------------- */

export const kbDocuments: KbDocument[] = [
  {
    id: "doc-001",
    code: "DOC-ARCH-01",
    title: "SOC telemetry architecture",
    summary:
      "End-to-end collection paths from endpoints, identity, and cloud into the detection pipeline.",
    category: "architecture",
    status: "published",
    ownerId: "victor-hale",
    updatedAt: "2026-07-22",
    updatedLabel: "5 days ago",
    readMinutes: 14,
    tags: ["EDR", "SIEM", "pipeline"],
    related: [
      { label: "Devices", href: "/assets/devices" },
      { label: "Integrations", href: "/administration/integrations" },
    ],
  },
  {
    id: "doc-002",
    code: "DOC-DET-04",
    title: "Detection engineering handbook",
    summary:
      "Rule authoring standards, MITRE tagging, tuning SLAs, and false-positive intake.",
    category: "detection",
    status: "published",
    ownerId: "kabir-sethi",
    updatedAt: "2026-07-25",
    updatedLabel: "2 days ago",
    readMinutes: 22,
    tags: ["rules", "MITRE", "tuning"],
    related: [
      { label: "Alerts", href: "/alerts/list" },
      { label: "Detections", href: "/alerts/overview" },
    ],
  },
  {
    id: "doc-003",
    code: "DOC-IR-02",
    title: "Incident severity matrix",
    summary:
      "P1–P4 definitions, customer impact thresholds, and escalation clocks used by Tier 1 and IR.",
    category: "response",
    status: "published",
    ownerId: "maya-rao",
    updatedAt: "2026-07-20",
    updatedLabel: "1 week ago",
    readMinutes: 8,
    tags: ["severity", "SLA", "escalation"],
    related: [
      { label: "Incidents", href: "/incidents/list" },
      { label: "Procedures", href: "/knowledge-base/procedures" },
    ],
  },
  {
    id: "doc-004",
    code: "DOC-INT-07",
    title: "Crowdstrike + Okta integration map",
    summary:
      "Connector scopes, expected event schemas, and health checks for primary telemetry sources.",
    category: "integrations",
    status: "review",
    ownerId: "ben-lewis",
    updatedAt: "2026-07-26",
    updatedLabel: "Yesterday",
    readMinutes: 11,
    tags: ["Crowdstrike", "Okta", "connectors"],
    related: [
      { label: "Integrations", href: "/administration/integrations" },
      { label: "Identities", href: "/assets/identities" },
    ],
  },
  {
    id: "doc-005",
    code: "DOC-POL-03",
    title: "Acceptable use & data handling",
    summary:
      "Analyst access boundaries for PII, retention windows, and evidence export restrictions.",
    category: "policy",
    status: "published",
    ownerId: "riya-sharma",
    updatedAt: "2026-07-12",
    updatedLabel: "2 weeks ago",
    readMinutes: 9,
    tags: ["PII", "retention", "access"],
    related: [
      { label: "Compliance", href: "/compliance" },
      { label: "Users", href: "/administration/users" },
    ],
  },
  {
    id: "doc-006",
    code: "DOC-OPS-11",
    title: "On-call & shift handoff guide",
    summary:
      "Shift checklist, pager ownership, and what must be captured before rotating coverage.",
    category: "operations",
    status: "published",
    ownerId: "ava-reed",
    updatedAt: "2026-07-24",
    updatedLabel: "3 days ago",
    readMinutes: 7,
    tags: ["on-call", "handoff", "Tier 1"],
    related: [
      { label: "Incidents", href: "/incidents/overview" },
      { label: "Users", href: "/administration/users" },
    ],
  },
  {
    id: "doc-007",
    code: "DOC-DET-12",
    title: "CloudTrail anomaly catalog",
    summary:
      "Known-good patterns vs. high-signal AWS API sequences used in cloud detection packs.",
    category: "detection",
    status: "draft",
    ownerId: "chloe-park",
    updatedAt: "2026-07-27",
    updatedLabel: "Today",
    readMinutes: 16,
    tags: ["AWS", "CloudTrail", "anomaly"],
    related: [
      { label: "Alerts", href: "/alerts/list" },
      { label: "Incidents", href: "/incidents/list" },
    ],
  },
  {
    id: "doc-008",
    code: "DOC-ARCH-05",
    title: "Evidence vault storage model",
    summary:
      "How case artifacts are bucketed, encrypted, and linked back to incident timelines.",
    category: "architecture",
    status: "published",
    ownerId: "victor-hale",
    updatedAt: "2026-07-18",
    updatedLabel: "9 days ago",
    readMinutes: 12,
    tags: ["evidence", "storage", "encryption"],
    related: [
      { label: "Incidents", href: "/incidents/list" },
      { label: "Compliance evidence", href: "/compliance" },
    ],
  },
  {
    id: "doc-009",
    code: "DOC-POL-08",
    title: "Vendor access & break-glass",
    summary:
      "Third-party support access, time-boxed elevation, and required logging for break-glass sessions.",
    category: "policy",
    status: "review",
    ownerId: "sofia-ahmed",
    updatedAt: "2026-07-23",
    updatedLabel: "4 days ago",
    readMinutes: 10,
    tags: ["vendor", "break-glass", "IAM"],
    related: [
      { label: "Identities", href: "/assets/identities" },
      { label: "Compliance", href: "/compliance" },
    ],
  },
  {
    id: "doc-010",
    code: "DOC-OPS-02",
    title: "SOC tool inventory & ownership",
    summary:
      "Primary platforms, owners, and failover contacts for detection, response, and ticketing.",
    category: "operations",
    status: "published",
    ownerId: "ben-lewis",
    updatedAt: "2026-07-15",
    updatedLabel: "12 days ago",
    readMinutes: 6,
    tags: ["inventory", "ownership", "tools"],
    related: [
      { label: "Integrations", href: "/administration/integrations" },
      { label: "Profile", href: "/profile" },
    ],
  },
  {
    id: "doc-011",
    code: "DOC-IR-09",
    title: "Customer notification templates",
    summary:
      "Approved wording for containment notices, breach thresholds, and executive updates.",
    category: "response",
    status: "published",
    ownerId: "riya-sharma",
    updatedAt: "2026-07-21",
    updatedLabel: "6 days ago",
    readMinutes: 5,
    tags: ["comms", "customers", "templates"],
    related: [
      { label: "Incidents", href: "/incidents/list" },
      { label: "Reports", href: "/knowledge-base/reports" },
    ],
  },
  {
    id: "doc-012",
    code: "DOC-INT-01",
    title: "Webhook & API authentication",
    summary:
      "Service principal setup, rotation cadence, and monitoring for inbound SOC webhooks.",
    category: "integrations",
    status: "archived",
    ownerId: "leo-park",
    updatedAt: "2026-06-02",
    updatedLabel: "8 weeks ago",
    readMinutes: 9,
    tags: ["API", "webhooks", "auth"],
    related: [
      { label: "Integrations", href: "/administration/integrations" },
    ],
  },
];

/* -------------------------------------------------------------------------- */
/*                                Procedures                                  */
/* -------------------------------------------------------------------------- */

export const kbProcedures: KbProcedure[] = [
  {
    id: "proc-001",
    code: "PB-IR-01",
    title: "Ransomware containment",
    summary:
      "Isolate hosts, revoke tokens, preserve forensic images, and open the customer bridge.",
    severity: "critical",
    status: "approved",
    ownerId: "maya-rao",
    steps: 12,
    lastRunLabel: "2 days ago",
    runCount: 18,
    mitreTactic: "Impact",
    linkedIncidentIds: ["INC-2400", "INC-2403"],
    linkedAlertIds: ["ALT-2148", "ALT-2145"],
    related: [
      { label: "Open incidents", href: "/incidents/list" },
      { label: "Devices", href: "/assets/devices" },
    ],
    updatedAt: "2026-07-25",
  },
  {
    id: "proc-002",
    code: "PB-IR-04",
    title: "Compromised identity response",
    summary:
      "Force reset, revoke sessions, review impossible travel, and hunt lateral movement.",
    severity: "high",
    status: "approved",
    ownerId: "ava-reed",
    steps: 9,
    lastRunLabel: "Yesterday",
    runCount: 41,
    mitreTactic: "Credential Access",
    linkedIncidentIds: ["INC-2401", "INC-2408"],
    linkedAlertIds: ["ALT-2147", "ALT-2142"],
    related: [
      { label: "Identities", href: "/assets/identities" },
      { label: "Alerts", href: "/alerts/list" },
    ],
    updatedAt: "2026-07-26",
  },
  {
    id: "proc-003",
    code: "PB-DET-02",
    title: "Phishing triage & takedown",
    summary:
      "Validate payload, block domains/URLs, notify affected mailboxes, and file IOC updates.",
    severity: "medium",
    status: "approved",
    ownerId: "owen-lee",
    steps: 8,
    lastRunLabel: "4 hours ago",
    runCount: 96,
    mitreTactic: "Initial Access",
    linkedIncidentIds: ["INC-2412"],
    linkedAlertIds: ["ALT-2146", "ALT-2140"],
    related: [
      { label: "Alerts", href: "/alerts/list" },
      { label: "Incidents", href: "/incidents/list" },
    ],
    updatedAt: "2026-07-27",
  },
  {
    id: "proc-004",
    code: "PB-IR-07",
    title: "Data exfiltration investigation",
    summary:
      "Quantify egress, identify destinations, freeze accounts, and prepare legal hold evidence.",
    severity: "critical",
    status: "in-review",
    ownerId: "maya-rao",
    steps: 14,
    lastRunLabel: "11 days ago",
    runCount: 7,
    mitreTactic: "Exfiltration",
    linkedIncidentIds: ["INC-2405"],
    linkedAlertIds: ["ALT-2144"],
    related: [
      { label: "Incidents", href: "/incidents/list" },
      { label: "Compliance", href: "/compliance" },
    ],
    updatedAt: "2026-07-16",
  },
  {
    id: "proc-005",
    code: "PB-OPS-03",
    title: "EDR sensor offline recovery",
    summary:
      "Confirm host reachability, push reinstall, escalate to endpoint ops if SLA slips.",
    severity: "medium",
    status: "approved",
    ownerId: "kabir-sethi",
    steps: 6,
    lastRunLabel: "3 days ago",
    runCount: 63,
    linkedIncidentIds: [],
    linkedAlertIds: ["ALT-2141"],
    related: [
      { label: "Devices", href: "/assets/devices" },
      { label: "Integrations", href: "/administration/integrations" },
    ],
    updatedAt: "2026-07-24",
  },
  {
    id: "proc-006",
    code: "PB-IR-11",
    title: "Privilege escalation hunt",
    summary:
      "Review new admin grants, correlate with endpoint events, and contain abnormal elevation.",
    severity: "high",
    status: "approved",
    ownerId: "chloe-park",
    steps: 10,
    lastRunLabel: "6 days ago",
    runCount: 22,
    mitreTactic: "Privilege Escalation",
    linkedIncidentIds: ["INC-2410", "INC-2415"],
    linkedAlertIds: ["ALT-2143"],
    related: [
      { label: "Identities", href: "/assets/identities" },
      { label: "Incidents", href: "/incidents/list" },
    ],
    updatedAt: "2026-07-21",
  },
  {
    id: "proc-007",
    code: "PB-DET-08",
    title: "Beaconing C2 confirmation",
    summary:
      "Validate periodic egress, enrich IOCs, isolate endpoints, and update blocklists.",
    severity: "high",
    status: "draft",
    ownerId: "kabir-sethi",
    steps: 11,
    lastRunLabel: "Never",
    runCount: 0,
    mitreTactic: "Command and Control",
    linkedIncidentIds: [],
    linkedAlertIds: ["ALT-2139"],
    related: [
      { label: "Alerts", href: "/alerts/list" },
      { label: "Incidents", href: "/incidents/list" },
    ],
    updatedAt: "2026-07-27",
  },
  {
    id: "proc-008",
    code: "PB-OPS-01",
    title: "Major incident war room",
    summary:
      "Stand up bridge, assign scribe / comms / tech leads, and publish status cadence.",
    severity: "critical",
    status: "approved",
    ownerId: "riya-sharma",
    steps: 7,
    lastRunLabel: "2 weeks ago",
    runCount: 5,
    linkedIncidentIds: ["INC-2400"],
    linkedAlertIds: [],
    related: [
      { label: "Incidents overview", href: "/incidents/overview" },
      { label: "Users", href: "/administration/users" },
    ],
    updatedAt: "2026-07-13",
  },
  {
    id: "proc-009",
    code: "PB-IR-15",
    title: "Legacy malware wipe (deprecated)",
    summary:
      "Superseded by ransomware containment; retained for historical case references.",
    severity: "low",
    status: "deprecated",
    ownerId: "ethan-cole",
    steps: 5,
    lastRunLabel: "4 months ago",
    runCount: 112,
    linkedIncidentIds: [],
    linkedAlertIds: [],
    related: [
      { label: "Documentation", href: "/knowledge-base/documentation" },
    ],
    updatedAt: "2025-12-01",
  },
  {
    id: "proc-010",
    code: "PB-DET-11",
    title: "Vulnerability exploit surge",
    summary:
      "Prioritize KEV-tagged CVEs on exposed assets, patch or mitigate, and watch for exploitation alerts.",
    severity: "high",
    status: "in-review",
    ownerId: "dina-moss",
    steps: 9,
    lastRunLabel: "8 days ago",
    runCount: 14,
    mitreTactic: "Exploitation",
    linkedIncidentIds: ["INC-2418"],
    linkedAlertIds: ["ALT-2138"],
    related: [
      { label: "Devices", href: "/assets/devices" },
      { label: "Alerts", href: "/alerts/list" },
    ],
    updatedAt: "2026-07-19",
  },
];

/* -------------------------------------------------------------------------- */
/*                                  Reports                                   */
/* -------------------------------------------------------------------------- */

export const kbReports: KbReport[] = [
  {
    id: "rpt-001",
    code: "RPT-AUD-01",
    title: "SOC audit activity log",
    summary:
      "Immutable analyst actions across alerts, incidents, evidence exports, and access changes.",
    kind: "audit",
    status: "ready",
    ownerId: "sofia-ahmed",
    periodLabel: "Last 30 days",
    generatedLabel: "Generated 1 hour ago",
    sizeLabel: "4.2 MB",
    related: [
      { label: "Compliance", href: "/compliance" },
      { label: "Users", href: "/administration/users" },
    ],
    updatedAt: "2026-07-27",
  },
  {
    id: "rpt-002",
    code: "RPT-INC-07",
    title: "Weekly incident summary",
    summary:
      "Opened vs. closed cases, MTTC, P1 backlog, and top MITRE tactics for leadership.",
    kind: "incident",
    status: "ready",
    ownerId: "riya-sharma",
    periodLabel: "Jul 20 – Jul 26",
    generatedLabel: "Generated yesterday",
    sizeLabel: "1.8 MB",
    related: [
      { label: "Incidents", href: "/incidents/overview" },
      { label: "Alerts", href: "/alerts/overview" },
    ],
    updatedAt: "2026-07-26",
  },
  {
    id: "rpt-003",
    code: "RPT-CMP-03",
    title: "SOC 2 evidence pack",
    summary:
      "Control attestations, screenshots, and exportable artifacts for the current audit window.",
    kind: "compliance",
    status: "ready",
    ownerId: "sofia-ahmed",
    periodLabel: "Q2 2026",
    generatedLabel: "Generated 3 days ago",
    sizeLabel: "28 MB",
    related: [
      { label: "Compliance", href: "/compliance" },
      { label: "Documentation", href: "/knowledge-base/documentation" },
    ],
    updatedAt: "2026-07-24",
  },
  {
    id: "rpt-004",
    code: "RPT-THR-02",
    title: "Threat landscape brief",
    summary:
      "Campaigns tracked by intel, overlapping alerts, and recommended detection coverage gaps.",
    kind: "threat",
    status: "generating",
    ownerId: "chloe-park",
    periodLabel: "July 2026",
    generatedLabel: "Queued · ~8 min",
    sizeLabel: "—",
    related: [
      { label: "Alerts", href: "/alerts/list" },
      { label: "Incidents", href: "/incidents/overview" },
    ],
    updatedAt: "2026-07-27",
  },
  {
    id: "rpt-005",
    code: "RPT-SLA-01",
    title: "Response SLA scorecard",
    summary:
      "Acknowledge and contain SLAs by priority, with breach reasons and on-call attribution.",
    kind: "sla",
    status: "ready",
    ownerId: "ava-reed",
    periodLabel: "Last 14 days",
    generatedLabel: "Generated 6 hours ago",
    sizeLabel: "920 KB",
    related: [
      { label: "Incidents", href: "/incidents/list" },
      { label: "Users", href: "/administration/users" },
    ],
    updatedAt: "2026-07-27",
  },
  {
    id: "rpt-006",
    code: "RPT-EXE-04",
    title: "Executive risk digest",
    summary:
      "Board-ready narrative covering major incidents, compliance posture, and training coverage.",
    kind: "executive",
    status: "scheduled",
    ownerId: "riya-sharma",
    periodLabel: "Monthly · next Mon 08:00",
    generatedLabel: "Next run in 2 days",
    sizeLabel: "—",
    related: [
      { label: "Compliance", href: "/compliance" },
      { label: "Trainings", href: "/knowledge-base/trainings" },
    ],
    updatedAt: "2026-07-25",
  },
  {
    id: "rpt-007",
    code: "RPT-INC-02",
    title: "Ransomware tabletop after-action",
    summary:
      "Findings and action items from the June IR tabletop linked to updated playbooks.",
    kind: "incident",
    status: "ready",
    ownerId: "maya-rao",
    periodLabel: "Jun 12 tabletop",
    generatedLabel: "Generated 5 weeks ago",
    sizeLabel: "3.1 MB",
    related: [
      { label: "Procedures", href: "/knowledge-base/procedures" },
      { label: "Trainings", href: "/knowledge-base/trainings" },
    ],
    updatedAt: "2026-06-18",
  },
  {
    id: "rpt-008",
    code: "RPT-CMP-09",
    title: "Access review evidence export",
    summary:
      "Privileged identity reviews, MFA coverage deltas, and orphaned account removals.",
    kind: "compliance",
    status: "ready",
    ownerId: "ben-lewis",
    periodLabel: "July access cycle",
    generatedLabel: "Generated 4 days ago",
    sizeLabel: "6.4 MB",
    related: [
      { label: "Identities", href: "/assets/identities" },
      { label: "Users", href: "/administration/users" },
    ],
    updatedAt: "2026-07-23",
  },
  {
    id: "rpt-009",
    code: "RPT-AUD-08",
    title: "Q1 2026 audit archive",
    summary:
      "Frozen audit trail retained for auditor re-open requests; read-only export.",
    kind: "audit",
    status: "archived",
    ownerId: "sofia-ahmed",
    periodLabel: "Q1 2026",
    generatedLabel: "Archived Apr 3",
    sizeLabel: "11 MB",
    related: [{ label: "Compliance", href: "/compliance" }],
    updatedAt: "2026-04-03",
  },
  {
    id: "rpt-010",
    code: "RPT-SLA-05",
    title: "Alert triage throughput",
    summary:
      "Tier 1 queue depth, auto-close rate, and escalate-to-incident conversion over time.",
    kind: "sla",
    status: "scheduled",
    ownerId: "owen-lee",
    periodLabel: "Daily · 06:00 UTC",
    generatedLabel: "Next run in 14 hours",
    sizeLabel: "—",
    related: [
      { label: "Alerts", href: "/alerts/overview" },
      { label: "Incidents", href: "/incidents/overview" },
    ],
    updatedAt: "2026-07-26",
  },
];

/* -------------------------------------------------------------------------- */
/*                                 Trainings                                  */
/* -------------------------------------------------------------------------- */

export const kbTrainings: KbTraining[] = [
  {
    id: "trn-001",
    code: "TRN-SEC-01",
    title: "Security awareness foundations",
    summary:
      "Phishing, password hygiene, and report-it workflows required for all SOC-adjacent staff.",
    level: "foundation",
    status: "in-progress",
    ownerId: "sofia-ahmed",
    durationMinutes: 45,
    enrolled: 48,
    completed: 31,
    dueLabel: "Due in 9 days",
    tags: ["awareness", "compliance"],
    related: [
      { label: "Compliance", href: "/compliance" },
      { label: "Users", href: "/administration/users" },
    ],
    updatedAt: "2026-07-20",
  },
  {
    id: "trn-002",
    code: "TRN-IR-03",
    title: "Incident commander drill",
    summary:
      "Live tabletop for war-room roles, severity calls, and customer notification timing.",
    level: "advanced",
    status: "open",
    ownerId: "maya-rao",
    durationMinutes: 90,
    enrolled: 12,
    completed: 4,
    dueLabel: "Starts Aug 4",
    tags: ["IR", "tabletop"],
    related: [
      { label: "Procedures", href: "/knowledge-base/procedures" },
      { label: "Incidents", href: "/incidents/overview" },
    ],
    updatedAt: "2026-07-22",
  },
  {
    id: "trn-003",
    code: "TRN-DET-02",
    title: "Detection rule authoring",
    summary:
      "Writing high-signal detections, unit tests, and MITRE mapping in the engineering pipeline.",
    level: "intermediate",
    status: "in-progress",
    ownerId: "kabir-sethi",
    durationMinutes: 75,
    enrolled: 18,
    completed: 9,
    dueLabel: "Due in 3 days",
    tags: ["detection", "MITRE"],
    related: [
      { label: "Documentation", href: "/knowledge-base/documentation" },
      { label: "Alerts", href: "/alerts/list" },
    ],
    updatedAt: "2026-07-24",
  },
  {
    id: "trn-004",
    code: "TRN-ID-05",
    title: "Identity threat hunting lab",
    summary:
      "Hands-on Okta + endpoint correlation for impossible travel and token theft scenarios.",
    level: "advanced",
    status: "open",
    ownerId: "chloe-park",
    durationMinutes: 120,
    enrolled: 10,
    completed: 2,
    dueLabel: "Enrollment open",
    tags: ["identity", "hunting"],
    related: [
      { label: "Identities", href: "/assets/identities" },
      { label: "Alerts", href: "/alerts/list" },
    ],
    updatedAt: "2026-07-25",
  },
  {
    id: "trn-005",
    code: "TRN-OPS-04",
    title: "Tier 1 triage certification",
    summary:
      "Queue handling, escalate criteria, and documentation standards for new analysts.",
    level: "foundation",
    status: "completed",
    ownerId: "ava-reed",
    durationMinutes: 60,
    enrolled: 22,
    completed: 22,
    dueLabel: "Completed Jul 10",
    tags: ["Tier 1", "triage"],
    related: [
      { label: "Alerts", href: "/alerts/list" },
      { label: "Users", href: "/administration/users" },
    ],
    updatedAt: "2026-07-10",
  },
  {
    id: "trn-006",
    code: "TRN-CMP-02",
    title: "Evidence handling & chain of custody",
    summary:
      "How to export, label, and retain case artifacts so they survive audit scrutiny.",
    level: "intermediate",
    status: "overdue",
    ownerId: "sofia-ahmed",
    durationMinutes: 40,
    enrolled: 16,
    completed: 7,
    dueLabel: "Overdue by 4 days",
    tags: ["evidence", "audit"],
    related: [
      { label: "Compliance", href: "/compliance" },
      { label: "Reports", href: "/knowledge-base/reports" },
    ],
    updatedAt: "2026-07-15",
  },
  {
    id: "trn-007",
    code: "TRN-IR-08",
    title: "Ransomware response walkthrough",
    summary:
      "Step-through of PB-IR-01 with tooling for isolation and token revoke.",
    level: "intermediate",
    status: "in-progress",
    ownerId: "maya-rao",
    durationMinutes: 55,
    enrolled: 14,
    completed: 6,
    dueLabel: "Due in 12 days",
    tags: ["ransomware", "playbook"],
    related: [
      { label: "Procedures", href: "/knowledge-base/procedures" },
      { label: "Devices", href: "/assets/devices" },
    ],
    updatedAt: "2026-07-23",
  },
  {
    id: "trn-008",
    code: "TRN-COM-01",
    title: "Customer & exec communications",
    summary:
      "Writing clear status updates under pressure without leaking sensitive IR detail.",
    level: "foundation",
    status: "open",
    ownerId: "riya-sharma",
    durationMinutes: 35,
    enrolled: 20,
    completed: 0,
    dueLabel: "Enrollment open",
    tags: ["comms", "leadership"],
    related: [
      { label: "Documentation", href: "/knowledge-base/documentation" },
      { label: "Reports", href: "/knowledge-base/reports" },
    ],
    updatedAt: "2026-07-26",
  },
];

/* -------------------------------------------------------------------------- */
/*                                   Stats                                    */
/* -------------------------------------------------------------------------- */

export function getDocumentationStats(): KbStat[] {
  const published = kbDocuments.filter((d) => d.status === "published").length;
  const inReview = kbDocuments.filter((d) => d.status === "review").length;
  const drafts = kbDocuments.filter((d) => d.status === "draft").length;

  return [
    {
      title: "Documents",
      value: String(kbDocuments.length),
      context: "In the knowledge catalog",
      delta: 8.2,
    },
    {
      title: "Published",
      value: String(published),
      context: "Ready for analysts",
      delta: 4.1,
    },
    {
      title: "In review",
      value: String(inReview),
      context: "Awaiting owner sign-off",
      delta: -12.5,
      preferLower: true,
    },
    {
      title: "Drafts",
      value: String(drafts),
      context: "Still being authored",
      delta: 2.0,
      preferLower: true,
    },
  ];
}

export function getProcedureStats(): KbStat[] {
  const approved = kbProcedures.filter((p) => p.status === "approved").length;
  const critical = kbProcedures.filter(
    (p) => p.severity === "critical" && p.status !== "deprecated",
  ).length;
  const runs = kbProcedures.reduce((sum, p) => sum + p.runCount, 0);

  return [
    {
      title: "Playbooks",
      value: String(kbProcedures.length),
      context: "Response procedures",
      delta: 5.4,
    },
    {
      title: "Approved",
      value: String(approved),
      context: "Ready to execute",
      delta: 3.2,
    },
    {
      title: "Critical",
      value: String(critical),
      context: "Highest-severity SOPs",
      delta: 0,
      preferLower: true,
    },
    {
      title: "Runs (90d)",
      value: String(runs),
      context: "Linked case executions",
      delta: 11.6,
    },
  ];
}

export function getReportStats(): KbStat[] {
  const ready = kbReports.filter((r) => r.status === "ready").length;
  const scheduled = kbReports.filter((r) => r.status === "scheduled").length;
  const generating = kbReports.filter((r) => r.status === "generating").length;

  return [
    {
      title: "Reports",
      value: String(kbReports.length),
      context: "Generated & scheduled",
      delta: 6.8,
    },
    {
      title: "Ready",
      value: String(ready),
      context: "Available to download",
      delta: 4.0,
    },
    {
      title: "Scheduled",
      value: String(scheduled),
      context: "Recurring deliveries",
      delta: 1.5,
    },
    {
      title: "Generating",
      value: String(generating),
      context: "In the build queue",
      delta: -20,
      preferLower: true,
    },
  ];
}

export function getTrainingStats(trainings: KbTraining[] = kbTrainings): KbStat[] {
  const enrolled = trainings.reduce((sum, t) => sum + t.enrolled, 0);
  const completed = trainings.reduce((sum, t) => sum + t.completed, 0);
  const overdue = trainings.filter((t) => t.status === "overdue").length;
  const coverage =
    enrolled === 0 ? 0 : Math.round((completed / enrolled) * 100);

  return [
    {
      title: "Courses",
      value: String(trainings.length),
      context: "Active training catalog",
      delta: 7.1,
    },
    {
      title: "Completion",
      value: `${coverage}%`,
      context: `${completed}/${enrolled} seats finished`,
      delta: 5.3,
    },
    {
      title: "Enrolled",
      value: String(enrolled),
      context: "Across all courses",
      delta: 9.4,
    },
    {
      title: "Overdue",
      value: String(overdue),
      context: "Need follow-up",
      delta: -15,
      preferLower: true,
    },
  ];
}

export function trainingCompletionPercent(training: KbTraining) {
  if (training.enrolled === 0) return 0;
  return Math.round((training.completed / training.enrolled) * 100);
}

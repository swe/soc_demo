import {
  type AdministrationUser,
  administrationUsers,
  isAdministrationPrivilegedRole,
} from "@/components/administration/users-data";
import { assetDevices } from "@/components/assets/devices-data";
import { assetIdentities } from "@/components/assets/identities-data";

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

export type FrameworkId =
  | "soc2"
  | "iso27001"
  | "pcidss"
  | "hipaa"
  | "gdpr"
  | "nistcsf"
  | "cis8";

export type FrameworkStatus =
  | "certified"
  | "in-audit"
  | "remediation"
  | "monitoring"
  | "gap-analysis";

export type ControlCategory =
  | "access"
  | "endpoint"
  | "network"
  | "data"
  | "logging"
  | "vulnerability"
  | "incident"
  | "vendor"
  | "resilience"
  | "governance";

export type ControlStatus =
  | "pass"
  | "attention"
  | "fail"
  | "pending"
  | "not-applicable";

export type ControlAutomation = "automated" | "hybrid" | "manual";

export type EvidenceStatus = "current" | "expiring" | "expired" | "missing";

export type FindingSeverity = "critical" | "high" | "medium" | "low";

export type FindingStatus =
  | "open"
  | "in-progress"
  | "awaiting-review"
  | "remediated"
  | "accepted";

export type AuditPhase =
  | "scoping"
  | "readiness"
  | "fieldwork"
  | "remediation"
  | "report";

/**
 * Coverage is measured against the live asset inventory rather than hardcoded,
 * so a control never disagrees with /assets/devices or /assets/identities.
 */
export type CoverageProbeId =
  | "endpoint-agent"
  | "server-agent"
  | "asset-telemetry"
  | "device-vuln-sla"
  | "network-segmentation"
  | "identity-mfa"
  | "privileged-mfa"
  | "identity-lifecycle"
  | "service-credential"
  | "console-2fa";

export type CoverageProbe = {
  id: CoverageProbeId;
  label: string;
  /** Where the numerator/denominator come from, surfaced in the detail sheet. */
  source: "Devices" | "Identities" | "Console users";
  href: string;
  covered: number;
  total: number;
  /** Names of the assets that fail the probe, capped for display. */
  gaps: string[];
};

export type ComplianceFramework = {
  id: FrameworkId;
  name: string;
  shortName: string;
  version: string;
  status: FrameworkStatus;
  description: string;
  scope: string;
  auditor: string;
  auditWindow: string;
  /** Requirements in the published standard, of which we monitor a subset. */
  requirementsLabel: string;
  ownerId: string;
  contributorIds: string[];
  nextMilestone: string;
  nextMilestoneDate: string;
  daysToMilestone: number;
  lastAssessed: string;
};

export type ComplianceControl = {
  id: string;
  code: string;
  title: string;
  description: string;
  category: ControlCategory;
  frameworks: FrameworkId[];
  ownerId: string;
  automation: ControlAutomation;
  status: ControlStatus;
  coverage?: CoverageProbeId;
  evidenceStatus: EvidenceStatus;
  evidenceCount: number;
  lastCheckedLabel: string;
  /** Sortable stamp, pre-rendered so server and client markup stay identical. */
  lastCheckedValue: number;
  nextReviewLabel: string;
  riskScore: number;
  openFindings: number;
};

export type ComplianceEvidence = {
  id: string;
  name: string;
  kind:
    | "Policy"
    | "Config export"
    | "Report"
    | "Screenshot"
    | "Attestation"
    | "Ticket export";
  controlCode: string;
  frameworks: FrameworkId[];
  ownerId: string;
  status: EvidenceStatus;
  collectedLabel: string;
  expiresLabel: string;
  daysToExpiry: number;
  automated: boolean;
};

/** Continuous control monitoring collector — polls a connector for evidence. */
export type ComplianceCollectorStatus =
  | "idle"
  | "running"
  | "healthy"
  | "degraded"
  | "failed";

export type ComplianceCollector = {
  id: string;
  name: string;
  description: string;
  /** Primary control id this probe asserts (GRC continuous probe stub). */
  controlId: string;
  /** Control codes this collector refreshes. */
  controlCodes: string[];
  /** Integration / telemetry source feeding the collector. */
  sourceId: string;
  schedule: string;
  status: ComplianceCollectorStatus;
  lastRunLabel: string;
  lastRunAt: string | null;
  automatedEvidenceIds: string[];
};

/** Continuous GRC probe — thin view over CCM collectors for auditor packs. */
export type ContinuousProbe = {
  id: string;
  name: string;
  status: ComplianceCollectorStatus;
  lastRun: string;
  lastRunAt: string | null;
  controlId: string;
  schedule: string;
  sourceId: string;
};

export function toContinuousProbe(
  collector: ComplianceCollector,
): ContinuousProbe {
  return {
    id: collector.id,
    name: collector.name,
    status: collector.status,
    lastRun: collector.lastRunLabel,
    lastRunAt: collector.lastRunAt,
    controlId: collector.controlId,
    schedule: collector.schedule,
    sourceId: collector.sourceId,
  };
}

export type ComplianceFinding = {
  id: string;
  title: string;
  detail: string;
  severity: FindingSeverity;
  status: FindingStatus;
  frameworks: FrameworkId[];
  controlCode: string;
  ownerId: string;
  source: "Internal audit" | "External auditor" | "Continuous monitoring";
  ageDays: number;
  dueLabel: string;
  overdue: boolean;
};

export type AuditEngagement = {
  id: string;
  name: string;
  frameworkId: FrameworkId;
  type: string;
  auditor: string;
  leadId: string;
  phase: AuditPhase;
  /** 0-100 progress within the current phase. */
  phaseProgress: number;
  windowLabel: string;
  reportDueLabel: string;
  daysRemaining: number;
  requestsTotal: number;
  requestsOpen: number;
  openFindings: number;
  active: boolean;
};

export type ComplianceEvent = {
  id: string;
  actor: string;
  action: string;
  detail: string;
  timeLabel: string;
  tone: "positive" | "warning" | "negative" | "neutral";
};

export type ComplianceStat = {
  title: string;
  value: string;
  delta: number;
  context: string;
  /** When true, a falling trend is healthy (shown in green). */
  preferLower: boolean;
};

/* -------------------------------------------------------------------------- */
/*                        Coverage wired to live assets                       */
/* -------------------------------------------------------------------------- */

const MAX_GAPS = 6;

function deviceProbe(
  id: CoverageProbeId,
  label: string,
  scope: (device: (typeof assetDevices)[number]) => boolean,
  passes: (device: (typeof assetDevices)[number]) => boolean,
): CoverageProbe {
  const inScope = assetDevices.filter(scope);
  const failing = inScope.filter((device) => !passes(device));

  return {
    id,
    label,
    source: "Devices",
    href: "/assets/devices",
    covered: inScope.length - failing.length,
    total: inScope.length,
    gaps: failing.slice(0, MAX_GAPS).map((device) => device.hostname),
  };
}

function identityProbe(
  id: CoverageProbeId,
  label: string,
  scope: (identity: (typeof assetIdentities)[number]) => boolean,
  passes: (identity: (typeof assetIdentities)[number]) => boolean,
): CoverageProbe {
  const inScope = assetIdentities.filter(scope);
  const failing = inScope.filter((identity) => !passes(identity));

  return {
    id,
    label,
    source: "Identities",
    href: "/assets/identities",
    covered: inScope.length - failing.length,
    total: inScope.length,
    gaps: failing.slice(0, MAX_GAPS).map((identity) => identity.principal),
  };
}

function userProbe(
  id: CoverageProbeId,
  label: string,
  scope: (user: AdministrationUser) => boolean,
  passes: (user: AdministrationUser) => boolean,
): CoverageProbe {
  const inScope = administrationUsers.filter(scope);
  const failing = inScope.filter((user) => !passes(user));

  return {
    id,
    label,
    source: "Console users",
    href: "/administration/users",
    covered: inScope.length - failing.length,
    total: inScope.length,
    gaps: failing.slice(0, MAX_GAPS).map((user) => user.email),
  };
}

export const coverageProbes: Record<CoverageProbeId, CoverageProbe> = {
  "endpoint-agent": deviceProbe(
    "endpoint-agent",
    "Endpoints running the EDR sensor",
    (device) => device.category === "endpoint",
    (device) => device.agentInstalled,
  ),
  "server-agent": deviceProbe(
    "server-agent",
    "Servers reporting a hardened baseline",
    (device) => device.category === "server",
    (device) => device.agentInstalled && device.status !== "pending",
  ),
  "asset-telemetry": deviceProbe(
    "asset-telemetry",
    "Assets forwarding telemetry to the SIEM",
    () => true,
    (device) => device.status !== "offline",
  ),
  "device-vuln-sla": deviceProbe(
    "device-vuln-sla",
    "Devices within the vulnerability remediation SLA",
    () => true,
    (device) => device.vulnerabilityCount <= 2,
  ),
  "network-segmentation": deviceProbe(
    "network-segmentation",
    "Network and IoT assets in a governed segment",
    (device) => device.category === "network" || device.category === "iot",
    (device) => device.isolated || device.agentInstalled,
  ),
  "identity-mfa": identityProbe(
    "identity-mfa",
    "Interactive accounts with MFA enforced",
    (identity) => identity.kind !== "service",
    (identity) => identity.mfaEnabled === true,
  ),
  "privileged-mfa": identityProbe(
    "privileged-mfa",
    "Privileged accounts with phishing-resistant MFA",
    (identity) => identity.privileged,
    (identity) => identity.mfaEnabled === true && identity.status === "active",
  ),
  "identity-lifecycle": identityProbe(
    "identity-lifecycle",
    "Accounts active within the joiner-mover-leaver window",
    () => true,
    (identity) => identity.status !== "stale",
  ),
  "service-credential": identityProbe(
    "service-credential",
    "Service accounts with credentials rotated in policy",
    (identity) => identity.kind === "service",
    (identity) => identity.riskScore < 50 && identity.status !== "stale",
  ),
  "console-2fa": userProbe(
    "console-2fa",
    "Privileged console operators with 2FA",
    (user) => isAdministrationPrivilegedRole(user.role),
    (user) => user.twoFactorEnabled,
  ),
};

export function getCoverage(id: CoverageProbeId) {
  return coverageProbes[id];
}

export function coveragePercent(probe: CoverageProbe) {
  if (probe.total === 0) return 100;
  return Math.round((probe.covered / probe.total) * 100);
}

/* -------------------------------------------------------------------------- */
/*                                 Frameworks                                 */
/* -------------------------------------------------------------------------- */

export const frameworkStatusLabels: Record<FrameworkStatus, string> = {
  certified: "Certified",
  "in-audit": "Audit in progress",
  remediation: "Remediation",
  monitoring: "Continuous monitoring",
  "gap-analysis": "Gap analysis",
};

/** Soft identity color for chips and list markers — not for card chrome. */
export const frameworkAccent: Record<FrameworkId, string> = {
  soc2: "#6366f1",
  iso27001: "#10b981",
  pcidss: "#f97316",
  hipaa: "#0ea5e9",
  gdpr: "#8b5cf6",
  nistcsf: "#f43f5e",
  cis8: "#eab308",
};

export const complianceFrameworks: ComplianceFramework[] = [
  {
    id: "soc2",
    name: "SOC 2 Type II",
    shortName: "SOC 2",
    version: "2017 TSC (rev. 2022)",
    status: "in-audit",
    description:
      "Trust Services Criteria for security, availability, and confidentiality across the SOC platform and supporting infrastructure.",
    scope: "Production platform · Corporate IT · Vendor management",
    auditor: "Prescott & Vane LLP",
    auditWindow: "Apr 1 – Sep 30, 2026",
    requirementsLabel: "64 criteria mapped",
    ownerId: "riya-sharma",
    contributorIds: ["ben-lewis", "sofia-ahmed", "kabir-sethi", "dina-moss"],
    nextMilestone: "Fieldwork evidence cut-off",
    nextMilestoneDate: "Aug 14, 2026",
    daysToMilestone: 21,
    lastAssessed: "Type I report issued Nov 2025",
  },
  {
    id: "iso27001",
    name: "ISO/IEC 27001",
    shortName: "ISO 27001",
    version: "2022",
    status: "certified",
    description:
      "Information security management system covering the Annex A control set, risk treatment plan, and statement of applicability.",
    scope: "Global ISMS · All business units",
    auditor: "Northgate Certification",
    auditWindow: "Surveillance 2 · Oct 2026",
    requirementsLabel: "93 Annex A controls mapped",
    ownerId: "sofia-ahmed",
    contributorIds: ["riya-sharma", "victor-hale", "nina-brooks"],
    nextMilestone: "Surveillance audit",
    nextMilestoneDate: "Oct 6, 2026",
    daysToMilestone: 74,
    lastAssessed: "Certificate issued Oct 2024 · valid to Oct 2027",
  },
  {
    id: "pcidss",
    name: "PCI DSS",
    shortName: "PCI DSS",
    version: "4.0.1",
    status: "remediation",
    description:
      "Cardholder data environment requirements. Segmentation and patching gaps are blocking the ROC sign-off.",
    scope: "Payment services · CDE segment · Merchant portal",
    auditor: "Helix QSA Partners",
    auditWindow: "ROC fieldwork · Sep 2026",
    requirementsLabel: "12 requirement groups mapped",
    ownerId: "kabir-sethi",
    contributorIds: ["owen-lee", "tia-west"],
    nextMilestone: "Segmentation retest",
    nextMilestoneDate: "Aug 3, 2026",
    daysToMilestone: 10,
    lastAssessed: "Interim gap assessment Jun 2026",
  },
  {
    id: "hipaa",
    name: "HIPAA Security Rule",
    shortName: "HIPAA",
    version: "45 CFR Part 164",
    status: "monitoring",
    description:
      "Administrative, physical, and technical safeguards for protected health information handled by the healthcare tenant.",
    scope: "Healthcare tenant · ePHI processing",
    auditor: "Internal · GRC team",
    auditWindow: "Annual review · Dec 2026",
    requirementsLabel: "42 safeguards mapped",
    ownerId: "dina-moss",
    contributorIds: ["sofia-ahmed", "leo-park"],
    nextMilestone: "Risk analysis refresh",
    nextMilestoneDate: "Sep 18, 2026",
    daysToMilestone: 56,
    lastAssessed: "Self-assessment Jan 2026",
  },
  {
    id: "gdpr",
    name: "GDPR",
    shortName: "GDPR",
    version: "Art. 30 & 32",
    status: "monitoring",
    description:
      "Records of processing, data subject rights handling, and technical measures for EU personal data.",
    scope: "EU data subjects · Processor obligations",
    auditor: "Internal · Legal & GRC",
    auditWindow: "Continuous",
    requirementsLabel: "28 obligations mapped",
    ownerId: "nina-brooks",
    contributorIds: ["sofia-ahmed", "jules-hart"],
    nextMilestone: "Subprocessor review",
    nextMilestoneDate: "Aug 29, 2026",
    daysToMilestone: 36,
    lastAssessed: "DPIA refreshed Mar 2026",
  },
  {
    id: "nistcsf",
    name: "NIST Cybersecurity Framework",
    shortName: "NIST CSF",
    version: "2.0",
    status: "gap-analysis",
    description:
      "Govern, Identify, Protect, Detect, Respond, and Recover maturity baseline used for board reporting.",
    scope: "Enterprise-wide maturity baseline",
    auditor: "Internal · Security engineering",
    auditWindow: "Baseline v2 · Nov 2026",
    requirementsLabel: "106 subcategories mapped",
    ownerId: "ben-lewis",
    contributorIds: ["ava-reed", "maya-rao", "ethan-cole"],
    nextMilestone: "Tier 3 target assessment",
    nextMilestoneDate: "Nov 12, 2026",
    daysToMilestone: 111,
    lastAssessed: "Baseline v1 scored Feb 2026",
  },
  {
    id: "cis8",
    name: "CIS Critical Security Controls",
    shortName: "CIS v8",
    version: "v8 · IG2",
    status: "monitoring",
    description:
      "Implementation Group 2 safeguards used as the technical backbone for endpoint, identity, and logging hygiene.",
    scope: "Technical safeguards · IG2",
    auditor: "Internal · Detection engineering",
    auditWindow: "Continuous",
    requirementsLabel: "74 IG2 safeguards mapped",
    ownerId: "victor-hale",
    contributorIds: ["chloe-park", "owen-lee"],
    nextMilestone: "Quarterly safeguard scoring",
    nextMilestoneDate: "Sep 30, 2026",
    daysToMilestone: 68,
    lastAssessed: "Scored Jun 30, 2026",
  },
];

export const frameworkById = new Map(
  complianceFrameworks.map((framework) => [framework.id, framework]),
);

/* -------------------------------------------------------------------------- */
/*                                  Controls                                  */
/* -------------------------------------------------------------------------- */

export const controlCategoryLabels: Record<ControlCategory, string> = {
  access: "Access control",
  endpoint: "Endpoint security",
  network: "Network security",
  data: "Data protection",
  logging: "Logging & monitoring",
  vulnerability: "Vulnerability management",
  incident: "Incident response",
  vendor: "Vendor risk",
  resilience: "Resilience & BCDR",
  governance: "Governance & policy",
};

export const controlStatusLabels: Record<ControlStatus, string> = {
  pass: "Passing",
  attention: "Needs attention",
  fail: "Failing",
  pending: "Not tested",
  "not-applicable": "Not applicable",
};

export const controlStatusColors: Record<ControlStatus, string> = {
  pass: "#22c55e",
  attention: "#f59e0b",
  fail: "#ef4444",
  pending: "#3b82f6",
  "not-applicable": "#71717a",
};

export const controlAutomationLabels: Record<ControlAutomation, string> = {
  automated: "Automated",
  hybrid: "Hybrid",
  manual: "Manual",
};

export const complianceControls: ComplianceControl[] = [
  {
    id: "ctl-ac-01",
    code: "AC-01",
    title: "Multi-factor authentication enforced",
    description:
      "All interactive accounts must complete MFA before accessing corporate or production resources.",
    category: "access",
    frameworks: ["soc2", "iso27001", "pcidss", "hipaa", "cis8"],
    ownerId: "sofia-ahmed",
    automation: "automated",
    status: "attention",
    coverage: "identity-mfa",
    evidenceStatus: "current",
    evidenceCount: 4,
    lastCheckedLabel: "12 minutes ago",
    lastCheckedValue: 202607242233,
    nextReviewLabel: "Continuous",
    riskScore: 58,
    openFindings: 1,
  },
  {
    id: "ctl-ac-02",
    code: "AC-02",
    title: "Privileged access requires approval and step-up auth",
    description:
      "Administrative roles are granted just-in-time with documented approval and phishing-resistant MFA.",
    category: "access",
    frameworks: ["soc2", "iso27001", "pcidss", "cis8"],
    ownerId: "riya-sharma",
    automation: "automated",
    status: "fail",
    coverage: "privileged-mfa",
    evidenceStatus: "expiring",
    evidenceCount: 3,
    lastCheckedLabel: "38 minutes ago",
    lastCheckedValue: 202607242207,
    nextReviewLabel: "Continuous",
    riskScore: 84,
    openFindings: 2,
  },
  {
    id: "ctl-ac-03",
    code: "AC-03",
    title: "Quarterly user access review",
    description:
      "Resource owners recertify entitlements for every in-scope system each quarter.",
    category: "access",
    frameworks: ["soc2", "iso27001", "hipaa"],
    ownerId: "dina-moss",
    automation: "manual",
    status: "pass",
    evidenceStatus: "current",
    evidenceCount: 6,
    lastCheckedLabel: "Jul 2, 2026",
    lastCheckedValue: 202607020900,
    nextReviewLabel: "Oct 1, 2026",
    riskScore: 22,
    openFindings: 0,
  },
  {
    id: "ctl-ac-04",
    code: "AC-04",
    title: "Dormant accounts disabled within 30 days",
    description:
      "Accounts with no sign-in activity for 30 days are automatically disabled and queued for deprovisioning.",
    category: "access",
    frameworks: ["soc2", "iso27001", "cis8"],
    ownerId: "chloe-park",
    automation: "automated",
    status: "attention",
    coverage: "identity-lifecycle",
    evidenceStatus: "current",
    evidenceCount: 2,
    lastCheckedLabel: "1 hour ago",
    lastCheckedValue: 202607242145,
    nextReviewLabel: "Continuous",
    riskScore: 47,
    openFindings: 1,
  },
  {
    id: "ctl-ac-05",
    code: "AC-05",
    title: "Service account credential rotation",
    description:
      "Non-human identities rotate secrets at least every 90 days and never share credentials across environments.",
    category: "access",
    frameworks: ["soc2", "pcidss", "cis8"],
    ownerId: "owen-lee",
    automation: "hybrid",
    status: "fail",
    coverage: "service-credential",
    evidenceStatus: "expired",
    evidenceCount: 1,
    lastCheckedLabel: "3 hours ago",
    lastCheckedValue: 202607241930,
    nextReviewLabel: "Weekly",
    riskScore: 76,
    openFindings: 1,
  },
  {
    id: "ctl-ac-06",
    code: "AC-06",
    title: "Console administrator accounts hardened",
    description:
      "Owner and Admin roles in the SOC console are limited to named individuals with 2FA enrolled.",
    category: "access",
    frameworks: ["soc2", "iso27001", "cis8"],
    ownerId: "riya-sharma",
    automation: "automated",
    status: "pass",
    coverage: "console-2fa",
    evidenceStatus: "current",
    evidenceCount: 3,
    lastCheckedLabel: "26 minutes ago",
    lastCheckedValue: 202607242219,
    nextReviewLabel: "Continuous",
    riskScore: 14,
    openFindings: 0,
  },
  {
    id: "ctl-ac-07",
    code: "AC-07",
    title: "Guest and contractor access time-boxed",
    description:
      "External collaborators receive expiring access with sponsor recertification every 60 days.",
    category: "access",
    frameworks: ["iso27001", "gdpr", "hipaa"],
    ownerId: "jules-hart",
    automation: "hybrid",
    status: "attention",
    evidenceStatus: "expiring",
    evidenceCount: 2,
    lastCheckedLabel: "Jul 18, 2026",
    lastCheckedValue: 202607181100,
    nextReviewLabel: "Sep 16, 2026",
    riskScore: 51,
    openFindings: 0,
  },
  {
    id: "ctl-ep-01",
    code: "EP-01",
    title: "EDR sensor deployed on managed endpoints",
    description:
      "Every corporate endpoint runs the managed sensor with tamper protection enabled.",
    category: "endpoint",
    frameworks: ["soc2", "iso27001", "hipaa", "cis8"],
    ownerId: "victor-hale",
    automation: "automated",
    status: "attention",
    coverage: "endpoint-agent",
    evidenceStatus: "current",
    evidenceCount: 3,
    lastCheckedLabel: "8 minutes ago",
    lastCheckedValue: 202607242237,
    nextReviewLabel: "Continuous",
    riskScore: 44,
    openFindings: 1,
  },
  {
    id: "ctl-ep-02",
    code: "EP-02",
    title: "Server baseline hardening applied",
    description:
      "Production servers are built from the hardened image and report configuration drift hourly.",
    category: "endpoint",
    frameworks: ["soc2", "pcidss", "cis8"],
    ownerId: "ben-lewis",
    automation: "automated",
    status: "attention",
    coverage: "server-agent",
    evidenceStatus: "current",
    evidenceCount: 4,
    lastCheckedLabel: "22 minutes ago",
    lastCheckedValue: 202607242223,
    nextReviewLabel: "Continuous",
    riskScore: 39,
    openFindings: 0,
  },
  {
    id: "ctl-ep-03",
    code: "EP-03",
    title: "Full-disk encryption enforced",
    description:
      "Managed laptops enforce FileVault or BitLocker with escrowed recovery keys.",
    category: "endpoint",
    frameworks: ["soc2", "iso27001", "hipaa", "gdpr"],
    ownerId: "victor-hale",
    automation: "automated",
    status: "pass",
    evidenceStatus: "current",
    evidenceCount: 2,
    lastCheckedLabel: "2 hours ago",
    lastCheckedValue: 202607242045,
    nextReviewLabel: "Continuous",
    riskScore: 18,
    openFindings: 0,
  },
  {
    id: "ctl-ep-04",
    code: "EP-04",
    title: "Removable media restricted",
    description:
      "USB mass storage is blocked by policy with documented exceptions reviewed quarterly.",
    category: "endpoint",
    frameworks: ["pcidss", "hipaa", "cis8"],
    ownerId: "chloe-park",
    automation: "manual",
    status: "pending",
    evidenceStatus: "missing",
    evidenceCount: 0,
    lastCheckedLabel: "Not tested",
    lastCheckedValue: 0,
    nextReviewLabel: "Aug 11, 2026",
    riskScore: 41,
    openFindings: 0,
  },
  {
    id: "ctl-ns-01",
    code: "NS-01",
    title: "Cardholder data environment segmented",
    description:
      "The CDE is isolated from corporate networks with deny-by-default rules and validated annually.",
    category: "network",
    frameworks: ["pcidss"],
    ownerId: "kabir-sethi",
    automation: "automated",
    status: "fail",
    coverage: "network-segmentation",
    evidenceStatus: "expired",
    evidenceCount: 1,
    lastCheckedLabel: "4 hours ago",
    lastCheckedValue: 202607241830,
    nextReviewLabel: "Aug 3, 2026",
    riskScore: 88,
    openFindings: 2,
  },
  {
    id: "ctl-ns-02",
    code: "NS-02",
    title: "Firewall rule review",
    description:
      "Perimeter and internal firewall rulesets are reviewed every six months with owners recorded.",
    category: "network",
    frameworks: ["pcidss", "iso27001", "cis8"],
    ownerId: "owen-lee",
    automation: "hybrid",
    status: "attention",
    evidenceStatus: "expiring",
    evidenceCount: 2,
    lastCheckedLabel: "Jun 24, 2026",
    lastCheckedValue: 202606241400,
    nextReviewLabel: "Aug 22, 2026",
    riskScore: 49,
    openFindings: 0,
  },
  {
    id: "ctl-dp-01",
    code: "DP-01",
    title: "Encryption in transit (TLS 1.2+)",
    description:
      "All external endpoints negotiate TLS 1.2 or higher with approved cipher suites.",
    category: "data",
    frameworks: ["soc2", "iso27001", "pcidss", "hipaa", "gdpr"],
    ownerId: "ben-lewis",
    automation: "automated",
    status: "pass",
    evidenceStatus: "current",
    evidenceCount: 3,
    lastCheckedLabel: "31 minutes ago",
    lastCheckedValue: 202607242214,
    nextReviewLabel: "Continuous",
    riskScore: 11,
    openFindings: 0,
  },
  {
    id: "ctl-dp-02",
    code: "DP-02",
    title: "Encryption at rest for production data stores",
    description:
      "Managed databases, object storage, and backups use customer-managed keys with annual rotation.",
    category: "data",
    frameworks: ["soc2", "iso27001", "pcidss", "hipaa", "gdpr"],
    ownerId: "maya-rao",
    automation: "automated",
    status: "pass",
    evidenceStatus: "current",
    evidenceCount: 4,
    lastCheckedLabel: "45 minutes ago",
    lastCheckedValue: 202607242200,
    nextReviewLabel: "Continuous",
    riskScore: 15,
    openFindings: 0,
  },
  {
    id: "ctl-dp-03",
    code: "DP-03",
    title: "Data retention and disposal schedule",
    description:
      "Each data class has a documented retention period with automated deletion jobs and disposal records.",
    category: "data",
    frameworks: ["gdpr", "hipaa", "iso27001"],
    ownerId: "nina-brooks",
    automation: "manual",
    status: "attention",
    evidenceStatus: "expiring",
    evidenceCount: 2,
    lastCheckedLabel: "Jun 30, 2026",
    lastCheckedValue: 202606301000,
    nextReviewLabel: "Aug 30, 2026",
    riskScore: 54,
    openFindings: 1,
  },
  {
    id: "ctl-dp-04",
    code: "DP-04",
    title: "Data loss prevention on egress channels",
    description:
      "Email, cloud storage, and endpoint egress are inspected for regulated data patterns.",
    category: "data",
    frameworks: ["hipaa", "gdpr", "pcidss"],
    ownerId: "leo-park",
    automation: "hybrid",
    status: "fail",
    evidenceStatus: "missing",
    evidenceCount: 0,
    lastCheckedLabel: "Jul 9, 2026",
    lastCheckedValue: 202607091600,
    nextReviewLabel: "Aug 8, 2026",
    riskScore: 79,
    openFindings: 1,
  },
  {
    id: "ctl-dp-05",
    code: "DP-05",
    title: "Records of processing activities maintained",
    description:
      "Article 30 records are kept current for every processing activity and reviewed with legal each quarter.",
    category: "data",
    frameworks: ["gdpr"],
    ownerId: "nina-brooks",
    automation: "manual",
    status: "pass",
    evidenceStatus: "current",
    evidenceCount: 2,
    lastCheckedLabel: "Jul 14, 2026",
    lastCheckedValue: 202607141200,
    nextReviewLabel: "Oct 14, 2026",
    riskScore: 20,
    openFindings: 0,
  },
  {
    id: "ctl-lm-01",
    code: "LM-01",
    title: "Centralized log collection with 400-day retention",
    description:
      "In-scope systems forward security telemetry to the SIEM with tamper-evident retention.",
    category: "logging",
    frameworks: ["soc2", "iso27001", "pcidss", "hipaa", "cis8"],
    ownerId: "ava-reed",
    automation: "automated",
    status: "attention",
    coverage: "asset-telemetry",
    evidenceStatus: "current",
    evidenceCount: 5,
    lastCheckedLabel: "5 minutes ago",
    lastCheckedValue: 202607242240,
    nextReviewLabel: "Continuous",
    riskScore: 43,
    openFindings: 1,
  },
  {
    id: "ctl-lm-02",
    code: "LM-02",
    title: "Security alert triage within SLA",
    description:
      "Critical alerts are acknowledged within 15 minutes and triaged within one hour, 24/7.",
    category: "logging",
    frameworks: ["soc2", "iso27001", "cis8"],
    ownerId: "ava-reed",
    automation: "automated",
    status: "pass",
    evidenceStatus: "current",
    evidenceCount: 6,
    lastCheckedLabel: "3 minutes ago",
    lastCheckedValue: 202607242242,
    nextReviewLabel: "Continuous",
    riskScore: 17,
    openFindings: 0,
  },
  {
    id: "ctl-lm-03",
    code: "LM-03",
    title: "Time synchronization across in-scope systems",
    description:
      "All hosts sync to the approved NTP sources so log correlation stays reliable.",
    category: "logging",
    frameworks: ["pcidss", "cis8"],
    ownerId: "ethan-cole",
    automation: "automated",
    status: "pass",
    evidenceStatus: "current",
    evidenceCount: 1,
    lastCheckedLabel: "1 hour ago",
    lastCheckedValue: 202607242140,
    nextReviewLabel: "Continuous",
    riskScore: 9,
    openFindings: 0,
  },
  {
    id: "ctl-lm-04",
    code: "LM-04",
    title: "Audit log integrity protected",
    description:
      "Log stores are write-once with separated administrative duties and integrity monitoring.",
    category: "logging",
    frameworks: ["soc2", "pcidss", "hipaa"],
    ownerId: "maya-rao",
    automation: "automated",
    status: "attention",
    evidenceStatus: "expiring",
    evidenceCount: 2,
    lastCheckedLabel: "6 hours ago",
    lastCheckedValue: 202607241645,
    nextReviewLabel: "Continuous",
    riskScore: 46,
    openFindings: 0,
  },
  {
    id: "ctl-vm-01",
    code: "VM-01",
    title: "Authenticated vulnerability scanning cadence",
    description:
      "Internal and external scans run weekly against every in-scope asset with credentialed checks.",
    category: "vulnerability",
    frameworks: ["soc2", "pcidss", "iso27001", "cis8"],
    ownerId: "tia-west",
    automation: "automated",
    status: "attention",
    coverage: "device-vuln-sla",
    evidenceStatus: "current",
    evidenceCount: 4,
    lastCheckedLabel: "18 minutes ago",
    lastCheckedValue: 202607242227,
    nextReviewLabel: "Weekly",
    riskScore: 62,
    openFindings: 2,
  },
  {
    id: "ctl-vm-02",
    code: "VM-02",
    title: "Critical patches applied within 14 days",
    description:
      "Critical and high severity vulnerabilities are remediated or risk-accepted inside the SLA window.",
    category: "vulnerability",
    frameworks: ["soc2", "pcidss", "hipaa", "cis8"],
    ownerId: "tia-west",
    automation: "automated",
    status: "fail",
    evidenceStatus: "current",
    evidenceCount: 3,
    lastCheckedLabel: "52 minutes ago",
    lastCheckedValue: 202607242153,
    nextReviewLabel: "Continuous",
    riskScore: 81,
    openFindings: 3,
  },
  {
    id: "ctl-vm-03",
    code: "VM-03",
    title: "Annual penetration test",
    description:
      "An independent tester assesses the platform annually and findings are tracked to closure.",
    category: "vulnerability",
    frameworks: ["soc2", "iso27001", "pcidss"],
    ownerId: "ben-lewis",
    automation: "manual",
    status: "pass",
    evidenceStatus: "current",
    evidenceCount: 2,
    lastCheckedLabel: "May 20, 2026",
    lastCheckedValue: 202605201000,
    nextReviewLabel: "May 2027",
    riskScore: 24,
    openFindings: 0,
  },
  {
    id: "ctl-ir-01",
    code: "IR-01",
    title: "Incident response plan tested annually",
    description:
      "The IR plan is exercised at least annually with documented lessons learned.",
    category: "incident",
    frameworks: ["soc2", "iso27001", "hipaa", "nistcsf"],
    ownerId: "riya-sharma",
    automation: "manual",
    status: "pass",
    evidenceStatus: "current",
    evidenceCount: 3,
    lastCheckedLabel: "Apr 8, 2026",
    lastCheckedValue: 202604081000,
    nextReviewLabel: "Apr 2027",
    riskScore: 19,
    openFindings: 0,
  },
  {
    id: "ctl-ir-02",
    code: "IR-02",
    title: "Breach notification within statutory windows",
    description:
      "Runbooks define 72-hour GDPR and 60-day HIPAA notification paths with legal sign-off.",
    category: "incident",
    frameworks: ["gdpr", "hipaa"],
    ownerId: "nina-brooks",
    automation: "manual",
    status: "pass",
    evidenceStatus: "current",
    evidenceCount: 2,
    lastCheckedLabel: "Jun 12, 2026",
    lastCheckedValue: 202606121000,
    nextReviewLabel: "Dec 12, 2026",
    riskScore: 21,
    openFindings: 0,
  },
  {
    id: "ctl-ir-03",
    code: "IR-03",
    title: "Post-incident reviews completed",
    description:
      "Every P1 and P2 incident produces a review with corrective actions tracked to closure.",
    category: "incident",
    frameworks: ["soc2", "iso27001", "nistcsf"],
    ownerId: "harper-singh",
    automation: "hybrid",
    status: "attention",
    evidenceStatus: "expiring",
    evidenceCount: 4,
    lastCheckedLabel: "Jul 21, 2026",
    lastCheckedValue: 202607211500,
    nextReviewLabel: "Monthly",
    riskScore: 45,
    openFindings: 1,
  },
  {
    id: "ctl-vr-01",
    code: "VR-01",
    title: "Vendor security review before onboarding",
    description:
      "New suppliers with data access complete a security review and contractual security terms.",
    category: "vendor",
    frameworks: ["soc2", "iso27001", "gdpr"],
    ownerId: "dina-moss",
    automation: "manual",
    status: "attention",
    evidenceStatus: "expiring",
    evidenceCount: 3,
    lastCheckedLabel: "Jul 7, 2026",
    lastCheckedValue: 202607071000,
    nextReviewLabel: "Aug 20, 2026",
    riskScore: 52,
    openFindings: 1,
  },
  {
    id: "ctl-vr-02",
    code: "VR-02",
    title: "Subprocessor register published",
    description:
      "The public subprocessor list is accurate and customers receive 30 days notice of changes.",
    category: "vendor",
    frameworks: ["gdpr", "soc2"],
    ownerId: "jules-hart",
    automation: "manual",
    status: "pass",
    evidenceStatus: "current",
    evidenceCount: 1,
    lastCheckedLabel: "Jul 15, 2026",
    lastCheckedValue: 202607151000,
    nextReviewLabel: "Oct 15, 2026",
    riskScore: 16,
    openFindings: 0,
  },
  {
    id: "ctl-bc-01",
    code: "BC-01",
    title: "Backup restoration tested quarterly",
    description:
      "Restores are performed from production backups each quarter with results recorded.",
    category: "resilience",
    frameworks: ["soc2", "iso27001", "hipaa"],
    ownerId: "maya-rao",
    automation: "hybrid",
    status: "pass",
    evidenceStatus: "current",
    evidenceCount: 3,
    lastCheckedLabel: "Jul 1, 2026",
    lastCheckedValue: 202607011000,
    nextReviewLabel: "Oct 1, 2026",
    riskScore: 23,
    openFindings: 0,
  },
  {
    id: "ctl-bc-02",
    code: "BC-02",
    title: "RTO and RPO objectives documented",
    description:
      "Recovery objectives are agreed per service and validated against the last recovery test.",
    category: "resilience",
    frameworks: ["soc2", "iso27001", "nistcsf"],
    ownerId: "ethan-cole",
    automation: "manual",
    status: "pass",
    evidenceStatus: "current",
    evidenceCount: 1,
    lastCheckedLabel: "Jun 5, 2026",
    lastCheckedValue: 202606051000,
    nextReviewLabel: "Jun 2027",
    riskScore: 26,
    openFindings: 0,
  },
  {
    id: "ctl-bc-03",
    code: "BC-03",
    title: "Business continuity tabletop exercise",
    description:
      "Cross-functional continuity exercise covering a regional outage scenario.",
    category: "resilience",
    frameworks: ["iso27001", "nistcsf"],
    ownerId: "harper-singh",
    automation: "manual",
    status: "pending",
    evidenceStatus: "missing",
    evidenceCount: 0,
    lastCheckedLabel: "Not tested",
    lastCheckedValue: 0,
    nextReviewLabel: "Sep 24, 2026",
    riskScore: 38,
    openFindings: 0,
  },
  {
    id: "ctl-gv-01",
    code: "GV-01",
    title: "Security policies reviewed and approved annually",
    description:
      "The policy set is reviewed by leadership each year and republished to all staff.",
    category: "governance",
    frameworks: ["soc2", "iso27001", "hipaa", "nistcsf"],
    ownerId: "sofia-ahmed",
    automation: "manual",
    status: "pass",
    evidenceStatus: "current",
    evidenceCount: 5,
    lastCheckedLabel: "Feb 19, 2026",
    lastCheckedValue: 202602191000,
    nextReviewLabel: "Feb 2027",
    riskScore: 13,
    openFindings: 0,
  },
  {
    id: "ctl-gv-02",
    code: "GV-02",
    title: "Security awareness training completion",
    description:
      "All staff complete annual awareness training plus role-based modules for engineers.",
    category: "governance",
    frameworks: ["soc2", "iso27001", "pcidss", "hipaa"],
    ownerId: "dina-moss",
    automation: "hybrid",
    status: "attention",
    evidenceStatus: "current",
    evidenceCount: 2,
    lastCheckedLabel: "Jul 20, 2026",
    lastCheckedValue: 202607201000,
    nextReviewLabel: "Aug 31, 2026",
    riskScore: 42,
    openFindings: 1,
  },
  {
    id: "ctl-gv-03",
    code: "GV-03",
    title: "Annual enterprise risk assessment",
    description:
      "Risks are scored, treated, and accepted by named owners with a documented treatment plan.",
    category: "governance",
    frameworks: ["iso27001", "hipaa", "nistcsf"],
    ownerId: "sofia-ahmed",
    automation: "manual",
    status: "pass",
    evidenceStatus: "current",
    evidenceCount: 3,
    lastCheckedLabel: "Mar 3, 2026",
    lastCheckedValue: 202603031000,
    nextReviewLabel: "Mar 2027",
    riskScore: 25,
    openFindings: 0,
  },
  {
    id: "ctl-gv-04",
    code: "GV-04",
    title: "Board reporting on security posture",
    description:
      "Leadership receives a quarterly posture report covering risks, incidents, and compliance status.",
    category: "governance",
    frameworks: ["nistcsf", "iso27001"],
    ownerId: "riya-sharma",
    automation: "manual",
    status: "pass",
    evidenceStatus: "current",
    evidenceCount: 2,
    lastCheckedLabel: "Jul 10, 2026",
    lastCheckedValue: 202607101000,
    nextReviewLabel: "Oct 9, 2026",
    riskScore: 12,
    openFindings: 0,
  },
  {
    id: "ctl-ac-08",
    code: "AC-08",
    title: "Single sign-on enforced for sanctioned SaaS",
    description:
      "Approved SaaS applications authenticate through the identity provider using SAML or OIDC, with local logins disabled.",
    category: "access",
    frameworks: ["soc2", "iso27001", "cis8"],
    ownerId: "sofia-ahmed",
    automation: "hybrid",
    status: "attention",
    evidenceStatus: "current",
    evidenceCount: 3,
    lastCheckedLabel: "2 hours ago",
    lastCheckedValue: 202607242030,
    nextReviewLabel: "Monthly",
    riskScore: 40,
    openFindings: 0,
  },
  {
    id: "ctl-ac-09",
    code: "AC-09",
    title: "Session timeout and re-authentication",
    description:
      "Idle sessions expire within 15 minutes for privileged consoles and 30 minutes for standard access.",
    category: "access",
    frameworks: ["pcidss", "hipaa", "cis8"],
    ownerId: "chloe-park",
    automation: "automated",
    status: "pass",
    evidenceStatus: "current",
    evidenceCount: 2,
    lastCheckedLabel: "40 minutes ago",
    lastCheckedValue: 202607242205,
    nextReviewLabel: "Continuous",
    riskScore: 16,
    openFindings: 0,
  },
  {
    id: "ctl-ep-05",
    code: "EP-05",
    title: "Mobile device management enrollment",
    description:
      "Company-managed and BYOD mobile devices are enrolled in MDM with encryption and remote wipe enforced.",
    category: "endpoint",
    frameworks: ["iso27001", "hipaa", "cis8"],
    ownerId: "victor-hale",
    automation: "hybrid",
    status: "attention",
    evidenceStatus: "expiring",
    evidenceCount: 2,
    lastCheckedLabel: "Jul 17, 2026",
    lastCheckedValue: 202607171200,
    nextReviewLabel: "Aug 25, 2026",
    riskScore: 48,
    openFindings: 0,
  },
  {
    id: "ctl-ep-06",
    code: "EP-06",
    title: "Application allow-listing on servers",
    description:
      "Production servers only execute signed, approved binaries; unsigned execution is blocked and alerted.",
    category: "endpoint",
    frameworks: ["pcidss", "cis8"],
    ownerId: "ben-lewis",
    automation: "automated",
    status: "pending",
    evidenceStatus: "missing",
    evidenceCount: 0,
    lastCheckedLabel: "Not tested",
    lastCheckedValue: 0,
    nextReviewLabel: "Aug 18, 2026",
    riskScore: 44,
    openFindings: 0,
  },
  {
    id: "ctl-ns-03",
    code: "NS-03",
    title: "Intrusion detection on ingress and egress",
    description:
      "Network IDS/IPS sensors monitor north-south traffic with signatures updated at least daily.",
    category: "network",
    frameworks: ["pcidss", "iso27001", "cis8"],
    ownerId: "ava-reed",
    automation: "automated",
    status: "pass",
    evidenceStatus: "current",
    evidenceCount: 3,
    lastCheckedLabel: "15 minutes ago",
    lastCheckedValue: 202607242230,
    nextReviewLabel: "Continuous",
    riskScore: 22,
    openFindings: 0,
  },
  {
    id: "ctl-ns-04",
    code: "NS-04",
    title: "Wireless network segregation",
    description:
      "Guest wireless is isolated from corporate and CDE networks with separate egress and no lateral routes.",
    category: "network",
    frameworks: ["pcidss"],
    ownerId: "owen-lee",
    automation: "manual",
    status: "pass",
    evidenceStatus: "current",
    evidenceCount: 1,
    lastCheckedLabel: "Jun 28, 2026",
    lastCheckedValue: 202606281000,
    nextReviewLabel: "Dec 28, 2026",
    riskScore: 19,
    openFindings: 0,
  },
  {
    id: "ctl-dp-06",
    code: "DP-06",
    title: "Cardholder data tokenization",
    description:
      "Primary account numbers are tokenized at capture; raw PANs never persist in application databases.",
    category: "data",
    frameworks: ["pcidss"],
    ownerId: "kabir-sethi",
    automation: "automated",
    status: "attention",
    evidenceStatus: "current",
    evidenceCount: 2,
    lastCheckedLabel: "1 hour ago",
    lastCheckedValue: 202607242140,
    nextReviewLabel: "Continuous",
    riskScore: 55,
    openFindings: 1,
  },
  {
    id: "ctl-dp-07",
    code: "DP-07",
    title: "Data subject request fulfillment SLA",
    description:
      "Access, rectification, and erasure requests are fulfilled within the statutory 30-day window with an audit trail.",
    category: "data",
    frameworks: ["gdpr"],
    ownerId: "jules-hart",
    automation: "hybrid",
    status: "pass",
    evidenceStatus: "current",
    evidenceCount: 2,
    lastCheckedLabel: "Jul 16, 2026",
    lastCheckedValue: 202607161000,
    nextReviewLabel: "Monthly",
    riskScore: 28,
    openFindings: 0,
  },
  {
    id: "ctl-lm-05",
    code: "LM-05",
    title: "Detection use-case coverage vs MITRE ATT&CK",
    description:
      "Detection content maps to prioritized ATT&CK techniques; coverage gaps are tracked by detection engineering.",
    category: "logging",
    frameworks: ["soc2", "nistcsf", "cis8"],
    ownerId: "ava-reed",
    automation: "hybrid",
    status: "attention",
    evidenceStatus: "current",
    evidenceCount: 3,
    lastCheckedLabel: "28 minutes ago",
    lastCheckedValue: 202607242217,
    nextReviewLabel: "Continuous",
    riskScore: 47,
    openFindings: 0,
  },
  {
    id: "ctl-vm-04",
    code: "VM-04",
    title: "Secure configuration benchmark scanning",
    description:
      "Hosts are scanned against CIS Benchmarks weekly with drift routed to configuration owners.",
    category: "vulnerability",
    frameworks: ["cis8", "iso27001"],
    ownerId: "tia-west",
    automation: "automated",
    status: "attention",
    evidenceStatus: "current",
    evidenceCount: 2,
    lastCheckedLabel: "20 minutes ago",
    lastCheckedValue: 202607242225,
    nextReviewLabel: "Weekly",
    riskScore: 51,
    openFindings: 1,
  },
  {
    id: "ctl-ir-04",
    code: "IR-04",
    title: "Threat intelligence integrated into response",
    description:
      "Curated intelligence feeds enrich detections and inform response playbooks with reviewed relevance.",
    category: "incident",
    frameworks: ["soc2", "nistcsf"],
    ownerId: "maya-rao",
    automation: "hybrid",
    status: "pass",
    evidenceStatus: "current",
    evidenceCount: 2,
    lastCheckedLabel: "Jul 19, 2026",
    lastCheckedValue: 202607191000,
    nextReviewLabel: "Monthly",
    riskScore: 24,
    openFindings: 0,
  },
  {
    id: "ctl-vr-03",
    code: "VR-03",
    title: "Annual assurance report collection from vendors",
    description:
      "Critical subservice organizations provide a current SOC 2 report or equivalent, reviewed for exceptions.",
    category: "vendor",
    frameworks: ["soc2", "iso27001"],
    ownerId: "dina-moss",
    automation: "manual",
    status: "attention",
    evidenceStatus: "expiring",
    evidenceCount: 4,
    lastCheckedLabel: "Jul 5, 2026",
    lastCheckedValue: 202607051000,
    nextReviewLabel: "Aug 25, 2026",
    riskScore: 50,
    openFindings: 1,
  },
  {
    id: "ctl-bc-04",
    code: "BC-04",
    title: "Disaster recovery failover exercise",
    description:
      "A regional failover of critical services is exercised at least annually with recovery times recorded.",
    category: "resilience",
    frameworks: ["soc2", "iso27001", "nistcsf"],
    ownerId: "ethan-cole",
    automation: "manual",
    status: "attention",
    evidenceStatus: "expiring",
    evidenceCount: 2,
    lastCheckedLabel: "Feb 14, 2026",
    lastCheckedValue: 202602141000,
    nextReviewLabel: "Aug 14, 2026",
    riskScore: 46,
    openFindings: 0,
  },
  {
    id: "ctl-gv-05",
    code: "GV-05",
    title: "Change management approvals enforced",
    description:
      "Production changes require peer review and documented approval; emergency changes are reconciled within 48 hours.",
    category: "governance",
    frameworks: ["soc2", "pcidss", "iso27001"],
    ownerId: "ben-lewis",
    automation: "hybrid",
    status: "pass",
    evidenceStatus: "current",
    evidenceCount: 4,
    lastCheckedLabel: "35 minutes ago",
    lastCheckedValue: 202607242210,
    nextReviewLabel: "Continuous",
    riskScore: 21,
    openFindings: 0,
  },
];

/* -------------------------------------------------------------------------- */
/*                                  Evidence                                  */
/* -------------------------------------------------------------------------- */

export const evidenceStatusLabels: Record<EvidenceStatus, string> = {
  current: "Current",
  expiring: "Expiring",
  expired: "Expired",
  missing: "Missing",
};

export const complianceEvidence: ComplianceEvidence[] = [
  {
    id: "ev-01",
    name: "MFA enforcement policy export",
    kind: "Config export",
    controlCode: "AC-01",
    frameworks: ["soc2", "iso27001", "pcidss"],
    ownerId: "sofia-ahmed",
    status: "current",
    collectedLabel: "Collected today",
    expiresLabel: "Refreshes daily",
    daysToExpiry: 1,
    automated: true,
  },
  {
    id: "ev-02",
    name: "Privileged role approval log (Q3)",
    kind: "Ticket export",
    controlCode: "AC-02",
    frameworks: ["soc2", "pcidss"],
    ownerId: "riya-sharma",
    status: "expiring",
    collectedLabel: "Jun 30, 2026",
    expiresLabel: "Aug 1, 2026",
    daysToExpiry: 8,
    automated: false,
  },
  {
    id: "ev-03",
    name: "Q2 access recertification sign-off",
    kind: "Attestation",
    controlCode: "AC-03",
    frameworks: ["soc2", "iso27001", "hipaa"],
    ownerId: "dina-moss",
    status: "current",
    collectedLabel: "Jul 2, 2026",
    expiresLabel: "Oct 1, 2026",
    daysToExpiry: 69,
    automated: false,
  },
  {
    id: "ev-04",
    name: "Secrets rotation report",
    kind: "Report",
    controlCode: "AC-05",
    frameworks: ["soc2", "pcidss"],
    ownerId: "owen-lee",
    status: "expired",
    collectedLabel: "Apr 12, 2026",
    expiresLabel: "Jul 11, 2026",
    daysToExpiry: -13,
    automated: true,
  },
  {
    id: "ev-05",
    name: "Sensor deployment inventory",
    kind: "Config export",
    controlCode: "EP-01",
    frameworks: ["soc2", "iso27001", "cis8"],
    ownerId: "victor-hale",
    status: "current",
    collectedLabel: "Collected today",
    expiresLabel: "Refreshes hourly",
    daysToExpiry: 1,
    automated: true,
  },
  {
    id: "ev-06",
    name: "Network segmentation test results",
    kind: "Report",
    controlCode: "NS-01",
    frameworks: ["pcidss"],
    ownerId: "kabir-sethi",
    status: "expired",
    collectedLabel: "Jan 22, 2026",
    expiresLabel: "Jul 21, 2026",
    daysToExpiry: -3,
    automated: false,
  },
  {
    id: "ev-07",
    name: "Firewall ruleset review minutes",
    kind: "Policy",
    controlCode: "NS-02",
    frameworks: ["pcidss", "iso27001"],
    ownerId: "owen-lee",
    status: "expiring",
    collectedLabel: "Jun 24, 2026",
    expiresLabel: "Aug 22, 2026",
    daysToExpiry: 29,
    automated: false,
  },
  {
    id: "ev-08",
    name: "Key management configuration",
    kind: "Config export",
    controlCode: "DP-02",
    frameworks: ["soc2", "pcidss", "hipaa"],
    ownerId: "maya-rao",
    status: "current",
    collectedLabel: "Collected today",
    expiresLabel: "Refreshes daily",
    daysToExpiry: 1,
    automated: true,
  },
  {
    id: "ev-09",
    name: "Data retention schedule v4",
    kind: "Policy",
    controlCode: "DP-03",
    frameworks: ["gdpr", "hipaa"],
    ownerId: "nina-brooks",
    status: "expiring",
    collectedLabel: "Jun 30, 2026",
    expiresLabel: "Aug 30, 2026",
    daysToExpiry: 37,
    automated: false,
  },
  {
    id: "ev-10",
    name: "DLP policy coverage screenshot",
    kind: "Screenshot",
    controlCode: "DP-04",
    frameworks: ["hipaa", "pcidss"],
    ownerId: "leo-park",
    status: "missing",
    collectedLabel: "Never collected",
    expiresLabel: "Due Aug 8, 2026",
    daysToExpiry: 15,
    automated: false,
  },
  {
    id: "ev-11",
    name: "SIEM retention configuration",
    kind: "Config export",
    controlCode: "LM-01",
    frameworks: ["soc2", "pcidss", "hipaa"],
    ownerId: "ava-reed",
    status: "current",
    collectedLabel: "Collected today",
    expiresLabel: "Refreshes daily",
    daysToExpiry: 1,
    automated: true,
  },
  {
    id: "ev-12",
    name: "Alert SLA performance report",
    kind: "Report",
    controlCode: "LM-02",
    frameworks: ["soc2", "iso27001"],
    ownerId: "ava-reed",
    status: "current",
    collectedLabel: "Jul 21, 2026",
    expiresLabel: "Aug 21, 2026",
    daysToExpiry: 28,
    automated: true,
  },
  {
    id: "ev-13",
    name: "Patch SLA exception register",
    kind: "Ticket export",
    controlCode: "VM-02",
    frameworks: ["soc2", "pcidss"],
    ownerId: "tia-west",
    status: "expiring",
    collectedLabel: "Jul 12, 2026",
    expiresLabel: "Aug 11, 2026",
    daysToExpiry: 18,
    automated: true,
  },
  {
    id: "ev-14",
    name: "Penetration test report 2026",
    kind: "Report",
    controlCode: "VM-03",
    frameworks: ["soc2", "iso27001", "pcidss"],
    ownerId: "ben-lewis",
    status: "current",
    collectedLabel: "May 20, 2026",
    expiresLabel: "May 20, 2027",
    daysToExpiry: 300,
    automated: false,
  },
  {
    id: "ev-15",
    name: "IR tabletop after-action report",
    kind: "Report",
    controlCode: "IR-01",
    frameworks: ["soc2", "iso27001", "hipaa"],
    ownerId: "riya-sharma",
    status: "current",
    collectedLabel: "Apr 8, 2026",
    expiresLabel: "Apr 8, 2027",
    daysToExpiry: 258,
    automated: false,
  },
  {
    id: "ev-16",
    name: "Vendor review packet · Northwind",
    kind: "Attestation",
    controlCode: "VR-01",
    frameworks: ["soc2", "gdpr"],
    ownerId: "dina-moss",
    status: "expiring",
    collectedLabel: "Jul 7, 2026",
    expiresLabel: "Aug 20, 2026",
    daysToExpiry: 27,
    automated: false,
  },
  {
    id: "ev-17",
    name: "Backup restore test log",
    kind: "Report",
    controlCode: "BC-01",
    frameworks: ["soc2", "iso27001"],
    ownerId: "maya-rao",
    status: "current",
    collectedLabel: "Jul 1, 2026",
    expiresLabel: "Oct 1, 2026",
    daysToExpiry: 69,
    automated: false,
  },
  {
    id: "ev-18",
    name: "Awareness training completion export",
    kind: "Report",
    controlCode: "GV-02",
    frameworks: ["soc2", "pcidss", "hipaa"],
    ownerId: "dina-moss",
    status: "current",
    collectedLabel: "Jul 20, 2026",
    expiresLabel: "Aug 31, 2026",
    daysToExpiry: 38,
    automated: true,
  },
  {
    id: "ev-19",
    name: "Continuity exercise plan",
    kind: "Policy",
    controlCode: "BC-03",
    frameworks: ["iso27001"],
    ownerId: "harper-singh",
    status: "missing",
    collectedLabel: "Never collected",
    expiresLabel: "Due Sep 24, 2026",
    daysToExpiry: 62,
    automated: false,
  },
  {
    id: "ev-20",
    name: "Article 30 processing register",
    kind: "Policy",
    controlCode: "DP-05",
    frameworks: ["gdpr"],
    ownerId: "nina-brooks",
    status: "current",
    collectedLabel: "Jul 14, 2026",
    expiresLabel: "Oct 14, 2026",
    daysToExpiry: 82,
    automated: false,
  },
  {
    id: "ev-21",
    name: "SSO connection inventory",
    kind: "Config export",
    controlCode: "AC-08",
    frameworks: ["soc2", "iso27001"],
    ownerId: "sofia-ahmed",
    status: "current",
    collectedLabel: "Collected today",
    expiresLabel: "Refreshes daily",
    daysToExpiry: 1,
    automated: true,
  },
  {
    id: "ev-22",
    name: "MDM compliance posture report",
    kind: "Report",
    controlCode: "EP-05",
    frameworks: ["iso27001", "hipaa"],
    ownerId: "victor-hale",
    status: "expiring",
    collectedLabel: "Jul 17, 2026",
    expiresLabel: "Aug 25, 2026",
    daysToExpiry: 32,
    automated: true,
  },
  {
    id: "ev-23",
    name: "IDS signature update log",
    kind: "Config export",
    controlCode: "NS-03",
    frameworks: ["pcidss", "iso27001"],
    ownerId: "ava-reed",
    status: "current",
    collectedLabel: "Collected today",
    expiresLabel: "Refreshes daily",
    daysToExpiry: 1,
    automated: true,
  },
  {
    id: "ev-24",
    name: "Tokenization architecture diagram",
    kind: "Policy",
    controlCode: "DP-06",
    frameworks: ["pcidss"],
    ownerId: "kabir-sethi",
    status: "current",
    collectedLabel: "May 30, 2026",
    expiresLabel: "May 30, 2027",
    daysToExpiry: 310,
    automated: false,
  },
  {
    id: "ev-25",
    name: "DSAR fulfillment log (H1)",
    kind: "Ticket export",
    controlCode: "DP-07",
    frameworks: ["gdpr"],
    ownerId: "jules-hart",
    status: "current",
    collectedLabel: "Jul 16, 2026",
    expiresLabel: "Aug 16, 2026",
    daysToExpiry: 23,
    automated: true,
  },
  {
    id: "ev-26",
    name: "ATT&CK coverage heatmap export",
    kind: "Report",
    controlCode: "LM-05",
    frameworks: ["soc2", "nistcsf"],
    ownerId: "ava-reed",
    status: "current",
    collectedLabel: "Jul 21, 2026",
    expiresLabel: "Aug 21, 2026",
    daysToExpiry: 28,
    automated: true,
  },
  {
    id: "ev-27",
    name: "CIS Benchmark scan results",
    kind: "Report",
    controlCode: "VM-04",
    frameworks: ["cis8", "iso27001"],
    ownerId: "tia-west",
    status: "current",
    collectedLabel: "Collected today",
    expiresLabel: "Refreshes weekly",
    daysToExpiry: 7,
    automated: true,
  },
  {
    id: "ev-28",
    name: "Subservice SOC 2 report · CloudEdge",
    kind: "Attestation",
    controlCode: "VR-03",
    frameworks: ["soc2"],
    ownerId: "dina-moss",
    status: "expiring",
    collectedLabel: "Sep 1, 2025",
    expiresLabel: "Aug 25, 2026",
    daysToExpiry: 32,
    automated: false,
  },
  {
    id: "ev-29",
    name: "Subservice SOC 2 report · Northwind Pay",
    kind: "Attestation",
    controlCode: "VR-03",
    frameworks: ["soc2"],
    ownerId: "dina-moss",
    status: "expired",
    collectedLabel: "Mar 30, 2025",
    expiresLabel: "Jun 30, 2026",
    daysToExpiry: -24,
    automated: false,
  },
  {
    id: "ev-30",
    name: "DR failover exercise report 2026",
    kind: "Report",
    controlCode: "BC-04",
    frameworks: ["soc2", "iso27001"],
    ownerId: "ethan-cole",
    status: "expiring",
    collectedLabel: "Feb 14, 2026",
    expiresLabel: "Aug 14, 2026",
    daysToExpiry: 21,
    automated: false,
  },
  {
    id: "ev-31",
    name: "Change approval sample (July)",
    kind: "Ticket export",
    controlCode: "GV-05",
    frameworks: ["soc2", "pcidss"],
    ownerId: "ben-lewis",
    status: "current",
    collectedLabel: "Collected today",
    expiresLabel: "Refreshes daily",
    daysToExpiry: 1,
    automated: true,
  },
];

/** CCM collectors — continuous evidence refresh against connected tools. */
export const complianceCollectors: ComplianceCollector[] = [
  {
    id: "ccm-okta-mfa",
    name: "Okta MFA coverage",
    description: "Pulls MFA enrollment and privileged MFA posture for access controls.",
    controlId: "AC-01",
    controlCodes: ["AC-01", "AC-02", "AC-05"],
    sourceId: "int-okta-workforce",
    schedule: "Every 6 hours",
    status: "healthy",
    lastRunLabel: "2 hours ago",
    lastRunAt: null,
    automatedEvidenceIds: ["ev-01", "ev-02", "ev-04"],
  },
  {
    id: "ccm-edr-agents",
    name: "EDR agent fleet",
    description: "Defender / Falcon agent coverage for endpoint controls.",
    controlId: "EP-01",
    controlCodes: ["EP-01", "EP-02", "EP-03"],
    sourceId: "int-defender-endpoint",
    schedule: "Hourly",
    status: "healthy",
    lastRunLabel: "38 minutes ago",
    lastRunAt: null,
    automatedEvidenceIds: ["ev-05"],
  },
  {
    id: "ccm-siem-logging",
    name: "SIEM logging coverage",
    description: "Splunk / Sentinel logging and detection coverage for LM controls.",
    controlId: "LM-01",
    controlCodes: ["LM-01", "LM-02", "LM-03"],
    sourceId: "int-splunk-core",
    schedule: "Daily 06:00 UTC",
    status: "healthy",
    lastRunLabel: "Today 06:12",
    lastRunAt: null,
    automatedEvidenceIds: ["ev-11", "ev-12"],
  },
  {
    id: "ccm-cloud-config",
    name: "Cloud config posture",
    description: "AWS configuration exports for data protection controls.",
    controlId: "DP-02",
    controlCodes: ["DP-02", "DP-03", "DP-04"],
    sourceId: "int-aws-prod",
    schedule: "Every 12 hours",
    status: "degraded",
    lastRunLabel: "Yesterday",
    lastRunAt: null,
    automatedEvidenceIds: ["ev-08", "ev-09", "ev-10"],
  },
  {
    id: "ccm-vuln-sla",
    name: "Vulnerability SLA scanner",
    description: "Snyk / vuln inventory against remediation SLA controls.",
    controlId: "VM-01",
    controlCodes: ["VM-01", "VM-02", "VM-04"],
    sourceId: "int-snyk",
    schedule: "Daily",
    status: "idle",
    lastRunLabel: "3 days ago",
    lastRunAt: null,
    automatedEvidenceIds: ["ev-27"],
  },
  {
    id: "ccm-change-tickets",
    name: "Change ticket sampler",
    description: "Jira change approvals sampled for governance controls.",
    controlId: "GV-05",
    controlCodes: ["GV-05"],
    sourceId: "int-jira-secops",
    schedule: "Weekly",
    status: "healthy",
    lastRunLabel: "Mon 09:00",
    lastRunAt: null,
    automatedEvidenceIds: ["ev-31"],
  },
];

/* -------------------------------------------------------------------------- */
/*                                  Findings                                  */
/* -------------------------------------------------------------------------- */

export const findingSeverityLabels: Record<FindingSeverity, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

export const findingStatusLabels: Record<FindingStatus, string> = {
  open: "Open",
  "in-progress": "In progress",
  "awaiting-review": "Awaiting review",
  remediated: "Remediated",
  accepted: "Risk accepted",
};

export const complianceFindings: ComplianceFinding[] = [
  {
    id: "fnd-01",
    title: "CDE segmentation test evidence is stale",
    detail:
      "The last validated segmentation test predates the June network changes, so the QSA cannot rely on it.",
    severity: "critical",
    status: "in-progress",
    frameworks: ["pcidss"],
    controlCode: "NS-01",
    ownerId: "kabir-sethi",
    source: "External auditor",
    ageDays: 12,
    dueLabel: "Aug 3, 2026",
    overdue: false,
  },
  {
    id: "fnd-02",
    title: "Privileged accounts without phishing-resistant MFA",
    detail:
      "Several privileged identities still rely on push notifications rather than hardware-backed factors.",
    severity: "critical",
    status: "open",
    frameworks: ["soc2", "iso27001", "pcidss"],
    controlCode: "AC-02",
    ownerId: "riya-sharma",
    source: "Continuous monitoring",
    ageDays: 6,
    dueLabel: "Jul 31, 2026",
    overdue: false,
  },
  {
    id: "fnd-03",
    title: "Critical patches exceeding the 14-day SLA",
    detail:
      "A cluster of endpoints and one server carry critical CVEs beyond the remediation window.",
    severity: "high",
    status: "in-progress",
    frameworks: ["soc2", "pcidss", "hipaa"],
    controlCode: "VM-02",
    ownerId: "tia-west",
    source: "Continuous monitoring",
    ageDays: 19,
    dueLabel: "Jul 22, 2026",
    overdue: true,
  },
  {
    id: "fnd-04",
    title: "Service account secrets past rotation policy",
    detail:
      "Automation credentials in the integration tier have not rotated within the 90-day policy.",
    severity: "high",
    status: "open",
    frameworks: ["soc2", "pcidss"],
    controlCode: "AC-05",
    ownerId: "owen-lee",
    source: "Continuous monitoring",
    ageDays: 24,
    dueLabel: "Jul 18, 2026",
    overdue: true,
  },
  {
    id: "fnd-05",
    title: "DLP not enforced on cloud storage egress",
    detail:
      "Policy exists on email only. Cloud storage and endpoint channels remain uninspected.",
    severity: "high",
    status: "open",
    frameworks: ["hipaa", "gdpr"],
    controlCode: "DP-04",
    ownerId: "leo-park",
    source: "Internal audit",
    ageDays: 15,
    dueLabel: "Aug 8, 2026",
    overdue: false,
  },
  {
    id: "fnd-06",
    title: "Unmanaged endpoints missing the EDR sensor",
    detail:
      "Field devices enrolled outside the standard build are not reporting sensor telemetry.",
    severity: "medium",
    status: "in-progress",
    frameworks: ["soc2", "iso27001", "cis8"],
    controlCode: "EP-01",
    ownerId: "victor-hale",
    source: "Continuous monitoring",
    ageDays: 9,
    dueLabel: "Aug 6, 2026",
    overdue: false,
  },
  {
    id: "fnd-07",
    title: "Offline assets not forwarding telemetry",
    detail:
      "Assets that have been offline beyond 7 days create gaps in the audit log completeness assertion.",
    severity: "medium",
    status: "awaiting-review",
    frameworks: ["soc2", "pcidss"],
    controlCode: "LM-01",
    ownerId: "ava-reed",
    source: "Internal audit",
    ageDays: 4,
    dueLabel: "Aug 12, 2026",
    overdue: false,
  },
  {
    id: "fnd-08",
    title: "Stale accounts beyond the 30-day disable window",
    detail:
      "Leaver automation missed a batch of accounts during the June directory migration.",
    severity: "medium",
    status: "in-progress",
    frameworks: ["soc2", "iso27001"],
    controlCode: "AC-04",
    ownerId: "chloe-park",
    source: "Continuous monitoring",
    ageDays: 11,
    dueLabel: "Aug 4, 2026",
    overdue: false,
  },
  {
    id: "fnd-09",
    title: "Retention schedule missing two new data classes",
    detail:
      "Telemetry archive and model training corpus are absent from the published schedule.",
    severity: "medium",
    status: "open",
    frameworks: ["gdpr", "hipaa"],
    controlCode: "DP-03",
    ownerId: "nina-brooks",
    source: "Internal audit",
    ageDays: 21,
    dueLabel: "Aug 30, 2026",
    overdue: false,
  },
  {
    id: "fnd-10",
    title: "Awareness training completion below 95% target",
    detail:
      "Contractor cohort onboarding in July has not yet completed the annual module.",
    severity: "low",
    status: "in-progress",
    frameworks: ["soc2", "pcidss"],
    controlCode: "GV-02",
    ownerId: "dina-moss",
    source: "Continuous monitoring",
    ageDays: 7,
    dueLabel: "Aug 31, 2026",
    overdue: false,
  },
  {
    id: "fnd-11",
    title: "Post-incident reviews outstanding for two P2 events",
    detail:
      "Reviews for the June phishing wave and the storage outage are past the 10-day target.",
    severity: "low",
    status: "awaiting-review",
    frameworks: ["soc2", "iso27001"],
    controlCode: "IR-03",
    ownerId: "harper-singh",
    source: "Internal audit",
    ageDays: 16,
    dueLabel: "Jul 28, 2026",
    overdue: false,
  },
  {
    id: "fnd-12",
    title: "Vendor review packet outstanding for Northwind",
    detail:
      "Security questionnaire returned but the SOC 2 report has not been reviewed by GRC.",
    severity: "low",
    status: "remediated",
    frameworks: ["soc2", "gdpr"],
    controlCode: "VR-01",
    ownerId: "dina-moss",
    source: "Internal audit",
    ageDays: 30,
    dueLabel: "Closed Jul 19, 2026",
    overdue: false,
  },
  {
    id: "fnd-13",
    title: "Subservice SOC 2 report expired for Northwind Pay",
    detail:
      "The payment subprocessor's assurance report lapsed in June; a bridge letter has been requested.",
    severity: "high",
    status: "in-progress",
    frameworks: ["soc2"],
    controlCode: "VR-03",
    ownerId: "dina-moss",
    source: "External auditor",
    ageDays: 14,
    dueLabel: "Aug 25, 2026",
    overdue: false,
  },
  {
    id: "fnd-14",
    title: "Tokenization gap on legacy refund endpoint",
    detail:
      "A deprecated refund API path can still receive raw PANs before tokenization is applied.",
    severity: "high",
    status: "open",
    frameworks: ["pcidss"],
    controlCode: "DP-06",
    ownerId: "kabir-sethi",
    source: "External auditor",
    ageDays: 8,
    dueLabel: "Aug 2, 2026",
    overdue: false,
  },
  {
    id: "fnd-15",
    title: "Server application allow-listing not deployed",
    detail:
      "Allow-listing is scoped but not yet enforced on the production server fleet.",
    severity: "medium",
    status: "open",
    frameworks: ["pcidss", "cis8"],
    controlCode: "EP-06",
    ownerId: "ben-lewis",
    source: "Internal audit",
    ageDays: 13,
    dueLabel: "Aug 18, 2026",
    overdue: false,
  },
  {
    id: "fnd-16",
    title: "ATT&CK coverage below target for lateral movement",
    detail:
      "Detection coverage for lateral movement techniques sits at 61% against a 75% target.",
    severity: "medium",
    status: "in-progress",
    frameworks: ["soc2", "nistcsf"],
    controlCode: "LM-05",
    ownerId: "ava-reed",
    source: "Continuous monitoring",
    ageDays: 5,
    dueLabel: "Sep 5, 2026",
    overdue: false,
  },
  {
    id: "fnd-17",
    title: "CIS Benchmark drift on database tier",
    detail:
      "Three database hosts drifted from the hardened baseline after an unmanaged package update.",
    severity: "medium",
    status: "in-progress",
    frameworks: ["cis8", "iso27001"],
    controlCode: "VM-04",
    ownerId: "tia-west",
    source: "Continuous monitoring",
    ageDays: 3,
    dueLabel: "Aug 7, 2026",
    overdue: false,
  },
  {
    id: "fnd-18",
    title: "MDM enrollment incomplete for contractor laptops",
    detail:
      "A batch of contractor devices provisioned in July has not completed MDM enrollment.",
    severity: "low",
    status: "open",
    frameworks: ["iso27001", "hipaa"],
    controlCode: "EP-05",
    ownerId: "victor-hale",
    source: "Continuous monitoring",
    ageDays: 6,
    dueLabel: "Aug 25, 2026",
    overdue: false,
  },
];

/* -------------------------------------------------------------------------- */
/*                             Audit engagements                              */
/* -------------------------------------------------------------------------- */

export const auditPhaseOrder: AuditPhase[] = [
  "scoping",
  "readiness",
  "fieldwork",
  "remediation",
  "report",
];

export const auditPhaseLabels: Record<AuditPhase, string> = {
  scoping: "Scoping",
  readiness: "Readiness",
  fieldwork: "Fieldwork",
  remediation: "Remediation",
  report: "Report",
};

export const auditEngagements: AuditEngagement[] = [
  {
    id: "aud-01",
    name: "SOC 2 Type II · FY26 observation window",
    frameworkId: "soc2",
    type: "Type II attestation",
    auditor: "Prescott & Vane LLP",
    leadId: "riya-sharma",
    phase: "fieldwork",
    phaseProgress: 62,
    windowLabel: "Apr 1 – Sep 30, 2026",
    reportDueLabel: "Report due Nov 14, 2026",
    daysRemaining: 113,
    requestsTotal: 84,
    requestsOpen: 17,
    openFindings: 3,
    active: true,
  },
  {
    id: "aud-02",
    name: "PCI DSS 4.0.1 · Report on Compliance",
    frameworkId: "pcidss",
    type: "QSA assessment",
    auditor: "Helix QSA Partners",
    leadId: "kabir-sethi",
    phase: "remediation",
    phaseProgress: 40,
    windowLabel: "Jun 15 – Sep 26, 2026",
    reportDueLabel: "ROC due Oct 10, 2026",
    daysRemaining: 78,
    requestsTotal: 62,
    requestsOpen: 24,
    openFindings: 4,
    active: true,
  },
  {
    id: "aud-03",
    name: "ISO/IEC 27001 · Surveillance audit 2",
    frameworkId: "iso27001",
    type: "Surveillance",
    auditor: "Northgate Certification",
    leadId: "sofia-ahmed",
    phase: "readiness",
    phaseProgress: 55,
    windowLabel: "Oct 6 – Oct 9, 2026",
    reportDueLabel: "Certificate maintained to Oct 2027",
    daysRemaining: 74,
    requestsTotal: 38,
    requestsOpen: 12,
    openFindings: 1,
    active: true,
  },
  {
    id: "aud-04",
    name: "HIPAA Security Rule · annual risk analysis",
    frameworkId: "hipaa",
    type: "Internal assessment",
    auditor: "Internal · GRC team",
    leadId: "dina-moss",
    phase: "scoping",
    phaseProgress: 30,
    windowLabel: "Sep 18 – Oct 30, 2026",
    reportDueLabel: "Analysis due Dec 1, 2026",
    daysRemaining: 130,
    requestsTotal: 26,
    requestsOpen: 26,
    openFindings: 0,
    active: true,
  },
  {
    id: "aud-05",
    name: "SOC 2 Type I · initial attestation",
    frameworkId: "soc2",
    type: "Type I attestation",
    auditor: "Prescott & Vane LLP",
    leadId: "riya-sharma",
    phase: "report",
    phaseProgress: 100,
    windowLabel: "Sep 1 – Nov 3, 2025",
    reportDueLabel: "Report issued Nov 21, 2025",
    daysRemaining: 0,
    requestsTotal: 71,
    requestsOpen: 0,
    openFindings: 0,
    active: false,
  },
  {
    id: "aud-06",
    name: "NIST CSF 2.0 · maturity baseline v1",
    frameworkId: "nistcsf",
    type: "Internal assessment",
    auditor: "Internal · Security engineering",
    leadId: "ben-lewis",
    phase: "report",
    phaseProgress: 100,
    windowLabel: "Jan 12 – Feb 27, 2026",
    reportDueLabel: "Baseline published Feb 27, 2026",
    daysRemaining: 0,
    requestsTotal: 44,
    requestsOpen: 0,
    openFindings: 0,
    active: false,
  },
  {
    id: "aud-07",
    name: "GDPR · Article 30 & DPIA review",
    frameworkId: "gdpr",
    type: "Internal assessment",
    auditor: "Internal · Legal & GRC",
    leadId: "nina-brooks",
    phase: "fieldwork",
    phaseProgress: 48,
    windowLabel: "Jul 1 – Aug 29, 2026",
    reportDueLabel: "Memo due Sep 5, 2026",
    daysRemaining: 43,
    requestsTotal: 31,
    requestsOpen: 9,
    openFindings: 2,
    active: true,
  },
  {
    id: "aud-08",
    name: "CIS v8 IG2 · Q3 safeguard scoring",
    frameworkId: "cis8",
    type: "Internal assessment",
    auditor: "Internal · Detection engineering",
    leadId: "victor-hale",
    phase: "readiness",
    phaseProgress: 35,
    windowLabel: "Aug 1 – Sep 30, 2026",
    reportDueLabel: "Scorecard due Oct 3, 2026",
    daysRemaining: 71,
    requestsTotal: 28,
    requestsOpen: 20,
    openFindings: 2,
    active: true,
  },
];

/* -------------------------------------------------------------------------- */
/*                              Activity timeline                             */
/* -------------------------------------------------------------------------- */

export const complianceTimeline: ComplianceEvent[] = [
  {
    id: "evt-01",
    actor: "Continuous monitoring",
    action: "flagged AC-02 as failing",
    detail: "Privileged MFA coverage dropped below the 100% threshold.",
    timeLabel: "12 minutes ago",
    tone: "negative",
  },
  {
    id: "evt-02",
    actor: "Sofia Ahmed",
    action: "uploaded evidence for AC-01",
    detail: "MFA enforcement policy export attached to the SOC 2 request list.",
    timeLabel: "1 hour ago",
    tone: "positive",
  },
  {
    id: "evt-03",
    actor: "Prescott & Vane LLP",
    action: "opened 4 new PBC requests",
    detail: "Fieldwork sampling for change management and access reviews.",
    timeLabel: "3 hours ago",
    tone: "neutral",
  },
  {
    id: "evt-04",
    actor: "Owen Lee",
    action: "marked NS-02 evidence as expiring",
    detail: "Firewall review minutes lapse on Aug 22 without a new session.",
    timeLabel: "5 hours ago",
    tone: "warning",
  },
  {
    id: "evt-05",
    actor: "Tia West",
    action: "linked finding FND-03 to VM-02",
    detail: "Patch SLA breach traced to the unmanaged field device cohort.",
    timeLabel: "Yesterday",
    tone: "warning",
  },
  {
    id: "evt-06",
    actor: "Dina Moss",
    action: "closed the Northwind vendor review",
    detail: "SOC 2 report reviewed and security terms countersigned.",
    timeLabel: "Yesterday",
    tone: "positive",
  },
  {
    id: "evt-07",
    actor: "Helix QSA Partners",
    action: "requested a segmentation retest",
    detail: "Retest scheduled for Aug 3 ahead of ROC fieldwork close.",
    timeLabel: "2 days ago",
    tone: "warning",
  },
  {
    id: "evt-08",
    actor: "Riya Sharma",
    action: "approved the Q2 access recertification",
    detail: "All 14 resource owners returned sign-off within the window.",
    timeLabel: "3 days ago",
    tone: "positive",
  },
  {
    id: "evt-09",
    actor: "Continuous monitoring",
    action: "opened FND-14 against DP-06",
    detail:
      "A legacy refund endpoint was observed accepting raw PANs pre-tokenization.",
    timeLabel: "8 hours ago",
    tone: "negative",
  },
  {
    id: "evt-10",
    actor: "Ava Reed",
    action: "refreshed ATT&CK coverage mapping",
    detail:
      "Lateral movement coverage rose to 61% after two new detections shipped.",
    timeLabel: "Yesterday",
    tone: "positive",
  },
  {
    id: "evt-11",
    actor: "Dina Moss",
    action: "requested a bridge letter from Northwind Pay",
    detail:
      "Subservice SOC 2 report lapsed in June; bridge letter due before ROC close.",
    timeLabel: "2 days ago",
    tone: "warning",
  },
  {
    id: "evt-12",
    actor: "Tia West",
    action: "detected CIS benchmark drift on the database tier",
    detail:
      "Three hosts drifted after an unmanaged package update; remediation opened.",
    timeLabel: "2 days ago",
    tone: "warning",
  },
  {
    id: "evt-13",
    actor: "Northgate Certification",
    action: "confirmed the ISO surveillance schedule",
    detail:
      "Surveillance audit 2 locked for Oct 6–9 with the sampling plan shared.",
    timeLabel: "4 days ago",
    tone: "neutral",
  },
  {
    id: "evt-14",
    actor: "Ben Lewis",
    action: "closed the change-management sampling request",
    detail:
      "July change sample returned complete approvals for every production change.",
    timeLabel: "5 days ago",
    tone: "positive",
  },
];

/* -------------------------------------------------------------------------- */
/*                                   Charts                                   */
/* -------------------------------------------------------------------------- */

export const complianceScoreTarget = 85;

const scoreTrendMonths = [
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
];

/** Deltas against today's score, so the trend always lands on the live value. */
const scoreTrendOffsets = [-17, -15, -12, -13, -10, -8, -9, -6, -4, -5, -2, 0];

export const complianceScoreTrend = scoreTrendMonths.map((month, index) => ({
  month,
  score: getOverallScore() + scoreTrendOffsets[index],
  target: complianceScoreTarget,
}));

export const evidenceFreshnessTrend = [
  { month: "Feb", collected: 42, expired: 11 },
  { month: "Mar", collected: 48, expired: 9 },
  { month: "Apr", collected: 51, expired: 12 },
  { month: "May", collected: 57, expired: 7 },
  { month: "Jun", collected: 61, expired: 8 },
  { month: "Jul", collected: 66, expired: 4 },
];

/* -------------------------------------------------------------------------- */
/*                            Derived helpers                                 */
/* -------------------------------------------------------------------------- */

export const complianceUsers = administrationUsers;

export const userById = new Map(
  administrationUsers.map((user) => [user.id, user]),
);

export function getUser(id: string) {
  return userById.get(id);
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function getFrameworkControls(
  frameworkId: FrameworkId,
  controls: ComplianceControl[] = complianceControls,
) {
  return controls.filter((control) => control.frameworks.includes(frameworkId));
}

export type FrameworkRollup = {
  total: number;
  passing: number;
  attention: number;
  failing: number;
  pending: number;
  /** Passing share of testable controls, rounded. */
  readiness: number;
  openFindings: number;
  evidenceGaps: number;
};

export function getFrameworkRollup(
  frameworkId: FrameworkId,
  controls: ComplianceControl[] = complianceControls,
): FrameworkRollup {
  const scoped = getFrameworkControls(frameworkId, controls);
  const testable = scoped.filter(
    (control) => control.status !== "not-applicable",
  );
  const passing = testable.filter((c) => c.status === "pass").length;
  const attention = testable.filter((c) => c.status === "attention").length;
  const failing = testable.filter((c) => c.status === "fail").length;
  const pending = testable.filter((c) => c.status === "pending").length;

  return {
    total: testable.length,
    passing,
    attention,
    failing,
    pending,
    readiness:
      testable.length === 0
        ? 0
        : Math.round(((passing + attention * 0.5) / testable.length) * 100),
    openFindings: scoped.reduce(
      (sum, control) => sum + control.openFindings,
      0,
    ),
    evidenceGaps: scoped.filter(
      (control) =>
        control.evidenceStatus === "expired" ||
        control.evidenceStatus === "missing",
    ).length,
  };
}

/** Domains shown as columns in the coverage matrix, in report order. */
export const matrixDomains: ControlCategory[] = [
  "access",
  "endpoint",
  "network",
  "data",
  "logging",
  "vulnerability",
  "incident",
  "vendor",
  "resilience",
  "governance",
];

export type DomainCell = {
  domain: ControlCategory;
  applicable: number;
  /** null when the framework does not map any control to this domain. */
  readiness: number | null;
  worst: ControlStatus | null;
};

export type FrameworkDomainRow = {
  framework: ComplianceFramework;
  cells: DomainCell[];
  readiness: number;
};

/**
 * Framework (rows) × control domain (columns) readiness grid. Computed live
 * from the control set so the matrix always agrees with the controls table.
 */
export function getFrameworkDomainMatrix(
  controls: ComplianceControl[] = complianceControls,
): FrameworkDomainRow[] {
  return complianceFrameworks.map((framework) => {
    const cells = matrixDomains.map<DomainCell>((domain) => {
      const domainControls = controls.filter(
        (control) =>
          control.frameworks.includes(framework.id) &&
          control.category === domain &&
          control.status !== "not-applicable",
      );

      if (domainControls.length === 0) {
        return { domain, applicable: 0, readiness: null, worst: null };
      }

      const pass = domainControls.filter((c) => c.status === "pass").length;
      const attention = domainControls.filter(
        (c) => c.status === "attention",
      ).length;
      const worst: ControlStatus = domainControls.some((c) => c.status === "fail")
        ? "fail"
        : domainControls.some((c) => c.status === "pending")
          ? "pending"
          : attention > 0
            ? "attention"
            : "pass";

      return {
        domain,
        applicable: domainControls.length,
        readiness: Math.round(
          ((pass + attention * 0.5) / domainControls.length) * 100,
        ),
        worst,
      };
    });

    return {
      framework,
      cells,
      readiness: getFrameworkRollup(framework.id, controls).readiness,
    };
  });
}

export function getControlStatusBreakdown(controls: ComplianceControl[]) {
  return {
    pass: controls.filter((c) => c.status === "pass").length,
    attention: controls.filter((c) => c.status === "attention").length,
    fail: controls.filter((c) => c.status === "fail").length,
    pending: controls.filter((c) => c.status === "pending").length,
    "not-applicable": controls.filter((c) => c.status === "not-applicable")
      .length,
  } satisfies Record<ControlStatus, number>;
}

export function getOverallScore(
  controls: ComplianceControl[] = complianceControls,
) {
  const testable = controls.filter(
    (control) => control.status !== "not-applicable",
  );
  if (testable.length === 0) return 0;
  const passing = testable.filter((c) => c.status === "pass").length;
  const attention = testable.filter((c) => c.status === "attention").length;
  return Math.round(((passing + attention * 0.5) / testable.length) * 100);
}

export function getComplianceStats(
  controls: ComplianceControl[] = complianceControls,
  findings: ComplianceFinding[] = complianceFindings,
): ComplianceStat[] {
  const testable = controls.filter(
    (control) => control.status !== "not-applicable",
  );
  const passing = testable.filter((c) => c.status === "pass").length;
  const evidenceAtRisk = complianceEvidence.filter(
    (item) =>
      item.status === "expired" ||
      item.status === "missing" ||
      (item.status === "expiring" && item.daysToExpiry <= 30),
  ).length;
  const failing = testable.filter((c) => c.status === "fail").length;
  const openFindings = findings.filter(
    (finding) =>
      finding.status !== "remediated" && finding.status !== "accepted",
  ).length;
  const nextMilestone = complianceFrameworks.reduce((soonest, framework) =>
    framework.daysToMilestone < soonest.daysToMilestone ? framework : soonest,
  );

  return [
    {
      title: "Compliance score",
      value: `${getOverallScore(controls)}%`,
      delta: 2.4,
      context: "vs last month",
      preferLower: false,
    },
    {
      title: "Controls passing",
      value: `${passing}/${testable.length}`,
      delta: 4.1,
      context: "vs last month",
      preferLower: false,
    },
    {
      title: "Failing controls",
      value: String(failing),
      delta: -1.0,
      context: "vs last month",
      preferLower: true,
    },
    {
      title: "Open findings",
      value: String(openFindings),
      delta: -9.1,
      context: "vs last month",
      preferLower: true,
    },
    {
      title: "Evidence at risk",
      value: String(evidenceAtRisk),
      delta: -16.7,
      context: "expiring or missing",
      preferLower: true,
    },
    {
      title: "Next milestone",
      value: `${nextMilestone.daysToMilestone}d`,
      delta: -3.0,
      context: `${nextMilestone.shortName} · ${nextMilestone.nextMilestone}`,
      preferLower: true,
    },
  ];
}

export type AttentionKey =
  | "failing"
  | "evidence-expired"
  | "overdue-findings"
  | "never-tested"
  | "audit-blockers";

export type AttentionFilter = {
  label: string;
  description: string;
  matches: (control: ComplianceControl) => boolean;
};

export const complianceAttentionFilters: Record<AttentionKey, AttentionFilter> =
  {
    failing: {
      label: "Failing",
      description: "Controls whose latest test returned a failure.",
      matches: (control) => control.status === "fail",
    },
    "evidence-expired": {
      label: "Evidence gap",
      description: "Evidence has expired or was never collected.",
      matches: (control) =>
        control.evidenceStatus === "expired" ||
        control.evidenceStatus === "missing",
    },
    "overdue-findings": {
      label: "Open findings",
      description: "Controls with findings still awaiting remediation.",
      matches: (control) => control.openFindings > 0,
    },
    "never-tested": {
      label: "Never tested",
      description: "Controls with no recorded test result.",
      matches: (control) => control.status === "pending",
    },
    "audit-blockers": {
      label: "Audit blocker",
      description:
        "High-risk controls inside an active audit scope that block sign-off.",
      matches: (control) =>
        control.riskScore >= 70 &&
        (control.frameworks.includes("soc2") ||
          control.frameworks.includes("pcidss")),
    },
  };

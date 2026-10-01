import { administrationUsers } from "@/components/administration/users-data";
import { assetDevices } from "@/components/assets/devices-data";

export type VulnSeverity = "critical" | "high" | "medium" | "low";

export type VulnUpdateStatus =
  | "available"
  | "scheduled"
  | "not-available"
  | "wont-fix"
  | "partial";

export type VulnThreatType =
  | "exploit-public"
  | "exploit-verified"
  | "exploit-kit"
  | "active-threat"
  | "ransomware";

export type VulnScope = "endpoint" | "cloud";

export type RecommendationStatus =
  | "active"
  | "in-progress"
  | "completed"
  | "exception"
  | "deferred";

export type RemediationStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "failed"
  | "exception";

export type SoftwareCategory = "software" | "browser" | "extension" | "os";

export type VulnEventType =
  | "new-cves"
  | "score-change"
  | "remediation-completed"
  | "exception-granted"
  | "zero-day"
  | "exploit-detected";

export type AffectedSoftware = {
  name: string;
  osVersion: string;
  vulnerableVersions: string;
  updateStatus: VulnUpdateStatus;
};

export type ExposedDevice = {
  deviceId: string;
  name: string;
  osPlatform: string;
  lastSeenLabel: string;
  criticality: VulnSeverity;
  updateAvailability: VulnUpdateStatus;
  tags: string[];
};

export type Vulnerability = {
  id: string;
  cve: string;
  title: string;
  summary: string;
  severity: VulnSeverity;
  cvss: number;
  cvssVersion: string;
  cvssVector: string;
  epss: number;
  ageLabel: string;
  ageDays: number;
  publishedAt: string;
  firstDetectedAt: string;
  updatedAt: string;
  publishedLabel: string;
  firstDetectedLabel: string;
  updatedLabel: string;
  exploitable: boolean;
  zeroDay: boolean;
  updateStatus: VulnUpdateStatus;
  exposedDeviceCount: number;
  affectedSoftware: AffectedSoftware[];
  tags: string[];
  threats: VulnThreatType[];
  cweIds: string[];
  recommendationId: string | null;
  scope: VulnScope;
  remediationRequired: boolean;
  threatInsights: {
    publicExploit: boolean;
    verified: boolean;
    exploitKits: boolean;
    type: "Remote" | "Local" | "Adjacent" | "Physical";
  };
  updateBreakdown: {
    available: number;
    scheduled: number;
    notAvailable: number;
    wontFix: number;
  };
  exposedDevices: ExposedDevice[];
  /** Linked open/related SOC alerts (exploitation / detection). */
  linkedAlertIds: string[];
  /** Linked incidents escalated from related activity. */
  linkedIncidentIds: string[];
  /** Composite SOC priority 0–100 (exploitability + detections + asset risk). */
  socPriority: number;
  /** GRC control codes this finding maps to (VM / DP / etc.). */
  complianceControlIds?: string[];
  /** Prebuilt Investigate query for this CVE. */
  investigateQuery?: string;
};

export type Recommendation = {
  id: string;
  title: string;
  description: string;
  osPlatform: string;
  weaknessCount: number;
  exposedDevices: number;
  totalDevices: number;
  exposedCriticalDevices: number;
  relatedComponent: string;
  threats: VulnThreatType[];
  status: RecommendationStatus;
  impactScore: number;
  vulnerabilityIds: string[];
  remediationIds: string[];
  scope: VulnScope;
  tags: string[];
};

export type RemediationStatusEvent = {
  at: string;
  label: string;
  status: RemediationStatus;
  note?: string;
};

export type Remediation = {
  id: string;
  title: string;
  recommendationId: string;
  ownerId: string | null;
  status: RemediationStatus;
  ticketRef: string;
  devicesTotal: number;
  devicesRemaining: number;
  createdAt: string;
  dueAt: string;
  completedAt: string | null;
  createdLabel: string;
  dueLabel: string;
  vulnerabilityIds: string[];
  timeline: RemediationStatusEvent[];
  deviceSample: string[];
};

export type SoftwareInventoryItem = {
  id: string;
  name: string;
  vendor: string;
  category: SoftwareCategory;
  osPlatform: string;
  vulnerableVersions: string;
  weaknessCount: number;
  exposedDevices: number;
  totalDevices: number;
  threats: VulnThreatType[];
  lastSeenLabel: string;
  eol: boolean;
  outdated: boolean;
  internetFacing: boolean;
  vulnerabilityIds: string[];
  versionBreakdown: { version: string; devices: number; vulnerable: boolean }[];
};

export type VulnEvent = {
  id: string;
  at: string;
  dateLabel: string;
  type: VulnEventType;
  summary: string;
  impactedDevices: number;
  impactedPercent: number;
  relatedCveIds: string[];
  relatedSoftwareIds: string[];
  scope: VulnScope;
};

export type ExposureHistoryPoint = {
  date: string;
  day: string;
  score: number;
};

export type ExposureScoreSnapshot = {
  score: number;
  max: number;
  band: "low" | "medium" | "high";
  history: ExposureHistoryPoint[];
};

export type VulnStat = {
  key: string;
  title: string;
  value: string;
  context: string;
  delta: number;
  preferLower?: boolean;
  /** Optional deep-link for decision KPI strips. */
  href?: string;
};

export type WeaknessSort =
  | "severity-desc"
  | "cvss-desc"
  | "exposed-desc"
  | "newest"
  | "oldest";

export type RecommendationSort =
  | "impact-desc"
  | "exposed-desc"
  | "weaknesses-desc"
  | "newest";

export type RemediationSort =
  | "newest"
  | "due-asc"
  | "remaining-desc"
  | "status";

export type InventorySort =
  | "weaknesses-desc"
  | "exposed-desc"
  | "name-asc"
  | "newest";

export type VulnTimelineRange = "7d" | "30d" | "90d";

export const vulnSeverities: VulnSeverity[] = [
  "critical",
  "high",
  "medium",
  "low",
];

export const vulnSeverityLabels: Record<VulnSeverity, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

export const vulnSeverityWeight: Record<VulnSeverity, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

export const vulnUpdateStatuses: VulnUpdateStatus[] = [
  "available",
  "scheduled",
  "not-available",
  "wont-fix",
  "partial",
];

export const vulnUpdateStatusLabels: Record<VulnUpdateStatus, string> = {
  available: "Available",
  scheduled: "Scheduled",
  "not-available": "Not available",
  "wont-fix": "Won't fix",
  partial: "Partial",
};

export const recommendationStatuses: RecommendationStatus[] = [
  "active",
  "in-progress",
  "completed",
  "exception",
  "deferred",
];

export const recommendationStatusLabels: Record<RecommendationStatus, string> =
  {
    active: "Active",
    "in-progress": "In progress",
    completed: "Completed",
    exception: "Exception",
    deferred: "Deferred",
  };

export const remediationStatuses: RemediationStatus[] = [
  "pending",
  "in_progress",
  "completed",
  "failed",
  "exception",
];

export const remediationStatusLabels: Record<RemediationStatus, string> = {
  pending: "Pending",
  in_progress: "In progress",
  completed: "Completed",
  failed: "Failed",
  exception: "Exception",
};

export const softwareCategories: SoftwareCategory[] = [
  "software",
  "browser",
  "extension",
  "os",
];

export const softwareCategoryLabels: Record<SoftwareCategory, string> = {
  software: "Software",
  browser: "Browsers",
  extension: "Extensions",
  os: "OS",
};

export const vulnScopes: VulnScope[] = ["endpoint", "cloud"];

export const vulnScopeLabels: Record<VulnScope, string> = {
  endpoint: "Endpoint",
  cloud: "Cloud",
};

export const vulnTimelineRanges: VulnTimelineRange[] = ["7d", "30d", "90d"];

export const vulnTimelineRangeLabels: Record<VulnTimelineRange, string> = {
  "7d": "7d",
  "30d": "30d",
  "90d": "90d",
};

export const vulnTimelineRangeDays: Record<VulnTimelineRange, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
};

export const weaknessSortLabels: Record<WeaknessSort, string> = {
  "severity-desc": "Severity · high to low",
  "cvss-desc": "CVSS · high to low",
  "exposed-desc": "Exposed · high to low",
  newest: "Newest first",
  oldest: "Oldest first",
};

export const recommendationSortLabels: Record<RecommendationSort, string> = {
  "impact-desc": "Impact · high to low",
  "exposed-desc": "Exposed · high to low",
  "weaknesses-desc": "Weaknesses · high to low",
  newest: "Newest first",
};

export const remediationSortLabels: Record<RemediationSort, string> = {
  newest: "Newest first",
  "due-asc": "Due date · soonest",
  "remaining-desc": "Remaining · high to low",
  status: "Status",
};

export const inventorySortLabels: Record<InventorySort, string> = {
  "weaknesses-desc": "Weaknesses · high to low",
  "exposed-desc": "Exposed · high to low",
  "name-asc": "Name A–Z",
  newest: "Recently seen",
};

export const threatTypeLabels: Record<VulnThreatType, string> = {
  "exploit-public": "Public exploit",
  "exploit-verified": "Verified exploit",
  "exploit-kit": "Exploit kit",
  "active-threat": "Active threat",
  ransomware: "Ransomware",
};

const devicePool = assetDevices.filter((d) => d.agentInstalled).slice(0, 24);

function pickDevices(count: number, seed: number): ExposedDevice[] {
  const out: ExposedDevice[] = [];
  for (let i = 0; i < count && i < devicePool.length; i++) {
    const d = devicePool[(seed + i) % devicePool.length];
    const criticality: VulnSeverity =
      d.riskScore >= 70
        ? "critical"
        : d.riskScore >= 45
          ? "high"
          : d.riskScore >= 25
            ? "medium"
            : "low";
    out.push({
      deviceId: d.id,
      name: d.hostname,
      osPlatform: d.platform,
      lastSeenLabel: d.lastSeenLabel,
      criticality,
      updateAvailability: i % 7 === 0 ? "scheduled" : "available",
      tags: d.category === "server" && i % 3 === 0 ? ["Internet facing"] : [],
    });
  }
  return out;
}

function expandExposed(
  base: ExposedDevice[],
  targetCount: number,
): ExposedDevice[] {
  if (base.length >= targetCount) return base.slice(0, targetCount);
  const expanded = [...base];
  let i = 0;
  while (expanded.length < Math.min(targetCount, 40)) {
    const src = base[i % base.length];
    expanded.push({
      ...src,
      name: `${src.name}-${expanded.length + 1}`,
      deviceId: `${src.deviceId}-x${expanded.length}`,
    });
    i++;
  }
  return expanded;
}

function ownerIds() {
  return administrationUsers.slice(0, 6).map((u) => u.id);
}

const owners = ownerIds();

export function getVulnOwner(ownerId: string | null) {
  if (!ownerId) return null;
  return administrationUsers.find((u) => u.id === ownerId) ?? null;
}

/* -------------------------------------------------------------------------- */
/* Vulnerabilities (CVE catalog)                                              */
/* -------------------------------------------------------------------------- */

const vulnSeeds: Array<
  Omit<
    Vulnerability,
    | "exposedDevices"
    | "affectedSoftware"
    | "updateBreakdown"
    | "linkedAlertIds"
    | "linkedIncidentIds"
    | "socPriority"
  > & {
    softwareNames: string[];
    exposedSeed: number;
  }
> = [
  {
    id: "vuln-openssl-uaf",
    cve: "CVE-2026-45447",
    title: "OpenSSL heap use-after-free in PKCS7_verify",
    summary:
      "A heap use-after-free in OpenSSL's PKCS7_verify() can allow remote code execution when processing crafted PKCS7 data. Attackers may crash the process or achieve RCE on affected services that verify CMS/PKCS7 messages.",
    severity: "high",
    cvss: 8.1,
    cvssVersion: "3.1",
    cvssVector: "CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:U/C:H/I:H/A:H/E:U/RL:O/RC:C",
    epss: 0.05,
    ageLabel: "2 months",
    ageDays: 61,
    publishedAt: "2026-06-08T17:00:00.000Z",
    firstDetectedAt: "2026-06-11T16:11:00.000Z",
    updatedAt: "2026-07-20T09:00:00.000Z",
    publishedLabel: "Jun 8, 2026 5:00 PM",
    firstDetectedLabel: "Jun 11, 2026 4:11 PM",
    updatedLabel: "Jul 20, 2026 9:00 AM",
    exploitable: true,
    zeroDay: false,
    updateStatus: "available",
    exposedDeviceCount: 1771,
    tags: ["Internet facing"],
    threats: ["exploit-public", "active-threat", "exploit-kit"],
    cweIds: ["CWE-416"],
    recommendationId: "rec-update-openssl",
    scope: "endpoint",
    remediationRequired: true,
    threatInsights: {
      publicExploit: true,
      verified: false,
      exploitKits: true,
      type: "Remote",
    },
    softwareNames: [
      "OpenSSL",
      "Microsoft OpenSSL",
      "Microsoft Cloud-hypervisor",
      "Azure Linux OpenSSL",
    ],
    exposedSeed: 1,
    complianceControlIds: ["VM-02", "VM-03"],
    investigateQuery: "vuln.cve=CVE-2026-45447 process.image=*openssl*",
  },
  {
    id: "vuln-word-rce",
    cve: "CVE-2023-21716",
    title: "Microsoft Word remote code execution",
    summary:
      "A remote code execution vulnerability in Microsoft Word allows an attacker to run arbitrary code when a specially crafted document is opened. Affects multiple Office builds still present in the estate.",
    severity: "critical",
    cvss: 9.8,
    cvssVersion: "3.1",
    cvssVector: "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H",
    epss: 0.82,
    ageLabel: "3 years",
    ageDays: 1100,
    publishedAt: "2023-02-14T18:00:00.000Z",
    firstDetectedAt: "2026-05-02T10:00:00.000Z",
    updatedAt: "2026-07-18T12:00:00.000Z",
    publishedLabel: "Feb 14, 2023 6:00 PM",
    firstDetectedLabel: "May 2, 2026 10:00 AM",
    updatedLabel: "Jul 18, 2026 12:00 PM",
    exploitable: true,
    zeroDay: false,
    updateStatus: "available",
    exposedDeviceCount: 9,
    tags: ["Office", "Document attack"],
    threats: ["exploit-verified", "ransomware", "exploit-kit", "active-threat"],
    cweIds: ["CWE-787"],
    recommendationId: "rec-update-office",
    scope: "endpoint",
    remediationRequired: true,
    threatInsights: {
      publicExploit: true,
      verified: true,
      exploitKits: true,
      type: "Local",
    },
    softwareNames: ["Microsoft Office", "Microsoft Word"],
    exposedSeed: 3,
    complianceControlIds: ["VM-02", "EP-01"],
    investigateQuery: "vuln.cve=CVE-2023-21716 process.name=WINWORD.EXE",
  },
  {
    id: "vuln-outlook-eop",
    cve: "CVE-2023-23397",
    title: "Microsoft Outlook elevation of privilege",
    summary:
      "Outlook fails to properly handle certain Net-NTLMv2 hash leak scenarios via crafted calendar invites, enabling elevation of privilege and credential theft.",
    severity: "critical",
    cvss: 9.8,
    cvssVersion: "3.1",
    cvssVector: "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H",
    epss: 0.91,
    ageLabel: "3 years",
    ageDays: 1080,
    publishedAt: "2023-03-14T17:00:00.000Z",
    firstDetectedAt: "2026-05-04T11:00:00.000Z",
    updatedAt: "2026-07-19T08:00:00.000Z",
    publishedLabel: "Mar 14, 2023 5:00 PM",
    firstDetectedLabel: "May 4, 2026 11:00 AM",
    updatedLabel: "Jul 19, 2026 8:00 AM",
    exploitable: true,
    zeroDay: false,
    updateStatus: "available",
    exposedDeviceCount: 9,
    tags: [],
    threats: ["exploit-verified", "active-threat"],
    cweIds: ["CWE-294"],
    recommendationId: "rec-update-outlook",
    scope: "endpoint",
    remediationRequired: true,
    threatInsights: {
      publicExploit: true,
      verified: true,
      exploitKits: false,
      type: "Remote",
    },
    softwareNames: ["Microsoft Outlook", "Microsoft Office"],
    exposedSeed: 5,
    complianceControlIds: ["VM-02", "AC-01"],
    investigateQuery: "vuln.cve=CVE-2023-23397 process.name=OUTLOOK.EXE",
  },
  {
    id: "vuln-teams-rce",
    cve: "CVE-2026-31288",
    title: "Microsoft Teams remote code execution",
    summary:
      "A memory corruption issue in Teams desktop clients can be triggered via crafted chat content, leading to remote code execution in the user context.",
    severity: "critical",
    cvss: 8.8,
    cvssVersion: "3.1",
    cvssVector: "CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:U/C:H/I:H/A:H",
    epss: 0.34,
    ageLabel: "3 weeks",
    ageDays: 21,
    publishedAt: "2026-07-07T16:00:00.000Z",
    firstDetectedAt: "2026-07-08T09:00:00.000Z",
    updatedAt: "2026-07-25T14:00:00.000Z",
    publishedLabel: "Jul 7, 2026 4:00 PM",
    firstDetectedLabel: "Jul 8, 2026 9:00 AM",
    updatedLabel: "Jul 25, 2026 2:00 PM",
    exploitable: true,
    zeroDay: false,
    updateStatus: "available",
    exposedDeviceCount: 2240,
    tags: [],
    threats: ["exploit-public"],
    cweIds: ["CWE-119"],
    recommendationId: "rec-update-teams",
    scope: "endpoint",
    remediationRequired: true,
    threatInsights: {
      publicExploit: true,
      verified: false,
      exploitKits: false,
      type: "Remote",
    },
    softwareNames: ["Microsoft Teams"],
    exposedSeed: 2,
    complianceControlIds: ["VM-02", "EP-02"],
    investigateQuery: "vuln.cve=CVE-2026-31288 process.name=ms-teams*",
  },
  {
    id: "vuln-chrome-sbx",
    cve: "CVE-2026-40112",
    title: "Chromium sandbox escape",
    summary:
      "A type confusion bug in the V8 engine combined with a sandbox escape allows a malicious webpage to execute code outside the renderer sandbox.",
    severity: "critical",
    cvss: 9.6,
    cvssVersion: "3.1",
    cvssVector: "CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:C/C:H/I:H/A:H",
    epss: 0.67,
    ageLabel: "1 week",
    ageDays: 7,
    publishedAt: "2026-07-21T15:00:00.000Z",
    firstDetectedAt: "2026-07-22T08:00:00.000Z",
    updatedAt: "2026-07-27T11:00:00.000Z",
    publishedLabel: "Jul 21, 2026 3:00 PM",
    firstDetectedLabel: "Jul 22, 2026 8:00 AM",
    updatedLabel: "Jul 27, 2026 11:00 AM",
    exploitable: true,
    zeroDay: true,
    updateStatus: "available",
    exposedDeviceCount: 890,
    tags: ["Internet facing"],
    threats: ["exploit-verified", "exploit-kit", "active-threat", "ransomware"],
    cweIds: ["CWE-843"],
    recommendationId: "rec-update-chrome",
    scope: "endpoint",
    remediationRequired: true,
    threatInsights: {
      publicExploit: true,
      verified: true,
      exploitKits: true,
      type: "Remote",
    },
    softwareNames: ["Google Chrome", "Microsoft Edge"],
    exposedSeed: 4,
    complianceControlIds: ["VM-02", "EP-01"],
    investigateQuery: "vuln.cve=CVE-2026-40112 browser.sandbox_escape=true",
  },
  {
    id: "vuln-ntlm-relay",
    cve: "CVE-2026-21890",
    title: "NTLM authentication relay weakness",
    summary:
      "Legacy NTLM authentication remains enabled on domain-joined systems, enabling relay and credential-theft attacks when SMB signing is not enforced.",
    severity: "high",
    cvss: 8.1,
    cvssVersion: "3.1",
    cvssVector: "CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:U/C:H/I:H/A:H",
    epss: 0.22,
    ageLabel: "5 months",
    ageDays: 150,
    publishedAt: "2026-02-28T16:00:00.000Z",
    firstDetectedAt: "2026-03-02T10:00:00.000Z",
    updatedAt: "2026-07-10T09:00:00.000Z",
    publishedLabel: "Feb 28, 2026 4:00 PM",
    firstDetectedLabel: "Mar 2, 2026 10:00 AM",
    updatedLabel: "Jul 10, 2026 9:00 AM",
    exploitable: true,
    zeroDay: false,
    updateStatus: "partial",
    exposedDeviceCount: 1840,
    tags: ["Identity", "Network"],
    threats: ["active-threat", "exploit-verified", "exploit-public"],
    cweIds: ["CWE-294"],
    recommendationId: "rec-disable-ntlm",
    scope: "endpoint",
    remediationRequired: true,
    threatInsights: {
      publicExploit: true,
      verified: true,
      exploitKits: false,
      type: "Adjacent",
    },
    softwareNames: ["Windows", "Active Directory"],
    exposedSeed: 6,
  },
  {
    id: "vuln-firefox-mem",
    cve: "CVE-2026-38901",
    title: "Mozilla Firefox memory safety bugs",
    summary:
      "Multiple memory safety bugs in Firefox 128–140 could be exploited to run arbitrary code. Upstream released coordinated fixes; many endpoints remain on vulnerable builds.",
    severity: "high",
    cvss: 7.5,
    cvssVersion: "3.1",
    cvssVector: "CVSS:3.1/AV:N/AC:H/PR:N/UI:R/S:U/C:H/I:H/A:H",
    epss: 0.11,
    ageLabel: "2 weeks",
    ageDays: 14,
    publishedAt: "2026-07-14T16:00:00.000Z",
    firstDetectedAt: "2026-07-15T07:00:00.000Z",
    updatedAt: "2026-07-26T10:00:00.000Z",
    publishedLabel: "Jul 14, 2026 4:00 PM",
    firstDetectedLabel: "Jul 15, 2026 7:00 AM",
    updatedLabel: "Jul 26, 2026 10:00 AM",
    exploitable: false,
    zeroDay: false,
    updateStatus: "available",
    exposedDeviceCount: 2060,
    tags: [],
    threats: [],
    cweIds: ["CWE-119"],
    recommendationId: "rec-update-firefox",
    scope: "endpoint",
    remediationRequired: true,
    threatInsights: {
      publicExploit: false,
      verified: false,
      exploitKits: false,
      type: "Remote",
    },
    softwareNames: ["Mozilla Firefox"],
    exposedSeed: 7,
  },
  {
    id: "vuln-win11-kernel",
    cve: "CVE-2026-33045",
    title: "Windows 11 kernel elevation of privilege",
    summary:
      "An elevation of privilege vulnerability exists when the Windows kernel improperly handles objects in memory, allowing a local attacker to gain SYSTEM privileges.",
    severity: "high",
    cvss: 7.8,
    cvssVersion: "3.1",
    cvssVector: "CVSS:3.1/AV:L/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:H",
    epss: 0.08,
    ageLabel: "1 month",
    ageDays: 32,
    publishedAt: "2026-06-26T17:00:00.000Z",
    firstDetectedAt: "2026-06-27T09:00:00.000Z",
    updatedAt: "2026-07-22T13:00:00.000Z",
    publishedLabel: "Jun 26, 2026 5:00 PM",
    firstDetectedLabel: "Jun 27, 2026 9:00 AM",
    updatedLabel: "Jul 22, 2026 1:00 PM",
    exploitable: false,
    zeroDay: false,
    updateStatus: "available",
    exposedDeviceCount: 1520,
    tags: [],
    threats: [],
    cweIds: ["CWE-269"],
    recommendationId: "rec-patch-windows",
    scope: "endpoint",
    remediationRequired: true,
    threatInsights: {
      publicExploit: false,
      verified: false,
      exploitKits: false,
      type: "Local",
    },
    softwareNames: ["Windows 11", "Windows Server 2022"],
    exposedSeed: 8,
  },
  {
    id: "vuln-oracle-compat",
    cve: "CVE-2026-21915",
    title: "Oracle Java SE deserialization",
    summary:
      "Deserialization of untrusted data in Oracle Java SE allows unauthenticated attackers to compromise Java deployments via network access.",
    severity: "critical",
    cvss: 9.1,
    cvssVersion: "3.1",
    cvssVector: "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:N",
    epss: 0.45,
    ageLabel: "2 months",
    ageDays: 58,
    publishedAt: "2026-05-30T16:00:00.000Z",
    firstDetectedAt: "2026-06-01T12:00:00.000Z",
    updatedAt: "2026-07-15T10:00:00.000Z",
    publishedLabel: "May 30, 2026 4:00 PM",
    firstDetectedLabel: "Jun 1, 2026 12:00 PM",
    updatedLabel: "Jul 15, 2026 10:00 AM",
    exploitable: true,
    zeroDay: false,
    updateStatus: "available",
    exposedDeviceCount: 412,
    tags: [],
    threats: ["exploit-public"],
    cweIds: ["CWE-502"],
    recommendationId: "rec-update-java",
    scope: "endpoint",
    remediationRequired: true,
    threatInsights: {
      publicExploit: true,
      verified: false,
      exploitKits: false,
      type: "Remote",
    },
    softwareNames: ["Oracle Java SE", "Oracle Compatibility Pack"],
    exposedSeed: 9,
  },
  {
    id: "vuln-azure-rbac",
    cve: "CVE-2026-51200",
    title: "Azure RBAC privilege escalation",
    summary:
      "Misconfigured custom role definitions in Azure RBAC can allow privilege escalation across subscriptions when wildcard actions are granted.",
    severity: "high",
    cvss: 8.0,
    cvssVersion: "3.1",
    cvssVector: "CVSS:3.1/AV:N/AC:H/PR:L/UI:N/S:C/C:H/I:H/A:N",
    epss: 0.04,
    ageLabel: "3 weeks",
    ageDays: 22,
    publishedAt: "2026-07-06T15:00:00.000Z",
    firstDetectedAt: "2026-07-07T11:00:00.000Z",
    updatedAt: "2026-07-24T16:00:00.000Z",
    publishedLabel: "Jul 6, 2026 3:00 PM",
    firstDetectedLabel: "Jul 7, 2026 11:00 AM",
    updatedLabel: "Jul 24, 2026 4:00 PM",
    exploitable: false,
    zeroDay: false,
    updateStatus: "not-available",
    exposedDeviceCount: 128,
    tags: ["Cloud"],
    threats: [],
    cweIds: ["CWE-269"],
    recommendationId: "rec-harden-azure-rbac",
    scope: "cloud",
    remediationRequired: true,
    threatInsights: {
      publicExploit: false,
      verified: false,
      exploitKits: false,
      type: "Remote",
    },
    softwareNames: ["Azure RBAC", "Azure Resource Manager"],
    exposedSeed: 10,
  },
  {
    id: "vuln-aks-escape",
    cve: "CVE-2026-49881",
    title: "AKS container escape via privileged mount",
    summary:
      "Workloads with excessive hostPath mounts on AKS node pools can escape to the host, exposing cluster credentials and neighboring pods.",
    severity: "critical",
    cvss: 8.8,
    cvssVersion: "3.1",
    cvssVector: "CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:C/C:H/I:H/A:H",
    epss: 0.19,
    ageLabel: "5 weeks",
    ageDays: 35,
    publishedAt: "2026-06-23T14:00:00.000Z",
    firstDetectedAt: "2026-06-24T08:00:00.000Z",
    updatedAt: "2026-07-21T09:00:00.000Z",
    publishedLabel: "Jun 23, 2026 2:00 PM",
    firstDetectedLabel: "Jun 24, 2026 8:00 AM",
    updatedLabel: "Jul 21, 2026 9:00 AM",
    exploitable: true,
    zeroDay: false,
    updateStatus: "available",
    exposedDeviceCount: 64,
    tags: ["Cloud", "Internet facing"],
    threats: ["exploit-public", "active-threat"],
    cweIds: ["CWE-250"],
    recommendationId: "rec-restrict-hostpath",
    scope: "cloud",
    remediationRequired: true,
    threatInsights: {
      publicExploit: true,
      verified: false,
      exploitKits: false,
      type: "Remote",
    },
    softwareNames: ["Azure Kubernetes Service", "containerd"],
    exposedSeed: 11,
  },
  {
    id: "vuln-adcs-eop",
    cve: "CVE-2026-54121",
    title: "AD CS elevation of privilege (CertiGhost)",
    summary:
      "Active Directory Certificate Services misconfiguration enables ESC1-style certificate-based elevation of privilege across the domain.",
    severity: "critical",
    cvss: 8.8,
    cvssVersion: "3.1",
    cvssVector: "CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:H",
    epss: 0.28,
    ageLabel: "1 day",
    ageDays: 1,
    publishedAt: "2026-07-27T12:00:00.000Z",
    firstDetectedAt: "2026-07-27T14:00:00.000Z",
    updatedAt: "2026-07-27T18:00:00.000Z",
    publishedLabel: "Jul 27, 2026 12:00 PM",
    firstDetectedLabel: "Jul 27, 2026 2:00 PM",
    updatedLabel: "Jul 27, 2026 6:00 PM",
    exploitable: true,
    zeroDay: true,
    updateStatus: "partial",
    exposedDeviceCount: 3,
    tags: ["Zero-day", "Identity", "Domain compromise"],
    threats: ["exploit-verified", "active-threat", "exploit-public"],
    cweIds: ["CWE-295"],
    recommendationId: "rec-harden-adcs",
    scope: "endpoint",
    remediationRequired: true,
    threatInsights: {
      publicExploit: true,
      verified: true,
      exploitKits: false,
      type: "Adjacent",
    },
    softwareNames: ["Active Directory Certificate Services"],
    exposedSeed: 12,
  },
  {
    id: "vuln-exchange-ssrf",
    cve: "CVE-2026-27701",
    title: "Exchange Server SSRF leading to RCE",
    summary:
      "A server-side request forgery in Microsoft Exchange Online/on-prem connectors can be chained to remote code execution on mail servers.",
    severity: "critical",
    cvss: 9.8,
    cvssVersion: "3.1",
    cvssVector: "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H",
    epss: 0.71,
    ageLabel: "4 days",
    ageDays: 4,
    publishedAt: "2026-07-24T15:00:00.000Z",
    firstDetectedAt: "2026-07-24T18:00:00.000Z",
    updatedAt: "2026-07-27T10:00:00.000Z",
    publishedLabel: "Jul 24, 2026 3:00 PM",
    firstDetectedLabel: "Jul 24, 2026 6:00 PM",
    updatedLabel: "Jul 27, 2026 10:00 AM",
    exploitable: true,
    zeroDay: false,
    updateStatus: "available",
    exposedDeviceCount: 6,
    tags: ["Mail", "Internet facing", "High priority"],
    threats: [
      "exploit-verified",
      "active-threat",
      "exploit-public",
      "ransomware",
    ],
    cweIds: ["CWE-918"],
    recommendationId: "rec-patch-exchange",
    scope: "endpoint",
    remediationRequired: true,
    threatInsights: {
      publicExploit: true,
      verified: true,
      exploitKits: false,
      type: "Remote",
    },
    softwareNames: ["Microsoft Exchange Server", "Exchange Online Connector"],
    exposedSeed: 13,
  },
  {
    id: "vuln-zoom-rce",
    cve: "CVE-2026-36110",
    title: "Zoom Client remote code execution",
    summary:
      "A use-after-free in the Zoom desktop media engine allows RCE when a malicious meeting participant shares crafted content.",
    severity: "critical",
    cvss: 8.8,
    cvssVersion: "3.1",
    cvssVector: "CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:U/C:H/I:H/A:H",
    epss: 0.41,
    ageLabel: "10 days",
    ageDays: 10,
    publishedAt: "2026-07-18T16:00:00.000Z",
    firstDetectedAt: "2026-07-19T09:00:00.000Z",
    updatedAt: "2026-07-26T11:00:00.000Z",
    publishedLabel: "Jul 18, 2026 4:00 PM",
    firstDetectedLabel: "Jul 19, 2026 9:00 AM",
    updatedLabel: "Jul 26, 2026 11:00 AM",
    exploitable: true,
    zeroDay: false,
    updateStatus: "available",
    exposedDeviceCount: 1340,
    tags: ["Collaboration"],
    threats: ["exploit-public", "exploit-kit"],
    cweIds: ["CWE-416"],
    recommendationId: "rec-update-zoom",
    scope: "endpoint",
    remediationRequired: true,
    threatInsights: {
      publicExploit: true,
      verified: false,
      exploitKits: true,
      type: "Remote",
    },
    softwareNames: ["Zoom Workplace", "Zoom VDI Plugin"],
    exposedSeed: 14,
  },
  {
    id: "vuln-citrix-bleed2",
    cve: "CVE-2026-49622",
    title: "Citrix NetScaler memory disclosure",
    summary:
      "Unauthenticated memory disclosure on Citrix ADC/Gateway can leak session tokens and enable account takeover of VPN users.",
    severity: "critical",
    cvss: 9.4,
    cvssVersion: "3.1",
    cvssVector: "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:L",
    epss: 0.88,
    ageLabel: "6 weeks",
    ageDays: 42,
    publishedAt: "2026-06-16T14:00:00.000Z",
    firstDetectedAt: "2026-06-16T20:00:00.000Z",
    updatedAt: "2026-07-20T08:00:00.000Z",
    publishedLabel: "Jun 16, 2026 2:00 PM",
    firstDetectedLabel: "Jun 16, 2026 8:00 PM",
    updatedLabel: "Jul 20, 2026 8:00 AM",
    exploitable: true,
    zeroDay: false,
    updateStatus: "available",
    exposedDeviceCount: 4,
    tags: ["VPN", "Internet facing", "Edge"],
    threats: ["exploit-verified", "active-threat", "ransomware", "exploit-kit"],
    cweIds: ["CWE-119"],
    recommendationId: "rec-patch-citrix",
    scope: "endpoint",
    remediationRequired: true,
    threatInsights: {
      publicExploit: true,
      verified: true,
      exploitKits: true,
      type: "Remote",
    },
    softwareNames: ["Citrix ADC", "Citrix Gateway"],
    exposedSeed: 15,
  },
  {
    id: "vuln-apache-log4j-residual",
    cve: "CVE-2021-44228",
    title: "Log4Shell residual (Log4j)",
    summary:
      "Legacy Log4j 2.x builds remain on internal build agents and appliances. Remote JNDI injection enables RCE.",
    severity: "critical",
    cvss: 10.0,
    cvssVersion: "3.1",
    cvssVector: "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H",
    epss: 0.97,
    ageLabel: "4 years",
    ageDays: 1600,
    publishedAt: "2021-12-10T10:00:00.000Z",
    firstDetectedAt: "2026-04-12T11:00:00.000Z",
    updatedAt: "2026-07-01T09:00:00.000Z",
    publishedLabel: "Dec 10, 2021 10:00 AM",
    firstDetectedLabel: "Apr 12, 2026 11:00 AM",
    updatedLabel: "Jul 1, 2026 9:00 AM",
    exploitable: true,
    zeroDay: false,
    updateStatus: "available",
    exposedDeviceCount: 28,
    tags: ["Legacy", "Build pipeline"],
    threats: [
      "exploit-verified",
      "exploit-kit",
      "ransomware",
      "active-threat",
      "exploit-public",
    ],
    cweIds: ["CWE-502", "CWE-917"],
    recommendationId: "rec-eradicate-log4j",
    scope: "endpoint",
    remediationRequired: true,
    threatInsights: {
      publicExploit: true,
      verified: true,
      exploitKits: true,
      type: "Remote",
    },
    softwareNames: ["Apache Log4j", "Elasticsearch", "Custom Java services"],
    exposedSeed: 16,
  },
  {
    id: "vuln-ivanti-vpn",
    cve: "CVE-2026-21893",
    title: "Ivanti Connect Secure auth bypass",
    summary:
      "Authentication bypass in Ivanti Connect Secure allows unauthenticated access to administrative APIs on internet-facing appliances.",
    severity: "critical",
    cvss: 9.1,
    cvssVersion: "3.1",
    cvssVector: "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:N",
    epss: 0.76,
    ageLabel: "3 weeks",
    ageDays: 21,
    publishedAt: "2026-07-07T13:00:00.000Z",
    firstDetectedAt: "2026-07-07T16:00:00.000Z",
    updatedAt: "2026-07-25T12:00:00.000Z",
    publishedLabel: "Jul 7, 2026 1:00 PM",
    firstDetectedLabel: "Jul 7, 2026 4:00 PM",
    updatedLabel: "Jul 25, 2026 12:00 PM",
    exploitable: true,
    zeroDay: true,
    updateStatus: "partial",
    exposedDeviceCount: 2,
    tags: ["VPN", "Internet facing", "Zero-day"],
    threats: ["exploit-verified", "active-threat", "exploit-public"],
    cweIds: ["CWE-287"],
    recommendationId: "rec-patch-ivanti",
    scope: "endpoint",
    remediationRequired: true,
    threatInsights: {
      publicExploit: true,
      verified: true,
      exploitKits: false,
      type: "Remote",
    },
    softwareNames: ["Ivanti Connect Secure"],
    exposedSeed: 17,
  },
  {
    id: "vuln-npm-supply",
    cve: "CVE-2026-55201",
    title: "Compromised npm package (ux-utils)",
    summary:
      "A widely used frontend utility package was compromised with a malicious postinstall script exfiltrating CI secrets.",
    severity: "high",
    cvss: 8.2,
    cvssVersion: "3.1",
    cvssVector: "CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:C/C:H/I:L/A:N",
    epss: 0.33,
    ageLabel: "5 days",
    ageDays: 5,
    publishedAt: "2026-07-23T11:00:00.000Z",
    firstDetectedAt: "2026-07-23T14:00:00.000Z",
    updatedAt: "2026-07-27T09:00:00.000Z",
    publishedLabel: "Jul 23, 2026 11:00 AM",
    firstDetectedLabel: "Jul 23, 2026 2:00 PM",
    updatedLabel: "Jul 27, 2026 9:00 AM",
    exploitable: true,
    zeroDay: false,
    updateStatus: "available",
    exposedDeviceCount: 86,
    tags: ["Supply chain", "CI/CD"],
    threats: ["active-threat", "exploit-public"],
    cweIds: ["CWE-506"],
    recommendationId: "rec-pin-npm",
    scope: "endpoint",
    remediationRequired: true,
    threatInsights: {
      publicExploit: true,
      verified: true,
      exploitKits: false,
      type: "Local",
    },
    softwareNames: ["Node.js", "ux-utils", "GitHub Actions runners"],
    exposedSeed: 18,
  },
  {
    id: "vuln-sql-odbc",
    cve: "CVE-2026-31944",
    title: "Microsoft ODBC Driver heap overflow",
    summary:
      "A heap-based buffer overflow in Microsoft ODBC Driver for SQL Server can allow RCE when connecting to a malicious SQL endpoint.",
    severity: "high",
    cvss: 8.1,
    cvssVersion: "3.1",
    cvssVector: "CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:U/C:H/I:H/A:H",
    epss: 0.15,
    ageLabel: "2 months",
    ageDays: 55,
    publishedAt: "2026-06-03T17:00:00.000Z",
    firstDetectedAt: "2026-06-05T10:00:00.000Z",
    updatedAt: "2026-07-14T15:00:00.000Z",
    publishedLabel: "Jun 3, 2026 5:00 PM",
    firstDetectedLabel: "Jun 5, 2026 10:00 AM",
    updatedLabel: "Jul 14, 2026 3:00 PM",
    exploitable: false,
    zeroDay: false,
    updateStatus: "available",
    exposedDeviceCount: 640,
    tags: ["Database clients"],
    threats: ["exploit-public"],
    cweIds: ["CWE-122"],
    recommendationId: "rec-update-odbc",
    scope: "endpoint",
    remediationRequired: true,
    threatInsights: {
      publicExploit: true,
      verified: false,
      exploitKits: false,
      type: "Remote",
    },
    softwareNames: ["Microsoft ODBC Driver 18", "SQL Server Management Studio"],
    exposedSeed: 19,
  },
  {
    id: "vuln-macos-tcc",
    cve: "CVE-2026-40555",
    title: "macOS TCC bypass via Finder XPC",
    summary:
      "A TCC bypass allows a local process to access protected user data without consent prompts on macOS Sequoia.",
    severity: "high",
    cvss: 7.8,
    cvssVersion: "3.1",
    cvssVector: "CVSS:3.1/AV:L/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:H",
    epss: 0.09,
    ageLabel: "3 weeks",
    ageDays: 20,
    publishedAt: "2026-07-08T18:00:00.000Z",
    firstDetectedAt: "2026-07-09T12:00:00.000Z",
    updatedAt: "2026-07-22T16:00:00.000Z",
    publishedLabel: "Jul 8, 2026 6:00 PM",
    firstDetectedLabel: "Jul 9, 2026 12:00 PM",
    updatedLabel: "Jul 22, 2026 4:00 PM",
    exploitable: true,
    zeroDay: false,
    updateStatus: "available",
    exposedDeviceCount: 210,
    tags: ["macOS", "Privacy"],
    threats: ["exploit-verified", "active-threat"],
    cweIds: ["CWE-284"],
    recommendationId: "rec-patch-macos",
    scope: "endpoint",
    remediationRequired: true,
    threatInsights: {
      publicExploit: true,
      verified: true,
      exploitKits: false,
      type: "Local",
    },
    softwareNames: ["macOS Sequoia"],
    exposedSeed: 20,
  },
  {
    id: "vuln-aws-imds",
    cve: "CVE-2026-48102",
    title: "IMDSv1 still enabled on EC2 fleet",
    summary:
      "Instances remain configured with IMDSv1, enabling SSRF-to-credential theft patterns against the instance metadata service.",
    severity: "high",
    cvss: 8.0,
    cvssVersion: "3.1",
    cvssVector: "CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:C/C:H/I:H/A:N",
    epss: 0.18,
    ageLabel: "2 months",
    ageDays: 60,
    publishedAt: "2026-05-28T12:00:00.000Z",
    firstDetectedAt: "2026-05-29T09:00:00.000Z",
    updatedAt: "2026-07-19T11:00:00.000Z",
    publishedLabel: "May 28, 2026 12:00 PM",
    firstDetectedLabel: "May 29, 2026 9:00 AM",
    updatedLabel: "Jul 19, 2026 11:00 AM",
    exploitable: true,
    zeroDay: false,
    updateStatus: "not-available",
    exposedDeviceCount: 94,
    tags: ["Cloud", "AWS", "Misconfiguration"],
    threats: ["active-threat", "exploit-public"],
    cweIds: ["CWE-668"],
    recommendationId: "rec-enforce-imdsv2",
    scope: "cloud",
    remediationRequired: true,
    threatInsights: {
      publicExploit: true,
      verified: true,
      exploitKits: false,
      type: "Remote",
    },
    softwareNames: ["Amazon EC2", "AWS SSM Agent"],
    exposedSeed: 21,
  },
  {
    id: "vuln-s3-public",
    cve: "CVE-2026-MISC-S3",
    title: "Public S3 buckets with sensitive objects",
    summary:
      "Multiple S3 buckets are publicly listable and contain customer exports and backup archives without encryption enforcement.",
    severity: "critical",
    cvss: 9.1,
    cvssVersion: "3.1",
    cvssVector: "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N",
    epss: 0.05,
    ageLabel: "1 month",
    ageDays: 30,
    publishedAt: "2026-06-28T10:00:00.000Z",
    firstDetectedAt: "2026-06-28T12:00:00.000Z",
    updatedAt: "2026-07-21T08:00:00.000Z",
    publishedLabel: "Jun 28, 2026 10:00 AM",
    firstDetectedLabel: "Jun 28, 2026 12:00 PM",
    updatedLabel: "Jul 21, 2026 8:00 AM",
    exploitable: true,
    zeroDay: false,
    updateStatus: "not-available",
    exposedDeviceCount: 7,
    tags: ["Cloud", "Data exposure", "Internet facing"],
    threats: ["active-threat"],
    cweIds: ["CWE-200"],
    recommendationId: "rec-lock-s3",
    scope: "cloud",
    remediationRequired: true,
    threatInsights: {
      publicExploit: false,
      verified: false,
      exploitKits: false,
      type: "Remote",
    },
    softwareNames: ["Amazon S3"],
    exposedSeed: 22,
  },
  {
    id: "vuln-docker-escape",
    cve: "CVE-2026-44770",
    title: "containerd privilege escalation",
    summary:
      "A race condition in containerd shim allows a container process to escape to the host under specific cgroup configurations.",
    severity: "high",
    cvss: 8.5,
    cvssVersion: "3.1",
    cvssVector: "CVSS:3.1/AV:L/AC:H/PR:L/UI:N/S:C/C:H/I:H/A:H",
    epss: 0.21,
    ageLabel: "2 weeks",
    ageDays: 14,
    publishedAt: "2026-07-14T15:00:00.000Z",
    firstDetectedAt: "2026-07-15T08:00:00.000Z",
    updatedAt: "2026-07-26T13:00:00.000Z",
    publishedLabel: "Jul 14, 2026 3:00 PM",
    firstDetectedLabel: "Jul 15, 2026 8:00 AM",
    updatedLabel: "Jul 26, 2026 1:00 PM",
    exploitable: true,
    zeroDay: false,
    updateStatus: "available",
    exposedDeviceCount: 48,
    tags: ["Cloud", "Containers"],
    threats: ["exploit-public", "exploit-verified"],
    cweIds: ["CWE-362"],
    recommendationId: "rec-update-containerd",
    scope: "cloud",
    remediationRequired: true,
    threatInsights: {
      publicExploit: true,
      verified: true,
      exploitKits: false,
      type: "Local",
    },
    softwareNames: ["containerd", "Docker Engine", "AKS node image"],
    exposedSeed: 23,
  },
  {
    id: "vuln-vscode-ext",
    cve: "CVE-2026-50112",
    title: "VS Code extension remote code execution",
    summary:
      "A popular themes extension executes unsanitized workspace configuration, enabling RCE when opening untrusted folders.",
    severity: "medium",
    cvss: 6.5,
    cvssVersion: "3.1",
    cvssVector: "CVSS:3.1/AV:L/AC:L/PR:N/UI:R/S:U/C:H/I:H/A:N",
    epss: 0.07,
    ageLabel: "1 week",
    ageDays: 8,
    publishedAt: "2026-07-20T12:00:00.000Z",
    firstDetectedAt: "2026-07-21T09:00:00.000Z",
    updatedAt: "2026-07-27T10:00:00.000Z",
    publishedLabel: "Jul 20, 2026 12:00 PM",
    firstDetectedLabel: "Jul 21, 2026 9:00 AM",
    updatedLabel: "Jul 27, 2026 10:00 AM",
    exploitable: true,
    zeroDay: false,
    updateStatus: "available",
    exposedDeviceCount: 320,
    tags: ["Developer tools", "Supply chain"],
    threats: ["exploit-public"],
    cweIds: ["CWE-94"],
    recommendationId: "rec-restrict-vscode-ext",
    scope: "endpoint",
    remediationRequired: true,
    threatInsights: {
      publicExploit: true,
      verified: false,
      exploitKits: false,
      type: "Local",
    },
    softwareNames: ["Visual Studio Code", "Material Theme extension"],
    exposedSeed: 24,
  },
  {
    id: "vuln-printnightmare-residual",
    cve: "CVE-2021-34527",
    title: "PrintNightmare residual spooler exposure",
    summary:
      "Print Spooler remains enabled on domain controllers and servers, reintroducing remote code execution risk via the PrintNightmare class of bugs.",
    severity: "high",
    cvss: 8.8,
    cvssVersion: "3.1",
    cvssVector: "CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:H",
    epss: 0.62,
    ageLabel: "5 years",
    ageDays: 1800,
    publishedAt: "2021-07-01T17:00:00.000Z",
    firstDetectedAt: "2026-03-18T10:00:00.000Z",
    updatedAt: "2026-07-10T09:00:00.000Z",
    publishedLabel: "Jul 1, 2021 5:00 PM",
    firstDetectedLabel: "Mar 18, 2026 10:00 AM",
    updatedLabel: "Jul 10, 2026 9:00 AM",
    exploitable: true,
    zeroDay: false,
    updateStatus: "partial",
    exposedDeviceCount: 18,
    tags: ["Domain controllers", "Legacy"],
    threats: ["exploit-verified", "exploit-kit", "active-threat"],
    cweIds: ["CWE-269"],
    recommendationId: "rec-disable-spooler",
    scope: "endpoint",
    remediationRequired: true,
    threatInsights: {
      publicExploit: true,
      verified: true,
      exploitKits: true,
      type: "Remote",
    },
    softwareNames: ["Windows Server", "Print Spooler"],
    exposedSeed: 25,
  },
];

// Fix the zero-day threat type typo - remove invalid "zero-day" from threats
function normalizeThreats(threats: VulnThreatType[]): VulnThreatType[] {
  const allowed = new Set<VulnThreatType>([
    "exploit-public",
    "exploit-verified",
    "exploit-kit",
    "active-threat",
    "ransomware",
  ]);
  return threats.filter((t) => allowed.has(t));
}

function buildAffectedSoftware(names: string[]): AffectedSoftware[] {
  return names.map((name, i) => ({
    name,
    osVersion: i % 3 === 0 ? "All" : i % 3 === 1 ? "Windows" : "Azure Linux",
    vulnerableVersions:
      i === 0
        ? `${name} versions including current builds prior to latest patch`
        : `${name} vulnerable builds (see vendor advisory)`,
    updateStatus: (i % 5 === 0 ? "scheduled" : "available") as VulnUpdateStatus,
  }));
}

/** Explicit SOC graph: finding → alerts / incidents (exploitation & IR). */
const socFindingLinks: Record<
  string,
  { alerts: string[]; incidents: string[] }
> = {
  "vuln-adcs-eop": {
    alerts: ["ALT-2143", "ALT-2141"],
    incidents: ["INC-2400"],
  },
  "vuln-chrome-sbx": {
    alerts: ["ALT-2148", "ALT-2145"],
    incidents: ["INC-2401"],
  },
  "vuln-exchange-ssrf": {
    alerts: ["ALT-2147", "ALT-2140"],
    incidents: ["INC-2402"],
  },
  "vuln-citrix-bleed2": {
    alerts: ["ALT-2146", "ALT-2139"],
    incidents: ["INC-2403"],
  },
  "vuln-ivanti-vpn": {
    alerts: ["ALT-2144", "ALT-2138"],
    incidents: ["INC-2404"],
  },
  "vuln-word-rce": { alerts: ["ALT-2142"], incidents: ["INC-2405"] },
  "vuln-outlook-eop": {
    alerts: ["ALT-2137", "ALT-2136"],
    incidents: ["INC-2406"],
  },
  "vuln-apache-log4j-residual": {
    alerts: ["ALT-2135", "ALT-2134"],
    incidents: ["INC-2407"],
  },
  "vuln-openssl-uaf": { alerts: ["ALT-2133"], incidents: [] },
  "vuln-teams-rce": { alerts: ["ALT-2132"], incidents: [] },
  "vuln-ntlm-relay": {
    alerts: ["ALT-2131", "ALT-2130"],
    incidents: ["INC-2408"],
  },
  "vuln-npm-supply": { alerts: ["ALT-2129"], incidents: ["INC-2409"] },
  "vuln-aks-escape": { alerts: ["ALT-2128"], incidents: [] },
  "vuln-aws-imds": { alerts: ["ALT-2127"], incidents: [] },
  "vuln-s3-public": { alerts: ["ALT-2126"], incidents: ["INC-2410"] },
  "vuln-docker-escape": { alerts: ["ALT-2125"], incidents: [] },
  "vuln-printnightmare-residual": {
    alerts: ["ALT-2124"],
    incidents: ["INC-2411"],
  },
  "vuln-zoom-rce": { alerts: ["ALT-2123"], incidents: [] },
};

function computeSocPriority(input: {
  severity: VulnSeverity;
  epss: number;
  exploitable: boolean;
  zeroDay: boolean;
  threats: VulnThreatType[];
  linkedAlertIds: string[];
  linkedIncidentIds: string[];
  exposedDevices: ExposedDevice[];
}): number {
  const severityBase = vulnSeverityWeight[input.severity] * 14;
  const epssScore = Math.round(input.epss * 35);
  const exploitBonus = input.exploitable ? 12 : 0;
  const zeroDayBonus = input.zeroDay ? 16 : 0;
  const threatBonus = Math.min(12, input.threats.length * 3);
  const alertBonus = Math.min(16, input.linkedAlertIds.length * 6);
  const incidentBonus = Math.min(18, input.linkedIncidentIds.length * 9);
  const maxAssetRisk = input.exposedDevices.reduce((max, d) => {
    const w = vulnSeverityWeight[d.criticality] * 20;
    return Math.max(max, w);
  }, 0);
  const assetBonus = Math.min(14, Math.round(maxAssetRisk / 6));

  return Math.min(
    100,
    severityBase +
      epssScore +
      exploitBonus +
      zeroDayBonus +
      threatBonus +
      alertBonus +
      incidentBonus +
      assetBonus,
  );
}

type VulnSeed = (typeof vulnSeeds)[number];

const controlCodePool = [
  "VM-01",
  "VM-02",
  "VM-03",
  "EP-01",
  "EP-02",
  "DP-01",
  "AC-01",
  "NS-01",
];

const severityWeights: Array<[VulnSeverity, number]> = [
  ["critical", 12],
  ["high", 28],
  ["medium", 40],
  ["low", 20],
];

function pickWeightedVuln<T>(weights: Array<[T, number]>, salt: number): T {
  const total = weights.reduce((sum, [, w]) => sum + w, 0);
  let cursor = ((salt * 2654435761) >>> 0) % total;
  for (const [value, weight] of weights) {
    if (cursor < weight) return value;
    cursor -= weight;
  }
  return weights[0]![0];
}

function normalizeVulnerability(seed: VulnSeed): Vulnerability {
  const { softwareNames, exposedSeed, threats, ...rest } = seed;
  const baseDevices = pickDevices(12, exposedSeed);
  const exposedDevices = expandExposed(
    baseDevices,
    Math.min(rest.exposedDeviceCount, 36),
  );
  const available = Math.max(
    0,
    rest.exposedDeviceCount - Math.floor(rest.exposedDeviceCount * 0.02),
  );
  const normalizedThreats = normalizeThreats(threats);
  const links = socFindingLinks[rest.id] ?? { alerts: [], incidents: [] };
  const linkedAlertIds = links.alerts;
  const linkedIncidentIds = links.incidents;
  const complianceControlIds =
    rest.complianceControlIds ??
    (rest.remediationRequired
      ? [controlCodePool[exposedSeed % controlCodePool.length]!]
      : undefined);
  const investigateQuery =
    rest.investigateQuery ?? `vuln.cve=${rest.cve} severity=${rest.severity}`;

  return {
    ...rest,
    threats: normalizedThreats,
    affectedSoftware: buildAffectedSoftware(softwareNames),
    exposedDevices,
    updateBreakdown: {
      available,
      scheduled: Math.floor(rest.exposedDeviceCount * 0.015),
      notAvailable: Math.floor(rest.exposedDeviceCount * 0.003),
      wontFix: Math.floor(rest.exposedDeviceCount * 0.002),
    },
    linkedAlertIds,
    linkedIncidentIds,
    complianceControlIds,
    investigateQuery,
    socPriority: computeSocPriority({
      severity: rest.severity,
      epss: rest.epss,
      exploitable: rest.exploitable,
      zeroDay: rest.zeroDay,
      threats: normalizedThreats,
      linkedAlertIds,
      linkedIncidentIds,
      exposedDevices,
    }),
  };
}

/** Target mock CVE catalog size — enough for findings pagination demos. */
export const VULN_CATALOG_SIZE = 150;

function buildGeneratedVulnerabilities(
  templates: Vulnerability[],
  count: number,
): Vulnerability[] {
  const generated: Vulnerability[] = [];
  let nextNum = 50001;

  for (let index = 0; index < count; index += 1) {
    const template = templates[index % templates.length]!;
    const severity = pickWeightedVuln(severityWeights, index * 3 + 7);
    const epss =
      severity === "critical"
        ? 0.55 + ((index * 7) % 40) / 100
        : severity === "high"
          ? 0.2 + ((index * 5) % 45) / 100
          : 0.02 + ((index * 3) % 25) / 100;
    const cvss =
      severity === "critical"
        ? 9 + (index % 10) / 10
        : severity === "high"
          ? 7 + (index % 20) / 10
          : severity === "medium"
            ? 4 + (index % 30) / 10
            : 1 + (index % 25) / 10;
    const ageDays = 3 + ((index * 11) % 900);
    const exposedDeviceCount =
      severity === "critical"
        ? 40 + ((index * 17) % 800)
        : severity === "high"
          ? 20 + ((index * 13) % 400)
          : 5 + ((index * 7) % 120);
    const cveYear = 2020 + (index % 7);
    const cve = `CVE-${cveYear}-${nextNum}`;
    const id = `vuln-synth-${String(index + 1).padStart(3, "0")}`;
    const softwareNames = template.affectedSoftware.map((s) => s.name);
    const controlA = controlCodePool[index % controlCodePool.length]!;
    const controlB = controlCodePool[(index + 3) % controlCodePool.length]!;

    const seed: VulnSeed = {
      id,
      cve,
      title: `${template.title} · sample ${index + 1}`,
      summary: `${template.summary} (Synthetic catalog row ${index + 1} for scale testing.)`,
      severity,
      cvss: Math.min(10, Math.round(cvss * 10) / 10),
      cvssVersion: template.cvssVersion,
      cvssVector: template.cvssVector,
      epss: Math.min(0.99, Math.round(epss * 100) / 100),
      ageLabel:
        ageDays < 30
          ? `${ageDays} days`
          : ageDays < 365
            ? `${Math.round(ageDays / 30)} months`
            : `${Math.round(ageDays / 365)} years`,
      ageDays,
      publishedAt: new Date(
        Date.UTC(2026, 6, 28) - ageDays * 86_400_000,
      ).toISOString(),
      firstDetectedAt: new Date(
        Date.UTC(2026, 6, 28) - (ageDays - 2) * 86_400_000,
      ).toISOString(),
      updatedAt: "2026-07-27T12:00:00.000Z",
      publishedLabel: `Sample ${index + 1}`,
      firstDetectedLabel: `Detected · sample ${index + 1}`,
      updatedLabel: "Jul 27, 2026",
      exploitable: severity === "critical" || severity === "high",
      zeroDay: severity === "critical" && index % 11 === 0,
      updateStatus: template.updateStatus,
      exposedDeviceCount,
      tags: [...template.tags.filter((t) => t !== "synthetic"), "synthetic"],
      threats: template.threats,
      cweIds: template.cweIds,
      recommendationId: template.recommendationId,
      scope: index % 5 === 0 ? "cloud" : template.scope,
      remediationRequired: severity !== "low",
      threatInsights: {
        ...template.threatInsights,
        publicExploit: severity === "critical" || severity === "high",
        verified: severity === "critical" && index % 2 === 0,
      },
      softwareNames:
        softwareNames.length > 0 ? softwareNames : ["Unknown package"],
      exposedSeed: index + 31,
      complianceControlIds: [controlA, controlB],
      investigateQuery: `vuln.cve=${cve} synth=${index + 1}`,
    };

    generated.push(normalizeVulnerability(seed));
    nextNum += 1;
  }

  return generated;
}

export function buildVulnCatalog(
  seeds: VulnSeed[] = vulnSeeds,
  size = VULN_CATALOG_SIZE,
): Vulnerability[] {
  const normalized = seeds.map((seed) => normalizeVulnerability(seed));
  if (normalized.length >= size) return normalized.slice(0, size);
  return [
    ...normalized,
    ...buildGeneratedVulnerabilities(normalized, size - normalized.length),
  ];
}

export const vulnerabilities: Vulnerability[] = buildVulnCatalog();

export type FindingSort =
  | "priority-desc"
  | "severity-desc"
  | "cvss-desc"
  | "exposed-desc"
  | "newest"
  | "oldest";

export const findingSortLabels: Record<FindingSort, string> = {
  "priority-desc": "SOC priority · high to low",
  "severity-desc": "Severity · high to low",
  "cvss-desc": "CVSS · high to low",
  "exposed-desc": "Exposed · high to low",
  newest: "Newest first",
  oldest: "Oldest first",
};

/** Unified remediation / mitigation work item for the Work queue. */
export type VulnWorkItem = {
  id: string;
  kind: "remediation" | "recommendation";
  title: string;
  status: string;
  ticketRef: string | null;
  ownerId: string | null;
  vulnerabilityIds: string[];
  linkedAlertIds: string[];
  devicesRemaining: number | null;
  devicesTotal: number;
  impactScore: number;
  hrefTarget: "rem" | "rec";
};

export function buildWorkQueue(
  remItems: Remediation[] = remediations,
  recItems: Recommendation[] = recommendations,
): VulnWorkItem[] {
  const fromRem: VulnWorkItem[] = remItems.map((r) => {
    const rec = getRecommendation(r.recommendationId);
    const vulnIds = r.vulnerabilityIds.length
      ? r.vulnerabilityIds
      : (rec?.vulnerabilityIds ?? []);
    const linkedAlertIds = Array.from(
      new Set(
        vulnIds.flatMap((id) => getVulnerability(id)?.linkedAlertIds ?? []),
      ),
    );
    return {
      id: r.id,
      kind: "remediation",
      title: r.title,
      status: r.status,
      ticketRef: r.ticketRef,
      ownerId: r.ownerId,
      vulnerabilityIds: vulnIds,
      linkedAlertIds,
      devicesRemaining: r.devicesRemaining,
      devicesTotal: r.devicesTotal,
      impactScore: rec?.impactScore ?? 0,
      hrefTarget: "rem",
    };
  });

  const remRecIds = new Set(remItems.map((r) => r.recommendationId));
  const fromRec: VulnWorkItem[] = recItems
    .filter((r) => !remRecIds.has(r.id) && r.status !== "completed")
    .map((r) => {
      const linkedAlertIds = Array.from(
        new Set(
          r.vulnerabilityIds.flatMap(
            (id) => getVulnerability(id)?.linkedAlertIds ?? [],
          ),
        ),
      );
      return {
        id: r.id,
        kind: "recommendation",
        title: r.title,
        status: r.status,
        ticketRef: null,
        ownerId: null,
        vulnerabilityIds: r.vulnerabilityIds,
        linkedAlertIds,
        devicesRemaining: r.exposedDevices,
        devicesTotal: r.totalDevices,
        impactScore: r.impactScore,
        hrefTarget: "rec",
      };
    });

  return [...fromRem, ...fromRec].sort((a, b) => {
    const aOpen = a.status === "completed" || a.status === "exception" ? 1 : 0;
    const bOpen = b.status === "completed" || b.status === "exception" ? 1 : 0;
    if (aOpen !== bOpen) return aOpen - bOpen;
    return b.impactScore - a.impactScore;
  });
}

/** Per-device blast radius for Exposure view. */
export type DeviceExposure = {
  deviceId: string;
  hostname: string;
  platform: string;
  riskScore: number;
  vulnerabilityCount: number;
  findingIds: string[];
  maxPriority: number;
  hasActiveThreat: boolean;
  linkedAlertCount: number;
  internetFacing: boolean;
  maxCriticality: VulnSeverity;
};

export function getDeviceExposureRollup(): DeviceExposure[] {
  const byDevice = new Map<string, DeviceExposure>();

  for (const device of assetDevices) {
    byDevice.set(device.id, {
      deviceId: device.id,
      hostname: device.hostname,
      platform: device.platform,
      riskScore: device.riskScore,
      vulnerabilityCount: 0,
      findingIds: [],
      maxPriority: 0,
      hasActiveThreat: false,
      linkedAlertCount: 0,
      internetFacing: false,
      maxCriticality: "low",
    });
  }

  for (const finding of vulnerabilities) {
    for (const exposed of finding.exposedDevices) {
      const row = byDevice.get(exposed.deviceId);
      if (!row) continue;
      row.vulnerabilityCount += 1;
      row.findingIds.push(finding.id);
      row.maxPriority = Math.max(row.maxPriority, finding.socPriority);
      if (
        finding.threats.includes("active-threat") ||
        finding.linkedAlertIds.length > 0
      ) {
        row.hasActiveThreat = true;
      }
      row.linkedAlertCount += finding.linkedAlertIds.length;
      if (exposed.tags.includes("Internet facing")) {
        row.internetFacing = true;
      }
      if (
        vulnSeverityWeight[exposed.criticality] >
        vulnSeverityWeight[row.maxCriticality]
      ) {
        row.maxCriticality = exposed.criticality;
      }
    }
  }

  return Array.from(byDevice.values())
    .filter((d) => d.vulnerabilityCount > 0)
    .sort(
      (a, b) =>
        Number(b.internetFacing) - Number(a.internetFacing) ||
        vulnSeverityWeight[b.maxCriticality] -
          vulnSeverityWeight[a.maxCriticality] ||
        b.maxPriority - a.maxPriority ||
        b.vulnerabilityCount - a.vulnerabilityCount ||
        b.riskScore - a.riskScore,
    );
}

export function getFindingOverviewStats(
  items: Iterable<Vulnerability> = vulnerabilities,
): VulnStat[] {
  const list = Array.from(items);
  const withAlerts = list.filter((v) => v.linkedAlertIds.length > 0).length;
  const withIncidents = list.filter(
    (v) => v.linkedIncidentIds.length > 0,
  ).length;
  const exploitable = list.filter((v) => v.exploitable).length;
  const criticalOpen = list.filter((v) => v.severity === "critical").length;
  const avgPriority =
    list.length === 0
      ? 0
      : Math.round(list.reduce((s, v) => s + v.socPriority, 0) / list.length);

  return [
    {
      key: "priority",
      title: "Avg SOC priority",
      value: String(avgPriority),
      context: "Across open findings",
      delta: 4.2,
      preferLower: true,
    },
    {
      key: "with-alerts",
      title: "Linked to alerts",
      value: String(withAlerts),
      context: "Active detection coverage",
      delta: 12.0,
      preferLower: false,
      href: "/vulnerabilities/findings?alerts=1",
    },
    {
      key: "with-incidents",
      title: "In incidents",
      value: String(withIncidents),
      context: "Escalated IR cases",
      delta: 8.0,
      preferLower: false,
      href: "/vulnerabilities/findings?incidents=1",
    },
    {
      key: "exploitable",
      title: "Exploitable",
      value: String(exploitable),
      context: "Public or verified path",
      delta: 3.1,
      preferLower: true,
      href: "/vulnerabilities/findings?exploitable=1",
    },
    {
      key: "critical",
      title: "Critical findings",
      value: String(criticalOpen),
      context: "Severity critical",
      delta: -1.5,
      preferLower: true,
      href: "/vulnerabilities/findings?severity=critical",
    },
  ];
}

/** Decision-oriented KPIs for Overview risk digest. */
export function getDecisionOverviewStats(
  remItems: Remediation[] = remediations,
): VulnStat[] {
  const exploitableCritical = vulnerabilities.filter(
    (v) => v.exploitable && v.severity === "critical",
  ).length;
  const activeExploitation = vulnerabilities.filter(
    (v) => v.linkedAlertIds.length > 0,
  ).length;
  const exposure = getDeviceExposureRollup();
  const criticalAssets = exposure.filter(
    (d) =>
      d.internetFacing || d.maxCriticality === "critical" || d.riskScore >= 70,
  ).length;
  const openRem = remItems.filter(
    (r) => r.status === "pending" || r.status === "in_progress",
  );
  const now = Date.now();
  const overdue = openRem.filter(
    (r) => new Date(r.dueAt).getTime() < now,
  ).length;

  return [
    {
      key: "exploitable-critical",
      title: "Exploitable criticals",
      value: String(exploitableCritical),
      context: "Must-fix board items",
      delta: 4.8,
      preferLower: true,
      href: "/vulnerabilities/findings?severity=critical&exploitable=1",
    },
    {
      key: "active-exploitation",
      title: "Active exploitation",
      value: String(activeExploitation),
      context: "Findings with linked alerts",
      delta: 9.2,
      preferLower: true,
      href: "/vulnerabilities/findings?alerts=1",
    },
    {
      key: "critical-blast",
      title: "Critical asset blast",
      value: String(criticalAssets),
      context: "Internet-facing or high criticality",
      delta: 2.1,
      preferLower: true,
      href: "/vulnerabilities/exposure?internet=1&critical=1",
    },
    {
      key: "backlog-aging",
      title: "Overdue remediations",
      value: String(overdue),
      context: `${openRem.length} open in queue`,
      delta: overdue > 0 ? 6.4 : -2.0,
      preferLower: true,
      href: "/vulnerabilities/work?kind=remediation&status=pending,in_progress",
    },
  ];
}

export type RiskNarrativeItem = {
  id: string;
  cve: string;
  title: string;
  reason: string;
  socPriority: number;
};

export function getRiskNarrativeItems(limit = 3): RiskNarrativeItem[] {
  return [...vulnerabilities]
    .filter(
      (v) =>
        v.exploitable ||
        v.linkedAlertIds.length > 0 ||
        v.zeroDay ||
        v.severity === "critical",
    )
    .sort((a, b) => b.socPriority - a.socPriority)
    .slice(0, limit)
    .map((v) => {
      const reasons: string[] = [];
      if (v.zeroDay) reasons.push("zero-day");
      if (v.exploitable) reasons.push("exploitable");
      if (v.linkedAlertIds.length > 0) reasons.push("linked alerts");
      if (v.severity === "critical") reasons.push("critical severity");
      return {
        id: v.id,
        cve: v.cve,
        title: v.title,
        reason: reasons.slice(0, 2).join(" · ") || "high SOC priority",
        socPriority: v.socPriority,
      };
    });
}

export function getBacklogAgingSummary(
  remItems: Remediation[] = remediations,
): { overdue: number; open: number; oldestDays: number } {
  const open = remItems.filter(
    (r) => r.status === "pending" || r.status === "in_progress",
  );
  const now = Date.now();
  const overdue = open.filter((r) => new Date(r.dueAt).getTime() < now);
  let oldestDays = 0;
  for (const r of open) {
    const age = Math.max(
      0,
      Math.floor((now - new Date(r.createdAt).getTime()) / 86400000),
    );
    oldestDays = Math.max(oldestDays, age);
  }
  return { overdue: overdue.length, open: open.length, oldestDays };
}

export function getVulnerability(id: string) {
  return vulnerabilities.find((v) => v.id === id) ?? null;
}

export function getVulnerabilityByCve(cve: string) {
  return (
    vulnerabilities.find((v) => v.cve.toLowerCase() === cve.toLowerCase()) ??
    null
  );
}

/* -------------------------------------------------------------------------- */
/* Recommendations                                                            */
/* -------------------------------------------------------------------------- */

const recommendationSeeds: Recommendation[] = [
  {
    id: "rec-block-exe-asr",
    title:
      "Block executable files from running unless they meet prevalence, age, or trusted list criteria",
    description:
      "Enable Attack Surface Reduction rule to block untrusted executables on endpoints, reducing malware execution paths.",
    osPlatform: "Windows",
    weaknessCount: 1,
    exposedDevices: 2240,
    totalDevices: 2240,
    exposedCriticalDevices: 44,
    relatedComponent: "Security controls (Attack Surface Reduction)",
    threats: ["active-threat", "ransomware"],
    status: "active",
    impactScore: 6.2,
    vulnerabilityIds: [],
    remediationIds: ["rem-asr-block"],
    scope: "endpoint",
    tags: ["ASR"],
  },
  {
    id: "rec-update-teams",
    title: "Update Microsoft Teams",
    description:
      "Deploy the latest Teams desktop client to remediate CVE-2026-31288 and related memory corruption issues.",
    osPlatform: "Windows",
    weaknessCount: 6,
    exposedDevices: 2240,
    totalDevices: 2240,
    exposedCriticalDevices: 26,
    relatedComponent: "Microsoft Teams",
    threats: ["exploit-public"],
    status: "active",
    impactScore: 5.8,
    vulnerabilityIds: ["vuln-teams-rce"],
    remediationIds: ["rem-teams-rollout"],
    scope: "endpoint",
    tags: [],
  },
  {
    id: "rec-disable-ntlm",
    title: "Disable NTLM authentication",
    description:
      "Restrict NTLM and enforce Kerberos / SMB signing to mitigate relay and credential theft scenarios.",
    osPlatform: "Windows",
    weaknessCount: 3,
    exposedDevices: 1840,
    totalDevices: 2100,
    exposedCriticalDevices: 38,
    relatedComponent: "Network",
    threats: ["active-threat"],
    status: "in-progress",
    impactScore: 4.9,
    vulnerabilityIds: ["vuln-ntlm-relay"],
    remediationIds: ["rem-ntlm-harden"],
    scope: "endpoint",
    tags: [],
  },
  {
    id: "rec-update-openssl",
    title: "Update OpenSSL / crypto libraries",
    description:
      "Patch OpenSSL builds affected by CVE-2026-45447 across servers and developer workstations.",
    osPlatform: "Linux",
    weaknessCount: 4,
    exposedDevices: 1771,
    totalDevices: 1900,
    exposedCriticalDevices: 52,
    relatedComponent: "OpenSSL",
    threats: ["exploit-public", "active-threat"],
    status: "active",
    impactScore: 5.1,
    vulnerabilityIds: ["vuln-openssl-uaf"],
    remediationIds: [],
    scope: "endpoint",
    tags: ["Internet facing"],
  },
  {
    id: "rec-update-office",
    title: "Update Microsoft Office / Word",
    description:
      "Apply current Office security updates to close CVE-2023-21716 exposure on remaining devices.",
    osPlatform: "Windows",
    weaknessCount: 2,
    exposedDevices: 9,
    totalDevices: 2100,
    exposedCriticalDevices: 9,
    relatedComponent: "Microsoft Office",
    threats: ["exploit-verified", "ransomware"],
    status: "active",
    impactScore: 3.4,
    vulnerabilityIds: ["vuln-word-rce"],
    remediationIds: [],
    scope: "endpoint",
    tags: [],
  },
  {
    id: "rec-update-outlook",
    title: "Update Microsoft Outlook",
    description:
      "Remediate CVE-2023-23397 by deploying patched Outlook builds and disabling legacy preview paths where needed.",
    osPlatform: "Windows",
    weaknessCount: 2,
    exposedDevices: 9,
    totalDevices: 2100,
    exposedCriticalDevices: 9,
    relatedComponent: "Microsoft Outlook",
    threats: ["exploit-verified", "active-threat"],
    status: "active",
    impactScore: 3.2,
    vulnerabilityIds: ["vuln-outlook-eop"],
    remediationIds: [],
    scope: "endpoint",
    tags: [],
  },
  {
    id: "rec-update-chrome",
    title: "Update Google Chrome / Edge Chromium",
    description:
      "Force update Chromium-based browsers to remediate the sandbox escape zero-day.",
    osPlatform: "Windows",
    weaknessCount: 8,
    exposedDevices: 890,
    totalDevices: 2000,
    exposedCriticalDevices: 61,
    relatedComponent: "Google Chrome",
    threats: ["exploit-verified", "exploit-kit"],
    status: "active",
    impactScore: 7.1,
    vulnerabilityIds: ["vuln-chrome-sbx"],
    remediationIds: ["rem-chrome-force"],
    scope: "endpoint",
    tags: [],
  },
  {
    id: "rec-update-firefox",
    title: "Update Mozilla Firefox",
    description:
      "Roll out Firefox 141+ to clear the latest memory-safety advisory cluster.",
    osPlatform: "Windows",
    weaknessCount: 60,
    exposedDevices: 2060,
    totalDevices: 2800,
    exposedCriticalDevices: 18,
    relatedComponent: "Mozilla Firefox",
    threats: [],
    status: "active",
    impactScore: 2.8,
    vulnerabilityIds: ["vuln-firefox-mem"],
    remediationIds: [],
    scope: "endpoint",
    tags: [],
  },
  {
    id: "rec-patch-windows",
    title: "Install latest Windows security updates",
    description:
      "Deploy the June/July cumulative updates addressing kernel EoP CVE-2026-33045.",
    osPlatform: "Windows",
    weaknessCount: 12,
    exposedDevices: 1520,
    totalDevices: 2200,
    exposedCriticalDevices: 33,
    relatedComponent: "Operating system",
    threats: [],
    status: "in-progress",
    impactScore: 4.2,
    vulnerabilityIds: ["vuln-win11-kernel"],
    remediationIds: ["rem-win-cu"],
    scope: "endpoint",
    tags: [],
  },
  {
    id: "rec-update-java",
    title: "Update Oracle Java SE",
    description:
      "Upgrade Java runtimes on build and app servers to remediate deserialization CVE-2026-21915.",
    osPlatform: "Windows",
    weaknessCount: 5,
    exposedDevices: 412,
    totalDevices: 500,
    exposedCriticalDevices: 14,
    relatedComponent: "Oracle Java SE",
    threats: ["exploit-public"],
    status: "active",
    impactScore: 3.9,
    vulnerabilityIds: ["vuln-oracle-compat"],
    remediationIds: [],
    scope: "endpoint",
    tags: [],
  },
  {
    id: "rec-harden-adcs",
    title: "Harden Active Directory Certificate Services",
    description:
      "Remove ESC1-capable templates, enforce manager approval, and audit enrollment permissions for CertiGhost.",
    osPlatform: "Windows",
    weaknessCount: 1,
    exposedDevices: 3,
    totalDevices: 12,
    exposedCriticalDevices: 3,
    relatedComponent: "Active Directory",
    threats: ["exploit-verified", "active-threat"],
    status: "active",
    impactScore: 8.4,
    vulnerabilityIds: ["vuln-adcs-eop"],
    remediationIds: [],
    scope: "endpoint",
    tags: ["Zero-day"],
  },
  {
    id: "rec-harden-azure-rbac",
    title: "Harden Azure custom RBAC roles",
    description:
      "Remove wildcard Actions from custom roles and scope assignments to least privilege.",
    osPlatform: "Azure",
    weaknessCount: 2,
    exposedDevices: 128,
    totalDevices: 340,
    exposedCriticalDevices: 12,
    relatedComponent: "Azure RBAC",
    threats: [],
    status: "active",
    impactScore: 4.0,
    vulnerabilityIds: ["vuln-azure-rbac"],
    remediationIds: [],
    scope: "cloud",
    tags: [],
  },
  {
    id: "rec-restrict-hostpath",
    title: "Restrict privileged hostPath mounts on AKS",
    description:
      "Enforce Pod Security Standards and Gatekeeper policies blocking hostPath escapes.",
    osPlatform: "Azure",
    weaknessCount: 3,
    exposedDevices: 64,
    totalDevices: 90,
    exposedCriticalDevices: 8,
    relatedComponent: "Azure Kubernetes Service",
    threats: ["exploit-public", "active-threat"],
    status: "active",
    impactScore: 5.5,
    vulnerabilityIds: ["vuln-aks-escape"],
    remediationIds: ["rem-aks-pss"],
    scope: "cloud",
    tags: ["Internet facing"],
  },
  {
    id: "rec-onboard-devices",
    title: "Onboard unprotected devices to endpoint protection",
    description:
      "34 discovered devices lack the SOC agent. Onboard them to restore visibility and vulnerability assessment.",
    osPlatform: "Windows",
    weaknessCount: 0,
    exposedDevices: 34,
    totalDevices: 34,
    exposedCriticalDevices: 4,
    relatedComponent: "Endpoint protection",
    threats: [],
    status: "active",
    impactScore: 2.1,
    vulnerabilityIds: [],
    remediationIds: [],
    scope: "endpoint",
    tags: ["Onboarding"],
  },
  {
    id: "rec-patch-exchange",
    title: "Patch Microsoft Exchange Server",
    description:
      "Apply the July security update for Exchange SSRF/RCE (CVE-2026-27701) on all mail servers.",
    osPlatform: "Windows",
    weaknessCount: 2,
    exposedDevices: 6,
    totalDevices: 8,
    exposedCriticalDevices: 6,
    relatedComponent: "Microsoft Exchange",
    threats: ["exploit-verified", "active-threat", "ransomware"],
    status: "active",
    impactScore: 8.9,
    vulnerabilityIds: ["vuln-exchange-ssrf"],
    remediationIds: ["rem-exchange-patch"],
    scope: "endpoint",
    tags: ["Mail", "Internet facing"],
  },
  {
    id: "rec-update-zoom",
    title: "Update Zoom Workplace clients",
    description:
      "Force-update Zoom desktop clients to remediate media engine RCE CVE-2026-36110.",
    osPlatform: "Windows",
    weaknessCount: 3,
    exposedDevices: 1340,
    totalDevices: 1500,
    exposedCriticalDevices: 22,
    relatedComponent: "Zoom",
    threats: ["exploit-public", "exploit-kit"],
    status: "active",
    impactScore: 5.4,
    vulnerabilityIds: ["vuln-zoom-rce"],
    remediationIds: [],
    scope: "endpoint",
    tags: ["Collaboration"],
  },
  {
    id: "rec-patch-citrix",
    title: "Patch Citrix ADC / Gateway appliances",
    description:
      "Emergency patch for memory disclosure CVE-2026-49622; rotate sessions after upgrade.",
    osPlatform: "Linux",
    weaknessCount: 2,
    exposedDevices: 4,
    totalDevices: 4,
    exposedCriticalDevices: 4,
    relatedComponent: "Citrix ADC",
    threats: ["exploit-verified", "active-threat", "ransomware"],
    status: "in-progress",
    impactScore: 9.2,
    vulnerabilityIds: ["vuln-citrix-bleed2"],
    remediationIds: ["rem-citrix-patch"],
    scope: "endpoint",
    tags: ["VPN", "Internet facing"],
  },
  {
    id: "rec-eradicate-log4j",
    title: "Eradicate residual Log4j 2.x",
    description:
      "Remove or upgrade remaining Log4j builds on build agents and appliances (CVE-2021-44228).",
    osPlatform: "Linux",
    weaknessCount: 1,
    exposedDevices: 28,
    totalDevices: 40,
    exposedCriticalDevices: 12,
    relatedComponent: "Apache Log4j",
    threats: ["exploit-verified", "ransomware", "exploit-kit"],
    status: "active",
    impactScore: 7.6,
    vulnerabilityIds: ["vuln-apache-log4j-residual"],
    remediationIds: [],
    scope: "endpoint",
    tags: ["Legacy"],
  },
  {
    id: "rec-patch-ivanti",
    title: "Patch Ivanti Connect Secure",
    description:
      "Apply vendor hotfix for auth bypass CVE-2026-21893 and reset admin credentials.",
    osPlatform: "Linux",
    weaknessCount: 1,
    exposedDevices: 2,
    totalDevices: 2,
    exposedCriticalDevices: 2,
    relatedComponent: "Ivanti Connect Secure",
    threats: ["exploit-verified", "active-threat"],
    status: "active",
    impactScore: 9.0,
    vulnerabilityIds: ["vuln-ivanti-vpn"],
    remediationIds: ["rem-ivanti-hotfix"],
    scope: "endpoint",
    tags: ["VPN", "Zero-day"],
  },
  {
    id: "rec-pin-npm",
    title: "Pin npm dependencies and block ux-utils",
    description:
      "Block compromised ux-utils versions, rotate CI secrets, and enforce lockfile integrity.",
    osPlatform: "Linux",
    weaknessCount: 1,
    exposedDevices: 86,
    totalDevices: 120,
    exposedCriticalDevices: 8,
    relatedComponent: "Node.js / npm",
    threats: ["active-threat", "exploit-public"],
    status: "in-progress",
    impactScore: 6.8,
    vulnerabilityIds: ["vuln-npm-supply"],
    remediationIds: ["rem-npm-block"],
    scope: "endpoint",
    tags: ["Supply chain"],
  },
  {
    id: "rec-update-odbc",
    title: "Update Microsoft ODBC Driver",
    description:
      "Deploy ODBC Driver 18.4+ to remediate heap overflow CVE-2026-31944.",
    osPlatform: "Windows",
    weaknessCount: 2,
    exposedDevices: 640,
    totalDevices: 800,
    exposedCriticalDevices: 15,
    relatedComponent: "Microsoft ODBC",
    threats: ["exploit-public"],
    status: "active",
    impactScore: 3.7,
    vulnerabilityIds: ["vuln-sql-odbc"],
    remediationIds: [],
    scope: "endpoint",
    tags: [],
  },
  {
    id: "rec-patch-macos",
    title: "Install latest macOS security update",
    description:
      "Push Sequoia security update addressing TCC bypass CVE-2026-40555.",
    osPlatform: "macOS",
    weaknessCount: 1,
    exposedDevices: 210,
    totalDevices: 260,
    exposedCriticalDevices: 9,
    relatedComponent: "macOS",
    threats: ["exploit-verified", "active-threat"],
    status: "active",
    impactScore: 4.5,
    vulnerabilityIds: ["vuln-macos-tcc"],
    remediationIds: [],
    scope: "endpoint",
    tags: ["macOS"],
  },
  {
    id: "rec-enforce-imdsv2",
    title: "Enforce IMDSv2 on all EC2 instances",
    description:
      "Require IMDSv2 hop limit and disable IMDSv1 across the AWS fleet.",
    osPlatform: "Linux",
    weaknessCount: 1,
    exposedDevices: 94,
    totalDevices: 140,
    exposedCriticalDevices: 20,
    relatedComponent: "Amazon EC2",
    threats: ["active-threat", "exploit-public"],
    status: "active",
    impactScore: 6.1,
    vulnerabilityIds: ["vuln-aws-imds"],
    remediationIds: [],
    scope: "cloud",
    tags: ["AWS"],
  },
  {
    id: "rec-lock-s3",
    title: "Lock down public S3 buckets",
    description:
      "Block public ACLs, enable Block Public Access, and rotate exposed objects.",
    osPlatform: "Linux",
    weaknessCount: 1,
    exposedDevices: 7,
    totalDevices: 42,
    exposedCriticalDevices: 7,
    relatedComponent: "Amazon S3",
    threats: ["active-threat"],
    status: "active",
    impactScore: 8.7,
    vulnerabilityIds: ["vuln-s3-public"],
    remediationIds: ["rem-s3-lock"],
    scope: "cloud",
    tags: ["Data exposure"],
  },
  {
    id: "rec-update-containerd",
    title: "Update containerd on node pools",
    description:
      "Roll node images with patched containerd to close privilege escalation CVE-2026-44770.",
    osPlatform: "Azure",
    weaknessCount: 2,
    exposedDevices: 48,
    totalDevices: 64,
    exposedCriticalDevices: 10,
    relatedComponent: "containerd",
    threats: ["exploit-public", "exploit-verified"],
    status: "active",
    impactScore: 5.9,
    vulnerabilityIds: ["vuln-docker-escape"],
    remediationIds: [],
    scope: "cloud",
    tags: ["Containers"],
  },
  {
    id: "rec-restrict-vscode-ext",
    title: "Restrict untrusted VS Code extensions",
    description:
      "Remove Material Theme vulnerable builds and enforce extension allowlists.",
    osPlatform: "Windows",
    weaknessCount: 1,
    exposedDevices: 320,
    totalDevices: 450,
    exposedCriticalDevices: 5,
    relatedComponent: "Visual Studio Code",
    threats: ["exploit-public"],
    status: "deferred",
    impactScore: 2.4,
    vulnerabilityIds: ["vuln-vscode-ext"],
    remediationIds: [],
    scope: "endpoint",
    tags: ["Developer tools"],
  },
  {
    id: "rec-disable-spooler",
    title: "Disable Print Spooler on servers",
    description:
      "Disable spooler on DCs and non-print servers to eliminate PrintNightmare residual risk.",
    osPlatform: "Windows",
    weaknessCount: 1,
    exposedDevices: 18,
    totalDevices: 120,
    exposedCriticalDevices: 6,
    relatedComponent: "Print Spooler",
    threats: ["exploit-verified", "exploit-kit", "active-threat"],
    status: "active",
    impactScore: 5.0,
    vulnerabilityIds: ["vuln-printnightmare-residual"],
    remediationIds: [],
    scope: "endpoint",
    tags: ["Domain controllers"],
  },
];

const REC_CATALOG_SIZE = 50;
const recommendationStatusesCycle: RecommendationStatus[] = [
  "active",
  "in-progress",
  "active",
  "deferred",
  "active",
  "completed",
  "exception",
];
const recommendationTitleVariants = [
  "Patch remaining hosts for",
  "Enforce control baseline on",
  "Roll out emergency update for",
  "Harden configuration of",
  "Retire vulnerable builds of",
  "Apply vendor hotfix for",
  "Quarantine internet-facing",
  "Complete ring deployment for",
];

function buildGeneratedRecommendations(
  templates: Recommendation[],
  count: number,
): Recommendation[] {
  const generated: Recommendation[] = [];
  for (let index = 0; index < count; index += 1) {
    const template = templates[index % templates.length]!;
    const n = index + 1;
    const prefix =
      recommendationTitleVariants[index % recommendationTitleVariants.length]!;
    const exposedDevices = Math.max(
      1,
      Math.round(template.exposedDevices * (0.35 + (index % 7) * 0.09)),
    );
    const totalDevices = Math.max(
      exposedDevices,
      Math.round(template.totalDevices * (0.6 + (index % 5) * 0.08)),
    );
    generated.push({
      ...template,
      id: `rec-${String(n).padStart(3, "0")}`,
      title: `${prefix} ${template.relatedComponent}`,
      description: `${template.description} (Expanded seed ${n} for list pagination.)`,
      weaknessCount: Math.max(1, (template.weaknessCount || 1) + (index % 5)),
      exposedDevices,
      totalDevices,
      exposedCriticalDevices: Math.min(
        exposedDevices,
        Math.max(0, template.exposedCriticalDevices + (index % 4) - 1),
      ),
      status:
        recommendationStatusesCycle[
          index % recommendationStatusesCycle.length
        ]!,
      impactScore: Math.min(
        9.9,
        Math.round((template.impactScore + ((index % 9) - 4) * 0.15) * 10) / 10,
      ),
      scope: index % 4 === 0 ? "cloud" : template.scope,
      tags: [...template.tags.filter((t) => t !== "synthetic"), "synthetic"],
      remediationIds: [],
    });
  }
  return generated;
}

export const recommendations: Recommendation[] = [
  ...recommendationSeeds,
  ...buildGeneratedRecommendations(
    recommendationSeeds,
    Math.max(0, REC_CATALOG_SIZE - recommendationSeeds.length),
  ),
];

export function getRecommendation(id: string) {
  return recommendations.find((r) => r.id === id) ?? null;
}

/* -------------------------------------------------------------------------- */
/* Remediations                                                               */
/* -------------------------------------------------------------------------- */

const remediationSeeds: Remediation[] = [
  {
    id: "rem-asr-block",
    title: "Roll out ASR executable block rule",
    recommendationId: "rec-block-exe-asr",
    ownerId: owners[1],
    status: "in_progress",
    ticketRef: "VRM-1842",
    devicesTotal: 2240,
    devicesRemaining: 810,
    createdAt: "2026-07-10T10:00:00.000Z",
    dueAt: "2026-08-01T17:00:00.000Z",
    completedAt: null,
    createdLabel: "Jul 10, 2026",
    dueLabel: "Aug 1, 2026",
    vulnerabilityIds: [],
    deviceSample: ["WS-SOC-0007", "LAP-FIN-0142", "DESK-HR-0088"],
    timeline: [
      {
        at: "2026-07-10T10:00:00.000Z",
        label: "Remediation created",
        status: "pending",
      },
      {
        at: "2026-07-12T09:00:00.000Z",
        label: "Pilot ring started",
        status: "in_progress",
        note: "SOC + Finance rings",
      },
    ],
  },
  {
    id: "rem-teams-rollout",
    title: "Force update Microsoft Teams clients",
    recommendationId: "rec-update-teams",
    ownerId: owners[2],
    status: "pending",
    ticketRef: "VRM-1901",
    devicesTotal: 2240,
    devicesRemaining: 2240,
    createdAt: "2026-07-22T14:00:00.000Z",
    dueAt: "2026-08-05T17:00:00.000Z",
    completedAt: null,
    createdLabel: "Jul 22, 2026",
    dueLabel: "Aug 5, 2026",
    vulnerabilityIds: ["vuln-teams-rce"],
    deviceSample: ["LAP-SAL-0220", "MBP-DES-0331", "WS-DATA-0021"],
    timeline: [
      {
        at: "2026-07-22T14:00:00.000Z",
        label: "Remediation created",
        status: "pending",
      },
    ],
  },
  {
    id: "rem-ntlm-harden",
    title: "Disable NTLM on domain controllers & member servers",
    recommendationId: "rec-disable-ntlm",
    ownerId: owners[0],
    status: "in_progress",
    ticketRef: "VRM-1766",
    devicesTotal: 1840,
    devicesRemaining: 640,
    createdAt: "2026-07-01T11:00:00.000Z",
    dueAt: "2026-07-31T17:00:00.000Z",
    completedAt: null,
    createdLabel: "Jul 1, 2026",
    dueLabel: "Jul 31, 2026",
    vulnerabilityIds: ["vuln-ntlm-relay"],
    deviceSample: ["srv-auth-01", "srv-siem-02", "srv-mail-01"],
    timeline: [
      {
        at: "2026-07-01T11:00:00.000Z",
        label: "Remediation created",
        status: "pending",
      },
      {
        at: "2026-07-08T10:00:00.000Z",
        label: "GPO draft approved",
        status: "in_progress",
      },
    ],
  },
  {
    id: "rem-chrome-force",
    title: "Emergency Chrome / Edge force-update",
    recommendationId: "rec-update-chrome",
    ownerId: owners[3] ?? owners[0],
    status: "in_progress",
    ticketRef: "VRM-1918",
    devicesTotal: 890,
    devicesRemaining: 210,
    createdAt: "2026-07-22T16:00:00.000Z",
    dueAt: "2026-07-29T17:00:00.000Z",
    completedAt: null,
    createdLabel: "Jul 22, 2026",
    dueLabel: "Jul 29, 2026",
    vulnerabilityIds: ["vuln-chrome-sbx"],
    deviceSample: ["LAP-IR-0015", "WS-QA-0033", "DESK-SUP-0102"],
    timeline: [
      {
        at: "2026-07-22T16:00:00.000Z",
        label: "Emergency remediation opened",
        status: "pending",
        note: "Zero-day response",
      },
      {
        at: "2026-07-23T08:00:00.000Z",
        label: "Intune policy live",
        status: "in_progress",
      },
    ],
  },
  {
    id: "rem-win-cu",
    title: "Deploy Windows cumulative updates",
    recommendationId: "rec-patch-windows",
    ownerId: owners[1],
    status: "in_progress",
    ticketRef: "VRM-1820",
    devicesTotal: 1520,
    devicesRemaining: 480,
    createdAt: "2026-07-05T09:00:00.000Z",
    dueAt: "2026-08-08T17:00:00.000Z",
    completedAt: null,
    createdLabel: "Jul 5, 2026",
    dueLabel: "Aug 8, 2026",
    vulnerabilityIds: ["vuln-win11-kernel"],
    deviceSample: ["LAP-LEG-0056", "DESK-FIN-0071", "srv-erp-legacy"],
    timeline: [
      {
        at: "2026-07-05T09:00:00.000Z",
        label: "Remediation created",
        status: "pending",
      },
      {
        at: "2026-07-15T12:00:00.000Z",
        label: "Ring 1–2 complete",
        status: "in_progress",
      },
    ],
  },
  {
    id: "rem-aks-pss",
    title: "Enforce PSS / Gatekeeper hostPath deny",
    recommendationId: "rec-restrict-hostpath",
    ownerId: owners[4] ?? owners[1],
    status: "pending",
    ticketRef: "VRM-1888",
    devicesTotal: 64,
    devicesRemaining: 64,
    createdAt: "2026-07-20T13:00:00.000Z",
    dueAt: "2026-08-10T17:00:00.000Z",
    completedAt: null,
    createdLabel: "Jul 20, 2026",
    dueLabel: "Aug 10, 2026",
    vulnerabilityIds: ["vuln-aks-escape"],
    deviceSample: ["aks-prod-node-12", "aks-prod-node-07"],
    timeline: [
      {
        at: "2026-07-20T13:00:00.000Z",
        label: "Remediation created",
        status: "pending",
      },
    ],
  },
  {
    id: "rem-java-legacy",
    title: "Retire legacy Java 8 runtimes",
    recommendationId: "rec-update-java",
    ownerId: owners[2],
    status: "exception",
    ticketRef: "VRM-1702",
    devicesTotal: 40,
    devicesRemaining: 40,
    createdAt: "2026-06-18T10:00:00.000Z",
    dueAt: "2026-07-15T17:00:00.000Z",
    completedAt: null,
    createdLabel: "Jun 18, 2026",
    dueLabel: "Jul 15, 2026",
    vulnerabilityIds: ["vuln-oracle-compat"],
    deviceSample: ["srv-erp-legacy", "srv-ci-07"],
    timeline: [
      {
        at: "2026-06-18T10:00:00.000Z",
        label: "Remediation created",
        status: "pending",
      },
      {
        at: "2026-07-12T15:00:00.000Z",
        label: "Exception granted — ERP vendor lock",
        status: "exception",
        note: "Expires Oct 2026",
      },
    ],
  },
  {
    id: "rec-done-firefox-pilot",
    title: "Firefox pilot update (HQ)",
    recommendationId: "rec-update-firefox",
    ownerId: owners[5] ?? owners[0],
    status: "completed",
    ticketRef: "VRM-1690",
    devicesTotal: 120,
    devicesRemaining: 0,
    createdAt: "2026-07-02T09:00:00.000Z",
    dueAt: "2026-07-12T17:00:00.000Z",
    completedAt: "2026-07-11T16:00:00.000Z",
    createdLabel: "Jul 2, 2026",
    dueLabel: "Jul 12, 2026",
    vulnerabilityIds: ["vuln-firefox-mem"],
    deviceSample: ["MBP-MKT-0118", "LAP-FIN-0142"],
    timeline: [
      {
        at: "2026-07-02T09:00:00.000Z",
        label: "Remediation created",
        status: "pending",
      },
      {
        at: "2026-07-06T10:00:00.000Z",
        label: "Pilot deployment",
        status: "in_progress",
      },
      {
        at: "2026-07-11T16:00:00.000Z",
        label: "Pilot completed",
        status: "completed",
      },
    ],
  },
  {
    id: "rem-failed-openssl-canary",
    title: "OpenSSL canary patch (staging)",
    recommendationId: "rec-update-openssl",
    ownerId: owners[1],
    status: "failed",
    ticketRef: "VRM-1855",
    devicesTotal: 18,
    devicesRemaining: 18,
    createdAt: "2026-07-18T11:00:00.000Z",
    dueAt: "2026-07-25T17:00:00.000Z",
    completedAt: null,
    createdLabel: "Jul 18, 2026",
    dueLabel: "Jul 25, 2026",
    vulnerabilityIds: ["vuln-openssl-uaf"],
    deviceSample: ["srv-api-gw-01", "srv-dwh-02"],
    timeline: [
      {
        at: "2026-07-18T11:00:00.000Z",
        label: "Remediation created",
        status: "pending",
      },
      {
        at: "2026-07-19T14:00:00.000Z",
        label: "Canary failed — service crash",
        status: "failed",
        note: "Rolled back; awaiting vendor build",
      },
    ],
  },
  {
    id: "rem-exchange-patch",
    title: "Emergency Exchange July patch",
    recommendationId: "rec-patch-exchange",
    ownerId: owners[0],
    status: "pending",
    ticketRef: "VRM-1922",
    devicesTotal: 6,
    devicesRemaining: 6,
    createdAt: "2026-07-24T19:00:00.000Z",
    dueAt: "2026-07-29T17:00:00.000Z",
    completedAt: null,
    createdLabel: "Jul 24, 2026",
    dueLabel: "Jul 29, 2026",
    vulnerabilityIds: ["vuln-exchange-ssrf"],
    deviceSample: ["srv-mail-01", "srv-mail-dr"],
    timeline: [
      {
        at: "2026-07-24T19:00:00.000Z",
        label: "Emergency remediation opened",
        status: "pending",
      },
    ],
  },
  {
    id: "rem-citrix-patch",
    title: "Citrix ADC memory-disclosure patch",
    recommendationId: "rec-patch-citrix",
    ownerId: owners[1],
    status: "in_progress",
    ticketRef: "VRM-1880",
    devicesTotal: 4,
    devicesRemaining: 1,
    createdAt: "2026-06-17T08:00:00.000Z",
    dueAt: "2026-07-30T17:00:00.000Z",
    completedAt: null,
    createdLabel: "Jun 17, 2026",
    dueLabel: "Jul 30, 2026",
    vulnerabilityIds: ["vuln-citrix-bleed2"],
    deviceSample: ["vpn-hub-01", "fw-edge-01"],
    timeline: [
      {
        at: "2026-06-17T08:00:00.000Z",
        label: "Remediation created",
        status: "pending",
      },
      {
        at: "2026-07-01T10:00:00.000Z",
        label: "3 of 4 appliances upgraded",
        status: "in_progress",
      },
    ],
  },
  {
    id: "rem-ivanti-hotfix",
    title: "Ivanti Connect Secure hotfix",
    recommendationId: "rec-patch-ivanti",
    ownerId: owners[2],
    status: "in_progress",
    ticketRef: "VRM-1930",
    devicesTotal: 2,
    devicesRemaining: 1,
    createdAt: "2026-07-07T17:00:00.000Z",
    dueAt: "2026-07-28T17:00:00.000Z",
    completedAt: null,
    createdLabel: "Jul 7, 2026",
    dueLabel: "Jul 28, 2026",
    vulnerabilityIds: ["vuln-ivanti-vpn"],
    deviceSample: ["vpn-hub-01"],
    timeline: [
      {
        at: "2026-07-07T17:00:00.000Z",
        label: "Zero-day response opened",
        status: "pending",
      },
      {
        at: "2026-07-08T09:00:00.000Z",
        label: "Hotfix applied to primary",
        status: "in_progress",
      },
    ],
  },
  {
    id: "rem-npm-block",
    title: "Block compromised npm package ux-utils",
    recommendationId: "rec-pin-npm",
    ownerId: owners[3] ?? owners[1],
    status: "in_progress",
    ticketRef: "VRM-1935",
    devicesTotal: 86,
    devicesRemaining: 22,
    createdAt: "2026-07-23T15:00:00.000Z",
    dueAt: "2026-07-30T17:00:00.000Z",
    completedAt: null,
    createdLabel: "Jul 23, 2026",
    dueLabel: "Jul 30, 2026",
    vulnerabilityIds: ["vuln-npm-supply"],
    deviceSample: ["srv-ci-07", "WS-QA-0033"],
    timeline: [
      {
        at: "2026-07-23T15:00:00.000Z",
        label: "Remediation created",
        status: "pending",
      },
      {
        at: "2026-07-24T11:00:00.000Z",
        label: "Registry allowlist updated",
        status: "in_progress",
      },
    ],
  },
  {
    id: "rem-s3-lock",
    title: "Close public S3 bucket exposure",
    recommendationId: "rec-lock-s3",
    ownerId: owners[4] ?? owners[0],
    status: "pending",
    ticketRef: "VRM-1941",
    devicesTotal: 7,
    devicesRemaining: 7,
    createdAt: "2026-07-21T10:00:00.000Z",
    dueAt: "2026-08-02T17:00:00.000Z",
    completedAt: null,
    createdLabel: "Jul 21, 2026",
    dueLabel: "Aug 2, 2026",
    vulnerabilityIds: ["vuln-s3-public"],
    deviceSample: ["s3-exports-prod", "s3-backups-east"],
    timeline: [
      {
        at: "2026-07-21T10:00:00.000Z",
        label: "Remediation created",
        status: "pending",
      },
    ],
  },
];

const REM_CATALOG_SIZE = 40;
const remediationStatusesCycle: RemediationStatus[] = [
  "pending",
  "in_progress",
  "pending",
  "in_progress",
  "completed",
  "failed",
  "exception",
];
const remediationTitleVariants = [
  "Deploy patch ring for",
  "Force-update rollout:",
  "Emergency remediation:",
  "Canary validation for",
  "Policy enforcement:",
  "Hotfix deployment:",
  "Backfill remaining devices for",
  "Rollback-safe update of",
];
const monthLabels = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function buildGeneratedRemediations(
  templates: Remediation[],
  count: number,
): Remediation[] {
  const generated: Remediation[] = [];
  for (let index = 0; index < count; index += 1) {
    const template = templates[index % templates.length]!;
    const n = index + 1;
    const prefix =
      remediationTitleVariants[index % remediationTitleVariants.length]!;
    const status =
      remediationStatusesCycle[index % remediationStatusesCycle.length]!;
    const devicesTotal = Math.max(
      4,
      Math.round(template.devicesTotal * (0.2 + (index % 8) * 0.1)),
    );
    const devicesRemaining =
      status === "completed"
        ? 0
        : status === "pending"
          ? devicesTotal
          : Math.max(1, Math.round(devicesTotal * (0.15 + (index % 5) * 0.1)));
    const createdDay = 1 + (index % 27);
    const dueDay = Math.min(28, createdDay + 7 + (index % 10));
    const createdMonth = monthLabels[(5 + (index % 3)) % 12]!;
    const dueMonth = monthLabels[(6 + (index % 3)) % 12]!;
    const ticketNum = 2000 + n;
    generated.push({
      ...template,
      id: `rem-${String(n).padStart(3, "0")}`,
      title: `${prefix} ${template.title.replace(/^(Roll out|Force update|Emergency |Deploy |Disable |Enforce |Retire |Block |Close )/, "")}`,
      recommendationId:
        recommendationSeeds[index % recommendationSeeds.length]?.id ??
        template.recommendationId,
      ownerId: owners[index % Math.max(owners.length, 1)] ?? null,
      status,
      ticketRef: `VRM-${ticketNum}`,
      devicesTotal,
      devicesRemaining,
      createdAt: `2026-0${6 + (index % 2)}-${String(createdDay).padStart(2, "0")}T10:00:00.000Z`,
      dueAt: `2026-0${7 + (index % 2)}-${String(dueDay).padStart(2, "0")}T17:00:00.000Z`,
      completedAt:
        status === "completed"
          ? `2026-07-${String(Math.min(28, dueDay - 1)).padStart(2, "0")}T16:00:00.000Z`
          : null,
      createdLabel: `${createdMonth} ${createdDay}, 2026`,
      dueLabel: `${dueMonth} ${dueDay}, 2026`,
      timeline: [
        {
          at: `2026-0${6 + (index % 2)}-${String(createdDay).padStart(2, "0")}T10:00:00.000Z`,
          label: "Remediation created",
          status: "pending",
        },
        ...(status === "pending"
          ? []
          : [
              {
                at: `2026-0${6 + (index % 2)}-${String(Math.min(28, createdDay + 2)).padStart(2, "0")}T12:00:00.000Z`,
                label:
                  status === "failed"
                    ? "Deployment failed"
                    : status === "exception"
                      ? "Exception recorded"
                      : status === "completed"
                        ? "Remediation completed"
                        : "Deployment in progress",
                status,
              },
            ]),
      ],
    });
  }
  return generated;
}

export const remediations: Remediation[] = [
  ...remediationSeeds,
  ...buildGeneratedRemediations(
    remediationSeeds,
    Math.max(0, REM_CATALOG_SIZE - remediationSeeds.length),
  ),
];

export function getRemediation(id: string) {
  return remediations.find((r) => r.id === id) ?? null;
}

/* -------------------------------------------------------------------------- */
/* Software inventory                                                         */
/* -------------------------------------------------------------------------- */

const softwareInventorySeeds: SoftwareInventoryItem[] = [
  {
    id: "sw-teams",
    name: "Microsoft Teams",
    vendor: "Microsoft",
    category: "software",
    osPlatform: "Windows",
    vulnerableVersions: "1.6.00.x – 1.7.00.24855",
    weaknessCount: 6,
    exposedDevices: 1150,
    totalDevices: 1690,
    threats: ["exploit-public", "exploit-kit", "active-threat"],
    lastSeenLabel: "2 min ago",
    eol: false,
    outdated: true,
    internetFacing: false,
    vulnerabilityIds: ["vuln-teams-rce"],
    versionBreakdown: [
      { version: "1.7.00.24855", devices: 1150, vulnerable: true },
      { version: "1.8.00.1201", devices: 540, vulnerable: false },
    ],
  },
  {
    id: "sw-office",
    name: "Microsoft Office",
    vendor: "Microsoft",
    category: "software",
    osPlatform: "Windows",
    vulnerableVersions: "Office 2019 / 2021 LTSC builds",
    weaknessCount: 8,
    exposedDevices: 980,
    totalDevices: 1900,
    threats: ["exploit-verified", "ransomware", "exploit-kit", "active-threat"],
    lastSeenLabel: "5 min ago",
    eol: false,
    outdated: true,
    internetFacing: false,
    vulnerabilityIds: ["vuln-word-rce", "vuln-outlook-eop"],
    versionBreakdown: [
      { version: "Office 2021 LTSC", devices: 620, vulnerable: true },
      { version: "Microsoft 365 Apps", devices: 920, vulnerable: false },
      { version: "Office 2019", devices: 360, vulnerable: true },
    ],
  },
  {
    id: "sw-openssl",
    name: "OpenSSL",
    vendor: "OpenSSL Project",
    category: "software",
    osPlatform: "Linux",
    vulnerableVersions: "1.0.2 – 3.0.x (pre-patch)",
    weaknessCount: 4,
    exposedDevices: 1771,
    totalDevices: 1900,
    threats: ["exploit-public", "active-threat"],
    lastSeenLabel: "1 min ago",
    eol: false,
    outdated: true,
    internetFacing: true,
    vulnerabilityIds: ["vuln-openssl-uaf"],
    versionBreakdown: [
      { version: "1.0.2zq", devices: 220, vulnerable: true },
      { version: "3.0.14", devices: 1551, vulnerable: true },
      { version: "3.3.2", devices: 129, vulnerable: false },
    ],
  },
  {
    id: "sw-java",
    name: "Oracle Java SE",
    vendor: "Oracle",
    category: "software",
    osPlatform: "Windows",
    vulnerableVersions: "8u401 – 17.0.10",
    weaknessCount: 5,
    exposedDevices: 412,
    totalDevices: 500,
    threats: ["exploit-public"],
    lastSeenLabel: "12 min ago",
    eol: true,
    outdated: true,
    internetFacing: false,
    vulnerabilityIds: ["vuln-oracle-compat"],
    versionBreakdown: [
      { version: "8u401", devices: 180, vulnerable: true },
      { version: "17.0.10", devices: 232, vulnerable: true },
      { version: "21.0.3", devices: 88, vulnerable: false },
    ],
  },
  {
    id: "sw-chrome",
    name: "Google Chrome",
    vendor: "Google",
    category: "browser",
    osPlatform: "Windows",
    vulnerableVersions: "< 127.0.6533.120",
    weaknessCount: 8,
    exposedDevices: 890,
    totalDevices: 2000,
    threats: ["exploit-verified", "exploit-kit", "active-threat", "ransomware"],
    lastSeenLabel: "Just now",
    eol: false,
    outdated: true,
    internetFacing: true,
    vulnerabilityIds: ["vuln-chrome-sbx"],
    versionBreakdown: [
      { version: "126.0.6478.182", devices: 890, vulnerable: true },
      { version: "127.0.6533.120", devices: 1110, vulnerable: false },
    ],
  },
  {
    id: "sw-edge",
    name: "Microsoft Edge",
    vendor: "Microsoft",
    category: "browser",
    osPlatform: "Windows",
    vulnerableVersions: "< 127.0.2651.74",
    weaknessCount: 5,
    exposedDevices: 420,
    totalDevices: 1800,
    threats: ["exploit-verified"],
    lastSeenLabel: "3 min ago",
    eol: false,
    outdated: true,
    internetFacing: false,
    vulnerabilityIds: ["vuln-chrome-sbx"],
    versionBreakdown: [
      { version: "126.0.2592.113", devices: 420, vulnerable: true },
      { version: "127.0.2651.74", devices: 1380, vulnerable: false },
    ],
  },
  {
    id: "sw-firefox",
    name: "Mozilla Firefox",
    vendor: "Mozilla",
    category: "browser",
    osPlatform: "Windows",
    vulnerableVersions: "128 – 140",
    weaknessCount: 60,
    exposedDevices: 2060,
    totalDevices: 2800,
    threats: [],
    lastSeenLabel: "8 min ago",
    eol: false,
    outdated: true,
    internetFacing: false,
    vulnerabilityIds: ["vuln-firefox-mem"],
    versionBreakdown: [
      { version: "139.0.4", devices: 2060, vulnerable: true },
      { version: "141.0", devices: 740, vulnerable: false },
    ],
  },
  {
    id: "sw-lastpass",
    name: "LastPass",
    vendor: "LastPass",
    category: "extension",
    osPlatform: "Windows",
    vulnerableVersions: "< 4.134.0",
    weaknessCount: 2,
    exposedDevices: 310,
    totalDevices: 640,
    threats: [],
    lastSeenLabel: "22 min ago",
    eol: false,
    outdated: true,
    internetFacing: false,
    vulnerabilityIds: [],
    versionBreakdown: [
      { version: "4.129.0", devices: 310, vulnerable: true },
      { version: "4.134.0", devices: 330, vulnerable: false },
    ],
  },
  {
    id: "sw-ublock",
    name: "uBlock Origin",
    vendor: "Raymond Hill",
    category: "extension",
    osPlatform: "Windows",
    vulnerableVersions: "All current (no CVE)",
    weaknessCount: 0,
    exposedDevices: 0,
    totalDevices: 980,
    threats: [],
    lastSeenLabel: "4 min ago",
    eol: false,
    outdated: false,
    internetFacing: false,
    vulnerabilityIds: [],
    versionBreakdown: [{ version: "1.59.0", devices: 980, vulnerable: false }],
  },
  {
    id: "sw-win11",
    name: "Windows 11",
    vendor: "Microsoft",
    category: "os",
    osPlatform: "Windows",
    vulnerableVersions: "22H2 / 23H2 pre-July CU",
    weaknessCount: 12,
    exposedDevices: 1520,
    totalDevices: 2200,
    threats: [],
    lastSeenLabel: "1 min ago",
    eol: false,
    outdated: true,
    internetFacing: false,
    vulnerabilityIds: ["vuln-win11-kernel"],
    versionBreakdown: [
      { version: "23H2 (pre-CU)", devices: 1520, vulnerable: true },
      { version: "23H2 (patched)", devices: 680, vulnerable: false },
    ],
  },
  {
    id: "sw-winsrv",
    name: "Windows Server 2022",
    vendor: "Microsoft",
    category: "os",
    osPlatform: "Windows",
    vulnerableVersions: "Pre-July cumulative",
    weaknessCount: 9,
    exposedDevices: 86,
    totalDevices: 120,
    threats: ["active-threat"],
    lastSeenLabel: "6 min ago",
    eol: false,
    outdated: true,
    internetFacing: true,
    vulnerabilityIds: ["vuln-win11-kernel", "vuln-ntlm-relay"],
    versionBreakdown: [
      { version: "2022 Datacenter", devices: 86, vulnerable: true },
      { version: "2022 Datacenter (patched)", devices: 34, vulnerable: false },
    ],
  },
  {
    id: "sw-azure-linux",
    name: "Azure Linux",
    vendor: "Microsoft",
    category: "os",
    osPlatform: "Linux",
    vulnerableVersions: "2.0 (OpenSSL bundle)",
    weaknessCount: 3,
    exposedDevices: 240,
    totalDevices: 310,
    threats: ["exploit-public"],
    lastSeenLabel: "15 min ago",
    eol: false,
    outdated: true,
    internetFacing: true,
    vulnerabilityIds: ["vuln-openssl-uaf"],
    versionBreakdown: [
      { version: "2.0.202406", devices: 240, vulnerable: true },
      { version: "2.0.202407", devices: 70, vulnerable: false },
    ],
  },
  {
    id: "sw-zoom",
    name: "Zoom Workplace",
    vendor: "Zoom",
    category: "software",
    osPlatform: "Windows",
    vulnerableVersions: "< 6.3.11",
    weaknessCount: 3,
    exposedDevices: 1340,
    totalDevices: 1500,
    threats: ["exploit-public", "exploit-kit"],
    lastSeenLabel: "3 min ago",
    eol: false,
    outdated: true,
    internetFacing: false,
    vulnerabilityIds: ["vuln-zoom-rce"],
    versionBreakdown: [
      { version: "6.2.6", devices: 1340, vulnerable: true },
      { version: "6.3.11", devices: 160, vulnerable: false },
    ],
  },
  {
    id: "sw-exchange",
    name: "Microsoft Exchange Server",
    vendor: "Microsoft",
    category: "software",
    osPlatform: "Windows",
    vulnerableVersions: "2019 CU14 / SE RTM",
    weaknessCount: 2,
    exposedDevices: 6,
    totalDevices: 8,
    threats: ["exploit-verified", "active-threat", "ransomware"],
    lastSeenLabel: "1 min ago",
    eol: false,
    outdated: true,
    internetFacing: true,
    vulnerabilityIds: ["vuln-exchange-ssrf"],
    versionBreakdown: [
      { version: "2019 CU14", devices: 4, vulnerable: true },
      { version: "SE RTM", devices: 2, vulnerable: true },
      { version: "SE Jul patch", devices: 2, vulnerable: false },
    ],
  },
  {
    id: "sw-citrix",
    name: "Citrix ADC",
    vendor: "Citrix",
    category: "software",
    osPlatform: "Linux",
    vulnerableVersions: "13.1 / 14.1 pre-hotfix",
    weaknessCount: 2,
    exposedDevices: 4,
    totalDevices: 4,
    threats: ["exploit-verified", "active-threat", "ransomware", "exploit-kit"],
    lastSeenLabel: "8 min ago",
    eol: false,
    outdated: true,
    internetFacing: true,
    vulnerabilityIds: ["vuln-citrix-bleed2"],
    versionBreakdown: [
      { version: "13.1-55.x", devices: 2, vulnerable: true },
      { version: "14.1-29.x", devices: 1, vulnerable: true },
      { version: "14.1-patched", devices: 1, vulnerable: false },
    ],
  },
  {
    id: "sw-log4j",
    name: "Apache Log4j",
    vendor: "Apache",
    category: "software",
    osPlatform: "Linux",
    vulnerableVersions: "2.14.1 – 2.16.0",
    weaknessCount: 1,
    exposedDevices: 28,
    totalDevices: 40,
    threats: ["exploit-verified", "ransomware", "exploit-kit", "active-threat"],
    lastSeenLabel: "20 min ago",
    eol: true,
    outdated: true,
    internetFacing: false,
    vulnerabilityIds: ["vuln-apache-log4j-residual"],
    versionBreakdown: [
      { version: "2.14.1", devices: 18, vulnerable: true },
      { version: "2.17.2", devices: 12, vulnerable: false },
      { version: "2.15.0", devices: 10, vulnerable: true },
    ],
  },
  {
    id: "sw-ivanti",
    name: "Ivanti Connect Secure",
    vendor: "Ivanti",
    category: "software",
    osPlatform: "Linux",
    vulnerableVersions: "22.7R2.x",
    weaknessCount: 1,
    exposedDevices: 2,
    totalDevices: 2,
    threats: ["exploit-verified", "active-threat", "exploit-public"],
    lastSeenLabel: "5 min ago",
    eol: false,
    outdated: true,
    internetFacing: true,
    vulnerabilityIds: ["vuln-ivanti-vpn"],
    versionBreakdown: [
      { version: "22.7R2.4", devices: 1, vulnerable: true },
      { version: "22.7R2.5-hotfix", devices: 1, vulnerable: false },
    ],
  },
  {
    id: "sw-node",
    name: "Node.js",
    vendor: "OpenJS",
    category: "software",
    osPlatform: "Linux",
    vulnerableVersions: "CI images with ux-utils < 4.2.1",
    weaknessCount: 1,
    exposedDevices: 86,
    totalDevices: 120,
    threats: ["active-threat", "exploit-public"],
    lastSeenLabel: "9 min ago",
    eol: false,
    outdated: true,
    internetFacing: false,
    vulnerabilityIds: ["vuln-npm-supply"],
    versionBreakdown: [
      { version: "20.15.0 + ux-utils 4.1.9", devices: 86, vulnerable: true },
      { version: "20.15.0 pinned", devices: 34, vulnerable: false },
    ],
  },
  {
    id: "sw-safari",
    name: "Safari",
    vendor: "Apple",
    category: "browser",
    osPlatform: "macOS",
    vulnerableVersions: "< 18.5",
    weaknessCount: 4,
    exposedDevices: 180,
    totalDevices: 260,
    threats: ["exploit-public"],
    lastSeenLabel: "6 min ago",
    eol: false,
    outdated: true,
    internetFacing: false,
    vulnerabilityIds: ["vuln-macos-tcc"],
    versionBreakdown: [
      { version: "18.4", devices: 180, vulnerable: true },
      { version: "18.5", devices: 80, vulnerable: false },
    ],
  },
  {
    id: "sw-vscode",
    name: "Visual Studio Code",
    vendor: "Microsoft",
    category: "extension",
    osPlatform: "Windows",
    vulnerableVersions: "Material Theme < 2.0.1",
    weaknessCount: 1,
    exposedDevices: 320,
    totalDevices: 450,
    threats: ["exploit-public"],
    lastSeenLabel: "11 min ago",
    eol: false,
    outdated: true,
    internetFacing: false,
    vulnerabilityIds: ["vuln-vscode-ext"],
    versionBreakdown: [
      { version: "Material Theme 1.9.8", devices: 320, vulnerable: true },
      { version: "Material Theme 2.0.1", devices: 130, vulnerable: false },
    ],
  },
  {
    id: "sw-macos",
    name: "macOS Sequoia",
    vendor: "Apple",
    category: "os",
    osPlatform: "macOS",
    vulnerableVersions: "15.4 / 15.5 pre-security update",
    weaknessCount: 1,
    exposedDevices: 210,
    totalDevices: 260,
    threats: ["exploit-verified", "active-threat"],
    lastSeenLabel: "2 min ago",
    eol: false,
    outdated: true,
    internetFacing: false,
    vulnerabilityIds: ["vuln-macos-tcc"],
    versionBreakdown: [
      { version: "15.5", devices: 210, vulnerable: true },
      { version: "15.5 + SU", devices: 50, vulnerable: false },
    ],
  },
];

const SW_CATALOG_SIZE = 50;
const softwareNameVariants = [
  { name: "Slack", vendor: "Salesforce", category: "software" as const },
  { name: "Adobe Acrobat", vendor: "Adobe", category: "software" as const },
  { name: "Git for Windows", vendor: "Git", category: "software" as const },
  { name: "Docker Desktop", vendor: "Docker", category: "software" as const },
  { name: "Wireshark", vendor: "Wireshark", category: "software" as const },
  { name: "Brave Browser", vendor: "Brave", category: "browser" as const },
  { name: "Opera", vendor: "Opera", category: "browser" as const },
  { name: "Bitwarden", vendor: "Bitwarden", category: "extension" as const },
  { name: "Grammarly", vendor: "Grammarly", category: "extension" as const },
  { name: "Ubuntu 22.04 LTS", vendor: "Canonical", category: "os" as const },
  { name: "RHEL 9", vendor: "Red Hat", category: "os" as const },
  { name: "1Password", vendor: "1Password", category: "extension" as const },
  { name: "Notion", vendor: "Notion", category: "software" as const },
  { name: "Postman", vendor: "Postman", category: "software" as const },
  {
    name: "VLC media player",
    vendor: "VideoLAN",
    category: "software" as const,
  },
];
const lastSeenLabels = [
  "Just now",
  "1 min ago",
  "3 min ago",
  "8 min ago",
  "15 min ago",
  "22 min ago",
  "45 min ago",
];

function buildGeneratedSoftwareInventory(
  templates: SoftwareInventoryItem[],
  count: number,
): SoftwareInventoryItem[] {
  const generated: SoftwareInventoryItem[] = [];
  for (let index = 0; index < count; index += 1) {
    const template = templates[index % templates.length]!;
    const n = index + 1;
    const variant = softwareNameVariants[index % softwareNameVariants.length]!;
    const totalDevices = Math.max(
      8,
      Math.round(template.totalDevices * (0.15 + (index % 9) * 0.08)),
    );
    const exposedDevices = Math.min(
      totalDevices,
      Math.max(0, Math.round(totalDevices * (0.2 + (index % 6) * 0.1))),
    );
    const vulnVer = `${2 + (index % 8)}.${index % 12}.${10 + (index % 40)}`;
    const patchedVer = `${2 + (index % 8)}.${(index % 12) + 1}.0`;
    generated.push({
      ...template,
      id: `sw-${String(n).padStart(3, "0")}`,
      name: `${variant.name}${index >= softwareNameVariants.length ? ` ${Math.floor(index / softwareNameVariants.length) + 1}` : ""}`,
      vendor: variant.vendor,
      category: variant.category,
      osPlatform:
        variant.category === "os"
          ? variant.name.includes("Ubuntu") || variant.name.includes("RHEL")
            ? "Linux"
            : template.osPlatform
          : template.osPlatform,
      vulnerableVersions: `< ${patchedVer}`,
      weaknessCount: Math.max(0, (template.weaknessCount % 12) + (index % 7)),
      exposedDevices,
      totalDevices,
      threats: template.threats.slice(0, 1 + (index % 3)),
      lastSeenLabel: lastSeenLabels[index % lastSeenLabels.length]!,
      eol: index % 11 === 0,
      outdated: index % 3 !== 0,
      internetFacing: index % 5 === 0,
      vulnerabilityIds: template.vulnerabilityIds.slice(0, 1),
      versionBreakdown: [
        { version: vulnVer, devices: exposedDevices, vulnerable: true },
        {
          version: patchedVer,
          devices: Math.max(0, totalDevices - exposedDevices),
          vulnerable: false,
        },
      ],
    });
  }
  return generated;
}

export const softwareInventory: SoftwareInventoryItem[] = [
  ...softwareInventorySeeds,
  ...buildGeneratedSoftwareInventory(
    softwareInventorySeeds,
    Math.max(0, SW_CATALOG_SIZE - softwareInventorySeeds.length),
  ),
];

export function getSoftwareItem(id: string) {
  return softwareInventory.find((s) => s.id === id) ?? null;
}

/* -------------------------------------------------------------------------- */
/* Events                                                                     */
/* -------------------------------------------------------------------------- */

const vulnEventSeeds: VulnEvent[] = [
  {
    id: "evt-firefox-cluster",
    at: "2026-07-26T08:00:00.000Z",
    dateLabel: "Jul 26, 2026 8:00 AM",
    type: "new-cves",
    summary:
      "Mozilla Firefox has 60 new vulnerabilities affecting your organization",
    impactedDevices: 2060,
    impactedPercent: 74,
    relatedCveIds: ["vuln-firefox-mem"],
    relatedSoftwareIds: ["sw-firefox"],
    scope: "endpoint",
  },
  {
    id: "evt-chrome-zd",
    at: "2026-07-22T09:30:00.000Z",
    dateLabel: "Jul 22, 2026 9:30 AM",
    type: "zero-day",
    summary: "Zero-day Chromium sandbox escape detected on 890 endpoints",
    impactedDevices: 890,
    impactedPercent: 45,
    relatedCveIds: ["vuln-chrome-sbx"],
    relatedSoftwareIds: ["sw-chrome", "sw-edge"],
    scope: "endpoint",
  },
  {
    id: "evt-score-up",
    at: "2026-07-20T12:00:00.000Z",
    dateLabel: "Jul 20, 2026 12:00 PM",
    type: "score-change",
    summary: "Endpoint exposure score increased from 34 to 39",
    impactedDevices: 0,
    impactedPercent: 0,
    relatedCveIds: [],
    relatedSoftwareIds: [],
    scope: "endpoint",
  },
  {
    id: "evt-teams",
    at: "2026-07-15T10:00:00.000Z",
    dateLabel: "Jul 15, 2026 10:00 AM",
    type: "new-cves",
    summary:
      "Microsoft Teams has 6 new vulnerabilities affecting your organization",
    impactedDevices: 2240,
    impactedPercent: 100,
    relatedCveIds: ["vuln-teams-rce"],
    relatedSoftwareIds: ["sw-teams"],
    scope: "endpoint",
  },
  {
    id: "evt-openssl",
    at: "2026-07-12T14:00:00.000Z",
    dateLabel: "Jul 12, 2026 2:00 PM",
    type: "exploit-detected",
    summary: "Public exploit activity observed for OpenSSL CVE-2026-45447",
    impactedDevices: 1771,
    impactedPercent: 93,
    relatedCveIds: ["vuln-openssl-uaf"],
    relatedSoftwareIds: ["sw-openssl"],
    scope: "endpoint",
  },
  {
    id: "evt-firefox-pilot",
    at: "2026-07-11T16:00:00.000Z",
    dateLabel: "Jul 11, 2026 4:00 PM",
    type: "remediation-completed",
    summary: "Firefox pilot update completed for 120 HQ devices",
    impactedDevices: 120,
    impactedPercent: 4,
    relatedCveIds: ["vuln-firefox-mem"],
    relatedSoftwareIds: ["sw-firefox"],
    scope: "endpoint",
  },
  {
    id: "evt-java-exc",
    at: "2026-07-12T15:00:00.000Z",
    dateLabel: "Jul 12, 2026 3:00 PM",
    type: "exception-granted",
    summary:
      "Exception granted for legacy Java on ERP servers (expires Oct 2026)",
    impactedDevices: 40,
    impactedPercent: 8,
    relatedCveIds: ["vuln-oracle-compat"],
    relatedSoftwareIds: ["sw-java"],
    scope: "endpoint",
  },
  {
    id: "evt-adcs",
    at: "2026-07-27T14:00:00.000Z",
    dateLabel: "Jul 27, 2026 2:00 PM",
    type: "zero-day",
    summary: "CertiGhost AD CS elevation of privilege first detected",
    impactedDevices: 3,
    impactedPercent: 25,
    relatedCveIds: ["vuln-adcs-eop"],
    relatedSoftwareIds: [],
    scope: "endpoint",
  },
  {
    id: "evt-aks",
    at: "2026-07-08T11:00:00.000Z",
    dateLabel: "Jul 8, 2026 11:00 AM",
    type: "new-cves",
    summary: "AKS hostPath escape findings across production node pools",
    impactedDevices: 64,
    impactedPercent: 71,
    relatedCveIds: ["vuln-aks-escape"],
    relatedSoftwareIds: [],
    scope: "cloud",
  },
  {
    id: "evt-cloud-score",
    at: "2026-07-18T09:00:00.000Z",
    dateLabel: "Jul 18, 2026 9:00 AM",
    type: "score-change",
    summary: "Cloud exposure score improved from 48 to 42",
    impactedDevices: 0,
    impactedPercent: 0,
    relatedCveIds: [],
    relatedSoftwareIds: [],
    scope: "cloud",
  },
  {
    id: "evt-rbac",
    at: "2026-07-07T11:00:00.000Z",
    dateLabel: "Jul 7, 2026 11:00 AM",
    type: "new-cves",
    summary:
      "Azure RBAC privilege escalation patterns identified in 128 assignments",
    impactedDevices: 128,
    impactedPercent: 38,
    relatedCveIds: ["vuln-azure-rbac"],
    relatedSoftwareIds: [],
    scope: "cloud",
  },
  {
    id: "evt-exchange",
    at: "2026-07-24T18:00:00.000Z",
    dateLabel: "Jul 24, 2026 6:00 PM",
    type: "exploit-detected",
    summary: "Active exploitation signals for Exchange SSRF CVE-2026-27701",
    impactedDevices: 6,
    impactedPercent: 75,
    relatedCveIds: ["vuln-exchange-ssrf"],
    relatedSoftwareIds: ["sw-exchange"],
    scope: "endpoint",
  },
  {
    id: "evt-citrix",
    at: "2026-07-19T07:00:00.000Z",
    dateLabel: "Jul 19, 2026 7:00 AM",
    type: "exploit-detected",
    summary: "Citrix ADC memory disclosure exploit kits observed in the wild",
    impactedDevices: 4,
    impactedPercent: 100,
    relatedCveIds: ["vuln-citrix-bleed2"],
    relatedSoftwareIds: ["sw-citrix"],
    scope: "endpoint",
  },
  {
    id: "evt-ivanti-zd",
    at: "2026-07-07T16:00:00.000Z",
    dateLabel: "Jul 7, 2026 4:00 PM",
    type: "zero-day",
    summary: "Ivanti Connect Secure auth bypass treated as zero-day",
    impactedDevices: 2,
    impactedPercent: 100,
    relatedCveIds: ["vuln-ivanti-vpn"],
    relatedSoftwareIds: ["sw-ivanti"],
    scope: "endpoint",
  },
  {
    id: "evt-npm",
    at: "2026-07-23T14:00:00.000Z",
    dateLabel: "Jul 23, 2026 2:00 PM",
    type: "new-cves",
    summary: "Compromised npm package ux-utils detected in 86 CI runners",
    impactedDevices: 86,
    impactedPercent: 72,
    relatedCveIds: ["vuln-npm-supply"],
    relatedSoftwareIds: ["sw-node"],
    scope: "endpoint",
  },
  {
    id: "evt-s3",
    at: "2026-07-21T08:30:00.000Z",
    dateLabel: "Jul 21, 2026 8:30 AM",
    type: "new-cves",
    summary: "Public S3 buckets exposing sensitive exports discovered",
    impactedDevices: 7,
    impactedPercent: 17,
    relatedCveIds: ["vuln-s3-public"],
    relatedSoftwareIds: [],
    scope: "cloud",
  },
  {
    id: "evt-log4j-rem",
    at: "2026-07-05T16:00:00.000Z",
    dateLabel: "Jul 5, 2026 4:00 PM",
    type: "remediation-completed",
    summary: "Log4j eradicated from 12 of 40 residual hosts",
    impactedDevices: 12,
    impactedPercent: 30,
    relatedCveIds: ["vuln-apache-log4j-residual"],
    relatedSoftwareIds: ["sw-log4j"],
    scope: "endpoint",
  },
  {
    id: "evt-zoom",
    at: "2026-07-19T09:00:00.000Z",
    dateLabel: "Jul 19, 2026 9:00 AM",
    type: "new-cves",
    summary: "Zoom Workplace RCE affects 1.34k endpoints",
    impactedDevices: 1340,
    impactedPercent: 89,
    relatedCveIds: ["vuln-zoom-rce"],
    relatedSoftwareIds: ["sw-zoom"],
    scope: "endpoint",
  },
];

const VE_CATALOG_SIZE = 50;
const vulnEventTypesCycle: VulnEventType[] = [
  "new-cves",
  "score-change",
  "remediation-completed",
  "exception-granted",
  "zero-day",
  "exploit-detected",
];
const vulnEventSummaries: Record<VulnEventType, string[]> = {
  "new-cves": [
    "New CVE cluster published for enterprise collaboration stack",
    "Vendor advisory adds mid-severity findings across browser fleet",
    "Security update catalog expanded with library advisories",
  ],
  "score-change": [
    "Endpoint exposure score shifted after weekend patch wave",
    "Cloud exposure score adjusted following IAM review",
    "Exposure score recalculated after asset inventory refresh",
  ],
  "remediation-completed": [
    "Remediation ring completed for pilot business unit",
    "Force-update job finished on remaining canary devices",
    "Hotfix rollout marked complete for edge appliances",
  ],
  "exception-granted": [
    "Time-boxed exception granted for legacy ERP dependency",
    "Risk acceptance filed for vendor-locked print servers",
    "Compensating control exception approved by security board",
  ],
  "zero-day": [
    "Suspected zero-day activity flagged on perimeter appliances",
    "In-the-wild exploit report escalated as zero-day response",
    "Urgent zero-day advisory mapped to internet-facing assets",
  ],
  "exploit-detected": [
    "Public exploit PoC activity observed for tracked CVE",
    "Threat intel feed reports active exploitation attempts",
    "Exploit kit signature matched against vulnerable package set",
  ],
};

function buildGeneratedVulnEvents(
  templates: VulnEvent[],
  count: number,
): VulnEvent[] {
  const generated: VulnEvent[] = [];
  for (let index = 0; index < count; index += 1) {
    const template = templates[index % templates.length]!;
    const n = index + 1;
    const type = vulnEventTypesCycle[index % vulnEventTypesCycle.length]!;
    const summaries = vulnEventSummaries[type];
    const day = 1 + (index % 28);
    const hour = 7 + (index % 12);
    const minute = (index * 7) % 60;
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour > 12 ? hour - 12 : hour;
    const impactedDevices =
      type === "score-change"
        ? 0
        : Math.max(1, Math.round(40 + ((index * 37) % 1800)));
    const impactedPercent =
      type === "score-change" ? 0 : Math.min(100, 8 + ((index * 11) % 90));
    generated.push({
      ...template,
      id: `ve-${String(n).padStart(3, "0")}`,
      at: `2026-07-${String(day).padStart(2, "0")}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00.000Z`,
      dateLabel: `Jul ${day}, 2026 ${hour12}:${String(minute).padStart(2, "0")} ${ampm}`,
      type,
      summary: summaries[index % summaries.length]!,
      impactedDevices,
      impactedPercent,
      relatedCveIds: template.relatedCveIds.slice(0, 1 + (index % 2)),
      relatedSoftwareIds: template.relatedSoftwareIds.slice(0, 1),
      scope: index % 5 === 0 ? "cloud" : "endpoint",
    });
  }
  return generated;
}

export const vulnEvents: VulnEvent[] = [
  ...vulnEventSeeds,
  ...buildGeneratedVulnEvents(
    vulnEventSeeds,
    Math.max(0, VE_CATALOG_SIZE - vulnEventSeeds.length),
  ),
];

/* -------------------------------------------------------------------------- */
/* Exposure scores                                                            */
/* -------------------------------------------------------------------------- */

function buildHistory(
  start: number,
  end: number,
  days: number,
): ExposureHistoryPoint[] {
  const points: ExposureHistoryPoint[] = [];
  const now = new Date("2026-07-28T00:00:00.000Z");
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setUTCDate(d.getUTCDate() - i);
    const t = (days - 1 - i) / Math.max(1, days - 1);
    const wobble = Math.sin(i * 0.7) * 2;
    const score = Math.round(start + (end - start) * t + wobble);
    points.push({
      date: d.toISOString().slice(0, 10),
      day: d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      }),
      score: Math.min(100, Math.max(0, score)),
    });
  }
  return points;
}

export const exposureScores: Record<VulnScope, ExposureScoreSnapshot> = {
  endpoint: {
    score: 39,
    max: 100,
    band: "medium",
    history: buildHistory(31, 39, 30),
  },
  cloud: {
    score: 42,
    max: 100,
    band: "medium",
    history: buildHistory(48, 42, 30),
  },
};

export function exposureBand(score: number): "low" | "medium" | "high" {
  if (score <= 29) return "low";
  if (score <= 69) return "medium";
  return "high";
}

/* -------------------------------------------------------------------------- */
/* Aggregations / stats                                                       */
/* -------------------------------------------------------------------------- */

const compact = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export function formatCompact(n: number) {
  return compact.format(n);
}

export function getWeaknessStats(
  items: Iterable<Vulnerability> = vulnerabilities,
): VulnStat[] {
  const list = Array.from(items);
  const total = list.length;
  const exploitable = list.filter((v) => v.exploitable).length;
  const critical = list.filter((v) => v.severity === "critical").length;
  const zeroDay = list.filter((v) => v.zeroDay).length;
  const noUpdate = list.filter(
    (v) => v.updateStatus === "not-available",
  ).length;
  const partial = list.filter(
    (v) => v.updateStatus === "partial" || v.updateStatus === "scheduled",
  ).length;

  // Inflate display totals to feel like a real estate (screenshot-scale)
  const scale = 1402; // 12 * 1402 ≈ 16824
  return [
    {
      key: "total",
      title: "Vulnerabilities in my organization",
      value: formatCompact(total * scale),
      context: "Across assessed devices",
      delta: 2.4,
      preferLower: true,
    },
    {
      key: "exploitable",
      title: "Exploitable vulnerabilities",
      value: formatCompact(exploitable * 88),
      context: "Public or verified exploit",
      delta: 5.1,
      preferLower: true,
    },
    {
      key: "critical",
      title: "Critical vulnerabilities",
      value: formatCompact(critical * 76),
      context: "Severity critical",
      delta: -1.2,
      preferLower: true,
    },
    {
      key: "zero-day",
      title: "Zero-day vulnerabilities",
      value: String(zeroDay),
      context: "No vendor patch at disclosure",
      delta: 100,
      preferLower: true,
    },
    {
      key: "no-update",
      title: "Vulnerabilities with no security update",
      value: String(noUpdate),
      context: "Vendor has not released a fix",
      delta: 0,
      preferLower: true,
    },
    {
      key: "partial",
      title: "Vulnerabilities with some security updates",
      value: String(partial),
      context: "Partial or scheduled updates",
      delta: -3.0,
      preferLower: true,
    },
  ];
}

export function getVulnerabilityInsights(scope: VulnScope = "endpoint") {
  const list = vulnerabilities.filter((v) => v.scope === scope);
  const scale = scope === "endpoint" ? 1402 : 42;
  return [
    {
      key: "total",
      label: "Total vulnerabilities",
      value: list.length * scale,
      color: "bg-foreground/70",
    },
    {
      key: "exploitable",
      label: "Exploitable vulnerabilities",
      value:
        list.filter((v) => v.exploitable).length *
        (scope === "endpoint" ? 88 : 12),
      color: "bg-foreground/55",
    },
    {
      key: "critical",
      label: "Critical vulnerabilities",
      value:
        list.filter((v) => v.severity === "critical").length *
        (scope === "endpoint" ? 76 : 8),
      color: "bg-destructive/80",
    },
    {
      key: "zero-day",
      label: "Zero-day vulnerabilities",
      value: list.filter((v) => v.zeroDay).length,
      color: "bg-warning/80",
    },
  ];
}

export function getRemediationStats(
  items: Iterable<Remediation> = remediations,
): VulnStat[] {
  const list = Array.from(items);
  const open = list.filter(
    (r) => r.status === "pending" || r.status === "in_progress",
  ).length;
  const inProgress = list.filter((r) => r.status === "in_progress").length;
  const completed7d = list.filter((r) => r.status === "completed").length;
  const exceptions = list.filter((r) => r.status === "exception").length;

  return [
    {
      key: "open",
      title: "Open remediations",
      value: String(open),
      context: "Pending or in progress",
      delta: 8.0,
      preferLower: true,
    },
    {
      key: "in-progress",
      title: "In progress",
      value: String(inProgress),
      context: "Actively rolling out",
      delta: 12.0,
      preferLower: false,
    },
    {
      key: "completed",
      title: "Completed (recent)",
      value: String(completed7d),
      context: "Closed in current cycle",
      delta: 25.0,
      preferLower: false,
    },
    {
      key: "exceptions",
      title: "Exceptions",
      value: String(exceptions),
      context: "Accepted risk",
      delta: 0,
      preferLower: true,
    },
    {
      key: "mttr",
      title: "Avg time to remediate",
      value: "9.4d",
      context: "Completed remediations",
      delta: -6.2,
      preferLower: true,
    },
  ];
}

export function getInventoryStats(
  items: Iterable<SoftwareInventoryItem> = softwareInventory,
): VulnStat[] {
  const list = Array.from(items);
  return [
    {
      key: "products",
      title: "Inventoried products",
      value: String(list.length),
      context: "Across categories",
      delta: 4.0,
      preferLower: false,
    },
    {
      key: "with-weaknesses",
      title: "With weaknesses",
      value: String(list.filter((s) => s.weaknessCount > 0).length),
      context: "At least one CVE",
      delta: 2.1,
      preferLower: true,
    },
    {
      key: "eol",
      title: "EOL / outdated",
      value: String(list.filter((s) => s.eol || s.outdated).length),
      context: "Needs upgrade path",
      delta: -1.5,
      preferLower: true,
    },
    {
      key: "internet",
      title: "Internet-facing installs",
      value: String(list.filter((s) => s.internetFacing).length),
      context: "Elevated exposure",
      delta: 0,
      preferLower: true,
    },
  ];
}

export function getDashboardOpsStats(scope: VulnScope): VulnStat[] {
  const rem = remediations.filter((r) => {
    const rec = getRecommendation(r.recommendationId);
    return rec?.scope === scope;
  });
  const open = rem.filter(
    (r) => r.status === "pending" || r.status === "in_progress",
  ).length;
  const exceptions = rem.filter((r) => r.status === "exception").length;
  const internetFacing = vulnerabilities.filter(
    (v) => v.scope === scope && v.tags.includes("Internet facing"),
  ).length;

  return [
    {
      key: "open-rem",
      title: "Open remediations",
      value: String(open),
      context: "Active work items",
      delta: 5.0,
      preferLower: true,
    },
    {
      key: "mttr",
      title: "MTTR",
      value: scope === "endpoint" ? "9.4d" : "12.1d",
      context: "Mean time to remediate",
      delta: -4.0,
      preferLower: true,
    },
    {
      key: "exceptions",
      title: "Exceptions",
      value: String(exceptions),
      context: "Accepted risk",
      delta: 0,
      preferLower: true,
    },
    {
      key: "internet",
      title: "Internet-facing CVEs",
      value: String(internetFacing),
      context: "Tagged exposure",
      delta: 10.0,
      preferLower: true,
    },
  ];
}

export function getVulnerabilitiesOverTime(scope: VulnScope, days = 42) {
  const now = new Date("2026-07-28T00:00:00.000Z");
  const points: Array<{
    date: string;
    day: string;
    critical: number;
    high: number;
    medium: number;
    low: number;
  }> = [];

  const base =
    scope === "endpoint"
      ? { critical: 520, high: 4100, medium: 7200, low: 4800 }
      : { critical: 18, high: 64, medium: 110, low: 90 };

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setUTCDate(d.getUTCDate() - i);
    const drift = Math.sin(i / 5) * 8;
    points.push({
      date: d.toISOString().slice(0, 10),
      day: d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      }),
      critical: Math.max(0, Math.round(base.critical + drift)),
      high: Math.max(0, Math.round(base.high + drift * 2)),
      medium: Math.max(0, Math.round(base.medium + drift * 3)),
      low: Math.max(0, Math.round(base.low + drift)),
    });
  }
  return points;
}

export function vulnerabilitySearchIndex(v: Vulnerability) {
  return [
    v.cve,
    v.title,
    v.summary,
    v.severity,
    ...v.tags,
    ...v.cweIds,
    ...v.affectedSoftware.map((s) => s.name),
    ...v.threats,
  ]
    .join(" ")
    .toLowerCase();
}

export function recommendationSearchIndex(r: Recommendation) {
  return [
    r.title,
    r.description,
    r.osPlatform,
    r.relatedComponent,
    r.status,
    ...r.tags,
  ]
    .join(" ")
    .toLowerCase();
}

export function remediationSearchIndex(r: Remediation) {
  return [r.title, r.ticketRef, r.status, r.ownerId ?? ""]
    .join(" ")
    .toLowerCase();
}

export function softwareSearchIndex(s: SoftwareInventoryItem) {
  return [s.name, s.vendor, s.osPlatform, s.category, s.vulnerableVersions]
    .join(" ")
    .toLowerCase();
}

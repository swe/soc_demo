import type { IconType } from "react-icons";
import {
  SiAmazonwebservices,
  SiCisco,
  SiCloudflare,
  SiDatadog,
  SiDocker,
  SiElastic,
  SiFortinet,
  SiGithub,
  SiGitlab,
  SiGooglechronicle,
  SiJira,
  SiKubernetes,
  SiOkta,
  SiPagerduty,
  SiPaloaltonetworks,
  SiSentry,
  SiSlack,
  SiSnyk,
  SiSplunk,
  SiTerraform,
} from "react-icons/si";

export type IntegrationCategory =
  | "cloud"
  | "siem"
  | "identity"
  | "endpoint"
  | "network"
  | "communication"
  | "ticketing";

export type IntegrationStatus =
  | "connected"
  | "error"
  | "pending"
  | "available"
  | "paused";

export type IntegrationHealth = "healthy" | "degraded" | "failed";

export type Integration = {
  id: string;
  vendorKey: VendorKey;
  vendor: string;
  name: string;
  description: string;
  category: IntegrationCategory;
  status: IntegrationStatus;
  dataTypes: string[];
  lastSync?: string;
  eventsPerDay?: number;
  health?: IntegrationHealth;
  connectedBy?: string;
  connectedAt?: string;
  region?: string;
  version?: string;
  credentialExpiry?: string;
  errorMessage?: string;
  latencyMs?: number;
  errorRate?: number;
  dropRate?: number;
  coveragePercent?: number;
  /** Hourly event volume for the last 24 hours (oldest → newest). */
  volumeTrend?: number[];
};

export type ConnectorActivityKind =
  | "sync"
  | "error"
  | "credential"
  | "connect"
  | "pause";

export type ConnectorActivity = {
  id: string;
  integrationId: string;
  kind: ConnectorActivityKind;
  title: string;
  detail: string;
  time: string;
};

export type IngestionVolumePoint = {
  hour: string;
  cloud: number;
  siem: number;
  identity: number;
  network: number;
  other: number;
};

export type VendorKey =
  | "aws"
  | "splunk"
  | "okta"
  | "chronicle"
  | "palo-alto"
  | "cloudflare"
  | "slack"
  | "jira"
  | "pagerduty"
  | "datadog"
  | "elastic"
  | "github"
  | "gitlab"
  | "sentry"
  | "snyk"
  | "cisco"
  | "fortinet"
  | "docker"
  | "kubernetes"
  | "terraform";

export const vendorMeta: Record<
  VendorKey,
  { icon: IconType; color: string; background: string }
> = {
  aws: {
    icon: SiAmazonwebservices,
    color: "#232F3E",
    background: "bg-[#FF9900]/12 dark:bg-[#FF9900]/15",
  },
  splunk: {
    icon: SiSplunk,
    color: "#65A637",
    background: "bg-[#65A637]/10",
  },
  okta: {
    icon: SiOkta,
    color: "#007DC1",
    background: "bg-[#007DC1]/10",
  },
  chronicle: {
    icon: SiGooglechronicle,
    color: "#4285F4",
    background: "bg-[#4285F4]/10",
  },
  "palo-alto": {
    icon: SiPaloaltonetworks,
    color: "#F04E23",
    background: "bg-[#F04E23]/10",
  },
  cloudflare: {
    icon: SiCloudflare,
    color: "#F38020",
    background: "bg-[#F38020]/10",
  },
  slack: {
    icon: SiSlack,
    color: "#4A154B",
    background: "bg-[#4A154B]/10 dark:bg-[#E01E5A]/10",
  },
  jira: {
    icon: SiJira,
    color: "#0052CC",
    background: "bg-[#0052CC]/10",
  },
  pagerduty: {
    icon: SiPagerduty,
    color: "#06AC38",
    background: "bg-[#06AC38]/10",
  },
  datadog: {
    icon: SiDatadog,
    color: "#632CA6",
    background: "bg-[#632CA6]/10",
  },
  elastic: {
    icon: SiElastic,
    color: "#00BFB3",
    background: "bg-[#00BFB3]/10",
  },
  github: {
    icon: SiGithub,
    color: "currentColor",
    background: "bg-foreground/[0.06]",
  },
  gitlab: {
    icon: SiGitlab,
    color: "#FC6D26",
    background: "bg-[#FC6D26]/10",
  },
  sentry: {
    icon: SiSentry,
    color: "#362D59",
    background: "bg-[#362D59]/10 dark:bg-[#8B80F9]/10",
  },
  snyk: {
    icon: SiSnyk,
    color: "#4C4A73",
    background: "bg-[#4C4A73]/10 dark:bg-[#8B89B9]/10",
  },
  cisco: {
    icon: SiCisco,
    color: "#1BA0D7",
    background: "bg-[#1BA0D7]/10",
  },
  fortinet: {
    icon: SiFortinet,
    color: "#EE3124",
    background: "bg-[#EE3124]/10",
  },
  docker: {
    icon: SiDocker,
    color: "#2496ED",
    background: "bg-[#2496ED]/10",
  },
  kubernetes: {
    icon: SiKubernetes,
    color: "#326CE5",
    background: "bg-[#326CE5]/10",
  },
  terraform: {
    icon: SiTerraform,
    color: "#844FBA",
    background: "bg-[#844FBA]/10",
  },
};

export const integrationCategoryLabels: Record<IntegrationCategory, string> = {
  cloud: "Cloud & infrastructure",
  siem: "SIEM & observability",
  identity: "Identity",
  endpoint: "Endpoint & workload",
  network: "Network security",
  communication: "Alerts & communication",
  ticketing: "Ticketing & response",
};

function trendFromBase(base: number, variance = 0.18): number[] {
  return Array.from({ length: 24 }, (_, index) => {
    const wave = Math.sin((index / 24) * Math.PI * 2) * variance;
    const noise = ((index * 17) % 7) / 100;
    return Math.max(0, Math.round(base * (1 + wave + noise)));
  });
}

/** 24h ingestion by category (events / hour, thousands). */
export const ingestionVolumeTrend: IngestionVolumePoint[] = [
  {
    hour: "00:00",
    cloud: 28,
    siem: 11,
    identity: 2.1,
    network: 18,
    other: 0.4,
  },
  { hour: "02:00", cloud: 24, siem: 9, identity: 1.6, network: 15, other: 0.3 },
  { hour: "04:00", cloud: 22, siem: 8, identity: 1.4, network: 14, other: 0.2 },
  {
    hour: "06:00",
    cloud: 31,
    siem: 12,
    identity: 2.8,
    network: 21,
    other: 0.5,
  },
  {
    hour: "08:00",
    cloud: 48,
    siem: 19,
    identity: 4.2,
    network: 32,
    other: 0.9,
  },
  {
    hour: "10:00",
    cloud: 56,
    siem: 22,
    identity: 5.1,
    network: 38,
    other: 1.1,
  },
  {
    hour: "12:00",
    cloud: 61,
    siem: 18,
    identity: 5.4,
    network: 41,
    other: 1.2,
  },
  {
    hour: "14:00",
    cloud: 58,
    siem: 14,
    identity: 4.9,
    network: 39,
    other: 1.0,
  },
  {
    hour: "16:00",
    cloud: 52,
    siem: 10,
    identity: 4.6,
    network: 35,
    other: 0.9,
  },
  { hour: "18:00", cloud: 44, siem: 9, identity: 3.8, network: 29, other: 0.7 },
  { hour: "20:00", cloud: 37, siem: 8, identity: 2.9, network: 24, other: 0.5 },
  { hour: "22:00", cloud: 33, siem: 7, identity: 2.4, network: 20, other: 0.4 },
];

export const connectorActivity: ConnectorActivity[] = [
  {
    id: "act-1",
    integrationId: "int-splunk-core",
    kind: "error",
    title: "Splunk HEC authentication failed",
    detail: "Token rejected after rotation · 3 retries exhausted",
    time: "12 min ago",
  },
  {
    id: "act-2",
    integrationId: "int-okta-workforce",
    kind: "sync",
    title: "Okta inventory lagging SLA",
    detail: "User sync lag 22m · target ≤ 5m",
    time: "18 min ago",
  },
  {
    id: "act-3",
    integrationId: "int-aws-prod",
    kind: "sync",
    title: "AWS CloudTrail batch completed",
    detail: "14 accounts · 38.2k events ingested",
    time: "36 sec ago",
  },
  {
    id: "act-4",
    integrationId: "int-chronicle",
    kind: "connect",
    title: "Google SecOps validating access",
    detail: "Service account permissions under review",
    time: "1 hr ago",
  },
  {
    id: "act-5",
    integrationId: "int-pagerduty",
    kind: "pause",
    title: "PagerDuty escalations paused",
    detail: "Paused by Luis Ortega during maintenance window",
    time: "2 days ago",
  },
  {
    id: "act-6",
    integrationId: "int-cloudflare",
    kind: "credential",
    title: "Cloudflare API token rotated",
    detail: "Automatic rotation completed · Logpush healthy",
    time: "3 days ago",
  },
  {
    id: "act-7",
    integrationId: "int-jira",
    kind: "sync",
    title: "Jira remediation sync completed",
    detail: "12 findings updated · 0 conflicts",
    time: "5 min ago",
  },
];

export const integrations: Integration[] = [
  {
    id: "int-aws-prod",
    vendorKey: "aws",
    vendor: "Amazon Web Services",
    name: "AWS Production",
    description:
      "Cloud security telemetry from production accounts and organization-level services.",
    category: "cloud",
    status: "connected",
    health: "healthy",
    dataTypes: ["CloudTrail", "GuardDuty", "Security Hub"],
    lastSync: "36 sec ago",
    eventsPerDay: 842_300,
    connectedBy: "Maya Chen",
    connectedAt: "May 14, 2026",
    region: "us-east-1 · 14 accounts",
    version: "AssumeRole v2",
    credentialExpiry: "Rotates automatically",
    latencyMs: 420,
    errorRate: 0.12,
    dropRate: 0.04,
    coveragePercent: 98,
    volumeTrend: trendFromBase(35_100),
  },
  {
    id: "int-splunk-core",
    vendorKey: "splunk",
    vendor: "Splunk",
    name: "Splunk Enterprise",
    description:
      "Bidirectional event search and notable-event ingestion from the core SIEM.",
    category: "siem",
    status: "error",
    health: "failed",
    dataTypes: ["Notable events", "Search results", "Risk events"],
    lastSync: "47 min ago",
    eventsPerDay: 285_900,
    connectedBy: "Hadrien Voss",
    connectedAt: "Apr 2, 2026",
    region: "soc-splunk.svalbard.internal",
    version: "HEC 9.3",
    credentialExpiry: "Jul 26, 2026",
    errorMessage: "HEC token rejected after credential rotation.",
    latencyMs: 8400,
    errorRate: 42.5,
    dropRate: 18.2,
    coveragePercent: 61,
    volumeTrend: trendFromBase(11_900, 0.45),
  },
  {
    id: "int-okta-workforce",
    vendorKey: "okta",
    vendor: "Okta",
    name: "Okta Workforce",
    description:
      "Identity lifecycle, authentication, and risk events for workforce identities.",
    category: "identity",
    status: "connected",
    health: "degraded",
    dataTypes: ["System Log", "Users", "Applications"],
    lastSync: "8 min ago",
    eventsPerDay: 74_200,
    connectedBy: "Meera Shah",
    connectedAt: "Mar 18, 2026",
    region: "svalbard.okta.com",
    version: "System Log API",
    credentialExpiry: "Aug 3, 2026",
    errorMessage: "User inventory is 22 minutes behind the target SLA.",
    latencyMs: 2100,
    errorRate: 3.8,
    dropRate: 1.4,
    coveragePercent: 87,
    volumeTrend: trendFromBase(3_090, 0.28),
  },
  {
    id: "int-chronicle",
    vendorKey: "chronicle",
    vendor: "Google",
    name: "Google Security Operations",
    description:
      "Normalized detections and UDM events from Google Security Operations.",
    category: "siem",
    status: "pending",
    health: "healthy",
    dataTypes: ["UDM events", "Detections", "Reference lists"],
    lastSync: "Validating access",
    connectedBy: "Owen Brooks",
    connectedAt: "Jul 24, 2026",
    region: "US multi-region",
    version: "Chronicle API v2",
    latencyMs: undefined,
    coveragePercent: 0,
    volumeTrend: Array.from({ length: 24 }, () => 0),
  },
  {
    id: "int-palo-edge",
    vendorKey: "palo-alto",
    vendor: "Palo Alto Networks",
    name: "PAN-OS Edge Firewalls",
    description:
      "Traffic, threat, URL, and system logs from perimeter firewalls.",
    category: "network",
    status: "connected",
    health: "healthy",
    dataTypes: ["Threat logs", "Traffic logs", "URL logs"],
    lastSync: "1 min ago",
    eventsPerDay: 196_800,
    connectedBy: "Luis Ortega",
    connectedAt: "Feb 9, 2026",
    region: "3 collectors · 8 firewalls",
    version: "PAN-OS 11.2",
    credentialExpiry: "Sep 11, 2026",
    latencyMs: 380,
    errorRate: 0.08,
    dropRate: 0.02,
    coveragePercent: 95,
    volumeTrend: trendFromBase(8_200),
  },
  {
    id: "int-cloudflare",
    vendorKey: "cloudflare",
    vendor: "Cloudflare",
    name: "Cloudflare Enterprise",
    description: "WAF, Zero Trust, DNS, and HTTP request security events.",
    category: "network",
    status: "connected",
    health: "healthy",
    dataTypes: ["WAF events", "Gateway logs", "Access logs"],
    lastSync: "18 sec ago",
    eventsPerDay: 421_500,
    connectedBy: "Maya Chen",
    connectedAt: "Jan 22, 2026",
    region: "Global · 6 zones",
    version: "Logpush v2",
    credentialExpiry: "Oct 1, 2026",
    latencyMs: 290,
    errorRate: 0.05,
    dropRate: 0.01,
    coveragePercent: 99,
    volumeTrend: trendFromBase(17_560),
  },
  {
    id: "int-slack",
    vendorKey: "slack",
    vendor: "Slack",
    name: "Security Operations Alerts",
    description:
      "Route detections, assignments, and incident updates to Slack.",
    category: "communication",
    status: "connected",
    health: "healthy",
    dataTypes: ["Critical alerts", "Incident updates"],
    lastSync: "2 min ago",
    eventsPerDay: 84,
    connectedBy: "Hadrien Voss",
    connectedAt: "Jun 3, 2026",
    region: "#soc-alerts · #incidents",
    version: "Slack app",
    latencyMs: 180,
    errorRate: 0,
    dropRate: 0,
    coveragePercent: 100,
    volumeTrend: trendFromBase(4, 0.35),
  },
  {
    id: "int-jira",
    vendorKey: "jira",
    vendor: "Atlassian",
    name: "Jira Security Project",
    description: "Create and synchronize remediation tickets with Jira.",
    category: "ticketing",
    status: "connected",
    health: "healthy",
    dataTypes: ["Findings", "Incidents", "Remediation status"],
    lastSync: "5 min ago",
    eventsPerDay: 112,
    connectedBy: "Meera Shah",
    connectedAt: "Jun 12, 2026",
    region: "SEC project",
    version: "Jira Cloud REST v3",
    credentialExpiry: "Nov 19, 2026",
    latencyMs: 510,
    errorRate: 0.2,
    dropRate: 0,
    coveragePercent: 100,
    volumeTrend: trendFromBase(5, 0.4),
  },
  {
    id: "int-pagerduty",
    vendorKey: "pagerduty",
    vendor: "PagerDuty",
    name: "SOC Escalations",
    description:
      "Escalate high-severity detections to the on-call response team.",
    category: "ticketing",
    status: "paused",
    health: "healthy",
    dataTypes: ["Critical alerts", "Escalation status"],
    lastSync: "Paused 2 days ago",
    eventsPerDay: 0,
    connectedBy: "Luis Ortega",
    connectedAt: "May 28, 2026",
    region: "SOC Primary service",
    version: "Events API v2",
    latencyMs: 0,
    errorRate: 0,
    dropRate: 0,
    coveragePercent: 0,
    volumeTrend: Array.from({ length: 24 }, () => 0),
  },
  {
    id: "int-datadog",
    vendorKey: "datadog",
    vendor: "Datadog",
    name: "Datadog Cloud SIEM",
    description:
      "Cloud SIEM signals, audit trail, and infrastructure telemetry.",
    category: "siem",
    status: "available",
    dataTypes: ["Security signals", "Audit trail", "Cloud logs"],
  },
  {
    id: "int-elastic",
    vendorKey: "elastic",
    vendor: "Elastic",
    name: "Elastic Security",
    description: "Detections, cases, and Elasticsearch event data.",
    category: "siem",
    status: "available",
    dataTypes: ["Detections", "Cases", "ECS events"],
  },
  {
    id: "int-github",
    vendorKey: "github",
    vendor: "GitHub",
    name: "GitHub Enterprise Cloud",
    description: "Organization audit logs, code scanning, and secret alerts.",
    category: "cloud",
    status: "available",
    dataTypes: ["Audit log", "Code scanning", "Secret scanning"],
  },
  {
    id: "int-gitlab",
    vendorKey: "gitlab",
    vendor: "GitLab",
    name: "GitLab Ultimate",
    description:
      "Audit events, vulnerabilities, and pipeline security findings.",
    category: "cloud",
    status: "available",
    dataTypes: ["Audit events", "Vulnerabilities", "Pipelines"],
  },
  {
    id: "int-sentry",
    vendorKey: "sentry",
    vendor: "Sentry",
    name: "Sentry",
    description: "Application errors and security-relevant runtime issues.",
    category: "endpoint",
    status: "available",
    dataTypes: ["Issues", "Audit events", "Release health"],
  },
  {
    id: "int-snyk",
    vendorKey: "snyk",
    vendor: "Snyk",
    name: "Snyk AppSec",
    description: "Open-source, container, IaC, and code security findings.",
    category: "endpoint",
    status: "available",
    dataTypes: ["Code findings", "Container findings", "IaC findings"],
  },
  {
    id: "int-cisco",
    vendorKey: "cisco",
    vendor: "Cisco",
    name: "Cisco Secure Firewall",
    description: "Intrusion, connection, malware, and file security events.",
    category: "network",
    status: "available",
    dataTypes: ["Intrusion events", "Connections", "Malware events"],
  },
  {
    id: "int-fortinet",
    vendorKey: "fortinet",
    vendor: "Fortinet",
    name: "FortiGate",
    description: "Firewall, VPN, IPS, and web-filter telemetry.",
    category: "network",
    status: "available",
    dataTypes: ["Traffic logs", "IPS events", "VPN events"],
  },
  {
    id: "int-docker",
    vendorKey: "docker",
    vendor: "Docker",
    name: "Docker Business",
    description: "Container image activity and organization audit events.",
    category: "endpoint",
    status: "available",
    dataTypes: ["Audit logs", "Image activity", "Repository events"],
  },
  {
    id: "int-kubernetes",
    vendorKey: "kubernetes",
    vendor: "Kubernetes",
    name: "Kubernetes Audit",
    description: "Cluster audit events and workload inventory from Kubernetes.",
    category: "cloud",
    status: "available",
    dataTypes: ["Audit events", "Workloads", "RBAC changes"],
  },
  {
    id: "int-terraform",
    vendorKey: "terraform",
    vendor: "HashiCorp",
    name: "HCP Terraform",
    description: "Workspace audit trails, runs, and policy-check results.",
    category: "cloud",
    status: "available",
    dataTypes: ["Audit trails", "Runs", "Policy checks"],
  },
];

export function isIntegrationIssue(integration: Integration) {
  return (
    integration.status === "error" ||
    integration.health === "degraded" ||
    integration.health === "failed"
  );
}

export function getIntegrationStats(items: Integration[]) {
  const connected = items.filter((item) =>
    ["connected", "error", "pending", "paused"].includes(item.status),
  );

  return {
    total: items.length,
    connected: connected.length,
    needsAttention: items.filter(isIntegrationIssue).length,
    eventsPerDay: connected.reduce(
      (total, item) => total + (item.eventsPerDay ?? 0),
      0,
    ),
  };
}

export type HealthBucket =
  | "healthy"
  | "degraded"
  | "failed"
  | "pending"
  | "paused"
  | "available";

export const healthBucketLabels: Record<HealthBucket, string> = {
  healthy: "Healthy",
  degraded: "Degraded",
  failed: "Failed",
  pending: "Validating",
  paused: "Paused",
  available: "Available",
};

export const healthBucketColors: Record<HealthBucket, string> = {
  healthy: "#16a34a",
  degraded: "#d97706",
  failed: "#dc2626",
  pending: "#2563eb",
  paused: "#71717a",
  available: "#a1a1aa",
};

export function getHealthBucket(integration: Integration): HealthBucket {
  if (integration.status === "available") return "available";
  if (integration.status === "pending") return "pending";
  if (integration.status === "paused") return "paused";
  if (integration.status === "error" || integration.health === "failed") {
    return "failed";
  }
  if (integration.health === "degraded") return "degraded";
  return "healthy";
}

export function getHealthBreakdown(items: Integration[]) {
  const order: HealthBucket[] = [
    "healthy",
    "degraded",
    "failed",
    "pending",
    "paused",
    "available",
  ];
  const counts = Object.fromEntries(order.map((key) => [key, 0])) as Record<
    HealthBucket,
    number
  >;

  for (const item of items) {
    counts[getHealthBucket(item)] += 1;
  }

  return order.map((key) => ({
    key,
    label: healthBucketLabels[key],
    value: counts[key],
    color: healthBucketColors[key],
  }));
}

export function getCategoryCoverage(items: Integration[]) {
  const categories = Object.keys(
    integrationCategoryLabels,
  ) as IntegrationCategory[];

  return categories.map((category) => {
    const group = items.filter((item) => item.category === category);
    const connected = group.filter((item) => item.status !== "available");
    return {
      category,
      label: integrationCategoryLabels[category],
      shortLabel: integrationCategoryLabels[category]
        .replace(" & infrastructure", "")
        .replace(" & observability", "")
        .replace(" & workload", "")
        .replace(" & communication", "")
        .replace(" & response", ""),
      total: group.length,
      connected: connected.length,
      available: group.length - connected.length,
      eventsPerDay: connected.reduce(
        (sum, item) => sum + (item.eventsPerDay ?? 0),
        0,
      ),
    };
  });
}

export function getTopSourcesByVolume(items: Integration[], limit = 6) {
  return [...items]
    .filter((item) => (item.eventsPerDay ?? 0) > 0)
    .sort((a, b) => (b.eventsPerDay ?? 0) - (a.eventsPerDay ?? 0))
    .slice(0, limit);
}

export function getAverageLatency(items: Integration[]) {
  const withLatency = items.filter(
    (item) =>
      item.status !== "available" &&
      item.status !== "paused" &&
      typeof item.latencyMs === "number" &&
      item.latencyMs > 0,
  );
  if (withLatency.length === 0) return 0;
  return Math.round(
    withLatency.reduce((sum, item) => sum + (item.latencyMs ?? 0), 0) /
      withLatency.length,
  );
}

export function getAverageCoverage(items: Integration[]) {
  const connected = items.filter(
    (item) =>
      item.status !== "available" && typeof item.coveragePercent === "number",
  );
  if (connected.length === 0) return 0;
  return Math.round(
    connected.reduce((sum, item) => sum + (item.coveragePercent ?? 0), 0) /
      connected.length,
  );
}

export function getIntegrationActivity(integrationId: string) {
  return connectorActivity.filter(
    (item) => item.integrationId === integrationId,
  );
}

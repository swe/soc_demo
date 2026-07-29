import type { IconType } from "react-icons";
import {
  SiAmazonwebservices,
  SiAnsible,
  SiCisco,
  SiCloudflare,
  SiDatadog,
  SiDocker,
  SiElastic,
  SiFortinet,
  SiGithub,
  SiGitlab,
  SiGooglechronicle,
  SiGooglecloud,
  SiGraylog,
  SiHive,
  SiJira,
  SiKubernetes,
  SiLinear,
  SiLinux,
  SiMailchimp,
  SiMattermost,
  SiMoodle,
  SiOkta,
  SiPagerduty,
  SiPaloaltonetworks,
  SiPrisma,
  SiQualys,
  SiSentry,
  SiSlack,
  SiSnyk,
  SiSplunk,
  SiSumologic,
  SiTerraform,
  SiVault,
} from "react-icons/si";

export type IntegrationCategory =
  | "cloud"
  | "siem"
  | "identity"
  | "endpoint"
  | "network"
  | "communication"
  | "ticketing"
  | "etl"
  | "training";

export type IntegrationStatus =
  | "connected"
  | "error"
  | "pending"
  | "available"
  | "paused";

export type IntegrationHealth = "healthy" | "degraded" | "failed";

export type IntegrationLicense = "open-source" | "commercial";

export type Integration = {
  id: string;
  vendorKey: VendorKey;
  vendor: string;
  name: string;
  description: string;
  category: IntegrationCategory;
  license: IntegrationLicense;
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
  /**
   * Structured degraded / failure reason for admin detail + attention queues.
   * Prefer this over a bare errorMessage when present.
   */
  degradedReason?: DegradedReason;
};

export type DegradedReasonCode =
  | "sla_lag"
  | "auth_failure"
  | "rate_limit"
  | "partial_coverage"
  | "collector_backoff"
  | "schema_drift";

export type DegradedReason = {
  code: DegradedReasonCode;
  summary: string;
  detail: string;
  since?: string;
  /** Suggested operator next step shown in the detail sheet. */
  remediation?: string;
};

export const degradedReasonLabels: Record<DegradedReasonCode, string> = {
  sla_lag: "SLA lag",
  auth_failure: "Authentication failure",
  rate_limit: "Rate limited",
  partial_coverage: "Partial coverage",
  collector_backoff: "Collector backoff",
  schema_drift: "Schema drift",
};

export type ConnectorActivityKind =
  | "sync"
  | "health"
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

/** Default Heimdall field map for a catalog source (backend connect contract). */
export function defaultFieldMapForIntegration(
  integrationId: string,
): Record<string, string> {
  const byId: Record<string, Record<string, string>> = {
    "int-aws-prod": {
      "userIdentity.arn": "actor.cloud.arn",
      eventName: "action.name",
      sourceIPAddress: "src.ip",
      "resources.ARN": "resource.arn",
    },
    "int-splunk-core": {
      src_ip: "src.ip",
      dest_ip: "dst.ip",
      user: "actor.identity",
      signature: "detection.name",
    },
    "int-okta-workforce": {
      "actor.alternateId": "actor.identity",
      "client.ipAddress": "src.ip",
      "client.geographicalContext.city": "actor.geo.city",
      eventType: "action.name",
    },
    "int-chronicle-secops": {
      "principal.hostname": "device.hostname",
      "principal.user.userid": "actor.identity",
      "target.ip": "dst.ip",
      "metadata.product_event_type": "detection.name",
    },
    "int-sentinel-workspace": {
      AccountUpn: "actor.identity",
      CompromisedEntity: "device.hostname",
      AlertName: "detection.name",
      ProviderName: "source.vendor",
    },
    "int-defender-endpoint": {
      DeviceName: "device.hostname",
      AccountName: "actor.identity",
      RemoteIP: "src.ip",
      ThreatName: "detection.name",
    },
    "int-crowdstrike-falcon": {
      "event.ComputerName": "device.hostname",
      "event.UserName": "actor.identity",
      "event.DetectName": "detection.name",
      "event.LocalIP": "src.ip",
    },
    "int-cribl-stream": {
      host: "device.hostname",
      sourcetype: "event.category",
      _raw: "event.raw",
      index: "pipeline.index",
    },
    "int-fluent-bit": {
      host: "device.hostname",
      message: "event.message",
      stream: "pipeline.stream",
    },
    "int-vector-obs": {
      host: "device.hostname",
      message: "event.message",
      source_type: "pipeline.source",
    },
    "int-palo-edge": {
      src: "src.ip",
      dst: "dst.ip",
      rule: "detection.name",
      user: "actor.identity",
    },
    "int-cloudflare": {
      ClientIP: "src.ip",
      ClientRequestHost: "http.host",
      EdgeResponseStatus: "http.status",
      WAFAction: "detection.action",
    },
  };
  return byId[integrationId] ?? {
    host: "device.hostname",
    user: "actor.identity",
    src_ip: "src.ip",
    event_type: "action.name",
  };
}

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
  | "teams"
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
  | "terraform"
  | "microsoft"
  | "servicenow"
  | "proofpoint"
  | "crowdstrike"
  | "workday"
  | "cribl"
  | "fluentbit"
  | "vector"
  | "wazuh"
  | "wiz"
  | "moodle"
  | "sentinelone"
  | "qualys"
  | "tenable"
  | "rapid7"
  | "misp"
  | "opencti"
  | "thehive"
  | "shuffle"
  | "velociraptor"
  | "suricata"
  | "zeek"
  | "graylog"
  | "ibm"
  | "sumologic"
  | "orca"
  | "lacework"
  | "zscaler"
  | "netskope"
  | "duo"
  | "cyberark"
  | "knowbe4"
  | "mimecast"
  | "abnormal"
  | "recordedfuture"
  | "alienvault"
  | "checkpoint"
  | "sophos"
  | "carbonblack"
  | "linear"
  | "freshservice"
  | "mattermost"
  | "ansible"
  | "vault"
  | "azure"
  | "googlecloud";

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
  teams: {
    icon: SiSlack,
    color: "#6264A7",
    background: "bg-[#6264A7]/10",
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
  microsoft: {
    icon: SiCloudflare,
    color: "#00A4EF",
    background: "bg-[#00A4EF]/10",
  },
  servicenow: {
    icon: SiJira,
    color: "#81B5A1",
    background: "bg-[#81B5A1]/15",
  },
  proofpoint: {
    icon: SiMailchimp,
    color: "#4A90D9",
    background: "bg-[#4A90D9]/10",
  },
  crowdstrike: {
    icon: SiSnyk,
    color: "#EC0000",
    background: "bg-[#EC0000]/10",
  },
  workday: {
    icon: SiOkta,
    color: "#F68D2E",
    background: "bg-[#F68D2E]/10",
  },
  cribl: {
    icon: SiDatadog,
    color: "#4B32C3",
    background: "bg-[#4B32C3]/10",
  },
  fluentbit: {
    icon: SiDocker,
    color: "#1A98E3",
    background: "bg-[#1A98E3]/10",
  },
  vector: {
    icon: SiElastic,
    color: "#10B981",
    background: "bg-[#10B981]/10",
  },
  wazuh: {
    icon: SiLinux,
    color: "#01A4A4",
    background: "bg-[#01A4A4]/10",
  },
  wiz: {
    icon: SiPrisma,
    color: "#7B61FF",
    background: "bg-[#7B61FF]/10",
  },
  moodle: {
    icon: SiMoodle,
    color: "#F98012",
    background: "bg-[#F98012]/10",
  },
  sentinelone: {
    icon: SiSnyk,
    color: "#6E1FFF",
    background: "bg-[#6E1FFF]/10",
  },
  qualys: {
    icon: SiQualys,
    color: "#ED2E26",
    background: "bg-[#ED2E26]/10",
  },
  tenable: {
    icon: SiElastic,
    color: "#00A0DF",
    background: "bg-[#00A0DF]/10",
  },
  rapid7: {
    icon: SiElastic,
    color: "#F26422",
    background: "bg-[#F26422]/10",
  },
  misp: {
    icon: SiGithub,
    color: "#3C3C3C",
    background: "bg-foreground/[0.06]",
  },
  opencti: {
    icon: SiElastic,
    color: "#0FBCF9",
    background: "bg-[#0FBCF9]/10",
  },
  thehive: {
    icon: SiHive,
    color: "#FF6B00",
    background: "bg-[#FF6B00]/10",
  },
  shuffle: {
    icon: SiGithub,
    color: "#E85D04",
    background: "bg-[#E85D04]/10",
  },
  velociraptor: {
    icon: SiLinux,
    color: "#FF6600",
    background: "bg-[#FF6600]/10",
  },
  suricata: {
    icon: SiLinux,
    color: "#E74C3C",
    background: "bg-[#E74C3C]/10",
  },
  zeek: {
    icon: SiLinux,
    color: "#305F78",
    background: "bg-[#305F78]/10",
  },
  graylog: {
    icon: SiGraylog,
    color: "#FF3633",
    background: "bg-[#FF3633]/10",
  },
  ibm: {
    icon: SiElastic,
    color: "#054ADA",
    background: "bg-[#054ADA]/10",
  },
  sumologic: {
    icon: SiSumologic,
    color: "#000099",
    background: "bg-[#000099]/10",
  },
  orca: {
    icon: SiCloudflare,
    color: "#6366F1",
    background: "bg-[#6366F1]/10",
  },
  lacework: {
    icon: SiCloudflare,
    color: "#00B4D8",
    background: "bg-[#00B4D8]/10",
  },
  zscaler: {
    icon: SiCloudflare,
    color: "#00AEEF",
    background: "bg-[#00AEEF]/10",
  },
  netskope: {
    icon: SiCloudflare,
    color: "#00B5E2",
    background: "bg-[#00B5E2]/10",
  },
  duo: {
    icon: SiOkta,
    color: "#6DC04B",
    background: "bg-[#6DC04B]/10",
  },
  cyberark: {
    icon: SiOkta,
    color: "#1A1F71",
    background: "bg-[#1A1F71]/10",
  },
  knowbe4: {
    icon: SiMailchimp,
    color: "#A4CE39",
    background: "bg-[#A4CE39]/15",
  },
  mimecast: {
    icon: SiMailchimp,
    color: "#C4A000",
    background: "bg-[#C4A000]/10",
  },
  abnormal: {
    icon: SiMailchimp,
    color: "#5B5FC7",
    background: "bg-[#5B5FC7]/10",
  },
  recordedfuture: {
    icon: SiElastic,
    color: "#E31837",
    background: "bg-[#E31837]/10",
  },
  alienvault: {
    icon: SiElastic,
    color: "#00ADEF",
    background: "bg-[#00ADEF]/10",
  },
  checkpoint: {
    icon: SiFortinet,
    color: "#E8002D",
    background: "bg-[#E8002D]/10",
  },
  sophos: {
    icon: SiSnyk,
    color: "#009999",
    background: "bg-[#009999]/10",
  },
  carbonblack: {
    icon: SiSnyk,
    color: "#E31C23",
    background: "bg-[#E31C23]/10",
  },
  linear: {
    icon: SiLinear,
    color: "#5E6AD2",
    background: "bg-[#5E6AD2]/10",
  },
  freshservice: {
    icon: SiJira,
    color: "#25C16F",
    background: "bg-[#25C16F]/10",
  },
  mattermost: {
    icon: SiMattermost,
    color: "#0058CC",
    background: "bg-[#0058CC]/10",
  },
  ansible: {
    icon: SiAnsible,
    color: "#EE0000",
    background: "bg-[#EE0000]/10",
  },
  vault: {
    icon: SiVault,
    color: "#FFEC6E",
    background: "bg-[#FFEC6E]/20 dark:bg-[#FFEC6E]/10",
  },
  azure: {
    icon: SiCloudflare,
    color: "#0078D4",
    background: "bg-[#0078D4]/10",
  },
  googlecloud: {
    icon: SiGooglecloud,
    color: "#4285F4",
    background: "bg-[#4285F4]/10",
  },
};

export const licenseLabels: Record<IntegrationLicense, string> = {
  "open-source": "Open source",
  commercial: "Commercial",
};

export const integrationCategoryLabels: Record<IntegrationCategory, string> = {
  cloud: "Cloud & infrastructure",
  siem: "SIEM & observability",
  identity: "Identity",
  endpoint: "Endpoint & workload",
  network: "Network security",
  communication: "Alerts & communication",
  ticketing: "Ticketing & response",
  etl: "Ingest & data prep",
  training: "Training & LMS",
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
    detail: "Token rejected after rotation · 3 retries exhausted · HTTP 401",
    time: "12 min ago",
  },
  {
    id: "act-1b",
    integrationId: "int-splunk-core",
    kind: "health",
    title: "Health probe marked failed",
    detail: "HEC /services/collector/health returned unauthorized",
    time: "12 min ago",
  },
  {
    id: "act-1c",
    integrationId: "int-splunk-core",
    kind: "sync",
    title: "Notable-event pull aborted",
    detail: "0 events · collector entered backoff after auth failure",
    time: "13 min ago",
  },
  {
    id: "act-2",
    integrationId: "int-okta-workforce",
    kind: "health",
    title: "Health degraded — SLA lag",
    detail: "User inventory lag 22m · target ≤ 5m · System Log still flowing",
    time: "18 min ago",
  },
  {
    id: "act-2b",
    integrationId: "int-okta-workforce",
    kind: "sync",
    title: "Okta users delta sync slow",
    detail: "Page cursor advanced 4/17 · rate-limit headers near ceiling",
    time: "19 min ago",
  },
  {
    id: "act-2c",
    integrationId: "int-okta-workforce",
    kind: "sync",
    title: "Okta System Log batch completed",
    detail: "2.4k auth events ingested · lag within SLA",
    time: "8 min ago",
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
    id: "act-3b",
    integrationId: "int-aws-prod",
    kind: "health",
    title: "Health check passed",
    detail: "AssumeRole + GetCallerIdentity OK · 14/14 accounts",
    time: "2 min ago",
  },
  {
    id: "act-4",
    integrationId: "int-chronicle-secops",
    kind: "connect",
    title: "Google SecOps validating access",
    detail: "Service account permissions under review",
    time: "1 hr ago",
  },
  {
    id: "act-4b",
    integrationId: "int-chronicle-secops",
    kind: "health",
    title: "Health pending validation",
    detail: "UDM search scope not yet confirmed",
    time: "58 min ago",
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
    id: "act-6b",
    integrationId: "int-cloudflare",
    kind: "health",
    title: "Health check passed",
    detail: "Logpush destinations reachable · WAF events flowing",
    time: "45 sec ago",
  },
  {
    id: "act-7",
    integrationId: "int-jira-secops",
    kind: "sync",
    title: "Jira remediation sync completed",
    detail: "12 findings updated · 0 conflicts",
    time: "5 min ago",
  },
  {
    id: "act-8",
    integrationId: "int-palo-edge",
    kind: "sync",
    title: "PAN-OS threat log batch completed",
    detail: "8 firewalls · 6.1k threat events",
    time: "1 min ago",
  },
  {
    id: "act-9",
    integrationId: "int-slack",
    kind: "sync",
    title: "Slack outbound delivery OK",
    detail: "14 alert posts · 0 channel errors",
    time: "2 min ago",
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
    license: "commercial",
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
    license: "commercial",
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
    degradedReason: {
      code: "auth_failure",
      summary: "HEC authentication failed",
      detail:
        "HTTP Event Collector rejected the rotated token (HTTP 401). Notable-event pull aborted after 3 retries; collector is in backoff.",
      since: "47 min ago",
      remediation:
        "Rotate or re-issue the HEC token in Splunk, then reconnect credentials in Heimdall.",
    },
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
    license: "commercial",
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
    degradedReason: {
      code: "sla_lag",
      summary: "User inventory lagging SLA",
      detail:
        "Users/Applications delta sync lag is 22 minutes (target ≤ 5m). System Log ingest remains healthy; Okta rate-limit headers are near ceiling on the inventory cursor.",
      since: "18 min ago",
      remediation:
        "Narrow group scope or raise Okta API rate allotment; re-run inventory sync after the cursor catches up.",
    },
    latencyMs: 2100,
    errorRate: 3.8,
    dropRate: 1.4,
    coveragePercent: 87,
    volumeTrend: trendFromBase(3_090, 0.28),
  },
  {
    id: "int-chronicle-secops",
    vendorKey: "chronicle",
    vendor: "Google",
    name: "Google Security Operations",
    description:
      "Normalized detections and UDM events from Google Security Operations.",
    category: "siem",
    license: "commercial",
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
    license: "commercial",
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
    license: "commercial",
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
    license: "commercial",
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
    id: "int-jira-secops",
    vendorKey: "jira",
    vendor: "Atlassian",
    name: "Jira Security Project",
    description: "Create and synchronize remediation tickets with Jira.",
    category: "ticketing",
    license: "commercial",
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
    id: "int-servicenow",
    vendorKey: "servicenow",
    vendor: "ServiceNow",
    name: "ServiceNow ITSM",
    description:
      "Bi-directional incident sync — create, update, and pull ITSM ticket state.",
    category: "ticketing",
    license: "commercial",
    status: "connected",
    health: "healthy",
    dataTypes: ["Incidents", "Work notes", "Assignment groups"],
    lastSync: "3 min ago",
    eventsPerDay: 96,
    connectedBy: "Meera Shah",
    connectedAt: "Jun 18, 2026",
    region: "svalbard.service-now.com",
    version: "Table API",
    credentialExpiry: "Jan 8, 2027",
    latencyMs: 420,
    errorRate: 0.1,
    dropRate: 0,
    coveragePercent: 100,
    volumeTrend: trendFromBase(4, 0.35),
  },
  {
    id: "int-teams",
    vendorKey: "teams",
    vendor: "Microsoft",
    name: "Microsoft Teams",
    description:
      "Route war-room updates, approvals, and on-call notifications to Teams channels.",
    category: "communication",
    license: "commercial",
    status: "connected",
    health: "healthy",
    dataTypes: ["Channel posts", "Adaptive cards", "Approvals"],
    lastSync: "1 min ago",
    eventsPerDay: 64,
    connectedBy: "Hadrien Voss",
    connectedAt: "Jun 20, 2026",
    region: "SOC Operations team",
    version: "Graph API",
    latencyMs: 210,
    errorRate: 0,
    dropRate: 0,
    coveragePercent: 100,
    volumeTrend: trendFromBase(3, 0.4),
  },
  {
    id: "int-mdo-email",
    vendorKey: "microsoft",
    vendor: "Microsoft",
    name: "Microsoft Defender for Office 365",
    description:
      "Mailbox phishing alerts, URL/attachment verdicts, and purge / block remediation.",
    category: "endpoint",
    license: "commercial",
    status: "connected",
    health: "healthy",
    dataTypes: ["Email alerts", "URL verdicts", "Mailbox actions"],
    lastSync: "2 min ago",
    eventsPerDay: 1_840,
    connectedBy: "Ava Reed",
    connectedAt: "Jun 22, 2026",
    region: "svalbard.ca tenant",
    version: "Graph security",
    credentialExpiry: "Dec 2, 2026",
    latencyMs: 380,
    errorRate: 0.3,
    dropRate: 0,
    coveragePercent: 98,
    volumeTrend: trendFromBase(78, 0.25),
  },
  {
    id: "int-proofpoint",
    vendorKey: "proofpoint",
    vendor: "Proofpoint",
    name: "Proofpoint Email Security",
    description:
      "Gateway phishing detections, BEC signals, and URL rewriting telemetry.",
    category: "endpoint",
    license: "commercial",
    status: "connected",
    health: "healthy",
    dataTypes: ["Gateway alerts", "BEC scores", "URL clicks"],
    lastSync: "4 min ago",
    eventsPerDay: 2_210,
    connectedBy: "Ava Reed",
    connectedAt: "Jun 25, 2026",
    region: "TAP cluster",
    version: "SIEM API",
    credentialExpiry: "Oct 14, 2026",
    latencyMs: 450,
    errorRate: 0.4,
    dropRate: 0.1,
    coveragePercent: 97,
    volumeTrend: trendFromBase(92, 0.22),
  },
  {
    id: "int-pagerduty",
    vendorKey: "pagerduty",
    vendor: "PagerDuty",
    name: "SOC Escalations",
    description:
      "Escalate high-severity detections to the on-call response team.",
    category: "ticketing",
    license: "commercial",
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
    license: "commercial",
    status: "available",
    dataTypes: ["Security signals", "Audit trail", "Cloud logs"],
  },
  {
    id: "int-elastic-security",
    vendorKey: "elastic",
    vendor: "Elastic",
    name: "Elastic Security",
    description: "Detections, cases, and Elasticsearch event data.",
    category: "siem",
    license: "commercial",
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
    license: "commercial",
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
    license: "commercial",
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
    license: "commercial",
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
    license: "commercial",
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
    license: "commercial",
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
    license: "commercial",
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
    license: "open-source",
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
    license: "open-source",
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
    license: "commercial",
    status: "available",
    dataTypes: ["Audit trails", "Runs", "Policy checks"],
  },
  {
    id: "int-sentinel-workspace",
    vendorKey: "microsoft",
    vendor: "Microsoft",
    name: "Microsoft Sentinel",
    description:
      "Cloud SIEM workspace — KQL hunting, analytics rules, and incident sync.",
    category: "siem",
    license: "commercial",
    status: "available",
    dataTypes: ["SecurityAlert", "SecurityIncident", "Heartbeat"],
  },
  {
    id: "int-defender-endpoint",
    vendorKey: "microsoft",
    vendor: "Microsoft",
    name: "Microsoft Defender for Endpoint",
    description:
      "Endpoint alerts, device inventory, and live response / isolation actions.",
    category: "endpoint",
    license: "commercial",
    status: "available",
    dataTypes: ["Alerts", "Devices", "Actions"],
  },
  {
    id: "int-crowdstrike-falcon",
    vendorKey: "crowdstrike",
    vendor: "CrowdStrike",
    name: "CrowdStrike Falcon",
    description:
      "EDR detections, host containment, and Real Time Response activity.",
    category: "endpoint",
    license: "commercial",
    status: "available",
    dataTypes: ["Detections", "Hosts", "RTR"],
  },
  {
    id: "int-cribl-stream",
    vendorKey: "cribl",
    vendor: "Cribl",
    name: "Cribl Stream",
    description:
      "Ingest pipeline — shape, route, and reduce telemetry before SIEM land.",
    category: "etl",
    license: "commercial",
    status: "available",
    dataTypes: ["Pipelines", "Routes", "Packs"],
  },
  {
    id: "int-fluent-bit",
    vendorKey: "fluentbit",
    vendor: "Fluent Bit",
    name: "Fluent Bit",
    description:
      "Lightweight log shipper for edge collection into Heimdall normalize.",
    category: "etl",
    license: "open-source",
    status: "available",
    dataTypes: ["Logs", "Metrics", "Traces"],
  },
  {
    id: "int-vector-obs",
    vendorKey: "vector",
    vendor: "Datadog Vector",
    name: "Vector",
    description:
      "Observability data pipeline for transform and fan-out into SIEM/lake.",
    category: "etl",
    license: "open-source",
    status: "available",
    dataTypes: ["Sources", "Transforms", "Sinks"],
  },
  {
    id: "int-lms-workday",
    vendorKey: "workday",
    vendor: "Workday",
    name: "Workday Learning",
    description:
      "LMS roster sync for security awareness and IR training completion.",
    category: "training",
    license: "commercial",
    status: "available",
    dataTypes: ["Courses", "Enrollments", "Completions"],
  },
  {
    id: "int-wazuh",
    vendorKey: "wazuh",
    vendor: "Wazuh",
    name: "Wazuh",
    description:
      "Open-source XDR and SIEM — agent alerts, FIM, vulnerability, and SCA findings.",
    category: "endpoint",
    license: "open-source",
    status: "available",
    dataTypes: ["Alerts", "FIM events", "Vulnerability findings"],
  },
  {
    id: "int-wiz",
    vendorKey: "wiz",
    vendor: "Wiz",
    name: "Wiz",
    description:
      "Cloud security posture, attack paths, and toxic combination findings across clouds.",
    category: "cloud",
    license: "commercial",
    status: "available",
    dataTypes: ["CSPM issues", "Attack paths", "Inventory"],
  },
  {
    id: "int-moodle",
    vendorKey: "moodle",
    vendor: "Moodle",
    name: "Moodle LMS",
    description:
      "Security awareness course enrollments, completions, and quiz results from Moodle.",
    category: "training",
    license: "open-source",
    status: "available",
    dataTypes: ["Courses", "Enrollments", "Completions"],
  },
  {
    id: "int-sentinelone",
    vendorKey: "sentinelone",
    vendor: "SentinelOne",
    name: "SentinelOne Singularity",
    description:
      "Endpoint detections, threat hunting, and remote response actions.",
    category: "endpoint",
    license: "commercial",
    status: "available",
    dataTypes: ["Threats", "Agents", "Activities"],
  },
  {
    id: "int-qualys",
    vendorKey: "qualys",
    vendor: "Qualys",
    name: "Qualys VMDR",
    description:
      "Vulnerability, asset, and detection findings from Qualys VMDR.",
    category: "endpoint",
    license: "commercial",
    status: "available",
    dataTypes: ["Vulnerabilities", "Assets", "Detections"],
  },
  {
    id: "int-tenable",
    vendorKey: "tenable",
    vendor: "Tenable",
    name: "Tenable Vulnerability Management",
    description:
      "Scan results, asset exposure, and plugin-based vulnerability telemetry.",
    category: "endpoint",
    license: "commercial",
    status: "available",
    dataTypes: ["Vulnerabilities", "Assets", "Scans"],
  },
  {
    id: "int-rapid7",
    vendorKey: "rapid7",
    vendor: "Rapid7",
    name: "Rapid7 InsightVM",
    description:
      "Vulnerability assessments, asset risk scores, and remediation tracking.",
    category: "endpoint",
    license: "commercial",
    status: "available",
    dataTypes: ["Vulnerabilities", "Assets", "Remediation"],
  },
  {
    id: "int-misp",
    vendorKey: "misp",
    vendor: "MISP",
    name: "MISP Threat Sharing",
    description:
      "Threat intelligence events, attributes, and galaxy clusters from MISP.",
    category: "siem",
    license: "open-source",
    status: "available",
    dataTypes: ["Events", "Attributes", "Galaxies"],
  },
  {
    id: "int-opencti",
    vendorKey: "opencti",
    vendor: "OpenCTI",
    name: "OpenCTI",
    description:
      "Structured threat intel — observables, indicators, and intrusion sets.",
    category: "siem",
    license: "open-source",
    status: "available",
    dataTypes: ["Indicators", "Observables", "Intrusion sets"],
  },
  {
    id: "int-thehive",
    vendorKey: "thehive",
    vendor: "TheHive",
    name: "TheHive",
    description:
      "Case management for SOC investigations with observables and task sync.",
    category: "ticketing",
    license: "open-source",
    status: "available",
    dataTypes: ["Cases", "Observables", "Tasks"],
  },
  {
    id: "int-shuffle",
    vendorKey: "shuffle",
    vendor: "Shuffle",
    name: "Shuffle SOAR",
    description:
      "Open-source workflow automation for enrichment and response playbooks.",
    category: "etl",
    license: "open-source",
    status: "available",
    dataTypes: ["Workflows", "Executions", "Apps"],
  },
  {
    id: "int-velociraptor",
    vendorKey: "velociraptor",
    vendor: "Velociraptor",
    name: "Velociraptor",
    description:
      "Endpoint forensics and hunting — artifact collections and live queries.",
    category: "endpoint",
    license: "open-source",
    status: "available",
    dataTypes: ["Artifacts", "Hunts", "Clients"],
  },
  {
    id: "int-suricata",
    vendorKey: "suricata",
    vendor: "Suricata",
    name: "Suricata IDS/IPS",
    description:
      "Network intrusion alerts, flow records, and file extraction events.",
    category: "network",
    license: "open-source",
    status: "available",
    dataTypes: ["Alerts", "Flows", "Files"],
  },
  {
    id: "int-zeek",
    vendorKey: "zeek",
    vendor: "Zeek",
    name: "Zeek Network Monitor",
    description:
      "Protocol logs and connection telemetry from Zeek network sensors.",
    category: "network",
    license: "open-source",
    status: "available",
    dataTypes: ["Conn logs", "DNS", "HTTP"],
  },
  {
    id: "int-graylog",
    vendorKey: "graylog",
    vendor: "Graylog",
    name: "Graylog",
    description:
      "Centralized log search, streams, and alert notifications from Graylog.",
    category: "siem",
    license: "open-source",
    status: "available",
    dataTypes: ["Messages", "Streams", "Alerts"],
  },
  {
    id: "int-qradar",
    vendorKey: "ibm",
    vendor: "IBM",
    name: "IBM QRadar",
    description:
      "Offenses, events, and flows from IBM QRadar SIEM.",
    category: "siem",
    license: "commercial",
    status: "available",
    dataTypes: ["Offenses", "Events", "Flows"],
  },
  {
    id: "int-sumologic",
    vendorKey: "sumologic",
    vendor: "Sumo Logic",
    name: "Sumo Logic",
    description:
      "Cloud SIEM insights, log search, and scheduled search alerts.",
    category: "siem",
    license: "commercial",
    status: "available",
    dataTypes: ["Insights", "Logs", "Alerts"],
  },
  {
    id: "int-prisma-cloud",
    vendorKey: "palo-alto",
    vendor: "Palo Alto Networks",
    name: "Prisma Cloud",
    description:
      "CSPM, CWPP, and cloud identity findings across multi-cloud estates.",
    category: "cloud",
    license: "commercial",
    status: "available",
    dataTypes: ["CSPM alerts", "Workload findings", "Identity"],
  },
  {
    id: "int-orca",
    vendorKey: "orca",
    vendor: "Orca Security",
    name: "Orca Security",
    description:
      "Agentless cloud security — vulnerabilities, misconfigs, and lateral movement.",
    category: "cloud",
    license: "commercial",
    status: "available",
    dataTypes: ["Alerts", "Assets", "Compliance"],
  },
  {
    id: "int-lacework",
    vendorKey: "lacework",
    vendor: "Lacework",
    name: "Lacework",
    description:
      "Cloud workload and compliance anomalies with polygraph-based detections.",
    category: "cloud",
    license: "commercial",
    status: "available",
    dataTypes: ["Alerts", "Compliance", "Workload"],
  },
  {
    id: "int-zscaler",
    vendorKey: "zscaler",
    vendor: "Zscaler",
    name: "Zscaler Internet Access",
    description:
      "Web and cloud app security events from Zscaler Zero Trust Exchange.",
    category: "network",
    license: "commercial",
    status: "available",
    dataTypes: ["Web logs", "Firewall", "DNS"],
  },
  {
    id: "int-netskope",
    vendorKey: "netskope",
    vendor: "Netskope",
    name: "Netskope CASB",
    description:
      "CASB, SWG, and data-protection events for SaaS and web traffic.",
    category: "network",
    license: "commercial",
    status: "available",
    dataTypes: ["Alerts", "Page events", "Application events"],
  },
  {
    id: "int-duo",
    vendorKey: "duo",
    vendor: "Cisco Duo",
    name: "Duo MFA",
    description:
      "Multi-factor authentication logs, trust monitor, and admin actions.",
    category: "identity",
    license: "commercial",
    status: "available",
    dataTypes: ["Auth logs", "Admin actions", "Trust monitor"],
  },
  {
    id: "int-cyberark",
    vendorKey: "cyberark",
    vendor: "CyberArk",
    name: "CyberArk Privilege Cloud",
    description:
      "Privileged session and password vault activity for identity threat detection.",
    category: "identity",
    license: "commercial",
    status: "available",
    dataTypes: ["Sessions", "Vault events", "Accounts"],
  },
  {
    id: "int-entra-id",
    vendorKey: "microsoft",
    vendor: "Microsoft",
    name: "Microsoft Entra ID",
    description:
      "Sign-in logs, audit events, and risky user / sign-in detections.",
    category: "identity",
    license: "commercial",
    status: "available",
    dataTypes: ["Sign-ins", "Audit logs", "Risky users"],
  },
  {
    id: "int-knowbe4",
    vendorKey: "knowbe4",
    vendor: "KnowBe4",
    name: "KnowBe4 Security Awareness",
    description:
      "Phishing simulation results and security training completion tracking.",
    category: "training",
    license: "commercial",
    status: "available",
    dataTypes: ["Campaigns", "Users", "Training"],
  },
  {
    id: "int-mimecast",
    vendorKey: "mimecast",
    vendor: "Mimecast",
    name: "Mimecast Email Security",
    description:
      "Email threat detections, URL protect, and attachment sandbox verdicts.",
    category: "endpoint",
    license: "commercial",
    status: "available",
    dataTypes: ["Threats", "URL clicks", "Attachments"],
  },
  {
    id: "int-abnormal",
    vendorKey: "abnormal",
    vendor: "Abnormal AI",
    name: "Abnormal Security",
    description:
      "AI-driven email threat detection for BEC, spoofing, and account takeover.",
    category: "endpoint",
    license: "commercial",
    status: "available",
    dataTypes: ["Threat messages", "Cases", "Remediation"],
  },
  {
    id: "int-recorded-future",
    vendorKey: "recordedfuture",
    vendor: "Recorded Future",
    name: "Recorded Future",
    description:
      "Threat intelligence risk scores, IOC enrichment, and analyst notes.",
    category: "siem",
    license: "commercial",
    status: "available",
    dataTypes: ["Risk lists", "IOCs", "Alerts"],
  },
  {
    id: "int-alienvault-otx",
    vendorKey: "alienvault",
    vendor: "AT&T AlienVault",
    name: "AlienVault OTX",
    description:
      "Open Threat Exchange pulses, indicators, and community intel.",
    category: "siem",
    license: "commercial",
    status: "available",
    dataTypes: ["Pulses", "Indicators", "Subscribed pulses"],
  },
  {
    id: "int-checkpoint",
    vendorKey: "checkpoint",
    vendor: "Check Point",
    name: "Check Point Quantum",
    description:
      "Firewall, IPS, and threat prevention logs from Check Point gateways.",
    category: "network",
    license: "commercial",
    status: "available",
    dataTypes: ["Threat logs", "Traffic", "Audit"],
  },
  {
    id: "int-sophos",
    vendorKey: "sophos",
    vendor: "Sophos",
    name: "Sophos Central",
    description:
      "Endpoint and server protection alerts with isolation actions.",
    category: "endpoint",
    license: "commercial",
    status: "available",
    dataTypes: ["Alerts", "Endpoints", "Events"],
  },
  {
    id: "int-carbon-black",
    vendorKey: "carbonblack",
    vendor: "VMware Carbon Black",
    name: "Carbon Black Cloud",
    description:
      "EDR alerts, watchlist hits, and device control events.",
    category: "endpoint",
    license: "commercial",
    status: "available",
    dataTypes: ["Alerts", "Watchlists", "Devices"],
  },
  {
    id: "int-linear",
    vendorKey: "linear",
    vendor: "Linear",
    name: "Linear",
    description:
      "Create and sync security remediation issues with engineering teams.",
    category: "ticketing",
    license: "commercial",
    status: "available",
    dataTypes: ["Issues", "Projects", "Comments"],
  },
  {
    id: "int-freshservice",
    vendorKey: "freshservice",
    vendor: "Freshworks",
    name: "Freshservice",
    description:
      "ITSM ticket sync for security incidents and change requests.",
    category: "ticketing",
    license: "commercial",
    status: "available",
    dataTypes: ["Tickets", "Changes", "Assets"],
  },
  {
    id: "int-mattermost",
    vendorKey: "mattermost",
    vendor: "Mattermost",
    name: "Mattermost",
    description:
      "Self-hosted team messaging for SOC war rooms and alert fan-out.",
    category: "communication",
    license: "open-source",
    status: "available",
    dataTypes: ["Channel posts", "Webhooks", "Notifications"],
  },
  {
    id: "int-ansible",
    vendorKey: "ansible",
    vendor: "Red Hat Ansible",
    name: "Ansible Automation",
    description:
      "Playbook-driven response and configuration drift signals from Ansible.",
    category: "cloud",
    license: "open-source",
    status: "available",
    dataTypes: ["Job runs", "Inventory", "Playbooks"],
  },
  {
    id: "int-vault",
    vendorKey: "vault",
    vendor: "HashiCorp",
    name: "HashiCorp Vault",
    description:
      "Secrets engine audit trails, auth methods, and lease activity.",
    category: "identity",
    license: "open-source",
    status: "available",
    dataTypes: ["Audit logs", "Auth events", "Leases"],
  },
  {
    id: "int-azure",
    vendorKey: "azure",
    vendor: "Microsoft",
    name: "Microsoft Azure",
    description:
      "Azure Activity, Defender for Cloud, and resource graph security signals.",
    category: "cloud",
    license: "commercial",
    status: "available",
    dataTypes: ["Activity logs", "Security alerts", "Recommendations"],
  },
  {
    id: "int-google-cloud",
    vendorKey: "googlecloud",
    vendor: "Google Cloud",
    name: "Google Cloud Platform",
    description:
      "Cloud Audit Logs, SCC findings, and asset inventory from GCP.",
    category: "cloud",
    license: "commercial",
    status: "available",
    dataTypes: ["Audit logs", "SCC findings", "Assets"],
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

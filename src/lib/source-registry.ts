/**
 * Shared telemetry source registry for the all-in-one consolidator story.
 * Aligns with integration IDs used on alerts (`sourceId`) and Integrations.
 */

export type SourceFamily =
  | "siem"
  | "edr"
  | "idp"
  | "cloud"
  | "network"
  | "ticketing"
  | "communication"
  | "vulnerability"
  | "etl"
  | "training"
  | "other";

export type SourceVendor =
  | "splunk"
  | "sentinel"
  | "chronicle"
  | "elastic"
  | "datadog"
  | "defender"
  | "crowdstrike"
  | "okta"
  | "aws"
  | "azure"
  | "gcp"
  | "palo-alto"
  | "cloudflare"
  | "cisco"
  | "fortinet"
  | "jira"
  | "pagerduty"
  | "slack"
  | "snyk"
  | "github"
  | "other";

export type SourceHealth = "healthy" | "degraded" | "failed" | "paused";

export type TelemetrySource = {
  id: string;
  name: string;
  shortName: string;
  vendor: SourceVendor;
  family: SourceFamily;
  health: SourceHealth;
  /** Events per second (mock). */
  eps: number;
  /** Events in last 24h. */
  eventsPerDay: number;
  /** Minutes since last event (ages in UI). */
  lastEventMinutesAgo: number;
  /** Hourly volume sparkline (oldest → newest). */
  volumeSpark: number[];
  region?: string;
  nativeQueryHint?: "spl" | "kql" | "eql" | "sql";
};

export const sourceFamilyLabels: Record<SourceFamily, string> = {
  siem: "SIEM",
  edr: "Endpoint",
  idp: "Identity",
  cloud: "Cloud",
  network: "Network",
  ticketing: "Ticketing",
  communication: "Communication",
  vulnerability: "Vulnerability",
  etl: "Ingest & prep",
  training: "Training",
  other: "Other",
};

/** Canonical sources shown on Overview ingest strip and Investigate filters. */
export const telemetrySources: TelemetrySource[] = [
  {
    id: "int-splunk-core",
    name: "Splunk Enterprise",
    shortName: "Splunk",
    vendor: "splunk",
    family: "siem",
    health: "healthy",
    eps: 1840,
    eventsPerDay: 158_000_000,
    lastEventMinutesAgo: 0,
    volumeSpark: [62, 68, 71, 66, 74, 80, 78, 82, 79, 85, 88, 84],
    region: "us-east-1",
    nativeQueryHint: "spl",
  },
  {
    id: "int-sentinel-workspace",
    name: "Microsoft Sentinel",
    shortName: "Sentinel",
    vendor: "sentinel",
    family: "siem",
    health: "healthy",
    eps: 920,
    eventsPerDay: 79_400_000,
    lastEventMinutesAgo: 1,
    volumeSpark: [44, 48, 51, 49, 55, 58, 56, 60, 62, 59, 64, 61],
    region: "eastus",
    nativeQueryHint: "kql",
  },
  {
    id: "int-defender-endpoint",
    name: "Microsoft Defender for Endpoint",
    shortName: "Defender",
    vendor: "defender",
    family: "edr",
    health: "healthy",
    eps: 410,
    eventsPerDay: 35_400_000,
    lastEventMinutesAgo: 0,
    volumeSpark: [28, 30, 32, 29, 34, 36, 35, 38, 37, 40, 39, 41],
    region: "global",
  },
  {
    id: "int-crowdstrike-falcon",
    name: "CrowdStrike Falcon",
    shortName: "Falcon",
    vendor: "crowdstrike",
    family: "edr",
    health: "degraded",
    eps: 280,
    eventsPerDay: 24_100_000,
    lastEventMinutesAgo: 8,
    volumeSpark: [22, 24, 21, 18, 16, 14, 15, 17, 19, 18, 16, 15],
    region: "us-1",
  },
  {
    id: "int-okta-workforce",
    name: "Okta Workforce",
    shortName: "Okta",
    vendor: "okta",
    family: "idp",
    health: "healthy",
    eps: 95,
    eventsPerDay: 8_200_000,
    lastEventMinutesAgo: 0,
    volumeSpark: [8, 9, 11, 10, 12, 14, 13, 15, 14, 16, 15, 14],
    region: "us",
  },
  {
    id: "int-aws-prod",
    name: "AWS CloudTrail (prod)",
    shortName: "AWS",
    vendor: "aws",
    family: "cloud",
    health: "healthy",
    eps: 340,
    eventsPerDay: 29_300_000,
    lastEventMinutesAgo: 2,
    volumeSpark: [18, 20, 22, 21, 24, 26, 25, 27, 28, 26, 29, 30],
    region: "us-east-1",
  },
  {
    id: "int-chronicle-secops",
    name: "Google Chronicle",
    shortName: "Chronicle",
    vendor: "chronicle",
    family: "siem",
    health: "healthy",
    eps: 510,
    eventsPerDay: 44_000_000,
    lastEventMinutesAgo: 1,
    volumeSpark: [30, 32, 34, 33, 36, 38, 37, 39, 40, 38, 41, 42],
    region: "us",
  },
  {
    id: "int-palo-edge",
    name: "Palo Alto Networks",
    shortName: "PAN",
    vendor: "palo-alto",
    family: "network",
    health: "healthy",
    eps: 620,
    eventsPerDay: 53_500_000,
    lastEventMinutesAgo: 0,
    volumeSpark: [35, 38, 40, 39, 42, 44, 43, 46, 45, 47, 48, 46],
    region: "us-west",
  },
  {
    id: "int-elastic-security",
    name: "Elastic Security",
    shortName: "Elastic",
    vendor: "elastic",
    family: "siem",
    health: "paused",
    eps: 0,
    eventsPerDay: 0,
    lastEventMinutesAgo: 420,
    volumeSpark: [12, 10, 8, 6, 4, 2, 1, 0, 0, 0, 0, 0],
    region: "us-central",
    nativeQueryHint: "eql",
  },
  {
    id: "int-jira-secops",
    name: "Jira Service Management",
    shortName: "Jira",
    vendor: "jira",
    family: "ticketing",
    health: "healthy",
    eps: 2,
    eventsPerDay: 14_200,
    lastEventMinutesAgo: 12,
    volumeSpark: [1, 1, 2, 1, 2, 2, 1, 2, 3, 2, 2, 1],
    region: "cloud",
  },
  {
    id: "int-cribl-stream",
    name: "Cribl Stream",
    shortName: "Cribl",
    vendor: "other",
    family: "etl",
    health: "healthy",
    eps: 2100,
    eventsPerDay: 180_000_000,
    lastEventMinutesAgo: 0,
    volumeSpark: [70, 72, 74, 71, 76, 80, 78, 82, 81, 84, 86, 83],
    region: "us-east-1",
  },
  {
    id: "int-fluent-bit",
    name: "Fluent Bit",
    shortName: "Fluent Bit",
    vendor: "other",
    family: "etl",
    health: "healthy",
    eps: 980,
    eventsPerDay: 84_000_000,
    lastEventMinutesAgo: 1,
    volumeSpark: [40, 42, 44, 41, 45, 48, 47, 49, 50, 48, 51, 49],
    region: "edge",
  },
  {
    id: "int-vector-obs",
    name: "Vector",
    shortName: "Vector",
    vendor: "other",
    family: "etl",
    health: "healthy",
    eps: 640,
    eventsPerDay: 55_000_000,
    lastEventMinutesAgo: 0,
    volumeSpark: [28, 30, 31, 29, 33, 35, 34, 36, 37, 35, 38, 36],
    region: "us-west",
  },
  {
    id: "int-lms-workday",
    name: "Workday Learning",
    shortName: "LMS",
    vendor: "other",
    family: "training",
    health: "paused",
    eps: 0,
    eventsPerDay: 0,
    lastEventMinutesAgo: 1440,
    volumeSpark: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    region: "cloud",
  },
];

const byId = new Map(telemetrySources.map((s) => [s.id, s]));

export function getTelemetrySource(id: string): TelemetrySource | undefined {
  return byId.get(id);
}

export function getSourcesByFamily(family: SourceFamily): TelemetrySource[] {
  return telemetrySources.filter((s) => s.family === family);
}

export function getIngestHealthSummary() {
  const connected = telemetrySources.filter((s) => s.health !== "paused");
  const healthy = connected.filter((s) => s.health === "healthy").length;
  const degraded = connected.filter((s) => s.health === "degraded").length;
  const failed = connected.filter((s) => s.health === "failed").length;
  const totalEps = connected.reduce((sum, s) => sum + s.eps, 0);
  const families = new Set(connected.map((s) => s.family)).size;
  return {
    total: telemetrySources.length,
    connected: connected.length,
    healthy,
    degraded,
    failed,
    paused: telemetrySources.length - connected.length,
    totalEps,
    families,
  };
}

/** Mock pipeline stages for Integrations / Overview. */
export const ingestPipelineStages = [
  {
    id: "collect",
    label: "Collect",
    description: "Pull or push from connected SIEM, EDR, IdP, and cloud APIs",
    throughputLabel: "4.9k EPS",
    status: "healthy" as const,
  },
  {
    id: "normalize",
    label: "Normalize",
    description: "Map vendor fields into Heimdall common schema",
    throughputLabel: "4.8k EPS",
    status: "healthy" as const,
  },
  {
    id: "detect",
    label: "Detect",
    description: "Run detections + correlation across sources",
    throughputLabel: "312 alerts/h",
    status: "healthy" as const,
  },
  {
    id: "route",
    label: "Route",
    description: "Queue to analysts, playbooks, and ticketing",
    throughputLabel: "98% SLA",
    status: "degraded" as const,
  },
] as const;

export type FieldMappingPreview = {
  sourceId: string;
  sourceField: string;
  heimdallField: string;
  sample: string;
};

export const fieldMappingPreviews: FieldMappingPreview[] = [
  {
    sourceId: "int-splunk-core",
    sourceField: "src_ip",
    heimdallField: "src.ip",
    sample: "185.220.101.42",
  },
  {
    sourceId: "int-sentinel-workspace",
    sourceField: "AccountUpn",
    heimdallField: "actor.identity",
    sample: "j.chen@svalbard.ca",
  },
  {
    sourceId: "int-defender-endpoint",
    sourceField: "DeviceName",
    heimdallField: "device.hostname",
    sample: "WS-FIN-1842",
  },
  {
    sourceId: "int-okta-workforce",
    sourceField: "client.geographicalContext.city",
    heimdallField: "actor.geo.city",
    sample: "São Paulo",
  },
  {
    sourceId: "int-aws-prod",
    sourceField: "userIdentity.arn",
    heimdallField: "actor.cloud.arn",
    sample: "arn:aws:iam::…:role/Admin",
  },
];

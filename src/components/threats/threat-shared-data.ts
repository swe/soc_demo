import {
  type AlertSeverity,
  getAlertById,
  socAlerts,
} from "@/components/alerts/alerts-data";
import { getIncidentById } from "@/components/incidents/incidents-data";

export type IndicatorType = "ip" | "domain" | "hash" | "url" | "email";

export type IndicatorStatus =
  | "active"
  | "under_review"
  | "expired"
  | "false_positive";

export type IndicatorConfidence = "high" | "medium" | "low";

export type Indicator = {
  id: string;
  type: IndicatorType;
  value: string;
  title: string;
  status: IndicatorStatus;
  confidence: IndicatorConfidence;
  severity: AlertSeverity;
  sources: string[];
  actorIds: string[];
  campaignIds: string[];
  relatedAlertIds: string[];
  relatedHuntIds: string[];
  darkWebExposureIds: string[];
  feedIds: string[];
  techniqueIds: string[];
  firstSeenLabel: string;
  lastSeenLabel: string;
  firstSeenMinutes: number;
  tags: string[];
  notes: string;
};

export type ThreatActorProfile = {
  id: string;
  name: string;
  aliases: string[];
  summary: string;
  origin: string;
  industries: string[];
  confidence: IndicatorConfidence;
  severity: AlertSeverity;
  techniques: string[];
  campaignIds: string[];
  indicatorIds: string[];
  graphNodeId: string;
  lastActivityLabel: string;
};

export type ThreatCampaign = {
  id: string;
  name: string;
  actorId: string;
  status: "active" | "concluded" | "monitoring";
  summary: string;
  techniqueIds: string[];
  indicatorIds: string[];
  firstSeenLabel: string;
  lastSeenLabel: string;
};

export type ThreatFeed = {
  id: string;
  name: string;
  provider: string;
  status: "healthy" | "degraded" | "paused";
  lastIngestLabel: string;
  /** ISO timestamp for live aging display. */
  lastIngestAt: string;
  indicatorCount: number;
  types: IndicatorType[];
  description: string;
};

export type HuntStatus = "draft" | "running" | "closed";

export type HuntOutcome = "confirmed" | "not_found" | "inconclusive";

export type Hunt = {
  id: string;
  title: string;
  hypothesis: string;
  status: HuntStatus;
  outcome?: HuntOutcome;
  techniqueIds: string[];
  indicatorIds: string[];
  actorIds: string[];
  relatedAlertIds: string[];
  relatedIncidentIds: string[];
  assignee: string;
  createdLabel: string;
  updatedLabel: string;
  findings?: string;
  severity: AlertSeverity;
  /** Prefill Investigate / hunt-run QL. */
  heimdallQl?: string;
  /** Preferred telemetry sources for Investigate deep-links. */
  sourceIds?: string[];
  /** Detection that promoted this hunt, if any. */
  promotedFromDetectionId?: string;
};

export type HuntRunHit = {
  id: string;
  timestamp: string;
  entity: string;
  sourceId: string;
  severity: AlertSeverity;
  summary: string;
};

export type HuntRunResult = {
  huntId: string;
  ranAt: string;
  query: string;
  sourceIds: string[];
  hitCount: number;
  hits: HuntRunHit[];
};

export const indicatorTypes = [
  "ip",
  "domain",
  "hash",
  "url",
  "email",
] as const satisfies readonly IndicatorType[];

export const indicatorTypeLabels: Record<IndicatorType, string> = {
  ip: "IP",
  domain: "Domain",
  hash: "Hash",
  url: "URL",
  email: "Email",
};

export const indicatorStatuses = [
  "active",
  "under_review",
  "expired",
  "false_positive",
] as const satisfies readonly IndicatorStatus[];

export const indicatorStatusLabels: Record<IndicatorStatus, string> = {
  active: "Active",
  under_review: "Under review",
  expired: "Expired",
  false_positive: "False positive",
};

export const indicatorConfidences = [
  "high",
  "medium",
  "low",
] as const satisfies readonly IndicatorConfidence[];

export const indicatorConfidenceLabels: Record<IndicatorConfidence, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

export const huntStatuses = [
  "draft",
  "running",
  "closed",
] as const satisfies readonly HuntStatus[];

export const huntStatusLabels: Record<HuntStatus, string> = {
  draft: "Draft",
  running: "Running",
  closed: "Closed",
};

export const huntOutcomeLabels: Record<HuntOutcome, string> = {
  confirmed: "Confirmed",
  not_found: "Not found",
  inconclusive: "Inconclusive",
};

export const feedStatusLabels: Record<ThreatFeed["status"], string> = {
  healthy: "Healthy",
  degraded: "Degraded",
  paused: "Paused",
};

export const campaignStatusLabels: Record<ThreatCampaign["status"], string> = {
  active: "Active",
  concluded: "Concluded",
  monitoring: "Monitoring",
};

export const threatCampaigns: ThreatCampaign[] = [
  {
    id: "camp-token-harvest",
    name: "Token Harvest 2026",
    actorId: "actor-canvas-cyclone",
    status: "active",
    summary:
      "Credential theft and session-token replay against finance and SaaS IdP estates.",
    techniqueIds: ["T1059.001", "T1078", "T1550.001"],
    indicatorIds: ["IOC-1001", "IOC-1002", "IOC-1005", "IOC-1008"],
    firstSeenLabel: "12 Mar 2026",
    lastSeenLabel: "27 Jul 2026",
  },
  {
    id: "camp-helpdesk-reset",
    name: "Helpdesk Reset Wave",
    actorId: "actor-helpdesk-hijackers",
    status: "monitoring",
    summary:
      "Social-engineering helpdesk password resets followed by mailbox rules and MFA fatigue.",
    techniqueIds: ["T1078", "T1114.003", "T1621"],
    indicatorIds: ["IOC-1003", "IOC-1006", "IOC-1009"],
    firstSeenLabel: "2 May 2026",
    lastSeenLabel: "26 Jul 2026",
  },
  {
    id: "camp-stealer-relay",
    name: "Stealer Relay",
    actorId: "actor-canvas-cyclone",
    status: "active",
    summary:
      "Distribution of RedLine/stealer logs with Okta and VPN session material targeting Svalbard domains.",
    techniqueIds: ["T1555", "T1539"],
    indicatorIds: ["IOC-1004", "IOC-1007", "IOC-1010"],
    firstSeenLabel: "18 Jun 2026",
    lastSeenLabel: "28 Jul 2026",
  },
];

export const threatActorProfiles: ThreatActorProfile[] = [
  {
    id: "actor-canvas-cyclone",
    name: "Canvas Cyclone",
    aliases: ["Storm-0867"],
    summary:
      "China-aligned cluster focused on credential theft, token replay, and living-off-the-land execution against finance and SaaS estates.",
    origin: "CN",
    industries: ["Finance", "SaaS"],
    confidence: "high",
    severity: "critical",
    techniques: ["T1059.001", "T1078", "T1550.001", "T1021.001"],
    campaignIds: ["camp-token-harvest", "camp-stealer-relay"],
    indicatorIds: [
      "IOC-1001",
      "IOC-1002",
      "IOC-1004",
      "IOC-1005",
      "IOC-1007",
      "IOC-1008",
      "IOC-1010",
    ],
    graphNodeId: "actor-canvas-cyclone",
    lastActivityLabel: "6h ago",
  },
  {
    id: "actor-helpdesk-hijackers",
    name: "Helpdesk Hijackers",
    aliases: [],
    summary:
      "Opportunistic cluster that social-engineers helpdesk resets, then plants mailbox rules and MFA fatigue campaigns.",
    origin: "Unknown",
    industries: ["All"],
    confidence: "medium",
    severity: "high",
    techniques: ["T1078", "T1114.003", "T1621"],
    campaignIds: ["camp-helpdesk-reset"],
    indicatorIds: ["IOC-1003", "IOC-1006", "IOC-1009"],
    graphNodeId: "actor-helpdesk-hijackers",
    lastActivityLabel: "1d ago",
  },
];

export const threatFeeds: ThreatFeed[] = [
  {
    id: "feed-osint-domain",
    name: "OSINT Domain Blocklist",
    provider: "Community + curated",
    status: "healthy",
    lastIngestLabel: "12m ago",
    lastIngestAt: "2026-07-28T19:50:00.000Z",
    indicatorCount: 1842,
    types: ["domain", "url"],
    description: "Phishing and C2 domains refreshed every 15 minutes.",
  },
  {
    id: "feed-malware-hash",
    name: "Malware Hash Feed",
    provider: "Vendor TIP",
    status: "healthy",
    lastIngestLabel: "28m ago",
    lastIngestAt: "2026-07-28T19:34:00.000Z",
    indicatorCount: 9621,
    types: ["hash"],
    description: "SHA256 hashes from sandbox detonations and partner shares.",
  },
  {
    id: "feed-darkweb-creds",
    name: "Dark Web Credential Relay",
    provider: "Heimdall Dark Web",
    status: "healthy",
    lastIngestLabel: "4m ago",
    lastIngestAt: "2026-07-28T19:58:00.000Z",
    indicatorCount: 316,
    types: ["email", "domain"],
    description: "Indicators minted from stealer logs and combo-list hits.",
  },
  {
    id: "feed-ip-reputation",
    name: "IP Reputation",
    provider: "ISP + TIP",
    status: "degraded",
    lastIngestLabel: "2h ago",
    lastIngestAt: "2026-07-28T18:02:00.000Z",
    indicatorCount: 4402,
    types: ["ip"],
    description: "Inbound scanning and known C2 IP ranges — delayed ingest.",
  },
  {
    id: "feed-actor-ttp",
    name: "Actor TTP Bulletin",
    provider: "Internal INTEL",
    status: "paused",
    lastIngestLabel: "5d ago",
    lastIngestAt: "2026-07-23T12:00:00.000Z",
    indicatorCount: 88,
    types: ["domain", "ip", "url"],
    description: "Manual actor bulletins; paused pending analyst review.",
  },
];

export const threatIndicatorsSeed: Indicator[] = [
  {
    id: "IOC-1001",
    type: "domain",
    value: "okta-sso-verify[.]com",
    title: "Fake Okta SSO verify domain",
    status: "active",
    confidence: "high",
    severity: "critical",
    sources: ["OSINT Domain Blocklist", "Actor TTP Bulletin"],
    actorIds: ["actor-canvas-cyclone"],
    campaignIds: ["camp-token-harvest"],
    relatedAlertIds: ["ALT-2148", "ALT-2145"],
    relatedHuntIds: ["HUNT-001"],
    darkWebExposureIds: [],
    feedIds: ["feed-osint-domain", "feed-actor-ttp"],
    techniqueIds: ["T1078", "T1550.001"],
    firstSeenLabel: "14 Jul 2026",
    lastSeenLabel: "27 Jul 2026",
    firstSeenMinutes: 60 * 24 * 14,
    tags: ["phishing", "okta", "credential"],
    notes:
      "Lookalike IdP domain used in Canvas Cyclone token-harvest lures against finance.",
  },
  {
    id: "IOC-1002",
    type: "ip",
    value: "185.220.101.47",
    title: "Tor exit used for token replay",
    status: "active",
    confidence: "high",
    severity: "critical",
    sources: ["IP Reputation", "Vendor TIP"],
    actorIds: ["actor-canvas-cyclone"],
    campaignIds: ["camp-token-harvest"],
    relatedAlertIds: ["ALT-2148", "ALT-2147"],
    relatedHuntIds: ["HUNT-001", "HUNT-003"],
    darkWebExposureIds: [],
    feedIds: ["feed-ip-reputation"],
    techniqueIds: ["T1550.001", "T1078"],
    firstSeenLabel: "20 Jul 2026",
    lastSeenLabel: "28 Jul 2026",
    firstSeenMinutes: 60 * 24 * 8,
    tags: ["tor", "token-replay", "c2"],
    notes: "Multiple session replay attempts from this exit against Okta.",
  },
  {
    id: "IOC-1003",
    type: "email",
    value: "it-help@svalbard-support[.]net",
    title: "Helpdesk impersonation sender",
    status: "active",
    confidence: "medium",
    severity: "high",
    sources: ["OSINT Domain Blocklist"],
    actorIds: ["actor-helpdesk-hijackers"],
    campaignIds: ["camp-helpdesk-reset"],
    relatedAlertIds: ["ALT-2147", "ALT-2141"],
    relatedHuntIds: ["HUNT-002"],
    darkWebExposureIds: [],
    feedIds: ["feed-osint-domain"],
    techniqueIds: ["T1078", "T1621"],
    firstSeenLabel: "8 Jul 2026",
    lastSeenLabel: "26 Jul 2026",
    firstSeenMinutes: 60 * 24 * 20,
    tags: ["social-eng", "helpdesk"],
    notes: "Spoofed helpdesk address used to request password resets.",
  },
  {
    id: "IOC-1004",
    type: "hash",
    value: "a3f5c9e2b1d8470f6e9c4a8b2d1e5f70c6a9b3d8e1f4a7c0b5d2e9f6a1c3b8d4",
    title: "RedLine stealer sample SHA256",
    status: "active",
    confidence: "high",
    severity: "critical",
    sources: ["Malware Hash Feed", "Dark Web Credential Relay"],
    actorIds: ["actor-canvas-cyclone"],
    campaignIds: ["camp-stealer-relay"],
    relatedAlertIds: ["ALT-2145"],
    relatedHuntIds: ["HUNT-003"],
    darkWebExposureIds: ["dw-002"],
    feedIds: ["feed-malware-hash", "feed-darkweb-creds"],
    techniqueIds: ["T1555", "T1539"],
    firstSeenLabel: "22 Jul 2026",
    lastSeenLabel: "28 Jul 2026",
    firstSeenMinutes: 60 * 24 * 6,
    tags: ["redline", "stealer"],
    notes: "Matches RedLine sample linked to Okta session cookie exposures.",
  },
  {
    id: "IOC-1005",
    type: "url",
    value: "https://okta-sso-verify[.]com/login",
    title: "Phishing kit login URL",
    status: "active",
    confidence: "high",
    severity: "critical",
    sources: ["OSINT Domain Blocklist"],
    actorIds: ["actor-canvas-cyclone"],
    campaignIds: ["camp-token-harvest"],
    relatedAlertIds: ["ALT-2148"],
    relatedHuntIds: ["HUNT-001"],
    darkWebExposureIds: [],
    feedIds: ["feed-osint-domain"],
    techniqueIds: ["T1078", "T1566.002"],
    firstSeenLabel: "14 Jul 2026",
    lastSeenLabel: "27 Jul 2026",
    firstSeenMinutes: 60 * 24 * 14,
    tags: ["phishing", "kit"],
    notes: "Credential harvest page cloned from Okta workforce login.",
  },
  {
    id: "IOC-1006",
    type: "domain",
    value: "svalbard-support[.]net",
    title: "Helpdesk lure domain",
    status: "under_review",
    confidence: "medium",
    severity: "high",
    sources: ["OSINT Domain Blocklist", "Actor TTP Bulletin"],
    actorIds: ["actor-helpdesk-hijackers"],
    campaignIds: ["camp-helpdesk-reset"],
    relatedAlertIds: ["ALT-2141"],
    relatedHuntIds: ["HUNT-002"],
    darkWebExposureIds: [],
    feedIds: ["feed-osint-domain", "feed-actor-ttp"],
    techniqueIds: ["T1566.002"],
    firstSeenLabel: "1 Jul 2026",
    lastSeenLabel: "25 Jul 2026",
    firstSeenMinutes: 60 * 24 * 27,
    tags: ["typosquat", "helpdesk"],
    notes: "Parent domain for helpdesk impersonation mail and portal.",
  },
  {
    id: "IOC-1007",
    type: "email",
    value: "ben.lewis@svalbard.ca",
    title: "Exposed principal from stealer log",
    status: "active",
    confidence: "high",
    severity: "critical",
    sources: ["Dark Web Credential Relay"],
    actorIds: ["actor-canvas-cyclone"],
    campaignIds: ["camp-stealer-relay"],
    relatedAlertIds: ["ALT-2147"],
    relatedHuntIds: ["HUNT-003"],
    darkWebExposureIds: ["dw-002"],
    feedIds: ["feed-darkweb-creds"],
    techniqueIds: ["T1539"],
    firstSeenLabel: "27 Jul 2026",
    lastSeenLabel: "28 Jul 2026",
    firstSeenMinutes: 60 * 8,
    tags: ["stealer", "session", "okta"],
    notes: "Minted from dw-002 Okta session cookie exposure.",
  },
  {
    id: "IOC-1008",
    type: "ip",
    value: "104.21.88.12",
    title: "CDN front for phishing kit",
    status: "active",
    confidence: "medium",
    severity: "high",
    sources: ["IP Reputation"],
    actorIds: ["actor-canvas-cyclone"],
    campaignIds: ["camp-token-harvest"],
    relatedAlertIds: ["ALT-2145"],
    relatedHuntIds: ["HUNT-001"],
    darkWebExposureIds: [],
    feedIds: ["feed-ip-reputation"],
    techniqueIds: ["T1566.002"],
    firstSeenLabel: "15 Jul 2026",
    lastSeenLabel: "26 Jul 2026",
    firstSeenMinutes: 60 * 24 * 13,
    tags: ["cdn", "phishing"],
    notes: "Cloudflare-fronted hosting for okta-sso-verify kit.",
  },
  {
    id: "IOC-1009",
    type: "url",
    value: "https://svalbard-support[.]net/reset",
    title: "Fake password-reset portal",
    status: "active",
    confidence: "medium",
    severity: "high",
    sources: ["OSINT Domain Blocklist"],
    actorIds: ["actor-helpdesk-hijackers"],
    campaignIds: ["camp-helpdesk-reset"],
    relatedAlertIds: ["ALT-2141"],
    relatedHuntIds: ["HUNT-002"],
    darkWebExposureIds: [],
    feedIds: ["feed-osint-domain"],
    techniqueIds: ["T1078", "T1621"],
    firstSeenLabel: "9 Jul 2026",
    lastSeenLabel: "26 Jul 2026",
    firstSeenMinutes: 60 * 24 * 19,
    tags: ["reset", "social-eng"],
    notes: "Victims directed here after helpdesk social engineering calls.",
  },
  {
    id: "IOC-1010",
    type: "email",
    value: "riya.sharma@svalbard.ca",
    title: "Privileged credential in combo list",
    status: "active",
    confidence: "high",
    severity: "critical",
    sources: ["Dark Web Credential Relay"],
    actorIds: ["actor-canvas-cyclone"],
    campaignIds: ["camp-stealer-relay"],
    relatedAlertIds: ["ALT-2148"],
    relatedHuntIds: ["HUNT-004"],
    darkWebExposureIds: ["dw-001"],
    feedIds: ["feed-darkweb-creds"],
    techniqueIds: ["T1078"],
    firstSeenLabel: "27 Jul 2026",
    lastSeenLabel: "28 Jul 2026",
    firstSeenMinutes: 60 * 18,
    tags: ["privileged", "combo-list", "idp"],
    notes: "Minted from dw-001 privileged IdP credential exposure.",
  },
  {
    id: "IOC-1011",
    type: "hash",
    value: "9e8f7d6c5b4a3210fedcba0987654321abcdef0123456789fedcba9876543210",
    title: "Legacy implant hash — expired",
    status: "expired",
    confidence: "low",
    severity: "medium",
    sources: ["Malware Hash Feed"],
    actorIds: [],
    campaignIds: [],
    relatedAlertIds: [],
    relatedHuntIds: [],
    darkWebExposureIds: [],
    feedIds: ["feed-malware-hash"],
    techniqueIds: ["T1059.001"],
    firstSeenLabel: "3 Jan 2026",
    lastSeenLabel: "12 Feb 2026",
    firstSeenMinutes: 60 * 24 * 200,
    tags: ["legacy", "expired"],
    notes: "No hits in 90 days; retained for historical correlation.",
  },
  {
    id: "IOC-1012",
    type: "ip",
    value: "203.0.113.44",
    title: "Scanner IP — false positive",
    status: "false_positive",
    confidence: "low",
    severity: "low",
    sources: ["IP Reputation"],
    actorIds: [],
    campaignIds: [],
    relatedAlertIds: ["ALT-2130"],
    relatedHuntIds: [],
    darkWebExposureIds: [],
    feedIds: ["feed-ip-reputation"],
    techniqueIds: [],
    firstSeenLabel: "10 Jun 2026",
    lastSeenLabel: "11 Jun 2026",
    firstSeenMinutes: 60 * 24 * 48,
    tags: ["scanner", "fp"],
    notes: "Confirmed benign vulnerability scanner from approved vendor.",
  },
];

export const INDICATOR_CATALOG_SIZE = 180;

const indicatorSeverityWeights: Array<[AlertSeverity, number]> = [
  ["low", 18],
  ["medium", 32],
  ["high", 35],
  ["critical", 15],
];

const indicatorStatusWeights: Array<[IndicatorStatus, number]> = [
  ["active", 62],
  ["under_review", 18],
  ["expired", 12],
  ["false_positive", 8],
];

function pickWeightedThreat<T>(weights: Array<[T, number]>, salt: number): T {
  const total = weights.reduce((sum, [, w]) => sum + w, 0);
  let cursor = ((salt * 2246822519) >>> 0) % total;
  for (const [value, weight] of weights) {
    if (cursor < weight) return value;
    cursor -= weight;
  }
  return weights[0]![0];
}

function buildIndicatorCatalog(
  seeds: Indicator[],
  size = INDICATOR_CATALOG_SIZE,
): Indicator[] {
  if (seeds.length >= size) return seeds.slice(0, size);
  const typeWeights: Array<[IndicatorType, number]> = [
    ["ip", 30],
    ["domain", 28],
    ["hash", 18],
    ["url", 14],
    ["email", 10],
  ];
  const feedIds = threatFeeds.map((f) => f.id);
  const actorIds = threatActorProfiles.map((a) => a.id);
  const campaignIds = threatCampaigns.map((c) => c.id);
  const generated: Indicator[] = [];
  let nextNum = 1013;

  for (let index = 0; index < size - seeds.length; index += 1) {
    const template = seeds[index % seeds.length]!;
    const type = pickWeightedThreat(typeWeights, index + 3);
    const severity = pickWeightedThreat(indicatorSeverityWeights, index * 2 + 5);
    const status = pickWeightedThreat(indicatorStatusWeights, index * 3 + 9);
    const value =
      type === "ip"
        ? `${40 + (index % 180)}.${(index * 7) % 255}.${(index * 13) % 255}.${(index * 3) % 255}`
        : type === "domain"
          ? `lure-${(index % 400) + 1}.svalbard-support[.]net`
          : type === "hash"
            ? `${(index * 7919).toString(16).padStart(16, "0")}${(index * 9973).toString(16).padStart(48, "0")}`.slice(0, 64)
            : type === "url"
              ? `https://okta-sso-verify[.]com/path/${index + 1}`
              : `crew-${(index % 90) + 1}@svalbard.ca`;
    const hasActor = index % 5 !== 0;
    const hasCampaign = index % 4 !== 0;
    generated.push({
      ...template,
      id: `IOC-${nextNum}`,
      type,
      value,
      title: `${template.title} · intel ${index + 1}`,
      status,
      confidence: severity === "critical" ? "high" : severity === "low" ? "low" : "medium",
      severity,
      sources: template.sources,
      actorIds: hasActor ? [actorIds[index % actorIds.length]!] : [],
      campaignIds: hasCampaign ? [campaignIds[index % campaignIds.length]!] : [],
      relatedAlertIds:
        index % 3 === 0
          ? []
          : template.relatedAlertIds.slice(0, 1 + (index % 2)),
      relatedHuntIds: index % 6 === 0 ? [] : template.relatedHuntIds.slice(0, 1),
      darkWebExposureIds:
        type === "email" && index % 2 === 0
          ? [`dw-${String((index % 56) + 1).padStart(3, "0")}`]
          : [],
      feedIds: [feedIds[index % feedIds.length]!],
      techniqueIds: template.techniqueIds,
      firstSeenLabel: `${1 + (index % 27)} Jul 2026`,
      lastSeenLabel: `${20 + (index % 8)} Jul 2026`,
      firstSeenMinutes: 60 * 24 * (1 + (index % 40)),
      tags: [...template.tags, "synthetic"],
      notes: `${template.notes} (synthetic indicator ${index + 1}.)`,
    });
    nextNum += 1;
  }

  return [...seeds, ...generated];
}

export const threatIndicators: Indicator[] = buildIndicatorCatalog(
  threatIndicatorsSeed,
);

export const threatHuntsSeed: Hunt[] = [
  {
    id: "HUNT-001",
    title: "Canvas Cyclone token replay",
    hypothesis:
      "Actors are replaying stolen Okta sessions from Tor exits against finance identities after phishing kit harvests.",
    status: "running",
    techniqueIds: ["T1550.001", "T1078"],
    indicatorIds: ["IOC-1001", "IOC-1002", "IOC-1005", "IOC-1008"],
    actorIds: ["actor-canvas-cyclone"],
    relatedAlertIds: ["ALT-2148", "ALT-2145"],
    relatedIncidentIds: ["INC-2400"],
    assignee: "Ava Reed",
    createdLabel: "22 Jul 2026",
    updatedLabel: "28 Jul 2026",
    severity: "critical",
  },
  {
    id: "HUNT-002",
    title: "Helpdesk reset → mailbox rules",
    hypothesis:
      "Password resets requested via spoofed helpdesk lead to new inbox rules on VIP mailboxes within 24h.",
    status: "running",
    techniqueIds: ["T1078", "T1114.003", "T1621"],
    indicatorIds: ["IOC-1003", "IOC-1006", "IOC-1009"],
    actorIds: ["actor-helpdesk-hijackers"],
    relatedAlertIds: ["ALT-2147", "ALT-2141"],
    relatedIncidentIds: ["INC-2401"],
    assignee: "Chloe Park",
    createdLabel: "18 Jul 2026",
    updatedLabel: "27 Jul 2026",
    severity: "high",
  },
  {
    id: "HUNT-003",
    title: "Stealer log session material",
    hypothesis:
      "RedLine stealer hits on Svalbard principals correlate with live IdP session use from atypical geos.",
    status: "running",
    techniqueIds: ["T1539", "T1555"],
    indicatorIds: ["IOC-1004", "IOC-1007"],
    actorIds: ["actor-canvas-cyclone"],
    relatedAlertIds: ["ALT-2147", "ALT-2145"],
    relatedIncidentIds: [],
    assignee: "Leo Park",
    createdLabel: "26 Jul 2026",
    updatedLabel: "28 Jul 2026",
    severity: "critical",
  },
  {
    id: "HUNT-004",
    title: "Privileged combo-list reuse",
    hypothesis:
      "Privileged IdP credentials in combo lists are reused against VPN and Okta within 48h of dump publication.",
    status: "draft",
    techniqueIds: ["T1078"],
    indicatorIds: ["IOC-1010"],
    actorIds: ["actor-canvas-cyclone"],
    relatedAlertIds: ["ALT-2148"],
    relatedIncidentIds: [],
    assignee: "Ava Reed",
    createdLabel: "27 Jul 2026",
    updatedLabel: "27 Jul 2026",
    severity: "critical",
  },
  {
    id: "HUNT-005",
    title: "Encoded PowerShell cradles",
    hypothesis:
      "Finance workstations show encoded PowerShell + IEX cradles tied to Canvas Cyclone execution TTPs.",
    status: "closed",
    outcome: "confirmed",
    techniqueIds: ["T1059.001"],
    indicatorIds: ["IOC-1001"],
    actorIds: ["actor-canvas-cyclone"],
    relatedAlertIds: ["ALT-2148"],
    relatedIncidentIds: ["INC-2400"],
    assignee: "Maya Rao",
    createdLabel: "5 Jul 2026",
    updatedLabel: "20 Jul 2026",
    findings:
      "Confirmed encoded PowerShell on two finance endpoints; escalated to INC-2400.",
    severity: "critical",
  },
  {
    id: "HUNT-006",
    title: "Legacy implant resurfacing",
    hypothesis:
      "Expired implant hash IOC-1011 may still appear in EDR telemetry on contractor laptops.",
    status: "closed",
    outcome: "not_found",
    techniqueIds: ["T1059.001"],
    indicatorIds: ["IOC-1011"],
    actorIds: [],
    relatedAlertIds: [],
    relatedIncidentIds: [],
    assignee: "Chloe Park",
    createdLabel: "1 Jun 2026",
    updatedLabel: "15 Jun 2026",
    findings: "No matches in 30-day EDR window; hunt closed.",
    severity: "medium",
  },
  {
    id: "HUNT-007",
    title: "MFA fatigue after helpdesk calls",
    hypothesis:
      "VIP identities receive MFA push storms within 2h of documented helpdesk social-engineering attempts.",
    status: "closed",
    outcome: "inconclusive",
    techniqueIds: ["T1621"],
    indicatorIds: ["IOC-1003"],
    actorIds: ["actor-helpdesk-hijackers"],
    relatedAlertIds: ["ALT-2141"],
    relatedIncidentIds: [],
    assignee: "Leo Park",
    createdLabel: "10 Jul 2026",
    updatedLabel: "18 Jul 2026",
    findings:
      "Sparse MFA telemetry; could not confirm push storms at hunt window.",
    severity: "high",
  },
];

export const HUNT_CATALOG_SIZE = 48;

const huntAssignees = [
  "Ava Reed",
  "Ava Reed",
  "Chloe Park",
  "Chloe Park",
  "Leo Park",
  "Maya Rao",
  "Owen Lee",
  "Kabir Sethi",
  "Ethan Cole",
  "Harper Singh",
  "Riya Sharma",
  "Ben Lewis",
];

const huntStatusWeights: Array<[HuntStatus, number]> = [
  ["closed", 48],
  ["running", 32],
  ["draft", 20],
];

function buildHuntCatalog(
  seeds: Hunt[],
  size = HUNT_CATALOG_SIZE,
): Hunt[] {
  if (seeds.length >= size) return seeds.slice(0, size);
  const generated: Hunt[] = [];
  let nextNum = 8;

  for (let index = 0; index < size - seeds.length; index += 1) {
    const template = seeds[index % seeds.length]!;
    const status = pickWeightedThreat(huntStatusWeights, index * 11 + 2);
    const severity = pickWeightedThreat(indicatorSeverityWeights, index * 4 + 1);
    const outcome: HuntOutcome | undefined =
      status === "closed"
        ? (["confirmed", "not_found", "inconclusive", "not_found", "confirmed"][
            index % 5
          ] as HuntOutcome)
        : undefined;
    generated.push({
      ...template,
      id: `HUNT-${String(nextNum).padStart(3, "0")}`,
      title: `${template.title} · hunt ${index + 1}`,
      hypothesis: `${template.hypothesis} (expanded hunt ${index + 1}.)`,
      status,
      outcome,
      indicatorIds: threatIndicators
        .slice(index % 20, (index % 20) + 1 + (index % 3))
        .map((ioc) => ioc.id),
      assignee: huntAssignees[index % huntAssignees.length]!,
      createdLabel: `${1 + (index % 20)} Jul 2026`,
      updatedLabel: `${18 + (index % 10)} Jul 2026`,
      findings:
        status === "closed"
          ? `Synthetic hunt ${index + 1} closed as ${outcome}.`
          : undefined,
      severity,
    });
    nextNum += 1;
  }

  return [...seeds, ...generated];
}

export const threatHunts: Hunt[] = buildHuntCatalog(threatHuntsSeed);

export type IndicatorStat = {
  key: string;
  title: string;
  value: string;
  context: string;
};

export function getIndicatorById(id: string) {
  return threatIndicators.find((item) => item.id === id) ?? null;
}

export function getActorById(id: string) {
  return threatActorProfiles.find((item) => item.id === id) ?? null;
}

export function getActorByGraphNodeId(graphNodeId: string) {
  return (
    threatActorProfiles.find((item) => item.graphNodeId === graphNodeId) ?? null
  );
}

export function getCampaignById(id: string) {
  return threatCampaigns.find((item) => item.id === id) ?? null;
}

export function getHuntById(id: string) {
  return threatHunts.find((item) => item.id === id) ?? null;
}

export function getFeedById(id: string) {
  return threatFeeds.find((item) => item.id === id) ?? null;
}

export function getIndicatorsForExposure(exposureId: string) {
  return threatIndicators.filter((item) =>
    item.darkWebExposureIds.includes(exposureId),
  );
}

export function getIndicatorsForFeed(feedId: string) {
  return threatIndicators.filter((item) => item.feedIds.includes(feedId));
}

export function getHuntsForIndicator(indicatorId: string) {
  return threatHunts.filter((hunt) => hunt.indicatorIds.includes(indicatorId));
}

/** Prefill Investigate QL from a hunt hypothesis + techniques/IOCs. */
export function buildInvestigateQueryForHunt(hunt: Hunt): string {
  if (hunt.heimdallQl?.trim()) return hunt.heimdallQl.trim();
  const techniques = hunt.techniqueIds.slice(0, 4);
  const iocs = hunt.indicatorIds.slice(0, 4);
  const lines = [
    `// Hunt ${hunt.id} — ${hunt.title.slice(0, 64)}`,
    `events`,
  ];
  if (techniques.length > 0) {
    lines.push(
      `  | where mitre.technique in (${techniques.map((t) => `"${t}"`).join(", ")})`,
    );
  }
  if (iocs.length > 0) {
    lines.push(
      `  | where ioc.id in (${iocs.map((id) => `"${id}"`).join(", ")}) or risk_score >= 50`,
    );
  } else {
    lines.push(`  | where risk_score >= 50 or confidence >= 60`);
  }
  lines.push(`  | take 100`);
  return lines.join("\n");
}

export function defaultHuntSourceIds(hunt: Hunt): string[] {
  if (hunt.sourceIds && hunt.sourceIds.length > 0) return [...hunt.sourceIds];
  return [
    "int-splunk-core",
    "int-okta-workforce",
    "int-sentinel-workspace",
    "int-defender-endpoint",
  ];
}

export function getIndicatorStats(
  indicators: Iterable<Indicator> = threatIndicators,
): IndicatorStat[] {
  const list = Array.from(indicators);
  const active = list.filter((i) => i.status === "active").length;
  const critical = list.filter(
    (i) => i.severity === "critical" && i.status === "active",
  ).length;
  const fromDarkWeb = list.filter((i) => i.darkWebExposureIds.length > 0)
    .length;
  const linkedHunts = new Set(list.flatMap((i) => i.relatedHuntIds)).size;

  return [
    {
      key: "active",
      title: "Active indicators",
      value: String(active),
      context: "In circulation",
    },
    {
      key: "critical",
      title: "Critical active",
      value: String(critical),
      context: "Needs hunt coverage",
    },
    {
      key: "dark-web",
      title: "From dark web",
      value: String(fromDarkWeb),
      context: "Minted from exposures",
    },
    {
      key: "hunts",
      title: "Linked hunts",
      value: String(linkedHunts),
      context: "Hunt library coverage",
    },
  ];
}

export function getHuntStats(hunts: Iterable<Hunt> = threatHunts) {
  const list = Array.from(hunts);
  const running = list.filter((h) => h.status === "running").length;
  const draft = list.filter((h) => h.status === "draft").length;
  const closed = list.filter((h) => h.status === "closed").length;
  const confirmed = list.filter((h) => h.outcome === "confirmed").length;

  return [
    {
      key: "running",
      title: "Running",
      value: String(running),
      context: "Active hypotheses",
    },
    {
      key: "draft",
      title: "Draft",
      value: String(draft),
      context: "Not started",
    },
    {
      key: "closed",
      title: "Closed",
      value: String(closed),
      context: "Completed hunts",
    },
    {
      key: "confirmed",
      title: "Confirmed",
      value: String(confirmed),
      context: "Positive findings",
    },
  ];
}

export function resolveIndicatorAlerts(indicator: Indicator) {
  return indicator.relatedAlertIds
    .map((id) => getAlertById(id))
    .filter((alert): alert is NonNullable<typeof alert> => Boolean(alert));
}

/** Alerts whose tags overlap indicator tags (beyond explicit relatedAlertIds). */
export function resolveMatchedAlertsByTags(indicator: Indicator) {
  if (indicator.tags.length === 0) return [];
  const tagSet = new Set(indicator.tags.map((t) => t.toLowerCase()));
  const related = new Set(indicator.relatedAlertIds);
  return socAlerts
    .filter((alert) => {
      if (related.has(alert.id)) return false;
      return alert.tags.some((tag) => tagSet.has(tag.toLowerCase()));
    })
    .slice(0, 8);
}

export function resolveHuntAlerts(hunt: Hunt) {
  return hunt.relatedAlertIds
    .map((id) => getAlertById(id))
    .filter((alert): alert is NonNullable<typeof alert> => Boolean(alert));
}

export function resolveHuntIncidents(hunt: Hunt) {
  return hunt.relatedIncidentIds
    .map((id) => getIncidentById(id))
    .filter((incident): incident is NonNullable<typeof incident> =>
      Boolean(incident),
    );
}

export function filterIndicators(
  indicators: Indicator[],
  opts: {
    query?: string;
    types?: IndicatorType[];
    statuses?: IndicatorStatus[];
    confidences?: IndicatorConfidence[];
    activeOnly?: boolean;
  },
) {
  const q = opts.query?.trim().toLowerCase() ?? "";
  return indicators.filter((item) => {
    if (opts.activeOnly && item.status !== "active") return false;
    if (opts.types?.length && !opts.types.includes(item.type)) return false;
    if (opts.statuses?.length && !opts.statuses.includes(item.status))
      return false;
    if (opts.confidences?.length && !opts.confidences.includes(item.confidence))
      return false;
    if (!q) return true;
    const hay = [
      item.id,
      item.value,
      item.title,
      item.notes,
      ...item.tags,
      ...item.sources,
      ...item.techniqueIds,
    ]
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  });
}

export function filterHunts(
  hunts: Hunt[],
  opts: {
    query?: string;
    statuses?: HuntStatus[];
  },
) {
  const q = opts.query?.trim().toLowerCase() ?? "";
  return hunts.filter((hunt) => {
    if (opts.statuses?.length && !opts.statuses.includes(hunt.status))
      return false;
    if (!q) return true;
    const hay = [
      hunt.id,
      hunt.title,
      hunt.hypothesis,
      hunt.assignee,
      ...hunt.techniqueIds,
      ...hunt.indicatorIds,
      ...hunt.actorIds,
      hunt.findings ?? "",
    ]
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  });
}

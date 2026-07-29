import { socAlerts } from "@/components/alerts/alerts-data";
import {
  buildInvestigateQueryForEntity,
  type HuntEntityKind,
} from "@/components/threat-hunting/threat-analytics-data";

export type ThreatGeoSeverity = "critical" | "high" | "medium" | "low";

export type ThreatGeoEntity = {
  kind: HuntEntityKind;
  value: string;
  label?: string;
};

export type ThreatGeoEvent = {
  id: string;
  title: string;
  summary: string;
  latitude: number;
  longitude: number;
  locationLabel: string;
  severity: ThreatGeoSeverity;
  alertId: string | null;
  actorId: string | null;
  indicatorId: string | null;
  observedAt: string;
  /** Clickable hunt entities that prefill Investigate. */
  entities: ThreatGeoEntity[];
};

const GEO_SEEDS: Array<
  Omit<ThreatGeoEvent, "id" | "alertId" | "observedAt" | "entities"> & {
    alertIndex: number;
    entities: ThreatGeoEntity[];
  }
> = [
  {
    title: "C2 beacon cluster",
    summary: "Multiple endpoints beaconing to known C2 infrastructure.",
    latitude: 37.7749,
    longitude: -122.4194,
    locationLabel: "San Francisco, US",
    severity: "critical",
    actorId: "actor-canvas-cyclone",
    indicatorId: "IOC-1001",
    alertIndex: 0,
    entities: [
      { kind: "host", value: "wks-finance-17" },
      { kind: "ip", value: "185.220.101.44" },
      { kind: "ioc", value: "IOC-1001" },
      { kind: "domain", value: "cdn-update[.]biz" },
    ],
  },
  {
    title: "Credential stuffing origin",
    summary: "Auth abuse traffic sourced from residential proxy ASN.",
    latitude: 52.52,
    longitude: 13.405,
    locationLabel: "Berlin, DE",
    severity: "high",
    actorId: "actor-helpdesk-hijackers",
    indicatorId: "IOC-1003",
    alertIndex: 3,
    entities: [
      { kind: "ip", value: "91.132.18.22" },
      { kind: "user", value: "ava.reed@svalbard.ca" },
      { kind: "ioc", value: "IOC-1003" },
    ],
  },
  {
    title: "Phishing kit hosting",
    summary: "Lookalike login pages hosted on bulletproof VPS.",
    latitude: 1.3521,
    longitude: 103.8198,
    locationLabel: "Singapore, SG",
    severity: "high",
    actorId: "actor-canvas-cyclone",
    indicatorId: "IOC-1002",
    alertIndex: 7,
    entities: [
      { kind: "domain", value: "svalbard-sso[.]com" },
      { kind: "ip", value: "103.45.12.88" },
      { kind: "ioc", value: "IOC-1002" },
    ],
  },
  {
    title: "Ransomware staging",
    summary: "Encryption tool staging observed near finance subnet egress.",
    latitude: 40.7128,
    longitude: -74.006,
    locationLabel: "New York, US",
    severity: "critical",
    actorId: null,
    indicatorId: "IOC-1004",
    alertIndex: 12,
    entities: [
      { kind: "host", value: "fs-finance-01" },
      { kind: "ip", value: "10.24.18.91" },
      { kind: "user", value: "svc-backup" },
    ],
  },
  {
    title: "Dark web dump chatter",
    summary: "Mentions of corporate credentials on underground forum.",
    latitude: 55.7558,
    longitude: 37.6173,
    locationLabel: "Moscow, RU",
    severity: "medium",
    actorId: "actor-canvas-cyclone",
    indicatorId: "IOC-1010",
    alertIndex: 18,
    entities: [
      { kind: "user", value: "riya.sharma@svalbard.ca" },
      { kind: "ioc", value: "IOC-1010" },
      { kind: "domain", value: "forum-leak[.]onion" },
    ],
  },
  {
    title: "Cloud exfil path",
    summary: "Unusual S3 replication to unfamiliar region endpoint.",
    latitude: 35.6762,
    longitude: 139.6503,
    locationLabel: "Tokyo, JP",
    severity: "high",
    actorId: null,
    indicatorId: "IOC-1005",
    alertIndex: 22,
    entities: [
      { kind: "ip", value: "52.68.12.44" },
      { kind: "user", value: "arn:aws:iam::8821:user/svc-deploy" },
      { kind: "ioc", value: "IOC-1005" },
    ],
  },
  {
    title: "VPN brute force",
    summary: "Concentrated failed MFA push storms from single geo.",
    latitude: -23.5505,
    longitude: -46.6333,
    locationLabel: "São Paulo, BR",
    severity: "medium",
    actorId: "actor-helpdesk-hijackers",
    indicatorId: "IOC-1006",
    alertIndex: 28,
    entities: [
      { kind: "ip", value: "177.54.148.10" },
      { kind: "user", value: "helpdesk-bot" },
      { kind: "geo", value: "São Paulo, BR" },
    ],
  },
  {
    title: "Malware dropper CDN",
    summary: "Payload delivery via compromised marketing CDN node.",
    latitude: 51.5074,
    longitude: -0.1278,
    locationLabel: "London, UK",
    severity: "high",
    actorId: "actor-canvas-cyclone",
    indicatorId: "IOC-1007",
    alertIndex: 35,
    entities: [
      { kind: "domain", value: "assets-cdn[.]marketing" },
      { kind: "host", value: "LAP-ENG-0042" },
      { kind: "ioc", value: "IOC-1007" },
    ],
  },
  {
    title: "Insider data staging",
    summary: "Large archive creation near endpoint in APAC office.",
    latitude: -33.8688,
    longitude: 151.2093,
    locationLabel: "Sydney, AU",
    severity: "medium",
    actorId: null,
    indicatorId: null,
    alertIndex: 40,
    entities: [
      { kind: "host", value: "WKS-SYD-221" },
      { kind: "user", value: "ben.lewis@svalbard.ca" },
      { kind: "geo", value: "Sydney, AU" },
    ],
  },
  {
    title: "Scanner probe wave",
    summary: "Internet-facing app scanners sweeping auth endpoints.",
    latitude: 25.2048,
    longitude: 55.2708,
    locationLabel: "Dubai, AE",
    severity: "low",
    actorId: null,
    indicatorId: "IOC-1008",
    alertIndex: 48,
    entities: [
      { kind: "ip", value: "185.176.27.132" },
      { kind: "domain", value: "auth.svalbard.ca" },
      { kind: "ioc", value: "IOC-1008" },
    ],
  },
  {
    title: "BEC mule account",
    summary: "Wire-fraud mule accounts tied to regional bank cluster.",
    latitude: 19.4326,
    longitude: -99.1332,
    locationLabel: "Mexico City, MX",
    severity: "high",
    actorId: "actor-helpdesk-hijackers",
    indicatorId: "IOC-1009",
    alertIndex: 55,
    entities: [
      { kind: "user", value: "ap-finance@svalbard.ca" },
      { kind: "ip", value: "187.190.44.21" },
      { kind: "ioc", value: "IOC-1009" },
    ],
  },
  {
    title: "Tor exit exfil",
    summary: "Sensitive document hashes seen exiting via Tor relays.",
    latitude: 59.3293,
    longitude: 18.0686,
    locationLabel: "Stockholm, SE",
    severity: "critical",
    actorId: "actor-canvas-cyclone",
    indicatorId: "IOC-1002",
    alertIndex: 60,
    entities: [
      { kind: "ip", value: "171.25.193.25" },
      { kind: "host", value: "wks-legal-03" },
      { kind: "ioc", value: "IOC-1002" },
    ],
  },
];

function entitiesForCluster(
  seed: (typeof GEO_SEEDS)[number],
  index: number,
): ThreatGeoEntity[] {
  const base = [...seed.entities];
  if (index % 2 === 0) {
    base.push({ kind: "geo", value: seed.locationLabel });
  }
  if (index % 5 === 0) {
    base.push({
      kind: "host",
      value: `WKS-GEO-${String((index % 90) + 1).padStart(3, "0")}`,
    });
  }
  return base;
}

export const threatGeoEvents: ThreatGeoEvent[] = (() => {
  const base = GEO_SEEDS.map((seed, index) => {
    const alert = socAlerts[seed.alertIndex % socAlerts.length];
    return {
      id: `GEO-${String(index + 1).padStart(3, "0")}`,
      title: seed.title,
      summary: seed.summary,
      latitude: seed.latitude,
      longitude: seed.longitude,
      locationLabel: seed.locationLabel,
      severity: seed.severity,
      actorId: seed.actorId,
      indicatorId: seed.indicatorId,
      alertId: alert?.id ?? null,
      observedAt: alert?.createdAt ?? "2026-07-27T12:00:00.000Z",
      entities: seed.entities,
    } satisfies ThreatGeoEvent;
  });

  const extras: ThreatGeoEvent[] = [];
  const jitter = [
    [0.4, -0.3],
    [-0.5, 0.6],
    [0.8, 0.2],
    [-0.2, -0.7],
    [1.1, -0.4],
    [-0.9, 0.5],
  ] as const;
  const severityWeights: Array<[ThreatGeoSeverity, number]> = [
    ["low", 35],
    ["medium", 30],
    ["high", 25],
    ["critical", 10],
  ];

  for (let index = 0; index < 120; index += 1) {
    const seed = GEO_SEEDS[index % GEO_SEEDS.length]!;
    const [dLat, dLon] = jitter[index % jitter.length]!;
    const alert = socAlerts[(seed.alertIndex + index * 11) % socAlerts.length];
    let cursor = ((index * 2654435761) >>> 0) % 100;
    let severity: ThreatGeoSeverity = "medium";
    for (const [value, weight] of severityWeights) {
      if (cursor < weight) {
        severity = value;
        break;
      }
      cursor -= weight;
    }
    extras.push({
      id: `GEO-${String(base.length + index + 1).padStart(3, "0")}`,
      title: `${seed.title} · cluster ${index + 1}`,
      summary: `${seed.summary} (synthetic geo event ${index + 1}.)`,
      latitude: seed.latitude + dLat * ((index % 5) + 1) * 0.15,
      longitude: seed.longitude + dLon * ((index % 4) + 1) * 0.2,
      locationLabel: seed.locationLabel,
      severity,
      actorId: index % 3 === 0 ? seed.actorId : null,
      indicatorId: index % 4 === 0 ? seed.indicatorId : null,
      alertId: alert?.id ?? null,
      observedAt: alert?.createdAt ?? "2026-07-27T12:00:00.000Z",
      entities: entitiesForCluster(seed, index),
    });
  }

  return [...base, ...extras];
})();

export function getThreatGeoStats(events: ThreatGeoEvent[] = threatGeoEvents) {
  return {
    total: events.length,
    critical: events.filter((e) => e.severity === "critical").length,
    high: events.filter((e) => e.severity === "high").length,
    regions: new Set(
      events.map((e) => e.locationLabel.split(",").pop()?.trim()),
    ).size,
    entities: events.reduce((sum, e) => sum + e.entities.length, 0),
  };
}

export function investigateHrefForEntity(entity: ThreatGeoEntity): string {
  const q = buildInvestigateQueryForEntity(entity.kind, entity.value);
  return `/investigate?q=${encodeURIComponent(q)}`;
}

export function investigateHrefForGeoEvent(event: ThreatGeoEvent): string {
  const primary = event.entities[0];
  if (primary) return investigateHrefForEntity(primary);
  const q = buildInvestigateQueryForEntity("geo", event.locationLabel);
  return `/investigate?q=${encodeURIComponent(q)}`;
}

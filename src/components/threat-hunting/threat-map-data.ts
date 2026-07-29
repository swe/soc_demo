import { socAlerts } from "@/components/alerts/alerts-data";

export type ThreatGeoSeverity = "critical" | "high" | "medium" | "low";

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
};

const GEO_SEEDS: Array<
  Omit<ThreatGeoEvent, "id" | "alertId" | "observedAt"> & {
    alertIndex: number;
  }
> = [
  {
    title: "C2 beacon cluster",
    summary: "Multiple endpoints beaconing to known C2 infrastructure.",
    latitude: 37.7749,
    longitude: -122.4194,
    locationLabel: "San Francisco, US",
    severity: "critical",
    actorId: "actor-apt29",
    indicatorId: null,
    alertIndex: 0,
  },
  {
    title: "Credential stuffing origin",
    summary: "Auth abuse traffic sourced from residential proxy ASN.",
    latitude: 52.52,
    longitude: 13.405,
    locationLabel: "Berlin, DE",
    severity: "high",
    actorId: null,
    indicatorId: null,
    alertIndex: 3,
  },
  {
    title: "Phishing kit hosting",
    summary: "Lookalike login pages hosted on bulletproof VPS.",
    latitude: 1.3521,
    longitude: 103.8198,
    locationLabel: "Singapore, SG",
    severity: "high",
    actorId: null,
    indicatorId: null,
    alertIndex: 7,
  },
  {
    title: "Ransomware staging",
    summary: "Encryption tool staging observed near finance subnet egress.",
    latitude: 40.7128,
    longitude: -74.006,
    locationLabel: "New York, US",
    severity: "critical",
    actorId: null,
    indicatorId: null,
    alertIndex: 12,
  },
  {
    title: "Dark web dump chatter",
    summary: "Mentions of corporate credentials on underground forum.",
    latitude: 55.7558,
    longitude: 37.6173,
    locationLabel: "Moscow, RU",
    severity: "medium",
    actorId: "actor-fin7",
    indicatorId: null,
    alertIndex: 18,
  },
  {
    title: "Cloud exfil path",
    summary: "Unusual S3 replication to unfamiliar region endpoint.",
    latitude: 35.6762,
    longitude: 139.6503,
    locationLabel: "Tokyo, JP",
    severity: "high",
    actorId: null,
    indicatorId: null,
    alertIndex: 22,
  },
  {
    title: "VPN brute force",
    summary: "Concentrated failed MFA push storms from single geo.",
    latitude: -23.5505,
    longitude: -46.6333,
    locationLabel: "São Paulo, BR",
    severity: "medium",
    actorId: null,
    indicatorId: null,
    alertIndex: 28,
  },
  {
    title: "Malware dropper CDN",
    summary: "Payload delivery via compromised marketing CDN node.",
    latitude: 51.5074,
    longitude: -0.1278,
    locationLabel: "London, UK",
    severity: "high",
    actorId: null,
    indicatorId: null,
    alertIndex: 35,
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
  },
  {
    title: "Scanner probe wave",
    summary: "Internet-facing app scanners sweeping auth endpoints.",
    latitude: 25.2048,
    longitude: 55.2708,
    locationLabel: "Dubai, AE",
    severity: "low",
    actorId: null,
    indicatorId: null,
    alertIndex: 48,
  },
  {
    title: "BEC mule account",
    summary: "Wire-fraud mule accounts tied to regional bank cluster.",
    latitude: 19.4326,
    longitude: -99.1332,
    locationLabel: "Mexico City, MX",
    severity: "high",
    actorId: null,
    indicatorId: null,
    alertIndex: 55,
  },
  {
    title: "Tor exit exfil",
    summary: "Sensitive document hashes seen exiting via Tor relays.",
    latitude: 59.3293,
    longitude: 18.0686,
    locationLabel: "Stockholm, SE",
    severity: "critical",
    actorId: null,
    indicatorId: null,
    alertIndex: 60,
  },
];

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

  for (let index = 0; index < 90; index += 1) {
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
      actorId: index % 4 === 0 ? seed.actorId : null,
      indicatorId: null,
      alertId: alert?.id ?? null,
      observedAt: alert?.createdAt ?? "2026-07-27T12:00:00.000Z",
    });
  }

  return [...base, ...extras];
})();

export function getThreatGeoStats(events: ThreatGeoEvent[] = threatGeoEvents) {
  return {
    total: events.length,
    critical: events.filter((e) => e.severity === "critical").length,
    high: events.filter((e) => e.severity === "high").length,
    regions: new Set(events.map((e) => e.locationLabel.split(",").pop()?.trim())).size,
  };
}

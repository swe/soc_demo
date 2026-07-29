import { assetIdentities } from "@/components/assets/identities-data";
import { appendAuditLog } from "@/components/audit/audit-log-data";
import { currentProfile } from "@/components/profile/profile-data";

export type UebaAnomalyKind =
  | "impossible_travel"
  | "privilege_spike"
  | "peer_deviation"
  | "dormant_account_use";

export type UebaSourceTag =
  | "Okta"
  | "Defender for Identity"
  | "Sentinel"
  | "Entra ID";

export type UebaAnomaly = {
  id: string;
  identityId: string;
  kind: UebaAnomalyKind;
  title: string;
  summary: string;
  severity: "critical" | "high" | "medium" | "low";
  detectedAtLabel: string;
  sourceTags: UebaSourceTag[];
  riskDelta: number;
  /** Peer-group baseline this anomaly is measured against. */
  peerBaselineLabel: string;
};

export type RiskTimelinePoint = {
  dayOffset: number;
  label: string;
  score: number;
  note?: string;
};

export type IdentityBehaviorProfile = {
  identityId: string;
  /** 14-day risk sparkline (oldest → newest). */
  riskSpark: number[];
  /** Labeled timeline points derived from the spark. */
  riskTimeline: RiskTimelinePoint[];
  peerGroup: string;
  /** Short baseline caption for peer comparison. */
  peerBaselineLabel: string;
  typicalLocations: string[];
  baselinePrivileges: string[];
  anomalies: UebaAnomaly[];
};

export const uebaAnomalyLabels: Record<UebaAnomalyKind, string> = {
  impossible_travel: "Impossible travel",
  privilege_spike: "Privilege spike",
  peer_deviation: "Peer deviation",
  dormant_account_use: "Dormant account use",
};

function hashString(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function buildSpark(base: number, hash: number): number[] {
  return Array.from({ length: 14 }, (_, i) => {
    const wave = ((hash + i * 17) % 19) - 9;
    const spike = i === 11 || i === 12 ? 12 + (hash % 8) : 0;
    return Math.max(4, Math.min(98, base + wave + spike - 4));
  });
}

function buildRiskTimeline(spark: number[], hash: number): RiskTimelinePoint[] {
  const indices = [0, 3, 6, 9, 11, 13].filter((i) => i < spark.length);
  return indices.map((i) => {
    const score = spark[i]!;
    const prev = i > 0 ? spark[i - 1]! : score;
    const delta = score - prev;
    let note: string | undefined;
    if (i >= 11 && delta > 8) note = "Anomaly window";
    else if (delta > 6) note = "Elevated vs prior day";
    else if (hash % 5 === i % 5 && i > 0) note = "Peer median ±2";
    return {
      dayOffset: i - (spark.length - 1),
      label: i === spark.length - 1 ? "Today" : `${spark.length - 1 - i}d ago`,
      score,
      note,
    };
  });
}

const anomalyTemplates: {
  kind: UebaAnomalyKind;
  title: (name: string) => string;
  summary: (name: string, location: string) => string;
  severity: UebaAnomaly["severity"];
  sources: UebaSourceTag[];
  riskDelta: number;
  when: string;
  peerBaseline: (peerGroup: string) => string;
}[] = [
  {
    kind: "impossible_travel",
    title: (name) => `Impossible travel · ${name}`,
    summary: (name, location) =>
      `${name} authenticated from ${location} then from Singapore within 42 minutes — physically impossible.`,
    severity: "high",
    sources: ["Okta", "Sentinel"],
    riskDelta: 18,
    when: "38 min ago",
    peerBaseline: (peer) =>
      `${peer}: ≤1 geo hop / 24h · median travel radius 180 km`,
  },
  {
    kind: "privilege_spike",
    title: (name) => `Privilege spike · ${name}`,
    summary: (name) =>
      `${name} gained Domain Admins / Global Admin-equivalent roles outside change window.`,
    severity: "critical",
    sources: ["Defender for Identity", "Entra ID"],
    riskDelta: 24,
    when: "2 hours ago",
    peerBaseline: (peer) =>
      `${peer}: 0 standing admin grants / week outside CAB`,
  },
  {
    kind: "peer_deviation",
    title: (name) => `Peer deviation · ${name}`,
    summary: (name) =>
      `${name} accessed 14 repositories and 3 production vaults peers in the same role rarely touch.`,
    severity: "medium",
    sources: ["Sentinel", "Okta"],
    riskDelta: 11,
    when: "5 hours ago",
    peerBaseline: (peer) =>
      `${peer}: p95 = 4 repos / day · vault touches rare`,
  },
  {
    kind: "dormant_account_use",
    title: (name) => `Dormant account use · ${name}`,
    summary: (name) =>
      `${name} signed in after 21+ days of inactivity with atypical client and ASN.`,
    severity: "high",
    sources: ["Okta", "Defender for Identity"],
    riskDelta: 16,
    when: "1 day ago",
    peerBaseline: (peer) =>
      `${peer}: dormant threshold 14d · re-auth expected via MFA reset`,
  },
];

function buildProfile(
  identityId: string,
  displayName: string,
  riskScore: number,
  department: string,
  signInLocation: string,
  privileged: boolean,
  status: string,
): IdentityBehaviorProfile {
  const hash = hashString(identityId);
  const spark = buildSpark(riskScore, hash);
  const peerGroup = `${department} · ${privileged ? "privileged" : "standard"} peers`;
  const peerBaselineLabel = privileged
    ? `Baseline: ${department} privileged cohort · low admin churn`
    : `Baseline: ${department} standard cohort · SSO + email only`;
  const anomalies: UebaAnomaly[] = [];

  const shouldSeed =
    riskScore >= 45 ||
    privileged ||
    status === "stale" ||
    status === "locked" ||
    hash % 7 === 0;

  if (shouldSeed) {
    const count = riskScore >= 70 ? 2 + (hash % 2) : 1 + (hash % 2);
    for (let i = 0; i < count; i += 1) {
      const template = anomalyTemplates[(hash + i) % anomalyTemplates.length]!;
      anomalies.push({
        id: `UEBA-${identityId}-${i + 1}`,
        identityId,
        kind: template.kind,
        title: template.title(displayName),
        summary: template.summary(displayName, signInLocation),
        severity: template.severity,
        detectedAtLabel: template.when,
        sourceTags: template.sources,
        riskDelta: template.riskDelta,
        peerBaselineLabel: template.peerBaseline(peerGroup),
      });
    }
  }

  return {
    identityId,
    riskSpark: spark,
    riskTimeline: buildRiskTimeline(spark, hash),
    peerGroup,
    peerBaselineLabel,
    typicalLocations: [signInLocation, "HQ · VPN"],
    baselinePrivileges: privileged
      ? ["SSO apps", "Admin portals", "Privileged roles"]
      : ["SSO apps", "Email", "Collaboration"],
    anomalies,
  };
}

const profiles = new Map<string, IdentityBehaviorProfile>(
  assetIdentities.map((identity) => [
    identity.id,
    buildProfile(
      identity.id,
      identity.displayName,
      identity.riskScore,
      identity.department,
      identity.signInLocation,
      identity.privileged,
      identity.status,
    ),
  ]),
);

/** Session-local suppressed anomaly ids (demo only). */
const suppressedAnomalyIds = new Set<string>();
const suppressListeners = new Set<() => void>();

function emitSuppress() {
  for (const listener of suppressListeners) listener();
}

export function subscribeUebaSuppress(listener: () => void) {
  suppressListeners.add(listener);
  return () => {
    suppressListeners.delete(listener);
  };
}

export function getSuppressedAnomalyIds(): ReadonlySet<string> {
  return suppressedAnomalyIds;
}

export function isAnomalySuppressed(anomalyId: string) {
  return suppressedAnomalyIds.has(anomalyId);
}

export function suppressUebaAnomaly(anomalyId: string, identityId: string) {
  if (suppressedAnomalyIds.has(anomalyId)) return false;
  suppressedAnomalyIds.add(anomalyId);
  emitSuppress();
  appendAuditLog({
    actorId: currentProfile.id,
    actorName: currentProfile.name,
    action: "ueba.anomaly_suppressed",
    targetType: "asset",
    targetId: identityId,
    detail: `Suppressed UEBA anomaly ${anomalyId}`,
  });
  return true;
}

export function getVisibleAnomalies(
  profile: IdentityBehaviorProfile,
): UebaAnomaly[] {
  return profile.anomalies.filter((a) => !suppressedAnomalyIds.has(a.id));
}

export function getIdentityBehavior(
  identityId: string,
): IdentityBehaviorProfile | null {
  return profiles.get(identityId) ?? null;
}

export function getTopRiskyIdentities(limit = 5) {
  return [...assetIdentities]
    .map((identity) => {
      const behavior = profiles.get(identity.id)!;
      const anomalyBoost = getVisibleAnomalies(behavior).reduce(
        (sum, row) => sum + row.riskDelta,
        0,
      );
      return {
        identity,
        behavior,
        score: Math.min(99, identity.riskScore + Math.floor(anomalyBoost / 3)),
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function getUebaOverviewStats() {
  const allAnomalies = Array.from(profiles.values()).flatMap((p) =>
    getVisibleAnomalies(p),
  );
  const critical = allAnomalies.filter((a) => a.severity === "critical").length;
  const high = allAnomalies.filter((a) => a.severity === "high").length;
  return {
    identitiesWithAnomalies: Array.from(profiles.values()).filter(
      (p) => getVisibleAnomalies(p).length > 0,
    ).length,
    openAnomalies: allAnomalies.length,
    criticalOrHigh: critical + high,
  };
}

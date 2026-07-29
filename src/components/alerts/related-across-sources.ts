import type { AlertSourceCategory, SocAlert } from "./alerts-data";

export type RelatedCrossSourceEvent = {
  id: string;
  sourceName: string;
  sourceCategory: AlertSourceCategory;
  title: string;
  detail: string;
  ageLabel: string;
  investigateQuery: string;
};

const pool: Array<{
  sourceName: string;
  sourceCategory: AlertSourceCategory;
  title: string;
  detailTemplate: (entity: string) => string;
  queryTemplate: (entity: string) => string;
}> = [
  {
    sourceName: "Microsoft Sentinel",
    sourceCategory: "siem",
    title: "Correlated SIEM anomaly cluster",
    detailTemplate: (entity) =>
      `Sentinel analytics linked lateral movement signals around ${entity}.`,
    queryTemplate: (entity) =>
      `source:sentinel entity:"${entity}" | where severity >= medium`,
  },
  {
    sourceName: "Microsoft Defender",
    sourceCategory: "endpoint",
    title: "Endpoint behavioral detection",
    detailTemplate: (entity) =>
      `Defender observed suspicious process / script activity near ${entity}.`,
    queryTemplate: (entity) =>
      `source:defender host_or_user:"${entity}" | timeline 24h`,
  },
  {
    sourceName: "Okta Workforce",
    sourceCategory: "identity",
    title: "Identity risk session",
    detailTemplate: (entity) =>
      `Okta risk engine flagged concurrent sessions related to ${entity}.`,
    queryTemplate: (entity) =>
      `source:okta actor:"${entity}" event.outcome:success | risk_score > 50`,
  },
  {
    sourceName: "AWS Production",
    sourceCategory: "cloud",
    title: "CloudTrail privilege spike",
    detailTemplate: (entity) =>
      `AWS API activity for principals tied to ${entity} exceeded baseline.`,
    queryTemplate: (entity) =>
      `source:aws.cloudtrail principal~"${entity}" | where api in (AssumeRole, PutBucketPolicy)`,
  },
  {
    sourceName: "Splunk Enterprise",
    sourceCategory: "siem",
    title: "Multi-index correlation hit",
    detailTemplate: (entity) =>
      `Splunk notable linked auth + proxy events involving ${entity}.`,
    queryTemplate: (entity) =>
      `index=security "${entity}" | transaction maxspan=30m`,
  },
  {
    sourceName: "PAN-OS Edge Firewalls",
    sourceCategory: "network",
    title: "Egress to rare destination",
    detailTemplate: (entity) =>
      `Firewall saw uncommon outbound destinations correlated with ${entity}.`,
    queryTemplate: (entity) =>
      `source:palo_alto src_or_user:"${entity}" | rare dest_ip`,
  },
  {
    sourceName: "Cloudflare Enterprise",
    sourceCategory: "network",
    title: "Edge WAF / bot signal",
    detailTemplate: (entity) =>
      `Cloudflare flagged anomalous request patterns associated with ${entity}.`,
    queryTemplate: (entity) =>
      `source:cloudflare client_ip_or_path~"${entity}" | where action!=allow`,
  },
];

function hashSeed(value: string): number {
  let h = 0;
  for (let i = 0; i < value.length; i += 1) {
    h = (h * 31 + value.charCodeAt(i)) >>> 0;
  }
  return h;
}

/**
 * Mock related events from other telemetry sources for alert correlation UI.
 */
export function getRelatedAcrossSources(
  alert: SocAlert,
): RelatedCrossSourceEvent[] {
  const entity = alert.entityName;
  const seed = hashSeed(alert.id);
  const count = 2 + (seed % 3); // 2–4
  const candidates = pool.filter(
    (item) =>
      item.sourceName !== alert.sourceName &&
      item.sourceCategory !== alert.sourceCategory,
  );
  const ordered =
    candidates.length >= count
      ? candidates
      : pool.filter((item) => item.sourceName !== alert.sourceName);

  const picked: RelatedCrossSourceEvent[] = [];
  for (let i = 0; i < count && i < ordered.length; i += 1) {
    const item = ordered[(seed + i * 3) % ordered.length]!;
    if (picked.some((p) => p.sourceName === item.sourceName)) continue;
    picked.push({
      id: `${alert.id}-rel-${i}`,
      sourceName: item.sourceName,
      sourceCategory: item.sourceCategory,
      title: item.title,
      detail: item.detailTemplate(entity),
      ageLabel: `${8 + ((seed + i * 5) % 40)}m`,
      investigateQuery: item.queryTemplate(entity),
    });
  }

  // Ensure 2–4 even if filtering was aggressive
  while (picked.length < 2) {
    const item = pool[(seed + picked.length) % pool.length]!;
    picked.push({
      id: `${alert.id}-rel-fill-${picked.length}`,
      sourceName: item.sourceName,
      sourceCategory: item.sourceCategory,
      title: item.title,
      detail: item.detailTemplate(entity),
      ageLabel: `${12 + picked.length * 7}m`,
      investigateQuery: item.queryTemplate(entity),
    });
  }

  return picked.slice(0, 4);
}

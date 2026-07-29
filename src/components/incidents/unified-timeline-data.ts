import type { SocAlert } from "@/components/alerts/alerts-data";
import { getPlaybooks } from "@/components/playbooks/playbooks-session";

import type { SocIncident } from "./incidents-data";

export type UnifiedTimelineKind =
  | "alert"
  | "identity"
  | "device"
  | "cloud"
  | "playbook"
  | "note";

export type UnifiedTimelineEntry = {
  id: string;
  at: string;
  sourceName: string;
  kind: UnifiedTimelineKind;
  title: string;
  detail: string;
};

export const unifiedTimelineKindLabels: Record<UnifiedTimelineKind, string> = {
  alert: "Alert",
  identity: "Identity",
  device: "Device",
  cloud: "Cloud",
  playbook: "Playbook",
  note: "Note",
};

/** Short badge labels for timeline / source chips. */
export function shortSourceName(sourceName: string): string {
  const map: Record<string, string> = {
    "Splunk Enterprise": "Splunk",
    "Okta Workforce": "Okta",
    "AWS Production": "AWS",
    "PAN-OS Edge Firewalls": "PAN-OS",
    "Cloudflare Enterprise": "Cloudflare",
    "Heimdall Live Pulse": "Heimdall",
    "Microsoft Sentinel": "Sentinel",
    "Microsoft Defender": "Defender",
  };
  if (map[sourceName]) return map[sourceName];
  const first = sourceName.split(/\s+/)[0];
  return first || sourceName;
}

function minutesBefore(iso: string, minutes: number): string {
  return new Date(new Date(iso).getTime() - minutes * 60_000).toISOString();
}

function minutesAfter(iso: string, minutes: number): string {
  return new Date(new Date(iso).getTime() + minutes * 60_000).toISOString();
}

function hashSeed(value: string): number {
  let h = 0;
  for (let i = 0; i < value.length; i += 1) {
    h = (h * 31 + value.charCodeAt(i)) >>> 0;
  }
  return h;
}

function mockIdentityEvents(
  incident: SocIncident,
  alerts: SocAlert[],
): UnifiedTimelineEntry[] {
  const identityAlert = alerts.find((a) => a.sourceCategory === "identity");
  const entity =
    incident.entityType === "user"
      ? incident.entityName
      : (identityAlert?.entityName ?? incident.entityName);
  const base = incident.createdAt;
  const seed = hashSeed(incident.id);

  return [
    {
      id: `${incident.id}-id-1`,
      at: minutesBefore(base, 42 + (seed % 20)),
      sourceName: "Okta Workforce",
      kind: "identity",
      title: "Impossible travel sign-in",
      detail: `${entity} authenticated from a new geo after a prior session elsewhere.`,
    },
    {
      id: `${incident.id}-id-2`,
      at: minutesBefore(base, 28 + (seed % 12)),
      sourceName: "Okta Workforce",
      kind: "identity",
      title: "MFA challenge bypassed",
      detail: `Push fatigue pattern — ${2 + (seed % 4)} rapid denials then success for ${entity}.`,
    },
  ];
}

function mockDeviceEvents(
  incident: SocIncident,
  alerts: SocAlert[],
): UnifiedTimelineEntry[] {
  const endpointAlert = alerts.find(
    (a) => a.sourceCategory === "endpoint" || a.entityType === "host",
  );
  const host =
    incident.entityType === "host"
      ? incident.entityName
      : (endpointAlert?.entityName ?? "endpoint-host");
  const base = incident.createdAt;
  const seed = hashSeed(incident.id + "-dev");

  return [
    {
      id: `${incident.id}-dev-1`,
      at: minutesBefore(base, 35 + (seed % 15)),
      sourceName: "Microsoft Defender",
      kind: "device",
      title: "Suspicious process lineage",
      detail: `powershell.exe spawned from office suite on ${host}; AMSI telemetry flagged encoded payload.`,
    },
    {
      id: `${incident.id}-dev-2`,
      at: minutesBefore(base, 18 + (seed % 10)),
      sourceName: "Splunk Enterprise",
      kind: "device",
      title: "Endpoint persistence write",
      detail: `Registry Run key modified on ${host}; correlated with prior alert activity.`,
    },
  ];
}

function mockCloudFindings(
  incident: SocIncident,
  alerts: SocAlert[],
): UnifiedTimelineEntry[] {
  const cloudAlert = alerts.find((a) => a.sourceCategory === "cloud");
  const resource =
    cloudAlert?.entityName ??
    (incident.entityType === "cloud" ? incident.entityName : "prod-role");
  const base = incident.createdAt;
  const seed = hashSeed(incident.id + "-cloud");

  return [
    {
      id: `${incident.id}-cloud-1`,
      at: minutesBefore(base, 50 + (seed % 25)),
      sourceName: "AWS Production",
      kind: "cloud",
      title: "Anomalous role assumption",
      detail: `sts:AssumeRole against ${resource} from unusual principal / source IP.`,
    },
    {
      id: `${incident.id}-cloud-2`,
      at: minutesBefore(base, 12 + (seed % 8)),
      sourceName: "Microsoft Sentinel",
      kind: "cloud",
      title: "Cloud posture finding linked",
      detail: `Public exposure or privilege escalation signal correlated to ${resource}.`,
    },
  ];
}

const playbookStepTemplates = [
  "Enrich entities from CMDB",
  "Isolate affected endpoints",
  "Revoke active sessions",
  "Preserve forensic artifacts",
  "Notify incident commander",
  "Open customer bridge",
];

function playbookRunSteps(
  incident: SocIncident,
): UnifiedTimelineEntry[] {
  const linked = getPlaybooks().filter((p) =>
    p.linkedIncidentIds.includes(incident.id),
  );
  const fromTimeline = incident.timeline.filter((e) =>
    /playbook/i.test(e.label),
  );

  if (linked.length === 0 && fromTimeline.length === 0) return [];

  const entries: UnifiedTimelineEntry[] = [];
  const procedure = linked[0];
  const startAt =
    fromTimeline[0]?.at ??
    minutesAfter(incident.createdAt, 8);

  const stepCount = Math.min(
    procedure?.steps ?? 4,
    playbookStepTemplates.length,
  );
  const code = procedure?.code ?? "PB-IR";
  const title = procedure?.title ?? "Response playbook";

  for (let i = 0; i < stepCount; i += 1) {
    entries.push({
      id: `${incident.id}-pb-${i}`,
      at: minutesAfter(startAt, i * 3),
      sourceName: "Heimdall SOAR",
      kind: "playbook",
      title: `${code} · step ${i + 1}`,
      detail: `${playbookStepTemplates[i]} — ${title}`,
    });
  }

  return entries;
}

/**
 * Merged cross-source timeline for an IR case (mock enrichment + live alerts).
 */
export function buildUnifiedTimeline(
  incident: SocIncident,
  alerts: SocAlert[],
): UnifiedTimelineEntry[] {
  const entries: UnifiedTimelineEntry[] = [];

  for (const entry of incident.timeline) {
    const isPlaybook = /playbook/i.test(entry.label);
    entries.push({
      id: `${incident.id}-note-${entry.at}-${entry.label}`,
      at: entry.at,
      sourceName: isPlaybook ? "Heimdall SOAR" : "Heimdall",
      kind: isPlaybook ? "playbook" : "note",
      title: entry.label,
      detail: isPlaybook
        ? "SOAR timeline marker from playbook execution."
        : "Case response timeline entry.",
    });
  }

  for (const alert of alerts) {
    entries.push({
      id: `${incident.id}-alert-${alert.id}`,
      at: alert.createdAt,
      sourceName: alert.sourceName,
      kind: "alert",
      title: alert.title,
      detail: `${alert.id} · ${alert.ruleName} · ${alert.severity}`,
    });
  }

  // Deterministic mock enrichment — always include a slice for case depth demos.
  const seed = hashSeed(incident.id);
  entries.push(...mockIdentityEvents(incident, alerts).slice(0, seed % 2 === 0 ? 2 : 1));
  entries.push(...mockDeviceEvents(incident, alerts).slice(0, 1 + (seed % 2)));
  entries.push(...mockCloudFindings(incident, alerts).slice(0, seed % 3 === 0 ? 2 : 1));
  entries.push(...playbookRunSteps(incident));

  return entries.sort(
    (a, b) => new Date(a.at).getTime() - new Date(b.at).getTime(),
  );
}

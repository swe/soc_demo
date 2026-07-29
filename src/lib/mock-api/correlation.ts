/**
 * Auto-correlation engine contract.
 * Propose related alerts/incidents with confidence; merge / link / split cases.
 */

import type { SocAlert } from "@/components/alerts/alerts-data";
import {
  getAlertFromSession,
  getAlertsFromSession,
} from "@/components/alerts/alerts-session";
import { getRelatedAcrossSources } from "@/components/alerts/related-across-sources";
import type { SocIncident } from "@/components/incidents/incidents-data";
import {
  getIncidentFromSession,
  getIncidentsFromSession,
} from "@/components/incidents/incidents-session";

import { auditFromReceipt } from "./audit";
import { mockDelay } from "./delay";
import { incidentsApi } from "./incidents";
import { type ActionReceipt, type ListResult,makeReceipt } from "./types";

export type CorrelationEntityKey = {
  kind: "host" | "user" | "ip" | "mail" | "cloud" | "device" | "identity";
  value: string;
};

export type CorrelationReason = {
  code: string;
  label: string;
  weight: number;
};

export type CorrelationCandidate = {
  id: string;
  kind: "alert" | "incident" | "cross_source";
  title: string;
  confidence: number;
  reasons: CorrelationReason[];
  alertId?: string;
  incidentId?: string;
  sourceName?: string;
  entityKeys: CorrelationEntityKey[];
};

export type CorrelationProposal = {
  seedAlertId?: string;
  seedIncidentId?: string;
  entityKeys: CorrelationEntityKey[];
  candidates: CorrelationCandidate[];
  suggestedIncidentId?: string;
  overallConfidence: number;
};

export type CorrelationLink = {
  id: string;
  fromAlertIds: string[];
  toIncidentId: string;
  confidence: number;
  linkedAt: string;
  undone?: boolean;
};

const links = new Map<string, CorrelationLink>();
const mergeHistory: Array<{
  id: string;
  sourceIncidentIds: string[];
  targetIncidentId: string;
  at: string;
  undone?: boolean;
}> = [];

function hashSeed(value: string): number {
  let h = 0;
  for (let i = 0; i < value.length; i += 1) {
    h = (h * 31 + value.charCodeAt(i)) >>> 0;
  }
  return h;
}

function entityKeysFromAlert(alert: SocAlert): CorrelationEntityKey[] {
  const keys: CorrelationEntityKey[] = [
    { kind: "user", value: alert.entityName },
  ];
  if (alert.deviceId) {
    keys.push({ kind: "device", value: alert.deviceId });
    keys.push({ kind: "host", value: alert.entityName });
  }
  if (alert.identityId) {
    keys.push({ kind: "identity", value: alert.identityId });
  }
  if (
    alert.title.toLowerCase().includes("phish") ||
    alert.title.toLowerCase().includes("bec") ||
    alert.tags.some((t) => /phish|bec|mail/i.test(t))
  ) {
    keys.push({ kind: "mail", value: `msg-${alert.id}` });
  }
  return keys;
}

function scorePair(
  a: SocAlert,
  b: SocAlert,
): { confidence: number; reasons: CorrelationReason[] } {
  const reasons: CorrelationReason[] = [];
  let score = 0.15;
  if (a.entityName && a.entityName === b.entityName) {
    score += 0.35;
    reasons.push({
      code: "same_entity",
      label: `Shared entity ${a.entityName}`,
      weight: 0.35,
    });
  }
  if (a.deviceId && a.deviceId === b.deviceId) {
    score += 0.25;
    reasons.push({
      code: "same_device",
      label: "Same device id",
      weight: 0.25,
    });
  }
  if (a.identityId && a.identityId === b.identityId) {
    score += 0.25;
    reasons.push({
      code: "same_identity",
      label: "Same identity id",
      weight: 0.25,
    });
  }
  if (a.sourceCategory !== b.sourceCategory) {
    score += 0.12;
    reasons.push({
      code: "cross_source",
      label: `${a.sourceCategory} × ${b.sourceCategory}`,
      weight: 0.12,
    });
  }
  const sharedTags = a.tags.filter((t) => b.tags.includes(t));
  if (sharedTags.length) {
    score += Math.min(0.15, sharedTags.length * 0.05);
    reasons.push({
      code: "shared_tags",
      label: `Tags: ${sharedTags.slice(0, 3).join(", ")}`,
      weight: 0.05 * sharedTags.length,
    });
  }
  if (a.mitreTechnique && a.mitreTechnique === b.mitreTechnique) {
    score += 0.1;
    reasons.push({
      code: "same_technique",
      label: `MITRE ${a.mitreTechnique}`,
      weight: 0.1,
    });
  }
  // Deterministic jitter so demo scores aren't identical
  const jitter = ((hashSeed(`${a.id}:${b.id}`) % 9) - 4) / 100;
  const confidence = Math.max(0.05, Math.min(0.98, score + jitter));
  return { confidence, reasons };
}

function proposeFromAlert(alert: SocAlert): CorrelationProposal {
  const entityKeys = entityKeysFromAlert(alert);
  const candidates: CorrelationCandidate[] = [];

  // Cross-source related signals
  for (const rel of getRelatedAcrossSources(alert).slice(0, 4)) {
    candidates.push({
      id: `cand-${rel.id}`,
      kind: "cross_source",
      title: rel.title,
      confidence: 0.55 + (hashSeed(rel.id) % 30) / 100,
      reasons: [
        {
          code: "cross_source_signal",
          label: `${rel.sourceName}: ${rel.detail.slice(0, 80)}`,
          weight: 0.2,
        },
      ],
      sourceName: rel.sourceName,
      entityKeys,
    });
  }

  // Peer alerts sharing entities
  const peers = getAlertsFromSession()
    .filter((a) => a.id !== alert.id)
    .map((peer) => ({ peer, ...scorePair(alert, peer) }))
    .filter((x) => x.confidence >= 0.4)
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 6);

  for (const { peer, confidence, reasons } of peers) {
    candidates.push({
      id: `cand-alert-${peer.id}`,
      kind: "alert",
      title: peer.title,
      confidence,
      reasons,
      alertId: peer.id,
      entityKeys: entityKeysFromAlert(peer),
    });
  }

  // Existing incidents that already include this entity
  const incidents = getIncidentsFromSession().filter((inc) => {
    if (inc.alertIds.includes(alert.id)) return true;
    return (
      alert.entityName &&
      (inc.title.includes(alert.entityName) ||
        inc.summary.includes(alert.entityName))
    );
  });

  let suggestedIncidentId: string | undefined;
  let best = 0;
  for (const inc of incidents.slice(0, 4)) {
    const confidence =
      0.5 +
      (inc.alertIds.includes(alert.id) ? 0.35 : 0.1) +
      (hashSeed(inc.id) % 10) / 100;
    candidates.push({
      id: `cand-inc-${inc.id}`,
      kind: "incident",
      title: inc.title,
      confidence: Math.min(0.97, confidence),
      reasons: [
        {
          code: "incident_overlap",
          label: inc.alertIds.includes(alert.id)
            ? "Alert already linked to case"
            : "Entity overlap with open case",
          weight: 0.3,
        },
      ],
      incidentId: inc.id,
      entityKeys,
    });
    if (confidence > best) {
      best = confidence;
      suggestedIncidentId = inc.id;
    }
  }

  candidates.sort((a, b) => b.confidence - a.confidence);
  const overallConfidence =
    candidates.length === 0
      ? 0.2
      : candidates.slice(0, 3).reduce((s, c) => s + c.confidence, 0) /
        Math.min(3, candidates.length);

  return {
    seedAlertId: alert.id,
    entityKeys,
    candidates,
    suggestedIncidentId,
    overallConfidence,
  };
}

export const correlationApi = {
  async propose(input: {
    alertId?: string;
    incidentId?: string;
    entityIds?: string[];
  }): Promise<CorrelationProposal> {
    await mockDelay(120);
    if (input.alertId) {
      const alert = getAlertFromSession(input.alertId);
      if (!alert) throw new Error(`Alert ${input.alertId} not found`);
      return proposeFromAlert(alert);
    }
    if (input.incidentId) {
      const incident = getIncidentFromSession(input.incidentId);
      if (!incident) throw new Error(`Incident ${input.incidentId} not found`);
      const firstAlertId = incident.alertIds[0];
      if (firstAlertId) {
        const alert = getAlertFromSession(firstAlertId);
        if (alert) {
          const proposal = proposeFromAlert(alert);
          return { ...proposal, seedIncidentId: incident.id };
        }
      }
      return {
        seedIncidentId: incident.id,
        entityKeys: input.entityIds?.map((v) => ({
          kind: "user" as const,
          value: v,
        })) ?? [],
        candidates: [],
        overallConfidence: 0.25,
      };
    }
    throw new Error("alertId or incidentId required");
  },

  async link(input: {
    alertIds: string[];
    incidentId: string;
    confidence?: number;
  }): Promise<{ link: CorrelationLink; receipt: ActionReceipt }> {
    await mockDelay(100);
    const incident = getIncidentFromSession(input.incidentId);
    if (!incident) throw new Error(`Incident ${input.incidentId} not found`);

    const merged = Array.from(
      new Set([...incident.alertIds, ...input.alertIds]),
    );
    await incidentsApi.patch([input.incidentId], { alertIds: merged });

    const link: CorrelationLink = {
      id: `lnk-${Date.now().toString(36)}`,
      fromAlertIds: input.alertIds,
      toIncidentId: input.incidentId,
      confidence: input.confidence ?? 0.8,
      linkedAt: new Date().toISOString(),
    };
    links.set(link.id, link);

    const receipt = makeReceipt({
      outcome: "ok",
      message: `Linked ${input.alertIds.length} alert(s) to ${incident.id}`,
      targetType: "incident",
      targetId: input.incidentId,
      detail: `alerts=${input.alertIds.join(",")}; confidence=${link.confidence}`,
    });
    auditFromReceipt(receipt, "correlation.link", "incident");
    return { link, receipt };
  },

  async merge(input: {
    sourceIncidentIds: string[];
    targetIncidentId: string;
  }): Promise<{ receipt: ActionReceipt; target: SocIncident }> {
    await mockDelay(140);
    const target = getIncidentFromSession(input.targetIncidentId);
    if (!target) throw new Error(`Target ${input.targetIncidentId} not found`);

    const alertIds = new Set(target.alertIds);
    for (const sid of input.sourceIncidentIds) {
      if (sid === input.targetIncidentId) continue;
      const src = getIncidentFromSession(sid);
      if (!src) continue;
      for (const aid of src.alertIds) alertIds.add(aid);
      await incidentsApi.patch([sid], {
        status: "closed",
        summary: `${src.summary}\n[Merged into ${input.targetIncidentId}]`.trim(),
      });
    }
    await incidentsApi.patch([input.targetIncidentId], {
      alertIds: Array.from(alertIds),
    });
    const updated = getIncidentFromSession(input.targetIncidentId);
    if (!updated) throw new Error("Failed to patch target incident");

    mergeHistory.push({
      id: `mrg-${Date.now().toString(36)}`,
      sourceIncidentIds: input.sourceIncidentIds,
      targetIncidentId: input.targetIncidentId,
      at: new Date().toISOString(),
    });

    const receipt = makeReceipt({
      outcome: "ok",
      message: `Merged ${input.sourceIncidentIds.length} case(s) into ${input.targetIncidentId}`,
      targetType: "incident",
      targetId: input.targetIncidentId,
    });
    auditFromReceipt(receipt, "correlation.merge", "incident");
    return { receipt, target: updated };
  },

  async split(input: {
    incidentId: string;
    alertIds: string[];
    newTitle?: string;
  }): Promise<{
    receipt: ActionReceipt;
    newIncidentId: string;
  }> {
    await mockDelay(140);
    const incident = getIncidentFromSession(input.incidentId);
    if (!incident) throw new Error(`Incident ${input.incidentId} not found`);

    const keep = incident.alertIds.filter((id) => !input.alertIds.includes(id));
    await incidentsApi.patch([input.incidentId], { alertIds: keep });

    // Soft-split: create a lightweight twin via patching a closed placeholder
    // In mock mode we stamp a synthetic id and note on the source timeline.
    const newIncidentId = `INC-SPLIT-${Date.now().toString(36).toUpperCase()}`;
    const receipt = makeReceipt({
      outcome: "simulated",
      message: `Split ${input.alertIds.length} alert(s) from ${input.incidentId} → ${newIncidentId}`,
      targetType: "incident",
      targetId: input.incidentId,
      detail: input.newTitle ?? "Split case",
      externalRef: newIncidentId,
    });
    auditFromReceipt(receipt, "correlation.split", "incident");
    return { receipt, newIncidentId };
  },

  async listLinks(): Promise<ListResult<CorrelationLink>> {
    await mockDelay(40);
    const items = Array.from(links.values()).filter((l) => !l.undone);
    return { items, total: items.length };
  },

  async undoLink(linkId: string): Promise<ActionReceipt> {
    await mockDelay(80);
    const link = links.get(linkId);
    if (!link) throw new Error(`Link ${linkId} not found`);
    link.undone = true;
    const incident = getIncidentFromSession(link.toIncidentId);
    if (incident) {
      await incidentsApi.patch([link.toIncidentId], {
        alertIds: incident.alertIds.filter(
          (id) => !link.fromAlertIds.includes(id),
        ),
      });
    }
    const receipt = makeReceipt({
      outcome: "ok",
      message: `Undid correlation link ${linkId}`,
      targetType: "incident",
      targetId: link.toIncidentId,
    });
    auditFromReceipt(receipt, "correlation.undo_link", "incident");
    return receipt;
  },
};

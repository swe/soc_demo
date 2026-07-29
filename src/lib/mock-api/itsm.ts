/**
 * Bi-directional ITSM sync contract (ServiceNow / Jira).
 * Heimdall cases and external tickets stay one system of record.
 */

import type { SocIncident } from "@/components/incidents/incidents-data";
import { getIncidentFromSession } from "@/components/incidents/incidents-session";

import { auditFromReceipt } from "./audit";
import { mockDelay } from "./delay";
import { type ActionReceipt, type ListResult,makeReceipt } from "./types";

export type ItsmProvider = "servicenow" | "jira";

export type ItsmTicketStatus =
  | "new"
  | "in_progress"
  | "pending"
  | "resolved"
  | "closed";

export type ItsmFieldConflictPolicy = "heimdall_wins" | "itsm_wins" | "manual";

export type ItsmFieldMap = {
  title: string;
  status: string;
  priority: string;
  assignee: string;
  notes: string;
};

export type ItsmTicketLink = {
  id: string;
  incidentId: string;
  provider: ItsmProvider;
  connectorId: string;
  externalKey: string;
  externalUrl: string;
  status: ItsmTicketStatus;
  lastSyncAt: string;
  lastSyncDirection: "push" | "pull" | "create";
  fieldMap: ItsmFieldMap;
  conflictPolicy: Record<keyof ItsmFieldMap, ItsmFieldConflictPolicy>;
};

export type ItsmSyncEvent = {
  id: string;
  linkId: string;
  at: string;
  direction: "push" | "pull" | "create";
  summary: string;
  receiptId: string;
};

const DEFAULT_FIELD_MAP: ItsmFieldMap = {
  title: "short_description",
  status: "state",
  priority: "priority",
  assignee: "assigned_to",
  notes: "work_notes",
};

const DEFAULT_POLICY: Record<keyof ItsmFieldMap, ItsmFieldConflictPolicy> = {
  title: "heimdall_wins",
  status: "manual",
  priority: "heimdall_wins",
  assignee: "itsm_wins",
  notes: "heimdall_wins",
};

const links = new Map<string, ItsmTicketLink>();
const syncEvents: ItsmSyncEvent[] = [];

function connectorFor(provider: ItsmProvider): string {
  return provider === "servicenow" ? "int-servicenow" : "int-jira-secops";
}

function mapIncidentStatus(inc: SocIncident): ItsmTicketStatus {
  switch (inc.status) {
    case "new":
      return "new";
    case "investigating":
    case "contained":
      return "in_progress";
    case "resolved":
      return "resolved";
    case "closed":
      return "closed";
    default:
      return "in_progress";
  }
}

function externalKey(provider: ItsmProvider, incidentId: string): string {
  if (provider === "servicenow") {
    return `INC${(hash(incidentId) % 900000) + 100000}`;
  }
  return `SEC-${(hash(incidentId) % 9000) + 1000}`;
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function seedIfEmpty() {
  if (links.size > 0) return;
  const sampleIds = ["INC-1042", "INC-1088", "INC-1101"];
  for (const incidentId of sampleIds) {
    const incident = getIncidentFromSession(incidentId);
    if (!incident) continue;
    const provider: ItsmProvider =
      hash(incidentId) % 2 === 0 ? "servicenow" : "jira";
    const key = externalKey(provider, incidentId);
    const link: ItsmTicketLink = {
      id: `itsm-${incidentId}-${provider}`,
      incidentId,
      provider,
      connectorId: connectorFor(provider),
      externalKey: key,
      externalUrl:
        provider === "servicenow"
          ? `https://svalbard.service-now.com/nav_to.do?uri=incident.do?sysparm_query=number=${key}`
          : `https://svalbard.atlassian.net/browse/${key}`,
      status: mapIncidentStatus(incident),
      lastSyncAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
      lastSyncDirection: "push",
      fieldMap: { ...DEFAULT_FIELD_MAP },
      conflictPolicy: { ...DEFAULT_POLICY },
    };
    links.set(link.id, link);
  }
}

export const itsmApi = {
  async listLinks(incidentId?: string): Promise<ListResult<ItsmTicketLink>> {
    await mockDelay(60);
    seedIfEmpty();
    let items = Array.from(links.values());
    if (incidentId) {
      items = items.filter((l) => l.incidentId === incidentId);
    }
    return { items, total: items.length };
  },

  async create(input: {
    incidentId: string;
    provider: ItsmProvider;
    fieldMap?: Partial<ItsmFieldMap>;
  }): Promise<{ link: ItsmTicketLink; receipt: ActionReceipt }> {
    await mockDelay(160);
    const incident = getIncidentFromSession(input.incidentId);
    if (!incident) throw new Error(`Incident ${input.incidentId} not found`);

    const key = externalKey(input.provider, input.incidentId);
    const link: ItsmTicketLink = {
      id: `itsm-${Date.now().toString(36)}`,
      incidentId: input.incidentId,
      provider: input.provider,
      connectorId: connectorFor(input.provider),
      externalKey: key,
      externalUrl:
        input.provider === "servicenow"
          ? `https://svalbard.service-now.com/nav_to.do?uri=incident.do?sysparm_query=number=${key}`
          : `https://svalbard.atlassian.net/browse/${key}`,
      status: mapIncidentStatus(incident),
      lastSyncAt: new Date().toISOString(),
      lastSyncDirection: "create",
      fieldMap: { ...DEFAULT_FIELD_MAP, ...input.fieldMap },
      conflictPolicy: { ...DEFAULT_POLICY },
    };
    links.set(link.id, link);

    const receipt = makeReceipt({
      outcome: "simulated",
      message: `Created ${input.provider} ticket ${key}`,
      connectorId: link.connectorId,
      connectorName:
        input.provider === "servicenow" ? "ServiceNow ITSM" : "Jira Security",
      targetType: "incident",
      targetId: input.incidentId,
      externalRef: key,
    });
    auditFromReceipt(receipt, "itsm.create", "incident");
    syncEvents.unshift({
      id: `sev-${receipt.id}`,
      linkId: link.id,
      at: receipt.at,
      direction: "create",
      summary: receipt.message,
      receiptId: receipt.id,
    });
    return { link, receipt };
  },

  async link(input: {
    incidentId: string;
    provider: ItsmProvider;
    externalKey: string;
    externalUrl?: string;
  }): Promise<{ link: ItsmTicketLink; receipt: ActionReceipt }> {
    await mockDelay(100);
    const link: ItsmTicketLink = {
      id: `itsm-${Date.now().toString(36)}`,
      incidentId: input.incidentId,
      provider: input.provider,
      connectorId: connectorFor(input.provider),
      externalKey: input.externalKey,
      externalUrl:
        input.externalUrl ??
        (input.provider === "servicenow"
          ? `https://svalbard.service-now.com/incident.do?sysparm_query=number=${input.externalKey}`
          : `https://svalbard.atlassian.net/browse/${input.externalKey}`),
      status: "in_progress",
      lastSyncAt: new Date().toISOString(),
      lastSyncDirection: "pull",
      fieldMap: { ...DEFAULT_FIELD_MAP },
      conflictPolicy: { ...DEFAULT_POLICY },
    };
    links.set(link.id, link);
    const receipt = makeReceipt({
      outcome: "ok",
      message: `Linked ${input.provider} ${input.externalKey}`,
      connectorId: link.connectorId,
      targetType: "incident",
      targetId: input.incidentId,
      externalRef: input.externalKey,
    });
    auditFromReceipt(receipt, "itsm.link", "incident");
    return { link, receipt };
  },

  async syncPush(linkId: string): Promise<{
    link: ItsmTicketLink;
    receipt: ActionReceipt;
  }> {
    await mockDelay(140);
    const link = links.get(linkId);
    if (!link) throw new Error(`ITSM link ${linkId} not found`);
    const incident = getIncidentFromSession(link.incidentId);
    if (incident) {
      link.status = mapIncidentStatus(incident);
    }
    link.lastSyncAt = new Date().toISOString();
    link.lastSyncDirection = "push";
    const receipt = makeReceipt({
      outcome: "simulated",
      message: `Pushed case state → ${link.provider} ${link.externalKey}`,
      connectorId: link.connectorId,
      targetType: "incident",
      targetId: link.incidentId,
      externalRef: link.externalKey,
      detail: `status=${link.status}`,
    });
    auditFromReceipt(receipt, "itsm.sync_push", "incident");
    syncEvents.unshift({
      id: `sev-${receipt.id}`,
      linkId,
      at: receipt.at,
      direction: "push",
      summary: receipt.message,
      receiptId: receipt.id,
    });
    return { link, receipt };
  },

  async syncPull(linkId: string): Promise<{
    link: ItsmTicketLink;
    receipt: ActionReceipt;
  }> {
    await mockDelay(140);
    const link = links.get(linkId);
    if (!link) throw new Error(`ITSM link ${linkId} not found`);
    // Simulate remote status drift
    const remoteStatuses: ItsmTicketStatus[] = [
      "in_progress",
      "pending",
      "resolved",
    ];
    link.status = remoteStatuses[hash(link.lastSyncAt) % remoteStatuses.length]!;
    link.lastSyncAt = new Date().toISOString();
    link.lastSyncDirection = "pull";
    const receipt = makeReceipt({
      outcome: "simulated",
      message: `Pulled ${link.provider} ${link.externalKey} → status ${link.status}`,
      connectorId: link.connectorId,
      targetType: "incident",
      targetId: link.incidentId,
      externalRef: link.externalKey,
    });
    auditFromReceipt(receipt, "itsm.sync_pull", "incident");
    syncEvents.unshift({
      id: `sev-${receipt.id}`,
      linkId,
      at: receipt.at,
      direction: "pull",
      summary: receipt.message,
      receiptId: receipt.id,
    });
    return { link, receipt };
  },

  async update(
    linkId: string,
    patch: Partial<Pick<ItsmTicketLink, "status" | "conflictPolicy" | "fieldMap">>,
  ): Promise<{ link: ItsmTicketLink; receipt: ActionReceipt }> {
    await mockDelay(80);
    const link = links.get(linkId);
    if (!link) throw new Error(`ITSM link ${linkId} not found`);
    if (patch.status) link.status = patch.status;
    if (patch.conflictPolicy) link.conflictPolicy = patch.conflictPolicy;
    if (patch.fieldMap) link.fieldMap = { ...link.fieldMap, ...patch.fieldMap };
    link.lastSyncAt = new Date().toISOString();
    const receipt = makeReceipt({
      outcome: "ok",
      message: `Updated ITSM link ${link.externalKey}`,
      targetType: "incident",
      targetId: link.incidentId,
      externalRef: link.externalKey,
    });
    auditFromReceipt(receipt, "itsm.update", "incident");
    return { link, receipt };
  },

  async listSyncEvents(linkId?: string): Promise<ListResult<ItsmSyncEvent>> {
    await mockDelay(40);
    seedIfEmpty();
    const items = linkId
      ? syncEvents.filter((e) => e.linkId === linkId)
      : syncEvents;
    return { items, total: items.length };
  },
};

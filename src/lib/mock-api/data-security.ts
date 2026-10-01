/**
 * Data Security mock API — consolidator lane over upstream DLP/CASB findings.
 */

import {
  type DataSecurityFinding,
  dataSecurityFindings,
  type DataSecurityFindingStatus,
  dataSecurityPolicies,
  type DataSecurityPolicy,
  type ExfilTimelineEvent,
  exfilTimelineEvents,
  saasAppInventory,
  type SaaSAppInventoryItem,
} from "@/components/data-security/data-security-data";
import { createIncidentFromDataSecurityFinding } from "@/components/incidents/create-from-exposure";
import { attachEvidence } from "@/components/incidents/evidence-locker";
import type { SocIncident } from "@/components/incidents/incidents-data";

import { auditFromReceipt } from "./audit";
import { mockDelay } from "./delay";
import { type ActionReceipt, type ListResult,makeReceipt } from "./types";

export type DataSecurityFindingPatch = Partial<
  Pick<DataSecurityFinding, "status" | "openIncidentId">
>;

const findingsById = new Map<string, DataSecurityFinding>(
  dataSecurityFindings.map((f) => [f.id, { ...f }]),
);

function listFindingsSnapshot(): DataSecurityFinding[] {
  return Array.from(findingsById.values()).sort((a, b) =>
    b.detectedAt.localeCompare(a.detectedAt),
  );
}

export const dataSecurityApi = {
  async listFindings(filters?: {
    kind?: DataSecurityFinding["kind"];
    status?: DataSecurityFindingStatus;
    q?: string;
  }): Promise<ListResult<DataSecurityFinding>> {
    await mockDelay(80);
    let items = listFindingsSnapshot();
    if (filters?.kind) {
      items = items.filter((f) => f.kind === filters.kind);
    }
    if (filters?.status) {
      items = items.filter((f) => f.status === filters.status);
    }
    if (filters?.q?.trim()) {
      const q = filters.q.trim().toLowerCase();
      items = items.filter((item) =>
        [
          item.title,
          item.identityLabel,
          item.channel,
          item.dataClass,
          item.kind,
          item.sourceName,
          item.openIncidentId ?? "",
          item.policyId ?? "",
        ]
          .join(" ")
          .toLowerCase()
          .includes(q),
      );
    }
    return { items, total: items.length };
  },

  async getFinding(id: string): Promise<DataSecurityFinding | null> {
    await mockDelay(60);
    return findingsById.get(id) ?? null;
  },

  async patchFinding(
    id: string,
    patch: DataSecurityFindingPatch,
  ): Promise<ActionReceipt> {
    await mockDelay(120);
    const current = findingsById.get(id);
    if (!current) {
      const receipt = makeReceipt({
        outcome: "failed",
        message: `Data security finding ${id} not found`,
        targetType: "data_security_finding",
        targetId: id,
      });
      auditFromReceipt(receipt, "data_security.patch", "data_security");
      return receipt;
    }

    const next: DataSecurityFinding = {
      ...current,
      ...patch,
    };
    findingsById.set(id, next);

    const receipt = makeReceipt({
      outcome: "ok",
      message: `Updated data security finding ${id}`,
      targetType: "data_security_finding",
      targetId: id,
      detail: [
        patch.status ? `status=${patch.status}` : null,
        patch.openIncidentId ? `incident=${patch.openIncidentId}` : null,
      ]
        .filter(Boolean)
        .join("; "),
    });
    auditFromReceipt(receipt, "data_security.patch", "data_security");
    return receipt;
  },

  async openIncident(
    findingId: string,
  ): Promise<{
    incident: SocIncident | null;
    finding: DataSecurityFinding | null;
    receipt: ActionReceipt;
  }> {
    await mockDelay(200);
    const finding = findingsById.get(findingId) ?? null;
    if (!finding) {
      const receipt = makeReceipt({
        outcome: "failed",
        message: `Data security finding ${findingId} not found`,
        targetType: "data_security_finding",
        targetId: findingId,
      });
      auditFromReceipt(receipt, "data_security.open_incident", "incident");
      return { incident: null, finding: null, receipt };
    }

    if (finding.openIncidentId) {
      const receipt = makeReceipt({
        outcome: "simulated",
        message: `Finding ${findingId} already linked to ${finding.openIncidentId}`,
        targetType: "incident",
        targetId: finding.openIncidentId,
        detail: `ds=${findingId}`,
      });
      auditFromReceipt(receipt, "data_security.open_incident", "incident");
      return { incident: null, finding, receipt };
    }

    const { incident, evidenceId } =
      await createIncidentFromDataSecurityFinding(finding);
    attachEvidence(incident.id, evidenceId);

    const updated: DataSecurityFinding = {
      ...finding,
      openIncidentId: incident.id,
      status:
        finding.status === "closed" || finding.status === "contained"
          ? finding.status
          : "investigating",
    };
    findingsById.set(finding.id, updated);

    const receipt = makeReceipt({
      outcome: "ok",
      message: `Opened incident ${incident.id} from ${finding.id}`,
      targetType: "incident",
      targetId: incident.id,
      detail: `ds=${finding.id}; kind=${finding.kind}`,
      connectorId: finding.sourceId,
      connectorName: finding.sourceName,
    });
    auditFromReceipt(receipt, "data_security.open_incident", "incident");
    return { incident, finding: updated, receipt };
  },

  async listPolicies(): Promise<ListResult<DataSecurityPolicy>> {
    await mockDelay(70);
    return {
      items: dataSecurityPolicies,
      total: dataSecurityPolicies.length,
    };
  },

  async listSaasApps(filters?: {
    sanction?: SaaSAppInventoryItem["sanction"];
  }): Promise<ListResult<SaaSAppInventoryItem>> {
    await mockDelay(70);
    let items = [...saasAppInventory];
    if (filters?.sanction) {
      items = items.filter((a) => a.sanction === filters.sanction);
    }
    return { items, total: items.length };
  },

  async listTimeline(filters?: {
    findingId?: string;
  }): Promise<ListResult<ExfilTimelineEvent>> {
    await mockDelay(70);
    let items = [...exfilTimelineEvents].sort((a, b) =>
      b.at.localeCompare(a.at),
    );
    if (filters?.findingId) {
      items = items.filter((e) => e.findingId === filters.findingId);
    }
    return { items, total: items.length };
  },
};

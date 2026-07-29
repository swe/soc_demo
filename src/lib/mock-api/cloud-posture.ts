import type {
  CloudFinding,
  CloudFindingStatus,
} from "@/components/cloud-posture/cloud-posture-data";
import {
  bulkPatchCloudFindingStatus,
  getSessionCloudFinding,
  getSessionCloudFindings,
  patchCloudFindingStatus,
} from "@/components/cloud-posture/cloud-posture-session";
import { createIncidentFromCloudFinding } from "@/components/incidents/create-from-exposure";
import { attachEvidence } from "@/components/incidents/evidence-locker";
import type { SocIncident } from "@/components/incidents/incidents-data";

import { auditFromReceipt } from "./audit";
import { mockDelay } from "./delay";
import { type ActionReceipt, type ListResult,makeReceipt } from "./types";

export type CloudFindingPatch = Partial<Pick<CloudFinding, "status">>;

export const cloudPostureApi = {
  async list(): Promise<ListResult<CloudFinding>> {
    await mockDelay(80);
    const items = getSessionCloudFindings();
    return { items, total: items.length };
  },

  async get(id: string): Promise<CloudFinding | null> {
    await mockDelay(60);
    return getSessionCloudFinding(id);
  },

  async patch(
    id: string,
    patch: CloudFindingPatch,
  ): Promise<ActionReceipt> {
    await mockDelay(120);
    if (patch.status) {
      patchCloudFindingStatus(id, patch.status);
    }
    const receipt = makeReceipt({
      outcome: "ok",
      message: `Updated cloud finding ${id}`,
      targetType: "cloud_finding",
      targetId: id,
      detail: patch.status ? `status=${patch.status}` : undefined,
    });
    auditFromReceipt(receipt, "cloud_posture.patch", "cloud_finding");
    return receipt;
  },

  async bulkPatch(
    ids: Iterable<string>,
    status: CloudFindingStatus,
  ): Promise<ActionReceipt> {
    await mockDelay(160);
    const count = bulkPatchCloudFindingStatus(ids, status);
    const receipt = makeReceipt({
      outcome: "ok",
      message: `Updated ${count} cloud finding${count === 1 ? "" : "s"} → ${status}`,
      targetType: "cloud_finding",
      targetId: "bulk",
    });
    auditFromReceipt(receipt, "cloud_posture.bulk_patch", "cloud_finding");
    return receipt;
  },

  patchSync(id: string, status: CloudFindingStatus): ActionReceipt {
    patchCloudFindingStatus(id, status);
    const receipt = makeReceipt({
      outcome: "ok",
      message: `Updated cloud finding ${id} → ${status}`,
      targetType: "cloud_finding",
      targetId: id,
    });
    auditFromReceipt(receipt, "cloud_posture.patch", "cloud_finding");
    return receipt;
  },

  async openIncident(
    finding: CloudFinding,
  ): Promise<{ incident: SocIncident; receipt: ActionReceipt }> {
    await mockDelay(200);
    const { incident, evidenceId } =
      await createIncidentFromCloudFinding(finding);
    attachEvidence(incident.id, evidenceId);
    const receipt = makeReceipt({
      outcome: "ok",
      message: `Opened incident ${incident.id} from ${finding.id}`,
      targetType: "incident",
      targetId: incident.id,
      detail: `cspm=${finding.id}`,
    });
    auditFromReceipt(receipt, "cloud_posture.open_incident", "incident");
    return { incident, receipt };
  },
};

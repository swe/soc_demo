import type {
  ComplianceCollector,
  ComplianceControl,
  ComplianceFinding,
  ContinuousProbe,
  ControlStatus,
  FindingStatus,
  FrameworkId,
} from "@/components/compliance/compliance-data";
import { toContinuousProbe } from "@/components/compliance/compliance-data";
import {
  exportEvidencePack,
  getSessionCollectors,
  getSessionControls,
  getSessionFindings,
  patchControlStatus,
  patchFindingStatus,
  requestEvidenceForControls,
  retestControls,
  runCollectors,
} from "@/components/compliance/compliance-session";

import { auditFromReceipt } from "./audit";
import { mockDelay } from "./delay";
import { type ActionReceipt, type ListResult,makeReceipt } from "./types";

export type ControlPatch = Partial<Pick<ComplianceControl, "status">>;
export type FindingPatch = Partial<Pick<ComplianceFinding, "status">>;

export const complianceApi = {
  async listControls(): Promise<ListResult<ComplianceControl>> {
    await mockDelay(80);
    const items = getSessionControls();
    return { items, total: items.length };
  },

  async listFindings(): Promise<ListResult<ComplianceFinding>> {
    await mockDelay(80);
    const items = getSessionFindings();
    return { items, total: items.length };
  },

  async listProbes(): Promise<ListResult<ContinuousProbe>> {
    await mockDelay(60);
    const items = getSessionCollectors().map(toContinuousProbe);
    return { items, total: items.length };
  },

  async listCollectors(): Promise<ListResult<ComplianceCollector>> {
    await mockDelay(60);
    const items = getSessionCollectors();
    return { items, total: items.length };
  },

  async getControl(id: string): Promise<ComplianceControl | null> {
    await mockDelay(60);
    return getSessionControls().find((c) => c.id === id) ?? null;
  },

  async getFinding(id: string): Promise<ComplianceFinding | null> {
    await mockDelay(60);
    return getSessionFindings().find((f) => f.id === id) ?? null;
  },

  async patchControl(
    id: string,
    patch: ControlPatch,
  ): Promise<ActionReceipt> {
    await mockDelay(120);
    if (patch.status) {
      patchControlStatus(id, patch.status);
    }
    const receipt = makeReceipt({
      outcome: "ok",
      message: `Updated control ${id}`,
      targetType: "compliance",
      targetId: id,
      detail: patch.status ? `status=${patch.status}` : undefined,
    });
    auditFromReceipt(receipt, "compliance.control_patch", "compliance");
    return receipt;
  },

  async patchFinding(
    id: string,
    patch: FindingPatch,
  ): Promise<ActionReceipt> {
    await mockDelay(120);
    if (patch.status) {
      patchFindingStatus(id, patch.status);
    }
    const receipt = makeReceipt({
      outcome: "ok",
      message: `Updated finding ${id}`,
      targetType: "compliance",
      targetId: id,
      detail: patch.status ? `status=${patch.status}` : undefined,
    });
    auditFromReceipt(receipt, "compliance.finding_patch", "compliance");
    return receipt;
  },

  async retest(ids: Iterable<string>): Promise<ActionReceipt> {
    await mockDelay(160);
    const count = retestControls(ids);
    const receipt = makeReceipt({
      outcome: "ok",
      message: `Queued retest for ${count} control${count === 1 ? "" : "s"}`,
      targetType: "compliance",
      targetId: "bulk",
    });
    auditFromReceipt(receipt, "compliance.retest", "compliance");
    return receipt;
  },

  async requestEvidence(ids: Iterable<string>): Promise<ActionReceipt> {
    await mockDelay(140);
    const count = requestEvidenceForControls(ids);
    const receipt = makeReceipt({
      outcome: "ok",
      message: `Requested evidence for ${count} control${count === 1 ? "" : "s"}`,
      targetType: "compliance",
      targetId: "bulk",
    });
    auditFromReceipt(receipt, "compliance.evidence_request", "compliance");
    return receipt;
  },

  async runCollectors(
    collectorIds?: string[],
  ): Promise<{
    receipt: ActionReceipt;
    result: { collectors: number; evidence: number; controls: number };
  }> {
    await mockDelay(420);
    const result = runCollectors(collectorIds);
    const receipt = makeReceipt({
      outcome: "ok",
      message: `CCM run · ${result.collectors} collectors refreshed ${result.evidence} evidence across ${result.controls} controls`,
      targetType: "compliance",
      targetId: "ccm",
      detail: `collectors=${result.collectors}`,
    });
    auditFromReceipt(receipt, "compliance.collectors_run", "compliance");
    return { receipt, result };
  },

  /** Run a single continuous GRC probe (CCM collector) and return a receipt. */
  async runProbe(probeId: string): Promise<{
    receipt: ActionReceipt;
    probe: ContinuousProbe | null;
  }> {
    await mockDelay(280);
    const before = getSessionCollectors().find((c) => c.id === probeId) ?? null;
    if (!before) {
      const receipt = makeReceipt({
        outcome: "failed",
        message: `Probe ${probeId} not found`,
        targetType: "compliance",
        targetId: probeId,
      });
      auditFromReceipt(receipt, "compliance.probe_run", "compliance");
      return { receipt, probe: null };
    }
    runCollectors([probeId]);
    const after =
      getSessionCollectors().find((c) => c.id === probeId) ?? before;
    const probe = toContinuousProbe(after);
    const receipt = makeReceipt({
      outcome: "ok",
      message: `Probe “${probe.name}” completed for ${probe.controlId}`,
      targetType: "compliance",
      targetId: probeId,
      detail: `controlId=${probe.controlId}; status=${probe.status}; lastRun=${probe.lastRun}`,
      connectorId: after.sourceId,
      connectorName: after.sourceId,
    });
    auditFromReceipt(receipt, "compliance.probe_run", "compliance");
    return { receipt, probe };
  },

  async exportAuditorPack(
    frameworkId: FrameworkId | "all" = "all",
  ): Promise<{
    receipt: ActionReceipt;
    result: { controls: number; evidence: number; findings: number };
  }> {
    await mockDelay(180);
    const result = exportEvidencePack(frameworkId);
    const receipt = makeReceipt({
      outcome: "ok",
      message: `Auditor pack exported · ${result.controls} controls · ${result.evidence} evidence · ${result.findings} findings`,
      targetType: "compliance",
      targetId: frameworkId === "all" ? "auditor-pack" : frameworkId,
      detail: `framework=${frameworkId}`,
      externalRef: `pack-${Date.now().toString(36)}`,
    });
    auditFromReceipt(receipt, "compliance.auditor_pack_export", "export");
    return { receipt, result };
  },

  /** Sync path for UI handlers that cannot await. */
  patchFindingSync(id: string, status: FindingStatus): ActionReceipt {
    patchFindingStatus(id, status);
    const receipt = makeReceipt({
      outcome: "ok",
      message: `Updated finding ${id} → ${status}`,
      targetType: "compliance",
      targetId: id,
    });
    auditFromReceipt(receipt, "compliance.finding_patch", "compliance");
    return receipt;
  },

  patchControlSync(id: string, status: ControlStatus): ActionReceipt {
    patchControlStatus(id, status);
    const receipt = makeReceipt({
      outcome: "ok",
      message: `Updated control ${id} → ${status}`,
      targetType: "compliance",
      targetId: id,
    });
    auditFromReceipt(receipt, "compliance.control_patch", "compliance");
    return receipt;
  },
};

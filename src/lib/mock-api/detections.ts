import { appendSessionActivity } from "@/components/administration/integrations-session";
import {
  type DetectionDeployRecord,
  type DetectionDeployState,
  type DetectionRule,
  type DetectionStatus,
  type DetectionTestHit,
  testRuleAgainstAlertCorpus,
} from "@/components/detections/detections-data";
import {
  applyDetectionDeploy,
  cloneDetection,
  getDetectionsFromSession,
  importDetectionPack,
  setDetectionStatus,
  upsertDetection,
} from "@/components/detections/detections-session";
import {
  createHuntFromDetection,
  getHuntFromSession,
  type PromoteDetectionResult,
} from "@/components/threats/threat-session";
import type { Hunt } from "@/components/threats/threat-shared-data";
import { getTelemetrySource } from "@/lib/source-registry";

import { auditFromReceipt } from "./audit";
import { mockDelay } from "./delay";
import { type ActionReceipt, type ListResult,makeReceipt } from "./types";

function getRule(id: string): DetectionRule | null {
  return getDetectionsFromSession().find((rule) => rule.id === id) ?? null;
}

function pushHistory(
  rule: DetectionRule,
  record: Omit<DetectionDeployRecord, "id">,
): DetectionDeployRecord[] {
  const entry: DetectionDeployRecord = {
    id: `dep-${Date.now().toString(36)}`,
    ...record,
  };
  return [entry, ...rule.deployHistory].slice(0, 20);
}

function resolveSourceId(rule: DetectionRule, sourceId?: string) {
  return sourceId ?? rule.enabledSourceIds[0] ?? "int-splunk-core";
}

export const detectionsApi = {
  async list(): Promise<ListResult<DetectionRule>> {
    await mockDelay(60);
    const items = getDetectionsFromSession();
    return { items, total: items.length };
  },

  async get(id: string): Promise<DetectionRule | null> {
    await mockDelay(40);
    return getRule(id);
  },

  async setStatus(
    id: string,
    status: DetectionStatus,
  ): Promise<{ rule: DetectionRule | null; receipt: ActionReceipt }> {
    await mockDelay(120);
    const rule = setDetectionStatus(id, status);
    const receipt = makeReceipt({
      outcome: rule ? "ok" : "failed",
      message: rule
        ? `Detection ${id} → ${status}`
        : `Detection ${id} not found`,
      targetType: "detection",
      targetId: id,
      detail: rule ? `status=${status}` : undefined,
    });
    if (rule) auditFromReceipt(receipt, "detection.status_changed", "detection");
    return { rule, receipt };
  },

  async testAgainstCorpus(
    id: string,
  ): Promise<{
    rule: DetectionRule | null;
    hits: DetectionTestHit[];
    receipt: ActionReceipt;
  }> {
    await mockDelay(220);
    const rule = getRule(id);
    if (!rule) {
      const receipt = makeReceipt({
        outcome: "failed",
        message: `Detection ${id} not found`,
        targetType: "detection",
        targetId: id,
      });
      return { rule: null, hits: [], receipt };
    }
    const hits = testRuleAgainstAlertCorpus(rule);
    const receipt = makeReceipt({
      outcome: "ok",
      message: `Corpus test · ${hits.length} hit(s) for ${rule.id}`,
      targetType: "detection",
      targetId: id,
      detail: `technique=${rule.mitreTechnique}`,
    });
    auditFromReceipt(receipt, "detection.corpus_test", "detection");
    return { rule, hits, receipt };
  },

  async updateRuleBody(
    id: string,
    ruleBody: string,
  ): Promise<{ rule: DetectionRule | null; receipt: ActionReceipt }> {
    await mockDelay(100);
    const current = getRule(id);
    if (!current) {
      return {
        rule: null,
        receipt: makeReceipt({
          outcome: "failed",
          message: `Detection ${id} not found`,
          targetType: "detection",
          targetId: id,
        }),
      };
    }
    const rule = upsertDetection({
      ...current,
      ruleBody,
      deployState:
        current.deployState === "deployed" ? "staged" : current.deployState,
    });
    const receipt = makeReceipt({
      outcome: "ok",
      message: `Updated rule body for ${id}`,
      targetType: "detection",
      targetId: id,
      detail: ruleBody.slice(0, 80),
    });
    auditFromReceipt(receipt, "detection.rule_body_updated", "detection");
    return { rule, receipt };
  },

  async clone(
    id: string,
  ): Promise<{ rule: DetectionRule | null; receipt: ActionReceipt }> {
    await mockDelay(120);
    const rule = cloneDetection(id);
    const receipt = makeReceipt({
      outcome: rule ? "ok" : "failed",
      message: rule
        ? `Cloned ${id} → ${rule.id}`
        : `Detection ${id} not found`,
      targetType: "detection",
      targetId: rule?.id ?? id,
      detail: rule ? `source=${id}` : undefined,
    });
    if (rule) auditFromReceipt(receipt, "detection.cloned", "detection");
    return { rule, receipt };
  },

  async stageDeploy(
    id: string,
    sourceId?: string,
  ): Promise<{ rule: DetectionRule | null; receipt: ActionReceipt }> {
    await mockDelay(180);
    const current = getRule(id);
    if (!current) {
      return {
        rule: null,
        receipt: makeReceipt({
          outcome: "failed",
          message: `Detection ${id} not found`,
          targetType: "detection",
          targetId: id,
        }),
      };
    }
    const targetId = resolveSourceId(current, sourceId);
    const source = getTelemetrySource(targetId);
    const at = new Date().toISOString();
    const version = current.deployVersion + 1;
    const history = pushHistory(current, {
      sourceId: targetId,
      sourceName: source?.shortName ?? targetId,
      stage: "staged",
      at,
      version,
      detail: "Packaged Heimdall QL + lineage for SIEM push",
    });
    const rule = applyDetectionDeploy(id, {
      deployState: "staged",
      lastDeployAt: at,
      deployVersion: version,
      deployHistory: history,
    });
    const receipt = makeReceipt({
      outcome: "ok",
      message: `Staged ${id} → ${source?.shortName ?? targetId} (v${version})`,
      connectorId: targetId,
      connectorName: source?.name ?? targetId,
      targetType: "detection",
      targetId: id,
      detail: `stage=staged · version=${version}`,
    });
    auditFromReceipt(receipt, "detection.deploy_staged", "detection");
    appendSessionActivity({
      integrationId: targetId,
      kind: "sync",
      title: "Detection staged",
      detail: `${id} packaged for deploy (v${version})`,
    });
    return { rule, receipt };
  },

  async validateDeploy(
    id: string,
  ): Promise<{
    rule: DetectionRule | null;
    hits: DetectionTestHit[];
    receipt: ActionReceipt;
  }> {
    await mockDelay(240);
    const current = getRule(id);
    if (!current) {
      return {
        rule: null,
        hits: [],
        receipt: makeReceipt({
          outcome: "failed",
          message: `Detection ${id} not found`,
          targetType: "detection",
          targetId: id,
        }),
      };
    }
    if (
      current.deployState !== "staged" &&
      current.deployState !== "validated"
    ) {
      return {
        rule: current,
        hits: [],
        receipt: makeReceipt({
          outcome: "failed",
          message: `Stage the detection before validating (current: ${current.deployState})`,
          targetType: "detection",
          targetId: id,
        }),
      };
    }
    const hits = testRuleAgainstAlertCorpus(current);
    const targetId = resolveSourceId(current);
    const source = getTelemetrySource(targetId);
    const at = new Date().toISOString();
    const history = pushHistory(current, {
      sourceId: targetId,
      sourceName: source?.shortName ?? targetId,
      stage: "validated",
      at,
      version: current.deployVersion,
      detail: `Corpus gate · ${hits.length} hit(s)`,
    });
    const rule = applyDetectionDeploy(id, {
      deployState: "validated",
      lastDeployAt: at,
      deployHistory: history,
    });
    const receipt = makeReceipt({
      outcome: "ok",
      message: `Validated ${id} · ${hits.length} corpus hit(s)`,
      connectorId: targetId,
      connectorName: source?.name ?? targetId,
      targetType: "detection",
      targetId: id,
      detail: `stage=validated · hits=${hits.length}`,
    });
    auditFromReceipt(receipt, "detection.deploy_validated", "detection");
    return { rule, hits, receipt };
  },

  async pushDeploy(
    id: string,
    sourceId?: string,
  ): Promise<{ rule: DetectionRule | null; receipt: ActionReceipt }> {
    await mockDelay(320);
    const current = getRule(id);
    if (!current) {
      return {
        rule: null,
        receipt: makeReceipt({
          outcome: "failed",
          message: `Detection ${id} not found`,
          targetType: "detection",
          targetId: id,
        }),
      };
    }
    if (
      current.deployState !== "validated" &&
      current.deployState !== "staged" &&
      current.deployState !== "deployed"
    ) {
      return {
        rule: current,
        receipt: makeReceipt({
          outcome: "failed",
          message: `Validate (or stage) before push (current: ${current.deployState})`,
          targetType: "detection",
          targetId: id,
        }),
      };
    }
    const targetId = resolveSourceId(current, sourceId);
    const source = getTelemetrySource(targetId);
    const at = new Date().toISOString();
    const deployedSourceIds = Array.from(
      new Set([...current.deployedSourceIds, targetId]),
    );
    const history = pushHistory(current, {
      sourceId: targetId,
      sourceName: source?.shortName ?? targetId,
      stage: "deployed",
      at,
      version: current.deployVersion,
      detail: "Pushed SPL/KQL lineage package to connector",
    });
    const rule = applyDetectionDeploy(id, {
      deployState: "deployed",
      deployedSourceIds,
      lastDeployAt: at,
      deployHistory: history,
      status: "enabled",
    });
    const receipt = makeReceipt({
      outcome: "simulated",
      message: `Deployed ${id} → ${source?.shortName ?? targetId} (v${current.deployVersion})`,
      connectorId: targetId,
      connectorName: source?.name ?? targetId,
      targetType: "detection",
      targetId: id,
      detail:
        "push · contract: POST /v1/detections/{id}/deploy { sourceId, ruleBody, lineage }",
      externalRef: `siem-rule-${id}-v${current.deployVersion}`,
    });
    auditFromReceipt(receipt, "detection.deploy_pushed", "detection");
    appendSessionActivity({
      integrationId: targetId,
      kind: "sync",
      title: "Detection deployed",
      detail: `${id} pushed (v${current.deployVersion}) · ${receipt.externalRef}`,
    });
    return { rule, receipt };
  },

  async rollbackDeploy(
    id: string,
  ): Promise<{ rule: DetectionRule | null; receipt: ActionReceipt }> {
    await mockDelay(200);
    const current = getRule(id);
    if (!current) {
      return {
        rule: null,
        receipt: makeReceipt({
          outcome: "failed",
          message: `Detection ${id} not found`,
          targetType: "detection",
          targetId: id,
        }),
      };
    }
    const targetId = resolveSourceId(current, current.deployedSourceIds[0]);
    const source = getTelemetrySource(targetId);
    const at = new Date().toISOString();
    const history = pushHistory(current, {
      sourceId: targetId,
      sourceName: source?.shortName ?? targetId,
      stage: "rolled_back",
      at,
      version: current.deployVersion,
      detail: "Rolled back remote package; rule set experimental",
    });
    const rule = applyDetectionDeploy(id, {
      deployState: "rolled_back",
      deployedSourceIds: [],
      lastDeployAt: at,
      deployHistory: history,
      status: "experimental",
    });
    const receipt = makeReceipt({
      outcome: "ok",
      message: `Rolled back ${id} from ${source?.shortName ?? targetId}`,
      connectorId: targetId,
      connectorName: source?.name ?? targetId,
      targetType: "detection",
      targetId: id,
    });
    auditFromReceipt(receipt, "detection.deploy_rollback", "detection");
    appendSessionActivity({
      integrationId: targetId,
      kind: "sync",
      title: "Detection rolled back",
      detail: `${id} removed from SIEM package`,
    });
    return { rule, receipt };
  },

  /** Convenience: stage → validate → push (legacy one-click). */
  async deployToSource(
    id: string,
    sourceId?: string,
  ): Promise<{ rule: DetectionRule | null; receipt: ActionReceipt }> {
    const staged = await this.stageDeploy(id, sourceId);
    if (!staged.rule || staged.receipt.outcome === "failed") return staged;
    const validated = await this.validateDeploy(id);
    if (!validated.rule || validated.receipt.outcome === "failed") {
      return { rule: validated.rule, receipt: validated.receipt };
    }
    return this.pushDeploy(id, sourceId);
  },

  async promoteToHunt(
    id: string,
  ): Promise<{
    rule: DetectionRule | null;
    hunt: Hunt | null;
    receipt: ActionReceipt;
  }> {
    await mockDelay(160);
    const result: PromoteDetectionResult | null = createHuntFromDetection(id);
    if (!result) {
      return {
        rule: null,
        hunt: null,
        receipt: makeReceipt({
          outcome: "failed",
          message: `Detection ${id} not found`,
          targetType: "detection",
          targetId: id,
        }),
      };
    }
    const receipt = makeReceipt({
      outcome: "ok",
      message: `Promoted ${id} → hunt ${result.hunt.id}`,
      targetType: "hunt",
      targetId: result.hunt.id,
      detail: `from_detection=${id}`,
    });
    auditFromReceipt(receipt, "detection.promote_to_hunt", "hunt");
    return { rule: result.detection, hunt: result.hunt, receipt };
  },

  getHunt(id: string): Hunt | null {
    return getHuntFromSession(id);
  },

  async importPack(
    packId: string,
  ): Promise<{
    pack: { id: string; name: string; ruleCount: number } | null;
    added: number;
    catalogTotal: number;
    alreadyImported: boolean;
    receipt: ActionReceipt;
  }> {
    await mockDelay(180);
    const result = importDetectionPack(packId);
    if (!result) {
      return {
        pack: null,
        added: 0,
        catalogTotal: getDetectionsFromSession().length,
        alreadyImported: false,
        receipt: makeReceipt({
          outcome: "failed",
          message: `Pack ${packId} not found`,
          targetType: "detection-pack",
          targetId: packId,
        }),
      };
    }

    const catalogTotal = getDetectionsFromSession().length;
    if (result.alreadyImported) {
      const receipt = makeReceipt({
        outcome: "ok",
        message: `Pack ${result.packName} already imported (0 new rules)`,
        targetType: "detection-pack",
        targetId: result.packId,
        detail: `catalog=${catalogTotal}`,
        externalRef: `mkt-${result.packId}`,
      });
      return {
        pack: {
          id: result.packId,
          name: result.packName,
          ruleCount: 0,
        },
        added: 0,
        catalogTotal,
        alreadyImported: true,
        receipt,
      };
    }

    const receipt = makeReceipt({
      outcome: "ok",
      message: `Imported pack ${result.packName} (${result.added} rules staged)`,
      targetType: "detection-pack",
      targetId: result.packId,
      detail: `rules=${result.added}; catalog=${catalogTotal}`,
      externalRef: `mkt-${result.packId}`,
    });
    auditFromReceipt(receipt, "detection.pack_imported", "detection");
    appendSessionActivity({
      integrationId: "int-splunk-core",
      kind: "sync",
      title: "Detection pack imported",
      detail: `${result.packName} · ${result.added} rules · catalog ${catalogTotal}`,
    });
    return {
      pack: {
        id: result.packId,
        name: result.packName,
        ruleCount: result.added,
      },
      added: result.added,
      catalogTotal,
      alreadyImported: false,
      receipt,
    };
  },
};

export type { DetectionDeployState };

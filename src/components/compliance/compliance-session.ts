"use client";

import { useMemo, useSyncExternalStore } from "react";

import { appendAuditLog } from "@/components/audit/audit-log-data";
import { currentProfile } from "@/components/profile/profile-data";
import { downloadCsv } from "@/lib/download-csv";
import { downloadTextFile } from "@/components/knowledge-base/download-text-file";

import {
  type ComplianceControl,
  type ComplianceFinding,
  type ControlStatus,
  type FindingStatus,
  type FrameworkId,
  complianceControls as seedControls,
  complianceEvidence,
  complianceFindings as seedFindings,
  controlStatusLabels,
  findingStatusLabels,
  frameworkById,
} from "./compliance-data";

type ComplianceStore = {
  controls: Map<string, ComplianceControl>;
  findings: Map<string, ComplianceFinding>;
};

function seedStore(): ComplianceStore {
  return {
    controls: new Map(seedControls.map((control) => [control.id, control])),
    findings: new Map(seedFindings.map((finding) => [finding.id, finding])),
  };
}

let store: ComplianceStore = seedStore();
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function setStore(next: ComplianceStore) {
  store = next;
  emit();
}

export function subscribeComplianceSession(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getComplianceSessionSnapshot() {
  return store;
}

export function getSessionControls(): ComplianceControl[] {
  return Array.from(store.controls.values());
}

export function getSessionFindings(): ComplianceFinding[] {
  return Array.from(store.findings.values());
}

export function patchControlStatus(
  id: string,
  status: ControlStatus,
): ComplianceControl | null {
  const current = store.controls.get(id);
  if (!current || current.status === status) {
    return current ?? null;
  }

  const next: ComplianceControl = { ...current, status };
  const controls = new Map(store.controls);
  controls.set(id, next);
  setStore({ ...store, controls });

  appendAuditLog({
    actorId: currentProfile.id,
    actorName: currentProfile.name,
    action: "compliance.control_status",
    targetType: "compliance",
    targetId: id,
    detail: `${current.code}: ${current.status} → ${status}`,
  });

  return next;
}

export function patchFindingStatus(
  id: string,
  status: FindingStatus,
): ComplianceFinding | null {
  const current = store.findings.get(id);
  if (!current || current.status === status) {
    return current ?? null;
  }

  const next: ComplianceFinding = { ...current, status };
  const findings = new Map(store.findings);
  findings.set(id, next);
  setStore({ ...store, findings });

  appendAuditLog({
    actorId: currentProfile.id,
    actorName: currentProfile.name,
    action: "compliance.finding_status",
    targetType: "compliance",
    targetId: id,
    detail: `${current.title}: ${current.status} → ${status}`,
  });

  return next;
}

export function retestControls(ids: Iterable<string>): number {
  let count = 0;
  for (const id of ids) {
    if (patchControlStatus(id, "pending")) count += 1;
  }
  return count;
}

export function requestEvidenceForControls(ids: Iterable<string>): number {
  let count = 0;
  const controls = new Map(store.controls);
  for (const id of ids) {
    const current = controls.get(id);
    if (!current) continue;
    controls.set(id, {
      ...current,
      evidenceStatus:
        current.evidenceStatus === "current" ? "expiring" : "missing",
      lastCheckedLabel: "Evidence requested · just now",
      lastCheckedValue: Date.now(),
    });
    count += 1;
  }
  if (count === 0) return 0;
  setStore({ ...store, controls });
  appendAuditLog({
    actorId: currentProfile.id,
    actorName: currentProfile.name,
    action: "compliance.evidence_requested",
    targetType: "compliance",
    targetId: "bulk",
    detail: `Requested evidence for ${count} controls`,
  });
  return count;
}

export function exportSelectedControls(ids: Iterable<string>) {
  const idSet = new Set(ids);
  const controls = getSessionControls().filter((control) =>
    idSet.has(control.id),
  );
  const date = new Date().toISOString().slice(0, 10);
  downloadCsv({
    filename: `heimdall-controls-selection-${date}.csv`,
    headers: [
      "id",
      "code",
      "title",
      "status",
      "evidenceStatus",
      "riskScore",
      "ownerId",
    ],
    rows: controls.map((control) => [
      control.id,
      control.code,
      control.title,
      control.status,
      control.evidenceStatus,
      String(control.riskScore),
      control.ownerId,
    ]),
  });
  appendAuditLog({
    actorId: currentProfile.id,
    actorName: currentProfile.name,
    action: "export.controls_selection",
    targetType: "export",
    targetId: "compliance",
    detail: `Exported ${controls.length} selected controls`,
  });
  return controls.length;
}

export function exportEvidencePack(frameworkId: FrameworkId | "all") {
  const controls = getSessionControls().filter(
    (control) =>
      frameworkId === "all" || control.frameworks.includes(frameworkId),
  );
  const findings = getSessionFindings().filter(
    (finding) =>
      frameworkId === "all" || finding.frameworks.includes(frameworkId),
  );
  const controlCodes = new Set(controls.map((control) => control.code));
  const evidence = complianceEvidence.filter((item) =>
    controlCodes.has(item.controlCode),
  );

  const label =
    frameworkId === "all"
      ? "all-frameworks"
      : (frameworkById.get(frameworkId)?.shortName ?? frameworkId).toLowerCase();
  const date = new Date().toISOString().slice(0, 10);

  downloadCsv({
    filename: `heimdall-evidence-pack-${label}-${date}.csv`,
    headers: [
      "kind",
      "id",
      "code",
      "title",
      "status",
      "frameworks",
      "owner",
      "detail",
    ],
    rows: [
      ...controls.map((control) => [
        "control",
        control.id,
        control.code,
        control.title,
        controlStatusLabels[control.status],
        control.frameworks.join("|"),
        control.ownerId,
        control.evidenceStatus,
      ]),
      ...evidence.map((item) => [
        "evidence",
        item.id,
        item.controlCode,
        item.name,
        item.status,
        item.frameworks.join("|"),
        item.ownerId,
        item.kind,
      ]),
      ...findings.map((finding) => [
        "finding",
        finding.id,
        finding.controlCode,
        finding.title,
        findingStatusLabels[finding.status],
        finding.frameworks.join("|"),
        finding.ownerId,
        finding.detail,
      ]),
    ],
  });

  const markdown = [
    `# Evidence pack — ${label}`,
    ``,
    `Generated ${new Date().toISOString()} by ${currentProfile.name}`,
    ``,
    `## Controls (${controls.length})`,
    ...controls.map(
      (control) =>
        `- **${control.code}** ${control.title} — ${controlStatusLabels[control.status]} (${control.evidenceStatus})`,
    ),
    ``,
    `## Evidence (${evidence.length})`,
    ...evidence.map(
      (item) => `- **${item.name}** · ${item.controlCode} · ${item.status}`,
    ),
    ``,
    `## Findings (${findings.length})`,
    ...findings.map(
      (finding) =>
        `- **${finding.title}** · ${findingStatusLabels[finding.status]} · ${finding.severity}`,
    ),
    ``,
  ].join("\n");

  downloadTextFile({
    filename: `heimdall-evidence-pack-${label}-${date}.md`,
    content: markdown,
    mimeType: "text/markdown;charset=utf-8",
  });

  appendAuditLog({
    actorId: currentProfile.id,
    actorName: currentProfile.name,
    action: "export.evidence_pack",
    targetType: "export",
    targetId: frameworkId === "all" ? "compliance" : frameworkId,
    detail: `Exported ${controls.length} controls, ${evidence.length} evidence, ${findings.length} findings`,
  });

  return {
    controls: controls.length,
    evidence: evidence.length,
    findings: findings.length,
  };
}

export function useComplianceSession() {
  const snapshot = useSyncExternalStore(
    subscribeComplianceSession,
    getComplianceSessionSnapshot,
    getComplianceSessionSnapshot,
  );

  return useMemo(
    () => ({
      controls: Array.from(snapshot.controls.values()),
      findings: Array.from(snapshot.findings.values()),
      patchControlStatus,
      patchFindingStatus,
      retestControls,
      requestEvidenceForControls,
      exportSelectedControls,
      exportEvidencePack,
    }),
    [snapshot],
  );
}

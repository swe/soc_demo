"use client";

import { useSyncExternalStore } from "react";

import { appendAuditLog } from "@/components/audit/audit-log-data";
import {
  getDetectionPackById,
  materializePackRules,
} from "@/components/detections/detection-marketplace-data";
import {
  buildBlankDetection,
  type DetectionRule,
  detectionRules,
  type DetectionStatus,
  getDetectionStats,
} from "@/components/detections/detections-data";
import { currentProfile } from "@/components/profile/profile-data";

type DetectionStore = Map<string, DetectionRule>;

let store: DetectionStore = new Map(
  detectionRules.map((rule) => [rule.id, { ...rule }]),
);
/** Pack ids already materialized into the session catalog. */
let importedPackIds: string[] = [];
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return store;
}

function getImportedPackIdsSnapshot() {
  return importedPackIds;
}

export function getDetectionsFromSession(): DetectionRule[] {
  return Array.from(store.values());
}

export function subscribeDetections(listener: () => void) {
  return subscribe(listener);
}

export function setDetectionStatus(id: string, status: DetectionStatus) {
  const current = store.get(id);
  if (!current || current.status === status) return current ?? null;
  const next = new Map(store);
  const updated = { ...current, status };
  next.set(id, updated);
  store = next;
  emit();
  // Audit is emitted by detectionsApi.setStatus (ActionReceipt) when used from UI.
  return updated;
}

export function nextDetectionId() {
  let max = 0;
  for (const rule of store.values()) {
    const match = /^DET-(\d+)$/.exec(rule.id);
    if (match) max = Math.max(max, Number(match[1]));
  }
  return `DET-${String(max + 1).padStart(4, "0")}`;
}

export function upsertDetection(rule: DetectionRule) {
  const next = new Map(store);
  next.set(rule.id, rule);
  store = next;
  emit();
  return rule;
}

export function createDetection(
  partial?: Partial<DetectionRule>,
): DetectionRule {
  const id = nextDetectionId();
  const rule = buildBlankDetection({
    ...partial,
    id,
    ownerId: partial?.ownerId ?? currentProfile.id,
    ownerName: partial?.ownerName ?? currentProfile.name,
    lastTriggeredAt: new Date().toISOString(),
    lineageSource: partial?.lineageSource ?? "heimdall",
  });
  upsertDetection(rule);
  appendAuditLog({
    actorId: currentProfile.id,
    actorName: currentProfile.name,
    action: "detection.created",
    targetType: "detection",
    targetId: id,
    detail: `Created detection ${rule.name}`,
  });
  return rule;
}

export function cloneDetection(id: string): DetectionRule | null {
  const source = store.get(id);
  if (!source) return null;
  const cloned = createDetection({
    ...source,
    name: `${source.name} (clone)`,
    status: "experimental",
    alertCount: 0,
    linkedAlertIds: [],
    lastTriggeredAt: new Date().toISOString(),
    ownerId: currentProfile.id,
    ownerName: currentProfile.name,
    deployState: "draft",
    deployedSourceIds: [],
    lastDeployAt: null,
    deployVersion: 0,
    deployHistory: [],
  });
  appendAuditLog({
    actorId: currentProfile.id,
    actorName: currentProfile.name,
    action: "detection.cloned",
    targetType: "detection",
    targetId: cloned.id,
    detail: `Cloned from ${id}`,
  });
  return cloned;
}

export function applyDetectionDeploy(
  id: string,
  patch: Partial<
    Pick<
      DetectionRule,
      | "deployState"
      | "deployedSourceIds"
      | "lastDeployAt"
      | "deployVersion"
      | "deployHistory"
      | "status"
    >
  >,
): DetectionRule | null {
  const current = store.get(id);
  if (!current) return null;
  const updated = { ...current, ...patch };
  upsertDetection(updated);
  return updated;
}

export function getImportedDetectionPackIds(): string[] {
  return importedPackIds;
}

export function isDetectionPackImported(packId: string) {
  return importedPackIds.includes(packId);
}

export type ImportDetectionPackResult = {
  packId: string;
  packName: string;
  added: number;
  rules: DetectionRule[];
  alreadyImported: boolean;
};

/**
 * Materialize a marketplace pack into the runtime catalog (session).
 * Idempotent per pack id — re-import is a no-op.
 */
export function importDetectionPack(
  packId: string,
): ImportDetectionPackResult | null {
  const pack = getDetectionPackById(packId);
  if (!pack) return null;

  if (importedPackIds.includes(packId)) {
    return {
      packId,
      packName: pack.name,
      added: 0,
      rules: [],
      alreadyImported: true,
    };
  }

  const materialized = materializePackRules(pack);
  let max = 0;
  for (const rule of store.values()) {
    const match = /^DET-(\d+)$/.exec(rule.id);
    if (match) max = Math.max(max, Number(match[1]));
  }

  const next = new Map(store);
  const added: DetectionRule[] = [];
  for (const draft of materialized) {
    max += 1;
    const rule: DetectionRule = {
      ...draft,
      id: `DET-${String(max).padStart(4, "0")}`,
      ownerId: currentProfile.id,
      ownerName: currentProfile.name,
    };
    next.set(rule.id, rule);
    added.push(rule);
  }

  store = next;
  importedPackIds = [...importedPackIds, packId];
  emit();

  appendAuditLog({
    actorId: currentProfile.id,
    actorName: currentProfile.name,
    action: "detection.pack_imported",
    targetType: "detection",
    targetId: packId,
    detail: `Imported ${pack.name} · ${added.length} rules staged`,
  });

  return {
    packId,
    packName: pack.name,
    added: added.length,
    rules: added,
    alreadyImported: false,
  };
}

export function useImportedDetectionPackIds() {
  return useSyncExternalStore(
    subscribe,
    getImportedPackIdsSnapshot,
    getImportedPackIdsSnapshot,
  );
}

export function useDetectionsSession() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const packIds = useSyncExternalStore(
    subscribe,
    getImportedPackIdsSnapshot,
    getImportedPackIdsSnapshot,
  );
  const rules = Array.from(snapshot.values()).sort(
    (a, b) => b.alertCount - a.alertCount,
  );
  return {
    rules,
    stats: getDetectionStats(rules),
    setStatus: setDetectionStatus,
    getRule: (id: string) => snapshot.get(id) ?? null,
    create: createDetection,
    clone: cloneDetection,
    upsert: upsertDetection,
    applyDeploy: applyDetectionDeploy,
    importPack: importDetectionPack,
    importedPackIds: packIds,
  };
}

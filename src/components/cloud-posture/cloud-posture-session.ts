"use client";

import { useMemo, useSyncExternalStore } from "react";

import { appendAuditLog } from "@/components/audit/audit-log-data";
import { currentProfile } from "@/components/profile/profile-data";

import {
  type CloudFinding,
  cloudFindings as seedFindings,
  type CloudFindingStatus,
} from "./cloud-posture-data";

type CloudPostureStore = {
  findings: Map<string, CloudFinding>;
};

function seedStore(): CloudPostureStore {
  return {
    findings: new Map(seedFindings.map((finding) => [finding.id, finding])),
  };
}

let store: CloudPostureStore = seedStore();
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function setStore(next: CloudPostureStore) {
  store = next;
  emit();
}

export function subscribeCloudPostureSession(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getCloudPostureSessionSnapshot() {
  return store;
}

export function getSessionCloudFindings(): CloudFinding[] {
  return Array.from(store.findings.values());
}

export function getSessionCloudFinding(id: string): CloudFinding | null {
  return store.findings.get(id) ?? null;
}

export function patchCloudFindingStatus(
  id: string,
  status: CloudFindingStatus,
): CloudFinding | null {
  const current = store.findings.get(id);
  if (!current || current.status === status) {
    return current ?? null;
  }

  const next: CloudFinding = {
    ...current,
    status,
    lastSeen: new Date().toISOString(),
  };
  const findings = new Map(store.findings);
  findings.set(id, next);
  setStore({ findings });

  appendAuditLog({
    actorId: currentProfile.id,
    actorName: currentProfile.name,
    action: "cloud_posture.finding_status",
    targetType: "cloud_finding",
    targetId: id,
    detail: `${current.title}: ${current.status} → ${status}`,
  });

  return next;
}

export function bulkPatchCloudFindingStatus(
  ids: Iterable<string>,
  status: CloudFindingStatus,
): number {
  let count = 0;
  const findings = new Map(store.findings);
  const at = new Date().toISOString();

  for (const id of ids) {
    const current = findings.get(id);
    if (!current || current.status === status) continue;
    findings.set(id, { ...current, status, lastSeen: at });
    count += 1;
  }

  if (count === 0) return 0;
  setStore({ findings });

  appendAuditLog({
    actorId: currentProfile.id,
    actorName: currentProfile.name,
    action: "cloud_posture.bulk_status",
    targetType: "cloud_finding",
    targetId: "bulk",
    detail: `Set ${count} findings to ${status}`,
  });

  return count;
}

export function useCloudPostureSession() {
  const snapshot = useSyncExternalStore(
    subscribeCloudPostureSession,
    getCloudPostureSessionSnapshot,
    getCloudPostureSessionSnapshot,
  );

  return useMemo(
    () => ({
      findings: Array.from(snapshot.findings.values()),
      getFinding: getSessionCloudFinding,
      patchStatus: patchCloudFindingStatus,
      bulkPatchStatus: bulkPatchCloudFindingStatus,
    }),
    [snapshot],
  );
}

"use client";

import { useSyncExternalStore } from "react";

import {
  detectionRules,
  getDetectionStats,
  type DetectionRule,
  type DetectionStatus,
} from "@/components/detections/detections-data";
import { appendAuditLog } from "@/components/audit/audit-log-data";
import { currentProfile } from "@/components/profile/profile-data";

type DetectionStore = Map<string, DetectionRule>;

let store: DetectionStore = new Map(
  detectionRules.map((rule) => [rule.id, { ...rule }]),
);
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
  appendAuditLog({
    actorId: currentProfile.id,
    actorName: currentProfile.name,
    action: "detection.status_changed",
    targetType: "detection",
    targetId: id,
    detail: `${current.status} → ${status}`,
  });
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

export function useDetectionsSession() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const rules = Array.from(snapshot.values()).sort(
    (a, b) => b.alertCount - a.alertCount,
  );
  return {
    rules,
    stats: getDetectionStats(rules),
    setStatus: setDetectionStatus,
    getRule: (id: string) => snapshot.get(id) ?? null,
  };
}

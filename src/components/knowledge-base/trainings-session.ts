"use client";

import { useMemo, useSyncExternalStore } from "react";

import { appendAuditLog } from "@/components/audit/audit-log-data";
import { currentProfile } from "@/components/profile/profile-data";

import {
  getTrainingStats,
  type KbTraining,
  type KbTrainingLevel,
  kbTrainings as seedTrainings,
  type KbTrainingStatus,
} from "./knowledge-base-data";

const LMS_PROVIDER_ID = "int-lms-workday";

type TrainingsStore = {
  trainings: Map<string, KbTraining>;
  lmsConnected: boolean;
  lastLmsSyncAt: string | null;
};

function seedStore(): TrainingsStore {
  return {
    trainings: new Map(
      seedTrainings.map((t) => [
        t.id,
        {
          ...t,
          lmsProviderId: LMS_PROVIDER_ID,
          lmsExternalId: `wd-${t.code.toLowerCase()}`,
          lastLmsSyncAt: null,
        },
      ]),
    ),
    lmsConnected: false,
    lastLmsSyncAt: null,
  };
}

let store: TrainingsStore = seedStore();
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function setStore(next: TrainingsStore) {
  store = next;
  emit();
}

export function subscribeTrainingsSession(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getTrainingsSessionSnapshot() {
  return store;
}

export function getSessionTrainings(): KbTraining[] {
  return Array.from(store.trainings.values());
}

export function upsertTraining(training: KbTraining): KbTraining {
  const trainings = new Map(store.trainings);
  trainings.set(training.id, training);
  setStore({ ...store, trainings });
  return training;
}

export function enrollTraining(id: string): KbTraining | null {
  const current = store.trainings.get(id);
  if (!current) return null;
  const next: KbTraining = {
    ...current,
    enrolled: current.enrolled + 1,
    status: current.status === "open" ? "in-progress" : current.status,
    updatedAt: new Date().toISOString().slice(0, 10),
  };
  upsertTraining(next);
  appendAuditLog({
    actorId: currentProfile.id,
    actorName: currentProfile.name,
    action: "training.enroll",
    targetType: "training",
    targetId: current.code,
    detail: `Enrolled in ${current.title}`,
  });
  return next;
}

export function completeTraining(id: string): KbTraining | null {
  const current = store.trainings.get(id);
  if (!current) return null;
  const next: KbTraining = {
    ...current,
    completed: Math.min(current.enrolled, current.completed + 1),
    status: "completed",
    updatedAt: new Date().toISOString().slice(0, 10),
  };
  upsertTraining(next);
  appendAuditLog({
    actorId: currentProfile.id,
    actorName: currentProfile.name,
    action: "training.complete",
    targetType: "training",
    targetId: current.code,
    detail: `Marked complete · ${current.title}`,
  });
  return next;
}

export function connectLms(): { connected: boolean } {
  setStore({ ...store, lmsConnected: true });
  appendAuditLog({
    actorId: currentProfile.id,
    actorName: currentProfile.name,
    action: "training.lms_connect",
    targetType: "integration",
    targetId: LMS_PROVIDER_ID,
    detail: "Connected Workday Learning LMS",
  });
  return { connected: true };
}

/** Pull roster progress from the LMS connector into local training catalog. */
export function syncFromLms(): {
  updated: number;
  at: string;
} {
  if (!store.lmsConnected) {
    setStore({ ...store, lmsConnected: true });
  }
  const at = new Date().toISOString();
  const trainings = new Map(store.trainings);
  let updated = 0;
  for (const [id, training] of trainings) {
    const bump = 1 + (id.charCodeAt(id.length - 1) % 3);
    const enrolled = training.enrolled + bump;
    const completed = Math.min(
      enrolled,
      training.completed + Math.max(1, Math.floor(bump / 2)),
    );
    let status: KbTrainingStatus = training.status;
    if (completed >= enrolled && enrolled > 0) status = "completed";
    else if (completed > 0) status = "in-progress";
    trainings.set(id, {
      ...training,
      enrolled,
      completed,
      status,
      lmsProviderId: LMS_PROVIDER_ID,
      lastLmsSyncAt: at,
      updatedAt: at.slice(0, 10),
    });
    updated += 1;
  }
  setStore({
    trainings,
    lmsConnected: true,
    lastLmsSyncAt: at,
  });
  appendAuditLog({
    actorId: currentProfile.id,
    actorName: currentProfile.name,
    action: "training.lms_sync",
    targetType: "integration",
    targetId: LMS_PROVIDER_ID,
    detail: `Synced ${updated} courses from LMS`,
  });
  return { updated, at };
}

export function createTraining(input: {
  title: string;
  summary?: string;
  level?: KbTrainingLevel;
}): KbTraining {
  let max = 0;
  for (const t of store.trainings.values()) {
    const match = /^trn-(\d+)$/i.exec(t.id);
    if (match) max = Math.max(max, Number(match[1]));
  }
  const n = max + 1;
  const training: KbTraining = {
    id: `trn-${String(n).padStart(3, "0")}`,
    code: `TRN-${String(n).padStart(3, "0")}`,
    title: input.title,
    summary: input.summary ?? "Custom training course.",
    level: input.level ?? "foundation",
    status: "open",
    ownerId: currentProfile.id,
    durationMinutes: 45,
    enrolled: 0,
    completed: 0,
    dueLabel: "No due date",
    tags: ["custom"],
    related: [],
    updatedAt: new Date().toISOString().slice(0, 10),
    lmsProviderId: LMS_PROVIDER_ID,
    lmsExternalId: undefined,
    lastLmsSyncAt: null,
  };
  upsertTraining(training);
  return training;
}

export function useTrainingsSession() {
  const snapshot = useSyncExternalStore(
    subscribeTrainingsSession,
    getTrainingsSessionSnapshot,
    getTrainingsSessionSnapshot,
  );

  return useMemo(() => {
    const trainings = Array.from(snapshot.trainings.values());
    return {
      trainings,
      stats: getTrainingStats(trainings),
      lmsConnected: snapshot.lmsConnected,
      lastLmsSyncAt: snapshot.lastLmsSyncAt,
      lmsProviderId: LMS_PROVIDER_ID,
      enroll: enrollTraining,
      complete: completeTraining,
      connectLms,
      syncFromLms,
      create: createTraining,
      upsert: upsertTraining,
    };
  }, [snapshot]);
}

export { LMS_PROVIDER_ID };

"use client";

import { useMemo, useSyncExternalStore } from "react";

import { appendAuditLog } from "@/components/audit/audit-log-data";
import {
  getPlaybook,
  upsertPlaybook,
} from "@/components/playbooks/playbooks-session";
import { currentProfile } from "@/components/profile/profile-data";

import {
  buildDraftPlaybookDefinition,
  type PlaybookDefinition,
  playbookDefinitions as seedPlaybooks,
  type PlaybookFlowEdge,
  type PlaybookFlowNode,
} from "./playbooks-data";

type AutomationStore = {
  playbooks: Map<string, PlaybookDefinition>;
};

function clonePlaybook(pb: PlaybookDefinition): PlaybookDefinition {
  return {
    ...pb,
    graph: {
      nodes: pb.graph.nodes.map((n) => ({
        ...n,
        position: { ...n.position },
        data: {
          ...n.data,
          config: n.data.config ? { ...n.data.config } : undefined,
        },
      })),
      edges: pb.graph.edges.map((e) => ({ ...e })),
    },
  };
}

function seedStore(): AutomationStore {
  return {
    playbooks: new Map(
      seedPlaybooks.map((pb) => [pb.id, clonePlaybook(pb)]),
    ),
  };
}

let store: AutomationStore = seedStore();
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function setStore(next: AutomationStore) {
  store = next;
  emit();
}

export function subscribeAutomationSession(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getAutomationSessionSnapshot() {
  return store;
}

export function getSessionPlaybooks(): PlaybookDefinition[] {
  return Array.from(store.playbooks.values());
}

export function getSessionPlaybook(id: string): PlaybookDefinition | null {
  return store.playbooks.get(id) ?? null;
}

function nextPlaybookIds(): { id: string; code: string } {
  let max = 0;
  for (const pb of store.playbooks.values()) {
    const match = /^proc-(\d+)$/i.exec(pb.id) ?? /^PB-(\d+)$/i.exec(pb.code);
    if (match) max = Math.max(max, Number(match[1]));
  }
  const n = max + 1;
  return {
    id: `proc-${String(n).padStart(3, "0")}`,
    code: `PB-${String(n).padStart(3, "0")}`,
  };
}

export function createPlaybook(input?: {
  title?: string;
  summary?: string;
}): PlaybookDefinition {
  const { id, code } = nextPlaybookIds();
  const draft = buildDraftPlaybookDefinition({
    id,
    code,
    title: input?.title ?? "Untitled playbook",
    ownerId: currentProfile.id,
    summary: input?.summary,
  });

  const playbooks = new Map(store.playbooks);
  playbooks.set(id, draft);
  setStore({ playbooks });

  upsertPlaybook({
    id: draft.id,
    code: draft.code,
    title: draft.title,
    summary: draft.summary,
    severity: draft.severity,
    status: draft.status,
    ownerId: draft.ownerId,
    steps: draft.steps,
    lastRunLabel: draft.lastRunLabel,
    runCount: draft.runCount,
    mitreTactic: draft.mitreTactic,
    linkedIncidentIds: draft.linkedIncidentIds,
    linkedAlertIds: draft.linkedAlertIds,
    related: draft.related,
    updatedAt: draft.updatedAt,
  });

  appendAuditLog({
    actorId: currentProfile.id,
    actorName: currentProfile.name,
    action: "automation.playbook_create",
    targetType: "playbook",
    targetId: draft.code,
    detail: `Created custom playbook ${draft.title}`,
  });

  return draft;
}

export function updatePlaybookMeta(
  id: string,
  patch: Partial<
    Pick<PlaybookDefinition, "title" | "summary" | "severity" | "status">
  >,
): PlaybookDefinition | null {
  const current = store.playbooks.get(id);
  if (!current) return null;
  const next: PlaybookDefinition = {
    ...current,
    ...patch,
    updatedAt: new Date().toISOString().slice(0, 10),
  };
  const playbooks = new Map(store.playbooks);
  playbooks.set(id, next);
  setStore({ playbooks });

  const kb = getPlaybook(id);
  if (kb) {
    upsertPlaybook({
      ...kb,
      title: next.title,
      summary: next.summary,
      severity: next.severity,
      status: next.status,
      updatedAt: next.updatedAt,
    });
  }
  return next;
}

export function savePlaybookGraph(
  id: string,
  nodes: PlaybookFlowNode[],
  edges: PlaybookFlowEdge[],
): PlaybookDefinition | null {
  const current = store.playbooks.get(id);
  if (!current) return null;

  const next: PlaybookDefinition = {
    ...current,
    steps: nodes.filter((n) => n.data.nodeType !== "end").length,
    updatedAt: new Date().toISOString().slice(0, 10),
    graph: {
      nodes: nodes.map((n) => ({
        ...n,
        position: { ...n.position },
        data: {
          ...n.data,
          config: n.data.config ? { ...n.data.config } : undefined,
        },
      })),
      edges: edges.map((e) => ({ ...e })),
    },
  };

  const playbooks = new Map(store.playbooks);
  playbooks.set(id, next);
  setStore({ playbooks });

  const kb = getPlaybook(id);
  if (kb) {
    upsertPlaybook({
      ...kb,
      steps: next.steps,
      updatedAt: next.updatedAt,
    });
  }

  appendAuditLog({
    actorId: currentProfile.id,
    actorName: currentProfile.name,
    action: "automation.playbook_save",
    targetType: "playbook",
    targetId: current.code,
    detail: `Saved graph (${nodes.length} nodes, ${edges.length} edges)`,
  });

  return next;
}

export function updatePlaybookNodeData(
  playbookId: string,
  nodeId: string,
  patch: Partial<PlaybookDefinition["graph"]["nodes"][number]["data"]>,
): PlaybookDefinition | null {
  const current = store.playbooks.get(playbookId);
  if (!current) return null;

  const nodes = current.graph.nodes.map((n) =>
    n.id === nodeId
      ? {
          ...n,
          data: {
            ...n.data,
            ...patch,
            config: patch.config
              ? { ...(n.data.config ?? {}), ...patch.config }
              : n.data.config,
          },
        }
      : n,
  );

  return savePlaybookGraph(playbookId, nodes, current.graph.edges);
}

/** Mock run — bumps run count via playbooks-session and local graph meta. */
export function runPlaybookMock(id: string): PlaybookDefinition | null {
  const current = store.playbooks.get(id);
  if (!current) return null;

  const at = new Date().toISOString();
  const next: PlaybookDefinition = {
    ...current,
    runCount: current.runCount + 1,
    lastRunLabel: "Just now",
    updatedAt: at.slice(0, 10),
  };

  const playbooks = new Map(store.playbooks);
  playbooks.set(id, next);
  setStore({ playbooks });

  const kb = getPlaybook(id);
  if (kb) {
    upsertPlaybook({
      ...kb,
      runCount: next.runCount,
      lastRunLabel: next.lastRunLabel,
      updatedAt: next.updatedAt,
    });
  } else {
    upsertPlaybook({
      id: next.id,
      code: next.code,
      title: next.title,
      summary: next.summary,
      severity: next.severity,
      status: next.status,
      ownerId: next.ownerId,
      steps: next.steps,
      lastRunLabel: next.lastRunLabel,
      runCount: next.runCount,
      mitreTactic: next.mitreTactic,
      linkedIncidentIds: next.linkedIncidentIds,
      linkedAlertIds: next.linkedAlertIds,
      related: next.related,
      updatedAt: next.updatedAt,
    });
  }

  appendAuditLog({
    actorId: currentProfile.id,
    actorName: currentProfile.name,
    action: "automation.playbook_run",
    targetType: "playbook",
    targetId: current.code,
    detail: "Mock run from Automation center",
  });

  return next;
}

export function useAutomationSession() {
  const snapshot = useSyncExternalStore(
    subscribeAutomationSession,
    getAutomationSessionSnapshot,
    getAutomationSessionSnapshot,
  );

  return useMemo(
    () => ({
      playbooks: Array.from(snapshot.playbooks.values()),
      getPlaybook: getSessionPlaybook,
      createPlaybook,
      updatePlaybookMeta,
      savePlaybookGraph,
      updatePlaybookNodeData,
      runPlaybookMock,
    }),
    [snapshot],
  );
}

import {
  kbProcedures,
  type KbProcedure,
} from "@/components/knowledge-base/knowledge-base-data";
import { appendAuditLog } from "@/components/audit/audit-log-data";
import { currentProfile } from "@/components/profile/profile-data";
import {
  createIncidentFromAlerts,
} from "@/components/incidents/incidents-session";
import type { SocAlert } from "@/components/alerts/alerts-data";
import type { SocIncident, WarRoomMessage } from "@/components/incidents/incidents-data";

type PlaybookStore = Map<string, KbProcedure>;

let store: PlaybookStore = new Map(
  kbProcedures.map((procedure) => [procedure.id, procedure]),
);
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

export function subscribePlaybooks(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getPlaybookSnapshot() {
  return store;
}

export function getPlaybooks(): KbProcedure[] {
  return Array.from(store.values());
}

export function getApprovedPlaybooks(): KbProcedure[] {
  return getPlaybooks().filter((procedure) => procedure.status === "approved");
}

export function getPlaybook(id: string) {
  return store.get(id) ?? null;
}

function setPlaybook(procedure: KbProcedure) {
  const next = new Map(store);
  next.set(procedure.id, procedure);
  store = next;
  emit();
}

export function upsertPlaybook(procedure: KbProcedure) {
  setPlaybook(procedure);
}

export type RunPlaybookResult = {
  procedure: KbProcedure;
  incidentId: string;
};

export function runPlaybookAgainstIncident(
  procedureId: string,
  incident: SocIncident,
  patchIncidents: (
    ids: Iterable<string>,
    patch: Partial<
      Pick<SocIncident, "notes" | "timeline" | "warRoomMessages">
    >,
  ) => void,
): RunPlaybookResult {
  const procedure = store.get(procedureId);
  if (!procedure) {
    throw new Error(`Playbook ${procedureId} not found`);
  }

  const at = new Date().toISOString();
  const message: WarRoomMessage = {
    id: `wrm-pb-${Date.now().toString(36)}`,
    at,
    authorId: "system",
    authorName: "SOAR",
    body: `Playbook ${procedure.code} started — ${procedure.title}`,
    mentionIds: [],
    kind: "system",
  };

  const linkedIncidentIds = procedure.linkedIncidentIds.includes(incident.id)
    ? procedure.linkedIncidentIds
    : [...procedure.linkedIncidentIds, incident.id];

  const updated: KbProcedure = {
    ...procedure,
    runCount: procedure.runCount + 1,
    lastRunLabel: "Just now",
    linkedIncidentIds,
    updatedAt: at.slice(0, 10),
  };
  setPlaybook(updated);

  patchIncidents([incident.id], {
    notes: incident.notes
      ? `${incident.notes}\n\n[SOAR] Ran ${procedure.code}`
      : `[SOAR] Ran ${procedure.code}: ${procedure.title}`,
    timeline: [
      ...incident.timeline,
      { at, label: `Playbook ${procedure.code} started` },
    ],
    warRoomMessages: [...(incident.warRoomMessages ?? []), message],
  });

  appendAuditLog({
    actorId: currentProfile.id,
    actorName: currentProfile.name,
    action: "playbook.run",
    targetType: "playbook",
    targetId: procedure.code,
    detail: `Ran against ${incident.id}`,
  });

  return { procedure: updated, incidentId: incident.id };
}

export function runPlaybookFromAlert(
  procedureId: string,
  alert: SocAlert,
  getIncident: (id: string) => SocIncident | null,
  patchIncidents: (
    ids: Iterable<string>,
    patch: Partial<
      Pick<SocIncident, "notes" | "timeline" | "warRoomMessages">
    >,
  ) => void,
): RunPlaybookResult {
  const incident = createIncidentFromAlerts([alert], {
    assigneeId: alert.assigneeId,
  });
  const live = getIncident(incident.id) ?? incident;
  return runPlaybookAgainstIncident(procedureId, live, patchIncidents);
}

import type { SocAlert } from "@/components/alerts/alerts-data";
import type { AttackStory, AttackStoryAction } from "@/components/incidents/attack-story";
import type { SocIncident } from "@/components/incidents/incidents-data";
import type { WarRoomMessage } from "@/components/incidents/incidents-data";
import {
  createIncidentFromAlerts,
  getIncidentFromSession,
  getIncidentsFromSession,
  patchIncidentsInSession,
} from "@/components/incidents/incidents-session";
import { containAction } from "@/lib/api-adapters/response";

import { auditFromReceipt } from "./audit";
import { mockDelay } from "./delay";
import { type ActionReceipt, type ListResult,makeReceipt } from "./types";

export type IncidentPatch = Partial<
  Pick<
    SocIncident,
    | "status"
    | "assigneeId"
    | "ownerId"
    | "notes"
    | "summary"
    | "timeline"
    | "warRoomMessages"
    | "disruptionStatus"
    | "alertIds"
    | "tags"
  >
>;

export type DisruptionConnector = {
  id: string;
  name: string;
  family: "edr" | "idp";
};

export const DISRUPTION_CONNECTORS: DisruptionConnector[] = [
  { id: "int-defender-endpoint", name: "Microsoft Defender", family: "edr" },
  { id: "int-crowdstrike-falcon", name: "CrowdStrike Falcon", family: "edr" },
  { id: "int-okta-workforce", name: "Okta Workforce", family: "idp" },
];

export type DisruptOptions = {
  actions?: AttackStoryAction[];
  /** Preferred connector id for all actions (wizard selection). */
  connectorId?: string;
};

export type DisruptResult = {
  summary: string;
  applied: string[];
  receipts: ActionReceipt[];
};

async function commitIncidentPatch(
  ids: string[],
  patch: IncidentPatch,
): Promise<ActionReceipt> {
  await mockDelay(120);
  patchIncidentsInSession(ids, patch);
  const fields = Object.keys(patch).join(", ");
  const receipt = makeReceipt({
    outcome: "ok",
    message: `Updated ${ids.length} incident${ids.length === 1 ? "" : "s"} (${fields})`,
    targetType: "incident",
    targetId: ids[0] ?? "bulk",
  });
  auditFromReceipt(receipt, "incident.patch", "incident");
  return receipt;
}

export const incidentsApi = {
  async list(): Promise<ListResult<SocIncident>> {
    await mockDelay(80);
    const items = getIncidentsFromSession();
    return { items, total: items.length };
  },

  async get(id: string): Promise<SocIncident | null> {
    await mockDelay(60);
    return getIncidentFromSession(id);
  },

  async patch(ids: Iterable<string>, patch: IncidentPatch): Promise<ActionReceipt> {
    return commitIncidentPatch([...ids], patch);
  },

  patchSync(ids: Iterable<string>, patch: IncidentPatch): ActionReceipt {
    const idList = [...ids];
    patchIncidentsInSession(idList, patch);
    const fields = Object.keys(patch).join(", ");
    const receipt = makeReceipt({
      outcome: "ok",
      message: `Updated ${idList.length} incident${idList.length === 1 ? "" : "s"} (${fields})`,
      targetType: "incident",
      targetId: idList[0] ?? "bulk",
    });
    auditFromReceipt(receipt, "incident.patch", "incident");
    return receipt;
  },

  async createFromAlerts(
    alerts: SocAlert[],
    overrides?: Partial<SocIncident>,
  ): Promise<{ incident: SocIncident; receipt: ActionReceipt }> {
    await mockDelay(200);
    const incident = createIncidentFromAlerts(alerts, overrides);
    const receipt = makeReceipt({
      outcome: "ok",
      message: `Created incident ${incident.id} from ${alerts.length} alert(s)`,
      targetType: "incident",
      targetId: incident.id,
    });
    auditFromReceipt(receipt, "incident.created", "incident");
    return { incident, receipt };
  },

  /**
   * Containment via EDR/IdP connector (mock or live adapter).
   * Receipts are persisted so refresh does not erase history.
   */
  async disrupt(
    incident: SocIncident,
    story: AttackStory,
    options?: DisruptOptions,
  ): Promise<DisruptResult> {
    await mockDelay(120);
    const actions = options?.actions ?? story.disruption.actions;
    if (actions.length === 0) {
      throw new Error("No disruption actions available for this case");
    }

    const applied: string[] = [];
    const receipts: ActionReceipt[] = [];
    const at = new Date().toISOString();

    for (const action of actions) {
      const targetType =
        action.kind === "isolate-host" || action.kind === "collect-forensics"
          ? "device"
          : action.kind === "purge-mailbox" || action.kind === "block-url"
            ? action.kind === "block-url"
              ? "url"
              : "mail"
            : "identity";
      const receipt = await containAction({
        action: action.kind,
        targetType,
        targetId: action.targetId,
        targetLabel: action.targetLabel,
        connectorId: options?.connectorId,
        incidentId: incident.id,
      });
      receipts.push(receipt);
      auditFromReceipt(receipt, "incident.disruption", "incident");
      if (receipt.outcome !== "failed") {
        applied.push(receipt.message.replace(/ \(live plane unavailable.*\)$/, ""));
      }
    }

    if (applied.length === 0) {
      throw new Error("Disruption targets were not found in the asset session");
    }

    const summary = applied.join("; ");
    const message: WarRoomMessage = {
      id: `wrm-disrupt-${Date.now().toString(36)}`,
      at,
      authorId: "system",
      authorName: "Attack Disruption",
      body: `Response via connectors — ${summary}`,
      mentionIds: [],
      kind: "system",
    };

    const nextStatus =
      incident.status === "new" || incident.status === "investigating"
        ? "contained"
        : incident.status;

    patchIncidentsInSession([incident.id], {
      status: nextStatus,
      disruptionStatus: "executed",
      notes: incident.notes
        ? `${incident.notes}\n\n[Disruption] ${summary}`
        : `[Disruption] ${summary}`,
      timeline: [
        ...incident.timeline,
        { at, label: `Attack disruption: ${summary}` },
      ],
      warRoomMessages: [...(incident.warRoomMessages ?? []), message],
    });

    return { summary, applied, receipts };
  },
};

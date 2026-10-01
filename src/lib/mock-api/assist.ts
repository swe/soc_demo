import type { SocAlert } from "@/components/alerts/alerts-data";
import { getAlertFromSession } from "@/components/alerts/alerts-session";
import { buildAttackStory } from "@/components/incidents/attack-story";
import type { SocIncident } from "@/components/incidents/incidents-data";
import {
  assistInvestigate,
  type AssistInvestigateInput,
  type AssistInvestigatePlan,
  type AssistRecommendedContain,
  assistTriage,
  type AssistTriageInput,
  type AssistTriageResult,
  containTargetType,
  resolveContainActionKind,
} from "@/lib/api-adapters/assist";

import { alertsApi } from "./alerts";
import { mockDelay } from "./delay";
import { incidentsApi } from "./incidents";
import { responseApi } from "./response";
import { type ActionReceipt, makeReceipt } from "./types";

export type {
  AssistInvestigateInput,
  AssistInvestigatePlan,
  AssistRecommendedContain,
  AssistTriageInput,
  AssistTriageResult,
};

export type ApplyAttackStoryDraftInput = {
  draft: string;
  incident?: SocIncident;
  alert?: SocAlert;
};

export type RunRecommendedContainInput = {
  recommendations: AssistRecommendedContain[];
  incident?: SocIncident;
  alerts?: SocAlert[];
};

export const assistApi = {
  async triage(input: AssistTriageInput): Promise<AssistTriageResult> {
    await mockDelay(60);
    return assistTriage(input);
  },

  async investigate(
    input: AssistInvestigateInput,
  ): Promise<AssistInvestigatePlan> {
    await mockDelay(100);
    return assistInvestigate(input);
  },

  /**
   * Apply Attack Story draft text into incident/alert notes (mock session).
   */
  async applyAttackStoryDraft(
    input: ApplyAttackStoryDraftInput,
  ): Promise<ActionReceipt> {
    await mockDelay(80);
    const block = `[Attack Story draft]\n${input.draft}`;
    if (input.incident && !input.incident.id.startsWith("pending-")) {
      return incidentsApi.patch([input.incident.id], {
        notes: input.incident.notes
          ? `${input.incident.notes}\n\n${block}`
          : block,
      });
    }
    if (input.alert) {
      return alertsApi.patch([input.alert.id], {
        notes: input.alert.notes
          ? `${input.alert.notes}\n\n${block}`
          : block,
      });
    }
    return makeReceipt({
      outcome: "ok",
      message: "Attack Story draft staged (no durable subject)",
      targetType: "incident",
      targetId: input.incident?.id ?? "draft",
      detail: "notes",
    });
  },

  /**
   * Execute recommended contain actions via response/disrupt paths.
   */
  async runRecommendedContain(
    input: RunRecommendedContainInput,
  ): Promise<{ receipts: ActionReceipt[]; summary: string }> {
    await mockDelay(100);
    const recs = input.recommendations;
    if (recs.length === 0) {
      throw new Error("No recommended containment actions");
    }

    const incident = input.incident;
    if (incident && !incident.id.startsWith("pending-")) {
      const alerts =
        input.alerts ??
        (incident.alertIds
          .map((id) => getAlertFromSession(id))
          .filter(Boolean) as SocAlert[]);
      const story = buildAttackStory(incident, alerts);
      const actions = story.disruption.actions.filter((action) =>
        recs.some((r) => r.targetId === action.targetId),
      );
      const connectorId = recs[0]?.connectorId;
      const result = await incidentsApi.disrupt(incident, story, {
        actions: actions.length > 0 ? actions : story.disruption.actions,
        connectorId,
      });
      return { receipts: result.receipts, summary: result.summary };
    }

    const receipts: ActionReceipt[] = [];
    for (const rec of recs) {
      const kind = resolveContainActionKind(rec.actionId);
      if (!kind) continue;
      const receipt = await responseApi.contain({
        action: kind,
        targetType: containTargetType(kind),
        targetId: rec.targetId,
        targetLabel: rec.targetLabel,
        connectorId: rec.connectorId,
        incidentId: incident?.id,
      });
      receipts.push(receipt);
    }
    if (receipts.length === 0) {
      throw new Error("Unable to resolve recommended contain actions");
    }
    const summary = receipts
      .filter((r) => r.outcome !== "failed")
      .map((r) => r.message)
      .join("; ");
    return {
      receipts,
      summary: summary || receipts[0]!.message,
    };
  },
};

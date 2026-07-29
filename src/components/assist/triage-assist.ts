import {
  type AlertSeverity,
  type AlertStatus,
  openAlertStatuses,
  severityWeight,
  type SocAlert,
} from "@/components/alerts/alerts-data";
import { getAlertsFromSession } from "@/components/alerts/alerts-session";
import {
  attackStoryClassLabels,
  buildAttackStory,
} from "@/components/incidents/attack-story";
import {
  type IncidentPriority,
  type SocIncident,
} from "@/components/incidents/incidents-data";
import type { KbProcedure } from "@/components/knowledge-base/knowledge-base-data";
import { getApprovedPlaybooks } from "@/components/playbooks/playbooks-session";

export type AssistSimilarAlert = {
  id: string;
  title: string;
  severity: AlertSeverity;
  status: AlertStatus;
  matchReason: string;
};

export type AssistPlaybookSuggestion = {
  id: string;
  code: string;
  title: string;
  reason: string;
  href: string;
};

export type AssistSuggestion = {
  similarAlerts: AssistSimilarAlert[];
  playbook: AssistPlaybookSuggestion | null;
  /** Additional approved KB procedures related to this entity. */
  linkedProcedures: AssistPlaybookSuggestion[];
  draftNotes: string;
  /** Investigation narrative grounded on case fields (for apply / export). */
  investigationDraft: string;
  /** 0–100 heuristic confidence in the overall suggestion package. */
  confidence: number;
  suggestedSeverity: AlertSeverity | null;
  suggestedPriority: IncidentPriority | null;
  nextActions: string[];
  /** Status to apply when using Apply all (alerts). */
  suggestedStatus: AlertStatus | null;
};

function scoreAlertSimilarity(seed: SocAlert, candidate: SocAlert): number {
  let score = 0;
  if (candidate.ruleName === seed.ruleName) score += 5;
  if (candidate.entityName === seed.entityName) score += 4;
  if (
    seed.mitreTechnique &&
    candidate.mitreTechnique === seed.mitreTechnique
  ) {
    score += 3;
  } else if (seed.mitreTactic && candidate.mitreTactic === seed.mitreTactic) {
    score += 2;
  }
  if (candidate.sourceCategory === seed.sourceCategory) score += 1;
  if (candidate.deviceId && candidate.deviceId === seed.deviceId) score += 2;
  if (candidate.identityId && candidate.identityId === seed.identityId) {
    score += 2;
  }
  return score;
}

function matchReason(seed: SocAlert, candidate: SocAlert): string {
  const parts: string[] = [];
  if (candidate.ruleName === seed.ruleName) parts.push("same rule");
  if (candidate.entityName === seed.entityName) parts.push("same entity");
  if (
    seed.mitreTechnique &&
    candidate.mitreTechnique === seed.mitreTechnique
  ) {
    parts.push("same MITRE technique");
  } else if (seed.mitreTactic && candidate.mitreTactic === seed.mitreTactic) {
    parts.push("same MITRE tactic");
  }
  if (parts.length === 0) parts.push("related detection pattern");
  return parts.join(" · ");
}

function findSimilarAlerts(seed: SocAlert, limit = 4): AssistSimilarAlert[] {
  const catalog = getAlertsFromSession();
  return catalog
    .filter((alert) => alert.id !== seed.id)
    .map((alert) => ({
      alert,
      score: scoreAlertSimilarity(seed, alert),
    }))
    .filter((row) => row.score >= 3)
    .sort(
      (a, b) =>
        b.score - a.score ||
        severityWeight[a.alert.severity] - severityWeight[b.alert.severity],
    )
    .slice(0, limit)
    .map(({ alert }) => ({
      id: alert.id,
      title: alert.title,
      severity: alert.severity,
      status: alert.status,
      matchReason: matchReason(seed, alert),
    }));
}

function pickPlaybookForAlert(alert: SocAlert): AssistPlaybookSuggestion | null {
  const approved = getApprovedPlaybooks();
  const linked = approved.find((procedure) =>
    procedure.linkedAlertIds.includes(alert.id),
  );
  const byEntity = approved.find((procedure) =>
    procedure.title.toLowerCase().includes(
      alert.sourceCategory === "identity"
        ? "identity"
        : alert.sourceCategory === "endpoint"
          ? "endpoint"
          : alert.mitreTactic?.toLowerCase().split(" ")[0] ?? "incident",
    ),
  );
  const procedure = linked ?? byEntity ?? approved[0] ?? null;
  return procedure ? toPlaybookSuggestion(procedure, linked ? "linked to this alert" : "first approved playbook") : null;
}

function pickPlaybookForIncident(
  incident: SocIncident,
  recommendedCode?: string | null,
): AssistPlaybookSuggestion | null {
  const approved = getApprovedPlaybooks();
  const linked = approved.find((procedure) =>
    procedure.linkedIncidentIds.includes(incident.id),
  );
  const byStory = recommendedCode
    ? approved.find((procedure) => procedure.code === recommendedCode)
    : null;
  const byAlert = approved.find((procedure) =>
    incident.alertIds.some((id) => procedure.linkedAlertIds.includes(id)),
  );
  const procedure = linked ?? byStory ?? byAlert ?? approved[0] ?? null;
  return procedure
    ? toPlaybookSuggestion(
        procedure,
        linked
          ? "linked to this case"
          : byStory
            ? "matched to attack story class"
            : byAlert
              ? "linked via alert"
              : "first approved playbook",
      )
    : null;
}

function toPlaybookSuggestion(
  procedure: KbProcedure,
  reason: string,
): AssistPlaybookSuggestion {
  return {
    id: procedure.id,
    code: procedure.code,
    title: procedure.title,
    reason,
    href: `/knowledge-base/procedures?id=${encodeURIComponent(procedure.id)}`,
  };
}

function linkedProceduresForAlert(
  alert: SocAlert,
  primaryId: string | null,
): AssistPlaybookSuggestion[] {
  return getApprovedPlaybooks()
    .filter(
      (procedure) =>
        procedure.id !== primaryId &&
        (procedure.linkedAlertIds.includes(alert.id) ||
          (alert.mitreTactic != null &&
            procedure.title
              .toLowerCase()
              .includes(alert.mitreTactic.toLowerCase().split(" ")[0] ?? ""))),
    )
    .slice(0, 3)
    .map((procedure) =>
      toPlaybookSuggestion(procedure, "Related KB procedure"),
    );
}

function linkedProceduresForIncident(
  incident: SocIncident,
  primaryId: string | null,
): AssistPlaybookSuggestion[] {
  return getApprovedPlaybooks()
    .filter(
      (procedure) =>
        procedure.id !== primaryId &&
        (procedure.linkedIncidentIds.includes(incident.id) ||
          incident.alertIds.some((id) =>
            procedure.linkedAlertIds.includes(id),
          )),
    )
    .slice(0, 3)
    .map((procedure) =>
      toPlaybookSuggestion(procedure, "Related KB procedure"),
    );
}

function suggestSeverity(alert: SocAlert, similar: AssistSimilarAlert[]): AlertSeverity {
  if (alert.severity === "critical") return "critical";
  const openSimilarCritical = similar.some(
    (row) =>
      row.severity === "critical" && openAlertStatuses.includes(row.status),
  );
  if (openSimilarCritical && alert.severity === "high") return "critical";
  if (alert.confidence >= 85 && alert.severity === "medium") return "high";
  return alert.severity;
}

function suggestPriority(incident: SocIncident): IncidentPriority {
  if (incident.priority === "P1") return "P1";
  if (
    incident.severity === "critical" ||
    incident.alertIds.length >= 3
  ) {
    return "P1";
  }
  if (incident.severity === "high") return "P2";
  return incident.priority;
}

function draftNotesForAlert(
  alert: SocAlert,
  similar: AssistSimilarAlert[],
  playbook: AssistPlaybookSuggestion | null,
): string {
  const lines = [
    `Assist draft — ${alert.id}`,
    `Detection: ${alert.ruleName} (${alert.sourceName})`,
    `Entity: ${alert.entityName} · ${alert.entityType}`,
    alert.mitreTactic
      ? `MITRE: ${alert.mitreTactic}${alert.mitreTechnique ? ` / ${alert.mitreTechnique}` : ""}`
      : "MITRE: unmapped",
    `Confidence ${alert.confidence}% · risk ${alert.riskScore} · ${alert.eventCount} events`,
    "",
    "Triage hypothesis:",
    `- ${alert.summary}`,
    `- Recommended action: ${alert.recommendedAction}`,
  ];
  if (similar.length > 0) {
    lines.push(
      "",
      "Similar open/catalog alerts:",
      ...similar.map(
        (row) => `- ${row.id} (${row.severity}) — ${row.matchReason}`,
      ),
    );
  }
  if (playbook) {
    lines.push("", `Suggested playbook: ${playbook.code} — ${playbook.title}`);
  }
  lines.push("", "Next: validate entity context, apply playbook steps, escalate if confirmed.");
  return lines.join("\n");
}

function draftNotesForIncident(
  incident: SocIncident,
  playbook: AssistPlaybookSuggestion | null,
  storyLabel?: string,
  priorityAssessment?: number,
): string {
  const lines = [
    `Assist draft — ${incident.id}`,
    `Priority ${incident.priority} · ${incident.status} · ${incident.entityName}`,
    storyLabel
      ? `Attack story: ${storyLabel}${
          priorityAssessment != null
            ? ` · assessment ${priorityAssessment}`
            : ""
        }`
      : null,
    incident.mitreTactic
      ? `MITRE: ${incident.mitreTactic}${incident.mitreTechnique ? ` / ${incident.mitreTechnique}` : ""}`
      : "MITRE: unmapped",
    `Linked alerts: ${incident.alertIds.join(", ") || "none"}`,
    "",
    "Impact:",
    `- ${incident.summary}`,
    "",
    "Response focus:",
    "- Confirm blast radius on linked assets",
    "- Contain primary entity and related identities/hosts",
    "- Preserve timeline evidence before eradication",
  ].filter((line): line is string => line != null);
  if (playbook) {
    lines.push("", `Suggested playbook: ${playbook.code} — ${playbook.title}`);
  }
  return lines.join("\n");
}

function nextActionsForAlert(
  alert: SocAlert,
  suggestedSeverity: AlertSeverity,
  playbook: AssistPlaybookSuggestion | null,
): string[] {
  const actions = [
    alert.status === "new"
      ? "Acknowledge and move status to triaging"
      : "Confirm current triage status is accurate",
    `Validate ${alert.entityType} context for ${alert.entityName}`,
  ];
  if (suggestedSeverity !== alert.severity) {
    actions.push(
      `Consider elevating severity to ${suggestedSeverity.toUpperCase()} based on similar detections`,
    );
  }
  if (playbook) {
    actions.push(`Run playbook ${playbook.code}`);
  } else {
    actions.push("Attach an approved procedure from Knowledge Base");
  }
  if (alert.severity === "critical" || alert.severity === "high") {
    actions.push("Escalate to an incident if confirmed malicious");
  } else {
    actions.push("Mark false positive only after rule/entity validation");
  }
  return actions;
}

function nextActionsForIncident(
  incident: SocIncident,
  playbook: AssistPlaybookSuggestion | null,
  disruptionEligible?: boolean,
  disruptionStatus?: string,
): string[] {
  const actions = [
    incident.status === "new"
      ? "Take ownership and begin investigation"
      : "Advance response checklist to the next incomplete phase",
    "Review Attack Story graph and correlated alert timeline",
    "Update war room with containment ETA",
  ];
  if (disruptionEligible && disruptionStatus !== "executed") {
    actions.push("Run Attack Disruption against linked identity/host");
  }
  if (playbook) {
    actions.push(`Execute playbook ${playbook.code}`);
  }
  if (incident.priority === "P1" || incident.priority === "P2") {
    actions.push("Confirm SLA clock and notify SOC manager if at risk");
  }
  return actions;
}

/** Deterministic demo assist — no LLM calls. */
export function buildAlertAssist(alert: SocAlert): AssistSuggestion {
  const similarAlerts = findSimilarAlerts(alert);
  const playbook = pickPlaybookForAlert(alert);
  const suggestedSeverity = suggestSeverity(alert, similarAlerts);
  const draftNotes = draftNotesForAlert(alert, similarAlerts, playbook);
  const confidence = Math.min(
    97,
    55 +
      similarAlerts.length * 8 +
      (playbook ? 12 : 0) +
      Math.round(alert.confidence * 0.15),
  );
  const investigationDraft = [
    `## Investigation draft — ${alert.id}`,
    "",
    `**Hypothesis:** ${alert.summary}`,
    `**Entity:** ${alert.entityName} (${alert.entityType})`,
    `**Source:** ${alert.sourceName} · ${alert.ruleName}`,
    alert.mitreTechnique
      ? `**MITRE:** ${alert.mitreTactic} / ${alert.mitreTechnique}`
      : null,
    "",
    "### Evidence to collect",
    "- Related detections (see similar alerts)",
    "- Asset/identity posture and recent auth",
    "- Investigate query hits for the entity window",
    "",
    "### Proposed disposition",
    `- Severity: ${suggestedSeverity}`,
    `- Status: ${alert.status === "new" ? "triaging" : alert.status}`,
    playbook ? `- Playbook: ${playbook.code}` : "- Playbook: select from KB",
  ]
    .filter((line): line is string => line != null)
    .join("\n");

  return {
    similarAlerts,
    playbook,
    linkedProcedures: linkedProceduresForAlert(alert, playbook?.id ?? null),
    draftNotes,
    investigationDraft,
    confidence,
    suggestedSeverity,
    suggestedPriority: null,
    suggestedStatus: alert.status === "new" ? "triaging" : null,
    nextActions: nextActionsForAlert(alert, suggestedSeverity, playbook),
  };
}

/** Deterministic demo assist — no LLM calls. */
export function buildIncidentAssist(incident: SocIncident): AssistSuggestion {
  const catalog = getAlertsFromSession();
  const linkedAlerts = incident.alertIds
    .map((id) => catalog.find((alert) => alert.id === id))
    .filter((alert): alert is SocAlert => Boolean(alert));
  const seedAlert = linkedAlerts[0] ?? null;
  const similarAlerts = seedAlert ? findSimilarAlerts(seedAlert, 3) : [];
  const story = buildAttackStory(incident, linkedAlerts);
  const playbook = pickPlaybookForIncident(
    incident,
    story.recommendedPlaybookCode,
  );
  const draftNotes = draftNotesForIncident(
    incident,
    playbook,
    attackStoryClassLabels[story.storyClass],
    story.priorityAssessment,
  );
  const confidence = Math.min(
    96,
    50 +
      linkedAlerts.length * 6 +
      (story.disruption.eligible ? 10 : 0) +
      (playbook ? 12 : 0) +
      Math.round(story.priorityAssessment * 0.15),
  );
  const investigationDraft = [
    `## Investigation draft — ${incident.id}`,
    "",
    `**Story class:** ${attackStoryClassLabels[story.storyClass]}`,
    `**Priority assessment:** ${story.priorityAssessment}`,
    `**Entity:** ${incident.entityName}`,
    `**Linked alerts:** ${incident.alertIds.join(", ") || "none"}`,
    "",
    "### Narrative",
    incident.summary,
    "",
    "### Next investigative moves",
    ...nextActionsForIncident(
      incident,
      playbook,
      story.disruption.eligible,
      story.disruption.status,
    ).map((a) => `- ${a}`),
  ].join("\n");

  return {
    similarAlerts,
    playbook,
    linkedProcedures: linkedProceduresForIncident(
      incident,
      playbook?.id ?? null,
    ),
    draftNotes,
    investigationDraft,
    confidence,
    suggestedSeverity: null,
    suggestedPriority: suggestPriority(incident),
    suggestedStatus: null,
    nextActions: nextActionsForIncident(
      incident,
      playbook,
      story.disruption.eligible,
      story.disruption.status,
    ),
  };
}

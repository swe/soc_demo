import {
  openAlertStatuses,
  severityWeight,
  type AlertSeverity,
  type AlertStatus,
  type SocAlert,
} from "@/components/alerts/alerts-data";
import { getAlertsFromSession } from "@/components/alerts/alerts-session";
import {
  type IncidentPriority,
  type SocIncident,
} from "@/components/incidents/incidents-data";
import { getApprovedPlaybooks } from "@/components/playbooks/playbooks-session";
import type { KbProcedure } from "@/components/knowledge-base/knowledge-base-data";

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
  draftNotes: string;
  suggestedSeverity: AlertSeverity | null;
  suggestedPriority: IncidentPriority | null;
  nextActions: string[];
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
): AssistPlaybookSuggestion | null {
  const approved = getApprovedPlaybooks();
  const linked = approved.find((procedure) =>
    procedure.linkedIncidentIds.includes(incident.id),
  );
  const byAlert = approved.find((procedure) =>
    incident.alertIds.some((id) => procedure.linkedAlertIds.includes(id)),
  );
  const procedure = linked ?? byAlert ?? approved[0] ?? null;
  return procedure
    ? toPlaybookSuggestion(
        procedure,
        linked
          ? "linked to this case"
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
): string {
  const lines = [
    `Assist draft — ${incident.id}`,
    `Priority ${incident.priority} · ${incident.status} · ${incident.entityName}`,
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
  ];
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
): string[] {
  const actions = [
    incident.status === "new"
      ? "Take ownership and begin investigation"
      : "Advance response checklist to the next incomplete phase",
    "Review linked alerts for session status changes",
    "Update war room with containment ETA",
  ];
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
  return {
    similarAlerts,
    playbook,
    draftNotes: draftNotesForAlert(alert, similarAlerts, playbook),
    suggestedSeverity,
    suggestedPriority: null,
    nextActions: nextActionsForAlert(alert, suggestedSeverity, playbook),
  };
}

/** Deterministic demo assist — no LLM calls. */
export function buildIncidentAssist(incident: SocIncident): AssistSuggestion {
  const catalog = getAlertsFromSession();
  const seedAlert =
    incident.alertIds
      .map((id) => catalog.find((alert) => alert.id === id))
      .find(Boolean) ?? null;
  const similarAlerts = seedAlert ? findSimilarAlerts(seedAlert, 3) : [];
  const playbook = pickPlaybookForIncident(incident);
  return {
    similarAlerts,
    playbook,
    draftNotes: draftNotesForIncident(incident, playbook),
    suggestedSeverity: null,
    suggestedPriority: suggestPriority(incident),
    nextActions: nextActionsForIncident(incident, playbook),
  };
}

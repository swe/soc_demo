/**
 * Assist investigate contract — multi-hop grounded reasoning, Attack Story drafts,
 * recommended containment. Heuristic by default; model mode when gateway keys exist.
 */

import type { SocAlert } from "@/components/alerts/alerts-data";
import {
  getLinkedDevice,
  getLinkedIdentity,
} from "@/components/alerts/alerts-data";
import { getAlertFromSession } from "@/components/alerts/alerts-session";
import type { AssistSuggestion } from "@/components/assist/triage-assist";
import {
  buildAlertAssist,
  buildIncidentAssist,
} from "@/components/assist/triage-assist";
import type {
  AttackStory,
  AttackStoryAction,
  AttackStoryActionKind,
  AttackStoryClass,
} from "@/components/incidents/attack-story";
import {
  attackStoryClassLabels,
  buildAttackStory,
} from "@/components/incidents/attack-story";
import type { SocIncident } from "@/components/incidents/incidents-data";
import { runMockQuery } from "@/components/investigate/investigate-data";
import { getApprovedPlaybooks } from "@/components/playbooks/playbooks-session";
import {
  getIndicatorById,
  type Indicator,
  threatIndicators,
} from "@/components/threats/threat-shared-data";
import {
  actionCatalog,
  type ActionCatalogEntry,
  getActionCatalogEntry,
} from "@/lib/mock-api/action-catalog";
import { correlationApi } from "@/lib/mock-api/correlation";
import { DISRUPTION_CONNECTORS } from "@/lib/mock-api/incidents";

import { apiUrl, getDataPlaneMode } from "./plane";

export type AssistMode = "heuristic" | "model";

export type AssistCiteKind =
  | "alert"
  | "event"
  | "device"
  | "identity"
  | "playbook"
  | "ioc";

export type AssistEvidenceCite = {
  kind: AssistCiteKind;
  id: string;
  label: string;
  detail?: string;
};

export type AssistInvestigateHop = {
  id: string;
  question: string;
  finding: string;
  cites: AssistEvidenceCite[];
  confidence: number;
};

export type AssistRecommendedContain = {
  actionId: string;
  targetId: string;
  reason: string;
  connectorId: string;
  /** Display helpers for UI (not required by contract). */
  label?: string;
  targetLabel?: string;
};

export type AssistInvestigatePlan = {
  mode: AssistMode;
  hops: AssistInvestigateHop[];
  summary: string;
  storyClass: AttackStoryClass;
  /** Narrative text ready to apply into case notes. */
  attackStoryDraft: string;
  recommendedContain: AssistRecommendedContain[];
  /** Overall plan confidence 0–1. */
  confidence: number;
  correlationConfidence?: number;
};

export type AssistTriageResult = {
  suggestion: AssistSuggestion;
  mode: AssistMode;
  investigate?: AssistInvestigatePlan;
};

export type AssistTriageInput =
  | { kind: "alert"; alert: SocAlert }
  | { kind: "incident"; incident: SocIncident };

export type AssistInvestigateInput =
  | { kind: "alert"; alertId: string }
  | { kind: "incident"; incident: SocIncident; alerts?: SocAlert[] };

const kindToCatalogId: Record<AttackStoryActionKind, string> = {
  "isolate-host": "isolate_host",
  "disable-identity": "disable_identity",
  "require-mfa": "require_mfa",
  "revoke-sessions": "revoke_sessions",
  "collect-forensics": "collect_forensics",
  "purge-mailbox": "purge_mailbox",
  "block-url": "block_url",
};

function hasModelKeys(): boolean {
  if (typeof process === "undefined") return false;
  return Boolean(
    process.env.AI_GATEWAY_API_KEY ||
      process.env.OPENAI_API_KEY ||
      process.env.NEXT_PUBLIC_AI_GATEWAY_API_KEY,
  );
}

function inferStoryClass(
  title: string,
  tags: string[],
): AttackStoryClass {
  const blob = `${title} ${tags.join(" ")}`.toLowerCase();
  if (/ransom|encrypt/.test(blob)) return "ransomware";
  if (/bec|phish|mail|invoice/.test(blob)) return "bec-phishing";
  if (/lateral|smb|rdp/.test(blob)) return "lateral-movement";
  if (/c2|beacon|exfil/.test(blob)) return "c2-exfiltration";
  if (/cloud|iam|privilege/.test(blob)) return "cloud-privilege";
  if (/identity|okta|token|mfa/.test(blob)) return "identity-compromise";
  if (/malware|trojan|payload/.test(blob)) return "malware-execution";
  return "generic";
}

function catalogForAction(
  action: AttackStoryAction,
): ActionCatalogEntry | undefined {
  const id = kindToCatalogId[action.kind];
  return id ? getActionCatalogEntry(id) : undefined;
}

function connectorForAction(action: AttackStoryAction): string {
  const entry = catalogForAction(action);
  const preferred = entry?.connectorIds?.[0];
  if (preferred) return preferred;
  if (
    action.kind === "isolate-host" ||
    action.kind === "collect-forensics"
  ) {
    return DISRUPTION_CONNECTORS[0]?.id ?? "int-defender-endpoint";
  }
  if (action.kind === "purge-mailbox" || action.kind === "block-url") {
    return "int-mdo-email";
  }
  return DISRUPTION_CONNECTORS[2]?.id ?? "int-okta-workforce";
}

function buildRecommendedContain(
  actions: AttackStoryAction[],
): AssistRecommendedContain[] {
  return actions.map((action) => {
    const entry = catalogForAction(action);
    const actionId = entry?.id ?? kindToCatalogId[action.kind] ?? action.id;
    return {
      actionId,
      targetId: action.targetId,
      reason: `${action.label} on ${action.targetLabel} — proportionate to story class blast radius.`,
      connectorId: connectorForAction(action),
      label: entry?.label ?? action.label,
      targetLabel: action.targetLabel,
    };
  });
}

/** Resolve catalog actionId → response contain kind for mock execution. */
export function resolveContainActionKind(
  actionId: string,
): AttackStoryActionKind | null {
  const entry = getActionCatalogEntry(actionId);
  if (entry?.responseAction) return entry.responseAction;
  const byKind = (Object.entries(kindToCatalogId) as [
    AttackStoryActionKind,
    string,
  ][]).find(([, id]) => id === actionId);
  if (byKind) return byKind[0];
  if (actionCatalog.some((a) => a.id === actionId && a.responseAction)) {
    return (
      actionCatalog.find((a) => a.id === actionId)?.responseAction ?? null
    );
  }
  return null;
}

export function containTargetType(
  kind: AttackStoryActionKind,
): "device" | "identity" | "mail" | "url" {
  if (kind === "isolate-host" || kind === "collect-forensics") return "device";
  if (kind === "block-url") return "url";
  if (kind === "purge-mailbox") return "mail";
  return "identity";
}

function formatAttackStoryDraft(
  story: AttackStory,
  incident: SocIncident,
  alerts: SocAlert[],
): string {
  const mitre = story.mitreHighlights
    .slice(0, 3)
    .map((m) => `${m.tactic} / ${m.technique}`)
    .join("; ");
  const timeline = story.alertTimeline
    .slice(0, 5)
    .map(
      (row) =>
        `- ${new Date(row.at).toISOString().slice(0, 16)}Z · ${row.alertId} · ${row.title}`,
    )
    .join("\n");
  const contain = story.disruption.actions
    .map((a) => `- ${a.label} → ${a.targetLabel} (${a.targetId})`)
    .join("\n");
  const categories = story.alertCategories
    .map((c) => `${c.label}×${c.count}`)
    .join(", ");

  return [
    `## Attack Story draft — ${incident.id}`,
    `Class: ${story.storyClassLabel} · Priority assessment: ${story.priorityAssessment}`,
    `Entity: ${incident.entityName} (${incident.entityType})`,
    `Sources: ${categories || incident.primarySourceCategory}`,
    "",
    "### Narrative",
    `${incident.summary || incident.title}. Assist correlates ${alerts.length || incident.alertIds.length} linked signal(s) into a ${story.storyClass.replace(/-/g, " ")} narrative. Disruption status: ${story.disruption.status}.`,
    "",
    "### Alert timeline",
    timeline || "- (no linked alerts in session)",
    "",
    "### MITRE highlights",
    mitre || "Unmapped",
    "",
    "### Recommended containment",
    contain || "- Pending analyst selection",
    "",
    `### Playbook`,
    story.recommendedPlaybookCode
      ? `Suggested procedure ${story.recommendedPlaybookCode}.`
      : "No mapped playbook.",
    "",
    `_Heuristic draft · ${new Date().toISOString()}_`,
  ].join("\n");
}

function relatedIocs(alerts: SocAlert[], incident: SocIncident): Indicator[] {
  const alertIds = new Set(
    alerts.length > 0 ? alerts.map((a) => a.id) : incident.alertIds,
  );
  const tags = new Set(
    [
      ...incident.tags,
      ...alerts.flatMap((a) => a.tags),
      incident.storyClass ?? "",
      ...alerts.map((a) => a.sourceCategory),
    ]
      .map((t) => t.toLowerCase())
      .filter(Boolean),
  );

  const byAlert = threatIndicators.filter((ioc) =>
    ioc.relatedAlertIds.some((id) => alertIds.has(id)),
  );
  if (byAlert.length > 0) return byAlert.slice(0, 3);

  const byTag = threatIndicators.filter((ioc) =>
    ioc.tags.some((t) => tags.has(t.toLowerCase())),
  );
  if (byTag.length > 0) return byTag.slice(0, 3);

  // Stable demo fixtures when catalogs don't overlap
  return ["IOC-1001", "IOC-1002", "IOC-1005"]
    .map((id) => getIndicatorById(id))
    .filter(Boolean) as Indicator[];
}

function relatedEvents(
  incident: SocIncident,
  alerts: SocAlert[],
): ReturnType<typeof runMockQuery> {
  const entity = incident.entityName;
  const technique =
    alerts.find((a) => a.mitreTechnique)?.mitreTechnique ??
    incident.mitreTechnique ??
    "";
  const queryParts = [
    entity ? `entity.name="${entity}"` : "",
    technique ? `mitre.technique=${technique}` : "",
    incident.storyClass === "bec-phishing" ||
    /phish|bec|mail/i.test(incident.title)
      ? "email.bec OR identity.login"
      : incident.storyClass === "cloud-privilege"
        ? "cloud.role_assumption"
        : "identity.login OR process.create",
  ].filter(Boolean);
  const sourceIds = [
    ...new Set([
      incident.primarySourceId,
      ...incident.sourceIds,
      ...alerts.map((a) => a.sourceId),
    ]),
  ].filter(Boolean);
  return runMockQuery(queryParts.join(" | "), sourceIds).slice(0, 4);
}

function buildInvestigatePlan(
  incident: SocIncident,
  alerts: SocAlert[],
  correlationConfidence?: number,
  mode: AssistMode = "heuristic",
): AssistInvestigatePlan {
  const storyClass =
    incident.storyClass ??
    inferStoryClass(incident.title, incident.tags);
  const story = buildAttackStory(incident, alerts);
  const attackStoryDraft = formatAttackStoryDraft(story, incident, alerts);
  const recommendedContain = buildRecommendedContain(story.disruption.actions);
  const device = getLinkedDevice(incident.deviceId);
  const identity = getLinkedIdentity(incident.identityId);
  const events = relatedEvents(incident, alerts);
  const iocs = relatedIocs(alerts, incident);
  const playbookCode = story.recommendedPlaybookCode;
  const playbook =
    playbookCode != null
      ? getApprovedPlaybooks().find((p) => p.code === playbookCode) ?? null
      : null;

  const hops: AssistInvestigateHop[] = [
    {
      id: "hop-blast-radius",
      question: "What entity is the primary blast radius?",
      finding: `Primary entity ${incident.entityName} (${incident.entityType}) appears across ${alerts.length || incident.alertIds.length} linked signal(s)${
        device ? `; host ${device.hostname} (${device.id})` : ""
      }${identity ? `; identity ${identity.displayName} (${identity.id})` : ""}.`,
      cites: [
        ...(device
          ? [
              {
                kind: "device" as const,
                id: device.id,
                label: device.hostname,
                detail: device.platform,
              },
            ]
          : []),
        ...(identity
          ? [
              {
                kind: "identity" as const,
                id: identity.id,
                label: identity.displayName,
                detail: identity.principal,
              },
            ]
          : []),
        ...(!device && !identity
          ? [
              {
                kind: (incident.entityType === "host"
                  ? "device"
                  : "identity") as AssistCiteKind,
                id: incident.deviceId ?? incident.identityId ?? incident.id,
                label: incident.entityName,
              },
            ]
          : []),
      ],
      confidence: 0.88,
    },
    {
      id: "hop-cross-source",
      question: "Which cross-source alerts reinforce the narrative?",
      finding:
        correlationConfidence != null
          ? `Auto-correlation confidence ${(correlationConfidence * 100).toFixed(0)}% across SIEM/EDR/IdP/cloud/email · ${[...new Set(alerts.map((a) => a.sourceCategory))].join(", ") || incident.primarySourceCategory}.`
          : `Multi-source categories: ${[...new Set(alerts.map((a) => a.sourceCategory))].join(", ") || incident.primarySourceCategory}.`,
      cites: (alerts.length > 0 ? alerts : []).slice(0, 4).map((a) => ({
        kind: "alert" as const,
        id: a.id,
        label: a.title,
        detail: a.sourceName,
      })),
      confidence: correlationConfidence ?? 0.74,
    },
    {
      id: "hop-telemetry",
      question: "What raw telemetry events support the story?",
      finding:
        events.length > 0
          ? `Investigate façade returned ${events.length} supporting event(s); top hit: ${events[0]!.message.slice(0, 120)}.`
          : "No dense telemetry hits in the current pool — fall back to alert timeline.",
      cites: events.map((e) => ({
        kind: "event" as const,
        id: e.id,
        label: e.message.slice(0, 72),
        detail: `${e.sourceName} · ${e.severity}`,
      })),
      confidence: events.length > 0 ? 0.79 : 0.55,
    },
    {
      id: "hop-ioc",
      question: "Do known IOCs enrich this case?",
      finding:
        iocs.length > 0
          ? `Matched ${iocs.length} indicator(s): ${iocs.map((i) => i.value).join(", ")}.`
          : "No overlapping IOC catalog hits for this entity.",
      cites: iocs.map((ioc) => ({
        kind: "ioc" as const,
        id: ioc.id,
        label: ioc.title,
        detail: `${ioc.type}: ${ioc.value}`,
      })),
      confidence: iocs.length > 0 ? 0.81 : 0.5,
    },
    {
      id: "hop-playbook",
      question: "Which playbook outcome fits this narrative?",
      finding: playbook
        ? `${playbook.code} — ${playbook.title}. Prior outcomes for this class favor containment then evidence pack.`
        : playbookCode
          ? `Mapped procedure ${playbookCode} is not approved in this session — use generic IR.`
          : "No mapped playbook; use PB-OPS-01 triage.",
      cites: playbook
        ? [
            {
              kind: "playbook" as const,
              id: playbook.id,
              label: `${playbook.code} · ${playbook.title}`,
              detail: playbook.status,
            },
          ]
        : playbookCode
          ? [
              {
                kind: "playbook" as const,
                id: playbookCode,
                label: playbookCode,
                detail: "mapped code",
              },
            ]
          : [],
      confidence: playbook ? 0.84 : 0.62,
    },
    {
      id: "hop-contain",
      question: "What containment is proportionate?",
      finding:
        recommendedContain.length > 0
          ? `Recommend: ${recommendedContain.map((a) => a.label ?? a.actionId).join("; ")}.`
          : "Recommend identity MFA + session revoke pending analyst approval.",
      cites: recommendedContain.slice(0, 4).map((a) => ({
        kind: (a.actionId.includes("isolate") ||
        a.actionId.includes("forensic")
          ? "device"
          : "identity") as AssistCiteKind,
        id: a.targetId,
        label: a.label ?? a.actionId,
        detail: a.connectorId,
      })),
      confidence: 0.82,
    },
  ];

  // Keep 4–6 hops: drop IOC hop when story is purely generic with no iocs
  let selected = hops;
  if (storyClass === "generic" && iocs.length === 0) {
    selected = hops.filter((h) => h.id !== "hop-ioc");
  }
  if (selected.length > 6) {
    selected = selected.slice(0, 6);
  }

  const confidence =
    selected.reduce((sum, h) => sum + h.confidence, 0) / selected.length;

  return {
    mode,
    hops: selected,
    summary: `Multi-hop investigate for ${incident.id}: ${attackStoryClassLabels[storyClass]} narrative with ${selected.length} grounded hops.`,
    storyClass,
    attackStoryDraft,
    recommendedContain,
    confidence,
    correlationConfidence,
  };
}

async function heuristicTriage(
  input: AssistTriageInput,
): Promise<AssistTriageResult> {
  if (input.kind === "alert") {
    const suggestion = buildAlertAssist(input.alert);
    let correlationConfidence: number | undefined;
    try {
      const proposal = await correlationApi.propose({
        alertId: input.alert.id,
      });
      correlationConfidence = proposal.overallConfidence;
    } catch {
      /* ignore */
    }
    const synthetic = {
      id: `pending-${input.alert.id}`,
      title: input.alert.title,
      summary: input.alert.summary,
      severity: input.alert.severity === "critical" ? "critical" : "high",
      status: "new" as const,
      priority: "P2" as const,
      alertIds: [input.alert.id],
      sourceIds: [input.alert.sourceId],
      primarySourceId: input.alert.sourceId,
      primarySourceName: input.alert.sourceName,
      primarySourceCategory: input.alert.sourceCategory,
      entityType: input.alert.entityType,
      entityName: input.alert.entityName,
      deviceId: input.alert.deviceId,
      identityId: input.alert.identityId,
      assigneeId: input.alert.assigneeId,
      ownerId: null,
      createdAt: input.alert.createdAt,
      updatedAt: input.alert.updatedAt,
      ageLabel: input.alert.ageLabel,
      ageMinutes: input.alert.ageMinutes,
      riskScore: input.alert.riskScore,
      environment: input.alert.environment,
      tags: input.alert.tags,
      mitreTactic: input.alert.mitreTactic,
      mitreTechnique: input.alert.mitreTechnique,
      timeline: [],
      notes: "",
      warRoomMessages: [],
      escalatedFromAlerts: false,
      storyClass: inferStoryClass(input.alert.title, input.alert.tags),
    } satisfies SocIncident;

    return {
      suggestion,
      mode: "heuristic",
      investigate: buildInvestigatePlan(
        synthetic,
        [input.alert],
        correlationConfidence,
        "heuristic",
      ),
    };
  }

  const suggestion = buildIncidentAssist(input.incident);
  const alerts = input.incident.alertIds
    .map((id) => getAlertFromSession(id))
    .filter(Boolean) as SocAlert[];
  let correlationConfidence: number | undefined;
  try {
    const proposal = await correlationApi.propose({
      incidentId: input.incident.id,
    });
    correlationConfidence = proposal.overallConfidence;
  } catch {
    /* ignore */
  }
  return {
    suggestion,
    mode: "heuristic",
    investigate: buildInvestigatePlan(
      input.incident,
      alerts,
      correlationConfidence,
      "heuristic",
    ),
  };
}

async function liveTriage(
  input: AssistTriageInput,
): Promise<AssistTriageResult | null> {
  try {
    const res = await fetch(apiUrl("/api/v1/assist/triage"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) return null;
    return (await res.json()) as AssistTriageResult;
  } catch {
    return null;
  }
}

/**
 * Assist triage — prefers model path when keys + live plane available,
 * otherwise heuristic with investigate plan.
 */
export async function assistTriage(
  input: AssistTriageInput,
): Promise<AssistTriageResult> {
  if (getDataPlaneMode() === "live" && hasModelKeys()) {
    const live = await liveTriage(input);
    if (live) {
      return { ...live, mode: live.mode ?? "model" };
    }
  }
  const result = await heuristicTriage(input);
  if (hasModelKeys()) {
    return { ...result, mode: "heuristic" };
  }
  return result;
}

export async function assistInvestigate(
  input: AssistInvestigateInput,
): Promise<AssistInvestigatePlan> {
  if (input.kind === "alert") {
    const alert = getAlertFromSession(input.alertId);
    if (!alert) throw new Error(`Alert ${input.alertId} not found`);
    const triaged = await heuristicTriage({ kind: "alert", alert });
    if (!triaged.investigate) throw new Error("No investigate plan");
    return triaged.investigate;
  }
  const alerts =
    input.alerts ??
    (input.incident.alertIds
      .map((id) => getAlertFromSession(id))
      .filter(Boolean) as SocAlert[]);
  let correlationConfidence: number | undefined;
  try {
    const proposal = await correlationApi.propose({
      incidentId: input.incident.id,
    });
    correlationConfidence = proposal.overallConfidence;
  } catch {
    /* ignore */
  }
  return buildInvestigatePlan(
    input.incident,
    alerts,
    correlationConfidence,
    "heuristic",
  );
}

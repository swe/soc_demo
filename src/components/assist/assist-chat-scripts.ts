import type {
  AlertSeverity,
  AlertStatus,
  SocAlert,
} from "@/components/alerts/alerts-data";
import {
  buildAlertAssist,
  buildIncidentAssist,
} from "@/components/assist/triage-assist";
import type {
  IncidentPriority,
  SocIncident,
} from "@/components/incidents/incidents-data";

export type AssistChatPromptId =
  | "summarize"
  | "why-correlated"
  | "next-actions"
  | "exec-update";

export type AssistChatApplyAction =
  | { type: "apply_notes"; label: string; notes: string }
  | {
      type: "suggest_severity";
      label: string;
      severity: AlertSeverity;
    }
  | {
      type: "suggest_priority";
      label: string;
      priority: IncidentPriority;
    }
  | {
      type: "run_playbook";
      label: string;
      playbookId: string;
      playbookCode: string;
      href: string;
    }
  | {
      type: "open_investigate";
      label: string;
      query: string;
    }
  | {
      type: "apply_all";
      label: string;
      notes: string;
      confidence: number;
      status?: AlertStatus;
      playbookHint?: {
        playbookId: string;
        playbookCode: string;
        title: string;
        href: string;
      };
    };

export type AssistChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  confidence?: number;
  actions?: AssistChatApplyAction[];
};

export type AssistChatContext = {
  kind: "alert" | "incident" | "investigate";
  alert?: SocAlert;
  incident?: SocIncident;
  investigateQuery?: string;
};

export const assistChatPrompts: {
  id: AssistChatPromptId;
  label: string;
  short: string;
}[] = [
  { id: "summarize", label: "Summarize", short: "Summarize this case" },
  {
    id: "why-correlated",
    label: "Why correlated?",
    short: "Why was this correlated?",
  },
  {
    id: "next-actions",
    label: "Next 3 actions",
    short: "What are the next 3 actions?",
  },
  {
    id: "exec-update",
    label: "Draft exec update",
    short: "Draft an executive update",
  },
];

function subjectLabel(ctx: AssistChatContext) {
  if (ctx.alert) return ctx.alert.id;
  if (ctx.incident) return ctx.incident.id;
  return "investigation";
}

function investigateQueryFor(ctx: AssistChatContext) {
  if (ctx.investigateQuery?.trim()) return ctx.investigateQuery.trim();
  if (ctx.alert) {
    return `events | where entity.name == "${ctx.alert.entityName}" or alert.id == "${ctx.alert.id}" | take 50`;
  }
  if (ctx.incident) {
    return `events | where incident.id == "${ctx.incident.id}" or entity.name == "${ctx.incident.entityName}" | take 50`;
  }
  return "events | take 50";
}

function buildSummarize(ctx: AssistChatContext): AssistChatMessage {
  if (ctx.alert) {
    const assist = buildAlertAssist(ctx.alert);
    const content = [
      `**${ctx.alert.id}** — ${ctx.alert.title}`,
      "",
      `${ctx.alert.severity.toUpperCase()} · ${ctx.alert.status} · risk ${ctx.alert.riskScore} · confidence ${ctx.alert.confidence}%`,
      `Assist package confidence: **${assist.confidence}%**`,
      `Entity: ${ctx.alert.entityName} (${ctx.alert.entityType}) via ${ctx.alert.sourceName}`,
      ctx.alert.mitreTechnique
        ? `MITRE: ${ctx.alert.mitreTactic ?? "—"} / ${ctx.alert.mitreTechnique}`
        : "MITRE: unmapped",
      "",
      ctx.alert.summary,
      "",
      `Recommended: ${ctx.alert.recommendedAction}`,
    ].join("\n");

    const actions: AssistChatApplyAction[] = [
      {
        type: "apply_all",
        label: `Apply all (${assist.confidence}%)`,
        notes: assist.investigationDraft || assist.draftNotes,
        confidence: assist.confidence,
        status: assist.suggestedStatus ?? undefined,
        playbookHint: assist.playbook
          ? {
              playbookId: assist.playbook.id,
              playbookCode: assist.playbook.code,
              title: assist.playbook.title,
              href: assist.playbook.href,
            }
          : undefined,
      },
      {
        type: "apply_notes",
        label: "Apply notes",
        notes: assist.draftNotes,
      },
      {
        type: "open_investigate",
        label: "Open Investigate",
        query: investigateQueryFor(ctx),
      },
    ];
    if (assist.suggestedSeverity && assist.suggestedSeverity !== ctx.alert.severity) {
      actions.splice(2, 0, {
        type: "suggest_severity",
        label: `Suggest ${assist.suggestedSeverity}`,
        severity: assist.suggestedSeverity,
      });
    }
    return {
      id: `asst-sum-${ctx.alert.id}`,
      role: "assistant",
      content,
      confidence: assist.confidence,
      actions,
    };
  }

  if (ctx.incident) {
    const assist = buildIncidentAssist(ctx.incident);
    const content = [
      `**${ctx.incident.id}** — ${ctx.incident.title}`,
      "",
      `${ctx.incident.priority} · ${ctx.incident.severity} · ${ctx.incident.status}`,
      `Assist package confidence: **${assist.confidence}%**`,
      `Entity: ${ctx.incident.entityName} · ${ctx.incident.alertIds.length} linked alerts`,
      ctx.incident.mitreTechnique
        ? `MITRE: ${ctx.incident.mitreTactic ?? "—"} / ${ctx.incident.mitreTechnique}`
        : "MITRE: unmapped",
      "",
      ctx.incident.summary,
    ].join("\n");

    const actions: AssistChatApplyAction[] = [
      {
        type: "apply_all",
        label: `Apply all (${assist.confidence}%)`,
        notes: assist.investigationDraft || assist.draftNotes,
        confidence: assist.confidence,
        playbookHint: assist.playbook
          ? {
              playbookId: assist.playbook.id,
              playbookCode: assist.playbook.code,
              title: assist.playbook.title,
              href: assist.playbook.href,
            }
          : undefined,
      },
      {
        type: "apply_notes",
        label: "Apply notes",
        notes: assist.draftNotes,
      },
      {
        type: "open_investigate",
        label: "Open Investigate",
        query: investigateQueryFor(ctx),
      },
    ];
    if (
      assist.suggestedPriority &&
      assist.suggestedPriority !== ctx.incident.priority
    ) {
      actions.splice(2, 0, {
        type: "suggest_priority",
        label: `Suggest ${assist.suggestedPriority}`,
        priority: assist.suggestedPriority,
      });
    }
    return {
      id: `asst-sum-${ctx.incident.id}`,
      role: "assistant",
      content,
      confidence: assist.confidence,
      actions,
    };
  }

  return {
    id: "asst-sum-inv",
    role: "assistant",
    content: [
      "Investigation workspace summary",
      "",
      `Active query: \`${ctx.investigateQuery || "(empty)"}\``,
      "",
      "Use prompts to draft next steps or open a tightened Investigate query against correlated entities.",
    ].join("\n"),
    confidence: 62,
    actions: [
      {
        type: "open_investigate",
        label: "Re-run Investigate",
        query: investigateQueryFor(ctx),
      },
    ],
  };
}

function buildWhyCorrelated(ctx: AssistChatContext): AssistChatMessage {
  if (ctx.alert) {
    const assist = buildAlertAssist(ctx.alert);
    const similar =
      assist.similarAlerts.length > 0
        ? assist.similarAlerts
            .map((row) => `• ${row.id} — ${row.matchReason}`)
            .join("\n")
        : "• No strong catalog peers; correlation is rule + entity driven.";
    return {
      id: `asst-why-${ctx.alert.id}`,
      role: "assistant",
      content: [
        `Why ${ctx.alert.id} sits in this cluster:`,
        "",
        `1. Same detection family: **${ctx.alert.ruleName}**`,
        `2. Shared entity surface: **${ctx.alert.entityName}**`,
        ctx.alert.mitreTechnique
          ? `3. MITRE overlap on **${ctx.alert.mitreTechnique}**`
          : "3. Source-category affinity within the session catalog",
        "",
        "Nearest peers:",
        similar,
      ].join("\n"),
      actions: [
        {
          type: "apply_notes",
          label: "Apply correlation notes",
          notes: [
            `Correlation rationale — ${ctx.alert.id}`,
            `Rule: ${ctx.alert.ruleName}`,
            `Entity: ${ctx.alert.entityName}`,
            ...assist.similarAlerts.map(
              (row) => `- Peer ${row.id}: ${row.matchReason}`,
            ),
          ].join("\n"),
        },
        {
          type: "open_investigate",
          label: "Pivot Investigate",
          query: investigateQueryFor(ctx),
        },
      ],
    };
  }

  if (ctx.incident) {
    const assist = buildIncidentAssist(ctx.incident);
    return {
      id: `asst-why-${ctx.incident.id}`,
      role: "assistant",
      content: [
        `Why alerts were correlated into ${ctx.incident.id}:`,
        "",
        `• Shared entity **${ctx.incident.entityName}** across ${ctx.incident.alertIds.length} alerts`,
        `• Source set: ${ctx.incident.sourceIds.slice(0, 4).join(", ") || "session sources"}`,
        ctx.incident.mitreTactic
          ? `• Tactic chain centered on **${ctx.incident.mitreTactic}**`
          : "• Temporal clustering within the IR window",
        ctx.incident.escalatedFromAlerts
          ? "• Case opened from alert escalation path"
          : "• Auto-correlated IR case from multi-alert story",
        "",
        assist.similarAlerts.length
          ? `Nearby catalog alerts:\n${assist.similarAlerts.map((r) => `• ${r.id}`).join("\n")}`
          : "No additional catalog peers beyond linked alerts.",
      ].join("\n"),
      actions: [
        {
          type: "apply_notes",
          label: "Apply notes",
          notes: assist.draftNotes,
        },
        {
          type: "open_investigate",
          label: "Open Investigate",
          query: investigateQueryFor(ctx),
        },
      ],
    };
  }

  return {
    id: "asst-why-inv",
    role: "assistant",
    content:
      "Investigate results are correlated by entity overlap, source family, and MITRE technique when present. Tighten the query with `| where entity.name == …` to isolate the cluster.",
    actions: [
      {
        type: "open_investigate",
        label: "Open Investigate",
        query: investigateQueryFor(ctx),
      },
    ],
  };
}

function buildNextActions(ctx: AssistChatContext): AssistChatMessage {
  if (ctx.alert) {
    const assist = buildAlertAssist(ctx.alert);
    const top = assist.nextActions.slice(0, 3);
    const actions: AssistChatApplyAction[] = [
      {
        type: "apply_all",
        label: `Apply all (${assist.confidence}%)`,
        notes: [
          assist.investigationDraft,
          "",
          "Next actions:",
          ...top.map((a, i) => `${i + 1}. ${a}`),
        ].join("\n"),
        confidence: assist.confidence,
        status: assist.suggestedStatus ?? undefined,
        playbookHint: assist.playbook
          ? {
              playbookId: assist.playbook.id,
              playbookCode: assist.playbook.code,
              title: assist.playbook.title,
              href: assist.playbook.href,
            }
          : undefined,
      },
      {
        type: "apply_notes",
        label: "Apply action plan",
        notes: [`Next actions — ${ctx.alert.id}`, ...top.map((a, i) => `${i + 1}. ${a}`)].join(
          "\n",
        ),
      },
    ];
    if (assist.playbook) {
      actions.push({
        type: "run_playbook",
        label: `Run ${assist.playbook.code}`,
        playbookId: assist.playbook.id,
        playbookCode: assist.playbook.code,
        href: assist.playbook.href,
      });
    }
    actions.push({
      type: "open_investigate",
      label: "Open Investigate",
      query: investigateQueryFor(ctx),
    });
    return {
      id: `asst-next-${ctx.alert.id}`,
      role: "assistant",
      content: [
        `Next 3 actions for ${ctx.alert.id} (confidence ${assist.confidence}%):`,
        "",
        ...top.map((action, i) => `${i + 1}. ${action}`),
      ].join("\n"),
      confidence: assist.confidence,
      actions,
    };
  }

  if (ctx.incident) {
    const assist = buildIncidentAssist(ctx.incident);
    const top = assist.nextActions.slice(0, 3);
    const actions: AssistChatApplyAction[] = [
      {
        type: "apply_all",
        label: `Apply all (${assist.confidence}%)`,
        notes: [
          assist.investigationDraft,
          "",
          "Next actions:",
          ...top.map((a, i) => `${i + 1}. ${a}`),
        ].join("\n"),
        confidence: assist.confidence,
        playbookHint: assist.playbook
          ? {
              playbookId: assist.playbook.id,
              playbookCode: assist.playbook.code,
              title: assist.playbook.title,
              href: assist.playbook.href,
            }
          : undefined,
      },
      {
        type: "apply_notes",
        label: "Apply action plan",
        notes: [
          `Next actions — ${ctx.incident.id}`,
          ...top.map((a, i) => `${i + 1}. ${a}`),
        ].join("\n"),
      },
    ];
    if (assist.playbook) {
      actions.push({
        type: "run_playbook",
        label: `Run ${assist.playbook.code}`,
        playbookId: assist.playbook.id,
        playbookCode: assist.playbook.code,
        href: assist.playbook.href,
      });
    }
    actions.push({
      type: "open_investigate",
      label: "Open Investigate",
      query: investigateQueryFor(ctx),
    });
    return {
      id: `asst-next-${ctx.incident.id}`,
      role: "assistant",
      content: [
        `Next 3 actions for ${ctx.incident.id} (confidence ${assist.confidence}%):`,
        "",
        ...top.map((action, i) => `${i + 1}. ${action}`),
      ].join("\n"),
      confidence: assist.confidence,
      actions,
    };
  }

  return {
    id: "asst-next-inv",
    role: "assistant",
    content: [
      "Next 3 actions for this investigation:",
      "",
      "1. Validate entity context for top result rows",
      "2. Save the query if it should become a detection hypothesis",
      "3. Open as alert when a confirmed malicious pattern emerges",
    ].join("\n"),
    confidence: 58,
    actions: [
      {
        type: "open_investigate",
        label: "Open Investigate",
        query: investigateQueryFor(ctx),
      },
    ],
  };
}

function buildExecUpdate(ctx: AssistChatContext): AssistChatMessage {
  const when = new Date().toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  if (ctx.alert) {
    const assist = buildAlertAssist(ctx.alert);
    const notes = [
      `Executive update — ${when}`,
      `Subject: ${ctx.alert.id} (${ctx.alert.severity.toUpperCase()})`,
      "",
      `Situation: ${ctx.alert.title} against ${ctx.alert.entityName}.`,
      `Impact: ${ctx.alert.summary}`,
      `Response: Triage in progress; ${assist.playbook ? `playbook ${assist.playbook.code} recommended` : "no playbook linked yet"}.`,
      `Ask: Confirm severity posture and escalation threshold.`,
    ].join("\n");
    return {
      id: `asst-exec-${ctx.alert.id}`,
      role: "assistant",
      content: notes,
      actions: [
        { type: "apply_notes", label: "Apply to notes", notes },
        {
          type: "open_investigate",
          label: "Open Investigate",
          query: investigateQueryFor(ctx),
        },
      ],
    };
  }

  if (ctx.incident) {
    const assist = buildIncidentAssist(ctx.incident);
    const notes = [
      `Executive update — ${when}`,
      `Subject: ${ctx.incident.id} (${ctx.incident.priority} / ${ctx.incident.severity})`,
      "",
      `Situation: ${ctx.incident.title} affecting ${ctx.incident.entityName}.`,
      `Scope: ${ctx.incident.alertIds.length} linked alerts · status ${ctx.incident.status}.`,
      `Impact: ${ctx.incident.summary}`,
      `Response: ${assist.playbook ? `Executing toward ${assist.playbook.code}` : "IR checklist advancing"}; containment ETA pending.`,
      `Ask: Confirm stakeholder notification and business impact rating.`,
    ].join("\n");
    return {
      id: `asst-exec-${ctx.incident.id}`,
      role: "assistant",
      content: notes,
      actions: [
        { type: "apply_notes", label: "Apply to notes", notes },
        {
          type: "open_investigate",
          label: "Open Investigate",
          query: investigateQueryFor(ctx),
        },
      ],
    };
  }

  const notes = [
    `Executive update — ${when}`,
    "Subject: Ad-hoc investigation",
    "",
    `Situation: Analyst investigating query \`${ctx.investigateQuery || "(none)"}\`.`,
    "Impact: TBD pending entity validation.",
    "Response: Assist drafted this update from the current investigation context.",
  ].join("\n");

  return {
    id: "asst-exec-inv",
    role: "assistant",
    content: notes,
    actions: [
      {
        type: "open_investigate",
        label: "Open Investigate",
        query: investigateQueryFor(ctx),
      },
    ],
  };
}

/** Deterministic multi-turn reply — no LLM. */
export function buildAssistChatReply(
  promptId: AssistChatPromptId,
  ctx: AssistChatContext,
): { user: AssistChatMessage; assistant: AssistChatMessage } {
  const prompt = assistChatPrompts.find((p) => p.id === promptId)!;
  const user: AssistChatMessage = {
    id: `user-${promptId}-${Date.now()}`,
    role: "user",
    content: prompt.short,
  };

  let assistant: AssistChatMessage;
  switch (promptId) {
    case "summarize":
      assistant = buildSummarize(ctx);
      break;
    case "why-correlated":
      assistant = buildWhyCorrelated(ctx);
      break;
    case "next-actions":
      assistant = buildNextActions(ctx);
      break;
    case "exec-update":
      assistant = buildExecUpdate(ctx);
      break;
  }

  return {
    user,
    assistant: {
      ...assistant,
      id: `${assistant.id}-${Date.now()}`,
    },
  };
}

export function assistChatGreeting(ctx: AssistChatContext): AssistChatMessage {
  return {
    id: `greet-${subjectLabel(ctx)}`,
    role: "assistant",
    content: [
      `Heimdall Assist ready for **${subjectLabel(ctx)}**.`,
      "",
      "Pick a prompt or ask for a summary.",
    ].join("\n"),
  };
}

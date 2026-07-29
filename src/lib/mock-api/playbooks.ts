/**
 * Extended SOAR runtime: durable-shaped runs with branches, retries, SLA timers,
 * and a global approval queue. Containment still calls response/actions.
 */

import type { SocAlert } from "@/components/alerts/alerts-data";
import { getAlertFromSession } from "@/components/alerts/alerts-session";
import type { SocIncident } from "@/components/incidents/incidents-data";
import { getIncidentFromSession } from "@/components/incidents/incidents-session";
import type { KbProcedure } from "@/components/knowledge-base/knowledge-base-data";
import {
  getPlaybook,
  getPlaybooks,
  runPlaybookAgainstIncident,
  runPlaybookFromAlert,
  type RunPlaybookResult,
} from "@/components/playbooks/playbooks-session";
import { appendResponseReceipts } from "@/lib/api-adapters/receipt-store";
import { containAction } from "@/lib/api-adapters/response";

import {
  actionCatalog,
  type ActionCatalogEntry,
  getActionCatalogEntry,
} from "./action-catalog";
import { auditFromReceipt } from "./audit";
import { mockDelay } from "./delay";
import { incidentsApi } from "./incidents";
import { type ActionReceipt, type ListResult, makeReceipt } from "./types";

/** Demo-grade notify receipts for Slack / Teams / PagerDuty catalog actions. */
function notifyActionReceipt(
  actionId: string,
  incidentId: string,
  procedureTitle: string,
  at: string,
): ActionReceipt | null {
  const stamp = Date.now().toString(36).toUpperCase();
  if (actionId === "slack") {
    return makeReceipt({
      at,
      outcome: "simulated",
      message: `Posted playbook update to Slack #inc-critical for ${incidentId}`,
      connectorId: "int-slack",
      connectorName: "Slack",
      targetType: "incident",
      targetId: incidentId,
      detail: `channel=#inc-critical; mention=@oncall; playbook=${procedureTitle}`,
      externalRef: `SLACK-${stamp}`,
    });
  }
  if (actionId === "teams") {
    return makeReceipt({
      at,
      outcome: "simulated",
      message: `Posted adaptive card to Teams “SOC War Room” for ${incidentId}`,
      connectorId: "int-teams",
      connectorName: "Microsoft Teams",
      targetType: "incident",
      targetId: incidentId,
      detail: `team=Security Operations; channel=SOC War Room; playbook=${procedureTitle}`,
      externalRef: `TEAMS-${stamp}`,
    });
  }
  if (actionId === "pagerduty" || actionId === "email_notify") {
    return makeReceipt({
      at,
      outcome: "simulated",
      message:
        actionId === "pagerduty"
          ? `Paged on-call via PagerDuty for ${incidentId}`
          : `Emailed stakeholders for ${incidentId}`,
      connectorId: actionId === "pagerduty" ? "int-pagerduty" : undefined,
      connectorName: actionId === "pagerduty" ? "PagerDuty" : "Email",
      targetType: "incident",
      targetId: incidentId,
      detail: `playbook=${procedureTitle}; action=${actionId}`,
      externalRef:
        actionId === "pagerduty" ? `PD-${stamp}` : `MAIL-${stamp}`,
    });
  }
  if (actionId === "war_room_post") {
    return makeReceipt({
      at,
      outcome: "ok",
      message: `War room update posted for ${incidentId}`,
      targetType: "incident",
      targetId: incidentId,
      detail: `playbook=${procedureTitle}`,
      externalRef: `WR-${stamp}`,
    });
  }
  if (actionId === "itsm_create" || actionId === "itsm_update") {
    return makeReceipt({
      at,
      outcome: "simulated",
      message: `Synced ITSM ticket for ${incidentId}`,
      connectorId: "int-servicenow",
      connectorName: "ServiceNow",
      targetType: "incident",
      targetId: incidentId,
      detail: `playbook=${procedureTitle}`,
      externalRef: `SNOW-${stamp}`,
    });
  }
  return null;
}

export type PlaybookRunStepStatus =
  | "pending"
  | "running"
  | "awaiting_approval"
  | "approved"
  | "rejected"
  | "succeeded"
  | "failed"
  | "skipped"
  | "retrying"
  | "waiting_sla";

export type PlaybookRunStep = {
  id: string;
  label: string;
  status: PlaybookRunStepStatus;
  actionId?: string;
  branchId?: string;
  attempt?: number;
  maxAttempts?: number;
  slaDeadlineAt?: string;
  receipt?: ActionReceipt;
};

export type PlaybookRunBranch = {
  id: string;
  label: string;
  status: "pending" | "running" | "succeeded" | "failed" | "skipped";
  stepIds: string[];
};

export type PlaybookRun = {
  id: string;
  procedureId: string;
  procedureTitle: string;
  incidentId: string;
  status:
    | "running"
    | "awaiting_approval"
    | "completed"
    | "rejected"
    | "failed"
    | "waiting_sla";
  steps: PlaybookRunStep[];
  branches: PlaybookRunBranch[];
  createdAt: string;
  updatedAt: string;
  slaEscalateAt?: string;
};

export type ApprovalQueueItem = {
  id: string;
  runId: string;
  stepId: string;
  procedureTitle: string;
  incidentId: string;
  actionLabel: string;
  actionId?: string;
  requestedAt: string;
  slaDeadlineAt?: string;
};

const runs = new Map<string, PlaybookRun>();
const runListeners = new Set<() => void>();

function emitRuns() {
  for (const listener of runListeners) listener();
}

export function subscribePlaybookRuns(listener: () => void) {
  runListeners.add(listener);
  return () => {
    runListeners.delete(listener);
  };
}

export function getPlaybookRuns(): PlaybookRun[] {
  return Array.from(runs.values()).sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
}

export function getPlaybookRun(id: string): PlaybookRun | null {
  return runs.get(id) ?? null;
}

function setRun(run: PlaybookRun) {
  runs.set(run.id, run);
  emitRuns();
}

function buildDefaultGraph(procedureTitle: string): {
  steps: PlaybookRunStep[];
  branches: PlaybookRunBranch[];
  status: PlaybookRun["status"];
  slaEscalateAt: string;
} {
  const at = Date.now();
  const slaEscalateAt = new Date(at + 1000 * 60 * 30).toISOString();
  const branchA: PlaybookRunBranch = {
    id: "branch-contain",
    label: "Containment",
    status: "running",
    stepIds: ["step-enrich", "step-approve", "step-contain"],
  };
  const branchB: PlaybookRunBranch = {
    id: "branch-notify",
    label: "Notify + ITSM",
    status: "pending",
    stepIds: [
      "step-slack",
      "step-teams",
      "step-pagerduty",
      "step-itsm",
      "step-join",
    ],
  };
  const steps: PlaybookRunStep[] = [
    {
      id: "step-enrich",
      label: "Enrich case context",
      status: "succeeded",
      actionId: "enrich_ti",
      branchId: "branch-contain",
      attempt: 1,
      maxAttempts: 3,
    },
    {
      id: "step-approve",
      label: "Approval gate",
      status: "awaiting_approval",
      actionId: "approval",
      branchId: "branch-contain",
      attempt: 1,
      maxAttempts: 1,
      slaDeadlineAt: slaEscalateAt,
    },
    {
      id: "step-contain",
      label: "Containment action",
      status: "pending",
      actionId: "isolate_host",
      branchId: "branch-contain",
      attempt: 0,
      maxAttempts: 3,
    },
    {
      id: "step-slack",
      label: "Notify war room (Slack)",
      status: "pending",
      actionId: "slack",
      branchId: "branch-notify",
      attempt: 0,
      maxAttempts: 2,
    },
    {
      id: "step-teams",
      label: "Notify Teams channel",
      status: "pending",
      actionId: "teams",
      branchId: "branch-notify",
      attempt: 0,
      maxAttempts: 2,
    },
    {
      id: "step-pagerduty",
      label: "Page on-call (PagerDuty)",
      status: "pending",
      actionId: "pagerduty",
      branchId: "branch-notify",
      attempt: 0,
      maxAttempts: 2,
    },
    {
      id: "step-itsm",
      label: "Create / update ITSM ticket",
      status: "pending",
      actionId: "itsm_create",
      branchId: "branch-notify",
      attempt: 0,
      maxAttempts: 2,
    },
    {
      id: "step-join",
      label: "Join branches + evidence",
      status: "pending",
      branchId: "branch-notify",
      attempt: 0,
      maxAttempts: 1,
    },
    {
      id: "step-sla",
      label: `SLA timer — ${procedureTitle}`,
      status: "pending",
      actionId: "wait_sla",
      attempt: 0,
      maxAttempts: 1,
      slaDeadlineAt: slaEscalateAt,
    },
  ];
  return {
    steps,
    branches: [branchA, branchB],
    status: "awaiting_approval",
    slaEscalateAt,
  };
}

function approvalQueueFromRuns(): ApprovalQueueItem[] {
  const items: ApprovalQueueItem[] = [];
  for (const run of runs.values()) {
    for (const step of run.steps) {
      if (step.status !== "awaiting_approval") continue;
      items.push({
        id: `apq-${run.id}-${step.id}`,
        runId: run.id,
        stepId: step.id,
        procedureTitle: run.procedureTitle,
        incidentId: run.incidentId,
        actionLabel: step.label,
        actionId: step.actionId,
        requestedAt: run.updatedAt,
        slaDeadlineAt: step.slaDeadlineAt ?? run.slaEscalateAt,
      });
    }
  }
  return items.sort((a, b) => b.requestedAt.localeCompare(a.requestedAt));
}

export const playbooksApi = {
  async list(): Promise<ListResult<KbProcedure>> {
    await mockDelay(60);
    const items = getPlaybooks();
    return { items, total: items.length };
  },

  async get(id: string): Promise<KbProcedure | null> {
    await mockDelay(40);
    return getPlaybook(id);
  },

  async listActions(): Promise<ListResult<ActionCatalogEntry>> {
    await mockDelay(40);
    return { items: actionCatalog, total: actionCatalog.length };
  },

  async listApprovals(): Promise<ListResult<ApprovalQueueItem>> {
    await mockDelay(50);
    const items = approvalQueueFromRuns();
    return { items, total: items.length };
  },

  /**
   * Starts a stepped run with parallel branches and an approval gate.
   */
  async startRun(input: {
    procedureId: string;
    incidentId?: string;
    alertId?: string;
  }): Promise<{ run: PlaybookRun; receipt: ActionReceipt }> {
    await mockDelay(160);
    const procedure = getPlaybook(input.procedureId);
    if (!procedure) throw new Error(`Playbook ${input.procedureId} not found`);

    let incidentId = input.incidentId;
    if (!incidentId && input.alertId) {
      incidentId = `pending-alert:${input.alertId}`;
    }
    if (!incidentId) throw new Error("incidentId or alertId required");

    const at = new Date().toISOString();
    const graph = buildDefaultGraph(procedure.title);
    const run: PlaybookRun = {
      id: `pbr-${Date.now().toString(36)}`,
      procedureId: procedure.id,
      procedureTitle: procedure.title,
      incidentId,
      status: graph.status,
      createdAt: at,
      updatedAt: at,
      steps: graph.steps,
      branches: graph.branches,
      slaEscalateAt: graph.slaEscalateAt,
    };
    setRun(run);

    const receipt = makeReceipt({
      outcome: "simulated",
      message: `Playbook “${procedure.title}” awaiting approval (parallel branches)`,
      targetType: "playbook",
      targetId: procedure.id,
      detail: `run=${run.id}; branches=${run.branches.length}`,
    });
    auditFromReceipt(receipt, "playbook.run_started", "playbook");
    return { run, receipt };
  },

  async retryStep(
    runId: string,
    stepId: string,
  ): Promise<{ run: PlaybookRun; receipt: ActionReceipt }> {
    await mockDelay(100);
    const run = runs.get(runId);
    if (!run) throw new Error(`Run ${runId} not found`);
    const step = run.steps.find((s) => s.id === stepId);
    if (!step) throw new Error(`Step ${stepId} not found`);
    const max = step.maxAttempts ?? 3;
    const attempt = (step.attempt ?? 0) + 1;
    if (attempt > max) {
      throw new Error(`Step ${stepId} exhausted retries (${max})`);
    }
    const next: PlaybookRun = {
      ...run,
      updatedAt: new Date().toISOString(),
      steps: run.steps.map((s) =>
        s.id === stepId
          ? {
              ...s,
              status: "retrying",
              attempt,
            }
          : s,
      ),
    };
    // Simulate retry success for demo
    next.steps = next.steps.map((s) =>
      s.id === stepId
        ? {
            ...s,
            status: "succeeded",
            receipt: makeReceipt({
              outcome: "simulated",
              message: `Retry ${attempt}/${max} succeeded for ${s.label}`,
              targetType: "playbook",
              targetId: run.procedureId,
            }),
          }
        : s,
    );
    setRun(next);
    const receipt = makeReceipt({
      outcome: "simulated",
      message: `Retried step “${step.label}” (attempt ${attempt})`,
      targetType: "playbook",
      targetId: run.procedureId,
      detail: `run=${runId}; step=${stepId}`,
    });
    auditFromReceipt(receipt, "playbook.step_retry", "playbook");
    return { run: next, receipt };
  },

  async approveRun(runId: string): Promise<{
    run: PlaybookRun;
    result: RunPlaybookResult;
    receipt: ActionReceipt;
  }> {
    await mockDelay(220);
    const run = runs.get(runId);
    if (!run) throw new Error(`Run ${runId} not found`);
    if (run.status !== "awaiting_approval") {
      throw new Error(`Run ${runId} is not awaiting approval`);
    }

    const procedure = getPlaybook(run.procedureId);
    if (!procedure) throw new Error("Playbook missing");

    let result: RunPlaybookResult;
    if (run.incidentId.startsWith("pending-alert:")) {
      const alertId = run.incidentId.slice("pending-alert:".length);
      const alert = getAlertFromSession(alertId);
      if (!alert) throw new Error(`Alert ${alertId} not found`);
      result = runPlaybookFromAlert(
        run.procedureId,
        alert,
        getIncidentFromSession,
        (ids, patch) => {
          incidentsApi.patchSync(ids, patch);
        },
      );
      run.incidentId = result.incidentId;
    } else {
      const incident = getIncidentFromSession(run.incidentId);
      if (!incident) throw new Error(`Incident ${run.incidentId} not found`);
      result = runPlaybookAgainstIncident(
        run.procedureId,
        incident,
        (ids, patch) => {
          incidentsApi.patchSync(ids, patch);
        },
      );
    }

    const at = new Date().toISOString();
    const incidentAfter = getIncidentFromSession(result.incidentId);
    const containReceipt = await containAction({
      action: incidentAfter?.deviceId ? "isolate-host" : "require-mfa",
      targetType: incidentAfter?.deviceId ? "device" : "identity",
      targetId:
        incidentAfter?.deviceId ??
        incidentAfter?.identityId ??
        "dev-ep-01",
      targetLabel:
        incidentAfter?.entityName ?? incidentAfter?.deviceId ?? "primary target",
      connectorId: incidentAfter?.deviceId
        ? "int-defender-endpoint"
        : "int-okta-workforce",
      incidentId: result.incidentId,
    });

    const stepReceipt = makeReceipt({
      at,
      outcome: containReceipt.outcome,
      message: `Containment: ${containReceipt.message}`,
      targetType: "playbook",
      targetId: procedure.id,
      connectorId: containReceipt.connectorId ?? "int-heimdall-soar",
      connectorName: containReceipt.connectorName ?? "Heimdall SOAR",
      detail: containReceipt.detail,
    });
    auditFromReceipt(stepReceipt, "playbook.containment", "playbook");

    const notifyReceipts: ActionReceipt[] = [];
    const next: PlaybookRun = {
      ...run,
      status: "completed",
      updatedAt: at,
      branches: run.branches.map((b) => ({ ...b, status: "succeeded" })),
      steps: run.steps.map((step) => {
        if (step.status === "awaiting_approval") {
          return { ...step, status: "succeeded", receipt: stepReceipt };
        }
        if (
          step.status === "pending" ||
          step.status === "approved" ||
          step.status === "waiting_sla"
        ) {
          const notifyReceipt =
            step.actionId != null
              ? notifyActionReceipt(
                  step.actionId,
                  result.incidentId,
                  procedure.title,
                  at,
                )
              : null;
          if (notifyReceipt) {
            notifyReceipts.push(notifyReceipt);
            auditFromReceipt(
              notifyReceipt,
              `playbook.notify.${step.actionId}`,
              "incident",
            );
          }
          const containStepReceipt =
            step.actionId === "isolate_host" ||
            step.actionId === "disable_identity" ||
            step.actionId === "require_mfa"
              ? stepReceipt
              : undefined;
          return {
            ...step,
            status: "succeeded",
            attempt: (step.attempt ?? 0) + 1,
            receipt: notifyReceipt ?? containStepReceipt ?? step.receipt,
          };
        }
        return step;
      }),
    };
    setRun(next);
    if (notifyReceipts.length > 0) {
      appendResponseReceipts(notifyReceipts);
    }

    const receipt = makeReceipt({
      at,
      outcome: "simulated",
      message: `Playbook run approved and completed → ${next.incidentId}${
        notifyReceipts.length > 0
          ? ` · ${notifyReceipts.length} notify receipt(s)`
          : ""
      }`,
      targetType: "playbook",
      targetId: procedure.id,
      detail: `run=${runId}; notify=${notifyReceipts
        .map((r) => r.externalRef ?? r.id)
        .join(",")}`,
    });
    auditFromReceipt(receipt, "playbook.run_approved", "playbook");
    return { run: next, result, receipt };
  },

  async rejectRun(
    runId: string,
  ): Promise<{ run: PlaybookRun; receipt: ActionReceipt }> {
    await mockDelay(100);
    const run = runs.get(runId);
    if (!run) throw new Error(`Run ${runId} not found`);
    const at = new Date().toISOString();
    const next: PlaybookRun = {
      ...run,
      status: "rejected",
      updatedAt: at,
      branches: run.branches.map((b) =>
        b.status === "running" || b.status === "pending"
          ? { ...b, status: "skipped" }
          : b,
      ),
      steps: run.steps.map((step) =>
        step.status === "awaiting_approval" ||
        step.status === "pending" ||
        step.status === "waiting_sla"
          ? { ...step, status: "rejected" }
          : step,
      ),
    };
    setRun(next);
    const receipt = makeReceipt({
      at,
      outcome: "ok",
      message: `Playbook run rejected`,
      targetType: "playbook",
      targetId: run.procedureId,
      detail: `run=${runId}`,
    });
    auditFromReceipt(receipt, "playbook.run_rejected", "playbook");
    return { run: next, receipt };
  },

  async runImmediate(input: {
    procedureId: string;
    incident?: SocIncident;
    alert?: SocAlert;
  }): Promise<{ result: RunPlaybookResult; receipt: ActionReceipt }> {
    const { run, receipt: startReceipt } = await this.startRun({
      procedureId: input.procedureId,
      incidentId: input.incident?.id,
      alertId: input.alert?.id,
    });
    void startReceipt;
    const approved = await this.approveRun(run.id);
    return { result: approved.result, receipt: approved.receipt };
  },

  resolveAction(actionId: string): ActionCatalogEntry | null {
    return getActionCatalogEntry(actionId) ?? null;
  },
};

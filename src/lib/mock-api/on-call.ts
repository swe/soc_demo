/**
 * Mock PagerDuty on-call schedule + page action.
 * UI consumes this client; live plane can replace later.
 */

import { administrationUsers } from "@/components/administration/users-data";
import { appendResponseReceipt } from "@/lib/api-adapters/receipt-store";

import { auditFromReceipt } from "./audit";
import { mockDelay } from "./delay";
import { type ActionReceipt, makeReceipt } from "./types";

export type OnCallPerson = {
  userId: string;
  name: string;
  until: string;
  title?: string;
};

export type OnCallSchedule = {
  id: string;
  name: string;
  timezone: string;
  primary: OnCallPerson;
  secondary: OnCallPerson;
  openPages: number;
  lastEscalation: string | null;
  lastPagedAt: string | null;
};

export type PageOnCallInput = {
  summary: string;
  severity?: "critical" | "high" | "medium" | "low";
  incidentId?: string;
  alertId?: string;
};

function personFromUserId(
  userId: string,
  until: string,
): OnCallPerson {
  const user = administrationUsers.find((u) => u.id === userId);
  return {
    userId,
    name: user?.name ?? userId,
    until,
    title: user?.title,
  };
}

function resolveOnCallPerson(
  preferredIds: string[],
  until: string,
): OnCallPerson {
  for (const id of preferredIds) {
    const user = administrationUsers.find((u) => u.id === id);
    if (user) return personFromUserId(user.id, until);
  }
  const fallback = administrationUsers[0];
  return personFromUserId(fallback?.id ?? "ava-reed", until);
}

let schedule: OnCallSchedule = {
  id: "sched-soc-primary",
  name: "SOC Primary",
  timezone: "UTC",
  primary: resolveOnCallPerson(["ava-reed", "maya-rao"], "08:00 UTC"),
  secondary: resolveOnCallPerson(["owen-lee", "chloe-park"], "08:00 UTC"),
  openPages: 2,
  lastEscalation:
    "Critical alert ALT-20481 → PagerDuty 14m ago (acked by Ava Reed)",
  lastPagedAt: null,
};

const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

export function subscribeOnCall(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getOnCallScheduleSnapshot(): OnCallSchedule {
  return schedule;
}

export const onCallApi = {
  async getSchedule(): Promise<OnCallSchedule> {
    await mockDelay(50);
    return schedule;
  },

  /**
   * Simulate paging the on-call schedule. Returns an ActionReceipt for demos.
   */
  async page(input: PageOnCallInput): Promise<{
    schedule: OnCallSchedule;
    receipt: ActionReceipt;
  }> {
    await mockDelay(180);
    const at = new Date().toISOString();
    const severity = input.severity ?? "high";
    const target =
      input.incidentId ?? input.alertId ?? schedule.primary.userId;
    const targetType = input.incidentId
      ? "incident"
      : input.alertId
        ? "alert"
        : "user";
    const externalRef = `PD-${Date.now().toString(36).toUpperCase()}`;

    schedule = {
      ...schedule,
      openPages: schedule.openPages + 1,
      lastPagedAt: at,
      lastEscalation: `${severity.toUpperCase()} page → ${schedule.primary.name} · ${input.summary.slice(0, 80)}`,
    };
    emit();

    const receipt = makeReceipt({
      at,
      outcome: "simulated",
      message: `Paged ${schedule.primary.name} on ${schedule.name} (${severity})`,
      connectorId: "int-pagerduty",
      connectorName: "PagerDuty",
      targetType,
      targetId: target,
      detail: `schedule=${schedule.id}; secondary=${schedule.secondary.name}; summary=${input.summary.slice(0, 120)}`,
      externalRef,
    });
    appendResponseReceipt(receipt);
    auditFromReceipt(receipt, "pagerduty.page", targetType === "user" ? "user" : targetType);
    return { schedule, receipt };
  },

  listOpenPages(): number {
    return schedule.openPages;
  },
};

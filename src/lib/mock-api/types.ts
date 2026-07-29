/**
 * Shared types for the in-app mock API layer.
 * UI calls these clients today; live connectors can replace implementations later.
 */

export type ActionOutcome = "ok" | "simulated" | "failed";

export type ActionReceipt = {
  id: string;
  at: string;
  outcome: ActionOutcome;
  /** Human-readable summary for toasts / war room. */
  message: string;
  /** Optional connector / integration id (e.g. int-defender-xdr). */
  connectorId?: string;
  connectorName?: string;
  /** Domain entity touched. */
  targetType?: string;
  targetId?: string;
  /** Extra detail for audit. */
  detail?: string;
  /** External system reference (SIEM rule id, EDR action id, …). */
  externalRef?: string;
};

export type MockApiActor = {
  id: string;
  name: string;
};

export type ListResult<T> = {
  items: T[];
  total: number;
};

export function makeReceipt(
  partial: Omit<ActionReceipt, "id" | "at"> & { id?: string; at?: string },
): ActionReceipt {
  return {
    id:
      partial.id ??
      `rcpt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    at: partial.at ?? new Date().toISOString(),
    outcome: partial.outcome,
    message: partial.message,
    connectorId: partial.connectorId,
    connectorName: partial.connectorName,
    targetType: partial.targetType,
    targetId: partial.targetId,
    detail: partial.detail,
    externalRef: partial.externalRef,
  };
}

export function receiptToneLabel(outcome: ActionOutcome): string {
  switch (outcome) {
    case "simulated":
      return "Completed";
    case "failed":
      return "Failed";
    default:
      return "OK";
  }
}

import { appendAuditLog, type AuditTargetType } from "@/components/audit/audit-log-data";

import { getMockApiActor } from "./actor";
import type { ActionReceipt } from "./types";

export function auditFromReceipt(
  receipt: ActionReceipt,
  action: string,
  targetType: AuditTargetType,
): void {
  const actor = getMockApiActor();
  const outcomeTag =
    receipt.outcome === "failed" ? "[failed] " : "";
  appendAuditLog({
    actorId: actor.id,
    actorName: actor.name,
    action,
    targetType,
    targetId: receipt.targetId ?? "unknown",
    detail: `${outcomeTag}${receipt.message}${
      receipt.connectorId ? ` via ${receipt.connectorName ?? receipt.connectorId}` : ""
    }${receipt.detail ? ` — ${receipt.detail}` : ""}`,
    at: receipt.at,
  });
}

import {
  disableIdentity,
  requireIdentityMfa,
  setDeviceIsolated,
} from "@/components/assets/assets-session";
import type { AttackStoryAction } from "@/components/incidents/attack-story";
import {
  DISRUPTION_CONNECTORS,
  type DisruptionConnector,
} from "@/lib/mock-api/incidents";
import { type ActionReceipt,makeReceipt } from "@/lib/mock-api/types";

import { apiUrl, getDataPlaneMode } from "./plane";
import { appendResponseReceipt } from "./receipt-store";

export type ResponseActionKind = AttackStoryAction["kind"];

export type ContainInput = {
  action: ResponseActionKind;
  targetType: "device" | "identity" | "mail" | "url";
  targetId: string;
  targetLabel?: string;
  connectorId?: string;
  incidentId?: string;
};

function connectorForAction(
  kind: ResponseActionKind,
  preferredId?: string,
): DisruptionConnector {
  if (preferredId) {
    const found = DISRUPTION_CONNECTORS.find((c) => c.id === preferredId);
    if (found) return found;
  }
  if (
    kind === "isolate-host" ||
    kind === "collect-forensics"
  ) {
    return DISRUPTION_CONNECTORS[0]!;
  }
  if (kind === "purge-mailbox" || kind === "block-url") {
    return {
      id: "int-mdo-email",
      name: "Microsoft Defender for Office 365",
      family: "edr",
    };
  }
  return DISRUPTION_CONNECTORS[2]!;
}

async function containLive(input: ContainInput): Promise<ActionReceipt> {
  const res = await fetch(apiUrl("/api/v1/response/actions"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    throw new Error(`Response action failed (${res.status})`);
  }
  return (await res.json()) as ActionReceipt;
}

function containMock(input: ContainInput): ActionReceipt {
  const connector = connectorForAction(input.action, input.connectorId);
  let label = "";

  switch (input.action) {
    case "isolate-host": {
      const device = setDeviceIsolated(input.targetId, true);
      if (device) label = `Isolated host ${device.hostname}`;
      break;
    }
    case "disable-identity": {
      const identity = disableIdentity(input.targetId);
      if (identity) label = `Disabled account ${identity.principal}`;
      break;
    }
    case "require-mfa": {
      const identity = requireIdentityMfa(input.targetId);
      if (identity) label = `Required MFA for ${identity.principal}`;
      break;
    }
    case "revoke-sessions": {
      const identity = requireIdentityMfa(input.targetId);
      if (identity) label = `Revoked sessions for ${identity.principal}`;
      break;
    }
    case "collect-forensics": {
      label = `Remote forensic collect requested for ${input.targetLabel ?? input.targetId}`;
      break;
    }
    case "purge-mailbox": {
      label = `Purged mailbox messages for ${input.targetLabel ?? input.targetId}`;
      break;
    }
    case "block-url": {
      label = `Blocked URL/domain ${input.targetLabel ?? input.targetId}`;
      break;
    }
  }

  if (!label) {
    return makeReceipt({
      outcome: "failed",
      message: `Target not found for ${input.action}`,
      connectorId: connector.id,
      connectorName: connector.name,
      targetType: input.targetType,
      targetId: input.targetId,
      detail: input.targetLabel,
    });
  }

  return makeReceipt({
    outcome: "simulated",
    message: label,
    connectorId: connector.id,
    connectorName: connector.name,
    targetType: input.incidentId ? "incident" : input.targetType,
    targetId: input.incidentId ?? input.targetId,
    detail: `${input.action} → ${input.targetLabel ?? input.targetId}`,
  });
}

export function containMockAction(input: ContainInput): ActionReceipt {
  return containMock(input);
}

export async function containAction(
  input: ContainInput,
): Promise<ActionReceipt> {
  let receipt: ActionReceipt;
  if (getDataPlaneMode() === "live") {
    try {
      receipt = await containLive(input);
    } catch {
      receipt = containMock(input);
      receipt = {
        ...receipt,
        outcome: "simulated",
        message: `${receipt.message} (live plane unavailable — mock fallback)`,
      };
    }
  } else {
    receipt = containMock(input);
  }
  appendResponseReceipt(receipt);
  return receipt;
}

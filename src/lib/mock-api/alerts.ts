import type { SocAlert } from "@/components/alerts/alerts-data";
import {
  getAlertFromSession,
  getAlertsFromSession,
  patchAlertsInSession,
} from "@/components/alerts/alerts-session";

import { auditFromReceipt } from "./audit";
import { mockDelay } from "./delay";
import { type ActionReceipt, type ListResult,makeReceipt } from "./types";

export type AlertPatch = Partial<
  Pick<SocAlert, "status" | "assigneeId" | "notes">
>;

async function commitPatch(
  ids: string[],
  patch: AlertPatch,
): Promise<ActionReceipt> {
  await mockDelay(120);
  patchAlertsInSession(ids, patch);
  const fields = Object.keys(patch).join(", ");
  const receipt = makeReceipt({
    outcome: "ok",
    message: `Updated ${ids.length} alert${ids.length === 1 ? "" : "s"} (${fields})`,
    targetType: "alert",
    targetId: ids[0] ?? "bulk",
    detail: ids.length > 1 ? `ids=${ids.slice(0, 8).join(",")}` : undefined,
  });
  auditFromReceipt(receipt, "alert.patch", "alert");
  return receipt;
}

export const alertsApi = {
  async list(): Promise<ListResult<SocAlert>> {
    await mockDelay(80);
    const items = getAlertsFromSession();
    return { items, total: items.length };
  },

  async get(id: string): Promise<SocAlert | null> {
    await mockDelay(60);
    return getAlertFromSession(id);
  },

  async patch(ids: Iterable<string>, patch: AlertPatch): Promise<ActionReceipt> {
    return commitPatch([...ids], patch);
  },

  /** Sync path for React handlers that cannot await yet — still audits. */
  patchSync(ids: Iterable<string>, patch: AlertPatch): ActionReceipt {
    const idList = [...ids];
    patchAlertsInSession(idList, patch);
    const fields = Object.keys(patch).join(", ");
    const receipt = makeReceipt({
      outcome: "ok",
      message: `Updated ${idList.length} alert${idList.length === 1 ? "" : "s"} (${fields})`,
      targetType: "alert",
      targetId: idList[0] ?? "bulk",
      detail: idList.length > 1 ? `ids=${idList.slice(0, 8).join(",")}` : undefined,
    });
    auditFromReceipt(receipt, "alert.patch", "alert");
    return receipt;
  },
};

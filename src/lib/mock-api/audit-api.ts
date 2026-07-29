import type { AuditLogEntry } from "@/components/audit/audit-log-data";
import { getAuditLogEntries } from "@/components/audit/audit-log-data";

import { mockDelay } from "./delay";
import type { ListResult } from "./types";

export const auditApi = {
  async list(): Promise<ListResult<AuditLogEntry>> {
    await mockDelay(50);
    const items = getAuditLogEntries();
    return { items, total: items.length };
  },
};

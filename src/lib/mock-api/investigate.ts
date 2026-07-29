import {
  type InvestigateEvent,
  type SavedSearch,
} from "@/components/investigate/investigate-data";
import {
  getInvestigateSessionSnapshot,
  pushQueryHistory,
  type QueryHistoryEntry,
  saveSearch,
  setLastRun,
} from "@/components/investigate/investigate-session";
import { investigateQuery } from "@/lib/api-adapters/investigate";

import { auditFromReceipt } from "./audit";
import { mockDelay } from "./delay";
import { type ActionReceipt, type ListResult,makeReceipt } from "./types";

export type InvestigateRunInput = {
  query: string;
  sourceIds: string[];
  timeRange: string;
};

export const investigateApi = {
  async run(input: InvestigateRunInput): Promise<{
    events: InvestigateEvent[];
    receipt: ActionReceipt;
    stats?: { hitCount: number; tookMs: number };
  }> {
    await mockDelay(80);
    const result = await investigateQuery(input);
    setLastRun({
      query: input.query,
      sourceIds: input.sourceIds,
      results: result.events,
    });
    pushQueryHistory({
      query: input.query,
      sourceIds: input.sourceIds,
      timeRange: input.timeRange,
      hitCount: result.events.length,
    });
    auditFromReceipt(result.receipt, "investigate.run", "alert");
    return {
      events: result.events,
      receipt: result.receipt,
      stats: result.stats,
    };
  },

  async listSaved(): Promise<ListResult<SavedSearch>> {
    await mockDelay(60);
    const items = getInvestigateSessionSnapshot().savedSearches;
    return { items, total: items.length };
  },

  async saveSearch(input: {
    name: string;
    query: string;
    sourceIds: string[];
  }): Promise<{ saved: SavedSearch; receipt: ActionReceipt }> {
    await mockDelay(100);
    const saved = saveSearch(input);
    const receipt = makeReceipt({
      outcome: "ok",
      message: `Saved search “${saved.name}”`,
      targetType: "alert",
      targetId: saved.id,
    });
    auditFromReceipt(receipt, "investigate.save", "alert");
    return { saved, receipt };
  },

  async history(): Promise<ListResult<QueryHistoryEntry>> {
    await mockDelay(40);
    const items = getInvestigateSessionSnapshot().queryHistory;
    return { items, total: items.length };
  },
};

import type { InvestigateEvent } from "@/components/investigate/investigate-data";
import { runMockQuery } from "@/components/investigate/investigate-data";
import { type ActionReceipt,makeReceipt } from "@/lib/mock-api/types";

import { apiUrl, getDataPlaneMode } from "./plane";

export type InvestigateQueryInput = {
  query: string;
  sourceIds: string[];
  timeRange: string;
};

export type InvestigateQueryResult = {
  events: InvestigateEvent[];
  stats: { hitCount: number; tookMs: number };
  receipt: ActionReceipt;
};

function enrichMockEvents(
  events: InvestigateEvent[],
  query: string,
  timeRange: string,
): InvestigateEvent[] {
  const q = query.toLowerCase();
  const entityMatch =
    q.match(/(?:host|hostname|device)[=:\s]+([a-z0-9._-]+)/i) ??
    q.match(/(?:user|identity|upn)[=:\s]+([^\s]+)/i) ??
    q.match(/([a-z0-9-]+\.(?:ca|com|local))/i);

  let filtered = events;
  if (entityMatch?.[1]) {
    const token = entityMatch[1].toLowerCase();
    const hit = events.filter(
      (e) =>
        e.hostname?.toLowerCase().includes(token) ||
        e.identity?.toLowerCase().includes(token) ||
        e.message.toLowerCase().includes(token),
    );
    if (hit.length > 0) filtered = hit;
  }

  const rangeMinutes =
    timeRange === "1h"
      ? 60
      : timeRange === "24h"
        ? 1440
        : timeRange === "7d"
          ? 10080
          : timeRange === "30d"
            ? 43200
            : 1440;
  const cutoff = Date.now() - rangeMinutes * 60_000;
  filtered = filtered.filter(
    (e) => new Date(e.timestamp).getTime() >= cutoff - 60_000,
  );

  return filtered.map((e) => ({
    ...e,
    raw: {
      ...e.raw,
      query,
      timeRange,
      entityHint: entityMatch?.[1] ?? "",
    },
  }));
}

async function runLive(
  input: InvestigateQueryInput,
): Promise<InvestigateQueryResult> {
  const started = Date.now();
  const res = await fetch(apiUrl("/api/v1/investigate/query"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    throw new Error(`Investigate live query failed (${res.status})`);
  }
  const data = (await res.json()) as InvestigateQueryResult;
  return {
    ...data,
    stats: data.stats ?? {
      hitCount: data.events?.length ?? 0,
      tookMs: Date.now() - started,
    },
  };
}

function runMock(input: InvestigateQueryInput): InvestigateQueryResult {
  const started = Date.now();
  const raw = runMockQuery(input.query, input.sourceIds);
  const events = enrichMockEvents(raw, input.query, input.timeRange);
  const tookMs = Date.now() - started;
  const receipt = makeReceipt({
    outcome: "ok",
    message: `Query returned ${events.length} event(s)`,
    targetType: "alert",
    targetId: "investigate",
    detail: input.query.slice(0, 120),
  });
  return {
    events,
    stats: { hitCount: events.length, tookMs },
    receipt,
  };
}

export async function investigateQuery(
  input: InvestigateQueryInput,
): Promise<InvestigateQueryResult> {
  if (getDataPlaneMode() === "live") {
    try {
      return await runLive(input);
    } catch {
      /* fall through to mock with failed note */
      const mock = runMock(input);
      return {
        ...mock,
        receipt: makeReceipt({
          ...mock.receipt,
          outcome: "simulated",
          message: `${mock.receipt.message} (live plane unavailable — mock fallback)`,
        }),
      };
    }
  }
  return runMock(input);
}

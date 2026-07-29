import { NextResponse } from "next/server";

import { runMockQuery } from "@/components/investigate/investigate-data";
import { makeReceipt } from "@/lib/mock-api/types";

/**
 * Live-plane stub for Investigate. When HEIMDALL_DATA_PLANE=live and no
 * upstream SIEM is wired, this same-origin route still serves the enriched mock.
 * Replace with federation to Splunk/Sentinel when backend lands.
 */
export async function POST(request: Request) {
  const body = (await request.json()) as {
    query?: string;
    sourceIds?: string[];
    timeRange?: string;
  };
  const query = body.query ?? "";
  const sourceIds = body.sourceIds ?? [];
  const timeRange = body.timeRange ?? "24h";
  const started = Date.now();
  const events = runMockQuery(query, sourceIds).map((e) => ({
    ...e,
    raw: { ...e.raw, query, timeRange, plane: "live-stub" },
  }));
  const receipt = makeReceipt({
    outcome: "ok",
    message: `Query returned ${events.length} event(s)`,
    targetType: "alert",
    targetId: "investigate",
    detail: query.slice(0, 120),
  });
  return NextResponse.json({
    events,
    stats: { hitCount: events.length, tookMs: Date.now() - started },
    receipt,
  });
}

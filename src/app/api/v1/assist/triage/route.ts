import { NextResponse } from "next/server";

import type { AssistTriageInput } from "@/lib/api-adapters/assist";
import { assistTriage } from "@/lib/api-adapters/assist";

export const runtime = "nodejs";

/**
 * Assist triage BFF — returns suggestion + multi-hop investigate plan.
 * Mode is heuristic unless AI gateway keys are present for model path.
 */
export async function POST(request: Request) {
  let body: AssistTriageInput;
  try {
    body = (await request.json()) as AssistTriageInput;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.kind !== "alert" && body.kind !== "incident") {
    return NextResponse.json({ error: "Invalid kind" }, { status: 400 });
  }

  try {
    const result = await assistTriage(body);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Assist failed" },
      { status: 500 },
    );
  }
}

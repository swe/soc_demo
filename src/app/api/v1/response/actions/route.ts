import { NextResponse } from "next/server";

import { appendResponseReceipt } from "@/lib/api-adapters/receipt-store";
import {
  type ContainInput,
  containMockAction,
} from "@/lib/api-adapters/response";

/**
 * Live-plane stub for response/containment.
 * Executes mock containment locally until real Defender/Falcon/Okta APIs are wired.
 * Does not call containAction (would recurse when HEIMDALL_DATA_PLANE=live).
 */
export async function POST(request: Request) {
  const body = (await request.json()) as ContainInput;
  const receipt = containMockAction(body);
  appendResponseReceipt(receipt);
  return NextResponse.json(receipt);
}

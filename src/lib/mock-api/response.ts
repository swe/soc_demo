import {
  listResponseReceipts,
  subscribeResponseReceipts,
} from "@/lib/api-adapters/receipt-store";
import { containAction, type ContainInput } from "@/lib/api-adapters/response";

import type { ActionReceipt } from "./types";

export type { ContainInput };

export const responseApi = {
  async contain(input: ContainInput): Promise<ActionReceipt> {
    return containAction(input);
  },

  listReceipts(): ActionReceipt[] {
    return listResponseReceipts();
  },

  subscribe(listener: () => void) {
    return subscribeResponseReceipts(listener);
  },
};

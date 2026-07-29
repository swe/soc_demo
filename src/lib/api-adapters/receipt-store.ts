/**
 * Durable ActionReceipt store (localStorage in mock mode).
 * Survives refresh so containment history stays honest in demos.
 */

import type { ActionReceipt } from "@/lib/mock-api/types";

const STORAGE_KEY = "heimdall.response.receipts";

let memory: ActionReceipt[] = [];
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as ActionReceipt[];
      if (Array.isArray(parsed)) memory = parsed;
    }
  } catch {
    memory = [];
  }
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(memory.slice(0, 200)));
  } catch {
    /* ignore quota */
  }
}

export function subscribeResponseReceipts(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function listResponseReceipts(): ActionReceipt[] {
  hydrate();
  return memory;
}

export function appendResponseReceipt(receipt: ActionReceipt): void {
  hydrate();
  memory = [receipt, ...memory].slice(0, 200);
  persist();
  emit();
}

export function appendResponseReceipts(receipts: ActionReceipt[]): void {
  hydrate();
  memory = [...receipts, ...memory].slice(0, 200);
  persist();
  emit();
}

/** Artificial latency so mock API calls feel like a network round-trip. */
export async function mockDelay(ms = 180): Promise<void> {
  if (ms <= 0) return;
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export function mockDelaySync(ms = 0): void {
  if (ms <= 0) return;
  // Sync path reserved for non-async call sites; default no-op.
  void ms;
}

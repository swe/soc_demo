/**
 * Route/viewport pairs that overflowed horizontally before the redesign.
 * Regenerate with `node e2e/write-layout-baseline.mjs <results.json>`.
 * Must be empty when the redesign is complete.
 */
export const knownLayoutOverflow = new Set<string>([
  "desktop /overview",
  "desktop /threat-hunting/analytics",
  "mobile /investigate",
  "mobile /investigate/saved",
  "mobile /overview",
  "tablet /overview",
]);

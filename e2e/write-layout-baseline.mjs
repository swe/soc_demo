// Usage: E2E_LAYOUT=report playwright test --reporter=json > results.json
//        node e2e/write-layout-baseline.mjs results.json
import { readFileSync, writeFileSync } from "node:fs";

const [, , resultsPath] = process.argv;
if (!resultsPath) {
  console.error("usage: node e2e/write-layout-baseline.mjs <results.json>");
  process.exit(1);
}

const results = JSON.parse(readFileSync(resultsPath, "utf8"));
const keys = new Set();

const walk = (suite) => {
  (suite.suites ?? []).forEach(walk);
  for (const spec of suite.specs ?? []) {
    for (const t of spec.tests) {
      const hasOverflow = (t.annotations ?? []).some((a) => a.type === "overflow");
      if (!hasOverflow) continue;
      const key = spec.title.startsWith("detail from ")
        ? `detail:${spec.title.slice("detail from ".length)}`
        : spec.title;
      keys.add(`${t.projectName} ${key}`);
    }
  }
};
results.suites.forEach(walk);

const entries = [...keys].sort().map((k) => `  ${JSON.stringify(k)},`).join("\n");
const file = `/**
 * Route/viewport pairs that overflowed horizontally before the redesign.
 * Regenerate with \`node e2e/write-layout-baseline.mjs <results.json>\`.
 * Must be empty when the redesign is complete.
 */
export const knownLayoutOverflow = new Set<string>([
${entries}
]);
`;
writeFileSync(new URL("./layout-baseline.ts", import.meta.url), file);
console.log(`wrote ${keys.size} entries`);

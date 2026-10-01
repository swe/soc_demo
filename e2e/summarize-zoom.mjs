// Usage: node e2e/summarize-zoom.mjs /tmp/zoom.json [--full]
import { readFileSync } from "node:fs";

const report = JSON.parse(readFileSync(process.argv[2], "utf8"));
const full = process.argv.includes("--full");
const rows = [];
let total = 0;

const walk = (suite) => {
  for (const child of suite.suites ?? []) walk(child);
  for (const spec of suite.specs ?? []) {
    for (const t of spec.tests) {
      total += 1;
      for (const r of t.results) {
        if (r.status !== "passed") rows.push(`FAIL ${spec.title}: ${r.error?.message?.slice(0, 300)}`);
      }
      for (const a of t.annotations) if (a.type === "zoom") rows.push(a.description);
    }
  }
};
for (const suite of report.suites) walk(suite);

const affected = rows.length;
console.log(`routes=${total} withProblems=${affected}`);
for (const row of rows) {
  if (full) {
    console.log(`\n${row}`);
  } else {
    const [route, ...rest] = row.split("\n");
    const widths = rest.filter((l) => l.startsWith("@")).map((l) => l.slice(1));
    console.log(`${route}  ${widths.join(" ")}`);
  }
}

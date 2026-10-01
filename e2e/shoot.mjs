// Dev helper: node e2e/shoot.mjs <base> <outDir> <route>@<width>[:dark] ...
import { mkdirSync } from "node:fs";

import { chromium } from "@playwright/test";

const [base, outDir, ...targets] = process.argv.slice(2);
mkdirSync(outDir, { recursive: true });

const session = {
  user: {
    id: "e2e-manager",
    name: "E2E Manager",
    email: "soc-mgr@svalbard.ca",
    avatar: "/avatars/avatar-3.png",
    title: "SOC Manager",
    jobRole: "soc_manager",
  },
  signedInAt: "2026-01-01T00:00:00.000Z",
};

const browser = await chromium.launch();
for (const target of targets) {
  const [spec, mode] = target.split(":");
  const [route, width] = spec.split("@");
  const context = await browser.newContext({
    // The shell is viewport-height with inner scrolling, so a tall viewport shows the whole page.
    viewport: { width: Number(width), height: Number(process.env.SHOOT_HEIGHT ?? 2000) },
    colorScheme: mode === "dark" ? "dark" : "light",
    deviceScaleFactor: 1,
  });
  await context.addInitScript(
    ([value, dark]) => {
      localStorage.setItem("soc.auth.session", JSON.stringify(value));
      if (dark) localStorage.setItem("theme", "dark");
    },
    [session, mode === "dark"],
  );
  const page = await context.newPage();
  await page.goto(`${base}${route}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  const name = `${route.replace(/^\//, "").replace(/\//g, "__") || "root"}@${width}${mode ? `-${mode}` : ""}.png`;
  await page.screenshot({ path: `${outDir}/${name}`, fullPage: true });
  console.log(`${outDir}/${name}`);
  await context.close();
}
await browser.close();

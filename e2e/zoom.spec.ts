import { expect, type Page, test } from "@playwright/test";

import { findClipped, findOverflow, signIn, waitForPage } from "./helpers";
import { adminRoutes, detailRoutes, publicRoutes } from "./routes";

/**
 * Browser zoom shrinks the CSS viewport (1440px at 200% lays out at 720px), so
 * every width a user can reach by zooming must fit. Widths cover 100–400% zoom
 * on 1280/1440/1920 screens, down to the 320px WCAG reflow minimum.
 */
const widths = [1920, 1440, 1280, 1152, 1024, 960, 853, 768, 720, 640, 576, 480, 427, 360, 320];

const reportOnly = process.env.E2E_LAYOUT === "report";

async function sweep(page: Page, route: string) {
  const failures: string[] = [];
  for (const width of widths) {
    await page.setViewportSize({ width, height: Math.max(480, Math.round(width * 0.625)) });
    await page.evaluate(
      () => new Promise((resolve) => setTimeout(() => requestAnimationFrame(resolve), 350)),
    );
    const problems = [...(await findOverflow(page)), ...(await findClipped(page))];
    if (problems.length > 0) {
      failures.push(`@${width}px\n  ${problems.join("\n  ")}`);
    }
  }
  if (failures.length > 0) {
    test.info().annotations.push({ type: "zoom", description: `${route}\n${failures.join("\n")}` });
  }
  if (!reportOnly) expect(failures, `content does not fit on ${route}`).toEqual([]);
}

test.describe("zoom sweep — public", () => {
  for (const route of publicRoutes) {
    test(route, async ({ page }) => {
      await page.goto(route);
      await waitForPage(page);
      await sweep(page, route);
    });
  }
});

test.describe("zoom sweep — admin", () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);
  });

  for (const route of adminRoutes) {
    test(route, async ({ page }) => {
      await page.goto(route);
      await waitForPage(page);
      await expect(page.locator("main").first()).toBeVisible();
      await sweep(page, route);
    });
  }

  for (const { from, link } of detailRoutes) {
    test(`detail from ${from}`, async ({ page }) => {
      await page.goto(from);
      await waitForPage(page);
      const hrefs = await page
        .locator("a[href]")
        .evaluateAll((anchors) => anchors.map((a) => a.getAttribute("href") ?? ""));
      const href = hrefs.find((value) => link.test(value));
      if (href) {
        await page.goto(href);
      } else {
        await page.locator("[data-row-link], tbody tr").filter({ visible: true }).first().click();
      }
      await expect.poll(() => link.test(new URL(page.url()).pathname)).toBe(true);
      await waitForPage(page);
      await sweep(page, `detail:${from}`);
    });
  }
});

/** The overview is composed per role, so each role's layout is swept. */
test.describe("zoom sweep — overview per role", () => {
  const roles = [
    "c_level",
    "ciso",
    "analyst_t1",
    "analyst_t2",
    "analyst_t3",
    "legal_procurement",
  ] as const;

  for (const role of roles) {
    test(`/overview as ${role}`, async ({ page }) => {
      await signIn(page);
      await page.addInitScript((value) => {
        window.localStorage.setItem("soc.viewAs.role", value);
      }, role);
      await page.goto("/overview");
      await waitForPage(page);
      await expect(page.locator("main").first()).toBeVisible();
      await sweep(page, `/overview as ${role}`);
    });
  }
});

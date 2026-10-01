import { expect, type Page, test } from "@playwright/test";

import {
  findOverflow,
  maybeScreenshot,
  signIn,
  waitForPage,
  watchErrors,
} from "./helpers";
import { knownLayoutOverflow } from "./layout-baseline";
import { adminRoutes, detailRoutes, publicRoutes, redirectRoutes } from "./routes";

const reportOnly = process.env.E2E_LAYOUT === "report";

/**
 * Overflow is a hard failure unless the route/viewport pair is listed in
 * layout-baseline.ts (pre-redesign debt that each checkpoint shrinks).
 */
async function checkLayout(page: Page, key: string) {
  const project = test.info().project.name;
  const id = `${project} ${key}`;
  const overflow = await findOverflow(page);
  if (overflow.length > 0) {
    test.info().annotations.push({ type: "overflow", description: overflow.join("\n") });
  } else if (knownLayoutOverflow.has(id)) {
    test.info().annotations.push({ type: "baseline-stale", description: id });
  }
  if (reportOnly || knownLayoutOverflow.has(id)) return;
  expect(overflow, `horizontal overflow on ${key}`).toEqual([]);
}

function urlPattern(path: string) {
  return new RegExp(`${path.replace(/\//g, "\\/")}(\\?|$)`);
}

test.describe("public routes", () => {
  for (const route of publicRoutes) {
    test(route, async ({ page }) => {
      const errors = watchErrors(page);
      await page.goto(route);
      await waitForPage(page);
      await maybeScreenshot(page, route);
      await checkLayout(page, route);
      expect(errors).toEqual([]);
    });
  }
});

test.describe("admin routes", () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);
  });

  for (const route of adminRoutes) {
    test(route, async ({ page }) => {
      const errors = watchErrors(page);
      await page.goto(route);
      await waitForPage(page);
      await expect(page).toHaveURL(urlPattern(route));
      await expect(page.locator("main").first()).toBeVisible();
      await maybeScreenshot(page, route);
      await checkLayout(page, route);
      expect(errors).toEqual([]);
    });
  }

  for (const { from, link } of detailRoutes) {
    test(`detail from ${from}`, async ({ page }) => {
      const errors = watchErrors(page);
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
      await expect
        .poll(() => link.test(new URL(page.url()).pathname), {
          message: `no detail navigation from ${from}`,
        })
        .toBe(true);
      await waitForPage(page);
      await expect(page.locator("main").first()).toBeVisible();
      await maybeScreenshot(page, `${from}__detail`);
      await checkLayout(page, `detail:${from}`);
      expect(errors).toEqual([]);
    });
  }

  for (const { from, to } of redirectRoutes) {
    test(`redirect ${from}`, async ({ page }) => {
      await page.goto(from);
      await expect(page).toHaveURL(urlPattern(to));
    });
  }
});

test("unauthenticated admin route redirects to login", async ({ page }) => {
  await page.goto("/overview");
  await expect(page).toHaveURL(/\/login\?next=/);
});

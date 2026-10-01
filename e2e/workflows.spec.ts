import { expect, test } from "@playwright/test";

import { signIn, waitForPage, watchErrors } from "./helpers";

test.beforeEach(async ({ page }) => {
  await signIn(page);
});

test("filter menu applies a facet and syncs the URL", async ({ page }) => {
  const errors = watchErrors(page);
  const isPhone = test.info().project.name === "mobile";
  await page.goto("/alerts/list");
  await waitForPage(page);

  await page.getByRole("button", { name: /^Filter/ }).click();

  if (isPhone) {
    const sheet = page.getByRole("dialog");
    await expect(sheet.getByRole("heading", { name: "Filter" })).toBeVisible();
    await sheet.getByRole("checkbox", { name: "Critical" }).click();
    await expect(
      sheet.getByRole("checkbox", { name: "Critical" }),
    ).toHaveAttribute("aria-checked", "true");
    await sheet.getByRole("button", { name: "Done" }).click();
    await expect(sheet).toBeHidden();
  } else {
    await page.getByRole("option", { name: /Severity/ }).click();
    await page.getByRole("option", { name: "Critical" }).click();
    await page.keyboard.press("Escape");
  }

  await expect(page).toHaveURL(/severity=critical/);
  await expect(
    page.getByRole("button", { name: /Filter, 1 active/ }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test("clickable table rows open from the keyboard", async ({ page }) => {
  await page.goto("/incidents/list");
  await waitForPage(page);

  const row = page.locator("tbody tr[tabindex='0']").first();
  await row.focus();
  await expect(row).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/incidents\/INC-\d+/);
});

test("filled buttons keep white text alongside type-scale sizes", async ({
  page,
}) => {
  await page.goto("/profile/security");
  await waitForPage(page);

  await expect(page.getByRole("button", { name: "Disable MFA" })).toHaveCSS(
    "color",
    "rgb(255, 255, 255)",
  );
});

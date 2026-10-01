import { expect, type Page, test } from "@playwright/test";

export const SESSION = {
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

export async function signIn(page: Page) {
  await page.addInitScript((session) => {
    window.localStorage.setItem("soc.auth.session", JSON.stringify(session));
    window.localStorage.removeItem("soc.viewAs.role");
  }, SESSION);
}

const IGNORED_CONSOLE = [
  /Download the React DevTools/,
  /\[Fast Refresh\]/,
  /maplibre|webgl|WebGL/i,
  /Failed to load resource/,
];

/** Collects uncaught page errors and console errors for the lifetime of the page. */
export function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() !== "error") return;
    const text = message.text();
    if (IGNORED_CONSOLE.some((pattern) => pattern.test(text))) return;
    errors.push(`console: ${text}`);
  });
  return errors;
}

export async function waitForPage(page: Page) {
  await page.waitForLoadState("networkidle");
  await expect(page.getByText(/^(Loading session|Redirecting to login)…$/)).toHaveCount(0);
}

/**
 * Visible elements whose box extends past the viewport and is not inside a
 * horizontally scrollable ancestor — i.e. content the user cannot reach.
 */
export async function findOverflow(page: Page) {
  return page.evaluate(() => {
    const viewport = document.documentElement.clientWidth;
    const offenders: string[] = [];

    const insideScroller = (el: Element) => {
      for (let node = el.parentElement; node; node = node.parentElement) {
        const style = getComputedStyle(node);
        if (
          (style.overflowX === "auto" || style.overflowX === "scroll") &&
          node.scrollWidth > node.clientWidth
        ) {
          return true;
        }
        if (style.position === "fixed") return false;
      }
      return false;
    };

    const describe = (el: Element) => {
      const id = el.id ? `#${el.id}` : "";
      const cls =
        typeof el.className === "string"
          ? `.${el.className.trim().split(/\s+/).slice(0, 3).join(".")}`
          : "";
      const text = (el.textContent ?? "").trim().slice(0, 40);
      return `${el.tagName.toLowerCase()}${id}${cls} "${text}"`;
    };

    for (const el of Array.from(document.body.querySelectorAll("*"))) {
      if (el.closest("[data-overflow-ok], .maplibregl-map, .react-flow, [data-sonner-toaster]")) {
        continue;
      }
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) continue;
      const style = getComputedStyle(el);
      if (style.visibility === "hidden" || style.display === "none") continue;
      if (rect.right <= viewport + 1 || rect.left >= viewport) continue;
      if (insideScroller(el)) continue;
      offenders.push(`${describe(el)} right=${Math.round(rect.right)} vw=${viewport}`);
      if (offenders.length >= 8) break;
    }

    if (document.documentElement.scrollWidth > viewport + 1) {
      offenders.unshift(
        `document scrollWidth=${document.documentElement.scrollWidth} vw=${viewport}`,
      );
    }
    return offenders;
  });
}

export async function maybeScreenshot(page: Page, name: string) {
  if (!process.env.E2E_SCREENSHOTS) return;
  const project = test.info().project.name;
  await page.screenshot({
    path: `test-results/screens/${project}/${name.replace(/^\//, "").replace(/\//g, "__") || "root"}.png`,
    fullPage: false,
  });
}

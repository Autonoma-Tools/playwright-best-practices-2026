// @ts-check
import { test as base, expect } from "@playwright/test";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Pattern 7 — Auth via storageState
 *
 * Uses a global-setup script to authenticate once and persist
 * cookies/localStorage to a JSON file. Each test loads that file
 * via storageState — zero login overhead per test.
 *
 * Run:
 *   npx playwright test src/07-auth-storage-state.spec.js
 *
 * The global-setup.js file (in the repo root) creates
 * .auth/storage-state.json before any test runs.
 */

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STORAGE_STATE = path.resolve(__dirname, "..", ".auth", "storage-state.json");

/* ---------- Fixture: load the persisted auth state ---------- */

const test = base.extend({
  /**
   * Creates a browser context pre-loaded with the storage state
   * produced by global-setup.js. The test starts already logged in.
   */
  authedPage: async ({ browser }, use) => {
    const context = await browser.newContext({ storageState: STORAGE_STATE });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
});

/* ---------- Tests — already authenticated ---------- */

test.describe("Auth via storage state", () => {
  test("dashboard loads without a login step", async ({ authedPage }) => {
    await authedPage.goto("/dashboard");

    /* No login form, no redirect — we are already authenticated. */
    await expect(authedPage).toHaveURL(/.*dashboard/);
    await expect(
      authedPage.getByRole("heading", { name: /welcome/i })
    ).toBeVisible();
  });

  test("profile page shows the authenticated user", async ({ authedPage }) => {
    await authedPage.goto("/profile");

    await expect(authedPage.locator('[data-testid="user-email"]')).toHaveText(
      "test@example.com"
    );
  });

  test("API call includes auth cookie", async ({ authedPage }) => {
    await authedPage.goto("/dashboard");

    /*
     * Intercept an API call to verify the auth cookie is attached.
     * This proves storageState loaded correctly.
     */
    const [request] = await Promise.all([
      authedPage.waitForRequest((req) => req.url().includes("/api/me")),
      authedPage.locator('[data-testid="refresh-profile"]').click(),
    ]);

    const cookies = await authedPage.context().cookies();
    const authCookie = cookies.find((c) => c.name === "session");
    expect(authCookie).toBeTruthy();
    expect(request.headers()["cookie"]).toContain("session=");
  });
});

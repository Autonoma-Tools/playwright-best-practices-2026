// @ts-check
import { test as base, expect } from "@playwright/test";

/**
 * Pattern 4 — Fixture design
 *
 * Demonstrates three fixture scopes:
 *   1. Worker-scoped — shared server config across all tests in one worker
 *   2. Test-scoped — fresh authenticated browser context per test
 *   3. Composable — a cart fixture that builds on top of the auth fixture
 *
 * The test body contains only assertions; all setup lives in fixtures.
 *
 * Run:
 *   npx playwright test src/04-fixtures.spec.js
 */

/* ---------- Fixture definitions ---------- */

const test = base.extend({
  /**
   * Worker-scoped fixture: resolves the server URL once per worker.
   * Avoids repeating environment-lookup logic in every test.
   */
  serverURL: [
    // eslint-disable-next-line no-empty-pattern
    async ({}, use) => {
      const url = process.env.BASE_URL || "http://localhost:3000";
      await use(url);
    },
    { scope: "worker" },
  ],

  /**
   * Test-scoped fixture: creates a fresh browser context that is
   * already authenticated via storage state (or direct login).
   * Each test gets its own session — no cross-test leakage.
   */
  authenticatedPage: async ({ browser, serverURL }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    /* Perform a quick programmatic login. */
    await page.goto(`${serverURL}/login`);
    await page.getByLabel("Email").fill("test@example.com");
    await page.getByLabel("Password").fill("Test1234!");
    await page.getByRole("button", { name: "Log in" }).click();
    await page.waitForURL(/.*dashboard/);

    await use(page);

    /* Teardown: close the context to free resources. */
    await context.close();
  },

  /**
   * Composable fixture: builds on `authenticatedPage` to add an item
   * to the cart before the test body runs.
   */
  pageWithCart: async ({ authenticatedPage }, use) => {
    await authenticatedPage.goto("/products");
    await authenticatedPage
      .locator('[data-testid="product-card"]')
      .first()
      .getByRole("button", { name: "Add to cart" })
      .click();
    await expect(
      authenticatedPage.locator('[data-testid="cart-badge"]')
    ).toHaveText("1");

    await use(authenticatedPage);
  },
});

/* ---------- Tests — only assertions ---------- */

test.describe("Fixture design", () => {
  test("authenticated page shows the dashboard", async ({
    authenticatedPage,
  }) => {
    await expect(authenticatedPage).toHaveURL(/.*dashboard/);
    await expect(
      authenticatedPage.getByRole("heading", { name: /welcome/i })
    ).toBeVisible();
  });

  test("cart fixture starts with one item", async ({ pageWithCart }) => {
    await pageWithCart.goto("/cart");
    const cartItems = pageWithCart.locator('[data-testid="cart-item"]');
    await expect(cartItems).toHaveCount(1);
  });

  test("worker-scoped server URL is consistent", async ({
    serverURL,
    page,
  }) => {
    expect(serverURL).toMatch(/^https?:\/\//);
    await page.goto(serverURL);
    await expect(page).toHaveTitle(/.+/);
  });
});

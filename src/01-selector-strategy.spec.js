// @ts-check
import { test, expect } from "@playwright/test";

/**
 * Pattern 1 — Selector strategy
 *
 * The same "click login, verify dashboard" interaction expressed four ways.
 * `data-testid` and `role` survive component renames; CSS and XPath break.
 *
 * Run:
 *   npx playwright test src/01-selector-strategy.spec.js
 *
 * Requires a local server on port 3000 with:
 *   - A page at "/" containing a login button
 *   - A "/dashboard" page shown after clicking login
 */

test.describe("Selector strategy comparison", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("data-testid — survives renames", async ({ page }) => {
    const loginButton = page.locator('[data-testid="login-button"]');
    await expect(loginButton).toBeVisible();
    await loginButton.click();
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(
      page.locator('[data-testid="welcome-message"]')
    ).toBeVisible();
  });

  test("role locator — survives renames", async ({ page }) => {
    const loginButton = page.getByRole("button", { name: "Log in" });
    await expect(loginButton).toBeVisible();
    await loginButton.click();
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(
      page.getByRole("heading", { name: /welcome/i })
    ).toBeVisible();
  });

  test("CSS selector — breaks on component rename", async ({ page }) => {
    /*
     * This selector is tightly coupled to the class name.
     * If the component is renamed from "LoginButton" to "AuthButton",
     * the class name changes and this test breaks.
     */
    const loginButton = page.locator("button.LoginButton__primary");
    await expect(loginButton).toBeVisible();
    await loginButton.click();
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.locator("h1.Dashboard__welcome")).toBeVisible();
  });

  test("XPath — breaks on DOM restructure", async ({ page }) => {
    /*
     * XPath encodes the exact DOM hierarchy.
     * Wrapping the button in a new <div> breaks this instantly.
     */
    const loginButton = page.locator(
      'xpath=//div[@class="header"]//button[contains(text(),"Log in")]'
    );
    await expect(loginButton).toBeVisible();
    await loginButton.click();
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(
      page.locator('xpath=//main//h1[contains(text(),"Welcome")]')
    ).toBeVisible();
  });
});

// @ts-check
import { test, expect } from "@playwright/test";

/**
 * Pattern 3 — Parallelism and sharding
 *
 * Each test is fully isolated — no shared state between workers.
 * Run with parallelism:
 *   npx playwright test src/03-parallelism.spec.js --workers=4
 *
 * Or shard across two CI nodes:
 *   npx playwright test --shard=1/2
 *   npx playwright test --shard=2/2
 */

test.describe("Parallelism — isolated test suite A", () => {
  test("creates a new user and verifies profile", async ({ page }) => {
    const uniqueEmail = `user-${Date.now()}-a@example.com`;

    await page.goto("/signup");
    await page.getByLabel("Email").fill(uniqueEmail);
    await page.getByLabel("Password").fill("Test1234!");
    await page.getByRole("button", { name: "Sign up" }).click();

    await expect(page).toHaveURL(/.*profile/);
    await expect(page.getByText(uniqueEmail)).toBeVisible();
  });

  test("searches the product catalog", async ({ page }) => {
    await page.goto("/products");

    await page.getByPlaceholder("Search products").fill("keyboard");
    await page.getByRole("button", { name: "Search" }).click();

    const results = page.locator('[data-testid="product-card"]');
    await expect(results).not.toHaveCount(0);
    await expect(results.first()).toContainText(/keyboard/i);
  });
});

test.describe("Parallelism — isolated test suite B", () => {
  test("adds an item to the cart", async ({ page }) => {
    await page.goto("/products");

    const firstProduct = page.locator('[data-testid="product-card"]').first();
    await firstProduct.getByRole("button", { name: "Add to cart" }).click();

    const cartBadge = page.locator('[data-testid="cart-badge"]');
    await expect(cartBadge).toHaveText("1");
  });

  test("navigates the footer links", async ({ page }) => {
    await page.goto("/");

    const footer = page.locator("footer");
    const privacyLink = footer.getByRole("link", { name: "Privacy Policy" });
    await privacyLink.click();

    await expect(page).toHaveURL(/.*privacy/);
    await expect(
      page.getByRole("heading", { name: /privacy policy/i })
    ).toBeVisible();
  });
});

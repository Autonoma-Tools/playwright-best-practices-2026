// @ts-check
import { test as base, expect } from "@playwright/test";

/**
 * Pattern 8 — Page Object Model vs. composable fixtures
 *
 * Two describe blocks implement the same checkout feature:
 *   1. Classic POM — a CheckoutPage class with methods
 *   2. Composable fixtures — small, reusable setup blocks
 *
 * Compare line count, readability, and isolation.
 *
 * Run:
 *   npx playwright test src/08-pom-or-not.spec.js
 */

/* ========================================================
 * Approach A — Classic Page Object Model
 * ======================================================== */

class CheckoutPage {
  /**
   * @param {import("@playwright/test").Page} page
   */
  constructor(page) {
    this.page = page;
    this.cardNumberInput = page.getByLabel("Card number");
    this.expiryInput = page.getByLabel("Expiry");
    this.cvcInput = page.getByLabel("CVC");
    this.payButton = page.getByRole("button", { name: "Pay now" });
    this.confirmationHeading = page.getByRole("heading", {
      name: /order confirmed/i,
    });
  }

  async navigate() {
    await this.page.goto("/checkout");
  }

  /**
   * @param {{ cardNumber: string; expiry: string; cvc: string }} details
   */
  async fillPaymentDetails({ cardNumber, expiry, cvc }) {
    await this.cardNumberInput.fill(cardNumber);
    await this.expiryInput.fill(expiry);
    await this.cvcInput.fill(cvc);
  }

  async submitPayment() {
    await this.payButton.click();
  }

  async expectConfirmation() {
    await expect(this.confirmationHeading).toBeVisible();
  }
}

base.describe("Approach A — Page Object Model", () => {
  base("completes a checkout with POM", async ({ page }) => {
    const checkout = new CheckoutPage(page);

    await checkout.navigate();
    await checkout.fillPaymentDetails({
      cardNumber: "4242424242424242",
      expiry: "12/30",
      cvc: "123",
    });
    await checkout.submitPayment();
    await checkout.expectConfirmation();
  });

  base("shows validation error for expired card (POM)", async ({ page }) => {
    const checkout = new CheckoutPage(page);

    await checkout.navigate();
    await checkout.fillPaymentDetails({
      cardNumber: "4242424242424242",
      expiry: "01/20",
      cvc: "123",
    });
    await checkout.submitPayment();

    await expect(page.locator('[data-testid="payment-error"]')).toContainText(
      /expired/i
    );
  });
});

/* ========================================================
 * Approach B — Composable Fixtures (no POM class)
 * ======================================================== */

const test = base.extend({
  /**
   * Fixture: navigates to checkout and fills in valid payment details.
   * Tests that need a different state can override the fixture.
   */
  checkoutPage: async ({ page }, use) => {
    await page.goto("/checkout");
    await page.getByLabel("Card number").fill("4242424242424242");
    await page.getByLabel("Expiry").fill("12/30");
    await page.getByLabel("CVC").fill("123");
    await use(page);
  },
});

test.describe("Approach B — Composable Fixtures", () => {
  test("completes a checkout with fixtures", async ({ checkoutPage }) => {
    await checkoutPage.getByRole("button", { name: "Pay now" }).click();
    await expect(
      checkoutPage.getByRole("heading", { name: /order confirmed/i })
    ).toBeVisible();
  });

  test("shows validation error for expired card (fixtures)", async ({
    page,
  }) => {
    /* Override the fixture's defaults for this specific scenario. */
    await page.goto("/checkout");
    await page.getByLabel("Card number").fill("4242424242424242");
    await page.getByLabel("Expiry").fill("01/20");
    await page.getByLabel("CVC").fill("123");
    await page.getByRole("button", { name: "Pay now" }).click();

    await expect(page.locator('[data-testid="payment-error"]')).toContainText(
      /expired/i
    );
  });
});

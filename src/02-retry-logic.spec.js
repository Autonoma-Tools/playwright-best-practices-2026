// @ts-check
import { test, expect } from "@playwright/test";

/**
 * Pattern 2 — Retry logic and timeouts
 *
 * Demonstrates:
 *   1. Tight global timeout (set in playwright.config.js at 8 s)
 *   2. Per-assertion timeout overrides
 *   3. describe-scoped retries for inherently racy specs
 *   4. expect.poll() for eventually-consistent UI
 *
 * Run:
 *   npx playwright test src/02-retry-logic.spec.js
 */

test.describe("Retry logic — tight timeouts", () => {
  test("assertion-level timeout override", async ({ page }) => {
    await page.goto("/");

    /*
     * The global expect timeout is 5 s (see playwright.config.js).
     * For a lazy-loaded element that takes longer, override per-assertion
     * rather than inflating the global timeout for every test.
     */
    const lazySection = page.locator('[data-testid="lazy-section"]');
    await expect(lazySection).toBeVisible({ timeout: 7_000 });
  });

  test("expect.poll — waiting for an eventually-consistent counter", async ({
    page,
  }) => {
    await page.goto("/");

    /*
     * expect.poll re-evaluates the callback every 250 ms (configurable)
     * until the assertion passes or the timeout expires.
     * This is ideal for elements that update asynchronously.
     */
    await expect
      .poll(
        async () => {
          const counterText = await page
            .locator('[data-testid="live-counter"]')
            .textContent();
          return parseInt(counterText || "0", 10);
        },
        {
          message: "Counter should reach at least 5",
          intervals: [250, 500, 1_000],
          timeout: 6_000,
        }
      )
      .toBeGreaterThanOrEqual(5);
  });
});

test.describe("Describe-scoped retries for racy specs", () => {
  /*
   * Instead of retrying every test globally, scope retries to the
   * describe block that contains the inherently racy interaction.
   * This keeps fast specs fast while giving flaky ones a second chance.
   */
  test.describe.configure({ retries: 2 });

  test("animation-dependent assertion", async ({ page }) => {
    await page.goto("/");

    const toast = page.locator('[data-testid="toast-notification"]');
    await page.locator('[data-testid="trigger-toast"]').click();

    /*
     * Toasts often depend on CSS animations whose duration varies
     * slightly between runs. Retries absorb this variance.
     */
    await expect(toast).toBeVisible();
    await expect(toast).toContainText("Saved");
  });
});

// @ts-check
import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright configuration tuned for low-flakiness CI runs.
 * See: https://getautonoma.com/blog/playwright-best-practices-2026
 */
export default defineConfig({
  testDir: "./src",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? "github" : "html",

  /* Global timeout per test (keeps CI from hanging on stuck browsers). */
  timeout: 8_000,

  /* Expect assertions time out after 5 s by default. */
  expect: { timeout: 5_000 },

  use: {
    baseURL: process.env.BASE_URL || "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});

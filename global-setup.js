// @ts-check
import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Global setup — runs once before all tests.
 *
 * Authenticates a test user and saves the session to
 * .auth/storage-state.json. Individual tests load this file
 * via storageState to start already logged in.
 *
 * Referenced by playwright.config.js → globalSetup.
 */

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AUTH_DIR = path.join(__dirname, ".auth");
const STORAGE_STATE_PATH = path.join(AUTH_DIR, "storage-state.json");

export default async function globalSetup() {
  /* Ensure the .auth directory exists. */
  if (!fs.existsSync(AUTH_DIR)) {
    fs.mkdirSync(AUTH_DIR, { recursive: true });
  }

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  const baseURL = process.env.BASE_URL || "http://localhost:3000";

  /* Log in with test credentials. */
  await page.goto(`${baseURL}/login`);
  await page.getByLabel("Email").fill("test@example.com");
  await page.getByLabel("Password").fill("Test1234!");
  await page.getByRole("button", { name: "Log in" }).click();
  await page.waitForURL(/.*dashboard/);

  /* Persist the authenticated state. */
  await context.storageState({ path: STORAGE_STATE_PATH });
  await browser.close();

  console.log(`Auth state saved to ${STORAGE_STATE_PATH}`);
}

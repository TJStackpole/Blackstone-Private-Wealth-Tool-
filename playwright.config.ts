import { defineConfig, devices } from "@playwright/test";

/** One smoke test (BUILD_PLAN_ADDONS.md, Rule 10). Run with `npm run e2e`, which builds first. */
export default defineConfig({
  testDir: "tests/e2e",
  outputDir: ".next/playwright-results", // inside an already-ignored folder
  reporter: "list",
  timeout: 60_000,
  use: { baseURL: "http://localhost:4173" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: { command: "node tests/e2e/static-server.mjs", url: "http://localhost:4173", reuseExistingServer: false, timeout: 30_000 },
});

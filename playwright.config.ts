import { defineConfig, devices } from "@playwright/test";

/**
 * Tests run against the production build served by scripts/serve-static.mjs.
 * Set BASE_URL to audit another deployment (e.g. a Vercel preview or production).
 */
const PORT = 4321;
const externalBase = process.env.BASE_URL;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never", outputFolder: "reports/playwright" }]],
  outputDir: "reports/playwright-results",
  use: {
    baseURL: externalBase ?? `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  ...(externalBase
    ? {}
    : {
        webServer: {
          command: `node scripts/serve-static.mjs ${PORT}`,
          url: `http://localhost:${PORT}/es`,
          reuseExistingServer: !process.env.CI,
        },
      }),
});

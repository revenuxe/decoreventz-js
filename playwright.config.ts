import { defineConfig, devices } from "@playwright/test";

const NEXT_APP_PORT = 3000;
const nextAppBaseURL = process.env.PLAYWRIGHT_NEXT_BASE_URL ?? `http://localhost:${NEXT_APP_PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  // Every spec here targets a shared dev-server instance (not per-test
  // isolated backends), so too much parallelism causes resource-
  // contention flakiness rather than real failures — capped rather than
  // left at Playwright's CPU-count default.
  workers: 2,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "html",
  use: {
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "next-app",
      testDir: "./e2e/next-app",
      use: { ...devices["Desktop Chrome"], baseURL: nextAppBaseURL },
    },
  ],
  webServer: {
    command: `npm run dev -- --port ${NEXT_APP_PORT}`,
    cwd: __dirname,
    url: nextAppBaseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});

import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./e2e/next-app", testMatch: "readiness.spec.ts", workers: 2,
  reporter: "list", use: { ...devices["Desktop Chrome"], baseURL: "http://localhost:43187", timezoneId: "Asia/Kolkata", trace: "retain-on-failure" },
  webServer: { command: "npm run start -- --port 43187", url: "http://localhost:43187", reuseExistingServer: false, timeout: 60000 },
});

import { defineConfig, devices } from "@playwright/test";

const e2ePort = process.env.PLAYWRIGHT_PORT ?? process.env.PORT ?? "3030";
const e2eBaseURL = `http://127.0.0.1:${e2ePort}`;

export default defineConfig({
  expect: {
    timeout: 7_500,
  },
  fullyParallel: false,
  outputDir: "test-results",
  projects: [
    {
      name: "chromium-desktop",
      testIgnore: /.*\.mobile\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: "chromium-mobile",
      testIgnore: /.*\.desktop\.spec\.ts/,
      use: {
        ...devices["Pixel 5"],
        viewport: { width: 390, height: 844 },
      },
    },
  ],
  reporter: [["list"]],
  testDir: "./tests/e2e",
  timeout: 60_000,
  use: {
    baseURL: e2eBaseURL,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    video: "off",
  },
  webServer: {
    command: `PORT=${e2ePort} bun run start`,
    reuseExistingServer: false,
    timeout: 20_000,
    url: e2eBaseURL,
  },
  workers: 1,
});

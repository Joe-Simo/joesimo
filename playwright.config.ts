import { defineConfig, devices } from "@playwright/test";

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
    baseURL: "http://127.0.0.1:3000",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    video: "retain-on-failure",
  },
  webServer: {
    command: "bun run start",
    reuseExistingServer: !process.env.CI,
    timeout: 20_000,
    url: "http://127.0.0.1:3000",
  },
  workers: 1,
});

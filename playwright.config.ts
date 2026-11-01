import { defineConfig, devices } from "@playwright/test"

// End-to-end tests: the whole app in a real browser, on the mock services. `pnpm test:e2e`
// starts the dev server itself. Kept to the few journeys that matter most.

export default defineConfig({
  testDir: "e2e",
  timeout: 60_000,
  use: { baseURL: "http://localhost:5199", trace: "retain-on-failure" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "phone", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: "pnpm dev --port 5199 --strictPort",
    url: "http://localhost:5199",
    reuseExistingServer: true,
  },
})

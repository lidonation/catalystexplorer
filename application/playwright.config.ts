import { defineConfig, devices } from '@playwright/test';

/**
 * Ensure Laravel is fully ready (not just the port) before running tests.
 * Uses `wait-on` in globalSetup.
 */
export default defineConfig({
  testDir: './e2e',

  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'allure-playwright',


  use: {
    baseURL: 'http://localhost:8000',
    trace: 'on-first-retry',
  },


  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],
});
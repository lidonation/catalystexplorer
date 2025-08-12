import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './tests-e2e',
    fullyParallel: false,
    forbidOnly: !!process.env.CI,
    timeout: 120_000,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : 3,
    reporter: [['html', { open: 'never' }], ['allure-playwright']],

    use: {
        baseURL: process.env.CI ? 'http://localhost:3000' : 'https://preview.catalystexplorer.com/en',
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
    },

    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
        {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] },
        },
        {
            name: 'webkit',
            use: { ...devices['Desktop Safari'] },
        }
    ],
});

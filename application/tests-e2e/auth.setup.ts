// for tests that require authentication.

import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';
setup('authenticate', async ({ page, browserName }) => {
    await page.goto('/login', { waitUntil: 'networkidle' });

    const loginForm = page.locator('[data-testid="login-form"]');
    await expect(loginForm).toBeVisible({ timeout: 30000 });

    await page.locator('[data-testid="email-input"]').fill('admin@catalystexplorer.com');
    await page.locator('[data-testid="password-input"]').fill('ofnXIFbZ0JOuGBqx');

    const submitButton = page.locator('[data-testid="login-submit-button"]:not([disabled])');
    await expect(submitButton).toBeEnabled({ timeout: 5000 });

    if (browserName === 'webkit') {
        await submitButton.click();
        await page.waitForTimeout(3000);
        await page.goto('/', { waitUntil: 'networkidle' });
    } else if (browserName === 'firefox') {
        await submitButton.click();

        try {
            await page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 10000 });
        } catch {
            await page.waitForSelector('[data-testid="navbar-home"], [data-testid="home-page"], nav, header', { timeout: 8000 }).catch(() => { });
        }

        if (page.url().includes('/login')) {
            await page.goto('/', { waitUntil: 'networkidle' });
        }
    } else {
        await Promise.all([
            page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 15000 }),
            submitButton.click()
        ]);
    }

    await page.goto('/', { waitUntil: 'networkidle' });
    const finalUrl = page.url();
    if (finalUrl.includes('/login')) {
        throw new Error(`Login verification failed for ${browserName} - redirected to login`);
    }

    await page.context().storageState({ path: authFile });
});

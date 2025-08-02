import { expect, test } from '@playwright/test';

test.describe('Proposal Tinder', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('domcontentloaded');
    });

    test('Successful Login and Step 1 Completion', async ({ page }) => {
        await page.goto('/workflows/tinder-proposal/steps/1');

        await page.fill(
            '[data-testid="login-email-input"]',
            'admin@catalystexplorer.com',
        );
        await page.fill(
            '[data-testid="login-password-input"]',
            'ofnXIFbZ0JOuGBqx',
        );

        const checkbox = page.locator(
            `[data-testid="login-remember-checkbox"]`,
        );
        await expect(checkbox).toBeVisible();

        await checkbox.click();
        await expect(checkbox).toBeChecked();

        const loginButton = page.locator('[data-testid="login-signin-button"]');

        await expect(loginButton).toBeVisible();

        await loginButton.click();

        await page.goto('workflows/tinder-proposal/steps/1');

    });

});

import { expect, test } from '@playwright/test';

test.describe('Proposal Tinder', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('https://preview.catalystexplorer.com/en/');
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

        await page.waitForURL(/\/map/);

        await page.context().storageState({ path: 'storage/auth.json' });

        await page.goto('/en/workflows/tinder-proposal/steps/1');


        await page.goto('workflows/tinder-proposal/steps/1');

        const nav = page.locator('[data-testid="workflow-nav"]');
        await expect(nav).toBeVisible();

        const step1Active = page.locator('[data-testid="step-number-1"]');

        await expect(step1Active).toBeVisible();

        await expect(step1Active).toHaveClass(/border-primary/);
        await expect(step1Active).toHaveClass(/text-primary/);

        const fundSelector = page.locator(
            '[data-testid="tinder-fund-selector"]',
        );
        await expect(fundSelector).toBeVisible();

        await fundSelector.click();

        const option = page.locator(
            '[data-testid="selector-option-vd8fn02sxi"]',
        );
        await option.click();

        const proposalSizeCheckbox = page
            .locator(`[data-testid="proposal-size-checkbox"]`)
            .first();

        await expect(proposalSizeCheckbox).toBeVisible();

        await proposalSizeCheckbox.click();

        await expect(proposalSizeCheckbox).toBeChecked();

        const proposalTypeCheckbox = page
            .locator(`[data-testid="impact-type-checkbox"]`)
            .first();

        await expect(proposalTypeCheckbox).toBeVisible();

        await proposalTypeCheckbox.click();

        await expect(proposalTypeCheckbox).toBeChecked();

        const beginButton = page.locator('[data-testid="tinder-begin-button"]');

        await expect(beginButton).toBeVisible();

        await beginButton.click();
    });

    test('Successful Step 2 Completion', async ({ page }) => {
        await page.goto('/workflows/tinder-proposal/steps/2');

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

        await page.waitForURL(/\/map/);

        await page.context().storageState({ path: 'storage/auth.json' });

        await page.goto('/en/workflows/tinder-proposal/steps/1');


        await page.goto('workflows/tinder-proposal/steps/1');

        const nav = page.locator('[data-testid="workflow-nav"]');
        await expect(nav).toBeVisible();

        const step1Active = page.locator('[data-testid="step-number-1"]');

        await expect(step1Active).toBeVisible();

        await expect(step1Active).toHaveClass(/border-primary/);
        await expect(step1Active).toHaveClass(/text-primary/);

        const fundSelector = page.locator(
            '[data-testid="tinder-fund-selector"]',
        );
        await expect(fundSelector).toBeVisible();

        await fundSelector.click();

        const option = page.locator(
            '[data-testid="selector-option-vd8fn02sxi"]',
        );
        await option.click();

        const proposalSizeCheckbox = page
            .locator(`[data-testid="proposal-size-checkbox"]`)
            .first();

        await expect(proposalSizeCheckbox).toBeVisible();

        await proposalSizeCheckbox.click();

        await expect(proposalSizeCheckbox).toBeChecked();

        const proposalTypeCheckbox = page
            .locator(`[data-testid="impact-type-checkbox"]`)
            .first();

        await expect(proposalTypeCheckbox).toBeVisible();

        await proposalTypeCheckbox.click();

        await expect(proposalTypeCheckbox).toBeChecked();

        const beginButton = page.locator('[data-testid="tinder-begin-button"]');

        await expect(beginButton).toBeVisible();

        await beginButton.click();
    });
});

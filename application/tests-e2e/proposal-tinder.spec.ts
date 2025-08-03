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

        await page.goto('/workflows/tinder-proposal/steps/1', {
            waitUntil: 'domcontentloaded',
        });

        await page.context().storageState({ path: 'storage/auth.json' });

        await page.waitForLoadState('domcontentloaded');

        // await page.waitForSelector('[data-testid="workflow-nav"]');

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
            '[data-testid="selector-option-f39vza7c05"]',
        );
        await option.click();

        const proposalCategoryCheckbox1 = page
            .locator(`[data-testid="proposal-category-checkbox"]`)
            .first();

        await expect(proposalCategoryCheckbox1).toBeVisible();

         await proposalCategoryCheckbox1.click();

        await expect(proposalCategoryCheckbox1).toBeChecked();

        const proposalCategoryCheckbox2 = page
            .locator(`[data-testid="proposal-category-checkbox"]`)
            .nth(1);

        await expect(proposalCategoryCheckbox2).toBeVisible();

        await proposalCategoryCheckbox2.click();

        await expect(proposalCategoryCheckbox2).toBeChecked();

        const proposalCategoryCheckbox3 = page
            .locator(`[data-testid="proposal-category-checkbox"]`)
            .nth(2);

        await expect(proposalCategoryCheckbox3).toBeVisible();

        await proposalCategoryCheckbox3.click();

        await expect(proposalCategoryCheckbox3).toBeChecked();

        const proposalCategoryCheckbox4 = page
            .locator(`[data-testid="proposal-category-checkbox"]`)
            .nth(3);

        await expect(proposalCategoryCheckbox4).toBeVisible();

        await proposalCategoryCheckbox4.click();

        await expect(proposalCategoryCheckbox4).toBeChecked();

        const proposalTypeCheckbox5 = page
            .locator(`[data-testid="proposal-size-checkbox"]`)
            .nth(4);

        const proposalSizeCheckbox1 = page
            .locator(`[data-testid="proposal-size-checkbox"]`)
            .first();

        await expect(proposalSizeCheckbox1).toBeVisible();

        await proposalSizeCheckbox1.click();

        await expect(proposalSizeCheckbox1).toBeChecked();

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
        await page.goto('/workflows/tinder-proposal/steps/2', {
            waitUntil: 'domcontentloaded',
        });

        await page.waitForLoadState('domcontentloaded');

        // await page.waitForSelector('[data-testid="workflow-nav"]', {
        //     timeout: 30000,
        // });

        const step2Active = page.locator('[data-testid="step-number-2"]');

        await expect(step2Active).toBeVisible();

        await expect(step2Active).toHaveClass(/border-primary/);
        await expect(step2Active).toHaveClass(/text-primary/);

        const titleInput = page.locator(
            '[data-testid="tinder-proposal-title-input"]',
        );
        await expect(titleInput).toBeVisible();

        await titleInput.fill('Test Proposal Title');

        const contentTextarea = page.locator(
            '[data-testid="tinder-proposal-content-textarea"]',
        );
        await expect(contentTextarea).toBeVisible();

        await contentTextarea.fill('This is a test for the tinder proposal workflow. Writing a test to see if it works as it should.');

        const visibilityRadioGroup = page.locator(
            '[data-testid="tinder-visibility-radio-group"]',
        );
        
        await expect(visibilityRadioGroup).toBeVisible();

        const visibilityOptions = visibilityRadioGroup.locator(
            'input[type="radio"]',
        );
        await visibilityOptions.first().check();

        const commentsSwitch = page.locator(
            '[data-testid="tinder-comments-switch"]',
        );
        await expect(commentsSwitch).toBeVisible();

        await commentsSwitch.click();
        await expect(commentsSwitch).toBeChecked();

        const colorTextInput = page.locator('[data-testid="color-text-input"]');
        await expect(colorTextInput).toBeVisible();

        await colorTextInput.fill('#ff0000');

        const colorPickerInput = page.locator(
            '[data-testid="color-picker-input"]',
        );
        await expect(colorPickerInput).toBeVisible();

        await colorPickerInput.click();

        const statusRadioGroup = page.locator(
            '[data-testid="tinder-status-radio-group"]',
        );
        await expect(statusRadioGroup).toBeVisible();

        const statusOptions = statusRadioGroup.locator('input[type="radio"]');
        await statusOptions.first().check();

        const saveButton = page.locator('[data-testid="tinder-save-button"]');
        await expect(saveButton).toBeVisible();

        await saveButton.click();
    });
});

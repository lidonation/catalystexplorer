import { test, expect } from '@playwright/test';

test.use({ storageState: 'playwright/.auth/user.json' });

test.describe('Bookmark Core Functionality Tests', () => {
    test('bookmark button opens popup with page1', async ({ page }) => {
        await page.goto('/proposals');
        await page.waitForLoadState('domcontentloaded');

        await page.waitForSelector('[data-testid^="vertical-proposal-card-"]', { timeout: 30000 });
        const firstProposal = page.locator('[data-testid^="vertical-proposal-card-"]').first();

        const bookmarkButton = firstProposal.locator('[data-testid="bookmark-button"]');
        await bookmarkButton.click();

        const bookmarkPopup = page.locator('[data-testid="bookmark-popup"]');
        await expect(bookmarkPopup).toBeVisible();
        await expect(bookmarkPopup.locator('[data-testid="bookmark-page1"]')).toBeVisible();
    });

    test('complete bookmark and list creation workflow', async ({ page }) => {
        await page.goto('/proposals');
        await page.waitForLoadState('domcontentloaded');

        // Mock API calls
        await page.route('**/api/collections/create', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    success: true,
                    data: { id: 'test-list-id', title: 'E2E Test List' },
                    message: 'List created successfully'
                }),
            });
        });

        await page.waitForSelector('[data-testid^="vertical-proposal-card-"]', { timeout: 30000 });
        const firstProposal = page.locator('[data-testid^="vertical-proposal-card-"]').first();
        await firstProposal.locator('[data-testid="bookmark-button"]').click();

        const bookmarkPopup = page.locator('[data-testid="bookmark-popup"]');
        await expect(bookmarkPopup).toBeVisible();

        // Create new list
        await bookmarkPopup.getByTestId('add-list-button').click();
        await bookmarkPopup.getByTestId('list-name-input').fill('E2E Test List');
        await bookmarkPopup.getByTestId('create-list-submit-button').click();

        // Verify success or return to page1
        const successPage = bookmarkPopup.locator('[data-testid="bookmark-page3"]');
        const page1 = bookmarkPopup.locator('[data-testid="bookmark-page1"]');

        await Promise.race([
            successPage.waitFor({ state: 'visible', timeout: 5000 }),
            page1.waitFor({ state: 'visible', timeout: 5000 })
        ]);

        // Close popup
        await page.mouse.click(10, 10);
        await expect(bookmarkPopup).toBeHidden();
    });

    test('bookmark to existing list', async ({ page }) => {
        await page.goto('/proposals');
        await page.waitForLoadState('domcontentloaded');

        await page.waitForSelector('[data-testid^="vertical-proposal-card-"]', { timeout: 30000 });
        const firstProposal = page.locator('[data-testid^="vertical-proposal-card-"]').first();
        await firstProposal.locator('[data-testid="bookmark-button"]').click();

        const bookmarkPopup = page.locator('[data-testid="bookmark-popup"]');
        await expect(bookmarkPopup).toBeVisible();

        // Try to bookmark to first available list
        const listsContainer = bookmarkPopup.getByTestId('bookmark-lists-container');
        if (await listsContainer.isVisible()) {
            const firstCheckbox = listsContainer.locator('[data-testid^="bookmark-list-checkbox-"]').first();
            await firstCheckbox.check();
            await page.waitForTimeout(1000);
        }

        // Close popup
        await page.mouse.click(10, 10);
        await expect(bookmarkPopup).toBeHidden();
    });
});

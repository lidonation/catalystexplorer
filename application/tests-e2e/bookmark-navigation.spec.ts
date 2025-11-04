import { test, expect } from '@playwright/test';

test.use({ storageState: 'playwright/.auth/user.json' });

test.describe('Bookmark Navigation Tests - Authenticated', () => {

    test('back arrow returns to previous page', async ({ page }) => {
        await page.goto('/proposals');
        await page.waitForLoadState('domcontentloaded');

        // Wait for and click first proposal's bookmark button
        await page.waitForSelector('[data-testid^="vertical-proposal-card-"]', { timeout: 30000 });
        const firstProposal = page.locator('[data-testid^="vertical-proposal-card-"]').first();
        await expect(firstProposal).toBeVisible({ timeout: 15000 });

        const bookmarkButton = firstProposal.locator('[data-testid="bookmark-button"]');
        await bookmarkButton.click();
        await page.waitForTimeout(800);

        // Verify popup opens on page 1
        const bookmarkPopup = page.locator('[data-testid="bookmark-popup"]');
        await expect(bookmarkPopup).toBeVisible({ timeout: 10000 });
        const page1 = bookmarkPopup.locator('[data-testid="bookmark-page1"]');
        await expect(page1).toBeVisible({ timeout: 5000 });

        // Navigate to page 2
        const addListButton = bookmarkPopup.getByTestId('add-list-button');
        await addListButton.click({ force: true });
        await page.waitForTimeout(500);

        const page2 = bookmarkPopup.locator('[data-testid="bookmark-page2"]');
        const backButton = page2.getByTestId('new-list-back-button');
        await expect(backButton).toBeVisible({ timeout: 10000 });

        // Click back arrow - should return to page 1
        await backButton.click({ force: true });
        await page.waitForTimeout(500);

        // Verify we're back on page 1 by checking if add-list-button is visible
        const addListButtonAgain = bookmarkPopup.getByTestId('add-list-button');
        await expect(addListButtonAgain).toBeVisible({ timeout: 10000 });
    });

    test('close button closes the popup', async ({ page }) => {
        await page.goto('/proposals');
        await page.waitForLoadState('domcontentloaded');

        // Wait for and click first proposal's bookmark button
        await page.waitForSelector('[data-testid^="vertical-proposal-card-"]', { timeout: 30000 });
        const firstProposal = page.locator('[data-testid^="vertical-proposal-card-"]').first();
        await expect(firstProposal).toBeVisible({ timeout: 15000 });

        const bookmarkButton = firstProposal.locator('[data-testid="bookmark-button"]');
        await bookmarkButton.click();
        await page.waitForTimeout(800);

        // Verify popup is open
        const bookmarkPopup = page.locator('[data-testid="bookmark-popup"]');
        await expect(bookmarkPopup).toBeVisible({ timeout: 10000 });

        // Click close button
        const closeButton = bookmarkPopup.locator('[data-testid="bookmark-close-button"]');
        await expect(closeButton).toBeVisible({ timeout: 5000 });
        await closeButton.click({ force: true });

        // Verify popup is closed
        await expect(bookmarkPopup).toBeHidden({ timeout: 5000 });
    });
});

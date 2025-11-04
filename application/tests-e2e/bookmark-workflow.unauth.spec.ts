import { test, expect } from '@playwright/test';

test.describe('Bookmark Functionality - Unauthenticated User', () => {
    test('clicking bookmark button shows auth modal', async ({ page }) => {
        // Navigate to proposals page
        await page.goto('/en/proposals', { waitUntil: 'networkidle' });

        // Wait for page to load completely (include any dynamic content)
        await page.waitForLoadState('networkidle');

        // Find and click the global bookmark button
        const bookmarkButton = page.locator('button:has(svg)').first();
        await expect(bookmarkButton).toBeVisible();

        // Click the bookmark button
        await bookmarkButton.click();

        // Verify that auth modal appears instead of navigation
        const authModal = page.locator('[data-testid*="login"], [data-testid*="auth"]').first();
        await expect(authModal).toBeVisible({ timeout: 5000 });

        // Verify we're still on the same page (no navigation occurred)
        await expect(page).toHaveURL(/\/proposals/);

    });
});

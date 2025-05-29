import { expect, test } from '@playwright/test';

test.describe('Home Page', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('has title', async ({ page }) => {
        await expect(page).toHaveTitle('Catalyst Explorer - CatalystExplorer');
    });

    test('has global search', async ({ page }) => {
        const searchForm = page.getByTestId('global-search-form');
        await expect(searchForm).toBeVisible();
    });
});

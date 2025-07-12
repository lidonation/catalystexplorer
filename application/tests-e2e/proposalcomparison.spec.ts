import { expect, test } from '@playwright/test';

test.describe('Proposal Comparison', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('domcontentloaded');
    });

    test('opens proposal comparison modal when link is clicked', async ({
        page,
    }) => {
        await page.goto('/');

        await page.getByTestId('proposal-comparison-link').click();

        const modal = page.getByTestId('proposal-comparison-modal');
        await expect(modal).toBeVisible();

        await expect(modal).toContainText('Proposal Comparison');
    });

    test('clicking "Add to comparison" increases comparison count by 1', async ({
        page,
    }) => {
        await page.goto('/');

        const countLocator = page.getByTestId('proposal-comparison-count');
        const initialCountText = await countLocator.textContent();
        const initialCount = parseInt(initialCountText || '0', 10);

        await page
            .getByRole('link', { name: /add to comparison/i })
            .first()
            .click();

        const updatedCountText = await countLocator.textContent();
        const updatedCount = parseInt(updatedCountText || '0', 10);

        expect(updatedCount).toBe(initialCount + 1);
    });
});

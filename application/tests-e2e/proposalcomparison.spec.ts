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

        const comparisonLink = page.locator(
            `[data-testid="proposal-comparison-link"]`,
        );

        await expect(comparisonLink).toBeVisible();

        await comparisonLink.click();

        const modal = page.getByTestId('proposal-comparison-modal');
        await expect(modal).toBeVisible();
    });

    test('proposal comparison count increases when you click on the compare proposal button', async ({
        page,
    }) => {
        await page.goto('/');

        const initialCountElement = page.locator(`[data-testid="proposal-comparison-count"]`)
        await expect(initialCountElement).toBeVisible();

        const initialCountText =
            (await initialCountElement.textContent()) || '0';
        const initialCount = parseInt(initialCountText);
        
        await page.goto('/proposals');

        const compareButton = page.locator(`[data-testid="compare-button"]`).first();

        await expect(compareButton).toBeVisible();

        await compareButton.click();

        const newCountElement = page.getByTestId('proposal-comparison-count');
        const newCountText = (await newCountElement.textContent()) || '0';
        const newCount = parseInt(newCountText);

        expect(newCount).toBeGreaterThan(initialCount);
    });
});

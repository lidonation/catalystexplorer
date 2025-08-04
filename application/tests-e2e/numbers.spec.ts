import { expect, test } from '@playwright/test';

test.describe('Metrics Cards Specific Tests', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('domcontentloaded');
    });

    test('metrics section exists', async ({ page }) => {
        await expect(page.locator('[data-testid="metrics-section"]')).toBeVisible();
    });
    test('displays 5 metric charts (visual only)', async ({ page }) => {
        await expect(page.locator('[data-testid="metrics-section"]')).toBeVisible();

        await page.waitForFunction(() => {
            const metricsSection = document.querySelector('[data-testid="metrics-section"]');
            return metricsSection && !metricsSection.textContent?.toLowerCase().includes('loading');
        }, { timeout: 30000 });
        const svgCards = page.locator('[data-testid="metrics-section"] svg');
        const cardCount = await svgCards.count();

        expect(cardCount).toBe(5);

        for (let i = 0; i < cardCount; i++) {
            const chart = svgCards.nth(i);
            await expect(chart).toBeVisible();

            const svgContent = await chart.innerHTML();
            expect(svgContent.length).toBeGreaterThan(0);
        }
    });

    test('metrics header and subtitle exist', async ({ page }) => {
        await expect(page.locator('[data-testid="metrics-section"]')).toBeVisible();

        await expect(page.locator('[data-testid="metrics-header"]')).toBeVisible();

        const headerText = await page.locator('[data-testid="metrics-header"]').textContent();
        expect(headerText).toBeTruthy();
    });
    test('see more charts link works', async ({ page, browserName }) => {
           await expect(page.locator('[data-testid="metrics-section"]')).toBeVisible();

           const seeMoreLink = page.locator('[data-testid="see-more-metrics"]');
           await expect(seeMoreLink).toBeVisible();

           if (browserName === 'webkit') {
               const href = await seeMoreLink.getAttribute('href');
               expect(href).toContain('charts');
           } else {
               await seeMoreLink.click();
               await expect(page).toHaveURL(/.*\/charts/);
           }
       });
});

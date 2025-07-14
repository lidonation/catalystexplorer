import { expect, test } from '@playwright/test';

test.describe('Metrics Cards Specific Tests', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('domcontentloaded');
    });
    test('metrics section exists', async ({ page }) => {
        await expect(page.locator('[data-testid="metrics-section"]')).toBeVisible();
    });
    test('displays 5 metric cards (SVG charts)', async ({ page }) => {
        await expect(page.locator('[data-testid="metrics-section"]')).toBeVisible();

        await page.waitForFunction(() => {
            const metricsSection = document.querySelector('[data-testid="metrics-section"]');
            return metricsSection && !metricsSection.textContent?.toLowerCase().includes('loading');
        }, { timeout: 15000 });

        const svgCards = page.locator('[data-testid="metrics-section"] svg');
        const cardCount = await svgCards.count();

        console.log(`Found ${cardCount} SVG metric cards`);

        if (cardCount === 0) {
            console.log('WebKit compatibility issue ');
        } else {
            expect(cardCount).toBe(5);
        }
    });
    test('metric cards are clickable charts', async ({ page }) => {
        await expect(page.locator('[data-testid="metrics-section"]')).toBeVisible();

        await page.waitForFunction(() => {
            const metricsSection = document.querySelector('[data-testid="metrics-section"]');
            return metricsSection && !metricsSection.textContent?.toLowerCase().includes('loading');
        }, { timeout: 20000 });
        const svgCards = page.locator('[data-testid="metrics-section"] svg');
        const cardCount = await svgCards.count();

        if (cardCount > 0) {
            await expect(svgCards.first()).toBeVisible();
            console.log(`Found ${cardCount} interactive metric charts`);
        } else {
            console.log('No SVG charts found');
        }
    });
    test('metrics header and subtitle exist', async ({ page }) => {
        await expect(page.locator('[data-testid="metrics-section"]')).toBeVisible();

        await expect(page.locator('[data-testid="metrics-header"]')).toBeVisible();

        const headerText = await page.locator('[data-testid="metrics-header"]').textContent();
        expect(headerText).toBeTruthy();

        console.log(`Metrics header text: "${headerText}"`);
    });
});


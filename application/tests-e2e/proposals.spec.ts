import { expect, test } from '@playwright/test';

test.describe('Proposals Specific Tests', () => {
   test.beforeEach(async ({ page }) => {
       await page.goto('/');
       await page.waitForLoadState('domcontentloaded');
   });
   test('proposals section exists', async ({ page }) => {
       await expect(page.locator('[data-testid="proposals-section"]')).toBeVisible();
   });
   test('displays proposals', async ({ page }) => {
       await expect(page.locator('[data-testid="proposals-section"]')).toBeVisible();

       await page.waitForFunction(() => {
           const proposalsSection = document.querySelector('[data-testid="proposals-section"]');
           return proposalsSection && !proposalsSection.textContent?.toLowerCase().includes('loading');
       }, { timeout: 15000 });
       const proposalsWrapper = page.locator('[data-testid="proposals-section"] .proposals-wrapper');
       await expect(proposalsWrapper).toBeVisible();

       const proposalCount = await proposalsWrapper.locator('> div').count();
       expect(proposalCount).toBe(3);
   });
   test('proposals have content', async ({ page }) => {
       await expect(page.locator('[data-testid="proposals-section"]')).toBeVisible();

       await page.waitForFunction(() => {
           const proposalsSection = document.querySelector('[data-testid="proposals-section"]');
           return proposalsSection && !proposalsSection.textContent?.toLowerCase().includes('loading');
       }, { timeout: 30000 });

       const proposalsWrapper = page.locator('[data-testid="proposals-section"] .proposals-wrapper');
       const proposalCards = proposalsWrapper.locator('> div');

       const cardCount = await proposalCards.count();
       expect(cardCount).toBeGreaterThan(0);

       for (let i = 0; i < cardCount; i++) {
           await expect(proposalCards.nth(i)).toBeVisible();
       }
   });
   test('see more proposals link works', async ({ page, browserName }) => {
       await expect(page.locator('[data-testid="proposals-section"]')).toBeVisible();

       const seeMoreLink = page.locator('[data-testid="see-more-proposals"]');
       await expect(seeMoreLink).toBeVisible();

       if (browserName === 'webkit') {
           const href = await seeMoreLink.getAttribute('href');
           expect(href).toContain('proposals');
       } else {
           await seeMoreLink.click();
           await expect(page).toHaveURL(/.*\/proposals/);
       }
   });
   test('proposals section has header', async ({ page }) => {
       await expect(page.locator('[data-testid="proposals-section"]')).toBeVisible();

       const sectionText = await page.locator('[data-testid="proposals-section"]').textContent();
       expect(sectionText).toContain('Proposals');
       expect(sectionText).toContain('See more proposals');
   });
});

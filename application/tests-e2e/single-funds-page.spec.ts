import { expect, test } from '@playwright/test';

test.setTimeout(180_000); 

test.describe('Single Fund Page Tests', () => {
  test.beforeEach(async ({ page }) => {
  test.setTimeout(300_000);
  await page.goto('/funds');
  await page.waitForLoadState('networkidle');

  const cardTitle = page.locator('[data-testid="fund-item-Fund 8"] [data-testid="fund-card-title"]').first();

  let isVisible = false;
  for (let i = 0; i < 10; i++) {
    isVisible = await cardTitle.isVisible();
    if (isVisible) break;
    await page.mouse.wheel(0, 500);
    await page.waitForTimeout(500);
  }

  if (!isVisible) {
    throw new Error('Fund 8 card title not found or not visible after scrolling.');
  }

  await cardTitle.click();

  await page.waitForURL(/\/funds\/[^/]+$/);
  await page.waitForSelector('[data-testid="funds-header"]');
});

  test('loads single fund page URL correctly', async ({ page }) => {
    await expect(page).toHaveURL(/\/funds\/[^/]+$/);
  });

  test('shows fund title heading', async ({ page }) => {
    const heading = page.getByRole('heading', { level: 4 });
    await expect(heading).toBeVisible();
    await expect(heading).not.toBeEmpty();
  });
  
test('displays campaign cards', async ({ page }) => {
  const cards = page.locator('[data-testid="campaign-card"]');

  await expect(cards.first()).toBeVisible({ timeout: 180000 });
 
  const cardCount = await cards.count();
  expect(cardCount).toBeGreaterThan(0);
});

  test('sort dropdown renders and functions correctly', async ({ page }) => {
    const sortButton = page.locator('[data-testid="selector-button"]');
    await expect(sortButton).toBeVisible();
    
    await sortButton.click();
    
    await expect(page.locator('[data-testid^="selector-option-"]').first()).toBeVisible();
    
    const descOption = page.locator('[data-testid="selector-option-amount:desc"]');
    await expect(descOption).toBeVisible();
    await descOption.click();
    
    await expect(descOption).toBeHidden();
  });

  test('page contains expected sections', async ({ page }) => {
    await expect(page.getByTestId('funds-header')).toBeVisible();
    await expect(page.locator('[data-testid="selector-button"]')).toBeVisible();
  });
});










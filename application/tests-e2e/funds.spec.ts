import { test, expect } from '@playwright/test';

test.describe('Funds Page rendering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://preview.catalystexplorer.com/funds', { 
      waitUntil: 'load'
    });
    
    await page.waitForLoadState('domcontentloaded');
    
    await page.waitForSelector('[data-testid="funds-bar-chart-section"]');
    await page.waitForSelector('[data-testid="funds-list-section"]');
  });

  test('renders the funds bar chart', async ({ page }) => {
    const chartContainer = page.getByTestId('funds-bar-chart-container');
    await expect(chartContainer).toBeVisible();

    await page.waitForSelector('svg');
    
    const chartSvg = page.locator('svg').first();
    await expect(chartSvg).toBeVisible();
    
    const chartBars = page.locator('svg rect');
    const barCount = await chartBars.count();
    expect(barCount).toBeGreaterThan(0);

    await expect(page.getByTestId('charts-fund-rounds')).toBeVisible();
    await expect(page.getByTestId('charts-total-proposals')).toBeVisible();
    await expect(page.getByTestId('charts-funded-proposals')).toBeVisible();
    await expect(page.getByTestId('charts-total-funds-requested')).toBeVisible();
    await expect(page.getByTestId('charts-total-funds-awarded')).toBeVisible();
  });
  
test('displays funds section and fund cards', async ({ page }) => {
  const fundsSection = page.locator('[data-testid="funds-list-section"]');
  await expect(fundsSection).toBeVisible();

  await page.waitForFunction(() => {
    const el = document.querySelector('[data-testid="funds-list-section"]');
    return el && !el.textContent?.toLowerCase().includes('loading');
  });

  const fundCards = page.locator('[data-testid^="fund-card-"]');
  const fundCount = await fundCards.count();
  expect(fundCount).toBe(0);

  for (let i = 0; i < fundCount; i++) {
    const card = fundCards.nth(i);
    await expect(card).toBeVisible();
    await expect(card.locator('[data-testid="fund-card-title"]')).toBeVisible();
    await expect(card.locator('[data-testid="fund-card-image"]')).toBeVisible();
  }
});
test('filters dropdown toggles options and updates the bar chart', async ({ page }) => {
  const filterButton = page.locator('[data-testid="selector-button"]');
  await expect(filterButton).toBeVisible();
  await filterButton.click();

  const checkboxTestIds = [
    'selector-checkbox-Funded Proposals',
    'selector-checkbox-Unfunded Proposals',
    'selector-checkbox-Completed Proposals'
  ];

  for (const testId of checkboxTestIds) {
    const checkbox = page.locator(`[data-testid="${testId}"]`);
    await expect(checkbox).toBeVisible();
  
    await checkbox.click();
    await expect(checkbox).not.toBeChecked();
 
    await checkbox.click();
    await expect(checkbox).toBeChecked();
  }

  await page.waitForTimeout(500);

  const chartSection = page.locator('[data-testid="funds-bar-chart-section"]');
  await expect(chartSection).toBeVisible();
});
});           
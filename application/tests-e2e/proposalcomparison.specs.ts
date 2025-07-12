import { test, expect } from '@playwright/test';

test('opens proposal comparison modal when link is clicked', async ({ page }) => {
  await page.goto('/'); 

  await page.getByRole('link', { name: /compare proposals/i }).click();
  // Alternative: await page.getByTestId('compare-proposals-link').click();

  // Assert the modal is visible
  const modal = page.getByTestId('proposal-comparison-modal');
  await expect(modal).toBeVisible();

  // Optionally check for specific content inside the modal
  await expect(modal).toContainText('Proposal Comparison');
});

test('clicking "Add to comparison" increases comparison count by 1', async ({ page }) => {
  // Go to the proposals page
  await page.goto('/'); 
  
  const countLocator = page.getByTestId('proposal-comparison-count');
  const initialCountText = await countLocator.textContent();
  const initialCount = parseInt(initialCountText || '0', 10);

  await page.getByRole('link', { name: /add to comparison/i }).first().click();

  const updatedCountText = await countLocator.textContent();
  const updatedCount = parseInt(updatedCountText || '0', 10);

  expect(updatedCount).toBe(initialCount + 1);
});

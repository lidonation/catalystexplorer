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

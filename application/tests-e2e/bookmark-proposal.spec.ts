import { test, expect } from '@playwright/test';

test('unauthenticated user clicking Bookmark is redirected to login', async ({ page }) => {
  await page.context().clearCookies(); // Ensure logged out
  await page.goto('/proposals'); // or your actual proposals page

  // Wait for the first proposal card to be visible
  const firstCard = page.locator('[data-testid^="vertical-proposal-card-"]').first();
  await expect(firstCard).toBeVisible();

  // Click the Bookmark button inside the first card
  const bookmarkButton = firstCard.getByRole('button', { name: 'Bookmark' });
  await bookmarkButton.click();

  // Expect redirect to login page
  await expect(page).toHaveURL(/\/login/);
});

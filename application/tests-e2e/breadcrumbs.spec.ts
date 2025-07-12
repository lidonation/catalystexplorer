import { expect, test } from '@playwright/test';

// Define your routes and their expected final URL paths
const breadcrumbPages = [
  { name: 'Proposal', path: '/proposals' },
  { name: 'Communities', path: '/communities' },
  { name: 'Funds', path: '/funds' },
  { name: 'Connections', path: '/connections' },
  { name: 'ideascaleProfiles', path: '/ideascale-profiles' },
  { name: 'Groups', path: '/groups' },
  // Add more paths later on with the above format
  
  
];

breadcrumbPages.forEach(({ name, path }) => {
  test.describe(name, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState('domcontentloaded');
    });

    test('has breadcrumbs', async ({ page }) => {
      const breadCrumbs = page.getByTestId('breadcrumbs');
      await expect(breadCrumbs).toBeVisible();
    });

    test('icon leads to homepage', async ({ page }) => {
      const breadCrumbs = page.getByTestId('breadcrumbs');
      await expect(breadCrumbs).toBeVisible();
      await breadCrumbs.click();

      // Expect it to stay on the same localized page
      const finalSegment = path.replace(/^\//, ''); // e.g., 'proposals'
      await expect(page).toHaveURL(new RegExp(`/[a-z]{2}/${finalSegment}$`));
    });
  });
});

import { test, expect } from '@playwright/test';

test.describe('Footer links section', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
  });

  test('renders proposals links correctly', async ({ page }) => {
    await expect(page.getByTestId('proposals-link')).toBeVisible();
    await expect(page.getByTestId('reviews-link')).toBeVisible();
    await expect(page.getByTestId('reports-link')).toBeVisible();
    await expect(page.getByTestId('funds-link')).toBeVisible();
  });

  test('renders communities links correctly', async ({ page }) => {
    await expect(page.getByTestId('ideascale-profiles-link')).toBeVisible();
    await expect(page.getByTestId('groups-link')).toBeVisible();
    await expect(page.getByTestId('communities-link')).toBeVisible();
    await expect(page.getByTestId('dreps-link')).toBeVisible();
  });

  test('renders data links correctly', async ({ page }) => {
    await expect(page.getByTestId('impact-link')).toBeVisible();
    await expect(page.getByTestId('spending-link')).toBeVisible();
    await expect(page.getByTestId('general-link')).toBeVisible();
    await expect(page.getByTestId('ccv4-link')).toBeVisible();
    await expect(page.getByTestId('catalyst-api-link')).toBeVisible();
    await expect(page.getByTestId('proposal-csvs-link')).toBeVisible();
  });

  test('renders social links correctly', async ({ page }) => {
    await expect(page.getByTestId('twitter-link')).toBeVisible();
    await expect(page.getByTestId('linkedin-link')).toBeVisible();
    await expect(page.getByTestId('facebook-link')).toBeVisible();
    await expect(page.getByTestId('github-link')).toBeVisible();
  });

  test('renders legal links text correctly', async ({ page }) => {
    await expect(page.getByTestId('terms-link')).toContainText('Terms');
    await expect(page.getByTestId('privacy-link')).toContainText('Privacy');
    await expect(page.getByTestId('cookies-link')).toContainText('Cookies');
    await expect(page.getByTestId('licence-link')).toContainText('Licenses');
  });
});

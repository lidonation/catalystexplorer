import { test, expect } from '@playwright/test';

test.setTimeout(60_000); 
test.describe('Bookmark Collection Cards', () => {
  test.beforeEach(async ({ page }) => {
   await page.goto('/lists', { waitUntil: 'load' });

   
  });

  test('should render bookmark collection cards', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Discover Community Lists' })).toBeVisible();

    const cards = page.locator('[data-testid="bookmark-collection-card"], .relative.flex.w-full.gap-1');
    await expect(cards).not.toBe(0);

    const firstCard = cards.first();
    await expect(firstCard).toBeVisible();

  });
test('should display card content correctly', async ({ page }) => {
  const cards = page.locator('[data-testid="bookmark-collection-card"]');
  const firstCard = cards.first();

  const title = firstCard.locator('[data-testid="bookmark-title"]');
  await expect(title).toBeVisible();
  await expect(title).not.toBeEmpty();

  const description = firstCard.locator('[data-testid="card-description"]');
  await expect(description).toBeVisible();
  await expect(description).not.toBeEmpty();

  const itemsBadge = firstCard.locator('.bg-primary-light'); // You can also add a data-testid if needed
  await expect(itemsBadge).toBeVisible();

  const badgeText = await itemsBadge.textContent();
  expect(badgeText).toMatch(/\d+/);
});


  test('should display author information', async ({ page }) => {
    const cards = page.locator('[data-testid="bookmark-collection-card"], .relative.flex.w-full.gap-1');
    const firstCard = cards.first();

    const avatar = firstCard.locator('[data-testid="user-avatar"]').or(
      firstCard.locator('.size-8')
    ).or(
      firstCard.locator('img')
    ).first();
    await expect(avatar).toBeVisible();

    const authorName = firstCard.locator('.font-semibold').filter({ 
      hasText: /[A-Za-z]/ 
    }).first();
    await expect(authorName).toBeVisible();
    await expect(authorName).not.toBeEmpty();
  });
  test('should render View List link and navigate to collection page', async ({ page }) => {
  const cards = page.locator('[data-testid="bookmark-collection-card"]');
  const firstCard = cards.first();

  await expect(firstCard).toBeVisible();

  const viewListLink = firstCard.locator('[data-testid="view-list-button"]');
  await expect(viewListLink).toBeVisible();
  await expect(viewListLink).toBeEnabled();

  const href = await viewListLink.getAttribute('href');
  expect(href).toBeTruthy();
  expect(href).toContain('lists');

  await viewListLink.click();
  await page.waitForLoadState('networkidle');

  // ✅ Assert URL
  await expect(page).toHaveURL(/\/lists\/[a-zA-Z0-9_-]+/);

  // ✅ Assert page title is visible via data-testid
  const title = page.getByTestId('bookmark-list-title');
  await expect(title).toBeVisible();
  await expect(title).not.toBeEmpty();
});


test('should open Create List modal when button is clicked', async ({ page }) => {
  await page.goto('/lists');
  await page.waitForLoadState('networkidle');

  await expect(page.locator('[data-testid="create-list-modal"]')).toBeHidden();

  const createListBtn = page.getByRole('button', { name: /\+.*create new list/i });
  await expect(createListBtn).toBeVisible();
  await createListBtn.click();

  const modal = page.getByTestId('create-list-modal');
  await expect(modal).toBeVisible();

  await expect(modal).toContainText(/create.*list/i);
});
test('should navigate to Create Voting List from modal', async ({ page }) => {
  await page.goto('/lists');
  await page.waitForLoadState('networkidle');

  await page.getByRole('button', { name: /\+.*create new list/i }).click();
  await expect(page.getByTestId('create-list-modal')).toBeVisible();

  const votingListBtn = page.getByTestId('create-voting-list-btn');
  await expect(votingListBtn).toBeVisible();
  await votingListBtn.click();

  await page.waitForLoadState('networkidle');
  await expect(page).toHaveURL(/\/create-voter-list.*step=1/);
});

test('should navigate to Create Tinder List from modal', async ({ page }) => {
  await page.goto('/lists');
  await page.waitForLoadState('networkidle');

  await page.getByRole('button', { name: /\+.*create new list/i }).click();
  await expect(page.getByTestId('create-list-modal')).toBeVisible();

  const tinderListBtn = page.getByTestId('create-tinder-list-btn');
  await expect(tinderListBtn).toBeVisible();
  await tinderListBtn.click();

  await page.waitForLoadState('networkidle');
  await expect(page).toHaveURL(/\/tinder-proposal.*step=1/);
});

test('should navigate to Create Bookmark List from modal', async ({ page }) => {
  await page.goto('/lists');
  await page.waitForLoadState('networkidle');

  await page.getByRole('button', { name: /\+.*create new list/i }).click();
  await expect(page.getByTestId('create-list-modal')).toBeVisible();

  const bookmarkListBtn = page.getByTestId('create-bookmark-list-btn');
  await expect(bookmarkListBtn).toBeVisible();
  await bookmarkListBtn.click();

  await page.waitForLoadState('networkidle');
  await expect(page).toHaveURL(/\/bookmarks.*step=1/);
});


});
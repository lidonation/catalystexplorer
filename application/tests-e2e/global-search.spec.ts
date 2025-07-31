import { expect, test} from '@playwright/test';

test.describe('GlobalSearch Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
  });

  test('renders search form', async ({ page }) => {
    const form = page.getByTestId('global-search-form');
    await expect(form).toBeVisible();
  });

  test('accepts text input in search field and handles search', async ({ page }) => {
    const searchInput = page.getByTestId('searchbar-input');
    
    await expect(searchInput).toBeVisible();
    await searchInput.fill('Lido Nation');
    await expect(searchInput).toHaveValue('Lido Nation');
  });

  test('clears search input when clear button is clicked', async ({ page }) => {
    const searchInput = page.getByTestId('searchbar-input');
    const clearButton = page.getByTestId('searchbar-clear-button');
    
    await searchInput.fill('test search query');
    await expect(searchInput).toHaveValue('test search query');
    
    await clearButton.click();
    
    await expect(searchInput).toHaveValue('');
  });

  test('search returns successful status and navigates to results page', async ({ page }) => {
    const searchInput = page.getByTestId('searchbar-input');
    const searchTerm = 'cardano';
    
    await searchInput.fill(searchTerm);
    
    const responses: any[] = [];
    page.on('response', response => {
      if (response.url().includes('/s') && response.request().method() === 'GET') {
        responses.push({
          url: response.url(),
          status: response.status(),
          ok: response.ok()
        });
      }
    });
    
    await searchInput.press('Enter');
    
    await page.waitForURL(`**/s?q=${searchTerm}`, { timeout: 10000 });
    
    expect(page.url()).toContain('/s');
    expect(page.url()).toContain(`q=${searchTerm}`);
    
    expect(responses.length).toBeGreaterThan(0);
    
    const hasSuccessfulResponse = responses.some(resp => resp.status === 200 && resp.ok);
    const hasRedirectToSuccess = responses.some(resp => resp.status === 301) && responses.some(resp => resp.status === 200);
    
    expect(hasSuccessfulResponse || hasRedirectToSuccess).toBe(true);
    
    await expect(page.locator('body')).toBeVisible();
  });
});
import { expect, test } from '@playwright/test';

test.describe('Search Results Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to search page with a test query
    await page.goto('/s?q=lido');
    await page.waitForLoadState('domcontentloaded');
  });

  test('renders search results page with correct URL', async ({ page }) => {
    // Verify we're on the search page
    expect(page.url()).toContain('/s?q=lido');
    
    // Check that the page doesn't show any obvious error indicators
    await expect(page.locator('body')).toBeVisible();
    
    // The page should not redirect to an error page
    expect(page.url()).not.toContain('404');
    expect(page.url()).not.toContain('error');
  });

  test('displays search results when React app is working', async ({ page }) => {
    // Wait for potential React hydration
    await page.waitForTimeout(2000);
    
    // Check if React content is rendered (this will help catch the current issue)
    const appDiv = page.locator('#app');
    await expect(appDiv).toBeVisible();
    
    // If React is working, we should see some content beyond just the empty app div
    const appContent = await appDiv.innerHTML();
    
    // The app div should contain more than just whitespace if React is working
    if (appContent.trim().length > 0) {
      // React is working - check for search-specific content
      await expect(page.locator('h1, h2, h3')).toBeVisible({ timeout: 5000 });
      
      // Look for search results indicators
      await expect(
        page.locator('text=search', 'text=results', 'text=found').first()
      ).toBeVisible({ timeout: 5000 });
    } else {
      // React is not working - this should fail the test to alert us
      throw new Error(
        'React application is not rendering. The #app div is empty, indicating a hydration failure.'
      );
    }
  });

  test('handles search with no results gracefully', async ({ page }) => {
    // Navigate to search with a query that should have no results
    await page.goto('/s?q=nonexistentquerythatshouldhave0results');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    
    const appContent = await page.locator('#app').innerHTML();
    
    if (appContent.trim().length > 0) {
      // React is working - check for no results messaging
      const hasNoResultsMessage = await page.locator(
        'text="No results found", text="0 results", text="no matches"'
      ).count() > 0;
      
      // Should either show no results message or empty state
      expect(hasNoResultsMessage || appContent.includes('0')).toBe(true);
    }
  });

  test('search page responds with 200 status', async ({ page }) => {
    const response = await page.goto('/s?q=test');
    expect(response?.status()).toBe(200);
  });

  test('includes required meta tags and page structure', async ({ page }) => {
    // Check for basic HTML structure
    await expect(page.locator('html')).toBeVisible();
    await expect(page.locator('head')).toBeVisible();
    await expect(page.locator('body')).toBeVisible();
    
    // Check for the Inertia app container
    await expect(page.locator('#app')).toBeVisible();
    
    // Check that Inertia data-page attribute exists
    const appDiv = page.locator('#app');
    const dataPage = await appDiv.getAttribute('data-page');
    expect(dataPage).toBeTruthy();
    expect(dataPage).toContain('S/Index'); // Should reference the search component
  });

  test('Inertia page data contains expected search structure', async ({ page }) => {
    const appDiv = page.locator('#app');
    const dataPage = await appDiv.getAttribute('data-page');
    
    expect(dataPage).toBeTruthy();
    
    // Parse the Inertia data
    const pageData = JSON.parse(dataPage!);
    
    // Should have the correct component
    expect(pageData.component).toBe('S/Index');
    
    // Should have props with search-related data
    expect(pageData.props).toBeDefined();
    
    // If backend is working, should have counts or similar data
    const hasSearchData = 
      pageData.props.counts || 
      pageData.props.results || 
      pageData.props.searchData;
    
    expect(hasSearchData).toBeTruthy();
  });

  test('can navigate to search page from different entry points', async ({ page }) => {
    // Test direct navigation
    await page.goto('/s?q=cardano');
    expect(page.url()).toContain('/s?q=cardano');
    
    // Test with different query
    await page.goto('/s?q=catalyst');
    expect(page.url()).toContain('/s?q=catalyst');
    
    // Test empty query handling
    await page.goto('/s');
    // Should either redirect or handle gracefully
    const finalUrl = page.url();
    expect(finalUrl).toContain('/s');
  });

  test('search page is accessible', async ({ page }) => {
    await page.goto('/s?q=accessibility');
    
    // Check for basic accessibility requirements
    const html = page.locator('html');
    
    // Should have lang attribute
    const lang = await html.getAttribute('lang');
    expect(lang).toBeTruthy();
    
    // Page should have a title
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
    
    // Body should be visible and focusable
    await expect(page.locator('body')).toBeVisible();
  });

  test('detects when React/Inertia integration is broken', async ({ page }) => {
    // This test specifically catches the current issue
    await page.goto('/s?q=integrationtest');
    await page.waitForLoadState('domcontentloaded');
    
    // Wait a reasonable time for React to hydrate
    await page.waitForTimeout(3000);
    
    const appDiv = page.locator('#app');
    const appContent = await appDiv.innerHTML();
    
    // If app div is empty or only contains whitespace, React is not working
    const isEmpty = appContent.trim().length === 0;
    const onlyHasDataPage = !appContent.includes('<') && appContent.trim().length === 0;
    
    if (isEmpty || onlyHasDataPage) {
      // Check if Inertia data is present (backend working) but React is not (frontend broken)
      const dataPage = await appDiv.getAttribute('data-page');
      
      if (dataPage && dataPage.length > 0) {
        throw new Error(
          'React/Inertia integration is broken: ' +
          'Backend is providing data but frontend is not rendering. ' +
          'The #app div contains data-page attribute but no rendered content. ' +
          'This indicates a JavaScript/React hydration failure.'
        );
      } else {
        throw new Error(
          'Complete application failure: No Inertia data and no rendered content.'
        );
      }
    }
    
    // If we reach here, React is working - verify it's working correctly
    expect(appContent).toContain('<'); // Should contain HTML elements
  });
});
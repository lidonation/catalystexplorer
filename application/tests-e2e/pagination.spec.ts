import { test, expect } from '@playwright/test';

interface PageConfig {
    name: string;
    path: string;
    paginationSelector: string;
    waitForSelector?: string;
}

const pageConfigs: PageConfig[] = [
    {
        name: 'Proposals',
        path: '/proposals',
        paginationSelector: '[data-testid="pagination-component"]',
        waitForSelector: '[data-testid="proposal-page-title"]'
    }
    /* {
        name: 'Communities',
        path: '/communities',
        paginationSelector: '[data-testid="pagination-component"]',
    },
    {
        name: 'Groups',
        path: '/groups',
        paginationSelector: '[data-testid="pagination-component"]',
    } */
];

test.describe('Pagination Component Tests', () => {
    
    pageConfigs.forEach(({ name, path, paginationSelector, waitForSelector }) => {
        test.describe(`${name} Page Pagination`, () => {
            
            test.beforeEach(async ({ page }) => {
                await page.goto(path, { 
                    waitUntil: 'load'
                });
                
                await page.waitForLoadState('domcontentloaded');
                
                if (waitForSelector) {
                    await page.waitForSelector(waitForSelector);
                }
                
                await page.waitForSelector(paginationSelector, { timeout: 10000 });
            });

            test('renders pagination component with all elements', async ({ page }) => {
                const paginationComponent = page.locator(paginationSelector);
                await expect(paginationComponent).toBeVisible();

                const paginationInfo = page.getByTestId('pagination-info');
                await expect(paginationInfo).toBeVisible();
                
                const infoText = await paginationInfo.textContent();
                expect(infoText).toMatch(/Showing \d+ - \d+ of \d+/);

                const prevButton = paginationComponent.locator('[aria-label*="previous" i]');
                await expect(prevButton).toBeVisible();

                const nextButton = paginationComponent.locator('[aria-label*="next" i]');
                await expect(nextButton).toBeVisible();
            });

            test('displays page numbers and navigation controls', async ({ page }) => {
                const paginationComponent = page.locator(paginationSelector);
                
                const pageLinks = paginationComponent.locator('[data-testid^="pagination-link-"]');
                const linkCount = await pageLinks.count();
                
                if (linkCount > 0) {
                    await expect(pageLinks.first()).toBeVisible();
                    
                    const activePageLink = paginationComponent.locator('[aria-current="page"]');
                    await expect(activePageLink).toBeVisible();
                }
            });

            test('pagination info shows correct format', async ({ page }) => {
                const paginationInfo = page.getByTestId('pagination-info');
                const infoText = await paginationInfo.textContent();
                
                const match = infoText?.match(/Showing (\d+) - (\d+) of (\d+)/);
                expect(match).toBeTruthy();
                
                if (match) {
                    const [, from, to, total] = match.map(Number);
                    expect(from).toBeGreaterThan(0);
                    expect(to).toBeGreaterThanOrEqual(from);
                    expect(total).toBeGreaterThanOrEqual(to);
                }
            });

            test('previous button state is correct on first page', async ({ page }) => {
                const currentUrl = page.url();
                
                const isFirstPage = !currentUrl.includes('p=') || currentUrl.includes('p=1');
                
                if (isFirstPage) {
                    const prevButton = page.locator('[aria-label*="previous" i]');
                    
                    const isDisabled = await prevButton.evaluate(el => 
                        el.classList.contains('pointer-events-none') || 
                        el.classList.contains('opacity-50') ||
                        el.hasAttribute('disabled')
                    );
                    
                    expect(isDisabled).toBe(true);
                }
            });

            test('can navigate to next page if available', async ({ page }) => {
                const nextButton = page.locator('[aria-label*="next" i]');
                
                const isDisabled = await nextButton.evaluate(el => 
                    el.classList.contains('pointer-events-none') || 
                    el.classList.contains('opacity-50') ||
                    el.hasAttribute('disabled')
                );
                
                if (!isDisabled) {
                    const initialUrl = page.url();
                    
                    await nextButton.click();
                    
                    await page.waitForFunction(
                        (url) => window.location.href !== url,
                        initialUrl,
                        { timeout: 5000 }
                    );
                    
                    await expect(page.locator(paginationSelector)).toBeVisible();
                    
                    const newUrl = page.url();
                    expect(newUrl).toMatch(/[?&]p=\d+/);
                }
            });

            test('can click on specific page numbers', async ({ page }) => {
                const paginationComponent = page.locator(paginationSelector);
                const pageLinks = paginationComponent.locator('[data-testid^="pagination-link-"]');
                const linkCount = await pageLinks.count();
                
                if (linkCount > 1) {
                    for (let i = 0; i < linkCount; i++) {
                        const link = pageLinks.nth(i);
                        const isCurrent = await link.getAttribute('aria-current');
                        
                        if (isCurrent !== 'page') {
                            const linkText = await link.textContent();
                            const pageNumber = parseInt(linkText?.trim() || '0');
                            
                            if (pageNumber > 0) {
                                const initialUrl = page.url();
                                
                                await link.click();
                                
                                await page.waitForFunction(
                                    (url) => window.location.href !== url,
                                    initialUrl,
                                    { timeout: 5000 }
                                );
                                
                                const newUrl = page.url();
                                expect(newUrl).toContain(`p=${pageNumber}`);
                                
                                await expect(page.locator(paginationSelector)).toBeVisible();
                                
                                break;
                            }
                        }
                    }
                }
            });

            test('pagination persists after page reload', async ({ page }) => {
                const nextButton = page.locator('[aria-label*="next" i]');
                const isNextDisabled = await nextButton.evaluate(el => 
                    el.classList.contains('pointer-events-none') || 
                    el.classList.contains('opacity-50')
                );
                
                if (!isNextDisabled) {
                    await nextButton.click();
                    
                    await page.waitForTimeout(1000);
                    
                    const urlBeforeReload = page.url();
                    
                    await page.reload();
                    await page.waitForSelector(paginationSelector);
                    
                    const urlAfterReload = page.url();
                    expect(urlAfterReload).toBe(urlBeforeReload);
                    
                    await expect(page.locator(paginationSelector)).toBeVisible();
                }
            });
        });
    });
});

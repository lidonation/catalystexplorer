import { test, expect } from '@playwright/test';

interface FilterConfig {
    name: string;
    filterTestId: string;
    selectorTestId: string;
    buttonTestId: string;
    isMultiselect: boolean;
    urlParam?: string;
    expectedOptions?: string[];
}

interface PageConfig {
    name: string;
    path: string;
    waitForSelector: string;
    filters: FilterConfig[];
}

const pageConfigs: PageConfig[] = [
    {
        name: 'Proposals',
        path: '/proposals',
        waitForSelector: '[data-testid="proposal-page-title"]',
        filters: [
            {
                name: 'Funding Status Filter',
                filterTestId: 'funding-status-filter',
                selectorTestId: 'funding-status-selector',
                buttonTestId: 'funding-status-selector-button',
                isMultiselect: true,
                urlParam: 'fs',
                expectedOptions: ['over_budget', 'not_approved', 'funded_with_leftover', 'fully_paid']
            },
            /* {
                name: 'Opensource Filter',
                filterTestId: 'opensource-filter',
                selectorTestId: 'opensource-selector',
                buttonTestId: 'opensource-selector-button',
                isMultiselect: false,
                urlParam: 'op',
                expectedOptions: ['1', '0']
            },
            {
                name: 'Project Status Filter',
                filterTestId: 'project-status-filter',
                selectorTestId: 'project-status-selector',
                buttonTestId: 'project-status-selector-button',
                isMultiselect: true,
                urlParam: 'ps',
                expectedOptions: ['complete', 'in_progress', 'unfunded']
            },
            {
                name: 'Tags Filter',
                filterTestId: 'tags-filter',
                selectorTestId: 'tags-filter-search-select',
                buttonTestId: 'tags-filter-search-select-button',
                isMultiselect: true,
                urlParam: 't'
            },
            {
                name: 'Campaigns Filter',
                filterTestId: 'campaigns-filter',
                selectorTestId: 'campaigns-filter-search-select',
                buttonTestId: 'campaigns-filter-search-select-button',
                isMultiselect: true,
                urlParam: 'cam'
            },
            {
                name: 'Groups Filter',
                filterTestId: 'groups-filter',
                selectorTestId: 'groups-filter-search-select',
                buttonTestId: 'groups-filter-search-select-button',
                isMultiselect: true,
                urlParam: 'g'
            },
            {
                name: 'Communities Filter',
                filterTestId: 'communities-filter',
                selectorTestId: 'communities-filter-search-select',
                buttonTestId: 'communities-filter-search-select-button',
                isMultiselect: true,
                urlParam: 'com'
            } */
        ]
    }
    /* {
        name: 'Communities',
        path: '/communities',
        waitForSelector: '[data-testid="communities-page-title"]',
        filters: [
            // Add community-specific filters here
        ]
    },
    {
        name: 'Groups', 
        path: '/groups',
        waitForSelector: '[data-testid="groups-page-title"]',
        filters: [
            // Add group-specific filters here
        ]
    } */
];

test.describe('Filters Component Tests', () => {
    
    pageConfigs.forEach(({ name: pageName, path, waitForSelector, filters }) => {
        test.describe(`${pageName} Page Filters`, () => {
            
            test.beforeEach(async ({ page }) => {
                await page.goto(path, { 
                    waitUntil: 'load'
                });
                
                await page.waitForLoadState('domcontentloaded');
                await page.waitForSelector(waitForSelector);
            });

            test.describe('Filters Section Toggle', () => {
                
                test('filters section is initially hidden', async ({ page }) => {
                    const filtersContainer = page.getByTestId('proposal-filters-container');
                    
                    await expect(filtersContainer).toBeAttached();
                    await expect(filtersContainer).toHaveClass(/max-h-0/);
                });

                test('filters toggle button is visible and functional', async ({ page }) => {
                    const filtersToggle = page.getByTestId('search-controls-toggle-filters');
                    await expect(filtersToggle).toBeVisible();
                    await expect(filtersToggle).toContainText('Filters');
                    
                    const filterIcon = filtersToggle.locator('svg');
                    await expect(filterIcon).toBeVisible();
                });

                test('clicking filters toggle shows filters section', async ({ page }) => {
                    const filtersToggle = page.getByTestId('search-controls-toggle-filters');
                    const filtersContainer = page.getByTestId('proposal-filters-container');
                    
                    await expect(filtersContainer).toHaveClass(/max-h-0/);
                    
                    await expect(filtersToggle).toBeVisible();
                    await expect(filtersToggle).toBeEnabled();
                    await filtersToggle.click();
                    
                    await expect(filtersContainer).toHaveClass(/max-h-\[500px\]/);
                    
                    const proposalFilters = page.getByTestId('proposal-filters');
                    await expect(proposalFilters).toBeVisible();
                });

                test('clicking filters toggle again hides filters section', async ({ page }) => {
                    const filtersToggle = page.getByTestId('search-controls-toggle-filters');
                    const filtersContainer = page.getByTestId('proposal-filters-container');
                    
                    await expect(filtersToggle).toBeVisible();
                    await expect(filtersToggle).toBeEnabled();
                    await filtersToggle.click();
                    await expect(filtersContainer).toHaveClass(/max-h-\[500px\]/);
                    
                    await expect(filtersToggle).toBeEnabled();
                    await filtersToggle.click();
                    await expect(filtersContainer).toHaveClass(/max-h-0/);
                });
            });

            test.describe('Filters Section Content', () => {
                
                test.beforeEach(async ({ page }) => {
                    const filtersToggle = page.getByTestId('search-controls-toggle-filters');
                    await expect(filtersToggle).toBeVisible();
                    await expect(filtersToggle).toBeEnabled();
                    await filtersToggle.click();
                    await page.waitForSelector('[data-testid="proposal-filters"]');
                });

                test('renders all filter containers', async ({ page }) => {
                    const proposalFilters = page.getByTestId('proposal-filters');
                    await expect(proposalFilters).toBeVisible();
                    
                    for (const config of filters) {
                        const filterContainer = page.getByTestId(config.filterTestId);
                        await expect(filterContainer).toBeVisible();
                    }
                });

                test('filters are arranged in correct grid layout', async ({ page }) => {
                    const proposalFilters = page.getByTestId('proposal-filters');
                    await expect(proposalFilters).toBeVisible();
                    
                    const firstGrid = proposalFilters.locator('.grid').first();
                    await expect(firstGrid).toHaveClass(/grid-cols-2.*md:grid-cols-2.*lg:grid-cols-5/);
                });
            });

            filters.forEach(({ name, filterTestId, selectorTestId, buttonTestId, isMultiselect, urlParam, expectedOptions }) => {
                test.describe(`${name}`, () => {
                    
                    test.beforeEach(async ({ page }) => {
                        const filtersToggle = page.locator('[data-testid="search-controls-toggle-filters"]');
                        await expect(filtersToggle).toBeVisible();
                        await expect(filtersToggle).toBeEnabled();
                        await filtersToggle.click();
                        await page.waitForSelector(`[data-testid="${filterTestId}"]`);
                    });

                    test('renders filter container and selector', async ({ page }) => {
                        const filterContainer = page.getByTestId(filterTestId);
                        await expect(filterContainer).toBeVisible();
                        
                        const selector = page.getByTestId(selectorTestId);
                        await expect(selector).toBeVisible();
                    });

                    test('selector button is functional', async ({ page }) => {
                        const selectorButton = page.getByTestId(buttonTestId);
                        await expect(selectorButton).toBeVisible();
                        
                        if (!selectorTestId.includes('search-select')) {
                            await expect(selectorButton).toHaveAttribute('role', 'combobox');
                            await expect(selectorButton).toHaveAttribute('aria-expanded', 'false');
                        }
                    });

                    test('opens dropdown when clicked', async ({ page }) => {
                        const selectorButton = page.getByTestId(buttonTestId);
                        await expect(selectorButton).toBeVisible();
                        await expect(selectorButton).toBeEnabled();
                        await selectorButton.click();
                        
                        if (!selectorTestId.includes('search-select')) {
                            await expect(selectorButton).toHaveAttribute('aria-expanded', 'true');
                            
                            const options = page.locator('[data-testid^="selector-option-"]');
                            const optionCount = await options.count();
                            expect(optionCount).toBeGreaterThan(0);
                        }
                    });

                    if (expectedOptions && !selectorTestId.includes('search-select')) {
                        test('displays expected options', async ({ page }) => {
                            const selectorButton = page.getByTestId(buttonTestId);
                            await expect(selectorButton).toBeVisible();
                            await expect(selectorButton).toBeEnabled();
                            await selectorButton.click();
                            
                            await page.waitForSelector('[data-testid^="selector-option-"]');
                            
                            for (const optionValue of expectedOptions) {
                                const option = page.getByTestId(`selector-option-${optionValue}`);
                                await expect(option).toBeVisible();
                            }
                        });
                    }

                    if (urlParam && expectedOptions && !selectorTestId.includes('search-select')) {
                        if (isMultiselect) {
                             test('updates URL when multiselect option is selected', async ({ page }) => {
                                const initialUrl = page.url();
                                const selectorButton = page.locator(`[data-testid="${buttonTestId}"]`);
                                await expect(selectorButton).toBeVisible();
                                await expect(selectorButton).toBeEnabled();
                                await selectorButton.click();
                                
                                const firstOption = page.getByTestId(`selector-option-${expectedOptions[0]}`);
                                await expect(firstOption).toBeVisible();
                                await expect(firstOption).toBeEnabled();
                                await firstOption.click();
                                
                                await page.waitForFunction(
                                    (url) => window.location.href !== url,
                                    initialUrl,
                                    { timeout: 5000 }
                                );
                                
                                const url = new URL(page.url());
                                const allParams = Object.fromEntries(url.searchParams.entries());
                                const hasParameter = Object.keys(allParams).some(key => 
                                    key === urlParam || key.startsWith(`${urlParam}[`)
                                );
                                
                                expect(hasParameter).toBeTruthy();
                            });

                            test('updates URL when multiple options are selected', async ({ page }) => {
                                if (expectedOptions.length < 2) return;
                                
                                const initialUrl = page.url();
                                const selectorButton = page.locator(`[data-testid="${buttonTestId}"]`);
                                await expect(selectorButton).toBeVisible();
                                await expect(selectorButton).toBeEnabled();
                                await selectorButton.click();
                                
                                const firstOption = page.getByTestId(`selector-option-${expectedOptions[0]}`);
                                await expect(firstOption).toBeVisible();
                                await expect(firstOption).toBeEnabled();
                                await firstOption.click();
                                
                                await page.waitForFunction(
                                    (url) => window.location.href !== url,
                                    initialUrl,
                                    { timeout: 5000 }
                                );
                                
                                const urlAfterFirst = page.url();
                                
                                const secondOption = page.getByTestId(`selector-option-${expectedOptions[1]}`);
                                await expect(secondOption).toBeVisible();
                                await expect(secondOption).toBeEnabled();
                                await secondOption.click();
                                
                                await page.waitForFunction(
                                    (url) => window.location.href !== url,
                                    urlAfterFirst,
                                    { timeout: 5000 }
                                );
                                
                                const url = new URL(page.url());
                                const allParams = Object.fromEntries(url.searchParams.entries());
                                const hasParameter = Object.keys(allParams).some(key => 
                                    key === urlParam || key.startsWith(`${urlParam}[`)
                                );
                                
                                expect(hasParameter).toBeTruthy();
                            }); 
                        } else {
                            test('updates URL when single select option is selected', async ({ page }) => {
                                const initialUrl = page.url();
                                const selectorButton = page.getByTestId(buttonTestId);
                                await expect(selectorButton).toBeVisible();
                                await expect(selectorButton).toBeEnabled();
                                await selectorButton.click();
                                
                                const firstOption = page.getByTestId(`selector-option-${expectedOptions[0]}`);
                                await expect(firstOption).toBeVisible();
                                await expect(firstOption).toBeEnabled();
                                await firstOption.click();
                                
                                await page.waitForFunction(
                                    (url) => window.location.href !== url,
                                    initialUrl,
                                    { timeout: 5000 }
                                );
                                
                                const url = new URL(page.url());
                                const allParams = Object.fromEntries(url.searchParams.entries());
                                const hasParameter = Object.keys(allParams).some(key => 
                                    key === urlParam || key.startsWith(`${urlParam}[`)
                                );
                                
                                expect(hasParameter).toBeTruthy();
                            });

                            test('updates URL when different option is selected', async ({ page }) => {
                                if (expectedOptions.length < 2) return;
                                
                                const initialUrl = page.url();
                                const selectorButton = page.getByTestId(buttonTestId);
                                
                                await expect(selectorButton).toBeVisible();
                                await expect(selectorButton).toBeEnabled();
                                await selectorButton.click();
                                const firstOption = page.getByTestId(`selector-option-${expectedOptions[0]}`);
                                await expect(firstOption).toBeVisible();
                                await expect(firstOption).toBeEnabled();
                                await firstOption.click();
                                
                                await page.waitForFunction(
                                    (url) => window.location.href !== url,
                                    initialUrl,
                                    { timeout: 5000 }
                                );
                                
                                const urlAfterFirst = page.url();
                                
                                await expect(selectorButton).toBeVisible();
                                await expect(selectorButton).toBeEnabled();
                                await selectorButton.click();
                                const secondOption = page.getByTestId(`selector-option-${expectedOptions[1]}`);
                                await expect(secondOption).toBeVisible();
                                await expect(secondOption).toBeEnabled();
                                await secondOption.click();
                                
                                await page.waitForFunction(
                                    (url) => window.location.href !== url,
                                    urlAfterFirst,
                                    { timeout: 5000 }
                                );
                                
                                const url = new URL(page.url());
                                const allParams = Object.fromEntries(url.searchParams.entries());
                                const hasParameter = Object.keys(allParams).some(key => 
                                    key === urlParam || key.startsWith(`${urlParam}[`)
                                );
                                
                                expect(hasParameter).toBeTruthy();
                            });
                        }
                    }
                });
            });

            test.describe('Filter Integration', () => {
        
        test.beforeEach(async ({ page }) => {
            const filtersToggle = page.locator('[data-testid="search-controls-toggle-filters"]');
            await expect(filtersToggle).toBeVisible();
            await expect(filtersToggle).toBeEnabled();
            await filtersToggle.click();
            await page.waitForSelector('[data-testid="proposal-filters"]');
        });

        test('multiple filters can be applied simultaneously', async ({ page }) => {
            const initialUrl = page.url();
            
            const fundingStatusButton = page.locator('[data-testid="funding-status-selector-button"]');
            await expect(fundingStatusButton).toBeVisible();
            await expect(fundingStatusButton).toBeEnabled();
            await fundingStatusButton.click();
            const fundingOption = page.getByTestId('selector-option-over_budget');
            await expect(fundingOption).toBeVisible();
            await expect(fundingOption).toBeEnabled();
            await fundingOption.click();
            
            await page.waitForFunction(
                (url) => window.location.href !== url,
                initialUrl,
                { timeout: 5000 }
            );
            
            const urlAfterFirst = page.url();
            
            const opensourceButton = page.locator('[data-testid="opensource-selector-button"]');
            await expect(opensourceButton).toBeVisible();
            await expect(opensourceButton).toBeEnabled();
            await opensourceButton.click();
            const opensourceOption = page.getByTestId('selector-option-1');
            await expect(opensourceOption).toBeVisible();
            await expect(opensourceOption).toBeEnabled();
            await opensourceOption.click();
            
            await page.waitForFunction(
                (url) => window.location.href !== url,
                urlAfterFirst,
                { timeout: 5000 }
            );
            
            const url = new URL(page.url());
            const allParams = Object.fromEntries(url.searchParams.entries());
            
            const hasFsParameter = Object.keys(allParams).some(key => 
                key === 'fs' || key.startsWith('fs[')
            );
            const hasOpParameter = Object.keys(allParams).some(key => 
                key === 'op' || key.startsWith('op[')
            );
            
            expect(hasFsParameter).toBeTruthy();
            expect(hasOpParameter).toBeTruthy();
        });

        test('filters persist when page is refreshed', async ({ page }) => {
            const initialUrl = page.url();
            
            const fundingStatusButton = page.locator('[data-testid="funding-status-selector-button"]');
            await expect(fundingStatusButton).toBeVisible();
            await expect(fundingStatusButton).toBeEnabled();
            await fundingStatusButton.click();
            const fundingOption = page.getByTestId('selector-option-over_budget');
            await expect(fundingOption).toBeVisible();
            await expect(fundingOption).toBeEnabled();
            await fundingOption.click();
            
            await page.waitForFunction(
                (url) => window.location.href !== url,
                initialUrl,
                { timeout: 5000 }
            );
            
            await page.reload();
            await page.waitForSelector('[data-testid="proposal-page-title"]');
            
            const filtersToggle = page.locator('[data-testid="search-controls-toggle-filters"]');
            await expect(filtersToggle).toBeVisible();
            await expect(filtersToggle).toBeEnabled();
            await filtersToggle.click();
            
            await expect(fundingStatusButton).toBeVisible();
            await expect(fundingStatusButton).toBeEnabled();
            await fundingStatusButton.click();
            const checkbox = page.getByTestId('selector-checkbox-over_budget');
            await expect(checkbox).toBeChecked();
        });

        test('active filters are displayed in ActiveFilters component', async ({ page }) => {
            const initialUrl = page.url();
            
            const opensourceButton = page.locator('[data-testid="opensource-selector-button"]');
            await expect(opensourceButton).toBeVisible();
            await expect(opensourceButton).toBeEnabled();
            await opensourceButton.click();
            const opensourceOption = page.getByTestId('selector-option-1');
            await expect(opensourceOption).toBeVisible();
            await expect(opensourceOption).toBeEnabled();
            await opensourceOption.click();
            
            await page.waitForFunction(
                (url) => window.location.href !== url,
                initialUrl,
                { timeout: 5000 }
            );
            
            const activeFiltersSection = page.locator('[data-testid*="active-filter"], .active-filter');
            if (await activeFiltersSection.count() > 0) {
                await expect(activeFiltersSection.first()).toBeVisible();
            }
        });
    });
        });
    });
});
 

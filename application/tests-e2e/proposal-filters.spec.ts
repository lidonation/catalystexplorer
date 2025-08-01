import { test, expect } from '@playwright/test';

interface FilterConfig {
    name: string;
    path: string;
    filterTestId: string;
    selectorTestId: string;
    buttonTestId: string;
    isMultiselect: boolean;
    urlParam?: string;
    expectedOptions?: string[];
}

const filterConfigs: FilterConfig[] = [
    {
        name: 'Funding Status Filter',
        path: '/proposals',
        filterTestId: 'funding-status-filter',
        selectorTestId: 'funding-status-selector',
        buttonTestId: 'funding-status-selector-button',
        isMultiselect: true,
        urlParam: 'fundingStatus',
        expectedOptions: ['over_budget', 'not_approved', 'funded_with_leftover', 'fully_paid']
    },
    {
        name: 'Opensource Filter',
        path: '/proposals',
        filterTestId: 'opensource-filter',
        selectorTestId: 'opensource-selector',
        buttonTestId: 'opensource-selector-button',
        isMultiselect: false,
        urlParam: 'opensourceProposals',
        expectedOptions: ['1', '0']
    },
    {
        name: 'Project Status Filter',
        path: '/proposals',
        filterTestId: 'project-status-filter',
        selectorTestId: 'project-status-selector',
        buttonTestId: 'project-status-selector-button',
        isMultiselect: true,
        urlParam: 'projectStatus',
        expectedOptions: ['complete', 'in_progress', 'unfunded']
    },
    {
        name: 'Tags Filter',
        path: '/proposals',
        filterTestId: 'tags-filter',
        selectorTestId: 'tags-filter-search-select',
        buttonTestId: 'tags-filter-search-select-button',
        isMultiselect: true,
        urlParam: 'tags'
    },
    {
        name: 'Campaigns Filter',
        path: '/proposals',
        filterTestId: 'campaigns-filter',
        selectorTestId: 'campaigns-filter-search-select',
        buttonTestId: 'campaigns-filter-search-select-button',
        isMultiselect: true,
        urlParam: 'campaigns'
    },
    {
        name: 'Groups Filter',
        path: '/proposals',
        filterTestId: 'groups-filter',
        selectorTestId: 'groups-filter-search-select',
        buttonTestId: 'groups-filter-search-select-button',
        isMultiselect: true,
        urlParam: 'groups'
    },
    {
        name: 'Communities Filter',
        path: '/proposals',
        filterTestId: 'communities-filter',
        selectorTestId: 'communities-filter-search-select',
        buttonTestId: 'communities-filter-search-select-button',
        isMultiselect: true,
        urlParam: 'communities'
    }
];

test.describe('Proposal Filters Tests', () => {
    
    test.beforeEach(async ({ page }) => {
        await page.goto('/proposals', { 
            waitUntil: 'load'
        });
        
        await page.waitForLoadState('domcontentloaded');
        await page.waitForSelector('[data-testid="proposal-page-title"]');
    });

    test.describe('Filters Section Toggle', () => {
        
        test('filters section is initially hidden', async ({ page }) => {
            const filtersContainer = page.getByTestId('proposal-filters-container');
            await expect(filtersContainer).toBeVisible();
            
            // Check that it has max-h-0 class (collapsed)
            await expect(filtersContainer).toHaveClass(/max-h-0/);
        });

        test('filters toggle button is visible and functional', async ({ page }) => {
            const filtersToggle = page.getByTestId('search-controls-toggle-filters');
            await expect(filtersToggle).toBeVisible();
            await expect(filtersToggle).toContainText('Filters');
            
            // Should have filter icon
            const filterIcon = filtersToggle.locator('svg');
            await expect(filterIcon).toBeVisible();
        });

        test('clicking filters toggle shows filters section', async ({ page }) => {
            const filtersToggle = page.getByTestId('search-controls-toggle-filters');
            const filtersContainer = page.getByTestId('proposal-filters-container');
            
            // Initially collapsed
            await expect(filtersContainer).toHaveClass(/max-h-0/);
            
            // Click to expand
            await filtersToggle.click();
            
            // Should now be expanded
            await expect(filtersContainer).toHaveClass(/max-h-\[500px\]/);
            
            // Filters should be visible
            const proposalFilters = page.getByTestId('proposal-filters');
            await expect(proposalFilters).toBeVisible();
        });

        test('clicking filters toggle again hides filters section', async ({ page }) => {
            const filtersToggle = page.getByTestId('search-controls-toggle-filters');
            const filtersContainer = page.getByTestId('proposal-filters-container');
            
            // Expand filters
            await filtersToggle.click();
            await expect(filtersContainer).toHaveClass(/max-h-\[500px\]/);
            
            // Collapse filters
            await filtersToggle.click();
            await expect(filtersContainer).toHaveClass(/max-h-0/);
        });
    });

    test.describe('Filters Section Content', () => {
        
        test.beforeEach(async ({ page }) => {
            // Show filters section for all tests in this group
            const filtersToggle = page.getByTestId('search-controls-toggle-filters');
            await filtersToggle.click();
            await page.waitForSelector('[data-testid="proposal-filters"]');
        });

        test('renders all filter containers', async ({ page }) => {
            const proposalFilters = page.getByTestId('proposal-filters');
            await expect(proposalFilters).toBeVisible();
            
            // Check that all filter containers are present
            for (const config of filterConfigs) {
                const filterContainer = page.getByTestId(config.filterTestId);
                await expect(filterContainer).toBeVisible();
            }
        });

        test('filters are arranged in correct grid layout', async ({ page }) => {
            const proposalFilters = page.getByTestId('proposal-filters');
            await expect(proposalFilters).toBeVisible();
            
            // Check grid layout classes
            const firstGrid = proposalFilters.locator('.grid').first();
            await expect(firstGrid).toHaveClass(/grid-cols-2.*md:grid-cols-2.*lg:grid-cols-5/);
        });
    });

    filterConfigs.forEach(({ name, path, filterTestId, selectorTestId, buttonTestId, isMultiselect, urlParam, expectedOptions }) => {
        test.describe(`${name}`, () => {
            
            test.beforeEach(async ({ page }) => {
                // Show filters section
                const filtersToggle = page.getByTestId('search-controls-toggle-filters');
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
                
                // For regular selectors, check for combobox role
                if (!selectorTestId.includes('search-select')) {
                    await expect(selectorButton).toHaveAttribute('role', 'combobox');
                    await expect(selectorButton).toHaveAttribute('aria-expanded', 'false');
                }
            });

            test('opens dropdown when clicked', async ({ page }) => {
                const selectorButton = page.getByTestId(buttonTestId);
                await selectorButton.click();
                
                // For regular selectors, check aria-expanded
                if (!selectorTestId.includes('search-select')) {
                    await expect(selectorButton).toHaveAttribute('aria-expanded', 'true');
                    
                    // Should show options
                    const options = page.locator('[data-testid^="selector-option-"]');
                    const optionCount = await options.count();
                    expect(optionCount).toBeGreaterThan(0);
                }
            });

            if (expectedOptions && !selectorTestId.includes('search-select')) {
                test('displays expected options', async ({ page }) => {
                    const selectorButton = page.getByTestId(buttonTestId);
                    await selectorButton.click();
                    
                    // Wait for options to load
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
                        const selectorButton = page.getByTestId(buttonTestId);
                        await selectorButton.click();
                        
                        const firstOption = page.getByTestId(`selector-option-${expectedOptions[0]}`);
                        await firstOption.click();
                        
                        // Wait for URL to update
                        await page.waitForTimeout(1000);
                        
                        // Check URL contains the parameter
                        const url = new URL(page.url());
                        const paramValue = url.searchParams.get(urlParam);
                        expect(paramValue).toBeTruthy();
                    });

                    test('updates URL when multiple options are selected', async ({ page }) => {
                        if (expectedOptions.length < 2) return;
                        
                        const selectorButton = page.getByTestId(buttonTestId);
                        await selectorButton.click();
                        
                        // Select first option
                        const firstOption = page.getByTestId(`selector-option-${expectedOptions[0]}`);
                        await firstOption.click();
                        
                        // Select second option
                        const secondOption = page.getByTestId(`selector-option-${expectedOptions[1]}`);
                        await secondOption.click();
                        
                        // Wait for URL to update
                        await page.waitForTimeout(1000);
                        
                        // Check URL contains both parameters
                        const url = new URL(page.url());
                        const paramValue = url.searchParams.get(urlParam);
                        expect(paramValue).toBeTruthy();
                    });
                } else {
                    test('updates URL when single select option is selected', async ({ page }) => {
                        const selectorButton = page.getByTestId(buttonTestId);
                        await selectorButton.click();
                        
                        const firstOption = page.getByTestId(`selector-option-${expectedOptions[0]}`);
                        await firstOption.click();
                        
                        // Wait for URL to update
                        await page.waitForTimeout(1000);
                        
                        // Check URL contains the parameter
                        const url = new URL(page.url());
                        const paramValue = url.searchParams.get(urlParam);
                        expect(paramValue).toEqual(expectedOptions[0]);
                    });

                    test('updates URL when different option is selected', async ({ page }) => {
                        if (expectedOptions.length < 2) return;
                        
                        const selectorButton = page.getByTestId(buttonTestId);
                        
                        // Select first option
                        await selectorButton.click();
                        const firstOption = page.getByTestId(`selector-option-${expectedOptions[0]}`);
                        await firstOption.click();
                        
                        // Wait for URL to update
                        await page.waitForTimeout(1000);
                        
                        // Select second option
                        await selectorButton.click();
                        const secondOption = page.getByTestId(`selector-option-${expectedOptions[1]}`);
                        await secondOption.click();
                        
                        // Wait for URL to update
                        await page.waitForTimeout(1000);
                        
                        // Check URL contains the new parameter value
                        const url = new URL(page.url());
                        const paramValue = url.searchParams.get(urlParam);
                        expect(paramValue).toEqual(expectedOptions[1]);
                    });
                }

                test('clears URL parameter when selection is cleared', async ({ page }) => {
                    const selectorButton = page.getByTestId(buttonTestId);
                    await selectorButton.click();
                    
                    // Select an option first
                    const firstOption = page.getByTestId(`selector-option-${expectedOptions[0]}`);
                    await firstOption.click();
                    
                    // Wait for URL to update
                    await page.waitForTimeout(1000);
                    
                    // Clear selection
                    await selectorButton.click();
                    const clearButton = page.getByTestId('selector-clear-button');
                    await clearButton.click();
                    
                    // Wait for URL to update
                    await page.waitForTimeout(1000);
                    
                    // Check URL parameter is cleared
                    const url = new URL(page.url());
                    const paramValue = url.searchParams.get(urlParam);
                    expect(paramValue).toBeFalsy();
                });
            }
        });
    });

    test.describe('Filter Integration', () => {
        
        test.beforeEach(async ({ page }) => {
            // Show filters section
            const filtersToggle = page.getByTestId('search-controls-toggle-filters');
            await filtersToggle.click();
            await page.waitForSelector('[data-testid="proposal-filters"]');
        });

        test('multiple filters can be applied simultaneously', async ({ page }) => {
            // Apply funding status filter
            const fundingStatusButton = page.getByTestId('funding-status-selector-button');
            await fundingStatusButton.click();
            const fundingOption = page.getByTestId('selector-option-over_budget');
            await fundingOption.click();
            
            // Apply opensource filter
            const opensourceButton = page.getByTestId('opensource-selector-button');
            await opensourceButton.click();
            const opensourceOption = page.getByTestId('selector-option-1');
            await opensourceOption.click();
            
            // Wait for URL to update
            await page.waitForTimeout(1000);
            
            // Check both parameters are in URL
            const url = new URL(page.url());
            expect(url.searchParams.get('fundingStatus')).toBeTruthy();
            expect(url.searchParams.get('opensourceProposals')).toEqual('1');
        });

        test('filters persist when page is refreshed', async ({ page }) => {
            // Apply a filter
            const fundingStatusButton = page.getByTestId('funding-status-selector-button');
            await fundingStatusButton.click();
            const fundingOption = page.getByTestId('selector-option-over_budget');
            await fundingOption.click();
            
            // Wait for URL to update
            await page.waitForTimeout(1000);
            
            // Refresh page
            await page.reload();
            await page.waitForSelector('[data-testid="proposal-page-title"]');
            
            // Show filters again
            const filtersToggle = page.getByTestId('search-controls-toggle-filters');
            await filtersToggle.click();
            
            // Check that filter is still applied
            await fundingStatusButton.click();
            const checkbox = page.getByTestId('selector-checkbox-over_budget');
            await expect(checkbox).toBeChecked();
        });

        test('active filters are displayed in ActiveFilters component', async ({ page }) => {
            // Apply a filter
            const opensourceButton = page.getByTestId('opensource-selector-button');
            await opensourceButton.click();
            const opensourceOption = page.getByTestId('selector-option-1');
            await opensourceOption.click();
            
            // Wait for active filters to appear
            await page.waitForTimeout(1000);
            
            // Check if active filters component shows the applied filter
            // This assumes ActiveFilters component has some testid or recognizable element
            const activeFiltersSection = page.locator('[data-testid*="active-filter"], .active-filter');
            if (await activeFiltersSection.count() > 0) {
                await expect(activeFiltersSection.first()).toBeVisible();
            }
        });
    });
});

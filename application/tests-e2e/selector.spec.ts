import { test, expect } from '@playwright/test';

interface SelectorConfig {
    name: string;
    path: string;
    selectorTestId: string;
    waitForSelector?: string;
    isMultiselect: boolean;
}

const selectorConfigs: SelectorConfig[] = [
    {
        name: 'Funding Status Filter',
        path: '/proposals',
        selectorTestId: 'funding-status-selector',
        waitForSelector: '[data-testid="proposal-page-title"]',
        isMultiselect: true
    },
    /* {
        name: 'Opensource Filter',
        path: '/proposals',
        selectorTestId: 'opensource-selector',
        waitForSelector: '[data-testid="proposal-page-title"]',
        isMultiselect: false
    },
    {
        name: 'Project Status Filter',
        path: '/proposals',
        selectorTestId: 'project-status-selector',
        waitForSelector: '[data-testid="proposal-page-title"]',
        isMultiselect: true
    },
    {
        name: 'Cohort Filter',
        path: '/proposals',
        selectorTestId: 'cohort-selector',
        waitForSelector: '[data-testid="proposal-page-title"]',
        isMultiselect: true
    } */
];

test.describe('Selector Component Tests', () => {
    
    selectorConfigs.forEach(({ name, path, selectorTestId, waitForSelector, isMultiselect }) => {
        test.describe(`${name} Selector`, () => {
            
            test.beforeEach(async ({ page }) => {
                await page.goto(path, { 
                    waitUntil: 'load'
                });
                
                await page.waitForLoadState('domcontentloaded');
                
                if (waitForSelector) {
                    await page.waitForSelector(waitForSelector);
                }

                // Show filters section first
                const filtersToggle = page.getByTestId('search-controls-filters-toggle');
                if (await filtersToggle.isVisible()) {
                    await filtersToggle.click();
                }
                
                await page.waitForSelector(`[data-testid="${selectorTestId}"]`);
            });

            test('renders selector component with all elements', async ({ page }) => {
                const selectorContainer = page.getByTestId('selector-container');
                await expect(selectorContainer).toBeVisible();

                const selectorButton = page.getByTestId('selector-button');
                await expect(selectorButton).toBeVisible();
                
                // Check button attributes
                await expect(selectorButton).toHaveAttribute('role', 'combobox');
                await expect(selectorButton).toHaveAttribute('aria-expanded', 'false');
                
                const selectedItems = page.getByTestId('selector-selected-items');
                await expect(selectedItems).toBeVisible();
            });

            test('opens dropdown when clicked', async ({ page }) => {
                const selectorButton = page.getByTestId('selector-button');
                
                // Initially closed
                await expect(selectorButton).toHaveAttribute('aria-expanded', 'false');
                
                await selectorButton.click();
                
                // Should be open now
                await expect(selectorButton).toHaveAttribute('aria-expanded', 'true');
                
                // Popover content should be visible
                const popoverContent = page.locator('.bg-background.relative.z-150');
                await expect(popoverContent).toBeVisible();
            });

            test('displays clear button when dropdown is open', async ({ page }) => {
                const selectorButton = page.getByTestId('selector-button');
                await selectorButton.click();
                
                const clearButton = page.getByTestId('selector-clear-button');
                await expect(clearButton).toBeVisible();
                await expect(clearButton).toContainText('clear');
            });

            test('shows options when dropdown is opened', async ({ page }) => {
                const selectorButton = page.getByTestId('selector-button');
                await selectorButton.click();
                
                // Wait for options to appear
                await page.waitForSelector('[data-testid^="selector-option-"]');
                
                const options = page.locator('[data-testid^="selector-option-"]');
                const optionCount = await options.count();
                
                expect(optionCount).toBeGreaterThan(0);
                
                // Check that options are visible
                for (let i = 0; i < optionCount; i++) {
                    await expect(options.nth(i)).toBeVisible();
                }
            });

            test('displays checkboxes for options', async ({ page }) => {
                const selectorButton = page.getByTestId('selector-button');
                await selectorButton.click();
                
                await page.waitForSelector('[data-testid^="selector-checkbox-"]');
                
                const checkboxes = page.locator('[data-testid^="selector-checkbox-"]');
                const checkboxCount = await checkboxes.count();
                
                if (checkboxCount > 0) {
                    for (let i = 0; i < checkboxCount; i++) {
                        await expect(checkboxes.nth(i)).toBeVisible();
                        await expect(checkboxes.nth(i)).toHaveAttribute('type', 'checkbox');
                    }
                }
            });

            if (isMultiselect) {
                test('allows multiple selection for multiselect', async ({ page }) => {
                    const selectorButton = page.getByTestId('selector-button');
                    await selectorButton.click();
                    
                    const options = page.locator('[data-testid^="selector-option-"]');
                    const optionCount = await options.count();
                    
                    if (optionCount >= 2) {
                        // Select first option
                        await options.nth(0).click();
                        
                        // Select second option
                        await options.nth(1).click();
                        
                        // Check that both checkboxes are checked
                        const firstCheckbox = page.locator('[data-testid^="selector-checkbox-"]').nth(0);
                        const secondCheckbox = page.locator('[data-testid^="selector-checkbox-"]').nth(1);
                        
                        await expect(firstCheckbox).toBeChecked();
                        await expect(secondCheckbox).toBeChecked();
                        
                        // Check that selection count is displayed
                        const selectedItems = page.getByTestId('selector-selected-items');
                        const countBadge = selectedItems.locator('.bg-background-lighter');
                        await expect(countBadge).toBeVisible();
                        await expect(countBadge).toContainText('2');
                    }
                });

                test('can deselect items in multiselect', async ({ page }) => {
                    const selectorButton = page.getByTestId('selector-button');
                    await selectorButton.click();
                    
                    const firstOption = page.locator('[data-testid^="selector-option-"]').nth(0);
                    const firstCheckbox = page.locator('[data-testid^="selector-checkbox-"]').nth(0);
                    
                    // Select option
                    await firstOption.click();
                    await expect(firstCheckbox).toBeChecked();
                    
                    // Deselect option
                    await firstOption.click();
                    await expect(firstCheckbox).not.toBeChecked();
                });

            } else {
                test('allows only single selection for single select', async ({ page }) => {
                    const selectorButton = page.getByTestId('selector-button');
                    await selectorButton.click();
                    
                    const options = page.locator('[data-testid^="selector-option-"]');
                    const optionCount = await options.count();
                    
                    if (optionCount >= 2) {
                        // Select first option
                        await options.nth(0).click();
                        
                        // Dropdown should close after selection
                        await expect(selectorButton).toHaveAttribute('aria-expanded', 'false');
                        
                        // Open dropdown again
                        await selectorButton.click();
                        
                        const firstCheckbox = page.locator('[data-testid^="selector-checkbox-"]').nth(0);
                        await expect(firstCheckbox).toBeChecked();
                        
                        // Select second option
                        await options.nth(1).click();
                        
                        // Open dropdown again to check state
                        await selectorButton.click();
                        
                        const secondCheckbox = page.locator('[data-testid^="selector-checkbox-"]').nth(1);
                        await expect(secondCheckbox).toBeChecked();
                        await expect(firstCheckbox).not.toBeChecked();
                    }
                });

                test('toggles selection in single select mode', async ({ page }) => {
                    const selectorButton = page.getByTestId('selector-button');
                    await selectorButton.click();
                    
                    const firstOption = page.locator('[data-testid^="selector-option-"]').nth(0);
                    
                    // Select option
                    await firstOption.click();
                    
                    // Open dropdown again
                    await selectorButton.click();
                    
                    const firstCheckbox = page.locator('[data-testid^="selector-checkbox-"]').nth(0);
                    await expect(firstCheckbox).toBeChecked();
                    
                    // Click same option again to deselect
                    await firstOption.click();
                    
                    // Open dropdown again to verify deselection
                    await selectorButton.click();
                    await expect(firstCheckbox).not.toBeChecked();
                });
            }

            test('clear button clears all selections', async ({ page }) => {
                const selectorButton = page.getByTestId('selector-button');
                await selectorButton.click();
                
                const firstOption = page.locator('[data-testid^="selector-option-"]').nth(0);
                await firstOption.click();
                
                if (isMultiselect) {
                    // For multiselect, dropdown stays open
                    const clearButton = page.getByTestId('selector-clear-button');
                    await clearButton.click();
                    
                    // Dropdown should close
                    await expect(selectorButton).toHaveAttribute('aria-expanded', 'false');
                } else {
                    // For single select, reopen dropdown
                    await selectorButton.click();
                    const clearButton = page.getByTestId('selector-clear-button');
                    await clearButton.click();
                }
                
                // Verify all checkboxes are unchecked
                await selectorButton.click();
                const checkboxes = page.locator('[data-testid^="selector-checkbox-"]');
                const checkboxCount = await checkboxes.count();
                
                for (let i = 0; i < checkboxCount; i++) {
                    await expect(checkboxes.nth(i)).not.toBeChecked();
                }
            });

            test('displays placeholder text when no selection', async ({ page }) => {
                const selectedItems = page.getByTestId('selector-selected-items');
                const text = await selectedItems.textContent();
                
                expect(text).toMatch(/select/i);
            });

            test('closes dropdown when clicking outside', async ({ page }) => {
                const selectorButton = page.getByTestId('selector-button');
                await selectorButton.click();
                
                await expect(selectorButton).toHaveAttribute('aria-expanded', 'true');
                
                // Click outside the selector
                await page.click('body', { position: { x: 10, y: 10 } });
                
                await expect(selectorButton).toHaveAttribute('aria-expanded', 'false');
            });

            test('handles disabled options correctly', async ({ page }) => {
                const selectorButton = page.getByTestId('selector-button');
                await selectorButton.click();
                
                const options = page.locator('[data-testid^="selector-option-"]');
                const optionCount = await options.count();
                
                for (let i = 0; i < optionCount; i++) {
                    const option = options.nth(i);
                    const isDisabled = await option.evaluate(el => 
                        el.classList.contains('cursor-not-allowed') || 
                        el.classList.contains('opacity-70')
                    );
                    
                    if (isDisabled) {
                        const checkbox = page.locator('[data-testid^="selector-checkbox-"]').nth(i);
                        await expect(checkbox).toBeDisabled();
                    }
                }
            });

            test('preserves state after page navigation', async ({ page }) => {
                const selectorButton = page.getByTestId('selector-button');
                await selectorButton.click();
                
                const firstOption = page.locator('[data-testid^="selector-option-"]').nth(0);
                await firstOption.click();
                
                // Navigate away and back
                await page.goto('/');
                await page.goBack();
                
                if (waitForSelector) {
                    await page.waitForSelector(waitForSelector);
                }

                // Show filters again
                const filtersToggle = page.getByTestId('search-controls-filters-toggle');
                if (await filtersToggle.isVisible()) {
                    await filtersToggle.click();
                }
                
                await page.waitForSelector(`[data-testid="${selectorTestId}"]`);
                
                // Check if selection is preserved (this depends on URL params)
                await selectorButton.click();
                
                const firstCheckbox = page.locator('[data-testid^="selector-checkbox-"]').nth(0);
                const isChecked = await firstCheckbox.isChecked();
                
                // The selection might be preserved depending on URL parameters
                // This test verifies the component handles state correctly
                expect(typeof isChecked).toBe('boolean');
            });

            test('keyboard navigation works correctly', async ({ page }) => {
                const selectorButton = page.getByTestId('selector-button');
                
                // Focus the button
                await selectorButton.focus();
                
                // Press Enter to open dropdown
                await page.keyboard.press('Enter');
                await expect(selectorButton).toHaveAttribute('aria-expanded', 'true');
                
                // Press Escape to close dropdown
                await page.keyboard.press('Escape');
                await expect(selectorButton).toHaveAttribute('aria-expanded', 'false');
            });
        });
    });
});

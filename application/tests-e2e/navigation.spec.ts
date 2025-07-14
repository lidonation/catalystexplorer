import { test, expect } from '@playwright/test';

/**
 * Navigation Sidebar Tests
 */
test.describe('Navigation Sidebar', () => {
    test.beforeEach(async ({ page }) => {
        // Visit homepage before each test
        await page.goto('/');
    });

    /**
     * Test: Main sidebar navigation renders correctly
     */
    test('should render main navigation list', async ({ page }) => {
        await expect(page.getByTestId('app-navigation')).toBeVisible();
        await expect(page.getByTestId('app-navigation-list')).toBeVisible();
    });

    /**
     * Test: Jormungandr dropdown opens and reveals links
     */
    test('should toggle jormungandr dropdown and reveal options', async ({ page }) => {
        await page.getByTestId('jormungandr-nav-items-dropdown').click();
        await expect(page.getByTestId('jormungandr-nav-items-dropdown-options')).toBeVisible();

        await expect(page.getByTestId('jormungandr-transactions-link')).toBeVisible();
        await expect(page.getByTestId('jormungandr-votes-link')).toBeVisible();
        await expect(page.getByTestId('jormungandr-voters-link')).toBeVisible();
    });

    /**
     * Test: Numbers dropdown opens and reveals options
     */
    test('should toggle numbers dropdown and reveal options', async ({ page }) => {
        await page.getByTestId('numbers-nav-items-dropdown').click();
        await expect(page.getByTestId('numbers-nav-items-dropdown-options')).toBeVisible();

        await expect(page.getByTestId('numbers-impact-link')).toBeVisible();
        await expect(page.getByTestId('numbers-spending-link')).toBeVisible();
        await expect(page.getByTestId('numbers-general-link')).toBeVisible();
    });

    /**
     * Test: More dropdown opens and reveals options
     */
    test('should toggle more dropdown and reveal options', async ({ page }) => {
        await page.getByTestId('more-nav-items-dropdown').click();
        await expect(page.getByTestId('more-nav-items-dropdown-options')).toBeVisible();

        await expect(page.getByTestId('api-link')).toBeVisible();
        await expect(page.getByTestId('proposal-reviews-link')).toBeVisible();
        await expect(page.getByTestId('reviewers-link')).toBeVisible();
        await expect(page.getByTestId('monthly-reports-link')).toBeVisible();
        await expect(page.getByTestId('proposal-csvs-link')).toBeVisible();
        await expect(page.getByTestId('ccv4-votes-link')).toBeVisible();
    });

    /**
     * Tests navigation links in the sidebar:
     * - Clickable links should navigate to the correct URL
     * - Disabled links should not navigate or be clickable
     */
    test('clickable links should navigate to the correct URLs', async ({ page }) => {
        const navLinks = [
            {
                testId: 'jormungandr-transactions-link',
                path: '/jormungandr/transactions',
                expand: 'jormungandr-nav-items-dropdown',
            },
            {
                testId: 'jormungandr-voters-link',
                path: '/jormungandr/voters',
                expand: 'jormungandr-nav-items-dropdown',
            },
            {
                testId: 'proposal-reviews-link',
                path: '/reviews',
                expand: 'more-nav-items-dropdown',
            },
            // { testId: 'jormungandr-votes-link', path: '/jormungandr/votes' },
        ];

        await page.goto('https://preview.catalystexplorer.com/en');

        for (const { testId, path, expand } of navLinks) {
            if (expand) {
                const toggle = page.getByTestId(expand);

                // Check if the dropdown is already open
                const isExpanded = await toggle.getAttribute('aria-expanded');

                if (isExpanded !== 'true') {
                    await toggle.click();
                    await page.waitForSelector(`[data-testid="${testId}"]`, {
                        timeout: 5000,
                    });
                }
            }

            const locator = page.getByTestId(testId);

            await locator.click();
            await expect(page).toHaveURL(new RegExp(path), { timeout: 10000 });
            await page.goBack();
        }
    });


    /**
     * Test: Disabled links do not navigate or respond
     */
    test('disabled links should not navigate', async ({ page }) => {
        await page.getByTestId('numbers-nav-items-dropdown').click();
        await page.getByTestId('more-nav-items-dropdown').click();

        // List of disabled testIDs (should match your data-testid usage)
        const disabledLinks = [
            'numbers-impact-link',
            'numbers-spending-link',
            'numbers-general-link',
            'api-link',
            'reviewers-link',
            'monthly-reports-link',
            'proposal-csvs-link',
            'ccv4-votes-link',
        ];

        for (const testId of disabledLinks) {
            const link = page.getByTestId(testId);

            await expect(link).toBeVisible();

            // Assert it's visibly disabled (assumes aria-disabled or class applied)
            await expect(link).toHaveAttribute('aria-disabled', 'true');

            const currentURL = page.url();
            await link.click({ force: true });
            await expect(page).toHaveURL(currentURL);
        }
    });

    /**
     * Test: Proposal comparison badge appears with numeric count
     */
    test('proposal comparison badge should display number', async ({ page }) => {
        const badge = page.getByTestId('proposal-comparison-link');
        await expect(badge).toBeVisible();

        const countText = await badge.innerText();

        expect(Number.isNaN(Number(countText.trim()))).toBe(false);
    });
});

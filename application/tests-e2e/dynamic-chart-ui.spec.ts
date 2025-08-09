import { expect, test } from '@playwright/test';

test.describe('Rendering Dynamic Charts', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost/en/proposals', {
            waitUntil: 'load',
        });

        await page.waitForLoadState('domcontentloaded');
    });

    test('Graph icon on proposals page leads to the charts page', async ({
        page,
    }) => {
        const chartsButton = page.getByTestId('proposals-charts-button');
        await expect(chartsButton).toBeVisible();
        await chartsButton.click();
        await page.waitForLoadState('networkidle');
        await expect(page).toHaveURL(/.*\/proposals\/charts/);
    });

    test('Set Chart Metrics Container is Visible', async ({ page }) => {
        const chartsButton = page.getByTestId('proposals-charts-button');
        await expect(chartsButton).toBeVisible();
        await chartsButton.click();
        await page.waitForLoadState('networkidle');
        await expect(page).toHaveURL(/.*\/proposals\/charts/);
        const chartMetricsContainer = page.getByTestId('set-chart-metrics');
        await expect(chartMetricsContainer).toBeVisible();
    });

    test('Ensure the checkboxes are functional and respect the pairing rules', async ({
        page,
    }) => {
        const chartsButton = page.getByTestId('proposals-charts-button');
        await expect(chartsButton).toBeVisible();
        await chartsButton.click();
        await page.waitForLoadState('networkidle');

        await expect(page).toHaveURL(/.*\/proposals\/charts/, {
            timeout: 10000,
        });

        const chartMetricsContainer = page.getByTestId('set-chart-metrics');
        await expect(chartMetricsContainer).toBeVisible();

        const unfundedCheckbox = page.getByTestId(
            'unfunded-proposals-checkbox',
        );
        const fundedCheckbox = page.getByTestId('approved-proposals-checkbox');
        const completedCheckbox = page.getByTestId(
            'completed-proposals-checkbox',
        );
        const inProgressCheckbox = page.getByTestId(
            'in-progress-proposals-checkbox',
        );
        const submittedCheckbox = page.getByTestId(
            'submitted-proposals-checkbox',
        );
        await expect(unfundedCheckbox).toBeVisible();
        await unfundedCheckbox.click();
        await expect(unfundedCheckbox).toBeChecked();

        await expect(fundedCheckbox).toBeVisible();
        await fundedCheckbox.click();
        await expect(fundedCheckbox).toBeChecked();

        await expect(completedCheckbox).toBeVisible();
        await completedCheckbox.click();
        await expect(completedCheckbox).toBeChecked();
        await expect(fundedCheckbox).not.toBeChecked();

        await expect(inProgressCheckbox).toBeVisible();
        await inProgressCheckbox.click();
        await expect(inProgressCheckbox).toBeChecked();
        await expect(fundedCheckbox).not.toBeChecked();

        await expect(submittedCheckbox).toBeVisible();
        await submittedCheckbox.click();
        await expect(submittedCheckbox).toBeChecked();
        await expect(unfundedCheckbox).not.toBeChecked();
        await expect(fundedCheckbox).not.toBeChecked();
        await expect(completedCheckbox).not.toBeChecked();
        await expect(inProgressCheckbox).not.toBeChecked();
    });

    //   test('Select Chart Type Selector Works', async ({
    //     page,
    // }) => {
    //     const chartsTypeSelector = page.getByTestId('chart-type-selector');
    //     await expect(chartsTypeSelector).toBeVisible();
    //     await chartsTypeSelector.click();
    //     await page.waitForLoadState('networkidle');
    //     await expect(page).toHaveURL(/.*\/proposals\/charts/);
    // });


});

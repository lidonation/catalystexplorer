import { expect, test } from '@playwright/test';

test.describe('Rendering Dynamic Charts', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('https://preview.catalystexplorer.com/en', {
            waitUntil: 'load',
        });

        await page.waitForLoadState('domcontentloaded');
    });

    test('Set Chart Metrics Container is Visible', async ({ page }) => {
        const chartMetricsContainer = page.getByTestId('set-chart-metrics');
        await expect(chartMetricsContainer).toBeVisible();
    });

    test('Ensure the checkboxes are functional and respect the pairing rules', async ({
        page,
    }) => {
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

    test('Charts are rendered after all metrics are selected', async ({
        page,
    }) => {
        const unfundedCheckbox = page.getByTestId(
            'unfunded-proposals-checkbox',
        );

        await expect(unfundedCheckbox).toBeVisible();
        await unfundedCheckbox.click();
        const chartTypeSelector = page.getByTestId('chart-type-selector');
        await expect(chartTypeSelector).toBeVisible();

        const chartStyleSelector = page.getByTestId('chart-style-selector');
        await expect(chartStyleSelector).toBeVisible();

        await chartTypeSelector.click();
        await page
            .locator('[data-testid="selector-option-distributionChart"]')
            .click();

        await chartStyleSelector.click();

        const distributionDisabled = [
            'barChart',
            'lineChart',
            'pieChart',
            'stackedBarCharts',
            'funnelChart',
        ];
        for (const chart of distributionDisabled) {
            await expect(
                page.getByTestId(`selector-option-${chart}`),
            ).toHaveClass(/cursor-not-allowed/);
        }
        await expect(page.getByTestId('selector-option-treeMap')).toBeEnabled();

        await chartTypeSelector.click();
        await page
            .locator('[data-testid="selector-option-trendChart"]')
            .click();

        await chartStyleSelector.click();

        await expect(page.getByTestId('selector-option-treeMap')).toHaveClass(
            /cursor-not-allowed/,
        );

        const allOthers = [
            'barChart',
            'lineChart',
            'pieChart',
            'stackedBarCharts',
            'funnelChart',
        ];
        for (const chart of allOthers) {
            await expect(
                page.getByTestId(`selector-option-${chart}`),
            ).toBeEnabled();
        }

        for (const chartType of allOthers.slice(0, 4)) {
            await chartStyleSelector.dispatchEvent('mousedown');
            await page.waitForTimeout(500);

            const optionLocator = page.locator(
                `[data-testid="selector-option-${chartType}"]`,
            );
            await optionLocator.click();
            await page.waitForTimeout(1000);
        }

        const viewChartsButton = page.getByTestId('view-charts-button');
        await expect(viewChartsButton).toBeVisible();
        await viewChartsButton.click();

        const allCharts = page.getByTestId('all-charts');
        await expect(allCharts).toBeVisible();

        const chartsCard = page.getByTestId('charts-card');

        for (let i = 0; i < 4; i++) {
            const card = chartsCard.nth(i);
            await card.scrollIntoViewIfNeeded();
            await expect(card).toBeVisible();
        }
    });
    test('View selector works', async ({ page }) => {
        const unfundedCheckbox = page.getByTestId(
            'unfunded-proposals-checkbox',
        );

        await expect(unfundedCheckbox).toBeVisible();
        await unfundedCheckbox.click();
        const chartTypeSelector = page.getByTestId('chart-type-selector');
        await expect(chartTypeSelector).toBeVisible();

        const chartStyleSelector = page.getByTestId('chart-style-selector');
        await expect(chartStyleSelector).toBeVisible();

        await chartTypeSelector.click();
        await page
            .locator('[data-testid="selector-option-distributionChart"]')
            .click();

        await chartStyleSelector.click();

        const distributionDisabled = [
            'barChart',
            'lineChart',
            'pieChart',
            'stackedBarCharts',
            'funnelChart',
        ];
        for (const chart of distributionDisabled) {
            await expect(
                page.getByTestId(`selector-option-${chart}`),
            ).toHaveClass(/cursor-not-allowed/);
        }
        await expect(page.getByTestId('selector-option-treeMap')).toBeEnabled();

        await chartTypeSelector.click();
        await page
            .locator('[data-testid="selector-option-trendChart"]')
            .click();

        await chartStyleSelector.click();

        await expect(page.getByTestId('selector-option-treeMap')).toHaveClass(
            /cursor-not-allowed/,
        );

        const allOthers = [
            'barChart',
            'lineChart',
            'pieChart',
            'stackedBarCharts',
            'funnelChart',
        ];
        for (const chart of allOthers) {
            await expect(
                page.getByTestId(`selector-option-${chart}`),
            ).toBeEnabled();
        }

        for (const chartType of allOthers.slice(0, 1)) {
            await chartStyleSelector.dispatchEvent('mousedown');
            await page.waitForTimeout(500);

            const optionLocator = page.locator(
                `[data-testid="selector-option-${chartType}"]`,
            );
            await optionLocator.click();
            await page.waitForTimeout(1000);
        }

        const viewChartsButton = page.getByTestId('view-charts-button');
        await expect(viewChartsButton).toBeVisible();
        await viewChartsButton.click();

        const allCharts = page.getByTestId('all-charts');
        await expect(allCharts).toBeVisible();

        const viewBySelector = page.getByTestId('view-by-selector');
        await expect(viewBySelector).toBeVisible();
        await viewBySelector.click();
        await page
            .locator('[data-testid="radio-selector-option-year"]')
            .click();
         
    });
    test('Edit chart metrics works', async ({ page }) => {
        const unfundedCheckbox = page.getByTestId(
            'unfunded-proposals-checkbox',
        );

        await expect(unfundedCheckbox).toBeVisible();
        await unfundedCheckbox.click();
        const chartTypeSelector = page.getByTestId('chart-type-selector');
        await expect(chartTypeSelector).toBeVisible();

        const chartStyleSelector = page.getByTestId('chart-style-selector');
        await expect(chartStyleSelector).toBeVisible();

        await chartTypeSelector.click();
        await page
            .locator('[data-testid="selector-option-distributionChart"]')
            .click();

        await chartStyleSelector.click();

        const distributionDisabled = [
            'barChart',
            'lineChart',
            'pieChart',
            'stackedBarCharts',
            'funnelChart',
        ];
        for (const chart of distributionDisabled) {
            await expect(
                page.getByTestId(`selector-option-${chart}`),
            ).toHaveClass(/cursor-not-allowed/);
        }
        await expect(page.getByTestId('selector-option-treeMap')).toBeEnabled();

        await chartTypeSelector.click();
        await page
            .locator('[data-testid="selector-option-trendChart"]')
            .click();

        await chartStyleSelector.click();

        await expect(page.getByTestId('selector-option-treeMap')).toHaveClass(
            /cursor-not-allowed/,
        );

        const allOthers = [
            'barChart',
            'lineChart',
            'pieChart',
            'stackedBarCharts',
            'funnelChart',
        ];
        for (const chart of allOthers) {
            await expect(
                page.getByTestId(`selector-option-${chart}`),
            ).toBeEnabled();
        }

        for (const chartType of allOthers.slice(0, 1)) {
            await chartStyleSelector.dispatchEvent('mousedown');
            await page.waitForTimeout(500);

            const optionLocator = page.locator(
                `[data-testid="selector-option-${chartType}"]`,
            );
            await optionLocator.click();
            await page.waitForTimeout(1000);
        }

        const viewChartsButton = page.getByTestId('view-charts-button');
        await expect(viewChartsButton).toBeVisible();
        await viewChartsButton.click();

        const allCharts = page.getByTestId('all-charts');
        await expect(allCharts).toBeVisible();

        await page.evaluate(() => window.scrollTo(0, 0));

        await page.waitForLoadState('domcontentloaded');

        const editChartsMetricsButton = page.getByTestId('charts-edit-button-desktop');

        await expect(editChartsMetricsButton).toBeVisible();
        await editChartsMetricsButton.click();

        const chartMetricsContainer = page.getByTestId('set-chart-metrics');
        await expect(chartMetricsContainer).toBeVisible();

        const submittedCheckbox = page.getByTestId(
            'submitted-proposals-checkbox',
        );

        await expect(submittedCheckbox).toBeVisible();
        await submittedCheckbox.click();

        await chartTypeSelector.click();
        await page
            .locator('[data-testid="selector-option-distributionChart"]')
            .click();
        await chartStyleSelector.click();
        await chartStyleSelector.dispatchEvent('mousedown');
        await page.waitForTimeout(500);

        const optionLocator = page.locator(
            `[data-testid="selector-option-treeMap"]`,
        );
        await optionLocator.click();
        await page.waitForTimeout(1000);

        await expect(viewChartsButton).toBeVisible();
        await viewChartsButton.click();

    
        await expect(allCharts).toBeVisible();

        const chartsCard = page.getByTestId('charts-card');
        await expect(chartsCard.first()).toBeVisible();
         
    });
});

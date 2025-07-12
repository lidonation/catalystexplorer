import { expect, test } from '@playwright/test';

test.describe('MetricsBar Component', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/proposals');
    });

    test('should display MetricsBar on proposals page with metrics data', async ({
        page,
    }) => {
        const metricsBar = page.getByTestId('metrics-bar-container');
        await expect(metricsBar).toBeVisible();
    });

    test('should display SectionOne metrics (submitted, approved, completed)', async ({
        page,
    }) => {
        const sectionOne = page.getByTestId('metrics-bar-section-one');
        await expect(sectionOne).toBeVisible();

        const submittedLabel = page.getByTestId('metrics-bar-submitted-label');
        if (await submittedLabel.isVisible()) {
            await expect(submittedLabel).toContainText('Submitted');
            const submittedValue = page.getByTestId('metrics-bar-submitted-value');
            await expect(submittedValue).toBeVisible();
        }

        const approvedLabel = page.getByTestId('metrics-bar-approved-label');
        if (await approvedLabel.isVisible()) {
            await expect(approvedLabel).toContainText('Approved');
            const approvedValue = page.getByTestId('metrics-bar-approved-value');
            await expect(approvedValue).toBeVisible();
        }

        const completedLabel = page.getByTestId('metrics-bar-completed-label');
        if (await completedLabel.isVisible()) {
            await expect(completedLabel).toContainText('Completed');
            const completedValue = page.getByTestId('metrics-bar-completed-value');
            await expect(completedValue).toBeVisible();
        }
    });

    test('should display SectionTwo metrics on expanded state (desktop)', async ({
        page,
    }) => {
        await page.setViewportSize({ width: 1200, height: 800 });

        const sectionTwo = page.getByTestId('metrics-bar-section-two');
        await expect(sectionTwo).toBeVisible();

        const distributedUSDLabel = page.getByTestId(
            'metrics-bar-distributed-usd-label',
        );
        if (await distributedUSDLabel.isVisible()) {
            await expect(distributedUSDLabel).toContainText('Distributed');
            await expect(distributedUSDLabel).toContainText('$');
            const distributedUSDValue = page.getByTestId('metrics-bar-distributed-usd-value');
            await expect(distributedUSDValue).toBeVisible();
        }

        const distributedADALabel = page.getByTestId(
            'metrics-bar-distributed-ada-label',
        );
        if (await distributedADALabel.isVisible()) {
            await expect(distributedADALabel).toContainText('Distributed');
            await expect(distributedADALabel).toContainText('₳');
            const distributedADAValue = page.getByTestId('metrics-bar-distributed-ada-value');
            await expect(distributedADAValue).toBeVisible();
        }

        const awardedUSDLabel = page.getByTestId(
            'metrics-bar-awarded-usd-label',
        );
        if (await awardedUSDLabel.isVisible()) {
            await expect(awardedUSDLabel).toContainText('Awarded');
            await expect(awardedUSDLabel).toContainText('$');
            const awardedUSDValue = page.getByTestId('metrics-bar-awarded-usd-value');
            await expect(awardedUSDValue).toBeVisible();
        }

        const awardedADALabel = page.getByTestId(
            'metrics-bar-awarded-ada-label',
        );
        if (await awardedADALabel.isVisible()) {
            await expect(awardedADALabel).toContainText('Awarded');
            await expect(awardedADALabel).toContainText('₳');
            const awardedADAValue = page.getByTestId('metrics-bar-awarded-ada-value');
            await expect(awardedADAValue).toBeVisible();
        }

        const requestedUSDLabel = page.getByTestId(
            'metrics-bar-requested-usd-label',
        );
        if (await requestedUSDLabel.isVisible()) {
            await expect(requestedUSDLabel).toContainText('Requested');
            await expect(requestedUSDLabel).toContainText('$');
            const requestedUSDValue = page.getByTestId('metrics-bar-requested-usd-value');
            await expect(requestedUSDValue).toBeVisible();
        }

        const requestedADALabel = page.getByTestId(
            'metrics-bar-requested-ada-label',
        );
        if (await requestedADALabel.isVisible()) {
            await expect(requestedADALabel).toContainText('Requested');
            await expect(requestedADALabel).toContainText('₳');
            const requestedADAValue = page.getByTestId('metrics-bar-requested-ada-value');
            await expect(requestedADAValue).toBeVisible();
        }
    });

    test('should hide SectionTwo on mobile viewport', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });

        const sectionTwo = page.getByTestId('metrics-bar-section-two');

        await expect(sectionTwo).toBeHidden();
    });

    test('should handle responsive behavior correctly', async ({ page }) => {
        const metricsBar = page.getByTestId('metrics-bar-container');

        await page.setViewportSize({ width: 1200, height: 800 });
        await expect(metricsBar).toBeVisible();

        await page.setViewportSize({ width: 768, height: 1024 });
        await expect(metricsBar).toBeVisible();

        await page.setViewportSize({ width: 375, height: 667 });
        await expect(metricsBar).toBeVisible();

        const sectionTwo = page.getByTestId('metrics-bar-section-two');
        await expect(sectionTwo).toBeHidden();
    });
});

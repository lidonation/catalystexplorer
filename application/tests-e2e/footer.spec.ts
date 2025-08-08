import { test, expect } from '@playwright/test';

test.describe('Footer links section', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('https://preview.catalystexplorer.com/en');
        await page.waitForLoadState('domcontentloaded');
    });

    test('Footer sections are visible', async ({ page }) => {
        const sections = [
            'footer-proposals-links',
            'footer-communities-links',
            'footer-data-links',
            'footer-social-links',
            'footer-legal-links'
        ];
        for (const section of sections) {
            await expect(page.getByTestId(section)).toBeVisible();
        }
    });

    test('Footer links have correct href attributes', async ({ page }) => {
        const allLinks = [
            { testId: 'proposals-link', expectedPath: '/proposals' },
            { testId: 'reviews-link', expectedPath: '/reviews' },
            { testId: 'funds-link', expectedPath: '/funds' },
            { testId: 'ideascale-profiles-link', expectedPath: '/ideascale-profiles' },
            { testId: 'groups-link', expectedPath: '/groups' },
            { testId: 'communities-link', expectedPath: '/communities' },
            { testId: 'dreps-link', expectedPath: '/dreps' },
            { testId: 'twitter-link', expectedUrl: 'https://x.com/LidoNation' },
            { testId: 'linkedin-link', expectedUrl: 'https://www.linkedin.com/company/lidonation/' },
            { testId: 'facebook-link', expectedUrl: 'https://www.facebook.com/lidonation' },
            { testId: 'github-link', expectedUrl: 'https://github.com/lidonation/catalystexplorer' },
        ];
        for (const link of allLinks) {
            const href = await page.getByTestId(link.testId).getAttribute('href');
            if ('expectedUrl' in link) {
                expect(href).toBe(link.expectedUrl);
            } else {
                expect(href).toContain(link.expectedPath);
            }
        }
    });

    test('Active internal links navigate correctly', async ({ page }) => {
        const activeLinks = [
            { testId: 'proposals-link', pathContains: '/proposals' },
            { testId: 'reviews-link', pathContains: '/reviews' },
            { testId: 'funds-link', pathContains: '/funds' },
        ];
        for (const { testId, pathContains } of activeLinks) {
            const locator = page.getByTestId(testId);
            const navigationPromise = page.waitForURL(url => url.pathname.includes(pathContains), { timeout: 2000_000 });
            await locator.click();
            await navigationPromise;
            await page.goto('https://preview.catalystexplorer.com/en'); // reset
        }
    });

    test('External links open in same window', async ({ page }) => {
        const externalLinks = [
            { testId: 'twitter-link', expectedUrl: 'https://x.com/LidoNation' },
            { testId: 'linkedin-link', expectedUrl: 'https://www.linkedin.com/company/lidonation/' },
            { testId: 'facebook-link', expectedUrl: 'https://www.facebook.com/lidonation' },
            { testId: 'github-link', expectedUrl: 'https://github.com/lidonation/catalystexplorer' },
        ];
        for (const { testId, expectedUrl } of externalLinks) {
            const locator = page.getByTestId(testId);
            const href = await locator.getAttribute('href');
            expect(href).toBe(expectedUrl);
            expect(await locator.getAttribute('target')).toBeNull();
        }
    });

    test('Disabled links show correct attributes', async ({ page }) => {
        const disabledLinks = [
            'reports-link',
            'impact-link',
            'spending-link',
            'general-link',
            'catalyst-api-link',
            'proposal-csvs-link',
            'ccv4-link',
        ];
        for (const testId of disabledLinks) {
            const link = page.getByTestId(testId);
            await expect(link).toHaveAttribute('aria-disabled', 'true');
            const className = await link.getAttribute('class');
            expect(className).toMatch(/pointer-events-none/);
            expect(className).toMatch(/opacity-50/);
        }
    });

    test('Legal section contains correct text elements', async ({ page }) => {
        const legalTextElements = ['terms-link', 'privacy-link', 'cookies-link', 'licence-link'];
        for (const testId of legalTextElements) {
            const element = page.getByTestId(testId);
            const tagName = await element.evaluate(el => el.tagName.toLowerCase());
            expect(tagName).toBe('p');
        }
    });

    test('Footer copyright section is visible and correct', async ({ page }) => {
        const copyrightSection = page.getByTestId('footer-copyright');
        await expect(copyrightSection).toBeVisible();
        const text = await copyrightSection.textContent();
        expect(text).toMatch(/©|copyright|2024|all rights reserved/i);
    });

    test('Social links are visible', async ({ page }) => {
        const socialLinks = ['twitter-link', 'linkedin-link', 'facebook-link', 'github-link'];
        for (const testId of socialLinks) {
            await expect(page.getByTestId(testId)).toBeVisible();
        }
    });

    test('Internal links are visible', async ({ page }) => {
        const internalLinks = [
            'proposals-link',
            'reviews-link',
            'funds-link',
            'ideascale-profiles-link',
            'groups-link',
            'communities-link',
            'dreps-link',
        ];
        for (const testId of internalLinks) {
            await expect(page.getByTestId(testId)).toBeVisible();
        }
    });

    test('Disabled links cannot be clicked', async ({ page }) => {
        const disabledLinks = [
            'reports-link',
            'impact-link',
            'spending-link',
        ];
        for (const testId of disabledLinks) {
            const link = page.getByTestId(testId);
            await expect(link).toHaveAttribute('aria-disabled', 'true');
        }
    });
});

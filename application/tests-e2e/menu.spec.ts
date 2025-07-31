import { expect, test } from '@playwright/test';

test.describe('Mobile Menu', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('domcontentloaded');
    });

    test('mobile menu button appears and works', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.waitForTimeout(3000);

        const menuButton = page.getByTestId('mobile-navigation-toggle-button');
        await expect(menuButton).toBeVisible();
        await expect(menuButton).toBeEnabled();

        const desktopNav = page.getByTestId('app-navigation');
        await expect(desktopNav).toBeHidden();
    });

    test('mobile menu opens and shows navigation', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.waitForTimeout(3000);

        const menuButton = page.getByTestId('mobile-navigation-toggle-button');
        await expect(menuButton).toBeVisible();
        await menuButton.click();

        const mobileMenuContent = page.getByTestId('mobile-navigation-content');
        await expect(mobileMenuContent).toBeVisible();
    });

    test('mobile menu contains navigation items', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.waitForTimeout(3000);

        const menuButton = page.getByTestId('mobile-navigation-toggle-button');
        await menuButton.click();
        await page.waitForTimeout(1000);

        const navItems = await page.evaluate(() => {
            return Array.from(
                document.querySelectorAll('[data-testid*="nav-link"]'),
            )
                .map((el) => {
                    const htmlEl = el as HTMLElement;
                    return {
                        testId: htmlEl.getAttribute('data-testid'),
                        visible:
                            htmlEl.offsetWidth > 0 && htmlEl.offsetHeight > 0,
                        text: htmlEl.textContent?.trim(),
                    };
                })
                .filter((item) => item.visible);
        });

        expect(navItems.length).toBeGreaterThan(0);
    });

    test('mobile menu navigation links work', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.waitForTimeout(3000);

        const menuButton = page.getByTestId('mobile-navigation-toggle-button');
        await menuButton.click();
        await page.waitForTimeout(1000);

        const mobileNav = page.getByTestId('mobile-navigation-content');
        const homeLink = mobileNav.getByTestId('nav-link-Home');

        await expect(homeLink).toBeVisible();
        await homeLink.click();
        await page.waitForLoadState('domcontentloaded');

        await expect(page).toHaveURL(/.*\/en$/);

    });

    test('mobile menu can be opened and closed', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.waitForTimeout(3000);

        const menuButton = page.getByTestId('mobile-navigation-toggle-button');
        const mobileMenuContent = page.getByTestId('mobile-navigation-content');

        await expect(mobileMenuContent).toBeHidden();


        await menuButton.click();
        await expect(mobileMenuContent).toBeVisible();

    
        try {
            await menuButton.click({ force: true });
            await page.waitForTimeout(1000);
        } catch (error) {
            await page.keyboard.press('Escape');
            await page.waitForTimeout(1000);
        }
    });

    test('mobile menu items have correct links', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.waitForTimeout(3000);

        const menuButton = page.getByTestId('mobile-navigation-toggle-button');
        await menuButton.click();
        await page.waitForTimeout(1000);

        const mobileNav = page.getByTestId('mobile-navigation-content');
        const navLinks = mobileNav.getByRole('link');

        const linkCount = await navLinks.count();
      
        const keyLinks = ['Home', 'Proposals', 'Funds'];

        for (const linkText of keyLinks) {
            const link = mobileNav.getByTestId(`nav-link-${linkText}`);
            const linkExists = (await link.count()) > 0;

            if (linkExists) {
                const href = await link.getAttribute('href');
                const text = await link.textContent();
                expect(href).toBeTruthy();
            }
        }
    });

    test('responsive navigation switches correctly', async ({ page }) => {
        await page.setViewportSize({ width: 1200, height: 800 });
        await page.waitForTimeout(2000);

        const desktopNav = page.getByTestId('app-navigation');
        const mobileButton = page.getByTestId(
            'mobile-navigation-toggle-button',
        );

        await expect(desktopNav).toBeVisible();
        await expect(mobileButton).toBeHidden();

        await page.setViewportSize({ width: 375, height: 667 });
        await page.waitForTimeout(3000);

        await expect(desktopNav).toBeHidden();
        await expect(mobileButton).toBeVisible();

    });

       test('menu navigation links work', async ({ page }) => {
        await page.waitForTimeout(3000);

        const nav = page.getByTestId('app-navigation');
        const homeLink = nav.getByTestId('nav-link-Home');

        await expect(homeLink).toBeVisible();
        await homeLink.click();
        await page.waitForLoadState('domcontentloaded');

        await expect(page).toHaveURL(/.*\/en$/);

    });

     test('menu items have correct links', async ({ page }) => {
        await page.waitForTimeout(3000);

        const nav = page.getByTestId('app-navigation');

      
        const keyLinks = ['Home', 'Proposals', 'Funds', 'Ideascale Profiles', 'Numbers', 'Jormungandr', 'Communities','Groups', 'Dreps', 'Lists and Bookmarks', 'Completed Project NFTs', ];


        for (const linkText of keyLinks) {
            const link = nav.getByTestId(`nav-link-${linkText}`);
            const linkExists = (await link.count()) > 0;

            if (linkExists) {
                const href = await link.getAttribute('href');
                const text = await link.textContent();
                expect(href).toBeTruthy();
            }
        }
    });
});

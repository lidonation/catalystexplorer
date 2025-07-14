// import { expect, test } from '@playwright/test';

// // Configure test timeout to prevent hanging tests
// test.setTimeout(60000); // 60 seconds per test

// test.describe('Theme Switcher', () => {
//     test.beforeEach(async ({ page }) => {
//         await page.goto('/', { waitUntil: 'domcontentloaded' });
//         await page.evaluate(() => localStorage.clear());
//         await page.waitForSelector('[data-testid="theme-switcher"]', { timeout: 10000 });
//     });

//     test.afterEach(async ({ page }) => {
//         try {
//             await page.evaluate(() => localStorage.clear());
//         } catch (error) {
//             // Ignore cleanup errors
//         }
//     });

//     test('should display theme switcher with all theme options', async ({ page }) => {
//         const themeSwitcher = page.getByTestId('theme-switcher');
//         await expect(themeSwitcher).toBeVisible();

//         const lightButton = page.getByTestId('theme-button-light');
//         const darkButton = page.getByTestId('theme-button-dark');
//         const voltaireButton = page.getByTestId('theme-button-voltaire');

//         await expect(lightButton).toBeVisible();
//         await expect(darkButton).toBeVisible();
//         await expect(voltaireButton).toBeVisible();
//     });

//      test('should start with light theme by default', async ({ page }) => {
//           // Wait for theme to be initialized
//           await page.waitForFunction(() => {
//               const html = document.documentElement;
//               return html.hasAttribute('data-theme');
//           }, { timeout: 10000 });

//           // Wait a bit more for React to fully render
//           await page.waitForTimeout(500);

//           const documentElement = page.locator('html');
//           const lightButton = page.getByTestId('theme-button-light');

//           // Verify default theme is light
//           await expect(documentElement).toHaveAttribute('data-theme', 'light', { timeout: 5000 });
//           await expect(lightButton).toBeVisible({ timeout: 5000 });
//           await expect(lightButton).toHaveAttribute('aria-pressed', 'true', { timeout: 5000 });
//       });

//       test('should switch to dark theme when dark button is clicked', async ({ page }) => {
//           const darkButton = page.getByTestId('theme-button-dark');
//           const lightButton = page.getByTestId('theme-button-light');
//           const documentElement = page.locator('html');

//           // Click dark theme button
//           await darkButton.click();

//           // Verify dark theme is now active
//           await expect(darkButton).toHaveAttribute('aria-pressed', 'true');
//           await expect(lightButton).toHaveAttribute('aria-pressed', 'false');
//           await expect(documentElement).toHaveAttribute('data-theme', 'dark');

//           // Verify localStorage stores the theme
//           const storedTheme = await page.evaluate(() => localStorage.getItem('theme'));
//           expect(storedTheme).toBe('dark');
//       });

//        test('should switch to voltaire theme when voltaire button is clicked', async ({ page }) => {
//           const voltaireButton = page.getByTestId('theme-button-voltaire');
//           const lightButton = page.getByTestId('theme-button-light');
//           const documentElement = page.locator('html');

//           await voltaireButton.click();

//           await expect(voltaireButton).toHaveAttribute('aria-pressed', 'true');
//           await expect(lightButton).toHaveAttribute('aria-pressed', 'false');
//           await expect(documentElement).toHaveAttribute('data-theme', 'voltaire');

//           const storedTheme = await page.evaluate(() => localStorage.getItem('theme'));
//           expect(storedTheme).toBe('voltaire');
//       });

//       test('should cycle through all themes and verify visual changes', async ({ page }) => {
//           const lightButton = page.getByTestId('theme-button-light');
//           const darkButton = page.getByTestId('theme-button-dark');
//           const voltaireButton = page.getByTestId('theme-button-voltaire');
//           const documentElement = page.locator('html');

//           const themes = [
//               { button: darkButton, name: 'dark' },
//               { button: voltaireButton, name: 'voltaire' },
//               { button: lightButton, name: 'light' }
//           ];

//           for (const theme of themes) {
//               await theme.button.click();

//               await expect(documentElement).toHaveAttribute('data-theme', theme.name);

//               await expect(theme.button).toHaveAttribute('aria-pressed', 'true');

//               const storedTheme = await page.evaluate(() => localStorage.getItem('theme'));
//               expect(storedTheme).toBe(theme.name);

//               const backgroundColor = await documentElement.evaluate((el, themeName) => {
//                   const computedStyle = window.getComputedStyle(el);
//                   const cssVar = getComputedStyle(el).getPropertyValue('--cx-background');
//                   return cssVar.trim();
//               }, theme.name);

//               expect(backgroundColor).toBeTruthy();
//           }
//       });

//       test('should persist theme selection across page reloads', async ({ page }) => {
//           const darkButton = page.getByTestId('theme-button-dark');
//           const documentElement = page.locator('html');

//           await darkButton.click();
//           await expect(documentElement).toHaveAttribute('data-theme', 'dark');

//           await page.reload();
//           await page.waitForLoadState('domcontentloaded');

//           await expect(documentElement).toHaveAttribute('data-theme', 'dark');
//           await expect(darkButton).toHaveAttribute('aria-pressed', 'true');
//       });



//       test('should maintain visual consistency across theme changes', async ({ page }) => {
//           const backgroundElement = page.locator('body'); // or any element with theme-dependent styling

//           await page.screenshot({ path: 'test-results/theme-light.png' });

//           const darkButton = page.getByTestId('theme-button-dark');
//           await darkButton.click();
//           await page.waitForTimeout(100);

//           const darkBackground = await backgroundElement.evaluate(el =>
//               window.getComputedStyle(el).backgroundColor
//           );

//           const voltaireButton = page.getByTestId('theme-button-voltaire');
//           await voltaireButton.click();
//           await page.waitForTimeout(100);

//           const voltaireBackground = await backgroundElement.evaluate(el =>
//               window.getComputedStyle(el).backgroundColor
//           );

//           expect(darkBackground).toBeTruthy();
//           expect(voltaireBackground).toBeTruthy();
//           expect(darkBackground).not.toBe(voltaireBackground);
//       });
// });
